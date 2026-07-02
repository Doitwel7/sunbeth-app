// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";          // 1. Added Auth import
import { getFirestore } from "firebase/firestore";  // 2. Added Firestore import
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDflGxCXxFo2XsQ4GEDiSjjUqGykHqd-1Q",
  authDomain: "doitwel-b3be0.firebaseapp.com",
  databaseURL: "https://doitwel-b3be0-default-rtdb.firebaseio.com",
  projectId: "doitwel-b3be0",
  storageBucket: "doitwel-b3be0.firebasestorage.app",
  messagingSenderId: "672414359982",
  appId: "1:672414359982:web:17460a29056acb4fe7a83f",
  measurementId: "G-8DLBBL1LV2"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 3. Initialize and Export services so your views can use them
export const auth = getAuth(app);
export const db = getFirestore(app);