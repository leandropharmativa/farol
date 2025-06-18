# backend/routers/pedidos.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from db import cursor
from utils.google_drive import upload_arquivo_para_drive
import os
import uuid
from uuid import UUID
from datetime import datetime
from typing import Optional
import asyncio
import unicodedata

def remover_acentos(texto):
    return ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')

router = APIRouter()
UPLOAD_DIR = "receitas"
os.makedirs(UPLOAD_DIR, exist_ok=True)

clientes_ativos = []

@router.post("/pedidos/criar")
async def criar_pedido(
    farmacia_id: UUID = Form(...),
    registro: str = Form(...),
    atendente_id: int = Form(...),
    origem_id: int = Form(...),
    destino_id: int = Form(...),
    previsao_entrega: str = Form(...),
    observacao: str = Form(""),
    receita: UploadFile = File(None)
):
    cursor.execute("SELECT 1 FROM farol_farmacia_pedidos WHERE registro = %s", (registro,))
    if cursor.fetchone():
        return JSONResponse(status_code=400, content={"erro": "Já existe um pedido com este registro."})

    filename = None
    if receita:
        ext = os.path.splitext(receita.filename)[-1].lower()
        temp_filename = f"temp_{registro}{ext}"
        temp_path = os.path.join("/tmp", temp_filename)
        with open(temp_path, "wb") as f:
            f.write(await receita.read())
        arquivo_id, link = upload_arquivo_para_drive(temp_path, f"{registro}{ext}")
        os.remove(temp_path)
        filename = link

    cursor.execute("""
        INSERT INTO farol_farmacia_pedidos (
            farmacia_id, registro, atendente_id,
            origem_id, destino_id, previsao_entrega, receita_arquivo,
            data_criacao, status_inclusao
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW() AT TIME ZONE 'America/Sao_Paulo', TRUE)
        RETURNING id
    """, (
        str(farmacia_id), registro, atendente_id,
        origem_id, destino_id, previsao_entrega, filename
    ))
    pedido_id = cursor.fetchone()[0]

    cursor.execute("""
        INSERT INTO farol_farmacia_pedido_logs (
            pedido_id, etapa, usuario_logado_id, usuario_confirmador_id, observacao
        ) VALUES (%s, %s, %s, %s, %s)
    """, (
        pedido_id, "Inclusão", atendente_id, atendente_id, observacao
    ))

    evento = f"novo_pedido:{farmacia_id}:{pedido_id}"
    for cliente in clientes_ativos:
        if cliente["farmacia_id"] == str(farmacia_id):
            await cliente["fila"].put(evento)

    return {
        "status": "ok",
        "mensagem": "Pedido criado com sucesso",
        "pedido_id": pedido_id
    }

