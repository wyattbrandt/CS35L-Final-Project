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
  apiKey: "AIzaSyBodJFPI06JjlY8HpFxbkjvQh3blQLJmlc",
  authDomain: "newb1ueroom.firebaseapp.com",
  projectId: "newb1ueroom",
  storageBucket: "newb1ueroom.firebasestorage.app",
  messagingSenderId: "643022701713",
  appId: "1:643022701713:web:f6649eadf0870378bfab30",
  measurementId: "G-QHK43PJTHE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
// const analytics = getAnalytics(app);