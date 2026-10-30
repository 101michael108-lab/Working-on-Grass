"use client";
import React, { useState, useEffect } from "react";
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
  where,
  type Firestore,
} from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Eye, Trash2, Send } from "lucide-react";
import type { Order, User, SiteSettings } from "@/lib/types";
import { formatOrderRef } from "@/lib/order-number";
import { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail } from "@/services/email-service";
import {
  describeQueuedMail,
  formatDateTime,
  type MailDoc,
  type OrderEmailStatus,
} from "@/lib/mail-delivery";

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Fulfilled', 'Delivered', 'Cancelled'] as const;

/** Statuses the ITN treats as "already paid for and processed". */
const PROCESSED_STATUSES: ReadonlySet<string> = new Set(['Processing', 'Shipped', 'Fulfilled', 'Delivered']);

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
    const snap = await getDocs(query(collection(firestore, 'mail'), where(documentId(), 'in', chunk)));
    snap.forEach((d) => resolved.set(d.id, { ...(d.data() as Omit<MailDoc, 'id'>), id: d.id }));
  }

  return resolved;
}

/**
 * Per-order email verdict. An order with no `emailStatus.queuedAt` never
 * reached the ITN's email block; one that did and whose mail doc reads ERROR
 * was rejected by the Trigger Email extension's SMTP server. Pending orders are
 * deliberately not flagged — an abandoned checkout correctly has no emails.
 */
function OrderEmailCell({
  order,
  mailById,
  now,
}: {
  order: Order;
  mailById: Map<string, MailDoc>;
  now: Date;
}) {
  const emailStatus = order.emailStatus;

  if (!emailStatus?.queuedAt) {
    const wasProcessed = PROCESSED_STATUSES.has(order.status);
    return (
      <div className="text-[11px] leading-tight">
        <Badge
          variant={wasProcessed ? 'destructive' : order.status === 'Cancelled' ? 'outline' : 'secondary'}
          className="whitespace-nowrap"
        >
          Not queued
        </Badge>
        <span className="mt-1 block text-muted-foreground">
          {wasProcessed
            ? 'processed without queueing email'
            : order.status === 'Cancelled'
              ? 'order cancelled'
              : 'no paid-order ITN received'}
        </span>
      </div>
    );
  }

  const admin = describeQueuedMail(emailStatus.adminMailId, mailById.get(emailStatus.adminMailId || ''), now);
  const customer = describeQueuedMail(
    emailStatus.customerMailId,
    mailById.get(emailStatus.customerMailId || ''),
    now
  );

  return (
    <div className="space-y-1 text-[11px] leading-tight">
      <div className="flex items-center gap-1.5">
        <span className="w-10 text-muted-foreground">Admin</span>
        <Badge variant={admin.variant} className="whitespace-nowrap px-1.5 py-0 text-[10px]">
          {admin.label}
        </Badge>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-10 text-muted-foreground">Cust.</span>
        <Badge variant={customer.variant} className="whitespace-nowrap px-1.5 py-0 text-[10px]">
          {customer.label}
        </Badge>
      </div>
      {emailStatus.emailError && <span className="block text-destructive">queueing threw</span>}
    </div>
  );
}

