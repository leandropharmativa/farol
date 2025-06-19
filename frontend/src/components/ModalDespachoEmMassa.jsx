//frontend/src/components/ModalDespachoEmMassa.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { SquareX, LoaderCircle, Truck, MapPinned, Square, SquareCheck } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'
import ModalConfirmacao from './ModalConfirmacao'

export default function ModalDespachoEmMassa({ aberto, onClose, farmaciaId, usuarioLogado }) {
  const [pedidos, setPedidos] = useState([])
  const [locais, setLocais] = useState([])
  const [selecionadosPorDestino, setSelecionadosPorDestino] = useState({})
  const [carregando, setCarregando] = useState(false)
  const [destinoParaConfirmar, setDestinoParaConfirmar] = useState(null)

  useEffect(() => {
    if (aberto) carregarDados()
  }, [aberto])

  const carregarDados = async () => {
    try {
      const [resPedidos, resLocais] = await Promise.all([
        api.get('/pedidos/listar', { params: { farmacia_id: farmaciaId } }),
        api.get(`/locais/${farmaciaId}`)
      ])
      const locaisValidos = resLocais.data.filter(l => l.destino && !l.residencia)
      setLocais(locaisValidos)

      const pedidosFiltrados = resPedidos.data.filter(p =>
        p.status_producao &&
        !p.status_despacho &&
        locaisValidos.some(l => l.nome === p.destino_nome)
      )

      setPedidos(pedidosFiltrados)
      const selecionados = {}
      pedidosFiltrados.forEach(p => {
        if (!selecionados[p.destino_nome]) selecionados[p.destino_nome] = []
        selecionados[p.destino_nome].push(p.id)
      })
      setSelecionadosPorDestino(selecionados)
    } catch {
      toast.error('Erro ao carregar dados')
    }
  }

  const toggleSelecionado = (destino, pedidoId) => {
    setSelecionadosPorDestino(prev => ({
      ...prev,
      [destino]: prev[destino]?.includes(pedidoId)
        ? prev[destino].filter(id => id !== pedidoId)
        : [...(prev[destino] || []), pedidoId]
    }))
  }

  const confirmarDespacho = async (destino, codigoConfirmacao) => {
    const ids = selecionadosPorDestino[destino] || []
    if (ids.length === 0) {
      toast.warning('Nenhum pedido selecionado')
      return
    }

    setCarregando(true)
    try {
      for (const id of ids) {
        const formData = new FormData()
        formData.append('etapa', 'Despacho')
        formData.append('usuario_logado_id', usuarioLogado?.id || '')
        formData.append('codigo_confirmacao', codigoConfirmacao)
        formData.append('observacao', 'Despacho em massa')
        await api.post(`/pedidos/${id}/registrar-etapa`, formData)
      }

      toast.success('Despacho realizado')
      setSelecionadosPorDestino(prev => ({ ...prev, [destino]: [] }))
      carregarDados()
      window.dispatchEvent(new Event('novoPedidoCriado'))
    } catch (err) {
      toast.error('Erro ao registrar despacho')
    } finally {
      setCarregando(false)
    }
  }

  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  const pedidosPorDestino = {}
  pedidos.forEach(p => {
    if (!pedidosPorDestino[p.destino_nome]) pedidosPorDestino[p.destino_nome] = []
    pedidosPorDestino[p.destino_nome].push(p)
  })

  const abrirModalConfirmacao = (destino, totalPedidos) => {
  setDestinoParaConfirmar({ nome: destino, total: totalPedidos })
  }

  return createPortal(
    <div className="modal-overlay right-align" onClick={onClose}>
      <div
        className="modal-despacho-massa animate-fadeIn max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap gap-x-2 gap-y-2 mt-2 justify-start">
          {Object.entries(pedidosPorDestino).map(([destino, lista]) => (
            <div
              key={destino}
              className="bg-farol-primary border-white/50 last:border-r-0 border-r rounded-none px-4 py-3 w-[150px] min-h-[220px] flex flex-col justify-between"
            >
              <div>
                <h3 className="text-white text-sm font-semibold flex items-center gap-1 mb-2">
                  <MapPinned size={16} />
                  {destino}
                </h3>
                <hr className="border-t border-white/30 mb-2 w-[80%]" />
                <ul className="space-y-1 text-white text-sm mb-3">
                  {lista.map(p => {
                    const selecionado = selecionadosPorDestino[destino]?.includes(p.id)
                    return (
                      <li
                        key={p.id}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => toggleSelecionado(destino, p.id)}
                      >
                        {selecionado ? (
                          <SquareCheck className="text-white" size={18} />
                        ) : (
                          <Square className="text-white" size={18} />
                        )}
                        <span>{p.registro}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div>
                <hr className="border-t border-white/30 mb-2 w-[24px]" />
                <button
                  className="btn-config2"
                  onClick={() => abrirModalConfirmacao(destino, lista.length)}
                  disabled={carregando}
                  title="Confirmar despacho"
                >
                  <Truck size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-2">
          <button className="btn-config2" onClick={onClose} title="Fechar">
            <SquareX size={24} />
          </button>
        </div>

        {destinoParaConfirmar && (
<ModalConfirmacao
  titulo="Despacho"
  destino={destinoParaConfirmar?.nome}
  totalPedidos={destinoParaConfirmar?.total}
  onConfirmar={(codigo, obs) => {
    confirmarDespacho(destinoParaConfirmar.nome, codigo, obs)
    setDestinoParaConfirmar(null)
  }}
  onCancelar={() => setDestinoParaConfirmar(null)}
/>

        )}
      </div>
    </div>,
    modalRoot
  )
}
