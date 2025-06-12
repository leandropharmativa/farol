# backend/routers/serial.py

from fastapi import Header, HTTPException, APIRouter, Depends
from auth import verificar_token
from models import SerialRequest, ValidarSerialRequest
from db import cursor
from uuid import uuid4
from datetime import datetime, timedelta
import random
import string


router = APIRouter()

def gerar_codigo():
    return f"FARM-{''.join(random.choices(string.ascii_uppercase + string.digits, k=4))}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=4))}"

@router.post("/serial/gerar")
def gerar_serial(req: SerialRequest, authorization: str = Header(None)):
    # Verifica se o header Authorization foi enviado e está no formato correto
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente ou malformado")

    # Extrai o token e valida
    token = authorization.split(" ")[1]
    email = verificar_token(token)

    if not email:
        raise HTTPException(status_code=401, detail="Token inválido")

    # Geração do código e validade
    codigo = gerar_codigo()
    validade = datetime.now() + timedelta(days=req.validadeDias)

    # Insere o serial no banco
    cursor.execute("""
        INSERT INTO farol_seriais (id, codigo, nome_empresa, email_vinculado, validade_ate, ativo)
        VALUES (%s, %s, %s, %s, %s, true)
    """, (str(uuid4()), codigo, req.nomeEmpresa, req.email, validade))

    return {"status": "ok", "codigo": codigo}

@router.post("/serial/validar")
def validar_serial(req: ValidarSerialRequest):
    cursor.execute("""
        SELECT * FROM farol_seriais
        WHERE codigo = %s AND email_vinculado = %s AND ativo = true AND validade_ate >= NOW() AND farmacia_id IS NULL
    """, (req.codigo, req.email))

    resultado = cursor.fetchone()
    if not resultado:
        return {"status": "erro", "mensagem": "Serial inválido, expirado ou já utilizado."}

    return {"status": "ok", "nomeEmpresa": resultado[2]}  # nome_empresa

@router.get("/serial/listar")
def listar_seriais(authorization: str = Header(None)):
    # Verifica e valida o token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token ausente ou malformado")

    token = authorization.split(" ")[1]
    email = verificar_token(token)

    if not email:
        raise HTTPException(status_code=401, detail="Token inválido")

    # Consulta todos os seriais gerados
    cursor.execute("""
        SELECT codigo, nome_empresa, email_vinculado, validade_ate, ativo
        FROM farol_seriais
        ORDER BY validade_ate DESC
    """)
    resultados = cursor.fetchall()

    # Monta e retorna a lista formatada
    return [
        {
            "codigo": r[0],
            "nomeEmpresa": r[1],
            "email": r[2],
            "validade": r[3],
            "ativo": r[4]
        }
        for r in resultados
    ]

@router.get("/serial/verificar/{codigo}")
def verificar_serial(codigo: str):
    cursor.execute("""
        SELECT codigo, nome_empresa, farmacia_id
        FROM farol_seriais
        WHERE codigo = %s AND ativo = true AND validade_ate >= NOW()
    """, (codigo,))
    resultado = cursor.fetchone()

    if not resultado:
        return {"status": "erro", "mensagem": "Código inválido ou expirado"}

    return {
        "status": "ok",
        "codigo": resultado[0],
        "nomeEmpresa": resultado[1],
        "precisaCriarLogin": resultado[2] is None
    }

