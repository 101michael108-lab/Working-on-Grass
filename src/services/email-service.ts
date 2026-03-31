/**
 * @fileOverview A utility for triggering automated emails via the Firebase Trigger Email extension.
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, Firestore } from 'firebase/firestore';

interface OrderConfirmationPayload {
  to: string;
  orderId: string;
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
  storeName?: string;
  fromEmail?: string;
}

interface StatusUpdatePayload {
  to: string;
  orderId: string;
  customerName: string;
  newStatus: string;
  storeName?: string;
  fromEmail?: string;
}

interface InquiryPayload {
  to: string;
  customerName: string;
  customerEmail?: string;
  service: string;
  message?: string;
  storeName?: string;
  fromEmail?: string;
}

/**
 * Formats the "From" field to include a display name.
 * e.g., "Working on Grass <admin@workingongrass.co.za>"
 */
function formatFrom(name: string, email?: string): string | undefined {
  if (!email) return undefined;
  return `${name} <${email}>`;
}

/**
 * Queues a customer order confirmation email in Firestore.
 */
export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload, db?: Firestore) {
  if (!payload.to) return;

  const firestore = db || initializeFirebase().firestore;
  const itemsList = payload.items.map(i => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name} (x${i.quantity})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R${(i.price * i.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);
  const orderRef = `#${payload.orderId.substring(0, 8).toUpperCase()}`;
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
                  <td style="padding: 4px 0;">${payload.shippingInfo?.email || payload.to}</td>
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
                    ${addressBlock}
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin-top: 24px; font-size: 14px; color: #64748b;">We will notify you by email once your parcel is with the courier.</p>
            <p style="font-size: 14px; color: #64748b;">Regards,<br/><strong>The ${storeName} Team</strong></p>
          </div>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #eee;">
            ${storeName} &bull; Modimolle, Limpopo, South Africa
          </div>
        </div>
      `,
      text: `Thank you, ${payload.customerName}. Order ${orderRef} confirmed on ${orderDate}. Total: R${payload.totalAmount.toFixed(2)}.`
    }
  };

  return addDoc(collection(firestore, 'mail'), emailData);
}

/**
 * Queues an automated status update email.
 */
export async function sendOrderStatusUpdateEmail(payload: StatusUpdatePayload, db?: Firestore) {
  const firestore = db || initializeFirebase().firestore;
  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);
  
  const emailData: any = {
    to: payload.to,
    ...(from && { from }),
    message: {
      subject: `Order Update: #${payload.orderId.substring(0, 8)} is ${payload.newStatus} | ${storeName}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px;">
          <h2 style="color: #1a3a1a;">Your order status has changed</h2>
          <p>Hello ${payload.customerName},</p>
          <p>The status of your order <strong>#${payload.orderId.substring(0, 8)}</strong> has been updated to: <strong>${payload.newStatus}</strong></p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">${storeName} | Modimolle, Limpopo</p>
        </div>
      `
    }
  };

  return addDoc(collection(firestore, 'mail'), emailData);
}

/**
 * Queues an internal admin notification for new orders.
 */
export async function sendAdminOrderNotification(payload: OrderConfirmationPayload, db?: Firestore) {
  const firestore = db || initializeFirebase().firestore;
  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);
  const orderRef = `#${payload.orderId.substring(0, 8).toUpperCase()}`;
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

  return addDoc(collection(firestore, 'mail'), emailData);
}

/**
 * Queues a "Thank You" acknowledgment for an inquiry.
 */
export async function sendInquiryAcknowledgmentEmail(payload: InquiryPayload, db?: Firestore) {
  if (!payload.to) return;
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
            <p>Hello ${payload.customerName},</p>
            <p>Thank you for reaching out to us regarding <strong>${payload.service}</strong>. We have received your inquiry and ecologist Frits van Oudtshoorn will review your request and get back to you shortly.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; border-left: 4px solid #1a3a1a; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #64748b;"><em>Our typical response time for technical assessments and seed quotes is 1-2 business days.</em></p>
            </div>
            <p style="font-size: 14px; color: #64748b;">Regards,<br/>The Working on Grass Team</p>
          </div>
        </div>
      `
    }
  };

  return addDoc(collection(firestore, 'mail'), emailData);
}

/**
 * Queues an internal notification for new inquiries.
 */
export async function sendAdminInquiryNotification(payload: InquiryPayload, db?: Firestore) {
  if (!payload.to) return;
  const firestore = db || initializeFirebase().firestore;
  const storeName = payload.storeName || 'Working on Grass';
  const from = formatFrom(storeName, payload.fromEmail);

  const emailData: any = {
    to: payload.to,
    ...(from && { from }),
    message: {
      subject: `[NEW LEAD] ${payload.service} - ${payload.customerName}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2 style="color: #1a3a1a;">New Inquiry Received</h2>
          <p><strong>Service:</strong> ${payload.service}</p>
          <p><strong>From:</strong> ${payload.customerName} (${payload.customerEmail || 'No email provided'})</p>
          <hr/>
          <p><strong>Message / Requirements:</strong></p>
          <div style="white-space: pre-wrap; background: #f1f5f9; padding: 15px; border-radius: 4px;">${payload.message || 'No additional details provided.'}</div>
          <p style="margin-top: 20px;"><a href="${typeof window !== 'undefined' ? window.location.origin : ''}/admin/inquiries">View in Admin Dashboard</a></p>
        </div>
      `
    }
  };

  return addDoc(collection(firestore, 'mail'), emailData);
}
