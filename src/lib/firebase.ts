import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "apiKey": "YOUR_ACTUAL_API_KEY",
  "authDomain": "YOUR_ACTUAL_AUTH_DOMAIN",
  "projectId": "YOUR_ACTUAL_PROJECT_ID",
  "storageBucket": "YOUR_ACTUAL_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  "appId": "YOUR_ACTUAL_APP_ID"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
