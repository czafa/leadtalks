from fastapi import APIRouter
from ..utils import load_json

router = APIRouter()

@router.get("/api/contatos")
def get_contatos():
    return load_json("contatos.json")
