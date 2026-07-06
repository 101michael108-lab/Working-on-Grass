"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useUser, useFirestore, useAuth } from "@/firebase";
import { updateProfile } from "firebase/auth";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  displayName: z.string().min(2, "Name is required"),
  email: z.string().email().optional(),
});

export default function ProfilePage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !auth.currentUser) return;
    try {
      if (auth.currentUser.displayName !== values.displayName) {
        await updateProfile(auth.currentUser, { displayName: values.displayName });
      }
      const userDocRef = doc(firestore, "users", user.uid);
      updateDocumentNonBlocking(userDocRef, { displayName: values.displayName });
      toast({ title: "Profile updated successfully!" });
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  }

  return (
    <div className="max-w-[560px]">
      <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-gold-deep">Account</div>
      <h1 className="m-0 mb-6 font-headline text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.02em] text-ink">My profile</h1>

      <div className="rounded-[4px] border border-line bg-cream-card p-6 shadow-lifted min-[560px]:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl><Input disabled {...field} /></FormControl>
                  <FormMessage />
                  <p className="text-[12px] text-body-faint">Your email is used for sign-in and can’t be changed here.</p>
                </FormItem>
              )}
            />
            <Button type="submit">Save changes</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
