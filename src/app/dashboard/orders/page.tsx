
"use client";
import React, { useState } from "react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Eye, Package, MapPin } from "lucide-react";
import type { Order } from "@/lib/types";

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

export default function UserOrdersPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const ordersQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'users', user.uid, 'orders'), orderBy('orderDate', 'desc'));
    }, [firestore, user]);

    const { data: orders, isLoading } = useCollection<Omit<Order, 'id'>>(ordersQuery);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                    <CardDescription>View your order history and track fulfillment status.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <p>Loading orders...</p>}
                    {!isLoading && (!orders || orders.length === 0) && (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                            <p className="mt-2 text-muted-foreground">You haven't placed any orders yet.</p>
                        </div>
                    )}
                    {!isLoading && orders && orders.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">R{order.totalAmount.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order as Order)}>
                                                <Eye className="h-4 w-4 mr-2" /> Details
                                            </Button>
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
                    <DialogHeader>
                        <DialogTitle>Order Details: #{selectedOrder?.id.substring(0, 8)}</DialogTitle>
                        <DialogDescription>
                            Placed on {selectedOrder?.orderDate ? new Date(selectedOrder.orderDate.toDate()).toLocaleString() : 'N/A'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    {selectedOrder && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Shipping Address
                                    </h4>
                                    <div className="text-sm bg-muted/30 p-3 rounded border">
                                        <p className="font-bold">{selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}</p>
                                        <p>{selectedOrder.shippingInfo.address}</p>
                                        <p>{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.postalCode}</p>
                                        <p>{selectedOrder.shippingInfo.country}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order Status</h4>
                                    <div className="flex flex-col gap-2">
                                        <Badge variant={getStatusVariant(selectedOrder.status)} className="w-fit text-sm px-3">
                                            {selectedOrder.status}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground italic">
                                            {selectedOrder.status === 'Pending' && "Your payment is being verified."}
                                            {selectedOrder.status === 'Processing' && "We are preparing your package for dispatch."}
                                            {selectedOrder.status === 'Shipped' && "Your package is with the courier."}
                                            {selectedOrder.status === 'Delivered' && "Order has been successfully delivered."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Items Purchased</h4>
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
                                <div className="flex justify-end pt-2">
                                    <div className="text-right">
                                        <p className="text-sm font-bold">Total Paid: R{selectedOrder.totalAmount.toFixed(2)}</p>
                                        <p className="text-[10px] text-muted-foreground">Includes shipping & taxes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
