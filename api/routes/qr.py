# api/routes/qr.py
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pathlib import Path

router = APIRouter(prefix="/api", tags=["QRCode"])

QR_PATH = Path("whatsapp-core/temp/qr.txt")

@router.get("/qr")
def get_qr_code():
    if not QR_PATH.exists():
        raise JSONResponse(status_code=404, content={"detail": "QR code ainda não gerado"})

    qr_data = QR_PATH.read_text().strip()
    if not qr_data:
        raise JSONResponse(status_code=204, content={"detail": "QR code vazio"})

    return {"qr": qr_data}
