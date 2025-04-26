# api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from api.routes import contatos, enviar, log, grupos, membros_grupos, qr  # Importações absolutas

app = FastAPI(title="LeadTalk API")

# 🌐 CORS liberado (para testes locais — restringir em produção!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <- Altere para domínios específicos depois
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Inclusão das rotas organizadas
app.include_router(contatos.router, prefix="/api")
app.include_router(enviar.router, prefix="/api")
app.include_router(log.router, prefix="/api")
app.include_router(grupos.router, prefix="/api")
app.include_router(membros_grupos.router, prefix="/api")
app.include_router(qr.router, prefix="/api")

# 🧱 Serve frontend buildado do Vite
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
dist_path = os.path.join(BASE_DIR, "ui", "dist")

# Monta os arquivos estáticos em uma rota específica
app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="assets")

# Rota raiz para servir o index.html
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    return FileResponse(os.path.join(dist_path, "index.html"))
