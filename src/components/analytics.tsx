"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ADS_ID, ensureGtag, track } from "@/lib/analytics";

/**
 * How long to wait before loading gtag.js if the visitor never interacts.
 * Long enough to stay out of the page-load critical path, short enough that a
 * visitor who lands and leaves without touching anything is still counted.
 */
const FALLBACK_DELAY_MS = 4000;

const INTERACTION_EVENTS = [
  "pointerdown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

/**
 * Loads Google tags (Ads conversions + GA4) without blocking page load.
 *
 * gtag.js is ~290 kB across its two containers and costs ~260 ms of main-thread
 * work — it was the single largest contributor to Total Blocking Time. Nothing on
 * screen depends on it, so the heavy script is held until the visitor interacts,
 * or `FALLBACK_DELAY_MS` after mount, whichever happens first. The exception is
 * /checkout/success: a buyer who closes that tab within seconds must still be
 * counted, so the purchase page loads the tag straight away.
 *
 * Deferring the *script* does not defer the *data*: ensureGtag() defines
 * `window.gtag` up front, so every call is queued on `dataLayer` and drained
 * when gtag.js arrives. No event is lost.
 *
 * Also reports clicks on WhatsApp / phone / email links — the site's main lead
 * channels — so they can be marked as key events in GA4 and imported into Ads.
 */
export function Analytics() {
  const pathname = usePathname();
  const isPurchasePage = pathname?.startsWith("/checkout/success") ?? false;
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    ensureGtag();
  }, []);

  useEffect(() => {
    if (shouldLoad) return;
    if (isPurchasePage) {
      setShouldLoad(true);
      return;
    }

    const load = () => setShouldLoad(true);

    const timer = window.setTimeout(load, FALLBACK_DELAY_MS);
    for (const event of INTERACTION_EVENTS) {
      window.addEventListener(event, load, { once: true, passive: true });
    }

    return () => {
      window.clearTimeout(timer);
      for (const event of INTERACTION_EVENTS) {
        window.removeEventListener(event, load);
      }
    };
  }, [shouldLoad, isPurchasePage]);

  // One delegated listener instead of wiring every WhatsApp button by hand.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const params = { link_url: href.split("?")[0], page_path: window.location.pathname };
      if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) track("whatsapp_click", params);
      else if (href.startsWith("tel:")) track("phone_click", params);
      else if (href.startsWith("mailto:")) track("email_click", params);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return shouldLoad ? (
    <Script
      id="gtag-js"
      src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
      strategy="afterInteractive"
    />
  ) : null;
}
