// frontend/src/components/PainelPedidosFarmacia.jsx
import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import {
  User, CalendarClock, MapPin, MapPinned, PillBottle, MapPinHouse,
  PackagePlus, Printer, FileCheck2, CircleCheckBig, Truck, PackageCheck, CreditCard, FileText
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
      const hoje = new Date().toISOString().slice(0, 10)
      const pedidosDoDia = res.data.filter(p => {
        const dataCriacao = p.data_criacao?.slice(0, 10)
        return dataCriacao === hoje
      })
      setPedidos(pedidosDoDia)
    } catch (err) {
      toast.error('Erro ao carregar pedidos')
    }
  }

  const etapas = [
    { campo: 'status_inclusao', nome: 'Inclusão', icone: PackagePlus },
    { campo: 'status_impressao', nome: 'Impressão', icone: Printer },
    { campo: 'status_conferencia', nome: 'Conferência', icone: FileCheck2 },
    { campo: 'status_producao', nome: 'Produção', icone: CircleCheckBig },
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
    if (farmaciaId) {
      console.log('📦 Farmacia ID:', farmaciaId)
      carregarPedidos()
    }
  }, [farmaciaId])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pedidos do dia</h2>

      <div className="space-y-2">
        {pedidos.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow px-4 py-3 border border-gray-200">
            <div className="pedido-linha justify-between">
              <div className="flex flex-wrap gap-4 flex-1">
                <div className="pedido-info"><PillBottle size={16} /><span>{p.registro}</span></div>
                <div className="pedido-info"><User size={16} /><span>{p.atendente}</span></div>
                <div className="pedido-info"><MapPinHouse size={16} /><span>{p.origem_nome || p.origem?.nome || 'Origem não informada'}</span></div>
                <div className="pedido-info"><MapPinned size={16} /><span>{p.destino_nome || p.destino?.nome || 'Destino não informada'}</span></div>
                <div className="pedido-info"><CalendarClock size={16} /><span>{new Date(p.previsao_entrega).toLocaleString()}</span></div>
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

              <div className="pedido-etapas">
                {etapas.map(et => {
                  const Icone = et.icone
                  const ativo = p[et.campo]
                  return (
                    <button
                      key={et.campo}
                      onClick={() => !ativo && solicitarConfirmacao(p.id, et.nome)}
                      className={`rounded-full p-1 ${
                        ativo
                          ? 'text-green-600'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                      title={et.nome}
                    >
                      <Icone size={18} />
                    </button>
                  )
                })}
              </div>
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
