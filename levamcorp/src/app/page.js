'use client'
import React, { useEffect, useRef, useState } from 'react'
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

    const glowRGB = hexToRgb(glow)

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

// ── LIVE CLOCK — Doral, FL (America/New_York) time, ticks in the hero badge ────
function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: true,
    }))
    tick()
    const iv = setInterval(tick, 15000)
    return () => clearInterval(iv)
  }, [])
  return <span>{time}</span>
}

// ── BRAND MARQUEE — real logos, pinned to the foot of the hero video ───────────
const BRAND_LOGOS = [
  { name: 'SharkNinja',    file: 'sharkninja.png' },
  { name: 'JBL',           file: 'jbl.png',           tall: true },
  { name: 'Logitech',      file: 'logitech.png' },
  { name: 'Harman Kardon', file: 'harman-kardon.png' },
  { name: 'DJI',           file: 'dji.png',           tall: true },
  { name: 'Anker',         file: 'anker.png' },
  { name: 'Amazon',        file: 'amazon.png' },
  { name: 'Hisense',       file: 'hisense.png' },
  { name: 'Samsung',       file: 'samsung.png' },
  { name: 'KitchenAid',    file: 'kitchenaid.png' },
  { name: 'Nintendo',      file: 'nintendo.png' },
  { name: 'nutribullet',   file: 'nutribullet.png' },
  { name: 'PlayStation',   file: 'playstation.png',   tall: true },
]

function BrandMarquee() {
  const row = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS]
  return (
    <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:4,
      borderTop:'1px solid rgba(255,255,255,0.09)',
      background:'linear-gradient(180deg, rgba(20,18,14,0.72), rgba(20,18,14,0.95))',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)' }}>
      <div style={{ display:'flex', alignItems:'center', height:84 }}>
        <div className="lc-mono" style={{ flex:'0 0 auto', display:'flex', alignItems:'center', gap:10,
          padding:'0 22px 0 32px', fontSize:9.5, letterSpacing:'0.22em', color:'rgba(245,241,232,0.45)',
          whiteSpace:'nowrap', borderRight:'1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ width:5, height:5, borderRadius:'50%', background:'#F2B705' }}/>
          AUTHORIZED BRANDS
        </div>
        <div style={{ position:'relative', flex:'1 1 auto', overflow:'hidden',
          maskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)',
          WebkitMaskImage:'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)' }}>
          <div style={{ display:'flex', width:'max-content', animation:'ticker 34s linear infinite' }}>
            {row.map((b, i) => (
              <div key={i} className="brand-logo-item" style={{ display:'flex', alignItems:'center', justifyContent:'center',
                width:150, height:84, padding: b.tall ? '16px 20px' : '10px 20px', flexShrink:0, opacity:0.72 }}>
                <img src={`/brands/${b.file}`} alt={b.name} style={{ width:'100%', height:'100%', objectFit:'contain' }}/>
              </div>
            ))}
          </div>
        </div>
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

// ── CARD SHELL ────────────────────────────────────────────────────────────────
const hexToRgb = (hex) => {
  const h = hex.replace('#','')
  return `${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)}`
}

// Tiny deterministic barcode — same accent always draws the same bars
const Barcode = ({ seed, rgb }) => (
  <span style={{ display:'flex', gap:1.5, alignItems:'flex-end', height:11, flexShrink:0 }}>
    {seed.split('').map((ch, i) => {
      const w = (parseInt(ch, 16) || 1) % 3 + 1
      return <span key={i} style={{ display:'inline-block', width:w, height:6 + w * 2, background:`rgba(${rgb},0.65)` }}/>
    })}
  </span>
)

// Shared "shipping tag" shell — every info block on the site reads as a manifest
// tag pulled off a crate, not a generic bordered card: a clipped hang-tag corner,
// a grommet hole, and a tag-code + barcode header above the content.
const Card = ({ children, style={}, accent='#2F7DF6' }) => {
  const rgb  = hexToRgb(accent)
  const code = accent.replace('#','').toUpperCase().slice(-4)
  return (
    <div style={{
      background:`linear-gradient(160deg, rgba(${rgb},0.16) 0%, rgba(${rgb},0.03) 45%, #1D1A15 80%)`,
      border:`1.5px dashed rgba(${rgb},0.45)`,
      borderRadius:2,
      padding:'1.5rem 1.5rem 1.35rem 2.15rem',
      position:'relative',
      overflow:'hidden',
      clipPath:'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)',
      ...style,
    }}>
      {/* Grommet — the hang-tag hole */}
      <div style={{ position:'absolute', top:15, left:10, width:8, height:8, borderRadius:'50%', border:`1.5px solid rgba(${rgb},0.55)`, background:'#14120E' }}/>

      {/* Tag code + barcode header, perforated rule below */}
      <div className="lc-mono" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10,
        fontSize:8, letterSpacing:'0.12em', color:`rgba(${rgb},0.75)`, marginBottom:12, paddingBottom:9,
        borderBottom:`1px dashed rgba(${rgb},0.22)` }}>
        <span>TAG·{code}</span>
        <Barcode seed={code} rgb={rgb}/>
      </div>

      {children}
    </div>
  )
}

// ── CATEGORY LABEL — literal printed shipping-label card, cream stock on black ──
const LABEL_ICON = {
  class:    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>,
  code:     <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M4 7h16M4 12h16M4 17h10"/></svg>,
  origin:   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>,
  shipping: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M3 8l9-4 9 4-9 4-9-4z"/><path d="M3 8v8l9 4 9-4V8"/></svg>,
}

const CATEGORY_LABELS = [
  { num:'01', label:'Televisions', code:'TV', tag:'TAG·7DF6·TV', swatch:'#2f6fd0',
    desc:'Smart TVs, 4K UHD, QLED, Mini-LED and premium home entertainment displays.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M9 20.5h6"/><path d="M12 17v3.5"/></svg>,
    barcode:'repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 5px,#111 5px 6px,transparent 6px 9px,#111 9px 12px,transparent 12px 14px,#111 14px 15px,transparent 15px 19px)' },
  { num:'02', label:'Electronics', code:'EL', tag:'TAG·B705·EL', swatch:'#b8860f',
    desc:'Cameras, streaming devices, smart technology, virtual reality and electronic accessories.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="6.5" width="19" height="12" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6.5l1.5-2.5h5L16 6.5"/></svg>,
    barcode:'repeating-linear-gradient(90deg,#111 0 1px,transparent 1px 4px,#111 4px 6px,transparent 6px 8px,#111 8px 11px,transparent 11px 13px,#111 13px 14px,transparent 14px 18px)' },
  { num:'03', label:'Kitchen Appliances', code:'KA', tag:'TAG·8A54·KA', swatch:'#d98014',
    desc:'Air fryers, blenders, microwaves, ice makers, toasters and specialty kitchen appliances.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><circle cx="7" cy="6.5" r=".6"/><circle cx="10" cy="6.5" r=".6"/></svg>,
    barcode:'repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 4px,#111 4px 7px,transparent 7px 9px,#111 9px 10px,transparent 10px 13px,#111 13px 16px,transparent 16px 18px)' },
  { num:'04', label:'Gaming', code:'GM', tag:'TAG·C41D·GM', swatch:'#6d5bd0',
    desc:'Consoles, controllers, racing wheels, gaming chairs and gaming accessories.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="7" width="19" height="10" rx="5"/><path d="M7 10v4M5 12h4"/><circle cx="16.5" cy="11" r=".9"/><circle cx="18.5" cy="13.5" r=".9"/></svg>,
    barcode:'repeating-linear-gradient(90deg,#111 0 3px,transparent 3px 5px,#111 5px 6px,transparent 6px 10px,#111 10px 12px,transparent 12px 13px,#111 13px 15px,transparent 15px 19px)' },
  { num:'05', label:'Audio', code:'AU', tag:'TAG·5E22·AU', swatch:'#1f9d55',
    desc:'Speakers, headphones, audio cables and sound accessories.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="2.5" y="13.5" width="4" height="6.5" rx="1.6"/><rect x="17.5" y="13.5" width="4" height="6.5" rx="1.6"/></svg>,
    barcode:'repeating-linear-gradient(90deg,#111 0 2px,transparent 2px 6px,#111 6px 7px,transparent 7px 9px,#111 9px 11px,transparent 11px 14px,#111 14px 16px,transparent 16px 19px)' },
  { num:'06', label:'Computers & Accessories', code:'CA', tag:'TAG·9B08·CA', swatch:'#4a6b8a',
    desc:'Computers, keyboards, mice, peripherals and workspace accessories.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="11" rx="2"/><path d="M1.5 19.5h21"/></svg>,
    barcode:'repeating-linear-gradient(90deg,#111 0 1px,transparent 1px 3px,#111 3px 6px,transparent 6px 8px,#111 8px 9px,transparent 9px 12px,#111 12px 15px,transparent 15px 18px)' },
]

const CategoryLabel = ({ item }) => {
  const metaCell = (key, value, borderRight, borderTop) => (
    <div style={{ padding:'9px 12px', borderRight: borderRight ? '1px dashed #b9b5aa' : 'none', borderTop: borderTop ? '1px dashed #b9b5aa' : 'none', display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:7.5, letterSpacing:'0.16em', color:'#6b6b6b', whiteSpace:'nowrap' }}>{LABEL_ICON[key]}{key.toUpperCase()}</div>
      <div style={{ fontSize:11, fontWeight:700 }}>{value}</div>
    </div>
  )
  return (
    <div className="category-label" style={{ '--label-accent':item.swatch, background:'#f4f2ec', color:'#111', border:'1px solid #dcd8ce', borderRadius:4,
      boxShadow:'0 26px 54px -20px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.06)',
      display:'flex', flexDirection:'column', height:'100%', fontFamily:"'JetBrains Mono',monospace", overflow:'hidden' }}>

      {/* Header — brand bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, background:'#14120E', color:'#f4f2ec', padding:'9px 12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <div style={{ width:17, height:17, border:'1.2px solid rgba(245,241,232,0.8)', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <img src="/levamcorp-mark-white.png" alt="" style={{ width:10, height:'auto' }}/>
          </div>
          <div className="lc-display" style={{ fontSize:8.5, letterSpacing:'0.2em', fontWeight:700, whiteSpace:'nowrap' }}>LEVAMCORP</div>
        </div>
        <div className="lc-mono" style={{ fontSize:8, letterSpacing:'0.14em', opacity:0.7, whiteSpace:'nowrap' }}>DORAL · FL</div>
      </div>

      {/* Category / class */}
      <div style={{ padding:'11px 12px 9px', borderBottom:'1.5px solid #111', display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:8 }}>
        <div className="lc-mono" style={{ fontSize:7.5, letterSpacing:'0.2em', color:'#6b6b6b', whiteSpace:'nowrap' }}>CATEGORY / CLASE</div>
        <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.1em', fontWeight:700, whiteSpace:'nowrap', display:'flex', alignItems:'center' }}>
          <span style={{ display:'inline-block', width:7, height:7, borderRadius:1, background:item.swatch, marginRight:7 }}/>{item.num} OF 06
        </div>
      </div>

      {/* Icon + title */}
      <div style={{ padding:'14px 12px 13px', minHeight:82, borderBottom:'1px dashed #b9b5aa', display:'flex', alignItems:'center', gap:11 }}>
        <div style={{ flex:'0 0 26px' }}>{item.icon}</div>
        <div style={{ fontFamily:"'Archivo','Inter',sans-serif", fontSize:21, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.08 }}>{item.label}</div>
      </div>

      {/* Description */}
      <div style={{ padding:12, minHeight:82, borderBottom:'1px dashed #b9b5aa', fontFamily:"'Archivo','Inter',sans-serif", fontSize:12.5, lineHeight:1.5, color:'#3a3a3a' }}>{item.desc}</div>

      {/* Metadata grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1.5px solid #111' }}>
        {metaCell('class', `${item.num} / 06`, true, false)}
        {metaCell('code', item.code, false, false)}
        {metaCell('origin', 'DORAL, FL', true, true)}
        {metaCell('shipping', 'FCL / LCL', false, true)}
      </div>

      {/* Footer — barcode + tag code */}
      <div style={{ padding:'13px 12px 12px', marginTop:'auto', background:'#efece4', display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ height:44, backgroundImage:item.barcode }}/>
        <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'4px 10px', fontSize:9.5, fontWeight:700, letterSpacing:'0.16em' }}>
          <div style={{ whiteSpace:'nowrap' }}>{item.tag}</div>
          <div style={{ color:'#6b6b6b', fontWeight:400 }}>levamcorp.com</div>
        </div>
      </div>
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
  { v: 'hf_20260826_150327_448dd68c-dcd1-4712-872e-d1792487b1c4.mp4', caption: 'Shipping label' },
  { v: 'hf_20260826_150327_c1b478e5-cb61-419a-a69f-8954159f7ed2.mp4', caption: 'The carton' },
  { v: 'hf_20260826_023432_5225b5c5-0e67-42fd-bc62-f23e00d5abab.mp4', caption: 'Wholesale pallet' },
  { v: 'hf_20260826_023432_7b2d9392-b5bd-41c3-96d5-3e761a67efef.mp4', caption: 'On the forklift' },
  { v: 'hf_20260826_023432_3884ce55-7ae3-4903-8b89-9b6aa739f5d3.mp4', caption: 'Into the trailer' },
  { v: 'hf_20260826_023432_e04b4f7d-ceba-487d-9b9e-41fefd44cd35.mp4', caption: 'Truck at the bay' },
  { v: 'hf_20260826_023432_7bb258ee-e933-4ecb-9f2a-b8ea2b96f379.mp4', caption: 'The distribution centre' },
  { v: 'hf_20260826_023355_a6931868-7c6b-440d-b225-ef9e5c9fa6d4.mp4', caption: 'Regional network → delivered' },
]

