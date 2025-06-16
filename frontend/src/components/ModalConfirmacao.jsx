// frontend/src/components/ModalConfirmacao.jsx
import { useState } from 'react'
import { SquareCheckBig } from 'lucide-react'

export default function ModalConfirmacao({ titulo, onConfirmar, onCancelar }) {
  const [codigo, setCodigo] = useState('')
  const [observacao, setObservacao] = useState('')

  const confirmar = () => {
    if (!codigo) return
    onConfirmar(codigo, observacao)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-sm p-4 animate-fadeIn">
        <h2 className="text-left text-lg font-bold text-farol-primary mb-4">
          Confirmar {titulo?.replace('etapa', '').replace(/\"/g, '').trim()}
        </h2>

        <label className="modal-confirmacao-label">Código de Usuário</label>
        <input
          type="number"
          className="modal-confirmacao-input mb-3"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />

        <label className="modal-confirmacao-label">Observação (opcional)</label>
        <input
          type="text"
          className="modal-confirmacao-input"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancelar} className="modal-confirmacao-cancelar text-sm">Cancelar</button>
          <button onClick={confirmar} className="modal-confirmacao-botao text-sm">
            <SquareCheckBig size={16} /> Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
