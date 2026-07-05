"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Settings,
  User,
  Package,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Newspaper,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth, useUser } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { checkIsAdmin, clearAdminSession, establishAdminSession } from "@/lib/admin-auth"

const NavLink = ({ href, children, icon, tooltip }: { href: string; children: React.ReactNode; icon: React.ReactNode; tooltip?: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <SidebarMenuItem>
      <Link href={href}>
        <SidebarMenuButton isActive={isActive} tooltip={tooltip}>
          {icon}
          <span>{children}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

/**
 * Interactive admin sidebar/chrome. Authorization is enforced server-side in
 * the admin layout (Firebase session-cookie claim check); this client guard is
 * a secondary UX layer that also keeps the session cookie fresh.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [accessChecked, setAccessChecked] = React.useState(false);

  React.useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    let cancelled = false;

    (async () => {
      const allowed = await checkIsAdmin(user);
      if (cancelled) return;

      if (!allowed) {
        router.push('/');
        return;
      }

      const session = await establishAdminSession(user);
      if (cancelled) return;
      if (!session.ok) {
        console.error(session.message);
        router.push(`/login?redirect=${encodeURIComponent('/admin')}`);
        return;
      }

      setAccessChecked(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || !accessChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 [&>span]:w-full group-data-[collapsible=icon]:hidden">
            <Logo />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <NavLink href="/admin" icon={<LayoutDashboard />} tooltip="Dashboard">Dashboard</NavLink>
            <NavLink href="/admin/orders" icon={<ShoppingCart />} tooltip="Orders">Orders</NavLink>
            <NavLink href="/admin/inquiries" icon={<MessageSquare />} tooltip="Inquiries">Inquiries</NavLink>
            <NavLink href="/admin/products" icon={<Package />} tooltip="Products">Products</NavLink>
            <NavLink href="/admin/media" icon={<ImageIcon />} tooltip="Media">Media</NavLink>
            <NavLink href="/admin/resources" icon={<FileText />} tooltip="Resources">Resources</NavLink>
            <NavLink href="/admin/field-notes" icon={<Newspaper />} tooltip="Field Notes">Field Notes</NavLink>
            <NavLink href="/admin/users" icon={<User />} tooltip="Users">Users</NavLink>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <NavLink href="/admin/settings" icon={<Settings />} tooltip="Settings">Settings</NavLink>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={async () => {
                if (user) await clearAdminSession(user);
                await signOut(auth);
                router.push('/login');
              }}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:hidden border-t">
              <Avatar>
                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} alt={user.displayName || "Admin"} />
                <AvatarFallback>{user.displayName?.[0] || user.email?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user.displayName || 'Admin User'}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
              {children}
          </main>
      </div>
    </SidebarProvider>
  )
}
