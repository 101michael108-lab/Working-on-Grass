"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useAuth, useDoc, useMemoFirebase } from "@/firebase";
import { serverTimestamp, doc, setDoc } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import type { SiteSettings } from "@/lib/types";
import { ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateOrderShipping } from "@/lib/shipping";
import { Container } from "@/components/redesign/ui";

const formSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(7, "Phone number is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    postalCode: z.string().min(4, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
    vatNumber: z.string().optional(),
    billingSameAsShipping: z.boolean().default(true),
    billingFirstName: z.string().optional(),
    billingLastName: z.string().optional(),
    billingAddress: z.string().optional(),
    billingCity: z.string().optional(),
    billingPostalCode: z.string().optional(),
    billingCountry: z.string().optional(),
    agreeToTerms: z.boolean().refine((v) => v === true, { message: "You must agree to the terms" }),
  })
  .superRefine((v, ctx) => {
    if (!v.billingSameAsShipping) {
      const req: [keyof typeof v, string, number][] = [
        ["billingFirstName", "First name", 1],
        ["billingLastName", "Last name", 1],
        ["billingAddress", "Address", 5],
        ["billingCity", "City", 2],
        ["billingPostalCode", "Postal code", 4],
        ["billingCountry", "Country", 2],
      ];
      for (const [k, label, min] of req) {
        if (!String(v[k] ?? "").trim() || String(v[k]).trim().length < min) {
          ctx.addIssue({ path: [k as string], code: z.ZodIssueCode.custom, message: `${label} is required` });
        }
      }
    }
  });

type Values = z.infer<typeof formSchema>;

const INPUT =
  "h-11 w-full rounded-[3px] border border-line-strong bg-cream-card px-3.5 font-body text-[14px] text-ink outline-none placeholder:text-body-faint focus:border-forest";

function Field({
  form, name, label, type = "text", placeholder, optional, full,
}: {
  form: UseFormReturn<Values>;
  name: keyof Values;
  label: string;
  type?: string;
  placeholder?: string;
  optional?: boolean;
  full?: boolean;
}) {
  const err = form.formState.errors[name];
  return (
    <label className={cn("flex flex-col gap-1.5", full && "sm:col-span-2")}>
      <span className="text-[12px] font-semibold text-body-mute">
        {label}
        {optional && <span className="font-normal text-body-faint"> (optional)</span>}
      </span>
      <input type={type} placeholder={placeholder} {...form.register(name as any)} className={INPUT} />
      {err && <span className="text-[11.5px] text-destructive">{String(err.message)}</span>}
    </label>
  );
}

