"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart, Minus, Plus, ShieldCheck, Truck, Star,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/cart-context";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import ProductCard from "@/components/shop/ProductCard";
import { Container, Eyebrow } from "@/components/redesign/ui";

const rand = (v: number) => "R" + v.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function FormattedText({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {text.split("\n").map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2" />;
        if (t.startsWith("•") || t.startsWith("-") || t.startsWith("*")) {
          return (
            <div key={i} className="mb-2.5 flex gap-2.5">
              <span className="mt-0.5 shrink-0 text-forest">&#10003;</span>
              <span className="text-[15px] leading-[1.6] text-body">{t.slice(1).trim()}</span>
            </div>
          );
        }
        return <p key={i} className="mb-[18px] text-[15.5px] leading-[1.75] text-body">{t}</p>;
      })}
    </>
  );
}

export default function ProductDetail({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
  isLoadingRelated?: boolean;
}) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  const images = product.images ?? [];
  const inStock = (product.stock ?? 0) > 0;
  const es = product.enabledSections;
  const on = (key: keyof NonNullable<typeof es>, hasData: boolean) =>
    (es ? !!es[key] : true) && hasData;

  const isDigital = !!product.isDigital;
  const typeLabel = isDigital
    ? "product"
    : /tool|meter|instrument|measurement/i.test(product.category)
    ? "instrument"
    : "book";

  const waHref =
    "https://wa.me/27782280008?text=" +
    encodeURIComponent(`Hi Frits, I have a question about the ${product.name}.`);

  return (
    <div className="bg-cream">
      {/* Breadcrumb */}
      <section className="border-b border-line bg-cream-band">
        <Container className="flex flex-wrap items-center gap-2 py-4 text-[12.5px] text-body-mute">
          <Link href="/" className="text-body-mute no-underline hover:text-forest">Home</Link>
          <span className="text-[#B4AE9C]">/</span>
          <Link href="/shop" className="text-body-mute no-underline hover:text-forest">Shop</Link>
          <span className="text-[#B4AE9C]">/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="text-body-mute no-underline hover:text-forest">{product.category}</Link>
          <span className="text-[#B4AE9C]">/</span>
          <span className="font-semibold text-ink">{product.name}</span>
        </Container>
      </section>

      {/* Gallery + buy panel */}
      <Container className="grid grid-cols-1 items-start gap-14 pb-[clamp(40px,5vw,64px)] pt-[clamp(32px,4vw,56px)] min-[880px]:grid-cols-[1.15fr_0.85fr]">
        {/* Gallery */}
        <div>
          <div className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[4px] border border-line ${images.length ? "bg-white shadow-sunken" : "bg-cream-band"}`}>
            {images.length > 0 && (
              <Image src={images[active] ?? images[0]} alt={product.name} fill sizes="(min-width:880px) 60vw, 100vw" priority className="object-contain p-6" />
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3.5 grid grid-cols-4 gap-3">
              {images.slice(0, 8).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`relative aspect-square overflow-hidden rounded-[3px] border-2 bg-white ${i === active ? "border-forest" : "border-line"}`}
                >
                  <Image src={src} alt={`${product.name} view ${i + 1}`} fill sizes="120px" className="object-contain p-1.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy panel */}
        <div className="min-[880px]:sticky min-[880px]:top-24">
          <div className="mb-3 font-body text-[10.5px] font-semibold uppercase tracking-[0.16em] text-body-faint">{product.category}</div>
          <h1 className="m-0 font-headline text-[clamp(28px,3vw,36px)] font-semibold leading-[1.14] tracking-[-0.01em] text-ink">{product.name}</h1>

          <div className="mt-[22px] flex items-baseline gap-2.5">
            <span className="font-body text-[32px] font-bold leading-none text-ink">{rand(product.price)}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-body-faint">Incl. VAT</span>
          </div>

          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-stock-border bg-stock-bg px-3 py-1.5 text-[12px] font-semibold text-forest">
            <span className="h-[7px] w-[7px] rounded-full bg-stock" />
            {inStock ? (isDigital ? "Available · digital licence" : "In stock · ready to ship") : "Currently unavailable"}
          </div>

          <p className="mt-[22px] text-[14.5px] leading-[1.6] text-body-soft">{product.description}</p>

          {/* Qty + add */}
          <div className="mt-[26px] flex flex-wrap gap-3">
            <div className="flex items-center overflow-hidden rounded-[3px] border border-line-strong">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-12 w-[42px] items-center justify-center bg-cream-band text-forest"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center font-body text-[16px] font-bold text-ink">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="flex h-12 w-[42px] items-center justify-center bg-cream-band text-forest"><Plus className="h-4 w-4" /></button>
            </div>
            <button
              onClick={() => addToCart(product, qty)}
              disabled={!inStock}
              className="flex h-[50px] min-w-[190px] flex-1 items-center justify-center gap-2.5 rounded-[3px] bg-forest px-5 font-body text-[14.5px] font-semibold text-ondark-bright transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-[17px] w-[17px]" strokeWidth={1.8} />
              {inStock ? `Add to cart · ${rand(product.price * qty)}` : "Sold out"}
            </button>
          </div>

          <a href={waHref} target="_blank" rel="noopener noreferrer" className="mt-3 flex h-[46px] items-center justify-center gap-2.5 rounded-[3px] border border-line-strong text-[13.5px] font-semibold text-forest no-underline transition-colors hover:border-forest">
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
            Ask Frits about this product
          </a>

          {/* Trust row */}
          <div className="mt-[26px] flex flex-col gap-[11px] border-t border-line pt-[22px]">
            <div className="flex items-center gap-2.5 text-[12.5px] text-body-soft"><ShieldCheck className="h-[17px] w-[17px] text-forest" strokeWidth={1.6} /> Secure checkout with PayFast &amp; card</div>
            {!isDigital && (
              <div className="flex items-center gap-2.5 text-[12.5px] text-body-soft"><Truck className="h-[17px] w-[17px] text-forest" strokeWidth={1.6} /> Nationwide courier delivery</div>
            )}
            <div className="flex items-center gap-2.5 text-[12.5px] text-body-soft"><Star className="h-[17px] w-[17px] text-forest" strokeWidth={1.6} /> Field-tested &amp; recommended by Frits van Oudtshoorn</div>
            {product.sku && <div className="mt-1 font-mono text-[11px] text-[#9A9784]">SKU {product.sku}</div>}
          </div>
        </div>
      </Container>

      {/* About + Specifications */}
      {(on("longDescription", !!product.longDescription) || on("specifications", !!product.specifications?.length)) && (
        <section className="border-t border-line bg-cream-panel">
          <Container className="grid grid-cols-1 items-start gap-14 py-[clamp(48px,6vw,72px)] min-[880px]:grid-cols-[1.4fr_1fr]">
            <div>
              {on("longDescription", !!product.longDescription) ? (
                <>
                  <h2 className="m-0 mb-5 font-headline text-[26px] font-semibold text-ink">About this {typeLabel}</h2>
                  <FormattedText text={product.longDescription} />
                </>
              ) : (
                <>
                  <h2 className="m-0 mb-5 font-headline text-[26px] font-semibold text-ink">About this {typeLabel}</h2>
                  <p className="text-[15.5px] leading-[1.75] text-body">{product.description}</p>
                </>
              )}
            </div>
            {on("specifications", !!product.specifications?.length) && (
              <div>
                <h2 className="m-0 mb-2 font-headline text-[20px] font-semibold text-ink">Specifications</h2>
                <div>
                  {product.specifications!.map((s, i) => (
                    <div key={i} className="flex justify-between gap-4 border-b border-cream-line py-[13px]">
                      <span className="text-[13px] font-semibold text-body-mute">{s.feature}</span>
                      <span className="text-right text-[13px] text-ink">{s.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Value proposition callout */}
      {on("valueProposition", !!product.valueProposition) && (
        <section className="border-t border-line bg-forest-bark">
          <Container className="py-[clamp(40px,5vw,60px)]">
            <p className="m-0 max-w-[820px] font-headline text-[clamp(20px,2.4vw,28px)] font-normal italic leading-[1.4] text-ondark-bright">
              {product.valueProposition}
            </p>
          </Container>
        </section>
      )}

      {/* How it works + What's inside */}
      {(on("howItWorks", !!product.howItWorks) || on("whatsInside", !!product.features?.length)) && (
        <section className="border-t border-line bg-cream-panel">
          <Container className="grid grid-cols-1 items-start gap-14 py-[clamp(48px,6vw,72px)] min-[880px]:grid-cols-[1.4fr_1fr]">
            <div>
              {on("howItWorks", !!product.howItWorks) && (
                <>
                  <h2 className="m-0 mb-6 font-headline text-[26px] font-semibold text-ink">How it works</h2>
                  <FormattedText text={product.howItWorks} />
                </>
              )}
            </div>
            {on("whatsInside", !!product.features?.length) && (
              <div>
                <h2 className="m-0 mb-4 font-headline text-[20px] font-semibold text-ink">What&rsquo;s inside</h2>
                <div className="flex flex-col gap-3">
                  {product.features!.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-body">
                      <span className="mt-0.5 shrink-0 text-forest">&#10003;</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Who it's for + Field application */}
      {(on("whoItsFor", !!product.targetAudience) || on("fieldApplication", !!product.fieldUse)) && (
        <section className="border-t border-line">
          <Container className="grid grid-cols-1 items-start gap-14 py-[clamp(48px,6vw,72px)] min-[880px]:grid-cols-2">
            {on("whoItsFor", !!product.targetAudience) && (
              <div>
                <h2 className="m-0 mb-4 font-headline text-[22px] font-semibold text-ink">Who it&rsquo;s for</h2>
                <FormattedText text={product.targetAudience} />
              </div>
            )}
            {on("fieldApplication", !!product.fieldUse) && (
              <div>
                <h2 className="m-0 mb-4 font-headline text-[22px] font-semibold text-ink">Field application</h2>
                <FormattedText text={product.fieldUse} />
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Expert recommendation */}
      {on("expertRecommendation", !!product.authorityStatement) && (
        <section className="border-t border-line bg-forest-bark text-ondark">
          <Container className="py-[clamp(48px,6vw,72px)]">
            <Eyebrow className="mb-5 [&>span]:text-gold">Expert recommendation</Eyebrow>
            {(() => {
              const [quote, ...rest] = product.authorityStatement!.split("\n");
              return (
                <>
                  <blockquote className="m-0 max-w-[760px] font-headline text-[clamp(20px,2.2vw,26px)] font-normal italic leading-[1.45] text-ondark-bright">{quote}</blockquote>
                  {rest.length > 0 && <p className="mt-4 text-[14px] text-ondark-soft">{rest.join(" ").trim()}</p>}
                </>
              );
            })()}
          </Container>
        </section>
      )}

      {/* Calibration note */}
      {on("calibrationNote", !!product.calibrationNote) && (
        <section className="border-t border-line">
          <Container className="py-[clamp(40px,5vw,60px)]">
            <div className="rounded-[4px] border border-[#E3C877] bg-gold-bg p-6">
              <div className="mb-2 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-gold-text">Calibration note</div>
              <FormattedText text={product.calibrationNote} />
            </div>
          </Container>
        </section>
      )}

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-line bg-cream-band">
          <Container className="py-[clamp(48px,6vw,72px)]">
            <h2 className="m-0 mb-8 font-headline text-[clamp(26px,3.2vw,34px)] font-medium tracking-[-0.02em] text-ink">Frits also recommends</h2>
            <div className="grid grid-cols-1 gap-6 min-[560px]:grid-cols-2 min-[880px]:grid-cols-3">
              {relatedProducts.slice(0, 3).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
