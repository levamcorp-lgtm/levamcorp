// ── LEVAM CORP · REALISM ENGINE ──────────────────────────────────────────────
// Smooth easing curves, dynamic lighting, and layered shadows
// Applied globally via CSS custom properties + JS runtime updates

// ── 1. EASING LIBRARY ────────────────────────────────────────────────────────
export const ease = {
  // Standard
  linear:      t => t,
  // Smooth step (GPU-style)
  smoothstep:  t => t * t * (3 - 2 * t),
  smootherstep:t => t * t * t * (t * (t * 6 - 15) + 10),
  // Spring-like
  elastic:     t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10*t-10) * Math.sin((t*10-10.75) * (2*Math.PI/3)),
  elasticOut:  t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2,-10*t) * Math.sin((t*10-0.75) * (2*Math.PI/3)) + 1,
  // Power
  cubicOut:    t => 1 - Math.pow(1-t, 3),
  quartOut:    t => 1 - Math.pow(1-t, 4),
  quintOut:    t => 1 - Math.pow(1-t, 5),
  // Back (overshoot)
  backOut:     t => { const c = 1.70158; return 1 + (c+1)*Math.pow(t-1,3) + c*Math.pow(t-1,2) },
  // Expo
  expoOut:     t => t === 1 ? 1 : 1 - Math.pow(2, -10*t),
  expoInOut:   t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2,20*t-10)/2 : (2-Math.pow(2,-20*t+10))/2,
}

// ── 2. SPRING PHYSICS ─────────────────────────────────────────────────────────
// Usage:
//   const spring = createSpring({ stiffness: 180, damping: 22 })
//   spring.target = 1.0
//   spring.tick(dt) → returns current value

export function createSpring({ stiffness = 170, damping = 26, mass = 1 } = {}) {
  let pos = 0, vel = 0, target = 0

  return {
    get value()  { return pos },
    get target() { return target },
    set target(v){ target = v },
    tick(dt = 0.016) {
      const F     = -stiffness * (pos - target)
      const D     = -damping   * vel
      const a     = (F + D) / mass
      vel += a * dt
      pos += vel * dt
      return pos
    },
    snap(v) { pos = v; vel = 0; target = v },
  }
}

// ── 3. DYNAMIC LIGHTING SYSTEM ────────────────────────────────────────────────
// Injects CSS custom properties that drive box-shadows and gradients reactively
// based on mouse position and scroll, simulating a directional light source.

export function initDynamicLighting() {
  if (typeof window === 'undefined') return () => {}

  const root = document.documentElement
  let mx = 0, my = 0, scrollY = 0
  let smx = 0, smy = 0                  // smoothed values
  let animId

  const onMouse = e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2   // -1 … +1
    my = (e.clientY / window.innerHeight - 0.5) * 2
  }
  const onScroll = () => { scrollY = window.scrollY }

  window.addEventListener('mousemove', onMouse)
  window.addEventListener('scroll',    onScroll, { passive: true })

  const tick = () => {
    animId = requestAnimationFrame(tick)

    // Smooth mouse
    smx += (mx - smx) * 0.06
    smy += (my - smy) * 0.06

    // ── Light source position (normalized)
    const lx = smx          //  -1 = left,  +1 = right
    const ly = smy          //  -1 = top,   +1 = bottom

    // Shadow direction (opposite to light)
    const sx = -lx * 18
    const sy = -ly * 14 + 6

    // Light intensity varies with distance from center
    const dist = Math.sqrt(lx*lx + ly*ly)
    const intensity = 1 - dist * 0.3                   // 0.7 … 1.0

    // Scroll-based ambient dimming (page gets slightly darker mid-scroll)
    const scrollNorm = Math.min(scrollY / 2000, 1)
    const ambient    = 0.9 + scrollNorm * 0.1

    // ── Write CSS custom properties ──────────────────────────────────────────
    root.style.setProperty('--lc-light-x',   `${lx.toFixed(3)}`)
    root.style.setProperty('--lc-light-y',   `${ly.toFixed(3)}`)
    root.style.setProperty('--lc-shadow-x',  `${sx.toFixed(1)}px`)
    root.style.setProperty('--lc-shadow-y',  `${sy.toFixed(1)}px`)
    root.style.setProperty('--lc-intensity', `${intensity.toFixed(3)}`)
    root.style.setProperty('--lc-ambient',   `${ambient.toFixed(3)}`)

    // ── Card shadow (directional) ────────────────────────────────────────────
    const shadowAlpha = (0.08 + dist * 0.06).toFixed(3)
    root.style.setProperty('--lc-card-shadow',
      `${sx.toFixed(1)}px ${sy.toFixed(1)}px 30px rgba(0,0,0,${shadowAlpha}), ` +
      `${(sx*0.4).toFixed(1)}px ${(sy*0.4).toFixed(1)}px 60px rgba(0,0,0,${(shadowAlpha*0.5).toFixed(3)}), ` +
      `0 0 0 1px rgba(255,255,255,${(0.04 + intensity*0.04).toFixed(3)})`
    )

    // ── Blue rim light (opposite corner to mouse) ────────────────────────────
    const rimX = (-lx * 24).toFixed(1)
    const rimY = (-ly * 18).toFixed(1)
    root.style.setProperty('--lc-rim-shadow',
      `${rimX}px ${rimY}px 40px rgba(14,165,233,${(0.06 + dist*0.08).toFixed(3)})`
    )

    // ── Specular highlight (where light hits) ────────────────────────────────
    const specX = (50 + lx*15).toFixed(1)
    const specY = (50 + ly*15).toFixed(1)
    root.style.setProperty('--lc-specular-pos', `${specX}% ${specY}%`)
    root.style.setProperty('--lc-specular-alpha', `${(0.04 + intensity*0.06).toFixed(3)}`)
  }

  tick()
  return () => {
    cancelAnimationFrame(animId)
    window.removeEventListener('mousemove', onMouse)
    window.removeEventListener('scroll', onScroll)
  }
}

