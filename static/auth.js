// static/js/auth.js
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "../js/firebase.js";

// inputs
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const errorBox = document.getElementById("auth-error");

// ENTER = LOGIN
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

// Si ya está logueado → ir al chat
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "/chat";
  }
});

// LOGIN
loginBtn?.addEventListener("click", async () => {
  errorBox.textContent = "";
  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    errorBox.textContent = "Completa los campos.";
    return;
  }

  try {
    // Firebase
    await signInWithEmailAndPassword(auth, email, password);

    // Backend MySQL
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (!result.ok) throw new Error(result.msg);

    window.location.href = "/chat";

  } catch (error) {
    errorBox.textContent = error.message;
  }
});

// REGISTRO
registerBtn?.addEventListener("click", async () => {
  errorBox.textContent = "";
  const email = emailInput.value.trim();
  const password = passInput.value.trim();

  if (!email || !password) {
    errorBox.textContent = "Completa los campos.";
    return;
  }

  try {
    // Firebase
    await createUserWithEmailAndPassword(auth, email, password);

    // MySQL
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });

    const result = await res.json();

    if (!result.ok) throw new Error(result.msg);

    window.location.href = "/chat";

  } catch (error) {
    errorBox.textContent = error.message;
  }
});
