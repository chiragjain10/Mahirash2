// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBdAanNjNg4Gj_hFrAt_2V9SeH0TqMBJJc",
  authDomain: "mahirash-84085.firebaseapp.com",
  projectId: "mahirash-84085",
  storageBucket: "mahirash-84085.firebasestorage.app",
  messagingSenderId: "343343814431",
  appId: "1:343343814431:web:9959f2fcbdad508589422a",
  measurementId: "G-KS9SLRJLLT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);




// const firebaseConfig = {
  // apiKey: "AIzaSyBdAanNjNg4Gj_hFrAt_2V9SeH0TqMBJJc",
  // authDomain: "mahirash-84085.firebaseapp.com",
  // projectId: "mahirash-84085",
  // storageBucket: "mahirash-84085.firebasestorage.app",
  // messagingSenderId: "343343814431",
  // appId: "1:343343814431:web:9959f2fcbdad508589422a",
  // measurementId: "G-KS9SLRJLLT"
// };