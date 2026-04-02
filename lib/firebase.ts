import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Check if we have the minimum required config for initialization
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

// Initialize Firebase safely
let app: FirebaseApp | undefined;
try {
  if (getApps().length > 0) {
    app = getApp();
  } else if (isConfigValid) {
    app = initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Get database instance safely — at runtime, config is always available
// via NEXT_PUBLIC_ env vars. Server pages use `force-dynamic` to skip build-time rendering.
const database = app ? getDatabase(app) : (null as unknown as ReturnType<typeof getDatabase>);

// Analytics initialization (client-side only)
if (typeof window !== "undefined" && app) {
  isSupported().then((supported) => {
    if (supported && app) {
      getAnalytics(app);
    }
  });
}

export { app, database };
