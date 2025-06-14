// frontend/src/pages/PainelFarmacia.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut,
  PackagePlus,
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
  const nomeFarmacia = localStorage.getItem('nomeFarmacia') || 'Painel da Farmácia'
  const nomeUsuario = localStorage.getItem('nomeUsuario') || ''

  const handleLogout = () => {
    localStorage.clear()
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
        <h1 className="painel-titulo">{nomeFarmacia}</h1>
        {tipoLogin === 'usuario' && (
          <p className="text-sm text-gray-600 mt-1 text-center">Usuário: {nomeUsuario}</p>
        )}
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
      </div>

      <div className="painel-placeholder">
        Nenhum pedido encontrado. Use o botão abaixo para incluir um novo.
      </div>

      {/* 🟦 Botão fixo de incluir pedido */}
      <button
        className={`botao-icone-circular botao-azul fixed right-6 z-10 transition-all duration-300 ${
          menuAberto ? 'bottom-28' : 'bottom-20'
        }`}
        title="Incluir Pedido"
        onClick={() => {
          console.log('🟦 Incluir Pedido (ação futura)')
        }}
      >
        <PackagePlus size={26} />
      </button>

      {/* Menu flutuante */}
      <div className="menu-flutuante" ref={menuRef}>
        <div className="menu-flutuante-botoes">
          {menuAberto && tipoLogin === 'farmacia' && (
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
          {menuAberto && (
            <div className="botao-submenu delay visivel">
              <button
                onClick={handleLogout}
                className="botao-icone-circular botao-cinza"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
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
