import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'

import LoginAdmin from './pages/LoginAdmin'
import GerarSerial from './pages/GerarSerial'
import LoginFarmacia from './pages/LoginFarmacia'
import AtivarContaFarmacia from './pages/AtivarContaFarmacia'
import PainelFarmacia from './pages/PainelFarmacia' // Adicione este arquivo com tela inicial pós-login
import { getToken } from './utils/auth'

export default function App() {
  const token = getToken()

  return (
    <BrowserRouter>
      <Routes>
        {/* Página inicial padrão: login da farmácia */}
        <Route path="/" element={<LoginFarmacia />} />

        {/* Ativação da conta da farmácia (primeiro acesso) */}
        <Route path="/ativar/:codigo" element={<AtivarContaFarmacia />} />

        {/* Painel da farmácia após login */}
        <Route path="/painel-farmacia" element={<PainelFarmacia />} />

        {/* Login do admin - acesso manual */}
        <Route path="/login" element={<LoginAdmin />} />

        {/* Geração de serial (rota protegida) */}
        <Route
          path="/gerar"
          element={token ? <GerarSerial /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}
