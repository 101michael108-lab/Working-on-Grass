
"use client";
import React, { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, getDocs, orderBy, collection, doc, deleteDoc } from "firebase/firestore";
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
import { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail } from "@/services/email-service";

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Fulfilled', 'Delivered', 'Cancelled'] as const;

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [orders, setOrders] = useState<(Order & { customerName?: string; userId: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<(Order & { customerName?: string }) | null>(null);
    const [orderToDelete, setOrderToDelete] = useState<{ id: string; userId: string } | null>(null);

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
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally { setIsLoading(false); }
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
                customerName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
                totalAmount: order.totalAmount,
                items: order.items,
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
                <CardHeader><CardTitle>Manage Orders</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? <p>Loading...</p> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}</TableCell>
                                        <TableCell>{order.customerName}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, order.userId, val)}>
                                                    <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
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
                    <DialogHeader><DialogTitle>Order #{selectedOrder?.id.substring(0, 8)}</DialogTitle></DialogHeader>
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
