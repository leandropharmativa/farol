#backend/routers/pedidos.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from db import cursor
import os
import uuid
from uuid import UUID
from datetime import datetime
from typing import Optional
import asyncio

router = APIRouter()
UPLOAD_DIR = "receitas"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 🔔 Filas ativas para SSE
clientes_ativos = []

# 📌 Criar pedido
@router.post("/pedidos/criar")
async def criar_pedido(
    farmacia_id: UUID = Form(...),
    registro: str = Form(...),
    numero_itens: int = Form(...),
    atendente_id: int = Form(...),
    origem_id: int = Form(...),
    destino_id: int = Form(...),
    previsao_entrega: str = Form(...),
    receita: UploadFile = File(None)
):
    cursor.execute("SELECT 1 FROM farol_farmacia_pedidos WHERE registro = %s", (registro,))
    if cursor.fetchone():
        return JSONResponse(status_code=400, content={"erro": "Já existe um pedido com este registro."})

    filename = None
    if receita:
        ext = os.path.splitext(receita.filename)[-1].lower()
        filename = f"{registro}{ext}"
        with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
            f.write(await receita.read())

    cursor.execute("""
        INSERT INTO farol_farmacia_pedidos (
            farmacia_id, registro, numero_itens, atendente_id,
            origem_id, destino_id, previsao_entrega, receita_arquivo,
            data_criacao, status_inclusao
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW() AT TIME ZONE 'America/Sao_Paulo', TRUE)
        RETURNING id
    """, (
        str(farmacia_id), registro, numero_itens, atendente_id,
        origem_id, destino_id, previsao_entrega, filename
    ))
    pedido_id = cursor.fetchone()[0]

    cursor.execute("""
        INSERT INTO farol_farmacia_pedido_logs (
            pedido_id, etapa, usuario_logado_id, usuario_confirmador_id
        ) VALUES (%s, %s, %s, %s)
    """, (
        pedido_id, "Inclusão", atendente_id, atendente_id
    ))

    # 🔔 Notificar clientes SSE com data e farmácia
    hoje_str = datetime.utcnow().date().isoformat()  # yyyy-mm-dd
    evento = f"novo_pedido:{farmacia_id}:{pedido_id}"
    for q in clientes_ativos:
        await q.put(evento)


    return {
    "status": "ok",
    "mensagem": "Pedido criado com sucesso",
    "pedido_id": pedido_id
    }

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
    receita: UploadFile = File(None),
    status_inclusao: Optional[bool] = Form(None),
    status_impressao: Optional[bool] = Form(None),
    status_conferencia: Optional[bool] = Form(None),
    status_producao: Optional[bool] = Form(None),
    status_despacho: Optional[bool] = Form(None),
    status_entrega: Optional[bool] = Form(None),
    status_pagamento: Optional[bool] = Form(None)
):
    try:
        previsao_dt = datetime.fromisoformat(previsao_entrega)
        filename = None

        campos_status = {
            "status_inclusao": status_inclusao,
            "status_impressao": status_impressao,
            "status_conferencia": status_conferencia,
            "status_producao": status_producao,
            "status_despacho": status_despacho,
            "status_entrega": status_entrega,
            "status_pagamento": status_pagamento
        }

        status_sql = []
        status_values = []

        for campo, valor in campos_status.items():
            if valor is not None:
                status_sql.append(f"{campo} = %s")
                status_values.append(valor)

        if receita:
            ext = os.path.splitext(receita.filename)[-1].lower()
            filename = f"{registro}_{uuid.uuid4().hex[:6]}{ext}"
            with open(os.path.join(UPLOAD_DIR, filename), "wb") as f:
                f.write(await receita.read())

            update_sql = f"""
                UPDATE farol_farmacia_pedidos SET
                    registro=%s, numero_itens=%s, atendente_id=%s,
                    origem_id=%s, destino_id=%s, previsao_entrega=%s,
                    receita_arquivo=%s
                    {',' if status_sql else ''}
                    {', '.join(status_sql)}
                WHERE id=%s
            """
            cursor.execute(update_sql, (
                registro, numero_itens, atendente_id,
                origem_id, destino_id, previsao_dt,
                filename, *status_values, pedido_id
            ))
        else:
            update_sql = f"""
                UPDATE farol_farmacia_pedidos SET
                    registro=%s, numero_itens=%s, atendente_id=%s,
                    origem_id=%s, destino_id=%s, previsao_entrega=%s
                    {',' if status_sql else ''}
                    {', '.join(status_sql)}
                WHERE id=%s
            """
            cursor.execute(update_sql, (
                registro, numero_itens, atendente_id,
                origem_id, destino_id, previsao_dt,
                *status_values, pedido_id
            ))

        return {"status": "ok", "mensagem": "Pedido atualizado com sucesso"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao editar pedido: {str(e)}")

# 📌 Excluir pedido
@router.delete("/pedidos/excluir/{pedido_id}")
async def excluir_pedido(pedido_id: int):
    try:
        cursor.execute("DELETE FROM farol_farmacia_pedidos WHERE id = %s", (pedido_id,))
        return {"status": "ok", "mensagem": "Pedido excluído com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir pedido: {str(e)}")

# 📌 Registrar etapa
@router.post("/pedidos/{pedido_id}/registrar-etapa")
def registrar_etapa(
    pedido_id: int,
    etapa: str = Form(...),
    usuario_logado_id: int = Form(...),
    codigo_confirmacao: int = Form(...),
    observacao: str = Form("")
):
    cursor.execute("SELECT id FROM farol_farmacia_usuarios WHERE codigo = %s", (codigo_confirmacao,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Código de confirmação inválido.")
    usuario_confirmador_id = row[0]

    cursor.execute("""
        INSERT INTO farol_farmacia_pedido_logs (
            pedido_id, etapa, usuario_logado_id, usuario_confirmador_id, observacao
        ) VALUES (%s, %s, %s, %s, %s)
    """, (
        pedido_id, etapa, usuario_logado_id, usuario_confirmador_id, observacao
    ))

    coluna_status = {
        "inclusao": "status_inclusao",
        "producao": "status_producao",
        "despacho": "status_despacho",
        "entrega": "status_entrega",
        "pagamento": "status_pagamento"
    }.get(etapa.lower())

    if coluna_status:
        cursor.execute(f"""
            UPDATE farol_farmacia_pedidos
            SET {coluna_status} = TRUE
            WHERE id = %s
        """, (pedido_id,))

    return {"status": "ok", "mensagem": f"Etapa '{etapa}' registrada com sucesso"}

# 📌 Listar pedidos
@router.get("/pedidos/listar")
def listar_pedidos(farmacia_id: UUID):
    cursor.execute("""
        SELECT 
            p.id,
            p.registro,
            p.numero_itens,
            p.previsao_entrega,
            p.data_criacao,
            p.status_inclusao,
            p.status_producao,
            p.status_despacho,
            p.status_entrega,
            p.status_pagamento,
            p.receita_arquivo,
            u.nome AS atendente,
            l_origem.nome AS origem_nome,
            l_destino.nome AS destino_nome
        FROM farol_farmacia_pedidos p
        LEFT JOIN farol_farmacia_usuarios u ON p.atendente_id = u.id
        LEFT JOIN farol_farmacia_locais l_origem ON p.origem_id = l_origem.id
        LEFT JOIN farol_farmacia_locais l_destino ON p.destino_id = l_destino.id
        WHERE p.farmacia_id = %s
        ORDER BY p.data_criacao DESC
    """, (str(farmacia_id),))
    colunas = [desc[0] for desc in cursor.description]
    return [dict(zip(colunas, row)) for row in cursor.fetchall()]

# 📌 Logs do pedido
@router.get("/pedidos/{pedido_id}/logs")
def listar_logs_pedido(pedido_id: int):
    cursor.execute("""
        SELECT 
            l.id,
            l.etapa,
            l.data_hora,
            l.observacao,
            u1.nome AS usuario_logado,
            u2.nome AS usuario_confirmador
        FROM farol_farmacia_pedido_logs l
        JOIN farol_farmacia_usuarios u1 ON l.usuario_logado_id = u1.id
        JOIN farol_farmacia_usuarios u2 ON l.usuario_confirmador_id = u2.id
        WHERE l.pedido_id = %s
        ORDER BY l.data_hora DESC
    """, (pedido_id,))
    colunas = [desc[0] for desc in cursor.description]
    return [dict(zip(colunas, row)) for row in cursor.fetchall()]

# 📌 SSE: stream de novos pedidos
@router.get("/pedidos/stream")
async def stream_pedidos(request: Request):
    async def event_generator():
        queue = asyncio.Queue()
        clientes_ativos.append(queue)
        try:
            while True:
                if await request.is_disconnected():
                    break
                evento = await queue.get()
                yield f"data: {evento}\n\n"
        finally:
            clientes_ativos.remove(queue)

    return EventSourceResponse(event_generator())

@router.get("/pedidos/{pedido_id}")
def obter_pedido(pedido_id: int):
    cursor.execute("""
        SELECT 
            p.id,
            p.registro,
            p.numero_itens,
            p.previsao_entrega,
            p.data_criacao,
            p.status_inclusao,
            p.status_producao,
            p.status_despacho,
            p.status_entrega,
            p.status_pagamento,
            p.receita_arquivo,
            u.nome AS atendente,
            l_origem.nome AS origem_nome,
            l_destino.nome AS destino_nome
        FROM farol_farmacia_pedidos p
        LEFT JOIN farol_farmacia_usuarios u ON p.atendente_id = u.id
        LEFT JOIN farol_farmacia_locais l_origem ON p.origem_id = l_origem.id
        LEFT JOIN farol_farmacia_locais l_destino ON p.destino_id = l_destino.id
        WHERE p.id = %s
    """, (pedido_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    colunas = [desc[0] for desc in cursor.description]
    return dict(zip(colunas, row))
