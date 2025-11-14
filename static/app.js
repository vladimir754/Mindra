import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "./firebase.js";

const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const popup = document.getElementById("auth-popup");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const popupClose = document.getElementById("popup-close");

let logged = false;

function appendMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);
  messageDiv.innerHTML = `<strong>${sender === "user" ? "Tú" : "Mindra"}:</strong> ${message}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// bienvenida inicial
appendMessage("mindra", "✨ Hola, soy Mindra. Estoy aquí para escucharte. ¿Cómo te sientes hoy?");

// manejo popup
function openPopup() { popup.classList.remove("hidden"); popup.setAttribute("aria-hidden", "false"); }
function closePopup() { popup.classList.add("hidden"); popup.setAttribute("aria-hidden", "true"); }
popupClose.addEventListener("click", closePopup);

// escuchar estado de autenticación
onAuthStateChanged(auth, (user) => {
  if (user) {
    logged = true;
    closePopup();
    appendMessage("mindra", "😊 ¡Bienvenido! Ya puedes seguir escribiendo.");
  } else {
    logged = false;
    // si prefieres abrir el popup automáticamente al cargar: openPopup();
  }
});

// enviar mensaje
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";

  if (!logged) {
    openPopup();
    appendMessage("mindra", "🔐 Para continuar, por favor inicia sesión o regístrate.");
    return;
  }

  // mostrar pensando
  const thinkingDiv = document.createElement("div");
  thinkingDiv.classList.add("message", "mindra");
  thinkingDiv.textContent = "⏳ Mindra está pensando...";
  chatBox.appendChild(thinkingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    thinkingDiv.remove();
    appendMessage("mindra", data.reply);
  } catch (err) {
    thinkingDiv.remove();
    appendMessage("mindra", "⚠️ Error al conectar con el servidor.");
    console.error(err);
  }
});

// login
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  if (!email || !pass) { alert("Ingresa correo y contraseña"); return; }

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged se encargará de cerrar popup y marcar logged
  } catch (err) {
    alert("Error al iniciar sesión: " + err.message);
  }
});

// registro
registerBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  if (!email || !pass) { alert("Ingresa correo y contraseña"); return; }

  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    alert("Cuenta creada. Inicia sesión ahora.");
  } catch (err) {
    alert("Error al registrar: " + err.message);
  }
});
