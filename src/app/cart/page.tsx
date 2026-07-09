"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { SiteSettings } from "@/lib/types";
import { calculateOrderShipping } from "@/lib/shipping";
import { productUrl } from "@/lib/utils";
import { Minus, Plus, Trash2, ShieldCheck } from "lucide-react";
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
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const firestore = useFirestore();
  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "public"), [firestore]);
  const { data: settings } = useDoc<Pick<SiteSettings, "shippingFee">>(settingsRef);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = calculateOrderShipping(cartItems, settings?.shippingFee ?? 150);
  const total = subtotal + shippingFee;

  return (
    <div className="bg-cream">
      <Container className="pb-[clamp(48px,6vw,80px)] pt-[clamp(40px,5vw,56px)]">
        <div className="mb-3.5 font-mono text-[12px] text-gold-deep">Home / Cart</div>
        <h1 className="m-0 mb-8 font-headline text-[clamp(30px,3.6vw,44px)] font-medium tracking-[-0.02em] text-ink">Your cart</h1>

        {cartItems.length === 0 ? (
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
                <div key={product.id} className="flex items-center gap-[18px] border-b border-line py-5">
                  <Link
                    href={productUrl(product)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[3px] border border-line bg-white no-underline"
                  >
                    {product.images?.[0] && (
                      <Image src={product.images[0]} alt={product.name} fill sizes="80px" className="object-contain p-1.5" />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h3 className="m-0 mb-1 font-headline text-[17px] font-semibold text-ink">
                      <Link href={productUrl(product)} className="text-ink no-underline hover:text-forest">{product.name}</Link>
                    </h3>
                    <span className="text-[12.5px] text-body-faint">R{product.price.toFixed(2)} each</span>
                  </div>
                  <div className="flex items-center overflow-hidden rounded-[3px] border border-line-strong">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="flex h-[38px] w-[34px] items-center justify-center bg-cream-band text-forest"><Minus className="h-4 w-4" /></button>
                    <QtyInput value={quantity} onCommit={(n) => updateQuantity(product.id, n)} />
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="flex h-[38px] w-[34px] items-center justify-center bg-cream-band text-forest"><Plus className="h-4 w-4" /></button>
                  </div>
                  <span className="w-24 text-right font-body text-[16px] font-bold text-ink">R{(product.price * quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(product.id)} aria-label="Remove" className="p-1.5 text-[#9A9784] hover:text-destructive">
                    <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.6} />
                  </button>
                </div>
              ))}
              <Link href="/shop" className="mt-[22px] inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-forest no-underline">
                ← Continue shopping
              </Link>
            </div>

            {/* Summary */}
            <div className="rounded-[4px] border border-line bg-cream-card p-[26px] shadow-lifted min-[880px]:sticky min-[880px]:top-24">
              <h2 className="m-0 mb-5 font-headline text-[19px] font-semibold text-ink">Order summary</h2>
              <div className="flex justify-between py-2 text-[14px] text-body-soft"><span>Subtotal</span><span className="font-semibold text-ink">R{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between border-b border-line py-2 text-[14px] text-body-soft"><span>Delivery</span><span className="font-semibold text-ink">{shippingFee === 0 ? "Free" : `R${shippingFee.toFixed(2)}`}</span></div>
              <div className="flex justify-between pb-1 pt-4 text-[17px] font-bold text-ink"><span>Total</span><span>R{total.toFixed(2)}</span></div>
              <span className="text-[11px] text-body-faint">Incl. VAT</span>
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
