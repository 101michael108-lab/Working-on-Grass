"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Menu, X, ShoppingCart, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { clearAdminSession } from "@/lib/admin-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/consulting", label: "Consulting" },
  { href: "/shop", label: "Shop" },
  { href: "/seeds", label: "Seeds" },
  { href: "/grassPro", label: "GrassPro" },
  { href: "/resources", label: "Resources" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { user } = useUser();
  const auth = useAuth();
  const isAdmin = useIsAdmin();

  const isAdminPage = pathname?.startsWith("/admin");
  if (isAdminPage) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  const handleSignOut = async () => {
    if (user) await clearAdminSession(user);
    await signOut(auth);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-forest-dark border-b border-[rgba(237,239,232,0.12)]">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-6 px-[22px] min-[940px]:px-10">
        <Logo variant="onDark" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-[13.5px] font-medium min-[940px]:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={cn(
                "no-underline transition-colors hover:text-white",
                isActive(link.href) ? "text-white" : "text-ondark-sage"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3.5">
          <Link
            href="/cart"
            prefetch={false}
            aria-label="Shopping cart"
            className="relative flex items-center text-[#EDEFE8] transition-opacity hover:opacity-80"
          >
            <ShoppingCart className="h-[21px] w-[21px]" strokeWidth={1.6} />
            {cartItemCount > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-forest-dark">
                {cartItemCount}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full">
                  <UserAvatar user={user} className="h-8 w-8" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem disabled>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href={isAdmin ? "/admin" : "/dashboard"}>
                  <DropdownMenuItem>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{isAdmin ? "Admin dashboard" : "Dashboard"}</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              className="hidden rounded-[3px] border border-[rgba(237,239,232,0.3)] px-4 py-2 text-[13px] font-semibold text-[#EDEFE8] no-underline transition-colors hover:bg-[rgba(237,239,232,0.08)] min-[940px]:inline-flex"
            >
              Log in
            </Link>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex items-center justify-center p-1 text-[#EDEFE8] min-[940px]:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="flex flex-col gap-0.5 border-t border-[rgba(237,239,232,0.12)] px-[22px] pb-5 pt-3 min-[940px]:hidden">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "px-1.5 py-[11px] text-[15px] font-medium no-underline",
                i < navLinks.length - 1 && "border-b border-[rgba(237,239,232,0.1)]",
                isActive(link.href) ? "text-[#EDEFE8]" : "text-ondark-sage"
              )}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => { setMenuOpen(false); handleSignOut(); }}
              className="mt-3 rounded-[3px] border border-[rgba(237,239,232,0.25)] py-3 text-center text-[14px] font-semibold text-[#EDEFE8]"
            >
              Log out
            </button>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/login" prefetch={false} onClick={() => setMenuOpen(false)} className="rounded-[3px] bg-gold py-3 text-center text-[14px] font-semibold text-forest-dark no-underline">
                Log in
              </Link>
              <Link href="/signup" prefetch={false} onClick={() => setMenuOpen(false)} className="rounded-[3px] border border-[rgba(237,239,232,0.25)] py-3 text-center text-[14px] font-semibold text-[#EDEFE8] no-underline">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