const JOURNEY_FADE_SEC = 0.7

// Full-bleed background that autoplays through the 8 clips on its own timeline —
// completely independent of page scroll, so scrolling the page is always just
// normal scrolling. Two stacked <video> elements crossfade into each other: the
// next clip is preloaded into the idle element well ahead of time and starts
// playing (both elements briefly in motion together) shortly before the current
// clip's natural end, so the cut dissolves instead of hard-popping. A clip that
// fails to load just gets skipped instead of ever blocking anything — there's no
// loader, no gate, the text above this is always visible regardless of video state.
function HeroVideoBackground() {
  const [caption, setCaption] = useState(JOURNEY_CLIPS[0].caption)
  const [activeIdx, setActiveIdx] = useState(0)
  const slotRefs = [useRef(null), useRef(null)]
  const activeSlot = useRef(0)
  const clipIndex  = useRef(0)
  const switching  = useRef(false)
  const failCount  = useRef(0)

  useEffect(() => {
    const els = [slotRefs[0].current, slotRefs[1].current]
    if (!els[0] || !els[1]) return

    const loadInto = (el, i) => { el.src = JOURNEY_BASE + JOURNEY_CLIPS[i].v; el.load() }

    activeSlot.current = 0
    clipIndex.current  = 0
    switching.current  = false
    loadInto(els[0], 0)
    els[0].play().catch(() => {})
    loadInto(els[1], 1 % JOURNEY_CLIPS.length)
    els[0].style.opacity = '1'
    els[1].style.opacity = '0'

    const crossfadeToNext = () => {
      if (switching.current) return
      switching.current = true
      const from = activeSlot.current
      const to   = from === 0 ? 1 : 0
      const nextIndex = (clipIndex.current + 1) % JOURNEY_CLIPS.length

      els[to].play().catch(() => {})
      els[to].style.opacity = '1'
      els[from].style.opacity = '0'

      clipIndex.current  = nextIndex
      activeSlot.current = to
      setActiveIdx(nextIndex)
      setCaption(JOURNEY_CLIPS[nextIndex].caption)

      setTimeout(() => {
        els[from].pause()
        loadInto(els[from], (nextIndex + 1) % JOURNEY_CLIPS.length)
        switching.current = false
      }, JOURNEY_FADE_SEC * 1000)
    }

    const onError = () => {
      failCount.current += 1
      // Stop retrying after a couple of full laps so a dead CDN doesn't spin forever.
      if (failCount.current <= JOURNEY_CLIPS.length * 2) crossfadeToNext()
    }

    const makeTimeUpdate = (slot) => () => {
      if (activeSlot.current !== slot || switching.current) return
      const el = els[slot]
      if (el.duration && isFinite(el.duration) && el.currentTime >= el.duration - JOURNEY_FADE_SEC) {
        crossfadeToNext()
      }
    }
    const onTimeUpdateA = makeTimeUpdate(0)
    const onTimeUpdateB = makeTimeUpdate(1)
    const onEndedFallback = () => crossfadeToNext() // safety net if timeupdate never fired in time

    els[0].addEventListener('timeupdate', onTimeUpdateA)
    els[1].addEventListener('timeupdate', onTimeUpdateB)
    els[0].addEventListener('ended', onEndedFallback)
    els[1].addEventListener('ended', onEndedFallback)
    els[0].addEventListener('error', onError)
    els[1].addEventListener('error', onError)

    return () => {
      els[0].removeEventListener('timeupdate', onTimeUpdateA)
      els[1].removeEventListener('timeupdate', onTimeUpdateB)
      els[0].removeEventListener('ended', onEndedFallback)
      els[1].removeEventListener('ended', onEndedFallback)
      els[0].removeEventListener('error', onError)
      els[1].removeEventListener('error', onError)
    }
  }, [])

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', zIndex:0 }}>
      {[0, 1].map(slot => (
        <video
          key={slot}
          ref={slotRefs[slot]}
          muted
          playsInline
          preload="auto"
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
            opacity:0, transition:`opacity ${JOURNEY_FADE_SEC}s ease` }}
        />
      ))}

      {/* Scrim so overlaid text stays readable over any frame of any clip */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(20,18,14,0.55) 0%,rgba(20,18,14,0.25) 35%,rgba(20,18,14,0.35) 65%,rgba(20,18,14,0.85) 100%)' }}/>

      {/* Journey caption + dot progress — purely time-driven, never blocks anything */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', flexDirection:'column', gap:12, padding:'0 2rem 1.75rem', pointerEvents:'none' }}>
        <div className="lc-mono" style={{ fontSize:11, letterSpacing:'0.08em', color:'#F5F1E8', transition:'opacity 0.3s ease' }}>{caption}</div>
        <div style={{ display:'flex', gap:6 }}>
          {JOURNEY_CLIPS.map((c, i) => (
            <div key={c.v} style={{ width:20, height:3, borderRadius:2, background: i === activeIdx ? '#F2B705' : 'rgba(245,241,232,0.2)', transition:'background 0.3s ease' }}/>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── INLINE CINEMATIC COMPONENTS ──────────────────────────────────────────────

// Subtle cursor-follow tilt on the hero copy block — tracks mouse position over
// the whole hero section (sectionRef), not just this element, matching the
// imported design's whole-hero tilt rather than a per-card one.
function HeroTiltGroup({ children, sectionRef, maxRy = 3, maxRx = 2 }) {
  const ref = useRef(null)
  useEffect(() => {
    const section = sectionRef.current
    const el = ref.current
    if (!section || !el) return
    let raf = null
    const move = e => {
      const r = section.getBoundingClientRect()
      const mx = (e.clientX - r.left) / r.width - 0.5
      const my = (e.clientY - r.top) / r.height - 0.5
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        el.style.transform = `perspective(1400px) rotateY(${(mx * maxRy).toFixed(2)}deg) rotateX(${(-my * maxRx).toFixed(2)}deg)`
      })
    }
    const leave = () => { el.style.transform = 'perspective(1400px) rotateY(0deg) rotateX(0deg)' }
    section.addEventListener('mousemove', move)
    section.addEventListener('mouseleave', leave)
    return () => {
      section.removeEventListener('mousemove', move)
      section.removeEventListener('mouseleave', leave)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [sectionRef, maxRx, maxRy])
  return <div ref={ref} style={{ transformStyle:'preserve-3d', transition:'transform 0.45s cubic-bezier(0.2,0.8,0.2,1)' }}>{children}</div>
}

// Single-row, dot-separated hero stats that count up from 0 on mount
function HeroStats() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const t0 = performance.now(), dur = 1400
    let raf
    const step = now => {
      const k = Math.min(1, (now - t0) / dur)
      setP(1 - Math.pow(1 - k, 3))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])
  const stats = [
    [Math.round(48 * p) + 'h', 'DISPATCH'],
    [Math.round(500 * p) + '+', 'SKUS'],
    [Math.round(100 * p) + '%', 'B2B ONLY'],
  ]
  return (
    <div className="lc-mono" style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:16, fontSize:11, letterSpacing:'0.16em', color:'rgba(255,255,255,0.5)' }}>
      {stats.map(([n, l], i) => (
        <React.Fragment key={l}>
          {i > 0 && <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,0.25)', flexShrink:0 }}/>}
          <span style={{ whiteSpace:'nowrap' }}><span style={{ color:'rgba(255,255,255,0.86)', fontVariantNumeric:'tabular-nums' }}>{n}</span> {l}</span>
        </React.Fragment>
      ))}
    </div>
  )
}

// Deterministic pseudo-random bar widths (LCG) — same seed always draws the
// same "barcode ruler" strip, so server and client render identically.
function seededBars(seed, count) {
  let s = seed
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  return Array.from({ length: count }, () => {
    const r = rnd()
    return { w: r > 0.82 ? 3 : r > 0.5 ? 2 : 1, tall: r > 0.94 }
  })
}
const RULER_BARS = seededBars(20260826, 120)
const TIMER_BARS = seededBars(77113, 120)

