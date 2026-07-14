import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app;
export let db = null;
export let auth = null;
export let googleProvider = null;

if (firebaseConfig.apiKey) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  // Use modern persistent cache API (replaces deprecated enableIndexedDbPersistence)
  if (typeof window !== 'undefined') {
    try {
      db = initializeFirestore(app, {
        cache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      });
    } catch {
      const { getFirestore } = require('firebase/firestore');
      db = getFirestore(app);
    }
  } else {
    const { getFirestore } = require('firebase/firestore');
    db = getFirestore(app);
  }

  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) throw new Error('Firebase Auth not initialized');
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (/popup|cancelled|closed/i.test(error?.code || error?.message || '')) {
      throw error;
    }
    await signInWithRedirect(auth, googleProvider);
    return null;
  }
};

// Extracted result handler for redirects
export const handleRedirectResult = async () => {
  if (!auth) return null;
  return await getRedirectResult(auth);
};

export default app;
