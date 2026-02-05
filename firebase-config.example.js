/**
 * EXAMPLE: Firebase Configuration Template
 * 
 * Este es un archivo de ejemplo mostrando cómo estructurar la configuración de Firebase.
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo como "firebase-config.js" en ambos directorios:
 *    - Admin Def/firebase-config.js
 *    - Barberos/firebase-config.js
 * 
 * 2. Reemplaza los valores con tu configuración real de Firebase
 * 3. NUNCA hagas commit de firebase-config.js con datos reales
 * 4. El archivo debe estar en .gitignore (ya está configurado)
 */

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

export const appId = "YOUR_APP_ID";

// Importar las funciones requeridas
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { hashPassword, validatePassword, isPasswordHashed } from './crypto-utils.js';

// --- Inicialización ---
let app;
let db;
let auth;
let storage;
let initializationFailed = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Error inicializando Firebase:", error);
  initializationFailed = true;
}

export { app, db, auth, storage, initializationFailed };
