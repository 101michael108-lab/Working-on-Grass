import { Logo } from "@/components/logo";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-secondary/50">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Sustainable & Regenerative Land Use Advisory since 2003.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold font-headline">Contact Info</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>Office: +27 71 866 1331</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>Frits: +27 78 228 0008</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>courses@alut.co.za</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold font-headline">Location</h4>
            <p className="text-sm text-muted-foreground">
              Modimolle<br />
              Limpopo, 0510<br />
              South Africa
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold font-headline">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/services" className="hover:text-foreground">Services</Link></li>
                <li><Link href="/shop" className="hover:text-foreground">Shop</Link></li>
                <li><Link href="/seeds" className="hover:text-foreground">Seeds</Link></li>
                <li><Link href="/resources" className="hover:text-foreground">Resources</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Working on Grass. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