@router.post("/pedidos/editar/{pedido_id}")
async def editar_pedido(
    pedido_id: int,
    registro: str = Form(...),
    atendente_id: int = Form(...),
    origem_id: int = Form(...),
    destino_id: int = Form(...),
    previsao_entrega: str = Form(...),
    receita: UploadFile = File(None),
    remover_receita: Optional[bool] = Form(False),
    usuario_logado_id: int = Form(...),
    status_inclusao: Optional[bool] = Form(None),
    status_impressao: Optional[bool] = Form(None),
    status_conferencia: Optional[bool] = Form(None),
    status_producao: Optional[bool] = Form(None),
    status_despacho: Optional[bool] = Form(None),
    status_entrega: Optional[bool] = Form(None),
    status_pagamento: Optional[bool] = Form(None),
    status_recebimento: Optional[bool] = Form(None)
):
    try:
        # Buscar dados anteriores
        cursor.execute("SELECT * FROM farol_farmacia_pedidos WHERE id = %s", (pedido_id,))
        anterior = cursor.fetchone()
        colunas = [desc[0] for desc in cursor.description]
        anterior_dict = dict(zip(colunas, anterior))

        previsao_dt = datetime.fromisoformat(previsao_entrega)
        novo_receita_link = None
        campos_status = {
            "status_inclusao": status_inclusao,
            "status_impressao": status_impressao,
            "status_conferencia": status_conferencia,
            "status_producao": status_producao,
            "status_despacho": status_despacho,
            "status_entrega": status_entrega,
            "status_pagamento": status_pagamento,
            "status_recebimento": status_recebimento
        }

        status_sql = []
        status_values = []
        alteracoes = []

        # Verifica alterações de campos principais
        if registro != anterior_dict['registro']:
            alteracoes.append(f"registro: {anterior_dict['registro']} → {registro}")
        if atendente_id != anterior_dict['atendente_id']:
            alteracoes.append("atendente alterado")
        if origem_id != anterior_dict['origem_id']:
            alteracoes.append("origem alterada")
        if destino_id != anterior_dict['destino_id']:
            alteracoes.append("destino alterado")
        if previsao_dt.isoformat() != anterior_dict['previsao_entrega'].isoformat():
            alteracoes.append(f"previsão entrega: {anterior_dict['previsao_entrega'].isoformat()} → {previsao_dt.isoformat()}")

        # Verifica alterações de status
        for campo, novo_valor in campos_status.items():
            if novo_valor is not None and anterior_dict.get(campo) != novo_valor:
                status_sql.append(f"{campo} = %s")
                status_values.append(novo_valor)
                alteracoes.append(f"{campo.replace('status_', '').capitalize()} → {novo_valor}")

        # Verifica manipulação da receita
        if remover_receita and anterior_dict["receita_arquivo"]:
            alteracoes.append("receita removida")
            novo_receita_link = None
        elif receita:
            ext = os.path.splitext(receita.filename)[-1].lower()
            temp_filename = f"temp_{registro}{ext}"
            temp_path = os.path.join("/tmp", temp_filename)
            with open(temp_path, "wb") as f:
                f.write(await receita.read())
            _, novo_receita_link = upload_arquivo_para_drive(temp_path, f"{registro}{ext}")
            os.remove(temp_path)
            alteracoes.append("nova receita adicionada")

        # Monta SQL final
        sql = f"""
            UPDATE farol_farmacia_pedidos SET
                registro=%s, atendente_id=%s,
                origem_id=%s, destino_id=%s, previsao_entrega=%s
                {", receita_arquivo = %s" if remover_receita or receita else ""}
                {',' if status_sql else ''}
                {', '.join(status_sql)}
            WHERE id=%s
        """

        base_params = [
            registro, atendente_id,
            origem_id, destino_id, previsao_dt
        ]
        if remover_receita:
            base_params.append(None)
        elif receita:
            base_params.append(novo_receita_link)
        params = base_params + status_values + [pedido_id]

        cursor.execute(sql, tuple(params))

        # Registra log se houve alteração
        if alteracoes:
            obs_log = "; ".join(alteracoes)
            cursor.execute("""
                INSERT INTO farol_farmacia_pedido_logs (
                    pedido_id, etapa, usuario_logado_id, usuario_confirmador_id, observacao
                ) VALUES (%s, %s, %s, %s, %s)
            """, (
                pedido_id, "Edição", usuario_logado_id, usuario_logado_id, obs_log
            ))

        return {"status": "ok", "mensagem": "Pedido atualizado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao editar pedido: {str(e)}")

@router.delete("/pedidos/excluir/{pedido_id}")
async def excluir_pedido(pedido_id: int):
    try:
        cursor.execute("DELETE FROM farol_farmacia_pedidos WHERE id = %s", (pedido_id,))
        return {"status": "ok", "mensagem": "Pedido excluído com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir pedido: {str(e)}")

