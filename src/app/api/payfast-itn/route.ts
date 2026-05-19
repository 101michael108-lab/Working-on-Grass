import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { initializeFirebase } from '@/firebase';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/services/email-service';
import type { SiteSettings } from '@/lib/types';
import {
  confirmItnWithPayfast,
  isPayfastPaymentComplete,
  verifyItnSignature,
} from '@/lib/payfast-itn';
import { getPayfastPassphrase } from '@/lib/payfast-config';

const PROCESSED_STATUSES = new Set(['Processing', 'Shipped', 'Fulfilled', 'Delivered']);

export async function POST(req: NextRequest) {
  console.log('PayFast ITN: Received request.');

  try {
    const body = await req.formData();
    const db = getAdminFirestore();

    const settingsSnap = await db.collection('settings').doc('config').get();
    const settings = settingsSnap.exists ? (settingsSnap.data() as SiteSettings) : null;
    const isLive = settings?.isLiveMode === true;

    const entries: Array<[string, string]> = [];
    const pfData: Record<string, string> = {};
    for (const [key, value] of body.entries()) {
      const str = value.toString();
      entries.push([key, str]);
      pfData[key] = str;
    }

    const receivedSignature = pfData.signature;
    const passphrase = getPayfastPassphrase(isLive);

    const payfastValid = await confirmItnWithPayfast(entries, isLive);
    if (!payfastValid) {
      console.warn('PayFast ITN: PayFast validate endpoint returned INVALID.');
      return new NextResponse('Invalid ITN', { status: 400 });
    }

    const signatureOk = verifyItnSignature(entries, pfData, receivedSignature, passphrase);
    if (passphrase && !signatureOk) {
      console.warn(
        'PayFast ITN: Local signature mismatch but PayFast validate was VALID — processing order.'
      );
    }

    const orderId = pfData.m_payment_id;
    const userId = pfData.custom_str1;
    const paymentStatus = pfData.payment_status;

    if (!userId || !orderId) {
      console.error('PayFast ITN: Missing custom data (userId or orderId).');
      return new NextResponse('Missing custom data', { status: 400 });
    }

    console.log(
      `PayFast ITN: order=${orderId} user=${userId} payment_status=${paymentStatus} live=${isLive}`
    );

    const orderRef = db.collection('users').doc(userId).collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      console.error('PayFast ITN: Order not found in database.');
      return new NextResponse('Order not found', { status: 404 });
    }

    const orderData = orderSnap.data()!;
    const isSuccess = isPayfastPaymentComplete(paymentStatus);
    const newStatus = isSuccess ? 'Processing' : 'Cancelled';

    if (PROCESSED_STATUSES.has(orderData.status)) {
      console.log(`PayFast ITN: Order ${orderId} already processed (${orderData.status}). Skipping.`);
      return new NextResponse('OK', { status: 200 });
    }

    await orderRef.update({
      status: newStatus,
      paymentInfo: {
        ...pfData,
        itn_validated_at: new Date().toISOString(),
      },
    });
    console.log(`PayFast ITN: Order ${orderId} status set to ${newStatus}.`);

    if (isSuccess) {
      for (const item of orderData.items || []) {
        try {
          await db.collection('products').doc(item.productId).update({
            stock: FieldValue.increment(-item.quantity),
          });
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : String(e);
          console.warn(`PayFast ITN: Stock update failed for ${item.productId}:`, message);
        }
      }

      try {
        const { firestore } = initializeFirebase();

        await sendOrderConfirmationEmail(
          {
            to: orderData.shippingInfo.email,
            orderId,
            orderDate: new Date(),
            customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            shippingInfo: orderData.shippingInfo,
            storeName: settings?.storeName,
            fromEmail: settings?.senderEmail,
          },
          firestore
        );

        await sendAdminOrderNotification(
          {
            to: settings?.contactEmail || 'admin@workingongrass.co.za',
            orderId,
            orderDate: new Date(),
            customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            shippingInfo: orderData.shippingInfo,
            storeName: settings?.storeName,
            fromEmail: settings?.senderEmail,
          },
          firestore
        );
      } catch (e) {
        console.error('PayFast ITN: Email queue failed (order still updated):', e);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('PayFast ITN: Internal Error.', message);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
