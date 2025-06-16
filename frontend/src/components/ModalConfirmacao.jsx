import { useState } from 'react'
import { SquareCheckBig } from 'lucide-react'

export default function ModalConfirmacao({ titulo, onConfirmar, onCancelar }) {
  const [codigo, setCodigo] = useState('')
  const [obs, setObs] = useState('')

  const confirmar = () => {
    if (!codigo.trim()) return
    onConfirmar(codigo, obs)
  }

  return (
    <div className="modal-overlay">
      <div className="bg-white max-w-xs w-full p-4 rounded-lg shadow-md animate-fadeIn">
        <h2 className="text-base font-semibold text-left text-farol-primary mb-4">
          Confirmar {titulo.replace('etapa ', '').replace(/"/g, '')}
        </h2>

        <input
          type="text"
          placeholder="Código do Usuário"
          className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full mb-2 focus:outline-none focus:ring-2 focus:ring-farol-primary"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />

        <input
          type="text"
          placeholder="Observação (opcional)"
          className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full mb-3 focus:outline-none focus:ring-2 focus:ring-farol-primary"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />

        <div className="flex justify-between gap-2">
          <button
            onClick={confirmar}
            className="bg-farol-primary hover:bg-farol-secondary text-white rounded-full px-4 py-1.5 text-sm flex items-center gap-1 w-full justify-center"
          >
            <SquareCheckBig size={16} /> Confirmar
          </button>
          <button
            onClick={onCancelar}
            className="text-gray-500 hover:text-gray-700 text-sm px-4 py-1.5 rounded w-full"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
