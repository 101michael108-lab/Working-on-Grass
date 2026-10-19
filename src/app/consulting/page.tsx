"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container, Eyebrow, ctaPrimary } from "@/components/redesign/ui";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useToast } from "@/hooks/use-toast";
import { submitInquiry } from "@/lib/submit-inquiry";
import { track } from "@/lib/analytics";
import { HoneypotField } from "@/components/forms/honeypot-field";

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

/** Default dropdown choice, so leads who don't know the jargon aren't mislabelled. */
const NOT_SURE = "Not sure yet — advise me";
const SERVICE_OPTIONS = [NOT_SURE, ...SERVICES.map((s) => s.title)];
const EMPTY_FORM = { name: "", phone: "", email: "", size: "", service: NOT_SURE, message: "", website: "" };
const WA_CONSULT = "https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20discuss%20a%20consultation.";

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
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Many farmers would rather be phoned than emailed: either one is enough.
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      toast({ variant: "destructive", title: "Please add your name and a phone number or email", description: "So Frits can get back to you." });
      return;
    }
    setSubmitting(true);
    try {
      await submitInquiry("consultation", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        contactDetail: form.email || form.phone,
        propertySize: form.size,
        location: "",
        service: form.service,
        needs: form.message,
        website: form.website,
      });
      track("generate_lead", { form_name: "consultation", service: form.service });
      setSent(true);
      setForm(EMPTY_FORM);
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
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href="#request" className={ctaPrimary}>Request a consultation</a>
            <a href={WA_CONSULT} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[14px] font-semibold text-forest no-underline">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> or WhatsApp Frits
            </a>
          </div>
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
      <section id="request" className="mt-[clamp(48px,6vw,72px)] scroll-mt-[72px] border-t border-line bg-forest-bark text-ondark">
        <Container className="grid grid-cols-1 items-start gap-12 py-[clamp(48px,6vw,72px)] min-[940px]:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow tone="gold" className="mb-3.5">Request a consultation</Eyebrow>
            <h2 className="m-0 mb-3.5 font-headline text-[clamp(24px,3vw,34px)] font-medium tracking-[-0.01em] text-ondark-bright">Tell us about your land</h2>
            <p className="m-0 mb-[22px] max-w-[380px] text-[14px] leading-[1.7] text-ondark-soft">Share a few details and Frits’s team will be in touch to scope the right assessment for your situation.</p>
            <a href={WA_CONSULT} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-[13.5px] text-ondark no-underline">
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Prefer to talk? WhatsApp +27 78 228 0008
            </a>
          </div>
          {sent ? (
            <div role="status" className="rounded-[4px] border border-[rgba(237,239,232,0.2)] bg-[#16241B] p-7">
              <h3 className="m-0 mb-2 font-headline text-[22px] font-medium text-ondark-bright">Thank you — your enquiry is in.</h3>
              <p className="m-0 mb-5 text-[14px] leading-[1.7] text-ondark-soft">
                Frits&rsquo;s team will be in touch, usually within 1 business day. If it&rsquo;s urgent, WhatsApp Frits on +27 78 228 0008.
              </p>
              <button type="button" onClick={() => setSent(false)} className="text-[13.5px] font-semibold text-gold underline-offset-2 hover:underline">
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="relative grid grid-cols-1 gap-4 min-[560px]:grid-cols-2">
              <HoneypotField value={form.website} onChange={set("website")} />
              <label className={labelCls}><span className={darkSpan}>Full name</span><input value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" className={darkInput} /></label>
              <label className={labelCls}><span className={darkSpan}>Phone</span><input type="tel" value={form.phone} onChange={set("phone")} placeholder="+27" autoComplete="tel" className={darkInput} /></label>
              <label className={labelCls}><span className={darkSpan}>Email</span><input type="email" value={form.email} onChange={set("email")} placeholder="you@farm.co.za" autoComplete="email" className={darkInput} /></label>
              <label className={labelCls}><span className={darkSpan}>Property size (ha)</span><input value={form.size} onChange={set("size")} placeholder="e.g. 800" inputMode="decimal" className={darkInput} /></label>
              <p className="m-0 -mt-1 text-[12px] text-ondark-faint min-[560px]:col-span-2">A phone number or email is enough — whichever you prefer.</p>
              <label className={`${labelCls} min-[560px]:col-span-2`}><span className={darkSpan}>Service needed</span>
                <select value={form.service} onChange={set("service")} className={`${darkInput} appearance-none`}>
                  {SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className={`${labelCls} min-[560px]:col-span-2`}><span className={darkSpan}>Tell us about your land</span><textarea rows={3} value={form.message} onChange={set("message")} placeholder="Location, current challenge, what you’d like to achieve…" className={`${darkInput} h-auto resize-y py-3`} /></label>
              <button type="submit" disabled={submitting} className="col-span-1 h-[50px] rounded-[3px] bg-gold font-body text-[14.5px] font-semibold text-forest-dark transition-opacity hover:opacity-90 disabled:opacity-60 min-[560px]:col-span-2">
                {submitting ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          )}
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
