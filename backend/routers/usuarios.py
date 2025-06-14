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
    codigo_ou_nome = dados.get("codigo")
    senha = dados.get("senha")

    if not codigo_ou_nome or not senha:
        raise HTTPException(status_code=400, detail="Código/nome e senha são obrigatórios.")

    cursor.execute("""
        SELECT * FROM farol_farmacia_usuarios
        WHERE (codigo = %s OR nome = %s) AND senha = %s
    """, (codigo_ou_nome, codigo_ou_nome, senha))

    usuario = cursor.fetchone()
    if usuario:
        colunas = [desc[0] for desc in cursor.description]
        dados_usuario = dict(zip(colunas, usuario))
        return {
            "status": "ok",
            "usuarioId": dados_usuario["id"],
            "farmaciaId": dados_usuario["farmacia_id"],
            "nome": dados_usuario["nome"]
        }
    else:
        return {"status": "erro", "mensagem": "Credenciais inválidas"}

