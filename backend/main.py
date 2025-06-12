# backend/main.py

from fastapi import FastAPI
from routers import serial, admin
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
