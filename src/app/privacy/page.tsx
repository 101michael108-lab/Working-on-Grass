import { Container } from "@/components/redesign/ui";

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="border-b border-line bg-cream-band">
        <Container className="py-[clamp(40px,5vw,64px)]">
          <div className="mb-2 font-mono text-[12px] text-gold-deep">Legal</div>
          <h1 className="m-0 font-headline text-[clamp(30px,3.6vw,44px)] font-medium tracking-[-0.02em] text-ink">Privacy Policy</h1>
        </Container>
      </section>

      <Container className="py-[clamp(40px,5vw,64px)]">
        <div className="max-w-[820px] space-y-8 text-[15px] leading-[1.7] text-body-soft">
          <p className="m-0 text-[13px] text-body-faint">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">1. Introduction</h2>
            <p className="m-0">Working on Grass (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website workingongrass.co.za. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">2. Information collection and use</h2>
            <p className="m-0">We collect several different types of information for various purposes to provide and improve our Service to you.</p>
            <ul className="m-0 list-disc space-y-1.5 pl-6">
              <li><strong className="font-semibold text-ink">Email address:</strong> for order confirmations and communication.</li>
              <li><strong className="font-semibold text-ink">First and last name:</strong> for order fulfilment and shipping.</li>
              <li><strong className="font-semibold text-ink">Address, province, postal code, city:</strong> for delivery of physical products.</li>
              <li><strong className="font-semibold text-ink">Usage data:</strong> we may also collect information on how the Service is accessed and used.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">3. Payment information</h2>
            <p className="m-0">We use third-party services for payment processing (e.g. PayFast). We will not store or collect your payment card details. That information is provided directly to our third-party payment processors, whose use of your personal information is governed by their Privacy Policy.</p>
          </section>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">4. Disclosure of data</h2>
            <p className="m-0">Working on Grass may disclose your personal data in the good-faith belief that such action is necessary to comply with a legal obligation, protect and defend the rights or property of Working on Grass, or protect the personal safety of users of the Service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="m-0 font-headline text-[22px] font-semibold text-ink">5. Contact us</h2>
            <p className="m-0">If you have any questions about this Privacy Policy, please contact us at admin@workingongrass.co.za.</p>
          </section>
        </div>
      </Container>
    </>
  );
}
