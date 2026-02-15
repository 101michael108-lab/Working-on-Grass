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

    const orderId = pfData.m_payment_id;
    const userId = pfData.custom_str1;
    const paymentStatus = pfData.payment_status;

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

    try {
        await updateDoc(orderRef, {
            status: newStatus,
            paymentInfo: {
                ...pfData,
                itn_validated_at: new Date().toISOString(),
            },
        });
    } catch (e: any) {
        console.error("PayFast ITN Error:", e.message);
    }

    if (isSuccess) {
        for (const item of (orderData.items || [])) {
            try {
                const productRef = doc(firestore, 'products', item.productId);
                await updateDoc(productRef, { stock: increment(-item.quantity) });
            } catch (e: any) {}
        }

        await sendOrderConfirmationEmail({
            to: orderData.shippingInfo.email,
            orderId: orderId,
            customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            storeName: settings?.storeName,
            fromEmail: settings?.contactEmail,
        }, firestore).catch(console.error);

        await sendAdminOrderNotification({
            to: settings?.contactEmail || 'courses@alut.co.za',
            orderId: orderId,
            customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            storeName: settings?.storeName,
            fromEmail: settings?.contactEmail,
        }, firestore).catch(console.error);
    }

    return new NextResponse('OK', { status: 200 });

  } catch (error: any) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
