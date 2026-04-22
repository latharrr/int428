import { useEffect, useRef } from 'react'
import { globePoints } from '../utils/mockData.js'

// Lazy-load react-globe.gl to avoid SSR issues
import { useState } from 'react'

export default function Globe() {
  const [GlobeGL, setGlobeGL] = useState(null)
  const [arcs, setArcs] = useState([])
  const globeRef = useRef(null)

  useEffect(() => {
    import('react-globe.gl').then(mod => {
      setGlobeGL(() => mod.default)
    })
  }, [])

  // Rotate arcs every 3 seconds
  useEffect(() => {
    const generateArcs = () => {
      const newArcs = []
      for (let i = 0; i < 5; i++) {
        const src = globePoints[Math.floor(Math.random() * globePoints.length)]
        const dst = globePoints[Math.floor(Math.random() * globePoints.length)]
        if (src !== dst) {
          newArcs.push({
            startLat: src.lat, startLng: src.lng,
            endLat: dst.lat, endLng: dst.lng,
            color: Math.random() > 0.5 ? '#ef4444' : '#d4af37',
          })
        }
      }
      setArcs(newArcs)
    }
    generateArcs()
    const interval = setInterval(generateArcs, 3000)
    return () => clearInterval(interval)
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.5
      globeRef.current.pointOfView({ altitude: 2.2 })
    }
  }, [GlobeGL])

  if (!GlobeGL) {
    return (
      <div style={{ width: '100%', height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#d4af37', fontSize: 14 }}>Loading Globe...</div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <GlobeGL
        ref={globeRef}
        width={Math.min(700, window.innerWidth - 40)}
        height={500}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        atmosphereColor="#d4af37"
        atmosphereAltitude={0.15}
        // Points
        pointsData={globePoints}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => Math.random() > 0.5 ? '#ef4444' : '#ffffff'}
        pointRadius={0.5}
        pointAltitude={0.02}
        pointLabel={d => `<div style="background:rgba(5,5,5,0.95);border:1px solid rgba(212,175,55,0.3);padding:6px 12px;border-radius:6px;color:#ffffff;font-family:inherit;font-size:12px">Fraud blocked in <b>${d.country}</b></div>`}
        // Arcs
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        arcAltitudeAutoScale={0.3}
      />
    </div>
  )
}
