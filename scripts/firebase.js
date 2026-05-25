import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBgIrOjuh4VV0q4oeEA40N_wiKvSBlAJjc",
  authDomain: "kh-simpul.firebaseapp.com",
  projectId: "kh-simpul",
  storageBucket: "kh-simpul.firebasestorage.app",
  messagingSenderId: "110693154600",
  appId: "1:110693154600:web:7eaa6be392586d94c4da1d",
  measurementId: "G-PQYW3L59NN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
isSupported().then((ok)=>{ if (ok) getAnalytics(app); }).catch(()=>{});
window.simpulFirebase = { auth, signInWithEmailAndPassword, signInAnonymously, onAuthStateChanged, signOut };
