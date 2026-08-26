'use client'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// CinematicScroll components imported below as dynamic

// ── SMOOTH SPRING HOOK ────────────────────────────────────────────────────────
function useSpring(target, stiffness = 0.07) {
  const val = useRef(target)
  const [display, setDisplay] = useState(target)
  const raf = useRef(null)

  useEffect(() => {
    const tick = () => {
      val.current += (target - val.current) * stiffness
      setDisplay(val.current)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, stiffness])

  return display
}

// ── SCROLL + MOUSE STATE ──────────────────────────────────────────────────────
function useScene() {
  const [scrollY, setScrollY] = useState(0)
  const [mouse,   setMouse]   = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    const onMouse  = e  => setMouse({
      x: (e.clientX / window.innerWidth  - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    })
    window.addEventListener('scroll',    onScroll, { passive: true })
    window.addEventListener('mousemove', onMouse)
    return () => {
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  const smx = useSpring(mouse.x, 0.06)
  const smy = useSpring(mouse.y, 0.06)

  return { scrollY, mx: smx, my: smy }
}

// ── COUNTER ───────────────────────────────────────────────────────────────────
function Counter({ to, suffix = '', duration = 2000 }) {
  const [val, setVal] = useState(0)
  const ref     = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick  = now => {
          const p = Math.min((now - start) / duration, 1)
          const e = 1 - Math.pow(1 - p, 4)   // quartOut
          setVal(Math.round(e * to))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ── REVEAL ON SCROLL ──────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 32 }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity:    vis ? 1 : 0,
      transform:  vis ? 'translateY(0)' : `translateY(${y}px)`,
      transition: `opacity 0.8s ${delay}s cubic-bezier(0.4,0,0.2,1), transform 0.8s ${delay}s cubic-bezier(0.4,0,0.2,1)`,
    }}>
      {children}
    </div>
  )
}

