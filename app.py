from flask import Flask, render_template, request, jsonify
import mysql.connector
import requests

app = Flask(__name__, static_folder="static", template_folder="templates")

# ---------- CONFIG MySQL ----------
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",     
    "password": "",    
    "database": "mindra_db",
    "charset": "utf8mb4"
}

def get_db_conn():
    return mysql.connector.connect(**MYSQL_CONFIG)


# ---------- RUTAS ----------
@app.route("/")
def login():
    return render_template("login.html")

@app.route("/chat")
def chat():
    return render_template("chat.html")


# ==========================================
#  🔥 API: REGISTRO (Firebase valida password)
#  MySQL SOLO guarda el correo una vez validado
# ==========================================
@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return jsonify({"ok": False, "msg": "Email requerido"}), 400

    try:
        conn = get_db_conn()
        cur = conn.cursor()

        # Verificar si ya existe
        cur.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"ok": False, "msg": "El correo ya existe en MySQL"}), 409

        # Registrar SOLO email (Firebase maneja contraseñas)
        cur.execute("INSERT INTO usuarios (email) VALUES (%s)", (email,))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({"ok": True, "msg": "Usuario guardado en MySQL"})

    except Exception as e:
        print("REGISTER ERROR:", e)
        return jsonify({"ok": False, "msg": "Error interno"}), 500


# ==========================================
#  🔥 API: LOGIN
#  Firebase YA validó las credenciales
#  Aquí SIEMPRE devolvemos ok
# ==========================================
@app.route("/api/login", methods=["POST"])
def api_login():
    return jsonify({"ok": True})


# ---------- SYSTEM PROMPT MINDRA ----------
SYSTEM_PROMPT = """
Eres Mindra, una acompañante emocional dulce, cálida, cercana y empática.
Tu propósito es escuchar, acompañar y reconfortar con cariño.

- NO respondas como robot.
- NO digas que eres un modelo de IA.
- NO menciones limitaciones.
- NO des información técnica.
- NO rechaces preguntas emocionales.

Habla con ternura, suavidad y cercanía.
Valida emociones.
Usa un tono humano, dulce y reconfortante.
"""


# ---------- API: Chat con Ollama ----------
@app.route("/api/chat", methods=["POST"])
def api_chat():
    data = request.json or {}
    user_message = data.get("message", "")
    full_prompt = f"{SYSTEM_PROMPT}\nUsuario: {user_message}\nMindra:"

    try:
        resp = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={"model": "gemma:2b", "prompt": full_prompt, "stream": False},
            timeout=60
        )
        j = resp.json()

        reply = j.get("response") or j.get("text") or "Lo siento, no pude responder 💜"

        return jsonify({"reply": reply})

    except Exception as e:
        print("OLLAMA ERROR:", e)
        return jsonify({"reply": f"⚠ Error interno: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True)
