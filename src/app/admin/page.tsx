"use client";

import React, { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { collectionGroup, query, getDocs, orderBy, collection, limit } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order, User } from "@/lib/types";

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

function RecentOrders() {
    const firestore = useFirestore();
    const [orders, setOrders] = useState<(Order & { customerName?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firestore) return;

        const fetchRecentOrders = async () => {
            setIsLoading(true);
            
            const userMap = new Map<string, string>();
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            usersSnapshot.forEach(doc => {
                const userData = doc.data() as User;
                userMap.set(doc.id, userData.displayName);
            });

            const ordersQuery = query(collectionGroup(firestore, 'orders'), orderBy('orderDate', 'desc'), limit(5));
            const ordersSnapshot = await getDocs(ordersQuery);
            
            const recentOrders = ordersSnapshot.docs.map(doc => {
                const orderData = doc.data() as Omit<Order, 'id'>;
                const customerName = userMap.get(orderData.userId) || 'Unknown User';
                
                return {
                    ...orderData,
                    id: doc.id,
                    customerName: customerName,
                };
            });

            setOrders(recentOrders);
            setIsLoading(false);
        };

        fetchRecentOrders().catch(console.error);
    }, [firestore]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>A list of the 5 most recent orders.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <p>Loading recent orders...</p>}
                {!isLoading && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.customerName}</TableCell>
                                     <TableCell>
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                    </TableCell>
                                    <TableCell>{order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="text-right">R{order.totalAmount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}


export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Revenue", value: "R125,430.00", icon: DollarSign, change: "+20.1% from last month" },
    { title: "Orders", value: "+1,234", icon: ShoppingCart, change: "+180.1% from last month" },
    { title: "New Users", value: "+230", icon: Users, change: "+35 from last month" },
    { title: "Products in Stock", value: "89", icon: Package, change: "2 new products added" },
  ]
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="mt-8">
        <RecentOrders />
       </div>
    </div>
  )
}
