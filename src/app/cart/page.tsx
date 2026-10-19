"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useLiveCart } from "@/context/cart-context";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { SiteSettings } from "@/lib/types";
import { calculateOrderShipping } from "@/lib/shipping";
import { formatRand, productUrl } from "@/lib/utils";
import { getSalePrice, getUnitPrice } from "@/lib/pricing";
import { Minus, Plus, Trash2, ShieldCheck, Info } from "lucide-react";
import { Container } from "@/components/redesign/ui";

/** Editable quantity that only commits a valid number on blur/Enter. */
function QtyInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = parseInt(draft, 10);
    if (!Number.isFinite(n) || n < 1) return setDraft(String(value));
    onCommit(n);
  };
  return (
    <input
      type="number"
      min={1}
      inputMode="numeric"
      aria-label="Quantity"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      className="h-[38px] w-[42px] border-0 bg-transparent text-center font-body text-[14px] font-bold text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

export default function CartPage() {
  const { cartItems, isHydrated, updateQuantity, removeFromCart } = useLiveCart();
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "public"), [firestore]);
  const { data: settings } = useDoc<Pick<SiteSettings, "shippingFee">>(settingsRef);
  const [paymentCancelled, setPaymentCancelled] = useState(false);

  // PayFast's cancel_url lands here with ?payment=cancelled. Read it from
  // window (not useSearchParams) so the page needs no Suspense boundary, then
  // drop the param so a refresh doesn't show the notice again.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("payment") !== "cancelled") return;
    setPaymentCancelled(true);
    url.searchParams.delete("payment");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + getUnitPrice(item.product) * item.quantity, 0);
  const savings = cartItems.reduce((sum, item) => sum + (Number(item.product.price) - getUnitPrice(item.product)) * item.quantity, 0);
  const shippingFee = calculateOrderShipping(cartItems, settings?.shippingFee ?? 150);
  const total = subtotal + shippingFee;

  return (
    <div className="bg-cream">
      <Container className="pb-[clamp(48px,6vw,80px)] pt-[clamp(40px,5vw,56px)]">
        <div className="mb-3.5 font-mono text-[12px] text-gold-deep">Home / Cart</div>
        <h1 className="m-0 mb-8 font-headline text-[clamp(30px,3.6vw,44px)] font-medium tracking-[-0.02em] text-ink">Your cart</h1>

        {paymentCancelled && (
          <div role="status" className="mb-7 flex items-start gap-3 rounded-[3px] border border-[#E3C877] bg-gold-bg px-4 py-3.5 text-[14px] leading-[1.5] text-ink">
            <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold-text" strokeWidth={1.8} />
            <span>
              <strong>Payment not completed — you haven&rsquo;t been charged.</strong>
              {cartItems.length > 0 && <> Your cart is saved, so you can try again whenever you&rsquo;re ready.</>}
            </span>
          </div>
        )}

        {!isHydrated ? (
          // Cart lives in localStorage; render nothing until it's restored so we
          // never flash "Your cart is empty" at someone with a full cart.
          <div className="min-h-[240px]" aria-busy="true" />
        ) : cartItems.length === 0 ? (
          <div className="rounded-[4px] border border-line bg-cream-card px-6 py-14 text-center shadow-lifted">
            <p className="m-0 mb-2 font-headline text-[20px] text-ink">Your cart is empty</p>
            <p className="m-0 mb-6 text-[14px] text-body-soft">Books, field instruments and resources from thirty years on the land.</p>
            <Link href="/shop" className="inline-block rounded-[3px] bg-forest px-[26px] py-3.5 text-[14px] font-semibold text-ondark-bright no-underline hover:bg-forest-dark">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-11 min-[880px]:grid-cols-[1fr_340px]">
            {/* Lines */}
            <div>
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-start gap-4 border-b border-line py-5 sm:items-center sm:gap-[18px]">
                  <Link
                    href={productUrl(product)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[3px] border border-line bg-white no-underline"
                  >
                    {product.images?.[0] && (
                      <Image src={product.images[0]} alt={product.name} fill sizes="80px" className="object-contain p-1.5" />
                    )}
                  </Link>
                  {/* Phones: name on top, controls on a row beneath. sm+: one row (the
                      controls wrapper becomes display:contents). */}
                  <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-[18px]">
                    <div className="min-w-0 flex-1">
                      <h3 className="m-0 mb-1 font-headline text-[17px] font-semibold leading-[1.25] text-ink">
                        <Link href={productUrl(product)} className="text-ink no-underline hover:text-forest">{product.name}</Link>
                      </h3>
                      {getSalePrice(product) !== null ? (
                        <span className="text-[12.5px] text-body-faint">
                          <span className="sr-only">Regular price </span>
                          <s>{formatRand(product.price)}</s>{" "}
                          <span className="font-semibold text-sale">{formatRand(getUnitPrice(product))}</span> each
                        </span>
                      ) : (
                        <span className="text-[12.5px] text-body-faint">{formatRand(product.price)} each</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 sm:contents">
                      <div className="flex items-center overflow-hidden rounded-[3px] border border-line-strong">
                        <button onClick={() => updateQuantity(product.id, quantity - 1)} aria-label="Decrease quantity" className="flex h-[38px] w-[34px] items-center justify-center bg-cream-band text-forest"><Minus className="h-4 w-4" /></button>
                        <QtyInput value={quantity} onCommit={(n) => updateQuantity(product.id, n)} />
                        <button onClick={() => updateQuantity(product.id, quantity + 1)} aria-label="Increase quantity" className="flex h-[38px] w-[34px] items-center justify-center bg-cream-band text-forest"><Plus className="h-4 w-4" /></button>
                      </div>
                      <span className="ml-auto whitespace-nowrap text-right font-body text-[16px] font-bold text-ink sm:ml-0 sm:w-28">{formatRand(getUnitPrice(product) * quantity)}</span>
                      <button onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`} className="p-1.5 text-[#9A9784] hover:text-destructive">
                        <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.6} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/shop" className="mt-[22px] inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-forest no-underline">
                ← Continue shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="rounded-[4px] border border-line bg-cream-card p-[26px] shadow-lifted min-[880px]:sticky min-[880px]:top-24">
              <h2 className="m-0 mb-5 font-headline text-[19px] font-semibold text-ink">Order summary</h2>
              <div className="flex justify-between py-2 text-[14px] text-body-soft"><span>Subtotal</span><span className="font-semibold text-ink">{formatRand(subtotal)}</span></div>
              <div className="flex justify-between border-b border-line py-2 text-[14px] text-body-soft"><span>Delivery</span><span className="font-semibold text-ink">{shippingFee === 0 ? "Free" : formatRand(shippingFee)}</span></div>
              <div className="flex justify-between pb-1 pt-4 text-[17px] font-bold text-ink"><span>Total</span><span>{formatRand(total)}</span></div>
              <span className="text-[11px] text-body-faint">Incl. VAT</span>
              {savings > 0 && (
                <div className="mt-3 rounded-[2px] border border-sale-border bg-sale-bg px-3 py-2 text-center text-[12.5px] font-semibold text-sale">
                  You&rsquo;re saving {formatRand(savings)} on sale items
                </div>
              )}
              <Link href="/checkout" className="mt-5 block rounded-[3px] bg-forest py-[15px] text-center font-body text-[14.5px] font-semibold text-ondark-bright no-underline hover:bg-forest-dark">
                Proceed to checkout
              </Link>
              <div className="mt-3.5 flex items-center justify-center gap-2 text-[11.5px] text-body-faint">
                <ShieldCheck className="h-3.5 w-3.5 text-forest" strokeWidth={1.6} /> Secure checkout with PayFast
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
