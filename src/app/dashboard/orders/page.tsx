"use client";
import React from "react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";
import { cva } from 'class-variance-authority'

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
