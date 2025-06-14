import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.hash import bcrypt

from db import conn, cursor

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

def verificar_tipo_login(identificador: str) -> str:
    """
    Verifica se o identificador pertence a um admin, farmácia ou usuário.
    Pode ser e-mail (admin/farmácia) ou código (usuário).
    Retorna: "admin", "farmacia", "usuario" ou "nenhum"
    """
    identificador = identificador.strip().lower()

    # Verifica admin
    cursor.execute("SELECT 1 FROM farol_admin WHERE LOWER(email) = %s LIMIT 1", (identificador,))
    if cursor.fetchone():
        return "admin"

    # Verifica farmácia
    cursor.execute("SELECT 1 FROM farol_farmacias WHERE LOWER(email) = %s LIMIT 1", (identificador,))
    if cursor.fetchone():
        return "farmacia"

    # Verifica usuário da farmácia (por código)
    cursor.execute("SELECT 1 FROM farol_farmacia_usuarios WHERE LOWER(codigo) = %s LIMIT 1", (identificador,))
    if cursor.fetchone():
        return "usuario"

    return "nenhum"
