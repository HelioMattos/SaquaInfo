// firebaseConfig.js (EXCLUSIVO PARA O APP DE CELULAR)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- 1. Nova importação do Storage

const firebaseConfig = {
  apiKey: "AIzaSyCkwKFsktwQjWBlOISsmmXum3wJ-jT3JYo",
  authDomain: "saquainfo-99128.firebaseapp.com",
  projectId: "saquainfo-99128",
  storageBucket: "saquainfo-99128.firebasestorage.app",
  messagingSenderId: "50771678769",
  appId: "1:50771678769:web:82ce83d38282c7cba06710"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Proteção crucial para evitar tela vermelha (Blob Error) no Android/iOS
global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app); // <-- 2. Ativação do Storage

export { app, auth, db, storage }; // <-- 3. Storage liberado para o app usar
