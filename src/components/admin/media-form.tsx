
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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
import type { SiteImage } from "@/lib/types";

const formSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL"),
  description: z.string().min(5, "Description is required"),
  imageHint: z.string().optional(),
});

interface MediaFormProps {
    image: SiteImage | null;
    onSuccess: () => void;
}

export function MediaForm({ image, onSuccess }: MediaFormProps) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            imageUrl: image?.imageUrl || "",
            description: image?.description || "",
            imageHint: image?.imageHint || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!image) return;

        const imageRef = doc(firestore, 'siteImages', image.id);
        setDocumentNonBlocking(imageRef, values, { merge: true });
        toast({ title: "Image details updated!" });
        
        onSuccess();
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Image ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{image?.id}</p>
                </div>
                <FormField name="imageUrl" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://images.unsplash.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="description" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Description (for alt text)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="imageHint" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input placeholder="e.g. grassland savanna" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <Button type="submit">Save Changes</Button>
            </form>
        </Form>
    )
}
