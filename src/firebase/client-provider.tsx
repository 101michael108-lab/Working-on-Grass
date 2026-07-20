'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  // NOTE: Firebase Analytics is deliberately NOT initialised here.
  // `getAnalytics()` injects a second copy of gtag.js purely to send GA4 hits to
  // measurement ID G-QQGK35J3TB — on top of the copy the Google Ads tag already
  // loads. That was ~300 kB and ~370 ms of main-thread work for two scripts doing
  // the same job. The same GA4 property is now configured on the single shared
  // gtag.js in components/analytics.tsx, so the data is unchanged. If you need the
  // Firebase SDK surface (`logEvent`, Firebase console integration), re-add it —
  // but load it lazily, not during hydration.

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
