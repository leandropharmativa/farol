//frontend/src/components/PainelPedidosFarmacia.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
  CircleDot, CircleCheckBig,
  ClipboardList, FlaskConical, Truck, PackageCheck, CreditCard, FileText
} from 'lucide-react'
import ModalConfirmacao from './ModalConfirmacao'

export default function PainelPedidosFarmacia({ farmaciaId, usuarioLogado }) {
  const [pedidos, setPedidos] = useState([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null)
  const [etapaSelecionada, setEtapaSelecionada] = useState('')
  const [abrirModal, setAbrirModal] = useState(false)

  const carregarPedidos = async () => {
    try {
      const res = await api.get('/pedidos/listar', {
        params: { farmacia_id: farmaciaId }
      })
      setPedidos(res.data)
    } catch (err) {
      toast.error('Erro ao carregar pedidos')
    }
  }

  const etapas = [
    { campo: 'status_inclusao', nome: 'Inclusão', icone: ClipboardList },
    { campo: 'status_producao', nome: 'Produção', icone: FlaskConical },
    { campo: 'status_despacho', nome: 'Despacho', icone: Truck },
    { campo: 'status_entrega', nome: 'Entrega', icone: PackageCheck },
    { campo: 'status_pagamento', nome: 'Pagamento', icone: CreditCard }
  ]

  const solicitarConfirmacao = (pedidoId, etapa) => {
    setPedidoSelecionado(pedidoId)
    setEtapaSelecionada(etapa)
    setAbrirModal(true)
  }

  const confirmarEtapa = async (codigoConfirmacao, observacao = '') => {
    try {
      const res = await api.post(`/pedidos/${pedidoSelecionado}/registrar-etapa`, {
        etapa: etapaSelecionada,
        usuario_logado_id: usuarioLogado.id,
        codigo_confirmacao: codigoConfirmacao,
        observacao
      })

      toast.success(res.data.mensagem)
      setAbrirModal(false)
      carregarPedidos()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao registrar etapa')
    }
  }

  useEffect(() => {
    if (farmaciaId) carregarPedidos()
  }, [farmaciaId])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pedidos do dia</h2>

      <div className="space-y-2">
        {pedidos.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center gap-4 border border-gray-200">
            <div className="flex-1">
              <div><span className="font-semibold">Registro:</span> {p.registro}</div>
              <div><span className="font-semibold">Atendente:</span> {p.atendente}</div>
              <div><span className="font-semibold">Previsão:</span> {new Date(p.previsao_entrega).toLocaleString()}</div>
              <div className="text-sm text-gray-500 flex gap-2 mt-1">
                {p.receita_arquivo && (
                  <a
                    href={`https://farol-mjtt.onrender.com/receitas/${p.receita_arquivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline inline-flex items-center gap-1"
                  >
                    <FileText size={16} />
                    Receita
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {etapas.map(et => {
                const Icone = et.icone
                const ativo = p[et.campo]
                return (
                  <button
                    key={et.campo}
                    onClick={() => !ativo && solicitarConfirmacao(p.id, et.nome)}
                    className={`rounded-full p-2 border ${
                      ativo
                        ? 'bg-green-100 text-green-600 border-green-300'
                        : 'bg-red-100 text-red-600 border-red-300 hover:bg-red-200'
                    }`}
                    title={et.nome}
                  >
                    <Icone size={20} />
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {abrirModal && (
        <ModalConfirmacao
          titulo={`Confirmar etapa "${etapaSelecionada}"`}
          onConfirmar={confirmarEtapa}
          onCancelar={() => setAbrirModal(false)}
        />
      )}
    </div>
  )
}
