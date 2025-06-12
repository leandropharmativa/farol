# backend/routers/serial.py

from fastapi import APIRouter
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
def gerar_serial(req: SerialRequest):
    codigo = gerar_codigo()
    validade = datetime.now() + timedelta(days=req.validadeDias)

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
