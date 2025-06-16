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
  UserRound,
} from 'lucide-react'
import ModalConfiguracoesFarmacia from '../components/ModalConfiguracoesFarmacia'
import ModalNovoPedido from '../components/ModalNovoPedido'
import PainelPedidosFarmacia from '../components/PainelPedidosFarmacia'
import NovosPedidosStream from '../components/NovosPedidosStream'

export default function PainelFarmacia() {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalConfiguracoesAberto, setModalConfiguracoesAberto] = useState(false)
  const [modalPedidoAberto, setModalPedidoAberto] = useState(false)
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
    document.body.style.overflow = modalConfiguracoesAberto ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalConfiguracoesAberto])

  const usuarioLogado = {
  id: localStorage.getItem('usuarioId'),
  nome: localStorage.getItem('nomeUsuario')
  }

  return (
    <div className="painel-container">
      <header className="painel-header">
        <h1 className="painel-titulo fonte-pacifico">{nomeFarmacia}</h1>
        {tipoLogin === 'usuario' && (
          <p className="text-sm text-gray-600 mt-1 text-center flex items-center justify-center gap-1">
            <UserRound size={16} /> {nomeUsuario}
          </p>
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

      {/* Lista de pedidos do dia */}
      <NovosPedidosStream farmaciaId={farmaciaId} />
      <PainelPedidosFarmacia farmaciaId={farmaciaId} usuarioLogado={usuarioLogado} />

      {/* Botão de incluir pedido com transição de subida */}
      <div
        className={`fixed right-6 z-40 transition-all duration-300 ${
          menuAberto
            ? tipoLogin === 'usuario'
              ? 'bottom-[8.5rem]'
              : 'bottom-[12rem]'
            : 'bottom-20'
        }`}
      >
        <button
          className="botao-icone-circular botao-azul z-40"
          title="Incluir Pedido"
          onClick={() => setModalPedidoAberto(true)}
        >
          <PackagePlus size={26} />
        </button>
      </div>

      {/* Menu flutuante com animação */}
      <div
        ref={menuRef}
        className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2"
      >
        <div className="relative flex flex-col items-end space-y-2">
          {tipoLogin === 'farmacia' && (
            <div
              className={`transition-all duration-300 transform ${
                menuAberto ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}
            >
              <button
                onClick={irParaConfiguracoes}
                className="botao-icone-circular botao-cinza"
                title="Configurações"
              >
                <Settings size={20} />
              </button>
            </div>
          )}

          {/* Sair */}
          <div
            className={`transition-all duration-300 transform ${
              menuAberto ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <button
              onClick={handleLogout}
              className="botao-icone-circular botao-cinza"
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Botão principal do menu */}
        <button
          onClick={toggleMenu}
          className="botao-icone-circular botao-principal"
          title="Menu"
        >
          {menuAberto ? <Sun size={24} /> : <TowerControl size={24} />}
        </button>
      </div>

      <ModalNovoPedido
        aberto={modalPedidoAberto}
        onClose={() => setModalPedidoAberto(false)}
        farmaciaId={farmaciaId}
      />

      <ModalConfiguracoesFarmacia
        aberto={modalConfiguracoesAberto}
        onClose={() => setModalConfiguracoesAberto(false)}
        farmaciaId={farmaciaId}
        emailFarmacia={emailLogado}
      />
    </div>
  )
}
