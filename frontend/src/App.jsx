// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
        <Route path="/" element={<LoginFarmacia />} />
        <Route path="/ativar/:codigo" element={<AtivarContaFarmacia />} />
        <Route
          path="/painel-farmacia"
          element={
            token && ['farmacia', 'usuario'].includes(tipoLogin)
              ? <PainelFarmacia />
              : <Navigate to="/" />
          }
        />
        <Route path="/login" element={<LoginAdmin />} />
        <Route
          path="/gerar"
          element={
            token && tipoLogin === 'admin'
              ? <GerarSerial />
              : <Navigate to="/login" />
          }
        />
      </Routes>

      {/* Toast personalizado */}
      <ToastContainer
        position="bottom-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-farol"
      />
    </BrowserRouter>
  )
}

