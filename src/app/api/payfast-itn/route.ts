import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from '@/services/email-service';
import { invoiceFileName } from '@/lib/invoice';
import { signInvoiceToken } from '@/lib/invoice-token';
import { getSiteUrl } from '@/lib/site-url';
import type { SiteSettings } from '@/lib/types';
import {
  confirmItnWithPayfast,
  isPayfastPaymentComplete,
  verifyItnSignature,
} from '@/lib/payfast-itn';
import { getPayfastPassphrase } from '@/lib/payfast-config';

const PROCESSED_STATUSES = new Set(['Processing', 'Shipped', 'Fulfilled', 'Delivered']);

type GuideAttachment = { filename: string; path: string };

/**
 * For each distinct product in the order, resolve its optional PDF guide to a
 * URL attachment (nodemailer fetches the URL at send time). Never throws — a
 * missing guide is simply skipped so the confirmation email still goes out.
 */
async function collectGuideAttachments(
  db: AdminFirestore,
  items: Array<{ productId?: string }>
): Promise<GuideAttachment[]> {
  const productIds = [...new Set(items.map((it) => it.productId).filter(Boolean))] as string[];
  if (productIds.length === 0) return [];

  const attachments: GuideAttachment[] = [];
  const seenUrls = new Set<string>();

  await Promise.all(
    productIds.map(async (productId) => {
      try {
        const snap = await db.collection('products').doc(productId).get();
        if (!snap.exists) return;
        const data = snap.data() as { guideUrl?: string; guideName?: string; name?: string };
        const url = data.guideUrl;
        if (!url || seenUrls.has(url)) return;
        seenUrls.add(url);

        const base = (data.guideName || data.name || 'Guide').replace(/[^\w.\- ]+/g, '').trim() || 'Guide';
        const filename = base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
        attachments.push({ filename, path: url });
      } catch (e) {
        console.error(`PayFast ITN: guide attachment error for ${productId}:`, e);
      }
    })
  );

  return attachments;
}

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

      // Attach the invoice by URL (nodemailer fetches it at send time) rather
      // than embedding the PDF bytes in the Firestore `mail` doc — Firestore
      // rejects large/complex inline payloads. The invoice API generates the
      // PDF on demand, authorised by a signed token (or raw ids as a fallback).
      const invoiceToken = signInvoiceToken(orderId, userId);
      const invoiceUrl = invoiceToken
        ? `${getSiteUrl()}/api/invoice?t=${encodeURIComponent(invoiceToken)}`
        : `${getSiteUrl()}/api/invoice?orderId=${encodeURIComponent(orderId)}&uid=${encodeURIComponent(userId)}`;

      // Collect any PDF guides attached to the purchased products so they are
      // emailed to the customer alongside the invoice.
      let guideAttachments: GuideAttachment[] = [];
      try {
        guideAttachments = await collectGuideAttachments(db, orderData.items || []);
      } catch (e) {
        console.error('PayFast ITN: Guide collection failed (sending email without guides):', e);
      }

      try {
        // Queue emails via the Admin SDK (the `mail` collection is no longer
        // client-writable).
        await sendOrderConfirmationEmail(
          {
            to: orderData.shippingInfo.email,
            orderId,
            orderNumber: orderData.orderNumber,
            orderDate: new Date(),
            customerName: `${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}`,
            totalAmount: orderData.totalAmount,
            items: orderData.items,
            shippingInfo: orderData.shippingInfo,
            billingInfo: orderData.billingInfo,
            storeName: settings?.storeName,
            fromEmail: settings?.senderEmail,
            invoiceUrl,
            invoiceFileName: invoiceFileName(orderId, orderData.orderNumber),
            extraAttachments: guideAttachments,
          },
          db
        );

        await sendAdminOrderNotification(
          {
            to: settings?.contactEmail || 'admin@workingongrass.co.za',
            orderId,
            orderNumber: orderData.orderNumber,
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
