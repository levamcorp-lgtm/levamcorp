'use client'
import { useEffect, useRef } from 'react'

export default function CinemaCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let W = window.innerWidth
    let H = window.innerHeight
    let animId
    let mx = 0, my = 0

    canvas.width  = W
    canvas.height = H

    // Particles
    const particles = Array.from({ length: 120 }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      z:   Math.random() * 3 + 0.5,
      vx:  (Math.random() - 0.5) * 0.3,
      vy:  (Math.random() - 0.5) * 0.3,
      r:   Math.random() * 1.5 + 0.5,
      hue: Math.random() < 0.6 ? 199 : 245,   // blue or indigo
      a:   Math.random() * 0.5 + 0.2,
    }))

    const onMouse = e => { mx = e.clientX; my = e.clientY }
    const onResize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }

    window.addEventListener('mousemove', onMouse)
    window.addEventListener('resize',    onResize)

    const draw = () => {
      animId = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, W, H)

      particles.forEach(p => {
        // Parallax drift toward mouse
        p.x += p.vx + (mx / W - 0.5) * 0.04 * p.z
        p.y += p.vy + (my / H - 0.5) * 0.04 * p.z

        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * p.z, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue},90%,65%,${p.a * p.z})`
        ctx.fill()
      })
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize',    onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        top: 0, left: 0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        0,
        opacity:       0.7,
      }}
    />
  )
}
