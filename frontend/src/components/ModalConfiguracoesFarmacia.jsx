// frontend/src/components/ModalConfiguracoesFarmacia.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Plus, UserRoundPen, LocationEdit, Trash, Handshake,
  PackagePlus, Printer, FileCheck2, CircleCheckBig, Truck, PackageCheck, CreditCard,
  UserPlus, Save, CircleX, MapPinPlus, Bike
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
    permissao_inclusao: <PackagePlus size={18} />,
    permissao_impressao: <Printer size={18} />,
    permissao_conferencia: <FileCheck2 size={18} />,
    permissao_producao: <CircleCheckBig size={18} />,
    permissao_despacho: <Truck size={18} />,
    permissao_recebimento: <Handshake size={18} />,
    permissao_entrega: <PackageCheck size={18} />,
    permissao_registrar_pagamento: <CreditCard size={18} />,
    entregador: <Bike size={18} />,
  }

  const nomesPermissao = {
    permissao_inclusao: 'Inclusão',
    permissao_impressao: 'Impressão',
    permissao_conferencia: 'Conferência',
    permissao_producao: 'Produção',
    permissao_despacho: 'Despacho',
    permissao_recebimento: 'Recebimento',
    permissao_entrega: 'Entrega',
    permissao_registrar_pagamento: 'Pagamento',
    entregador: 'Entregador',
  }

  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-container animate-fade-slide max-w-[680px]">
        <button className="btn-fechar" onClick={onClose}><X /></button>

        {/* Usuários */}
        <div>
          <h3 className="flex items-center gap-2 mb-2">
            Cadastrar ou editar usuário
            <button className="btn-config" onClick={salvarUsuario} title={editandoUsuarioId ? 'Salvar' : 'Criar'}>
              {editandoUsuarioId ? <Save size={20} /> : <UserPlus size={20} />}
            </button>
            {editandoUsuarioId && (
              <button className="btn-config" onClick={() => {
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
                <CircleX size={20} />
              </button>
            )}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <input className="input-config" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
            <input className="input-config" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
            <input className="input-config col-span-2" disabled value={`Código: ${codigo}`} />
          </div>

          <div className="lista-permissoes mt-2">
            {Object.entries(permissoes).map(([campo, ativo]) => (
              <div key={campo} className={`icone-permissao ${ativo ? 'selecionado' : ''}`} title={nomesPermissao[campo]} onClick={() => handlePermissaoToggle(campo)}>
                {iconesPermissao[campo]}
              </div>
            ))}
          </div>

          <button className="text-sm text-blue-600 mt-2 underline" onClick={() => setMostrarUsuarios(v => !v)}>
            {mostrarUsuarios ? 'Ocultar usuários' : 'Mostrar usuários'}
          </button>
          {mostrarUsuarios && (
            <ul className="mt-3 space-y-1 text-sm max-h-[160px] overflow-y-auto pr-2">
              {usuarios.map(u => (
                <li key={u.id} className="flex items-center gap-2">
                  <span>{u.nome} (código: {u.codigo})</span>
                  {!editandoUsuarioId && <button onClick={() => editarUsuario(u)} className="text-blue-600 hover:text-blue-800"><UserRoundPen size={16} /></button>}
                  {!editandoUsuarioId && <button onClick={() => excluirUsuario(u.id)} className="text-red-600 hover:text-red-800"><Trash size={16} /></button>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <hr className="my-3 border-t border-gray-300" />

        {/* Locais */}
        <div>
          <h3 className="flex items-center gap-2 mb-2">
            Cadastrar ou editar loja/cidade
            <button className="btn-config" onClick={salvarLocal} title={editandoLocalId ? 'Salvar' : 'Criar'}>
              {editandoLocalId ? <Save size={20} /> : <MapPinPlus size={20} />}
            </button>
            {editandoLocalId && (
              <button className="btn-config" onClick={() => {
                setLocalNome('')
                setIsOrigem(false)
                setIsDestino(false)
                setResidencia(false)
                setEditandoLocalId(null)
              }} title="Cancelar edição">
                <CircleX size={20} />
              </button>
            )}
          </h3>

          <input className="input-config" placeholder="Nome do local" value={localNome} onChange={(e) => setLocalNome(e.target.value)} />
          <div className="flex gap-4 mt-2 text-sm">
            <label><input type="checkbox" checked={isOrigem} onChange={(e) => setIsOrigem(e.target.checked)} /> Origem</label>
            <label><input type="checkbox" checked={isDestino} onChange={(e) => setIsDestino(e.target.checked)} /> Destino</label>
            <label><input type="checkbox" checked={residencia} onChange={(e) => setResidencia(e.target.checked)} /> Entrega domiciliar</label>
          </div>

          <button className="text-sm text-blue-600 mt-2 underline" onClick={() => setMostrarLocais(v => !v)}>
            {mostrarLocais ? 'Ocultar locais' : 'Mostrar locais'}
          </button>
          {mostrarLocais && (
            <ul className="mt-3 space-y-1 text-sm max-h-[160px] overflow-y-auto pr-2">
              {locais.map(l => (
                <li key={l.id} className="flex items-center gap-2">
                  <span>
                    {l.nome} (
                    {l.origem ? 'Origem' : ''}
                    {l.origem && l.destino ? ' / ' : ''}
                    {l.destino ? 'Destino' : ''}
                    {(l.origem || l.destino) && l.residencia ? ' / ' : ''}
                    {l.residencia ? 'Residência' : ''}
                    )
                  </span>
                  {!editandoLocalId && <button onClick={() => editarLocal(l)} className="text-blue-600 hover:text-blue-800"><LocationEdit size={16} /></button>}
                  {!editandoLocalId && <button onClick={() => excluirLocal(l.id)} className="text-red-600 hover:text-red-800"><Trash size={16} /></button>}
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
