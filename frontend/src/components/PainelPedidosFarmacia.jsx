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

      const dataFiltro = dataSelecionada.toISOString().slice(0, 10)

      const pedidosFiltrados = res.data.filter(p => {
        const campo = filtroPorPrevisao ? p.previsao_entrega : p.data_criacao
        return campo?.slice(0, 10) === dataFiltro
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

return (
  <div>
    
<div className="flex items-center justify-between mb-4">
  {/* Seletor de data com ícone */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => setFiltroPorPrevisao(!filtroPorPrevisao)}
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
  <div className="flex items-center gap-4 text-sm text-gray-600">
    <div className="flex items-center gap-1">
      <Boxes size={16} className="text-farol-primary" />
      <span>{pedidos.length}</span>
    </div>
    <div className="flex items-center gap-1">
      <Beaker size={16} className="text-farol-secondary" />
      <span>Semi-sólidos</span>
    </div>
    <div className="flex items-center gap-1">
      <Pill size={16} className="text-farol-secondary" />
      <span>Sólidos</span>
    </div>
    <div className="flex items-center gap-1">
      <StickyNote size={16} className="text-farol-secondary" />
      <span>Sachês</span>
    </div>
  </div>
</div>
    
      <div className="space-y-0">
        {pedidos.map((p, index) => (
          <div key={p.id} className={`pedido-card ${index % 2 === 0 ? 'pedido-card-branco' : 'pedido-card-cinza'}`}>
            <div className="pedido-linha">
              <div className="pedido-conteudo">
                <div className="pedido-info"><PillBottle size={16} /><span>{p.registro} - {p.numero_itens}</span></div>
                <div className="pedido-info"><User size={16} /><span>{p.atendente}</span></div>
                <div className="pedido-info"><MapPinHouse size={16} /><span>{p.origem_nome || p.origem?.nome || 'Origem não informada'}</span></div>
                <div className="pedido-info"><MapPinned size={16} /><span>{p.destino_nome || p.destino?.nome || 'Destino não informada'}</span></div>
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
