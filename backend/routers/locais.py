from fastapi import APIRouter, HTTPException
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

@router.get("/locais/{farmacia_id}")
def listar_locais(farmacia_id: str):
    cursor.execute("SELECT * FROM farol_farmacia_locais WHERE farmacia_id = %s", (farmacia_id,))
    colunas = [desc[0] for desc in cursor.description]
    resultado = cursor.fetchall()
    return [dict(zip(colunas, linha)) for linha in resultado]
