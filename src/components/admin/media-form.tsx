
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useFirestore, useStorage } from "@/firebase";
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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import React from "react";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  description: z.string().min(5, "Description is required"),
  imageHint: z.string().optional(),
  file: z.any().optional(),
});

interface MediaFormProps {
    image: SiteImage | null;
    onSuccess: () => void;
}

export function MediaForm({ image, onSuccess }: MediaFormProps) {
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();
    const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);

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

        const file = values.file?.[0] as File;

        if (file) {
            const storageRef = ref(storage, `siteImages/${image.id}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    toast({ variant: "destructive", title: "Upload failed", description: error.message });
                    setUploadProgress(null);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        const imageRef = doc(firestore, 'siteImages', image.id);
                        const dataToSave = {
                            ...values,
                            imageUrl: downloadURL,
                        };
                        delete dataToSave.file;

                        setDocumentNonBlocking(imageRef, dataToSave, { merge: true });
                        toast({ title: "Image details updated!" });
                        setUploadProgress(null);
                        onSuccess();
                    });
                }
            );
        } else {
            const imageRef = doc(firestore, 'siteImages', image.id);
            const dataToSave = { ...values };
            delete dataToSave.file;
            setDocumentNonBlocking(imageRef, dataToSave, { merge: true });
            toast({ title: "Image details updated!" });
            onSuccess();
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Image ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{image?.id}</p>
                </div>
                 <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload New Image (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {uploadProgress !== null && <Progress value={uploadProgress} className="w-full" />}

                <p className="text-xs text-center text-muted-foreground">OR</p>

                <FormField name="imageUrl" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://images.unsplash.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="description" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Description (for alt text)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="imageHint" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input placeholder="e.g. grassland savanna" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <Button type="submit" disabled={uploadProgress !== null}>
                    {uploadProgress !== null ? 'Uploading...' : 'Save Changes'}
                </Button>
            </form>
        </Form>
    )
}
