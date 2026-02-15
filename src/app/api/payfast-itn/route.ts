
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/services/email-service';
import type { SiteSettings } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const { firestore } = initializeFirebase();
    
    // 1. Fetch site settings for dynamic email logic
    const settingsSnap = await getDoc(doc(firestore, 'settings', 'config'));
    const settings = settingsSnap.exists() ? settingsSnap.data() as SiteSettings : null;
    
    let pfData: Record<string, FormDataEntryValue> = {};
    let checkString = '';

    for (const [key, value] of body.entries()) {
        pfData[key] = value;
        if (key !== 'signature') {
            checkString += `${key}=${encodeURIComponent(value.toString().trim()).replace(/%20/g, '+')}&`;
        }
    }
    
    checkString = checkString.slice(0, -1);
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    if (passphrase) {
        checkString += `&passphrase=${passphrase}`;
    }
    
    const calculatedSignature = crypto.createHash('md5').update(checkString).digest('hex');
    const receivedSignature = pfData.signature as string;

    if (calculatedSignature !== receivedSignature) {
        console.warn("PayFast ITN: Signatures do not match.");
        return new NextResponse('Invalid signature', { status: 400 });
    }

    const orderId = pfData.m_payment_id as string;
    const userId = pfData.custom_str1 as string;
    const paymentStatus = pfData.payment_status as string;

    if (!userId || !orderId) {
       return new NextResponse('Missing custom data', { status: 400 });
    }

    const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
        return new NextResponse('Order not found', { status: 404 });
    }

    const orderData = orderSnap.data();
    const isSuccess = paymentStatus === 'COMPLETE';
    const newStatus = isSuccess ? 'Processing' : 'Cancelled';

    // 2. Update Order Status
    await updateDoc(orderRef, {
      status: newStatus,
      paymentInfo: {
        ...pfData,
        itn_validated_at: new Date().toISOString(),
      },
    });

    // 3. If Successful, handle post-payment logic
    if (isSuccess) {
        // A. Inventory Management: Reduce stock for each item
        for (const item of (orderData.items || [])) {
            const productRef = doc(firestore, 'products', item.productId);
            await updateDoc(productRef, {
                stock: increment(-item.quantity)
            }).catch(e => console.error(`Failed to decrement stock for ${item.productId}`, e));
        }

        // B. Trigger Customer Email
        await sendOrderConfirmationEmail({
            to: orderData.shippingInfo.email,
            orderId: orderId,
            customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            storeName: settings?.storeName,
        }, firestore).catch(e => console.error("Email queuing failed", e));

        // C. Trigger Admin Notification
        await sendAdminOrderNotification({
            to: settings?.contactEmail || 'admin@workingongrass.co.za',
            orderId: orderId,
            customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            storeName: settings?.storeName,
        }, firestore).catch(e => console.error("Admin notification queuing failed", e));
    }

    console.log(`PayFast ITN: Order ${orderId} updated to ${newStatus}. Emails triggered.`);
    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error("Error in PayFast ITN handler:", error.message || error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
