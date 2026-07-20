import { listPublicCollection } from '@/lib/firestore-rest';
import type { SiteImage } from '@/lib/types';

/**
 * Server-side read of the `siteImages` collection.
 *
 * The homepage hero and the Frits portrait used to be fetched only on the client,
 * through the Firestore SDK, after hydration. That meant the LCP <img> did not
 * exist in the HTML the browser first parsed: it could not start downloading until
 * ~260 kB of JS had loaded, Firebase had booted and a Firestore round-trip had
 * completed. Reading them here instead puts the real URLs in the server-rendered
 * markup, so `priority` can actually preload the LCP image.
 *
 * Non-fatal by design: on failure this returns [] and the client-side
 * MediaProvider query fills the images in exactly as it did before.
 */
export async function getSiteImages(): Promise<SiteImage[]> {
  return listPublicCollection<SiteImage>('siteImages', {
    revalidate: 300,
    tag: 'site-images',
  });
}

export async function getSiteImage(id: string): Promise<SiteImage | null> {
  const images = await getSiteImages();
  return images.find((image) => image.id === id) ?? null;
}
