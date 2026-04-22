import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const CREDENTIALS = { email: 'admin@fraudguard.ai', password: 'password123' }

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate async auth
    await new Promise(r => setTimeout(r, 900))
    if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
      localStorage.setItem('fg_token', 'mock-jwt-token')
      localStorage.setItem('fg_user', JSON.stringify({ name: 'Deepanshu', email: 'admin@fraudguard.ai' }))
      toast.success('Welcome back, Deepanshu! 🛡️')
      navigate('/dashboard')
    } else {
      toast.error('Invalid credentials. Try admin@fraudguard.ai / password123')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}
      className="grid-bg"
    >
      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212, 175, 55,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass"
        style={{ width: '100%', maxWidth: 420, padding: '44px 40px', margin: 20 }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}></div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
            FRAUD<span style={{ color: 'var(--color-primary)' }}>GUARD</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <input
              id="login-email"
              className="input-field"
              type="email"
              placeholder="admin@fraudguard.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <input
              id="login-password"
              className="input-field"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Hint */}
          <div style={{
            background: 'rgba(212, 175, 55,0.05)', border: '1px solid rgba(212, 175, 55,0.15)',
            borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#64748b', lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--color-primary)' }}>Demo credentials:</strong><br />
            admin@fraudguard.ai<br />
            password123
          </div>

          <motion.button
            id="login-submit"
            type="submit"
            className="btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '🔄 Authenticating...' : '🔐 Sign In'}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#374151' }}>
          Don't have an account?{' '}
          <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }} onClick={() => navigate('/')}>
            Back to Home
          </span>
        </div>
      </motion.div>
    </div>
  )
}
