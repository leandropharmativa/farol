import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import React from 'react'

import LoginAdmin from './pages/LoginAdmin'
import GerarSerial from './pages/GerarSerial'
import { getToken } from './utils/auth'

export default function App() {
  const token = getToken()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginAdmin />} />
        <Route
          path="/gerar"
          element={token ? <GerarSerial /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  )
}
