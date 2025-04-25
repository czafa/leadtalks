# api/routes/membros_grupos.py
from fastapi import APIRouter
from api.utils import load_json
import re

router = APIRouter()

@router.get("/api/membros-grupos")
def membros_grupos():
    contatos = load_json("contatos.json")
    grupos = load_json("grupos.json")
    membros_grupos = load_json("membros-grupos.json")

    contatos_por_numero = {
        re.sub(r"@.*", "", c['numero']): c['nome'] for c in contatos
    }
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

    return {"grupos": resultado}
