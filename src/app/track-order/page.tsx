"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatOrderRef } from "@/lib/order-number";
import { InvoiceActions } from "@/components/invoice-actions";
import { Container, Eyebrow } from "@/components/redesign/ui";

const labelCls = "flex flex-col gap-1.5";
const span = "text-[12px] font-semibold text-[#43483F]";
const input = "h-[46px] rounded-[3px] border border-line-strong bg-[#F7F4EC] px-3.5 font-body text-[14px] text-ink outline-none transition-colors focus:border-forest placeholder:text-body-faint";

const RANK: Record<Order["status"], number> = { Pending: 0, Processing: 1, Shipped: 2, Fulfilled: 3, Delivered: 3, Cancelled: -1 };

function buildTimeline(order: Order) {
  const rank = RANK[order.status] ?? 0;
  const placed = order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "";
  const step = (label: string, sub: string, state: "done" | "current" | "pending") => ({ label, sub, state });
  return [
    step("Order confirmed", placed, "done"),
    step("Packed & dispatched", rank >= 2 ? "Courier collected" : rank === 1 ? "Being prepared" : "", rank >= 2 ? "done" : rank === 1 ? "current" : "pending"),
    step("In transit", rank === 2 ? "On its way to you" : "", rank >= 3 ? "done" : rank === 2 ? "current" : "pending"),
    step("Delivered", rank >= 3 ? "Delivered" : "", rank >= 3 ? "done" : "pending"),
  ];
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [invoiceToken, setInvoiceToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !email) return;
    setIsLoading(true);
    setError(null);
    setOrder(null);
    setInvoiceToken(null);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId.trim(), email: email.trim().toLowerCase() }),
      });
      if (res.ok) {
        const { order: foundOrder, invoiceToken: tok } = await res.json();
        setOrder(foundOrder as Order);
        setInvoiceToken(tok ?? null);
      } else {
        setError("Order not found. Please check your order number and email address.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong fetching your order. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelled = order?.status === "Cancelled";
  const statusPill = cancelled
    ? "text-destructive bg-destructive/10 border-destructive/20"
    : order?.status === "Delivered"
    ? "text-stock bg-stock-bg border-stock-border"
    : "text-stock bg-stock-bg border-stock-border";

  return (
    <Container className="py-[clamp(48px,6vw,80px)]">
      <div className="mx-auto max-w-[620px]">
        <div className="mb-9 text-center">
          <Eyebrow tone="gold" className="mb-3 justify-center">Order status</Eyebrow>
          <h1 className="m-0 font-headline text-[clamp(30px,3.6vw,44px)] font-medium tracking-[-0.02em] text-ink">Track your order</h1>
          <p className="m-0 mt-3.5 font-body text-[15px] leading-[1.6] text-body-soft">Enter your order number and email to see the latest status.</p>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleTrack} className="grid grid-cols-1 gap-4 rounded-[4px] border border-line bg-cream-card p-7 shadow-lifted min-[480px]:grid-cols-2">
          <label className={labelCls}><span className={span}>Order number</span><input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. 1001" required className={input} /></label>
          <label className={labelCls}><span className={span}>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@farm.co.za" required className={input} /></label>
          {error && (
            <div className="col-span-1 flex items-center gap-2 rounded-[3px] border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive min-[480px]:col-span-2">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <button type="submit" disabled={isLoading} className="col-span-1 h-[50px] rounded-[3px] bg-forest font-body text-[14.5px] font-semibold text-ondark-bright transition-colors hover:bg-forest-dark disabled:opacity-60 min-[480px]:col-span-2">
            {isLoading ? "Searching…" : "Track order"}
          </button>
        </form>

        {/* Result */}
        {order && (
          <div className="mt-6 animate-wog-fade rounded-[4px] border border-line bg-cream-band p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-mono text-[12px] text-gold-deep">{formatOrderRef(order)}</span>
              <span className={`rounded-[20px] border px-3 py-1 text-[12px] font-semibold ${statusPill}`}>{order.status}</span>
            </div>

            {cancelled ? (
              <p className="m-0 text-[14px] text-body">This order was cancelled. If you think this is a mistake, please contact us and we’ll help sort it out.</p>
            ) : (
              <div className="flex flex-col">
                {buildTimeline(order).map((s, i, arr) => {
                  const last = i === arr.length - 1;
                  const dot = s.state === "pending" ? "bg-line-strong" : "bg-forest";
                  const ring = s.state === "current" ? "ring-[3px] ring-stock-border" : "";
                  const connector = s.state === "done" ? "bg-forest" : "bg-line-strong";
                  const labelColor = s.state === "pending" ? "text-body-faint" : "text-ink";
                  return (
                    <div key={s.label} className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        <span className={`h-4 w-4 rounded-full ${dot} ${ring}`} />
                        {!last && <span className={`min-h-[26px] w-0.5 flex-grow ${connector}`} />}
                      </div>
                      <div className={last ? "" : "pb-5"}>
                        <div className={`text-[14px] font-semibold ${labelColor}`}>{s.label}</div>
                        {s.sub && <div className="text-[12px] text-body-faint">{s.sub}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Details */}
            <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5 text-[13.5px]">
              <div className="flex justify-between"><span className="text-body-soft">Placed on</span><span className="font-medium text-ink">{order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString("en-ZA", { dateStyle: "long" }) : "—"}</span></div>
              <div className="flex justify-between"><span className="text-body-soft">Deliver to</span><span className="font-medium text-ink">{order.shippingInfo.firstName} {order.shippingInfo.lastName}, {order.shippingInfo.city}</span></div>
              <div className="flex justify-between text-[15px] font-bold text-ink"><span>Total paid</span><span>R{order.totalAmount.toFixed(2)}</span></div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {order.userId ? (
                <InvoiceActions orderId={order.id} uid={order.userId} token={invoiceToken ?? undefined} />
              ) : <span />}
              <button onClick={() => setOrder(null)} className="text-[13px] font-semibold text-forest hover:underline">Track another order</button>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
