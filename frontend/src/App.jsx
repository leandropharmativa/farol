import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import React from 'react'

import LoginAdmin from './pages/LoginAdmin'
import GerarSerial from './pages/GerarSerial'
import LoginFarmacia from './pages/LoginFarmacia'
import AtivarContaFarmacia from './pages/AtivarContaFarmacia'
import { getToken } from './utils/auth'

export default function App() {
  const token = getToken()

  return (
    <BrowserRouter>
<Routes>
<Route path="/farmacia" element={<LoginFarmacia />} />
<Route path="/ativar/:codigo" element={<AtivarContaFarmacia />} />
<Route path="/login-farmacia" element={<TelaLoginComEmailSenha />} />
  
  <Route path="/" element={<LoginAdmin />} />
  <Route path="/login" element={<LoginAdmin />} />
  <Route
    path="/gerar"
    element={token ? <GerarSerial /> : <Navigate to="/" />}
  />
</Routes>

    </BrowserRouter>
  )
}
