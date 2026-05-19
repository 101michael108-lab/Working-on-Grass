import { initializeApp, getApps, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { firebaseConfig } from '@/firebase/config';

let adminApp: App | undefined;

function initAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  try {
    adminApp = initializeApp({
      credential: applicationDefault(),
      projectId: firebaseConfig.projectId,
    });
  } catch {
    adminApp = initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }

  return adminApp;
}

export function getAdminFirestore(): Firestore {
  return getFirestore(initAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(initAdminApp());
}
