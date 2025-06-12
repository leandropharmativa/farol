// backend/routes/serial.js

import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db.js'

const router = express.Router()

// 🔐 ROTA: POST /serial/gerar
// Geração de novo serial para ativação de farmácias
router.post('/gerar', async (req, res) => {
  const { nomeEmpresa, email, validadeDias } = req.body

  // Gera código no formato: FARM-XXXX-YYYY
  const codigo = `FARM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  
  // Define validade com base nos dias informados (padrão: 30 dias)
  const validade = new Date()
  validade.setDate(validade.getDate() + (validadeDias || 30))

  try {
    // Insere na tabela farol_seriais
    await pool.query(`
      INSERT INTO farol_seriais (id, codigo, nome_empresa, email_vinculado, validade_ate, ativo)
      VALUES ($1, $2, $3, $4, $5, true)
    `, [uuidv4(), codigo, nomeEmpresa, email, validade])

    res.json({ status: 'ok', codigo })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'erro', mensagem: 'Erro ao gerar serial' })
  }
})

// 🔍 ROTA: POST /serial/validar
// Validação do serial antes de ativar uma nova farmácia
router.post('/validar', async (req, res) => {
  const { codigo, email } = req.body

  try {
    // Verifica se existe um serial válido para o e-mail informado
    const result = await pool.query(`
      SELECT * FROM farol_seriais
      WHERE codigo = $1 AND email_vinculado = $2
        AND ativo = true AND validade_ate >= NOW() AND farmacia_id IS NULL
    `, [codigo, email])

    if (result.rows.length === 0) {
      return res.status(400).json({ status: 'erro', mensagem: 'Serial inválido, expirado ou já utilizado.' })
    }

    res.json({ status: 'ok', nomeEmpresa: result.rows[0].nome_empresa })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'erro', mensagem: 'Erro ao validar serial' })
  }
})

export default router
