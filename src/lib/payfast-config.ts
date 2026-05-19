/** Known PayFast sandbox merchant IDs — must not be used when isLiveMode is true. */
export const PAYFAST_SANDBOX_MERCHANT_IDS = new Set([
  '10000100',
  '10043133',
  '10043261',
]);

export function isSandboxMerchantId(merchantId: string | undefined): boolean {
  return PAYFAST_SANDBOX_MERCHANT_IDS.has((merchantId ?? '').trim());
}

/**
 * Passphrase for signature / ITN.
 * Live: PAYFAST_PASSPHRASE (App Hosting secret).
 * Sandbox: PAYFAST_SANDBOX_PASSPHRASE if set, else PAYFAST_PASSPHRASE.
 */
export function getPayfastPassphrase(isLive: boolean): string | undefined {
  if (isLive) {
    const live = process.env.PAYFAST_PASSPHRASE?.trim();
    return live || undefined;
  }
  const sandbox =
    process.env.PAYFAST_SANDBOX_PASSPHRASE?.trim() ||
    process.env.PAYFAST_PASSPHRASE?.trim();
  return sandbox || undefined;
}
