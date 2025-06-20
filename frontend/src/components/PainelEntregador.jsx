//frontend/src/components/PainelEntregador.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
  Bike, Calendar, AlarmClock, CreditCard, User, MapPinned, CheckCircle
} from 'lucide-react'
import ModalConfirmacao from './ModalConfirmacao'

export default function PainelEntregador({ usuarioLogado }) {
  const [entregas, setEntregas] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [abrirModal, setAbrirModal] = useState(false)
  const [coordenadasModal, setCoordenadasModal] = useState(null)

  const carregarEntregas = async () => {
    try {
      const res = await api.get('/entregas/', {
        params: { entregador_id: usuarioLogado?.id }
      })
      setEntregas(res.data)
    } catch (err) {
      toast.error('Erro ao carregar entregas')
    }
  }

  const solicitarConfirmacaoEntrega = (entrega, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setCoordenadasModal({
      top: rect.top + window.scrollY + 30,
      left: rect.left + window.scrollX
    })
    setPedidoSelecionado({
      id: entrega[1], // pedido_id
      farmacia_id: entrega[2]
    })
    setAbrirModal(true)
  }

const confirmarEntrega = async (pedidoId, codigoConfirmacao, observacao = '') => {
  try {
    const formData = new FormData()
    formData.append('etapa', 'Entrega')
    formData.append('usuario_logado_id', usuarioLogado?.id || 0)
    formData.append('codigo_confirmacao', codigoConfirmacao)
    formData.append('observacao', observacao)

    await api.post(`/pedidos/${pedidoId}/registrar-etapa`, formData)

    toast.success('Entrega confirmada com sucesso')
    // Aqui você pode atualizar a lista de entregas
    carregarEntregas()
  } catch (err) {
    console.error(err)
    toast.error('Erro ao confirmar entrega')
  }
}

  useEffect(() => {
    carregarEntregas()
  }, [])

  return (
    <div>
      <div className="space-y-2">
        {entregas.map((e, idx) => (
          <div key={idx} className="border border-gray-300 p-3 rounded-lg shadow-sm bg-white">
            <div className="flex items-center gap-2 text-farol-primary font-bold text-sm mb-1">
              <Bike size={16} /> Entrega do pedido #{e[1]}
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex items-center gap-2"><User size={14} /> {e[3]}</div>
              <div className="flex items-center gap-2"><MapPinned size={14} /> {e[4]}</div>

              {e[5] ? (
                <div className="flex items-center gap-2"><CreditCard size={14} /> <span className="text-green-700">PAGO</span></div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard size={14} />
                  R$ {Number(e[5] || 0).toFixed(2)} {e[6] ? `via ${e[6]}` : ''}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar size={14} />
                Despachado em {new Date(e[9]).toLocaleDateString('pt-BR')} às {new Date(e[9]).toLocaleTimeString('pt-BR').slice(0, 5)}
              </div>

              <div className="flex items-center gap-2">
                <AlarmClock size={14} />
                Previsão: {new Date(e[11]).toLocaleDateString('pt-BR')} às {new Date(e[11]).toLocaleTimeString('pt-BR').slice(0, 5)}
              </div>

              {e[19] && (
                <div className="text-xs text-gray-500 italic">
                  Observação: {e[19]}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Despachado por <strong>{e[16]}</strong> e confirmado por <strong>{e[17]}</strong>
              </div>
            </div>

            <div className="mt-3">
              <button
                className="bg-farol-primary hover:bg-farol-primaryfocus text-white px-4 py-1.5 text-sm rounded-full flex items-center gap-2"
                onClick={(e) => solicitarConfirmacaoEntrega(e, e)}
              >
                <CheckCircle size={16} /> Confirmar entrega
              </button>
            </div>
          </div>
        ))}

        {entregas.length === 0 && (
          <div className="text-sm text-gray-500">Nenhuma entrega pendente encontrada.</div>
        )}
      </div>

      {abrirModal && (
        <ModalConfirmacao
          titulo="Entrega"
          farmaciaId={pedidoSelecionado[2]} // farmacia_uuid
          destinoEhResidencia={false}
          onConfirmar={confirmarEntrega}
          onCancelar={() => setAbrirModal(false)}
          coordenadas={coordenadasModal}
        />
      )}
    </div>
  )
}
