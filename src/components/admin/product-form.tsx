
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
  targetAudience: z.string().optional(),
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
            targetAudience: product?.targetAudience || "",
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
                                            <FormLabel>Description (Technical Overview)</FormLabel>
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
                                    <CardDescription className="pt-2">Layout determines which specialized sections are displayed.</CardDescription>
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Conditional Section: Who It's For (Books Only) */}
                    {layout === 'book' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Who It's For (Target Audience)</CardTitle>
                                <CardDescription>Describe the ideal reader for this publication.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FormField name="targetAudience" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea 
                                                rows={6} 
                                                placeholder="• Farmers assessing grazing...&#10;• Ecologists conducting surveys..." 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Conditional Fields based on Layout */}
                    {layout === 'in-depth' && (
                        <>
                            <Card>
                                <CardHeader><CardTitle>Premium Technical Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField name="valueProposition" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Value Proposition</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. Accurate pasture evaluation in minutes..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="authorityStatement" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Authority Statement (Quote + Attribution)</FormLabel>
                                            <FormControl>
                                                <Textarea rows={6} {...field} placeholder="“The DPM offers a rapid, objective measure...”&#10;— Frits van Oudtshoorn, Ecologist..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>How It Works & Field Use</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField name="howItWorks" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Operational Instructions (Technical)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} rows={6} placeholder="Describe the steps to use the tool...&#10;1. Position...&#10;2. Release..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField name="fieldUse" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Field Application (Practical)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    {...field} 
                                                    rows={6} 
                                                    placeholder="In real-world conditions, the DPM is deployed...&#10;• Grazing capacity...&#10;• Fire planning..." 
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
                                                    placeholder="DPM readings must be calibrated to local grass species..." 
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
                            <CardHeader>
                                <CardTitle>Book Key Features</CardTitle>
                                <CardDescription>Botanical or publication highlights.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Highlights List</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => appendFeature('')}><PlusCircle className="mr-2"/>Add Feature</Button>
                                </div>
                                <div className="space-y-2">
                                    {featureFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <FormField control={form.control} name={`features.${index}`} render={({ field }) => (
                                                <FormItem className="flex-grow"><FormControl><Input {...field} placeholder="e.g. 1000+ full-colour photographs" /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}><Trash className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                    {featureFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No features added.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Technical Specifications - Applicable to In-Depth and Book */}
                    {(layout === 'in-depth' || layout === 'book') && (
                        <Card>
                            <CardHeader className="flex-row items-center justify-between">
                                <CardTitle>{layout === 'book' ? 'Publication Info' : 'Technical Specifications'}</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ feature: '', description: '' })}><PlusCircle className="mr-2"/>Add Row</Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {specFields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                                        <FormField control={form.control} name={`specifications.${index}.feature`} render={({ field }) => (
                                            <FormItem><FormControl><Input {...field} placeholder="e.g. Material or ISBN" /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name={`specifications.${index}.description`} render={({ field }) => (
                                            <FormItem><FormControl><Input {...field} placeholder="Details..."/></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)}><Trash className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                {specFields.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No specifications added.</p>}
                            </CardContent>
                        </Card>
                    )}

                    <Button type="submit" size="lg" className="w-full">{product ? "Save Changes" : "Create Product"}</Button>
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
