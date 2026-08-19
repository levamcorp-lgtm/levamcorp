'use client'
import { useEffect, useRef, useState } from 'react'

// ── LETTER BY LETTER TYPEWRITER ───────────────────────────────────────────────
export function TypewriterHeadline({ lines, delay = 0.4 }) {
  const [phase, setPhase]   = useState(0)   // which line we're on
  const [chars, setChars]   = useState(0)   // how many chars revealed
  const [done,  setDone]    = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const allLines  = lines
    const lineText  = allLines[phase] || ''

    if (done) return

    // Wait before starting each line
    const lineDelay = phase === 0 ? delay * 1000 : 120

    timerRef.current = setTimeout(() => {
      if (chars < lineText.length) {
        timerRef.current = setInterval(() => {
          setChars(c => {
            if (c >= lineText.length) {
              clearInterval(timerRef.current)
              if (phase < allLines.length - 1) {
                setTimeout(() => { setPhase(p => p + 1); setChars(0) }, 180)
              } else {
                setDone(true)
              }
              return c
            }
            return c + 1
          })
        }, 38)
      }
    }, lineDelay)

    return () => { clearTimeout(timerRef.current); clearInterval(timerRef.current) }
  }, [phase, done])

  return (
    <>
      {lines.map((line, i) => (
        <span key={i} style={{ display: 'block' }}>
          {i < phase
            ? line                                   // fully revealed lines
            : i === phase
            ? line.slice(0, chars)                   // currently typing
            : null                                   // not yet started
          }
          {i === phase && !done && (
            <span style={{
              display:         'inline-block',
              width:           2,
              height:          '0.85em',
              background:      '#0EA5E9',
              marginLeft:      2,
              verticalAlign:   'middle',
              animation:       'blink 0.7s step-end infinite',
            }}/>
          )}
        </span>
      ))}
    </>
  )
}

// ── SLOT MACHINE NUMBER ───────────────────────────────────────────────────────
export function SlotCounter({ to, suffix = '', duration = 1600, slotFrames = 10 }) {
  const [val,     setVal]     = useState(0)
  const [slot,    setSlot]    = useState(null)   // random flicker value
  const [flicker, setFlicker] = useState(false)
  const ref     = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return
      started.current = true

      // Phase 1: slot machine flicker
      let ticks = 0
      const flickerInterval = setInterval(() => {
        setSlot(Math.floor(Math.random() * to))
        setFlicker(true)
        ticks++
        if (ticks >= slotFrames) {
          clearInterval(flickerInterval)
          setFlicker(false)
          setSlot(null)

          // Phase 2: smooth count up
          const start = performance.now()
          const tick  = now => {
            const p = Math.min((now - start) / duration, 1)
            const e = 1 - Math.pow(1 - p, 4)
            setVal(Math.round(e * to))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      }, 60)

    }, { threshold: 0.4 })

    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration, slotFrames])

  const display = slot !== null ? slot : val

  return (
    <span ref={ref} style={{
      display:    'inline-block',
      filter:     flicker ? 'blur(1px) brightness(1.5)' : 'none',
      transition: flicker ? 'none' : 'filter 0.3s ease',
    }}>
      {display.toLocaleString()}{suffix}
    </span>
  )
}

// ── CURTAIN REVEAL ────────────────────────────────────────────────────────────
// Sections slide up like a curtain being pulled
export function CurtainReveal({ children, delay = 0, threshold = 0.1 }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* The curtain overlay */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: '#060810',
        zIndex:     10,
        transform:  vis ? 'translateY(-102%)' : 'translateY(0)',
        transition: `transform 0.8s ${delay}s cubic-bezier(0.76,0,0.24,1)`,
        pointerEvents: 'none',
      }}/>
      {/* Content revealed underneath */}
      <div ref={ref} style={{
        opacity:    vis ? 1 : 0,
        transition: `opacity 0.1s ${delay + 0.4}s ease`,
      }}>
        {children}
      </div>
    </div>
  )
}

// ── STAGGER CARDS ─────────────────────────────────────────────────────────────
export function StaggerCards({ children, staggerMs = 120, threshold = 0.1 }) {
  const ref     = useRef(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])

  const items = React.Children.toArray(children)

  return (
    <div ref={ref}>
      {items.map((child, i) => (
        <div key={i} style={{
          opacity:    vis ? 1 : 0,
          transform:  vis ? 'none' : 'translateY(28px) scale(0.97)',
          transition: `opacity 0.6s ${i * staggerMs}ms cubic-bezier(0.4,0,0.2,1), transform 0.6s ${i * staggerMs}ms cubic-bezier(0.4,0,0.2,1)`,
        }}>
          {child}
        </div>
      ))}
    </div>
  )
}

// ── DRAW LINE ─────────────────────────────────────────────────────────────────
// Vertical line that draws itself on scroll
export function DrawLine({ height = 200, color = '#0EA5E9', delay = 0 }) {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      const start = performance.now()
      const dur   = 1200

      const tick  = now => {
        const p = Math.min((now - start) / dur, 1)
        const e2 = 1 - Math.pow(1 - p, 3)
        setProgress(e2)
        if (p < 1) requestAnimationFrame(tick)
      }

      setTimeout(() => requestAnimationFrame(tick), delay * 1000)
    }, { threshold: 0.3 })

    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div ref={ref} style={{ position: 'relative', width: 1, height }}>
      <div style={{
        position:   'absolute',
        top:        0,
        left:       0,
        width:      1,
        height:     `${progress * 100}%`,
        background: `linear-gradient(180deg, ${color}, ${color}00)`,
        transition: 'height 0.05s linear',
      }}/>
      {/* Glow dot at tip */}
      <div style={{
        position:   'absolute',
        left:       -3,
        top:        `calc(${progress * 100}% - 4px)`,
        width:      7,
        height:     7,
        borderRadius: '50%',
        background: color,
        boxShadow:  `0 0 10px ${color}`,
        opacity:    progress > 0 && progress < 1 ? 1 : 0,
        transition: 'top 0.05s linear',
      }}/>
    </div>
  )
}

// ── HERO ENTRANCE ─────────────────────────────────────────────────────────────
// Orchestrates the full hero entrance: dark → illuminate → content appears
export function HeroEntrance({ onComplete }) {
  const [phase, setPhase] = useState(0)
  // 0: black   1: glow   2: badge   3: headline   4: sub   5: done

  useEffect(() => {
    const timings = [200, 600, 900, 1000, 1400]
    const timers  = timings.map((t, i) => setTimeout(() => setPhase(i + 1), t))
    const done    = setTimeout(() => { setPhase(5); if (onComplete) onComplete() }, 2000)
    return () => { timers.forEach(clearTimeout); clearTimeout(done) }
  }, [])

  return { phase }
}

// ── FLASH TRANSITION ─────────────────────────────────────────────────────────
// Brief white/blue flash when entering a section (used by scroll-cinema.js)
export function useFlash() {
  const [active, setActive] = useState(false)

  const flash = (color = 'rgba(14,165,233,0.12)', dur = 300) => {
    setActive(color)
    setTimeout(() => setActive(false), dur)
  }

  const el = active ? (
    <div style={{
      position:    'fixed',
      inset:       0,
      background:  active,
      zIndex:      999,
      pointerEvents: 'none',
      animation:   'flashOut 0.3s ease forwards',
    }}/>
  ) : null

  return { flash, el }
}
