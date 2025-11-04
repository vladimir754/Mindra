from flask import Flask, render_template, request, jsonify, session
from openai import OpenAI
import os
import uuid

# ✅ Intentamos cargar variables desde .env (si existe)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # No es obligatorio si ya defines la variable en PowerShell

app = Flask(__name__)
# Usar una secret key para sesiones. Puedes definir FLASK_SECRET_KEY en el entorno
app.secret_key = os.getenv('FLASK_SECRET_KEY') or str(uuid.uuid4())

# ✅ Lee la clave API desde el entorno (no la pongas directamente aquí)
api_key = os.getenv("OPENAI_API_KEY")

def is_likely_valid_openai_key(key: str) -> bool:
    try:
        return isinstance(key, str) and key.startswith('sk-') and len(key) > 20
    except Exception:
        return False

# Inicializa el cliente solo si hay clave válida
api_key_valid_format = is_likely_valid_openai_key(api_key) if api_key else False
if api_key and api_key_valid_format:
    client = OpenAI(api_key=api_key)
else:
    client = None

# Almacenamiento en memoria de conversaciones por sesión (clave: session id)
# Nota: para producción deberías usar una base de datos o store persistente.
conversations = {}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    global conversation
    data = request.get_json()
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"reply": "No entendí tu mensaje 😅"}), 400

    # Identificador de sesión por usuario
    sid = session.get('sid')
    if not sid:
        sid = str(uuid.uuid4())
        session['sid'] = sid

    # Obtener o crear conversación para este usuario
    conv = conversations.setdefault(sid, [])
    conv.append({"role": "user", "content": user_message})
    # Mantener solo los últimos 20 mensajes (user+assistant pairs)
    conv[:] = conv[-20:]

    # ⚠️ Si no hay clave API configurada o su formato es incorrecto
    if client is None:
        if not api_key:
            return jsonify({"reply": "❌ La clave OPENAI_API_KEY no está configurada. Añádela en .env o en la variable de entorno y reinicia."}), 200
        if not api_key_valid_format:
            return jsonify({"reply": "❌ La clave API es inválida. Revisa tu archivo .env o la variable de entorno."}), 200

    try:
        # Llamada a OpenAI con el contexto
        # Construir mensajes: añadimos el system al inicio y luego el contexto de sesión
        messages = [
            {"role": "system", "content": "Eres Mindra, una IA empática, emocional y amable."},
            *conv
        ]

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )

        # Intentar extraer la respuesta del asistente de forma robusta
        try:
            ai_reply = response.choices[0].message.content.strip()
        except Exception:
            ai_reply = getattr(response.choices[0], 'text', None) or str(response)

        conv.append({"role": "assistant", "content": ai_reply})

        return jsonify({"reply": ai_reply})

    except Exception as e:
        error_text = repr(e).lower()
        print("Error en llamada a OpenAI:", e)

        if 'invalid_api_key' in error_text or '401' in error_text:
            return jsonify({"reply": "❌ La clave API es inválida. Revisa tu archivo .env o la variable de entorno."}), 200

        return jsonify({"reply": "⚙️ Hubo un error interno al comunicarse con OpenAI. Intenta de nuevo más tarde."}), 500


@app.route('/api/reset', methods=['POST'])
def reset_conversation():
    """Reinicia la conversación de la sesión actual."""
    sid = session.get('sid')
    if sid and sid in conversations:
        conversations[sid] = []
    return jsonify({"ok": True}), 200


if __name__ == '__main__':
    # ✅ Ejecuta el servidor Flask sin reloader (mejor para PowerShell)
    app.run(debug=True, use_reloader=False)
