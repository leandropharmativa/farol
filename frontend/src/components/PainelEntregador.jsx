import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
  Bike, Calendar, AlarmClock, CreditCard, User, MapPinned, CheckCircle
} from 'lucide-react'

export default function PainelEntregador({ usuarioLogado }) {
  const [entregas, setEntregas] = useState([])

  const carregarEntregas = async () => {
    try {
      const res = await api.get('/entregas/', {
        params: { entregador_id: usuarioLogado?.id }
      })

      // Já filtrado no backend, não precisa repetir filtro
      setEntregas(res.data)
    } catch (err) {
      toast.error('Erro ao carregar entregas')
    }
  }

  useEffect(() => {
    carregarEntregas()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-bold text-farol-primary mb-4">Entregas atribuídas</h2>

      <div className="space-y-2">
        {entregas.map((e, idx) => (
          <div key={idx} className="border border-gray-300 p-3 rounded-lg shadow-sm bg-white">
            <div className="flex items-center gap-2 text-farol-primary font-bold text-sm mb-1">
              <Bike size={16} /> Entrega do pedido #{e[1]}
            </div>
            <div className="text-sm text-gray-700 space-y-1">
              <div className="flex items-center gap-2"><User size={14} /> {e[3]}</div>
              <div className="flex items-center gap-2"><MapPinned size={14} /> {e[4]}</div>

              {e[5] ? (
                <div className="flex items-center gap-2"><CreditCard size={14} /> <span className="text-green-700">PAGO</span></div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard size={14} />
                  R$ {Number(e[5] || 0).toFixed(2)} {e[6] ? `via ${e[6]}` : ''}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar size={14} />
                Despachado em {new Date(e[9]).toLocaleDateString('pt-BR')} às {new Date(e[9]).toLocaleTimeString('pt-BR').slice(0, 5)}
              </div>

              <div className="flex items-center gap-2">
                <AlarmClock size={14} />
                Previsão: {new Date(e[11]).toLocaleDateString('pt-BR')} às {new Date(e[11]).toLocaleTimeString('pt-BR').slice(0, 5)}
              </div>

              {e[19] && (
                <div className="text-xs text-gray-500 italic">
                  Observação: {e[19]}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Despachado por <strong>{e[16]}</strong> e confirmado por <strong>{e[17]}</strong>
              </div>
            </div>

            <div className="mt-3">
              <button className="bg-farol-primary hover:bg-farol-primaryfocus text-white px-4 py-1.5 text-sm rounded-full flex items-center gap-2">
                <CheckCircle size={16} /> Confirmar entrega
              </button>
            </div>
          </div>
        ))}

        {entregas.length === 0 && (
          <div className="text-sm text-gray-500">Nenhuma entrega pendente encontrada.</div>
        )}
      </div>
    </div>
  )
}
