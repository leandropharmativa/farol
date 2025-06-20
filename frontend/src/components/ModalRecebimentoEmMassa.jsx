//frontend/src/components/ModalRecebimentoEmMassa.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { SquareX, LoaderCircle, Handshake, Square, SquareCheck } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'
import ModalConfirmacao from './ModalConfirmacao'

export default function ModalRecebimentoEmMassa({ aberto, onClose, farmaciaId, usuarioLogado }) {
  const [locais, setLocais] = useState([])
  const [destinoSelecionado, setDestinoSelecionado] = useState('')
  const [pedidos, setPedidos] = useState([])
  const [selecionados, setSelecionados] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [confirmar, setConfirmar] = useState(false)

  useEffect(() => {
    if (aberto) carregarLocais()
  }, [aberto])

  useEffect(() => {
    if (destinoSelecionado) carregarPedidos()
  }, [destinoSelecionado])

  const carregarLocais = async () => {
    try {
      const res = await api.get(`/locais/${farmaciaId}`)
      const destinosValidos = res.data.filter(l => l.destino && !l.residencia)
      setLocais(destinosValidos)
    } catch {
      toast.error('Erro ao carregar locais')
    }
  }

  const carregarPedidos = async () => {
    try {
      setCarregando(true)
      const res = await api.get('/pedidos/listar', { params: { farmacia_id: farmaciaId } })
      const filtrados = res.data.filter(p =>
        p.status_despacho &&
        !p.status_recebimento &&
        p.destino_nome === destinoSelecionado
      )
      setPedidos(filtrados)
      setSelecionados(filtrados.map(p => p.id))
    } catch {
      toast.error('Erro ao carregar pedidos')
    } finally {
      setCarregando(false)
    }
  }

  const toggleSelecionado = (pedidoId) => {
    setSelecionados(prev =>
      prev.includes(pedidoId) ? prev.filter(id => id !== pedidoId) : [...prev, pedidoId]
    )
  }

  const confirmarRecebimento = async (codigoConfirmacao) => {
    if (selecionados.length === 0) {
      toast.warning('Nenhum pedido selecionado')
      return
    }

    setCarregando(true)
    try {
      for (const id of selecionados) {
        const formData = new FormData()
        formData.append('etapa', 'Recebimento')
        formData.append('usuario_logado_id', usuarioLogado?.id || '')
        formData.append('codigo_confirmacao', codigoConfirmacao)
        formData.append('observacao', 'Recebimento em massa')
        await api.post(`/pedidos/${id}/registrar-etapa`, formData)
      }

      toast.success('Recebimento registrado')
      setSelecionados([])
      setConfirmar(false)
      onClose()
      carregarPedidos()
      window.dispatchEvent(new Event('novoPedidoCriado'))
    } catch {
      toast.error('Erro ao registrar recebimento')
    } finally {
      setCarregando(false)
    }
  }

  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

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
          <option value="" disabled>Selecione a Unidade</option>
          {locais.map(l => (
            <option key={l.id} value={l.nome}>{l.nome}</option>
          ))}
        </select>

        {carregando ? (
          <div className="text-white flex gap-2 items-center">
            <LoaderCircle className="animate-spin" /> Carregando...
          </div>
        ) : destinoSelecionado && pedidos.length === 0 ? (
          <div className="text-white text-xs text-left leading-snug">
             Não há pedidos<br />
             para receber.
          </div>


        ) : (
          <div className="flex flex-col gap-2">
            {pedidos.map(p => {
              const selecionado = selecionados.includes(p.id)
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 text-white text-sm cursor-pointer"
                  onClick={() => toggleSelecionado(p.id)}
                >
                  {selecionado ? <SquareCheck size={18} /> : <Square size={18} />}
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
            {pedidos.length > 0 && (
              <button
                className="btn-config2"
                onClick={() => setConfirmar(true)}
                disabled={carregando}
                title="Confirmar recebimento"
              >
                <Handshake size={20} />
              </button>
            )}
          </div>
        )}

        {confirmar && (
          <ModalConfirmacao
            titulo="Recebimento"
            destino={destinoSelecionado}
            totalPedidos={selecionados.length}
            onConfirmar={(codigo, obs) => confirmarRecebimento(codigo, obs)}
            onCancelar={() => setConfirmar(false)}
          />
        )}
      </div>
    </div>,
    modalRoot
  )
}