// Odometer-style digit roll, each place spinning independently to its target
function OdometerNumber({ target, play }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!play) return
    const t0 = performance.now(), dur = 2000
    let raf
    const step = now => {
      const k = Math.min(1, (now - t0) / dur)
      setDisplay(Math.round(target * (1 - Math.pow(1 - k, 4))))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [play, target])

  const places = String(target).length
  return (
    <div style={{ display:'flex', height:'0.9em', overflow:'hidden' }}>
      {Array.from({ length: places }, (_, i) => {
        const divisor = Math.pow(10, places - 1 - i)
        const digit = Math.floor(display / divisor) % 10
        return (
          <div key={i} style={{ height:'0.9em', overflow:'hidden' }}>
            <div style={{ display:'flex', flexDirection:'column', transform:`translateY(-${digit * 10}%)`, transition:'transform 0.35s cubic-bezier(0.22,0.61,0.36,1)' }}>
              {[0,1,2,3,4,5,6,7,8,9].map(n => <span key={n} style={{ display:'block', height:'0.9em', lineHeight:'0.9em' }}>{n}</span>)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const MANIFEST_STATS = [
  { label:'ACTIVE SKUS',    code:'SKU', to:500, suffix:'+', note:'ACROSS ALL BRANDS' },
  { label:'AVG. DISPATCH',  code:'ETA', to:48,  suffix:'h', note:'FROM DORAL, FL' },
  { label:'PREMIUM BRANDS', code:'BRD', to:10,  suffix:'+', note:'DIRECT WHOLESALE' },
]

// ── MANIFEST METRICS — the SKU/dispatch/brands strip, styled as a scan ticket ──
function ManifestMetrics() {
  const ref = useRef(null)
  const [play, setPlay] = useState(false)
  const [hoverIdx, setHoverIdx] = useState(-1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setPlay(true); io.disconnect() } }, { threshold:0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ border:'1px solid rgba(245,241,232,0.16)' }}>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'12px 16px', borderBottom:'1px solid rgba(245,241,232,0.16)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#B7B2A2' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ display:'inline-block', width:13, height:13, border:'1px solid rgba(245,241,232,0.5)', borderLeftWidth:3 }}/>
          <span style={{ fontWeight:700, letterSpacing:'0.18em', color:'#F5F1E8' }}>LEVAMCORP</span>
        </div>
        <span style={{ color:'#7C7A73' }}>DORAL · FL</span>
      </div>

      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'10px 16px', borderBottom:'1px solid rgba(245,241,232,0.16)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73' }}>
        <span>MANIFEST / MÉTRICAS</span>
        <span style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:6, height:6, background:'#F2B705', display:'inline-block' }}/>03 OF 03
        </span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(215px,1fr))' }}>
        {MANIFEST_STATS.map((s, i) => (
          <div key={s.label} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(-1)}
            style={{ position:'relative', padding:'clamp(24px,3.4vh,34px) 16px clamp(26px,3.6vh,36px)',
              borderLeft: i === 0 ? '1px solid transparent' : '1px solid rgba(245,241,232,0.16)',
              background: hoverIdx === i ? 'rgba(245,241,232,0.035)' : 'transparent',
              transition:'background 0.4s ease' }}>
            <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73', marginBottom:'clamp(18px,2.6vh,26px)' }}>
              <span>{s.label}</span>
              <span style={{ transition:'color 0.4s', color: hoverIdx === i ? '#F2B705' : '#5F5D58' }}>{s.code}</span>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:1, fontSize:'clamp(46px,5.4vw,72px)', letterSpacing:'-0.045em', fontVariantNumeric:'tabular-nums', color:'#F5F2E9' }}>
              <OdometerNumber target={s.to} play={play}/>
              <span style={{ fontSize:'0.34em', lineHeight:1, letterSpacing:'-0.02em', paddingBottom:'0.16em', color:'#86837C' }}>{s.suffix}</span>
            </div>
            <div className="lc-mono" style={{ marginTop:16, fontSize:10.5, letterSpacing:'0.1em', textTransform:'uppercase', color:'#8F8C85' }}>{s.note}</div>
          </div>
        ))}
      </div>

      <div style={{ position:'relative', display:'flex', alignItems:'flex-end', gap:2, height:34, padding:'0 16px', overflow:'hidden', borderTop:'1px solid rgba(245,241,232,0.16)', background:'rgba(245,241,232,0.03)' }}>
        {RULER_BARS.map((b, i) => (
          <div key={i} style={{ flexShrink:0, width:b.w, height: b.tall ? 24 : 18, background:'#F5F1E8', opacity:0.5 }}/>
        ))}
        <div style={{ position:'absolute', top:0, bottom:0, width:'18%', pointerEvents:'none', background:'linear-gradient(90deg,transparent,rgba(245,241,232,0.09),transparent)', animation:'manifestScan 7s cubic-bezier(0.45,0,0.55,1) infinite' }}/>
      </div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'9px 16px 11px', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
        <span>TAG · 2F19 · MTR</span>
        <span>levamcorp.com</span>
      </div>
    </div>
  )
}

// Dashed connector between the metrics ticket and the process ticket
function ManifestConnector() {
  return (
    <div style={{ position:'relative', height:'clamp(56px,8vh,92px)' }}>
      <div style={{ position:'absolute', left:0, right:0, top:'50%', height:1, backgroundImage:'repeating-linear-gradient(to right, rgba(245,241,232,0.26) 0 5px, rgba(245,241,232,0) 5px 12px)' }}/>
      <div style={{ position:'absolute', left:'50%', top:'50%', width:26, height:26, margin:'-13px 0 0 -13px', background:'#14120E', border:'1px solid rgba(245,241,232,0.2)', borderRadius:'50%' }}/>
      <div style={{ position:'absolute', left:'50%', top:'50%', width:8, height:8, margin:'-4px 0 0 -4px', background:'#F2B705' }}/>
    </div>
  )
}

const STEP_DATA = [
  { title:'Apply online',       code:'APP', body:'Submit your business info — EIN, resale certificate, and a brief description of what you sell and where.', fields:[['REQUIRES','EIN · RESALE CERT'],['TIME','5 MIN']] },
  { title:'Get approved',       code:'REV', body:'We review every application personally and respond within one to two business days.', fields:[['REVIEW','HUMAN'],['TURNAROUND','1–2 DAYS']] },
  { title:'Access your portal', code:'PRT', body:'Once approved you get private access to the full catalog — live pricing, stock levels, order tracking.', fields:[['PRICING','LIVE'],['INVENTORY','REAL-TIME']] },
  { title:'Order & receive',    code:'SHP', body:'Place orders through your portal. We dispatch from Doral, FL with an average 48-hour turnaround.', fields:[['ORIGIN','DORAL, FL'],['SHIPPING','FCL / LCL']] },
]
const STEP_TAGS = ['7DF6','B705','8A54','C41D']
const STEP_DWELL_MS = 5000

