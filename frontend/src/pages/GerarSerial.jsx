// frontend/src/pages/GerarSerial.jsx

import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function GerarSerial() {
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [dias, setDias] = useState(30)
  const [serial, setSerial] = useState('')
  const [erro, setErro] = useState('')
  const [listaSeriais, setListaSeriais] = useState([])

  const carregarSeriais = async () => {
    try {
      const res = await api.get('/serial/listar')
      setListaSeriais(res.data)
    } catch (err) {
      console.error('Erro ao carregar seriais', err)
    }
  }

  useEffect(() => {
    carregarSeriais()
  }, [])

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
      setEmpresa('')
      setEmail('')
      setDias(30)
      carregarSeriais() // Atualiza lista após gerar
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

      {serial && <p>Serial gerado: <strong>{serial}</strong></p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <h3>Seriais gerados</h3>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Empresa</th>
            <th>Email</th>
            <th>Validade</th>
            <th>Ativo</th>
          </tr>
        </thead>
        <tbody>
          {listaSeriais.map((s, i) => (
            <tr key={i}>
              <td>{s.codigo}</td>
              <td>{s.nomeEmpresa}</td>
              <td>{s.email}</td>
              <td>{new Date(s.validade).toLocaleDateString()}</td>
              <td>{s.ativo ? 'Sim' : 'Não'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
