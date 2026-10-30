/**
 * @fileOverview A utility for triggering automated emails via the Firebase Trigger Email extension.
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, Firestore } from 'firebase/firestore';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { getSiteUrl } from '@/lib/site-url';
import { formatOrderRef } from '@/lib/order-number';
import { hasRecipient, isEmailish, primaryRecipient } from '@/lib/email-recipients';

/** Either the client Firestore or the Admin Firestore (server routes). */
type AnyFirestore = Firestore | AdminFirestore;

/**
 * Writes an email document to the `mail` collection (consumed by the Firebase
 * Trigger Email extension). Works with the client SDK (admin-authenticated UI,
 * permitted by the `mail` rule) or the Admin SDK (server routes, which bypass
 * rules). Untrusted/public flows must go through a server route with the Admin
 * SDK so clients can never write arbitrary `mail` documents.
 */
async function queueMail(db: AnyFirestore, emailData: Record<string, unknown>) {
  // `queuedAt` is ours, not the extension's. The extension only timestamps
  // documents it actually picks up, so without this there is no way to tell a
  // mail doc that is about to be sent from one that will never be sent — the
  // latter has no `delivery` field and no age. A plain Date (not a server
  // timestamp sentinel) keeps this working on both the client and Admin SDK.
  const data = { ...emailData, queuedAt: new Date() };

  // The document is always written first. It is the durable outbox record: if
  // the send below fails, the email still exists to be retried and to be seen
  // in the admin Email Log.
  if (typeof (db as { collection?: unknown }).collection === 'function') {
    const adminDb = db as AdminFirestore;

    // Server-side, so the provider can be called directly. Imported lazily
    // because this module is also imported by admin dashboard components.
    //
    // The bundler still emits the transport as a client chunk that nothing
    // loads: this branch needs an Admin SDK instance, which a browser cannot
    // produce. No credential is exposed either way — Next.js inlines only
    // NEXT_PUBLIC_* variables, so `process.env.RESEND_API_KEY` compiles to a
    // lookup against an empty object in the browser.
    const { claimedDelivery, dispatchQueuedMail, resolveTransport } = await import(
      '@/services/email-transport'
    );

    // When we are the sender, the document is created already claimed so the
    // Trigger Email extension cannot also send it during a switchover.
    const sendingOurselves = resolveTransport(process.env) === 'resend';
    const ref = await adminDb
      .collection('mail')
      .add(sendingOurselves ? { ...data, delivery: claimedDelivery() } : data);

    await dispatchQueuedMail(adminDb, ref.id, data);
    return ref;
  }

  const ref = await addDoc(collection(db as Firestore, 'mail'), data);
  // In the browser the provider key is unavailable by design, so ask the server
  // to send it. Best-effort: the outbox document is already written, so a failed
  // request leaves the email visible in the Email Log rather than losing it.
  await requestServerDispatch(ref.id);
  return ref;
}

/**
 * Ask the server to send an outbox document queued from the admin dashboard.
 * Quiet on failure by design — the email is already queued, and an undelivered
 * one shows up in the Email Log.
 */
async function requestServerDispatch(mailId: string): Promise<void> {
  if (typeof fetch !== 'function') return;
  try {
    await fetch('/api/admin/dispatch-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mailId }),
    });
  } catch (e) {
    console.error('Could not ask the server to send the queued email:', e);
  }
}

interface OrderConfirmationPayload {
  /** One address, or several for an internal notification. */
  to: string | string[];
  orderId: string;
  /** Sequential customer-facing number; falls back to the short id when absent. */
  orderNumber?: number;
  orderDate?: Date | string;
  customerName: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingInfo?: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  /** Separate billing address — present only when it differs from shipping. */
  billingInfo?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  storeName?: string;
  fromEmail?: string;
  /**
   * URL the invoice PDF is fetched from and attached. We attach by URL (not
   * inline bytes) so the Firestore `mail` doc stays tiny — Firestore rejects
   * large/complex nested payloads, and nodemailer fetches the URL at send time.
   */
  invoiceUrl?: string;
  /** Filename for the attached invoice (e.g. "Invoice-1001.pdf"). */
  invoiceFileName?: string;
  /**
   * Extra PDF attachments (e.g. product guides) alongside the invoice, each
   * fetched from its `path` URL at send time.
   */
  extraAttachments?: Array<{ filename: string; path: string }>;
}

