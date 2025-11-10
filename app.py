from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)  # 🔹 Asegúrate de que esta línea esté antes de los @app.route

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message")

    try:
        # Llamada al servidor Ollama
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "gemma",  # o mistral, según el modelo que tengas descargado
                "prompt": user_message,
                "stream": False
            },
            timeout=90
        )

        if response.status_code == 200:
            data = response.json()
            answer = data.get("response", "No tengo respuesta.")
            return jsonify({"reply": answer})
        else:
            return jsonify({"reply": f"⚠️ Error del modelo: {response.status_code}"})

    except requests.exceptions.Timeout:
        return jsonify({"reply": "⏰ El modelo tardó demasiado en responder."})
    except requests.exceptions.ConnectionError:
        return jsonify({"reply": "⚠️ No se pudo conectar con el modelo Ollama. Asegúrate de que esté ejecutándose con 'ollama serve'."})
    except Exception as e:
        return jsonify({"reply": f"⚠️ Error inesperado: {str(e)}"})


if __name__ == "__main__":
    app.run(debug=True)
