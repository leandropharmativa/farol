// frontend/src/components/ModalConfirmacao.jsx
import { useState } from 'react'
import { SquareCheckBig } from 'lucide-react'

export default function ModalConfirmacao({ titulo, onConfirmar, onCancelar }) {
  const [codigo, setCodigo] = useState('')
  const [observacao, setObservacao] = useState('')

  const confirmar = () => {
    if (!codigo.trim()) return alert('Informe o código de usuário')
    onConfirmar(codigo.trim(), observacao.trim())
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-sm p-5 rounded-lg shadow-lg">
        <h2 className="text-base font-semibold text-left mb-4">
          Confirmar {titulo}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Código de Usuário</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observação</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              rows={2}
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-3">
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm rounded-full"
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button
              className="bg-farol-primary hover:bg-farol-primaryfocus text-white px-4 py-2 text-sm rounded-full flex items-center gap-1"
              onClick={confirmar}
            >
              <SquareCheckBig size={16} />
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
