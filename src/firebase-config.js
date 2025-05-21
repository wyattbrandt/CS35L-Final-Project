// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAY-yqdKW9XNf-mJxPxNe2WUtQJtWlsdOA",
  authDomain: "words-7e9de.firebaseapp.com",
  projectId: "words-7e9de",
  storageBucket: "words-7e9de.firebasestorage.app",
  messagingSenderId: "516637889713",
  appId: "1:516637889713:web:fa8ae325dd66639eba7e90",
  measurementId: "G-9BCSG86637"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
// const analytics = getAnalytics(app);