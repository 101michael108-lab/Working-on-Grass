
export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 md:py-20 max-w-4xl">
      <h1 className="text-4xl font-bold font-headline mb-8">Privacy Policy</h1>
      <div className="prose prose-stone max-w-none text-muted-foreground space-y-6">
        <p>
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
          <p>
            Working on Grass ("we", "us", or "our") operates the website workingongrass.co.za. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">2. Information Collection and Use</h2>
          <p>
            We collect several different types of information for various purposes to provide and improve our Service to you.
          </p>
          <ul className="list-disc pl-6">
            <li><strong>Email address:</strong> For order confirmations and communication.</li>
            <li><strong>First name and last name:</strong> For order fulfillment and shipping.</li>
            <li><strong>Address, State, Province, ZIP/Postal code, City:</strong> For delivery of physical products.</li>
            <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used.</li>
          </ul>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">3. Payment Information</h2>
          <p>
            We use third-party services for payment processing (e.g. PayFast). We will not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">4. Disclosure of Data</h2>
          <p>
            Working on Grass may disclose your Personal Data in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend the rights or property of Working on Grass, or protect the personal safety of users of the Service.
          </p>
        </section>
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at admin@workingongrass.co.za.
          </p>
        </section>
      </div>
    </div>
  );
}
