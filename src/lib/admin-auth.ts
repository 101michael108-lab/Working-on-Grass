import type { User } from 'firebase/auth';

/** Create admin session cookie and refresh ID token so Firestore sees admin claim. */
export async function establishAdminSession(user: User): Promise<boolean> {
  const idToken = await user.getIdToken();
  const res = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  });

  if (!res.ok) return false;

  const body = await res.json();
  if (body.refreshToken) {
    await user.getIdToken(true);
  }
  return true;
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
