// firebase.js (versión final y funcional)

// Cargar Firebase desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- TU CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyB4qio3SPPwz6k51YSWQPULfMXbJSblBOU",
  authDomain: "mindra-8f3bb.firebaseapp.com",
  projectId: "mindra-8f3bb",
  storageBucket: "mindra-8f3bb.appspot.com",
  messagingSenderId: "184399274274",
  appId: "1:184399274274:web:324bf3495b03bfc368857b"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar AUTH
const auth = getAuth(app);

// Exportar funciones para usarlas en auth.js
export {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
};
