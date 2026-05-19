/** Comma-separated Firebase Auth UIDs with admin access (from ADMIN_UIDS env). */
export function getAdminUids(): string[] {
  const raw = process.env.ADMIN_UIDS ?? '';
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isAdminUid(uid: string | undefined | null): boolean {
  if (!uid) return false;
  return getAdminUids().includes(uid);
}
