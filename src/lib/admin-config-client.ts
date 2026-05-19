import { parseAdminUids, uidInAdminList } from '@/lib/admin-uids';

/** Client-side admin UID list (NEXT_PUBLIC_ADMIN_UIDS). Used for nav only; server enforces access. */
export function getClientAdminUids(): string[] {
  return parseAdminUids(process.env.NEXT_PUBLIC_ADMIN_UIDS);
}

export function isClientAdminUid(uid: string | undefined | null): boolean {
  return uidInAdminList(uid, getClientAdminUids());
}
