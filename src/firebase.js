// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHiHFkLHZWNCx08u7VV37GEYxwUHNCEa0",
  authDomain: "egypt-chinese-translation.firebaseapp.com",
  projectId: "egypt-chinese-translation",
  storageBucket: "egypt-chinese-translation.firebasestorage.app",
  messagingSenderId: "127815255407",
  appId: "1:127815255407:web:e34d37669ecc87fa69549a",
  measurementId: "G-KJYJEH063L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistent cache for better performance
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
