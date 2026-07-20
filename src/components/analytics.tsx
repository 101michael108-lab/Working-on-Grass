"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

/** Google Ads conversion account. */
const ADS_ID = "AW-18311112344";
/** GA4 property — the one Firebase Analytics used to report to. */
const GA4_ID = "G-QQGK35J3TB";

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
 * or `FALLBACK_DELAY_MS` after mount, whichever happens first.
 *
 * Deferring the *script* does not defer the *data*: the inline bootstrap below
 * runs immediately, so `window.gtag(...)` exists from the start and every call —
 * including the purchase conversion fired on /checkout/success — is queued on
 * `dataLayer`. gtag.js drains that queue when it arrives, so no event is lost.
 */
export function Analytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

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
  }, [shouldLoad]);

  return (
    <>
      {/* Runs immediately and is ~200 bytes: defines dataLayer + the gtag() shim
          so callers can queue events before the real tag has loaded. */}
      <Script id="gtag-bootstrap" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ADS_ID}');
gtag('config', '${GA4_ID}');`}
      </Script>

      {shouldLoad && (
        <Script
          id="gtag-js"
          src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