interface StatusUpdatePayload {
  to: string;
  orderId: string;
  orderNumber?: number;
  customerName: string;
  newStatus: string;
  storeName?: string;
  fromEmail?: string;
}

interface InquiryPayload {
  to: string | string[];
  customerName: string;
  customerEmail?: string;
  service: string;
  message?: string;
  /** Extra submitted fields (phone, region, hectares…) shown as a table in the admin email. */
  details?: Array<[label: string, value: string | undefined]>;
  storeName?: string;
  fromEmail?: string;
}

/** Escape user-submitted text before it goes into an email's HTML. */
function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

/**
 * Formats the "From" field to include a display name.
 * e.g., "Working on Grass <admin@workingongrass.co.za>"
 *
 * Returns undefined for anything that is not an address, which omits the header
 * and lets the Trigger Email extension's DEFAULT_FROM apply. A malformed `from`
 * is refused by most SMTP providers, and because every template shares this
 * helper, one bad value in Settings would otherwise stop all mail.
 */
function formatFrom(name: string, email?: string): string | undefined {
  if (!isEmailish(email)) return undefined;
  return `${name} <${email!.trim()}>`;
}

/**
 * Queues a customer order confirmation email in Firestore.
 */
export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload, db?: AnyFirestore) {
  if (!hasRecipient(payload.to)) return;

  const firestore = db || initializeFirebase().firestore;
  const itemsList = payload.items.map(i => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name} (x${i.quantity})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R${(i.price * i.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);
  const orderRef = formatOrderRef({ orderNumber: payload.orderNumber, id: payload.orderId });
  const orderDate = payload.orderDate
    ? new Date(payload.orderDate as any).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

  const addressBlock = payload.shippingInfo ? `
    <p style="margin: 2px 0; font-weight: bold;">${payload.shippingInfo.firstName} ${payload.shippingInfo.lastName}</p>
    ${payload.shippingInfo.phone ? `<p style="margin: 2px 0;">${payload.shippingInfo.phone}</p>` : ''}
    <p style="margin: 2px 0;">${payload.shippingInfo.address}</p>
    <p style="margin: 2px 0;">${payload.shippingInfo.city}, ${payload.shippingInfo.postalCode}</p>
    <p style="margin: 2px 0;">${payload.shippingInfo.country}</p>
  ` : '<p style="margin:0;">Not provided</p>';

  // Billing block — a distinct address when the buyer entered one, else "same".
  const billingBlock = payload.billingInfo ? `
    <p style="margin: 2px 0; font-weight: bold;">${payload.billingInfo.firstName} ${payload.billingInfo.lastName}</p>
    <p style="margin: 2px 0;">${payload.billingInfo.address}</p>
    <p style="margin: 2px 0;">${payload.billingInfo.city}, ${payload.billingInfo.postalCode}</p>
    <p style="margin: 2px 0;">${payload.billingInfo.country}</p>
  ` : '<p style="margin:0; color:#94a3b8;">Same as shipping address</p>';

  const emailData: any = {
    to: payload.to,
    ...(from && { from }),
    message: {
      subject: `Order Confirmation ${orderRef} | ${storeName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1a3a1a; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${storeName}</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hello ${payload.customerName},</p>
            <p>We've received your payment. Your order is being prepared for dispatch.</p>

            <div style="background-color: #f8fafc; border-radius: 6px; padding: 16px 20px; margin: 20px 0; border-left: 4px solid #1a3a1a;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6b7280; width: 140px;">Order Number</td>
                  <td style="padding: 4px 0; font-weight: bold;">${orderRef}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Order Date</td>
                  <td style="padding: 4px 0;">${orderDate}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6b7280;">Email</td>
                  <td style="padding: 4px 0;">${payload.shippingInfo?.email || primaryRecipient(payload.to)}</td>
                </tr>
              </table>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #eee; border-radius: 4px;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="padding: 10px; text-align: left; font-size: 13px;">Item</th>
                  <th style="padding: 10px; text-align: right; font-size: 13px;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemsList}</tbody>
              <tfoot>
                <tr>
                  <td style="padding: 12px 10px; font-weight: bold; border-top: 2px solid #eee;">Total Paid</td>
                  <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #c2410c; border-top: 2px solid #eee;">R${payload.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="vertical-align: top; width: 50%; padding-right: 10px;">
                  <div style="background-color: #f9fafb; border-radius: 6px; padding: 14px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Shipping Address</p>
                    ${addressBlock}
                  </div>
                </td>
                <td style="vertical-align: top; width: 50%; padding-left: 10px;">
                  <div style="background-color: #f9fafb; border-radius: 6px; padding: 14px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Billing Address</p>
                    ${billingBlock}
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin-top: 24px; font-size: 14px; color: #64748b;">Regards,<br/><strong>The ${storeName} Team</strong></p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee;">
            ${storeName} &bull; Modimolle, Limpopo, South Africa
          </div>
        </div>
      `,
      text: `Thank you, ${payload.customerName}. Order ${orderRef} confirmed on ${orderDate}. Total: R${payload.totalAmount.toFixed(2)}.`
    }
  };

  // Attach the invoice and any product guides by URL. The Trigger Email
  // extension passes `message.attachments` to nodemailer, which fetches each
  // `path` URL at send time — keeping the Firestore `mail` doc small (embedding
  // the PDF bytes inline made Firestore reject the write).
  const attachments: Array<Record<string, unknown>> = [];
  if (payload.invoiceUrl) {
    attachments.push({
      filename: payload.invoiceFileName || `Invoice-${orderRef.replace('#', '')}.pdf`,
      path: payload.invoiceUrl,
      contentType: 'application/pdf',
    });
  }
  for (const guide of payload.extraAttachments ?? []) {
    attachments.push({
      filename: guide.filename,
      path: guide.path,
      contentType: 'application/pdf',
    });
  }
  if (attachments.length > 0) {
    emailData.message.attachments = attachments;
  }

  return queueMail(firestore, emailData);
}

/**
 * Queues an automated status update email.
 */
export async function sendOrderStatusUpdateEmail(payload: StatusUpdatePayload, db?: AnyFirestore) {
  const firestore = db || initializeFirebase().firestore;
  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);
  
  const emailData: any = {
    to: payload.to,
    ...(from && { from }),
    message: {
      subject: `Order Update: ${formatOrderRef({ orderNumber: payload.orderNumber, id: payload.orderId })} is ${payload.newStatus} | ${storeName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px;">
          <h2 style="color: #1a3a1a;">Your order status has changed</h2>
          <p>Hello ${payload.customerName},</p>
          <p>The status of your order <strong>${formatOrderRef({ orderNumber: payload.orderNumber, id: payload.orderId })}</strong> has been updated to: <strong>${payload.newStatus}</strong></p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">${storeName} | Modimolle, Limpopo</p>
        </div>
      `
    }
  };

  return queueMail(firestore, emailData);
}

