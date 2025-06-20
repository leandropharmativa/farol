#backend/routers/entregas.py
from fastapi import APIRouter, Form, HTTPException
from db import cursor
from uuid import UUID
from datetime import datetime

router = APIRouter()

@router.post("/entregas/registrar")
def registrar_entrega(
    pedido_id: int = Form(...),
    farmacia_id: UUID = Form(...),
    nome_paciente: str = Form(...),
    endereco_entrega: str = Form(...),
    entregador_id: int = Form(...),
    valor_pago: float = Form(None),
    forma_pagamento: str = Form(None)
):
    try:
        cursor.execute("SELECT 1 FROM farol_entregas WHERE pedido_id = %s", (pedido_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Entrega já registrada para este pedido.")

        cursor.execute("""
            INSERT INTO farol_entregas (
                pedido_id, farmacia_id, nome_paciente, endereco_entrega,
                valor_pago, forma_pagamento, entregador_id, data_despacho
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            pedido_id, str(farmacia_id), nome_paciente.strip(), endereco_entrega.strip(),
            valor_pago, forma_pagamento, entregador_id,
            datetime.now()
        ))

        return {"status": "ok", "mensagem": "Entrega registrada com sucesso"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao registrar entrega: {str(e)}")


@router.get("/entregas/{pedido_id}")
def obter_entrega_por_pedido(pedido_id: int):
    try:
        cursor.execute("""
            SELECT 
                e.id, e.pedido_id, e.farmacia_id, e.nome_paciente, 
                e.endereco_entrega, e.valor_pago, e.forma_pagamento, 
                e.entregador_id, u.nome AS entregador_nome, e.data_despacho
            FROM farol_entregas e
            LEFT JOIN farol_usuarios u ON e.entregador_id = u.id
            WHERE e.pedido_id = %s
        """, (pedido_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Entrega não encontrada")

        return {
            "id": row[0],
            "pedido_id": row[1],
            "farmacia_id": row[2],
            "nome_paciente": row[3],
            "endereco_entrega": row[4],
            "valor_pago": row[5],
            "forma_pagamento": row[6],
            "entregador_id": row[7],
            "entregador_nome": row[8],
            "data_despacho": row[9],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter entrega: {str(e)}")


@router.post("/entregas/editar")
def editar_entrega(
    pedido_id: int = Form(...),
    nome_paciente: str = Form(...),
    endereco_entrega: str = Form(...),
    entregador_id: int = Form(...),
    valor_pago: float = Form(None),
    forma_pagamento: str = Form(None)
):
    try:
        cursor.execute("SELECT 1 FROM farol_entregas WHERE pedido_id = %s", (pedido_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Entrega não encontrada para edição.")

        cursor.execute("""
            UPDATE farol_entregas
            SET nome_paciente = %s,
                endereco_entrega = %s,
                valor_pago = %s,
                forma_pagamento = %s,
                entregador_id = %s
            WHERE pedido_id = %s
        """, (
            nome_paciente.strip(), endereco_entrega.strip(),
            valor_pago, forma_pagamento, entregador_id,
            pedido_id
        ))

        return {"status": "ok", "mensagem": "Entrega atualizada com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao editar entrega: {str(e)}")


@router.delete("/entregas/{pedido_id}")
def excluir_entrega(pedido_id: int):
    try:
        cursor.execute("SELECT 1 FROM farol_entregas WHERE pedido_id = %s", (pedido_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Entrega não encontrada para exclusão.")

        cursor.execute("DELETE FROM farol_entregas WHERE pedido_id = %s", (pedido_id,))
        return {"status": "ok", "mensagem": "Entrega excluída com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir entrega: {str(e)}")


@router.get("/entregas/")
def listar_entregas(farmacia_id: UUID = None, pedido_id: int = None):
    try:
        query = """
            SELECT 
                e.id, e.pedido_id, e.farmacia_id, e.nome_paciente, 
                e.endereco_entrega, e.valor_pago, e.forma_pagamento, 
                e.entregador_id, u.nome AS entregador_nome, e.data_despacho
            FROM farol_entregas e
            LEFT JOIN farol_usuarios u ON e.entregador_id = u.id
        """
        filtros = []
        valores = []

        if farmacia_id:
            filtros.append("e.farmacia_id = %s")
            valores.append(str(farmacia_id))
        if pedido_id:
            filtros.append("e.pedido_id = %s")
            valores.append(pedido_id)

        if filtros:
            query += " WHERE " + " AND ".join(filtros)

        cursor.execute(query, tuple(valores))
        rows = cursor.fetchall()

        entregas = []
        for row in rows:
            entregas.append({
                "id": row[0],
                "pedido_id": row[1],
                "farmacia_id": row[2],
                "nome_paciente": row[3],
                "endereco_entrega": row[4],
                "valor_pago": row[5],
                "forma_pagamento": row[6],
                "entregador_id": row[7],
                "entregador_nome": row[8],
                "data_despacho": row[9],
            })

        return entregas

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar entregas: {str(e)}")
