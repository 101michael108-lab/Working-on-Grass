"use client";
import { useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useUser();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome, {user?.displayName || 'User'}!</CardTitle>
                    <CardDescription>This is your personal dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>You can view your recent orders and manage your profile settings from here.</p>
                    <div className="flex gap-4">
                        <Button asChild>
                            <Link href="/dashboard/orders">View My Orders</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/shop">Continue Shopping</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}