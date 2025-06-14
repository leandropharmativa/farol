// 📄 frontend/src/components/ModalConfiguracoesFarmacia.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Plus, Upload, Pencil, UserRoundPen, LocationEdit, Trash,
  PackagePlus, Printer, FileCheck2, CircleCheckBig, Truck, PackageCheck, CreditCard
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
  const [logo, setLogo] = useState(null)

  const [localNome, setLocalNome] = useState('')
  const [isOrigem, setIsOrigem] = useState(false)
  const [isDestino, setIsDestino] = useState(false)
  const [locais, setLocais] = useState([])
  const [editandoLocalId, setEditandoLocalId] = useState(null)

  const [permissoes, setPermissoes] = useState({
    permissao_inclusao: false,
    permissao_impressao: false,
    permissao_conferencia: false,
    permissao_producao: false,
    permissao_despacho: false,
    permissao_entrega: false,
    permissao_registrar_pagamento: false,
  })

  useEffect(() => {
    if (aberto) {
      gerarCodigo()
      carregarUsuarios()
      carregarLocais()
    }
  }, [aberto])

  const gerarCodigo = () => {
    setCodigo(Math.floor(Math.random() * 9000) + 1000)
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
    try {
      if (editandoUsuarioId) {
        await api.put(`/usuarios/${editandoUsuarioId}`, {
          nome, senha, ...permissoes
        })
        toast.success('Usuário atualizado')
      } else {
        await api.post('/usuarios', {
          farmacia_id: farmaciaId, codigo, nome, senha, ...permissoes
        })
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
        permissao_entrega: false,
        permissao_registrar_pagamento: false,
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
      permissao_entrega: usuario.permissao_entrega,
      permissao_registrar_pagamento: usuario.permissao_registrar_pagamento,
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
    try {
      if (editandoLocalId) {
        await api.put(`/locais/${editandoLocalId}`, {
          nome: localNome,
          origem: isOrigem,
          destino: isDestino
        })
        toast.success('Local atualizado')
      } else {
        await api.post('/locais', {
          farmacia_id: farmaciaId,
          nome: localNome,
          origem: isOrigem,
          destino: isDestino
        })
        toast.success('Local criado')
      }

      setLocalNome('')
      setIsOrigem(false)
      setIsDestino(false)
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

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('logo', file)

    try {
      await api.post(`/farmacia/${farmaciaId}/logo`, formData)
      toast.success('Logo atualizada com sucesso')
    } catch {
      toast.error('Erro ao enviar logo')
    }
  }

  const iconesPermissao = {
    permissao_inclusao: <PackagePlus size={18} />,
    permissao_impressao: <Printer size={18} />,
    permissao_conferencia: <FileCheck2 size={18} />,
    permissao_producao: <CircleCheckBig size={18} />,
    permissao_despacho: <Truck size={18} />,
    permissao_entrega: <PackageCheck size={18} />,
    permissao_registrar_pagamento: <CreditCard size={18} />,
  }

  const nomesPermissao = {
    permissao_inclusao: 'Inclusão',
    permissao_impressao: 'Impressão',
    permissao_conferencia: 'Conferência',
    permissao_producao: 'Produção',
    permissao_despacho: 'Despacho',
    permissao_entrega: 'Entrega',
    permissao_registrar_pagamento: 'Pagamento',
  }

  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-container animate-fade-slide overflow-y-auto max-h-[95vh]">
        <div className="sticky top-0 bg-white z-10 flex justify-end p-3 border-b">
          <button className="text-gray-500 hover:text-red-500" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="p-5 space-y-8">
          <h2 className="text-xl font-bold text-center">Configurações da Farmácia</h2>

          {/* Logo */}
          <div className="space-y-2">
            <label className="font-semibold">Logo da Farmácia</label>
            <input type="file" accept="image/*" onChange={handleLogoChange} />
          </div>

          {/* Usuário */}
          <div className="space-y-3">
            <h3 className="font-semibold">Cadastrar ou editar usuário</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
              <input className="input" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
              <input className="input col-span-2" disabled value={`Código: ${codigo}`} />
            </div>
            <div className="lista-permissoes mt-2">
              {Object.entries(permissoes).map(([campo, ativo]) => (
                <div
                  key={campo}
                  className={`icone-permissao ${ativo ? 'selecionado' : ''}`}
                  title={nomesPermissao[campo]}
                  onClick={() => handlePermissaoToggle(campo)}
                >
                  {iconesPermissao[campo]}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button className="btn-primary" onClick={salvarUsuario}>
                <Plus size={16} className="mr-2" />
                {editandoUsuarioId ? 'Atualizar usuário' : 'Salvar usuário'}
              </button>
              {editandoUsuarioId && (
                <button
                  className="btn-claro"
                  onClick={() => {
                    setNome('')
                    setSenha('')
                    setEditandoUsuarioId(null)
                    setPermissoes({
                      permissao_inclusao: false,
                      permissao_impressao: false,
                      permissao_conferencia: false,
                      permissao_producao: false,
                      permissao_despacho: false,
                      permissao_entrega: false,
                      permissao_registrar_pagamento: false,
                    })
                  }}
                >
                  Cancelar edição
                </button>
              )}
            </div>

<ul className="mt-4 space-y-1 text-sm">
  {usuarios.map(u => (
    <li key={u.id} className="flex items-center gap-2">
      <span>{u.nome}</span>
      <button onClick={() => editarUsuario(u)} className="text-blue-600 hover:text-blue-800">
        <UserRoundPen size={16} />
      </button>
      <button onClick={() => excluirUsuario(u.id)} className="text-red-600 hover:text-red-800">
        <Trash size={16} />
      </button>
    </li>
  ))}
</ul>

          </div>

          {/* Locais */}
          <div className="space-y-3">
            <h3 className="font-semibold">Cadastrar ou editar loja/cidade</h3>
            <input
              className="input"
              placeholder="Nome do local"
              value={localNome}
              onChange={(e) => setLocalNome(e.target.value)}
            />
            <div className="flex gap-4">
              <label><input type="checkbox" checked={isOrigem} onChange={(e) => setIsOrigem(e.target.checked)} /> <span className="ml-1">Origem</span></label>
              <label><input type="checkbox" checked={isDestino} onChange={(e) => setIsDestino(e.target.checked)} /> <span className="ml-1">Destino</span></label>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="btn-primary" onClick={salvarLocal}>
                <Plus size={16} className="mr-2" />
                {editandoLocalId ? 'Atualizar local' : 'Salvar local'}
              </button>
              {editandoLocalId && (
                <button
                  className="btn-claro"
                  onClick={() => {
                    setLocalNome('')
                    setIsOrigem(false)
                    setIsDestino(false)
                    setEditandoLocalId(null)
                  }}
                >
                  Cancelar edição
                </button>
              )}
            </div>

<ul className="mt-4 space-y-1 text-sm">
  {locais.map(l => (
    <li key={l.id} className="flex items-center gap-2">
      <span>
        {l.nome} ({l.origem ? 'Origem' : ''}{l.origem && l.destino ? ' / ' : ''}{l.destino ? 'Destino' : ''})
      </span>
      <button onClick={() => editarLocal(l)} className="text-blue-600 hover:text-blue-800">
        <LocationEdit size={16} />
      </button>
      <button onClick={() => excluirLocal(l.id)} className="text-red-600 hover:text-red-800">
        <Trash size={16} />
      </button>
    </li>
  ))}
</ul>

          </div>
        </div>
      </div>
    </div>,
    modalRoot
  )
}