// ── TILT CARD ─────────────────────────────────────────────────────────────────
function TiltCard({ children, style = {}, glow = '#2F7DF6' }) {
  const ref  = useRef(null)
  const raf  = useRef(null)
  const s    = useRef({ tx: 0, ty: 0, lx: 0, ly: 0, over: false })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const enter = ()   => { s.current.over = true }
    const leave = ()   => { s.current.over = false; s.current.lx = 0; s.current.ly = 0 }
    const move  = e => {
      const r  = el.getBoundingClientRect()
      s.current.lx = ((e.clientX - r.left) / r.width  - 0.5) * 2
      s.current.ly = ((e.clientY - r.top)  / r.height - 0.5) * 2
    }

    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)
    el.addEventListener('mousemove',  move)

    const glowRGB = glow === '#2F7DF6' ? '47,125,246' : glow === '#6B7280' ? '107,114,128' : glow === '#12B76A' ? '18,183,106'
      : glow === '#F2B705' ? '242,183,5' : glow === '#B98A54' ? '185,138,84' : '47,125,246'

    const tick = () => {
      raf.current = requestAnimationFrame(tick)
      const c = s.current
      c.tx += (c.lx * 10 - c.tx) * 0.1
      c.ty += (c.ly * 10 - c.ty) * 0.1

      el.style.transform = c.over
        ? `perspective(900px) rotateY(${c.tx}deg) rotateX(${-c.ty}deg) translateY(-6px) scale(1.01)`
        : `perspective(900px) rotateY(${c.tx}deg) rotateX(${-c.ty}deg)`

      el.style.boxShadow = c.over
        ? `${-c.tx * 2}px ${c.ty * 2}px 28px rgba(0,0,0,0.4), 0 16px 50px rgba(${glowRGB},0.16), 0 0 0 1px rgba(${glowRGB},0.1), inset 0 1px 0 rgba(255,255,255,0.07)`
        : `0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf.current)
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
      el.removeEventListener('mousemove',  move)
    }
  }, [glow])

  return (
    <div ref={ref} style={{
      willChange:     'transform, box-shadow',
      transformStyle: 'preserve-3d',
      transition:     'box-shadow 0.2s ease',
      borderRadius:   12,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── BRAND TICKER ──────────────────────────────────────────────────────────────
function BrandTicker() {
  const brands = ['HISENSE','SAMSUNG','BRENTWOOD','PROCTOR SILEX','HAMILTON BEACH','AVANTI','MAGIC BULLET']
  const row    = [...brands, ...brands, ...brands]
  return (
    <div style={{ overflow:'hidden', position:'relative', padding:'1.25rem 0' }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:100, background:'linear-gradient(90deg,#14120E,transparent)', zIndex:2, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:100, background:'linear-gradient(-90deg,#14120E,transparent)', zIndex:2, pointerEvents:'none' }}/>
      <div className="lc-mono" style={{ display:'flex', gap:'3rem', animation:'ticker 30s linear infinite', width:'max-content' }}>
        {row.map((b, i) => (
          <span key={i} style={{
            fontSize:9, fontWeight:800, letterSpacing:'0.28em',
            color: i%3===0 ? 'rgba(245,241,232,0.18)' : i%3===1 ? 'rgba(242,183,5,0.5)' : 'rgba(245,241,232,0.1)',
            whiteSpace:'nowrap',
          }}>◆ {b}</span>
        ))}
      </div>
    </div>
  )
}

// ── SVG ICONS ─────────────────────────────────────────────────────────────────
const IC = {
  arrow:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  check:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  shield: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  dollar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  globe:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  box:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>,
  users:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  zap:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  mail:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  phone:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  pin:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  tv:     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  home2:  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  coffee: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  fridge: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 10h16"/><path d="M8 6v2M8 14v4"/></svg>,
  chevron:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
}

// ── MOBILE MENU ───────────────────────────────────────────────────────────────
function MobileMenu() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(!open)} className="lc-ham"
        style={{ display:'none', flexDirection:'column', gap:5, background:'none', border:'none', cursor:'pointer', padding:4 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:22, height:2, background:'#fff', borderRadius:2, display:'block', transition:'all 0.25s',
            transform: open&&i===0?'rotate(45deg) translateY(7px)':open&&i===2?'rotate(-45deg) translateY(-7px)':'none',
            opacity: open&&i===1?0:1 }}/>
        ))}
      </button>
      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(20,18,14,0.97)', backdropFilter:'blur(24px)', zIndex:300, display:'flex', flexDirection:'column', padding:'5rem 2rem 3rem' }}>
          <button onClick={() => setOpen(false)} style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', width:40, height:40, borderRadius:'50%', fontSize:18, cursor:'pointer' }}>×</button>
          {[['#brands','Products'],['#process','How it works'],['#about','About'],['#faq','FAQ'],['#contact','Contact'],['/insights','Market Insights'],['/apply','Apply now']].map(([href,label],i) => (
            <a key={label} href={href} onClick={() => setOpen(false)}
              style={{ fontSize:22, fontWeight:800, color:label==='Apply now'?'#2F7DF6':'#fff', textDecoration:'none', padding:'0.9rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)', letterSpacing:'-0.01em', opacity:0, animation:`fadeUp 0.4s ${i*0.06}s ease forwards` }}>
              {label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}

// ── WAVE SVG ──────────────────────────────────────────────────────────────────
const Wave = ({ flip = false, opacity = 0.04, color = '242,183,5' }) => (
  <div style={{ position:'relative', height:80, overflow:'hidden', pointerEvents:'none' }}>
    <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
      style={{ position:'absolute', [flip?'top':'bottom']:0, width:'100%', height:'100%' }}>
      <path d={flip
        ? "M0,40 C360,0 720,80 1080,40 C1260,20 1380,60 1440,40 L1440,0 L0,0 Z"
        : "M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z"}
        fill={`rgba(${color},${opacity})`}/>
    </svg>
  </div>
)

// ── CARD SHELL ────────────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  const h = hex.replace('#','')
  return `${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)}`
}

const Card = ({ children, style={}, accent='#2F7DF6' }) => {
  const rgb = hexToRgb(accent)
  return (
    <div style={{
      background:`linear-gradient(160deg, rgba(${rgb},0.16) 0%, rgba(${rgb},0.03) 45%, #1D1A15 80%)`,
      border:`1px solid rgba(${rgb},0.28)`,
      borderRadius:10,
      padding:'1.75rem',
      position:'relative',
      overflow:'hidden',
      ...style,
    }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${accent},transparent)`, pointerEvents:'none' }}/>
      {children}
    </div>
  )
}

// ── INSIGHT PREVIEW CARD ──────────────────────────────────────────────────────
const insightItems = [
  { tag:'Electronics', title:'Smart TVs dominate wholesale in 2026', date:'Aug 2026' },
  { tag:'E-commerce',  title:'FBA sellers shift to wholesale for better margins', date:'Aug 2026' },
  { tag:'Trending',    title:'Kitchen appliances: consistent performers for resellers', date:'Jul 2026' },
]


// ── HERO VIDEO — the shipping journey, autoplaying in a loop ─────────────────
const JOURNEY_BASE = 'https://d8j0ntlcm91z4.cloudfront.net/user_3IQhU7OnYTGi99XvrFek8jPDWTc/'
const JOURNEY_CLIPS = [
  { v: 'hf_20260826_023432_87cb8820-993f-4a71-8ef2-d3f32985ac36.mp4', caption: 'Shipping label' },
  { v: 'hf_20260826_023432_6d578439-1a93-48c8-8224-48cf7a0f0f33.mp4', caption: 'The carton' },
  { v: 'hf_20260826_023432_5225b5c5-0e67-42fd-bc62-f23e00d5abab.mp4', caption: 'Wholesale pallet' },
  { v: 'hf_20260826_023432_7b2d9392-b5bd-41c3-96d5-3e761a67efef.mp4', caption: 'On the forklift' },
  { v: 'hf_20260826_023432_3884ce55-7ae3-4903-8b89-9b6aa739f5d3.mp4', caption: 'Into the trailer' },
  { v: 'hf_20260826_023432_e04b4f7d-ceba-487d-9b9e-41fefd44cd35.mp4', caption: 'Truck at the bay' },
  { v: 'hf_20260826_023432_7bb258ee-e933-4ecb-9f2a-b8ea2b96f379.mp4', caption: 'The distribution centre' },
  { v: 'hf_20260826_023355_a6931868-7c6b-440d-b225-ef9e5c9fa6d4.mp4', caption: 'Regional network → delivered' },
]

// Full-bleed background that autoplays through the 8 clips on its own timeline —
// completely independent of page scroll, so scrolling the page is always just
// normal scrolling. A clip that fails to load is skipped (onError advances to
// the next one) instead of ever blocking anything: there is no loader, no gate,
// nothing overlaid on top of it can get stuck — the text above it is always
// visible immediately, whether the video loads or not.
function HeroVideoBackground() {
  const [index, setIndex] = useState(0)
  const videoRef = useRef(null)
  const failCount = useRef(0)

  const advance = useCallback(() => {
    setIndex(i => (i + 1) % JOURNEY_CLIPS.length)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (v) v.play().catch(() => {})
  }, [index])

  const onError = () => {
    // If every clip in the set fails (dead URL, blocked host, etc.) stop
    // retrying after one full lap so we don't spin forever in the background.
    failCount.current += 1
    if (failCount.current <= JOURNEY_CLIPS.length) advance()
  }

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', zIndex:0 }}>
      <video
        ref={videoRef}
        key={index}
        src={JOURNEY_BASE + JOURNEY_CLIPS[index].v}
        autoPlay
        muted
        playsInline
        onEnded={advance}
        onError={onError}
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
      />
      {/* Scrim so overlaid text stays readable over any frame of any clip */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(20,18,14,0.55) 0%,rgba(20,18,14,0.25) 35%,rgba(20,18,14,0.35) 65%,rgba(20,18,14,0.85) 100%)' }}/>

      {/* Journey caption + dot progress — purely time-driven, never blocks anything */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', flexDirection:'column', gap:12, padding:'0 2rem 1.75rem', pointerEvents:'none' }}>
        <div className="lc-mono" style={{ fontSize:11, letterSpacing:'0.08em', color:'#F5F1E8' }}>{JOURNEY_CLIPS[index].caption}</div>
        <div style={{ display:'flex', gap:6 }}>
          {JOURNEY_CLIPS.map((c, i) => (
            <div key={c.v} style={{ width:20, height:3, borderRadius:2, background: i === index ? '#F2B705' : 'rgba(245,241,232,0.2)', transition:'background 0.3s ease' }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── INLINE CINEMATIC COMPONENTS ──────────────────────────────────────────────

function TypewriterText({ phase }) {
  const lines  = ['Premium brands.', 'Wholesale pricing.', 'Built for resellers.']
  const styles = [
    { color: '#F5F1E8', fontWeight:400 },
    { color:'#F5F1E8', fontWeight:900 },
    { color:'#A7A090', fontWeight:400, fontStyle:'italic' },
  ]
  const [lineIdx, setLineIdx] = useState(0)
  const [chars,   setChars]   = useState(0)
  const [done,    setDone]    = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (done) return
    const text = lines[lineIdx] || ''
    const startDelay = lineIdx === 0 ? 100 : 150
    timer.current = setTimeout(() => {
      const iv = setInterval(() => {
        setChars(c => {
          if (c >= text.length) {
            clearInterval(iv)
            if (lineIdx < lines.length - 1) {
              setTimeout(() => { setLineIdx(l => l + 1); setChars(0) }, 200)
            } else setDone(true)
            return c
          }
          return c + 1
        })
      }, 36)
    }, startDelay)
    return () => { clearTimeout(timer.current) }
  }, [lineIdx, done])

  return (
    <>
      {lines.map((line, i) => (
        <span key={i} style={{ display:'block', ...styles[i] }}>
          {i < lineIdx ? line : i === lineIdx ? line.slice(0, chars) : null}
          {i === lineIdx && !done && (
            <span style={{ display:'inline-block', width:2, height:'0.8em', background:'#2F7DF6', marginLeft:2, verticalAlign:'middle', animation:'blink 0.7s step-end infinite' }}/>
          )}
        </span>
      ))}
    </>
  )
}

function SlotCounter({ to, suffix = '' }) {
  const [val,     setVal]     = useState(0)
  const [flicker, setFlicker] = useState(false)
  const [slot,    setSlot]    = useState(0)
  const ref     = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return
      started.current = true
      let ticks = 0
      const iv = setInterval(() => {
        setSlot(Math.floor(Math.random() * to))
        setFlicker(true)
        if (++ticks >= 10) {
          clearInterval(iv)
          setFlicker(false)
          const start = performance.now()
          const tick  = now => {
            const p = Math.min((now - start) / 1600, 1)
            setVal(Math.round((1 - Math.pow(1 - p, 4)) * to))
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      }, 60)
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])

  return (
    <span ref={ref} style={{ filter: flicker ? 'blur(1px) brightness(1.6)' : 'none', transition: 'filter 0.2s' }}>
      {(flicker ? slot : val).toLocaleString()}{suffix}
    </span>
  )
}

function DrawLine({ height = 120, color = '#2F7DF6', delay = 0 }) {
  const ref = useRef(null)
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      setTimeout(() => {
        const start = performance.now()
        const tick  = now => {
          const p = Math.min((now - start) / 1000, 1)
          setProgress(1 - Math.pow(1 - p, 3))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }, delay * 1000)
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [delay])
  return (
    <div ref={ref} style={{ position:'absolute', left:20, top:44, width:1, height }}>
      <div style={{ position:'absolute', top:0, left:0, width:1, height:`${progress*100}%`, background:`linear-gradient(180deg,${color},${color}00)` }}/>
      <div style={{ position:'absolute', left:-3, top:`calc(${progress*100}% - 4px)`, width:7, height:7, borderRadius:'50%', background:color, boxShadow:`0 0 10px ${color}`, opacity: progress > 0 && progress < 1 ? 1 : 0 }}/>
    </div>
  )
}

// ── STAMP SEAL — ink-stamp reveal on scroll ──────────────────────────────────
function StampSeal({ label, sub, color = '#2F7DF6', delay = 0 }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setVis(true), delay * 1000); obs.disconnect() }
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [delay])
  return (
    <div ref={ref} style={{
      width:106, height:106, borderRadius:'50%', border:`3px solid ${color}`, color, flexShrink:0,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center',
      transform: vis ? 'scale(1) rotate(-9deg)' : 'scale(2.4) rotate(-9deg)',
      opacity: vis ? 0.92 : 0,
      transition:'transform 0.5s cubic-bezier(0.22,1.61,0.36,1), opacity 0.25s ease',
      padding:10, boxSizing:'border-box',
    }}>
      <div className="lc-display" style={{ fontSize:11, fontWeight:800, letterSpacing:'0.04em', lineHeight:1.2, textTransform:'uppercase' }}>{label}</div>
      {sub && <div className="lc-mono" style={{ fontSize:7, fontWeight:700, letterSpacing:'0.1em', marginTop:4, textTransform:'uppercase', opacity:0.85 }}>{sub}</div>}
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── HOME PAGE ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// ── PRODUCT PREVIEW ──────────────────────────────────────────────────────────
function ProductPreview() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/public-products')
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {})
  }, [])

  if (!products.length) return null

  return (
    <section className="lc-section" style={{ padding:'7rem 2rem', position:'relative', zIndex:5, borderTop:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <Reveal>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 className="lc-display" style={{ fontSize:'clamp(26px,4vw,46px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1, margin:'0 0 1rem' }}>
              Premium brands at wholesale prices.
            </h2>
            <p style={{ fontSize:14, color:'#A7A090', maxWidth:440, margin:'0 auto' }}>
              Approved partners get access to full pricing, stock levels, and ordering. Apply to unlock the full catalog.
            </p>
          </div>
        </Reveal>

        <div className="lc-products-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:14, marginBottom:'2.5rem' }}>
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06}>
              <TiltCard glow="#2F7DF6" style={{ height:'100%' }}>
                <div style={{ background:'#1D1A15', border:'1px solid rgba(245,241,232,0.07)', borderRadius:12, overflow:'hidden', height:'100%', display:'flex', flexDirection:'column' }}>
                  <div style={{ position:'relative', aspectRatio:'4 / 3', background:'rgba(245,241,232,0.03)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'contain', padding:18 }}
                          onError={e => e.target.style.display='none'}/>
                      : <div style={{ fontSize:44, opacity:0.1 }}>◻</div>
                    }
                  </div>
                  <div style={{ padding:'1rem', display:'flex', flexDirection:'column', gap:10, flex:1 }}>
                    <div>
                      {p.brand && <div style={{ fontSize:9, fontWeight:700, color:'#2F7DF6', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:5 }}>{p.brand}</div>}
                      <div style={{ fontSize:13, fontWeight:600, color:'#fff', lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{p.name}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginTop:'auto', flexWrap:'wrap' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', background:'rgba(47,125,246,0.08)', border:'1px solid rgba(47,125,246,0.15)', borderRadius:6 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2F7DF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <span style={{ fontSize:10, fontWeight:700, color:'#2F7DF6' }}>Apply to see pricing</span>
                      </div>
                      {p.moq && <div style={{ fontSize:9, color:'rgba(167,160,144,0.5)' }}>MOQ: {p.moq}</div>}
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div style={{ textAlign:'center' }}>
            <Link href="/apply" className="lc-btn" style={{ fontSize:13, padding:'14px 36px' }}>
              Apply for wholesale access {IC.arrow}
            </Link>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:12 }}>
              500+ products available · Approved partners only · Response in 48h
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  { q: 'Who can apply to become a partner?', a: 'We work with registered retailers, resellers, and distributors — a valid EIN and resale certificate are required. Apply and we’ll review your business personally.' },
  { q: 'Is there a cost to apply?', a: 'No. Applying is free and takes about 5 minutes. You only pay for the products you order once approved.' },
  { q: 'How long until I get approved?', a: 'We review every application personally and respond within 1–2 business days.' },
  { q: 'Is there a minimum order quantity (MOQ)?', a: 'MOQ varies by product — no pressure. Exact minimums are shown in your portal once you have catalog access.' },
  { q: 'How fast do you ship?', a: 'Orders dispatch from our Doral, FL warehouse with a 48-hour average turnaround.' },
  { q: 'Do you support Spanish speakers?', a: 'Yes — our team supports English and Spanish, Monday–Friday 9AM–5PM ET.' },
]

function FAQSection() {
  const [open, setOpen] = useState(0)
  return (
    <section className="lc-section" id="faq" style={{ padding:'7rem 2rem', position:'relative', zIndex:5, borderTop:'1px solid rgba(255,255,255,0.04)', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'-10%', left:'-4%', width:400, height:400, background:'radial-gradient(circle,rgba(107,114,128,0.17) 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ maxWidth:760, margin:'0 auto', position:'relative' }}>
        <Reveal>
          <div style={{ textAlign:'center', marginBottom:'3rem' }}>
            <h2 className="lc-display" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1, margin:'0 0 1rem' }}>
              Frequently asked questions.
            </h2>
            <p style={{ fontSize:13.5, color:'#A7A090', maxWidth:440, margin:'0 auto' }}>
              Haven&rsquo;t applied yet? Here&rsquo;s what most prospective partners ask us first.
            </p>
          </div>
        </Reveal>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={i*0.05}>
                <div style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${isOpen?'rgba(47,125,246,0.3)':'rgba(255,255,255,0.07)'}`, borderRadius:10, overflow:'hidden', transition:'border-color 0.2s' }}>
                  <button onClick={() => setOpen(isOpen ? -1 : i)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'1rem 1.25rem', background:'transparent', border:'none', cursor:'pointer', textAlign:'left' }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>{item.q}</span>
                    <span style={{ color:'#2F7DF6', flexShrink:0, transition:'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>{IC.chevron}</span>
                  </button>
                  <div style={{ display:'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition:'grid-template-rows 0.25s ease' }}>
                    <div style={{ overflow:'hidden' }}>
                      <div style={{ padding:'0 1.25rem 1.1rem', fontSize:13, color:'#A7A090', lineHeight:1.75 }}>{item.a}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── FOOTER "ASK US ANYTHING" WIDGET ─────────────────────────────────────────
function FooterAsk() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!email || !message) { setError('Add your email and a question.'); return }
    setSending(true); setError('')
    try {
      const res = await fetch('/api/send-contact-email', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ name:'Website visitor', email, company:'', phone:'', message }),
      })
      const data = await res.json()
      if (data.success) { setSent(true); setEmail(''); setMessage('') }
      else setError('Something went wrong. Please try again.')
    } catch { setError('Something went wrong. Please try again.') }
    setSending(false)
  }

  if (sent) return (
    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#12B76A', fontWeight:600 }}>
      {IC.check} Thanks — we&rsquo;ll reply within 1&ndash;2 business days.
    </div>
  )

  return (
    <div style={{ width:'100%', maxWidth:520 }}>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@yourbusiness.com"
          onKeyDown={e=>e.key==='Enter' && submit()}
          style={{ flex:'1 1 180px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, fontSize:12, padding:'10px 12px', color:'#fff', fontFamily:'inherit', boxSizing:'border-box' }}/>
        <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Ask us anything…"
          onKeyDown={e=>e.key==='Enter' && submit()}
          style={{ flex:'2 1 220px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, fontSize:12, padding:'10px 12px', color:'#fff', fontFamily:'inherit', boxSizing:'border-box' }}/>
        <button onClick={submit} disabled={sending} style={{ padding:'10px 20px', background: sending?'rgba(255,255,255,0.06)':'linear-gradient(135deg,#2F7DF6,#1B5FD1)', color:'#fff', fontSize:11.5, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', border:'none', borderRadius:6, cursor: sending?'not-allowed':'pointer', flexShrink:0 }}>
          {sending ? 'Sending…' : 'Ask'}
        </button>
      </div>
      {error && <div style={{ fontSize:11, color:'#EF4444', marginTop:6 }}>{error}</div>}
    </div>
  )
}

// impeccable:direction seed=90ffee00 (concept-seed --scope direction --mode persuade, degraded/no-network — index 7 of 7 grounded candidates assigned)
// THESIS: Levam Corp is a real distribution operation, not another dark-SaaS dashboard wearing a wholesale label — the site proves that by rendering the one object every reseller already trusts: a shipping box.
// OWN-WORLD: warehouse charcoal ground (#14120E, warm brown-black, not blue-black), kraft cardboard (#B98A54/#C79A5E), safety-hazard yellow (#F2B705) as the committed accent, steel-gray (#6B7280) secondary, brand blue (#2F7DF6) reserved for CTAs/links only. Space Grotesk/Inter preserved as the confirmed cross-site type system (7+ pages already ship it).
// STORY: a visitor scrolls past a genuine 3D cardboard box (real CSS transform-style:preserve-3d geometry, not a flat image) whose flaps fold shut as they scroll — the literal motion of an order being packed and sealed — then meets the same content the site always had (categories, process, About, FAQ) restyled into that same physical world (ink-stamp trust seals, hazard-stripe dividers, manifest-style badges).
// FIRST VIEWPORT: open box at 3/4 perspective, right of headline; shipping-label badge above the headline; stats rendered as a manifest ledger strip below the CTAs.
// FORM: user-directed pivot from two dealt directions (assigned "Margin Ledger", pick "Margin Board") to their own concrete brief — literal warehouse/box/forklift/big-brand-tech world — after seeing both cards; this direction is the user's brief, not the roll's card.
// FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
export default function Home() {
  const [loaded,    setLoaded]    = useState(false)
  const [heroPhase, setHeroPhase] = useState(0)

  useEffect(() => {
    setLoaded(true)
    // Hero entrance orchestration
    const timings = [150, 500, 800, 950, 1350]
    const timers  = timings.map((t, i) => setTimeout(() => setHeroPhase(i + 1), t))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ background:'transparent', color:'#fff', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif', overflowX:'hidden' }}>

      {/* ── GLOBAL STYLES ─────────────────────────────────────────────── */}
      <style>{`
        /* Base */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { -webkit-font-smoothing: antialiased; }

        /* Design tokens */
        :root {
          --c-bg:      #14120E;
          --c-blue:    #2F7DF6;
          --c-yellow:  #F2B705;
          --c-kraft:   #B98A54;
          --c-steel:   #6B7280;
          --c-gold:    #F2B705;
          --c-text:    #F5F1E8;
          --c-muted:   #A7A090;
          --c-card:    #1D1A15;
          --c-border:  rgba(245,241,232,0.07);
        }

        .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }

        /* Animations */
        @keyframes ticker   { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
        @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        @keyframes rotateRing { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes breathe  { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @keyframes float0   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes float1   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-28px)} }
        @keyframes float2   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes scanline  { 0%{transform:translateY(-100vh)} 100%{transform:translateY(100vh)} }
        @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes flashOut  { 0%{opacity:1} 100%{opacity:0} }
        @keyframes heroGlow  { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
        @keyframes stripeMove { from{background-position:0 0} to{background-position:56px 0} }

        /* Hazard stripe divider */
        .hazard-strip { height:10px; width:100%;
          background-image:repeating-linear-gradient(-45deg,#F2B705 0 14px,#14120E 14px 28px);
          background-size:56px 10px; opacity:0.9; animation:stripeMove 3.2s linear infinite; }
        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }

        /* Nav links */
        .lc-link { font-size:12px; font-weight:600; color:rgba(255,255,255,0.45); text-decoration:none;
          padding:6px 12px; border-radius:4px; transition:color 0.2s, background 0.2s; letter-spacing:0.03em; }
        .lc-link:hover { color:#fff; background:rgba(255,255,255,0.05); }

        /* Primary button */
        .lc-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 24px;
          background:linear-gradient(135deg,#2F7DF6,#0284C7); color:#fff; font-size:12px;
          font-weight:700; letter-spacing:0.1em; text-transform:uppercase; border:none; border-radius:4px;
          text-decoration:none; cursor:pointer; position:relative; overflow:hidden;
          box-shadow:0 4px 16px rgba(47,125,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
          transition:transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease; }
        .lc-btn:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(47,125,246,0.45), inset 0 1px 0 rgba(255,255,255,0.2); }
        .lc-btn:active { transform:translateY(0px) scale(0.98); }
        .lc-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.12),transparent); opacity:0; transition:opacity 0.2s; }
        .lc-btn:hover::after { opacity:1; }

        /* Ghost button */
        .lc-ghost { display:inline-flex; align-items:center; gap:8px; padding:12px 24px;
          background:rgba(255,255,255,0.03); color:#fff; font-size:12px; font-weight:700;
          letter-spacing:0.1em; text-transform:uppercase; border:1px solid rgba(255,255,255,0.12);
          border-radius:4px; text-decoration:none; cursor:pointer;
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);
          transition:all 0.2s ease; }
        .lc-ghost:hover { border-color:rgba(255,255,255,0.3); background:rgba(255,255,255,0.06); }

        /* Feature card hover */
        .feat-card { transition:border-color 0.3s, transform 0.3s cubic-bezier(0.4,0,0.2,1); }
        .feat-card:hover { border-color:rgba(47,125,246,0.25) !important; }

        /* Step line */
        .step-line { position:absolute; left:20px; top:44px; bottom:-8px; width:1px;
          background:linear-gradient(180deg,rgba(47,125,246,0.5),transparent); }

        /* Responsive */
        .lc-ham  { display:none !important; }
        .lc-links { display:flex; }

        @media(max-width:768px) {
          .lc-ham   { display:flex !important; }
          .lc-links { display:none !important; }
          .g2,.g3,.g4 { grid-template-columns:1fr !important; }
          .hero-h  { font-size:clamp(36px,10vw,58px) !important; }
          .hero-btns { flex-direction:column !important; align-items:stretch; }
          .hero-btns a { justify-content:center; }
          .g4 { grid-template-columns:1fr 1fr !important; gap:1rem !important; }
          .lc-section { padding-left:1.25rem !important; padding-right:1.25rem !important; padding-top:4rem !important; padding-bottom:4rem !important; }
        }

        /* Small phones */
        @media(max-width:480px) {
          .g4 { grid-template-columns:1fr 1fr !important; gap:0.75rem !important; }
          .lc-products-grid { grid-template-columns:repeat(2,1fr) !important; gap:8px !important; }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(47,125,246,0.3); border-radius:2px; }
      `}</style>

      {/* ── FIXED DARK BASE ───────────────────────────────────────────── */}
      <div style={{ position:'fixed', inset:0, background:'#14120E', zIndex:-3 }}/>
      <div style={{ position:'fixed', inset:0, zIndex:-2, opacity:0.5, pointerEvents:'none',
        backgroundImage:'repeating-linear-gradient(rgba(245,241,232,0.025) 0 1px, transparent 1px 96px), repeating-linear-gradient(90deg, rgba(245,241,232,0.025) 0 1px, transparent 1px 96px)' }}/>

      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:9999, backdropFilter:'blur(24px) saturate(180%)', background:'rgba(20,18,14,0.95)', borderBottom:'1px solid rgba(245,241,232,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', height:60, maxWidth:1200, margin:'0 auto' }}>
          {/* LOGO */}
          <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:32, height:32, border:'1.5px solid rgba(47,125,246,0.4)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(47,125,246,0.06)' }}>
              <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width:18, height:'auto' }}/>
            </div>
            <div>
              <div className="lc-display" style={{ fontSize:14, fontWeight:700, letterSpacing:'0.16em', color:'#ffffff', textTransform:'uppercase', lineHeight:1 }}>
                LEVAM<span style={{ color:'#2F7DF6' }}>CORP</span>
              </div>
              <div style={{ fontSize:7, letterSpacing:'0.2em', color:'#A7A090', textTransform:'uppercase', marginTop:2 }}>
                Distributors · Doral, FL
              </div>
            </div>
          </Link>
          {/* DESKTOP LINKS */}
          <div style={{ display:'flex', alignItems:'center', gap:4 }} className="lc-links">
            {[['#brands','Products'],['#process','Process'],['#about','About'],['#faq','FAQ'],['#contact','Contact']].map(([h,l]) => (
              <a key={l} href={h} style={{ fontSize:12, fontWeight:600, color:'#A7A090', textDecoration:'none', padding:'6px 12px', borderRadius:4, transition:'color 0.2s' }}
                onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.5)'}>{l}</a>
            ))}
            <a href="/insights" style={{ fontSize:12, fontWeight:600, color:'#A7A090', textDecoration:'none', padding:'6px 12px', borderRadius:4, display:'inline-flex', alignItems:'center', gap:6 }}>
              <span style={{ width:6, height:6, background:'#12B76A', borderRadius:'50%', boxShadow:'0 0 6px #12B76A', flexShrink:0 }}/>
              Market Insights
            </a>
            <Link href="/portal" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:4, textDecoration:'none', border:'1px solid rgba(255,255,255,0.15)' }}>
              Client login
            </Link>
            <Link href="/apply" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 18px', background:'linear-gradient(135deg,#2F7DF6,#0284C7)', color:'#fff', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:4, textDecoration:'none', marginLeft:4 }}>
              Apply {IC.arrow}
            </Link>
          </div>
          <MobileMenu/>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── HERO — the shipping journey, autoplaying behind the pitch ─── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', padding:'8rem 2rem 5rem', position:'relative', overflow:'hidden' }}>

        {/* Real footage of the shipment's own journey — label to delivered, on a loop */}
        <HeroVideoBackground/>

        {/* Content — single column, left-weighted, so the video reads as the hero */}
        <div style={{ maxWidth:1200, margin:'0 auto', width:'100%', position:'relative', zIndex:5 }}>

          <div style={{ maxWidth:640 }}>
            {/* Badge — shipping label */}
            <div className="lc-mono" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'6px 14px',
              border:'1.5px dashed rgba(242,183,5,0.5)', borderRadius:4, background:'rgba(20,18,14,0.45)', backdropFilter:'blur(6px)',
              marginBottom:'1.75rem', animation:'fadeUp 0.6s ease both' }}>
              <span style={{ fontSize:9, fontWeight:800, letterSpacing:'0.22em', color:'#F2B705', textTransform:'uppercase' }}>MANIFEST · B2B WHOLESALE · DORAL FL</span>
              <span style={{ fontSize:9, fontWeight:700, padding:'4px 10px', background:'#F2B705', color:'#14120E', borderRadius:2, letterSpacing:'0.1em' }}>PARTNERS ONLY</span>
            </div>

            {/* Headline — typewriter entrance, heavy weight for contrast against the footage */}
            <h1 className="hero-h lc-display" style={{ fontSize:'clamp(38px,5.4vw,74px)', fontWeight:800, lineHeight:0.98, letterSpacing:'-0.035em', margin:'0 0 1.5rem',
              textShadow:'0 2px 24px rgba(0,0,0,0.5)',
              opacity: heroPhase >= 2 ? 1 : 0, transform: heroPhase >= 2 ? 'translateY(0)' : 'translateY(20px)',
              transition:'opacity 0.7s ease, transform 0.7s ease' }}>
              {heroPhase >= 2 && <TypewriterText phase={heroPhase}/>}
            </h1>

            <p style={{ fontSize:16, color:'#A7A090', lineHeight:1.85, maxWidth:480, marginBottom:'2.5rem', animation:'fadeUp 0.7s 0.2s ease both' }}>
              Levam Corp connects approved U.S. distributors and resellers to top consumer electronics and appliance brands — at competitive wholesale prices, from our Doral, FL warehouse.
            </p>

            <div className="hero-btns" style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'fadeUp 0.7s 0.3s ease both', marginBottom:'4rem' }}>
              <Link href="/apply" className="lc-btn">Apply for wholesale access {IC.arrow}</Link>
              <Link href="/portal" className="lc-ghost">Partner portal login</Link>
            </div>

            {/* Stats */}
            <div className="g4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.5rem', maxWidth:520, animation:'fadeUp 0.7s 0.4s ease both' }}>
              {[['48h','Avg. dispatch'],['7+','Premium brands'],['500+','Active SKUs'],['100%','B2B only']].map(([n,l]) => (
                <div key={l} style={{ paddingLeft:'1rem', borderLeft:'1px solid rgba(242,183,5,0.3)', position:'relative' }}>
                  <div style={{ position:'absolute', left:-1, top:0, bottom:0, width:1, background:'linear-gradient(180deg,#F2B705,transparent)', borderRadius:1 }}/>
                  <div className="lc-display" style={{ fontSize:19, fontWeight:700, color:'#F5F1E8', letterSpacing:'-0.02em', lineHeight:1 }}>{n}</div>
                  <div style={{ fontSize:9, color:'#A7A090', textTransform:'uppercase', letterSpacing:'0.14em', marginTop:4, fontWeight:600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="hazard-strip"/>

      {/* ── BRAND TICKER ──────────────────────────────────────────────── */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)', background:'rgba(47,125,246,0.015)', position:'relative', zIndex:5 }}>
        <BrandTicker/>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── CATEGORIES ──────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="brands" style={{ padding:'7rem 2rem', position:'relative', zIndex:5 }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <Reveal>
            <div style={{ marginBottom:'3.5rem', textAlign:'center' }}>
              <h2 className="lc-display" style={{ fontSize:'clamp(26px,4vw,48px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1 }}>
                One source. Every category.
              </h2>
              <p style={{ fontSize:13, color:'#A7A090', maxWidth:360, margin:'0.75rem auto 0' }}>
                From 32" TVs to kitchen appliances — all from verified brand suppliers.
              </p>
            </div>
          </Reveal>
          <div className="g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { icon:IC.tv,     label:'Televisions',       desc:'Smart TVs, 4K UHD, QLED & Mini-LED from Hisense and Samsung. 32" to 100".', color:'#2F7DF6' },
              { icon:IC.zap,    label:'Electronics',       desc:'Consumer electronics from top brands — Sony, Samsung, Logitech, Anker and more. Headphones, speakers, chargers, accessories.', color:'#F2B705' },
              { icon:IC.coffee, label:'Small Appliances',  desc:'Coffee makers, blenders, rice cookers, irons from Brentwood, Hamilton Beach, Proctor Silex.', color:'#12B76A' },
              { icon:IC.home2,  label:'Kitchen & Cooking', desc:'Air fryers, deep fryers, rice cookers, pressure cookers and complete kitchen lineups from top brands.', color:'#B98A54' },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i * 0.08}>
                <TiltCard glow={c.color}>
                  <Card style={{ display:'flex', gap:'1.25rem', alignItems:'flex-start', height:'100%' }} accent={c.color}>
                    <div style={{ width:50, height:50, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                      background:`rgba(${c.color==='#2F7DF6'?'47,125,246':c.color==='#F2B705'?'242,183,5':c.color==='#12B76A'?'18,183,106':'185,138,84'},0.22)`,
                      border:`1px solid rgba(${c.color==='#2F7DF6'?'47,125,246':c.color==='#F2B705'?'242,183,5':c.color==='#12B76A'?'18,183,106':'185,138,84'},0.4)`,
                      color:c.color }}>
                      {c.icon}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:6 }}>{c.label}</div>
                      <div style={{ fontSize:12.5, color:'#A7A090', lineHeight:1.7 }}>{c.desc}</div>
                    </div>
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Wave/>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── STATS ───────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="stats" style={{ padding:'6rem 2rem', position:'relative', zIndex:5, background:'rgba(29,26,21,0.6)', borderTop:'1px solid rgba(245,241,232,0.05)', borderBottom:'1px solid rgba(245,241,232,0.05)' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(47,125,246,0.05) 1px, transparent 1px)', backgroundSize:'38px 38px', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'-15%', right:'2%', width:480, height:480, background:'radial-gradient(circle,rgba(107,114,128,0.24) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-20%', left:'-2%', width:420, height:420, background:'radial-gradient(circle,rgba(18,183,106,0.21) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2rem', textAlign:'center' }}>
            {[
              { to:500, s:'+', label:'Active SKUs',      sub:'across all brands' },
              { to:48,  s:'h', label:'Avg. dispatch',    sub:'from Doral, FL' },
              { to:7,   s:'+', label:'Premium brands',   sub:'direct wholesale' },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i*0.12}>
                <div style={{ padding:'2rem 1rem' }}>
                  <div style={{ fontSize:'clamp(48px,6vw,80px)', fontWeight:900, letterSpacing:'-0.03em', color:'#fff', lineHeight:1, textShadow:'0 0 40px rgba(47,125,246,0.35)' }}>
                    <SlotCounter to={stat.to} suffix={stat.s}/>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#2F7DF6', marginTop:10, letterSpacing:'0.06em' }}>{stat.label}</div>
                  <div style={{ fontSize:11, color:'rgba(167,160,144,0.5)', marginTop:4 }}>{stat.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Wave flip color="47,125,246"/>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── PROCESS ─────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="process" style={{ padding:'7rem 2rem', position:'relative', zIndex:5, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'5%', right:'-8%', width:500, height:500, background:'radial-gradient(circle,rgba(18,183,106,0.22) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-10%', left:'-8%', width:380, height:380, background:'radial-gradient(circle,rgba(242,183,5,0.19) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <div className="g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'start' }}>
            <Reveal>
              <div style={{ position:'sticky', top:100 }}>
                <h2 className="lc-display" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 1.25rem', lineHeight:1.1 }}>Simple process.<br/>Real results.</h2>
                <p style={{ fontSize:13.5, color:'#A7A090', lineHeight:1.85, maxWidth:360, marginBottom:'2rem' }}>
                  We review every application personally. We work with a select group of serious distributors, resellers, and retailers — not a marketplace.
                </p>
                <Link href="/apply" className="lc-btn">Start your application {IC.arrow}</Link>
              </div>
            </Reveal>
            <div>
              {[
                { n:'01', title:'Apply online',      desc:'Submit your business info — EIN, resale certificate, and a brief description of what you sell and where.' },
                { n:'02', title:'Get approved',      desc:'We review every application personally and respond within 1–2 business days.' },
                { n:'03', title:'Access your portal',desc:'Once approved you get private access to our full catalog — live pricing, stock levels, and order tracking.' },
                { n:'04', title:'Order & receive',   desc:'Place orders through your portal. We dispatch from Doral, FL with an average 48-hour turnaround.' },
              ].map((step, i) => (
                <Reveal key={step.n} delay={i*0.1}>
                  <div style={{ display:'flex', gap:'1.25rem', padding:'1.75rem 0', borderBottom:i<3?'1px solid rgba(255,255,255,0.04)':'none', position:'relative' }}>
                    {i < 3 && <DrawLine height={110} delay={i * 0.15}/>}
                    <div style={{ width:40, height:40, borderRadius:'50%', border:'1px solid rgba(47,125,246,0.3)', background:'rgba(47,125,246,0.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative', zIndex:1 }}>
                      <span style={{ fontSize:9, fontWeight:900, color:'#2F7DF6', letterSpacing:'0.05em' }}>{step.n}</span>
                    </div>
                    <div style={{ paddingTop:6 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:5 }}>{step.title}</div>
                      <div style={{ fontSize:12.5, color:'#A7A090', lineHeight:1.7 }}>{step.desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── WHY LEVAM ───────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="features" style={{ padding:'7rem 2rem', position:'relative', zIndex:5, background:'transparent', borderTop:'1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 50% at 0% 50%,rgba(47,125,246,0.03),transparent), radial-gradient(ellipse 70% 50% at 100% 50%,rgba(107,114,128,0.03),transparent)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:'3.5rem' }}>
              <h2 className="lc-display" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1 }}>Built for serious business.</h2>
            </div>
          </Reveal>
          <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[
              { icon:IC.dollar, title:'Wholesale pricing',       desc:'Direct access to competitive wholesale rates — not inflated reseller prices.',  color:'#12B76A' },
              { icon:IC.shield, title:'Verified partners only',  desc:'Every partner is vetted personally. This protects your margins.',                color:'#2F7DF6' },
              { icon:IC.zap,    title:'48h dispatch average',    desc:'Orders ship from our Doral, FL warehouse with full tracking.',                   color:'#F2B705' },
              { icon:IC.box,    title:'Live catalog access',     desc:'Your private portal shows real-time pricing and stock. No guessing.',            color:'#6B7280' },
              { icon:IC.globe,  title:'U.S. based operation',    desc:'6315 NW 99th Ave, Doral, FL 33178. Registered Florida business.',               color:'#2F7DF6' },
              { icon:IC.users,  title:'Dedicated support',       desc:'Mon–Fri 9AM–5PM ET. We speak English and Spanish. You talk to us directly.',    color:'#12B76A' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i*0.07}>
                <TiltCard glow={f.color} style={{ height:'100%' }}>
                  <Card style={{ height:'100%' }} accent={f.color}>
                    <div style={{ color:f.color, marginBottom:'1rem' }}>{f.icon}</div>
                    <div style={{ fontSize:13.5, fontWeight:700, color:'#fff', marginBottom:7 }}>{f.title}</div>
                    <div style={{ fontSize:12, color:'#A7A090', lineHeight:1.7 }}>{f.desc}</div>
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── ABOUT ───────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="about" style={{ padding:'7rem 2rem', position:'relative', zIndex:5, overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-12%', left:'-8%', width:480, height:480, background:'radial-gradient(circle,rgba(242,183,5,0.21) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-15%', right:'-6%', width:400, height:400, background:'radial-gradient(circle,rgba(47,125,246,0.19) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <div className="g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }}>
            <Reveal>
              <div>
                <h2 className="lc-display" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 1.25rem', lineHeight:1.1 }}>
                  A different kind<br/>of distributor.
                </h2>
                <p style={{ fontSize:13.5, color:'#A7A090', lineHeight:1.9, marginBottom:'1rem' }}>
                  Levam Corp Distributors is a B2B wholesale distribution company based in Doral, FL. We source electronics and home appliances directly from top brands and distribute them to approved business partners at competitive wholesale prices.
                </p>
                <p style={{ fontSize:13.5, color:'#A7A090', lineHeight:1.9, marginBottom:'2rem' }}>
                  We are not a marketplace. We are a distribution company with a real warehouse, a real team, and a real commitment to the partners we work with.
                </p>
                {['Registered Florida business (DBA)','Warehouse in Doral, FL 33178','English & Spanish speaking team','MOQ varies by product — no pressure'].map(item => (
                  <div key={item} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, color:'#A7A090', fontSize:13 }}>
                    <span style={{ color:'#2F7DF6', flexShrink:0 }}>{IC.check}</span>{item}
                  </div>
                ))}
                <div style={{ display:'flex', gap:18, marginTop:'2rem' }}>
                  <StampSeal label="Florida Registered" sub="DBA on file" color="#F2B705"/>
                  <StampSeal label="Verified Partners" sub="Personally reviewed" color="#2F7DF6" delay={0.15}/>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <TiltCard glow="#2F7DF6">
                <Card accent="#2F7DF6">
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', color:'rgba(167,160,144,0.5)', textTransform:'uppercase', marginBottom:'1.25rem' }}>Company information</div>
                  {[
                    ['Legal name','Levam Corp Distributors (DBA)'],
                    ['Address','6315 NW 99th Ave, Doral, FL 33178'],
                    ['State','Florida, United States'],
                    ['Operations','B2B Wholesale Distribution'],
                    ['Brands','Hisense · Samsung · Brentwood · Hamilton Beach · Avanti · Proctor Silex · Magic Bullet'],
                  ].map(([lbl,val]) => (
                    <div key={lbl} style={{ padding:'0.8rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize:9, color:'rgba(167,160,144,0.5)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:3 }}>{lbl}</div>
                      <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.65)', fontWeight:500, lineHeight:1.5 }}>{val}</div>
                    </div>
                  ))}
                </Card>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── LANGUAGE ────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" style={{ padding:'5rem 2rem', position:'relative', zIndex:5, background:'rgba(47,125,246,0.02)', borderTop:'1px solid rgba(47,125,246,0.06)', borderBottom:'1px solid rgba(47,125,246,0.06)', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', right:'4%', width:440, height:440, background:'radial-gradient(circle,rgba(107,114,128,0.23) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-30%', left:'-2%', width:380, height:380, background:'radial-gradient(circle,rgba(18,183,106,0.19) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', gap:'3rem', flexWrap:'wrap', justifyContent:'space-between', position:'relative' }}>
          <Reveal>
            <div style={{ flex:1, minWidth:280 }}>
              <h2 className="lc-display" style={{ fontSize:'clamp(22px,3vw,36px)', fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 1rem', lineHeight:1.15 }}>
                English & Español.<br/>
                <span style={{ color:'#A7A090', fontWeight:500, fontSize:'0.75em' }}>A dedicated rep for every partner.</span>
              </h2>
              <p style={{ fontSize:13.5, color:'#A7A090', lineHeight:1.85, maxWidth:440 }}>
                Whether you communicate in English or Spanish, we have dedicated team members ready to assist you. We'll help you find exactly what you need — the right products, the right quantities, the right price. You are never left searching alone.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ display:'flex', flexDirection:'column', gap:10, minWidth:260 }}>
              {[['🇺🇸','English','Full support in English — orders, quotes, invoices, and communication.'],['🌎','Español','Atención completa en español — pedidos, cotizaciones y comunicación.']].map(([flag,lang,desc]) => (
                <TiltCard key={lang} glow="#2F7DF6">
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'1rem 1.25rem', background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, backdropFilter:'blur(16px)' }}>
                    <span style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{flag}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:3 }}>{lang}</div>
                      <div style={{ fontSize:11.5, color:'#A7A090', lineHeight:1.55 }}>{desc}</div>
                    </div>
                  </div>
                </TiltCard>
              ))}
              <div style={{ padding:'0.875rem 1.25rem', background:'rgba(47,125,246,0.05)', border:'1px solid rgba(47,125,246,0.14)', borderRadius:10, fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.6, backdropFilter:'blur(12px)' }}>
                WhatsApp: <a href="https://wa.me/17864909005" style={{ color:'#2F7DF6', textDecoration:'none', fontWeight:600 }}>(786) 490-9005</a> · Mon–Fri 9AM–5PM ET
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MARKET INSIGHTS PREVIEW ─────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" style={{ padding:'6rem 2rem', position:'relative', zIndex:5, borderTop:'1px solid rgba(255,255,255,0.04)', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:'-20%', left:'-6%', width:460, height:460, background:'radial-gradient(circle,rgba(18,183,106,0.22) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'-15%', right:'0%', width:340, height:340, background:'radial-gradient(circle,rgba(242,183,5,0.18) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'3rem', flexWrap:'wrap', gap:12 }}>
              <div>
                <h2 className="lc-display" style={{ fontSize:'clamp(22px,3vw,38px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1, display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ width:8, height:8, background:'#12B76A', borderRadius:'50%', animation:'pulseDot 2s infinite', boxShadow:'0 0 6px rgba(18,183,106,0.8)', flexShrink:0 }}/>
                  Stay ahead of the market.
                </h2>
              </div>
              <Link href="/insights" style={{ fontSize:12, color:'#2F7DF6', textDecoration:'none', fontWeight:600, display:'flex', alignItems:'center', gap:6, padding:'8px 16px', border:'1px solid rgba(47,125,246,0.2)', borderRadius:20, background:'rgba(47,125,246,0.04)', backdropFilter:'blur(8px)' }}>
                View all insights {IC.arrow}
              </Link>
            </div>
          </Reveal>
          <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {insightItems.map((ins, i) => (
              <Reveal key={ins.title} delay={i*0.1}>
                <TiltCard glow="#2F7DF6">
                  <Link href="/insights" style={{ textDecoration:'none', display:'block' }}>
                    <Card style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:9, padding:'3px 10px', background:'rgba(47,125,246,0.1)', color:'#2F7DF6', borderRadius:10, fontWeight:700, border:'0.5px solid rgba(47,125,246,0.2)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{ins.tag}</span>
                        <span style={{ fontSize:9, color:'rgba(167,160,144,0.5)' }}>{ins.date}</span>
                      </div>
                      <div style={{ fontSize:13.5, fontWeight:700, color:'#fff', lineHeight:1.5, flex:1 }}>{ins.title}</div>
                      <div style={{ fontSize:11, color:'#2F7DF6', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>Read insight {IC.arrow}</div>
                    </Card>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── PRODUCT PREVIEW ─────────────────────────────────────────────── */}
      <ProductPreview/>


      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── FOUNDERS ────────────────────────────────────────────────── */}
      <section className="lc-section" style={{ padding:'7rem 2rem', position:'relative', zIndex:5, borderTop:'1px solid rgba(255,255,255,0.04)', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'0%', left:'8%', width:420, height:420, background:'radial-gradient(circle,rgba(47,125,246,0.22) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'8%', right:'6%', width:420, height:420, background:'radial-gradient(circle,rgba(107,114,128,0.22) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:'4rem' }}>
              <h2 className="lc-display" style={{ fontSize:'clamp(26px,4vw,46px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1, margin:'0 0 1rem' }}>
                Built by people who know<br/>the business.
              </h2>
              <p style={{ fontSize:14, color:'#A7A090', maxWidth:480, margin:'0 auto', lineHeight:1.8 }}>
                Levam Corp was founded by two entrepreneurs who understand what resellers and distributors actually need — reliable supply, real pricing, and a partner who picks up the phone.
              </p>
            </div>
          </Reveal>

          <div className="g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Victor */}
            <Reveal delay={0.05}>
              <TiltCard glow="#2F7DF6" style={{ height:'100%' }}>
                <Card style={{ height:'100%' }} accent="#2F7DF6">
                  {/* Avatar */}
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,rgba(47,125,246,0.3),rgba(107,114,128,0.2))', border:'2px solid rgba(47,125,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem', fontSize:28, fontWeight:900, color:'#2F7DF6', letterSpacing:'-0.02em' }}>
                    VM
                  </div>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', color:'#2F7DF6', textTransform:'uppercase', marginBottom:6 }}>Co-founder & Partner</div>
                  <h3 className="lc-display" style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:'1rem', letterSpacing:'-0.01em' }}>Victor Mendoza</h3>
                  <p style={{ fontSize:13.5, color:'#A7A090', lineHeight:1.85, marginBottom:'1.25rem' }}>
                    Victor brings hands-on experience in B2B sales and product sourcing. His focus is on building direct relationships with brand suppliers and making sure every partner we work with gets consistent access to the right products at the right price.
                  </p>
                  <p style={{ fontSize:13.5, color:'#A7A090', lineHeight:1.85 }}>
                    "We started Levam Corp because we saw how hard it was for serious resellers to find a distributor they could actually trust. We wanted to be that company."
                  </p>
                  <div style={{ marginTop:'1.5rem', display:'flex', gap:10 }}>
                    <a href="mailto:partners@levamcorp.com" style={{ fontSize:11, color:'#2F7DF6', textDecoration:'none', fontWeight:600, padding:'7px 14px', border:'1px solid rgba(47,125,246,0.25)', borderRadius:20, background:'rgba(47,125,246,0.06)' }}>
                      Get in touch
                    </a>
                    <a href="https://wa.me/17864909005" target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textDecoration:'none', fontWeight:600, padding:'7px 14px', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20 }}>
                      WhatsApp
                    </a>
                  </div>
                </Card>
              </TiltCard>
            </Reveal>

            {/* Leopoldo */}
            <Reveal delay={0.12}>
              <TiltCard glow="#6B7280" style={{ height:'100%' }}>
                <Card style={{ height:'100%' }} accent="#6B7280">
                  {/* Avatar */}
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,rgba(107,114,128,0.3),rgba(47,125,246,0.2))', border:'2px solid rgba(107,114,128,0.3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.25rem', fontSize:28, fontWeight:900, color:'#6B7280', letterSpacing:'-0.02em' }}>
                    LE
                  </div>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', color:'#6B7280', textTransform:'uppercase', marginBottom:6 }}>Co-founder & Partner</div>
                  <h3 className="lc-display" style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:'1rem', letterSpacing:'-0.01em' }}>Leopoldo Espinoza</h3>
                  <p style={{ fontSize:13.5, color:'#A7A090', lineHeight:1.85, marginBottom:'1.25rem' }}>
                    Leopoldo oversees operations and logistics, making sure orders move fast and partners are always taken care of. With a background in business operations and client management, he keeps the Levam Corp machine running smoothly every day.
                  </p>
                  <p style={{ fontSize:13.5, color:'#A7A090', lineHeight:1.85 }}>
                    "Our partners are not just customers. They are businesses we're invested in helping grow. When they win, we win."
                  </p>
                  <div style={{ marginTop:'1.5rem', display:'flex', gap:10 }}>
                    <a href="mailto:leopoldo@levamcorp.com" style={{ fontSize:11, color:'#6B7280', textDecoration:'none', fontWeight:600, padding:'7px 14px', border:'1px solid rgba(107,114,128,0.25)', borderRadius:20, background:'rgba(107,114,128,0.06)' }}>
                      Get in touch
                    </a>
                    <a href="https://wa.me/17864909005" target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textDecoration:'none', fontWeight:600, padding:'7px 14px', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20 }}>
                      WhatsApp
                    </a>
                  </div>
                </Card>
              </TiltCard>
            </Reveal>
          </div>

          {/* Bottom note */}
          <Reveal delay={0.2}>
            <div style={{ textAlign:'center', marginTop:'3rem', padding:'1.5rem 2rem', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>
              <div style={{ fontSize:13, color:'#A7A090', lineHeight:1.8 }}>
                Based in <strong style={{ color:'rgba(255,255,255,0.6)' }}>Doral, FL</strong> · English & Spanish · Mon–Fri 9AM–5PM ET
                <span style={{ margin:'0 12px', opacity:0.3 }}>·</span>
                <a href="mailto:partners@levamcorp.com" style={{ color:'#2F7DF6', textDecoration:'none', fontWeight:600 }}>partners@levamcorp.com</a>
                <span style={{ margin:'0 12px', opacity:0.3 }}>·</span>
                <a href="https://wa.me/17864909005" style={{ color:'#2F7DF6', textDecoration:'none', fontWeight:600 }}>(786) 490-9005</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <FAQSection/>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── CTA ─────────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="cta" style={{ padding:'7rem 2rem', position:'relative', zIndex:5, overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 70% at 50% 50%,rgba(47,125,246,0.10) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'-20%', left:'-6%', width:420, height:420, background:'radial-gradient(circle,rgba(107,114,128,0.21) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-25%', right:'-6%', width:420, height:420, background:'radial-gradient(circle,rgba(242,183,5,0.19) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(47,125,246,0.08) 1px, transparent 1px)', backgroundSize:'24px 24px', pointerEvents:'none', opacity:0.6 }}/>
        <Reveal>
          <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
            <h2 className="lc-display" style={{ fontSize:'clamp(28px,4.5vw,54px)', fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 1rem', lineHeight:1.05 }}>
              Apply in 5 minutes.<br/>Response in 48 hours.
            </h2>
            <p style={{ fontSize:14, color:'#A7A090', lineHeight:1.8, marginBottom:'2.5rem' }}>
              We review every application personally. If your business is a fit, you'll get access to our full wholesale catalog with live pricing and stock levels.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/apply" className="lc-btn" style={{ fontSize:13, padding:'14px 32px' }}>Apply for a partner account {IC.arrow}</Link>
              <a href="mailto:partners@levamcorp.com" className="lc-ghost">Contact us first</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── CONTACT ─────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="contact" style={{ padding:'6rem 2rem', position:'relative', zIndex:5, borderTop:'1px solid rgba(255,255,255,0.04)', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-15%', right:'-2%', width:460, height:460, background:'radial-gradient(circle,rgba(18,183,106,0.23) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-20%', left:'-4%', width:360, height:360, background:'radial-gradient(circle,rgba(47,125,246,0.18) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <h2 className="lc-display" style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 3rem', lineHeight:1.1 }}>Get in touch.</h2>
          </Reveal>
          <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
            {[
              { icon:IC.mail,  label:'Email',    value:'partners@levamcorp.com',          href:'mailto:partners@levamcorp.com' },
              { icon:IC.phone, label:'Phone',    value:'(786) 878-4122 · (786) 546-9476', href:'tel:+17868784122' },
              { icon:IC.pin,   label:'Location', value:'6315 NW 99th Ave\nDoral, FL 33178', href:null },
            ].map((c, i) => (
              <Reveal key={c.label} delay={i*0.1}>
                <TiltCard glow="#2F7DF6" style={{ height:'100%' }}>
                  <Card style={{ height:'100%' }}>
                    <div style={{ color:'#2F7DF6', marginBottom:'1rem' }}>{c.icon}</div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', color:'rgba(167,160,144,0.5)', textTransform:'uppercase', marginBottom:8 }}>{c.label}</div>
                    {c.href
                      ? <a href={c.href} style={{ fontSize:13, color:'#fff', textDecoration:'none', fontWeight:500 }}>{c.value}</a>
                      : <div style={{ fontSize:13, color:'#fff', fontWeight:500, whiteSpace:'pre-line', lineHeight:1.6 }}>{c.value}</div>}
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <footer style={{ padding:'2.5rem 2rem 2rem', borderTop:'1px solid rgba(47,125,246,0.08)', background:'#14120E', position:'relative', zIndex:5, borderTop:'1px solid rgba(245,241,232,0.05)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Ask us anything */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16, paddingBottom:'1.75rem', marginBottom:'1.75rem', borderBottom:'1px solid rgba(245,241,232,0.06)' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:3 }}>Haven&rsquo;t applied yet? Ask us anything.</div>
              <div style={{ fontSize:11.5, color:'rgba(167,160,144,0.5)' }}>Drop your email and a question — we&rsquo;ll reply within 1&ndash;2 business days.</div>
            </div>
            <FooterAsk/>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
            <div className="lc-display" style={{ fontSize:12, fontWeight:700, letterSpacing:'0.18em', color:'rgba(167,160,144,0.5)', textTransform:'uppercase' }}>
              LEVAM<span style={{ color:'#2F7DF6' }}>CORP</span>
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.14)' }}>© {new Date().getFullYear()} Levam Corp Distributors · Doral, FL · B2B wholesale only</div>
            <div style={{ display:'flex', gap:18 }}>
              {[['Portal','/portal'],['Apply','/apply'],['Insights','/insights'],['FAQ','#faq'],['Contact','#contact']].map(([l,h]) => (
                <a key={l} href={h} style={{ fontSize:11, color:'rgba(167,160,144,0.5)', textDecoration:'none', fontWeight:600, letterSpacing:'0.06em', transition:'color 0.2s' }}
                  onMouseOver={e=>e.target.style.color='rgba(255,255,255,0.6)'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.22)'}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
