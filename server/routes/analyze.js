const router = require('express').Router()
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are an elite bank fraud detection AI trained on millions of real-world financial fraud cases. Analyze every transaction with extreme precision and reply ONLY with valid JSON — no explanations, no markdown, no extra text.

═══════════════════════════════════════════════════
HARD OVERRIDE RULES (evaluated first, skip AI scoring):
═══════════════════════════════════════════════════
RULE 0 — SELF-TRANSFER EXEMPTION:
  If merchant is "Self Transfer", "Own Account", "Self", "Myself", "Personal Transfer", "My Account", or any clear self-transfer variation → ALWAYS SAFE, riskScore: 0.

RULE 1 — GEO-MISMATCH (Foreign merchant + India location):
  If merchant contains a foreign domain suffix (.uk, .co.uk, .us, .ca, .au, .de, .fr, .eu, .jp, .cn, .nz, .za, .mx) AND location is any Indian city or "India" → ALWAYS FRAUD, riskScore: 95.

═══════════════════════════════════════════════════
FRAUD SIGNALS — Increase risk score for each present:
═══════════════════════════════════════════════════
HIGH-RISK SIGNALS (each adds ~15-25 pts):
  • Amount > ₹50,000 during Night or Early Hours (2–5am)
  • Prepaid or Gift card used at unknown/suspicious merchant
  • Location is outside Delhi/India (e.g. foreign city, unknown location, "Unknown")
  • Transaction in Early Hours (2–5am) with high amount
  • Merchant name contains gibberish, random strings, or looks like a test/fake merchant (e.g. "asdfjkl", "test123", "xxxx")
  • Round-number large amounts (₹100000, ₹500000) from unknown merchants
  • Payment method is Prepaid and merchant is unrecognized
  • Merchant is a crypto exchange, gambling site, or dark web keyword (e.g. "binance", "bet365", "1xbet", "darkweb", "crypto", "coin", "gambling")
  • Location is "Unknown", "N/A", blank, or clearly fake

MEDIUM-RISK SIGNALS (each adds ~8-15 pts):
  • Amount between ₹20,000–₹50,000 at Night
  • Merchant is unfamiliar for India (foreign brand with no India presence)
  • UPI payment with very high amount (> ₹1,00,000)
  • Amex card used at low-end or street-level merchants
  • Multiple red flags but amount is moderate

LOW-RISK / SAFE SIGNALS (reduce risk score):
  • Amount < ₹5,000 at well-known Indian merchants (Flipkart, Amazon, Swiggy, Zomato, BigBasket, Myntra, Ola, Uber, IRCTC, PayTM, PhonePe, BookMyShow)
  • Morning or Afternoon transaction at legitimate merchant
  • Delhi, Mumbai, Bangalore, Hyderabad, or other major Indian city location
  • Visa or Mastercard at reputable merchant
  • Small UPI transactions at food/grocery/transport merchants
  • Transaction amount matches expected price range for the merchant category

═══════════════════════════════════════════════════
MERCHANT REPUTATION GUIDE:
═══════════════════════════════════════════════════
TRUSTED (Indian market):
  Flipkart, Amazon.in, Swiggy, Zomato, BigBasket, Myntra, Meesho, Snapdeal,
  Ola, Uber, Rapido, IRCTC, MakeMyTrip, Goibibo, Yatra,
  PayTM, PhonePe, Google Pay, BHIM, Juspay,
  BookMyShow, Hotstar, Netflix, Spotify, JioCinema,
  Reliance, DMart, More, Spencer's, Lifestyle, Shoppers Stop,
  Apollo Pharmacy, Medplus, 1mg, PharmEasy,
  HDFC, ICICI, SBI, Axis, Kotak (bank transfers)

SUSPICIOUS (needs extra scrutiny):
  Unknown brand names, foreign-sounding brands without .in domain,
  Merchants with no obvious business category,
  Crypto/trading platforms with high amounts

═══════════════════════════════════════════════════
SCORING GUIDE:
═══════════════════════════════════════════════════
  0–20   → SAFE (routine, low-risk transaction)
  21–45  → SAFE (slightly unusual but explainable)
  46–65  → FRAUD (moderate risk, multiple yellow flags)
  66–100 → FRAUD (high risk, clear fraud indicators)

Verdict must match score: score ≥ 46 = "FRAUD", score ≤ 45 = "SAFE"

