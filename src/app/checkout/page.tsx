
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, addDocumentNonBlocking, useAuth, setDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
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

  // Fetch real shipping fee from settings
  const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
  const { data: settings } = useDoc(settingsRef);
  const shippingFee = settings?.shippingFee ?? 150;

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
      address: "",
      city: "",
      postalCode: "",
      country: "South Africa",
    },
  });
  
  useEffect(() => {
    if (user) {
        form.reset({
            ...form.getValues(),
            email: user.email || form.getValues().email,
            firstName: user.displayName?.split(' ')[0] || form.getValues().firstName,
            lastName: user.displayName?.split(' ')[1] || form.getValues().lastName || "",
        });
    }
  }, [user]);

  useEffect(() => {
    if (payfastConfig && payfastFormRef.current) {
        payfastFormRef.current.submit();
    }
  }, [payfastConfig]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);
    let effectiveUser = user;
    
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

    const totalAmount = subtotal + shippingFee;
    const ordersCollection = collection(firestore, 'users', effectiveUser.uid, 'orders');

    const orderData = {
      userId: effectiveUser.uid,
      orderDate: serverTimestamp(),
      totalAmount: totalAmount,
      status: 'Pending',
      shippingInfo: values,
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
      
      const payfastData = {
        merchant_id: settings?.payfastMerchantId || process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "10000100",
        merchant_key: settings?.payfastMerchantKey || process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || "46f0cd694581a",
        return_url: new URL(`/checkout/success?orderId=${docRef.id}`, origin).href,
        cancel_url: new URL('/cart', origin).href,
        notify_url: new URL('/api/payfast-itn', origin).href,
        name_first: values.firstName,
        name_last: values.lastName,
        email_address: values.email,
        m_payment_id: docRef.id,
        amount: totalAmount.toFixed(2),
        item_name: `Working on Grass - Order #${docRef.id.substring(0, 8)}`,
        custom_str1: effectiveUser.uid,
      };

      setPayfastConfig(payfastData);
      clearCart();
    } catch (error: any) {
       toast({ variant: "destructive", title: "Uh oh!", description: error.message });
       setIsProcessing(false);
    }
  }

  if (typeof window !== 'undefined' && cartItems.length === 0 && !payfastConfig) {
     router.replace('/shop');
     return null;
  }
  
  if (payfastConfig) {
    return (
        <div className="container flex min-h-[80vh] items-center justify-center py-12 text-center">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Proceeding to Payment</CardTitle>
                    <CardDescription>You are being redirected to PayFast securely.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please wait...</p>
                    <form ref={payfastFormRef} action={process.env.NEXT_PUBLIC_PAYFAST_PROCESS_URL || "https://sandbox.payfast.co.za/eng/process"} method="post">
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
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField name="firstName" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="lastName" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField name="address" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField name="city" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="postalCode" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField name="country" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" size="lg" className="w-full mt-6 bg-accent text-accent-foreground" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </form>
          </Form>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle>Your Order</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image src={product.images?.[0] || `https://picsum.photos/seed/${product.id}/64/64`} alt={product.name} width={64} height={64} className="rounded-md object-contain bg-secondary/50"/>
                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">{quantity}</span>
                      </div>
                      <div className="max-w-[150px]">
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">R{product.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">R{(product.price * quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t space-y-2">
                 <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>R{shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>R{(subtotal + shippingFee).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