// ── 4. SHADOW PRESETS ─────────────────────────────────────────────────────────
// Static shadow tokens (no JS required — just CSS)
export const shadows = {
  // Elevation levels
  none:    'none',
  xs:      '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
  sm:      '0 2px 6px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)',
  md:      '0 4px 14px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.25)',
  lg:      '0 8px 30px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.3)',
  xl:      '0 16px 50px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.35)',
  // Colored glow shadows
  blue:    '0 8px 32px rgba(14,165,233,0.25), 0 2px 8px rgba(14,165,233,0.15)',
  indigo:  '0 8px 32px rgba(99,102,241,0.25), 0 2px 8px rgba(99,102,241,0.15)',
  green:   '0 8px 32px rgba(34,197,94,0.2),  0 2px 8px rgba(34,197,94,0.12)',
  // Dynamic (driven by CSS vars set by initDynamicLighting)
  dynamic: 'var(--lc-card-shadow, 0 8px 30px rgba(0,0,0,0.4))',
  rim:     'var(--lc-rim-shadow,  0 0 0 transparent)',
  full:    'var(--lc-card-shadow, 0 8px 30px rgba(0,0,0,0.4)), var(--lc-rim-shadow, 0 0 0 transparent)',
}

// ── 5. GLASS MORPHISM PRESETS ─────────────────────────────────────────────────
export const glass = {
  dark: {
    background:    'rgba(6,8,16,0.6)',
    backdropFilter:'blur(20px) saturate(1.4)',
    border:        '1px solid rgba(255,255,255,0.07)',
    boxShadow:     shadows.full,
  },
  blue: {
    background:    'rgba(14,165,233,0.05)',
    backdropFilter:'blur(16px) saturate(1.3)',
    border:        '1px solid rgba(14,165,233,0.18)',
    boxShadow:     `${shadows.blue}, ${shadows.dynamic}`,
  },
  indigo: {
    background:    'rgba(99,102,241,0.05)',
    backdropFilter:'blur(16px) saturate(1.3)',
    border:        '1px solid rgba(99,102,241,0.18)',
    boxShadow:     `${shadows.indigo}, ${shadows.dynamic}`,
  },
  frost: {
    background:    'rgba(255,255,255,0.03)',
    backdropFilter:'blur(24px) saturate(1.5) brightness(1.05)',
    border:        '1px solid rgba(255,255,255,0.08)',
    boxShadow:     shadows.full,
  },
}

// ── 6. TRANSITION PRESETS ─────────────────────────────────────────────────────
export const transitions = {
  fast:    'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal:  'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  slow:    'all 0.4s  cubic-bezier(0.4, 0, 0.2, 1)',
  spring:  'all 0.5s  cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce:  'all 0.6s  cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // Specific property transitions
  shadow:  'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  transform:'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 'opacity 0.25s ease',
  color:   'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
}

// ── 7. SPECULAR CARD COMPONENT STYLES ─────────────────────────────────────────
// Returns style objects for cards with realistic lighting response
export function cardStyles(variant = 'default') {
  const base = {
    position:   'relative',
    overflow:   'hidden',
    borderRadius: 12,
    transition: `${transitions.shadow}, ${transitions.transform}`,
    cursor:     'default',
  }

  const variants = {
    default: {
      ...base,
      ...glass.frost,
    },
    blue: {
      ...base,
      ...glass.blue,
    },
    indigo: {
      ...base,
      ...glass.indigo,
    },
    solid: {
      ...base,
      background: 'rgba(255,255,255,0.03)',
      border:     '1px solid rgba(255,255,255,0.07)',
      boxShadow:  shadows.md,
    },
  }

  return variants[variant] || variants.default
}

// ── 8. HOVER STATE ENHANCER ───────────────────────────────────────────────────
// Returns onMouseEnter/onMouseLeave handlers that enhance shadow + scale on hover
export function hoverEnhance(el, options = {}) {
  const {
    scale     = 1.02,
    glowColor = 'rgba(14,165,233,0.2)',
    lift      = -4,
  } = options

  const onEnter = () => {
    el.style.transform = `translateY(${lift}px) scale(${scale})`
    el.style.boxShadow = `0 ${Math.abs(lift)*3}px 40px ${glowColor}, var(--lc-card-shadow, 0 8px 20px rgba(0,0,0,0.4))`
  }
  const onLeave = () => {
    el.style.transform = 'translateY(0) scale(1)'
    el.style.boxShadow = 'var(--lc-card-shadow, 0 4px 16px rgba(0,0,0,0.3))'
  }

  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)

  return () => {
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
  }
}
