// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
  getAuth,
  signInWithEmailAndPassword as _signIn,
  createUserWithEmailAndPassword as _createUser,
  onAuthStateChanged as _onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB4qio3SPPwz6k51YSWQPULfMXbJSblBOU",
  authDomain: "mindra-8f3bb.firebaseapp.com",
  projectId: "mindra-8f3bb",
  storageBucket: "mindra-8f3bb.appspot.com",   // ← CORREGIDO
  messagingSenderId: "184399274274",
  appId: "1:184399274274:web:324bf3495b03bfc368857b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, _signIn as signInWithEmailAndPassword, _createUser as createUserWithEmailAndPassword, _onAuthStateChanged as onAuthStateChanged };
