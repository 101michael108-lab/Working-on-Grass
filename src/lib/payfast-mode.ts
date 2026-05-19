import type { SiteSettings } from '@/lib/types';

/** True when checkout should use live PayFast (not sandbox). */
export function isPayfastLiveMode(settings: SiteSettings | null | undefined): boolean {
  if (settings?.isLiveMode !== true) return false;

  // Never hit live PayFast from local dev — avoids signature / credential mismatches.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return false;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SITE_URL);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return false;
    } catch {
      /* ignore invalid URL */
    }
  }

  return true;
}

export function getPayfastProcessUrl(settings: SiteSettings | null | undefined): string {
  return isPayfastLiveMode(settings)
    ? 'https://www.payfast.co.za/eng/process'
    : 'https://sandbox.payfast.co.za/eng/process';
}
