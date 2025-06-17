import { useState, useEffect, useRef } from 'react'
import { SquareCheckBig } from 'lucide-react'

export default function ModalConfirmacao({ titulo, onConfirmar, onCancelar, coordenadas }) {
  const [codigo, setCodigo] = useState('')
  const [obs, setObs] = useState('')
  const [solidos, setSolidos] = useState('')
  const [semisolidos, setSemisolidos] = useState('')
  const [saches, setSaches] = useState('')

  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const isConferencia = titulo?.toLowerCase().includes('conferência')

  const confirmar = () => {
    if (!codigo.trim()) return

    const extras = isConferencia
      ? {
          itens_solidos: parseInt(solidos) || 0,
          itens_semisolidos: parseInt(semisolidos) || 0,
          itens_saches: parseInt(saches) || 0,
        }
      : {}

    onConfirmar(codigo, obs, extras)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50">
      <div
        className="absolute bg-white w-full max-w-xs p-4 rounded-lg shadow-md animate-fadeIn max-h-screen overflow-y-auto"
        style={{
          top: coordenadas?.top ?? '50%',
          left: coordenadas?.left ?? '50%',
          transform: coordenadas ? 'translateY(0)' : 'translate(-50%, -50%)'
        }}
      >
        <h2 className="text-base font-semibold text-left text-farol-primary mb-2">
          Confirmar {titulo.replace('etapa ', '').replace(/"/g, '')}
        </h2>

        <input
          ref={inputRef}
          type="text"
          placeholder="Código do Usuário"
          className="modal-confirmacao-input rounded-full"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />

        <input
          type="text"
          placeholder="Observação (opcional)"
          className="modal-confirmacao-input rounded-full"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />

        {isConferencia && (
          <>
            <input
              type="number"
              min="0"
              className="modal-confirmacao-input rounded-full"
              placeholder="Qtd. Sólidos"
              value={solidos}
              onChange={(e) => setSolidos(e.target.value)}
            />
            <input
              type="number"
              min="0"
              className="modal-confirmacao-input rounded-full"
              placeholder="Qtd. Semissólidos"
              value={semisolidos}
              onChange={(e) => setSemisolidos(e.target.value)}
            />
            <input
              type="number"
              min="0"
              className="modal-confirmacao-input rounded-full"
              placeholder="Qtd. Sachês"
              value={saches}
              onChange={(e) => setSaches(e.target.value)}
            />
          </>
        )}

        <div className="flex justify-between gap-2 mt-2">
          <button
            onClick={onCancelar}
            className="modal-confirmacao-cancelar"
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            className="modal-confirmacao-botao flex items-center gap-1"
          >
            <SquareCheckBig size={16} /> Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
