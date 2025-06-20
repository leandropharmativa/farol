import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
  Bike, Calendar, AlarmClock, CreditCard, User, MapPinned, CheckCircle
} from 'lucide-react'

export default function PainelEntregador({ usuarioLogado }) {
  const [entregas, setEntregas] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(new Date())

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

  const carregarEntregas = async () => {
    try {
      const res = await api.get('/entregas/', {
        params: { entregador_id: usuarioLogado?.id }
      })

      const dataFiltro = new Date(dataSelecionada).toLocaleDateString('pt-BR')
      const entregasFiltradas = res.data.filter(entrega => {
        const data = new Date(entrega[8]).toLocaleDateString('pt-BR') // data_despacho
        return data === dataFiltro
      })
      setEntregas(entregasFiltradas)
    } catch (err) {
      toast.error('Erro ao carregar entregas')
    }
  }

  useEffect(() => {
    carregarEntregas()
  }, [dataSelecionada])

  const [dia, mes, ano] = formatarData(dataSelecionada).split(' ')

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-1 text-xl font-bold text-farol-primary">
          <span className="cursor-pointer select-none" onClick={() => alterarData('dia', +1)} onContextMenu={(e) => { e.preventDefault(); alterarData('dia', -1) }}>{dia}</span>
          <span className="cursor-pointer select-none" onClick={() => alterarData('mes', +1)} onContextMenu={(e) => { e.preventDefault(); alterarData('mes', -1) }}>{mes}</span>
          <span className="cursor-pointer select-none" onClick={() => alterarData('ano', +1)} onContextMenu={(e) => { e.preventDefault(); alterarData('ano', -1) }}>{ano}</span>
        </div>
      </div>

      <div className="space-y-2">
        {entregas.map((e, idx) => (
          <div key={idx} className="border border-gray-300 p-3 rounded-lg shadow-sm bg-white">
            <div className="flex items-center gap-2 text-farol-primary font-bold text-sm mb-1">
              <Bike size={16} /> Entrega do pedido #{e[1]}
            </div>
            <div className="text-sm text-gray-700">
              <div className="flex items-center gap-2"><User size={14} /> {e[3]}</div>
              <div className="flex items-center gap-2"><MapPinned size={14} /> {e[4]}</div>
              {e[5] ? (
                <div className="flex items-center gap-2"><CreditCard size={14} /> <span className="text-green-700">PAGO</span></div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard size={14} />
                  R$ {Number(e[5]).toFixed(2)} via {e[6]}
                </div>
              )}
              <div className="flex items-center gap-2"><Calendar size={14} /> Despachado em {new Date(e[8]).toLocaleDateString('pt-BR')} às {new Date(e[8]).toLocaleTimeString('pt-BR').slice(0, 5)}</div>
              <div className="flex items-center gap-2"><AlarmClock size={14} /> Previsão: {new Date(e[7]).toLocaleDateString('pt-BR')} às {new Date(e[7]).toLocaleTimeString('pt-BR').slice(0, 5)}</div>
            </div>
            <div className="mt-3">
              <button className="bg-farol-primary hover:bg-farol-primaryfocus text-white px-4 py-1.5 text-sm rounded-full flex items-center gap-2">
                <CheckCircle size={16} /> Confirmar entrega
              </button>
            </div>
          </div>
        ))}
        {entregas.length === 0 && (
          <div className="text-sm text-gray-500">Nenhuma entrega encontrada para a data selecionada.</div>
        )}
      </div>
    </div>
  )
}
