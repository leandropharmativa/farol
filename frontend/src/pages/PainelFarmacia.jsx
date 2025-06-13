// frontend/src/pages/PainelFarmacia.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut,
  PlusCircle,
  Search,
  Settings,
  TowerControl,
  Sun,
} from 'lucide-react'
import '../styles/painelFarmacia.css'

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
    navigate('/configuracoes')
  }

  return (
    <div className="painel-container">
      <header className="painel-header">
        <h1 className="painel-titulo">Painel da Farmácia</h1>
      </header>

      <div className="painel-acoes">
        <div className="campo-busca">
          <Search className="icone-busca" size={20} />
          <input
            type="text"
            placeholder="Buscar pedido por nome ou código"
            className="input-busca"
          />
        </div>

        <button className="botao-primario">
          <PlusCircle size={18} />
          Incluir Pedido
        </button>
      </div>

      <div className="painel-placeholder">
        Nenhum pedido encontrado. Use o botão acima para incluir um novo.
      </div>

      <div className="menu-flutuante">
        <div className="menu-flutuante-botoes">
          <div className={`botao-submenu ${menuAberto ? 'visivel' : ''}`}>
            <button onClick={irParaConfiguracoes} className="botao-icone-circular botao-cinza">
              <Settings size={20} />
            </button>
          </div>
          <div className={`botao-submenu delay ${menuAberto ? 'visivel' : ''}`}>
            <button onClick={handleLogout} className="botao-icone-circular botao-cinza">
              <LogOut size={20} />
            </button>
          </div>
        </div>
        <button onClick={toggleMenu} className="botao-icone-circular botao-principal">
          {menuAberto ? <Sun size={24} /> : <TowerControl size={24} />}
        </button>
      </div>
    </div>
  )
}
