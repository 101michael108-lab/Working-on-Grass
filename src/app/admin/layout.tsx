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
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Settings,
  User,
  Package,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth, useUser } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { useFirestore } from "@/firebase"

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().role !== 'admin') {
          router.push('/');
        } else if (!docSnap.exists()) {
          router.push('/');
        }
      });
    }
  }, [user, isUserLoading, router, firestore]);

  if (isUserLoading || !user) {
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
            <NavLink href="/admin/products" icon={<Package />} tooltip="Products">Products</NavLink>
            <NavLink href="/admin/users" icon={<User />} tooltip="Users">Users</NavLink>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <NavLink href="/admin/settings" icon={<Settings />} tooltip="Settings">Settings</NavLink>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => signOut(auth)}>
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
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </header>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
