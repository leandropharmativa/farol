// frontend/src/components/PainelEntregador.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
  Bike, Calendar, AlarmClock, CreditCard, User, MapPinned, CheckCircle, 
  Clock, Package, DollarSign, Navigation, Phone, MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react'
import ModalConfirmacao from './ModalConfirmacao'

export default function PainelEntregador({ usuarioLogado, filtroRegistro = '' }) {
  const [entregas, setEntregas] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [abrirModal, setAbrirModal] = useState(false)
  const [coordenadasModal, setCoordenadasModal] = useState(null)
  const [logsPorPedido, setLogsPorPedido] = useState({})
  const [entregasConcluidasExpandidas, setEntregasConcluidasExpandidas] = useState(false)

  const ajustarFusoHorario = (isoString) => {
    const date = new Date(isoString)
    date.setHours(date.getHours() - 3)
    return date
  }

  const carregarEntregas = async () => {
    try {
      let res
      
      // Se há filtro de registro, busca por pedido específico
      if (filtroRegistro.trim()) {
        try {
          const pedidoRes = await api.get('/pedidos/buscar', {
            params: { 
              farmacia_id: usuarioLogado?.farmacia_id,
              registro: filtroRegistro.trim() 
            }
          })
          
          if (pedidoRes.data.length > 0) {
            const pedido = pedidoRes.data[0]
            // Busca a entrega deste pedido específico
            const entregaRes = await api.get('/entregas/', {
              params: { entregador_id: usuarioLogado?.id }
            })
            
            const entregaDoPedido = entregaRes.data.find(e => e[1] === pedido.id)
            if (entregaDoPedido) {
              setEntregas([entregaDoPedido])
            } else {
              setEntregas([])
            }
          } else {
            setEntregas([])
          }
        } catch (err) {
          setEntregas([])
        }
      } else {
        // Busca todas as entregas do entregador
        res = await api.get('/entregas/', {
          params: { entregador_id: usuarioLogado?.id }
        })
        setEntregas(res.data)
      }

      // Carrega logs para as entregas encontradas
      const novosLogs = {}
      await Promise.all(entregas.map(async (e) => {
        try {
          const pedidoId = e[1]
          const r = await api.get(`/pedidos/${pedidoId}/logs`)
          novosLogs[pedidoId] = r.data
        } catch {
          novosLogs[e[1]] = []
        }
      }))
      setLogsPorPedido(novosLogs)
    } catch (err) {
      toast.error('Erro ao carregar entregas')
    }
  }

  const solicitarConfirmacaoEntrega = (entrega, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setCoordenadasModal({
      top: rect.top + window.scrollY + 30,
      left: rect.left + window.scrollX
    })
    setPedidoSelecionado({
      id: entrega[1],
      farmacia_id: entrega[2]
    })
    setAbrirModal(true)
  }

  const confirmarEntrega = async (codigoConfirmacao, observacao = '') => {
    const pedidoId = pedidoSelecionado?.id
    const farmaciaId = pedidoSelecionado?.farmacia_id

    try {
      if (!pedidoId || isNaN(pedidoId)) {
        console.error('❌ pedidoId inválido:', pedidoId)
        toast.error('Erro interno: ID do pedido inválido')
        return
      }

      const formDataEntrega = new FormData()
      formDataEntrega.append('etapa', 'Entrega')
      formDataEntrega.append('usuario_logado_id', usuarioLogado?.id || 0)
      formDataEntrega.append('codigo_confirmacao', codigoConfirmacao)
      formDataEntrega.append('observacao', observacao)

      await api.post(`/pedidos/${pedidoId}/registrar-etapa`, formDataEntrega)

      // ✅ Confirmar etapa de pagamento em seguida
      const formDataPagamento = new FormData()
      formDataPagamento.append('etapa', 'Pagamento')
      formDataPagamento.append('usuario_logado_id', usuarioLogado?.id || 0)
      formDataPagamento.append('codigo_confirmacao', codigoConfirmacao)
      formDataPagamento.append('observacao', observacao)

      await api.post(`/pedidos/${pedidoId}/registrar-etapa`, formDataPagamento)

      toast.success('Entrega e pagamento confirmados com sucesso')
      setAbrirModal(false)
      carregarEntregas()
    } catch (err) {
      console.error('❌ Erro ao confirmar entrega/pagamento:', err)
      toast.error('Erro ao confirmar entrega')
    }
  }

  const formatarTempoRestante = (previsao) => {
    const agora = new Date()
    const diff = previsao - agora
    const horas = Math.floor(diff / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diff < 0) {
      return { texto: 'Atrasado', cor: 'text-red-600', bg: 'bg-red-50' }
    } else if (horas === 0) {
      return { texto: `${minutos}min`, cor: 'text-orange-600', bg: 'bg-orange-50' }
    } else {
      return { texto: `${horas}h ${minutos}min`, cor: 'text-green-600', bg: 'bg-green-50' }
    }
  }

  const abrirNavegacao = (endereco) => {
    const enderecoEncoded = encodeURIComponent(endereco)
    window.open(`https://www.google.com/maps/search/?api=1&query=${enderecoEncoded}`, '_blank')
  }

  const fazerLigacao = (telefone) => {
    if (telefone) {
      // Remove todos os caracteres não numéricos e adiciona código do país se necessário
      const numeroLimpo = telefone.replace(/\D/g, '')
      const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`
      window.open(`tel:+${numeroCompleto}`, '_self')
    }
  }

  useEffect(() => {
    carregarEntregas()
  }, [filtroRegistro]) // Recarrega quando o filtro muda

  const entregasPendentes = entregas.filter(e => !logsPorPedido[e[1]]?.some(l => l.etapa === 'Entrega'))
  const entregasConcluidas = entregas.filter(e => logsPorPedido[e[1]]?.some(l => l.etapa === 'Entrega'))

  const renderCardEntrega = (e, idx, isConcluida = false) => {
    const pedidoId = e[1]
    const dataDespacho = ajustarFusoHorario(e[10])
    const previsaoEntrega = ajustarFusoHorario(e[12])
    const logDespacho = logsPorPedido[pedidoId]?.find(l => l.etapa === 'Despacho')
    const observacaoDespacho = logDespacho?.observacao || ''
    const tempoRestante = formatarTempoRestante(previsaoEntrega)

    return (
      <div key={idx} className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
        isConcluida ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-farol-primary'
      }`}>
        {/* Header do Card */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-farol-primary" />
              <span className="font-bold text-gray-800">{pedidoId}</span>
            </div>
            {!isConcluida && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${tempoRestante.bg} ${tempoRestante.cor}`}>
                {tempoRestante.texto}
              </div>
            )}
          </div>
          
          {/* Cliente */}
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-gray-500" />
            <span className="font-medium text-gray-800">{e[3]}</span>
          </div>

          {/* Endereço */}
          <div className="flex items-start gap-2 mb-3">
            <MapPinned size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700 leading-relaxed">{e[4]}</span>
          </div>

          {/* Ações Rápidas */}
          <div className="flex gap-2">
            <button
              onClick={() => abrirNavegacao(e[4])}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation size={16} />
              Navegar
            </button>
            {e[5] && (
              <button
                onClick={() => fazerLigacao(e[5])}
                className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Phone size={16} />
                Ligar
              </button>
            )}
          </div>
        </div>

        {/* Detalhes */}
        <div className="p-4 space-y-3">
          {/* Pagamento */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <DollarSign size={18} className="text-gray-600" />
            <div className="flex-1">
              {Number(e[6]) === 0 ? (
                <div className="text-green-700 font-medium">PAGO</div>
              ) : (
                <div>
                  <div className="font-medium text-gray-800">R$ {Number(e[6] || 0).toFixed(2)}</div>
                  {e[7] && <div className="text-sm text-gray-600">via {e[7]}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Horários */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-gray-700">
                Despachado: {dataDespacho.toLocaleDateString('pt-BR')} às {dataDespacho.toLocaleTimeString('pt-BR').slice(0, 5)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlarmClock size={16} className="text-gray-500" />
              <span className="text-gray-700">
                Previsão: {previsaoEntrega.toLocaleDateString('pt-BR')} às {previsaoEntrega.toLocaleTimeString('pt-BR').slice(0, 5)}
              </span>
            </div>
          </div>

          {/* Observação do Despacho */}
          {observacaoDespacho && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <MessageSquare size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">{observacaoDespacho}</div>
              </div>
            </div>
          )}

          {/* Responsável */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <div>Despachado por <strong>{e[19] || logDespacho?.usuario_confirmador || 'N/A'}</strong></div>
          </div>

          {/* Botão de Confirmação */}
          {!isConcluida && (
            <button
              className="w-full bg-farol-primary hover:bg-farol-secondary text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
              onClick={(event) => solicitarConfirmacaoEntrega(e, event)}
            >
              <CheckCircle size={20} />
              Confirmar Entrega
            </button>
          )}

          {isConcluida && (
            <div className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              Entregue
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Lista de Entregas Pendentes */}
      <div className="space-y-3">
        {entregasPendentes.map((e, idx) => renderCardEntrega(e, idx, false))}

        {entregasPendentes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {filtroRegistro.trim() 
                ? 'Nenhuma entrega encontrada para este pedido.'
                : 'Nenhuma entrega pendente encontrada.'
              }
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filtroRegistro.trim()
                ? 'Verifique se o pedido foi despachado para você.'
                : 'Todas as entregas foram concluídas!'
              }
            </p>
          </div>
        )}
      </div>

      {/* Lista de Entregas Concluídas */}
      {entregasConcluidas.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setEntregasConcluidasExpandidas(!entregasConcluidasExpandidas)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {entregasConcluidasExpandidas ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            Entregas Concluídas ({entregasConcluidas.length})
          </button>

          {entregasConcluidasExpandidas && (
            <div className="space-y-3">
              {entregasConcluidas.map((e, idx) => renderCardEntrega(e, idx, true))}
            </div>
          )}
        </div>
      )}

      {abrirModal && (
        <ModalConfirmacao
          titulo="Entrega"
          farmaciaId={pedidoSelecionado?.farmacia_id}
          destinoEhResidencia={false}
          onConfirmar={confirmarEntrega}
          onCancelar={() => setAbrirModal(false)}
          coordenadas={coordenadasModal}
        />
      )}
    </div>
  )
}

