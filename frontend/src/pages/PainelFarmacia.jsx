// frontend/src/pages/PainelFarmacia.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut,
  PlusCircle,
  Search,
  Settings,
  TowerControl,
} from 'lucide-react'

export default function PainelFarmacia() {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const toggleMenu = () => {
    setMenuAberto((prev) => !prev)
  }

  const irParaConfiguracoes = () => {
    navigate('/configuracoes') // ajuste se necessário
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* Cabeçalho */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Painel da Farmácia
        </h1>
      </header>

      {/* Bloco de ações */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* Campo de busca */}
        <div className="flex items-center bg-white border border-gray-300 rounded shadow-sm w-full md:max-w-md">
          <Search className="ml-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar pedido por nome ou código"
            className="w-full px-3 py-2 border-none outline-none bg-transparent"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            <PlusCircle size={18} />
            Incluir Pedido
          </button>
        </div>
      </div>

      {/* Placeholder para pedidos */}
      <div className="bg-white rounded shadow p-4 text-center text-gray-500 border border-dashed border-gray-300">
        Nenhum pedido encontrado. Use o botão acima para incluir um novo.
      </div>

      {/* Botão flutuante */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
        {/* Botões animados */}
        <div className="flex flex-col items-end gap-3">
          <div
            className={`transition-all duration-300 transform ${
              menuAberto
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <button
              onClick={irParaConfiguracoes}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow"
            >
              <Settings size={18} />
              Configurações
            </button>
          </div>
          <div
            className={`transition-all duration-300 transform delay-100 ${
              menuAberto
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded shadow"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>

        {/* Botão principal */}
        <button
          onClick={toggleMenu}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition"
        >
          <TowerControl size={24} />
        </button>
      </div>
    </div>
  )
}
