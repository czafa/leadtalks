from fastapi import APIRouter
from ..utils import load_json, DATA_DIR
import json

router = APIRouter()

@router.get("/contatos")
def get_contatos():
    # Dados de exemplo para teste
    contatos_exemplo = [
        {"nome": "João Silva", "numero": "5511999999999"},
        {"nome": "Maria Santos", "numero": "5511988888888"},
        {"nome": "José Oliveira", "numero": "5511977777777"}
    ]
    
    # Tenta carregar do arquivo, se não existir usa os dados de exemplo
    try:
        return load_json("contatos.json")
    except:
        # Se o arquivo não existir, cria com os dados de exemplo
        contatos_file = DATA_DIR / "contatos.json"
        contatos_file.parent.mkdir(parents=True, exist_ok=True)
        contatos_file.write_text(json.dumps(contatos_exemplo, indent=2), encoding="utf-8")
        return contatos_exemplo
