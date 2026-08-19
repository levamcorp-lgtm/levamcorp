'use client'
import { useEffect, useRef, useState } from 'react'
import { shadows, glass, transitions } from '../lib/realism'

// ── REALISTIC CARD ────────────────────────────────────────────────────────────
// A card that responds to the light source set by initDynamicLighting
// — directional shadow, specular highlight, rim light, tilt on hover

export default function RealisticCard({
  children,
  variant    = 'default',   // 'default' | 'blue' | 'indigo' | 'solid'
  glowColor  = '#0EA5E9',
  tiltAmount = 12,          // max tilt degrees
  liftPx     = 6,           // how many px it rises on hover
  style      = {},
  className  = '',
}) {
  const ref     = useRef(null)
  const raf     = useRef(null)
  const state   = useRef({ tx:0, ty:0, lx:0, ly:0, hover:false })
  const [ready, setReady] = useState(false)

  useEffect(() => { setReady(true) }, [])

  // ── Smooth tilt with spring physics ──────────────────────────────────────
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onEnter = e => { state.current.hover = true }
    const onLeave = () => {
      state.current.hover = false
      state.current.lx = 0
      state.current.ly = 0
    }
    const onMove = e => {
      if (!state.current.hover) return
      const rect = el.getBoundingClientRect()
      state.current.lx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
      state.current.ly = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
    }

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)
    el.addEventListener('mousemove',  onMove)

    const tick = () => {
      raf.current = requestAnimationFrame(tick)
      const s = state.current
      const stiff = 0.1

      // Spring toward target
      s.tx += (s.lx * tiltAmount - s.tx) * stiff
      s.ty += (s.ly * tiltAmount - s.ty) * stiff

      const hover = s.hover
      const lift  = hover ? -liftPx : 0

      // Parse glow color to RGB for shadows
      const glowRGB = glowColor === '#0EA5E9' ? '14,165,233'
                    : glowColor === '#6366F1' ? '99,102,241'
                    : glowColor === '#22c55e' ? '34,197,94'
                    : '14,165,233'

      el.style.transform = `
        perspective(900px)
        rotateY(${s.tx}deg)
        rotateX(${-s.ty}deg)
        translateY(${lift}px)
        scale(${hover ? 1.01 : 1})
      `
      el.style.boxShadow = hover
        ? `${-s.tx * 2}px ${s.ty * 2}px 30px rgba(0,0,0,0.35),
           ${-s.tx * 1}px ${s.ty * 1}px 60px rgba(0,0,0,0.2),
           0 ${liftPx * 3}px 40px rgba(${glowRGB},0.18),
           0 0 0 1px rgba(${glowRGB},0.15),
           var(--lc-rim-shadow, none)`
        : `var(--lc-card-shadow, 0 4px 20px rgba(0,0,0,0.35))`
    }

    raf.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf.current)
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
      el.removeEventListener('mousemove',  onMove)
    }
  }, [tiltAmount, liftPx, glowColor])

  const variantStyles = {
    default: {
      background:    'rgba(255,255,255,0.025)',
      backdropFilter:'blur(20px) saturate(1.4)',
      border:        '1px solid rgba(255,255,255,0.07)',
    },
    blue: {
      background:    'rgba(14,165,233,0.04)',
      backdropFilter:'blur(20px) saturate(1.4)',
      border:        '1px solid rgba(14,165,233,0.15)',
    },
    indigo: {
      background:    'rgba(99,102,241,0.04)',
      backdropFilter:'blur(20px) saturate(1.4)',
      border:        '1px solid rgba(99,102,241,0.15)',
    },
    solid: {
      background:    'rgba(255,255,255,0.03)',
      backdropFilter:'blur(12px)',
      border:        '1px solid rgba(255,255,255,0.06)',
    },
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position:        'relative',
        borderRadius:    12,
        padding:         '2rem',
        overflow:        'hidden',
        transformStyle:  'preserve-3d',
        willChange:      'transform, box-shadow',
        transition:      'box-shadow 0.15s ease',
        cursor:          'default',
        boxShadow:       'var(--lc-card-shadow, 0 4px 20px rgba(0,0,0,0.3))',
        ...variantStyles[variant] || variantStyles.default,
        ...style,
      }}
    >
      {/* Specular highlight — moves with light source */}
      {ready && (
        <div style={{
          position:      'absolute',
          inset:         0,
          borderRadius:  'inherit',
          background:    `radial-gradient(circle at var(--lc-specular-pos, 30% 30%), rgba(255,255,255,var(--lc-specular-alpha, 0.06)), transparent 60%)`,
          pointerEvents: 'none',
          zIndex:        0,
          transition:    'background 0.05s linear',
        }}/>
      )}

      {/* Edge rim light */}
      <div style={{
        position:   'absolute',
        inset:      0,
        borderRadius: 'inherit',
        boxShadow:  'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)',
        pointerEvents:'none',
        zIndex:     0,
      }}/>

      {/* Content */}
      <div style={{ position:'relative', zIndex:1 }}>
        {children}
      </div>
    </div>
  )
}

