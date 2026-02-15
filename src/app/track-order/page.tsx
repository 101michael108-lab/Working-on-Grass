
"use client";

import React, { useState } from "react";
import { useFirestore } from "@/firebase";
import { collectionGroup, query, where, getDocs, limit } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Package, MapPin, CheckCircle2, Truck, Clock, AlertTriangle, Copy, Check } from "lucide-react";
import type { Order } from "@/lib/types";
import { Breadcrumbs } from "@/components/breadcrumbs";

const getStatusIcon = (status: Order['status']) => {
    switch (status) {
        case 'Pending': return <Clock className="h-5 w-5 text-muted-foreground" />;
        case 'Processing': return <Package className="h-5 w-5 text-primary" />;
        case 'Shipped': return <Truck className="h-5 w-5 text-primary" />;
        case 'Delivered': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
        case 'Cancelled': return <AlertTriangle className="h-5 w-5 text-destructive" />;
        default: return <Clock className="h-5 w-5" />;
    }
}

export default function TrackOrderPage() {
    const firestore = useFirestore();
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId || !email) return;

        setIsLoading(true);
        setError(null);
        setOrder(null);

        try {
            const ordersQuery = query(
                collectionGroup(firestore, 'orders'), 
                where('shippingInfo.email', '==', email.trim().toLowerCase()),
                limit(10)
            );
            
            const snapshot = await getDocs(ordersQuery);
            const foundOrder = snapshot.docs.find(d => d.id === orderId.trim());

            if (foundOrder) {
                setOrder({ ...foundOrder.data() as Omit<Order, 'id'>, id: foundOrder.id });
            } else {
                setError("Order not found. Please check your Order ID and Email Address.");
            }
        } catch (e: any) {
            console.error(e);
            setError("An error occurred while fetching your order. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    const copyOrderId = () => {
        if (!order) return;
        navigator.clipboard.writeText(order.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="container py-12 md:py-20">
            <Breadcrumbs items={[{ label: "Track Order" }]} />
            
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">Track Your Order</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Enter your Order ID and the email address used during checkout to view your current status.
                    </p>
                </div>

                {!order ? (
                    <Card className="max-w-md mx-auto border-2 shadow-lg">
                        <CardHeader className="bg-muted/30 border-b-2">
                            <CardTitle className="text-xl">Lookup Order</CardTitle>
                            <CardDescription>Found in your confirmation email.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleTrack} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="orderId">Order ID</Label>
                                    <Input 
                                        id="orderId" 
                                        placeholder="e.g. EEa3GLuf..." 
                                        value={orderId} 
                                        onChange={(e) => setOrderId(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input 
                                        id="email" 
                                        type="email"
                                        placeholder="you@example.com" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="p-3 bg-destructive/10 text-destructive text-sm rounded border border-destructive/20 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}
                                <Button type="submit" className="w-full h-12 font-bold" disabled={isLoading}>
                                    {isLoading ? "Searching..." : "Track My Order"}
                                    {!isLoading && <Search className="ml-2 h-4 w-4" />}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary/5 p-6 rounded-lg border-2 border-primary/10">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1">Current Progress</p>
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(order.status)}
                                    <h2 className="text-3xl font-bold font-headline">{order.status}</h2>
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => setOrder(null)} className="border-2">
                                Track Another Order
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="border-2">
                                <CardHeader className="bg-muted/30 border-b-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" /> Order Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-muted-foreground">Order ID</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs">{order.id}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyOrderId}>
                                                {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Placed On</span>
                                        <span className="font-medium">{order.orderDate ? new Date(order.orderDate.toDate()).toLocaleDateString('en-ZA', { dateStyle: 'long' }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Payment Status</span>
                                        <Badge variant="success" className="bg-green-600">Paid Securely</Badge>
                                    </div>
                                    <div className="flex justify-between py-2 font-bold text-lg text-accent">
                                        <span>Total Paid</span>
                                        <span>R{order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2">
                                <CardHeader className="bg-muted/30 border-b-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" /> Delivery Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 font-body">
                                    <div className="bg-secondary/20 p-4 rounded border">
                                        <p className="font-bold text-lg">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                                        <p className="text-muted-foreground">{order.shippingInfo.address}</p>
                                        <p className="text-muted-foreground">{order.shippingInfo.city}, {order.shippingInfo.postalCode}</p>
                                        <p className="text-muted-foreground">{order.shippingInfo.country}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-2">
                            <CardHeader className="bg-muted/30 border-b-2">
                                <CardTitle className="text-lg">Ordered Items</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/10">
                                        <TableRow>
                                            <TableHead className="pl-6">Item</TableHead>
                                            <TableHead className="text-center">Quantity</TableHead>
                                            <TableHead className="text-right pr-6">Price</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="pl-6 font-medium font-headline text-lg">{item.name}</TableCell>
                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                <TableCell className="text-right pr-6 font-bold">R{item.price.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="bg-muted/10 border-t-2 flex justify-between items-center py-4">
                                <p className="text-xs text-muted-foreground italic">Standard shipping is included in the total paid.</p>
                                <p className="font-bold text-accent">R{order.totalAmount.toFixed(2)}</p>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
