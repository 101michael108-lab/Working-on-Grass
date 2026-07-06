"use client";

import React, { useState } from "react";
import { Container, Eyebrow } from "@/components/redesign/ui";
import { useToast } from "@/hooks/use-toast";
import { submitInquiry } from "@/lib/submit-inquiry";

const WHY = [
  { n: 1, title: "Matched to your conditions", body: "Rainfall, soil type and altitude determine which species will actually establish and persist." },
  { n: 2, title: "Matched to your purpose", body: "Grazing pasture, cover, or rehabilitation each call for different species and ratios." },
  { n: 3, title: "Expert-formulated", body: "Every mix is put together by Frits, drawing on decades of establishment experience." },
];

const PURPOSES = ["Grazing pasture", "Soil cover / stabilisation", "Rehabilitation", "Other / not sure"];

const labelCls = "flex flex-col gap-1.5";
const span = "text-[12px] font-semibold text-[#43483F]";
const input = "h-[46px] rounded-[3px] border border-line-strong bg-[#F7F4EC] px-3.5 font-body text-[14px] text-ink outline-none transition-colors focus:border-forest placeholder:text-body-faint";

export default function SeedsPage() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", region: "", area: "", purpose: PURPOSES[0], notes: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ variant: "destructive", title: "Please add your name and email", description: "So we can send your quote." });
      return;
    }
    setSubmitting(true);
    try {
      await submitInquiry("contact", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.region,
        serviceInterestedIn: `Seed mix: ${form.purpose}`,
        farmSize: form.area,
        primaryUse: form.purpose,
        message: form.notes,
      });
      toast({ title: "Seed quote requested", description: "Thanks — Frits will respond with a tailored recommendation shortly." });
      setForm({ name: "", email: "", phone: "", region: "", area: "", purpose: PURPOSES[0], notes: "" });
    } catch {
      toast({ variant: "destructive", title: "Could not send your enquiry", description: "Please try again, or reach us on WhatsApp." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-cream-band">
        <Container className="py-[clamp(48px,6vw,72px)] pb-[clamp(40px,5vw,56px)]">
          <Eyebrow rule tone="green" className="mb-4">Grass seed</Eyebrow>
          <h1 className="m-0 font-headline text-[clamp(34px,4.4vw,56px)] font-medium leading-[1.06] tracking-[-0.02em] text-ink">Custom grass seed mixes</h1>
          <p className="m-0 mt-[18px] max-w-[600px] font-body text-[17px] leading-[1.65] text-body">Seed isn’t sold off the shelf here. As a registered Barenbrug agent, Frits formulates mixes matched to your rainfall, soil and purpose — because the right species in the wrong place simply won’t establish.</p>
        </Container>
      </section>

      <Container className="grid grid-cols-1 items-start gap-14 py-[clamp(48px,6vw,72px)] min-[940px]:grid-cols-[0.95fr_1.05fr]">
        {/* Why */}
        <div>
          <h2 className="m-0 mb-5 font-headline text-[clamp(24px,3vw,32px)] font-medium tracking-[-0.02em] text-ink">Why we quote per case</h2>
          <div className="flex flex-col gap-[18px]">
            {WHY.map((w) => (
              <div key={w.n} className="flex items-start gap-3.5">
                <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-forest font-mono text-[13px] text-ondark-bright">{w.n}</span>
                <div>
                  <h3 className="m-0 mb-1 font-headline text-[17px] font-semibold text-ink">{w.title}</h3>
                  <p className="m-0 text-[13.5px] leading-[1.6] text-body-soft">{w.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-[4px] border border-line bg-cream-card p-[clamp(24px,3vw,36px)] shadow-lifted">
          <h2 className="m-0 mb-5 font-headline text-[22px] font-semibold text-ink">Request a seed quote</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
            <label className={labelCls}><span className={span}>Full name</span><input value={form.name} onChange={set("name")} placeholder="Your name" className={input} /></label>
            <label className={labelCls}><span className={span}>Email</span><input type="email" value={form.email} onChange={set("email")} placeholder="you@farm.co.za" className={input} /></label>
            <label className={labelCls}><span className={span}>Phone</span><input type="tel" value={form.phone} onChange={set("phone")} placeholder="+27" className={input} /></label>
            <label className={labelCls}><span className={span}>Region / district</span><input value={form.region} onChange={set("region")} placeholder="e.g. Limpopo" className={input} /></label>
            <label className={labelCls}><span className={span}>Area to plant (ha)</span><input value={form.area} onChange={set("area")} placeholder="e.g. 40" className={input} /></label>
            <label className={labelCls}><span className={span}>Purpose</span>
              <select value={form.purpose} onChange={set("purpose")} className={`${input} appearance-none`}>
                {PURPOSES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label className={`${labelCls} min-[520px]:col-span-2`}><span className={span}>Notes on soil &amp; conditions</span><textarea rows={3} value={form.notes} onChange={set("notes")} placeholder="Soil type, rainfall, current cover…" className={`${input} h-auto resize-y py-3`} /></label>
            <button type="submit" disabled={submitting} className="col-span-1 h-[50px] rounded-[3px] bg-forest font-body text-[14.5px] font-semibold text-ondark-bright transition-colors hover:bg-forest-dark disabled:opacity-60 min-[520px]:col-span-2">
              {submitting ? "Sending…" : "Request quote"}
            </button>
          </form>
        </div>
      </Container>
    </>
  );
}
