// 📄 frontend/src/components/ModalConfiguracoesFarmacia.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Plus, Upload,
  PackagePlus, Printer, FileCheck2,
  CircleCheckBig, Truck, PackageCheck, CreditCard,
  Pencil, Trash2
} from 'lucide-react'
import api from '../services/api'
import { toast } from 'react-toastify'
import '../styles/global.css'

export default function ModalConfiguracoesFarmacia({ aberto, onClose, farmaciaId, emailFarmacia }) {
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [codigo, setCodigo] = useState('')
  const [usuarios, setUsuarios] = useState([])
  const [locais, setLocais] = useState([])
  const [permissoes, setPermissoes] = useState({
    permissao_inclusao: false,
    permissao_impressao: false,
    permissao_conferencia: false,
    permissao_producao: false,
    permissao_despacho: false,
    permissao_entrega: false,
    permissao_registrar_pagamento: false,
  })
  const [localNome, setLocalNome] = useState('')
  const [localTipo, setLocalTipo] = useState('origem')
  const [logoFile, setLogoFile] = useState(null)

  useEffect(() => {
    if (aberto) {
      gerarCodigo()
      carregarUsuarios()
      carregarLocais()
    }
  }, [aberto])

  const gerarCodigo = () => {
    const aleatorio = Math.floor(Math.random() * 9000) + 1000
    setCodigo(aleatorio)
  }

  const handlePermissaoToggle = (campo) => {
    setPermissoes((prev) => ({ ...prev, [campo]: !prev[campo] }))
  }

  const salvarUsuario = async () => {
    try {
      await api.post('/usuarios', {
        farmacia_id: farmaciaId,
        codigo,
        nome,
        senha,
        ...permissoes,
      })
      toast.success('Usuário salvo com sucesso')
      setNome('')
      setSenha('')
      gerarCodigo()
      setPermissoes({
        permissao_inclusao: false,
        permissao_impressao: false,
        permissao_conferencia: false,
        permissao_producao: false,
        permissao_despacho: false,
        permissao_entrega: false,
        permissao_registrar_pagamento: false,
      })
      carregarUsuarios()
    } catch (err) {
      toast.error('Erro ao salvar usuário')
    }
  }

  const carregarUsuarios = async () => {
    try {
      const res = await api.get(`/usuarios/${farmaciaId}`)
      setUsuarios(res.data)
    } catch (err) {
      toast.error('Erro ao carregar usuários')
    }
  }

  const salvarLocal = async () => {
    try {
      await api.post('/locais', {
        farmacia_id: farmaciaId,
        nome: localNome,
        tipo: localTipo,
      })
      toast.success('Local salvo')
      setLocalNome('')
      carregarLocais()
    } catch (err) {
      toast.error('Erro ao salvar local')
    }
  }

  const carregarLocais = async () => {
    try {
      const res = await api.get(`/locais/${farmaciaId}`)
      setLocais(res.data)
    } catch (err) {
      toast.error('Erro ao carregar locais')
    }
  }

  const enviarLogo = async () => {
    if (!logoFile) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        await api.put(`/farmacia/logo/${farmaciaId}`, {
          logo_url: reader.result,
        })
        toast.success('Logo enviada com sucesso')
      } catch (err) {
        toast.error('Erro ao enviar logo')
      }
    }
    reader.readAsDataURL(logoFile)
  }

  if (!aberto) return null
  const modalRoot = document.getElementById('modal-root')
  if (!modalRoot) return null

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

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-container animate-fade-slide">
        <div className="sticky top-0 bg-white z-10 flex justify-end p-3 border-b">
          <button className="text-gray-500 hover:text-red-500" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="p-5 space-y-8">
          <h2 className="text-xl font-bold text-center">Configurações da Farmácia</h2>

          {/* Cadastro de usuário */}
          <div className="space-y-3">
            <h3 className="font-semibold">Incluir usuário</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
              <input className="input" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
              <input className="input col-span-2" disabled value={`Código gerado: ${codigo}`} />
            </div>
            <div className="lista-permissoes">
              {Object.entries(permissoes).map(([campo, ativo]) => (
                <div
                  key={campo}
                  className={`icone-permissao ${ativo ? 'selecionado' : ''}`}
                  onClick={() => handlePermissaoToggle(campo)}
                  title={nomesPermissao[campo]}
                >
                  {iconesPermissao[campo]}
                </div>
              ))}
            </div>
            <button className="btn-primary mt-3" onClick={salvarUsuario}>
              <Plus size={16} className="mr-2" />
              Salvar usuário
            </button>

            {/* Lista de usuários */}
            <div className="pt-4">
              <h4 className="font-medium">Usuários cadastrados</h4>
              <ul className="divide-y border rounded mt-1">
                {usuarios.map((u) => (
                  <li key={u.id} className="flex items-center justify-between p-2 text-sm">
                    <span>{u.nome}</span>
                    <Pencil size={16} className="text-gray-500 hover:text-blue-500 cursor-pointer" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Locais */}
          <div className="space-y-3">
            <h3 className="font-semibold">Cadastrar loja ou cidade</h3>
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={localTipo} onChange={(e) => setLocalTipo(e.target.value)}>
                <option value="origem">Origem</option>
                <option value="destino">Destino</option>
              </select>
              <input className="input" placeholder="Nome" value={localNome} onChange={(e) => setLocalNome(e.target.value)} />
            </div>
            <button className="btn-primary mt-2" onClick={salvarLocal}>
              <Plus size={16} className="mr-2" />
              Salvar local
            </button>
            <ul className="divide-y border rounded mt-2">
              {locais.map((l) => (
                <li key={l.id} className="flex items-center justify-between p-2 text-sm">
                  <span>{l.nome} <span className="text-xs text-gray-500 ml-2">({l.tipo})</span></span>
                  <Pencil size={16} className="text-gray-500 hover:text-blue-500 cursor-pointer" />
                </li>
              ))}
            </ul>
          </div>

          {/* Logo */}
          <div className="space-y-3">
            <h3 className="font-semibold">Enviar logo (.png)</h3>
            <input type="file" accept=".png" onChange={(e) => setLogoFile(e.target.files[0])} />
            <button className="btn-primary mt-2" onClick={enviarLogo}>
              <Upload size={16} className="mr-2" />
              Enviar logo
            </button>
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  )
}