export default function CheckoutPage() {
  const { cartItems, clearCart, isHydrated } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [payfastConfig, setPayfastConfig] = useState<Record<string, string> | null>(null);
  const [payfastUrl, setPayfastUrl] = useState("");
  const payfastFormRef = useRef<HTMLFormElement>(null);

  const settingsRef = useMemoFirebase(() => doc(firestore, "settings", "public"), [firestore]);
  const { data: settings } = useDoc<Pick<SiteSettings, "storeName" | "shippingFee">>(settingsRef);

  const globalShippingFee = settings?.shippingFee ?? 150;
  const shippingFee = calculateOrderShipping(cartItems, globalShippingFee);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal + shippingFee;

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: user?.displayName?.split(" ")[0] || "",
      lastName: user?.displayName?.split(" ")[1] || "",
      phone: "", address: "", city: "", postalCode: "", country: "South Africa",
      vatNumber: "",
      billingSameAsShipping: true,
      billingFirstName: "", billingLastName: "", billingAddress: "", billingCity: "", billingPostalCode: "", billingCountry: "",
      agreeToTerms: false,
    },
  });

  const sameBilling = form.watch("billingSameAsShipping");

  useEffect(() => {
    if (user && !form.getValues().email) {
      form.reset({
        ...form.getValues(),
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (payfastConfig && payfastFormRef.current) payfastFormRef.current.submit();
  }, [payfastConfig]);

  async function onSubmit(values: Values) {
    setIsProcessing(true);

    let effectiveUser = user;
    if (!effectiveUser) {
      try {
        const cred = await signInAnonymously(auth);
        effectiveUser = cred.user;
        await setDoc(doc(firestore, "users", effectiveUser.uid), {
          id: effectiveUser.uid,
          email: values.email,
          displayName: `${values.firstName} ${values.lastName}`,
          role: "user",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch {
        toast({ variant: "destructive", title: "Could not start a guest session." });
        setIsProcessing(false);
        return;
      }
    }

    const billingInfo = values.billingSameAsShipping
      ? undefined
      : {
          firstName: values.billingFirstName,
          lastName: values.billingLastName,
          address: values.billingAddress,
          city: values.billingCity,
          postalCode: values.billingPostalCode,
          country: values.billingCountry,
        };

    try {
      const idToken = await effectiveUser.getIdToken();
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          items: cartItems.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          shippingInfo: {
            email: values.email, firstName: values.firstName, lastName: values.lastName, phone: values.phone,
            address: values.address, city: values.city, postalCode: values.postalCode, country: values.country,
            vatNumber: values.vatNumber,
          },
          billingInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Checkout problem", description: data?.error || "Could not start payment. Please try again." });
        setIsProcessing(false);
        return;
      }
      setPayfastUrl(data.payfastUrl);
      setPayfastConfig(data.payfastData);
      clearCart();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Uh oh!", description: error?.message || "Checkout failed." });
      setIsProcessing(false);
    }
  }

  useEffect(() => {
    if (isHydrated && cartItems.length === 0 && !payfastConfig) router.replace("/shop");
  }, [isHydrated, cartItems.length, payfastConfig, router]);

  if (payfastConfig) {
    return (
      <div className="bg-cream">
        <Container className="flex min-h-[70vh] items-center justify-center py-16 text-center">
          <div className="w-full max-w-lg rounded-[4px] border border-line bg-cream-card p-10 shadow-lifted">
            <h1 className="m-0 font-headline text-[28px] font-semibold text-ink">Proceeding to payment</h1>
            <p className="mt-2 text-[14px] text-body-soft">You&rsquo;re being redirected to PayFast securely.</p>
            <div className="mx-auto mt-8 h-10 w-10 animate-spin rounded-full border-4 border-forest border-t-transparent" />
            <form ref={payfastFormRef} action={payfastUrl} method="post">
              {Object.entries(payfastConfig).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value as string} />
              ))}
            </form>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-cream">
      <Container className="pb-[clamp(48px,6vw,80px)] pt-[clamp(40px,5vw,56px)]">
        <div className="mb-3.5 font-mono text-[12px] text-gold-deep">Home / Cart / Checkout</div>
        <h1 className="m-0 mb-8 font-headline text-[clamp(30px,3.6vw,44px)] font-medium tracking-[-0.02em] text-ink">Checkout</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 items-start gap-11 min-[940px]:grid-cols-[1fr_340px]">
          {/* Left: details */}
          <div>
            {!user && (
              <div className="mb-5 flex items-center gap-2.5 rounded-[3px] border border-line bg-cream-band px-4 py-3 text-[13px] text-body">
                <User className="h-4 w-4 text-forest" strokeWidth={1.6} />
                Checking out as a guest. <Link href="/login" className="font-semibold text-forest no-underline">Log in</Link> for faster checkout.
              </div>
            )}

            <h2 className="m-0 mb-4 font-headline text-[19px] font-semibold text-ink">Contact &amp; delivery</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field form={form} name="firstName" label="First name" />
              <Field form={form} name="lastName" label="Last name" />
              <Field form={form} name="email" label="Email" type="email" placeholder="you@example.com" />
              <Field form={form} name="phone" label="Phone" type="tel" placeholder="+27 82 000 0000" />
              <Field form={form} name="address" label="Delivery address" placeholder="Street address" full />
              <Field form={form} name="city" label="Town / city" />
              <Field form={form} name="postalCode" label="Postal code" />
              <Field form={form} name="country" label="Country" full />
              <Field form={form} name="vatNumber" label="VAT number" placeholder="e.g. 4123456789" optional full />
            </div>

            {/* Billing */}
            <h2 className="m-0 mb-3 mt-8 font-headline text-[19px] font-semibold text-ink">Billing address</h2>
            <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-body">
              <input type="checkbox" {...form.register("billingSameAsShipping")} className="h-4 w-4 accent-[#2E4A34]" />
              Billing address is the same as delivery
            </label>
            {!sameBilling && (
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-[3px] border border-line bg-cream-band/60 p-4 sm:grid-cols-2">
                <Field form={form} name="billingFirstName" label="First name" />
                <Field form={form} name="billingLastName" label="Last name" />
                <Field form={form} name="billingAddress" label="Billing address" placeholder="Street address" full />
                <Field form={form} name="billingCity" label="Town / city" />
                <Field form={form} name="billingPostalCode" label="Postal code" />
                <Field form={form} name="billingCountry" label="Country" full />
              </div>
            )}

            {/* Payment */}
            <h2 className="m-0 mb-4 mt-8 font-headline text-[19px] font-semibold text-ink">Payment</h2>
            <div className="flex items-center gap-3 rounded-[3px] border border-forest bg-cream-band p-4">
              <span className="h-[18px] w-[18px] rounded-full border-[5px] border-forest" />
              <div>
                <div className="text-[14px] font-semibold text-ink">PayFast — card, EFT &amp; instant EFT</div>
                <div className="text-[12px] text-body-mute">You&rsquo;ll be redirected to PayFast to complete payment securely.</div>
              </div>
            </div>

            {/* Terms */}
            <label className="mt-6 flex cursor-pointer items-start gap-2.5 text-[13px] text-body">
              <input type="checkbox" {...form.register("agreeToTerms")} className="mt-0.5 h-4 w-4 accent-[#2E4A34]" />
              <span>
                I agree to the <Link href="/terms" target="_blank" className="font-semibold text-forest">Terms &amp; Conditions</Link> and{" "}
                <Link href="/privacy" target="_blank" className="font-semibold text-forest">Privacy Policy</Link>.
              </span>
            </label>
            {form.formState.errors.agreeToTerms && (
              <span className="mt-1 block text-[11.5px] text-destructive">{String(form.formState.errors.agreeToTerms.message)}</span>
            )}
          </div>

          {/* Right: summary */}
          <div className="rounded-[4px] border border-line bg-cream-card p-[26px] shadow-lifted min-[940px]:sticky min-[940px]:top-24">
            <h2 className="m-0 mb-[18px] font-headline text-[19px] font-semibold text-ink">Order summary</h2>
            {cartItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between gap-3 py-[7px] text-[13px]">
                <span className="text-ink">{quantity} × {product.name}</span>
                <span className="whitespace-nowrap font-semibold text-ink">R{(product.price * quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-2.5 border-t border-line pt-3">
              <div className="flex justify-between py-1.5 text-[14px] text-body-soft"><span>Subtotal</span><span className="font-semibold text-ink">R{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between py-1.5 text-[14px] text-body-soft"><span>Delivery</span><span className="font-semibold text-ink">{shippingFee === 0 ? "Free" : `R${shippingFee.toFixed(2)}`}</span></div>
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-[17px] font-bold text-ink"><span>Total</span><span>R{total.toFixed(2)}</span></div>
              <span className="text-[11px] text-body-faint">Incl. VAT</span>
            </div>
            <button
              type="submit"
              disabled={isProcessing}
              className="mt-5 h-[50px] w-full rounded-[3px] bg-forest font-body text-[14.5px] font-semibold text-ondark-bright transition-colors hover:bg-forest-dark disabled:opacity-60"
            >
              {isProcessing ? "Processing…" : "Place order"}
            </button>
            <div className="mt-3.5 flex items-center justify-center gap-2 text-[11.5px] text-body-faint">
              <ShieldCheck className="h-3.5 w-3.5 text-forest" strokeWidth={1.6} /> Secure checkout with PayFast
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
