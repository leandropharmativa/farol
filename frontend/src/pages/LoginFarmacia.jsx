import { useState } from 'react'
import api from '../services/api'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

export default function LoginFarmacia() {
  const [modo, setModo] = useState('login')
  const [emailOuCodigo, setEmailOuCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [carregandoEmpresa, setCarregandoEmpresa] = useState(false)
  const [carregandoLogin, setCarregandoLogin] = useState(false)

  const navigate = useNavigate()

  const alternarModo = () => {
    setModo(modo === 'login' ? 'ativar' : 'login')
    setEmailOuCodigo('')
    setSenha('')
    setNome('')
    setCodigo('')
    setNomeEmpresa('')
  }

  const handleLogin = async () => {
    setCarregandoLogin(true)
    try {
      // 1. Admin
      try {
        const resAdmin = await axios.post(`${import.meta.env.VITE_API_URL}/admin/login`, {
          email: emailOuCodigo,
          senha,
        })
        localStorage.setItem('token', resAdmin.data.token)
        localStorage.setItem('tipoLogin', 'admin')
        toast.success('Login como administrador')
        navigate('/gerar')
        window.location.reload()
        return
      } catch {}

      // 2. Farmácia
      try {
        const resFarmacia = await api.post('/farmacia/login', {
          email: emailOuCodigo,
          senha,
        })
        if (resFarmacia.data.status === 'ok') {
          localStorage.setItem('token', resFarmacia.data.token)
          localStorage.setItem('farmaciaId', resFarmacia.data.farmaciaId)
          localStorage.setItem('email', emailOuCodigo)
          localStorage.setItem('tipoLogin', 'farmacia')
          localStorage.setItem('nomeFarmacia', resFarmacia.data.nome)
          toast.success('Login como farmácia')
          navigate('/painel-farmacia')
          window.location.reload()
          return
        }
      } catch {}

      // 3. Usuário da farmácia
      try {
        const resUsuario = await api.post('/usuarios/login', {
          codigo: emailOuCodigo,
          senha,
        })
        if (resUsuario.data.status === 'ok') {
          localStorage.setItem('token', resUsuario.data.token)
          localStorage.setItem('usuarioId', resUsuario.data.usuarioId)
          localStorage.setItem('farmaciaId', resUsuario.data.farmaciaId)
          localStorage.setItem('nomeUsuario', resUsuario.data.nome)
          localStorage.setItem('nomeFarmacia', resUsuario.data.nomeFarmacia)
          localStorage.setItem('tipoLogin', 'usuario')
          localStorage.setItem('emailFarmacia', resUsuario.data.emailFarmacia)
          localStorage.setItem('permissao_impressao', resUsuario.data.permissao_impressao)
          localStorage.setItem('permissao_conferencia', resUsuario.data.permissao_conferencia)
          localStorage.setItem('permissao_producao', resUsuario.data.permissao_producao)
          localStorage.setItem('permissao_despacho', resUsuario.data.permissao_despacho)
          localStorage.setItem('permissao_recebimento', resUsuario.data.permissao_recebimento)
          localStorage.setItem('permissao_entrega', resUsuario.data.permissao_entrega)
          localStorage.setItem('permissao_registrar_pagamento', resUsuario.data.permissao_registrar_pagamento)
          toast.success('Login como usuário')
          navigate('/painel-farmacia')
          window.location.reload()
          return
        }
      } catch {}

      toast.error('Credenciais inválidas.')
    } catch {
      toast.error('Erro ao processar login.')
    } finally {
      setCarregandoLogin(false)
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
    } catch {
      toast.error('Erro ao verificar código.')
    }
    setCarregandoEmpresa(false)
  }

  const handleAtivar = async () => {
    try {
      const res = await api.post('/farmacia/registrar', {
        nome,
        email: emailOuCodigo,
        senha,
        codigoSerial: codigo,
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
  <div className="relative bg-gray-100 flex items-center justify-center min-h-screen overflow-hidden">
    {/* Imagem do farol colada no canto inferior esquerdo */}
    <img
      src="/farol.png"
      alt="Imagem de fundo"
      className="absolute bottom-20 left-0 z-0 pointer-events-none max-h-[80vh]"
    />

    {/* Quadro de login sobre a imagem */}
    <div className="login-box z-10 relative bg-white shadow-lg p-6">
     <div className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl text-white fonte-pacifico text-right">
        Farol
      </div>

      {modo === 'login' ? (
        <>
          <input
            type="text"
            className="login-input text-center"
            placeholder="Login"
            value={emailOuCodigo}
            onChange={(e) => setEmailOuCodigo(e.target.value)}
          />
          <input
            type="password"
            className="login-input text-center"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button
            className="login-btn disabled:opacity-60"
            onClick={handleLogin}
            disabled={carregandoLogin}
          >
            {carregandoLogin ? 'Verificando...' : 'Entrar'}
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
          <button className="login-btn" onClick={buscarEmpresa} disabled={!codigo.trim()}>
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
                value={emailOuCodigo}
                onChange={(e) => setEmailOuCodigo(e.target.value)}
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
