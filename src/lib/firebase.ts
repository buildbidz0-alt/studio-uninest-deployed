import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "apiKey": "mock-api-key",
  "authDomain": "mock-auth-domain",
  "projectId": "mock-project-id",
  "storageBucket": "mock-storage-bucket",
  "messagingSenderId": "mock-messaging-sender-id",
  "appId": "mock-app-id"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
