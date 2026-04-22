import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import Navbar from '../components/Navbar.jsx'
import Globe from '../components/Globe.jsx'
import { testimonials } from '../utils/mockData.js'

// Animated counter hook
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const isFloat = String(target).includes('.')
    const animate = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const val = isFloat
        ? (progress * parseFloat(target)).toFixed(1)
        : Math.floor(progress * target)
      setCount(val)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [start, target, duration])
  return count
}

// Particle canvas background
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 175, 55,${p.opacity})`
        ctx.fill()
      })
      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(212, 175, 55,${0.05 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="particle-canvas" />
}

const features = [
  { icon: 'I.', title: 'Real-Time Analysis', desc: 'Sub-50ms transaction scoring with our distributed AI inference pipeline. Never miss a fraudulent pattern.' },
  { icon: 'II.', title: 'AI Risk Scoring', desc: 'Advanced risk models trained on millions of fraud patterns. Dynamic scoring from 0–100%.' },
  { icon: 'III.', title: 'Instant Alerts', desc: 'Immediate notifications via secure channels the moment suspicious activity is detected.' },
]

const stats = [
  { label: 'Detection Accuracy', value: 99.4, suffix: '%', isFloat: true },
  { label: 'Transactions Analyzed', value: 2000000, suffix: '+', prefix: '' },
  { label: 'Countries Covered', value: 150, suffix: '+' },
  { label: 'Response Time', value: 50, suffix: 'ms', prefix: '<' },
]

function StatItem({ stat, start }) {
  const raw = useCountUp(stat.value, 1800, start)
  const display = stat.value >= 1000000
    ? `${(raw / 1000000).toFixed(1)}M`
    : raw
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass"
      style={{ padding: '32px 24px', textAlign: 'center', borderRadius: 8 }}
    >
      <div style={{ fontSize: 44, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'serif' }}>
        {stat.prefix}{display}{stat.suffix}
      </div>
      <div style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>{stat.label}</div>
    </motion.div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true })
  const [testimonialIdx, setTestimonialIdx] = useState(0)

  // Auto-scroll testimonials
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 100 }}
        className="grid-bg"
      >

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 860, padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4, padding: '6px 16px', marginBottom: 28, fontSize: 11, color: '#a3a3a3', letterSpacing: '0.05em', textTransform: 'uppercase'
            }}
          >
            <span style={{ color: '#ef4444' }}>●</span> LIVE: 1,247 anomalies detected today
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.03em' }}
          >
            Detect Fraud<br />
            <span className="gradient-text">Before It Strikes</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{ fontSize: 18, color: '#a3a3a3', marginBottom: 40, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 40px', fontWeight: 400 }}
          >
            Institutional-grade transaction risk analysis. Secure your financial infrastructure with adaptive intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <button id="hero-cta-trial" className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => navigate('/login')}>
              Start Free Trial
            </button>
            <button id="hero-cta-demo" className="btn-outline" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => document.getElementById('globe-section')?.scrollIntoView({ behavior: 'smooth' })}>
              View Platform
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ marginTop: 20, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(212,175,55,0.5), transparent)', marginBottom: 20 }} />
            {/* Embedded Globe */}
            <Globe />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Why <span className="gradient-text">FraudGuard AI</span>?
          </h2>
          <p style={{ color: '#64748b', fontSize: 17 }}>Three pillars of enterprise-grade fraud prevention</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24 }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -4, borderColor: 'rgba(212, 175, 55, 0.3)' }}
              className="glass"
              style={{ padding: '36px 28px', borderRadius: 8, cursor: 'default', transition: 'all 0.3s' }}
            >
              <div style={{ fontSize: 24, marginBottom: 20, color: 'var(--color-primary)', fontFamily: 'serif' }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: '#ffffff' }}>{f.title}</h3>
              <p style={{ color: '#a3a3a3', lineHeight: 1.7, fontSize: 15 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section id="stats" ref={statsRef} style={{ padding: '80px 24px', background: 'rgba(13,17,32,0.5)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontSize: 44, fontWeight: 800, marginBottom: 60, letterSpacing: '-0.02em' }}>
            Trusted by <span className="gradient-text">Security Teams</span> Worldwide
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {stats.map(s => <StatItem key={s.label} stat={s} start={statsInView} />)}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section id="testimonials" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontSize: 44, fontWeight: 800, marginBottom: 60, letterSpacing: '-0.02em' }}>
          What Our <span className="gradient-text">Customers Say</span>
        </motion.h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24 }}>
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass"
              style={{ padding: '32px 28px', borderRadius: 20, textAlign: 'left', transition: 'border-color 0.3s' }}
              whileHover={{ borderColor: 'rgba(212, 175, 55,0.2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, fontSize: 16, color: '#050505',
                }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{t.role} · {t.company}</div>
                </div>
              </div>
              <div style={{ color: '#94a3b8', lineHeight: 1.8, fontSize: 14, fontStyle: 'italic' }}>
                "{t.quote}"
              </div>
              <div style={{ marginTop: 16, color: '#f59e0b', fontSize: 14 }}>★★★★★</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: '#ffffff', marginBottom: 12, letterSpacing: '0.05em' }}>
          FRAUD<span style={{ color: 'var(--color-primary)' }}>GUARD</span>
        </div>
        <div style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>Institutional-grade financial security infrastructure.</div>
        <div style={{ color: '#444', fontSize: 12 }}>© 2026 FraudGuard Systems.</div>
      </footer>
    </div>
  )
}
