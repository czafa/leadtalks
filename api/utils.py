# utils.py - utilitários compartilhados para as rotas do FastAPI

import json
from pathlib import Path

# Caminhos base
BASE_DIR = Path(__file__).resolve().parent.parent
WHATSAPP_CORE = BASE_DIR / "whatsapp-core"
DATA_DIR = WHATSAPP_CORE / "data"
QUEUE_FILE = WHATSAPP_CORE / "queue.json"
SENDER_SCRIPT = WHATSAPP_CORE / "sender.js"
LOG_FILE = WHATSAPP_CORE / "logs" / "envio.log"

# Função para carregar arquivos JSON
def load_json(filename: str):
    path = DATA_DIR / filename
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return []
