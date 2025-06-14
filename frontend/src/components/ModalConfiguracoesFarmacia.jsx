//frontend/src/components/ModalConfiguracoesFarmacia.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Plus, Upload,
  PackagePlus, Printer, FileCheck2,
  CircleCheckBig, Truck, PackageCheck, CreditCard
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import '../styles/global.css'

export default function ModalConfiguracoesFarmacia({ aberto, onClose, farmaciaId, emailFarmacia }) {
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [codigo, setCodigo] = useState('')
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
    if (aberto) gerarCodigo()
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
      await axios.post('https://farol-mjtt.onrender.com/usuarios', {
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
    } catch (err) {
      toast.error('Erro ao salvar usuário')
    }
  }

  const salvarLocal = async () => {
    try {
      await axios.post('https://farol-mjtt.onrender.com/locais', {
        farmacia_id: farmaciaId,
        nome: localNome,
        tipo: localTipo,
      })
      toast.success('Local salvo')
      setLocalNome('')
    } catch (err) {
      toast.error('Erro ao salvar local')
    }
  }

  const enviarLogo = async () => {
    if (!logoFile) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        await axios.put(`https://farol-mjtt.onrender.com/farmacia/logo/${farmaciaId}`, {
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

          {/* Usuários */}
          <div className="space-y-3">
            <h3 className="font-semibold">Incluir usuário</h3>
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
              <input className="input" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
              <input className="input col-span-2" disabled value={`Código gerado: ${codigo}`} />
            </div>

<div className="flex gap-4 flex-wrap justify-center">
  {Object.entries(permissoes).map(([campo, ativo]) => (
    <div
      key={campo}
      className={`icone-permissao ${ativo ? 'selecionado' : ''}`}
      onClick={() => handlePermissaoToggle(campo)}
      title={nomesPermissao[campo]} // opcional: tooltip ao passar o mouse
    >
      {iconesPermissao[campo]}
    </div>
  ))}
</div>

            <button className="btn-primary mt-3" onClick={salvarUsuario}>
              <Plus size={16} className="mr-2" />
              Salvar usuário
            </button>
          </div>

          {/* Locais */}
          <div className="space-y-3">
            <h3 className="font-semibold">Cadastrar loja ou cidade</h3>
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={localTipo} onChange={(e) => setLocalTipo(e.target.value)}>
                <option value="origem">Origem</option>
                <option value="destino">Destino</option>
              </select>
              <input
                className="input"
                placeholder="Nome"
                value={localNome}
                onChange={(e) => setLocalNome(e.target.value)}
              />
            </div>
            <button className="btn-primary mt-2" onClick={salvarLocal}>
              <Plus size={16} className="mr-2" />
              Salvar local
            </button>
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
