"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { LayoutDashboard, ShoppingCart, User as UserIcon, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "My orders", icon: ShoppingCart },
  { href: "/dashboard/profile", label: "My profile", icon: UserIcon },
];

type DashUser = NonNullable<ReturnType<typeof useUser>["user"]>;

const NavItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-[3px] px-3 py-2.5 text-[14px] font-medium no-underline transition-colors ${
        isActive ? "bg-cream-band text-forest" : "text-body-soft hover:bg-cream-band hover:text-forest"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
      {label}
    </Link>
  );
};

const SidebarNav = ({ user }: { user: DashUser }) => (
  <div className="flex h-full flex-col">
    <div className="flex h-16 items-center gap-3 border-b border-line px-5">
      <Avatar className="h-9 w-9">
        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ""} />
        <AvatarFallback className="bg-forest text-ondark-bright">{user.email?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-headline text-[15px] font-semibold text-ink">{user.displayName || "User"}</span>
        <span className="truncate text-[12px] text-body-faint">{user.email}</span>
      </div>
    </div>
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((n) => <NavItem key={n.href} {...n} />)}
    </nav>
  </div>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <div className="flex h-[70vh] items-center justify-center bg-cream text-body-soft">Loading…</div>;
  }

  return (
    <div className="grid min-h-[70vh] w-full bg-cream md:grid-cols-[240px_1fr] lg:grid-cols-[268px_1fr]">
      <aside className="hidden border-r border-line bg-cream-panel md:block">
        <SidebarNav user={user} />
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b border-line bg-cream px-5 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-cream-panel p-0">
              <SidebarNav user={user} />
            </SheetContent>
          </Sheet>
          <span className="font-headline text-[17px] font-semibold text-ink">My account</span>
        </header>
        <main className="flex flex-1 flex-col gap-5 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
