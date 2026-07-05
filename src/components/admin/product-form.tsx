
"use client";

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { useFirestore, useStorage } from "@/firebase";
import { collection, doc, deleteField } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
import { Progress } from "@/components/ui/progress";
import type { Product, EnabledSections, MediaLibraryItem } from "@/lib/types";
import { ProductImageSelector } from './product-image-selector';
import Image from 'next/image';
import {
  ImagePlus, XCircle, PlusCircle, Trash, ChevronDown, FileText, UploadCloud,
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
  shippingFee: z.union([z.literal(''), z.coerce.number().nonnegative()]).optional(),
  isDigital: z.boolean().default(false),
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
  const storage = useStorage();
  const { toast } = useToast();
  const [isImageSelectorOpen, setImageSelectorOpen] = React.useState(false);
  const [images, setImages] = React.useState<string[]>(product?.images || []);
  const [guideUrl, setGuideUrl] = React.useState<string | undefined>(product?.guideUrl);
  const [guideName, setGuideName] = React.useState<string | undefined>(product?.guideName);
  const [guideProgress, setGuideProgress] = React.useState<number | null>(null);

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
      shippingFee:
        product?.shippingFee != null ? product.shippingFee : '',
      isDigital: product?.isDigital ?? false,
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
    const { shippingFee: shippingFeeInput, ...rest } = values;
    const productData: Record<string, unknown> = {
      ...rest,
      price: Number(values.price),
      stock: Number(values.stock),
      images,
      features: values.features?.map(f => f.text) ?? [],
    };

    if (values.isDigital) {
      // Digital products never ship — drop any override so it can't linger.
      if (product) productData.shippingFee = deleteField();
    } else if (shippingFeeInput !== '' && shippingFeeInput != null) {
      productData.shippingFee = Number(shippingFeeInput);
    } else if (product) {
      productData.shippingFee = deleteField();
    }

    if (guideUrl) {
      productData.guideUrl = guideUrl;
      productData.guideName = guideName ?? null;
    } else if (product) {
      productData.guideUrl = deleteField();
      productData.guideName = deleteField();
    }

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

  const handleGuideSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file after a removal
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast({ variant: 'destructive', title: 'PDF only', description: 'The guide must be a PDF file.' });
      return;
    }

    const fileName = `${new Date().getTime()}-${file.name}`;
    const storageRef = ref(storage, `productGuides/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    setGuideProgress(0);

    uploadTask.on(
      'state_changed',
      (snapshot) => setGuideProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
      (error) => {
        console.error('Guide upload failed:', error);
        toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
        setGuideProgress(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setGuideUrl(url);
          setGuideName(file.name);
          setGuideProgress(null);
          toast({ title: 'Guide attached', description: file.name });
        });
      }
    );
  };

  const handleRemoveGuide = () => {
    setGuideUrl(undefined);
    setGuideName(undefined);
  };

  const enabledSections = form.watch("enabledSections");
  const isDigital = form.watch("isDigital");

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="price" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (R, incl. VAT)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <p className="text-[10px] text-muted-foreground italic">Enter the final price the customer pays. VAT (15%) is already included — it is not added on at checkout.</p>
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
              </div>
              <FormField name="isDigital" control={form.control} render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5 pr-4">
                    <FormLabel>Digital product</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      No shipping is ever charged for this item (e.g. a PDF, e-book, or online course).
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              {!isDigital && (
                <FormField name="shippingFee" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping fee override (R)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        placeholder="Leave empty to use store default from Settings"
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={
                          field.value === '' || field.value === undefined
                            ? ''
                            : field.value
                        }
                        onChange={(e) => {
                          const raw = e.target.value;
                          field.onChange(raw === '' ? '' : Number(raw));
                        }}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Optional. When set, checkout uses this instead of the global shipping fee for orders containing this product.
                    </p>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
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

          {/* ── Digital Guide (emailed on purchase) ──────────────────── */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Digital Guide <span className="font-normal normal-case tracking-normal">— PDF emailed to the buyer after purchase</span>
              </p>

              {guideUrl ? (
                <div className="flex items-center gap-3 rounded-md border bg-muted/20 px-3 py-2.5">
                  <FileText className="h-5 w-5 shrink-0 text-primary" />
                  <a
                    href={guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0 truncate text-sm font-medium hover:underline"
                  >
                    {guideName || 'Attached guide (PDF)'}
                  </a>
                  <Button type="button" variant="ghost" size="icon" onClick={handleRemoveGuide}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : guideProgress !== null ? (
                <div className="space-y-2">
                  <Progress value={guideProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground">Uploading… {Math.round(guideProgress)}%</p>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed py-6 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                  <UploadCloud className="h-6 w-6" />
                  <span className="text-sm">Upload PDF guide</span>
                  <span className="text-xs">Attached automatically to this product's order confirmation email</span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleGuideSelected} />
                </label>
              )}
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
