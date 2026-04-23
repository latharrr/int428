const router = require('express').Router()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Tight system prompt — shorter = fewer tokens consumed
const SYSTEM_PROMPT = `You are FraudGuard AI, a fraud detection assistant for Jay.
Reply in 1-2 lines only. Be direct. Expand only if the user explicitly asks for more details or explanation.`

// ── Token-saving limits ──────────────────────────────────────────────────────
const MAX_TOKENS   = 300  // hard cap per response
const HISTORY_KEEP = 4    // trim to last 4 msgs — saves input tokens
const MODEL        = 'llama-3.1-8b-instant'  // Groq's fastest ~750 tok/s

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' })
    }

    // Trim history — only keep last HISTORY_KEEP messages to save input tokens
    const trimmed = messages.slice(-HISTORY_KEEP)

    const response = await groq.chat.completions.create({
      model: MODEL,
      max_completion_tokens: MAX_TOKENS,
      temperature: 1,
      top_p: 1,
      stop: null,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...trimmed.map(m => ({ role: m.role, content: m.content })),
      ],
    })

    const content = response.choices[0]?.message?.content || 'No response generated.'
    const usage   = response.usage

    console.log(`[CHAT] tokens — prompt: ${usage?.prompt_tokens} | completion: ${usage?.completion_tokens} | total: ${usage?.total_tokens}`)

    res.json({ content })
  } catch (err) {
    console.error('Chat error:', err.status, err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
