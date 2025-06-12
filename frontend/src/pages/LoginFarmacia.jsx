import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

export default function LoginFarmacia() {
  const [codigo, setCodigo] = useState('')
  const navigate = useNavigate()

  const verificarCodigo = async () => {
    try {
      const res = await axios.get(`/serial/verificar/${codigo}`)
      const { status, precisaCriarLogin } = res.data

      if (status !== 'ok') {
        toast.error('Código inválido')
        return
      }

      if (precisaCriarLogin) {
        navigate(`/ativar/${codigo}`)
      } else {
        navigate(`/login-farmacia/${codigo}`)
      }
    } catch (err) {
      toast.error('Erro ao verificar código')
    }
  }

  return (
    <div>
      <h2>Login da Farmácia</h2>
      <input
        type="text"
        placeholder="Código de ativação"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <button onClick={verificarCodigo}>Entrar</button>
    </div>
  )
}
