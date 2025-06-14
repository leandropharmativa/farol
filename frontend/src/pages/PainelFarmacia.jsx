// frontend/src/pages/PainelFarmacia.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut,
  PlusCircle,
  Search,
  Settings,
  TowerControl,
  Sun,
} from 'lucide-react'
import ModalConfiguracoesFarmacia from '../components/ModalConfiguracoesFarmacia'

export default function PainelFarmacia() {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalConfiguracoesAberto, setModalConfiguracoesAberto] = useState(false)
  const menuRef = useRef(null)

  const emailLogado = (localStorage.getItem('email') || '').trim().toLowerCase()
  const farmaciaId = localStorage.getItem('farmaciaId')
  const tipoLogin = localStorage.getItem('tipoLogin')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('farmaciaId')
    localStorage.removeItem('tipoLogin')
    setModalConfiguracoesAberto(false)
    navigate('/')
  }

  const toggleMenu = () => {
    setMenuAberto((prev) => !prev)
  }

  const irParaConfiguracoes = () => {
    setModalConfiguracoesAberto(true)
  }

  useEffect(() => {
    const handleClickFora = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false)
      }
    }

    if (menuAberto) {
      document.addEventListener('mousedown', handleClickFora)
    } else {
      document.removeEventListener('mousedown', handleClickFora)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickFora)
    }
  }, [menuAberto])

  useEffect(() => {
    if (modalConfiguracoesAberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalConfiguracoesAberto])

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

        {/* ✅ Botão Incluir Pedido acima do Farol */}
        <button className="botao-primario">
          <PlusCircle size={18} />
          Incluir Pedido
        </button>
      </div>

      <div className="painel-placeholder">
        Nenhum pedido encontrado. Use o botão acima para incluir um novo.
      </div>

      {/* 🔘 Menu flutuante no canto inferior direito */}
      <div className="menu-flutuante" ref={menuRef}>
        <div className="menu-flutuante-botoes">

          {tipoLogin === 'farmacia' && (
            <div className="botao-submenu visivel">
              <button
                onClick={irParaConfiguracoes}
                className="botao-icone-circular botao-cinza"
                title="Configurações"
              >
                <Settings size={20} />
              </button>
            </div>
          )}

          <div className={`botao-submenu delay ${menuAberto ? 'visivel' : ''}`}>
            <button
              onClick={handleLogout}
              className="botao-icone-circular botao-cinza"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <button
          onClick={toggleMenu}
          className="botao-icone-circular botao-principal"
          title="Menu"
        >
          {menuAberto ? <Sun size={24} /> : <TowerControl size={24} />}
        </button>
      </div>

      {/* ⚙️ Modal de configurações */}
      <ModalConfiguracoesFarmacia
        aberto={modalConfiguracoesAberto}
        onClose={() => setModalConfiguracoesAberto(false)}
        farmaciaId={farmaciaId}
        emailFarmacia={emailLogado}
      />
    </div>
  )
}
