import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,11,20,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--color-primary)' }} />
        <span style={{ fontWeight: 700, fontSize: 20, color: '#ffffff', letterSpacing: '0.05em' }}>
          FRAUD<span style={{ color: 'var(--color-primary)' }}>GUARD</span>
        </span>
      </div>

      {/* Desktop links */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hidden-mobile">
        {['features', 'stats', 'testimonials', 'pricing'].map((id, i) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            style={{ background: 'none', border: 'none', color: '#a3a3a3', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, transition: 'color 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.target.style.color = '#a3a3a3'}
          >
            {['Features', 'Stats', 'Testimonials', 'Pricing'][i]}
          </button>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn-outline" style={{ padding: '9px 20px', fontSize: 13 }} onClick={() => navigate('/login')}>
          Sign In
        </button>
        <button className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }} onClick={() => navigate('/login')}>
          Client Portal
        </button>
      </div>
    </motion.nav>
  )
}
