import { parseAdminUids, uidInAdminList } from '@/lib/admin-uids';

/** Comma-separated Firebase Auth UIDs with admin access (from ADMIN_UIDS env). */
export function getAdminUids(): string[] {
  return parseAdminUids(process.env.ADMIN_UIDS);
}

export function isAdminUid(uid: string | undefined | null): boolean {
  return uidInAdminList(uid, getAdminUids());
}
