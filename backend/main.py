# backend/main.py

from fastapi import FastAPI
from routers import serial, admin, farmacia, usuarios, locais, logo, auth_verificacao
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="API Farol")

origens = [
    "https://farol-nu.vercel.app"
]

# Libera CORS para frontend (ex: Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origens,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui rotas
app.include_router(admin.router)
app.include_router(serial.router)
app.include_router(farmacia.router)
app.include_router(usuarios.router)
app.include_router(locais.router)
app.include_router(logo.router)
app.include_router(auth_verificacao.router)

