"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Mail, MapPin, Phone } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'

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
import { useFirestore, addDocumentNonBlocking } from "@/firebase"
import { collection, serverTimestamp } from "firebase/firestore"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { services } from "@/lib/data"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
   serviceInterestedIn: z.string({
    required_error: "Please select a service.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }).optional(),
})

function ContactForm() {
  const { toast } = useToast()
  const firestore = useFirestore()
  const searchParams = useSearchParams()
  const serviceQuery = searchParams.get('service')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      serviceInterestedIn: serviceQuery || undefined,
      message: "",
    },
  })

  React.useEffect(() => {
    if (serviceQuery) {
      form.setValue('serviceInterestedIn', serviceQuery);
    }
  }, [serviceQuery, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const contactFormCollection = collection(firestore, 'contactFormEntries');
    
    addDocumentNonBlocking(contactFormCollection, {
      ...values,
      submissionDate: serverTimestamp(),
    });

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We will get back to you shortly.",
    })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
              <FormLabel>Message (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us more about your needs..." {...field} rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg">Send Message</Button>
      </form>
    </Form>
  )
}

export default function ContactPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get in Touch</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Have a question or need a consultation? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Contact Form</h2>
           <Suspense fallback={<div>Loading...</div>}>
            <ContactForm />
           </Suspense>
        </div>
        <div>
            <h2 className="text-2xl font-bold mb-6">Our Information</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Working on Grass</CardTitle>
                    <CardDescription>Environmental & Agricultural Services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <p className="font-semibold">Address</p>
                            <p className="text-muted-foreground">Modimolle, Limpopo, 0510, South Africa</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Phone className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <p className="font-semibold">Phone</p>
                            <p className="text-muted-foreground">Office: +27 71 866 1331</p>
                            <p className="text-muted-foreground">Frits van Oudtshoorn: +27 78 228 0008</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Mail className="h-5 w-5 mt-1 text-primary"/>
                        <div>
                            <p className="font-semibold">Email</p>
                            <p className="text-muted-foreground">courses@alut.co.za</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
