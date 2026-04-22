import { motion } from 'framer-motion'

export default function StatCard({ icon, label, value, color = 'var(--color-primary)', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="stat-card"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Subtle glow accent */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color, opacity: 0.06, filter: 'blur(20px)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {icon}
        </div>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
          color: '#64748b', textTransform: 'uppercase',
        }}>
          Today
        </div>
      </div>

      <div style={{ fontSize: 32, fontWeight: 700, color, marginBottom: 4, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</div>
    </motion.div>
  )
}
