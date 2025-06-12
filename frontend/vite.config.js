// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // permite usar @/componente em vez de ../../componente
    }
  },
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist'
  },
  // Essencial para Vercel e React Router: redireciona todas as rotas para index.html
  // quando dá F5 ou acessa direto uma rota
  base: '/',
})
