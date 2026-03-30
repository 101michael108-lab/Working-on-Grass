"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
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
import { sendInquiryAcknowledgmentEmail, sendAdminInquiryNotification } from "@/services/email-service";
import type { SiteSettings } from "@/lib/types";

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

  const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
  const { data: settings } = useDoc<SiteSettings>(settingsRef);

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const requestsCollection = collection(firestore, 'consultationRequests');
    const serviceType = `Consultation: ${values.service}`;
    
    addDocumentNonBlocking(requestsCollection, {
      ...values,
      submissionDate: serverTimestamp(),
    });

    // Attempt to parse email from contactDetail if it looks like one
    const customerEmail = values.contactDetail.includes('@') ? values.contactDetail : undefined;

    // 1. Customer acknowledgment (only if we have an email)
    if (customerEmail) {
        sendInquiryAcknowledgmentEmail({
            to: customerEmail,
            customerName: values.name,
            service: serviceType,
            storeName: settings?.storeName,
            fromEmail: settings?.senderEmail,
        }, firestore);
    }

    // 2. Admin notification
    sendAdminInquiryNotification({
        to: settings?.contactEmail || 'admin@workingongrass.co.za',
        customerName: values.name,
        customerEmail: values.contactDetail,
        service: serviceType,
        message: values.needs,
        storeName: settings?.storeName,
        fromEmail: settings?.senderEmail,
    }, firestore);

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
