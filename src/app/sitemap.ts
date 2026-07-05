import { MetadataRoute } from 'next';
import { initializeFirebase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { slugify } from '@/lib/utils';
import { getPublishedFieldNotes } from '@/lib/field-notes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workingongrass.co.za';
  const { firestore } = initializeFirebase();

  // Fetch all products to include in sitemap
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const productsSnapshot = await getDocs(collection(firestore, 'products'));
    productEntries = productsSnapshot.docs.map((doc) => ({
      url: `${baseUrl}/shop/${slugify(doc.data().name ?? '')}--${doc.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Sitemap: Failed to fetch products", error);
  }

  // Field Notes (editorial articles)
  let fieldNoteEntries: MetadataRoute.Sitemap = [];
  try {
    const notes = await getPublishedFieldNotes();
    fieldNoteEntries = notes.map((n) => ({
      url: `${baseUrl}/field-notes/${n.slug}`,
      lastModified: n.publishedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap: Failed to fetch field notes", error);
  }

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/consulting`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/grassPro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/seeds`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/field-notes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  return [...routes, ...productEntries, ...fieldNoteEntries];
}
