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
        # Verifica se já existe entrega registrada para o pedido
        cursor.execute("SELECT 1 FROM farol_entregas WHERE pedido_id = %s", (pedido_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Entrega já registrada para este pedido.")

        # Inserção
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
