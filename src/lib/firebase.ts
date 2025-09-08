import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "student-hub-gdi0m",
  "appId": "1:1003811331041:web:2e67d4a79452d1a003d0a0",
  "storageBucket": "student-hub-gdi0m.firebasestorage.app",
  "apiKey": "AIzaSyDWnAQp63KIOmgxtz5t1hXOsKAbV1oQfNY",
  "authDomain": "student-hub-gdi0m.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1003811331041"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
