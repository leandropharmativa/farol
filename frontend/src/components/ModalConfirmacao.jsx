import { useState, useEffect, useRef } from 'react'
import { SquareCheckBig, Pill, Beaker, StickyNote, X, UserRound } from 'lucide-react'

export default function ModalConfirmacao({ titulo, onConfirmar, onCancelar, coordenadas, IconeEtapa }) {
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
className="absolute bg-white w-full max-w-[280px] p-4 rounded-xl shadow-md animate-fadeIn max-h-screen overflow-y-auto"
style={{
top: coordenadas?.top ?? '50%',
left: coordenadas?.left
? `calc(${coordenadas.left}px - 200px)`  // 270px é a largura estimada do modal
: '50%',
transform: coordenadas ? 'translateY(0)' : 'translate(-50%, -50%)'
}}

>
{/* Ícone de fechar no canto */}
<button
onClick={onCancelar}
className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
>
<X size={20} />
</button>

{/* Título com ícone da etapa */}
<div className="flex items-center gap-2 mb-3">
{IconeEtapa && <IconeEtapa size={20} className="text-farol-primary" />}
<h2 className="text-sm font-semibold text-farol-primary">
Confirmar {titulo.replace('etapa ', '').replace(/"/g, '')}
</h2>
</div>

<div className="flex items-center bg-gray-100 rounded-full px-3 py-2 mb-2">
<UserRound className="text-gray-400 mr-2" size={16} />
<input
ref={inputRef}
type="text"
placeholder="Usuário"
className="bg-transparent border-none outline-none text-sm flex-1"
value={codigo}
onChange={(e) => setCodigo(e.target.value)}
/>
</div>

<input
type="text"
placeholder="Observação"
className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm mb-2"
value={obs}
onChange={(e) => setObs(e.target.value)}
/>

{isConferencia && (
<div className="flex gap-2 mt-2">
<div className="contador-mini">
<Pill className="text-farol-solidos" size={16} />
<button onClick={() => setSolidos(Math.max(0, solidos - 1))}>–</button>
<span>{solidos}</span>
<button onClick={() => setSolidos(solidos + 1)}>+</button>
</div>

<div className="contador-mini">
<Beaker className="text-farol-semisolidos" size={16} />
<button onClick={() => setSemisolidos(Math.max(0, semisolidos - 1))}>–</button>
<span>{semisolidos}</span>
<button onClick={() => setSemisolidos(semisolidos + 1)}>+</button>
</div>

<div className="contador-mini">
<StickyNote className="text-farol-saches" size={16} />
<button onClick={() => setSaches(Math.max(0, saches - 1))}>–</button>
<span>{saches}</span>
<button onClick={() => setSaches(saches + 1)}>+</button>
</div>
</div>
)}


<button
onClick={confirmar}
className="mt-4 w-full bg-farol-primary hover:bg-farol-primaryfocus text-white font-medium py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm"
>
<SquareCheckBig size={16} /> Confirmar
</button>

{/* CSS embutido */}
<style jsx>{`
.contador-linha {
display: flex;
align-items: center;
justify-content: space-between;
margin-top: 0.5rem;
gap: 0.5rem;
background: #f3f4f6;
padding: 0.4rem 0.8rem;
border-radius: 999px;
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

.contador-mini {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f3f4f6;
  padding: 0.05rem 0.1rem;
  border-radius: 999px;
  gap: 1px;
  font-size: 0.675rem;
}

.contador-mini button {
  padding: 0 2px;
  background: #e5e7eb;
  border-radius: 999px;
  font-weight: bold;
  transition: background 0.2s;
}

.contador-mini button:hover {
  background: #d1d5db;
}

.contador-mini span {
  width: 1.0rem;
  text-align: center;
  font-weight: bold;
}

.contador-num {
width: 1rem;
text-align: center;
font-weight: bold;
}
`}</style>
</div>
</div>
)
}
