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
    navigate('/configuracoes') // ajuste conforme necessário
  }

  return (
    <div className="painel-container">
      {/* Cabeçalho */}
      <header className="painel-header">
        <h1 className="painel-titulo">Painel da Farmácia</h1>
      </header>

      {/* Bloco de ações */}
      <div className="painel-acoes">
        {/* Campo de busca */}
        <div className="campo-busca">
          <Search className="icone-busca" size={20} />
          <input
            type="text"
            placeholder="Buscar pedido por nome ou código"
            className="input-busca"
          />
        </div>

        {/* Botão de ação */}
        <button className="botao-primario">
          <PlusCircle size={18} />
          Incluir Pedido
        </button>
      </div>

      {/* Placeholder de pedidos */}
      <div className="painel-placeholder">
        Nenhum pedido encontrado. Use o botão acima para incluir um novo.
      </div>

      {/* Botões flutuantes */}
      <div className="menu-flutuante">
        <div className="menu-flutuante-botoes">
          <div className={`botao-submenu ${menuAberto ? 'visivel' : ''}`}>
            <button onClick={irParaConfiguracoes} className="botao-flutuante-sub">
              <Settings size={18} />
              Configurações
            </button>
          </div>
          <div className={`botao-submenu delay ${menuAberto ? 'visivel' : ''}`}>
            <button onClick={handleLogout} className="botao-flutuante-sub botao-sair">
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
        <button onClick={toggleMenu} className="botao-flutuante-principal">
          <TowerControl size={24} />
        </button>
      </div>
    </div>
  )
}
