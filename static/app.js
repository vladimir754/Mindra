const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

function appendMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);
  messageDiv.innerHTML = `<strong>${sender === "user" ? "Tú" : "Mindra"}:</strong> ${message}`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";

  // mensaje temporal mientras piensa
  const thinkingDiv = document.createElement("div");
  thinkingDiv.classList.add("message", "mindra");
  thinkingDiv.textContent = "⏳ Mindra está pensando...";
  chatBox.appendChild(thinkingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    thinkingDiv.remove(); // elimina el mensaje "pensando"
    appendMessage("mindra", data.reply);

  } catch (error) {
    thinkingDiv.remove();
    appendMessage("mindra", "⚠️ Error al conectar con el servidor Flask.");
  }
});
