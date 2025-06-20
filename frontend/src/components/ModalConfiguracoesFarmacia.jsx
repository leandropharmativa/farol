// frontend/src/components/ModalConfiguracoesFarmacia.jsx
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, UserRoundPen, LocationEdit, Trash, Handshake, PackagePlus, Printer, Settings, UserRoundMinus,
  FileCheck2, CircleCheckBig, Truck, PackageCheck, CreditCard, UserPlus, Save, UserRoundPlus, 
  CircleX, MapPinPlus, Bike, MapPin, MapPinCheck, MapPinHouse, UserSearch, Pin, SquareX, MapPinMinus
} from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/global.css'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css' // obrigatório – base
import 'tippy.js/themes/light.css'       // para theme="light"
import 'tippy.js/themes/light-border.css' // para theme="light-border"
import 'tippy.js/themes/material.css' 

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

  const salvarUsuario = async () => {
    if (!nome.trim() || !senha.trim()) {
      toast.warning('Preencha todos os campos para salvar o usuário')
      return
    }
    try {
      if (editandoUsuarioId) {
        await api.put(`/usuarios/${editandoUsuarioId}`, { nome, senha, ...permissoes })
        toast.success('Usuário atualizado')
      } else {
        await api.post('/usuarios', { farmacia_id: farmaciaId, codigo, nome, senha, ...permissoes })
        toast.success('Usuário criado')
      }
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
      gerarCodigo()
      carregarUsuarios()
    } catch {
      toast.error('Erro ao salvar usuário')
    }
  }

  const editarUsuario = (usuario) => {
    setNome(usuario.nome)
    setSenha(usuario.senha)
    setEditandoUsuarioId(usuario.id)
    setPermissoes({
      permissao_inclusao: usuario.permissao_inclusao,
      permissao_impressao: usuario.permissao_impressao,
      permissao_conferencia: usuario.permissao_conferencia,
      permissao_producao: usuario.permissao_producao,
      permissao_despacho: usuario.permissao_despacho,
      permissao_recebimento: usuario.permissao_recebimento,
      permissao_entrega: usuario.permissao_entrega,
      permissao_registrar_pagamento: usuario.permissao_registrar_pagamento,
      entregador: usuario.entregador,
    })
  }

  const excluirUsuario = async (id) => {
    try {
      await api.delete(`/usuarios/${id}`)
      toast.success('Usuário excluído')
      carregarUsuarios()
    } catch {
      toast.error('Erro ao excluir usuário')
    }
  }

  const salvarLocal = async () => {
    if (!localNome.trim()) {
      toast.warning('Informe o nome do local')
      return
    }
    try {
      if (editandoLocalId) {
        await api.put(`/locais/${editandoLocalId}`, {
          nome: localNome,
          origem: isOrigem,
          destino: isDestino,
          residencia
        })
        toast.success('Local atualizado')
      } else {
        await api.post('/locais', {
          farmacia_id: farmaciaId,
          nome: localNome,
          origem: isOrigem,
          destino: isDestino,
          residencia
        })
        toast.success('Local criado')
      }
      setLocalNome('')
      setIsOrigem(false)
      setIsDestino(false)
      setResidencia(false)
      setEditandoLocalId(null)
      carregarLocais()
    } catch {
      toast.error('Erro ao salvar local')
    }
  }

  const editarLocal = (local) => {
    setLocalNome(local.nome)
    setIsOrigem(local.origem)
    setIsDestino(local.destino)
    setResidencia(local.residencia || false)
    setEditandoLocalId(local.id)
  }

  const excluirLocal = async (id) => {
    try {
      await api.delete(`/locais/${id}`)
      toast.success('Local excluído')
      carregarLocais()
    } catch {
      toast.error('Erro ao excluir local')
    }
  }

  const iconesPermissao = {
    permissao_inclusao: <PackagePlus size={18} />, permissao_impressao: <Printer size={18} />, permissao_conferencia: <FileCheck2 size={18} />, permissao_producao: <CircleCheckBig size={18} />, permissao_despacho: <Truck size={18} />, permissao_recebimento: <Handshake size={18} />, permissao_entrega: <PackageCheck size={18} />, permissao_registrar_pagamento: <CreditCard size={18} />, entregador: <Bike size={18} />
  }

  const nomesPermissao = {
    permissao_inclusao: 'Inclusão', permissao_impressao: 'Impressão', permissao_conferencia: 'Conferência', permissao_producao: 'Produção', permissao_despacho: 'Despacho', permissao_recebimento: 'Recebimento', permissao_entrega: 'Entrega', permissao_registrar_pagamento: 'Pagamento', entregador: 'Entregador'
  }

  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  function IconeComTippy({ children, conteudo, onClick }) {
  return (
    <Tippy
      theme="light-border"
      placement="bottom-start"
      animation="text"
      delay={[0, 100]}
      duration={[150, 100]}
      interactive={false}
      appendTo={document.body}
      render={() => (
        <div className="bg-white text-[12px] text-farol-secondary rounded shadow px-2 py-1">
          {conteudo}
        </div>
      )}
    >
      <div
        className="rounded-full p-2 text-sm cursor-pointer flex items-center justify-center"
        onClick={onClick}
      >
        {children}
      </div>
    </Tippy>
  )
}

  const handleFecharModal = () => {
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
  setMostrarUsuarios(false)
  setMostrarLocais(false)
  setLocalNome('')
  setIsOrigem(false)
  setIsDestino(false)
  setResidencia(false)
  setEditandoLocalId(null)
  onClose()
}

