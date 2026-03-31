"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Menu, ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { doc, getDoc } from "firebase/firestore";
import { useLanguage } from "@/context/language-context";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/consulting", label: "Consulting" },
  { href: "/shop", label: "Shop" },
  { href: "/seeds", label: "Seeds" },
  { href: "/grassPro", label: "GrassPro" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = React.useState(false);

  // Hide header on admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  React.useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      });
    } else {
      setIsAdmin(false);
    }
  }, [user, firestore]);

  if (isAdminPage) return null;

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-foreground/80",
        pathname === href ? "text-foreground font-semibold" : "text-foreground/60"
      )}
      prefetch={false}
    >
      {label}
    </Link>
  );

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background")}>
      <div className="container flex h-16 items-center justify-between">
        
        {/* Left Group */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu (Sheet) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="border-b p-4">
                  <SheetClose asChild>
                      <Logo />
                  </SheetClose>
                </SheetHeader>
                <div className="flex h-full flex-col justify-between">
                    <nav className="grid gap-2 p-4 text-lg font-medium">
                    {navLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                        <Link
                            href={link.href}
                            className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                            pathname === link.href
                                ? "bg-muted text-primary font-semibold"
                                : "text-muted-foreground hover:text-primary",
                            )}
                            prefetch={false}
                        >
                            {link.label}
                        </Link>
                        </SheetClose>
                    ))}
                    </nav>
                    <div className="mt-auto p-4 border-t">
                    {user ? (
                        <div className="grid gap-2 text-base font-medium">
                            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{user.displayName || 'User'}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                            </div>
                            <Separator className="my-2"/>
                            <SheetClose asChild>
                            <Link
                                href={isAdmin ? "/admin" : "/dashboard"}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <LayoutDashboard className="h-5 w-5" />
                                Dashboard
                            </Link>
                            </SheetClose>
                            <Button onClick={() => signOut(auth)} variant="ghost" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary justify-start w-full text-left font-normal h-auto">
                                <LogOut className="h-5 w-5" />
                                <span>Log out</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-2 text-base font-medium">
                        <SheetClose asChild>
                            <Link
                                href="/login"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <User className="h-5 w-5" />
                                Login / Sign Up
                            </Link>
                        </SheetClose>
                        </div>
                    )}
                    </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Logo />
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navLinks.map((link) => (
                  <NavLink key={link.href} {...link} />
              ))}
            </nav>
          </div>

           <div className="md:hidden">
              <Logo />
           </div>

        </div>

        {/* Right Group */}
        <div className="flex items-center space-x-2">
          {/* Cart Icon */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          
          {/* User Authentication Status */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem disabled>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href={isAdmin ? "/admin" : "/dashboard"}>
                  <DropdownMenuItem>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut(auth)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  );
}
