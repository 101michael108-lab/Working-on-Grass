
"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { SiteSettings } from "@/lib/types";
import { Mail, Send, Info } from "lucide-react";
import { sendOrderConfirmationEmail } from "@/services/email-service";

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
  const { data: settings, isLoading } = useDoc<SiteSettings>(settingsRef);

  const [formData, setFormData] = React.useState<SiteSettings>({
    storeName: "Working on Grass",
    contactEmail: "courses@alut.co.za",
    senderEmail: "",
    shippingFee: 150,
    payfastMerchantId: "",
    payfastMerchantKey: "",
    isLiveMode: false,
  });

  const [isTestingEmail, setIsTestingEmail] = React.useState(false);

  React.useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "Working on Grass",
        contactEmail: settings.contactEmail || "courses@alut.co.za",
        senderEmail: settings.senderEmail || "",
        shippingFee: settings.shippingFee || 150,
        payfastMerchantId: settings.payfastMerchantId || "",
        payfastMerchantKey: settings.payfastMerchantKey || "",
        isLiveMode: settings.isLiveMode || false,
      });
    }
  }, [settings]);

  const handleSave = () => {
    setDocumentNonBlocking(settingsRef, formData, { merge: true });
    toast({ title: "Settings Saved" });
  };

  const handleSendTestEmail = async () => {
    setIsTestingEmail(true);
    try {
        await sendOrderConfirmationEmail({
            to: formData.contactEmail,
            customerName: "Test User",
            orderId: "TEST-12345",
            totalAmount: 0,
            items: [{ name: "Test Email Service Connection", quantity: 1, price: 0 }],
            storeName: formData.storeName,
            fromEmail: formData.senderEmail,
        }, firestore);
        
        toast({ title: "Test Email Queued", description: `Sent to ${formData.contactEmail}` });
    } catch (e: any) {
        toast({ variant: "destructive", title: "Test Failed" });
    } finally {
        setIsTestingEmail(false);
    }
  }

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-[200px] w-full" /><Skeleton className="h-[300px] w-full" /></div>;

  return (
    <div className="space-y-8">
        <Card>
        <CardHeader><CardTitle>Global Site Settings</CardTitle></CardHeader>
        <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Store Name</Label>
                    <Input value={formData.storeName} onChange={(e) => setFormData(p => ({ ...p, storeName: e.target.value }))}/>
                    <p className="text-[10px] text-muted-foreground italic">Used as the "From Name" in emails.</p>
                </div>
                <div className="space-y-2">
                    <Label>Notification Email (Inquiries)</Label>
                    <Input type="email" value={formData.contactEmail} onChange={(e) => setFormData(p => ({ ...p, contactEmail: e.target.value }))}/>
                    <p className="text-[10px] text-muted-foreground italic">Where you receive contact form submissions.</p>
                </div>
                <div className="space-y-2">
                    <Label>Sender Email Address</Label>
                    <Input type="email" value={formData.senderEmail} placeholder="e.g. admin@workingongrass.co.za" onChange={(e) => setFormData(p => ({ ...p, senderEmail: e.target.value }))}/>
                    <p className="text-[10px] text-muted-foreground italic">Optional. Leave blank to use the default from your Firebase Console.</p>
                </div>
                <div className="space-y-2"><Label>Shipping Fee (R)</Label><Input type="number" value={formData.shippingFee} onChange={(e) => setFormData(p => ({ ...p, shippingFee: Number(e.target.value) }))}/></div>
            </div>
            
            <Separator />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div><h3 className="text-lg font-semibold">PayFast API</h3></div>
                    <div className="flex items-center space-x-2 bg-secondary/50 p-3 rounded border">
                        <Label className="text-xs font-bold uppercase">{formData.isLiveMode ? 'Live' : 'Sandbox'}</Label>
                        <Switch checked={formData.isLiveMode} onCheckedChange={(checked) => setFormData(p => ({ ...p, isLiveMode: checked }))}/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2"><Label>Merchant ID</Label><Input value={formData.payfastMerchantId} onChange={(e) => setFormData(p => ({ ...p, payfastMerchantId: e.target.value }))}/></div>
                    <div className="space-y-2"><Label>Merchant Key</Label><Input type="password" value={formData.payfastMerchantKey} onChange={(e) => setFormData(p => ({ ...p, payfastMerchantKey: e.target.value }))}/></div>
                </div>
            </div>
            <div className="pt-4 border-t flex justify-end"><Button onClick={handleSave} size="lg" className="px-12">Save Changes</Button></div>
        </CardContent>
        </Card>

        <Card className="border-primary/20">
            <CardHeader><div className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /><CardTitle>Email Extension Test</CardTitle></div></CardHeader>
            <CardContent>
                <div className="bg-muted/30 p-4 rounded-md space-y-4 text-sm">
                    <div className="flex items-start gap-2 mb-2">
                        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p>This creates a document in your 'mail' collection. If your Firebase Trigger Email extension is configured correctly, it will send a receipt to <strong>{formData.contactEmail}</strong>.</p>
                    </div>
                    <Button variant="outline" onClick={handleSendTestEmail} disabled={isTestingEmail}><Send className="mr-2 h-4 w-4" />{isTestingEmail ? "Queuing..." : "Send Test Email"}</Button>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