// ── REALISTIC BUTTON ──────────────────────────────────────────────────────────
export function RealisticButton({ children, onClick, href, style = {}, variant = 'primary' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onDown = () => {
      el.style.transform  = 'translateY(1px) scale(0.98)'
      el.style.boxShadow  = '0 2px 8px rgba(14,165,233,0.2)'
    }
    const onUp = () => {
      el.style.transform  = ''
      el.style.boxShadow  = ''
    }

    el.addEventListener('mousedown',  onDown)
    el.addEventListener('mouseup',    onUp)
    el.addEventListener('mouseleave', onUp)
    return () => {
      el.removeEventListener('mousedown',  onDown)
      el.removeEventListener('mouseup',    onUp)
      el.removeEventListener('mouseleave', onUp)
    }
  }, [])

  const base = {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            8,
    borderRadius:   4,
    fontWeight:     700,
    letterSpacing:  '0.1em',
    textTransform:  'uppercase',
    textDecoration: 'none',
    fontSize:       12,
    cursor:         'pointer',
    border:         'none',
    willChange:     'transform, box-shadow',
    transition:     `transform 0.12s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease`,
    ...style,
  }

  const variants = {
    primary: {
      ...base,
      padding:    '13px 26px',
      background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
      color:      '#fff',
      boxShadow:  '0 4px 14px rgba(14,165,233,0.35), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.1)',
    },
    outline: {
      ...base,
      padding:    '12px 26px',
      background: 'rgba(255,255,255,0.03)',
      color:      '#fff',
      border:     '1px solid rgba(255,255,255,0.15)',
      boxShadow:  'inset 0 1px 0 rgba(255,255,255,0.06)',
    },
  }

  const s = variants[variant] || variants.primary
  if (href) return <a ref={ref} href={href} style={s}>{children}</a>
  return <button ref={ref} onClick={onClick} style={s}>{children}</button>
}

// ── GLOW TEXT ─────────────────────────────────────────────────────────────────
// Text that picks up the ambient light color and glows subtly
export function GlowText({ children, color = '#0EA5E9', intensity = 0.4, style = {} }) {
  return (
    <span style={{
      color,
      textShadow: `0 0 20px ${color}${Math.round(intensity*255).toString(16).padStart(2,'0')}, 0 0 60px ${color}${Math.round(intensity*0.4*255).toString(16).padStart(2,'0')}`,
      ...style,
    }}>
      {children}
    </span>
  )
}

// ── DEPTH SEPARATOR ───────────────────────────────────────────────────────────
// A section divider with a sense of depth — light hits the crest
export function DepthSeparator({ color = '#0EA5E9', style = {} }) {
  return (
    <div style={{
      position:   'relative',
      height:     1,
      margin:     '0',
      overflow:   'visible',
      ...style,
    }}>
      {/* Main line */}
      <div style={{
        position:   'absolute',
        left: 0, right: 0, top: 0,
        height:     1,
        background: `linear-gradient(90deg, transparent, ${color}40, ${color}80, ${color}40, transparent)`,
      }}/>
      {/* Glow */}
      <div style={{
        position:   'absolute',
        left: '10%', right: '10%', top: -2,
        height:     5,
        background: `radial-gradient(ellipse, ${color}20 0%, transparent 70%)`,
        filter:     'blur(3px)',
      }}/>
      {/* Specular dot (where light peaks) */}
      <div style={{
        position:   'absolute',
        left:       'var(--lc-specular-pos, 30%)',
        top:        -1,
        width:      40,
        height:     3,
        background: `radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 80%)`,
        filter:     'blur(1px)',
        transition: 'left 0.1s ease',
      }}/>
    </div>
  )
}
