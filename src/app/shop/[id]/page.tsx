
import { notFound } from 'next/navigation';
import { admin } from '@/firebase/server-init';
import type { Product } from '@/lib/types';
import type { Metadata } from 'next';
import ProductDetailsClient from '@/components/shop/product-details';

// Define props for the page
type ProductPageProps = {
  params: {
    id: string;
  };
};

// Function to fetch a single product from Firestore on the server
async function getProduct(id: string): Promise<Product | null> {
  try {
    const productRef = admin.firestore().collection('products').doc(id);
    const docSnap = await productRef.get();

    if (!docSnap.exists) {
      return null;
    }

    const data = docSnap.data() as Omit<Product, 'id'>;
    return { ...data, id: docSnap.id };
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | Working on Grass`,
    description: product.description.substring(0, 160), // Truncate for meta description
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: [
        {
          url: product.image || 'https://picsum.photos/seed/default/1200/630',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'product',
    },
  };
}

// The main page component
export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  // JSON-LD for Google Rich Snippets & Merchant Center
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Working on Grass',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'ZAR', // Assuming South African Rand
      price: product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'}/shop/${product.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient product={product} />
    </>
  );
}
