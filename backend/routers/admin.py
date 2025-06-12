# backend/routers/admin.py

from fastapi import APIRouter, HTTPException
from models import AdminLoginRequest
from db import cursor
from auth import criar_token, verificar_senha

router = APIRouter()

@router.post("/admin/login")
def login_admin(req: AdminLoginRequest):
    try:
        cursor.execute("SELECT senha_hash FROM farol_admins WHERE email = %s", (req.email,))
        resultado = cursor.fetchone()

        print("[LOGIN] email recebido:", req.email)
        print("[LOGIN] resultado do SELECT:", resultado)

        if not resultado or not verificar_senha(req.senha, resultado[0]):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")

        token = criar_token(req.email)
        return {"token": token}
    except Exception as e:
        print(f"[ERRO LOGIN ADMIN] {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao fazer login")

