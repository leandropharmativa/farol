# backend/models.py

from pydantic import BaseModel
from typing import Optional

class SerialRequest(BaseModel):
    nomeEmpresa: str
    email: str
    validadeDias: Optional[int] = 30

class ValidarSerialRequest(BaseModel):
    codigo: str
    email: str

class AdminLoginRequest(BaseModel):
    email: str
    senha: str
