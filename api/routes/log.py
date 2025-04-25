from fastapi import APIRouter
from ..utils import LOG_FILE
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/log")
def ver_log():
    if LOG_FILE.exists():
        linhas = LOG_FILE.read_text(encoding="utf-8").splitlines()
        return {"log": "\n".join(linhas[-100:])}
    return {"log": "📝 Nenhum log encontrado ainda."}