// ── PROCESS STEPPER — auto-advancing tabs, hover/click/arrow-keys override ────
function ProcessStepper() {
  const [active, setActive]   = useState(0)
  const [hovered, setHovered] = useState(-1)
  const fillRef = useRef(null)

  useEffect(() => {
    let raf, lastSwitch = performance.now()
    const loop = now => {
      if (hovered === -1) {
        const t = Math.min(1, (now - lastSwitch) / STEP_DWELL_MS)
        if (fillRef.current) fillRef.current.style.width = (t * 100) + '%'
        if (t >= 1) { setActive(a => (a + 1) % STEP_DATA.length); lastSwitch = now }
      } else if (fillRef.current) {
        fillRef.current.style.width = '100%'
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [hovered])

  const onKeyDown = e => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    setActive(a => (a + d + STEP_DATA.length) % STEP_DATA.length)
  }

  const current = hovered >= 0 ? hovered : active
  const barRow = (color, opacity) => (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:34, padding:'0 16px' }}>
      {TIMER_BARS.map((b, i) => <div key={i} style={{ flexShrink:0, width:b.w, height: b.tall ? 24 : 18, background:color, opacity }}/>)}
    </div>
  )

  return (
    <div style={{ border:'1px solid rgba(245,241,232,0.16)' }}>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'12px 16px', borderBottom:'1px solid rgba(245,241,232,0.16)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#B7B2A2' }}>
        <span>PROCEDURE / PROCESO</span>
        <span style={{ display:'flex', alignItems:'center', gap:8, color:'#7C7A73' }}>
          <span style={{ width:6, height:6, background:'#F2B705', display:'inline-block' }}/>0{current + 1} OF 04
        </span>
      </div>

      <div role="tablist" aria-label="How it works" onKeyDown={onKeyDown}>
        {STEP_DATA.map((st, i) => {
          const on = i === current
          return (
            <div key={st.title} role="tab" tabIndex={on ? 0 : -1} aria-selected={on}
              onMouseEnter={() => setHovered(i)} onFocus={() => setHovered(i)} onMouseLeave={() => setHovered(-1)} onClick={() => setActive(i)}
              style={{ position:'relative', padding:'20px 16px 22px', cursor:'pointer',
                borderTop: i === 0 ? '1px solid transparent' : '1px solid rgba(245,241,232,0.12)',
                opacity: on ? 1 : 0.42, background: on ? 'rgba(245,241,232,0.04)' : 'transparent',
                transition:'opacity 0.5s ease, background 0.4s ease' }}>
              <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:12, color: on ? '#C9C5BA' : '#6F6D67' }}>
                <span>STEP 0{i + 1} / 04</span>
                <span style={{ color: on ? '#F2B705' : '#6F6D67' }}>CODE {st.code}</span>
              </div>
              <div style={{ fontSize:18, fontWeight:600, letterSpacing:'-0.02em', marginBottom:8, color: on ? '#fff' : '#C9C5BA' }}>{st.title}</div>
              <div style={{ fontSize:14.5, lineHeight:1.68, color:'#8F8C85', maxWidth:'46ch' }}>{st.body}</div>
              <div style={{ display:'grid', gridTemplateRows: on ? '1fr' : '0fr', transition:'grid-template-rows 0.5s cubic-bezier(0.22,0.61,0.36,1), opacity 0.4s', opacity: on ? 1 : 0 }}>
                <div style={{ overflow:'hidden' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', marginTop:16, borderTop:'1px solid rgba(245,241,232,0.1)' }}>
                    {st.fields.map(([k, v]) => (
                      <div key={k} className="lc-mono" style={{ padding:'11px 14px 2px 0' }}>
                        <div style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>{k}</div>
                        <div style={{ marginTop:5, fontSize:11.5, letterSpacing:'0.08em', color:'#D9D5CA' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ position:'relative', overflow:'hidden', borderTop:'1px solid rgba(245,241,232,0.16)', background:'rgba(245,241,232,0.03)' }}>
        {barRow('#F5F1E8', 0.14)}
        <div ref={fillRef} style={{ position:'absolute', inset:0, overflow:'hidden', width:'0%' }}>
          {barRow('#F2B705', 0.95)}
        </div>
      </div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'9px 16px 11px', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
        <span>TAG · {STEP_TAGS[current]} · {STEP_DATA[current].code}</span>
        <span>levamcorp.com</span>
      </div>
    </div>
  )
}

const PACKING_BARS = seededBars(20260827, 150)
const PACKING_LIST_ROWS = [
  { title:'Wholesale pricing',       body:'Direct access to competitive wholesale rates — not inflated reseller prices.',   k:'TERMS',     v:'NET / PREPAID',  accent:'#12B76A' },
  { title:'Verified partners only',  body:'Every partner is vetted personally. This protects your margins.',                 k:'SCREENING', v:'MANUAL',         accent:'#2F7DF6' },
  { title:'48h dispatch average',    body:'Orders ship from our Doral, FL warehouse with full tracking.',                    k:'LEAD TIME', v:'48 H',           accent:'#F2B705' },
  { title:'Live catalog access',     body:'Your private portal shows real-time pricing and stock. No guessing.',             k:'SYNC',      v:'REAL-TIME',      accent:'#6B7280' },
  { title:'U.S. based operation',    body:'6315 NW 99th Ave, Doral, FL 33178. Registered Florida business.',                 k:'ORIGIN',    v:'DORAL, FL',      accent:'#2F7DF6' },
  { title:'Dedicated support',       body:'Mon–Fri 9AM–5PM ET. English and Spanish. You talk to us directly.',               k:'HOURS',     v:'9–5 ET',         accent:'#12B76A' },
]

// ── PACKING LIST — "Built for serious business" as a manifest line-item table ──
function PackingList() {
  const [active, setActive]   = useState(-1)
  const [hoverIdx, setHoverIdx] = useState(-1)
  const current = hoverIdx >= 0 ? hoverIdx : active
  const cut = current >= 0 ? Math.round(((current + 1) / PACKING_LIST_ROWS.length) * PACKING_BARS.length) : 0
  const litColor = current >= 0 ? PACKING_LIST_ROWS[current].accent : '#F2B705'

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:28, flexWrap:'wrap', marginBottom:'2rem' }}>
        <h2 className="lc-display" style={{ margin:0, fontSize:'clamp(38px,5.2vw,68px)', fontWeight:400, letterSpacing:'-0.045em', lineHeight:1, color:'#F5F2E9' }}>Built for serious business.</h2>
        <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73', textAlign:'right', lineHeight:1.9 }}>
          PACKING LIST<br/>REV. 08 · 2026
        </div>
      </div>

      <div style={{ borderTop:'1px solid rgba(245,241,232,0.3)', borderBottom:'1px solid rgba(245,241,232,0.3)' }}>
        <div className="lc-mono" style={{ display:'grid', gridTemplateColumns:'56px 1fr', gap:'0 24px', padding:'11px 4px 12px', borderBottom:'1px solid rgba(245,241,232,0.14)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
          <span>ITEM</span>
          <span style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
            <span>CAPABILITY / CAPACIDAD</span>
            <span style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:6, height:6, background:litColor, display:'inline-block' }}/>
              {current >= 0 ? `0${current + 1} OF 06` : '06 ITEMS'}
            </span>
          </span>
        </div>

        {PACKING_LIST_ROWS.map((r, i) => {
          const on = current === i
          const code = r.accent.replace('#', '').toUpperCase().slice(-4)
          return (
            <div key={r.title} tabIndex={0}
              onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(-1)}
              onFocus={() => setHoverIdx(i)} onBlur={() => setHoverIdx(-1)}
              onClick={() => setActive(a => a === i ? -1 : i)}
              style={{ position:'relative', padding:'22px 4px', cursor:'pointer',
                borderBottom: i === PACKING_LIST_ROWS.length - 1 ? '1px solid rgba(245,241,232,0.14)' : '1px solid rgba(245,241,232,0.1)',
                background: on ? 'rgba(245,241,232,0.035)' : 'transparent',
                transition:'background 0.35s ease' }}>
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2, background:r.accent, transformOrigin:'top', transform: on ? 'scaleY(1)' : 'scaleY(0)', transition:'transform 0.45s cubic-bezier(0.22,0.61,0.36,1)' }}/>
              <div style={{ display:'grid', gridTemplateColumns:'56px 1fr', gap:'0 24px', alignItems:'start',
                transform: on ? 'translateX(14px)' : 'translateX(0)', transition:'transform 0.45s cubic-bezier(0.22,0.61,0.36,1)' }}>
                <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.14em', paddingTop:5, color: on ? r.accent : '#6F6D67', transition:'color 0.35s' }}>0{i + 1}</div>
                <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) clamp(120px,16vw,190px)', gap:'6px 24px', alignItems:'start' }}>
                  <div>
                    <div style={{ fontSize:'clamp(19px,2vw,24px)', fontWeight:400, letterSpacing:'-0.025em', color: on ? '#fff' : '#DDD8CD', transition:'color 0.35s' }}>{r.title}</div>
                    <div style={{ display:'grid', gridTemplateRows: on ? '1fr' : '0fr', transition:'grid-template-rows 0.5s cubic-bezier(0.22,0.61,0.36,1), opacity 0.4s', opacity: on ? 1 : 0 }}>
                      <div style={{ overflow:'hidden' }}>
                        <div style={{ paddingTop:9, fontSize:14.5, lineHeight:1.62, color:'#8F8C85', maxWidth:'56ch' }}>{r.body}</div>
                      </div>
                    </div>
                  </div>
                  <div className="lc-mono" style={{ textAlign:'right' }}>
                    <div style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>{r.k}</div>
                    <div style={{ marginTop:5, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', color: on ? '#F2EFE6' : '#8F8C85', transition:'color 0.35s' }}>{r.v}</div>
                    <div style={{ marginTop:7, fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color: on ? r.accent : '#5F5D58', transition:'color 0.35s' }}>TAG · {code}</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <div style={{ position:'relative', boxSizing:'border-box', display:'flex', alignItems:'flex-end', gap:2, height:34, padding:'8px 4px', overflow:'hidden' }}>
          {PACKING_BARS.map((b, i) => (
            <div key={i} style={{ flexShrink:0, width:b.w, height: b.tall ? 22 : 16, background: i < cut ? litColor : '#F5F1E8', opacity: i < cut ? 0.95 : 0.14, transition:'background 0.3s ease, opacity 0.3s ease' }}/>
          ))}
          <div style={{ position:'absolute', top:0, bottom:0, width:'18%', pointerEvents:'none', background:'linear-gradient(90deg,transparent,rgba(245,241,232,0.09),transparent)', animation:'manifestScan 7s cubic-bezier(0.45,0,0.55,1) infinite' }}/>
        </div>
      </div>

      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'11px 4px 0', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
        <span>{current >= 0 ? `LINE 0${current + 1} · ${PACKING_LIST_ROWS[current].accent.replace('#', '').toUpperCase().slice(-4)} · SELECTED` : 'MANIFEST COMPLETE · 06 LINES'}</span>
        <span>LEVAMCORP · DORAL · FL</span>
      </div>
    </div>
  )
}

const COMPANY_FACTS = [
  { label:'Registered Florida business (DBA)',   mark:'ON FILE' },
  { label:'Warehouse in Doral, FL 33178',         mark:'ACTIVE' },
  { label:'English & Spanish speaking team',      mark:'BILINGUAL' },
  { label:'MOQ varies by product — no pressure',  mark:'FLEXIBLE' },
]
const COMPANY_FIELDS = [
  { k:'LEGAL NAME',  v:'Levam Corp Distributors (DBA)',       tag:'7DF6' },
  { k:'ADDRESS',     v:'6315 NW 99th Ave, Doral, FL 33178',   tag:'B705' },
  { k:'STATE',       v:'Florida, United States',              tag:'C41D' },
  { k:'OPERATIONS',  v:'B2B Wholesale Distribution',          tag:'7280' },
  { k:'SINCE',       v:'Registered · DBA on file',            tag:'8A54' },
]
const COMPANY_RECORD_BARS = seededBars(20260827, 96)

// Rotating dashed-ring seal — the "Certificate of record" motif's own stamp look
function SealRing({ l1, l2, l3, ring, color }) {
  return (
    <div style={{ position:'relative', width:104, height:104, display:'grid', placeItems:'center', border:`1px solid ${ring}`, borderRadius:'50%' }}>
      <div style={{ position:'absolute', inset:6, border:'1px dashed rgba(245,241,232,0.14)', borderRadius:'50%', animation:'sealSpin 42s linear infinite' }}/>
      <div className="lc-mono" style={{ textAlign:'center', fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', lineHeight:1.7, color }}>
        {l1}<br/>{l2}<br/><span style={{ color:'#6F6D67', letterSpacing:'0.14em' }}>{l3}</span>
      </div>
    </div>
  )
}

// ── COMPANY RECORD — "About" as a certificate-of-record ticket ────────────────
function CompanyRecord() {
  const [hovered, setHovered] = useState(-1)
  const cut = hovered >= 0 ? Math.round(((hovered + 1) / COMPANY_FIELDS.length) * COMPANY_RECORD_BARS.length) : 0

  return (
    <div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
        <span style={{ display:'flex', alignItems:'center', gap:9 }}>
          <span style={{ display:'inline-block', width:6, height:6, background:'#F2B705', borderRadius:'50%', animation:'blip 2.8s ease-in-out infinite' }}/>
          Certificate of record
        </span>
        <span>Form 02 · DBA on file</span>
      </div>
      <div style={{ height:1, background:'rgba(245,241,232,0.3)' }}/>
      <div style={{ height:3 }}/>
      <div style={{ height:1, background:'rgba(245,241,232,0.14)' }}/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))' }}>
        <div style={{ padding:'clamp(34px,5vh,56px) clamp(20px,3.5vw,46px) clamp(30px,4vh,44px) 0' }}>
          <h2 className="lc-display" style={{ margin:0, fontSize:'clamp(32px,4.2vw,52px)', fontWeight:400, letterSpacing:'-0.03em', lineHeight:1, color:'#F5F2E9' }}>
            A different kind<br/>of distributor.
          </h2>
          <p style={{ margin:'clamp(20px,3vh,28px) 0 0', maxWidth:440, fontSize:14.5, lineHeight:1.75, color:'#A7A090' }}>
            Levam Corp Distributors is a B2B wholesale distribution company based in Doral, FL. We source electronics and home appliances directly from top brands and distribute them to approved business partners at competitive wholesale prices.
          </p>
          <p style={{ margin:'16px 0 0', maxWidth:440, fontSize:14.5, lineHeight:1.75, color:'#F5F1E8' }}>
            We are not a marketplace. We are a distribution company with a real warehouse, a real team, and a real commitment to the partners we work with.
          </p>

          <div style={{ marginTop:'clamp(26px,4vh,38px)', borderTop:'1px solid rgba(245,241,232,0.14)' }}>
            {COMPANY_FACTS.map((f,i) => (
              <div key={f.label} style={{ display:'grid', gridTemplateColumns:'22px 1fr auto', gap:14, alignItems:'baseline', padding:'11px 0 12px', borderBottom:'1px solid rgba(245,241,232,0.09)' }}>
                <span className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.14em', color:'#5F5D58' }}>0{i+1}</span>
                <span style={{ fontSize:13.5, color:'#DDD8CD' }}>{f.label}</span>
                <span className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#F2B705' }}>{f.mark}</span>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'clamp(20px,3vw,32px)', marginTop:'clamp(26px,4vh,38px)', flexWrap:'wrap' }}>
            <SealRing l1="FLORIDA" l2="REGISTERED" l3="DBA ON FILE" ring="rgba(245,241,232,0.3)" color="#E4E0D6"/>
            <SealRing l1="VERIFIED" l2="PARTNERS" l3="REVIEWED" ring="#F2B705" color="#F2B705"/>
            <div className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67', lineHeight:2 }}>Seals verified<br/>on file · 2026</div>
          </div>
        </div>

        <div style={{ borderLeft:'1px solid rgba(245,241,232,0.14)', padding:'clamp(34px,5vh,56px) 0 clamp(30px,4vh,44px) clamp(20px,3.5vw,46px)' }}>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73', paddingBottom:14 }}>
            <span style={{ color:'#F5F1E8' }}>Company information</span>
            <span>Tag · {hovered >= 0 ? COMPANY_FIELDS[hovered].tag : '2F19'}</span>
          </div>
          <div style={{ height:1, background:'rgba(245,241,232,0.3)' }}/>

          {COMPANY_FIELDS.map((f,i) => {
            const on = hovered === i
            return (
              <div key={f.k} tabIndex={0}
                onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(-1)} onFocus={()=>setHovered(i)} onBlur={()=>setHovered(-1)}
                style={{ position:'relative', padding:'15px 12px 16px 0', borderBottom:'1px solid rgba(245,241,232,0.09)',
                  background: on ? 'rgba(245,241,232,0.035)' : 'transparent', cursor:'default', transition:'background 0.35s ease' }}>
                <div style={{ position:'absolute', left:0, top:0, bottom:0, width:2, background:'#F2B705', transformOrigin:'top', transform: on ? 'scaleY(1)' : 'scaleY(0)', transition:'transform 0.4s cubic-bezier(0.22,0.61,0.36,1)' }}/>
                <div style={{ display:'grid', gridTemplateColumns:'clamp(96px,12vw,136px) 1fr', gap:'6px 18px', alignItems:'baseline',
                  transform: on ? 'translateX(16px)' : 'translateX(0)', transition:'transform 0.4s cubic-bezier(0.22,0.61,0.36,1)' }}>
                  <div className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color: on ? '#F2B705' : '#6F6D67', transition:'color 0.35s' }}>{f.k}</div>
                  <div style={{ fontSize:15, letterSpacing:'-0.01em', lineHeight:1.5, color: on ? '#fff' : '#DDD8CD', transition:'color 0.35s' }}>{f.v}</div>
                </div>
              </div>
            )
          })}

          <div style={{ marginTop:'clamp(20px,3vh,30px)', borderTop:'1px solid rgba(245,241,232,0.3)', paddingTop:12 }}>
            <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73', paddingBottom:12 }}>
              <span style={{ color:'#F5F1E8' }}>Exhibit A · Warehouse</span>
              <span>Doral · FL 33178</span>
            </div>
            <div style={{ position:'relative', width:'100%', aspectRatio:'16/10', border:'1px solid rgba(245,241,232,0.14)', background:'#0B0C0F', overflow:'hidden' }}>
              <img src="/warehouse.jpg" alt="Levam Corp warehouse — pallets staged for dispatch" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}/>
              <div style={{ position:'absolute', inset:0, boxShadow:'inset 0 0 0 1px rgba(245,241,232,0.06)', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', left:0, right:0, top:0, height:62, pointerEvents:'none', background:'linear-gradient(180deg, rgba(8,9,11,0.72), rgba(8,9,11,0))' }}/>
              <div style={{ position:'absolute', top:10, left:10, width:14, height:14, borderTop:'1px solid rgba(245,241,232,0.55)', borderLeft:'1px solid rgba(245,241,232,0.55)', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', top:10, right:10, width:14, height:14, borderTop:'1px solid rgba(245,241,232,0.55)', borderRight:'1px solid rgba(245,241,232,0.55)', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:10, right:10, width:14, height:14, borderBottom:'1px solid rgba(245,241,232,0.55)', borderRight:'1px solid rgba(245,241,232,0.55)', pointerEvents:'none' }}/>
              <div className="lc-mono" style={{ position:'absolute', top:8, right:32, fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#F5F1E8', background:'rgba(8,9,11,0.82)', padding:'4px 8px', pointerEvents:'none' }}>Ref · WH-01</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height:1, background:'rgba(245,241,232,0.14)' }}/>
      <div style={{ position:'relative', display:'flex', alignItems:'flex-end', gap:2, height:32, padding:'8px 0', overflow:'hidden' }}>
        {COMPANY_RECORD_BARS.map((b,i) => (
          <div key={i} style={{ flex:`${b.w} 1 0`, minWidth:1, height: b.tall ? 20 : 15, background: i < cut ? '#F2B705' : '#F5F1E8', opacity: i < cut ? 0.95 : 0.14 }}/>
        ))}
      </div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, paddingTop:6, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
        <span>{hovered >= 0 ? `Field 0${hovered + 1} · ${COMPANY_FIELDS[hovered].tag} · verified` : 'Record complete · 05 fields'}</span>
        <span>Levamcorp · Doral · FL</span>
      </div>
    </div>
  )
}

const LANG_TABS_DATA = [ { key:'en', label:'English' }, { key:'es', label:'Español' } ]
const LANG_SHEETS = [
  { key:'en', lang:'ENGLISH · EN', copy:'COPY 1 OF 2', stamp:'VERIFIED COPY', signature:'REP ASSIGNED · NAMED CONTACT', hours:'MON–FRI 9AM–5PM ET',
    rows:[
      ['SUPPORT','Full support in English, start to finish.'],
      ['ORDERS & QUOTES','Placed, confirmed and revised in English.'],
      ['INVOICING','Invoices and shipping documents in English.'],
      ['DIRECT REP','The same person every time — no ticket queue.'],
    ] },
  { key:'es', lang:'ESPAÑOL · ES', copy:'COPIA 2 DE 2', stamp:'COPIA VERIFICADA', signature:'REPRESENTANTE ASIGNADO · CONTACTO DIRECTO', hours:'LUN–VIE 9AM–5PM ET',
    rows:[
      ['ATENCIÓN','Atención completa en español, de principio a fin.'],
      ['PEDIDOS Y COTIZACIONES','Pedidos y cotizaciones gestionados en español.'],
      ['FACTURACIÓN','Facturas y documentos de envío en español.'],
      ['REPRESENTANTE','La misma persona siempre — sin fila de tickets.'],
    ] },
]
const LANG_STAMP_BARS = seededBars(4471, 60)

// ── LANGUAGE DECLARATION — carbon-copy service form, cream on dark ────────────
function LanguageDeclaration() {
  const [lang, setLang] = useState('en')
  return (
    <div style={{ background:'#F2EFE6', color:'#08090B', padding:'clamp(18px,2.6vh,26px) clamp(20px,3vw,40px) clamp(22px,3.4vh,34px)' }}>
      <div style={{ display:'flex', gap:'clamp(28px,5vw,60px)', justifyContent:'center', paddingBottom:'clamp(16px,2.4vh,24px)' }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ width:13, height:13, borderRadius:'50%', background: i===2 ? '#F2B705' : '#08090B', opacity: i===2 ? 0.9 : 0.16 }}/>
        ))}
      </div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', paddingBottom:12, borderBottom:'1px solid rgba(8,9,11,0.9)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase' }}>
        <span style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ display:'inline-block', width:12, height:12, border:'1px solid #08090B', borderLeft:'3px solid #F2B705' }}/>
          Service declaration · Declaración de servicio
        </span>
        <span style={{ color:'#5C5A55' }}>Form 03 · Duplicate copy</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:'clamp(24px,3.5vw,54px)', padding:'clamp(24px,3.6vh,40px) 0 clamp(22px,3.2vh,34px)' }}>
        <div>
          <h2 className="lc-display" style={{ margin:0, fontSize:'clamp(32px,4vw,52px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:0.98, color:'#08090B' }}>
            English &amp; Español<span style={{ color:'#F2B705' }}>.</span>
          </h2>
          <div style={{ marginTop:8, fontSize:'clamp(18px,2vw,26px)', fontWeight:400, letterSpacing:'-0.03em', lineHeight:1.12, color:'#6D6A64' }}>A dedicated rep for every partner.</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end', gap:16 }}>
          <p style={{ margin:0, maxWidth:'46ch', fontSize:14.5, lineHeight:1.68, color:'#3F3D39' }}>
            Whether you communicate in English or Spanish, you get a dedicated rep — the right products, the right quantities, the right price. Two copies of the same commitment.
          </p>
          <div style={{ display:'flex', alignSelf:'flex-start', border:'1px solid #08090B' }}>
            {LANG_TABS_DATA.map((t,i) => (
              <button key={t.key} onClick={()=>setLang(t.key)} className="lc-mono"
                style={{ border:'none', borderLeft: i===0 ? 'none' : '1px solid #08090B', cursor:'pointer', padding:'9px 18px',
                  fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase',
                  background: lang===t.key ? '#08090B' : 'transparent', color: lang===t.key ? '#F2EFE6' : '#08090B' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display:'grid', paddingRight:'clamp(10px,1.6vw,20px)', paddingBottom:'clamp(14px,2.2vw,28px)' }}>
        {LANG_SHEETS.map(s => {
          const on = lang === s.key
          const rule = on ? 'rgba(8,9,11,0.16)' : 'rgba(8,9,11,0.14)'
          return (
            <div key={s.key} tabIndex={0} role="button" aria-pressed={on} onClick={()=>setLang(s.key)}
              onKeyDown={e=>{ if (e.key==='Enter'||e.key===' ') { e.preventDefault(); setLang(s.key) } }}
              style={{ gridArea:'1 / 1', alignSelf:'start', boxSizing:'border-box', position:'relative',
                padding:'clamp(16px,2.4vh,22px) clamp(16px,2vw,24px) clamp(18px,2.6vh,24px)',
                border:'1px solid #08090B', borderTop:`4px solid ${on ? '#F2B705' : 'transparent'}`,
                cursor:'pointer', background: on ? '#FFFDF7' : '#DED9CC',
                boxShadow: on ? '12px 14px 0 rgba(8,9,11,0.16)' : 'none',
                transform: on ? 'translate(0,0)' : 'translate(clamp(10px,1.6vw,20px), clamp(14px,2.2vw,28px))',
                zIndex: on ? 2 : 1, transition:'transform 0.35s cubic-bezier(0.22,0.61,0.36,1), box-shadow 0.35s ease, background 0.35s ease' }}>
              <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, paddingBottom:11, borderBottom:`1px solid ${rule}` }}>
                <span style={{ fontWeight:700, letterSpacing:'0.22em', fontSize:9.5, textTransform:'uppercase', color: on ? '#08090B' : '#3A3833' }}>{s.lang}</span>
                <span style={{ fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>{s.copy}</span>
              </div>

              <div style={{ position:'absolute', right:'clamp(14px,3vw,42px)', bottom:'clamp(52px,8vh,86px)', pointerEvents:'none',
                transform:'rotate(-11deg)', border:`2px solid ${on ? '#F2B705' : '#8A6A5C'}`, padding:'7px 13px 8px', opacity: on ? 0.85 : 0.4 }}>
                <div className="lc-mono" style={{ fontWeight:700, fontSize:11, letterSpacing:'0.26em', textTransform:'uppercase', color: on ? '#F2B705' : '#8A6A5C' }}>{s.stamp}</div>
                <div className="lc-mono" style={{ marginTop:3, fontSize:8, letterSpacing:'0.22em', textTransform:'uppercase', textAlign:'center', color: on ? '#F2B705' : '#8A6A5C' }}>Levam Corp · Doral FL</div>
              </div>

              {s.rows.map(([k,v],i) => (
                <div key={k} style={{ display:'grid', gridTemplateColumns:'26px clamp(104px,13vw,158px) 1fr', gap:'4px 14px', alignItems:'baseline', padding:'clamp(11px,1.7vh,15px) 0', borderBottom:`1px solid ${rule}` }}>
                  <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.14em', color: on ? '#6F6C66' : '#5F5C56' }}>0{i+1}</div>
                  <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', borderRight:`1px solid ${rule}`, paddingRight:14, color:'#5C5A55' }}>{k}</div>
                  <div style={{ fontSize:14.5, lineHeight:1.55, color: on ? '#22211F' : '#4A4741' }}>{v}</div>
                </div>
              ))}

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'12px clamp(18px,3vw,40px)', paddingTop:'clamp(16px,2.4vh,22px)' }}>
                <div>
                  <div style={{ height:1, background: on ? '#08090B' : '#3A3833', opacity:0.55 }}/>
                  <div className="lc-mono" style={{ paddingTop:7, fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>{s.signature}</div>
                </div>
                <div>
                  <div style={{ height:1, background: on ? '#08090B' : '#3A3833', opacity:0.55 }}/>
                  <div className="lc-mono" style={{ paddingTop:7, fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>{s.hours}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', marginTop:'clamp(26px,4vh,42px)', paddingTop:12, borderTop:'1px solid rgba(8,9,11,0.9)' }}>
        <span style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'#5C5A55' }}>
          Direct line · WhatsApp
          <a href="https://wa.me/17864909005" style={{ fontSize:13, letterSpacing:'0.06em', color:'#08090B', borderBottom:'1px solid rgba(8,9,11,0.4)', paddingBottom:2, textDecoration:'none' }}>(786) 490-9005</a>
        </span>
        <span style={{ display:'flex', alignItems:'flex-end', gap:2, height:20, width:'clamp(120px,20vw,220px)' }}>
          {LANG_STAMP_BARS.map((b,i) => <div key={i} style={{ flex:`${b.w} 1 0`, minWidth:1, height: b.tall ? 16 : 12, background:'#08090B', opacity:0.8 }}/>)}
        </span>
      </div>
    </div>
  )
}

const BULLETIN_BARS = seededBars(20260828, 96)

// ── BULLETIN GRID — "Stay ahead of the market" insights teaser, ticket style ──
function BulletinGrid() {
  const [hovered, setHovered] = useState(-1)
  const cut = hovered >= 0 ? Math.round(((hovered + 1) / insightItems.length) * BULLETIN_BARS.length) : 0
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, flexWrap:'wrap', paddingBottom:12 }}>
        <div>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73', marginBottom:14 }}>
            <span style={{ width:6, height:6, background:'#F2B705', display:'inline-block' }}/>
            Market bulletin · Issue 08 · 2026
          </div>
          <h2 className="lc-display" style={{ margin:0, fontSize:'clamp(30px,4vw,50px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1, color:'#F5F2E9' }}>
            Stay ahead of the market<span style={{ color:'#F2B705' }}>.</span>
          </h2>
        </div>
        <Link href="/insights" className="lc-mono" style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'11px 18px', border:'1px solid rgba(245,241,232,0.3)', fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#F5F1E8', textDecoration:'none' }}>
          View all insights <span style={{ fontSize:12 }}>→</span>
        </Link>
      </div>
      <div style={{ height:1, background:'rgba(245,241,232,0.3)' }}/>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))', gap:1, background:'rgba(245,241,232,0.16)' }}>
        {insightItems.map((ins,i) => {
          const on = hovered === i
          return (
            <Link key={ins.title} href="/insights"
              onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(-1)} onFocus={()=>setHovered(i)} onBlur={()=>setHovered(-1)}
              style={{ position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', minHeight:'clamp(220px,30vh,280px)',
                padding:'clamp(20px,3vh,28px) clamp(16px,2vw,22px) clamp(18px,2.6vh,24px)', background: on ? '#F2EFE6' : '#14120E', color: on ? '#08090B' : '#E4E0D6', textDecoration:'none' }}>
              <div style={{ position:'absolute', right:-6, bottom:-26, pointerEvents:'none', fontSize:100, fontWeight:400, letterSpacing:'-0.06em', lineHeight:1, color: on ? '#08090B' : '#F2B705', opacity: on ? 0.07 : 0.14 }}>0{i+1}</div>
              <div style={{ position:'absolute', left:0, right:0, top:0, height:3, background: on ? '#08090B' : '#F2B705' }}/>
              <div className="lc-mono" style={{ position:'relative', display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12 }}>
                <span style={{ fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color: on ? '#5C5A55' : '#8F8C85' }}>No. 0{i+1}</span>
                <span style={{ fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color: on ? '#5C5A55' : '#8F8C85' }}>{ins.date}</span>
              </div>
              <div style={{ position:'relative', marginTop:'clamp(16px,2.4vh,22px)', fontSize:'clamp(18px,2vw,24px)', fontWeight:400, letterSpacing:'-0.02em', lineHeight:1.14, color: on ? '#08090B' : '#E4E0D6' }}>{ins.title}</div>
              <div style={{ flex:1 }}/>
              <div className="lc-mono" style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginTop:'clamp(18px,2.6vh,26px)', paddingTop:12,
                borderTop:`1px solid ${on ? 'rgba(8,9,11,0.2)' : 'rgba(245,241,232,0.12)'}` }}>
                <span style={{ fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color: on ? '#08090B' : '#F2B705' }}>{ins.tag}</span>
                <span style={{ display:'flex', alignItems:'center', gap: on ? 14 : 8, fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase' }}>Read <span style={{ fontSize:11 }}>→</span></span>
              </div>
            </Link>
          )
        })}
      </div>
      <div style={{ height:1, background:'rgba(245,241,232,0.16)' }}/>
      <div style={{ position:'relative', display:'flex', alignItems:'flex-end', gap:2, height:32, padding:'8px 0', overflow:'hidden' }}>
        {BULLETIN_BARS.map((b,i) => <div key={i} style={{ flex:`${b.w} 1 0`, minWidth:1, height: b.tall ? 20 : 15, background: i < cut ? '#F2B705' : '#F5F1E8', opacity: i < cut ? 0.95 : 0.14 }}/>)}
      </div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, paddingTop:6, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
        <span>{hovered >= 0 ? `Bulletin 0${hovered + 1} · ${insightItems[hovered].tag.toUpperCase()}` : 'Bulletin · 03 entries'}</span>
        <span>Levamcorp · Doral · FL</span>
      </div>
    </div>
  )
}

const REDACTED_WIDTHS = [18, 10, 24, 13]
const CATALOG_STAMP_BARS = seededBars(51199, 60)

// One "contact sheet" frame — cursor-tracked 3D tilt + sheen, real product data
function CatalogCell({ product, index }) {
  const ref = useRef(null)
  const [hover, setHover] = useState(false)
  const [tf, setTf] = useState({ ry: 0, rx: 0, sx: 50, sy: 50 })
  const on = hover
  const code = (product.id || '').toString().replace(/-/g, '').slice(-6).toUpperCase()

  const onMove = e => {
    const r = ref.current.getBoundingClientRect()
    const mx = (e.clientX - r.left) / r.width - 0.5
    const my = (e.clientY - r.top) / r.height - 0.5
    setTf({ ry: (mx * 13).toFixed(2), rx: (-my * 10).toFixed(2), sx: (50 + mx * 120).toFixed(0), sy: (50 + my * 120).toFixed(0) })
  }

  return (
    <Link href="/apply" ref={ref}
      onMouseEnter={() => setHover(true)} onMouseMove={onMove} onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)} onBlur={() => setHover(false)}
      style={{ display:'block', padding:'clamp(10px,1.4vw,14px)', textDecoration:'none',
        background: on ? '#08090B' : '#F2EFE6', color: on ? '#F2EFE6' : '#08090B',
        transformStyle:'preserve-3d',
        transform: on ? `translateZ(46px) rotateX(${tf.rx}deg) rotateY(${tf.ry}deg)` : 'translateZ(0) rotateX(0deg) rotateY(0deg)',
        boxShadow: on ? '0 34px 60px -24px rgba(0,0,0,0.85), 0 8px 18px -10px rgba(0,0,0,0.6)' : 'none',
        zIndex: on ? 3 : 1, position:'relative', transition: on ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease' }}>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, paddingBottom:9, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color: on ? '#8F8C85' : '#5C5A55' }}>
        <span>0{index + 1}</span>
        <span style={{ color: on ? '#F2B705' : '#08090B' }}>{product.brand || '—'}</span>
      </div>
      <div style={{ position:'relative', width:'100%', aspectRatio:'1/1', background:'#101114', overflow:'hidden',
        transformStyle:'preserve-3d', transform: on ? 'translateZ(34px) scale(1.05)' : 'translateZ(0) scale(1)', transition: on ? 'none' : 'transform 0.3s ease' }}>
        {product.image_url
          ? <img src={product.image_url} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'contain', padding:10 }}/>
          : <div className="lc-mono" style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#F2EFE6', opacity:0.15, fontSize:11, textAlign:'center', padding:8 }}>Drop {product.brand || 'product'} photo</div>
        }
        {on && <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:`radial-gradient(120% 90% at ${tf.sx}% ${tf.sy}%, rgba(242,239,230,0.22), rgba(242,239,230,0) 62%)` }}/>}
        <div style={{ position:'absolute', left:7, top:7, width:11, height:11, borderTop:'1px solid rgba(242,239,230,0.5)', borderLeft:'1px solid rgba(242,239,230,0.5)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', right:7, bottom:7, width:11, height:11, borderBottom:'1px solid rgba(242,239,230,0.5)', borderRight:'1px solid rgba(242,239,230,0.5)', pointerEvents:'none' }}/>
      </div>
      <div style={{ paddingTop:10, fontSize:13.5, lineHeight:1.42, letterSpacing:'-0.005em', minHeight:'3.1em', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{product.name}</div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginTop:9, paddingTop:9, borderTop:`1px solid ${on ? 'rgba(242,239,230,0.18)' : 'rgba(8,9,11,0.16)'}`, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color: on ? '#8F8C85' : '#5C5A55' }}>
        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
          {REDACTED_WIDTHS.map((w,i) => <span key={i} style={{ display:'inline-block', width:w, height:11, background:'#F2B705', opacity:0.6 }}/>)}
        </span>
        <span>MOQ {product.moq || 1}</span>
      </div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginTop:9, padding:'10px 11px', border:`1px solid ${on ? '#F2B705' : 'rgba(8,9,11,0.4)'}`, background: on ? '#F2B705' : 'transparent', color:'#08090B', fontWeight:700, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase' }}>
        <span>Apply to see pricing</span>
        <span style={{ fontSize:11, fontWeight:400 }}>→</span>
      </div>
    </Link>
  )
}

// ── CATALOG SHEET — gated product preview, styled as a photo contact sheet ────
function CatalogSheet() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    fetch('/api/public-products').then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {})
  }, [])
  if (!products.length) return null

  return (
    <div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap', paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
        <span style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width:6, height:6, background:'#F2B705', display:'inline-block' }}/>
          Contact sheet · Sheet 04 · {products.length} of 500+
        </span>
        <span>Pricing restricted · Partners only</span>
      </div>
      <div style={{ height:1, background:'rgba(245,241,232,0.3)' }}/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:'clamp(20px,3vw,48px)', padding:'clamp(28px,4.4vh,46px) 0 clamp(24px,3.6vh,38px)' }}>
        <h2 className="lc-display" style={{ margin:0, fontSize:'clamp(30px,4vw,50px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1, color:'#F5F2E9' }}>
          Premium brands at wholesale prices<span style={{ color:'#F2B705' }}>.</span>
        </h2>
        <p style={{ margin:0, alignSelf:'end', maxWidth:'46ch', fontSize:14.5, lineHeight:1.68, color:'#9A968E' }}>
          Approved partners get full pricing, live stock levels and ordering. Every unit ships from our Doral, FL warehouse — apply to unlock the full catalog.
        </p>
      </div>

      <div style={{ background:'#F2EFE6', padding:'clamp(14px,2vw,22px)' }}>
        <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'0 2px clamp(12px,1.8vh,16px)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
          <span style={{ display:'flex', alignItems:'center', gap:9 }}>
            <span style={{ display:'inline-block', width:11, height:11, border:'1px solid #08090B', borderLeft:'3px solid #F2B705' }}/>
            Levamcorp · Catálogo
          </span>
          <span>Doral · FL 33178</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:1, background:'rgba(8,9,11,0.9)', perspective:1100, perspectiveOrigin:'50% 40%' }}>
          {products.map((p,i) => <CatalogCell key={p.id} product={p} index={i}/>)}
        </div>

        <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', padding:'clamp(12px,1.8vh,16px) 2px 0', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
          <span>Frames 01–0{products.length} · pricing restricted</span>
          <span style={{ display:'flex', alignItems:'flex-end', gap:2, height:18, width:'clamp(110px,18vw,200px)' }}>
            {CATALOG_STAMP_BARS.map((b,i) => <div key={i} style={{ flex:`${b.w} 1 0`, minWidth:1, height: b.tall ? 15 : 11, background:'#08090B', opacity:0.75 }}/>)}
          </span>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap', marginTop:'clamp(24px,3.6vh,40px)' }}>
        <div className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#7C7A73', lineHeight:1.9 }}>500+ products available<br/>Approved partners only · Response in 48h</div>
        <Link href="/apply" className="lc-mono" style={{ display:'inline-flex', alignItems:'center', gap:14, padding:'16px 22px', background:'#F2B705', color:'#08090B', fontWeight:700, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none' }}>
          Apply for wholesale access <span style={{ fontSize:13 }}>→</span>
        </Link>
      </div>
    </div>
  )
}

