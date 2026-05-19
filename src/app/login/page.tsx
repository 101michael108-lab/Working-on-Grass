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
import { signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { ensureUserProfile } from "@/lib/ensure-user-profile";
import {
  checkIsAdmin,
  clearAdminSession,
  establishAdminSession,
} from "@/lib/admin-auth";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function getPostLoginPath(
  admin: boolean,
  redirectParam: string | null
): string {
  if (
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
  ) {
    return redirectParam;
  }
  return admin ? "/admin" : "/";
}

async function routeAfterLogin(
  authUser: User,
  router: ReturnType<typeof useRouter>,
  redirectParam: string | null
) {
  const admin = await checkIsAdmin(authUser);

  if (admin) {
    const session = await establishAdminSession(authUser);
    if (!session.ok) {
      throw new Error(session.message);
    }
    router.push(getPostLoginPath(true, redirectParam));
  } else {
    await clearAdminSession(authUser);
    router.push(getPostLoginPath(false, redirectParam));
  }
}

function LoginPageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isUserLoading || !user) return;

    let cancelled = false;
    setIsRedirecting(true);

    (async () => {
      try {
        await ensureUserProfile(firestore, user);
        if (cancelled) return;
        await routeAfterLogin(user, router, redirectParam);
      } catch (error) {
        console.error("Login redirect failed:", error);
        if (!cancelled) {
          await signOut(auth);
          setIsRedirecting(false);
          toast({
            variant: "destructive",
            title: "Could not complete login",
            description: getAuthErrorMessage(error),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isUserLoading, router, firestore, auth, toast, redirectParam]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const authUser = userCredential.user;

      await ensureUserProfile(firestore, authUser);

      toast({
        title: "Logged In",
        description: "Welcome back! Redirecting...",
      });

      setIsRedirecting(true);
      await routeAfterLogin(authUser, router, redirectParam);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: getAuthErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isUserLoading || isRedirecting || user) {
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
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <p>Loading...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
