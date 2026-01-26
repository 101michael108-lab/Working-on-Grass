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
import { useUser, useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";

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
  const firestore = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [payfastConfig, setPayfastConfig] = useState<Record<string, string> | null>(null);
  const payfastFormRef = useRef<HTMLFormElement>(null);


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
    if (payfastConfig && payfastFormRef.current) {
        payfastFormRef.current.submit();
    }
  }, [payfastConfig]);


  async function onSubmit(values: z.infer<typeof formSchema>>) {
    setIsProcessing(true);
    if (!user) {
      toast({ variant: "destructive", title: "You must be logged in to place an order." });
      router.push('/login');
      setIsProcessing(false);
      return;
    }

    const totalAmount = subtotal + 150; // Assuming R150 shipping
    const ordersCollection = collection(firestore, 'users', user.uid, 'orders');

    const orderData = {
      userId: user.uid,
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
      // We await here to get the order ID for the redirect
      const docRef = await addDocumentNonBlocking(ordersCollection, orderData);

      toast({
        title: "Order Received!",
        description: "Redirecting to payment...",
      });
      
      const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const payfastData = {
        merchant_id: process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '10000100',
        return_url: `${origin}/checkout/success?orderId=${docRef.id}`,
        cancel_url: `${origin}/cart`,
        notify_url: `${origin}/api/payfast-itn`, // You will need to build this API route
        m_payment_id: docRef.id,
        amount: totalAmount.toFixed(2),
        item_name: `Working on Grass - Order #${docRef.id.substring(0, 8)}`,
        // IMPORTANT: The 'signature' is deliberately omitted. It must be generated on your server
        // using your secret passphrase for security. The PayFast sandbox may allow
        // transactions without it for basic testing. See the /payfast-guide.
      };

      setPayfastConfig(payfastData);
      clearCart();

    } catch (error: any) {
       toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.message,
        });
       setIsProcessing(false);
    }
  }

  // Redirect if cart is empty on client side
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
                    <CardDescription>You are being redirected to PayFast to complete your payment securely.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please wait...</p>
                    {/* This form will auto-submit */}
                    <form ref={payfastFormRef} action="https://sandbox.payfast.co.za/eng/process" method="post">
                        {Object.entries(payfastConfig).map(([key, value]) => (
                           <input key={key} type="hidden" name={key} value={value as string} />
                        ))}
                    </form>
                     <Button onClick={() => payfastFormRef.current?.submit()} className="mt-4">
                        Click here if you are not redirected
                    </Button>
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-left text-xs text-amber-800">
                        <h4 className="font-bold mb-2">Developer Note:</h4>
                        <p>This form is redirecting to the PayFast Sandbox. For a real transaction, a secure <code className="font-mono">signature</code> must be generated on your backend using your PayFast passphrase. See the <Link href="/payfast-guide" className="underline">PayFast Integration Guide</Link> for details.</p>
                    </div>
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
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
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
              <Button type="submit" size="lg" className="w-full mt-6 bg-accent text-accent-foreground hover:bg-accent/90" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </Button>
            </form>
          </Form>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Image src={product.image || `https://picsum.photos/seed/${product.id}/64/64`} alt={product.name} width={64} height={64} className="rounded-md object-contain bg-secondary/50"/>
                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">{quantity}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{product.name}</h3>
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
                  <span>R150.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>R{(subtotal + 150).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
           <div className="mt-6 text-center text-muted-foreground text-sm">
            <p>You will be redirected to our secure payment partner to complete your purchase.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
