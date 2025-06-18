import { useState, useEffect, useRef } from 'react'
import {
  SquareCheckBig, Pill, Beaker, StickyNote, X, UserRound
} from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'

export default function ModalConfirmacao({ titulo, onConfirmar, onCancelar, IconeEtapa, destinoEhResidencia, farmaciaId }) {
  const [codigo, setCodigo] = useState('')
  const [obs, setObs] = useState('')
  const [solidos, setSolidos] = useState(0)
  const [semisolidos, setSemisolidos] = useState(0)
  const [saches, setSaches] = useState(0)

  const [paciente, setPaciente] = useState('')
  const [endereco, setEndereco] = useState('')
  const [valorPago, setValorPago] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [codigoEntregador, setCodigoEntregador] = useState('')
  const [usuariosEntrega, setUsuariosEntrega] = useState([])

  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const inputRef = useRef(null)

  const etapa = titulo?.toLowerCase()
  const isConferencia = etapa.includes('conferência')
  const isDespachoResidencial = etapa.includes('despacho') && destinoEhResidencia
  const pagamentoJaFeito = pedidoSelecionado?.status_pagamento

  useEffect(() => {
    if (farmaciaId && isDespachoResidencial) {
      api.get(`/usuarios/${farmaciaId}`)
        .then(res => {
          const filtrados = res.data.filter(u =>
            u.permissao_entrega === true || u.permissao_entrega === 'true'
          )
          setUsuariosEntrega(filtrados)
        })
        .catch(() => toast.error('Erro ao carregar usuários'))
    }
  }, [farmaciaId, isDespachoResidencial])

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
    const ultimoPedido = window.__ULTIMO_PEDIDO_SELECIONADO
    if (ultimoPedido) setPedidoSelecionado(ultimoPedido)
  }, [])

  const confirmar = () => {
    if (!codigo.trim()) return

    const extras = isConferencia
      ? {
          itens_solidos: solidos,
          itens_semisolidos: semisolidos,
          itens_saches: saches,
        }
      : {}

    if (isDespachoResidencial) {
      if (!paciente.trim() || !endereco.trim() || !codigoEntregador.trim()) {
        return alert('Preencha nome do paciente, endereço e código do entregador.')
      }

      extras.entrega = {
        nome_paciente: paciente,
        endereco_entrega: endereco,
        valor_pago: pagamentoJaFeito ? null : valorPago || null,
        forma_pagamento: pagamentoJaFeito ? null : formaPagamento || null,
        entregador_codigo: codigoEntregador
      }
    }

    onConfirmar(codigo, obs, extras)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-[280px] p-4 rounded-xl shadow-md animate-fadeIn max-h-screen overflow-y-auto relative">
        <button onClick={onCancelar} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-3 leading-tight">
          {IconeEtapa && <IconeEtapa size={18} className="text-farol-primary" />}
          <span className="text-sm font-semibold text-farol-primary relative top-[1px]">
            Confirmar {titulo.replace('etapa ', '').replace(/"/g, '')}
          </span>
        </div>

        {/* Campo código do usuário */}
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 mb-2">
          <UserRound className="text-gray-400 mr-2" size={16} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Código do usuário"
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

        {/* Campos extras para despacho residencial */}
        {isDespachoResidencial && (
          <>
            <input
              type="text"
              placeholder="Nome do paciente"
              className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm mb-2"
              value={paciente}
              onChange={(e) => setPaciente(e.target.value)}
            />
            <input
              type="text"
              placeholder="Endereço de entrega"
              className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm mb-2"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
            {!pagamentoJaFeito && (
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Valor"
                  className="w-1/2 rounded-full border border-gray-300 px-3 py-2 text-sm"
                  value={valorPago}
                  onChange={(e) => setValorPago(e.target.value)}
                />
                <select
                  className="w-1/2 rounded-full border border-gray-300 px-3 py-2 text-sm"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                >
                  <option value="">Pagamento</option>
                  <option value="PIX">PIX</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                </select>
              </div>
            )}
            <select
              className="w-full rounded-full border border-gray-300 px-3 py-2 text-sm mb-2"
              value={codigoEntregador}
              onChange={(e) => setCodigoEntregador(e.target.value)}
            >
              <option value="">Selecionar entregador</option>
              {usuariosEntrega.map(u => (
                <option key={u.id} value={u.codigo}>{u.nome}</option>
              ))}
            </select>
          </>
        )}

        {/* Contadores para conferência */}
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

        <style jsx>{`
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
            width: 1rem;
            text-align: center;
            font-weight: bold;
          }
        `}</style>
      </div>
    </div>
  )
}
