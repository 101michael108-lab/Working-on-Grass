
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useFirestore, useStorage } from "@/firebase";
import { doc, collection, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Resource } from "@/lib/types";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import React from "react";
import { Progress } from "@/components/ui/progress";

const RESOURCE_TYPES = ['PDF', 'Video', 'Article', 'Template', 'Guide', 'Map', 'Checklist'] as const;

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  resourceType: z.enum(RESOURCE_TYPES),
  fileUrl: z.string().optional(),
  file: z.any().optional(),
  relatedHref: z.string().optional(),
  relatedLabel: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
  isPublished: z.boolean().default(true),
});

interface ResourceFormProps {
  resource: Resource | null;
  onSuccess: () => void;
}

export function ResourceForm({ resource, onSuccess }: ResourceFormProps) {
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(null);
  const isEditing = !!resource;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resource?.title || "",
      description: resource?.description || "",
      resourceType: resource?.resourceType || 'PDF',
      fileUrl: resource?.fileUrl || "",
      relatedHref: resource?.relatedHref || "",
      relatedLabel: resource?.relatedLabel || "",
      sortOrder: resource?.sortOrder ?? 0,
      isPublished: resource?.isPublished ?? true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const file = values.file?.[0] as File | undefined;

    const saveData = async (fileUrl: string) => {
      const dataToSave = {
        title: values.title,
        description: values.description,
        resourceType: values.resourceType,
        fileUrl,
        relatedHref: values.relatedHref || "",
        relatedLabel: values.relatedLabel || "",
        sortOrder: values.sortOrder,
        isPublished: values.isPublished,
        createdAt: resource?.createdAt || serverTimestamp(),
      };

      if (isEditing && resource) {
        const itemRef = doc(firestore, 'resources', resource.id);
        setDocumentNonBlocking(itemRef, dataToSave, { merge: true });
        toast({ title: "Resource updated!" });
      } else {
        const collectionRef = collection(firestore, 'resources');
        await addDocumentNonBlocking(collectionRef, dataToSave);
        toast({ title: "Resource created!" });
      }
      setUploadProgress(null);
      onSuccess();
    };

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `resources/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          toast({ variant: "destructive", title: "Upload failed", description: error.message });
          setUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => saveData(url));
        }
      );
    } else {
      await saveData(values.fileUrl || resource?.fileUrl || "");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input placeholder="e.g. Disc Pasture Meter Guide" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Brief description shown on the resources page..." rows={3} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="resourceType" render={({ field }) => (
            <FormItem>
              <FormLabel>Resource Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  {RESOURCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="sortOrder" render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Order</FormLabel>
              <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="file" render={({ field }) => (
          <FormItem>
            <FormLabel>Upload File {isEditing && "(leave empty to keep existing)"}</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,video/*,image/*"
                onChange={(e) => field.onChange(e.target.files)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {isEditing && resource?.fileUrl && (
          <p className="text-xs text-muted-foreground">
            Current file:{" "}
            <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              View current file
            </a>
          </p>
        )}

        <FormField control={form.control} name="fileUrl" render={({ field }) => (
          <FormItem>
            <FormLabel>Or paste an external URL</FormLabel>
            <FormControl><Input placeholder="https://..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="relatedHref" render={({ field }) => (
            <FormItem>
              <FormLabel>Related Link (Optional)</FormLabel>
              <FormControl><Input placeholder="/shop" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="relatedLabel" render={({ field }) => (
            <FormItem>
              <FormLabel>Related Label (Optional)</FormLabel>
              <FormControl><Input placeholder="e.g. Buy in Shop" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="isPublished" render={({ field }) => (
          <FormItem className="flex items-center gap-3 rounded-lg border p-3">
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div>
              <FormLabel className="!mt-0">Published</FormLabel>
              <p className="text-xs text-muted-foreground">Visible to visitors on the Resources page</p>
            </div>
          </FormItem>
        )} />

        {uploadProgress !== null && <Progress value={uploadProgress} className="w-full" />}

        <Button type="submit" disabled={uploadProgress !== null} className="w-full">
          {isEditing
            ? "Save Changes"
            : uploadProgress !== null
            ? "Uploading..."
            : "Create Resource"}
        </Button>
      </form>
    </Form>
  );
}
