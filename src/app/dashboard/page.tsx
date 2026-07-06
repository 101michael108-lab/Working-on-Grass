"use client";
import { useUser } from "@/firebase";
import Link from "next/link";
import { ShoppingCart, User as UserIcon, Store, ArrowRight } from "lucide-react";

const CARDS = [
  { href: "/dashboard/orders", title: "My orders", body: "View your order history and track fulfilment status.", icon: ShoppingCart },
  { href: "/dashboard/profile", title: "My profile", body: "Update your name and manage your account details.", icon: UserIcon },
  { href: "/shop", title: "Continue shopping", body: "Books, field instruments and resources from the land.", icon: Store },
];

export default function DashboardPage() {
  const { user } = useUser();
  return (
    <div>
      <div className="mb-1 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-gold-deep">Your account</div>
      <h1 className="m-0 mb-2 font-headline text-[clamp(26px,3vw,34px)] font-medium tracking-[-0.02em] text-ink">
        Welcome, {user?.displayName || "there"}
      </h1>
      <p className="m-0 mb-8 text-[15px] text-body-soft">Manage your orders and account from here.</p>

      <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 min-[940px]:grid-cols-3">
        {CARDS.map(({ href, title, body, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-[4px] border border-line bg-cream-card p-6 no-underline shadow-lifted transition-shadow hover:shadow-lifted-lg"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[3px] bg-cream-band">
              <Icon className="h-5 w-5 text-forest" strokeWidth={1.7} />
            </div>
            <h2 className="m-0 mb-1.5 font-headline text-[18px] font-semibold text-ink">{title}</h2>
            <p className="m-0 flex-grow text-[13.5px] leading-[1.6] text-body-soft">{body}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-forest">
              Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
