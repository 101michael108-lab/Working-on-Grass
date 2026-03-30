"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Bird, Sprout, Wheat, MessageCircle } from "lucide-react"

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
import { seedCategories } from "@/lib/static-data"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { SeedCategory, SiteSettings } from "@/lib/types"
import { sendInquiryAcknowledgmentEmail, sendAdminInquiryNotification } from "@/services/email-service"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  location: z.string().optional(),
  seedCategory: z.string({
    required_error: "Please select a seed category.",
  }),
  farmSize: z.string().optional(),
  primaryUse: z.string().optional(),
  message: z.string().min(10, {
    message: "Please describe your needs (e.g., hectarage, specific seed type).",
  }),
})

function SeedInquiryForm() {
  const { toast } = useToast()
  const firestore = useFirestore()

  const settingsRef = useMemoFirebase(() => doc(firestore, 'settings', 'config'), [firestore]);
  const { data: settings } = useDoc<SiteSettings>(settingsRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      seedCategory: undefined,
      farmSize: "",
      primaryUse: undefined,
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const contactFormCollection = collection(firestore, 'contactFormEntries');
    const serviceType = `Seed Inquiry: ${values.seedCategory}`;
    
    addDocumentNonBlocking(contactFormCollection, {
      ...values,
      serviceInterestedIn: serviceType,
      submissionDate: serverTimestamp(),
    });

    // 1. Customer acknowledgment
    sendInquiryAcknowledgmentEmail({
        to: values.email,
        customerName: values.name,
        service: serviceType,
        storeName: settings?.storeName,
        fromEmail: settings?.senderEmail,
    }, firestore);

    // 2. Admin notification
    sendAdminInquiryNotification({
        to: settings?.contactEmail || 'admin@workingongrass.co.za',
        customerName: values.name,
        customerEmail: values.email,
        service: serviceType,
        message: values.message,
        storeName: settings?.storeName,
        fromEmail: settings?.senderEmail,
    }, firestore);

    toast({
      title: "Seed Inquiry Sent!",
      description: "Thank you for your interest. We will get back to you shortly with a quote.",
    })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Phone <span className="text-muted-foreground">(Optional)</span></FormLabel><FormControl><Input placeholder="Your contact number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location / Farm Name <span className="text-muted-foreground">(Optional)</span></FormLabel><FormControl><Input placeholder="e.g. Near Bela-Bela" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField
          control={form.control}
          name="seedCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seed Category of Interest</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a category..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seedCategories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other/Unsure">Other / Unsure</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField control={form.control} name="farmSize" render={({ field }) => (
            <FormItem>
              <FormLabel>Area to be planted <span className="text-muted-foreground">(ha, Optional)</span></FormLabel>
              <FormControl><Input placeholder="e.g. 50 ha" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="primaryUse" render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Use <span className="text-muted-foreground">(Optional)</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select primary use..." /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Grazing / Pasture">Grazing / Pasture</SelectItem>
                  <SelectItem value="Cover Crop">Cover Crop</SelectItem>
                  <SelectItem value="Veld Restoration">Veld Restoration</SelectItem>
                  <SelectItem value="Turf / Lawn">Turf / Lawn</SelectItem>
                  <SelectItem value="Ornamental / Indigenous">Ornamental / Indigenous</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Requirements</FormLabel>
              <FormControl><Textarea placeholder="Describe your situation — soil type, rainfall area, current veld condition, or any specific seed mixtures you have in mind." {...field} rows={5} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" size="lg">Request a Quote</Button>
          <Button type="button" size="lg" variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white" asChild>
            <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20enquire%20about%20custom%20seed%20mixes." target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" /> Prefer to WhatsApp Frits
            </a>
          </Button>
        </div>
      </form>
    </Form>
  )
}

const categoryIcons: { [key: string]: React.ElementType } = {
  "Grasses": Sprout,
  "Legumes": Wheat,
  "Forage & Cover Crops": Bird
};

export default function SeedsPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Grass Seed Enquiries</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Frits van Oudtshoorn is a registered <strong>Barenbrug SA seed agent</strong>. All seed mixes are custom-formulated per farm, soil type, and intended use — not sold off-the-shelf. Submit an enquiry below and Frits will come back to you with a recommendation.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-secondary border border-primary/10 rounded-full px-5 py-2 text-sm text-muted-foreground">
          <Sprout className="h-4 w-4 text-primary" />
          <span>Summer &amp; winter pastures · Legumes · Cover crops · Turf · Indigenous grasses</span>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-12">
        <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Our Seed Categories</h2>
             <Accordion type="single" collapsible className="w-full" defaultValue="Grasses">
                {seedCategories.map((category: SeedCategory) => {
                    const Icon = categoryIcons[category.name] || Sprout;
                    return (
                        <AccordionItem key={category.name} value={category.name}>
                            <AccordionTrigger className="text-lg">
                                <div className="flex items-center gap-3">
                                    <Icon className="h-5 w-5 text-primary" />
                                    {category.name}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4">
                                {category.subCategories.map(sub => (
                                    <div key={sub.name}>
                                        <h4 className="font-semibold text-foreground/90">{sub.name}</h4>
                                        <p className="text-muted-foreground text-sm">
                                            {sub.types.join(', ')}
                                        </p>
                                    </div>
                                ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
            <p className="text-sm text-muted-foreground mt-6">Don't see what you're looking for? We can source a wide variety of seeds. Just let us know what you need in the inquiry form.</p>
        </div>
         <div className="md:col-span-3">
          <Card>
            <CardHeader>
                <CardTitle>Request a Seed Quote</CardTitle>
                <CardDescription>Fill out the form below, and we'll get back to you with a personalized quote.</CardDescription>
            </CardHeader>
            <CardContent>
                <SeedInquiryForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
