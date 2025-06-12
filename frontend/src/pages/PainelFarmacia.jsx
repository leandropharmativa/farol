// frontend/src/pages/PainelFarmacia.jsx

import { useNavigate } from 'react-router-dom'
import { LogOut, PlusCircle, Search, Settings } from 'lucide-react'

export default function PainelFarmacia() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Cabeçalho */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Painel da Farmácia</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
        >
          <LogOut size={18} />
          Sair
        </button>
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
          <button className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
            <Settings size={18} />
            Configurações
          </button>
        </div>
      </div>

      {/* Placeholder para pedidos */}
      <div className="bg-white rounded shadow p-4 text-center text-gray-500 border border-dashed border-gray-300">
        Nenhum pedido encontrado. Use o botão acima para incluir um novo.
      </div>
    </div>
  )
}
