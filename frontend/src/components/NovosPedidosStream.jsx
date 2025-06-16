//frontend/src/components/NovosPedidosStream.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { User, MapPinHouse, MapPinned, PillBottle, Calendar, AlarmClock, FileText, ListRestart } from 'lucide-react'

export default function NovosPedidosStream({ farmaciaId }) {
  const [novosPedidos, setNovosPedidos] = useState([])

  const corLocalClasse = (nome) => {
    if (!nome) return 'bg-gray-300 text-gray-800'
    const hash = Array.from(nome).reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const indice = (hash % 6) + 1
    return `bg-farol-loc${indice} text-white`
  }

  useEffect(() => {
    if (!farmaciaId) {
      console.log('[SSE] 🚫 Nenhum farmaciaId disponível, abortando conexão SSE')
      return
    }

    console.log('[SSE] 🔌 Conectando à stream...')
    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/pedidos/stream`)

    eventSource.onopen = () => {
      console.log('[SSE] ✅ Conexão aberta com sucesso')
    }

    eventSource.onmessage = async (event) => {
      const rawData = event.data || ''
      const cleaned = rawData.replace(/^data:\s*/, '').trim()

      console.log('[SSE] 📩 Mensagem recebida (limpa):', cleaned)

      if (!cleaned.startsWith('novo_pedido')) {
        console.log('[SSE] ⚠️ Evento ignorado (não é novo_pedido)')
        return
      }

      const partes = cleaned.split(':')
      if (partes.length < 3) {
        console.warn('[SSE] ❌ Formato de evento inválido:', cleaned)
        return
      }

      const farmaciaEvento = partes[1]
      const pedidoId = partes[2]
      

      console.log(`[SSE] 🎯 Evento para farmácia: ${farmaciaEvento}, pedidoId: ${pedidoId}`)

      if (farmaciaEvento !== farmaciaId) {
        console.log(`[SSE] 🔕 Farmácia (${farmaciaEvento}) ≠ (${farmaciaId})`)
        return
      }

      // 🚫 Ignora pedidos criados por este próprio usuário
      const pedido = res.data
      const ultimoId = localStorage.getItem('ultimoPedidoCriadoId')
      const ultimoRegistro = localStorage.getItem('ultimoPedidoCriadoRegistro')

      if (pedido.id == ultimoId || pedido.registro === ultimoRegistro) {
      console.log(`[SSE] 🙈 Ignorando pedido local (${pedido.id})`)
      localStorage.removeItem('ultimoPedidoCriadoId')
      localStorage.removeItem('ultimoPedidoCriadoRegistro')
      return
      }

      try {
        console.log('[SSE] 📡 Buscando pedido...')
        const res = await api.get(`/pedidos/${pedidoId}`)
        console.log('[SSE] ✅ Pedido carregado:', res.data)

        setNovosPedidos(prev => [res.data, ...prev])
      } catch (err) {
        console.error('[SSE] ❗ Erro ao buscar pedido:', err)
      }
    }

    eventSource.onerror = (err) => {
      console.error('[SSE] 🔌 Erro na conexão. Fechando stream...', err)
      eventSource.close()
    }

    return () => {
      console.log('[SSE] 🔒 Encerrando conexão SSE')
      eventSource.close()
    }
  }, [farmaciaId])

  if (novosPedidos.length === 0) {
    console.log('[UI] 📭 Nenhum novo pedido para exibir')
    return null
  }

  return (
    <div className="mb-4">

    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-semibold text-farol-primary flex items-center gap-2">
        NOVOS PEDIDOS
        <button
        onClick={() => {
        console.log('[SSE] 🔽 Descendo pedidos novos para a lista principal...')
        setNovosPedidos([])
        window.dispatchEvent(new CustomEvent('novoPedidoCriado'))
        }}
        title="Mover todos para a lista principal"
        className="text-farol-primary hover:text-farol-secondary transition p-1"
        >
        <ListRestart size={18} />
        </button>
      </span>
    </div>

      {novosPedidos.map(p => (
        <div key={p.id} className="pedido-card border-l-4 border-farol-primary bg-farol-focus">
          <div className="pedido-linha">
            <div className="pedido-conteudo">
              <div className="pedido-info"><PillBottle size={16} /><span>{p.registro} - {p.numero_itens}</span></div>
              <div className="pedido-info"><User size={16} /><span>{p.atendente}</span></div>

              <div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.origem_nome)}`}>
                <MapPinHouse size={14} className="mr-1" />
                <span>{p.origem_nome}</span>
              </div>

              <div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.destino_nome)}`}>
                <MapPinned size={14} className="mr-1" />
                <span>{p.destino_nome}</span>
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
          </div>
        </div>
      ))}
    </div>
  )
}
