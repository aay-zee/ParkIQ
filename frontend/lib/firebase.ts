import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBvmHT8mrgbFp_oV4L08U2NlMEqVbZZSkY",
  authDomain: "parkiq-b3b06.firebaseapp.com",
  projectId: "parkiq-b3b06",
  storageBucket: "parkiq-b3b06.firebasestorage.app",
  messagingSenderId: "219966591413",
  appId: "1:219966591413:web:a5b72b60c5c79d0d4f89fc",
  measurementId: "G-128YL0P55V",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
