/**
 * Posts a public contact/seed/consultation enquiry to the server, which writes
 * the lead and sends emails with the Admin SDK. Clients no longer write the
 * `mail` or lead collections directly.
 */
export async function submitInquiry(
  kind: 'contact' | 'consultation',
  entry: Record<string, unknown>
): Promise<void> {
  const res = await fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, entry }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || 'Could not submit your enquiry. Please try again.');
  }
}
