from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import json, subprocess
from ..utils import load_json, QUEUE_FILE, SENDER_SCRIPT, WHATSAPP_CORE

router = APIRouter()

@router.post("/api/enviar")
async def enviar_msg(req: Request):
    data = await req.json()
    numeros = data.get("numeros", [])
    mensagem = data.get("mensagem", "")
    intervalo = data.get("intervaloSegundos", 10)

    if not numeros or not mensagem:
        return JSONResponse(status_code=400, content={"erro": "Mensagem ou números faltando"})

    contatos = load_json("contatos.json")
    contatos_map = {c['numero']: c['nome'] for c in contatos}
    fila = {
        "mensagem": mensagem,
        "intervaloSegundos": int(intervalo),
        "contatos": [{"numero": n, "nome": contatos_map.get(n, n)} for n in numeros]
    }

    QUEUE_FILE.write_text(json.dumps(fila, ensure_ascii=False, indent=2), encoding="utf-8")

    try:
        result = subprocess.run(
            ["node", str(SENDER_SCRIPT)],
            cwd=str(WHATSAPP_CORE),
            capture_output=True,
            text=True,
            timeout=180
        )
        return {"status": "ok", "saida": result.stdout}
    except subprocess.TimeoutExpired:
        return JSONResponse(status_code=504, content={"status": "timeout"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"erro": str(e)})