@router.post("/pedidos/{pedido_id}/registrar-etapa")
def registrar_etapa(
    pedido_id: int,
    etapa: str = Form(...),
    usuario_logado_id: int = Form(...),
    codigo_confirmacao: int = Form(...),
    observacao: str = Form(""),
    itens_solidos: Optional[int] = Form(None),
    itens_semisolidos: Optional[int] = Form(None),
    itens_saches: Optional[int] = Form(None)
):
    # Confirmação de usuário
    cursor.execute("SELECT id FROM farol_farmacia_usuarios WHERE codigo = %s", (codigo_confirmacao,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Código de confirmação inválido.")
    usuario_confirmador_id = row[0]

    etapa_normalizada = remover_acentos(etapa.lower())

    # Mapeamento de permissões
    coluna_permissao = {
        "impressao": "permissao_impressao",
        "conferencia": "permissao_conferencia",
        "producao": "permissao_producao",
        "despacho": "permissao_despacho",
        "entrega": "permissao_entrega",
        "pagamento": "permissao_registrar_pagamento",
        "recebimento": "permissao_recebimento"
    }.get(etapa_normalizada)

    if coluna_permissao:
        cursor.execute(
            f"SELECT {coluna_permissao} FROM farol_farmacia_usuarios WHERE id = %s",
            (usuario_confirmador_id,)
        )
        permitido = cursor.fetchone()
        if not permitido or not permitido[0]:
            raise HTTPException(status_code=403, detail="Usuário não tem permissão para essa etapa.")

    # Inserção no log
    if etapa_normalizada == "conferencia":
        cursor.execute("""
            INSERT INTO farol_farmacia_pedido_logs (
                pedido_id, etapa, usuario_logado_id, usuario_confirmador_id,
                observacao, itens_solidos, itens_semisolidos, itens_saches
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            pedido_id, etapa, usuario_logado_id, usuario_confirmador_id,
            observacao, itens_solidos, itens_semisolidos, itens_saches
        ))
    else:
        cursor.execute("""
            INSERT INTO farol_farmacia_pedido_logs (
                pedido_id, etapa, usuario_logado_id, usuario_confirmador_id, observacao
            ) VALUES (%s, %s, %s, %s, %s)
        """, (
            pedido_id, etapa, usuario_logado_id, usuario_confirmador_id, observacao
        ))

    # Atualiza status da etapa no pedido
    coluna_status = {
        "impressao": "status_impressao",
        "conferencia": "status_conferencia",
        "producao": "status_producao",
        "despacho": "status_despacho",
        "entrega": "status_entrega",
        "pagamento": "status_pagamento",
        "recebimento": "status_recebimento"
    }.get(etapa_normalizada)

    if coluna_status:
        cursor.execute(f"""
            UPDATE farol_farmacia_pedidos
            SET {coluna_status} = TRUE
            WHERE id = %s
        """, (pedido_id,))

    return {"status": "ok", "mensagem": f"Etapa '{etapa}' registrada com sucesso"}

@router.get("/pedidos/listar")
def listar_pedidos(farmacia_id: UUID):
    cursor.execute("""
        SELECT 
            p.id,
            p.registro,
            p.previsao_entrega,
            p.data_criacao,
            p.status_inclusao,
            p.status_impressao,
            p.status_conferencia,
            p.status_producao,
            p.status_despacho,
            p.status_entrega,
            p.status_pagamento,
            p.status_recebimento,  
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
    if cursor.description is None:
        return []
    colunas = [desc[0] for desc in cursor.description]
    return [dict(zip(colunas, row)) for row in cursor.fetchall()]

@router.get("/pedidos/{pedido_id}/logs")
def listar_logs_pedido(pedido_id: int):
    try:
        cursor.execute("""
            SELECT 
                l.id,
                l.etapa,
                l.data_hora,
                l.observacao,
                l.itens_solidos,
                l.itens_semisolidos,
                l.itens_saches,
                u1.nome AS usuario_logado,
                u2.nome AS usuario_confirmador
            FROM farol_farmacia_pedido_logs l
            JOIN farol_farmacia_usuarios u1 ON l.usuario_logado_id = u1.id
            LEFT JOIN farol_farmacia_usuarios u2 ON l.usuario_confirmador_id = u2.id
            WHERE l.pedido_id = %s
            ORDER BY l.data_hora DESC
        """, (pedido_id,))
        if cursor.description is None:
            return []
        colunas = [desc[0] for desc in cursor.description]
        return [dict(zip(colunas, row)) for row in cursor.fetchall()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar logs: {str(e)}")

@router.get("/pedidos/stream")
async def stream_pedidos(request: Request, farmacia_id: UUID = Query(...)):
    queue = asyncio.Queue()
    cliente = {"fila": queue, "farmacia_id": str(farmacia_id)}
    clientes_ativos.append(cliente)

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                evento = await queue.get()
                yield f"data: {evento}\n\n"
        finally:
            clientes_ativos.remove(cliente)

    return EventSourceResponse(event_generator())

@router.get("/pedidos/{pedido_id}")
def obter_pedido(pedido_id: int):
    cursor.execute("""
        SELECT 
            p.id,
            p.registro,
            p.previsao_entrega,
            p.data_criacao,
            p.status_inclusao,
            p.status_producao,
            p.status_despacho,
            p.status_entrega,
            p.status_pagamento,
            p.status_recebimento,  
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
    if not row or cursor.description is None:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    colunas = [desc[0] for desc in cursor.description]
    return dict(zip(colunas, row))