/** Full email-delivery breakdown for one order, shown in the detail dialog. */
function OrderEmailDetail({
  emailStatus,
  mailById,
  now,
}: {
  emailStatus: OrderEmailStatus | undefined;
  mailById: Map<string, MailDoc>;
  now: Date;
}) {
  if (!emailStatus?.queuedAt) {
    return (
      <div className="rounded border border-dashed p-3 text-xs text-muted-foreground">
        No emails were ever queued for this order. The PayFast ITN writes this marker the moment it moves an order
        off <strong>Pending</strong>, so its absence means no completed-payment notification reached{' '}
        <code>/api/payfast-itn</code> for this order.
      </div>
    );
  }

  const rows: Array<{ label: string; mailId?: string | null; to?: string | null }> = [
    { label: 'Admin notification', mailId: emailStatus.adminMailId, to: emailStatus.adminTo },
    { label: 'Customer confirmation', mailId: emailStatus.customerMailId, to: emailStatus.customerTo },
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Queued {formatDateTime(emailStatus.queuedAt)}</p>
      {rows.map(({ label, mailId, to }) => {
        const badge = describeQueuedMail(mailId, mailById.get(mailId || ''), now);
        return (
          <div key={label} className="rounded border p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{label}</span>
              <Badge variant={badge.variant} className="whitespace-nowrap">
                {badge.label}
              </Badge>
            </div>
            <p className="mt-1 break-all text-muted-foreground">{to || 'no recipient recorded'}</p>
            {badge.detail && <p className="mt-1 break-words text-muted-foreground">{badge.detail}</p>}
            {mailId && <p className="mt-1 font-mono text-[10px] text-muted-foreground">mail/{mailId}</p>}
          </div>
        );
      })}
      {emailStatus.emailError && (
        <div className="rounded border border-destructive/50 bg-destructive/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
            Queueing failed {emailStatus.emailErrorAt ? `• ${formatDateTime(emailStatus.emailErrorAt)}` : ''}
          </p>
          <p className="mt-1 break-words font-mono text-xs">{emailStatus.emailError}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Delivery states come from the Trigger Email extension&apos;s writeback —{' '}
        <Link href="/admin/email-log" className="underline">
          see the full email log
        </Link>
        .
      </p>
    </div>
  );
}

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [orders, setOrders] = useState<(Order & { customerName?: string; userId: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<(Order & { customerName?: string }) | null>(null);
    const [orderToDelete, setOrderToDelete] = useState<{ id: string; userId: string } | null>(null);
    // The `mail` documents the orders reference, so each row can show the
    // extension's current delivery state rather than just "we queued it".
    const [mailById, setMailById] = useState<Map<string, MailDoc>>(new Map());
    // Captured per load so staleness is judged against one instant.
    const [loadedAt, setLoadedAt] = useState(() => new Date());

    const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
    const { data: settings } = useDoc<SiteSettings>(settingsRef);

    const fetchAllOrders = async () => {
        if (!firestore) return;
        setIsLoading(true);
        try {
            const userMap = new Map<string, string>();
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            usersSnapshot.forEach(doc => { userMap.set(doc.id, (doc.data() as User).displayName); });

            const ordersSnapshot = await getDocs(query(collectionGroup(firestore, 'orders'), orderBy('orderDate', 'desc')));
            const allOrders = ordersSnapshot.docs.map(doc => {
                const data = doc.data() as Order;
                return {
                    ...data,
                    id: doc.id,
                    customerName: userMap.get(data.userId) || 'Guest',
                    userId: data.userId,
                };
            });
            setOrders(allOrders);

            // Resolve the queued mail docs separately — a failure here must not
            // cost the admin their orders list.
            try {
                const mailIds = allOrders.flatMap((o) => [
                    o.emailStatus?.customerMailId,
                    o.emailStatus?.adminMailId,
                ]);
                setMailById(await fetchMailByIds(firestore, mailIds.filter(Boolean) as string[]));
            } catch (error) {
                console.error("Error resolving queued mail documents:", error);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoadedAt(new Date());
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAllOrders(); }, [firestore]);

    const handleStatusChange = async (orderId: string, userId: string, newStatus: string) => {
        const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
        updateDocumentNonBlocking(orderRef, { status: newStatus });
        
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        
        if (['Shipped', 'Delivered', 'Cancelled'].includes(newStatus)) {
            const order = orders.find(o => o.id === orderId);
            if (order && order.shippingInfo?.email) {
                sendOrderStatusUpdateEmail({
                    to: order.shippingInfo.email,
                    orderId: orderId,
                    orderNumber: order.orderNumber,
                    customerName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
                    newStatus: newStatus,
                    storeName: settings?.storeName,
                    fromEmail: settings?.senderEmail,
                }, firestore);
            }
        }
        toast({ title: "Status Updated" });
    }

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;
        const { id, userId } = orderToDelete;
        const orderRef = doc(firestore, 'users', userId, 'orders', id);
        try {
            await deleteDoc(orderRef);
            setOrders(prev => prev.filter(o => o.id !== id));
            toast({ title: "Order Deleted" });
        } catch (e) {
            toast({ variant: "destructive", title: "Delete Failed" });
        } finally {
            setOrderToDelete(null);
        }
    }

    const handleResendConfirmation = async (order: Order) => {
        if (!order.shippingInfo?.email) return;
        setIsSendingEmail(true);
        try {
            await sendOrderConfirmationEmail({
                to: order.shippingInfo.email,
                orderId: order.id,
                orderNumber: order.orderNumber,
                customerName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
                totalAmount: order.totalAmount,
                items: order.items,
                shippingInfo: order.shippingInfo,
                storeName: settings?.storeName,
                fromEmail: settings?.senderEmail,
            }, firestore);
            toast({ title: "Email Queued" });
        } catch (e: any) {
            toast({ variant: "destructive", title: "Failed to queue email." });
        } finally { setIsSendingEmail(false); }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Orders</CardTitle>
                    <CardDescription>
                        The <strong>Emails</strong> column shows what became of each order&apos;s notifications. &quot;Not
                        queued&quot; means the PayFast notification never reached the server; a state of ERROR means the
                        Trigger Email extension refused the send. Full detail is in the{" "}
                        <Link href="/admin/email-log" className="underline">email log</Link>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Loading...</p> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead>Emails</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs font-bold">{formatOrderRef(order)}</TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, order.userId, val)}>
                                                    <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <OrderEmailCell order={order} mailById={mailById} now={loadedAt} />
                                        </TableCell>
                                        <TableCell className="text-right font-bold">R{order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}><Eye className="h-4 w-4" /></Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:bg-destructive/10" 
                                                    onClick={() => setOrderToDelete({ id: order.id, userId: order.userId })}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Order {selectedOrder ? formatOrderRef(selectedOrder) : ''}</DialogTitle></DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2 text-sm bg-muted/30 p-3 rounded border">
                                    <p className="font-bold">{selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}</p>
                                    <p>{selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.city}</p>
                                    <p className="text-primary">{selectedOrder.shippingInfo.email}</p>
                                </div>
                                <div className="space-y-3">
                                    <Badge className="text-sm px-3">{selectedOrder.status}</Badge>
                                    <Button variant="outline" size="sm" className="w-full text-xs" disabled={isSendingEmail} onClick={() => handleResendConfirmation(selectedOrder)}>
                                        <Send className="mr-2 h-3 w-3" /> Resend Receipt
                                    </Button>
                                </div>
                            </div>
                            <Table>
                                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-center">Qty</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {selectedOrder.items.map((item, i) => (
                                        <TableRow key={i}><TableCell>{item.name}</TableCell><TableCell className="text-center">{item.quantity}</TableCell><TableCell className="text-right">R{item.price.toFixed(2)}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="space-y-2">
                                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Email delivery
                                </h3>
                                <OrderEmailDetail
                                    emailStatus={selectedOrder.emailStatus}
                                    mailById={mailById}
                                    now={loadedAt}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the order record from your database. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Order Record
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
