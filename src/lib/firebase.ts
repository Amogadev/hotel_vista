
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-5746960021-3e343",
  "appId": "1:726288828301:web:e92ebda002be08e34d1fc4",
  "storageBucket": "studio-5746960021-3e343.firebasestorage.app",
  "apiKey": "AIzaSyAl5XaghnB5BWx4naPXgM7r9ZqteTqgvos",
  "authDomain": "studio-5746960021-3e343.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "726288828301"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
