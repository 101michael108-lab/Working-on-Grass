
"use client";
import React, { useState, useEffect } from "react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, getDocs, orderBy, collection, doc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Eye, Package, Truck, CheckCircle, XCircle, Mail, Send } from "lucide-react";
import type { Order, User, SiteSettings } from "@/lib/types";
import { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail } from "@/services/email-service";

const statusOptions = ['Pending', 'Processing', 'Shipped', 'Fulfilled', 'Delivered', 'Cancelled'] as const;

const getStatusVariant = (status: Order['status']): "secondary" | "default" | "success" | "destructive" | "outline" => {
    switch (status) {
        case 'Pending':
            return 'secondary';
        case 'Processing':
        case 'Shipped':
            return 'default';
        case 'Fulfilled':
        case 'Delivered':
            return 'success';
        case 'Cancelled':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [orders, setOrders] = useState<(Order & { customerName?: string; userId: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<(Order & { customerName?: string }) | null>(null);

    // Fetch settings for email templates
    const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
    const { data: settings } = useDoc<SiteSettings>(settingsRef);

    const fetchAllOrders = async () => {
        if (!firestore) return;
        setIsLoading(true);
        
        try {
            const userMap = new Map<string, string>();
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            usersSnapshot.forEach(doc => {
                const userData = doc.data() as User;
                userMap.set(doc.id, userData.displayName);
            });

            const ordersQuery = query(collectionGroup(firestore, 'orders'), orderBy('orderDate', 'desc'));
            const ordersSnapshot = await getDocs(ordersQuery);
            
            const allOrders = ordersSnapshot.docs.map(doc => {
                const orderData = doc.data() as Omit<Order, 'id'>;
                const customerName = userMap.get(orderData.userId) || 'Unknown User';
                
                return {
                    ...orderData,
                    id: doc.id,
                    customerName: customerName,
                    userId: orderData.userId,
                };
            });

            setOrders(allOrders);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();
    }, [firestore]);

    const handleStatusChange = async (orderId: string, userId: string, newStatus: string) => {
        const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
        updateDocumentNonBlocking(orderRef, { status: newStatus });
        
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o);
        setOrders(updatedOrders);
        
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
        }

        // Trigger notification email if it's a meaningful transition
        if (['Shipped', 'Delivered', 'Cancelled'].includes(newStatus)) {
            const order = updatedOrders.find(o => o.id === orderId);
            if (order && order.shippingInfo?.email) {
                sendOrderStatusUpdateEmail({
                    to: order.shippingInfo.email,
                    orderId: orderId,
                    customerName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
                    newStatus: newStatus,
                    storeName: settings?.storeName
                }, firestore);
            }
        }

        toast({ title: "Status Updated", description: `Order status set to ${newStatus}. Customer notified via email.` });
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
            }, firestore);
            toast({ title: "Email Queued", description: "The confirmation email has been rewritten to the mail collection." });
        } catch (e) {
            toast({ variant: "destructive", title: "Failed to queue email." });
        } finally {
            setIsSendingEmail(false);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Orders</CardTitle>
                    <CardDescription>Monitor payments and manage fulfillment statuses.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p>Loading all orders...</p>}
                    {!isLoading && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                                        <TableCell className="font-medium">{order.customerName}</TableCell>
                                        <TableCell>{order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Select 
                                                    defaultValue={order.status} 
                                                    onValueChange={(val) => handleStatusChange(order.id, order.userId, val)}
                                                >
                                                    <SelectTrigger className="h-8 w-[130px] text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusOptions.map(opt => (
                                                            <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">R{order.totalAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Order Details: #{selectedOrder?.id.substring(0, 8)}</DialogTitle>
                        <DialogDescription>Customer and shipping information for fulfillment.</DialogDescription>
                    </DialogHeader>
                    
                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shipping Address</h4>
                                    <div className="text-sm font-body bg-muted/30 p-3 rounded border">
                                        <p className="font-bold">{selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}</p>
                                        <p>{selectedOrder.shippingInfo.address}</p>
                                        <p>{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.postalCode}</p>
                                        <p>{selectedOrder.shippingInfo.country}</p>
                                        <p className="mt-2 text-primary">{selectedOrder.shippingInfo.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status & Payment</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getStatusVariant(selectedOrder.status)} className="text-sm px-3">{selectedOrder.status}</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Ordered: {new Date(selectedOrder.orderDate.toDate()).toLocaleString()}
                                        </div>
                                        <div className="text-sm font-bold">
                                            Total Paid: R{selectedOrder.totalAmount.toFixed(2)}
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full text-xs"
                                            disabled={isSendingEmail}
                                            onClick={() => handleResendConfirmation(selectedOrder)}
                                        >
                                            <Send className="mr-2 h-3 w-3" /> Resend Confirmation Email
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ordered Items</h4>
                                <div className="border rounded overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="h-8">Item</TableHead>
                                                <TableHead className="h-8 text-center">Qty</TableHead>
                                                <TableHead className="h-8 text-right">Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedOrder.items.map((item, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="py-2 text-sm font-medium">{item.name}</TableCell>
                                                    <TableCell className="py-2 text-center text-sm">{item.quantity}</TableCell>
                                                    <TableCell className="py-2 text-right text-sm">R{item.price.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                                {selectedOrder.status === 'Processing' && (
                                    <Button onClick={() => handleStatusChange(selectedOrder.id, selectedOrder.userId, 'Shipped')}>
                                        <Truck className="mr-2 h-4 w-4" /> Mark as Shipped
                                    </Button>
                                )}
                                {selectedOrder.status === 'Shipped' && (
                                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(selectedOrder.id, selectedOrder.userId, 'Delivered')}>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Delivered
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
