# 📄 backend/routers/pedidos.py
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from db import cursor
import os

router = APIRouter()
UPLOAD_DIR = "receitas"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 📌 Criar pedido
@router.post("/pedidos/criar")
async def criar_pedido(
    farmacia_id: int = Form(...),
    registro: str = Form(...),
    numero_itens: int = Form(...),
    atendente_id: int = Form(...),
    origem_id: int = Form(...),
    destino_id: int = Form(...),
    previsao_entrega: str = Form(...),
    receita: UploadFile = File(None)
):
    filename = None
    if receita:
        ext = os.path.splitext(receita.filename)[-1].lower()
        filename = f"{registro}{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(await receita.read())

    cursor.execute("""
        INSERT INTO farol_farmacia_pedidos (
            farmacia_id, registro, numero_itens, atendente_id,
            origem_id, destino_id, previsao_entrega, receita_arquivo
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        farmacia_id, registro, numero_itens, atendente_id,
        origem_id, destino_id, previsao_entrega, filename
    ))

    return {"status": "ok", "mensagem": "Pedido criado com sucesso"}

# 📌 Editar pedido
@router.post("/pedidos/editar/{pedido_id}")
async def editar_pedido(
    pedido_id: int,
    registro: str = Form(...),
    numero_itens: int = Form(...),
    atendente_id: int = Form(...),
    origem_id: int = Form(...),
    destino_id: int = Form(...),
    previsao_entrega: str = Form(...),
    receita: UploadFile = File(None)
):
    filename = None
    if receita:
        ext = os.path.splitext(receita.filename)[-1].lower()
        filename = f"{registro}{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(await receita.read())

        cursor.execute("""
            UPDATE farol_farmacia_pedidos SET
                registro=%s, numero_itens=%s, atendente_id=%s,
                origem_id=%s, destino_id=%s, previsao_entrega=%s,
                receita_arquivo=%s
            WHERE id=%s
        """, (
            registro, numero_itens, atendente_id,
            origem_id, destino_id, previsao_entrega,
            filename, pedido_id
        ))
    else:
        cursor.execute("""
            UPDATE farol_farmacia_pedidos SET
                registro=%s, numero_itens=%s, atendente_id=%s,
                origem_id=%s, destino_id=%s, previsao_entrega=%s
            WHERE id=%s
        """, (
            registro, numero_itens, atendente_id,
            origem_id, destino_id, previsao_entrega,
            pedido_id
        ))

    return {"status": "ok", "mensagem": "Pedido atualizado com sucesso"}

# 📌 Excluir pedido
@router.delete("/pedidos/excluir/{pedido_id}")
async def excluir_pedido(pedido_id: int):
    cursor.execute("DELETE FROM farol_farmacia_pedidos WHERE id = %s", (pedido_id,))
    return {"status": "ok", "mensagem": "Pedido excluído com sucesso"}
