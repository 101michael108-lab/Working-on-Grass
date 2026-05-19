import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
};

/** Returns Firestore profile or creates a default `user` profile if Auth exists without a doc. */
export async function ensureUserProfile(
  firestore: Firestore,
  authUser: User
): Promise<UserProfile | null> {
  const userDocRef = doc(firestore, 'users', authUser.uid);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  const profile: UserProfile = {
    id: authUser.uid,
    email: authUser.email || '',
    displayName: authUser.displayName || '',
    role: 'user',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userDocRef, profile);
  return profile;
}
