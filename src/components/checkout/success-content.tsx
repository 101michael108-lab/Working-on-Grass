"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { InvoiceActions } from "@/components/invoice-actions";
import { Container } from "@/components/redesign/ui";
import { useCart } from "@/context/cart-context";
import { ADS_PURCHASE_CONVERSION, GA4_ID, toGaItem, track } from "@/lib/analytics";

export default function SuccessContent() {
  const sp = useSearchParams();
  const { cartItems, clearCart, isHydrated } = useCart();
  const orderId = sp.get("orderId");
  const uid = sp.get("uid");
  const invoiceToken = sp.get("t");
  const orderNumber = sp.get("n");
  const amt = sp.get("amt");
  const trackingRef = orderNumber || orderId;

  // Report the purchase, then empty the cart. Waits for the cart to be restored
  // from localStorage: it still holds what was just bought (checkout keeps it
  // until here so a cancelled PayFast payment doesn't lose it), which gives GA4
  // its line items — and clearing before the restore would be undone by it.
  useEffect(() => {
    if (!isHydrated) return;

    const txnId = orderNumber || orderId;
    if (txnId) {
      // Once per order (guarded against refreshes), with the real order total so
      // ROAS is accurate.
      const key = `wog_conv_${txnId}`;
      let alreadySent = false;
      try {
        alreadySent = !!sessionStorage.getItem(key);
      } catch {
        /* sessionStorage unavailable — fire anyway */
      }
      if (!alreadySent) {
        const value = amt ? Number(amt) : NaN;
        const money = Number.isFinite(value) ? { value, currency: "ZAR" } : {};
        track("conversion", { send_to: ADS_PURCHASE_CONVERSION, ...money, transaction_id: txnId });
        track("purchase", {
          send_to: GA4_ID,
          transaction_id: txnId,
          ...money,
          items: cartItems.map(({ product, quantity }) => toGaItem(product, quantity)),
        });
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          /* ignore */
        }
      }
    }

    if (orderId) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, orderNumber, orderId, amt]);

  return (
    <div className="bg-cream">
      <Container className="py-[clamp(56px,7vw,96px)]">
        <div className="mx-auto max-w-[620px] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-stock-border bg-stock-bg">
            <Check className="h-[30px] w-[30px] text-[#2E7D46]" strokeWidth={2} />
          </div>
          <h1 className="m-0 mb-3 font-headline text-[clamp(30px,3.6vw,42px)] font-semibold tracking-[-0.02em] text-ink">
            Thank you — your order is placed
          </h1>
          <p className="m-0 mb-2 text-[16px] leading-[1.6] text-body-soft">
            We&rsquo;ve emailed your confirmation with your invoice attached, and we&rsquo;ll notify you when your order
            ships nationwide.
          </p>
          {trackingRef && (
            <div className="mb-8 font-mono text-[13px] text-gold-deep">
              Order {orderNumber ? `#${orderNumber}` : trackingRef}
            </div>
          )}

          {(invoiceToken || (orderId && uid)) && (
            <div className="mb-7 rounded-[4px] border border-line bg-cream-card p-5 shadow-lifted">
              <p className="m-0 mb-3 text-[14px] font-medium text-ink">Your invoice is ready</p>
              <InvoiceActions
                orderId={orderId ?? undefined}
                uid={uid ?? undefined}
                token={invoiceToken ?? undefined}
                className="justify-center"
              />
            </div>
          )}

          <div className="mb-7 rounded-[4px] border border-line bg-cream-card p-6 text-left shadow-lifted">
            <div className="mb-3.5 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-body-faint">What happens next</div>
            <div className="flex flex-col gap-3 text-[13.5px] leading-[1.5] text-body">
              <div className="flex gap-2.5"><span className="font-semibold text-forest">1.</span>You&rsquo;ll receive an email confirmation with your order details and invoice.</div>
              <div className="flex gap-2.5"><span className="font-semibold text-forest">2.</span>We pack and dispatch your order via nationwide courier.</div>
              <div className="flex gap-2.5"><span className="font-semibold text-forest">3.</span>A tracking update follows so you can follow it to your door.</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shop" className="rounded-[3px] bg-forest px-6 py-3.5 text-[14px] font-semibold text-ondark-bright no-underline hover:bg-forest-dark">Continue shopping</Link>
            <Link href="/track-order" className="rounded-[3px] border border-line-strong px-[22px] py-3.5 text-[14px] font-semibold text-forest no-underline hover:border-forest">Track your order</Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
