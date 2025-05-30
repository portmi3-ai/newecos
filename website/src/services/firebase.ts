import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // TODO: Replace with your actual API key
  authDomain: "agentecosgit-88377803.firebaseapp.com",
  projectId: "agentecosgit-88377803",
  storageBucket: "agentecosgit-88377803.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // TODO: Replace with your actual sender ID
  appId: "YOUR_APP_ID", // TODO: Replace with your actual app ID
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 