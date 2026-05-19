/**
 * Promote a Firebase Auth user to admin in Firestore.
 * Usage: node --env-file=.env.local scripts/set-admin.mjs <uid>
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';

const uid = process.argv[2];

if (!uid) {
  console.error('Usage: node --env-file=.env.local scripts/set-admin.mjs <firebase-auth-uid>');
  process.exit(1);
}

const projectId = 'studio-7014438029-85e68';
const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!getApps().length) {
  if (credPath && existsSync(credPath)) {
    const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount), projectId });
  } else {
    initializeApp({ projectId });
  }
}

const db = getFirestore();
const auth = getAuth();

let email = '';
let displayName = 'Admin';

try {
  const user = await auth.getUser(uid);
  email = user.email || '';
  displayName = user.displayName || email || 'Admin';
} catch (e) {
  console.warn('Auth user lookup failed (will still write Firestore doc):', e.message);
}

const ref = db.collection('users').doc(uid);
const existing = await ref.get();

await ref.set(
  {
    id: uid,
    email,
    displayName,
    role: 'admin',
    updatedAt: FieldValue.serverTimestamp(),
    ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
  },
  { merge: true }
);

console.log(`Done. users/${uid} is now role: admin`);
if (email) console.log(`Email: ${email}`);
