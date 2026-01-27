import * as admin from 'firebase-admin';

// When running in a Google Cloud environment like Firebase App Hosting or Cloud Functions,
// the Admin SDK can be initialized without credentials. It will automatically
// discover the service account credentials from the environment.
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();

export { firestore, admin };
