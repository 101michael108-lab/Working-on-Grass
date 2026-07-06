import Link from "next/link";
import { Container } from "@/components/redesign/ui";

export default function NotFound() {
  return (
    <Container className="py-[clamp(64px,9vw,120px)]">
      <div className="mx-auto max-w-[560px] text-center">
        <div className="font-mono text-[13px] font-medium uppercase tracking-[0.18em] text-gold-deep">Error 404</div>
        <h1 className="m-0 mt-4 font-headline text-[clamp(34px,5vw,60px)] font-medium leading-[1.05] tracking-[-0.02em] text-ink">This page has gone to seed</h1>
        <p className="m-0 mx-auto mt-4 max-w-[440px] font-body text-[16px] leading-[1.65] text-body-soft">
          The page you’re after doesn’t exist or has moved. Let’s get you back onto solid ground.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-[3px] bg-forest px-6 py-3.5 text-[14px] font-semibold text-ondark-bright no-underline hover:bg-forest-dark">Back to home</Link>
          <Link href="/shop" className="rounded-[3px] border border-line-strong px-6 py-3.5 text-[14px] font-semibold text-forest no-underline transition-colors hover:border-forest">Browse the shop</Link>
        </div>
      </div>
    </Container>
  );
}
