"use client";
import React, { useState, useEffect } from "react";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, getDocs, orderBy, collection } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order, User } from "@/lib/types";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
    "",
    {
      variants: {
        status: {
          Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
          Processing: "bg-blue-100 text-blue-800 border-blue-200",
          Shipped: "bg-cyan-100 text-cyan-800 border-cyan-200",
          Fulfilled: "bg-green-100 text-green-800 border-green-200",
          Delivered: "bg-green-100 text-green-800 border-green-200",
          Cancelled: "bg-red-100 text-red-800 border-red-200",
        },
      },
      defaultVariants: {},
    }
  )

export default function AdminOrdersPage() {
    const firestore = useFirestore();
    const [orders, setOrders] = useState<(Order & { customerName?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        const fetchAllOrders = async () => {
            setIsLoading(true);
            
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
                };
            });

            setOrders(allOrders);
            setIsLoading(false);
        };

        fetchAllOrders().catch(console.error);
    }, [firestore]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Orders</CardTitle>
                <CardDescription>View and manage all customer orders.</CardDescription>
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
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                    <TableCell>{order.customerName}</TableCell>
                                    <TableCell>{order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={badgeVariants({ status: order.status })}>{order.status}</Badge>
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
