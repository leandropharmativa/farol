from fastapi import APIRouter, HTTPException, Request
from db import cursor
from models import LocalFarmaciaCreate

router = APIRouter()

@router.post("/locais")
def criar_local(dados: LocalCreate):
    try:
        cursor.execute("""
            INSERT INTO farol_farmacia_locais (farmacia_id, nome, origem, destino)
            VALUES (%s, %s, %s, %s)
        """, (dados.farmacia_id, dados.nome, dados.origem, dados.destino))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/locais/{farmacia_id}")
def listar_locais(farmacia_id: str):
    cursor.execute("SELECT id, nome, origem, destino FROM farol_farmacia_locais WHERE farmacia_id = %s", (farmacia_id,))
    return cursor.fetchall()

@router.put("/locais/{id}")
def editar_local(id: int, dados: LocalUpdate):
    cursor.execute("""
        UPDATE farol_farmacia_locais
        SET nome = %s, origem = %s, destino = %s
        WHERE id = %s
    """, (dados.nome, dados.origem, dados.destino, id))
    return {"status": "ok"}
