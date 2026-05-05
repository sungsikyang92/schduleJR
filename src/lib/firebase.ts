import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBY1PqiSquchQY7W4CFzsJKhffIBpKurJM",
  authDomain: "schedulejr-184c5.firebaseapp.com",
  projectId: "schedulejr-184c5",
  storageBucket: "schedulejr-184c5.firebasestorage.app",
  messagingSenderId: "269187414016",
  appId: "1:269187414016:web:9cdc08e10a0958241080e5",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
