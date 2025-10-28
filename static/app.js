document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const synth = window.speechSynthesis; // Motor de voz del navegador
  
  function speak(text) {
    if (synth.speaking) synth.cancel(); // Cancela si ya está hablando
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES"; // Voz en español
    utterance.pitch = 1.1;
    utterance.rate = 1;
    utterance.volume = 1;
    synth.speak(utterance);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    chatBox.innerHTML += `<div class="user-msg"><b>Tú:</b> ${userMessage}</div>`;
    input.value = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      const reply = data.reply || "No pude responder 😅";

      chatBox.innerHTML += `<div class="bot-msg"><b>Mindra:</b> ${reply}</div>`;
      chatBox.scrollTop = chatBox.scrollHeight;

      // 🗣️ Hablar respuesta
      speak(reply);

    } catch (err) {
      chatBox.innerHTML += `<div class="bot-msg error">Error al conectar con el servidor 😢</div>`;
    }
  });
});
