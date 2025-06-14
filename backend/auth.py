import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.hash import bcrypt
from sqlalchemy.orm import Session

from database import get_db
from models import FarolAdmin, FarolFarmacia, FarolFarmaciaUsuario

# Configurações do JWT
SECRET_KEY = os.getenv("JWT_SECRET", "segredo_super_secreto")
ALGORITHM = "HS256"
EXPIRA_MINUTOS = 60

def criar_token(email: str) -> str:
    expira = datetime.utcnow() + timedelta(minutes=EXPIRA_MINUTOS)
    payload = {"sub": email, "exp": expira}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

def gerar_hash(senha: str) -> str:
    return bcrypt.hash(senha)

def verificar_senha(senha: str, hash_salvo: str) -> bool:
    return bcrypt.verify(senha, hash_salvo)

def verificar_tipo_login(identificador: str, db: Session = None) -> str:
    """
    Verifica se o identificador pertence a um admin, farmácia ou usuário.
    Pode ser e-mail (admin/farmácia) ou código (usuário).
    Retorna: "admin", "farmacia", "usuario" ou "nenhum"
    """
    if db is None:
        db = next(get_db())

    identificador = identificador.strip().lower()

    if db.query(FarolAdmin).filter_by(email=identificador).first():
        return "admin"

    if db.query(FarolFarmacia).filter_by(email=identificador).first():
        return "farmacia"

    if db.query(FarolFarmaciaUsuario).filter_by(codigo=identificador).first():
        return "usuario"

    return "nenhum"
