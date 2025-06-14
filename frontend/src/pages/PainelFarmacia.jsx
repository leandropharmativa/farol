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
//import '../styles/painelFarmacia.css'
import ModalConfiguracoesFarmacia from '../components/ModalConfiguracoesFarmacia'

export default function PainelFarmacia() {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalConfiguracoesAberto, setModalConfiguracoesAberto] = useState(false)
  const menuRef = useRef(null)

  // Pegando dados da farmácia logada
  const emailLogado = (localStorage.getItem('email') || '').trim().toLowerCase()
  const farmaciaId = localStorage.getItem('farmaciaId')
  const tipoLogin = localStorage.getItem('tipoLogin') // 'farmacia' ou 'usuario'

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

  // Fecha o menu flutuante ao clicar fora
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

  // Impede rolagem do fundo ao abrir o modal
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

        <button className="botao-primario">
          <PlusCircle size={18} />
          Incluir Pedido
        </button>
      </div>

      <div className="painel-placeholder">
        Nenhum pedido encontrado. Use o botão acima para incluir um novo.
      </div>

      {/* Botões flutuantes com ref */}
      <div className="menu-flutuante" ref={menuRef}>
        <div className="menu-flutuante-botoes">
          {/* Mostrar botão de configurações apenas para login da farmácia principal */}
{tipoLogin === 'farmacia' && (
  <div className="botao-submenu visivel"> {/* força visível para teste */}
    <button
      onClick={() => {
        console.log('⚙️ Clique no botão de configurações')
        setModalConfiguracoesAberto(true)
      }}
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
        <button onClick={toggleMenu} className="botao-icone-circular botao-principal" title="Menu">
          {menuAberto ? <Sun size={24} /> : <TowerControl size={24} />}
        </button>
      </div>

      {/* Modal de configurações flutuante */}
      <ModalConfiguracoesFarmacia
        aberto={modalConfiguracoesAberto}
        onClose={() => setModalConfiguracoesAberto(false)}
        farmaciaId={farmaciaId}
        emailFarmacia={emailLogado}
      />
    </div>
  )
}


