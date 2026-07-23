// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAOhLltfbJS4lvBCJj5JVgnxuGoinehMho",
    authDomain: "nexasolutions-d14c7.firebaseapp.com",
    projectId: "nexasolutions-d14c7",
    storageBucket: "nexasolutions-d14c7.firebasestorage.app",
    messagingSenderId: "587935646827",
    appId: "1:587935646827:web:b516c9c72736a51d3f9d2e",
    measurementId: "G-YS3R9JYVL4"
};

// Initialize Firebase
let app: any;
let auth: any;
let db: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("[NEXA] Firebase initialization failed:", error);
}

export { app, auth, db };

