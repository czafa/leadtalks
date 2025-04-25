# api/routes/qr.py
from fastapi import APIRouter, HTTPException
from pathlib import Path

router = APIRouter(prefix="/api", tags=["QRCode"])

QR_PATH = Path("whatsapp-core/temp/qr.txt")

@router.get("/qr")
def get_qr_code():
    if not QR_PATH.exists():
        raise HTTPException(status_code=404, detail="QR code ainda não gerado")

    qr_data = QR_PATH.read_text().strip()
    if not qr_data:
        raise HTTPException(status_code=204, detail="QR code vazio")

    return {"qr": qr_data}
