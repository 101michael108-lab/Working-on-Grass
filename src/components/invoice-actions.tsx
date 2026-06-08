"use client";

import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Invoice download/print actions, shared by the checkout success page, the
 * Track Order results, and the customer's order history.
 *
 * Both buttons are plain links to /api/invoice, which is authorized purely by
 * the order's keys (orderId + uid) — no login required, so guest buyers can
 * always reach their invoice.
 */
export function InvoiceActions({
  orderId,
  uid,
  token,
  className,
}: {
  orderId?: string;
  uid?: string;
  /** Preferred: a short-lived signed token. Falls back to raw orderId+uid. */
  token?: string;
  className?: string;
}) {
  const query = token
    ? `t=${encodeURIComponent(token)}`
    : `orderId=${encodeURIComponent(orderId ?? '')}&uid=${encodeURIComponent(uid ?? '')}`;
  const href = `/api/invoice?${query}`;

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      <Button asChild className="w-full sm:w-auto">
        {/* Inline PDF in a new tab — the browser viewer can print or save it. */}
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Printer className="h-4 w-4" /> View / Print Invoice
        </a>
      </Button>
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <a href={`${href}&download=1`}>
          <Download className="h-4 w-4" /> Download PDF
        </a>
      </Button>
    </div>
  );
}
