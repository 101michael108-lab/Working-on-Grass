import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { generateInvoicePdf, invoiceFileName } from '@/lib/invoice';
import { verifyInvoiceToken } from '@/lib/invoice-token';
import { enforceRateLimit } from '@/lib/rate-limit';
import type { SiteSettings } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Streams an order's PDF invoice.
 *
 * Authorized by possession of the order's two unguessable Firestore IDs
 * (uid + orderId), which the checkout flow passes to the success page via the
 * PayFast return_url. This deliberately requires no login so that guest buyers
 * — who only ever hold an anonymous session that may not survive the PayFast
 * redirect — can always view, print, or download their invoice.
 *
 * `?download=1` forces a download; otherwise the PDF renders inline (so the
 * browser's PDF viewer can print it).
 */
export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req, 'invoice', 60, 60_000);
  if (limited) return limited;

  const { searchParams } = new URL(req.url);
  const download = searchParams.get('download') === '1';

  // Prefer a signed, expiring token; fall back to raw ids (authenticated/owner
  // surfaces like order history still use those).
  let orderId: string | undefined;
  let uid: string | undefined;
  const token = searchParams.get('t');
  if (token) {
    const verified = verifyInvoiceToken(token);
    if (!verified) {
      return new NextResponse('This invoice link is invalid or has expired.', { status: 401 });
    }
    orderId = verified.orderId;
    uid = verified.uid;
  } else {
    orderId = searchParams.get('orderId')?.trim();
    uid = searchParams.get('uid')?.trim();
  }

  if (!orderId || !uid) {
    return new NextResponse('A valid invoice link (token, or orderId and uid) is required', { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const snap = await db.collection('users').doc(uid).collection('orders').doc(orderId).get();

    if (!snap.exists) {
      return new NextResponse('Invoice not found', { status: 404 });
    }

    const data = snap.data()!;

    const settingsSnap = await db.collection('settings').doc('config').get();
    const settings = settingsSnap.exists ? (settingsSnap.data() as SiteSettings) : null;

    const pdfBytes = await generateInvoicePdf({
      orderId,
      orderNumber: data.orderNumber,
      orderDate: data.orderDate,
      status: data.status,
      items: data.items || [],
      shippingFee: data.shippingFee,
      totalAmount: data.totalAmount,
      shippingInfo: data.shippingInfo,
      storeName: settings?.storeName,
      storeEmail: settings?.senderEmail || settings?.contactEmail,
      vatNumber: settings?.vatNumber,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${invoiceFileName(orderId, data.orderNumber)}"`,
        'Cache-Control': 'private, no-store',
        // Don't leak the capability URL (orderId+uid) via the Referer header.
        'Referrer-Policy': 'no-referrer',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Invoice API error:', message);
    return new NextResponse('Could not generate invoice', { status: 500 });
  }
}