═══════════════════════════════════════════════════
OUTPUT SCHEMA (strict JSON, nothing else):
═══════════════════════════════════════════════════
{"verdict":"FRAUD"|"SAFE","riskScore":<0-100>,"confidence":"Low"|"Medium"|"High","confidenceLevel":<1-10>,"reason":"<concise 1-2 sentence explanation citing the specific risk signals detected>"}`

const MAX_TOKENS = 300
const MODEL      = 'llama-3.3-70b-versatile'  // upgraded for better accuracy

// ── Hard-coded rule helpers ──────────────────────────────────────────────────

const SELF_TRANSFER_KEYWORDS = [
  'self transfer', 'self-transfer', 'own account', 'my account',
  'myself', 'self', 'own transfer', 'personal transfer',
]

const FOREIGN_MERCHANT_SUFFIXES = [
  '.co.uk', '.org.uk', '.me.uk', '.uk',
  '.com.us', '.co.us', '.us',
  '.ca', '.com.au', '.co.au', '.au',
  '.de', '.fr', '.eu', '.jp', '.cn',
  '.nz', '.za', '.mx', '.ae', '.sg',
  'amazon.uk', 'ebay.co.uk', 'amazon.co.uk',
]

const INDIA_LOCATION_KEYWORDS = [
  'india', 'delhi', 'new delhi', 'mumbai', 'bangalore', 'bengaluru',
  'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad', 'jaipur',
  'surat', 'lucknow', 'kanpur', 'nagpur', 'noida', 'gurgaon', 'gurugram',
  'patna', 'indore', 'bhopal', 'jammu', 'chandigarh', 'coimbatore',
  'visakhapatnam', 'bhubaneswar', 'kochi', 'thiruvananthapuram',
  'vadodara', 'rajkot', 'ludhiana', 'agra', 'varanasi', 'meerut',
]

function isSelfTransfer(merchant = '') {
  const lower = merchant.toLowerCase().trim()
  return SELF_TRANSFER_KEYWORDS.some(kw => lower.includes(kw))
}

function isForeignMerchantInIndia(merchant = '', location = '') {
  const lowerMerchant = merchant.toLowerCase().trim()
  const lowerLocation = location.toLowerCase().trim()
  const hasForeignDomain = FOREIGN_MERCHANT_SUFFIXES.some(sfx => lowerMerchant.includes(sfx))
  const isInIndia = INDIA_LOCATION_KEYWORDS.some(kw => lowerLocation.includes(kw))
  return hasForeignDomain && isInIndia
}

// ── Route ────────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const { transaction } = req.body
    if (!transaction) return res.status(400).json({ error: 'transaction data required' })

    const { amount, merchant, location, cardType, timeOfDay } = transaction

    // ── HARD RULE 0: Self-transfer → always SAFE ─────────────────────────────
    if (isSelfTransfer(merchant)) {
      console.log(`[ANALYZE] Self-transfer -> instant SAFE`)
      return res.json({
        verdict: 'SAFE',
        riskScore: 0,
        confidence: 'High',
        confidenceLevel: 10,
        reason: 'Self-transfer to own account is always safe and exempt from all fraud checks regardless of amount, time, or location.',
      })
    }

    // ── HARD RULE 1: Foreign merchant + India location → always FRAUD ─────────
    if (isForeignMerchantInIndia(merchant, location)) {
      console.log(`[ANALYZE] Foreign merchant in India -> instant FRAUD`)
      return res.json({
        verdict: 'FRAUD',
        riskScore: 95,
        confidence: 'High',
        confidenceLevel: 10,
        reason: `Geo-mismatch fraud detected: "${merchant}" is a foreign-domain merchant being used from an Indian location (${location}), which is a strong indicator of account compromise or unauthorized access.`,
      })
    }

    // ── AI ANALYSIS ──────────────────────────────────────────────────────────
    const prompt = [
      `Transaction Details:`,
      `  Amount:         ₹${Number(amount).toLocaleString('en-IN')}`,
      `  Merchant:       ${merchant}`,
      `  Location:       ${location}`,
      `  Payment Method: ${cardType}`,
      `  Time of Day:    ${timeOfDay}`,
      ``,
      `Analyze ALL signals and return verdict JSON.`,
    ].join('\n')

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
    console.log(`[ANALYZE] ${merchant} | ₹${amount} | ${location} | ${cardType} | ${timeOfDay}`)
    console.log(`[ANALYZE] tokens => prompt:${usage?.prompt_tokens} completion:${usage?.completion_tokens} total:${usage?.total_tokens}`)

    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in AI response')
    const parsed = JSON.parse(match[0])

    res.json(parsed)
  } catch (err) {
    console.error('[ANALYZE] Error:', err.status || '', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
