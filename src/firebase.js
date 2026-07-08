import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  where, 
  onSnapshot,
  runTransaction
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Environment variables configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId
);

let app;
let db;
let auth;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization failed, falling back to Mock Database:", error);
  }
}

// Mock Fallback Database System (Local Storage Reactivity)
const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const initMockData = () => {
  if (!localStorage.getItem("nmx_slots")) {
    localStorage.setItem("nmx_slots", JSON.stringify([]));
  }

  if (!localStorage.getItem("nmx_candidates")) {
    localStorage.setItem("nmx_candidates", JSON.stringify([]));
  }

  if (!localStorage.getItem("nmx_admin_user")) {
    localStorage.setItem("nmx_admin_user", JSON.stringify({ email: "admin@neuromorphix.ai" }));
  }
};

initMockData();

// Mock Firestore / Auth Functions
export const mockDb = {
  getSlots: () => JSON.parse(localStorage.getItem("nmx_slots") || "[]"),
  getCandidates: () => JSON.parse(localStorage.getItem("nmx_candidates") || "[]"),
  saveSlots: (slots) => {
    localStorage.setItem("nmx_slots", JSON.stringify(slots));
    notifyListeners();
  },
  saveCandidates: (candidates) => {
    localStorage.setItem("nmx_candidates", JSON.stringify(candidates));
    notifyListeners();
  },
  subscribe: (callback) => {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  }
};

export { db, auth, isFirebaseConfigured };
export { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  query, 
  where, 
  onSnapshot,
  runTransaction,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
