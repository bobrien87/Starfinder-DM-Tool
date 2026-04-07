import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDQUzqdl4u-Ip5zxrWMloD-CxZbo45o8x8",
  authDomain: "starfinder-dm-tool.firebaseapp.com",
  projectId: "starfinder-dm-tool",
  storageBucket: "starfinder-dm-tool.firebasestorage.app",
  messagingSenderId: "1058311754900",
  appId: "1:1058311754900:web:ce685290fc67ccbd7f5081"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
