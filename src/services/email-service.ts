
'use client';
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
}

/**
 * Queues a customer order confirmation email in Firestore.
 */
export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload, db?: Firestore) {
  // Use provided db instance or initialize a new one (isomorphic)
  const firestore = db || initializeFirebase().firestore;
  const mailCollection = collection(firestore, 'mail');

  const itemsList = payload.items.map(i => `<li>${i.name} (x${i.quantity}) - R${i.price.toFixed(2)}</li>`).join('');

  const emailData = {
    to: payload.to,
    message: {
      subject: `Order Confirmation #${payload.orderId.substring(0, 8)} | Working on Grass`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h1 style="color: #007000;">Thank you for your order!</h1>
          <p>Hello ${payload.customerName},</p>
          <p>Your payment has been successfully processed. We are now preparing your items for delivery.</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Summary:</h3>
            <p><strong>Order ID:</strong> ${payload.orderId}</p>
            <ul>${itemsList}</ul>
            <p style="font-size: 18px;"><strong>Total Amount: R${payload.totalAmount.toFixed(2)}</strong></p>
          </div>

          <p>We will notify you via email as soon as your order has shipped.</p>
          <p>If you have any questions, please contact us at <a href="mailto:courses@alut.co.za">courses@alut.co.za</a>.</p>
          
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">Working on Grass | Sustainable Veld Management Advisory</p>
        </div>
      `,
      text: `Thank you for your order, ${payload.customerName}! Your payment for Order #${payload.orderId} of R${payload.totalAmount.toFixed(2)} has been received. We are processing it now.`
    }
  };

  try {
    await addDoc(mailCollection, emailData);
    return { success: true };
  } catch (error) {
    console.error("Failed to queue email:", error);
    return { success: false, error };
  }
}

/**
 * Queues an internal admin notification for new orders.
 */
export async function sendAdminOrderNotification(payload: OrderConfirmationPayload, db?: Firestore) {
  const firestore = db || initializeFirebase().firestore;
  const mailCollection = collection(firestore, 'mail');

  const emailData = {
    to: 'admin@workingongrass.co.za', // Ideally pulled from global settings
    message: {
      subject: `[ADMIN] New Paid Order #${payload.orderId.substring(0, 8)}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Paid Order Received</h2>
          <p><strong>Customer:</strong> ${payload.customerName}</p>
          <p><strong>Amount:</strong> R${payload.totalAmount.toFixed(2)}</p>
          <p><strong>Items:</strong></p>
          <ul>${payload.items.map(i => `<li>${i.name} (x${i.quantity})</li>`).join('')}</ul>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders">View Order in Dashboard</a></p>
        </div>
      `
    }
  };

  try {
    await addDoc(mailCollection, emailData);
    return { success: true };
  } catch (error) {
    console.error("Failed to queue admin email:", error);
    return { success: false, error };
  }
}
