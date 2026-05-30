import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNzzytLbr6emlkNF9TdmoVc_9tVHxaYvw",
  authDomain: "saquainfo-77137.firebaseapp.com",
  projectId: "saquainfo-77137",
  storageBucket: "saquainfo-77137.firebasestorage.app",
  messagingSenderId: "468842142028",
  appId: "1:468842142028:web:f24561e7b4da8f83c657e9"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);