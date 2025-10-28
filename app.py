from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os

app = Flask(__name__)

# Configura tu clave API (⚠️ nunca la compartas públicamente)
os.environ["OPENAI_API_KEY"] =""  # 🔒 pon tu clave aquí
client = OpenAI()

conversation = []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    global conversation
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"reply": "No entendí tu mensaje 😅"}), 400

    conversation.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres Mindra, una IA empática, emocional y amable."},
                *conversation
            ]
        )

        ai_reply = response.choices[0].message.content
        conversation.append({"role": "assistant", "content": ai_reply})
        return jsonify({"reply": ai_reply})

    except Exception as e:
        print("Error:", e)
        return jsonify({"reply": "Hubo un error interno. Intenta de nuevo 🥺"}), 500


if __name__ == '__main__':
    app.run(debug=True)
