// src/services/firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD23kryUl-sSlryueUHg-xP7QZd4mWL-Uw",
  authDomain: "medicine-reminder-app-4eb3b.firebaseapp.com",
  projectId: "medicine-reminder-app-4eb3b",
  storageBucket: "medicine-reminder-app-4eb3b.firebasestorage.app",
  messagingSenderId: "665379666752",
  appId: "1:665379666752:web:9acf20d09ccfe6eb7198a5",
  measurementId: "G-4PQLGFXEK7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
