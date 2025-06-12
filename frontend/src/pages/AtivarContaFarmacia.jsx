import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function AtivarContaFarmacia() {
  const { codigo } = useParams()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nomeEmpresa, setNomeEmpresa] = useState('')

  useEffect(() => {
    const buscarDadosSerial = async () => {
      try {
        const res = await axios.get(`/serial/verificar/${codigo}`)
        if (res.data.status === 'ok') {
          setNomeEmpresa(res.data.nomeEmpresa)
        } else {
          toast.error('Código inválido ou expirado.')
          navigate('/farmacia')
        }
      } catch (err) {
        toast.error('Erro ao verificar código.')
        navigate('/farmacia')
      }
    }

    buscarDadosSerial()
  }, [codigo, navigate])

  const handleAtivar = async () => {
    try {
      const payload = {
        nome,
        email,
        senha,
        codigoSerial: codigo
      }

      const res = await axios.post('/farmacia/registrar', payload)

      if (res.data.status === 'ok') {
        toast.success('Conta ativada com sucesso!')
        navigate('/login-farmacia')
      } else {
        toast.error('Erro ao ativar conta.')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao ativar conta.')
    }
  }

  return (
    <div>
      <h2>Ativar Conta da Farmácia</h2>
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
    </div>
  )
}
