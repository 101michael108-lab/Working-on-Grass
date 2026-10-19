"use client";

import React, { useEffect, useState } from "react";
import { Container, Eyebrow } from "@/components/redesign/ui";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useToast } from "@/hooks/use-toast";
import { submitInquiry } from "@/lib/submit-inquiry";
import { track } from "@/lib/analytics";
import { HoneypotField } from "@/components/forms/honeypot-field";
import { FormSent } from "@/components/forms/form-sent";

const labelCls = "flex flex-col gap-1.5";
const span = "text-[12px] font-semibold text-[#43483F]";
const input = "h-[46px] rounded-[3px] border border-line-strong bg-[#F7F4EC] px-3.5 font-body text-[14px] text-ink outline-none transition-colors focus:border-forest placeholder:text-body-faint";

const DETAILS = [
  { label: "Office support", value: "+27 71 866 1331", href: "tel:+27718661331", mono: true },
  { label: "Frits van Oudtshoorn", value: "+27 78 228 0008", href: "tel:+27782280008", mono: true },
  { label: "Email", value: "admin@workingongrass.co.za", href: "mailto:admin@workingongrass.co.za", mono: false },
];

const EMPTY_FORM = { name: "", email: "", phone: "", subject: "", message: "", website: "" };

function ContactForm() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // Links like /contact?service=… prefill the subject. Read from window (not
  // useSearchParams) so the form is in the server HTML instead of a Suspense
  // "Loading form…" placeholder.
  useEffect(() => {
    const service = new URLSearchParams(window.location.search).get("service");
    if (service) setForm((f) => ({ ...f, subject: service }));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Phone-only is fine: many farmers would rather be called than emailed.
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim()) || form.message.trim().length < 10) {
      toast({ variant: "destructive", title: "Please complete the form", description: "Your name, a phone number or email, and a short message." });
      return;
    }
    setSubmitting(true);
    try {
      await submitInquiry("contact", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        serviceInterestedIn: form.subject || "General Inquiry",
        message: form.message,
        website: form.website,
      });
      track("generate_lead", { form_name: "contact", service: form.subject || "General Inquiry" });
      setSent(true);
      setForm(EMPTY_FORM);
    } catch {
      toast({ variant: "destructive", title: "Could not send message", description: "Please try again, or reach us on WhatsApp." });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <FormSent title="Thanks — your message is on its way." onReset={() => setSent(false)}>
        Frits will be in touch soon, usually within 1 business day.
      </FormSent>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid grid-cols-1 gap-4 min-[520px]:grid-cols-2">
      <HoneypotField value={form.website} onChange={set("website")} />
      <label className={labelCls}><span className={span}>Name</span><input value={form.name} onChange={set("name")} autoComplete="name" className={input} /></label>
      <label className={labelCls}><span className={span}>Phone</span><input type="tel" value={form.phone} onChange={set("phone")} placeholder="+27" autoComplete="tel" className={input} /></label>
      <label className={`${labelCls} min-[520px]:col-span-2`}><span className={span}>Email</span><input type="email" value={form.email} onChange={set("email")} placeholder="you@farm.co.za" autoComplete="email" className={input} /></label>
      <p className="m-0 -mt-1 text-[12px] text-body-faint min-[520px]:col-span-2">A phone number or email is enough — whichever you prefer.</p>
      <label className={`${labelCls} min-[520px]:col-span-2`}><span className={span}>Subject</span><input value={form.subject} onChange={set("subject")} className={input} /></label>
      <label className={`${labelCls} min-[520px]:col-span-2`}><span className={span}>Message</span><textarea rows={4} value={form.message} onChange={set("message")} className={`${input} h-auto resize-y py-3`} /></label>
      <button type="submit" disabled={submitting} className="col-span-1 h-[50px] rounded-[3px] bg-forest font-body text-[14.5px] font-semibold text-ondark-bright transition-colors hover:bg-forest-dark disabled:opacity-60 min-[520px]:col-span-2">
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-line bg-cream-band">
        <Container className="py-[clamp(48px,6vw,72px)] pb-[clamp(40px,5vw,56px)]">
          <Eyebrow rule tone="green" className="mb-4">Get in touch</Eyebrow>
          <h1 className="m-0 font-headline text-[clamp(34px,4.4vw,56px)] font-medium leading-[1.06] tracking-[-0.02em] text-ink">Contact us</h1>
          <p className="m-0 mt-[18px] max-w-[560px] font-body text-[17px] leading-[1.65] text-body">Questions about a product, a consultation or a seed mix? Reach us directly — we’ll make sure you get to the right person.</p>
        </Container>
      </section>

      <Container className="grid grid-cols-1 items-start gap-14 py-[clamp(48px,6vw,72px)] min-[940px]:grid-cols-[0.85fr_1.15fr]">
        {/* Details */}
        <div className="flex flex-col gap-[22px]">
          {DETAILS.map((d) => (
            <div key={d.label}>
              <div className="mb-1.5 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-body-faint">{d.label}</div>
              <a href={d.href} className={`text-ink no-underline hover:text-forest ${d.mono ? "font-mono text-[15px]" : "text-[14.5px]"}`}>{d.value}</a>
            </div>
          ))}
          <div>
            <div className="mb-1.5 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-body-faint">Location</div>
            <p className="m-0 text-[14px] leading-[1.6] text-[#43483F]">Working on Grass HQ<br />Modimolle, Limpopo<br />0510, South Africa</p>
          </div>
          <a href="https://wa.me/27782280008?text=Hi%20Frits%2C%20I%27d%20like%20to%20get%20in%20touch." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 self-start rounded-[3px] bg-[#25D366] px-[22px] py-[13px] text-[14px] font-semibold text-white no-underline transition-opacity hover:opacity-90">
            <WhatsAppIcon className="h-[17px] w-[17px]" /> WhatsApp Frits
          </a>
        </div>

        {/* Form */}
        <div className="rounded-[4px] border border-line bg-cream-card p-[clamp(24px,3vw,36px)] shadow-lifted">
          <h2 className="m-0 mb-5 font-headline text-[22px] font-semibold text-ink">Send a message</h2>
          <ContactForm />
        </div>
      </Container>
    </>
  );
}
