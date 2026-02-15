
export default function TermsPage() {
  return (
    <div className="container py-12 md:py-20 max-w-4xl">
      <h1 className="text-4xl font-bold font-headline mb-8">Terms and Conditions</h1>
      <div className="prose prose-stone max-w-none text-muted-foreground space-y-6">
        <p>
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
          <p>
            By accessing our website at workingongrass.co.za, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on Working on Grass's website for personal, non-commercial transitory viewing only.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">3. E-commerce & Payments</h2>
          <p>
            All prices are listed in South African Rand (ZAR) unless otherwise stated. We reserve the right to refuse or cancel any order. Payment must be cleared before goods are dispatched.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">4. Shipping & Delivery</h2>
          <p>
            Shipping fees are calculated at checkout. Delivery times are estimates and may vary based on location and courier performance. Working on Grass is not liable for delays caused by third-party logistics providers.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">5. Refunds & Returns</h2>
          <p>
            If you are not satisfied with your purchase, please contact us within 14 days of receipt. Custom seed mixtures and digital products (online courses) are generally non-refundable unless defective.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">6. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of South Africa and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>
      </div>
    </div>
  );
}
