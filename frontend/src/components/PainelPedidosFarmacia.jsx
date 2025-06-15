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

const carregarPedidosComData = async (dataRef) => {
  try {
    const res = await api.get('/pedidos/listar', {
      params: { farmacia_id: farmaciaId }
    })

    const dataFiltro = dataRef.toISOString().split('T')[0]

    const pedidosFiltrados = res.data.filter(p => {
      const campoOriginal = filtroPorPrevisao ? p.previsao_entrega : p.data_criacao
      if (!campoOriginal) return false
      const campoData = new Date(campoOriginal).toISOString().split('T')[0]
      return campoData === dataFiltro
    })

    setPedidos(pedidosFiltrados)
  } catch (err) {
    toast.error('Erro ao carregar pedidos')
  }
}

useEffect(() => {
  if (!farmaciaId) return

  const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/pedidos/stream`)

eventSource.onmessage = (event) => {
  console.log('🔁 Evento SSE recebido:', event.data)

  if (event.data.startsWith('novo_pedido')) {
    const partes = event.data.split(':')
    const dataStr = partes[2] || new Date().toISOString().split('T')[0]
    const [ano, mes, dia] = dataStr.split('-')
    const novaData = new Date(`${ano}-${mes}-${dia}T00:00:00`)

    const dataAtualFormatada = dataSelecionada.toISOString().split('T')[0]
    const novaDataFormatada = novaData.toISOString().split('T')[0]

    // Se é do mesmo dia, atualiza lista como antes
if (dataAtualFormatada === novaDataFormatada) {
  setTimeout(() => {
    console.log('⏳ Recarregando pedidos após evento SSE...')
    carregarPedidos()
  }, 500)
} else {
      // ✅ Caso não seja o mesmo dia filtrado, busca o pedido e exibe separado
      api.get('/pedidos/listar', { params: { farmacia_id: farmaciaId } })
        .then(res => {
          const pedidoNovo = res.data.find(p => {
            const dataCriacao = new Date(p.data_criacao).toISOString().split('T')[0]
            return dataCriacao === novaDataFormatada
          })
          if (pedidoNovo) {
            toast.info('Novo pedido registrado em outra data.')
            setPedidos(p => [
              { ...pedidoNovo, destaque: true },
              ...p
            ])
          }
        })
        .catch(() => toast.error('Erro ao buscar novo pedido'))
    }
  }
}

  eventSource.onerror = () => {
    eventSource.close()
  }

  return () => {
    eventSource.close()
  }
}, [farmaciaId]) 

useEffect(() => {
  if (farmaciaId) carregarPedidos()
}, [farmaciaId, dataSelecionada, filtroPorPrevisao]) // 🔁 carrega nos filtros

  useEffect(() => {
  const atualizarLocal = () => carregarPedidos()
  window.addEventListener("novoPedidoCriado", atualizarLocal)
  return () => window.removeEventListener("novoPedidoCriado", atualizarLocal)
  }, [])

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

return (
  <div>
    
<div className="flex items-center justify-between mb-4">
  {/* Seletor de data com ícone */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => {
        const novoValor = !filtroPorPrevisao
        setFiltroPorPrevisao(novoValor)
        if (!novoValor) {
        setDataSelecionada(new Date()) // volta para hoje se for data de criação
        }
      }}
      className="text-farol-primary hover:text-farol-secondary transition flex items-center"
      title={
        filtroPorPrevisao
          ? 'Filtrando por data de previsão de entrega'
          : 'Filtrando por data de criação'
      }
    >
      {filtroPorPrevisao ? (
        <CalendarCheck2 size={20} className="inline-block align-middle" />
      ) : (
        <CalendarPlus size={20} className="inline-block align-middle" />
      )}
    </button>

    <div className="flex items-baseline gap-1 text-xl font-bold">
      <span
        className="cursor-pointer select-none"
        onClick={() => alterarData('dia', +1)}
        onContextMenu={(e) => { e.preventDefault(); alterarData('dia', -1) }}
      >
        {dia}
      </span>
      <span
        className="cursor-pointer select-none"
        onClick={() => alterarData('mes', +1)}
        onContextMenu={(e) => { e.preventDefault(); alterarData('mes', -1) }}
      >
        {mes}
      </span>
      <span
        className="cursor-pointer select-none"
        onClick={() => alterarData('ano', +1)}
        onContextMenu={(e) => { e.preventDefault(); alterarData('ano', -1) }}
      >
        {ano}
      </span>
    </div>
  </div>

  {/* Totais de pedidos */}
  
<div className="flex items-center gap-2 text-xs">
  <div className="flex items-center gap-1 text-farol-primary">
    <Boxes size={14} />
    <span>{pedidos.length}</span>
  </div>
  <div className="flex items-center gap-1 text-farol-semisolidos">
    <Beaker size={14} />
    <span>0</span>
  </div>
  <div className="flex items-center gap-1 text-farol-solidos">
    <Pill size={14} />
    <span>0</span>
  </div>
  <div className="flex items-center gap-1 text-farol-saches">
    <StickyNote size={14} />
    <span>0</span>
  </div>
</div>


</div>
    
      <div className="space-y-0">
        {pedidos.map((p, index) => (
          <div
            key={p.id}
            className={`pedido-card ${
            p.destaque ? 'border-2 border-farol-primary bg-yellow-50' :
            index % 2 === 0 ? 'pedido-card-branco' : 'pedido-card-cinza'
          }`}
          >

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
        ))}
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
