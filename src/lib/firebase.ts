import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "apiKey": "xxxx-xxxx-xxxx-xxxx",
  "authDomain": "xxxx-xxxx-xxxx-xxxx",
  "projectId": "xxxx-xxxx",
  "storageBucket": "xxxx-xxxx-xxxx-xxxx",
  "messagingSenderId": "xxxx-xxxx",
  "appId": "xxxx-xxxx-xxxx-xxxx"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
