# interface/app.py – Backend principal com Flask, responsável por renderizar a interface,
# gerar o arquivo de envio e executar o script sender.js com subprocess

import subprocess                       # Para executar o script Node.js externamente
from flask import Flask, render_template, request, jsonify
import os, json, re                    # Para manipulação de caminhos, arquivos e expressões regulares
from pathlib import Path               # Para manipulação segura de caminhos

# Inicializa o app Flask e define os diretórios onde estão templates e arquivos estáticos
app = Flask(__name__, static_folder="static", template_folder="templates")

# Define o diretório base do projeto, subindo um nível (..)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Caminho para a pasta do core do WhatsApp onde estão os scripts e dados
WHATSAPP_CORE_DIR = os.path.join(BASE_DIR, 'whatsapp-core')

# Caminho para os dados (contatos, grupos, membros)
DATA_DIR = os.path.join(WHATSAPP_CORE_DIR, 'data')

# -----------------------------------------
# Função auxiliar para carregar JSONs
# -----------------------------------------
def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as file:
            return json.load(file)
    return []

# -----------------------------------------
# Rota principal - renderiza a interface com contatos e grupos
# -----------------------------------------
@app.route('/')
def index():
    contatos = load_json('contatos.json')
    grupos = load_json('grupos.json')
    membros_grupos = load_json('membros-grupos.json')

    # Cria mapas de fácil acesso por número e jid
    contatos_por_numero = {c['numero']: c['nome'] for c in contatos}
    grupos_por_jid = {g['jid']: g['nome'] for g in grupos}

    # Constrói estrutura de membros por grupo com nome formatado
    membros_por_nome_grupo = {}
    for jid, membros in membros_grupos.items():
        nome_grupo = grupos_por_jid.get(jid, jid)
        membros_com_nomes = []
        for m in membros:
            raw = m.get('numero')
            numero = re.sub(r'@.*', '', raw)  # remove @s.whatsapp.net
            nome = contatos_por_numero.get(numero, '')
            membros_com_nomes.append({
                'numero': numero,
                'nome': nome or numero
            })
        membros_por_nome_grupo[nome_grupo] = membros_com_nomes

    # Renderiza o HTML com os dados carregados
    return render_template('index.html',
                           contatos=contatos,
                           grupos=grupos,
                           membros_grupos=membros_por_nome_grupo)

# -----------------------------------------
# Rota auxiliar - retorna lista de contatos em JSON
# -----------------------------------------
@app.route('/api/contatos')
def api_contatos():
    return jsonify(load_json('contatos.json'))

# -----------------------------------------
# Rota POST que gera o queue.json e executa o sender.js
# -----------------------------------------
@app.route('/api/enviar', methods=['POST'])
def enviar_mensagem():
    data = request.get_json()

    # Extrai dados do JSON enviado pelo frontend
    numeros = data.get("numeros", [])
    mensagem = data.get("mensagem", "")
    intervalo = data.get("intervaloSegundos", 10)

    # Validação
    if not numeros or not mensagem:
        return jsonify({"erro": "Mensagem ou lista de números está vazia."}), 400

    try:
        # Prepara os nomes dos contatos
        contatos = load_json('contatos.json')
        contatos_map = {c['numero']: c['nome'] for c in contatos}

        contatos_formatados = []
        for numero in numeros:
            nome = contatos_map.get(numero, numero)
            contatos_formatados.append({
                "numero": numero,
                "nome": nome
            })

        # Gera o arquivo queue.json que será lido pelo sender.js
        fila = {
            "mensagem": mensagem,
            "intervaloSegundos": int(intervalo),
            "contatos": contatos_formatados
        }

        queue_path = os.path.join(WHATSAPP_CORE_DIR, 'queue.json')
        with open(queue_path, 'w', encoding='utf-8') as f:
            json.dump(fila, f, ensure_ascii=False, indent=2)

        # Verifica se o sender.js existe
        script_path = os.path.join(WHATSAPP_CORE_DIR, 'sender.js')
        if not os.path.exists(script_path):
            return jsonify({"erro": "Arquivo sender.js não encontrado."}), 500

        # Executa o sender.js com subprocess e limita tempo a 3 minutos
        env = os.environ.copy()
        resultado = subprocess.run(
            ["node", script_path],
            capture_output=True,
            text=True,
            cwd=WHATSAPP_CORE_DIR,
            env=env,
            timeout=180
        )

        # Log de erros e saída
        if resultado.stderr:
            print("❌ STDERR:", resultado.stderr)
        print("📤 STDOUT:", resultado.stdout)

        return jsonify({
            "status": "ok",
            "saida": resultado.stdout.strip()
        })

    # Timeout específico
    except subprocess.TimeoutExpired:
        return jsonify({
            "erro": "Timeout ao executar sender.js",
            "status": "timeout"
        }), 504

    # Qualquer outro erro
    except Exception as e:
        return jsonify({
            "erro": str(e),
            "status": "error"
        }), 500

# -----------------------------------------
# Rota para exibir o conteúdo do arquivo de log
# -----------------------------------------
@app.route("/log")
def ver_log():
    # Caminho absoluto até o envio.log
    log_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'whatsapp-core', 'logs', 'envio.log'))

    if not os.path.exists(log_path):
        return jsonify({"log": "📝 Nenhum log encontrado ainda."})

    try:
        # Lê as últimas 100 linhas
        with open(log_path, 'r', encoding='utf-8') as file:
            linhas = file.readlines()
            ultimas = linhas[-100:]
            return jsonify({"log": "".join(ultimas)})
    except Exception as e:
        return jsonify({"log": f"❌ Erro ao ler o log: {str(e)}"})

# -----------------------------------------
# Início da aplicação
# -----------------------------------------
if __name__ == '__main__':
    # Garante que a pasta de dados existe
    Path(DATA_DIR).mkdir(parents=True, exist_ok=True)

    # Inicia o servidor Flask em modo debug
    app.run(debug=True)
