// frontend/src/components/ModalNovoPedido.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CircleX, Save } from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'

export default function ModalNovoPedido({ aberto, onClose, farmaciaId }) {
  const [registro, setRegistro] = useState('')
  const [numeroItens, setNumeroItens] = useState('')
  const [atendenteId, setAtendenteId] = useState('')
  const [origemId, setOrigemId] = useState('')
  const [destinoId, setDestinoId] = useState('')
  const [previsaoEntrega, setPrevisaoEntrega] = useState('')
  const [receita, setReceita] = useState(null)

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
    if (!registro || !numeroItens || !atendenteId || !origemId || !destinoId || !previsaoEntrega) {
      toast.warning('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const formData = new FormData()
      formData.append('farmacia_id', farmaciaId)
      formData.append('registro', registro)
      formData.append('numero_itens', numeroItens)
      formData.append('atendente_id', atendenteId)
      formData.append('origem_id', origemId)
      formData.append('destino_id', destinoId)
      formData.append('previsao_entrega', previsaoEntrega)
      if (receita) formData.append('receita', receita)

      const res = await api.post('/pedidos/criar', formData)
      if (res.data?.pedido_id) {
        localStorage.setItem('ultimoPedidoCriadoId', res.data.pedido_id)
        localStorage.setItem('ultimoPedidoCriadoRegistro', registro)
      }

      toast.success('Pedido criado com sucesso')
      setRegistro('')
      setNumeroItens('')
      setOrigemId('')
      setDestinoId('')
      setReceita(null)

      window.dispatchEvent(new Event("novoPedidoCriado"))
      onClose()
    } catch {
      toast.error('Erro ao salvar pedido')
    }
  }

  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-container max-w-md animate-fade-slide bg-farol-primary text-white">
        <div className="flex justify-end gap-2 mb-2">
          <button onClick={salvarPedido} title="Salvar Pedido" className="text-white hover:text-gray-200">
            <Save size={20} />
          </button>
          <button onClick={onClose} title="Fechar" className="text-white hover:text-gray-300">
            <CircleX size={20} />
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-4">Novo Pedido</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="input-config col-span-2"
            placeholder="Registro*"
            value={registro}
            onChange={e => setRegistro(e.target.value)}
          />
          <input
            className="input-config"
            type="number"
            placeholder="Nº de Itens*"
            value={numeroItens}
            onChange={e => setNumeroItens(e.target.value)}
          />

          <select className="input-config" value={atendenteId} onChange={e => setAtendenteId(e.target.value)}>
            <option value="">Selecione um atendente*</option>
            {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>

          <select className="input-config" value={origemId} onChange={e => setOrigemId(e.target.value)}>
            <option value="">Origem*</option>
            {locais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>

          <select className="input-config" value={destinoId} onChange={e => setDestinoId(e.target.value)}>
            <option value="">Destino*</option>
            {locais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
          </select>

          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-sm text-white">Previsão de Entrega*</label>
            <input
              className="input-config"
              type="datetime-local"
              value={previsaoEntrega}
              onChange={e => setPrevisaoEntrega(e.target.value)}
            />
          </div>

          <input
            className="input-config col-span-2"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={e => setReceita(e.target.files[0])}
          />
        </div>
      </div>
    </div>,
    modalRoot
  )
}