return createPortal(
  <div className="modal-overlay right-align z-50">
    <div className="modal-despacho-massa animate-fadeIn overflow-y-auto max-h-[90vh] p-6">

      <h3 className="text-white font-bold text-lg mb-2 mt-0 flex items-center gap-2">
        <Settings size={20} /> Configurações da farmácia
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
    <Tippy
      key={campo}
      content={<span className="text-[12px] text-farol-secondary">{nomesPermissao[campo]}</span>}
      theme="light-border"
      placement="bottom-start"
      animation="text"
      delay={[0, 100]}
      duration={[150, 100]}
      appendTo={document.body}
    >
      <div
        className="rounded-full p-2 text-sm cursor-pointer flex items-center justify-center"
        onClick={() => handlePermissaoToggle(campo)}
      >
        {React.cloneElement(iconesPermissao[campo], {
          className: ativo ? 'text-white' : 'text-farol-primaryfocus',
        })}
      </div>
    </Tippy>
  ))}
</div>
        <div className="flex gap-2 mb-2">
          <button
            className="btn-config2 ml-auto"
            onClick={() => {
              setMostrarUsuarios(!mostrarUsuarios)
              setMostrarLocais(false)
            }}
            title="Mostrar usuários"
          >
            <UserSearch size={18} />
          </button>
          {!editandoUsuarioId ? (
            <button className="btn-config2" onClick={salvarUsuario} title="Novo usuário">
              <UserPlus size={18} />
            </button>
          ) : (
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
                <button onClick={() => editarUsuario(u)} className="text-white hover:text-blue-300"><UserRoundPen size={16} /></button>
                <button onClick={() => excluirUsuario(u.id)} className="text-white hover:text-red-300"><UserRoundMinus size={16} /></button>
                <span>{u.codigo} - {u.nome}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* LOCAIS */}
      <div>
        <input className="modal-novo-pedido-input mb-2" placeholder="Nome do local" value={localNome} onChange={(e) => setLocalNome(e.target.value)} />

<div className="flex flex-wrap gap-2 mb-2">
  <Tippy
    content={<span className="text-[12px] text-farol-secondary">Origem</span>}
    theme="light-border"
    animation="text"
    placement="bottom-start"
    delay={[0, 100]}
    duration={[150, 100]}
  >
    <div onClick={() => setIsOrigem(!isOrigem)} className="cursor-pointer">
      <MapPin size={18} className={isOrigem ? 'text-white' : 'text-farol-primaryfocus'} />
    </div>
  </Tippy>

  <Tippy
    content={<span className="text-[12px] text-farol-secondary">Destino</span>}
    theme="light-border"
    animation="text"
    placement="bottom-start"
    delay={[0, 100]}
    duration={[150, 100]}
  >
    <div onClick={() => setIsDestino(!isDestino)} className="cursor-pointer">
      <MapPinCheck size={18} className={isDestino ? 'text-white' : 'text-farol-primaryfocus'} />
    </div>
  </Tippy>

  <Tippy
    content={<span className="text-[12px] text-farol-secondary">Residência</span>}
    theme="light-border"
    animation="text"
    placement="bottom-start"
    delay={[0, 100]}
    duration={[150, 100]}
  >
    <div onClick={() => setResidencia(!residencia)} className="cursor-pointer">
      <MapPinHouse size={18} className={residencia ? 'text-white' : 'text-farol-primaryfocus'} />
    </div>
  </Tippy>
</div>

        <div className="flex gap-2 mb-2">
          <button
            className="btn-config2 ml-auto"
            onClick={() => {
              setMostrarLocais(!mostrarLocais)
              setMostrarUsuarios(false)
            }}
            title="Mostrar locais"
          >
            <Pin size={18} />
          </button>
          {!editandoLocalId ? (
            <button className="btn-config2" onClick={salvarLocal} title="Novo local">
              <MapPinPlus size={18} />
            </button>
          ) : (
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
                <button onClick={() => editarLocal(l)} className="text-white hover:text-blue-300"><LocationEdit size={16} /></button>
                <button onClick={() => excluirLocal(l.id)} className="text-white hover:text-red-300"><MapPinMinus size={16} /></button>
                <span className="flex items-center gap-1">
                  {l.nome}
                  {l.origem && <MapPin size={14} />}
                  {l.destino && <MapPinCheck size={14} />}
                  {l.residencia && <MapPinHouse size={14} />}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fechar modal */}
      <hr className="border-white/30 my-4" />
      <div className="flex justify-end">
        <button className="btn-config2" onClick={handleFecharModal} title="Fechar">
          <SquareX size={20} />
        </button>
      </div>

    </div>
  </div>,
  modalRoot
)
}
