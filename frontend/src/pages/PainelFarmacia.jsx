// frontend/src/pages/PainelFarmacia.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, PackagePlus, Search, Settings, TowerControl, Sun,
  UserRound, Truck, Handshake,
} from 'lucide-react'

import ModalConfiguracoesFarmacia from '../components/ModalConfiguracoesFarmacia'
import ModalNovoPedido from '../components/ModalNovoPedido'
import ModalDespachoEmMassa from '../components/ModalDespachoEmMassa'
import ModalRecebimentoEmMassa from '../components/ModalRecebimentoEmMassa'
import PainelPedidosFarmacia from '../components/PainelPedidosFarmacia'
import PainelEntregador from '../components/PainelEntregador'
import NovosPedidosStream from '../components/NovosPedidosStream'

export default function PainelFarmacia() {
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)
  const [modalConfiguracoesAberto, setModalConfiguracoesAberto] = useState(false)
  const [modalPedidoAberto, setModalPedidoAberto] = useState(false)
  const [modalDespachoAberto, setModalDespachoAberto] = useState(false)
  const [modalRecebimentoAberto, setModalRecebimentoAberto] = useState(false)
  const [filtroRegistro, setFiltroRegistro] = useState('')

  const menuRef = useRef(null)

  const emailLogado = (localStorage.getItem('email') || '').trim().toLowerCase()
  const farmaciaId = localStorage.getItem('farmaciaId')
  const tipoLogin = localStorage.getItem('tipoLogin')
  const nomeFarmacia = localStorage.getItem('nomeFarmacia') || 'Painel da Farmácia'
  const nomeUsuario = localStorage.getItem('nomeUsuario') || ''
  const emailFarmacia = localStorage.getItem('emailFarmacia') || localStorage.getItem('email')

  const usuarioLogado = {
    id: localStorage.getItem('usuarioId'),
    nome: localStorage.getItem('nomeUsuario'),
    email: localStorage.getItem('email'),
    entregador: localStorage.getItem('entregador') === 'true',
    permissao_impressao: localStorage.getItem('permissao_impressao') === 'true',
    permissao_conferencia: localStorage.getItem('permissao_conferencia') === 'true',
    permissao_producao: localStorage.getItem('permissao_producao') === 'true',
    permissao_despacho: localStorage.getItem('permissao_despacho') === 'true',
    permissao_recebimento: localStorage.getItem('permissao_recebimento') === 'true',
    permissao_entrega: localStorage.getItem('permissao_entrega') === 'true',
    permissao_registrar_pagamento: localStorage.getItem('permissao_registrar_pagamento') === 'true',
  }

  const handleLogout = () => {
    localStorage.clear()
    setModalConfiguracoesAberto(false)
    navigate('/')
  }

  const toggleMenu = () => setMenuAberto((prev) => !prev)

  const irParaConfiguracoes = () => {
    setMenuAberto(false)
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

  return (
    <div className="painel-container">
      <header className="painel-header flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="painel-titulo fonte-pacifico text-2xl">{nomeFarmacia}</h1>
          <div className="flex items-center bg-white rounded-full p-4 px-3 py-1 shadow-sm">
            <Search size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Buscar por registro..."
              value={filtroRegistro}
              onChange={e => setFiltroRegistro(e.target.value)}
              className="input-busca-redonda"
            />
          </div>
        </div>
        {tipoLogin === 'usuario' && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <UserRound size={16} /> {nomeUsuario}
          </p>
        )}
      </header>

      {!usuarioLogado.entregador && (
  <NovosPedidosStream farmaciaId={farmaciaId} />
      )}

{usuarioLogado.entregador ? (
  <PainelEntregador usuarioLogado={usuarioLogado} filtroRegistro={filtroRegistro} />
) : (
  <PainelPedidosFarmacia
    farmaciaId={farmaciaId}
    usuarioLogado={usuarioLogado}
    filtroRegistro={filtroRegistro}
    emailFarmacia={emailFarmacia}
  />
)}

      {/* Botões e modais do painel (visíveis apenas para farmácia ou usuário com permissões) */}
{!usuarioLogado.entregador && (
  <>
    {/* Botão flutuante */}
    <div className={`fixed right-6 z-40 group transition-all duration-300 ${
      menuAberto
        ? tipoLogin === 'usuario'
          ? 'bottom-[8.5rem]'
          : 'bottom-[12rem]'
        : 'bottom-20'
    }`}>
      <div className="flex flex-col items-end mb-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
        <button
          className="botao-icone-circular botao-cinza text-farol-primary"
          title="Despacho em massa"
          onClick={() => setModalDespachoAberto(true)}
        >
          <Truck size={20} className="text-farol-primary" />
        </button>
        <button
          className="botao-icone-circular botao-cinza"
          title="Recebimento em massa"
          onClick={() => setModalRecebimentoAberto(true)}
        >
          <Handshake size={20} className="text-farol-primary" />
        </button>
      </div>
      <button
        className="botao-icone-circular botao-azul z-40"
        title="Incluir Pedido"
        onClick={() => setModalPedidoAberto(true)}
      >
        <PackagePlus size={26} />
      </button>
    </div>

    {/* Modais */}
    <ModalNovoPedido
      aberto={modalPedidoAberto}
      onClose={() => setModalPedidoAberto(false)}
      farmaciaId={farmaciaId}
    />
    <ModalDespachoEmMassa
      aberto={modalDespachoAberto}
      onClose={() => setModalDespachoAberto(false)}
      farmaciaId={farmaciaId}
      usuarioLogado={usuarioLogado}
    />
    <ModalRecebimentoEmMassa
      aberto={modalRecebimentoAberto}
      onClose={() => setModalRecebimentoAberto(false)}
      farmaciaId={farmaciaId}
      usuarioLogado={usuarioLogado}
    />
  </>
)}


      {/* Menu lateral */}
      <div ref={menuRef} className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
        <div className="relative flex flex-col items-end space-y-2">
          {tipoLogin === 'farmacia' && (
            <div className={`transition-all duration-300 transform ${menuAberto ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
              <button
                onClick={irParaConfiguracoes}
                className="botao-icone-circular botao-cinza"
                title="Configurações"
              >
                <Settings size={20} />
              </button>
            </div>
          )}
          <div className={`transition-all duration-300 transform ${menuAberto ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
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

      <ModalConfiguracoesFarmacia
        aberto={modalConfiguracoesAberto}
        onClose={() => setModalConfiguracoesAberto(false)}
        farmaciaId={farmaciaId}
        emailFarmacia={emailLogado}
      />
    </div>
  )
}
