// frontend/src/pages/LoginFarmacia.jsx
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-orange-500 w-full max-w-md rounded-md shadow-lg p-8 text-white">
        <div className="flex items-center justify-center gap-3 mb-6">
          <TowerControl size={36} />
          <h1 className="text-3xl font-bold tracking-wide">Farol</h1>
        </div>

        {modo === 'login' ? (
          <>
            <input
              type="email"
              className="input mb-3"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="input mb-4"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button className="btn-primary w-full" onClick={handleLogin}>
              Entrar
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              className="input mb-3"
              placeholder="Código de ativação"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <button
              className="btn-primary w-full mb-2"
              onClick={buscarEmpresa}
              disabled={!codigo.trim()}
            >
              Validar Código
            </button>

            {carregandoEmpresa && <p className="text-center text-sm">Verificando código...</p>}

            {nomeEmpresa && (
              <>
                <p className="text-sm mt-2 mb-2 text-center">
                  <strong>Empresa:</strong> {nomeEmpresa}
                </p>
                <input
                  type="text"
                  className="input mb-3"
                  placeholder="Nome da farmácia"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <input
                  type="email"
                  className="input mb-3"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="input mb-4"
                  placeholder="Senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
                <button className="btn-primary w-full" onClick={handleAtivar}>
                  Ativar Conta
                </button>
              </>
            )}
          </>
        )}

        <button
          onClick={alternarModo}
          className="w-full mt-6 text-sm text-white underline hover:text-gray-200"
        >
          {modo === 'login' ? 'Primeiro acesso?' : 'Já tenho conta'}
        </button>
      </div>
    </div>
  )
}
