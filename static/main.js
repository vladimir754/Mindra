// static/main.js
import { auth, onAuthStateChanged } from "./firebase.js";

const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const thinkingEl = document.getElementById("thinking");

let currentUid = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUid = user.uid;
    // traer memorias y mostrarlas si quieres
    fetch("/api/memory/get", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: currentUid })
    }).then(r => r.json()).then(data => {
      if (data.ok && data.memories && data.memories.length) {
        appendSystem(`He recordado ${data.memories.length} memorias tuyas para usar en esta charla.`);
      }
    }).catch(()=>{});
  } else {
    currentUid = null;
  }
});

function appendUser(text) {
  const d = document.createElement("div");
  d.className = "message user";
  d.innerHTML = `<span>${escapeHtml(text)}</span>`;
  chatBox.appendChild(d);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMindra(text) {
  const d = document.createElement("div");
  d.className = "message mindra";
  d.innerHTML = `<span>${escapeHtml(text)}</span>`;
  chatBox.appendChild(d);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendSystem(text) {
  const d = document.createElement("div");
  d.className = "message system";
  d.innerHTML = `<em>${escapeHtml(text)}</em>`;
  chatBox.appendChild(d);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(s){ return (s+"").replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" })[m]); }

// heurística simple para detectar info importante
function isImportant(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  // si es largo
  if (lower.length > 100) return true;
  // keywords típicos
  const keywords = ["mi nombre", "me llamo", "mi novia", "mi novio", "mi pareja", "trabajo", "estudio", "nací", "nací en", "me gusta", "odio", "mi proyecto", "empresa", "empresa", "cargo", "tengo", "tengo un", "soy "];
  for (let k of keywords) if (lower.includes(k)) return true;
  return false;
}

// Tags heurísticos básicos (mejorable)
function detectTags(text) {
  const tags = [];
  const lower = text.toLowerCase();
  if (/\b(naci|nací|nací en|nací)|\b\d{4}\b/.test(lower)) tags.push("biografía");
  if (lower.includes("novia") || lower.includes("novio") || lower.includes("pareja")) tags.push("relación");
  if (lower.includes("trabajo") || lower.includes("empresa") || lower.includes("cargo") || lower.includes("trabajo en")) tags.push("trabajo");
  if (lower.includes("me gusta") || lower.includes("me encanta") || lower.includes("gusta")) tags.push("gusto");
  return tags;
}

// Envío del chat
chatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;
  appendUser(text);
  userInput.value = "";

  // show thinking
  if (thinkingEl) thinkingEl.classList.remove("hidden");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, uid: currentUid })
    });
    const data = await res.json();
    const reply = data.response || data.reply || "Lo siento, no tuve respuesta.";
    if (thinkingEl) thinkingEl.classList.add("hidden");
    appendMindra(reply);
    // TTS si quieres (implementar)
    // speak(reply);

    // CHEQUEO AUTOMÁTICO: guardar memoria si importante
    if (currentUid && isImportant(text)) {
      const item = { text: text, tags: detectTags(text), auto: true };
      fetch("/api/memory/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: currentUid, item })
      }).then(r => r.json()).then(j => {
        if (j.ok) {
          appendSystem("He guardado un recuerdo importante para ti.");
        }
      }).catch(()=>{});
    }

  } catch (err) {
    if (thinkingEl) thinkingEl.classList.add("hidden");
    appendMindra("⚠️ Error al conectar con el servidor.");
  }
});
