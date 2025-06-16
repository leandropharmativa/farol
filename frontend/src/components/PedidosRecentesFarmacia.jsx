// 📄 PedidosRecentesFarmacia.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { User, MapPinHouse, MapPinned, PillBottle, Calendar, AlarmClock, FileText, X, Check } from 'lucide-react'

export default function PedidosRecentesFarmacia({ farmaciaId, dataSelecionada, onIncluirPedido }) {
  const [novosPedidos, setNovosPedidos] = useState([])

  useEffect(() => {
    if (!farmaciaId) return
    const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/pedidos/stream`)

    eventSource.onmessage = async (event) => {
      if (!event.data.startsWith('novo_pedido')) return

      const partes = event.data.split(':')
      const farmaciaEvento = partes[1]
      const pedidoId = partes[2]

      if (farmaciaEvento !== farmaciaId) return

      try {
        const res = await api.get(`/pedidos/${pedidoId}`)
        const pedidoNovo = res.data

        const dataPedido = new Date(pedidoNovo.data_criacao).toISOString().split('T')[0]
        const dataAtual = new Date(dataSelecionada).toISOString().split('T')[0]

        if (dataPedido === dataAtual) {
          setNovosPedidos(prev => {
            const existe = prev.some(p => p.id === pedidoNovo.id)
            return existe ? prev : [...prev, pedidoNovo]
          })
        }
      } catch {
        console.error('Erro ao carregar pedido novo')
      }
    }

    eventSource.onerror = () => eventSource.close()
    return () => eventSource.close()
  }, [farmaciaId, dataSelecionada])

  const descartarPedido = (id) => {
    setNovosPedidos(prev => prev.filter(p => p.id !== id))
  }

  const incluirNaLista = (pedido) => {
    onIncluirPedido(pedido)
    descartarPedido(pedido.id)
  }

  if (novosPedidos.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      <div className="font-bold text-sm text-yellow-700">📦 Novos pedidos recebidos:</div>
      {novosPedidos.map(p => (
        <div key={p.id} className="border-2 border-yellow-400 bg-yellow-50 rounded p-2">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2"><PillBottle size={14} /><span>{p.registro} - {p.numero_itens}</span></div>
              <div className="flex items-center gap-2"><User size={14} /><span>{p.atendente}</span></div>
              <div className="flex items-center gap-2"><MapPinHouse size={14} /><span>{p.origem_nome || 'Origem'}</span></div>
              <div className="flex items-center gap-2"><MapPinned size={14} /><span>{p.destino_nome || 'Destino'}</span></div>
              <div className="flex items-center gap-2"><Calendar size={14} /><span>{new Date(p.previsao_entrega).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-2"><AlarmClock size={14} /><span>{new Date(p.previsao_entrega).getHours()}h</span></div>
              {p.receita_arquivo && (
                <a
                  href={`https://farol-mjtt.onrender.com/receitas/${p.receita_arquivo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 underline"
                >
                  <FileText size={14} /> Receita
                </a>
              )}
            </div>

            <div className="flex flex-col gap-1 items-end">
              <button onClick={() => incluirNaLista(p)} className="text-green-600 hover:text-green-800" title="Incluir">
                <Check size={18} />
              </button>
              <button onClick={() => descartarPedido(p.id)} className="text-gray-400 hover:text-red-500" title="Descartar">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
