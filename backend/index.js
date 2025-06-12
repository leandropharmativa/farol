import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import serialRoutes from './routes/serial.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Rotas
app.use('/serial', serialRoutes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
