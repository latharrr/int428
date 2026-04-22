const router = require('express').Router()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are a strict bank fraud detection AI. Analyze the transaction and reply ONLY with valid JSON.
RULES:
1. High amounts (>50000) at Night/Early Hours = High risk (FRAUD).
2. Amounts >50000 are highly suspicious and often a scam (FRAUD).
3. Unknown or strange locations with Prepaid/Gift cards = High risk (FRAUD).
4. Small amounts (<5000) at normal merchants (Starbucks, Netflix, etc.) during Morning/Afternoon = Low risk (SAFE).

SCHEMA:
{"verdict":"FRAUD"|"SAFE","riskScore":<0-100>,"confidence":"Low"|"Medium"|"High","confidenceLevel":<1-10>,"reason":"<1 clear sentence explaining why>"}
No other text.`

const MAX_TOKENS = 250
const MODEL      = 'llama-3.1-8b-instant'

router.post('/', async (req, res) => {
  try {
    const { transaction } = req.body
    if (!transaction) return res.status(400).json({ error: 'transaction data required' })

    // Compact single-line prompt saves input tokens
    const prompt = `Txn: ₹${transaction.amount} | Merchant: ${transaction.merchant} | Location: ${transaction.location} | Card: ${transaction.cardType} | Time: ${transaction.timeOfDay}`

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

    console.log(`[ANALYZE] tokens — prompt: ${usage?.prompt_tokens} | completion: ${usage?.completion_tokens} | total: ${usage?.total_tokens}`)

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
