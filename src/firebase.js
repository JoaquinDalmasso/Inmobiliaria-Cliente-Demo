// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-inmobiliaria.firebaseapp.com",
  projectId: "mern-inmobiliaria",
  storageBucket: "mern-inmobiliaria.appspot.com",
  messagingSenderId: "846806961070",
  appId: "1:846806961070:web:7289efe1342ec9a77f563f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);