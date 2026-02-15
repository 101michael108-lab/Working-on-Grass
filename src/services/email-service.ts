/**
 * @fileOverview A utility for triggering automated emails via the Firebase Trigger Email extension.
 * Instead of calling an external API directly, this service writes a document to the 'mail' collection.
 */

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, Firestore } from 'firebase/firestore';

interface OrderConfirmationPayload {
  to: string;
  orderId: string;
  customerName: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; price: number }>;
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

/**
 * Queues a customer order confirmation email in Firestore.
 */
export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload, db?: Firestore) {
  if (!payload.to) {
    console.error("Email Service: Missing recipient email.");
    return;
  }

  let firestore: Firestore;
  try {
    firestore = db || initializeFirebase().firestore;
  } catch (e) {
    firestore = initializeFirebase().firestore;
  }

  const itemsList = payload.items.map(i => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name} (x${i.quantity})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R${i.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const emailData: any = {
    to: payload.to,
    message: {
      subject: `Order Confirmation #${payload.orderId.substring(0, 8)} | ${payload.storeName || 'Working on Grass'}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1a3a1a; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">Working on Grass</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hello ${payload.customerName},</p>
            <p>We've received your payment for order <strong>#${payload.orderId.substring(0, 8)}</strong>. Our team is now preparing your items for dispatch.</p>
            <div style="margin: 20px 0; border: 1px solid #eee; border-radius: 4px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead><tr style="background-color: #f8fafc;"><th style="padding: 10px; text-align: left;">Item</th><th style="padding: 10px; text-align: right;">Price</th></tr></thead>
                <tbody>${itemsList}</tbody>
                <tfoot><tr><td style="padding: 15px 10px; font-weight: bold;">Total Paid</td><td style="padding: 15px 10px; text-align: right; font-weight: bold; color: #c2410c;">R${payload.totalAmount.toFixed(2)}</td></tr></tfoot>
              </table>
            </div>
            <p style="font-size: 14px; color: #64748b;">We will notify you via email as soon as your parcel is with the courier.</p>
          </div>
        </div>
      `,
      text: `Thank you for your order, ${payload.customerName}! We have received payment for Order #${payload.orderId.substring(0, 8)} totaling R${payload.totalAmount.toFixed(2)}.`
    }
  };

  // Only add 'from' if an email is provided, otherwise let the extension use its default.
  if (payload.fromEmail) {
    emailData.from = `Working on Grass <${payload.fromEmail}>`;
  }

  return addDoc(collection(firestore, 'mail'), emailData);
}

/**
 * Queues an automated status update email.
 */
export async function sendOrderStatusUpdateEmail(payload: StatusUpdatePayload, db?: Firestore) {
  const firestore = db || initializeFirebase().firestore;
  
  const emailData: any = {
    to: payload.to,
    message: {
      subject: `Order Update: #${payload.orderId.substring(0, 8)} is ${payload.newStatus} | ${payload.storeName || 'Working on Grass'}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px;">
          <h2 style="color: #1a3a1a;">Your order status has changed</h2>
          <p>Hello ${payload.customerName},</p>
          <p>The status of your order <strong>#${payload.orderId.substring(0, 8)}</strong> has been updated to: <strong>${payload.newStatus}</strong></p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Working on Grass | Modimolle, Limpopo</p>
        </div>
      `
    }
  };

  if (payload.fromEmail) {
    emailData.from = `Working on Grass <${payload.fromEmail}>`;
  }

  return addDoc(collection(firestore, 'mail'), emailData);
}

/**
 * Queues an internal admin notification for new orders.
 */
export async function sendAdminOrderNotification(payload: OrderConfirmationPayload, db?: Firestore) {
  const firestore = db || initializeFirebase().firestore;
  
  const emailData: any = {
    to: payload.to,
    message: {
      subject: `[SALES] New Order #${payload.orderId.substring(0, 8)} Paid`,
      html: `
        <div style="font-family: sans-serif;">
          <h2 style="color: #c2410c;">New Paid Order Received</h2>
          <p><strong>Customer:</strong> ${payload.customerName}</p>
          <p><strong>Amount:</strong> R${payload.totalAmount.toFixed(2)}</p>
          <p><strong>Items:</strong></p>
          <ul>${payload.items.map(i => `<li>${i.name} (x${i.quantity})</li>`).join('')}</ul>
        </div>
      `
    }
  };

  if (payload.fromEmail) {
    emailData.from = `Working on Grass <${payload.fromEmail}>`;
  }

  return addDoc(collection(firestore, 'mail'), emailData);
}
