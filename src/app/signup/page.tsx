"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
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
import { Container, Eyebrow } from "@/components/redesign/ui";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAuthErrorMessage } from "@/lib/auth-errors";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignupPage() {
    const { toast } = useToast();
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: values.name });

            const userDocRef = doc(firestore, 'users', user.uid);
            const userData = {
                id: user.uid,
                email: user.email,
                displayName: values.name,
                role: 'user',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            
            await setDoc(userDocRef, userData);

            toast({
                title: "Account Created!",
                description: "Welcome! Redirecting...",
            });
            router.push('/');
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Sign up failed",
                description: getAuthErrorMessage(error),
            });
        } finally {
            setIsSubmitting(false);
        }
    }
  return (
    <div className="bg-cream">
      <Container className="flex min-h-[78vh] items-center justify-center py-16">
        <div className="w-full max-w-[440px] rounded-[4px] border border-line bg-cream-card p-8 shadow-lifted min-[560px]:p-10">
          <div className="mb-7 text-center">
            <Eyebrow tone="gold" className="mb-3 justify-center">Account</Eyebrow>
            <h1 className="m-0 font-headline text-[clamp(26px,3vw,34px)] font-medium tracking-[-0.02em] text-ink">Create an account</h1>
            <p className="m-0 mt-2 text-[14px] text-body-soft">Join to save your orders and preferences.</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl><Input placeholder="Your name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-[13.5px] text-body-soft">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-forest hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
