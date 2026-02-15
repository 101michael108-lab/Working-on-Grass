
"use client"

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useDoc, useFirestore, useMemoFirebase, initializeFirebase } from "@/firebase";
import { doc, addDoc, collection } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { SiteSettings } from "@/lib/types";
import { Mail, Send, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
  const { data: settings, isLoading } = useDoc<SiteSettings>(settingsRef);

  const [formData, setFormData] = React.useState<SiteSettings>({
    storeName: "Working on Grass",
    contactEmail: "courses@alut.co.za",
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
        shippingFee: settings.shippingFee || 150,
        payfastMerchantId: settings.payfastMerchantId || "",
        payfastMerchantKey: settings.payfastMerchantKey || "",
        isLiveMode: settings.isLiveMode || false,
      });
    }
  }, [settings]);

  const handleSave = () => {
    setDocumentNonBlocking(settingsRef, formData, { merge: true });
    toast({ title: "Settings Saved", description: "Global site configuration has been updated." });
  };

  const handleSendTestEmail = async () => {
    setIsTestingEmail(true);
    try {
        const mailCollection = collection(firestore, 'mail');
        await addDoc(mailCollection, {
            to: formData.contactEmail,
            message: {
                subject: `Test Email | ${formData.storeName}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: #1a3a1a;">Firebase Trigger Email Test</h2>
                        <p>This is a test email sent from your <strong>Working on Grass</strong> Admin Dashboard.</p>
                        <p>If you are reading this, it means your Firestore 'mail' collection is correctly linked to your SMTP provider via the Firebase Extension.</p>
                        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #94a3b8;">Sent at: ${new Date().toLocaleString()}</p>
                    </div>
                `,
                text: `This is a test email from ${formData.storeName} admin to verify the Trigger Email extension.`
            }
        });
        toast({ 
            title: "Test Email Queued", 
            description: `Check your Firestore 'mail' collection and the inbox for ${formData.contactEmail}.` 
        });
    } catch (e: any) {
        console.error(e);
        toast({ 
            variant: "destructive", 
            title: "Test Failed", 
            description: "Could not write to 'mail' collection. Check your security rules." 
        });
    } finally {
        setIsTestingEmail(false);
    }
  }

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[300px] w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-8">
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
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">PayFast API Integration</h3>
                        <p className="text-sm text-muted-foreground">
                            Enter your credentials from the PayFast dashboard.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 bg-secondary/50 p-3 rounded-lg border">
                        <Label htmlFor="live-mode" className="font-bold text-xs uppercase tracking-widest">
                            {formData.isLiveMode ? 'Live Mode Active' : 'Sandbox Mode'}
                        </Label>
                        <Switch 
                            id="live-mode" 
                            checked={formData.isLiveMode} 
                            onCheckedChange={(checked) => setFormData(p => ({ ...p, isLiveMode: checked }))}
                        />
                    </div>
                </div>
                
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
                <div className="flex items-start gap-2 text-[10px] text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <p>
                        <strong>Note:</strong> Ensure your PayFast Passphrase is set in your environment variables (PAYFAST_PASSPHRASE) for security validation.
                    </p>
                </div>
            </div>
            <div className="pt-4 border-t flex justify-end">
                <Button onClick={handleSave} size="lg" className="px-12">Save Changes</Button>
            </div>
        </CardContent>
        </Card>

        {/* Email Extension Debug Section */}
        <Card className="border-primary/20">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <CardTitle>Email Extension Test</CardTitle>
                </div>
                <CardDescription>Verify your Firebase Trigger Email configuration without placing a real order.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-muted/30 p-4 rounded-md space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Clicking the button below will create a document in the <strong>'mail'</strong> collection. 
                        If your extension is working, a test email will be sent to <strong>{formData.contactEmail}</strong>.
                    </p>
                    <Button 
                        variant="outline" 
                        onClick={handleSendTestEmail} 
                        disabled={isTestingEmail}
                        className="w-full sm:w-auto"
                    >
                        <Send className="mr-2 h-4 w-4" />
                        {isTestingEmail ? "Queuing..." : "Send Test Email"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
