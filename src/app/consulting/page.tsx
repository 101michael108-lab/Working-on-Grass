"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container, Eyebrow, ctaPrimary } from "@/components/redesign/ui";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useToast } from "@/hooks/use-toast";
import { submitInquiry } from "@/lib/submit-inquiry";

const SERVICES = [
  { n: "01", title: "Veld condition assessment", body: "A structured evaluation of species composition, veld condition and trend — the baseline for every management decision." },
  { n: "02", title: "Grazing-capacity studies", body: "Objective, defensible stocking-rate recommendations based on measured biomass and long-term rainfall." },
  { n: "03", title: "Rehabilitation plans", body: "Staged restoration strategies for degraded veld and disturbed sites, including mine rehabilitation." },
  { n: "04", title: "Grazing management", body: "Camp layout, rotation and rest planning tailored to your land, animals and objectives." },
  { n: "05", title: "Custom seed formulation", body: "Species mixes matched to your rainfall, soil and purpose — as a registered Barenbrug agent." },
  { n: "06", title: "Training & talks", body: "Practical grass-identification and veld-management training for teams, students and organisations." },
];

const PROCESS = [
  { n: 1, title: "Enquiry", body: "Tell us about your land, your goals and the challenge you’re facing." },
  { n: 2, title: "Field assessment", body: "On-site evaluation with objective measurement, not guesswork." },
  { n: 3, title: "Report & plan", body: "A clear, actionable plan tailored to your land and objectives." },
  { n: 4, title: "Follow-up", body: "Ongoing support as the plan is put into practice on the ground." },
];

const labelCls = "flex flex-col gap-1.5";
const darkSpan = "text-[12px] font-semibold text-[#C4C7BB]";
const darkInput = "h-[46px] rounded-[3px] border border-[rgba(237,239,232,0.2)] bg-[#16241B] px-3.5 font-body text-[14px] text-ondark outline-none transition-colors focus:border-gold placeholder:text-ondark-faint";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Environmental and Agricultural Consultation",
  provider: {
    "@type": "LocalBusiness",
    name: "Working on Grass",
    address: { "@type": "PostalAddress", addressLocality: "Modimolle", addressRegion: "Limpopo", addressCountry: "ZA" },
  },
  areaServed: "Southern Africa",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Land Management Services",
    itemListElement: SERVICES.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.title, description: s.body } })),
  },
};

