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
      carregarSeriais()
    } catch (err) {
      setErro('Erro ao gerar serial')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-nublia-primary">Gerar Serial</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Nome da empresa"
          value={empresa}
          onChange={e => setEmpresa(e.target.value)}
          required
          className="border p-2 rounded w-full focus:outline-none focus:border-nublia-primary"
        />
        <input
          type="email"
          placeholder="Email autorizado"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border p-2 rounded w-full focus:outline-none focus:border-nublia-primary"
        />
        <input
          type="number"
          placeholder="Dias de validade"
          value={dias}
          onChange={e => setDias(e.target.value)}
          className="border p-2 rounded w-full focus:outline-none focus:border-nublia-primary"
        />
        <button
          type="submit"
          className="md:col-span-3 bg-nublia-primary hover:bg-nublia-primaryfocus text-white py-2 px-4 rounded transition"
        >
          Gerar
        </button>
      </form>

      {serial && (
        <p className="mb-4 text-green-600 font-semibold">Serial gerado: {serial}</p>
      )}
      {erro && (
        <p className="mb-4 text-red-600 font-semibold">{erro}</p>
      )}

      <h3 className="text-xl font-semibold mb-2">Seriais gerados</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2 border-b">Código</th>
              <th className="px-4 py-2 border-b">Empresa</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Validade</th>
              <th className="px-4 py-2 border-b">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {listaSeriais.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{s.codigo}</td>
                <td className="px-4 py-2 border-b">{s.nomeEmpresa}</td>
                <td className="px-4 py-2 border-b">{s.email}</td>
                <td className="px-4 py-2 border-b">
                  {new Date(s.validade).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border-b">{s.ativo ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
