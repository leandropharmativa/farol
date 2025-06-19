//frontend/src/components/ModalDespachoEmMassa.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { SquareX, LoaderCircle, Truck, MapPinned } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'

export default function ModalDespachoEmMassa({ aberto, onClose, farmaciaId, usuarioLogado }) {
  const [pedidos, setPedidos] = useState([])
  const [locais, setLocais] = useState([])
  const [selecionadosPorDestino, setSelecionadosPorDestino] = useState({})
  const [carregando, setCarregando] = useState(false)

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
        locaisValidos.some(l => l.nome === p.destino_nome)
      )

      setPedidos(pedidosFiltrados)
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

  const confirmarDespacho = async (destino) => {
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
        formData.append('codigo_confirmacao', usuarioLogado?.codigo || '')
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

  return createPortal(
    <div className="modal-overlay right-align" onClick={onClose}>
      <div
        className="modal-novo-pedido animate-fadeIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="top-icons flex justify-end gap-2">
          <button className="btn-config2" onClick={onClose} title="Fechar">
            <SquareX size={24} />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mt-2">
          {Object.entries(pedidosPorDestino).map(([destino, lista]) => (
            <div key={destino} className="bg-farol-primary rounded-lg p-4 w-full max-w-xs flex-1 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-semibold flex items-center gap-1">
                  <MapPinned size={16} />
                  {destino}
                </h3>
                <button
                  className="btn-config2"
                  onClick={() => confirmarDespacho(destino)}
                  disabled={carregando}
                  title="Confirmar despacho"
                >
                  {carregando
                    ? <LoaderCircle size={20} className="animate-spin" />
                    : <Truck size={20} />}
                </button>
              </div>

              <ul className="space-y-1 text-white text-sm">
                {lista.map(p => (
                  <li key={p.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selecionadosPorDestino[destino]?.includes(p.id) || false}
                      onChange={() => toggleSelecionado(destino, p.id)}
                    />
                    <span>{p.registro}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>,
    modalRoot
  )
}
