// frontend/src/components/PainelPedidosFarmacia.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
  User, CalendarClock, MapPinHouse, MapPinned, PillBottle, Pencil, Calendar, AlarmClock, AlertCircle,
  PackagePlus, Printer, FileCheck2, CircleCheckBig, Truck, PackageCheck, CreditCard, UserRound, X, Bike,
  FileText, CalendarPlus, CalendarCheck2, Boxes, Beaker, Pill, StickyNote, FilePenLine, Loader2, Handshake,
} from 'lucide-react'
import ModalConfirmacao from './ModalConfirmacao'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import 'tippy.js/themes/light-border.css'
import 'tippy.js/themes/material.css'

export default function PainelPedidosFarmacia({ farmaciaId, usuarioLogado, filtroRegistro = '', emailFarmacia }) {
  const [pedidos, setPedidos] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [etapaSelecionada, setEtapaSelecionada] = useState('')
  const [abrirModal, setAbrirModal] = useState(false)
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [filtroPorPrevisao, setFiltroPorPrevisao] = useState(false)
  const [logsPorPedido, setLogsPorPedido] = useState({})
  const [tooltipStates, setTooltipStates] = useState({})
  const [entregadoresPorPedido, setEntregadoresPorPedido] = useState({})
  const [editandoId, setEditandoId] = useState(null)
  const [formEdicao, setFormEdicao] = useState({})
  const [usuarios, setUsuarios] = useState([])
  const [locais, setLocais] = useState([])

  const destinoEhResidencia = (pedido) => {
    if (!pedido || !locais.length) return false
    return locais.some(l =>
      l.residencia &&
      (l.id === pedido.destino_id || l.nome?.trim().toLowerCase() === pedido.destino_nome?.trim().toLowerCase())
    )
  }

  const carregarPedidos = async () => {
    try {
      let res
      if (filtroRegistro.trim()) {
        res = await api.get('/pedidos/buscar', {
          params: { farmacia_id: farmaciaId, registro: filtroRegistro.trim() }
        })
      } else {
        res = await api.get('/pedidos/listar', {
          params: { farmacia_id: farmaciaId }
        })
      }

      let pedidosCarregados = res.data
      if (!filtroRegistro.trim()) {
        const dataFiltroLocal = new Date(dataSelecionada).toLocaleDateString('pt-BR')
        pedidosCarregados = pedidosCarregados.filter(p => {
          const campoOriginal = filtroPorPrevisao ? p.previsao_entrega : p.data_criacao
          if (!campoOriginal) return false
          return new Date(campoOriginal).toLocaleDateString('pt-BR') === dataFiltroLocal
        })
      }
      setPedidos(pedidosCarregados)

      // 👇 Busca o nome do entregador para cada pedido despachado e residencial
      const entregadoresPromises = pedidosCarregados
        .filter(p => p.status_despacho && destinoEhResidencia(p))
        .map(async (p) => {
          try {
            const res = await api.get(`/entregas/${p.id}`)
            const nomeEntregador = res.data?.[8] // Posição 8 é o nome_entregador
            return { pedidoId: p.id, nome: nomeEntregador }
          } catch (e) {
            if (e.response?.status !== 404) {
              console.warn(`Erro ao buscar entregador do pedido ${p.id}`, e)
            }
            return { pedidoId: p.id, nome: null }
          }
        })

      const entregadoresResultados = await Promise.all(entregadoresPromises)
      const entregadoresMap = entregadoresResultados.reduce((acc, curr) => {
        if (curr.nome) {
          acc[curr.pedidoId] = curr.nome
        }
        return acc
      }, {})

      setEntregadoresPorPedido(entregadoresMap)
    } catch (err) {
      toast.error('Erro ao carregar pedidos')
    }
  }

  useEffect(() => {
    const carregarLogs = async () => {
      const novosLogs = {}
      await Promise.all(
        pedidos.map(async (p) => {
          try {
            const res = await api.get(`/pedidos/${p.id}/logs`)
            novosLogs[p.id] = res.data
          } catch (err) {
            novosLogs[p.id] = []
          }
        })
      )
      setLogsPorPedido(novosLogs)
    }
    if (pedidos.length > 0) carregarLogs()
  }, [pedidos])

  const etapas = [
    { campo: 'status_impressao', nome: 'Impressão', icone: Printer, permissao: 'permissao_impressao' },
    { campo: 'status_conferencia', nome: 'Conferência', icone: FileCheck2, permissao: 'permissao_conferencia' },
    { campo: 'status_producao', nome: 'Produção', icone: CircleCheckBig, permissao: 'permissao_producao' },
    { campo: 'status_despacho', nome: 'Despacho', icone: Truck, permissao: 'permissao_despacho' },
    { campo: 'status_recebimento', nome: 'Recebimento', icone: Handshake, permissao: 'permissao_recebimento' },
    { campo: 'status_entrega', nome: 'Entrega', icone: PackageCheck, permissao: 'permissao_entrega' },
    { campo: 'status_pagamento', nome: 'Pagamento', icone: CreditCard, permissao: 'permissao_registrar_pagamento' }
  ]

  const solicitarConfirmacao = (pedidoId, etapa, event) => {
    setPedidoSelecionado(pedidoId)
    setEtapaSelecionada(etapa)
    setAbrirModal(true)
  }

  const confirmarEtapa = async (codigo, observacao, extras = {}) => {
    try {
      const etapa = etapaSelecionada
      const etapaLower = etapa.toLowerCase()

      const formData = new FormData()
      formData.append('etapa', etapa)
      formData.append('usuario_logado_id', usuarioLogado?.id || 0)
      formData.append('codigo_confirmacao', codigo)
      formData.append('observacao', observacao)

      if (extras.itens_solidos !== undefined) formData.append('itens_solidos', extras.itens_solidos)
      if (extras.itens_semisolidos !== undefined) formData.append('itens_semisolidos', extras.itens_semisolidos)
      if (extras.itens_saches !== undefined) formData.append('itens_saches', extras.itens_saches)

      await api.post(`/pedidos/${pedidoSelecionado}/registrar-etapa`, formData)

      if (etapaLower === 'despacho' && extras.entrega && destinoEhResidencia(pedidos.find(p => p.id === pedidoSelecionado))) {
        const entrega = extras.entrega
        await api.post('/entregas/registrar', {
          pedido_id: pedidoSelecionado,
          farmacia_id: farmaciaId,
          nome_paciente: entrega.nome_paciente,
          endereco_entrega: entrega.endereco_entrega,
          valor_pago: entrega.valor_pago || null,
          forma_pagamento: entrega.forma_pagamento || null,
          entregador_codigo: entrega.entregador_codigo,
        })
      }
      
      toast.success(
        etapaLower === 'despacho' && destinoEhResidencia(pedidos.find(p => p.id === pedidoSelecionado))
          ? 'Despacho e entrega registrados com sucesso'
          : `Etapa '${etapa}' registrada com sucesso`
      )

      setAbrirModal(false)
      carregarPedidos()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Erro ao registrar etapa')
    }
  }

  useEffect(() => {
    if (!farmaciaId) return
    carregarPedidos()
    api.get(`/usuarios/${farmaciaId}`).then(r => setUsuarios(r.data))
    api.get(`/locais/${farmaciaId}`).then(r => setLocais(r.data))
  }, [farmaciaId, dataSelecionada, filtroPorPrevisao, filtroRegistro])

  useEffect(() => {
    const atualizarLocal = () => carregarPedidos()
    window.addEventListener("novoPedidoCriado", atualizarLocal)
    return () => window.removeEventListener("novoPedidoCriado", atualizarLocal)
  }, [])

  const formatarData = (data) => data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase().replace(/ DE /g, ' ')

  const alterarData = (tipo, incremento) => {
    const novaData = new Date(dataSelecionada)
    if (tipo === 'dia') novaData.setDate(novaData.getDate() + incremento)
    if (tipo === 'mes') novaData.setMonth(novaData.getMonth() + incremento)
    if (tipo === 'ano') novaData.setFullYear(novaData.getFullYear() + incremento)
    setDataSelecionada(novaData)
  }

  const dataSplit = formatarData(dataSelecionada).split(' ')
  const [dia, mes, ano] = dataSplit

  const corFixasLocais = {}
  const coresDisponiveis = ['bg-farol-loc1 text-white', 'bg-farol-loc2 text-white', 'bg-farol-loc3 text-white', 'bg-farol-loc4 text-white', 'bg-farol-loc5 text-white', 'bg-farol-loc6 text-white', 'bg-farol-loc7 text-white', 'bg-farol-loc8 text-white', 'bg-farol-loc9 text-white', 'bg-farol-loc10 text-white']
  let indiceCorAtual = 0

  function corLocalClasse(nome) {
    if (!nome) return 'bg-gray-300 text-gray-800'
    if (corFixasLocais[nome]) return corFixasLocais[nome]
    const cor = coresDisponiveis[indiceCorAtual % coresDisponiveis.length]
    corFixasLocais[nome] = cor
    indiceCorAtual++
    return cor
  }

  const totalSolidos = pedidos.reduce((total, p) => total + (logsPorPedido[p.id]?.find(l => l.etapa?.toLowerCase() === 'conferência')?.itens_solidos || 0), 0)
  const totalSemisolidos = pedidos.reduce((total, p) => total + (logsPorPedido[p.id]?.find(l => l.etapa?.toLowerCase() === 'conferência')?.itens_semisolidos || 0), 0)
  const totalSaches = pedidos.reduce((total, p) => total + (logsPorPedido[p.id]?.find(l => l.etapa?.toLowerCase() === 'conferência')?.itens_saches || 0), 0)

  const iniciarEdicao = (p) => {
    setEditandoId(p.id)
    setFormEdicao({
      registro: p.registro,
      numero_itens: 1,
      atendente_id: usuarios.find(u => u.nome === p.atendente)?.id || '',
      origem_id: locais.find(l => l.nome === p.origem_nome)?.id || '',
      destino_id: locais.find(l => l.nome === p.destino_nome)?.id || '',
      previsao_entrega: p.previsao_entrega,
      receita: null,
      codigo_usuario_logado: ''
    })
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setFormEdicao({})
  }

  const salvarEdicao = async (pedidoId) => {
    const formData = new FormData()
    formData.append('registro', formEdicao.registro || '')
    formData.append('atendente_id', formEdicao.atendente_id || '')
    formData.append('origem_id', formEdicao.origem_id || '')
    formData.append('destino_id', formEdicao.destino_id || '')
    formData.append('previsao_entrega', formEdicao.previsao_entrega || '')

    if (!formEdicao.codigo_usuario_logado) {
      toast.error('Informe o código do usuário que está editando')
      return
    }

    const usuario = usuarios.find(u => u.codigo?.toString() === formEdicao.codigo_usuario_logado?.toString())
    if (!usuario) {
      toast.error('Código de usuário não encontrado')
      return
    }

    formData.append('usuario_logado_id', usuario.id)

    if (formEdicao.remover_receita) {
      formData.append('remover_receita', 'true')
    }
    if (formEdicao.receita) {
      formData.append('receita', formEdicao.receita)
    }

    try {
      await api.post(`/pedidos/editar/${pedidoId}`, formData)
      toast.success('Pedido atualizado')
      setEditandoId(null)
      carregarPedidos()
    } catch (err) {
      console.error('❌ Erro ao editar pedido:', err)
      toast.error('Erro ao salvar edição')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Tippy content={<span className="text-[12px] text-farol-secondary">{filtroPorPrevisao ? 'Previsão de Entrega' : 'Data de Criação'}</span>} placement="top-end" animation="text" arrow={true} theme="light-border">
            <button onClick={() => { setFiltroPorPrevisao(!filtroPorPrevisao); if (filtroPorPrevisao) setDataSelecionada(new Date()) }} className="text-farol-primary hover:text-farol-secondary transition flex items-center">
              {filtroPorPrevisao ? <CalendarCheck2 size={20} /> : <CalendarPlus size={20} />}
            </button>
          </Tippy>
          <div className="flex items-baseline gap-1 text-xl font-bold">
            <span className="cursor-pointer select-none" onClick={() => alterarData('dia', +1)} onContextMenu={(e) => { e.preventDefault(); alterarData('dia', -1) }}>{dia}</span>
            <span className="cursor-pointer select-none" onClick={() => alterarData('mes', +1)} onContextMenu={(e) => { e.preventDefault(); alterarData('mes', -1) }}>{mes}</span>
            <span className="cursor-pointer select-none" onClick={() => alterarData('ano', +1)} onContextMenu={(e) => { e.preventDefault(); alterarData('ano', -1) }}>{ano}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-farol-primary"><Boxes size={14} /><span>{pedidos.length}</span></div>
          <div className="flex items-center gap-1 text-farol-semisolidos"><Beaker size={14} /><span>{totalSemisolidos}</span></div>
          <div className="flex items-center gap-1 text-farol-solidos"><Pill size={14} /><span>{totalSolidos}</span></div>
          <div className="flex items-center gap-1 text-farol-saches"><StickyNote size={14} /><span>{totalSaches}</span></div>
        </div>
      </div>

      <div className="space-y-0">
        {pedidos.map((p, index) => (
          <div key={p.id} className={`pedido-card ${index % 2 === 0 ? 'pedido-card-branco' : 'pedido-card-cinza'}`}>
            <div className="pedido-linha">
              <div className="pedido-conteudo">
                <div className="pedido-info flex items-center gap-1">
                  <Tippy
                    content={
                      logsPorPedido[p.id]?.find(log => log.etapa === 'Inclusão') ? (() => {
                        const log = logsPorPedido[p.id].find(l => l.etapa === 'Inclusão')
                        const dt = new Date(log.data_hora)
                        return (
                          <div className="text-[12px] text-gray-700 leading-tight max-w-[240px]">
                            <div className="font-semibold text-farol-primary mb-1">Inclusão</div><hr className="my-1" />
                            <div className="flex items-center gap-1 mb-0.5"><User size={12} /><span>{log.usuario_confirmador}</span></div>
                            <div className="flex items-center gap-1"><Calendar size={12} /><span>{dt.toLocaleDateString('pt-BR')} {dt.toLocaleTimeString('pt-BR').slice(0, 5)}</span></div>
                            {log.observacao && <div className="mt-1 text-farol-primary">{log.observacao}</div>}
                          </div>
                        )
                      })() : <span>Sem dados</span>
                    }
                    placement="top-end" animation="text" arrow={true} theme="light-border" delay={[200, 0]}
                  >
                    <span className="inline-block text-gray-600"><PillBottle size={16} /></span>
                  </Tippy>
                  <span>{p.registro}</span>
                  {logsPorPedido[p.id]?.map((log, i) => {
                    if (log.etapa?.toLowerCase() !== 'conferência') return null
                    return (
                      <span key={i} className="flex items-center gap-[1px] ml-1">
                        {[...Array(log.itens_solidos || 0)].map((_, j) => <Pill key={`s${j}`} size={12} className="text-farol-solidos" />)}
                        {[...Array(log.itens_semisolidos || 0)].map((_, j) => <Beaker key={`ss${j}`} size={12} className="text-farol-semisolidos" />)}
                        {[...Array(log.itens_saches || 0)].map((_, j) => <StickyNote key={`st${j}`} size={12} className="text-farol-saches" />)}
                      </span>
                    )
                  })}
                </div>
                <div className="pedido-info flex items-center gap-1"><User size={16} /><span>{p.atendente}</span></div>
                <div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.origem_nome)}`}><MapPinHouse size={14} className="mr-1" /><span>{p.origem_nome || 'Origem'}</span></div>
                <div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.destino_nome)}`}><MapPinned size={14} className="mr-1" /><span>{p.destino_nome || 'Destino'}</span></div>
                <div className="pedido-info flex items-center gap-1"><Calendar size={16} /><span>{new Date(p.previsao_entrega).getDate()}</span></div>
                <div className="pedido-info flex items-center gap-1"><AlarmClock size={16} /><span>{new Date(p.previsao_entrega).getHours()}h</span></div>
                {p.receita_arquivo && (
                  <div className="pedido-info flex items-center gap-1">
                    <Tippy content="Abrir Receita" placement="top" animation="text" theme="light-border" delay={[200, 0]}>
                      <a href={p.receita_arquivo} target="_blank" rel="noopener noreferrer">
                        <FileText size={16} className="text-farol-primary hover:text-farol-secondary" />
                      </a>
                    </Tippy>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {etapas.map(et => {
                    const Icone = et.icone
                    const ativo = p[et.campo]
                    let podeExecutar = usuarioLogado?.[et.permissao] === true

                    if (et.nome === 'Produção' && !p.status_conferencia) podeExecutar = false
                    if (et.nome === 'Despacho' && !p.status_producao) podeExecutar = false
                    if (et.nome === 'Entrega' && destinoEhResidencia(p) && (!p.status_despacho || (entregadoresPorPedido[p.id] && entregadoresPorPedido[p.id] !== usuarioLogado?.nome))) podeExecutar = false
                    if (et.nome === 'Entrega' && !destinoEhResidencia(p) && !p.status_recebimento) podeExecutar = false
                    if (et.nome === 'Recebimento' && !p.status_despacho) podeExecutar = false
                    
                    const logEtapa = logsPorPedido[p.id]?.find(l => l.etapa?.toLowerCase() === et.nome.toLowerCase())

                    return (
                      <Tippy
                        key={et.campo}
                        content={
                          logEtapa ? (() => {
                            const dt = new Date(logEtapa.data_hora)
                            const nomeEntregador = entregadoresPorPedido[p.id]
                            return (
                              <div className="text-[12px] text-gray-700 leading-tight">
                                <div className="font-semibold text-farol-primary mb-1">{et.nome}</div><hr className="my-1" />
                                <div className="flex items-center gap-1 mb-0.5"><User size={12} /><span>{logEtapa.usuario_confirmador}</span></div>
                                <div className="flex items-center gap-1"><Calendar size={12} /><span>{dt.toLocaleDateString('pt-BR')} {dt.toLocaleTimeString('pt-BR').slice(0, 5)}</span></div>
                                {nomeEntregador && <div className="flex items-center gap-1 text-farol-primary mt-1"><Bike size={12} /><span>{nomeEntregador}</span></div>}
                                {logEtapa.observacao && <div className="mt-1 text-farol-primary">{logEtapa.observacao}</div>}
                              </div>
                            )
                          })() : <span className="text-xs">Aguardando</span>
                        }
                        placement="top-end" animation="text" arrow={true} theme="light-border" delay={[200, 0]}
                      >
                        <span className="inline-block">
                          <button
                            onClick={(e) => { if (podeExecutar && !ativo) solicitarConfirmacao(p.id, et.nome, e) }}
                            disabled={!podeExecutar || ativo}
                            className={`rounded-full p-1 ${ativo ? 'text-green-600' : 'text-gray-400'} ${podeExecutar && !ativo ? 'hover:text-red-500 cursor-pointer' : 'cursor-default opacity-50'}`}
                          >
                            <Icone size={18} />
                          </button>
                        </span>
                      </Tippy>
                    )
                  })}
                  {logsPorPedido[p.id]?.some(l => l.etapa === 'Inclusão' && l.observacao) && (
                    <Tippy content={<div className="text-xs max-w-xs">{logsPorPedido[p.id].find(l => l.etapa === 'Inclusão').observacao}</div>} placement="top" animation="text" theme="light-border">
                      <AlertCircle size={18} className="text-red-500 animate-pulse cursor-pointer" />
                    </Tippy>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {abrirModal && (
        <ModalConfirmacao
          titulo={etapaSelecionada}
          farmaciaId={farmaciaId}
          destinoEhResidencia={destinoEhResidencia(pedidos.find(p => p.id === pedidoSelecionado))}
          onConfirmar={confirmarEtapa}
          onCancelar={() => setAbrirModal(false)}
          IconeEtapa={etapas.find(e => e.nome === etapaSelecionada)?.icone}
          pedidoId={pedidoSelecionado}
        />
      )}
    </div>
  )
}