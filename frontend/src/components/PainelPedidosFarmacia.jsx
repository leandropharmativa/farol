// frontend/src/components/PainelPedidosFarmacia.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
  User, CalendarClock, MapPinHouse, MapPinned, PillBottle, Pencil, Calendar, AlarmClock,
  PackagePlus, Printer, FileCheck2, CircleCheckBig, Truck, PackageCheck, CreditCard,
  FileText, CalendarPlus, CalendarCheck2, Boxes, Beaker, Pill, StickyNote
} from 'lucide-react'
import ModalConfirmacao from './ModalConfirmacao'

export default function PainelPedidosFarmacia({ farmaciaId, usuarioLogado }) {
  const [pedidos, setPedidos] = useState([])
  const [novosPedidos, setNovosPedidos] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [etapaSelecionada, setEtapaSelecionada] = useState('')
  const [abrirModal, setAbrirModal] = useState(false)
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [filtroPorPrevisao, setFiltroPorPrevisao] = useState(false)

  const carregarPedidos = async () => {
    try {
      const res = await api.get('/pedidos/listar', {
        params: { farmacia_id: farmaciaId }
      })

      const dataFiltro = new Date(dataSelecionada).toLocaleDateString('pt-BR')

      const pedidosFiltrados = res.data.filter(p => {
        const campoOriginal = filtroPorPrevisao ? p.previsao_entrega : p.data_criacao
        if (!campoOriginal) return false
        const campoData = new Date(campoOriginal).toLocaleDateString('pt-BR')
        return campoData === dataFiltro
      })

      setPedidos(pedidosFiltrados)
    } catch (err) {
      toast.error('Erro ao carregar pedidos')
    }
  }

  const etapas = [
    { campo: 'status_inclusao', nome: 'Inclusão', icone: PackagePlus },
    { campo: 'status_impressao', nome: 'Impressão', icone: Printer },
    { campo: 'status_conferencia', nome: 'Conferência', icone: FileCheck2 },
    { campo: 'status_producao', nome: 'Produção', icone: CircleCheckBig },
    { campo: 'status_despacho', nome: 'Despacho', icone: Truck },
    { campo: 'status_entrega', nome: 'Entrega', icone: PackageCheck },
    { campo: 'status_pagamento', nome: 'Pagamento', icone: CreditCard }
  ]

  const solicitarConfirmacao = (pedidoId, etapa) => {
    setPedidoSelecionado(pedidoId)
    setEtapaSelecionada(etapa)
    setAbrirModal(true)
  }

  const confirmarEtapa = async (codigoConfirmacao, observacao = '') => {
    try {
      const res = await api.post(`/pedidos/${pedidoSelecionado}/registrar-etapa`, {
        etapa: etapaSelecionada,
        usuario_logado_id: usuarioLogado.id,
        codigo_confirmacao: codigoConfirmacao,
        observacao
      })
      toast.success(res.data.mensagem)
      setAbrirModal(false)
      carregarPedidos()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao registrar etapa')
    }
  }

  useEffect(() => {
    if (!farmaciaId) return

    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/pedidos/stream`)

    eventSource.onmessage = async (event) => {
      if (event.data.startsWith('novo_pedido')) {
        const partes = event.data.split(':')
        const pedidoId = partes[1]

        if (!pedidoId) return

        try {
          const res = await api.get(`/pedidos/${pedidoId}`)
          const pedido = res.data

          const campoOriginal = filtroPorPrevisao ? pedido.previsao_entrega : pedido.data_criacao
          if (!campoOriginal) return

          const campoData = new Date(campoOriginal).toISOString().split('T')[0]
          const dataAtual = dataSelecionada.toISOString().split('T')[0]

          if (campoData === dataAtual) {
            setNovosPedidos(prev => [pedido, ...prev])
          }
        } catch (err) {
          console.warn('Erro ao buscar novo pedido:', err)
        }
      }
    }

    eventSource.onerror = () => {
      console.warn('SSE desconectado')
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [farmaciaId, dataSelecionada, filtroPorPrevisao])

  useEffect(() => {
    if (farmaciaId) carregarPedidos()
  }, [farmaciaId, dataSelecionada, filtroPorPrevisao])

  const formatarData = (data) =>
    data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).toUpperCase().replace(/ DE /g, ' ')

  const alterarData = (tipo, incremento) => {
    const novaData = new Date(dataSelecionada)
    if (tipo === 'dia') novaData.setDate(novaData.getDate() + incremento)
    if (tipo === 'mes') novaData.setMonth(novaData.getMonth() + incremento)
    if (tipo === 'ano') novaData.setFullYear(novaData.getFullYear() + incremento)
    setDataSelecionada(novaData)
  }

  const dataSplit = formatarData(dataSelecionada).split(' ')
  const [dia, mes, ano] = dataSplit

  const corLocalClasse = (nome) => {
    if (!nome) return 'bg-gray-300 text-gray-800'
    const hash = Array.from(nome).reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const indice = (hash % 6) + 1
    return `bg-farol-loc${indice} text-white`
  }

  const renderPedido = (p, destaque = false) => (
    <div key={p.id} className={`pedido-card ${destaque ? 'border-l-4 border-yellow-500 bg-yellow-50' : ''}`}>
      <div className="pedido-linha">
        <div className="pedido-conteudo">
          <div className="pedido-info"><PillBottle size={16} /><span>{p.registro} - {p.numero_itens}</span></div>
          <div className="pedido-info"><User size={16} /><span>{p.atendente}</span></div>

          <div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.origem_nome || p.origem?.nome)}`}>
            <MapPinHouse size={14} className="mr-1" />
            <span>{p.origem_nome || p.origem?.nome || 'Origem'}</span>
          </div>

          <div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.destino_nome || p.destino?.nome)}`}>
            <MapPinned size={14} className="mr-1" />
            <span>{p.destino_nome || p.destino?.nome || 'Destino'}</span>
          </div>

          <div className="pedido-info"><Calendar size={16} /><span>{new Date(p.previsao_entrega).getDate()}</span></div>
          <div className="pedido-info"><AlarmClock size={16} /><span>{new Date(p.previsao_entrega).getHours()}h</span></div>
          {p.receita_arquivo && (
            <div className="pedido-info text-blue-600">
              <FileText size={16} />
              <a
                href={`https://farol-mjtt.onrender.com/receitas/${p.receita_arquivo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Receita
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {etapas.map(et => {
            const Icone = et.icone
            const ativo = p[et.campo]
            return (
              <button
                key={et.campo}
                onClick={() => !ativo && solicitarConfirmacao(p.id, et.nome)}
                className={`rounded-full p-1 ${ativo ? 'text-green-600' : 'text-gray-400 hover:text-red-500'}`}
                title={et.nome}
              >
                <Icone size={18} />
              </button>
            )
          })}
          {usuarioLogado.email === 'admin@admin.com' && (
            <button
              title="Editar pedido"
              className="text-gray-400 hover:text-blue-500 p-1"
              onClick={() => toast.info('Editar pedido (em desenvolvimento)')}
            >
              <Pencil size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const novoValor = !filtroPorPrevisao
              setFiltroPorPrevisao(novoValor)
              if (!novoValor) {
                setDataSelecionada(new Date())
              }
            }}
            className="text-farol-primary hover:text-farol-secondary transition flex items-center"
            title={filtroPorPrevisao ? 'Filtrando por previsão' : 'Filtrando por criação'}
          >
            {filtroPorPrevisao ? <CalendarCheck2 size={20} /> : <CalendarPlus size={20} />}
          </button>

          <div className="flex items-baseline gap-1 text-xl font-bold">
            <span onClick={() => alterarData('dia', +1)} onContextMenu={e => { e.preventDefault(); alterarData('dia', -1) }} className="cursor-pointer select-none">{dia}</span>
            <span onClick={() => alterarData('mes', +1)} onContextMenu={e => { e.preventDefault(); alterarData('mes', -1) }} className="cursor-pointer select-none">{mes}</span>
            <span onClick={() => alterarData('ano', +1)} onContextMenu={e => { e.preventDefault(); alterarData('ano', -1) }} className="cursor-pointer select-none">{ano}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-farol-primary"><Boxes size={14} /><span>{pedidos.length}</span></div>
          <div className="flex items-center gap-1 text-farol-semisolidos"><Beaker size={14} /><span>0</span></div>
          <div className="flex items-center gap-1 text-farol-solidos"><Pill size={14} /><span>0</span></div>
          <div className="flex items-center gap-1 text-farol-saches"><StickyNote size={14} /><span>0</span></div>
        </div>
      </div>

      <div className="space-y-0">
        {novosPedidos.length > 0 && (
          <>
            <div className="text-sm font-semibold text-farol-primary mb-1">NOVOS PEDIDOS</div>
            {novosPedidos.map(p => renderPedido(p, true))}
            <hr className="my-2 border-dashed border-gray-400" />
          </>
        )}
        {pedidos.map(p => renderPedido(p))}
      </div>

      {abrirModal && (
        <ModalConfirmacao
          titulo={`Confirmar etapa "${etapaSelecionada}"`}
          onConfirmar={confirmarEtapa}
          onCancelar={() => setAbrirModal(false)}
        />
      )}
    </div>
  )
}
