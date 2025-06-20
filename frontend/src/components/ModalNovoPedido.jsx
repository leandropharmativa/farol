// frontend/src/components/ModalNovoPedido.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { SquareX, Save, LoaderCircle } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'

export default function ModalNovoPedido({ aberto, onClose, farmaciaId }) {
  const [registro, setRegistro] = useState('')
  const [observacao, setObservacao] = useState('')
  const [atendenteId, setAtendenteId] = useState('')
  const [origemId, setOrigemId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [previsaoEntrega, setPrevisaoEntrega] = useState('')
  const [receita, setReceita] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const [usuarios, setUsuarios] = useState([])
  const [locais, setLocais] = useState([])

  useEffect(() => {
    if (aberto) {
      carregarUsuarios()
      carregarLocais()
      setAtendenteId(localStorage.getItem('usuarioId') || '')
      setPrevisaoEntrega(gerarDataEntrega())
    }
  }, [aberto])

  const carregarUsuarios = async () => {
    try {
      const res = await api.get(`/usuarios/${farmaciaId}`)
      setUsuarios(res.data)
    } catch {
      toast.error('Erro ao carregar usuários')
    }
  }

  const carregarLocais = async () => {
    try {
      const res = await api.get(`/locais/${farmaciaId}`)
      setLocais(res.data)
    } catch {
      toast.error('Erro ao carregar locais')
    }
  }

  const gerarDataEntrega = () => {
    const agora = new Date()
    const amanha = new Date(agora)
    amanha.setDate(amanha.getDate() + 1)
    amanha.setHours(12, 0, 0, 0)
    return amanha.toISOString().slice(0, 16)
  }

const salvarPedido = async () => {
  if (!registro || !atendenteId || !origemId || !destinoId || !previsaoEntrega) {
    toast.warning('Preencha todos os campos obrigatórios')
    return
  }

  setCarregando(true)

  try {
    const formData = new FormData()
    formData.append('farmacia_id', farmaciaId)
    formData.append('registro', registro)
    formData.append('atendente_id', atendenteId)
    formData.append('origem_id', origemId)
    formData.append('destino_id', destinoId)
    formData.append('previsao_entrega', previsaoEntrega)
    formData.append('observacao', observacao)
    if (receita) formData.append('receita', receita)

    const res = await api.post('/pedidos/criar', formData)
    if (res.data?.pedido_id) {
      localStorage.setItem('ultimoPedidoCriadoId', res.data.pedido_id)
      localStorage.setItem('ultimoPedidoCriadoRegistro', registro)
    }

    toast.success('Pedido criado com sucesso')

    setRegistro('')
    setObservacao('')
    setOrigemId('')
    setDestinoId('')
    setReceita(null)

    window.dispatchEvent(new Event("novoPedidoCriado"))
    onClose()
  } catch {
    toast.error('Erro ao salvar pedido')
  } finally {
    setCarregando(false)
  }
}
  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return createPortal(
  <div className="modal-overlay right-align z-50" onClick={onClose}>
    <div
      className="modal-novo-pedido animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
        <div className="flex flex-col gap-2">
          <input
            className="modal-novo-pedido-input"
            placeholder="Registro*"
            value={registro}
            onChange={e => setRegistro(e.target.value)}
          />
          <select
            className="modal-novo-pedido-input"
            value={atendenteId}
            onChange={e => setAtendenteId(e.target.value)}
          >
            <option value="">Selecione um atendente*</option>
            {usuarios.map(u => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
          <select
            className="modal-novo-pedido-input"
            value={origemId}
            onChange={e => setOrigemId(e.target.value)}
          >
            <option value="">Origem*</option>
            {locais
              .filter(l => l.origem)
              .map(l => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
          </select>
          <select
            className="modal-novo-pedido-input"
            value={destinoId}
            onChange={e => setDestinoId(e.target.value)}
          >
            <option value="">Destino*</option>
            {locais
              .filter(l => l.destino)
              .map(l => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
          </select>

          <label className="text-white text-sm">Previsão de Entrega*</label>
          <input
            className="modal-novo-pedido-input"
            type="datetime-local"
            value={previsaoEntrega}
            onChange={e => setPrevisaoEntrega(e.target.value)}
          />

          <textarea
            className="modal-novo-pedido-input"
            placeholder="Observação (opcional)"
            rows={2}
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
          />

          <input
            className="modal-novo-pedido-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={e => setReceita(e.target.files[0])}
          />
        </div>

<div className="top-icons">
  <button
    className="btn-config2"
    onClick={onClose}
    title="Fechar"
    disabled={carregando}
  >
    <SquareX size={24} />
  </button>

  <button
    className="btn-config2"
    onClick={salvarPedido}
    title="Salvar Pedido"
    disabled={carregando}
  >
    {carregando ? <LoaderCircle className="animate-spin" size={24} /> : <Save size={24} />}
  </button>
</div>

      </div>
    </div>,
    modalRoot
  )
}
