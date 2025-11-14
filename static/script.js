const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const voiceSwitch = document.getElementById("voice-switch");

let ttsEnabled = false;

voiceSwitch.addEventListener("change", () => {
    ttsEnabled = voiceSwitch.checked;
});

function appendMessage(sender, message) {
    const div = document.createElement("div");
    div.classList.add("message", sender);
    div.innerHTML = `<strong>${sender === "user" ? "Tú" : "Mindra"}:</strong> ${message}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
    if (!ttsEnabled) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES";
    speechSynthesis.speak(utter);
}

chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const msg = input.value.trim();
    if (!msg) return;

    appendMessage("user", msg);
    input.value = "";

    const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
    });

    const data = await response.json();
    appendMessage("mindra", data.reply);
    speak(data.reply);
});
