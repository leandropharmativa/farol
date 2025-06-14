//frontend/src/pages/GerarSerial.jsx
import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function GerarSerial() {
  const [empresa, setEmpresa] = useState('')
  const [email, setEmail] = useState('')
  const [dias, setDias] = useState(30)
  const [serial, setSerial] = useState('')
  const [erro, setErro] = useState('')
  const [listaSeriais, setListaSeriais] = useState([])
  const navigate = useNavigate()

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

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('tipoLogin')
    navigate('/') // redireciona para LoginFarmacia
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-farol-primary">Gerar Serial</h2>
        <button
          onClick={handleLogout}
          className="btn-base bg-red-600 hover:bg-red-700"
        >
          Deslogar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Nome da empresa"
          value={empresa}
          onChange={e => setEmpresa(e.target.value)}
          required
          className="input-base"
        />
        <input
          type="email"
          placeholder="Email autorizado"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="input-base"
        />
        <input
          type="number"
          placeholder="Dias de validade"
          value={dias}
          onChange={e => setDias(e.target.value)}
          className="input-base"
        />
        <button
          type="submit"
          className="md:col-span-3 btn-base bg-farol-primary hover:bg-farol-primaryfocus"
        >
          Gerar Serial
        </button>
      </form>

      {serial && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          Serial gerado: <span className="font-semibold">{serial}</span>
        </div>
      )}
      {erro && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          {erro}
        </div>
      )}

      <h3 className="text-xl font-semibold mb-2">Seriais gerados</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow-sm">
          <thead>
            <tr className="bg-gray-100 text-sm text-gray-700">
              <th className="px-4 py-2 border">Código</th>
              <th className="px-4 py-2 border">Empresa</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Validade</th>
              <th className="px-4 py-2 border">Ativo</th>
            </tr>
          </thead>
          <tbody>
            {listaSeriais.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50 text-sm">
                <td className="px-4 py-2 border">{s.codigo}</td>
                <td className="px-4 py-2 border">{s.nomeEmpresa}</td>
                <td className="px-4 py-2 border">{s.email}</td>
                <td className="px-4 py-2 border">
                  {new Date(s.validade).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">{s.ativo ? 'Sim' : 'Não'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

