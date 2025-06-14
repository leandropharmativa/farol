//frontend/src/pages/LoginFarmacia.jsx
import { useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { TowerControl } from 'lucide-react'

export default function LoginFarmacia() {
  const [modo, setModo] = useState('login')
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
      const res = await api.post('/farmacia/login', { email, senha })
      if (res.data.status === 'ok') {
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('farmaciaId', res.data.farmaciaId)
        localStorage.setItem('email', email)
        localStorage.setItem('tipoLogin', 'farmacia')
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
      const res = await api.get(`/serial/verificar/${codigo}`)
      if (res.data.status === 'ok') {
        if (!res.data.precisaCriarLogin) {
          toast.info('Esse código já foi usado. Faça login normalmente.')
          setModo('login')
        } else {
          setNomeEmpresa(res.data.nomeEmpresa)
        }
      } else {
        toast.error(res.data.mensagem || 'Código inválido ou expirado.')
      }
    } catch (err) {
      toast.error('Erro ao verificar código.')
    }
    setCarregandoEmpresa(false)
  }

  const handleAtivar = async () => {
    try {
      const res = await api.post('/farmacia/registrar', {
        nome,
        email,
        senha,
        codigoSerial: codigo
      })
      if (res.data.status === 'ok') {
        toast.success('Conta ativada com sucesso!')
        setModo('login')
      } else {
        toast.error('Erro ao ativar conta.')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao ativar conta.')
    }
  }

  return (
<div className="bg-orange-500 min-h-screen flex items-center justify-center">
  <div className="login-box">

        <div className="login-header">
          <TowerControl size={36} />
          <h1 className="text-3xl font-bold tracking-wide">Farol</h1>
        </div>

        {modo === 'login' ? (
          <>
            <input
              type="email"
              className="login-input"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="login-input"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button className="login-btn" onClick={handleLogin}>
              Entrar
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              className="login-input"
              placeholder="Código de ativação"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <button
              className="login-btn"
              onClick={buscarEmpresa}
              disabled={!codigo.trim()}
            >
              Validar Código
            </button>

            {carregandoEmpresa && (
              <p className="text-sm text-center mt-2">Verificando código...</p>
            )}

            {nomeEmpresa && (
              <>
                <p className="text-sm mt-2 mb-2 text-center">
                  <strong>Empresa:</strong> {nomeEmpresa}
                </p>
                <input
                  type="text"
                  className="login-input"
                  placeholder="Nome da farmácia"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <input
                  type="email"
                  className="login-input"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="login-input"
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button className="login-btn" onClick={handleAtivar}>
                  Ativar Conta
                </button>
              </>
            )}
          </>
        )}

        <button className="login-link" onClick={alternarModo}>
          {modo === 'login' ? 'Primeiro acesso?' : 'Já tenho conta'}
        </button>
      </div>
    </div>
  )
}
