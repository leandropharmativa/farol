//frontend/src/components/NovosPedidosStream.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { User, MapPinHouse, MapPinned, PillBottle, Calendar, AlarmClock, FileText } from 'lucide-react'

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
      console.log('[SSE] 📩 Mensagem recebida:', event.data)

      if (!event.data.startsWith('novo_pedido')) {
        console.log('[SSE] ⚠️ Evento ignorado (não é novo_pedido)')
        return
      }

      const partes = event.data.split(':')
      if (partes.length < 3) {
        console.warn('[SSE] ❌ Formato de evento inválido:', event.data)
        return
      }

      const farmaciaEvento = partes[1]
      const pedidoId = partes[2]

      console.log(`[SSE] 🎯 Evento recebido para farmácia: ${farmaciaEvento}, pedidoId: ${pedidoId}`)

      if (farmaciaEvento !== farmaciaId) {
        console.log(`[SSE] 🔕 Evento ignorado. Farmácia (${farmaciaEvento}) ≠ (${farmaciaId})`)
        return
      }

      try {
        console.log('[SSE] 📡 Buscando dados do novo pedido...')
        const res = await api.get(`/pedidos/${pedidoId}`)
        console.log('[SSE] ✅ Pedido carregado:', res.data)

        setNovosPedidos(prev => [res.data, ...prev])
      } catch (err) {
        console.error('[SSE] ❗ Erro ao buscar novo pedido:', err)
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
      <div className="text-sm font-semibold text-farol-primary mb-1">NOVOS PEDIDOS</div>
      {novosPedidos.map(p => (
        <div key={p.id} className="pedido-card border-l-4 border-farol-primary bg-yellow-50">
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
      <hr className="my-2 border-t-2 border-dashed border-gray-300" />
    </div>
  )
}
