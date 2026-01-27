"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-3xl">Order Successful!</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">
            Thank you for your purchase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>
            Your order has been received and is now being processed. 
            You will receive an email confirmation shortly.
          </p>
          {orderId && (
            <div className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md">
              <p>Your Order ID is:</p>
              <p className="font-mono mt-1">{orderId}</p>
            </div>
          )}
          <div className="flex justify-center gap-4">
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