/**
 * Queues an internal admin notification for new orders.
 */
export async function sendAdminOrderNotification(payload: OrderConfirmationPayload, db?: AnyFirestore) {
  // Queueing a mail doc with no recipient is a guaranteed extension error.
  if (!hasRecipient(payload.to)) return;
  const firestore = db || initializeFirebase().firestore;
  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);
  const orderRef = formatOrderRef({ orderNumber: payload.orderNumber, id: payload.orderId });
  const orderDate = payload.orderDate
    ? new Date(payload.orderDate as any).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });

  const itemsList = payload.items.map(i => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.name} (x${i.quantity})</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">R${(i.price * i.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const emailData: any = {
    to: payload.to,
    ...(from && { from }),
    message: {
      subject: `[SALES] New Order ${orderRef} - ${payload.customerName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #111; max-width: 700px; margin: auto; border: 2px solid #1a3a1a; padding: 40px;">
          <div style="border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #1a3a1a; margin: 0; font-size: 24px;">New Paid Order Received</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Order ${orderRef} &bull; ${orderDate}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="vertical-align: top; width: 50%; padding-right: 20px;">
                <h3 style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 10px 0; letter-spacing: 1px;">Customer Details</h3>
                <p style="margin: 2px 0; font-weight: bold;">${payload.customerName}</p>
                <p style="margin: 2px 0; color: #007bff;">${payload.shippingInfo?.email || 'No email'}</p>
                ${payload.shippingInfo?.phone ? `<p style="margin: 2px 0;">${payload.shippingInfo.phone}</p>` : ''}
              </td>
              <td style="vertical-align: top; width: 50%;">
                <h3 style="font-size: 12px; text-transform: uppercase; color: #999; margin: 0 0 10px 0; letter-spacing: 1px;">Shipping Address</h3>
                ${payload.shippingInfo ? `
                    <p style="margin: 2px 0;">${payload.shippingInfo.address}</p>
                    <p style="margin: 2px 0;">${payload.shippingInfo.city}, ${payload.shippingInfo.postalCode}</p>
                    <p style="margin: 2px 0;">${payload.shippingInfo.country}</p>
                ` : '<p>No shipping info provided.</p>'}
              </td>
            </tr>
          </table>

          <h3 style="font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 10px; letter-spacing: 1px;">Ordered Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
                <tr style="background-color: #f4f4f4;">
                    <th style="padding: 10px; text-align: left; font-size: 13px;">Item</th>
                    <th style="padding: 10px; text-align: right; font-size: 13px;">Amount</th>
                </tr>
            </thead>
            <tbody>${itemsList}</tbody>
            <tfoot>
                <tr>
                    <td style="padding: 20px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 18px;">Total Paid:</td>
                    <td style="padding: 20px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #c2410c;">R${payload.totalAmount.toFixed(2)}</td>
                </tr>
            </tfoot>
          </table>

          <div style="border-top: 1px dashed #ccc; padding-top: 20px; font-size: 12px; color: #888;">
            <p>This email serves as an official order notification for <strong>${storeName}</strong>.
            Payment has been successfully processed via PayFast. Please fulfill this order as soon as possible.</p>
          </div>
        </div>
      `
    }
  };

  return queueMail(firestore, emailData);
}

