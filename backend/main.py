# backend/main.py

from fastapi import FastAPI
from routers import serial
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="API Farol")

# Libera CORS para frontend (ex: Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui rotas
app.include_router(serial.router)
