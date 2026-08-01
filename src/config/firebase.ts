import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getDatabase, ref, onValue, set as setFirebaseData, push } from 'firebase/database';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCCI4o_WmeqBNeh98lUhQiXt9fbDp_wdlY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tablate-project.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://tablate-project-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tablate-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tablate-project.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "442135634483",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:442135634483:web:ce87c27477de428c22f946",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZL1TRND04S"
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Realtime Database
export const rtdb = getDatabase(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Safe Analytics Initialization
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