const FOUNDERS_PEOPLE = [
  { name:'Victor Mendoza', role:'Co-founder & Partner', index:'01 / 02', initials:'VM',
    fields:[['Focus','Sales & Sourcing'],['Based','Doral, FL'],['Languages','EN · ES']],
    bio:'Victor brings hands-on experience in B2B sales and product sourcing. His focus is on building direct relationships with brand suppliers and making sure every partner gets consistent access to the right products at the right price.',
    quote:'“We started Levam Corp because we saw how hard it was for serious resellers to find a distributor they could actually trust. We wanted to be that company.”',
    signature:'V. Mendoza' },
  { name:'Leopoldo Espinoza', role:'Co-founder & Partner', index:'02 / 02', initials:'LE',
    fields:[['Focus','Operations & Logistics'],['Based','Doral, FL'],['Languages','EN · ES']],
    bio:'Leopoldo oversees operations and logistics, making sure orders move fast and partners are always taken care of. With a background in business operations and client management, he keeps the Levam Corp machine running smoothly every day.',
    quote:'“Our partners are not just customers. They are businesses we’re invested in helping grow. When they win, we win.”',
    signature:'L. Espinoza' },
]

// ── FOUNDERS RECORD — "Signatories" ledger, ticket style ──────────────────────
function FoundersRecord() {
  return (
    <div>
      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap', paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
        <span style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width:6, height:6, background:'#F2B705', display:'inline-block' }}/>
          Signatories · Form 05
        </span>
        <span>02 partners on record</span>
      </div>
      <div style={{ height:1, background:'rgba(245,241,232,0.3)' }}/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:'clamp(20px,3vw,48px)', padding:'clamp(28px,4.4vh,46px) 0 clamp(26px,4vh,42px)' }}>
        <h2 className="lc-display" style={{ margin:0, fontSize:'clamp(30px,4vw,50px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1, color:'#F5F2E9' }}>
          Built by people who know the business<span style={{ color:'#F2B705' }}>.</span>
        </h2>
        <p style={{ margin:0, alignSelf:'end', maxWidth:'44ch', fontSize:14.5, lineHeight:1.68, color:'#9A968E' }}>
          Levam Corp was founded by two entrepreneurs who understand what resellers and distributors actually need — reliable supply, real pricing, and a partner who picks up the phone.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(330px,1fr))', gap:1, background:'rgba(245,241,232,0.16)', borderTop:'1px solid rgba(245,241,232,0.16)' }}>
        {FOUNDERS_PEOPLE.map(p => (
          <div key={p.name} style={{ background:'#14120E', padding:'clamp(20px,3vh,28px) clamp(18px,2.4vw,26px) clamp(20px,3vh,26px)' }}>
            <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, paddingBottom:'clamp(16px,2.4vh,22px)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73' }}>
              <span style={{ color:'#F2B705' }}>{p.role}</span>
              <span>{p.index}</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'clamp(104px,13vw,132px) 1fr', gap:'clamp(16px,2.2vw,24px)', alignItems:'start' }}>
              <div style={{ position:'relative', aspectRatio:'3/4', background:'#F2EFE6', color:'#08090B', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span className="lc-display" style={{ fontSize:30, fontWeight:700, letterSpacing:'-0.02em', opacity:0.85 }}>{p.initials}</span>
                <div style={{ position:'absolute', left:7, top:7, width:11, height:11, borderTop:'1px solid rgba(8,9,11,0.45)', borderLeft:'1px solid rgba(8,9,11,0.45)' }}/>
                <div style={{ position:'absolute', right:7, bottom:7, width:11, height:11, borderBottom:'1px solid rgba(8,9,11,0.45)', borderRight:'1px solid rgba(8,9,11,0.45)' }}/>
              </div>

              <div>
                <div style={{ fontSize:'clamp(24px,2.6vw,32px)', fontWeight:400, letterSpacing:'-0.035em', lineHeight:1.06, color:'#F5F2E9' }}>{p.name}</div>
                <div style={{ marginTop:'clamp(12px,1.8vh,16px)', borderTop:'1px solid rgba(245,241,232,0.12)' }}>
                  {p.fields.map(([k,v]) => (
                    <div key={k} style={{ display:'grid', gridTemplateColumns:'clamp(74px,8vw,96px) 1fr', gap:10, alignItems:'baseline', padding:'9px 0 10px', borderBottom:'1px solid rgba(245,241,232,0.09)' }}>
                      <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73' }}>{k}</span>
                      <span className="lc-mono" style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'#DDD8CD' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p style={{ margin:'clamp(18px,2.6vh,24px) 0 0', fontSize:15, lineHeight:1.68, color:'#9A968E' }}>{p.bio}</p>

            <div style={{ marginTop:'clamp(18px,2.6vh,24px)', padding:'clamp(14px,2vh,18px) 0 0', borderTop:'1px solid rgba(245,241,232,0.16)' }}>
              <div style={{ fontSize:'clamp(16px,1.7vw,19px)', lineHeight:1.5, letterSpacing:'-0.015em', color:'#F2EFE6' }}>{p.quote}</div>
              <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ flexShrink:0, width:'clamp(52px,7vw,78px)', height:1, background:'#F2B705' }}/>
                <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73' }}>{p.signature}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px 28px', flexWrap:'wrap', padding:'clamp(16px,2.4vh,22px) 0 0', borderTop:'1px solid rgba(245,241,232,0.3)', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'#86837C' }}>
        <span>Doral, FL · English &amp; Español · Mon–Fri 9AM–5PM ET</span>
        <span style={{ display:'flex', alignItems:'center', gap:22, flexWrap:'wrap' }}>
          <a href="mailto:partners@levamcorp.com" style={{ fontSize:12, letterSpacing:'0.06em', textTransform:'none', color:'#F2EFE6', borderBottom:'1px solid rgba(245,241,232,0.3)', paddingBottom:2, textDecoration:'none' }}>partners@levamcorp.com</a>
          <a href="https://wa.me/17864909005" style={{ fontSize:12, letterSpacing:'0.06em', color:'#F2EFE6', borderBottom:'1px solid #F2B705', paddingBottom:2, textDecoration:'none' }}>(786) 490-9005</a>
        </span>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════════════════════
// ── HOME PAGE ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

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

// ── MANIFEST BACKDROP — ambient 3D grid tunnel + drifting cargo tags, sitewide fixed background ──
function fieldBars(seedInit, count) {
  let seed = seedInit
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
  const out = []
  for (let i = 0; i < count; i++) {
    const r = rnd()
    out.push({ grow: r > 0.8 ? 3 : r > 0.5 ? 2 : 1, h: r > 0.9 ? 11 : 8 })
  }
  return out
}

const BACKDROP_TAG_DEFS = [
  { code:'SKU · 7DF6', label:'Wholesale price',  left:'7%',  top:'16%', w:160, z:-260, ry:26,  rz:-7, dur:19, amp:22 },
  { code:'ETA · B705', label:'48h dispatch',     left:'74%', top:'10%', w:150, z:-190, ry:-24, rz:6,  dur:23, amp:26 },
  { code:'ORG · C41D', label:'Doral · FL 33178', left:'18%', top:'64%', w:168, z:-110, ry:16,  rz:5,  dur:26, amp:18 },
  { code:'BRD · 7280', label:'Verified partner', left:'80%', top:'58%', w:146, z:-300, ry:-30, rz:-9, dur:21, amp:30 },
  { code:'MOQ · 8A54', label:'50 units min.',    left:'45%', top:'82%', w:140, z:-360, ry:12,  rz:-4, dur:29, amp:24 },
  { code:'REF · 2F19', label:'Live catalog',     left:'56%', top:'6%',  w:138, z:-420, ry:-18, rz:8,  dur:25, amp:20 },
  { code:'LOT · 4471', label:'Manifest closed',  left:'34%', top:'38%', w:152, z:-520, ry:22,  rz:-6, dur:31, amp:16 },
]
const BACKDROP_TAG_BARS = BACKDROP_TAG_DEFS.map((_, i) => fieldBars(3000 + i * 97, 22))

function ManifestBackdrop() {
  const floorRef = useRef(null)
  const ceilRef = useRef(null)
  const fieldRef = useRef(null)
  const tagRefs = useRef([])

  useEffect(() => {
    const mouse = { x: 0, y: 0 }
    let mx = 0, my = 0
    const onMove = e => {
      mouse.x = e.clientX / (window.innerWidth || 1) - 0.5
      mouse.y = e.clientY / (window.innerHeight || 1) - 0.5
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const start = performance.now()
    const depth = 34
    let raf

    const loop = () => {
      const t = (performance.now() - start) / 1000
      mx += (mouse.x - mx) * 0.06
      my += (mouse.y - my) * 0.06

      if (floorRef.current) floorRef.current.style.transform = `rotateX(72deg) translateY(${((t*14)%120).toFixed(1)}px) translateZ(-190px)`
      if (ceilRef.current) ceilRef.current.style.transform = `rotateX(-72deg) translateY(${(120-((t*9)%120)).toFixed(1)}px) translateZ(-190px)`
      if (fieldRef.current) fieldRef.current.style.transform = `translate3d(${(-mx*depth).toFixed(1)}px,${(-my*depth*0.6).toFixed(1)}px,0)`

      BACKDROP_TAG_DEFS.forEach((d, i) => {
        const el = tagRefs.current[i]
        if (!el) return
        const ph = (t / d.dur) * Math.PI * 2 + i
        const bob = Math.sin(ph) * d.amp
        const sway = Math.cos(ph * 0.7) * (d.amp * 0.5)
        const wob = Math.sin(ph * 0.9) * 5
        el.style.transform = `translate3d(${sway.toFixed(1)}px,${bob.toFixed(1)}px,${d.z}px) rotateY(${(d.ry+wob).toFixed(1)}deg) rotateZ(${d.rz}deg) rotateX(${(wob*0.5).toFixed(1)}deg)`
      })

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div style={{ position:'fixed', inset:0, zIndex:-2, overflow:'hidden', pointerEvents:'none', perspective:900, perspectiveOrigin:'50% 46%' }}>
      <div ref={floorRef} style={{ position:'absolute', inset:'-20%', transformStyle:'preserve-3d' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(to right, rgba(245,241,232,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,241,232,0.13) 1px, transparent 1px)', backgroundSize:'120px 120px' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at center, #F2B705 1.4px, transparent 2px)', backgroundSize:'480px 480px', backgroundPosition:'240px 240px', opacity:0.55 }}/>
      </div>

      <div ref={ceilRef} style={{ position:'absolute', inset:'-20%', transformStyle:'preserve-3d' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(to right, rgba(245,241,232,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,241,232,0.07) 1px, transparent 1px)', backgroundSize:'120px 120px' }}/>
      </div>

      <div ref={fieldRef} style={{ position:'absolute', inset:0, transformStyle:'preserve-3d' }}>
        {BACKDROP_TAG_DEFS.map((d, i) => {
          const far = Math.min(1, -d.z / 520)
          const opacity = ((0.9 - far * 0.55) * 0.4).toFixed(2)
          const blur = far > 0.55 ? `blur(${(far*1.6).toFixed(1)}px)` : 'none'
          return (
            <div key={d.code} ref={el => tagRefs.current[i] = el}
              style={{ position:'absolute', left:d.left, top:d.top, width:d.w, transformStyle:'preserve-3d', opacity, filter:blur, willChange:'transform' }}>
              <div style={{ border:'1px solid rgba(8,9,11,0.85)', background:'rgba(245,241,232,0.94)', padding:'9px 11px 10px' }}>
                <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, paddingBottom:7, borderBottom:'1px solid rgba(8,9,11,0.2)', fontSize:7.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ display:'inline-block', width:7, height:7, border:'1px solid #5C5A55', borderLeft:'2px solid #F2B705' }}/>
                    {d.code}
                  </span>
                  <span>0{i+1}</span>
                </div>
                <div className="lc-mono" style={{ paddingTop:8, fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'#08090B' }}>{d.label}</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:1.5, height:11, marginTop:9 }}>
                  {BACKDROP_TAG_BARS[i].map((b,j) => <div key={j} style={{ flex:`${b.grow} 1 0`, minWidth:1, height:b.h, background:'#08090B', opacity:0.55 }}/>)}
                </div>
              </div>
              <div style={{ height:1, background:'rgba(8,9,11,0.85)', margin:'0 14%', opacity:0.5 }}/>
            </div>
          )
        })}
      </div>

      <div style={{ position:'absolute', inset:0, background:'radial-gradient(120% 70% at 50% 46%, rgba(242,183,5,0.055), transparent 55%)' }}/>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(105% 78% at 50% 48%, rgba(20,18,14,0) 22%, rgba(20,18,14,0.86) 100%)' }}/>
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
  const [loaded, setLoaded] = useState(false)
  const heroSectionRef = useRef(null)

  useEffect(() => { setLoaded(true) }, [])

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

        .category-label { transition: border-color 0.25s ease; }
        .category-label:hover { border-color: var(--label-accent) !important; }

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
        @keyframes heroLine  { from{transform:translateY(105%) rotate(1.4deg)} to{transform:translateY(0) rotate(0)} }
        @keyframes heroWipe  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes scrollCue { 0%{transform:translateY(0);opacity:0} 30%{opacity:1} 100%{transform:translateY(14px);opacity:0} }
        @keyframes manifestScan { 0%{transform:translateX(-40%);opacity:0} 18%{opacity:1} 82%{opacity:1} 100%{transform:translateX(140%);opacity:0} }
        @keyframes sealSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes blip { 0%,100%{opacity:0.25} 50%{opacity:1} }
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

        /* Hero brand marquee logo hover */
        .brand-logo-item { transition:opacity 0.3s ease, transform 0.35s cubic-bezier(0.2,0.8,0.2,1); }
        .brand-logo-item:hover { opacity:1 !important; transform:scale(1.08); }

        /* Responsive */
        .lc-ham  { display:none !important; }
        .lc-links { display:flex; }

        @media(max-width:900px) {
          .hero-scroll-cue { display:none !important; }
        }

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
      <ManifestBackdrop/>

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
      <section ref={heroSectionRef} style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', padding:'8rem 2rem 11rem', position:'relative', overflow:'hidden', background:'#14120E' }}>

        {/* Real footage of the shipment's own journey — label to delivered, on a loop */}
        <HeroVideoBackground/>

        {/* Content — copy left, scroll cue right, both tilt gently toward the cursor */}
        <div style={{ maxWidth:1200, margin:'0 auto', width:'100%', position:'relative', zIndex:5,
          display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:40 }}>

          <HeroTiltGroup sectionRef={heroSectionRef}>
            <div style={{ maxWidth:640 }}>
              {/* Badge — shipping label, with a live Doral-time clock */}
              <div className="lc-mono" style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'6px 14px',
                border:'1.5px dashed rgba(242,183,5,0.5)', borderRadius:4, background:'rgba(20,18,14,0.45)', backdropFilter:'blur(6px)',
                marginBottom:'1.75rem', animation:'fadeUp 0.6s 0.1s ease both' }}>
                <span style={{ fontSize:9, fontWeight:800, letterSpacing:'0.22em', color:'#F2B705', textTransform:'uppercase' }}>
                  B2B WHOLESALE · DORAL FL · <LiveClock/> ET
                </span>
                <span style={{ fontSize:9, fontWeight:700, padding:'4px 10px', background:'#F2B705', color:'#14120E', borderRadius:2, letterSpacing:'0.1em' }}>PARTNERS ONLY</span>
              </div>

              {/* Headline — masked line-reveal, heavy weight for contrast against the footage */}
              <h1 className="hero-h lc-display" style={{ fontSize:'clamp(38px,5.4vw,74px)', fontWeight:800, lineHeight:0.98, letterSpacing:'-0.035em', margin:0,
                textShadow:'0 2px 24px rgba(0,0,0,0.5)' }}>
                <span style={{ display:'block', overflow:'hidden', paddingBottom:'0.02em' }}>
                  <span style={{ display:'block', animation:'heroLine 0.9s cubic-bezier(0.16,0.9,0.2,1) 0.18s both' }}>Premium brands.</span>
                </span>
                <span style={{ display:'block', overflow:'hidden', paddingBottom:'0.02em' }}>
                  <span style={{ display:'block', fontWeight:900, animation:'heroLine 0.9s cubic-bezier(0.16,0.9,0.2,1) 0.3s both' }}>Wholesale pricing.</span>
                </span>
                <span style={{ display:'block', overflow:'hidden', paddingBottom:'0.06em' }}>
                  <span style={{ display:'block', fontWeight:400, fontStyle:'italic', color:'#A7A090', animation:'heroLine 0.9s cubic-bezier(0.16,0.9,0.2,1) 0.42s both' }}>Built for resellers.</span>
                </span>
              </h1>

              <div style={{ width:86, height:2, margin:'22px 0 22px', background:'#F2B705', transformOrigin:'left', animation:'heroWipe 0.8s cubic-bezier(0.2,0.8,0.2,1) 0.68s both' }}/>

              <p style={{ fontSize:16, color:'#A7A090', lineHeight:1.85, maxWidth:480, marginBottom:'1.5rem', animation:'fadeUp 0.7s 0.78s ease both' }}>
                Levam Corp connects approved U.S. distributors and resellers to top consumer electronics and appliance brands — at competitive wholesale prices, from our Doral, FL warehouse.
              </p>

              <div className="lc-mono" style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:'2.25rem', fontSize:10, letterSpacing:'0.18em', color:'rgba(255,255,255,0.55)', animation:'fadeUp 1s 0.86s ease both' }}>
                {['APPLIANCES','AUDIO','TV & DISPLAY','GAMING'].map((t, i, arr) => (
                  <React.Fragment key={t}>
                    <span>{t}</span>
                    {i < arr.length - 1 && <span style={{ color:'rgba(255,255,255,0.24)' }}>/</span>}
                  </React.Fragment>
                ))}
              </div>

              <div className="hero-btns" style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'fadeUp 0.7s 0.92s ease both', marginBottom:'2.75rem' }}>
                <Link href="/apply" className="lc-btn">Apply for wholesale access {IC.arrow}</Link>
                <Link href="/portal" className="lc-ghost">Partner portal login</Link>
              </div>

              <div style={{ animation:'fadeUp 1.1s 1.1s ease both' }}>
                <HeroStats/>
              </div>
            </div>
          </HeroTiltGroup>

          <div className="hero-scroll-cue lc-mono" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, flexShrink:0, paddingBottom:6,
            fontSize:9, letterSpacing:'0.24em', color:'rgba(255,255,255,0.4)', animation:'fadeUp 1.2s 1.4s ease both' }}>
            SCROLL
            <span style={{ width:1, height:26, background:'linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0))', animation:'scrollCue 2.2s ease-in-out infinite' }}/>
          </div>
        </div>

        {/* Authorized-brand logo marquee, pinned to the foot of the video */}
        <BrandMarquee/>
      </section>

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
          <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {CATEGORY_LABELS.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.06}>
                <TiltCard glow={item.swatch} style={{ height:'100%', borderRadius:4 }}>
                  <CategoryLabel item={item}/>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── STATS + PROCESS — one continuous manifest/procedure ticket ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="stats" style={{ padding:'6rem 2rem', position:'relative', zIndex:5 }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <Reveal>
            <ManifestMetrics/>
          </Reveal>

          <ManifestConnector/>

          <div id="process" className="g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4.5rem', alignItems:'start' }}>
            <Reveal>
              <div style={{ position:'sticky', top:100, paddingTop:8 }}>
                <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.22em', textTransform:'uppercase', color:'#7C7A73', marginBottom:20 }}>PROCEDURE — 04 STEPS</div>
                <h2 className="lc-display" style={{ margin:0, fontSize:'clamp(26px,4vw,44px)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1 }}>
                  Simple process.<br/><span style={{ color:'#A7A090' }}>Real results.</span>
                </h2>
                <p style={{ margin:'24px 0 0', maxWidth:360, fontSize:13.5, color:'#A7A090', lineHeight:1.85 }}>
                  We review every application personally. We work with a select group of serious distributors, resellers, and retailers — not a marketplace.
                </p>
                <Link href="/apply" className="lc-btn" style={{ marginTop:32 }}>Start your application {IC.arrow}</Link>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <ProcessStepper/>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── WHY LEVAM ───────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="features" style={{ padding:'7rem 2rem', position:'relative', zIndex:5, background:'transparent', borderTop:'1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <PackingList/>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── ABOUT ───────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" id="about" style={{ padding:'7rem 2rem', position:'relative', zIndex:5, overflow:'hidden' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', position:'relative' }}>
          <Reveal>
            <CompanyRecord/>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── LANGUAGE ────────────────────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="lc-section" style={{ padding:'7rem 2rem', position:'relative', zIndex:5 }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <Reveal>
            <LanguageDeclaration/>
          </Reveal>

          {/* ── MARKET INSIGHTS PREVIEW ─────────────────────────────────── */}
          <div style={{ height:'clamp(70px,11vh,130px)' }}/>
          <Reveal delay={0.1}>
            <BulletinGrid/>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── PRODUCT PREVIEW / CATALOG SHEET ─────────────────────────────── */}
      <section className="lc-section" style={{ padding:'clamp(56px,9vh,110px) 2rem clamp(70px,11vh,130px)', position:'relative', zIndex:5, borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <Reveal>
            <CatalogSheet/>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── FOUNDERS ────────────────────────────────────────────────── */}
      <section className="lc-section" style={{ padding:'clamp(56px,9vh,110px) 2rem clamp(70px,11vh,130px)', position:'relative', zIndex:5, borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1180, margin:'0 auto' }}>
          <Reveal>
            <FoundersRecord/>
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
