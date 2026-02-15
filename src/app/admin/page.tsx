
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFirestore } from "@/firebase";
import { collectionGroup, query, getDocs, orderBy, collection, limit } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, MessageSquare } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order, User, Inquiry } from "@/lib/types";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

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
        <Card className="h-full">
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
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.customerName}</TableCell>
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
    )
}


export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const [revenueData, setRevenueData] = useState<{ day: string; revenue: number }[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    userCount: 0,
    lowStockCount: 0,
    inquiryCount: 0,
  });

  useEffect(() => {
    if (!firestore) return;

    const fetchData = async () => {
        // Fetch all orders for revenue and count
        const ordersSnapshot = await getDocs(collectionGroup(firestore, 'orders'));
        let totalRev = 0;
        const revMap: Record<string, number> = {};

        ordersSnapshot.docs.forEach(doc => {
            const data = doc.data() as Order;
            if (data.status !== 'Cancelled') {
                totalRev += data.totalAmount;
                const date = new Date(data.orderDate.toDate()).toLocaleDateString('en-US', { weekday: 'short' });
                revMap[date] = (revMap[date] || 0) + data.totalAmount;
            }
        });

        // Fetch user count
        const usersSnapshot = await getDocs(collection(firestore, 'users'));
        
        // Fetch low stock count
        const productsSnapshot = await getDocs(collection(firestore, 'products'));
        const lowStock = productsSnapshot.docs.filter(d => (d.data().stock || 0) <= 5).length;

        // Fetch inquiries count
        const contactSnap = await getDocs(collection(firestore, 'contactFormEntries'));
        const consultSnap = await getDocs(collection(firestore, 'consultationRequests'));

        setStats({
            totalRevenue: totalRev,
            orderCount: ordersSnapshot.size,
            userCount: usersSnapshot.size,
            lowStockCount: lowStock,
            inquiryCount: contactSnap.size + consultSnap.size
        });

        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        setRevenueData(days.map(d => ({ day: d, revenue: revMap[d] || 0 })));
    };

    fetchData().catch(console.error);
  }, [firestore]);

  const dashboardStats = [
    { title: "Total Revenue", value: `R${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, change: "Since inception", color: "text-green-600" },
    { title: "New Leads", value: stats.inquiryCount.toString(), icon: MessageSquare, change: "Service inquiries", color: "text-orange-600" },
    { title: "Registered Users", value: stats.userCount.toString(), icon: Users, change: "All time", color: "text-purple-600" },
    { title: "Low Stock Items", value: stats.lowStockCount.toString(), icon: Package, change: "Needs attention", color: stats.lowStockCount > 0 ? "text-red-600" : "text-muted-foreground" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            <TrendingUp className="h-4 w-4 text-primary" />
            Live Updates Enabled
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Insights</CardTitle>
            <CardDescription>Sales performance across the current week.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                data={revenueData}
                margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  hide
                  domain={['auto', 'auto']}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="revenue"
                  type="natural"
                  fill="var(--color-revenue)"
                  fillOpacity={0.1}
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <div className="lg:col-span-3">
            <RecentOrders />
        </div>
      </div>
    </div>
  )
}
