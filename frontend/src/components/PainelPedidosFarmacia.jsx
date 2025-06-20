// frontend/src/components/PainelPedidosFarmacia.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
User, CalendarClock, MapPinHouse, MapPinned, PillBottle, Pencil, Calendar, AlarmClock, AlertCircle,
PackagePlus, Printer, FileCheck2, CircleCheckBig, Truck, PackageCheck, CreditCard, UserRound, X, Bike,
FileText, CalendarPlus, CalendarCheck2, Boxes, Beaker, Pill, StickyNote, FilePenLine, Loader2, Handshake,
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

const [editandoId, setEditandoId] = useState(null)
const [formEdicao, setFormEdicao] = useState({})
const [usuarios, setUsuarios] = useState([])
const [locais, setLocais] = useState([])

const destinoEhResidencia = (pedido) => {
if (!pedido || !locais.length) return false
return locais.some(l =>
l.residencia &&
(
l.id === pedido.destino_id || 
l.nome?.trim().toLowerCase() === pedido.destino_nome?.trim().toLowerCase()
)
)
}

const carregarPedidos = async () => {
try {
const res = await api.get('/pedidos/listar', {
params: { farmacia_id: farmaciaId }
})

let pedidosCarregados = res.data

// Aplica filtro por data (tanto para criação quanto previsão)
const dataFiltroLocal = new Date(dataSelecionada).toLocaleDateString('pt-BR')

pedidosCarregados = pedidosCarregados.filter(p => {
const campoOriginal = filtroPorPrevisao ? p.previsao_entrega : p.data_criacao
if (!campoOriginal) return false
const dataCampo = new Date(campoOriginal).toLocaleDateString('pt-BR')
return dataCampo === dataFiltroLocal
})

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
{ campo: 'status_recebimento', nome: 'Recebimento', icone: Handshake, permissao: 'permissao_recebimento' },
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

const pedidoSelecionadoObj = pedidos.find(p => p.id === pedidoId)
window.__ULTIMO_PEDIDO_SELECIONADO = pedidoSelecionadoObj  // <-- ESSA LINHA É O QUE FALTAVA

setPedidoSelecionado(pedidoId)
setEtapaSelecionada(etapa)
setAbrirModal(true)
}

const confirmarEtapa = async (codigo, observacao, extras = {}) => {
try {
const etapa = etapaSelecionada
const etapaLower = etapa.toLowerCase()

// Primeiro, confirmar a etapa no backend
const formData = new FormData()
formData.append('etapa', etapa)
formData.append('usuario_logado_id', usuarioLogado?.id || 0)
formData.append('codigo_confirmacao', codigo)
formData.append('observacao', observacao)

// Se for conferência, adicionar os itens
if (extras.itens_solidos !== undefined) formData.append('itens_solidos', extras.itens_solidos)
if (extras.itens_semisolidos !== undefined) formData.append('itens_semisolidos', extras.itens_semisolidos)
if (extras.itens_saches !== undefined) formData.append('itens_saches', extras.itens_saches)

await api.post(`/pedidos/${pedidoSelecionado}/registrar-etapa`, formData)

// ✅ Se for entrega residencial no despacho, registrar entrega
if (
etapaLower === 'despacho' &&
extras.entrega &&
destinoEhResidencia(pedidos.find(p => p.id === pedidoSelecionado))
) {
const entrega = extras.entrega
await api.post('/entregas/registrar', {
pedido_id: pedidoSelecionado.id,
farmacia_id: farmaciaId,
nome_paciente: entrega.nome_paciente,
endereco_entrega: entrega.endereco_entrega,
valor_pago: entrega.valor_pago || null,
forma_pagamento: entrega.forma_pagamento || null,
entregador_codigo: entrega.entregador_codigo,
})
}

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
<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
<circle cx="12" cy="7" r="4" />
</svg>
<span>${usuarioLogado.nome}</span>
</div>
<div class='flex items-center gap-1'>
<svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path d="M8 2v2M16 2v2M3 8h18M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
</svg>
<span>${data} ${hora}</span>
</div>
</div>
`

setTooltipStates(prev => ({
...prev,
[idEtapa]: { loading: false, html: novoTooltipHTML }
}))

toast.success(`Etapa '${etapa}' registrada com sucesso`)
setAbrirModal(false)
carregarPedidos()
} catch (err) {
console.error(err)
toast.error('Erro ao registrar etapa')
}
}


useEffect(() => {
if (!farmaciaId) return
carregarPedidos()
api.get(`/usuarios/${farmaciaId}`).then(r => setUsuarios(r.data))
api.get(`/locais/${farmaciaId}`).then(r => setLocais(r.data))
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

const iniciarEdicao = (p) => {
setEditandoId(p.id)
setFormEdicao({
registro: p.registro,
numero_itens: 1,
atendente_id: usuarios.find(u => u.nome === p.atendente)?.id || '',
origem_id: locais.find(l => l.nome === p.origem_nome)?.id || '',
destino_id: locais.find(l => l.nome === p.destino_nome)?.id || '',
previsao_entrega: p.previsao_entrega,
receita: null,
codigo_usuario_logado: ''
})
}

const cancelarEdicao = () => {
setEditandoId(null)
setFormEdicao({})
}

const salvarEdicao = async (pedidoId) => {
const formData = new FormData()

// Campos obrigatórios
formData.append('registro', formEdicao.registro || '')
formData.append('atendente_id', formEdicao.atendente_id || '')
formData.append('origem_id', formEdicao.origem_id || '')
formData.append('destino_id', formEdicao.destino_id || '')
formData.append('previsao_entrega', formEdicao.previsao_entrega || '')

// ⚠️ Converte o código do usuário em ID
if (!formEdicao.codigo_usuario_logado) {
toast.error('Informe o código do usuário que está editando')
return
}

const usuario = usuarios.find(u => u.codigo?.toString() === formEdicao.codigo_usuario_logado?.toString())
if (!usuario) {
toast.error('Código de usuário não encontrado')
return
}

formData.append('usuario_logado_id', usuario.id)

// Receita
if (formEdicao.remover_receita) {
formData.append('remover_receita', 'true')
}
if (formEdicao.receita) {
formData.append('receita', formEdicao.receita)
}

// 🔍 Log dos dados enviados
console.log('🔍 Enviando para /pedidos/editar:')
for (let pair of formData.entries()) {
console.log(`${pair[0]}:`, pair[1])
}

try {
await api.post(`/pedidos/editar/${pedidoId}`, formData)
toast.success('Pedido atualizado')
setEditandoId(null)
carregarPedidos()
} catch (err) {
console.error('❌ Erro ao editar pedido:', err)
toast.error('Erro ao salvar edição')
}
}

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
<Tippy
content={
logsPorPedido[p.id]?.find(log => log.etapa === 'Inclusão')
? (() => {
const log = logsPorPedido[p.id].find(l => l.etapa === 'Inclusão')
const dt = new Date(log.data_hora)
const data = dt.toLocaleDateString('pt-BR')
const hora = dt.toLocaleTimeString('pt-BR').slice(0, 5)
return (
<div className="text-[12px] text-gray-700 leading-tight max-w-[240px]">
<div className="font-semibold text-farol-primary mb-1">Inclusão</div>
<hr className="my-1 border-t border-gray-300" />
<div className="flex items-center gap-1 mb-0.5">
<User size={12} className="text-gray-500" />
<span>{log.usuario_confirmador}</span>
</div>
<div className="flex items-center gap-1">
<Calendar size={12} className="text-gray-500" />
<span>{data} {hora}</span>
</div>
{log.observacao && (
<div className="mt-1 text-farol-primary">{log.observacao}</div>
)}
</div>
)
})()
: <span className="text-[10px] text-gray-500">Sem dados de inclusão</span>
}
placement="top-end"
animation="text"
arrow={true}
theme="light-border"
delay={[200, 0]}
>
<span className="inline-block text-gray-600">
<PillBottle size={16} />
</span>
</Tippy>
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

<div className="pedido-info flex items-center gap-1">
<User size={16} />
{editandoId === p.id ? (
<select
className="text-xs border border-gray-300 rounded px-1 py-[1px]"
value={formEdicao.atendente_id}
onChange={e => setFormEdicao({ ...formEdicao, atendente_id: e.target.value })}
>
<option value="">Selecione</option>
{usuarios.map(u => (
<option key={u.id} value={u.id}>{u.nome}</option>
))}
</select>
) : (
<span>{p.atendente}</span>
)}
</div>

<div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.origem_nome || p.origem?.nome)}`}>
<MapPinHouse size={14} className="mr-1" />
{editandoId === p.id ? (
<select
className="text-xs bg-white border border-gray-300 rounded px-1 py-[1px]"
value={formEdicao.origem_id}
onChange={e => setFormEdicao({ ...formEdicao, origem_id: e.target.value })}
>
<option value="">Origem</option>
{locais.filter(l => l.origem).map(l => (
<option key={l.id} value={l.id}>{l.nome}</option>
))}
</select>
) : (
<span>{p.origem_nome || p.origem?.nome || 'Origem'}</span>
)}
</div>


<div className={`pedido-info px-2 py-0.5 rounded-full text-xs ${corLocalClasse(p.destino_nome || p.destino?.nome)}`}>
<MapPinned size={14} className="mr-1" />
{editandoId === p.id ? (
<select
className="text-xs bg-white border border-gray-300 rounded px-1 py-[1px]"
value={formEdicao.destino_id}
onChange={e => setFormEdicao({ ...formEdicao, destino_id: e.target.value })}
>
<option value="">Destino</option>
{locais.filter(l => l.destino).map(l => (
<option key={l.id} value={l.id}>{l.nome}</option>
))}
</select>
) : (
<span>{p.destino_nome || p.destino?.nome || 'Destino'}</span>
)}
</div>


<div className="pedido-info flex items-center gap-1">
<Calendar size={16} />
{editandoId === p.id ? (
<input
type="date"
className="text-xs border border-gray-300 rounded px-1 py-[1px]"
value={formEdicao.previsao_entrega?.split('T')[0] || ''}
onChange={e => setFormEdicao({ ...formEdicao, previsao_entrega: e.target.value })}
/>
) : (
<span>{new Date(p.previsao_entrega).getDate()}</span>
)}
</div>

<div className="pedido-info flex items-center gap-1">
<AlarmClock size={16} />
{editandoId === p.id ? (
<>
<input
type="time"
className="text-xs border border-gray-300 rounded px-1 py-[1px]"
value={formEdicao.previsao_entrega?.slice(11, 16) || ''}
onChange={e => {
const [hora, minuto] = e.target.value.split(':')
const data = new Date(formEdicao.previsao_entrega || new Date())
data.setHours(hora)
data.setMinutes(minuto)
setFormEdicao({ ...formEdicao, previsao_entrega: data.toISOString() })
}}
/>
<input
type="text"
className="text-xs border border-gray-300 rounded px-1 py-[1px]"
placeholder="Código do usuário"
value={formEdicao.codigo_usuario_logado || ''}
onChange={e =>
setFormEdicao({ ...formEdicao, codigo_usuario_logado: e.target.value })
}
/>
</>
) : (
<span>{new Date(p.previsao_entrega).getHours()}h</span>
)}
</div>

<div className="pedido-info flex items-center gap-1">
{editandoId === p.id ? (
<>
<FileText size={16} />
{p.receita_arquivo && !formEdicao.receita && !formEdicao.remover_receita ? (
<>
<a
href={p.receita_arquivo}
target="_blank"
rel="noopener noreferrer"
className="text-farol-primary underline text-xs"
>
Ver receita
</a>
<button
onClick={() => setFormEdicao({ ...formEdicao, remover_receita: true })}
className="text-red-600 text-xs underline"
>
Remover
</button>
<button
onClick={() => setFormEdicao({ ...formEdicao, substituir_receita: true })}
className="text-farol-primary text-xs underline"
>
Substituir
</button>
</>
) : formEdicao.substituir_receita || !p.receita_arquivo ? (
<input
type="file"
className="text-xs"
onChange={e =>
setFormEdicao({ ...formEdicao, receita: e.target.files[0], remover_receita: false })
}
/>
) : (
<span className="text-xs text-gray-400 italic">Receita removida</span>
)}
</>
) : (
p.receita_arquivo ? (
<Tippy
content={<span className="text-[12px]">Abrir Receita</span>}
placement="top-end"
animation="text"
theme="light-border"
delay={[200, 0]}
>
<a
href={p.receita_arquivo}
target="_blank"
rel="noopener noreferrer"
className="pedido-info"
>
<FileText size={16} className="pedido-info text-farol-primary hover:text-farol-secondary" />
</a>
</Tippy>
) : (
<span className="text-xs text-gray-400 italic"></span>
)
)}
</div>

<div className="flex items-center gap-2 ml-auto">
{editandoId !== p.id && etapas.map(et => {
if (
et.nome === 'Recebimento' &&
locais.find(l => l.nome === p.destino_nome || l.nome === p.destino?.nome)?.residencia
) return null

const Icone = et.icone
const ativo = p[et.campo]

let podeExecutar = usuarioLogado?.[et.permissao] === true || usuarioLogado?.[et.permissao] === 'true'

// Regras adicionais de dependência entre etapas
if (et.nome === 'Produção' && !p.status_conferencia) podeExecutar = false
if (et.nome === 'Despacho' && !p.status_producao) podeExecutar = false

if (et.nome === 'Entrega') {
const destinoResidencial = locais.find(l =>
l.nome === p.destino_nome || l.nome === p.destino?.nome
)?.residencia

if (destinoResidencial) {
if (!p.status_despacho) podeExecutar = false
} else {
if (!p.status_recebimento) podeExecutar = false
}
}
if (et.nome === 'Recebimento' && !p.status_despacho) podeExecutar = false

const idEtapa = `${p.id}-${et.nome}`
const tooltip = tooltipStates[idEtapa] || { loading: false, html: '' }

const handleTooltipShow = async () => {
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

let entregadorHTML = ''

if (et.nome === 'Despacho' && destinoEhResidencia(p)) {
try {
const entrega = await api.get(`/entregas/${p.id}`)
const nomeEntregador = entrega.data[8] // posição 8 = nome do entregador
if (nomeEntregador) {
entregadorHTML = `
  <div class='flex items-center gap-1 text-farol-primary mb-1'>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M16,1 C16.5522847,1 17,1.44771525 17,2 L17,3 L22,3 L22,9 L19.980979,9 L22.7270773,16.5448432 C22.9032836,16.9958219 23,17.4866163 23,18 C23,20.209139 21.209139,22 19,22 C17.1361606,22 15.5700603,20.7252272 15.1260175,19 L10.8739825,19 C10.4299397,20.7252272 8.86383943,22 7,22 C5.05550552,22 3.43507622,20.612512 3.0747418,18.7735658 C2.43596423,18.4396361 2,17.7707305 2,17 L2,7 C2,6.44771525 2.44771525,6 3,6 L10,6 C10.5522847,6 11,6.44771525 11,7 L11,12 C11,12.5522847 11.4477153,13 12,13 L14,13 C14.5522847,13 15,12.5522847 15,12 L15,3 L12,3 L12,1 L16,1 Z M19,16 C17.8954305,16 17,16.8954305 17,18 C17,19.1045695 17.8954305,20 19,20 C20.1045695,20 21,19.1045695 21,18 C21,17.7596672 20.9576092,17.5292353 20.8798967,17.3157736 L20.8635387,17.2724216 C20.5725256,16.5276089 19.8478776,16 19,16 Z M7,16 C5.8954305,16 5,16.8954305 5,18 C5,19.1045695 5.8954305,20 7,20 C8.1045695,20 9,19.1045695 9,18 C9,16.8954305 8.1045695,16 7,16 Z M9,8 L4,8 L4,10 L9,10 L9,8 Z M20,5 L17,5 L17,7 L20,7 L20,5 Z" />
    </svg>
    <span>${nomeEntregador}</span>
  </div>
`
}
} catch (e) {
console.warn('Erro ao buscar entrega:', e)
}
}


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
${entregadorHTML}
${logEtapa.observacao ? `<div class='mt-1 text-farol-primary'>${logEtapa.observacao}</div>` : ''}
</div>
`
}

// Atualiza status visual
if (logEtapa && !p[et.campo]) {
setPedidos(prevPedidos =>
prevPedidos.map(pedido =>
pedido.id === p.id ? { ...pedido, [et.campo]: true } : pedido
)
)
}

setTooltipStates(prev => ({
...prev,
[idEtapa]: { loading: false, html }
}))
} catch {
setTooltipStates(prev => ({
...prev,
[idEtapa]: {
loading: false,
html: `<div class='text-[10px] text-red-400'>Erro ao carregar</div>`
}
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

{emailFarmacia && usuarioLogado?.email === emailFarmacia && (
<>
{editandoId === p.id ? (
<>
<button
title="Salvar edição"
className="text-green-600 hover:text-green-800 p-1"
onClick={() => salvarEdicao(p.id)}
>
<FilePenLine size={18} />
</button>
<button
title="Cancelar"
className="text-gray-400 hover:text-red-500 p-1"
onClick={cancelarEdicao}
>
<X size={18} />
</button>
</>
) : (
<button
title="Editar pedido"
className="text-gray-400 hover:text-blue-500 p-1"
onClick={() => iniciarEdicao(p)}
>
<FilePenLine size={18} />
</button>
)}
</>
)}
</div>

</div>
</div>
</div>
))}
</div>

{abrirModal && (() => {
const pedidoSelecionadoObj = pedidos.find(p => p.id === pedidoSelecionado)
console.log('📦 Pedido selecionado:', pedidoSelecionadoObj)
console.log('🏠 Destino é residência?', destinoEhResidencia(pedidoSelecionadoObj))

return (
<ModalConfirmacao
titulo={etapaSelecionada}
farmaciaId={farmaciaId}
destinoEhResidencia={destinoEhResidencia(pedidoSelecionadoObj)}
onConfirmar={confirmarEtapa}
onCancelar={() => setAbrirModal(false)}
IconeEtapa={etapas.find(e => e.nome === etapaSelecionada)?.icone}
/>

)
})()}

</div>
)
}
