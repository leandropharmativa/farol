# backend/routers/locais.py
from fastapi import APIRouter, HTTPException, Request
from db import cursor
from models import LocalFarmaciaCreate

router = APIRouter()

@router.post("/locais")
def criar_local(dados: LocalFarmaciaCreate):
    try:
        cursor.execute("""
            INSERT INTO farol_farmacia_locais (farmacia_id, nome, origem, destino, residencia)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            dados.farmacia_id,
            dados.nome,
            dados.origem,
            dados.destino,
            getattr(dados, 'residencia', False)
        ))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/locais/{farmacia_id}")
def listar_locais(farmacia_id: str):
    try:
        cursor.execute("""
            SELECT id, nome, origem, destino, residencia
            FROM farol_farmacia_locais
            WHERE farmacia_id = %s
        """, (farmacia_id,))
        colunas = [desc[0] for desc in cursor.description]
        resultado = cursor.fetchall()
        return [dict(zip(colunas, linha)) for linha in resultado]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/locais/{id}")
async def editar_local(id: int, request: Request):
    try:
        dados = await request.json()
        cursor.execute("""
            UPDATE farol_farmacia_locais
            SET nome = %s, origem = %s, destino = %s, residencia = %s
            WHERE id = %s
        """, (
            dados['nome'],
            dados['origem'],
            dados['destino'],
            dados.get('residencia', False),
            id
        ))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/locais/{id}")
def excluir_local(id: int):
    try:
        cursor.execute("DELETE FROM farol_farmacia_locais WHERE id = %s", (id,))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
