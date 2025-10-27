document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const text = document.getElementById('moodInput').value;

    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    const data = await response.json();
    document.getElementById('emotionText').innerText = `${data.emotion.toUpperCase()}: ${data.message}`;
});
