"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import {
  collectionGroup,
  query,
  getDocs,
  orderBy,
  collection,
  doc,
  deleteDoc,
  documentId,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  FileText,
  Mail,
  MapPin,
  FlaskConical,
  Package,
  Phone,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import type { Order, User, SiteSettings } from "@/lib/types";
import { formatOrderRef } from "@/lib/order-number";
import {
  sendOrderStatusUpdateEmail,
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/services/email-service";
import { resolveAdminRecipients, resolveReplyToEmail, resolveSenderEmail } from "@/lib/email-recipients";
import { type MailDoc } from "@/lib/mail-delivery";
import {
  ORDER_GROUPS,
  daysWaiting,
  describeOrderEmail,
  describeOrderStatus,
  groupForStatus,
  matchesSearch,
  nextStatusAction,
  summariseItems,
  summariseOrders,
  type OrderGroup,
} from "@/lib/order-display";

type AdminOrder = Order & { customerName?: string; userId: string };

const ALL_STATUSES = ["Pending", "Processing", "Shipped", "Fulfilled", "Delivered", "Cancelled"] as const;

/** Firestore caps an `in` filter at 30 values. */
const ID_CHUNK = 30;

/**
 * Resolve the `mail` documents the orders point at. Batched on document id so
 * the page costs one read per 30 emails rather than one per email.
 */
async function fetchMailByIds(firestore: Firestore, ids: string[]): Promise<Map<string, MailDoc>> {
  const resolved = new Map<string, MailDoc>();
  const unique = [...new Set(ids.filter(Boolean))];

  for (let i = 0; i < unique.length; i += ID_CHUNK) {
    const chunk = unique.slice(i, i + ID_CHUNK);
    const snap = await getDocs(query(collection(firestore, "mail"), where(documentId(), "in", chunk)));
    snap.forEach((d) => resolved.set(d.id, { ...(d.data() as Omit<MailDoc, "id">), id: d.id }));
  }

  return resolved;
}

function orderDate(order: Pick<Order, "orderDate">): string {
  const value = order.orderDate;
  if (value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString("en-ZA", { dateStyle: "medium" });
  }
  return "—";
}

function money(amount: number | undefined): string {
  return `R${(Number(amount) || 0).toFixed(2)}`;
}

function StatTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "bad" | "good";
}) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={
          "text-2xl font-bold " + (tone === "bad" ? "text-destructive" : tone === "good" ? "text-green-600" : "")
        }
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminOrdersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [mailById, setMailById] = useState<Map<string, MailDoc>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [loadedAt, setLoadedAt] = useState(() => new Date());

  const [group, setGroup] = useState<OrderGroup>("to-pack");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<AdminOrder | null>(null);
  const [showTests, setShowTests] = useState(false);

  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "config"), [firestore]);
  const { data: settings } = useDoc<SiteSettings>(settingsRef);

  const fetchAllOrders = async () => {
    if (!firestore) return;
    setIsLoading(true);
    try {
      const userMap = new Map<string, string>();
      const usersSnapshot = await getDocs(collection(firestore, "users"));
      usersSnapshot.forEach((d) => userMap.set(d.id, (d.data() as User).displayName));

      const ordersSnapshot = await getDocs(
        query(collectionGroup(firestore, "orders"), orderBy("orderDate", "desc"))
      );
      const allOrders: AdminOrder[] = ordersSnapshot.docs.map((d) => {
        const data = d.data() as Order;
        return { ...data, id: d.id, customerName: userMap.get(data.userId) || "Guest", userId: data.userId };
      });
      setOrders(allOrders);

      // Resolved separately — a failure here must not cost the owner their list.
      try {
        const mailIds = allOrders.flatMap((o) => [
          o.emailStatus?.customerMailId,
          o.emailStatus?.adminMailId,
          o.emailStatus?.resentAdminMailId,
          o.emailStatus?.alertMailId,
        ]);
        setMailById(await fetchMailByIds(firestore, mailIds.filter(Boolean) as string[]));
      } catch (error) {
        console.error("Error resolving queued mail documents:", error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({ variant: "destructive", title: "Could not load orders", description: "Check your connection and try again." });
    } finally {
      setLoadedAt(new Date());
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestore]);

  const totals = useMemo(() => summariseOrders(orders, loadedAt), [orders, loadedAt]);

  const listed = useMemo(() => orders.filter((o) => showTests || !o.isTest), [orders, showTests]);

  const visible = useMemo(
    () => listed.filter((o) => groupForStatus(o.status) === group && matchesSearch(o, search)),
    [listed, group, search]
  );

  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of ORDER_GROUPS) counts[g.id] = 0;
    for (const o of listed) counts[groupForStatus(o.status)] = (counts[groupForStatus(o.status)] ?? 0) + 1;
    return counts;
  }, [listed]);

  const activeGroup = ORDER_GROUPS.find((g) => g.id === group)!;

  const handleStatusChange = async (order: AdminOrder, newStatus: string) => {
    const orderRef = doc(firestore, "users", order.userId, "orders", order.id);
    updateDocumentNonBlocking(orderRef, { status: newStatus });
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: newStatus as Order["status"] } : o)));
    setSelectedOrder((prev) => (prev && prev.id === order.id ? { ...prev, status: newStatus as Order["status"] } : prev));

    if (["Shipped", "Delivered", "Cancelled"].includes(newStatus) && order.shippingInfo?.email) {
      sendOrderStatusUpdateEmail(
        {
          to: order.shippingInfo.email,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
          newStatus,
          storeName: settings?.storeName,
          fromEmail: resolveSenderEmail(settings),
          replyTo: resolveReplyToEmail(settings),
        },
        firestore
      );
      toast({ title: `Marked as ${newStatus.toLowerCase()}`, description: "The customer has been emailed." });
    } else {
      toast({ title: `Marked as ${newStatus.toLowerCase()}` });
    }
  };

  /**
   * Mark an order as a rehearsal rather than deleting it. Test checkouts made
   * while setting the store up otherwise sit in the figures forever, and
   * deleting them loses the record of what was tried.
   */
  const handleToggleTest = async (order: AdminOrder) => {
    const next = !order.isTest;
    setIsBusy(true);
    try {
      await updateDoc(doc(firestore, "users", order.userId, "orders", order.id), { isTest: next });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, isTest: next } : o)));
      setSelectedOrder((prev) => (prev && prev.id === order.id ? { ...prev, isTest: next } : prev));
      toast({
        title: next ? "Marked as a test" : "Marked as a real order",
        description: next ? "It no longer counts towards your figures." : "It counts towards your figures again.",
      });
    } catch {
      toast({ variant: "destructive", title: "Could not change that order" });
    } finally {
      setIsBusy(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteDoc(doc(firestore, "users", orderToDelete.userId, "orders", orderToDelete.id));
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      setSelectedOrder(null);
      toast({ title: "Order record deleted" });
    } catch {
      toast({ variant: "destructive", title: "Could not delete that order" });
    } finally {
      setOrderToDelete(null);
    }
  };

  const handleResendConfirmation = async (order: AdminOrder) => {
    if (!order.shippingInfo?.email) return;
    setIsBusy(true);
    try {
      await sendOrderConfirmationEmail(
        {
          to: order.shippingInfo.email,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
          totalAmount: order.totalAmount,
          items: order.items,
          shippingInfo: order.shippingInfo,
          storeName: settings?.storeName,
          fromEmail: resolveSenderEmail(settings),
          replyTo: resolveReplyToEmail(settings),
        },
        firestore
      );
      toast({ title: "Receipt sent to the customer", description: order.shippingInfo.email });
    } catch {
      toast({ variant: "destructive", title: "Could not send that receipt" });
    } finally {
      setIsBusy(false);
    }
  };

  /** Re-send the order to the owners. The recovery path when email went wrong. */
  const handleSendAdminNotification = async (order: AdminOrder) => {
    const recipients = resolveAdminRecipients(settings);
    setIsBusy(true);
    try {
      const mail = await sendAdminOrderNotification(
        {
          to: recipients,
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderDate: order.orderDate?.toDate ? order.orderDate.toDate() : undefined,
          customerName:
            `${order.shippingInfo?.firstName ?? ""} ${order.shippingInfo?.lastName ?? ""}`.trim() || "Customer",
          totalAmount: order.totalAmount,
          items: order.items,
          shippingInfo: order.shippingInfo,
          storeName: settings?.storeName,
          fromEmail: resolveSenderEmail(settings),
          ...(order.shippingInfo?.email ? { replyTo: order.shippingInfo.email } : {}),
        },
        firestore
      );

      // Dot paths so the automatic flow's own record is left intact.
      if (order.userId && mail?.id) {
        await updateDoc(doc(firestore, "users", order.userId, "orders", order.id), {
          "emailStatus.resentAdminMailId": mail.id,
          "emailStatus.resentAt": new Date(),
        });
      }

      toast({ title: "Order emailed to you", description: recipients.join(", ") });
      fetchAllOrders();
    } catch {
      toast({ variant: "destructive", title: "Could not email that order" });
    } finally {
      setIsBusy(false);
    }
  };

  const invoiceHref = (order: AdminOrder) =>
    `/api/invoice?orderId=${encodeURIComponent(order.id)}&uid=${encodeURIComponent(order.userId)}`;

  return (
    <div className="space-y-6">
      {/* The numbers worth acting on, before any list. */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="To pack"
          value={String(totals.toPack)}
          hint={totals.toPack > 0 ? "Paid for and waiting" : "Nothing waiting"}
          tone={totals.toPack > 0 ? "good" : undefined}
        />
        <StatTile
          label="Earned (30 days)"
          value={money(totals.revenue30Days)}
          hint={
            totals.revenue30Days > 0
              ? "Real paid orders only"
              : totals.lastPaidAt
                ? `Nothing recent · last paid ${totals.lastPaidAt.toLocaleDateString("en-ZA", { dateStyle: "medium" })}`
                : "No real orders yet"
          }
        />
        <StatTile
          label="Didn't pay"
          value={
            totals.abandonRate == null ? "—" : `${Math.round(totals.abandonRate * 100)}%`
          }
          hint={`${totals.unpaidCount} of ${totals.unpaidCount + totals.paidCount} real checkouts`}
          tone={totals.abandonRate != null && totals.abandonRate > 0.7 ? "bad" : undefined}
        />
        <StatTile
          label="You weren't told"
          value={String(totals.missedNotifications)}
          hint="Paid orders with no notification"
          tone={totals.missedNotifications > 0 ? "bad" : undefined}
        />
      </div>

      {totals.testCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
          <span>
            {totals.testCount} test order{totals.testCount === 1 ? "" : "s"} {showTests ? "shown" : "hidden"}. The
            figures above ignore them.
          </span>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowTests((v) => !v)}>
            {showTests ? "Hide test orders" : "Show test orders"}
          </Button>
        </div>
      )}

      {totals.missedNotifications > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {totals.missedNotifications} paid order{totals.missedNotifications === 1 ? "" : "s"} never reached your inbox
          </AlertTitle>
          <AlertDescription>
            The money came through but no email went out. Open each one and use <strong>Email this to me</strong> to get
            the details now. If this keeps happening, the{" "}
            <Link href="/admin/email-log" className="underline">
              email log
            </Link>{" "}
            shows why.
          </AlertDescription>
        </Alert>
      )}

      {totals.abandonRate != null && totals.abandonRate > 0.7 && totals.unpaidCount >= 3 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {Math.round(totals.abandonRate * 100)}% of people who tried to pay did not finish
          </AlertTitle>
          <AlertDescription>
            Every order under <strong>Not paid</strong> is someone who wanted the product enough to reach the payment
            page and then stopped. That many is not normal, and it points at the checkout or the payment provider rather
            than at a lack of interest. Two things worth checking: that PayFast is set to notify{" "}
            <code className="text-xs">/api/payfast-itn</code>, and whether the same people come back and succeed later.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>{activeGroup.blurb}</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAllOrders} disabled={isLoading}>
              <RefreshCw className={"mr-2 h-3 w-3 " + (isLoading ? "animate-spin" : "")} />
              Refresh
            </Button>
          </div>

          <Tabs value={group} onValueChange={(v) => setGroup(v as OrderGroup)}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {ORDER_GROUPS.map((g) => (
                <TabsTrigger key={g.id} value={g.id} className="whitespace-nowrap">
                  {g.label}
                  <span className="ml-1.5 text-xs text-muted-foreground">({groupCounts[g.id] ?? 0})</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number, name, email, town or product"
              className="pl-8"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && <p className="py-8 text-center text-muted-foreground">Loading orders…</p>}

          {!isLoading && visible.length === 0 && (
            <div className="rounded-md border-2 border-dashed py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <p className="mt-2 text-muted-foreground">
                {search ? `Nothing here matches “${search}”.` : activeGroup.empty}
              </p>
            </div>
          )}

          {/* One responsive list rather than a table, so it stays readable on a phone. */}
          <div className="space-y-2">
            {!isLoading &&
              visible.map((order) => {
                const status = describeOrderStatus(order.status);
                const email = describeOrderEmail(order, mailById, loadedAt);
                const action = nextStatusAction(order.status);
                const waiting = daysWaiting(order, loadedAt);
                const isStale = order.status === "Processing" && waiting !== null && waiting > 14;

                return (
                  <div
                    key={order.id}
                    className={
                      "rounded-md border p-3 transition-colors hover:bg-muted/40 " +
                      (order.isTest
                        ? "border-dashed opacity-60 "
                        : email.isProblem
                          ? "border-destructive/40 bg-destructive/5 "
                          : "")
                    }
                  >
                    <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="min-w-[180px] flex-1 text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">{formatOrderRef(order)}</span>
                          <Badge variant={status.variant} className="whitespace-nowrap text-[10px]">
                            {status.label}
                          </Badge>
                          {order.isTest && (
                            <Badge variant="outline" className="whitespace-nowrap text-[10px]">
                              Test
                            </Badge>
                          )}
                        </div>
                        <div className="mt-0.5 text-sm">
                          {order.shippingInfo?.firstName} {order.shippingInfo?.lastName}
                          {order.shippingInfo?.city && (
                            <span className="text-muted-foreground"> · {order.shippingInfo.city}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {orderDate(order)} · {summariseItems(order.items)}
                          {isStale && (
                            <span className="text-destructive"> · waiting {waiting} days</span>
                          )}
                        </div>
                      </button>

                      <div className="text-right">
                        <div className="font-bold">{money(order.totalAmount)}</div>
                        <Badge variant={email.variant} className="mt-1 whitespace-nowrap text-[10px]">
                          {email.label}
                        </Badge>
                      </div>

                      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                        {action && (
                          <Button size="sm" disabled={isBusy} onClick={() => handleStatusChange(order, action.next)}>
                            {action.label}
                          </Button>
                        )}
                        {email.offerResend && !order.isTest && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => handleSendAdminNotification(order)}
                          >
                            <Mail className="mr-1.5 h-3 w-3" />
                            Email this to me
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Everything about one order, including the things that can go wrong. */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order {selectedOrder ? formatOrderRef(selectedOrder) : ""}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5 py-2">
              <div className="rounded-md border bg-muted/30 p-3">
                <Badge variant={describeOrderStatus(selectedOrder.status).variant}>
                  {describeOrderStatus(selectedOrder.status).label}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  {describeOrderStatus(selectedOrder.status).help}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Send it to
                </h3>
                <div className="space-y-1.5 rounded-md border p-3 text-sm">
                  <p className="font-medium">
                    {selectedOrder.shippingInfo?.firstName} {selectedOrder.shippingInfo?.lastName}
                  </p>
                  <p className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      {selectedOrder.shippingInfo?.address}, {selectedOrder.shippingInfo?.city},{" "}
                      {selectedOrder.shippingInfo?.postalCode}
                    </span>
                  </p>
                  {selectedOrder.shippingInfo?.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <a href={`tel:${selectedOrder.shippingInfo.phone}`} className="text-primary underline">
                        {selectedOrder.shippingInfo.phone}
                      </a>
                    </p>
                  )}
                  {selectedOrder.shippingInfo?.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <a
                        href={`mailto:${selectedOrder.shippingInfo.email}`}
                        className="break-all text-primary underline"
                      >
                        {selectedOrder.shippingInfo.email}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  What to pack
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                        <TableCell className="text-right">{money(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} className="font-bold">
                        Total paid
                      </TableCell>
                      <TableCell className="text-right font-bold">{money(selectedOrder.totalAmount)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Did you get told about this order?
                </h3>
                {(() => {
                  const email = describeOrderEmail(selectedOrder, mailById, loadedAt);
                  return (
                    <div className="rounded-md border p-3">
                      <Badge variant={email.variant}>{email.label}</Badge>
                      <p className="mt-2 text-sm text-muted-foreground">{email.help}</p>
                    </div>
                  );
                })()}
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href={invoiceHref(selectedOrder)} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-1.5 h-3 w-3" />
                    Print invoice
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => handleSendAdminNotification(selectedOrder)}
                >
                  <Mail className="mr-1.5 h-3 w-3" />
                  Email this to me
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isBusy || !selectedOrder.shippingInfo?.email}
                  onClick={() => handleResendConfirmation(selectedOrder)}
                >
                  Send receipt to customer
                </Button>
              </div>

              <div className="space-y-2 rounded-md border border-dashed p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Change this order
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(val) => handleStatusChange(selectedOrder, val)}
                  >
                    <SelectTrigger className="h-9 w-[190px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {describeOrderStatus(opt).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleToggleTest(selectedOrder)}
                  >
                    <FlaskConical className="mr-1.5 h-3 w-3" />
                    {selectedOrder.isTest ? "This is a real order" : "This was a test"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setOrderToDelete(selectedOrder)}
                  >
                    <Trash2 className="mr-1.5 h-3 w-3" />
                    Delete this record
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Marking an order <strong>sent</strong> or <strong>delivered</strong> emails the customer
                  automatically. Marking one as a <strong>test</strong> keeps the record but leaves it out of your
                  figures — better than deleting it.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete order {orderToDelete ? formatOrderRef(orderToDelete) : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the record of this order, including what was bought and where it was going. It
              does not refund anything. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
