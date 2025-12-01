// static/js/chat.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// firebase config (matches yours)
const firebaseConfig = {
  apiKey: "AIzaSyB4qio3SPPwz6k51YSWQPULfMXbJSblBOU",
  authDomain: "mindra-8f3bb.firebaseapp.com",
  projectId: "mindra-8f3bb",
  storageBucket: "mindra-8f3bb.appspot.com",
  messagingSenderId: "184399274274",
  appId: "1:184399274274:web:324bf3495b03bfc368857b"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const typingEl = document.getElementById("typing");
const ttsSwitch = document.getElementById("tts-switch");
const userEmailEl = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

let ttsEnabled = false;
ttsSwitch?.addEventListener("change", e => ttsEnabled = e.target.checked);

// ensure only logged users can stay
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
    return;
  }
  userEmailEl.textContent = user.email;
});

// utility to add bubble
function addBubble(text, who="bot"){
  const row = document.createElement("div");
  row.className = "message-row " + (who==="user" ? "user" : "bot");
  const b = document.createElement("div");
  b.className = "bubble " + (who==="user" ? "user" : "bot");
  b.textContent = text;
  row.appendChild(b);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// show typing
function setTyping(active){
  typingEl.style.display = active ? "block" : "none";
  if(active) messagesEl.scrollTop = messagesEl.scrollHeight;
}

// TTS speak
function speak(text){
  if(!ttsEnabled) return;
  try{
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    speechSynthesis.cancel(); // avoid overlap
    speechSynthesis.speak(u);
  }catch(e){ console.warn("TTS err", e); }
}

// send flow
async function sendMessage(){
  const text = inputEl.value.trim();
  if(!text) return;
  addBubble(text, "user");
  inputEl.value = "";
  setTyping(true);

  try{
    const res = await fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ message: text })
    });
    const j = await res.json();
    const reply = j.reply || j.response || "Lo siento, no pude responder.";
    setTyping(false);
    addBubble(reply, "bot");
    speak(reply);
  }catch(err){
    setTyping(false);
    addBubble("⚠️ Error del servidor. Intenta más tarde.", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keypress", e => { if(e.key === "Enter") sendMessage(); });

// logout
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/";
});
