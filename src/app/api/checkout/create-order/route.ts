import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore, getAdminAuth, hasAdminCredentials } from '@/lib/firebase-admin';
import { generatePayfastSignature } from '@/lib/payfast-signature';
import { getPayfastPassphrase, isSandboxMerchantId } from '@/lib/payfast-config';
import { calculateOrderShipping } from '@/lib/shipping';
import { signInvoiceToken } from '@/lib/invoice-token';
import { enforceRateLimit } from '@/lib/rate-limit';
import { ORDER_NUMBER_START } from '@/lib/order-number';
import type { Product, SiteSettings } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type IncomingItem = { productId: string; quantity: number };

const SHIPPING_FIELDS = ['email', 'firstName', 'lastName', 'phone', 'address', 'city', 'postalCode', 'country'] as const;

/**
 * Creates a paid order server-side with AUTHORITATIVE pricing.
 *
 * Prices, shipping and the order total are recomputed from the `products`
 * collection — never trusted from the client — and the PayFast amount is signed
 * here with server-held credentials. This is the only place orders are created
 * (Firestore rules deny client order creation), which closes the price/amount
 * tampering vector.
 */
export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'create-order', 30, 60_000);
  if (limited) return limited;

  if (!hasAdminCredentials()) {
    return NextResponse.json({ error: 'Server is not configured for checkout.' }, { status: 503 });
  }

  // 1. Authenticate the caller (anonymous guests have valid ID tokens too).
  const authHeader = req.headers.get('Authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  let uid: string;
  try {
    uid = (await getAdminAuth().verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  // 2. Parse + validate input.
  let body: { items?: IncomingItem[]; shippingInfo?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems
    .map((i) => ({ productId: String(i?.productId ?? '').trim(), quantity: Math.floor(Number(i?.quantity)) }))
    .filter((i) => i.productId && Number.isFinite(i.quantity) && i.quantity > 0);

  if (items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  const shippingInfo: Record<string, string> = {};
  for (const f of SHIPPING_FIELDS) {
    shippingInfo[f] = String(body.shippingInfo?.[f] ?? '').trim();
  }
  const missing = SHIPPING_FIELDS.filter((f) => !shippingInfo[f]);
  if (missing.length) {
    return NextResponse.json({ error: `Missing shipping details: ${missing.join(', ')}.` }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const settingsSnap = await db.collection('settings').doc('config').get();
    const settings = settingsSnap.exists ? (settingsSnap.data() as SiteSettings) : null;

    // 3. Re-price every line from the authoritative products collection + check stock.
    const lines: Array<{ productId: string; name: string; price: number; quantity: number; shippingFee?: number; isDigital?: boolean }> = [];
    for (const item of items) {
      const snap = await db.collection('products').doc(item.productId).get();
      if (!snap.exists) {
        return NextResponse.json({ error: 'A product in your cart is no longer available.' }, { status: 400 });
      }
      const p = snap.data() as Product;
      const price = Number(p.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: `Invalid price for ${p.name}.` }, { status: 400 });
      }
      const stock = Number(p.stock ?? 0);
      if (stock < item.quantity) {
        return NextResponse.json(
          { error: `Only ${stock} of "${p.name}" left in stock. Please update your cart.` },
          { status: 409 }
        );
      }
      lines.push({ productId: item.productId, name: p.name, price, quantity: item.quantity, shippingFee: p.shippingFee, isDigital: p.isDigital });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const globalShippingFee = settings?.shippingFee ?? 150;
    const shipping = calculateOrderShipping(
      lines.map((l) => ({ product: { shippingFee: l.shippingFee, isDigital: l.isDigital } })),
      globalShippingFee
    );
    const total = Math.round((subtotal + shipping) * 100) / 100;

    // 4. Allocate a sequential, human-friendly order number atomically. Running
    // this in a transaction on a single counter doc serialises concurrent
    // checkouts so every order gets a distinct number.
    const counterRef = db.collection('counters').doc('orders');
    const orderNumber = await db.runTransaction(async (tx) => {
      const snap = await tx.get(counterRef);
      const next = snap.exists ? Number(snap.data()!.next) : ORDER_NUMBER_START;
      tx.set(counterRef, { next: next + 1 }, { merge: true });
      return next;
    });

    // 5. Persist the order (authoritative data) with the Admin SDK.
    const storeName = settings?.storeName || 'Working on Grass';
    const orderRef = db.collection('users').doc(uid).collection('orders').doc();
    const orderId = orderRef.id;
    await orderRef.set({
      userId: uid,
      orderNumber,
      orderDate: FieldValue.serverTimestamp(),
      totalAmount: total,
      status: 'Pending',
      shippingFee: shipping,
      shippingInfo,
      items: lines.map((l) => ({ productId: l.productId, name: l.name, quantity: l.quantity, price: l.price })),
    });

    // 6. Resolve PayFast credentials server-side and build the signed form.
    const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, '');
    let host = '';
    try { host = new URL(base).hostname; } catch { /* ignore */ }
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';
    const isLive = settings?.isLiveMode === true && !isLocalhost;

    const merchantId = (isLive ? settings?.payfastMerchantId : process.env.NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_ID)?.trim() || '';
    const merchantKey = (isLive ? settings?.payfastMerchantKey : process.env.NEXT_PUBLIC_PAYFAST_SANDBOX_MERCHANT_KEY)?.trim() || '';
    if (!merchantId || !merchantKey) {
      return NextResponse.json(
        { error: isLive ? 'Store payment is not configured. Please contact us.' : 'Sandbox PayFast credentials are not set.' },
        { status: 503 }
      );
    }
    if (isLive && isSandboxMerchantId(merchantId)) {
      return NextResponse.json({ error: 'Store payment is misconfigured (sandbox ID in live mode).' }, { status: 503 });
    }

    // Prefer a signed, expiring invoice token in the return URL (falls back to
    // raw ids when no token secret is configured).
    const invoiceToken = signInvoiceToken(orderId, uid);
    const successQuery = invoiceToken
      ? `orderId=${orderId}&t=${encodeURIComponent(invoiceToken)}&n=${orderNumber}`
      : `orderId=${orderId}&uid=${uid}&n=${orderNumber}`;

    const payfastData: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${base}/checkout/success?${successQuery}`,
      cancel_url: `${base}/cart`,
      notify_url: `${base}/api/payfast-itn`,
      name_first: shippingInfo.firstName,
      name_last: shippingInfo.lastName,
      email_address: shippingInfo.email,
      m_payment_id: orderId,
      amount: total.toFixed(2),
      item_name: `${storeName} - Order #${orderId.substring(0, 8)}`,
      custom_str1: uid,
    };
    payfastData.signature = generatePayfastSignature(payfastData, getPayfastPassphrase(isLive));

    const payfastUrl = isLive
      ? 'https://www.payfast.co.za/eng/process'
      : 'https://sandbox.payfast.co.za/eng/process';

    return NextResponse.json({ orderId, payfastUrl, payfastData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('create-order error:', message);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}
