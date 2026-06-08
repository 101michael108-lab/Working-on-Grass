import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';
import {
  sendInquiryAcknowledgmentEmail,
  sendAdminInquiryNotification,
} from '@/services/email-service';
import { enforceRateLimit } from '@/lib/rate-limit';
import type { SiteSettings } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles public contact / seed / consultation form submissions server-side.
 *
 * Writes the lead document and queues the acknowledgment + admin-notification
 * emails using the Admin SDK. This is the ONLY way these emails get sent — the
 * `mail` and lead collections are no longer client-writable, which closes the
 * open email-relay vector (clients could previously inject arbitrary `mail`
 * documents with attacker-controlled from/to/body).
 */
const str = (v: unknown, max = 2000): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export async function POST(req: NextRequest) {
  const limited = enforceRateLimit(req, 'inquiry', 5, 60_000);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const kind = str(body.kind);
  const entry = (body.entry && typeof body.entry === 'object' ? body.entry : {}) as Record<string, unknown>;

  const name = str(entry.name, 200);
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  try {
    const db = getAdminFirestore();
    const settingsSnap = await db.collection('settings').doc('config').get();
    const settings = settingsSnap.exists ? (settingsSnap.data() as SiteSettings) : null;

    const emailMeta = {
      storeName: settings?.storeName,
      fromEmail: settings?.senderEmail,
    };
    const adminTo = settings?.contactEmail || 'admin@workingongrass.co.za';

    if (kind === 'consultation') {
      const contactDetail = str(entry.contactDetail, 300);
      const needs = str(entry.needs, 4000);
      const service = str(entry.service, 200) || 'General Inquiry';
      const serviceType = `Consultation: ${service}`;

      await db.collection('consultationRequests').add({
        name,
        contactDetail,
        location: str(entry.location, 300),
        needs,
        service,
        type: 'consultation',
        submissionDate: FieldValue.serverTimestamp(),
      });

      const customerEmail = contactDetail.includes('@') ? contactDetail : undefined;
      if (customerEmail) {
        await sendInquiryAcknowledgmentEmail(
          { to: customerEmail, customerName: name, service: serviceType, ...emailMeta },
          db
        );
      }
      await sendAdminInquiryNotification(
        { to: adminTo, customerName: name, customerEmail: contactDetail, service: serviceType, message: needs, ...emailMeta },
        db
      );
    } else {
      // contact + seed both write to contactFormEntries
      const email = str(entry.email, 300);
      const serviceInterestedIn = str(entry.serviceInterestedIn, 200) || 'General Inquiry';
      const message = str(entry.message, 4000);

      await db.collection('contactFormEntries').add({
        name,
        email,
        phone: str(entry.phone, 100),
        location: str(entry.location, 300),
        serviceInterestedIn,
        farmSize: str(entry.farmSize, 100),
        primaryUse: str(entry.primaryUse, 100),
        message,
        submissionDate: FieldValue.serverTimestamp(),
      });

      if (email) {
        await sendInquiryAcknowledgmentEmail(
          { to: email, customerName: name, service: serviceInterestedIn, ...emailMeta },
          db
        );
      }
      await sendAdminInquiryNotification(
        { to: adminTo, customerName: name, customerEmail: email, service: serviceInterestedIn, message, ...emailMeta },
        db
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const messageText = error instanceof Error ? error.message : String(error);
    console.error('Inquiry API error:', messageText);
    return NextResponse.json({ error: 'Could not submit your enquiry.' }, { status: 500 });
  }
}
