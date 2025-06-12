import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db.js'

const router = express.Router()

// Geração de novo serial (para admin)
router.post('/gerar', async (req, res) => {
  const { nomeEmpresa, email, validadeDias } = req.body
  const codigo = `FARM-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  const validade = new Date()
  validade.setDate(validade.getDate() + (validadeDias || 30))

  try {
    await pool.query(`
      INSERT INTO seriais (id, codigo, nome_empresa, email_vinculado, validade_ate, ativo)
      VALUES ($1, $2, $3, $4, $5, true)
    `, [uuidv4(), codigo, nomeEmpresa, email, validade])

    res.json({ status: 'ok', codigo })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'erro', mensagem: 'Erro ao gerar serial' })
  }
})

// Validação de serial no momento de ativação
router.post('/validar', async (req, res) => {
  const { codigo, email } = req.body

  try {
    const result = await pool.query(`
      SELECT * FROM farol_seriais
      WHERE codigo = $1 AND email_vinculado = $2 AND ativo = true AND validade_ate >= NOW() AND farmacia_id IS NULL
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
