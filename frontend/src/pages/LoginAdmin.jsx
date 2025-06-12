import { useState } from 'react'
import axios from 'axios'
import { saveToken } from '../utils/auth'
import { useNavigate } from 'react-router-dom'

export default function LoginAdmin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/login`, {
        email,
        senha,
      })
      saveToken(res.data.token)
      navigate('/gerar')
    } catch (err) {
      setErro('Credenciais inválidas')
    }
  }

  return (
    <div>
      <h2>Login do Administrador</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required />
        <button type="submit">Entrar</button>
      </form>
      {erro && <p>{erro}</p>}
    </div>
  )
}
