from flask import Flask, render_template, request, jsonify
import openai

app = Flask(__name__)

# 💡 Configura tu clave de OpenAI aquí
openai.api_key = "TU_API_KEY_AQUI"

# Historial de conversación (simple)
chat_history = [
    {"role": "system", "content": "Eres Mindra, una IA amable y empática que ayuda a las personas a sentirse mejor."}
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json.get("message")
    if not user_message:
        return jsonify({"error": "Mensaje vacío"}), 400

    # Agrega mensaje del usuario al historial
    chat_history.append({"role": "user", "content": user_message})

    # Llama al modelo GPT
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=chat_history,
        max_tokens=200,
        temperature=0.8
    )

    ai_message = response.choices[0].message['content']

    # Agrega la respuesta de la IA al historial
    chat_history.append({"role": "assistant", "content": ai_message})

    return jsonify({"response": ai_message})

if __name__ == '__main__':
    app.run(debug=True)
