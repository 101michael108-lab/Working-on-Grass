
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
import { ImagePlus, XCircle, PlusCircle, Trash } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  howItWorks: z.string().optional(),
  fieldUse: z.string().optional(),
  calibrationNote: z.string().optional(),
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
    const [images, setImages] = React.useState<string[]>(product?.images || []);

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
            howItWorks: product?.howItWorks || "",
            fieldUse: product?.fieldUse || "",
            calibrationNote: product?.calibrationNote || "",
        },
    });

    const layout = form.watch("layout");

    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control: form.control, name: "specifications" });
    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control: form.control, name: "features" });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const productData = { 
            ...values, 
            price: Number(values.price),
            images: images,
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
        if (!images.includes(image.imageUrl)) {
            setImages(prev => [...prev, image.imageUrl]);
        }
    }

    const handleRemoveImage = (url: string) => {
        setImages(prev => prev.filter(img => img !== url));
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
                                        <FormItem>
                                            <FormLabel>Description (Short Technical Overview)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    rows={8} 
                                                    placeholder="Enter product description. Start lines with '•' to create bullet points." 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
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
                             <Label>Product Images</Label>
                             <Card>
                                 <CardContent className="p-3">
                                     <div className="grid grid-cols-3 gap-2">
                                        {images.map(url => (
                                            <div key={url} className="relative group aspect-square">
                                                <Image src={url} alt="Product image" fill className="object-cover rounded-md" />
                                                <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full hidden group-hover:flex" onClick={() => handleRemoveImage(url)}>
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                         <button type="button" onClick={() => setImageSelectorOpen(true)} className="aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                                            <ImagePlus className="h-8 w-8"/>
                                            <span className="text-xs mt-1">Add Image</span>
                                        </button>
                                     </div>
                                 </CardContent>
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
                                    <CardDescription className="pt-2">You can change this at any time. The sections below will update based on your choice.</CardDescription>
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Conditional Fields based on Layout */}
                    {layout === 'in-depth' && (
                        <>
                            <Card>
                                <CardHeader><CardTitle>In-Depth Layout Content</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField name="valueProposition" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Value Proposition</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. Accurately measure grass biomass..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="authorityStatement" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Authority Statement (Quote + Attribution)</FormLabel>
                                            <FormControl>
                                                <Textarea rows={4} {...field} placeholder="Quote — Expert Name, Biography..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>How It Works & Field Use</CardTitle>
                                    <CardDescription>Explain the technical operation and practical field application.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField name="howItWorks" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Operational Guide (Technical)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={4} placeholder="Explain how the product works technically. Supports bullet points." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="fieldUse" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field Use Description (Practical)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    {...field} 
                                                    rows={6} 
                                                    placeholder="Practical instructions for using this tool in the field.&#10;• Step 1...&#10;• Step 2..." 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField name="calibrationNote" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Calibration Note (Technical Alert)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    {...field} 
                                                    rows={4} 
                                                    placeholder="Specific scientific or technical note regarding calibration or usage precision." 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {layout === 'book' && (
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>Book Key Features</CardTitle>
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

                    {/* Technical Specifications - Applicable to all for that grounded technical feel */}
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Technical Specifications</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ feature: '', description: '' })}><PlusCircle className="mr-2"/>Add Spec</Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {specFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                                    <FormField control={form.control} name={`specifications.${index}.feature`} render={({ field }) => (
                                        <FormItem><FormLabel>Feature</FormLabel><FormControl><Input {...field} placeholder="e.g. Material, Pages, Weight" /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name={`specifications.${index}.description`} render={({ field }) => (
                                        <FormItem><FormLabel>Value</FormLabel><FormControl><Input {...field} placeholder="e.g. Aluminum, 289, 1.2kg"/></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <Button type="button" variant="ghost" size="icon" className="mt-8" onClick={() => removeSpec(index)}><Trash /></Button>
                                </div>
                            ))}
                            {specFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No specifications added. These are displayed in a technical table.</p>}
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
