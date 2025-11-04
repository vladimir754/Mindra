const input = document.getElementById('user-input');
const voiceBtn = document.getElementById('voice-btn');

// Solo se ocupa SpeechRecognition: si no está disponible, deshabilitamos el botón
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  // No soportado
  if (voiceBtn) {
    voiceBtn.disabled = true;
    voiceBtn.textContent = '🎤 No soportado';
  }
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  voiceBtn.addEventListener('click', () => {
    try {
      recognition.start();
      voiceBtn.textContent = '🎙️ Escuchando...';
    } catch (err) {
      console.error('Error al iniciar reconocimiento:', err);
    }
  });

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    // Poner el texto en el input y enviar el formulario
    if (input) input.value = text;
    // Usar requestSubmit para disparar el handler del formulario (app.js lo maneja)
    const form = document.getElementById('chat-form');
    if (form && typeof form.requestSubmit === 'function') {
      form.requestSubmit();
    } else if (form) {
      form.submit();
    }
    voiceBtn.textContent = '🎤 Hablar';
  };

  recognition.onerror = (ev) => {
    console.warn('Speech recognition error', ev);
    voiceBtn.textContent = '🎤 Hablar';
  };

  recognition.onend = () => {
    // Aseguramos que el botón vuelva a su estado
    voiceBtn.textContent = '🎤 Hablar';
  };
}
