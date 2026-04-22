const express = require('express')
const cors    = require('cors')
require('dotenv').config({ override: true })

const chatRouter    = require('./routes/chat')
const analyzeRouter = require('./routes/analyze')

const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }))
app.use(express.json())

app.use('/api/chat',    chatRouter)
app.use('/api/analyze', analyzeRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', model: 'llama-3.1-8b-instant (Groq)', message: 'FraudGuard AI Backend Running ✅' })
})

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🛡️  FraudGuard AI Backend — Groq Edition`)
    console.log(`✅  Server: http://localhost:${PORT}`)
    console.log(`⚡  Model : llama-3.1-8b-instant (Groq fastest ~750 tok/s)`)
    console.log(`🔑  Groq Key: ${process.env.GROQ_API_KEY ? 'Loaded ✅' : '⚠️  MISSING — add GROQ_API_KEY to .env'}`)
    console.log(`💡  Limits: chat ≤ 300 tokens | analyze ≤ 200 tokens | history ≤ 4 msgs\n`)
  })
}

module.exports = app;
