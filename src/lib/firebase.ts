
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  "projectId": "studio-5746960021-3e343",
  "appId": "1:726288828301:web:e92ebda002be08e34d1fc4",
  "storageBucket": "studio-5746960021-3e343.firebasestorage.app",
  "apiKey": "AIzaSyAl5XaghnB5BWx4naPXgM7r9ZqteTqgvos",
  "authDomain": "studio-5746960021-3e343.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "726288828301"
};

let app: FirebaseApp;
let firestore: Firestore;
let auth: Auth;

if (typeof window === 'undefined') {
  // Server-side initialization
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  firestore = getFirestore(app);
  auth = getAuth(app);
} else {
  // Client-side initialization
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  firestore = getFirestore(app);
  auth = getAuth(app);
}

const db = firestore;

function initializeFirebase() {
    return { app, firestore, auth };
}


export { app, db, auth, initializeFirebase };
