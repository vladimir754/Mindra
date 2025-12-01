// login.js
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "./firebase.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

loginBtn.addEventListener("click", async () => {
  const mail = email.value.trim();
  const pass = password.value.trim();

  if (!mail || !pass) {
    alert("Escribe tu correo y contraseña.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, mail, pass);

    // Redirige al chat
    window.location.href = "/chat";
  } catch (err) {
    alert("Error al iniciar sesión: " + err.message);
  }
});

registerBtn.addEventListener("click", async () => {
  const mail = email.value.trim();
  const pass = password.value.trim();

  if (!mail || !pass) {
    alert("Completa los campos.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, mail, pass);
    alert("Cuenta creada. Ahora inicia sesión.");
  } catch (err) {
    alert("Error al registrarte: " + err.message);
  }
});
