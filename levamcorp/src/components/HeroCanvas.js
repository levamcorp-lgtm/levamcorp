'use client'
import { useEffect, useRef } from 'react'

// ── PARTICLE FIELD ────────────────────────────────────────────────────────────
export function ParticleField({ style = {} }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    let scene

    import('../lib/three-scene').then(({ createParticleField }) => {
      createParticleField(canvasRef.current, {
        count:  1400,
        size:   1.0,
        depth:  80,
        spread: 40,
        speed:  0.0002,
      }).then(s => { scene = s })
    })

    return () => { if (scene) scene.destroy() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}
    />
  )
}

// ── ORBITAL RINGS ─────────────────────────────────────────────────────────────
export function OrbitalRings({ style = {} }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    let scene

    import('../lib/three-scene').then(({ createHeroRings }) => {
      createHeroRings(canvasRef.current).then(s => { scene = s })
    })

    return () => { if (scene) scene.destroy() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', ...style }}
    />
  )
}
