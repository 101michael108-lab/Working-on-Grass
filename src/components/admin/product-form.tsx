
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import type { Product, EnabledSections, MediaLibraryItem } from "@/lib/types";
import { ProductImageSelector } from './product-image-selector';
import Image from 'next/image';
import {
  ImagePlus, XCircle, PlusCircle, Trash, ChevronDown,
  BookOpen, Users, Wrench, MapPin, Table2, Quote, Sparkles, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const sectionSchema = z.object({
  longDescription: z.boolean().default(false),
  whatsInside: z.boolean().default(false),
  whoItsFor: z.boolean().default(false),
  howItWorks: z.boolean().default(false),
  fieldApplication: z.boolean().default(false),
  specifications: z.boolean().default(false),
  expertRecommendation: z.boolean().default(false),
  valueProposition: z.boolean().default(false),
  calibrationNote: z.boolean().default(false),
});

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(5, "Short description is required"),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  category: z.string().min(2, "Category is required"),
  sku: z.string().optional(),
  brand: z.string().optional(),

  enabledSections: sectionSchema,

  longDescription: z.string().optional(),
  valueProposition: z.string().optional(),
  authorityStatement: z.string().optional(),
  specifications: z.array(z.object({
    feature: z.string().min(1),
    description: z.string().min(1),
  })).optional(),
  features: z.array(z.object({ text: z.string().min(1) })).optional(),
  howItWorks: z.string().optional(),
  fieldUse: z.string().optional(),
  calibrationNote: z.string().optional(),
  targetAudience: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Constants ─────────────────────────────────────────────────────────────────

const productCategories = [
  "Measurement & Tools",
  "Books & Field Guides",
  "Seeds & Pasture Products",
  "Online Courses",
];

type SectionKey = keyof EnabledSections;

const SECTIONS: {
  key: SectionKey;
  label: string;
  hint: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    key: "longDescription",
    label: "About This Product",
    hint: "Full editorial body — paragraphs shown below the header",
    icon: BookOpen,
    color: "text-primary",
  },
  {
    key: "whatsInside",
    label: "What's Inside",
    hint: "Bullet-point highlights — great for books & guides",
    icon: BookOpen,
    color: "text-primary",
  },
  {
    key: "whoItsFor",
    label: "Who It's For",
    hint: "Audience description — farmers, ecologists, students…",
    icon: Users,
    color: "text-accent",
  },
  {
    key: "howItWorks",
    label: "How It Works",
    hint: "Step-by-step operational instructions",
    icon: Wrench,
    color: "text-primary",
  },
  {
    key: "fieldApplication",
    label: "Field Application & Use",
    hint: "Practical real-world use cases and deployment context",
    icon: MapPin,
    color: "text-primary",
  },
  {
    key: "specifications",
    label: "Technical Specifications",
    hint: "Key/value spec table — material, dimensions, accuracy…",
    icon: Table2,
    color: "text-muted-foreground",
  },
  {
    key: "expertRecommendation",
    label: "Expert Recommendation",
    hint: "Authority quote with attribution — creates trust",
    icon: Quote,
    color: "text-accent",
  },
  {
    key: "valueProposition",
    label: "Value Proposition",
    hint: "Short bold callout banner — one compelling sentence",
    icon: Sparkles,
    color: "text-accent",
  },
  {
    key: "calibrationNote",
    label: "Calibration Note",
    hint: "Technical alert shown below the spec table",
    icon: AlertTriangle,
    color: "text-amber-600",
  },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isImageSelectorOpen, setImageSelectorOpen] = React.useState(false);
  const [images, setImages] = React.useState<string[]>(product?.images || []);

  // Which accordion panels are currently open (independent of enabled state)
  const [openPanels, setOpenPanels] = React.useState<string[]>(() =>
    SECTIONS.filter(s => product?.enabledSections?.[s.key]).map(s => s.key)
  );

  const defaultSections: EnabledSections = product?.enabledSections ?? {};

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      category: product?.category ?? "Measurement & Tools",
      sku: product?.sku ?? "",
      brand: product?.brand ?? "",
      enabledSections: {
        longDescription: defaultSections.longDescription ?? false,
        whatsInside: defaultSections.whatsInside ?? false,
        whoItsFor: defaultSections.whoItsFor ?? false,
        howItWorks: defaultSections.howItWorks ?? false,
        fieldApplication: defaultSections.fieldApplication ?? false,
        specifications: defaultSections.specifications ?? false,
        expertRecommendation: defaultSections.expertRecommendation ?? false,
        valueProposition: defaultSections.valueProposition ?? false,
        calibrationNote: defaultSections.calibrationNote ?? false,
      },
      longDescription: product?.longDescription ?? "",
      valueProposition: product?.valueProposition ?? "",
      authorityStatement: product?.authorityStatement ?? "",
      specifications: product?.specifications ?? [],
      features: product?.features?.map(t => ({ text: t })) ?? [],
      howItWorks: product?.howItWorks ?? "",
      fieldUse: product?.fieldUse ?? "",
      calibrationNote: product?.calibrationNote ?? "",
      targetAudience: product?.targetAudience ?? "",
    },
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } =
    useFieldArray({ control: form.control, name: "specifications" });
  const { fields: featureFields, append: appendFeature, remove: removeFeature } =
    useFieldArray({ control: form.control, name: "features" });

  // Toggle a section: updates form value AND opens the accordion
  const handleSectionToggle = (key: SectionKey, enabled: boolean) => {
    form.setValue(`enabledSections.${key}`, enabled, { shouldDirty: true });
    setOpenPanels(prev =>
      enabled ? [...new Set([...prev, key])] : prev.filter(k => k !== key)
    );
  };

  async function onSubmit(values: FormValues) {
    const productData = {
      ...values,
      price: Number(values.price),
      stock: Number(values.stock),
      images,
      features: values.features?.map(f => f.text) ?? [],
    };

    if (product) {
      const ref = doc(firestore, 'products', product.id);
      setDocumentNonBlocking(ref, productData, { merge: true });
      toast({ title: "Product updated!" });
    } else {
      const col = collection(firestore, 'products');
      addDocumentNonBlocking(col, productData);
      toast({ title: "Product created!" });
    }
    onSuccess();
  }

  const handleImageSelected = (image: MediaLibraryItem) => {
    if (!images.includes(image.imageUrl)) {
      setImages(prev => [...prev, image.imageUrl]);
    }
  };

  const handleRemoveImage = (url: string) => {
    setImages(prev => prev.filter(img => img !== url));
  };

  const enabledSections = form.watch("enabledSections");

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          {/* ── Core Details ─────────────────────────────────────────── */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Core Details</p>

              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Guide to Grasses of Southern Africa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField name="price" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (R)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="stock" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventory</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="category" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productCategories.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField name="sku" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU <span className="font-normal text-muted-foreground">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="DPM-001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="brand" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand <span className="font-normal text-muted-foreground">(optional)</span></FormLabel>
                    <FormControl><Input placeholder="Working on Grass" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* ── Short Description ────────────────────────────────────── */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Short Description</p>
              <FormField name="description" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tagline{" "}
                    <span className="font-normal text-muted-foreground">— shown directly under the title and on product cards</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="A single compelling sentence that appears in the header and product listing."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          {/* ── Images ───────────────────────────────────────────────── */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Product Images{images.length > 0 && ` · ${images.length} added`}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {images.map(url => (
                  <div key={url} className="relative group aspect-square">
                    <Image src={url} alt="Product image" fill className="object-cover rounded-md" />
                    <Button
                      type="button" variant="destructive" size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full hidden group-hover:flex"
                      onClick={() => handleRemoveImage(url)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setImageSelectorOpen(true)}
                  className="aspect-square flex flex-col items-center justify-center rounded-md border-2 border-dashed text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ImagePlus className="h-6 w-6" />
                  <span className="text-xs mt-1">Add</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* ── Section Toggles ───────────────────────────────────────── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">
              Page Sections — toggle on to show on product page
            </p>

            <AccordionPrimitive.Root
              type="multiple"
              value={openPanels}
              onValueChange={setOpenPanels}
              className="space-y-2"
            >
              {SECTIONS.map(({ key, label, hint, icon: Icon, color }) => {
                const isEnabled = enabledSections[key] ?? false;
                return (
                  <AccordionPrimitive.Item
                    key={key}
                    value={key}
                    className={cn(
                      "rounded-lg border overflow-hidden transition-colors",
                      isEnabled ? "border-primary/30 bg-primary/[0.02]" : "border-border bg-background"
                    )}
                  >
                    {/* Header row: trigger (chevron + label) + switch */}
                    <AccordionPrimitive.Header className="flex items-stretch">
                      <AccordionPrimitive.Trigger
                        className="flex flex-1 items-center gap-3 px-4 py-3.5 text-left hover:bg-accent/30 transition-colors [&[data-state=open]>span.chevron-icon]:rotate-180 min-w-0"
                      >
                        <span className="chevron-icon transition-transform duration-200 shrink-0">
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </span>
                        <Icon className={cn("h-4 w-4 shrink-0", color)} />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-semibold leading-tight", isEnabled ? "text-foreground" : "text-muted-foreground")}>
                            {label}
                          </p>
                          <p className="text-xs text-muted-foreground leading-snug mt-0.5 truncate">
                            {hint}
                          </p>
                        </div>
                      </AccordionPrimitive.Trigger>

                      {/* Switch — outside trigger to avoid nested button */}
                      <div
                        className="flex items-center gap-2 px-4 border-l border-border bg-muted/20 shrink-0"
                        onClick={e => e.stopPropagation()}
                      >
                        <span className={cn("text-xs font-medium w-6 text-right", isEnabled ? "text-primary" : "text-muted-foreground")}>
                          {isEnabled ? "On" : "Off"}
                        </span>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={enabled => handleSectionToggle(key, enabled)}
                        />
                      </div>
                    </AccordionPrimitive.Header>

                    {/* Content */}
                    <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="px-4 pb-5 pt-3 border-t border-border/60 bg-muted/10">
                        {key === "longDescription" && (
                          <FormField name="longDescription" control={form.control} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Editorial Body</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={10}
                                  placeholder={"Write the full editorial description here.\n\nUse blank lines between paragraphs.\nStart lines with '•' to create bullet points within the body."}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}

                        {key === "whatsInside" && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">Each item becomes a checkmark bullet on the product page</p>
                              <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ text: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4" />Add Highlight
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {featureFields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                  <FormField control={form.control} name={`features.${index}.text`} render={({ field }) => (
                                    <FormItem className="flex-grow">
                                      <FormControl>
                                        <Input {...field} placeholder="e.g. 350 grass species, clearly described and illustrated" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {featureFields.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-md">
                                  No highlights yet — click Add Highlight above
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {key === "whoItsFor" && (
                          <FormField name="targetAudience" control={form.control} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Audience</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={5}
                                  placeholder={"• Farmers and land managers\n• Ecologists conducting surveys\n• Students in ecology and agriculture\n• Game rangers and conservationists"}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}

                        {key === "howItWorks" && (
                          <FormField name="howItWorks" control={form.control} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Operational Instructions</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={7}
                                  placeholder={"Describe the steps to use the tool or product.\n1. Position the disc...\n2. Release and read..."}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}

                        {key === "fieldApplication" && (
                          <FormField name="fieldUse" control={form.control} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Field Application</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={7}
                                  placeholder={"Describe real-world use cases and deployment context.\n• Grazing capacity assessment\n• Fire management planning\n• Invasive species monitoring"}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}

                        {key === "specifications" && (
                          <div className="space-y-3">
                            <div className="flex justify-end">
                              <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ feature: '', description: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4" />Add Row
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {specFields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                                  <FormField control={form.control} name={`specifications.${index}.feature`} render={({ field }) => (
                                    <FormItem><FormControl><Input {...field} placeholder="e.g. Material" /></FormControl><FormMessage /></FormItem>
                                  )} />
                                  <FormField control={form.control} name={`specifications.${index}.description`} render={({ field }) => (
                                    <FormItem><FormControl><Input {...field} placeholder="e.g. Aircraft-grade aluminium" /></FormControl><FormMessage /></FormItem>
                                  )} />
                                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)}>
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {specFields.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-md">
                                  No rows yet — click Add Row above
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {key === "expertRecommendation" && (
                          <FormField name="authorityStatement" control={form.control} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quote + Attribution</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={5}
                                  placeholder={`"The DPM offers a rapid, objective measure of standing biomass..."\n— Frits van Oudtshoorn, Ecologist & Author`}
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground mt-1">
                                First line = quote text. Second line = attribution (name, title).
                              </p>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}

                        {key === "valueProposition" && (
                          <FormField name="valueProposition" control={form.control} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Value Proposition</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Accurate pasture evaluation in under 2 minutes, anywhere in the field."
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground mt-1">
                                One bold callout sentence — shown as a full-width banner on the product page.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}

                        {key === "calibrationNote" && (
                          <FormField name="calibrationNote" control={form.control} render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calibration / Technical Note</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={4}
                                  placeholder="DPM readings must be calibrated to local grass species using a cut-and-weigh procedure..."
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground mt-1">
                                Shown as an amber alert box. Displayed below the spec table if both are enabled.
                              </p>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </div>
                    </AccordionPrimitive.Content>
                  </AccordionPrimitive.Item>
                );
              })}
            </AccordionPrimitive.Root>
          </div>

          <Button type="submit" size="lg" className="w-full mt-2">
            {product ? "Save Changes" : "Create Product"}
          </Button>
        </form>
      </Form>

      <ProductImageSelector
        open={isImageSelectorOpen}
        onOpenChange={setImageSelectorOpen}
        onImageSelect={handleImageSelected}
      />
    </>
  );
}
