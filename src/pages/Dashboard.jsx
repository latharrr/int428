import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import toast from 'react-hot-toast'
import StatCard from '../components/StatCard.jsx'
import TransactionTable from '../components/TransactionTable.jsx'
import ChatBot from '../components/ChatBot.jsx'
import { chartData } from '../utils/mockData.js'
import { analyzeTransaction, getTransactions, addTransaction, updateTransactionStatus } from '../utils/claudeApi.js'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '▣' },
  { id: 'transactions', label: 'Transactions', icon: '≡' },
  { id: 'analytics', label: 'Analytics', icon: '◈' },
  { id: 'ai', label: 'AI Assistance', icon: '◎' },
  { id: 'settings', label: 'Settings', icon: '◧' },
]

function Sidebar({ active, setActive, onLogout, user }) {
  return (
    <div className="sidebar" style={{
      width: 250, minHeight: '100vh', padding: '24px 16px',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 32 }}>
        <span style={{ fontSize: 24 }}></span>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#e2e8f0' }}>
          FRAUD<span style={{ color: 'var(--color-primary)' }}>GUARD</span>
        </span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => setActive(item.id)}
            className={`sidebar-link ${active === item.id ? 'active' : ''}`}
            style={{ border: 'none', fontFamily: 'inherit', fontSize: 14, width: '100%', textAlign: 'left' }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {active === item.id && (
              <motion.div
                layoutId="activeIndicator"
                style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: 'var(--color-primary)' }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14, color: '#050505',
          }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#4b5563' }}>Admin</div>
          </div>
        </div>
        <button
          id="logout-btn"
          onClick={onLogout}
          style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, padding: '10px', cursor: 'pointer',
            color: '#ef4444', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

// ──── Transaction Analyzer ────
function TransactionAnalyzer({ onAnalyzed }) {
  const [form, setForm] = useState({ amount: '', merchant: '', location: '', cardType: 'Visa', timeOfDay: 'Morning' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Analyzing...')
  const [riskWidth, setRiskWidth] = useState(0)

  const cardTypes = ['Visa', 'Mastercard', 'Amex', 'Discover', 'Prepaid', 'UPI']
  const times = ['Morning', 'Afternoon', 'Evening', 'Night', 'Early Hours (2-5am)']

  const analyze = async () => {
    if (!form.amount || !form.merchant || !form.location) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    setResult(null)
    setRiskWidth(0)

    // Simulate checking web services by cycling text
    const texts = [
      '🔍 Checking Google Safe Browsing...',
      '🌐 Cross-referencing Interpol DB...',
      'Verifying Merchant Reputation...',
      '🤖 Finalizing Groq AI Analysis...',
    ]
    let step = 0
    setLoadingText(texts[0])
    const interval = setInterval(() => {
      step = Math.min(step + 1, texts.length - 1)
      setLoadingText(texts[step])
    }, 400) // fast cycle

    try {
      const res = await analyzeTransaction(form)
      clearInterval(interval)
      setResult(res)
      setTimeout(() => setRiskWidth(res.riskScore), 100)
      
      if (onAnalyzed) {
        onAnalyzed({
          amount: `₹${parseInt(form.amount).toLocaleString('en-IN')}`,
          merchant: form.merchant,
          location: form.location,
          status: res.verdict,
          risk: res.riskScore
        })
      }
    } catch (err) {
      clearInterval(interval)
      toast.error('Analysis failed. Is the backend running?')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 24, transition: 'all 0.4s' }}>
      {/* Form */}
      <div className="glass" style={{ padding: 28, borderRadius: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#e2e8f0' }}>
          Transaction Analyzer
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Amount (₹)', key: 'amount', placeholder: 'e.g. 65000', type: 'number' },
            { label: 'Merchant Name', key: 'merchant', placeholder: 'e.g. Flipkart' },
            { label: 'Location', key: 'location', placeholder: 'e.g. Delhi, India' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
              <input
                id={`analyzer-${f.key}`}
                className="input-field"
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Method</label>
              <select id="analyzer-card-type" className="input-field" value={form.cardType} onChange={e => setForm(p => ({ ...p, cardType: e.target.value }))} style={{ colorScheme: 'dark' }}>
                {cardTypes.map(c => <option key={c} value={c} style={{ background: '#0d1120', color: '#e2e8f0' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time of Day</label>
              <select id="analyzer-time" className="input-field" value={form.timeOfDay} onChange={e => setForm(p => ({ ...p, timeOfDay: e.target.value }))} style={{ colorScheme: 'dark' }}>
                {times.map(t => <option key={t} value={t} style={{ background: '#0d1120', color: '#e2e8f0' }}>{t}</option>)}
              </select>
            </div>
          </div>

          <motion.button
            id="analyze-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={analyze}
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? loadingText : 'Run Fraud Analysis'}
          </motion.button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="glass"
            style={{ padding: 28, borderRadius: 20 }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#e2e8f0' }}>
              AI Analysis Result
            </h3>

            {/* Verdict */}
            <div style={{
              padding: '20px',
              borderRadius: 16,
              background: result.verdict === 'FRAUD' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
              border: `1px solid ${result.verdict === 'FRAUD' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
              textAlign: 'center', marginBottom: 24,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', color: result.verdict === 'FRAUD' ? '#ef4444' : '#10b981', marginBottom: 8, textTransform: 'uppercase' }}>{result.verdict === 'FRAUD' ? 'Alert' : 'Cleared'}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: result.verdict === 'FRAUD' ? '#ef4444' : '#10b981', letterSpacing: '0.05em' }}>
                {result.verdict}
              </div>
            </div>

            {/* Risk bar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Score</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: result.riskScore > 70 ? '#ef4444' : result.riskScore > 30 ? '#f59e0b' : '#10b981' }}>
                  {result.riskScore}%
                </span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                <div
                  className="risk-bar-fill"
                  style={{
                    width: `${riskWidth}%`,
                    background: result.riskScore > 70
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : result.riskScore > 30
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #10b981, #059669)',
                  }}
                />
              </div>
            </div>

            {/* Confidence */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</span>
                <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>{result.confidence || 'High'}</span>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      flex: 1, height: 24, borderRadius: 3,
                      background: i < (result.confidenceLevel || 9) ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                      opacity: i < (result.confidenceLevel || 9) ? 0.8 : 1,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Reason */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>AI Reasoning</div>
              <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>{result.reason}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ──── Analytics Tab ────
function Analytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="glass" style={{ padding: 28, borderRadius: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 24, color: '#e2e8f0' }}>7-Day Fraud vs Safe Transactions</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#4b5563" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis stroke="#4b5563" tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: '#0d1120', border: '1px solid rgba(212, 175, 55,0.2)', borderRadius: 12, color: '#e2e8f0', fontFamily: 'Space Grotesk' }}
            />
            <Legend wrapperStyle={{ color: '#64748b', fontSize: 13 }} />
            <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="safe" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="glass" style={{ padding: 28, borderRadius: 20 }}>
          <h4 style={{ fontWeight: 600, marginBottom: 16, color: '#e2e8f0' }}>Top Fraud Locations</h4>
          {[['Delhi, IN', 28], ['Jammu, IN', 22], ['Kolkata, IN', 18], ['Unknown', 16], ['Patna, IN', 14]].map(([loc, pct]) => (
            <div key={loc} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{loc}</span>
                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#ef4444', borderRadius: 3, opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="glass" style={{ padding: 28, borderRadius: 20 }}>
          <h4 style={{ fontWeight: 600, marginBottom: 16, color: '#e2e8f0' }}>Fraud by Card Type</h4>
          {[['Prepaid', 40], ['Debit', 28], ['Credit', 20], ['Gift Card', 12]].map(([type, pct]) => (
            <div key={type} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{type}</span>
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${pct}%`, background: '#f59e0b', borderRadius: 3, opacity: 0.7 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ──── Settings Tab ────
function Settings({ user }) {
  return (
    <div className="glass" style={{ padding: 32, borderRadius: 20, maxWidth: 600 }}>
      <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 28, color: '#e2e8f0' }}>Account Settings</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[
          { label: 'Full Name', value: user?.name || 'Jay', id: 'settings-name' },
          { label: 'Email Address', value: user?.email || 'admin@fraudguard.ai', id: 'settings-email' },
          { label: 'Organization', value: 'FraudGuard AI', id: 'settings-org' },
          { label: 'API Key', value: '••••••••••••••••••••••••', id: 'settings-api-key' },
        ].map(f => (
          <div key={f.id}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</label>
            <input id={f.id} className="input-field" defaultValue={f.value} />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn-primary" style={{ padding: '11px 24px', fontSize: 14 }} onClick={() => toast.success('Settings saved!')}>Save Changes</button>
          <button className="btn-outline" style={{ padding: '11px 24px', fontSize: 14 }}>Reset</button>
        </div>
      </div>
    </div>
  )
}

// ──── Dashboard Home ────
function DashboardHome({ user, transactions }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>
          {greeting}, {user?.name}
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Fraud overview for today</p>
      </motion.div>

      {/* Stat cards — computed from real transaction data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon="#" label="Total Transactions" value={transactions.length} color="var(--color-primary)" index={0} />
        <StatCard icon="!" label="Fraudulent Detected" value={transactions.filter(t => t.status === 'FRAUD').length} color="#ef4444" index={1} />
        <StatCard icon="+" label="Safe Transactions" value={transactions.filter(t => t.status === 'SAFE').length} color="#10b981" index={2} />
        <StatCard icon="~" label="Pending Analysis" value={transactions.filter(t => !t.status).length} color="#f59e0b" index={3} />
      </div>

      {/* Chart */}
      <div className="glass" style={{ padding: 28, borderRadius: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 24, color: '#e2e8f0' }}>Fraud vs Safe — Last 7 Days</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="day" stroke="#4b5563" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis stroke="#4b5563" tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#0d1120', border: '1px solid rgba(212, 175, 55,0.2)', borderRadius: 12, color: '#e2e8f0', fontFamily: 'Space Grotesk' }} />
            <Legend wrapperStyle={{ color: '#64748b', fontSize: 13 }} />
            <Line type="monotone" dataKey="fraud" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} name="Fraud" />
            <Line type="monotone" dataKey="safe" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} name="Safe" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent transactions */}
      <div className="glass" style={{ padding: 28, borderRadius: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 20, color: '#e2e8f0' }}>Recent Transactions</h3>
        <TransactionTable transactions={transactions} />
      </div>

    </div>
  )
}

// ──── MAIN DASHBOARD ────
export default function Dashboard() {
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')
  const [transactions, setTransactions] = useState([])
  const analyzingRef = useRef(new Set()) // track IDs currently being analyzed
  const user = JSON.parse(localStorage.getItem('fg_user') || '{}')

  useEffect(() => {
    getTransactions().then(async (txns) => {
      setTransactions(txns)

      // Auto-analyze any transaction that has no status yet via real API call
      const unanalyzed = txns.filter(t => !t.status)
      if (unanalyzed.length === 0) return

      for (const txn of unanalyzed) {
        if (analyzingRef.current.has(txn.id)) continue
        analyzingRef.current.add(txn.id)

        try {
          const result = await analyzeTransaction({
            amount: txn.amount,
            merchant: txn.merchant,
            location: txn.location,
            cardType: txn.cardType || 'Visa',
            timeOfDay: txn.timeOfDay || 'Morning',
          })

          const status = result.verdict
          const risk = result.riskScore

          // Update server
          await updateTransactionStatus(txn.id, status, risk)

          // Update UI
          setTransactions(prev =>
            prev.map(t => t.id === txn.id ? { ...t, status, risk } : t)
          )
        } catch (err) {
          console.error(`Auto-analyze failed for ${txn.id}:`, err.message)
        } finally {
          analyzingRef.current.delete(txn.id)
        }
      }
    }).catch(console.error)
  }, [])

  const handleTransactionAnalyzed = async (txn) => {
    try {
      const newTxn = await addTransaction(txn)
      setTransactions(prev => [newTxn, ...prev])
      toast.success('Transaction saved to records')
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('fg_token')
    localStorage.removeItem('fg_user')
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const renderContent = () => {
    switch (active) {
      case 'dashboard': return <DashboardHome user={user} transactions={transactions} />
      case 'transactions': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0' }}>Transactions & Analysis</h1>
          <TransactionAnalyzer onAnalyzed={handleTransactionAnalyzed} />
          <div className="glass" style={{ padding: 24, borderRadius: 20 }}><TransactionTable transactions={transactions} /></div>
        </div>
      )
      case 'analytics': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0' }}>Analytics</h1>
          <Analytics />
        </div>
      )
      case 'ai': return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0' }}>AI Assistance</h1>
          <div className="glass" style={{ flex: 1, borderRadius: 20, overflow: 'hidden', minHeight: 600 }}>
            <ChatBot inline />
          </div>
        </div>
      )
      case 'settings': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0' }}>Settings</h1>
          <Settings user={user} />
        </div>
      )
      default: return null
    }
  }

  return (
    <div style={{ display: 'flex', background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Sidebar active={active} setActive={setActive} onLogout={handleLogout} user={user} />

      {/* Main content */}
      <main style={{ marginLeft: 250, flex: 1, padding: '32px 36px', minHeight: '100vh', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {active !== 'ai' && <ChatBot />}
    </div>
  )
}
