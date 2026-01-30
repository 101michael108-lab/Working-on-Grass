
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useFirestore, useStorage } from "@/firebase";
import { doc, collection, serverTimestamp } from "firebase/firestore";
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
import type { MediaLibraryItem } from "@/lib/types";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import React from "react";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().optional(),
  file: z.any().optional(),
});

interface MediaLibraryFormProps {
    mediaItem: MediaLibraryItem | null;
    onSuccess: () => void;
}

export function MediaLibraryForm({ mediaItem, onSuccess }: MediaLibraryFormProps) {
    const firestore = useFirestore();
    const storage = useStorage();
    const { toast } = useToast();
    const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
    const isEditing = !!mediaItem;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: mediaItem?.name || "",
            description: mediaItem?.description || "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const file = values.file?.[0] as File;
        
        if (!file && !isEditing) {
            toast({ variant: "destructive", title: "No file selected", description: "Please select a file to upload." });
            return;
        }

        const handleSave = (imageUrl?: string) => {
            const dataToSave = {
                name: values.name,
                description: values.description || "",
                imageUrl: imageUrl || mediaItem?.imageUrl,
                uploadedAt: mediaItem?.uploadedAt || serverTimestamp(),
            };

            if (!dataToSave.imageUrl) {
                 toast({ variant: "destructive", title: "Missing Image URL", description: "Could not save media item." });
                 return;
            }

            if (isEditing && mediaItem) {
                const itemRef = doc(firestore, 'mediaLibrary', mediaItem.id);
                setDocumentNonBlocking(itemRef, dataToSave, { merge: true });
                toast({ title: "Media item updated!" });
            } else {
                const collectionRef = collection(firestore, 'mediaLibrary');
                addDocumentNonBlocking(collectionRef, dataToSave);
                toast({ title: "Image uploaded to library!" });
            }

            setUploadProgress(null);
            onSuccess();
        }

        if (file) {
            const fileName = `${new Date().getTime()}-${file.name}`;
            const storageRef = ref(storage, `mediaLibrary/${fileName}`);
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
                    getDownloadURL(uploadTask.snapshot.ref).then(handleSave);
                }
            );
        } else if (isEditing) {
            handleSave();
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Veld Assessment Photo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A short description for alt text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isEditing && (
                    <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Image File</FormLabel>
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
                )}
                

                {uploadProgress !== null && <Progress value={uploadProgress} className="w-full" />}

                <Button type="submit" disabled={uploadProgress !== null} className="w-full">
                    {isEditing 
                        ? 'Save Changes'
                        : uploadProgress !== null ? 'Uploading...' : 'Upload and Save'
                    }
                </Button>
            </form>
        </Form>
    )
}
