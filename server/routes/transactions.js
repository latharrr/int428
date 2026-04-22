const router = require('express').Router()

let transactions = [
  { id: 'TXN-8821', amount: '₹1,45,000', merchant: 'Bank Transfer', location: 'Patna, IN', status: 'FRAUD', risk: 94 },
  { id: 'TXN-8820', amount: '₹899.00',   merchant: 'Amazon.in',     location: 'Delhi, IN', status: 'SAFE', risk: 3 },
  { id: 'TXN-8819', amount: '₹5,00,000', merchant: 'Wire Transfer', location: 'Jaipur, IN',  status: 'FRAUD', risk: 88 },
  { id: 'TXN-8818', amount: '₹345.00',   merchant: 'Starbucks',     location: 'Mumbai, IN',    status: 'SAFE', risk: 2 },
  { id: 'TXN-8817', amount: '₹85,000',   merchant: 'Crypto Exchange', location: 'Unknown',    status: 'FRAUD', risk: 79 },
  { id: 'TXN-8816', amount: '₹649.00',   merchant: 'Netflix',       location: 'Bangalore, IN',     status: 'SAFE', risk: 5 },
  { id: 'TXN-8815', amount: '₹12,500',   merchant: 'MakeMyTrip',    location: 'Chennai, IN',  status: 'SAFE', risk: 18 },
  { id: 'TXN-8814', amount: '₹95,000',   merchant: 'Gift Cards x50',location: 'Kolkata, IN', status: 'FRAUD', risk: 97 },
  { id: 'TXN-8813', amount: '₹450.00',   merchant: 'Zomato',        location: 'Pune, IN',status: 'SAFE', risk: 4 },
  { id: 'TXN-8812', amount: '₹8,990',    merchant: 'Croma Retail',  location: 'Hyderabad, IN',  status: 'SAFE', risk: 12 },
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

module.exports = router