/**
 * Queues a "Thank You" acknowledgment for an inquiry.
 */
export async function sendInquiryAcknowledgmentEmail(payload: InquiryPayload, db?: AnyFirestore) {
  if (!hasRecipient(payload.to)) return;
  const firestore = db || initializeFirebase().firestore;
  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);

  const emailData: any = {
    to: payload.to,
    ...(from && { from }),
    message: {
      subject: `Inquiry Received: ${payload.service} | ${storeName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1a3a1a; padding: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0;">${storeName}</h2>
          </div>
          <div style="padding: 30px;">
            <p>Hello ${escapeHtml(payload.customerName)},</p>
            <p>Thank you for reaching out to us regarding <strong>${escapeHtml(payload.service)}</strong>. We have received your inquiry and ecologist Frits van Oudtshoorn will review your request and get back to you shortly.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; border-left: 4px solid #1a3a1a; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #64748b;"><em>Our typical response time for technical assessments and seed quotes is 1-2 business days.</em></p>
            </div>
            <p style="font-size: 14px; color: #64748b;">Regards,<br/>The Working on Grass Team</p>
          </div>
        </div>
      `
    }
  };

  return queueMail(firestore, emailData);
}

/**
 * Queues an internal notification for new inquiries.
 */
export async function sendAdminInquiryNotification(payload: InquiryPayload, db?: AnyFirestore) {
  if (!hasRecipient(payload.to)) return;
  const firestore = db || initializeFirebase().firestore;
  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);

  const customerEmail = payload.customerEmail?.includes('@') ? payload.customerEmail : undefined;
  const detailRows = (payload.details ?? [])
    .filter(([, value]) => value && value.trim())
    .map(
      ([label, value]) =>
        `<tr><td style="padding: 4px 16px 4px 0; color: #64748b; vertical-align: top;">${escapeHtml(label)}</td>` +
        `<td style="padding: 4px 0;"><strong>${escapeHtml(value)}</strong></td></tr>`
    )
    .join('');

  const emailData: any = {
    to: payload.to,
    ...(from && { from }),
    // So hitting "Reply" answers the customer, not our own sender address.
    ...(customerEmail && { replyTo: customerEmail }),
    message: {
      subject: `[NEW LEAD] ${payload.service} - ${payload.customerName}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2 style="color: #1a3a1a;">New Inquiry Received</h2>
          <p><strong>Service:</strong> ${escapeHtml(payload.service)}</p>
          <p><strong>From:</strong> ${escapeHtml(payload.customerName)} (${escapeHtml(payload.customerEmail || 'No email provided')})</p>
          ${detailRows ? `<table style="border-collapse: collapse; margin: 8px 0 4px;">${detailRows}</table>` : ''}
          <hr/>
          <p><strong>Message / Requirements:</strong></p>
          <div style="white-space: pre-wrap; background: #f1f5f9; padding: 15px; border-radius: 4px;">${escapeHtml(payload.message || 'No additional details provided.')}</div>
          <p style="margin-top: 20px;"><a href="${getSiteUrl()}/admin/inquiries">View in Admin Dashboard</a></p>
        </div>
      `
    }
  };

  return queueMail(firestore, emailData);
}

