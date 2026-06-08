import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/services/email-service';
import { generateInvoicePdf, invoiceFileName } from '@/lib/invoice';
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

    // Verify the amount PayFast actually charged matches the authoritative order
    // total (orders are priced server-side at creation). A mismatch means
    // tampering or a config error — refuse to fulfil.
    const amountGross = Number(pfData.amount_gross);
    const expectedTotal = Number(orderData.totalAmount);
    const amountOk =
      Number.isFinite(amountGross) &&
      Number.isFinite(expectedTotal) &&
      Math.abs(amountGross - expectedTotal) < 0.01;
    if (isSuccess && !amountOk) {
      console.error(
        `PayFast ITN: AMOUNT MISMATCH on order ${orderId} — paid=${pfData.amount_gross} expected=${expectedTotal}. Refusing to fulfil.`
      );
    }

    if (PROCESSED_STATUSES.has(orderData.status)) {
      console.log(`PayFast ITN: Order ${orderId} already processed (${orderData.status}). Skipping.`);
      return new NextResponse('OK', { status: 200 });
    }

    const paymentInfo = { ...pfData, itn_validated_at: new Date().toISOString() };
    const shouldFulfil = isSuccess && amountOk;

    // Idempotent, transactional transition: Pending -> Processing exactly once,
    // decrementing stock (with a floor) in the same transaction so concurrent
    // ITNs can't double-decrement or oversell.
    let processed = false;
    try {
      processed = await db.runTransaction(async (tx) => {
        const snap = await tx.get(orderRef);
        if (!snap.exists) return false;
        const current = snap.data()!;
        if (current.status !== 'Pending') return false; // already handled

        if (!shouldFulfil) {
          tx.update(orderRef, { status: 'Cancelled', paymentInfo });
          return false;
        }

        const orderItems: Array<{ productId: string; quantity: number }> = current.items || [];
        const productRefs = orderItems.map((it) => db.collection('products').doc(it.productId));
        const productSnaps = await Promise.all(productRefs.map((r) => tx.get(r)));
        productSnaps.forEach((ps, i) => {
          if (ps.exists) {
            const cur = Number((ps.data() as { stock?: number }).stock ?? 0);
            tx.update(productRefs[i], { stock: Math.max(0, cur - orderItems[i].quantity) });
          }
        });
        tx.update(orderRef, { status: 'Processing', paymentInfo });
        return true;
      });
    } catch (e) {
      console.error('PayFast ITN: transaction failed:', e);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    if (!processed) {
      // Already processed, cancelled, or refused — acknowledge so PayFast stops retrying.
      return new NextResponse('OK', { status: 200 });
    }

    {

      // Generate the PDF invoice for the email attachment. Never let a PDF
      // failure block the confirmation email — fall back to no attachment.
      let invoicePdfBase64: string | undefined;
      let invoicePdfName: string | undefined;
      try {
        const pdfBytes = await generateInvoicePdf({
          orderId,
          orderDate: orderData.orderDate,
          status: 'Processing',
          items: orderData.items || [],
          shippingFee: orderData.shippingFee,
          totalAmount: orderData.totalAmount,
          shippingInfo: orderData.shippingInfo,
          storeName: settings?.storeName,
          storeEmail: settings?.senderEmail || settings?.contactEmail,
          vatNumber: settings?.vatNumber,
        });
        invoicePdfBase64 = Buffer.from(pdfBytes).toString('base64');
        invoicePdfName = invoiceFileName(orderId);
      } catch (e) {
        console.error('PayFast ITN: Invoice PDF generation failed (sending email without it):', e);
      }

      try {
        // Queue emails via the Admin SDK (the `mail` collection is no longer
        // client-writable).
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
            invoicePdfBase64,
            invoiceFileName: invoicePdfName,
          },
          db
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
          db
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
