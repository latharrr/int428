const router = require('express').Router()

// Seeded transactions WITHOUT pre-set status/risk — they will be analyzed via API on the client
let transactions = [
  { id: 'TXN-8821', amount: 145000, merchant: 'Bank Transfer',   location: 'Patna, IN',     cardType: 'Visa',       timeOfDay: 'Night',              status: null, risk: null },
  { id: 'TXN-8820', amount: 899,    merchant: 'Amazon.in',       location: 'Delhi, IN',     cardType: 'Visa',       timeOfDay: 'Afternoon',          status: null, risk: null },
  { id: 'TXN-8819', amount: 500000, merchant: 'Wire Transfer',   location: 'Jaipur, IN',    cardType: 'Visa',       timeOfDay: 'Early Hours (2-5am)', status: null, risk: null },
  { id: 'TXN-8818', amount: 345,    merchant: 'Starbucks',       location: 'Mumbai, IN',    cardType: 'Mastercard', timeOfDay: 'Morning',            status: null, risk: null },
  { id: 'TXN-8817', amount: 85000,  merchant: 'Crypto Exchange', location: 'Unknown',       cardType: 'Prepaid',    timeOfDay: 'Night',              status: null, risk: null },
  { id: 'TXN-8816', amount: 649,    merchant: 'Netflix',         location: 'Delhi, IN',     cardType: 'Visa',       timeOfDay: 'Evening',            status: null, risk: null },
  { id: 'TXN-8815', amount: 12500,  merchant: 'MakeMyTrip',      location: 'Chennai, IN',   cardType: 'Credit',     timeOfDay: 'Morning',            status: null, risk: null },
  { id: 'TXN-8814', amount: 95000,  merchant: 'Gift Cards x50',  location: 'Kolkata, IN',   cardType: 'Prepaid',    timeOfDay: 'Night',              status: null, risk: null },
  { id: 'TXN-8813', amount: 450,    merchant: 'Zomato',          location: 'Delhi, IN',     cardType: 'Visa',       timeOfDay: 'Afternoon',          status: null, risk: null },
  { id: 'TXN-8812', amount: 8990,   merchant: 'Croma Retail',    location: 'Delhi, IN',     cardType: 'Mastercard', timeOfDay: 'Morning',            status: null, risk: null },
]

router.get('/', (req, res) => {
  res.json(transactions)
})

router.post('/', (req, res) => {
  const newTxn = {
    id: `TXN-${Math.floor(Math.random() * 9000) + 1000}`,
    ...req.body
  }
  transactions.unshift(newTxn)
  res.json(newTxn)
})

// PATCH /:id — update status/risk after client-side analysis
router.patch('/:id', (req, res) => {
  const { id } = req.params
  const { status, risk } = req.body
  const txn = transactions.find(t => t.id === id)
  if (!txn) return res.status(404).json({ error: 'Transaction not found' })
  txn.status = status
  txn.risk = risk
  res.json(txn)
})

module.exports = router
