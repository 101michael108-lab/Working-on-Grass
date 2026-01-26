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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
    const { toast } = useToast();
    const router = useRouter();
    const auth = useAuth();
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isUserLoading && user) {
            const userDocRef = doc(firestore, "users", user.uid);
            getDoc(userDocRef).then(userDocSnap => {
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData.role === 'admin') {
                        router.push('/admin');
                    } else {
                        router.push('/');
                    }
                }
            });
        }
    }, [user, isUserLoading, router, firestore]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            const userDocRef = doc(firestore, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                toast({
                    title: "Logged In",
                    description: "Welcome back! Redirecting...",
                });
                if (userData.role === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }
            } else {
                 toast({
                    variant: "destructive",
                    title: "Login failed.",
                    description: "User data not found. Please contact support.",
                });
            }
        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: error.message,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

  if (isUserLoading || user) {
    return (
        <div className="container flex min-h-[80vh] items-center justify-center py-12">
            <p>Loading...</p>
        </div>
    );
  }
  
  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="flex items-center justify-between">
                        <div />
                        <Link href="#" className="text-sm text-muted-foreground hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Logging In..." : "Log In"}
                    </Button>
                </form>
            </Form>
             <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
