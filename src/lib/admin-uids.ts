/** Parse comma-separated Firebase Auth UIDs. */
export function parseAdminUids(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function uidInAdminList(
  uid: string | undefined | null,
  list: string[]
): boolean {
  if (!uid) return false;
  return list.includes(uid);
}
