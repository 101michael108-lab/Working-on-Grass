import type { User } from 'firebase/auth';
import { isClientAdminUid } from '@/lib/admin-config-client';

export type AdminSessionResult =
  | { ok: true }
  | { ok: false; message: string };

/** Create admin session cookie and refresh ID token so Firestore sees admin claim. */
export async function establishAdminSession(user: User): Promise<AdminSessionResult> {
  const idToken = await user.getIdToken();
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (body.code === 'admin_sdk_missing') {
      return {
        ok: false,
        message:
          'Local admin login needs a Firebase service account. In Firebase Console → Project settings → Service accounts → Generate new private key, save as service-account.json in the project root, then set GOOGLE_APPLICATION_CREDENTIALS=./service-account.json in .env.local and restart the dev server.',
      };
    }
    if (body.code === 'not_authorized') {
      return {
        ok: false,
        message: `${body.error ?? 'Not authorized'} Add your UID to ADMIN_UIDS and NEXT_PUBLIC_ADMIN_UIDS in .env.local.`,
      };
    }
    return {
      ok: false,
      message: body.error ?? `Admin session failed (HTTP ${res.status}).`,
    };
  }

  if (body.refreshToken) {
    await user.getIdToken(true);
  }
  return { ok: true };
}

export async function clearAdminSession(user: User): Promise<void> {
  const idToken = await user.getIdToken();
  await fetch('/api/auth/session', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${idToken}` },
  });
  await user.getIdToken(true);
}

export async function checkIsAdmin(user: User): Promise<boolean> {
  if (isClientAdminUid(user.uid)) return true;

  const tokenResult = await user.getIdTokenResult();
  if (tokenResult.claims.admin === true) return true;

  const token = await user.getIdToken();
  const res = await fetch('/api/auth/is-admin', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.isAdmin === true;
}
