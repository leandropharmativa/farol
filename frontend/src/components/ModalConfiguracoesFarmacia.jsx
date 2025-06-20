// frontend/src/components/ModalConfiguracoesFarmacia.jsx
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, UserRoundPen, LocationEdit, Trash, Handshake, PackagePlus, Printer,
  FileCheck2, CircleCheckBig, Truck, PackageCheck, CreditCard, UserPlus, Save,
  CircleX, MapPinPlus, Bike, MapPin, MapPinCheck, MapPinHouse, UserSearch, Pin, Settings
} from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/global.css'

export default function ModalConfiguracoesFarmacia({ aberto, onClose, farmaciaId }) {
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [editandoUsuarioId, setEditandoUsuarioId] = useState(null)

  const [localNome, setLocalNome] = useState('')
  const [isOrigem, setIsOrigem] = useState(false)
  const [isDestino, setIsDestino] = useState(false)
  const [residencia, setResidencia] = useState(false)
  const [locais, setLocais] = useState([])
  const [editandoLocalId, setEditandoLocalId] = useState(null)

  const [mostrarUsuarios, setMostrarUsuarios] = useState(false)
  const [mostrarLocais, setMostrarLocais] = useState(false)

  const [permissoes, setPermissoes] = useState({
    permissao_inclusao: false,
    permissao_impressao: false,
    permissao_conferencia: false,
    permissao_producao: false,
    permissao_despacho: false,
    permissao_recebimento: false,
    permissao_entrega: false,
    permissao_registrar_pagamento: false,
    entregador: false,
  })

  useEffect(() => {
    if (aberto) {
      gerarCodigo()
      carregarUsuarios()
      carregarLocais()
    }
  }, [aberto])

  const gerarCodigo = async () => {
    try {
      const res = await api.get(`/usuarios/proximo_codigo/${farmaciaId}`)
      setCodigo(res.data.proximo)
    } catch {
      toast.error('Erro ao gerar código')
    }
  }

  const carregarUsuarios = async () => {
    try {
      const res = await api.get(`/usuarios/${farmaciaId}`)
      setUsuarios(res.data)
    } catch {
      toast.error('Erro ao carregar usuários')
    }
  }

  const carregarLocais = async () => {
    try {
      const res = await api.get(`/locais/${farmaciaId}`)
      setLocais(res.data)
    } catch {
      toast.error('Erro ao carregar locais')
    }
  }

  const handlePermissaoToggle = (campo) => {
    setPermissoes(prev => ({ ...prev, [campo]: !prev[campo] }))
  }

  const iconesPermissao = {
    permissao_inclusao: <PackagePlus size={18} />, permissao_impressao: <Printer size={18} />, permissao_conferencia: <FileCheck2 size={18} />, permissao_producao: <CircleCheckBig size={18} />, permissao_despacho: <Truck size={18} />, permissao_recebimento: <Handshake size={18} />, permissao_entrega: <PackageCheck size={18} />, permissao_registrar_pagamento: <CreditCard size={18} />, entregador: <Bike size={18} />
  }

  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return createPortal(
    <div className="modal-overlay right-align">
      <div className="modal-despacho-massa animate-fadeIn overflow-y-auto max-h-[90vh] p-6">
        <button className="btn-config2 absolute top-2 right-2" onClick={onClose}><X size={20} /></button>

        <h3 className="text-white font-bold text-lg mb-2 mt-0 flex items-center gap-2">
          <Settings size={18} className="text-white" /> Configurações da farmácia
        </h3>

        {/* USUÁRIO */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input className="modal-novo-pedido-input" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
            <input className="modal-novo-pedido-input" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
            <input className="modal-novo-pedido-input col-span-2" disabled value={`Código: ${codigo}`} />
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {Object.entries(permissoes).map(([campo, ativo]) => (
              <div key={campo}
                className={`rounded-full p-2 cursor-pointer flex items-center justify-center 
                  ${ativo ? 'bg-white text-white' : 'bg-farol-primaryfocus text-white/40'}`}
                onClick={() => handlePermissaoToggle(campo)}
              >
                {iconesPermissao[campo]}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            <button className="btn-config2 ml-auto" onClick={() => setMostrarUsuarios(!mostrarUsuarios)} title="Mostrar usuários"><UserSearch size={18} /></button>
            {!editandoUsuarioId && <button className="btn-config2" onClick={salvarUsuario} title="Novo usuário"><UserPlus size={18} /></button>}
            {editandoUsuarioId && (
              <>
                <button className="btn-config2" onClick={salvarUsuario} title="Salvar usuário"><Save size={18} /></button>
                <button className="btn-config2" onClick={() => {
                  setNome('')
                  setSenha('')
                  setEditandoUsuarioId(null)
                  setPermissoes({
                    permissao_inclusao: false,
                    permissao_impressao: false,
                    permissao_conferencia: false,
                    permissao_producao: false,
                    permissao_despacho: false,
                    permissao_recebimento: false,
                    permissao_entrega: false,
                    permissao_registrar_pagamento: false,
                    entregador: false,
                  })
                }} title="Cancelar edição">
                  <CircleX size={18} />
                </button>
              </>
            )}
          </div>

          {mostrarUsuarios && (
            <ul className="text-white text-sm space-y-1 mt-2">
              {usuarios.map(u => (
                <li key={u.id} className="flex items-center gap-2">
                  <span>{u.nome} (código: {u.codigo})</span>
                  <button onClick={() => editarUsuario(u)} className="text-white hover:text-blue-300"><UserRoundPen size={16} /></button>
                  <button onClick={() => excluirUsuario(u.id)} className="text-white hover:text-red-300"><Trash size={16} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* LOCAIS */}
        <div>
          <input className="modal-novo-pedido-input mb-2" placeholder="Nome do local" value={localNome} onChange={(e) => setLocalNome(e.target.value)} />

          <div className="flex flex-wrap gap-2 mb-2">
            <div onClick={() => setIsOrigem(!isOrigem)} className={`rounded-full p-2 cursor-pointer flex items-center justify-center ${isOrigem ? 'bg-white text-white' : 'bg-farol-primaryfocus text-white/40'}`}><MapPin size={16} /></div>
            <div onClick={() => setIsDestino(!isDestino)} className={`rounded-full p-2 cursor-pointer flex items-center justify-center ${isDestino ? 'bg-white text-white' : 'bg-farol-primaryfocus text-white/40'}`}><MapPinCheck size={16} /></div>
            <div onClick={() => setResidencia(!residencia)} className={`rounded-full p-2 cursor-pointer flex items-center justify-center ${residencia ? 'bg-white text-white' : 'bg-farol-primaryfocus text-white/40'}`}><MapPinHouse size={16} /></div>
          </div>

          <div className="flex gap-2 mb-2">
            <button className="btn-config2 ml-auto" onClick={() => setMostrarLocais(!mostrarLocais)} title="Mostrar locais"><Pin size={18} /></button>
            {!editandoLocalId && <button className="btn-config2" onClick={salvarLocal} title="Novo local"><MapPinPlus size={18} /></button>}
            {editandoLocalId && (
              <>
                <button className="btn-config2" onClick={salvarLocal} title="Salvar local"><Save size={18} /></button>
                <button className="btn-config2" onClick={() => {
                  setLocalNome('')
                  setIsOrigem(false)
                  setIsDestino(false)
                  setResidencia(false)
                  setEditandoLocalId(null)
                }} title="Cancelar edição">
                  <CircleX size={18} />
                </button>
              </>
            )}
          </div>

          {mostrarLocais && (
            <ul className="text-white text-sm space-y-1 mt-2">
              {locais.map(l => (
                <li key={l.id} className="flex items-center gap-2">
                  <span>
                    {l.nome} (
                    {l.origem ? 'Origem' : ''}
                    {l.origem && l.destino ? ' / ' : ''}
                    {l.destino ? 'Destino' : ''}
                    {(l.origem || l.destino) && l.residencia ? ' / ' : ''}
                    {l.residencia ? 'Domicílio' : ''}
                    )
                  </span>
                  <button onClick={() => editarLocal(l)} className="text-white hover:text-blue-300"><LocationEdit size={16} /></button>
                  <button onClick={() => excluirLocal(l.id)} className="text-white hover:text-red-300"><Trash size={16} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    modalRoot
  )
}
