# interface/app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import os, json, re
from pathlib import Path

# === Configuração base ===
BASE_DIR = Path(__file__).resolve().parent.parent
WHATSAPP_CORE_DIR = BASE_DIR / "whatsapp-core"
DATA_DIR = WHATSAPP_CORE_DIR / "data"
VITE_DIST_DIR = BASE_DIR / "ui" / "dist"

app = Flask(__name__, static_folder=str(VITE_DIST_DIR), template_folder=str(VITE_DIST_DIR))
CORS(app)

# === Utilitário para carregar arquivos JSON ===
def load_json(nome_arquivo):
    caminho = DATA_DIR / nome_arquivo
    if caminho.exists():
        with open(caminho, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

# === Rotas frontend Vite ===
@app.route("/")
def serve_index():
    return send_from_directory(VITE_DIST_DIR, "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(VITE_DIST_DIR, path)

@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(VITE_DIST_DIR / "assets", filename)

@app.route("/vite.svg")
def serve_vite_svg():
    return send_from_directory(VITE_DIST_DIR, "vite.svg")

# === API: Contatos ===
@app.route("/api/contatos")
def api_contatos():
    return jsonify(load_json("contatos.json"))

# === API: Grupos com membros formatados ===
@app.route("/api/grupos")
def api_grupos():
    contatos = load_json("contatos.json")
    grupos = load_json("grupos.json")
    membros_grupos = load_json("membros-grupos.json")

    contatos_por_numero = {c['numero']: c['nome'] for c in contatos}
    grupos_por_jid = {g['jid']: g['nome'] for g in grupos}

    resultado = {}
    for jid, membros in membros_grupos.items():
        nome_grupo = grupos_por_jid.get(jid, jid)
        resultado[nome_grupo] = [
            {
                "numero": re.sub(r"@.*", "", m.get("numero")),
                "nome": contatos_por_numero.get(re.sub(r"@.*", "", m.get("numero")), re.sub(r"@.*", "", m.get("numero")))
            }
            for m in membros
        ]
    return jsonify(resultado)

# === API: Enviar mensagem ===
@app.route("/api/enviar", methods=["POST"])
def api_enviar():
    try:
        data = request.get_json()
        numeros = data.get("numeros", [])
        mensagem = data.get("mensagem", "").strip()
        intervalo = int(data.get("intervaloSegundos", 10))

        if not numeros or not mensagem:
            return jsonify({"erro": "Mensagem ou números ausentes."}), 400

        contatos = load_json("contatos.json")
        mapa_nomes = {c["numero"]: c["nome"] for c in contatos}
        contatos_formatados = [{"numero": n, "nome": mapa_nomes.get(n, n)} for n in numeros]

        fila = {
            "mensagem": mensagem,
            "intervaloSegundos": intervalo,
            "contatos": contatos_formatados
        }

        with open(WHATSAPP_CORE_DIR / "queue.json", "w", encoding="utf-8") as f:
            json.dump(fila, f, ensure_ascii=False, indent=2)

        script_path = WHATSAPP_CORE_DIR / "sender.js"
        if not script_path.exists():
            return jsonify({"erro": "sender.js não encontrado."}), 500

        resultado = subprocess.run(
            ["node", str(script_path)],
            capture_output=True,
            text=True,
            cwd=WHATSAPP_CORE_DIR,
            timeout=180
        )

        print("📤 STDOUT:", resultado.stdout)
        if resultado.stderr:
            print("❌ STDERR:", resultado.stderr)

        return jsonify({"status": "ok", "saida": resultado.stdout.strip()})

    except subprocess.TimeoutExpired:
        return jsonify({"erro": "Tempo limite excedido", "status": "timeout"}), 504
    except Exception as e:
        return jsonify({"erro": str(e), "status": "erro"}), 500

# === API: Visualizar log ===
@app.route("/log")
def ver_log():
    log_path = WHATSAPP_CORE_DIR / "logs" / "envio.log"
    if not log_path.exists():
        return jsonify({"log": "📝 Nenhum log encontrado."})
    try:
        with open(log_path, 'r', encoding='utf-8') as f:
            linhas = f.readlines()[-100:]
            return jsonify({"log": "".join(linhas)})
    except Exception as e:
        return jsonify({"log": f"❌ Erro ao ler o log: {str(e)}"})

# === Execução local ===
if __name__ == "__main__":
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    app.run(debug=True)
