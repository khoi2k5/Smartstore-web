import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2_GpCSdOS_gQLTLFw9pE49Y8SclT-K_I",
  authDomain: "smartstore-44bf0.firebaseapp.com",
  projectId: "smartstore-44bf0",
  storageBucket: "smartstore-44bf0.firebasestorage.app",
  messagingSenderId: "812626449626",
  appId: "1:812626449626:web:df54ab9a75aa28657a41e3",
  measurementId: "G-ML3EGPFGS2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
