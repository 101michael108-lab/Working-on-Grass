"use client";
import React, { useState } from "react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Package, MapPin } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatOrderRef } from "@/lib/order-number";
import { InvoiceActions } from "@/components/invoice-actions";

const pillBase = "inline-flex items-center rounded-[20px] border px-2.5 py-0.5 text-[11.5px] font-semibold";
function statusPill(status: Order["status"]): string {
  switch (status) {
    case "Processing":
    case "Shipped":
      return `${pillBase} border-gold-border bg-gold-bg text-gold-text`;
    case "Fulfilled":
    case "Delivered":
      return `${pillBase} border-stock-border bg-stock-bg text-stock`;
    case "Cancelled":
      return `${pillBase} border-destructive/20 bg-destructive/10 text-destructive`;
    default:
      return `${pillBase} border-line-strong bg-cream-band text-body`;
  }
}

const STATUS_CAPTION: Partial<Record<Order["status"], string>> = {
  Pending: "Your payment is being verified.",
  Processing: "We are preparing your package for dispatch.",
  Shipped: "Your package is with the courier.",
  Delivered: "Order has been successfully delivered.",
  Fulfilled: "Order complete.",
  Cancelled: "This order was cancelled.",
};

export default function UserOrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, "users", user.uid, "orders"), orderBy("orderDate", "desc"));
  }, [firestore, user]);

  const { data: orders, isLoading } = useCollection<Omit<Order, "id">>(ordersQuery);

  return (
    <div>
      <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-gold-deep">History</div>
      <h1 className="m-0 mb-6 font-headline text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.02em] text-ink">My orders</h1>

      {isLoading ? (
        <p className="text-[14px] text-body-soft">Loading orders…</p>
      ) : !orders || orders.length === 0 ? (
        <div className="rounded-[4px] border border-dashed border-line-strong bg-cream-panel py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-body-faint" strokeWidth={1.4} />
          <p className="m-0 text-[14px] text-body-soft">You haven’t placed any orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[4px] border border-line bg-cream-card px-5 py-4 shadow-lifted">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[13px] font-semibold text-ink">{formatOrderRef(order as Order)}</div>
                <div className="text-[12px] text-body-faint">{order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString("en-ZA", { dateStyle: "medium" }) : "—"}</div>
              </div>
              <span className={statusPill(order.status)}>{order.status}</span>
              <span className="font-body text-[15px] font-bold text-ink">R{order.totalAmount.toFixed(2)}</span>
              <button onClick={() => setSelectedOrder(order as Order)} className="rounded-[3px] border border-line-strong px-3.5 py-2 text-[13px] font-semibold text-forest transition-colors hover:border-forest">
                Details
              </button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-[20px] text-ink">Order {selectedOrder ? formatOrderRef(selectedOrder) : ""}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder?.orderDate ? new Date(selectedOrder.orderDate.toDate()).toLocaleString("en-ZA") : "—"}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2">
                <div>
                  <h4 className="m-0 mb-2 flex items-center gap-1.5 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-body-faint">
                    <MapPin className="h-3 w-3" /> Shipping address
                  </h4>
                  <div className="rounded-[3px] border border-line bg-cream-band p-3 text-[13.5px] leading-[1.6] text-body">
                    <p className="m-0 font-semibold text-ink">{selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}</p>
                    <p className="m-0">{selectedOrder.shippingInfo.address}</p>
                    <p className="m-0">{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.postalCode}</p>
                    <p className="m-0">{selectedOrder.shippingInfo.country}</p>
                  </div>
                </div>
                <div>
                  <h4 className="m-0 mb-2 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-body-faint">Order status</h4>
                  <span className={statusPill(selectedOrder.status)}>{selectedOrder.status}</span>
                  {STATUS_CAPTION[selectedOrder.status] && (
                    <p className="m-0 mt-2 text-[12.5px] italic text-body-soft">{STATUS_CAPTION[selectedOrder.status]}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="m-0 mb-2 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-body-faint">Items purchased</h4>
                <div className="overflow-hidden rounded-[3px] border border-line">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2.5 text-[13.5px] last:border-b-0">
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">{item.name}</span>
                      <span className="text-body-faint">× {item.quantity}</span>
                      <span className="w-20 text-right font-semibold text-ink">R{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex justify-end">
                  <div className="text-right">
                    <p className="m-0 text-[14px] font-bold text-ink">Total paid: R{selectedOrder.totalAmount.toFixed(2)}</p>
                    <p className="m-0 text-[11px] text-body-faint">Includes shipping &amp; VAT</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                {user && <InvoiceActions orderId={selectedOrder.id} uid={user.uid} />}
                <Button variant="outline" onClick={() => setSelectedOrder(null)} className="w-full sm:w-auto">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
