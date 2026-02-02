
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useFirestore } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, MediaLibraryItem } from "@/lib/types";
import { ProductImageSelector } from './product-image-selector';
import Image from 'next/image';
import { Image as ImageIcon, XCircle, PlusCircle, Trash } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.string().min(2, "Category is required"),
  sku: z.string().optional(),
  brand: z.string().optional(),
  
  layout: z.enum(['standard', 'in-depth', 'book']),

  valueProposition: z.string().optional(),
  authorityStatement: z.string().optional(),

  specifications: z.array(z.object({
    feature: z.string().min(1, "Feature is required"),
    description: z.string().min(1, "Description is required"),
  })).optional(),
  
  features: z.array(z.string().min(1, "Feature text is required")).optional(),

  howItWorks: z.object({
      headline: z.string().optional(),
      steps: z.array(z.object({
          title: z.string().min(1, "Title is required"),
          description: z.string().min(1, "Description is required"),
      })).optional(),
  }).optional(),
  relatedProductIds: z.string().optional(),
});


const productCategories = ["Measurement & Tools", "Books & Field Guides", "Seeds & Pasture Products", "Online Courses"];

interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isImageSelectorOpen, setImageSelectorOpen] = React.useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = React.useState(product?.image || '');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            category: product?.category || "Measurement & Tools",
            sku: product?.sku || "",
            brand: product?.brand || "",
            layout: product?.layout || 'standard',
            valueProposition: product?.valueProposition || "",
            authorityStatement: product?.authorityStatement || "",
            specifications: product?.specifications || [],
            features: product?.features || [],
            howItWorks: product?.howItWorks || { headline: '', steps: []},
            relatedProductIds: product?.relatedProductIds?.join(', ') || '',
        },
    });

    const layout = form.watch("layout");

    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control: form.control, name: "specifications" });
    const { fields: howItWorksFields, append: appendHowItWorks, remove: removeHowItWorks } = useFieldArray({ control: form.control, name: "howItWorks.steps" });
    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control: form.control, name: "features" });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const productData = { 
            ...values, 
            price: Number(values.price),
            image: selectedImageUrl,
            relatedProductIds: values.relatedProductIds?.split(',').map(s => s.trim()).filter(Boolean) || [],
        };
        
        if (product) {
            const productRef = doc(firestore, 'products', product.id);
            setDocumentNonBlocking(productRef, productData, { merge: true });
            toast({ title: "Product updated!" });
        } else {
            const productsCollection = collection(firestore, 'products');
            addDocumentNonBlocking(productsCollection, productData);
            toast({ title: "Product added!" });
        }
        onSuccess();
    }
    
    const handleImageSelected = (image: MediaLibraryItem) => {
        setSelectedImageUrl(image.imageUrl);
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                   {/* Main Details and Image */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                             <Card>
                                <CardHeader><CardTitle>Core Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField name="name" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField name="description" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                     <div className="grid grid-cols-2 gap-4">
                                        <FormField name="price" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name="category" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {productCategories.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                        )} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField name="sku" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>SKU (Optional)</FormLabel><FormControl><Input placeholder="DPM-001" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField name="brand" control={form.control} render={({ field }) => (
                                            <FormItem><FormLabel>Brand (Optional)</FormLabel><FormControl><Input placeholder="Working on Grass" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                             </Card>
                        </div>
                        <div className="lg:col-span-1 space-y-2">
                             <Label>Product Image</Label>
                             <Card className="overflow-hidden">
                                 <CardContent className="p-0 aspect-square flex items-center justify-center bg-secondary">
                                     {selectedImageUrl ? (
                                         <Image src={selectedImageUrl} alt={form.getValues('name')} width={300} height={300} className="object-cover w-full h-full" />
                                     ) : (
                                        <div className="text-center text-muted-foreground p-4">
                                            <ImageIcon className="mx-auto h-12 w-12" />
                                            <p className="mt-2 text-sm">No image selected</p>
                                        </div>
                                     )}
                                 </CardContent>
                                 <CardFooter className="p-2 grid grid-cols-2 gap-2">
                                     <Button type="button" variant="outline" className="w-full" onClick={() => setImageSelectorOpen(true)}>Choose</Button>
                                     <Button type="button" variant="destructive" size="sm" className="w-full" disabled={!selectedImageUrl} onClick={() => setSelectedImageUrl('')}><XCircle className="mr-2"/>Remove</Button>
                                 </CardFooter>
                             </Card>
                        </div>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Page Content & Layout</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <FormField name="layout" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Page Layout</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="standard">Standard E-commerce</SelectItem>
                                        <SelectItem value="in-depth">In-Depth / Inquiry</SelectItem>
                                        <SelectItem value="book">Book</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    <CardDescription className="pt-2">Choose the page template. This changes the available fields below and how the page looks to customers.</CardDescription>
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Conditional Fields based on Layout */}
                    {layout === 'in-depth' && (
                        <>
                            <Card>
                                <CardHeader><CardTitle>In-Depth Layout: Page Content</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField name="valueProposition" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Value Proposition</FormLabel><FormControl><Input {...field} placeholder="e.g. Accurately measure grass biomass..." /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField name="authorityStatement" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Authority Statement</FormLabel><FormControl><Input {...field} placeholder="e.g. Used by Frits van Oudtshoorn..." /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle>In-Depth Layout: "How It Works" Section</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField name="howItWorks.headline" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Headline</FormLabel><FormControl><Input {...field} placeholder="How The DPM Works"/></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <div className="flex items-center justify-between">
                                        <Label>Steps</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => appendHowItWorks({ title: '', description: '' })}><PlusCircle className="mr-2"/>Add Step</Button>
                                    </div>
                                    {howItWorksFields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-[1fr_auto] gap-2 items-start p-4 border rounded-md">
                                            <div className="space-y-2">
                                                <FormField control={form.control} name={`howItWorks.steps.${index}.title`} render={({ field }) => (
                                                    <FormItem><FormLabel>Step {index + 1} Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={form.control} name={`howItWorks.steps.${index}.description`} render={({ field }) => (
                                                    <FormItem><FormLabel>Step {index + 1} Description</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            </div>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeHowItWorks(index)}><Trash /></Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {layout === 'book' && (
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Book Layout: Key Features</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendFeature('')}><PlusCircle className="mr-2"/>Add Feature</Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {featureFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <FormField control={form.control} name={`features.${index}`} render={({ field }) => (
                                            <FormItem className="flex-grow"><FormControl><Input {...field} placeholder="e.g. Over 1000 colour photographs" /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}><Trash /></Button>
                                    </div>
                                ))}
                                {featureFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No features added. These are displayed as bullet points.</p>}
                            </CardContent>
                        </Card>
                    )}

                    {(layout === 'in-depth' || layout === 'book') && (
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Specifications</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ feature: '', description: '' })}><PlusCircle className="mr-2"/>Add Spec</Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {specFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                                        <FormField control={form.control} name={`specifications.${index}.feature`} render={({ field }) => (
                                            <FormItem><FormLabel>Feature</FormLabel><FormControl><Input {...field} placeholder="e.g. Author, Pages, Material" /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`specifications.${index}.description`} render={({ field }) => (
                                            <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="e.g. Frits van Oudtshoorn, 289, Aluminium"/></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <Button type="button" variant="ghost" size="icon" className="mt-8" onClick={() => removeSpec(index)}><Trash /></Button>
                                    </div>
                                ))}
                                {specFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No specifications added.</p>}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader><CardTitle>Related Products</CardTitle></CardHeader>
                        <CardContent>
                            <FormField name="relatedProductIds" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Related Product IDs</FormLabel>
                                    <FormControl><Textarea {...field} placeholder="Enter product IDs, separated by commas" rows={2}/></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Button type="submit" size="lg">{product ? "Save Changes" : "Create Product"}</Button>
                </form>
            </Form>

            <ProductImageSelector 
                open={isImageSelectorOpen}
                onOpenChange={setImageSelectorOpen}
                onImageSelect={handleImageSelected}
            />
        </>
    )
}
