/**
 * @fileOverview A utility for triggering automated emails via the Firebase Trigger Email extension.
 * Instead of calling an external API directly, this service writes a document to the 'mail' collection.
 * This file is designed to work in both client and server environments.
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
}

interface StatusUpdatePayload {
  to: string;
  orderId: string;
  customerName: string;
  newStatus: string;
  storeName?: string;
}

/**
 * Queues a customer order confirmation email in Firestore.
 */
export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload, db?: Firestore) {
  console.log("Email Service: Preparing order confirmation email for", payload.to);
  
  if (!payload.to) {
    console.error("Email Service: Missing recipient email ('to' field).");
    return;
  }

  // Ensure we have a firestore instance
  let firestore: Firestore;
  try {
    firestore = db || initializeFirebase().firestore;
  } catch (e) {
    const { firestore: fs } = initializeFirebase();
    firestore = fs;
  }

  const mailCollection = collection(firestore, 'mail');
  const store = payload.storeName || 'Working on Grass';

  const itemsList = payload.items.map(i => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${i.name} (x${i.quantity})</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">R${i.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const emailData = {
    to: payload.to,
    message: {
      subject: `Order Confirmation #${payload.orderId.substring(0, 8)} | ${store}`,
      html: `
        <div style="font-family: 'PT Sans', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1a3a1a; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-family: 'Alegreya', serif;">Thank You for Your Order</h1>
          </div>
          <div style="padding: 30px;">
            <p>Hello ${payload.customerName},</p>
            <p>We've received your payment for order <strong>#${payload.orderId.substring(0, 8)}</strong>. Our team is now preparing your items for dispatch.</p>
            
            <div style="margin: 20px 0; border: 1px solid #eee; border-radius: 4px;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th style="padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase;">Item</th>
                    <th style="padding: 10px; text-align: right; font-size: 12px; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding: 15px 10px; font-weight: bold;">Total Paid</td>
                    <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #c2410c;">R${payload.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p style="font-size: 14px; color: #64748b;">We will notify you via email as soon as your parcel is with the courier.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0; font-weight: bold;">${store}</p>
              <p style="margin: 5px 0; font-size: 12px; color: #94a3b8;">Sustainable & Regenerative Land Use Advisory</p>
            </div>
          </div>
        </div>
      `,
      text: `Thank you for your order, ${payload.customerName}! We have received payment for Order #${payload.orderId.substring(0, 8)} totaling R${payload.totalAmount.toFixed(2)}.`
    }
  };

  try {
    const docRef = await addDoc(mailCollection, emailData);
    console.log("Email Service: Success! Document written to 'mail' collection with ID:", docRef.id);
    return docRef;
  } catch (err) {
    console.error("Email Service: Failed to write to 'mail' collection:", err);
    throw err;
  }
}

/**
 * Queues an automated status update email (e.g. Shipped, Delivered).
 */
export async function sendOrderStatusUpdateEmail(payload: StatusUpdatePayload, db?: Firestore) {
  const firestore = db || initializeFirebase().firestore;
  const mailCollection = collection(firestore, 'mail');
  const store = payload.storeName || 'Working on Grass';

  const emailData = {
    to: payload.to,
    message: {
      subject: `Order Update: #${payload.orderId.substring(0, 8)} is ${payload.newStatus} | ${store}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 30px;">
          <h2 style="color: #1a3a1a;">Your order status has changed</h2>
          <p>Hello ${payload.customerName},</p>
          <p>The status of your order <strong>#${payload.orderId.substring(0, 8)}</strong> has been updated to:</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 4px; display: inline-block; font-weight: bold; color: #1e293b; text-transform: uppercase; letter-spacing: 1px;">
            ${payload.newStatus}
          </div>
          <p style="margin-top: 20px;">If this order has been shipped, you should receive a tracking number from our courier shortly if it wasn't included in this update.</p>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">${store} | Modimolle, Limpopo</p>
        </div>
      `
    }
  };

  return addDoc(mailCollection, emailData);
}

/**
 * Queues an internal admin notification for new orders.
 */
export async function sendAdminOrderNotification(payload: OrderConfirmationPayload, db?: Firestore) {
  const firestore = db || initializeFirebase().firestore;
  const mailCollection = collection(firestore, 'mail');
  const adminEmail = payload.to;

  const emailData = {
    to: adminEmail,
    message: {
      subject: `[SALES] New Order #${payload.orderId.substring(0, 8)} Paid`,
      html: `
        <div style="font-family: sans-serif;">
          <h2 style="color: #c2410c;">New Paid Order Received</h2>
          <p><strong>Customer:</strong> ${payload.customerName}</p>
          <p><strong>Amount:</strong> R${payload.totalAmount.toFixed(2)}</p>
          <p><strong>Items:</strong></p>
          <ul>${payload.items.map(i => `<li>${i.name} (x${i.quantity})</li>`).join('')}</ul>
          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/orders" style="background: #1a3a1a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View in Admin Dashboard</a>
          </p>
        </div>
      `
    }
  };

  return addDoc(mailCollection, emailData);
}
