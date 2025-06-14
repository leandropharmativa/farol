// 📄 ModalConfiguracoesFarmacia.jsx
import { useState, useEffect } from 'react'
import {
  UserPlus, X, MapPin, Trash, UserPen, Plus, Upload
} from 'lucide-react'
import api from '../services/api'

export default function ModalConfiguracoesFarmacia({ farmacia, onClose }) {
  const [logo, setLogo] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [locais, setLocais] = useState([])
  const [novoUsuario, setNovoUsuario] = useState({
    nome: '', codigo: '', senha: '',
    permissao_inclusao: false,
    permissao_impressao: false,
    permissao_conferencia: false,
    permissao_producao: false,
    permissao_despacho: false,
    permissao_entrega: false,
    permissao_registrar_pagamento: false,
  })
  const [editandoUsuarioId, setEditandoUsuarioId] = useState(null)

  const [novoLocal, setNovoLocal] = useState({
    nome: '', origem: false, destino: false
  })
  const [editandoLocalId, setEditandoLocalId] = useState(null)

  useEffect(() => {
    carregarUsuarios()
    carregarLocais()
  }, [])

  const carregarUsuarios = async () => {
    try {
      const res = await api.get(`/usuarios/${farmacia.id}`)
      setUsuarios(res.data)
    } catch (err) {
      console.error('Erro ao carregar usuários:', err)
    }
  }

  const carregarLocais = async () => {
    try {
      const res = await api.get(`/locais/${farmacia.id}`)
      setLocais(res.data)
    } catch (err) {
      console.error('Erro ao carregar locais:', err)
    }
  }

  const salvarUsuario = async () => {
    const payload = { ...novoUsuario, farmacia_id: farmacia.id }

    try {
      if (editandoUsuarioId) {
        await api.put(`/usuarios/${editandoUsuarioId}`, payload)
      } else {
        await api.post('/usuarios', payload)
      }
      setNovoUsuario({
        nome: '', codigo: '', senha: '',
        permissao_inclusao: false,
        permissao_impressao: false,
        permissao_conferencia: false,
        permissao_producao: false,
        permissao_despacho: false,
        permissao_entrega: false,
        permissao_registrar_pagamento: false,
      })
      setEditandoUsuarioId(null)
      carregarUsuarios()
    } catch (err) {
      console.error('Erro ao salvar usuário:', err)
    }
  }

  const editarUsuario = (u) => {
    setNovoUsuario(u)
    setEditandoUsuarioId(u.id)
  }

  const excluirUsuario = async (id) => {
    try {
      await api.delete(`/usuarios/${id}`)
      carregarUsuarios()
    } catch (err) {
      console.error('Erro ao excluir usuário:', err)
    }
  }

  const salvarLocal = async () => {
    const payload = { ...novoLocal, farmacia_id: farmacia.id }

    try {
      if (editandoLocalId) {
        await api.put(`/locais/${editandoLocalId}`, payload)
      } else {
        await api.post('/locais', payload)
      }
      setNovoLocal({ nome: '', origem: false, destino: false })
      setEditandoLocalId(null)
      carregarLocais()
    } catch (err) {
      console.error('Erro ao salvar local:', err)
    }
  }

  const editarLocal = (l) => {
    setNovoLocal(l)
    setEditandoLocalId(l.id)
  }

  const excluirLocal = async (id) => {
    try {
      await api.delete(`/locais/${id}`)
      carregarLocais()
    } catch (err) {
      console.error('Erro ao excluir local:', err)
    }
  }

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0])
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="btn-fechar" onClick={onClose}>
          <X />
        </button>
        <h2>Configurações da Farmácia</h2>

        <label>Enviar nova logo:</label>
        <input type="file" onChange={handleLogoChange} />
        {logo && <p>Arquivo selecionado: {logo.name}</p>}

        <h3>Usuários</h3>
        <input className="input" placeholder="Código" value={novoUsuario.codigo}
          onChange={(e) => setNovoUsuario({ ...novoUsuario, codigo: e.target.value })} />
        <input className="input" placeholder="Nome" value={novoUsuario.nome}
          onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })} />
        <input className="input" placeholder="Senha" value={novoUsuario.senha}
          onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })} />

        <div className="lista-permissoes">
          {[
            ['permissao_inclusao', '➕'],
            ['permissao_impressao', '🖨️'],
            ['permissao_conferencia', '📋'],
            ['permissao_producao', '⚙️'],
            ['permissao_despacho', '📦'],
            ['permissao_entrega', '🚚'],
            ['permissao_registrar_pagamento', '💰'],
          ].map(([key, label]) => (
            <span
              key={key}
              className={`icone-permissao ${novoUsuario[key] ? 'selecionado' : ''}`}
              onClick={() =>
                setNovoUsuario({ ...novoUsuario, [key]: !novoUsuario[key] })
              }
              title={key.replace('permissao_', '')}
            >
              {label}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn-primary" onClick={salvarUsuario}>
            {editandoUsuarioId ? 'Salvar edição' : 'Cadastrar usuário'}
          </button>
          {editandoUsuarioId && (
            <button className="botao-cinza" onClick={() => {
              setEditandoUsuarioId(null)
              setNovoUsuario({
                nome: '', codigo: '', senha: '',
                permissao_inclusao: false,
                permissao_impressao: false,
                permissao_conferencia: false,
                permissao_producao: false,
                permissao_despacho: false,
                permissao_entrega: false,
                permissao_registrar_pagamento: false,
              })
            }}>Cancelar</button>
          )}
        </div>

        <ul style={{ marginTop: '1rem' }}>
          {usuarios.map((u) => (
            <li key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <span>{u.codigo} - {u.nome}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="botao-icone-circular botao-cinza" onClick={() => editarUsuario(u)}>
                  <UserPen size={18} />
                </button>
                <button className="botao-icone-circular botao-sair" onClick={() => excluirUsuario(u.id)}>
                  <Trash size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <h3 style={{ marginTop: '2rem' }}>Locais</h3>
        <input className="input" placeholder="Nome do local" value={novoLocal.nome}
          onChange={(e) => setNovoLocal({ ...novoLocal, nome: e.target.value })} />
        <label>
          <input type="checkbox" checked={novoLocal.origem}
            onChange={(e) => setNovoLocal({ ...novoLocal, origem: e.target.checked })} />
          Origem
        </label>
        <label>
          <input type="checkbox" checked={novoLocal.destino}
            onChange={(e) => setNovoLocal({ ...novoLocal, destino: e.target.checked })} />
          Destino
        </label>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn-primary" onClick={salvarLocal}>
            {editandoLocalId ? 'Salvar local' : 'Cadastrar local'}
          </button>
          {editandoLocalId && (
            <button className="botao-cinza" onClick={() => {
              setEditandoLocalId(null)
              setNovoLocal({ nome: '', origem: false, destino: false })
            }}>Cancelar</button>
          )}
        </div>

        <ul style={{ marginTop: '1rem' }}>
          {locais.map((l) => (
            <li key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <span>{l.nome} {l.origem && '🔼'} {l.destino && '🔽'}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="botao-icone-circular botao-cinza" onClick={() => editarLocal(l)}>
                  <MapPin size={18} />
                </button>
                <button className="botao-icone-circular botao-sair" onClick={() => excluirLocal(l.id)}>
                  <Trash size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
