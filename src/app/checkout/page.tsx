
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, addDocumentNonBlocking, useAuth, setDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import type { SiteSettings, Product } from "@/lib/types";
import { AlertCircle, ShieldCheck } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(7, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [payfastConfig, setPayfastConfig] = useState<Record<string, string> | null>(null);
  const payfastFormRef = useRef<HTMLFormElement>(null);

  // Fetch settings from Firestore
  const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
  const { data: settings } = useDoc<SiteSettings>(settingsRef);
  
  const shippingFee = settings?.shippingFee ?? 150;
  const payfastUrl = settings?.isLiveMode 
    ? "https://www.payfast.co.za/eng/process" 
    : "https://sandbox.payfast.co.za/eng/process";

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: user?.displayName?.split(' ')[0] || "",
      lastName: user?.displayName?.split(' ')[1] || "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "South Africa",
      agreeToTerms: false,
    },
  });
  
  useEffect(() => {
    if (user && !form.getValues().email) {
        form.reset({
            ...form.getValues(),
            email: user.email || "",
            firstName: user.displayName?.split(' ')[0] || "",
            lastName: user.displayName?.split(' ')[1] || "",
        });
    }
  }, [user, form]);

  useEffect(() => {
    if (payfastConfig && payfastFormRef.current) {
        payfastFormRef.current.submit();
    }
  }, [payfastConfig]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);

    // 1. Final Inventory Check
    try {
        for (const item of cartItems) {
            const prodSnap = await getDoc(doc(firestore, 'products', item.product.id));
            if (prodSnap.exists()) {
                const currentStock = prodSnap.data().stock || 0;
                if (currentStock < item.quantity) {
                    toast({
                        variant: "destructive",
                        title: "Stock mismatch",
                        description: `Sorry, ${item.product.name} just sold out or has insufficient stock. Please update your cart.`
                    });
                    setIsProcessing(false);
                    return;
                }
            }
        }
    } catch (e) {
        console.error("Stock check failed", e);
    }

    let effectiveUser = user;
    
    // 2. Handle Guest Auth
    if (!effectiveUser) {
        try {
            const userCredential = await signInAnonymously(auth);
            effectiveUser = userCredential.user;
            const userDocRef = doc(firestore, 'users', effectiveUser.uid);
            const userData = {
                id: effectiveUser.uid,
                email: values.email,
                displayName: `${values.firstName} ${values.lastName}`,
                role: 'user',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            setDocumentNonBlocking(userDocRef, userData, { merge: false });
        } catch (error) {
            toast({ variant: "destructive", title: "Could not create guest session." });
            setIsProcessing(false);
            return;
        }
    }

    // 3. Create Order
    const totalAmount = subtotal + shippingFee;
    const ordersCollection = collection(firestore, 'users', effectiveUser.uid, 'orders');

    const orderData = {
      userId: effectiveUser.uid,
      orderDate: serverTimestamp(),
      totalAmount: totalAmount,
      status: 'Pending',
      shippingInfo: {
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          address: values.address,
          city: values.city,
          postalCode: values.postalCode,
          country: values.country,
      },
      items: cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }))
    };

    try {
      const docRef = await addDocumentNonBlocking(ordersCollection, orderData);
      const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      
      const isLive = settings?.isLiveMode === true;
      const payfastData = {
        merchant_id: isLive ? (settings?.payfastMerchantId || "") : "10043133",
        merchant_key: isLive ? (settings?.payfastMerchantKey || "") : "wh7ky81lq556u",
        return_url: new URL(`/checkout/success?orderId=${docRef.id}`, origin).href,
        cancel_url: new URL('/cart', origin).href,
        notify_url: new URL('/api/payfast-itn', origin).href,
        name_first: values.firstName,
        name_last: values.lastName,
        email_address: values.email,
        m_payment_id: docRef.id,
        amount: totalAmount.toFixed(2),
        item_name: `${settings?.storeName || 'Working on Grass'} - Order #${docRef.id.substring(0, 8)}`,
        custom_str1: effectiveUser.uid,
      };

      // Get server-side signature (includes passphrase without exposing it to the client)
      const sigRes = await fetch('/api/payfast-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payfastData),
      });
      const sigData = await sigRes.json();
      console.log('[PayFast Debug]', sigData);
      const { signature } = sigData;

      setPayfastConfig({ ...payfastData, signature });
      clearCart();
    } catch (error: any) {
       toast({ variant: "destructive", title: "Uh oh!", description: error.message });
       setIsProcessing(false);
    }
  }

  useEffect(() => {
    if (cartItems.length === 0 && !payfastConfig) {
      router.replace('/shop');
    }
  }, [cartItems.length, payfastConfig, router]);
  
  if (payfastConfig) {
    return (
        <div className="container flex min-h-[80vh] items-center justify-center py-12 text-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Proceeding to Payment</CardTitle>
                    <CardDescription>You are being redirected to PayFast securely.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground">Please wait while we connect to the payment gateway...</p>
                    </div>
                    <form ref={payfastFormRef} action={payfastUrl} method="post">
                        {Object.entries(payfastConfig).map(([key, value]) => (
                           <input key={key} type="hidden" name={key} value={value as string} />
                        ))}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container py-12 md:py-20">
      <h1 className="text-4xl md:text-5xl font-bold font-headline mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" /> Secure Shipping Information
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField name="firstName" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="First Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="lastName" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Last Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+27 82 000 0000" type="tel" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField name="address" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Veld Way" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField name="city" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Modimolle" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="postalCode" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="0510" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="country" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="bg-muted/30 p-6 rounded-lg border-2 border-dashed space-y-4">
                  <FormField
                    control={form.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                            I agree to the <Link href="/terms" target="_blank" className="text-primary underline">Terms & Conditions</Link> and <Link href="/privacy" target="_blank" className="text-primary underline">Privacy Policy</Link>.
                            </FormLabel>
                            <FormMessage />
                        </div>
                        </FormItem>
                    )}
                  />
              </div>

              <Button type="submit" size="lg" className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-12" disabled={isProcessing}>
                {isProcessing ? 'Processing Order...' : 'Proceed to Secure Payment'}
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                  <ShieldCheck className="h-4 w-4" /> Secure checkout powered by PayFast
              </div>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-24 border-2">
            <CardHeader className="bg-muted/30 border-b-2">
                <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/64/64`} alt={product.name} width={64} height={64} className="rounded-md object-contain bg-secondary/50 border shadow-sm"/>
                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shadow-md">{quantity}</span>
                      </div>
                      <div className="max-w-[180px]">
                        <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">R{product.price.toFixed(2)} each</p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">R{(product.price * quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t-2 space-y-3">
                 <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Flat Rate Shipping</span>
                  <span>R{shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl pt-2 border-t border-dashed">
                  <div className="flex flex-col">
                      <span>Total</span>
                      <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest">Including VAT</span>
                  </div>
                  <span className="text-accent">R{(subtotal + shippingFee).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            {isProcessing && (
                <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-start gap-2 text-xs text-amber-800">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>Processing your details. Please do not refresh the page.</p>
                </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
