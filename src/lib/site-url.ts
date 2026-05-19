/** Canonical site URL for emails, PayFast callbacks, and links in server code. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://workingongrass.co.za';
}
