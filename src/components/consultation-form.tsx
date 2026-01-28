
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useFirestore } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  contactDetail: z.string().min(5, "A valid email or phone number is required"),
  location: z.string().optional(),
  needs: z.string().min(10, "Please describe your needs (min. 10 characters)"),
  service: z.string().optional(),
});

interface ConsultationFormProps {
  service?: string;
  onSuccess: () => void;
}

export function ConsultationForm({ service, onSuccess }: ConsultationFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contactDetail: "",
      location: "",
      needs: service ? `I'm interested in the "${service}" service.` : "",
      service: service || "General Inquiry",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const requestsCollection = collection(firestore, 'consultationRequests');
    
    addDocumentNonBlocking(requestsCollection, {
      ...values,
      submissionDate: serverTimestamp(),
    });

    toast({
      title: "Request Sent!",
      description: "Thank you. Frits will be in touch with you shortly.",
    });
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactDetail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone or Email</FormLabel>
              <FormControl><Input placeholder="you@example.com or 082 123 4567" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location (Farm / Area)</FormLabel>
              <FormControl><Input placeholder="e.g. Near Bela-Bela" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="needs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What do you need help with?</FormLabel>
              <FormControl><Textarea rows={4} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="pt-4">
            <Button type="submit" size="lg" className="w-full">Request Expert Guidance</Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
                You’ll be contacted directly by Frits to discuss your situation.
            </p>
        </div>
      </form>
    </Form>
  );
}
