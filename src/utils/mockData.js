// Mock transaction data
export const mockTransactions = [
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

// Chart data — last 7 days
export const chartData = [
  { day: 'Mon', fraud: 5,  safe: 182 },
  { day: 'Tue', fraud: 8,  safe: 195 },
  { day: 'Wed', fraud: 3,  safe: 210 },
  { day: 'Thu', fraud: 12, safe: 178 },
  { day: 'Fri', fraud: 7,  safe: 203 },
  { day: 'Sat', fraud: 6,  safe: 165 },
  { day: 'Sun', fraud: 6,  safe: 151 },
]

// Globe points
export const globePoints = [
  { lat: 40.7128,  lng: -74.0060, country: 'United States' },
  { lat: 51.5074,  lng: -0.1278,  country: 'United Kingdom' },
  { lat: 48.8566,  lng: 2.3522,   country: 'France' },
  { lat: 52.5200,  lng: 13.4050,  country: 'Germany' },
  { lat: 55.7558,  lng: 37.6176,  country: 'Russia' },
  { lat: 35.6762,  lng: 139.6503, country: 'Japan' },
  { lat: 22.3193,  lng: 114.1694, country: 'Hong Kong' },
  { lat: 1.3521,   lng: 103.8198, country: 'Singapore' },
  { lat: -33.8688, lng: 151.2093, country: 'Australia' },
  { lat: 6.5244,   lng: 3.3792,   country: 'Nigeria' },
  { lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  { lat: 19.4326,  lng: -99.1332, country: 'Mexico' },
  { lat: 28.6139,  lng: 77.2090,  country: 'India' },
  { lat: 39.9042,  lng: 116.4074, country: 'China' },
  { lat: 37.5665,  lng: 126.9780, country: 'South Korea' },
  { lat: 25.2048,  lng: 55.2708,  country: 'UAE' },
  { lat: 59.3293,  lng: 18.0686,  country: 'Sweden' },
]

export const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CISO',
    company: 'NovaPay',
    avatar: 'SC',
    quote: 'FraudGuard AI reduced our false positives by 78% in the first month. The real-time analysis is genuinely impressive.',
  },
  {
    name: 'Marcus Webb',
    role: 'Head of Security',
    company: 'FinTrust Bank',
    avatar: 'MW',
    quote: 'We blocked $2.4M in fraudulent transactions in Q1 alone. The AI accuracy is unlike anything we\'d seen before.',
  },
  {
    name: 'Priya Nair',
    role: 'VP Engineering',
    company: 'TradeSafe',
    avatar: 'PN',
    quote: 'The Claude-powered chatbot helps our analysts understand complex fraud patterns instantly. Game changer.',
  },
]
