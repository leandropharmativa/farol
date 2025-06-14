from fastapi import APIRouter, HTTPException, Request
from db import cursor
from models import LocalFarmaciaCreate

router = APIRouter()

@router.post("/locais")
def criar_local(dados: LocalFarmaciaCreate):
    cursor.execute("""
        INSERT INTO farol_farmacia_locais (farmacia_id, tipo, nome)
        VALUES (%s, %s, %s)
    """, (str(dados.farmacia_id), dados.tipo, dados.nome))
    return {"status": "ok"}

@router.put("/locais/{id}")
async def editar_local(id: int, request: Request):
    try:
        dados = await request.json()
        cursor.execute("""
            UPDATE farol_farmacia_locais SET
                nome = %s,
                origem = %s,
                destino = %s
            WHERE id = %s
        """, (dados['nome'], dados['origem'], dados['destino'], id))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
