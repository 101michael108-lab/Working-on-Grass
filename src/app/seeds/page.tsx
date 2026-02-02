
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Bird, Sprout, Wheat } from "lucide-react"

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
import { seedCategories } from "@/lib/static-data"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { SeedCategory } from "@/lib/types"

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
  message: z.string().min(10, {
    message: "Please describe your needs (e.g., hectarage, specific seed type).",
  }),
})

function SeedInquiryForm() {
  const { toast } = useToast()
  const firestore = useFirestore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      seedCategory: undefined,
      message: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    const contactFormCollection = collection(firestore, 'contactFormEntries');
    
    addDocumentNonBlocking(contactFormCollection, {
      ...values,
      serviceInterestedIn: `Seed Inquiry: ${values.seedCategory}`,
      submissionDate: serverTimestamp(),
    });

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
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Requirements</FormLabel>
              <FormControl><Textarea placeholder="Please tell us about your needs, e.g., hectares to be planted, specific seed mixtures, or soil type." {...field} rows={6} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg">Request a Quote</Button>
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
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Custom Seed Orders</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          We provide high-quality seeds tailored to your specific environmental conditions and agricultural goals. All seed sales are handled via custom quote to ensure you get the best mixture for your needs.
        </p>
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
