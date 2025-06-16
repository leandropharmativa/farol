from fastapi import APIRouter, HTTPException, Request, Body
from db import cursor
from models import UsuarioFarmaciaCreate, UsuarioFarmaciaUpdate
from typing import List
import hashlib

router = APIRouter()

@router.post("/usuarios")
def criar_usuario(dados: UsuarioFarmaciaCreate):
    try:
        cursor.execute("""
            INSERT INTO farol_farmacia_usuarios (
                farmacia_id, codigo, nome, senha,
                permissao_inclusao, permissao_impressao, permissao_conferencia,
                permissao_producao, permissao_despacho, permissao_entrega,
                permissao_registrar_pagamento
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(dados.farmacia_id), dados.codigo, dados.nome, dados.senha,
            dados.permissao_inclusao, dados.permissao_impressao, dados.permissao_conferencia,
            dados.permissao_producao, dados.permissao_despacho, dados.permissao_entrega,
            dados.permissao_registrar_pagamento
        ))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usuarios/{farmacia_id}")
def listar_usuarios(farmacia_id: str):
    cursor.execute("SELECT * FROM farol_farmacia_usuarios WHERE farmacia_id = %s", (farmacia_id,))
    colunas = [desc[0] for desc in cursor.description]
    resultado = cursor.fetchall()
    return [dict(zip(colunas, linha)) for linha in resultado]

@router.put("/usuarios/{id}")
async def editar_usuario(id: int, request: Request):
    try:
        dados = await request.json()
        cursor.execute("""
            UPDATE farol_farmacia_usuarios SET
                nome = %s,
                senha = %s,
                permissao_inclusao = %s,
                permissao_impressao = %s,
                permissao_conferencia = %s,
                permissao_producao = %s,
                permissao_despacho = %s,
                permissao_entrega = %s,
                permissao_registrar_pagamento = %s
            WHERE id = %s
        """, (
            dados['nome'], dados['senha'],
            dados['permissao_inclusao'], dados['permissao_impressao'], dados['permissao_conferencia'],
            dados['permissao_producao'], dados['permissao_despacho'], dados['permissao_entrega'],
            dados['permissao_registrar_pagamento'], id
        ))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/usuarios/{id}")
def excluir_usuario(id: int):
    try:
        cursor.execute("DELETE FROM farol_farmacia_usuarios WHERE id = %s", (id,))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/usuarios/login")
def login_usuario(dados: dict = Body(...)):
    codigo = dados.get("codigo")
    senha = dados.get("senha")

    if not codigo or not senha:
        raise HTTPException(status_code=400, detail="Código e senha são obrigatórios.")

    cursor.execute("""
        SELECT 
            u.id, 
            u.farmacia_id, 
            u.nome, 
            f.nome AS nome_farmacia,
            u.permissao_inclusao,
            u.permissao_impressao,
            u.permissao_conferencia,
            u.permissao_producao,
            u.permissao_despacho,
            u.permissao_entrega,
            u.permissao_registrar_pagamento
        FROM farol_farmacia_usuarios u
        JOIN farol_farmacias f ON f.id = u.farmacia_id
        WHERE u.codigo = %s AND u.senha = %s
    """, (codigo, senha))

    usuario = cursor.fetchone()
    if usuario:
        return {
            "status": "ok",
            "usuarioId": usuario[0],
            "farmaciaId": usuario[1],
            "nome": usuario[2],
            "nomeFarmacia": usuario[3],
            "permissao_inclusao": usuario[4],
            "permissao_impressao": usuario[5],
            "permissao_conferencia": usuario[6],
            "permissao_producao": usuario[7],
            "permissao_despacho": usuario[8],
            "permissao_entrega": usuario[9],
            "permissao_registrar_pagamento": usuario[10],
        }
    else:
        return {"status": "erro", "mensagem": "Credenciais inválidas"}

@router.get("/usuarios/proximo_codigo/{farmacia_id}")
def proximo_codigo_usuario(farmacia_id: str):
    cursor.execute("""
        SELECT MAX(CAST(codigo AS INTEGER)) FROM farol_farmacia_usuarios
        WHERE farmacia_id = %s
    """, (farmacia_id,))
    max_codigo = cursor.fetchone()[0] or 999
    return {"proximo": max_codigo + 1}

