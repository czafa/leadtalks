# api/routes/grupos.py
from fastapi import APIRouter
from api.utils import load_json

router = APIRouter(prefix="/api")

@router.get("/grupos")
def listar_grupos():
    grupos = load_json("grupos.json")
    membros = load_json("membros-grupos.json")
    return {"grupos": grupos, "membros": membros}
