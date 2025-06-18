# backend/models.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID

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

class NovaFarmaciaRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    codigoSerial: str

class LoginFarmaciaRequest(BaseModel):
    email: EmailStr
    senha: str

class UsuarioFarmaciaBase(BaseModel):
    codigo: int
    nome: str
    senha: str
    permissao_inclusao: bool = False
    permissao_impressao: bool = False
    permissao_conferencia: bool = False
    permissao_producao: bool = False
    permissao_despacho: bool = False
    permissao_entrega: bool = False
    permissao_registrar_pagamento: bool = False

class UsuarioFarmaciaCreate(UsuarioFarmaciaBase):
    farmacia_id: UUID

class UsuarioFarmaciaUpdate(UsuarioFarmaciaBase):
    id: int

class LocalFarmaciaCreate(BaseModel):
    farmacia_id: UUID
    nome: str
    origem: bool
    destino: bool
    residencia: bool = False

class LogoUpdate(BaseModel):
    logo_url: str
