
"use client";
import React, { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collectionGroup, query, getDocs, orderBy, collection, doc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import type { Order, User } from "@/lib/types";

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

    const fetchAllOrders = async () => {
        if (!firestore) return;
        setIsLoading(true);
        
        try {
            // 1. Fetch all users to create a name map
            const userMap = new Map<string, string>();
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            usersSnapshot.forEach(doc => {
                const userData = doc.data() as User;
                userMap.set(doc.id, userData.displayName);
            });

            // 2. Fetch all orders using a collection group query
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

    const handleStatusChange = (orderId: string, userId: string, newStatus: string) => {
        const orderRef = doc(firestore, 'users', userId, 'orders', orderId);
        updateDocumentNonBlocking(orderRef, { status: newStatus });
        
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        toast({ title: "Status Updated", description: `Order ${orderId.substring(0, 8)} set to ${newStatus}.` });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Orders</CardTitle>
                <CardDescription>View and update the fulfillment status of customer orders.</CardDescription>
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
                                <TableHead>Update Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                                    <TableCell>{order.customerName}</TableCell>
                                    <TableCell>{order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                    <TableCell className="text-right">R{order.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
