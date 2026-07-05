"use client";

import React from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductImageSelector } from "@/components/admin/product-image-selector";
import { slugify } from "@/lib/utils";
import type { FieldNote, Product } from "@/lib/types";
import { ImagePlus, XCircle } from "lucide-react";

const NONE = "__none__";

const formSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().optional(),
  category: z.string().min(2, "Category is required"),
  deck: z.string().min(10, "A short summary is required"),
  coverImageUrl: z.string().optional(),
  takeaways: z.string().optional(),
  body: z.string().min(20, "Article body is required"),
  pullQuote: z.string().optional(),
  relatedProductId: z.string().optional(),
  isPublished: z.boolean().default(true),
});

type Values = z.infer<typeof formSchema>;

export function FieldNoteForm({ note, onSuccess }: { note: FieldNote | null; onSuccess: () => void }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const isEditing = !!note;

  const productsQuery = useMemoFirebase(() => query(collection(firestore, "products"), orderBy("name")), [firestore]);
  const { data: products } = useCollection<Product>(productsQuery);

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || "",
      slug: note?.slug || "",
      category: note?.category || "",
      deck: note?.deck || "",
      coverImageUrl: note?.coverImageUrl || "",
      takeaways: (note?.takeaways || []).join("\n"),
      body: note?.body || "",
      pullQuote: note?.pullQuote || "",
      relatedProductId: note?.relatedProductId || NONE,
      isPublished: note?.isPublished ?? true,
    },
  });

  const coverUrl = form.watch("coverImageUrl");

  function onSubmit(values: Values) {
    const slug = (values.slug?.trim() || slugify(values.title)).replace(/^\/+|\/+$/g, "");
    const takeaways = (values.takeaways || "").split("\n").map((s) => s.trim()).filter(Boolean);
    const data: Record<string, unknown> = {
      slug,
      title: values.title,
      category: values.category,
      deck: values.deck,
      coverImageUrl: values.coverImageUrl || null,
      takeaways,
      body: values.body,
      pullQuote: values.pullQuote || null,
      relatedProductId: values.relatedProductId && values.relatedProductId !== NONE ? values.relatedProductId : null,
      isPublished: values.isPublished,
      updatedAt: serverTimestamp(),
    };

    if (isEditing && note) {
      setDocumentNonBlocking(doc(firestore, "fieldNotes", note.id), data, { merge: true });
      toast({ title: "Field note updated!" });
    } else {
      setDocumentNonBlocking(doc(firestore, "fieldNotes", slug), { ...data, publishedAt: serverTimestamp() }, { merge: true });
      toast({ title: "Field note created!" });
    }
    onSuccess();
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="e.g. How to Calculate Grazing Capacity" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="slug" render={({ field }) => (
              <FormItem>
                <FormLabel>Slug <span className="font-normal text-muted-foreground">(auto from title)</span></FormLabel>
                <FormControl><Input placeholder="how-to-calculate-grazing-capacity" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl><Input placeholder="e.g. Grazing Management" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="deck" render={({ field }) => (
            <FormItem>
              <FormLabel>Summary / deck</FormLabel>
              <FormControl><Textarea rows={2} placeholder="One or two sentences shown under the title and in cards + meta description." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Feature image */}
          <FormItem>
            <FormLabel>Feature image</FormLabel>
            {coverUrl ? (
              <div className="relative aspect-[16/10] w-full max-w-xs overflow-hidden rounded-md border">
                <Image src={coverUrl} alt="Feature image" fill className="object-cover" />
                <Button type="button" variant="destructive" size="icon" className="absolute right-2 top-2 h-7 w-7" onClick={() => form.setValue("coverImageUrl", "")}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button type="button" onClick={() => setPickerOpen(true)} className="flex aspect-[16/10] w-full max-w-xs flex-col items-center justify-center rounded-md border-2 border-dashed text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                <ImagePlus className="h-6 w-6" />
                <span className="mt-1 text-xs">Choose from media library</span>
              </button>
            )}
            <FormDescription>Shown as the article&rsquo;s hero and card image. Leave empty for the default pattern.</FormDescription>
          </FormItem>

          <FormField control={form.control} name="takeaways" render={({ field }) => (
            <FormItem>
              <FormLabel>Key takeaways <span className="font-normal text-muted-foreground">(one per line)</span></FormLabel>
              <FormControl><Textarea rows={3} placeholder={"Grazing capacity is measured in ha/LSU.\nMeasure biomass objectively, not by eye.\nAlways leave a safe grazing fraction."} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="body" render={({ field }) => (
            <FormItem>
              <FormLabel>Article body <span className="font-normal text-muted-foreground">(markdown-lite)</span></FormLabel>
              <FormControl><Textarea rows={14} className="font-mono text-[13px]" placeholder={"## Section heading\n\nA paragraph of body text. Blank line separates paragraphs.\n\n- A bullet point\n- Another bullet\n\n> A pull-out quote inline\n\n**Bold** text and an [internal link](/shop)."} {...field} /></FormControl>
              <FormDescription>Use ## for headings, blank lines for paragraphs, - for bullets, &gt; for quotes, **bold**, and [text](/link).</FormDescription>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="pullQuote" render={({ field }) => (
            <FormItem>
              <FormLabel>Pull quote <span className="font-normal text-muted-foreground">(optional)</span></FormLabel>
              <FormControl><Textarea rows={2} placeholder="A standout line highlighted in the article." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="relatedProductId" render={({ field }) => (
            <FormItem>
              <FormLabel>Referenced product <span className="font-normal text-muted-foreground">(optional)</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value || NONE}>
                <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {products?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormDescription>Shown as a &ldquo;Referenced in this article&rdquo; card that links to the product.</FormDescription>
            </FormItem>
          )} />

          <FormField control={form.control} name="isPublished" render={({ field }) => (
            <FormItem className="flex items-center gap-3 rounded-lg border p-3">
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <div>
                <FormLabel className="!mt-0">Published</FormLabel>
                <p className="text-xs text-muted-foreground">Visible on the public Field Notes pages</p>
              </div>
            </FormItem>
          )} />

          <Button type="submit" className="w-full">{isEditing ? "Save changes" : "Create field note"}</Button>
        </form>
      </Form>

      <ProductImageSelector
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onImageSelect={(img) => form.setValue("coverImageUrl", img.imageUrl)}
      />
    </>
  );
}
