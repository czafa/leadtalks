# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routes import qr
import os

from api.routes import contatos, enviar, log, grupos, membros_grupos  # Importações absolutas

app = FastAPI(title="LeadTalk API")

# 🌐 CORS liberado (para testes locais — restringir em produção!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <- Altere para domínios específicos depois
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Inclusão das rotas organizadas
app.include_router(contatos.router)
app.include_router(enviar.router)
app.include_router(log.router)
app.include_router(grupos.router)
app.include_router(membros_grupos.router)
app.include_router(qr.router)

# 🧱 Serve frontend buildado do Vite
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
dist_path = os.path.join(BASE_DIR, "ui", "dist")

if not os.path.isdir(dist_path):
    raise RuntimeError(f"❌ Diretório de build não encontrado: {dist_path}")

app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")
