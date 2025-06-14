from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import verificar_tipo_login

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.get("/verificar-login/{identificador}")
def verificar_login(identificador: str, db: Session = Depends(get_db)):
    tipo = verificar_tipo_login(identificador, db)
    return {"tipo": tipo}
