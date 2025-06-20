// frontend/src/components/ModalDespachoEmMassa.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { SquareX, LoaderCircle, Truck, Square, SquareCheck } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'
import ModalConfirmacao from './ModalConfirmacao'

export default function ModalDespachoEmMassa({ aberto, onClose, farmaciaId, usuarioLogado }) {
  const [pedidos, setPedidos] = useState([])
  const [locais, setLocais] = useState([])
  const [selecionados, setSelecionados] = useState([])
  const [destinoSelecionado, setDestinoSelecionado] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  useEffect(() => {
    if (aberto) carregarDados()
  }, [aberto])

  useEffect(() => {
    if (destinoSelecionado) filtrarPedidos()
  }, [destinoSelecionado, pedidos])

  const carregarDados = async () => {
    try {
      setCarregando(true)
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
    } catch {
      toast.error('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }

  const filtrarPedidos = () => {
    const filtrados = pedidos.filter(p => p.destino_nome === destinoSelecionado)
    setSelecionados(filtrados.map(p => p.id))
  }

  const toggleSelecionado = (pedidoId) => {
    setSelecionados(prev =>
      prev.includes(pedidoId) ? prev.filter(id => id !== pedidoId) : [...prev, pedidoId]
    )
  }

  const confirmarDespacho = async (codigoConfirmacao) => {
    if (selecionados.length === 0) {
      toast.warning('Nenhum pedido selecionado')
      return
    }

    setCarregando(true)
    try {
      for (const id of selecionados) {
        const formData = new FormData()
        formData.append('etapa', 'Despacho')
        formData.append('usuario_logado_id', usuarioLogado?.id || '')
        formData.append('codigo_confirmacao', codigoConfirmacao)
        formData.append('observacao', 'Despacho em massa')
        await api.post(`/pedidos/${id}/registrar-etapa`, formData)
      }

      toast.success('Despacho realizado')
      setSelecionados([])
      setConfirmar(false)
      onClose()
      carregarDados()
      window.dispatchEvent(new Event('novoPedidoCriado'))
    } catch {
      toast.error('Erro ao registrar despacho')
    } finally {
      setCarregando(false)
    }
  }

  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  const pedidosFiltrados = pedidos.filter(p => p.destino_nome === destinoSelecionado)

  return createPortal(
    <div className="modal-overlay right-align" onClick={onClose}>
      <div
        className="modal-despacho-massa animate-fadeIn max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <select
          className="mb-4 w-full text-sm bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-farol-primary"
          value={destinoSelecionado}
          onChange={(e) => setDestinoSelecionado(e.target.value)}
        >
          <option value="" disabled>Selecione o Destino</option>
          {locais.map(l => (
            <option key={l.id} value={l.nome}>{l.nome}</option>
          ))}
        </select>

        {carregando ? (
          <div className="text-white flex gap-2 items-center">
            <LoaderCircle className="animate-spin" /> Carregando...
          </div>
        ) : destinoSelecionado && pedidosFiltrados.length === 0 ? (
          <div className="text-white text-[10px] text-left leading-snug mt-2">
            Não há pedidos<br />
            para despachar.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pedidosFiltrados.map(p => {
              const selecionado = selecionados.includes(p.id)
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 text-white text-sm cursor-pointer"
                  onClick={() => toggleSelecionado(p.id)}
                >
                  {selecionado ? (
                    <SquareCheck className="text-white" size={18} />
                  ) : (
                    <Square className="text-white" size={18} />
                  )}
                  <span>{p.registro}</span>
                </div>
              )
            })}
          </div>
        )}

        {destinoSelecionado && (
          <div className="flex justify-end items-center gap-2 mt-4">
            <button className="btn-config2" onClick={onClose} title="Fechar">
              <SquareX size={24} />
            </button>
            {pedidosFiltrados.length > 0 && (
              <button
                className="btn-config2"
                onClick={() => setConfirmar(true)}
                disabled={carregando}
                title="Confirmar despacho"
              >
                <Truck size={20} />
              </button>
            )}
          </div>
        )}

        {confirmar && (
          <ModalConfirmacao
            titulo="Despacho"
            destino={destinoSelecionado}
            totalPedidos={selecionados.length}
            onConfirmar={(codigo, obs) => confirmarDespacho(codigo, obs)}
            onCancelar={() => setConfirmar(false)}
          />
        )}
      </div>
    </div>,
    modalRoot
  )
}
