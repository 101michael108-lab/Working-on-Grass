import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { signInvoiceToken } from '@/lib/invoice-token';
import { enforceRateLimit } from '@/lib/rate-limit';
import { parseOrderNumber } from '@/lib/order-number';
import type { Order } from '@/lib/types';

/** Server-side order lookup — avoids public Firestore read rules. */
export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'track-order', 10, 60_000);
  if (limited) return limited;

  try {
    const { orderId, email } = await req.json();

    if (!orderId || !email || typeof orderId !== 'string' || typeof email !== 'string') {
      return NextResponse.json({ error: 'Order number and email are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedOrderId = orderId.trim();
    const typedNumber = parseOrderNumber(trimmedOrderId);

    const db = getAdminFirestore();
    const snapshot = await db
      .collectionGroup('orders')
      .where('shippingInfo.email', '==', normalizedEmail)
      .limit(50)
      .get();

    // Match on the customer-facing order number; fall back to the raw doc id so
    // links/receipts issued before sequential numbers still resolve.
    const match = snapshot.docs.find((d) => {
      const num = d.data().orderNumber;
      return (typedNumber != null && num === typedNumber) || d.id === trimmedOrderId;
    });

    if (!match) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const data = match.data();
    const order: Order = {
      id: match.id,
      orderNumber: data.orderNumber,
      userId: data.userId,
      orderDate: data.orderDate,
      totalAmount: data.totalAmount,
      status: data.status,
      shippingInfo: data.shippingInfo,
      items: data.items,
    };

    // Short-lived token so the invoice link from this result expires.
    const invoiceToken = signInvoiceToken(match.id, data.userId, 60 * 60 * 1000);

    return NextResponse.json({ order, invoiceToken });
  } catch (error) {
    console.error('Track order API error:', error);
    return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
  }
}
