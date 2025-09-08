import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "apiKey": "STUDIO_FIREBASE_API_KEY",
  "authDomain": "STUDIO_FIREBASE_AUTH_DOMAIN",
  "projectId": "STUDIO_FIREBASE_PROJECT_ID",
  "storageBucket": "STUDIO_FIREBASE_STORAGE_BUCKET",
  "messagingSenderId": "STUDIO_FIREBASE_MESSAGING_SENDER_ID",
  "appId": "STUDIO_FIREBASE_APP_ID"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
