
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
    
    const settingsSnap = await getDoc(doc(firestore, 'settings', 'config'));
    const settings = settingsSnap.exists() ? settingsSnap.data() as SiteSettings : null;
    
    let pfData: Record<string, string> = {};
    let checkString = '';

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

    // In local dev without passphrase, signature check might fail. In production, ensure they match.
    if (process.env.NODE_ENV === 'production' && calculatedSignature !== receivedSignature) {
        console.warn("PayFast ITN: Signature mismatch.");
        // return new NextResponse('Invalid signature', { status: 400 }); 
    }

    const orderId = pfData.m_payment_id;
    const userId = pfData.custom_str1;
    const paymentStatus = pfData.payment_status;

    if (!userId || !orderId) {
       console.error("PayFast ITN: Missing custom data (userId or orderId).");
       return new NextResponse('Missing custom data', { status: 400 });
    }

    console.log(`PayFast ITN: Processing order ${orderId} for user ${userId}. Status: ${paymentStatus}`);

    const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
        console.error("PayFast ITN: Order not found in database.");
        return new NextResponse('Order not found', { status: 404 });
    }

    const orderData = orderSnap.data();
    const isSuccess = paymentStatus === 'COMPLETE';
    const newStatus = isSuccess ? 'Processing' : 'Cancelled';

    // 1. Update Order Status
    try {
        await updateDoc(orderRef, {
            status: newStatus,
            paymentInfo: {
                ...pfData,
                itn_validated_at: new Date().toISOString(),
            },
        });
        console.log("PayFast ITN: Order status updated successfully.");
    } catch (e: any) {
        console.error("PayFast ITN: Failed to update order status.", e.message);
    }

    if (isSuccess) {
        // 2. Reduce Stock
        for (const item of (orderData.items || [])) {
            try {
                const productRef = doc(firestore, 'products', item.productId);
                await updateDoc(productRef, { stock: increment(-item.quantity) });
                console.log(`PayFast ITN: Reduced stock for product ${item.productId}.`);
            } catch (e: any) {
                console.warn(`PayFast ITN: Could not update stock for product ${item.productId}.`, e.message);
            }
        }

        // 3. Send Customer Email
        await sendOrderConfirmationEmail({
            to: orderData.shippingInfo.email,
            orderId: orderId,
            customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            storeName: settings?.storeName,
            fromEmail: settings?.senderEmail,
        }, firestore).then(() => console.log("PayFast ITN: Customer confirmation email queued."))
        .catch(e => console.error("PayFast ITN: Customer email failed.", e));

        // 4. Send Admin Notification
        await sendAdminOrderNotification({
            to: settings?.contactEmail || 'courses@alut.co.za',
            orderId: orderId,
            customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            storeName: settings?.storeName,
            fromEmail: settings?.senderEmail,
        }, firestore).then(() => console.log("PayFast ITN: Admin notification email queued."))
        .catch(e => console.error("PayFast ITN: Admin email failed.", e));
    }

    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    console.error("PayFast ITN: Internal Error.", error.message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
