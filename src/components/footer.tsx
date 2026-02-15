
"use client";

import { Logo } from "@/components/logo";
import Link from "next/link";
import { Mail, Phone, Search } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) return null;

  return (
    <footer className="w-full bg-secondary/50 border-t-2 border-primary/5">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sustainable & Regenerative Land Use Advisory since 2003. Led by grassland ecologist Frits van Oudtshoorn.
            </p>
            <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="border-2 border-primary/20">
                    <Link href="/track-order">
                        <Search className="mr-2 h-3 w-3" /> Track My Order
                    </Link>
                </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold font-headline text-lg text-primary">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-accent" />
                <div>
                    <span className="block font-semibold">Office Support</span>
                    <span className="text-muted-foreground">+27 71 866 1331</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-accent" />
                <div>
                    <span className="block font-semibold">Frits van Oudtshoorn</span>
                    <span className="text-muted-foreground">+27 78 228 0008</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-accent" />
                <div>
                    <span className="block font-semibold">Email Inquiry</span>
                    <span className="text-muted-foreground">courses@alut.co.za</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold font-headline text-lg text-primary">Location</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Working on Grass HQ</p>
              <p>Modimolle, Limpopo</p>
              <p>0510, South Africa</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold font-headline text-lg text-primary">Quick Links</h4>
            <ul className="grid grid-cols-2 lg:grid-cols-1 gap-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
                <li><Link href="/shop" className="hover:text-primary transition-colors">Shop</Link></li>
                <li><Link href="/seeds" className="hover:text-primary transition-colors">Seeds</Link></li>
                <li><Link href="/resources" className="hover:text-primary transition-colors">Resources</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Working on Grass. All rights reserved.</p>
          <div className="flex gap-6">
              <span>Secure Payments by PayFast</span>
              <span>Nationwide Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Button } from "@/components/ui/button";
