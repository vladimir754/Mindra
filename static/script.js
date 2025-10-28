const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const voiceBtn = document.getElementById('voice-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value;
  chatBox.innerHTML += `<div class="user"><b>Tú:</b> ${message}</div>`;
  input.value = '';

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message})
  });

  const data = await res.json();
  chatBox.innerHTML += `<div class="ai"><b>Mindra:</b> ${data.reply}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
});

// 🎤 Voz a texto (Speech Recognition)
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES';

voiceBtn.addEventListener('click', () => {
  recognition.start();
  voiceBtn.textContent = "🎙️ Escuchando...";
});

recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript;
  input.value = text;
  form.requestSubmit();
  voiceBtn.textContent = "🎤 Hablar";
};

recognition.onerror = () => {
  voiceBtn.textContent = "🎤 Hablar";
};
