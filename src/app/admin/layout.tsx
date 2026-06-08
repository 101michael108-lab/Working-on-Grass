import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getAdminAuth, hasAdminCredentials } from "@/lib/firebase-admin"
import { isAdminUid } from "@/lib/admin-config"
import { AdminShell } from "@/components/admin/admin-shell"

const SESSION_COOKIE = "__session"

/**
 * Server-side admin gate. When the Admin SDK is configured (production), the
 * Firebase session cookie's `admin` claim is verified here before any admin
 * page renders — the client `AdminShell` is only a secondary UX guard. Where
 * Admin credentials are unavailable (e.g. local dev), we fall back to the
 * client guard so the dashboard remains usable.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (hasAdminCredentials()) {
    const session = (await cookies()).get(SESSION_COOKIE)?.value;
    let allowed = false;
    if (session) {
      try {
        const decoded = await getAdminAuth().verifySessionCookie(session, true);
        allowed = decoded.admin === true || isAdminUid(decoded.uid);
      } catch {
        allowed = false;
      }
    }
    if (!allowed) {
      redirect(`/login?redirect=${encodeURIComponent("/admin")}`);
    }
  }

  return <AdminShell>{children}</AdminShell>;
}
