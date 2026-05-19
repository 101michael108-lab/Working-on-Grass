import {
  generatePayfastSignature,
  generatePayfastSignatureFromEntries,
} from '@/lib/payfast-signature';

/** PayFast ITN validate endpoint (Step 4 — confirm payment). */
export function getPayfastValidateUrl(isLive: boolean): string {
  return isLive
    ? 'https://www.payfast.co.za/eng/query/validate'
    : 'https://sandbox.payfast.co.za/eng/query/validate';
}

/** Re-submit ITN payload to PayFast; returns true when PayFast responds VALID. */
export async function confirmItnWithPayfast(
  entries: Array<[string, string]>,
  isLive: boolean
): Promise<boolean> {
  const params = new URLSearchParams();
  for (const [key, value] of entries) {
    params.append(key, value);
  }

  const res = await fetch(getPayfastValidateUrl(isLive), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const text = (await res.text()).trim();
  return text === 'VALID';
}

/** Verify ITN MD5 signature (POST field order or PayFast field order). */
export function verifyItnSignature(
  entries: Array<[string, string]>,
  pfData: Record<string, string>,
  receivedSignature: string | undefined,
  passphrase?: string
): boolean {
  if (!receivedSignature) return false;

  const pass = passphrase?.trim() || undefined;
  const fromPostOrder = generatePayfastSignatureFromEntries(entries, pass);
  const fromFieldOrder = generatePayfastSignature(pfData, pass);

  return fromPostOrder === receivedSignature || fromFieldOrder === receivedSignature;
}

export function isPayfastPaymentComplete(paymentStatus: string | undefined): boolean {
  return (paymentStatus ?? '').trim().toUpperCase() === 'COMPLETE';
}
