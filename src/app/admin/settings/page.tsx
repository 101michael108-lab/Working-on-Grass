
"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
  const { data: settings, isLoading } = useDoc(settingsRef);

  const [formData, setFormData] = React.useState({
    storeName: "Working on Grass",
    contactEmail: "courses@alut.co.za",
    shippingFee: 150,
    payfastMerchantId: "",
    payfastMerchantKey: "",
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "Working on Grass",
        contactEmail: settings.contactEmail || "courses@alut.co.za",
        shippingFee: settings.shippingFee || 150,
        payfastMerchantId: settings.payfastMerchantId || "",
        payfastMerchantKey: settings.payfastMerchantKey || "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    // We use set with merge true to ensure the document exists
    setDocumentNonBlocking(settingsRef, formData, { merge: true });
    toast({ title: "Settings Saved", description: "Global site configuration has been updated." });
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
        </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Site Settings</CardTitle>
        <CardDescription>Manage core store parameters and payment integrations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">General Store Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="store-name">Display Store Name</Label>
                    <Input 
                        id="store-name" 
                        value={formData.storeName} 
                        onChange={(e) => setFormData(p => ({ ...p, storeName: e.target.value }))}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="store-email">Notification / Contact Email</Label>
                    <Input 
                        id="store-email" 
                        type="email" 
                        value={formData.contactEmail} 
                        onChange={(e) => setFormData(p => ({ ...p, contactEmail: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shipping-fee">Flat Rate Shipping Fee (R)</Label>
                    <Input 
                        id="shipping-fee" 
                        type="number" 
                        value={formData.shippingFee} 
                        onChange={(e) => setFormData(p => ({ ...p, shippingFee: Number(e.target.value) }))}
                    />
                    <p className="text-[10px] text-muted-foreground italic">Applied to all orders during checkout.</p>
                </div>
            </div>
        </div>
        
        <Separator />

         <div className="space-y-4">
            <h3 className="text-lg font-semibold">PayFast API Integration</h3>
            <p className="text-sm text-muted-foreground">
                Enter your live credentials from the PayFast dashboard to process real payments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                 <div className="space-y-2">
                    <Label htmlFor="pf-id">Merchant ID</Label>
                    <Input 
                        id="pf-id" 
                        placeholder="e.g. 10000100" 
                        value={formData.payfastMerchantId}
                        onChange={(e) => setFormData(p => ({ ...p, payfastMerchantId: e.target.value }))}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="pf-key">Merchant Key</Label>
                    <Input 
                        id="pf-key" 
                        type="password" 
                        placeholder="••••••••••••••••" 
                        value={formData.payfastMerchantKey}
                        onChange={(e) => setFormData(p => ({ ...p, payfastMerchantKey: e.target.value }))}
                    />
                </div>
            </div>
        </div>
        <div className="pt-4 border-t flex justify-end">
            <Button onClick={handleSave} size="lg" className="px-12">Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}
