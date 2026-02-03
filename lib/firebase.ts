import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXNhOdW8MaPpd1RYqbQJmYshEcn_8-R3Y",
  authDomain: "lumo-ea41a.firebaseapp.com",
  projectId: "lumo-ea41a",
  storageBucket: "lumo-ea41a.firebasestorage.app",
  messagingSenderId: "405787257554",
  appId: "1:405787257554:web:4f0e77e4264bf3cf48db0b",
  measurementId: "G-D49L1HG86R"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);