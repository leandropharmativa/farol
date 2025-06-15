import { useState } from 'react'
import { X } from 'lucide-react'

export default function ModalConfirmacao({ titulo, onConfirmar, onCancelar }) {
  const [codigo, setCodigo] = useState('')
  const [observacao, setObservacao] = useState('')

  const confirmar = () => {
    if (!codigo.trim()) return alert('Informe o código de confirmação')
    onConfirmar(codigo.trim(), observacao.trim())
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onCancelar}
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">{titulo}</h2>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Código de confirmação</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Observação (opcional)</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded"
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button
              className="bg-nublia-primary hover:bg-nublia-primaryfocus text-white px-4 py-2 rounded"
              onClick={confirmar}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
