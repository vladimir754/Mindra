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

// Mensaje inicial
appendMessage("mindra", "✨ Hola, soy Mindra. Estoy aquí para escucharte. ¿Cómo te sientes hoy?");

// popup
function openPopup() { popup.classList.remove("hidden"); }
function closePopup() { popup.classList.add("hidden"); }

popupClose.addEventListener("click", closePopup);

// estado login
onAuthStateChanged(auth, (user) => {
  if (user) {
    logged = true;
    closePopup();
    appendMessage("mindra", "😊 ¡Bienvenido! Ya puedes continuar hablando conmigo.");
  } else {
    logged = false;
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
    appendMessage("mindra", "🔐 Para continuar, inicia sesión o regístrate.");
    return;
  }

  const thinking = document.createElement("div");
  thinking.classList.add("message", "mindra");
  thinking.textContent = "⏳ Mindra está pensando...";
  chatBox.appendChild(thinking);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    thinking.remove();
    appendMessage("mindra", data.reply);
  } catch (err) {
    thinking.remove();
    appendMessage("mindra", "⚠️ Error al conectar con el servidor.");
  }
});

// login
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    alert("Error al iniciar sesión: " + err.message);
  }
});

// registro
registerBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    alert("Cuenta creada. Ahora inicia sesión.");
  } catch (err) {
    alert("Error al registrarse: " + err.message);
  }
});
