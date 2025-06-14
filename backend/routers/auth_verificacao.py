#backend/routers/auth_verificacao.py
from fastapi import APIRouter
from auth import verificar_tipo_login

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.get("/verificar-login/{identificador}")
def verificar_login(identificador: str):
    tipo = verificar_tipo_login(identificador)
    return {"tipo": tipo}
