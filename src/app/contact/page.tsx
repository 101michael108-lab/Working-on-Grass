"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Mail, MapPin, Phone } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirestore, addDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase"
import { collection, serverTimestamp, doc } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { services } from "@/lib/static-data"
import { sendInquiryAcknowledgmentEmail, sendAdminInquiryNotification } from "@/services/email-service"
import type { SiteSettings } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  location: z.string().optional(),
   serviceInterestedIn: z.string({
    required_error: "Please select a service.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }).optional().or(z.literal('')),
})

function ContactForm() {
  const { toast } = useToast()
  const firestore = useFirestore()
  const searchParams = useSearchParams()
  const serviceQuery = searchParams.get('service')

  const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
  const { data: settings } = useDoc<SiteSettings>(settingsRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      serviceInterestedIn: serviceQuery || undefined,
      message: "",
    },
  })

  React.useEffect(() => {
    if (serviceQuery) {
      form.setValue('serviceInterestedIn', serviceQuery);
    }
  }, [serviceQuery, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const contactFormCollection = collection(firestore, 'contactFormEntries');
    
    addDocumentNonBlocking(contactFormCollection, {
      ...values,
      submissionDate: serverTimestamp(),
    });

    // 1. Send customer acknowledgment
    sendInquiryAcknowledgmentEmail({
        to: values.email,
        customerName: values.name,
        service: values.serviceInterestedIn,
        storeName: settings?.storeName,
        fromEmail: settings?.senderEmail,
    }, firestore);

    // 2. Send admin notification
    sendAdminInquiryNotification({
        to: settings?.contactEmail || 'admin@workingongrass.co.za',
        customerName: values.name,
        customerEmail: values.email,
        service: values.serviceInterestedIn,
        message: values.message,
        storeName: settings?.storeName,
        fromEmail: settings?.senderEmail,
    }, firestore);

    toast({
      title: "Message sent",
      description: "Frits will be in touch soon — usually within 1 business day.",
    })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone <span className="text-muted-foreground">(Optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Your contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location / Farm Name <span className="text-muted-foreground">(Optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Near Bela-Bela" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <FormField
          control={form.control}
          name="serviceInterestedIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Interested In</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service, index) => (
                    <SelectItem key={index} value={service.title}>
                      {service.title}
                    </SelectItem>
                  ))}
                  <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message <span className="text-muted-foreground">(Optional)</span></FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us more about your land or project needs..." {...field} rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" size="lg">Send Message</Button>
          <Button type="button" size="lg" className="bg-whatsapp hover:bg-whatsapp-hover text-white" asChild>
            <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20get%20in%20touch." target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="mr-2 h-5 w-5" /> WhatsApp Instead
            </a>
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function ContactPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get in Touch</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Ask a question, request an assessment, or just describe what's going on with your land — Frits will respond personally.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
          <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
           <Suspense fallback={<div className="text-muted-foreground text-sm">Loading form...</div>}>
            <ContactForm />
           </Suspense>
        </div>
        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Direct Contact Info</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Working on Grass</CardTitle>
                    <CardDescription>Environmental & Agricultural Services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0"/>
                        <div>
                            <p className="font-semibold">Address</p>
                            <p className="text-muted-foreground">Modimolle, Limpopo, 0510, South Africa</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Phone className="h-5 w-5 mt-1 text-primary flex-shrink-0"/>
                        <div>
                            <p className="font-semibold">Phone / WhatsApp</p>
                            <a
                              href="https://wa.me/27782280008"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary font-medium hover:underline"
                            >
                              +27 78 228 0008
                            </a>
                            <p className="text-xs text-muted-foreground mt-0.5">Frits van Oudtshoorn — tap to chat</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Mail className="h-5 w-5 mt-1 text-primary flex-shrink-0"/>
                        <div>
                            <p className="font-semibold">Email</p>
                            <p className="text-muted-foreground">admin@workingongrass.co.za</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
