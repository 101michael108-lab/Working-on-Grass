"use client";
import React from "react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

    const ordersQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, 'users', user.uid, 'orders'), orderBy('orderDate', 'desc'));
    }, [firestore, user]);

    const { data: orders, isLoading } = useCollection<Omit<Order, 'id'>>(ordersQuery);

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>Here is a list of your past orders.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <p>Loading orders...</p>}
                {!isLoading && (!orders || orders.length === 0) && <p>You have not placed any orders yet.</p>}
                {!isLoading && orders && orders.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                    <TableCell>{order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
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
