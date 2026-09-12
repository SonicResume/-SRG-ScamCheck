import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBrck1di7_N7B2d-H8mwZud17N9CYgC8wc",
  authDomain: "resume-97612.firebaseapp.com",
  projectId: "resume-97612",
  storageBucket: "resume-97612.firebasestorage.app",
  messagingSenderId: "1096541776873",
  appId: "1:1096541776873:web:2db75ee18b3b4a2c8f7978",
  measurementId: "G-BZJZ37S6PR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;