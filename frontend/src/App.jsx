//frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'

import LoginAdmin from './pages/LoginAdmin'
import GerarSerial from './pages/GerarSerial'
import LoginFarmacia from './pages/LoginFarmacia'
import AtivarContaFarmacia from './pages/AtivarContaFarmacia'
import PainelFarmacia from './pages/PainelFarmacia'
import { getToken } from './utils/auth'

export default function App() {
  const token = getToken()
  const tipoLogin = localStorage.getItem('tipoLogin')

  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial padrão: login da farmácia */}
        <Route path="/" element={<LoginFarmacia />} />

        {/* Ativação da conta da farmácia (primeiro acesso) */}
        <Route path="/ativar/:codigo" element={<AtivarContaFarmacia />} />

        {/* Painel da farmácia ou usuário */}
        <Route
          path="/painel-farmacia"
          element={
            token && (tipoLogin === 'farmacia' || tipoLogin === 'usuario')
              ? <PainelFarmacia />
              : <Navigate to="/" />
          }
        />

        {/* Login do admin - acesso manual */}
        <Route path="/login" element={<LoginAdmin />} />

        {/* Geração de serial (rota protegida apenas para admin) */}
        <Route
          path="/gerar"
          element={token && tipoLogin === 'admin' ? <GerarSerial /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}
