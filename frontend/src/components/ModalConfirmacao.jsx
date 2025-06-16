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
        <h2 className="text-base font-semibold text-left text-farol-primary mb-2">
          Confirmar {titulo.replace('etapa ', '').replace(/"/g, '')}
        </h2>

        <input
          type="text"
          placeholder="Código do Usuário"
          className="modal-confirmacao-input"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />

        <input
          type="text"
          placeholder="Observação (opcional)"
          className="modal-confirmacao-input"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />

        <div className="flex justify-between gap-2">
          <button
            onClick={onCancelar}
            className="modal-confirmacao-cancelar"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            className="modal-confirmacao-botao"
          >
            <SquareCheckBig size={16} /> Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
