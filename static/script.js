const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const input = document.getElementById("user-input");

function appendMessage(sender, message) {
    const div = document.createElement("div");
    div.classList.add("message", sender);
    div.innerHTML = `<strong>${sender === "user" ? "Tú" : "Mindra"}:</strong> ${message}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const msg = input.value.trim();
    if (!msg) return;

    appendMessage("user", msg);
    input.value = "";

    const loading = document.createElement("div");
    loading.classList.add("message", "mindra");
    loading.textContent = "⏳ Mindra está pensando...";
    chatBox.appendChild(loading);

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
    });

    const data = await response.json();
    loading.remove();
    appendMessage("mindra", data.reply);
});
