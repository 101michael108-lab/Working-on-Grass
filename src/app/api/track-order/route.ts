import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import type { Order } from '@/lib/types';

/** Server-side order lookup — avoids public Firestore read rules. */
export async function POST(req: NextRequest) {
  try {
    const { orderId, email } = await req.json();

    if (!orderId || !email || typeof orderId !== 'string' || typeof email !== 'string') {
      return NextResponse.json({ error: 'Order ID and email are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedOrderId = orderId.trim();

    const db = getAdminFirestore();
    const snapshot = await db
      .collectionGroup('orders')
      .where('shippingInfo.email', '==', normalizedEmail)
      .limit(10)
      .get();

    const match = snapshot.docs.find((d) => d.id === trimmedOrderId);

    if (!match) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const data = match.data();
    const order: Order = {
      id: match.id,
      userId: data.userId,
      orderDate: data.orderDate,
      totalAmount: data.totalAmount,
      status: data.status,
      shippingInfo: data.shippingInfo,
      items: data.items,
    };

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Track order API error:', error);
    return NextResponse.json({ error: 'Unable to fetch order.' }, { status: 500 });
  }
}
