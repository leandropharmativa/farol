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
def obter_entrega(pedido_id: int):
    try:
        print(f"[DEBUG] Buscando entrega para pedido {pedido_id}")
        
        # Query única que verifica se o pedido existe e busca a entrega
        cursor.execute("""
            SELECT
                e.id,
                e.pedido_id,
                e.farmacia_id,
                e.nome_paciente,
                e.endereco_entrega,
                e.valor_pago,
                e.forma_pagamento,
                e.entregador_id,
                u.nome AS nome_entregador,
                e.data_despacho
            FROM farol_entregas e
            LEFT JOIN farol_farmacia_usuarios u ON e.entregador_id = u.id
            INNER JOIN farol_farmacia_pedidos p ON e.pedido_id = p.id
            WHERE e.pedido_id = %s
        """, (pedido_id,))
        
        # Verifica se há resultados antes de tentar buscar
        if cursor.description is None:
            print(f"[DEBUG] Nenhum resultado de entrega para pedido {pedido_id}")
            raise HTTPException(status_code=404, detail="Entrega não encontrada.")
        
        try:
            entrega = cursor.fetchone()
            print(f"[DEBUG] Entrega encontrada para pedido {pedido_id}: {entrega is not None}")
        except Exception as fetch_error:
            print(f"[DEBUG] Erro ao buscar entrega para pedido {pedido_id}: {fetch_error}")
            raise HTTPException(status_code=404, detail="Entrega não encontrada.")
        
        if not entrega:
            raise HTTPException(status_code=404, detail="Entrega não encontrada.")
        
        # Retorna os dados como lista para manter compatibilidade com o frontend
        return list(entrega)
    except HTTPException:
        # Re-raise HTTP exceptions (como 404)
        raise
    except Exception as e:
        print(f"[ERRO] Falha ao buscar entrega do pedido {pedido_id}: {str(e)}")
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
def listar_entregas(farmacia_id: UUID = None, pedido_id: int = None, entregador_id: int = None):
    try:
        query = """
            SELECT
                e.id,
                e.pedido_id,
                e.farmacia_id,
                e.nome_paciente,
                e.endereco_entrega,
                e.valor_pago,
                e.forma_pagamento,
                e.entregador_id,
                fu.nome AS nome_entregador,
                e.data_despacho,
                p.registro,
                p.previsao_entrega,
                p.status_entrega,
                l.data_hora,
                l.usuario_logado_id,
                l.usuario_confirmador_id,
                ul.nome AS nome_logado,
                uc.nome AS nome_confirmador,
                l.observacao,
                l.etapa,
                l.itens_solidos,
                l.itens_semisolidos,
                l.itens_saches
            FROM farol_entregas e
            JOIN farol_farmacia_pedidos p ON e.pedido_id = p.id
            LEFT JOIN farol_farmacia_usuarios fu ON e.entregador_id = fu.id
            LEFT JOIN farol_farmacia_pedido_logs l ON l.pedido_id = e.pedido_id AND l.etapa = 'Despacho'
            LEFT JOIN farol_farmacia_usuarios ul ON l.usuario_logado_id = ul.id
            LEFT JOIN farol_farmacia_usuarios uc ON l.usuario_confirmador_id = uc.id
            WHERE p.status_despacho = TRUE AND p.status_entrega = FALSE
        """
        filtros = []
        valores = []
        
        if farmacia_id:
            filtros.append("e.farmacia_id = %s")
            valores.append(str(farmacia_id))
        if pedido_id:
            filtros.append("e.pedido_id = %s")
            valores.append(pedido_id)
        if entregador_id:
            filtros.append("e.entregador_id = %s")
            valores.append(entregador_id)
        
        if filtros:
            query += " AND " + " AND ".join(filtros)
        
        query += " ORDER BY e.data_despacho DESC"

        cursor.execute(query, tuple(valores))
        entregas = cursor.fetchall()
        return entregas

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar entregas: {str(e)}")
