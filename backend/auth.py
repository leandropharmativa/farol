# backend/auth.py

import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.hash import bcrypt

# Chave secreta para JWT
SECRET_KEY = os.getenv("JWT_SECRET", "segredo_super_secreto")
ALGORITHM = "HS256"
EXPIRA_MINUTOS = 60

def criar_token(email: str):
    expira = datetime.utcnow() + timedelta(minutes=EXPIRA_MINUTOS)
    payload = {"sub": email, "exp": expira}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["sub"]
    except JWTError:
        return None

def gerar_hash(senha: str):
    return bcrypt.hash(senha)

def verificar_senha(senha: str, hash_salvo: str):
    return bcrypt.verify(senha, hash_salvo)
