const router = require('express').Router()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are a strict bank fraud detection AI. Analyze the transaction and reply ONLY with valid JSON.

OVERRIDE RULE (highest priority):
RULE 0 — SELF-TRANSFER EXEMPTION: If the merchant is "Self Transfer", "Own Account", "Self", "Myself", or any variation indicating the user is transferring money to their own account, it is ALWAYS SAFE with riskScore 0 regardless of amount, location, time, or any other factor. Never flag self-transfers as fraud.

STANDARD RULES:
1. High amounts (>50000) at Night/Early Hours = High risk (FRAUD).
2. Unknown or strange locations with Prepaid/Gift cards = High risk (FRAUD).
3. Small amounts (<5000) at normal merchants (Starbucks, Netflix, etc.) during Morning/Afternoon = Low risk (SAFE).

SCHEMA:
{"verdict":"FRAUD"|"SAFE","riskScore":<0-100>,"confidence":"Low"|"Medium"|"High","confidenceLevel":<1-10>,"reason":"<1 clear sentence explaining why>"}
No other text.`

const MAX_TOKENS = 250
const MODEL      = 'llama-3.1-8b-instant'

// Keywords that indicate a self-transfer
const SELF_TRANSFER_KEYWORDS = [
  'self transfer', 'self-transfer', 'own account', 'my account',
  'myself', 'self', 'own transfer', 'personal transfer',
]

function isSelfTransfer(merchant = '') {
  const lower = merchant.toLowerCase().trim()
  return SELF_TRANSFER_KEYWORDS.some(kw => lower.includes(kw))
}

router.post('/', async (req, res) => {
  try {
    const { transaction } = req.body
    if (!transaction) return res.status(400).json({ error: 'transaction data required' })

    // ── HARD RULE: Self-transfer → always SAFE, skip AI entirely ────────────
    if (isSelfTransfer(transaction.merchant)) {
      console.log(`[ANALYZE] Self-transfer detected -> instant SAFE (no AI call)`)
      return res.json({
        verdict: 'SAFE',
        riskScore: 0,
        confidence: 'High',
        confidenceLevel: 10,
        reason: 'Self-transfer to own account is always considered safe and is exempt from all fraud checks regardless of amount or time.',
      })
    }

    // ── AI ANALYSIS: all other transactions go through Groq ─────────────────
    const prompt = `Txn: Rs.${transaction.amount} | Merchant: ${transaction.merchant} | Location: ${transaction.location} | Card: ${transaction.cardType} | Time: ${transaction.timeOfDay}`

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_completion_tokens: MAX_TOKENS,
      temperature: 0,
      top_p: 1,
      stop: null,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt },
      ],
    })

    const raw   = response.choices[0]?.message?.content?.trim() || '{}'
    const usage = response.usage

    console.log(`[ANALYZE] tokens - prompt: ${usage?.prompt_tokens} | completion: ${usage?.completion_tokens} | total: ${usage?.total_tokens}`)

    // Safe JSON extraction
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')
    const parsed = JSON.parse(match[0])

    res.json(parsed)
  } catch (err) {
    console.error('Analyze error:', err.status || '', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
