import ShopClient from "@/components/shop/ShopClient";
import ShopClientFallback from "@/components/shop/ShopClientFallback";
import { getProducts } from "@/lib/products";
import Link from "next/link";
import { Container } from "@/components/redesign/ui";

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 20h10M10 20c5.5-2.5.42-8.5-1-11-1.42 2.5-6.5 8.5-1 11M12 9v11" />
    </svg>
  );
}

// Server component on purpose (it used to be "use client" + a client Firestore
// query): the catalogue now arrives in the HTML, so the grid shows immediately on
// slow connections and search engines can see every product and price.
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const [products, { category }] = await Promise.all([getProducts(), searchParams]);
  const initialCategory = typeof category === "string" ? category : undefined;

  return (
    <div className="bg-cream">
      {/* Header band */}
      <section className="border-b border-line bg-cream-band">
        <Container className="pb-[46px] pt-[52px]">
          <div className="mb-3.5 font-mono text-[12px] text-gold-deep">Home / Shop</div>
          <h1 className="m-0 font-headline text-[clamp(32px,4vw,50px)] font-medium tracking-[-0.02em] text-ink">
            The Catalogue
          </h1>
          <p className="mt-4 max-w-[560px] text-[16px] leading-[1.6] text-body">
            Books and field instruments by Frits van Oudtshoorn, developed across thirty years of
            hands-on veld work, every item field-tested and recommended.
          </p>
        </Container>
      </section>

      {/* Seed notice */}
      <Container>
        <div className="flex items-center justify-between gap-5 border-b border-line py-5 max-[720px]:flex-col max-[720px]:items-start">
          <div className="flex items-center gap-3.5">
            <SeedIcon className="shrink-0 text-forest" />
            <p className="m-0 text-[13.5px] text-body-soft">
              <strong className="text-ink">Looking for grass seed?</strong> Seed isn&rsquo;t listed,
              Frits formulates custom mixes per farm and situation.
            </p>
          </div>
          <Link
            href="/seeds"
            className="whitespace-nowrap border-b border-forest pb-0.5 text-[13px] font-semibold text-forest no-underline"
          >
            Request a seed quote →
          </Link>
        </div>
      </Container>

      {/* Body */}
      <Container className="pb-[clamp(56px,7vw,90px)] pt-[34px]">
        {products.length > 0 ? (
          <ShopClient products={products} initialCategory={initialCategory} />
        ) : (
          // Server read failed (it returns [] rather than throwing): load in the browser instead.
          <ShopClientFallback initialCategory={initialCategory} />
        )}
      </Container>
    </div>
  );
}
