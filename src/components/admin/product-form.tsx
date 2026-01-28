
"use client";

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
import type { Product } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  category: z.string().min(2, "Category is required"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  imageHint: z.string().optional(),
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

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            description: product?.description || "",
            price: product?.price || 0,
            category: product?.category || "Instruments",
            image: product?.image || "",
            imageHint: product?.imageHint || "",
            sku: product?.sku || "",
            brand: product?.brand || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const productData = { ...values, price: Number(values.price) };
        if (product) {
            // Update existing product
            const productRef = doc(firestore, 'products', product.id);
            setDocumentNonBlocking(productRef, productData, { merge: true });
            toast({ title: "Product updated!" });
        } else {
            // Add new product
            const productsCollection = collection(firestore, 'products');
            addDocumentNonBlocking(productsCollection, productData);
            toast({ title: "Product added!" });
        }
        onSuccess();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="description" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
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
                 <FormField name="image" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://picsum.photos/seed/..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="imageHint" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input placeholder="e.g. metal instrument" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <div className="grid grid-cols-2 gap-4">
                    <FormField name="sku" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>SKU (Optional)</FormLabel><FormControl><Input placeholder="DPM-001" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="brand" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Brand (Optional)</FormLabel><FormControl><Input placeholder="Working on Grass" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <Button type="submit">{product ? "Save Changes" : "Create Product"}</Button>
            </form>
        </Form>
    )
}
