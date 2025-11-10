// Esperar a que cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const voiceBtn = document.getElementById("voice-btn");

  // Enviar texto al servidor Flask
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    appendMessage("Tú", message);
    input.value = "";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      appendMessage("Mindra", data.reply);
      speak(data.reply); // 🔊 Lee la respuesta en voz alta
    } catch (err) {
      appendMessage("Error", "No se pudo conectar con el servidor Flask.");
    }
  });

  // Mostrar mensajes en pantalla
  function appendMessage(sender, text) {
    const div = document.createElement("div");
    div.classList.add(sender === "Tú" ? "user" : "bot");
    div.innerHTML = `<b>${sender}:</b> ${text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // 🎤 Hablar con el micrófono (Speech Recognition)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";

    voiceBtn.addEventListener("click", () => {
      recognition.start();
    });

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      input.value = voiceText;
      form.dispatchEvent(new Event("submit"));
    };
  } else {
    voiceBtn.disabled = true;
  }

  // 🗣️ Función para leer en voz alta las respuestas
  function speak(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "es-ES";
    window.speechSynthesis.speak(speech);
  }
});
