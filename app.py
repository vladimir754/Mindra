from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__, static_folder="static", template_folder="templates")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "")

    try:
        # Llamada al servidor Ollama (tu configuración previa)
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "gemma:2b",
                "prompt": user_message,
                "stream": False
            },
            timeout=90
        )

        if response.status_code == 200:
            data = response.json()
            # Ajusta según la forma real de la respuesta del servicio
            answer = data.get("response") or data.get("text") or data.get("result") or "No tengo respuesta."
            return jsonify({"reply": answer})
        else:
            return jsonify({"reply": f"⚠️ Error del modelo: {response.status_code}"})

    except requests.exceptions.Timeout:
        return jsonify({"reply": "⏰ El modelo tardó demasiado en responder."})
    except requests.exceptions.ConnectionError:
        return jsonify({"reply": "⚠️ No se pudo conectar con Ollama. Asegúrate de ejecutar `ollama serve`."})
    except Exception as e:
        return jsonify({"reply": f"⚠️ Error inesperado: {str(e)}"})


if __name__ == "__main__":
    app.run(debug=True)