interface PaymentProblemPayload {
  to: string | string[];
  orderId: string;
  orderNumber?: number;
  customerName: string;
  customerEmail?: string;
  /** What PayFast reported in the ITN, e.g. "COMPLETE" or "FAILED". */
  paymentStatus?: string;
  /** What PayFast says was actually charged. */
  amountPaid?: number;
  /** What the server-priced order says it should have been. */
  expectedAmount: number;
  /** Plain-English description of what is wrong. */
  problem: string;
  /** What the system did about it, so the owner knows where things stand. */
  actionTaken: string;
  storeName?: string;
  fromEmail?: string;
}

/**
 * Queues an urgent admin alert for an order the system refused to fulfil.
 *
 * This exists because the dangerous cases used to be the quiet ones: a payment
 * whose amount does not match the server-priced total gets the order cancelled,
 * which means money may have moved while nobody was told anything. A refusal is
 * a decision a human has to review, so it has to leave the building.
 */
export async function sendAdminPaymentProblemNotification(payload: PaymentProblemPayload, db?: AnyFirestore) {
  if (!hasRecipient(payload.to)) return;
  const firestore = db || initializeFirebase().firestore;
  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);
  const orderRef = formatOrderRef({ orderNumber: payload.orderNumber, id: payload.orderId });

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding: 6px 16px 6px 0; color: #64748b; vertical-align: top; white-space: nowrap;">${escapeHtml(label)}</td>
      <td style="padding: 6px 0;"><strong>${escapeHtml(value)}</strong></td>
    </tr>
  `;

  const emailData: any = {
    to: payload.to,
    ...(from && { from }),
    message: {
      subject: `[ACTION REQUIRED] Order ${orderRef} payment problem`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #111; max-width: 700px; margin: auto; border: 2px solid #b91c1c; padding: 32px;">
          <div style="border-bottom: 2px solid #eee; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="color: #b91c1c; margin: 0; font-size: 22px;">Order payment needs review</h1>
            <p style="color: #666; margin: 6px 0 0 0;">Order ${orderRef} &bull; ${escapeHtml(payload.customerName)}</p>
          </div>

          <p style="background-color: #fef2f2; border-left: 4px solid #b91c1c; padding: 14px 16px; margin: 0 0 24px 0;">
            ${escapeHtml(payload.problem)}
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            ${row('Customer', payload.customerName)}
            ${payload.customerEmail ? row('Email', payload.customerEmail) : ''}
            ${payload.paymentStatus ? row('PayFast status', payload.paymentStatus) : ''}
            ${payload.amountPaid != null ? row('Amount paid', `R${payload.amountPaid.toFixed(2)}`) : ''}
            ${row('Order total', `R${payload.expectedAmount.toFixed(2)}`)}
          </table>

          <p style="margin: 0 0 24px 0;"><strong>What the system did:</strong> ${escapeHtml(payload.actionTaken)}</p>

          <div style="border-top: 1px dashed #ccc; padding-top: 16px; font-size: 12px; color: #888;">
            <p style="margin: 0;">Check this order against your PayFast dashboard before refunding or dispatching anything.
            <a href="${getSiteUrl()}/admin/orders">Open the orders dashboard</a>.</p>
          </div>
        </div>
      `,
      text:
        `Order ${orderRef} payment needs review. ${payload.problem} ` +
        `Paid: ${payload.amountPaid != null ? `R${payload.amountPaid.toFixed(2)}` : 'unknown'}, ` +
        `expected: R${payload.expectedAmount.toFixed(2)}. ${payload.actionTaken}`,
    },
  };

  return queueMail(firestore, emailData);
}
