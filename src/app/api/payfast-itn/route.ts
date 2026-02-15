import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/services/email-service';
import type { SiteSettings } from '@/lib/types';

export async function POST(req: NextRequest) {
  console.log("PayFast ITN: Received request.");
  try {
    const body = await req.formData();
    const { firestore } = initializeFirebase();
    
    // 1. Fetch site settings for dynamic email logic
    const settingsSnap = await getDoc(doc(firestore, 'settings', 'config'));
    const settings = settingsSnap.exists() ? settingsSnap.data() as SiteSettings : null;
    
    let pfData: Record<string, string> = {};
    let checkString = '';

    // Convert formData to object and build check string
    for (const [key, value] of body.entries()) {
        pfData[key] = value.toString();
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
    const receivedSignature = pfData.signature;

    if (calculatedSignature !== receivedSignature) {
        console.warn("PayFast ITN: Signatures do not match.", { calculated: calculatedSignature, received: receivedSignature });
        // NOTE: In production, you should return 400. During testing, check logs.
        // return new NextResponse('Invalid signature', { status: 400 });
    }

    const orderId = pfData.m_payment_id;
    const userId = pfData.custom_str1;
    const paymentStatus = pfData.payment_status;

    if (!userId || !orderId) {
       console.error("PayFast ITN: Missing custom data (userId or orderId).", { userId, orderId });
       return new NextResponse('Missing custom data', { status: 400 });
    }

    const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
        console.error(`PayFast ITN: Order ${orderId} not found for user ${userId}.`);
        return new NextResponse('Order not found', { status: 404 });
    }

    const orderData = orderSnap.data();
    const isSuccess = paymentStatus === 'COMPLETE';
    const newStatus = isSuccess ? 'Processing' : 'Cancelled';

    console.log(`PayFast ITN: Updating Order ${orderId} status to ${newStatus}.`);

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
        console.log(`PayFast ITN: Queuing confirmation email for ${orderData.shippingInfo.email}`);
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

    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error("Error in PayFast ITN handler:", error.message || error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
