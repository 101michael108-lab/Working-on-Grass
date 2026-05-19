import { readFileSync } from 'fs';
import {
  initializeApp,
  getApps,
  applicationDefault,
  cert,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { firebaseConfig } from '@/firebase/config';

let adminApp: App | undefined;

function loadServiceAccount(): ServiceAccount | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (inline) {
    try {
      return JSON.parse(inline) as ServiceAccount;
    } catch {
      console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON');
    }
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (credPath) {
    try {
      return JSON.parse(readFileSync(credPath, 'utf8')) as ServiceAccount;
    } catch (err) {
      console.error('Could not read GOOGLE_APPLICATION_CREDENTIALS:', err);
    }
  }

  return null;
}

function initAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0]!;
    return adminApp;
  }

  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
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

/** True when a service account file or inline JSON is configured. */
export function hasAdminCredentials(): boolean {
  return loadServiceAccount() !== null;
}

export function getAdminFirestore(): Firestore {
  return getFirestore(initAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(initAdminApp());
}
