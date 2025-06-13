from fastapi import APIRouter, HTTPException
from db import cursor
from models import LogoUpdate
from uuid import UUID

router = APIRouter()

@router.put("/farmacia/logo/{farmacia_id}")
def atualizar_logo(farmacia_id: UUID, dados: LogoUpdate):
    cursor.execute("""
        UPDATE farol_farmacias SET logo_url = %s WHERE id = %s
    """, (dados.logo_url, str(farmacia_id)))
    return {"status": "ok"}
