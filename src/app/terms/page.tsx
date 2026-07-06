import { Container } from "@/components/redesign/ui";

export default function TermsPage() {
  return (
    <>
      <section className="border-b border-line bg-cream-band">
        <Container className="py-[clamp(40px,5vw,64px)]">
          <div className="mb-2 font-mono text-[12px] text-gold-deep">Legal</div>
          <h1 className="m-0 font-headline text-[clamp(30px,3.6vw,44px)] font-medium tracking-[-0.02em] text-ink">Terms &amp; Conditions</h1>
        </Container>
      </section>

      <Container className="py-[clamp(40px,5vw,64px)]">
        <div className="max-w-[820px] space-y-8 text-[15px] leading-[1.7] text-body-soft">
          <p className="m-0 text-[13px] text-body-faint">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">1. Agreement to terms</h2>
            <p className="m-0">By accessing our website at workingongrass.co.za, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
          </section>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">2. Use licence</h2>
            <p className="m-0">Permission is granted to temporarily download one copy of the materials (information or software) on Working on Grass&rsquo;s website for personal, non-commercial transitory viewing only.</p>
          </section>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">3. E-commerce &amp; payments</h2>
            <p className="m-0">All prices are listed in South African Rand (ZAR) unless otherwise stated. We reserve the right to refuse or cancel any order. Payment must be cleared before goods are dispatched.</p>
          </section>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">4. Shipping &amp; delivery</h2>
            <p className="m-0">Shipping fees are calculated at checkout. Delivery times are estimates and may vary based on location and courier performance. Working on Grass is not liable for delays caused by third-party logistics providers.</p>
          </section>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">5. Refunds &amp; returns</h2>
            <p className="m-0">If you are not satisfied with your purchase, please contact us within 14 days of receipt. Custom seed mixtures and digital products (online courses) are generally non-refundable unless defective.</p>
          </section>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">6. Governing law</h2>
            <p className="m-0">These terms and conditions are governed by and construed in accordance with the laws of South Africa, and you irrevocably submit to the exclusive jurisdiction of the courts in that jurisdiction.</p>
          </section>
        </div>
      </Container>
    </>
  );
}
