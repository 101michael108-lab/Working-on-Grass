
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Image as ImageIcon, XCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.string().min(2, "Category is required"),
  sku: z.string().optional(),
  brand: z.string().optional(),
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
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const productData = { 
            ...values, 
            price: Number(values.price),
            image: selectedImageUrl,
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
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
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
                        </div>
                        <div className="md:col-span-1 space-y-2">
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

                    <Button type="submit">{product ? "Save Changes" : "Create Product"}</Button>
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
