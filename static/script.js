const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🎤 Configurar reconocimiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "es-ES";
recognition.continuous = false;

recognition.onresult = (event) => {
  const text = event.results[0][0].transcript;
  appendMessage("user", text);
  sendToMindra(text);
};

recognition.onend = () => recognition.start();

// 🔊 Mindra habla
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 1;
  utterance.pitch = 1.1;
  speechSynthesis.speak(utterance);
}

async function sendToMindra(message) {
  appendMessage("bot", "⏳ Mindra está pensando...");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    chatBox.lastChild.remove();
    appendMessage("bot", data.reply);
    speak(data.reply);
  } catch (err) {
    console.error("Error:", err);
    chatBox.lastChild.remove();
    appendMessage("bot", "⚠️ Error al comunicar con Mindra (servidor no disponible).");
  }
}

sendBtn.addEventListener("click", () => {
  const msg = input.value.trim();
  if (!msg) return;
  appendMessage("user", msg);
  input.value = "";
  sendToMindra(msg);
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// 🔄 Iniciar reconocimiento
recognition.start();
