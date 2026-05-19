'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';

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
        const tokenResult = await user.getIdTokenResult();
        if (tokenResult.claims.admin === true) {
          if (!cancelled) setIsAdmin(true);
          return;
        }

        const token = await user.getIdToken();
        const res = await fetch('/api/auth/is-admin', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!cancelled) setIsAdmin(data.isAdmin === true);
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
