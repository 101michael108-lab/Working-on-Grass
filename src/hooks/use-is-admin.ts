'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { isClientAdminUid } from '@/lib/admin-config-client';
import { establishAdminSession } from '@/lib/admin-auth';

/** Whether the signed-in user is an admin (ADMIN_UIDS / custom claim). */
export function useIsAdmin(): boolean {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        if (isClientAdminUid(user.uid)) {
          if (!cancelled) setIsAdmin(true);
          void establishAdminSession(user).then((r) => {
            if (!r.ok) console.warn('[admin]', r.message);
          });
          return;
        }

        const tokenResult = await user.getIdTokenResult();
        if (tokenResult.claims.admin === true) {
          if (!cancelled) setIsAdmin(true);
          void establishAdminSession(user).then((r) => {
            if (!r.ok) console.warn('[admin]', r.message);
          });
          return;
        }

        const token = await user.getIdToken();
        const res = await fetch('/api/auth/is-admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const allowed = data.isAdmin === true;
        if (!cancelled) setIsAdmin(allowed);
        if (allowed) {
          void establishAdminSession(user).then((r) => {
            if (!r.ok) console.warn('[admin]', r.message);
          });
        }
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return isAdmin;
}
