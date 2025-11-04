const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    // Usamos 'reply' como clave consistente con el backend
    addMessage(data.reply || data.response || 'Sin respuesta', 'bot');
  } catch (err) {
    addMessage('Error al enviar el mensaje. Comprueba el servidor.', 'bot');
    console.error('chat send error', err);
  }
}

sendBtn.onclick = sendMessage;
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});
