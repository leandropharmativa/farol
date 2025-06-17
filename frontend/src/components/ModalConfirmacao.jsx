import { useState, useEffect, useRef } from 'react'
import { SquareCheckBig, Pill, Beaker, StickyNote } from 'lucide-react'

export default function ModalConfirmacao({ titulo, onConfirmar, onCancelar, coordenadas }) {
  const [codigo, setCodigo] = useState('')
  const [obs, setObs] = useState('')
  const [solidos, setSolidos] = useState(0)
  const [semisolidos, setSemisolidos] = useState(0)
  const [saches, setSaches] = useState(0)

  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  const isConferencia = titulo?.toLowerCase().includes('conferência')

  const confirmar = () => {
    if (!codigo.trim()) return

    const extras = isConferencia
      ? {
          itens_solidos: solidos,
          itens_semisolidos: semisolidos,
          itens_saches: saches,
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
          transform: coordenadas ? 'translateX(-100%)' : 'translate(-50%, -50%)'
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
            <div className="contador-linha">
              <Pill className="text-farol-solidos" size={18} />
              <button onClick={() => setSolidos(Math.max(0, solidos - 1))} className="btn-mini">–</button>
              <span className="contador-num">{solidos}</span>
              <button onClick={() => setSolidos(solidos + 1)} className="btn-mini">+</button>
            </div>

            <div className="contador-linha">
              <Beaker className="text-farol-semisolidos" size={18} />
              <button onClick={() => setSemisolidos(Math.max(0, semisolidos - 1))} className="btn-mini">–</button>
              <span className="contador-num">{semisolidos}</span>
              <button onClick={() => setSemisolidos(semisolidos + 1)} className="btn-mini">+</button>
            </div>

            <div className="contador-linha">
              <StickyNote className="text-farol-saches" size={18} />
              <button onClick={() => setSaches(Math.max(0, saches - 1))} className="btn-mini">–</button>
              <span className="contador-num">{saches}</span>
              <button onClick={() => setSaches(saches + 1)} className="btn-mini">+</button>
            </div>
          </>
        )}

        <div className="flex justify-between gap-2 mt-2">
          <button onClick={onCancelar} className="modal-confirmacao-cancelar">
            Cancelar
          </button>
          <button onClick={confirmar} className="modal-confirmacao-botao flex items-center gap-1">
            <SquareCheckBig size={16} /> Confirmar
          </button>
        </div>

        {/* Estilos embutidos */}
        <style jsx>{`
          .modal-confirmacao-input {
            width: 100%;
            margin-bottom: 0.5rem;
            padding: 0.5rem 0.75rem;
            border: 1px solid #ccc;
            font-size: 0.95rem;
            background: #f9f9f9;
          }

          .contador-linha {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 0.5rem;
            gap: 0.5rem;
          }

          .btn-mini {
            padding: 0.25rem 0.5rem;
            background: #e5e7eb;
            border-radius: 999px;
            font-weight: bold;
            font-size: 0.875rem;
            transition: background 0.2s;
          }

          .btn-mini:hover {
            background: #d1d5db;
          }

          .contador-num {
            width: 2rem;
            text-align: center;
            font-weight: bold;
          }
        `}</style>
      </div>
    </div>
  )
}