export default function ConsultingPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", size: "", service: SERVICES[0].title, message: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ variant: "destructive", title: "Please add your name and email", description: "So Frits can get back to you." });
      return;
    }
    setSubmitting(true);
    try {
      await submitInquiry("consultation", {
        name: form.name,
        contactDetail: form.email || form.phone,
        location: "",
        service: form.service,
        needs: [form.message, form.phone && `Phone: ${form.phone}`, form.size && `Property size: ${form.size} ha`].filter(Boolean).join("\n\n"),
      });
      toast({ title: "Enquiry sent", description: "Frits’s team will be in touch, usually within 1 business day." });
      setForm({ name: "", phone: "", email: "", size: "", service: SERVICES[0].title, message: "" });
    } catch {
      toast({ variant: "destructive", title: "Could not send enquiry", description: "Please try again, or reach us on WhatsApp." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="border-b border-line bg-cream-band">
        <Container className="py-[clamp(48px,6vw,72px)] pb-[clamp(40px,5vw,56px)]">
          <Eyebrow rule tone="green" className="mb-4">Consulting &amp; advisory</Eyebrow>
          <h1 className="m-0 font-headline text-[clamp(34px,4.4vw,56px)] font-medium leading-[1.06] tracking-[-0.02em] text-ink">Expert veld &amp; land-use consulting</h1>
          <p className="m-0 mt-[18px] max-w-[600px] font-body text-[17px] leading-[1.65] text-body">Frits works directly with farmers, game reserves, land managers and the mining sector — turning thirty years of field science into practical, site-specific plans for your land.</p>
        </Container>
      </section>

      {/* Services */}
      <Container className="pb-4 pt-[clamp(48px,6vw,72px)]">
        <h2 className="m-0 mb-8 font-headline text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.02em] text-ink">Services</h2>
        <div className="grid grid-cols-1 gap-6 min-[720px]:grid-cols-2 min-[940px]:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.n} className="rounded-[4px] border border-line bg-cream-card p-7">
              <div className="mb-3.5 font-mono text-[12px] text-gold-deep">{s.n}</div>
              <h3 className="m-0 mb-2.5 font-headline text-[20px] font-semibold text-ink">{s.title}</h3>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Process */}
      <Container className="pb-4 pt-[clamp(48px,6vw,72px)]">
        <h2 className="m-0 mb-8 font-headline text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.02em] text-ink">How it works</h2>
        <div className="grid grid-cols-1 gap-5 min-[560px]:grid-cols-2 min-[940px]:grid-cols-4">
          {PROCESS.map((p) => (
            <div key={p.n}>
              <div className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-forest font-mono text-[13px] font-medium text-ondark-bright">{p.n}</div>
              <h3 className="m-0 mb-1.5 font-headline text-[17px] font-semibold text-ink">{p.title}</h3>
              <p className="m-0 text-[13px] leading-[1.55] text-body-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* Lead-gen form */}
      <section className="mt-[clamp(48px,6vw,72px)] border-t border-line bg-forest-bark text-ondark">
        <Container className="grid grid-cols-1 items-start gap-12 py-[clamp(48px,6vw,72px)] min-[940px]:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow tone="gold" className="mb-3.5">Request a consultation</Eyebrow>
            <h2 className="m-0 mb-3.5 font-headline text-[clamp(24px,3vw,34px)] font-medium tracking-[-0.01em] text-ondark-bright">Tell us about your land</h2>
            <p className="m-0 mb-[22px] max-w-[380px] text-[14px] leading-[1.7] text-ondark-soft">Share a few details and Frits’s team will be in touch to scope the right assessment for your situation.</p>
            <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20discuss%20a%20consultation." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-[13.5px] text-ondark no-underline">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Prefer to talk? WhatsApp +27 78 228 0008
            </a>
          </div>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2">
            <label className={labelCls}><span className={darkSpan}>Full name</span><input value={form.name} onChange={set("name")} placeholder="Your name" className={darkInput} /></label>
            <label className={labelCls}><span className={darkSpan}>Phone</span><input type="tel" value={form.phone} onChange={set("phone")} placeholder="+27" className={darkInput} /></label>
            <label className={labelCls}><span className={darkSpan}>Email</span><input type="email" value={form.email} onChange={set("email")} placeholder="you@farm.co.za" className={darkInput} /></label>
            <label className={labelCls}><span className={darkSpan}>Property size (ha)</span><input value={form.size} onChange={set("size")} placeholder="e.g. 800" className={darkInput} /></label>
            <label className={`${labelCls} min-[560px]:col-span-2`}><span className={darkSpan}>Service needed</span>
              <select value={form.service} onChange={set("service")} className={`${darkInput} appearance-none`}>
                {SERVICES.map((s) => <option key={s.title}>{s.title}</option>)}
              </select>
            </label>
            <label className={`${labelCls} min-[560px]:col-span-2`}><span className={darkSpan}>Tell us about your land</span><textarea rows={3} value={form.message} onChange={set("message")} placeholder="Location, current challenge, what you’d like to achieve…" className={`${darkInput} h-auto resize-y py-3`} /></label>
            <button type="submit" disabled={submitting} className="col-span-1 h-[50px] rounded-[3px] bg-gold font-body text-[14.5px] font-semibold text-forest-dark transition-opacity hover:opacity-90 disabled:opacity-60 min-[560px]:col-span-2">
              {submitting ? "Sending…" : "Send enquiry"}
            </button>
          </form>
        </Container>
      </section>

      {/* Tools cross-link */}
      <Container className="py-[clamp(40px,5vw,64px)]">
        <div className="flex flex-col items-center justify-between gap-5 rounded-[4px] border border-dashed border-line-strong bg-cream-panel p-8 text-center min-[720px]:flex-row min-[720px]:text-left">
          <div>
            <h3 className="m-0 mb-1 font-headline text-[19px] font-semibold text-ink">Essential tools for veld assessment</h3>
            <p className="m-0 text-[13.5px] text-body-soft">We recommend the Disc Pasture Meter for accurate, objective biomass estimation.</p>
          </div>
          <Link href="/shop" className={`${ctaPrimary} shrink-0`}>Explore measurement tools</Link>
        </div>
      </Container>
    </>
  );
}
