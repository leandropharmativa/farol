# backend/routers/farmacia.py

from fastapi import APIRouter, HTTPException
from models import NovaFarmaciaRequest, LoginFarmaciaRequest
from db import cursor
from uuid import uuid4
from auth import criar_token

router = APIRouter()

@router.post("/farmacia/registrar")
def registrar_farmacia(dados: NovaFarmaciaRequest):
    # Confere se o serial existe e ainda não foi usado
    cursor.execute("""
        SELECT id FROM farol_seriais
        WHERE codigo = %s AND email_vinculado = %s AND ativo = true AND validade_ate >= NOW() AND farmacia_id IS NULL
    """, (dados.codigoSerial, dados.email))
    serial = cursor.fetchone()

    if not serial:
        raise HTTPException(status_code=400, detail="Serial inválido ou já utilizado.")

    id_farmacia = str(uuid4())

    # Cria a farmácia
    cursor.execute("""
        INSERT INTO farol_farmacias (id, nome, email, senha)
        VALUES (%s, %s, %s, %s)
    """, (id_farmacia, dados.nome, dados.email, dados.senha))

    # Vincula o serial à farmácia
    cursor.execute("""
        UPDATE farol_seriais
        SET farmacia_id = %s
        WHERE codigo = %s
    """, (id_farmacia, dados.codigoSerial))

    return {"status": "ok"}

@router.post("/farmacia/login")
def login_farmacia(dados: LoginFarmaciaRequest):
cursor.execute("""
    SELECT f.id, f.nome FROM farol_farmacias f
    JOIN farol_seriais s ON s.farmacia_id = f.id
    WHERE f.email = %s AND f.senha = %s
      AND s.ativo = true
      AND s.validade_ate >= NOW()
""", (dados.email, dados.senha))
resultado = cursor.fetchone()

if not resultado:
    raise HTTPException(status_code=401, detail="Credenciais inválidas ou código expirado.")

farmacia_id, nome = resultado
token = criar_token(dados.email)

return {
    "status": "ok",
    "token": token,
    "farmaciaId": farmacia_id,
    "nome": nome,
    "email": dados.email
}


