// frontend/src/pages/LoginFarmacia.jsx
// Este componente unifica o login normal e a ativação da farmácia (primeiro acesso)

import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function LoginFarmacia() {
  const [modo, setModo] = useState('login') // 'login' ou 'ativar'
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [carregandoEmpresa, setCarregandoEmpresa] = useState(false)

  const navigate = useNavigate()

  const alternarModo = () => {
    setModo(modo === 'login' ? 'ativar' : 'login')
    setEmail('')
    setSenha('')
    setNome('')
    setCodigo('')
    setNomeEmpresa('')
  }

  const handleLogin = async () => {
    try {
      const res = await axios.post('/farmacia/login', { email, senha })
      if (res.data.status === 'ok') {
        toast.success('Login realizado!')
        navigate('/painel-farmacia')
      } else {
        toast.error('Falha no login.')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao logar.')
    }
  }

  const buscarEmpresa = async () => {
    if (!codigo.trim()) return
    setCarregandoEmpresa(true)
    try {
      const res = await axios.get(`/serial/verificar/${codigo}`)
      if (res.data.status === 'ok') {
        if (!res.data.precisaCriarLogin) {
          toast.info('Esse código já foi usado. Faça login normalmente.')
          setModo('login')
          return
        }
        setNomeEmpresa(res.data.nomeEmpresa)
      } else {
        toast.error('Código inválido ou expirado.')
      }
    } catch (err) {
      toast.error('Erro ao verificar código.')
    }
    setCarregandoEmpresa(false)
  }

  const handleAtivar = async () => {
    try {
      const res = await axios.post('/farmacia/registrar', {
        nome,
        email,
        senha,
        codigoSerial: codigo
      })
      if (res.data.status === 'ok') {
        toast.success('Conta ativada com sucesso!')
        navigate('/painel-farmacia')
      } else {
        toast.error('Erro ao ativar conta.')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao ativar conta.')
    }
  }

  return (
    <div>
      <h2>{modo === 'login' ? 'Login da Farmácia' : 'Primeiro Acesso'}</h2>

      {modo === 'login' ? (
        <>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button onClick={handleLogin}>Entrar</button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Código de ativação"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />

          <button
            onClick={buscarEmpresa}
            disabled={!codigo.trim()}
            style={{ marginTop: '0.5rem' }}
          >
            Validar Código
          </button>

          {carregandoEmpresa && <p>Verificando código...</p>}

          {nomeEmpresa && (
            <>
              <p><strong>Empresa:</strong> {nomeEmpresa}</p>
              <input
                type="text"
                placeholder="Nome da farmácia"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button onClick={handleAtivar}>Ativar Conta</button>
            </>
          )}
        </>
      )}

      {/* ⬇️ Agora está fora dos blocos de modo e sempre visível */}
      <button onClick={alternarModo} style={{ marginTop: '1rem' }}>
        {modo === 'login' ? 'Primeiro acesso?' : 'Já tenho conta'}
      </button>
    </div>
  )
}
