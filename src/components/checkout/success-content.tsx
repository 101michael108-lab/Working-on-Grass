
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Copy, Check } from "lucide-react";
import React, { useState } from "react";
import { InvoiceActions } from "@/components/invoice-actions";

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const uid = searchParams.get('uid');
  const invoiceToken = searchParams.get('t');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            You will receive an email confirmation with your invoice attached shortly.
          </p>
          {orderId && (
            <div className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-md border-2 border-dashed">
              <p className="uppercase tracking-widest text-[10px] font-bold mb-2">Order ID for Tracking</p>
              <div className="flex items-center justify-center gap-3">
                <code className="font-mono text-base font-bold text-foreground">{orderId}</code>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={copyToClipboard}
                    title="Copy Order ID"
                >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          {(invoiceToken || (orderId && uid)) && (
            <div className="rounded-md border bg-card p-4">
              <p className="text-sm font-medium mb-3">Your invoice is ready</p>
              <InvoiceActions
                orderId={orderId ?? undefined}
                uid={uid ?? undefined}
                token={invoiceToken ?? undefined}
                className="justify-center"
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              {/* Track Order works for guests (Order ID + email); the dashboard requires an account. */}
              <Link href="/track-order">Track Your Order</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
