// frontend/src/components/PainelPedidosFarmacia.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
User, CalendarClock, MapPinHouse, MapPinned, PillBottle, Pencil, Calendar, AlarmClock, AlertCircle,
PackagePlus, Printer, FileCheck2, CircleCheckBig, Truck, PackageCheck, CreditCard, UserRound,
FileText, CalendarPlus, CalendarCheck2, Boxes, Beaker, Pill, StickyNote, FilePenLine, Loader2,
} from 'lucide-react'
import ModalConfirmacao from './ModalConfirmacao'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css' // obrigatório – base
import 'tippy.js/themes/light.css'       // para theme="light"
import 'tippy.js/themes/light-border.css' // para theme="light-border"
import 'tippy.js/themes/material.css'     // para theme="material"

export default function PainelPedidosFarmacia({ farmaciaId, usuarioLogado, filtroRegistro = '', emailFarmacia }) {
const [pedidos, setPedidos] = useState([])
const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
const [etapaSelecionada, setEtapaSelecionada] = useState('')
const [abrirModal, setAbrirModal] = useState(false)
const [dataSelecionada, setDataSelecionada] = useState(new Date())
const [filtroPorPrevisao, setFiltroPorPrevisao] = useState(false)
const [logsPorPedido, setLogsPorPedido] = useState({})
const [tooltipStates, setTooltipStates] = useState({})

const carregarPedidos = async () => {
try {
const res = await api.get('/pedidos/listar', {
params: { farmacia_id: farmaciaId }
})

let pedidosCarregados = res.data

if (!filtroRegistro.trim()) {
// Aplica o filtro por data somente se não estiver buscando por registro
const dataFiltro = new Date(dataSelecionada).toISOString().split('T')[0]

pedidosCarregados = pedidosCarregados.filter(p => {
const campoOriginal = filtroPorPrevisao ? p.previsao_entrega : p.data_criacao
if (!campoOriginal) return false
const campoData = new Date(campoOriginal).toISOString().split('T')[0]
return campoData === dataFiltro
})
}

setPedidos(pedidosCarregados)
} catch (err) {
toast.error('Erro ao carregar pedidos')
}
}


useEffect(() => {
const carregarLogs = async () => {
const novosLogs = {}
await Promise.all(
pedidos.map(async (p) => {
try {
const res = await api.get(`/pedidos/${p.id}/logs`)
novosLogs[p.id] = res.data
} catch (err) {
novosLogs[p.id] = []
}
})
)
setLogsPorPedido(novosLogs)
}

if (pedidos.length > 0) {
carregarLogs()
}
}, [pedidos])


const etapas = [
{ campo: 'status_impressao', nome: 'Impressão', icone: Printer, permissao: 'permissao_impressao' },
{ campo: 'status_conferencia', nome: 'Conferência', icone: FileCheck2, permissao: 'permissao_conferencia' },
{ campo: 'status_producao', nome: 'Produção', icone: CircleCheckBig, permissao: 'permissao_producao' },
{ campo: 'status_despacho', nome: 'Despacho', icone: Truck, permissao: 'permissao_despacho' },
{ campo: 'status_entrega', nome: 'Entrega', icone: PackageCheck, permissao: 'permissao_entrega' },
{ campo: 'status_pagamento', nome: 'Pagamento', icone: CreditCard, permissao: 'permissao_registrar_pagamento' }
]

const [coordenadasModal, setCoordenadasModal] = useState(null)

const solicitarConfirmacao = (pedidoId, etapa, event) => {
const rect = event?.currentTarget?.getBoundingClientRect()
if (rect) {
setCoordenadasModal({
top: rect.top + window.scrollY + 30,
left: rect.left + window.scrollX
})
} else {
setCoordenadasModal(null)
}

setPedidoSelecionado(pedidoId)
setEtapaSelecionada(etapa)
setAbrirModal(true)
}


const confirmarEtapa = async (codigoConfirmacao, observacao = '', extras = {}) => {
try {
const formData = new FormData()
formData.append('etapa', etapaSelecionada)
formData.append('usuario_logado_id', usuarioLogado.id)
formData.append('codigo_confirmacao', codigoConfirmacao)
formData.append('observacao', observacao)

// 🟨 Apenas na conferência, envia os tipos de item
if (etapaSelecionada === 'Conferência') {
formData.append('itens_solidos', extras.itens_solidos || 0)
formData.append('itens_semisolidos', extras.itens_semisolidos || 0)
formData.append('itens_saches', extras.itens_saches || 0)
}

const res = await api.post(`/pedidos/${pedidoSelecionado}/registrar-etapa`, formData)

toast.success(res.data.mensagem)
setAbrirModal(false)
carregarPedidos()

// Atualiza tooltip manualmente com novo log
const dt = new Date()
const data = dt.toLocaleDateString('pt-BR')
const hora = dt.toLocaleTimeString('pt-BR').slice(0, 5)
const idEtapa = `${pedidoSelecionado}-${etapaSelecionada}`

const novoTooltipHTML = `
<div class='text-[12px] text-gray-700 leading-tight'>
<div class='font-semibold text-farol-primary mb-1'>${etapaSelecionada}</div>
<hr class='my-1 border-t border-gray-300' />
<div class='flex items-center gap-1 mb-0.5'>
<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
<span>${usuarioLogado.nome}</span>
</div>
<div class='flex items-center gap-1'>
<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 2v2M16 2v2M3 8h18M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
<span>${data} ${hora}</span>
</div>
</div>
`

setTooltipStates(prev => ({
...prev,
[idEtapa]: { loading: false, html: novoTooltipHTML }
}))
} catch (err) {
toast.error(err.response?.data?.detail || 'Erro ao registrar etapa')
}
}

const carregarPedidosComData = async (dataRef) => {
try {
const res = await api.get('/pedidos/listar', {
params: { farmacia_id: farmaciaId }
})

const dataFiltro = dataRef.toISOString().split('T')[0]

const pedidosFiltrados = res.data.filter(p => {
const campoOriginal = filtroPorPrevisao ? p.previsao_entrega : p.data_criacao
if (!campoOriginal) return false
const campoData = new Date(campoOriginal).toISOString().split('T')[0]
return campoData === dataFiltro
})

setPedidos(pedidosFiltrados)
} catch (err) {
toast.error('Erro ao carregar pedidos')
}
}

useEffect(() => {
if (farmaciaId) carregarPedidos()
}, [farmaciaId, dataSelecionada, filtroPorPrevisao])

useEffect(() => {
const atualizarLocal = () => carregarPedidos()
window.addEventListener("novoPedidoCriado", atualizarLocal)
return () => window.removeEventListener("novoPedidoCriado", atualizarLocal)
}, [])

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

const dataSplit = formatarData(dataSelecionada).split(' ')
const [dia, mes, ano] = dataSplit

// Fora do componente (no topo do arquivo)
const corFixasLocais = {}
const coresDisponiveis = [
'bg-farol-loc1 text-white',
'bg-farol-loc2 text-white',
'bg-farol-loc3 text-white',
'bg-farol-loc4 text-white',
'bg-farol-loc5 text-white',
'bg-farol-loc6 text-white',
'bg-farol-loc7 text-white',
'bg-farol-loc8 text-white',
'bg-farol-loc9 text-white',
'bg-farol-loc10 text-white'
]
let indiceCorAtual = 0

function corLocalClasse(nome) {
if (!nome) return 'bg-gray-300 text-gray-800'

if (corFixasLocais[nome]) return corFixasLocais[nome]

// Atribui a próxima cor disponível em ordem, evitando repetição entre nomes diferentes
const cor = coresDisponiveis[indiceCorAtual % coresDisponiveis.length]
corFixasLocais[nome] = cor
indiceCorAtual++
return cor
}

const pedidosFiltrados = pedidos.filter(p =>
p.registro?.toLowerCase().includes(filtroRegistro.toLowerCase())
)

const totalSolidos = pedidos.reduce((total, p) => {
const logConf = logsPorPedido[p.id]?.find(l => l.etapa?.toLowerCase() === 'conferência')
return total + (logConf?.itens_solidos || 0)
}, 0)

const totalSemisolidos = pedidos.reduce((total, p) => {
const logConf = logsPorPedido[p.id]?.find(l => l.etapa?.toLowerCase() === 'conferência')
return total + (logConf?.itens_semisolidos || 0)
}, 0)

const totalSaches = pedidos.reduce((total, p) => {
const logConf = logsPorPedido[p.id]?.find(l => l.etapa?.toLowerCase() === 'conferência')
return total + (logConf?.itens_saches || 0)
}, 0)

return (
<div>
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-3">
<Tippy
content={
<span className="text-[12px] text-farol-secondary">
{filtroPorPrevisao ? 'Previsão de Entrega' : 'Data de Criação'}
</span>
}
placement="top-end"
animation="text"
arrow={true}
theme="light-border"
>
<button
onClick={() => {
const novoValor = !filtroPorPrevisao
setFiltroPorPrevisao(novoValor)
if (!novoValor) {
setDataSelecionada(new Date())
}
}}
className="text-farol-primary hover:text-farol-secondary transition flex items-center"
>
{filtroPorPrevisao ? (
<CalendarCheck2 size={20} className="inline-block align-middle" />
) : (
<CalendarPlus size={20} className="inline-block align-middle" />
)}
</button>
</Tippy>

<div className="flex items-baseline gap-1 text-xl font-bold">
<span
className="cursor-pointer select-none"
onClick={() => alterarData('dia', +1)}
onContextMenu={(e) => { e.preventDefault(); alterarData('dia', -1) }}
>
{dia}
</span>
<span
className="cursor-pointer select-none"
onClick={() => alterarData('mes', +1)}
onContextMenu={(e) => { e.preventDefault(); alterarData('mes', -1) }}
>
{mes}
</span>
<span
className="cursor-pointer select-none"
onClick={() => alterarData('ano', +1)}
onContextMenu={(e) => { e.preventDefault(); alterarData('ano', -1) }}
>
{ano}
</span>
</div>
</div>

<div className="flex items-center gap-2 text-xs">
<div className="flex items-center gap-1 text-farol-primary">
<Boxes size={14} />
<span>{pedidos.length}</span>
</div>
<div className="flex items-center gap-1 text-farol-semisolidos">
<Beaker size={14} />
<span>{totalSemisolidos}</span>
</div>
<div className="flex items-center gap-1 text-farol-solidos">
<Pill size={14} />
<span>{totalSolidos}</span>
</div>
<div className="flex items-center gap-1 text-farol-saches">
<StickyNote size={14} />
<span>{totalSaches}</span>
</div>
</div>

</div>

<div className="space-y-0">
{pedidosFiltrados.map((p, index) => (
<div key={p.id} className={`pedido-card ${index % 2 === 0 ? 'pedido-card-branco' : 'pedido-card-cinza'}`}>
<div className="pedido-linha">
<div className="pedido-conteudo">

<div className="pedido-info flex items-center gap-1">
<PillBottle size={16} />
<span>{p.registro}</span>
{logsPorPedido[p.id]?.map((log, i) => {
const etapa = log.etapa?.toLowerCase()
if (etapa !== 'conferência') return null

const { itens_solidos = 0, itens_semisolidos = 0, itens_saches = 0 } = log

return (
<span key={i} className="flex items-center gap-[1px] ml-1">
{[...Array(itens_solidos)].map((_, i) => <Pill key={`s${i}`} size={12} className="text-farol-solidos" />)}
{[...Array(itens_semisolidos)].map((_, i) => <Beaker key={`ss${i}`} size={12} className="text-farol-semisolidos" />)}
{[...Array(itens_saches)].map((_, i) => <StickyNote key={`st${i}`} size={12} className="text-farol-saches" />)}
</span>
)
})}
</div>

<div className="pedido-info"><User size={16} /><span>{p.atendente}</span></div>

<div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.origem_nome || p.origem?.nome)}`}>
<MapPinHouse size={14} className="mr-1" />
<span>{p.origem_nome || p.origem?.nome || 'Origem'}</span>
</div>

<div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.destino_nome || p.destino?.nome)}`}>
<MapPinned size={14} className="mr-1" />
<span>{p.destino_nome || p.destino?.nome || 'Destino'}</span>
</div>

<div className="pedido-info-mini"><Calendar size={16} /><span>{new Date(p.previsao_entrega).getDate()}</span></div>
<div className="pedido-info-mini"><AlarmClock size={16} /><span>{new Date(p.previsao_entrega).getHours()}h</span></div>

{p.receita_arquivo && (
<div className="pedido-info text-blue-600">
<FileText size={16} />
<a
href={`https://farol-mjtt.onrender.com/receitas/${p.receita_arquivo}`}
target="_blank"
rel="noopener noreferrer"
className="underline"
>
Receita
</a>
</div>
)}
</div>

<div className="flex items-center gap-2">

{etapas.map(et => {
const Icone = et.icone
const ativo = p[et.campo]
const podeExecutar = usuarioLogado?.[et.permissao] === true || usuarioLogado?.[et.permissao] === 'true'

const idEtapa = `${p.id}-${et.nome}`
const tooltip = tooltipStates[idEtapa] || { loading: false, html: '' }

const handleTooltipShow = async () => {
setTooltipStates(prev => ({
...prev,
[idEtapa]: { loading: true, html: '' }
}))
// já carregado

setTooltipStates(prev => ({
...prev,
[idEtapa]: { loading: true, html: '' }
}))

try {
const res = await api.get(`/pedidos/${p.id}/logs`)
const logs = res.data || []
const logEtapa = logs.find(l => l.etapa?.toLowerCase() === et.nome.toLowerCase())

let html = `<div class='text-[10px] text-gray-500'>Aguardando ${et.nome}</div>`

if (logEtapa && logEtapa.data_hora && logEtapa.usuario_confirmador) {
const dt = new Date(logEtapa.data_hora)
const data = dt.toLocaleDateString('pt-BR')
const hora = dt.toLocaleTimeString('pt-BR').slice(0, 5)

html = `
<div class='text-[12px] text-gray-700 leading-tight'>
<div class='font-semibold text-farol-primary mb-1'>${et.nome}</div>
<hr class='my-1 border-t border-gray-300' />
<div class='flex items-center gap-1 mb-0.5'>
<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
<circle cx="12" cy="7" r="4" />
</svg>
<span>${logEtapa.usuario_confirmador}</span>
</div>
<div class='flex items-center gap-1 mb-1'>
<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path d="M8 2v2M16 2v2M3 8h18M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
</svg>
<span>${data} ${hora}</span>
</div>
${logEtapa.observacao
? `<div class='mt-1 text-farol-primary'>${logEtapa.observacao}</div>`
: ''}
</div>
`
// Atualiza o status local do pedido se necessário
if (!p[et.campo]) {
setPedidos(prev =>
prev.map(ped =>
ped.id === p.id ? { ...ped, [et.campo]: true } : ped
)
)
}
}

setTooltipStates(prev => ({
...prev,
[idEtapa]: { loading: false, html }
}))
} catch (e) {
setTooltipStates(prev => ({
...prev,
[idEtapa]: { loading: false, html: `<div class='text-[10px] text-red-400'>Erro ao carregar</div>` }
}))
}
}

return (
<Tippy
key={et.campo}
content={
tooltip.loading
? <span className="flex items-center gap-1 text-[10px] text-gray-500"><Loader2 className="animate-spin w-3 h-3" /></span>
: <span dangerouslySetInnerHTML={{ __html: tooltip.html }} />
}
onShow={handleTooltipShow}
placement="top-end"
animation="text"
arrow={false}
theme="light-border"
delay={[200, 0]}
offset={[15, 0]}
>
<span className="inline-block">
<button
onClick={(e) => {
if (podeExecutar && !ativo) solicitarConfirmacao(p.id, et.nome, e)
}}
disabled={!podeExecutar || ativo}
className={`rounded-full p-1
${ativo ? 'text-green-600' : 'text-gray-400'}
${podeExecutar && !ativo ? 'hover:text-red-500 cursor-pointer' : 'cursor-default opacity-50'}`}
>
<Icone size={18} />
</button>
</span>
</Tippy>
)
})}

{logsPorPedido[p.id]?.some(log => log.etapa === 'Inclusão' && log.observacao) && (
<Tippy
content={
<div className="text-[12px] max-w-[240px] text-gray-700 leading-snug">
<div className="font-semibold text-red-600 mb-1">Observação</div>
<div>{logsPorPedido[p.id].find(log => log.etapa === 'Inclusão')?.observacao}</div>
</div>
}
placement="top-end"
animation="text"
arrow={true}
theme="light-border"
delay={[200, 0]}
offset={[10, 5]}
>
<span className="inline-block">
<AlertCircle
size={18}
className="text-red-500 animate-pulse cursor-pointer"
/>
</span>
</Tippy>
)}

{/* Exibe botão de edição apenas se email for o da farmácia */}
{emailFarmacia && usuarioLogado?.email === emailFarmacia && (
<button
title="Editar pedido"
className="text-gray-400 hover:text-blue-500 p-1"
onClick={() => toast.info('Editar pedido (em desenvolvimento)')}
>
<FilePenLine size={18} />
</button>
)}
</div>
</div>
</div>
))}
</div>

{abrirModal && (
<ModalConfirmacao
titulo={etapaSelecionada}
onConfirmar={confirmarEtapa}
onCancelar={() => setAbrirModal(false)}
coordenadas={coordenadasModal}
IconeEtapa={etapas.find(e => e.nome === etapaSelecionada)?.icone}
/>
)}

</div>
)
}
