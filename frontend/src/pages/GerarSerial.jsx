import React from 'react'
import { useState } from 'react'
import api from '../services/api'

export default function GerarSerial() {
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [dias, setDias] = useState(30)
  const [serial, setSerial] = useState('')
  const [erro, setErro] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/serial/gerar', {
        nomeEmpresa: empresa,
        email,
        validadeDias: dias
      })
      setSerial(res.data.codigo)
      setErro('')
    } catch (err) {
      setErro('Erro ao gerar serial')
    }
  }

  return (
    <div>
      <h2>Gerar Serial</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nome da empresa" value={empresa} onChange={e => setEmpresa(e.target.value)} required />
        <input type="email" placeholder="Email autorizado" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="number" placeholder="Dias de validade" value={dias} onChange={e => setDias(e.target.value)} />
        <button type="submit">Gerar</button>
      </form>
      {serial && <p>Serial: {serial}</p>}
      {erro && <p>{erro}</p>}
    </div>
  )
}
