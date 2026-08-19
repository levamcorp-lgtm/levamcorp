'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// ── MOBILE MENU ───────────────────────────────────────────────────────────────
function MobileMenu() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(!open)} className="lc-hamburger"
        style={{ flexDirection:'column', gap:5, background:'transparent', border:'none', cursor:'pointer', padding:4 }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:22, height:2, background:'#fff', borderRadius:2, display:'block', transition:'all 0.25s',
            transform: open&&i===0?'rotate(45deg) translateY(7px)':open&&i===2?'rotate(-45deg) translateY(-7px)':'none',
            opacity: open&&i===1?0:1 }}/>
        ))}
      </button>
      {open && (
        <div style={{ position:'fixed', inset:0, background:'#060810', zIndex:200, display:'flex', flexDirection:'column', padding:'5rem 2rem 3rem' }}>
          <button onClick={() => setOpen(false)} style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,0.08)', border:'none', color:'#fff', width:40, height:40, borderRadius:'50%', fontSize:20, cursor:'pointer' }}>×</button>
          {[['#brands','Products'],['#process','How it works'],['#about','About'],['#contact','Contact'],['/insights','Market Insights'],['/apply','Apply now']].map(([href,label]) => (
            <a key={label} href={href} onClick={() => setOpen(false)}
              style={{ fontSize:24, fontWeight:800, color:label==='Apply now'?'#0EA5E9':'#fff', textDecoration:'none', padding:'1rem 0', borderBottom:'0.5px solid rgba(255,255,255,0.07)', letterSpacing:'-0.01em' }}>
              {label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}

// ── SCROLL REVEAL ─────────────────────────────────────────────────────────────
function Reveal({ children, delay=0, y=30 }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ opacity: vis?1:0, transform: vis?'translateY(0)':`translateY(${y}px)`, transition: `opacity 0.7s ${delay}s ease, transform 0.7s ${delay}s ease` }}>
      {children}
    </div>
  )
}

// ── COUNTER ───────────────────────────────────────────────────────────────────
function Counter({ to, suffix='', duration=1800 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = now => {
          const p = Math.min((now - start) / duration, 1)
          setVal(Math.round((1 - Math.pow(1-p,3)) * to))
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

// ── BRAND TICKER ──────────────────────────────────────────────────────────────
function BrandTicker() {
  const brands = ['HISENSE','SAMSUNG','BRENTWOOD','PROCTOR SILEX','HAMILTON BEACH','AVANTI','MAGIC BULLET']
  const doubled = [...brands,...brands,...brands]
  return (
    <div style={{ overflow:'hidden', padding:'1.5rem 0', position:'relative' }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:120, background:'linear-gradient(90deg,#060810,transparent)', zIndex:2, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:120, background:'linear-gradient(-90deg,#060810,transparent)', zIndex:2, pointerEvents:'none' }}/>
      <div style={{ display:'flex', gap:'3.5rem', animation:'ticker 35s linear infinite', width:'max-content' }}>
        {doubled.map((b,i) => (
          <span key={i} style={{ fontSize:11, fontWeight:800, letterSpacing:'0.25em', color:i%3===0?'rgba(255,255,255,0.2)':i%3===1?'rgba(14,165,233,0.4)':'rgba(255,255,255,0.12)', whiteSpace:'nowrap' }}>{b}</span>
        ))}
      </div>
    </div>
  )
}

// ── 3D CARD ───────────────────────────────────────────────────────────────────
function Card3D({ children, style={} }) {
  const ref = useRef(null)
  const handleMove = e => {
    const el = ref.current; if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x*12}deg) rotateX(${-y*12}deg) translateZ(8px)`
    el.style.boxShadow = `${-x*16}px ${y*16}px 40px rgba(14,165,233,0.12)`
  }
  const handleLeave = () => {
    const el = ref.current; if (!el) return
    el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)'
    el.style.boxShadow = 'none'
  }
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition:'transform 0.15s ease, box-shadow 0.15s ease', transformStyle:'preserve-3d', willChange:'transform', ...style }}>
      {children}
    </div>
  )
}

// ── FLOATING PARTICLES ────────────────────────────────────────────────────────
function Particles() {
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
      {Array.from({length:20}).map((_,i) => (
        <div key={i} style={{
          position:'absolute',
          width: Math.random()*3+1,
          height: Math.random()*3+1,
          borderRadius:'50%',
          background: i%3===0?'rgba(14,165,233,0.6)':i%3===1?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.15)',
          left: `${Math.random()*100}%`,
          top: `${Math.random()*100}%`,
          animation: `float${i%4} ${6+Math.random()*8}s ease-in-out infinite`,
          animationDelay: `${Math.random()*5}s`,
        }}/>
      ))}
    </div>
  )
}

const IC = {
  check:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  arrow:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  shield: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  dollar: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  globe:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  box:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>,
  users:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  zap:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  mail:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  phone:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  pin:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  tv:     <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  home2:  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  coffee: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  fridge: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 10h16"/><path d="M8 6v2M8 14v4"/></svg>,
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background:'#060810', color:'#fff', fontFamily:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif', overflowX:'hidden' }}>
      <style>{`
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-33.333%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes pulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes float0 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-20px)} }
        @keyframes float1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-35px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-15px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-28px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(14,165,233,0.3)} 50%{box-shadow:0 0 40px rgba(14,165,233,0.6)} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(14,165,233,0.2)} 50%{border-color:rgba(14,165,233,0.6)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }

        .lc-hamburger { display:none !important; }
        .lc-nav-link { font-size:12px; font-weight:600; color:rgba(255,255,255,0.5); text-decoration:none; transition:color 0.2s; letter-spacing:0.03em; padding:6px 12px; border-radius:4px; }
        .lc-nav-link:hover { color:#fff; background:rgba(255,255,255,0.05); }
        .lc-btn-primary { display:inline-flex; align-items:center; gap:8px; padding:13px 26px; background:linear-gradient(135deg,#0EA5E9,#0284C7); color:#fff; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; border:none; border-radius:4px; text-decoration:none; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; }
        .lc-btn-primary::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent); opacity:0; transition:opacity 0.2s; }
        .lc-btn-primary:hover::before { opacity:1; }
        .lc-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(14,165,233,0.4); }
        .lc-btn-outline { display:inline-flex; align-items:center; gap:8px; padding:13px 26px; background:transparent; color:#fff; font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; border:1px solid rgba(255,255,255,0.15); border-radius:4px; text-decoration:none; cursor:pointer; transition:all 0.2s; }
        .lc-btn-outline:hover { border-color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.04); }

        .feature-card { background:rgba(255,255,255,0.025); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:2rem; transition:all 0.3s; position:relative; overflow:hidden; }
        .feature-card::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 50% 0%, rgba(14,165,233,0.08), transparent 60%); opacity:0; transition:opacity 0.3s; }
        .feature-card:hover::before { opacity:1; }
        .feature-card:hover { border-color:rgba(14,165,233,0.25); transform:translateY(-4px); box-shadow:0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(14,165,233,0.1); }

        .step-line { position:absolute; left:19px; top:44px; bottom:-12px; width:1px; background:linear-gradient(180deg,rgba(14,165,233,0.4),rgba(14,165,233,0)); }

        .glass-card { background:rgba(255,255,255,0.03); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.07); border-radius:16px; }

        /* Divider wave */
        .wave-divider { position:relative; height:120px; overflow:hidden; }
        .wave-divider svg { position:absolute; bottom:0; width:100%; }

        @media (max-width: 768px) {
          .lc-hamburger { display:flex !important; }
          .lc-nav-links { display:none !important; }
          .lc-hero-h { font-size:clamp(36px,9vw,72px) !important; }
          .grid-3 { grid-template-columns:1fr !important; }
          .grid-2 { grid-template-columns:1fr !important; }
          .grid-4 { grid-template-columns:1fr 1fr !important; }
          .hero-btns { flex-direction:column !important; }
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, backdropFilter:'blur(24px)', background:'rgba(6,8,16,0.88)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', height:60, maxWidth:1200, margin:'0 auto' }}>
          <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, border:'2px solid rgba(14,165,233,0.4)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', animation:'borderGlow 3s infinite' }}>
              <div style={{ width:10, height:10, background:'#0EA5E9', borderRadius:2, animation:'pulse 2s infinite' }}/>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:900, letterSpacing:'0.18em', color:'#fff', textTransform:'uppercase', lineHeight:1 }}>LEVAM<span style={{ color:'#0EA5E9' }}>CORP</span></div>
              <div style={{ fontSize:7, letterSpacing:'0.25em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', marginTop:1 }}>Distributors · Doral, FL</div>
            </div>
          </Link>
          <div className="lc-nav-links" style={{ display:'flex', alignItems:'center', gap:2 }}>
            {[['#brands','Products'],['#process','Process'],['#about','About'],['#contact','Contact']].map(([h,l]) => (
              <a key={l} href={h} className="lc-nav-link">{l}</a>
            ))}
            <a href="/insights" className="lc-nav-link" style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
              <span style={{ width:6, height:6, background:'#22c55e', borderRadius:'50%', boxShadow:'0 0 6px rgba(34,197,94,0.8)', animation:'pulse 2s infinite', flexShrink:0 }}/>
              Market Insights
            </a>
            <Link href="/apply" className="lc-btn-primary" style={{ padding:'9px 18px', fontSize:11, marginLeft:8 }}>Apply {IC.arrow}</Link>
          </div>
          <MobileMenu/>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', padding:'8rem 2rem 4rem', position:'relative', overflow:'hidden',
        background:'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(14,165,233,0.1) 0%, transparent 60%)' }}>

        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(14,165,233,0.15) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }}/>

        {/* Floating particles */}
        <Particles/>

        {/* Rotating ring decoration */}
        <div style={{ position:'absolute', right:'-10%', top:'15%', width:500, height:500, border:'1px solid rgba(14,165,233,0.08)', borderRadius:'50%', animation:'rotateSlow 30s linear infinite', pointerEvents:'none' }}>
          <div style={{ position:'absolute', top:20, left:'50%', width:8, height:8, background:'#0EA5E9', borderRadius:'50%', transform:'translateX(-50%)', boxShadow:'0 0 10px #0EA5E9' }}/>
        </div>
        <div style={{ position:'absolute', right:'-8%', top:'18%', width:380, height:380, border:'1px solid rgba(99,102,241,0.06)', borderRadius:'50%', animation:'rotateSlow 20s linear infinite reverse', pointerEvents:'none' }}>
          <div style={{ position:'absolute', bottom:10, right:20, width:5, height:5, background:'#6366F1', borderRadius:'50%', boxShadow:'0 0 8px #6366F1' }}/>
        </div>

        {/* Scanline sweep */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          <div style={{ position:'absolute', left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.15),transparent)', animation:'scanline 8s ease-in-out infinite' }}/>
        </div>

        {/* Parallax glow */}
        <div style={{ position:'absolute', top:'30%', left:'40%', width:700, height:700, background:'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', transform:`translateY(${scrollY*0.2}px)`, pointerEvents:'none', transition:'transform 0.1s' }}/>
        <div style={{ position:'absolute', top:'40%', left:'20%', width:400, height:400, background:'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)', transform:`translateY(${scrollY*0.1}px)`, pointerEvents:'none' }}/>

        <div style={{ maxWidth:1200, margin:'0 auto', width:'100%', position:'relative', zIndex:2 }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', border:'1px solid rgba(14,165,233,0.3)', borderRadius:20, background:'rgba(14,165,233,0.06)', marginBottom:'2rem', animation:'fadeUp 0.6s ease both', backdropFilter:'blur(8px)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#0EA5E9', animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', color:'#0EA5E9', textTransform:'uppercase' }}>B2B Wholesale Distribution · Doral, FL</span>
          </div>

          {/* Headline */}
          <h1 className="lc-hero-h" style={{ fontSize:'clamp(42px,6.5vw,90px)', fontWeight:900, lineHeight:1.0, letterSpacing:'-0.03em', margin:'0 0 1.5rem', animation:'fadeUp 0.6s 0.1s ease both' }}>
            Premium brands.<br/>
            <span style={{ color:'transparent', backgroundImage:'linear-gradient(90deg,#0EA5E9,#38BDF8,#7DD3FC,#60A5FA,#0EA5E9)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', backgroundClip:'text', animation:'shimmer 3s linear infinite', filter:'drop-shadow(0 0 30px rgba(14,165,233,0.3))' }}>
              Wholesale pricing.
            </span><br/>
            <span style={{ color:'rgba(255,255,255,0.3)', fontStyle:'italic' }}>Built for resellers.</span>
          </h1>

          <p style={{ fontSize:16, color:'rgba(255,255,255,0.45)', lineHeight:1.8, maxWidth:520, marginBottom:'2.5rem', animation:'fadeUp 0.6s 0.2s ease both' }}>
            Levam Corp connects approved U.S. distributors and resellers to top consumer electronics and appliance brands — at competitive wholesale prices, from our Doral, FL warehouse.
          </p>

          <div className="hero-btns" style={{ display:'flex', gap:12, flexWrap:'wrap', animation:'fadeUp 0.6s 0.3s ease both', marginBottom:'4rem' }}>
            <Link href="/apply" className="lc-btn-primary">Apply for wholesale access {IC.arrow}</Link>
            <Link href="/portal" className="lc-btn-outline">Partner portal login</Link>
          </div>

          {/* Stats row */}
          <div className="grid-4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.5rem', maxWidth:560, animation:'fadeUp 0.6s 0.4s ease both' }}>
            {[['48h','Avg. dispatch'],['7+','Premium brands'],['500+','Active SKUs'],['100%','B2B only']].map(([n,l]) => (
              <div key={l} style={{ borderLeft:'2px solid rgba(14,165,233,0.3)', paddingLeft:'1rem', position:'relative' }}>
                <div style={{ position:'absolute', left:-1, top:0, bottom:0, width:2, background:'linear-gradient(180deg,#0EA5E9,rgba(14,165,233,0))', borderRadius:1 }}/>
                <div style={{ fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>{n}</div>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:40, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, opacity:0.4 }}>
          <div style={{ width:1, height:40, background:'linear-gradient(180deg,transparent,rgba(14,165,233,0.8),transparent)', animation:'float1 2s ease-in-out infinite' }}/>
        </div>
      </section>

      {/* ── BRAND TICKER ──────────────────────────────────────── */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)', background:'rgba(14,165,233,0.02)' }}>
        <BrandTicker/>
      </div>

      {/* ── CATEGORIES ────────────────────────────────────────── */}
      <section id="brands" style={{ padding:'8rem 2rem', position:'relative' }}>
        {/* Background decoration */}
        <div style={{ position:'absolute', left:'-5%', top:'20%', width:400, height:400, background:'radial-gradient(circle,rgba(99,102,241,0.04),transparent)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <Reveal>
            <div style={{ marginBottom:'4rem', textAlign:'center' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', color:'#0EA5E9', textTransform:'uppercase', marginBottom:12 }}>What we distribute</div>
              <h2 style={{ fontSize:'clamp(28px,4vw,50px)', fontWeight:900, letterSpacing:'-0.02em', margin:'0 0 1rem', lineHeight:1.1 }}>One source.<br/>Every category.</h2>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.35)', maxWidth:400, margin:'0 auto' }}>From 32" TVs to kitchen appliances — all from verified brand suppliers.</p>
            </div>
          </Reveal>

          <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              { icon:IC.tv,     label:'Televisions',      desc:'Smart TVs, 4K UHD, QLED & Mini-LED from Hisense and Samsung. 32" to 100".', color:'#0EA5E9' },
              { icon:IC.fridge, label:'Refrigerators',    desc:'Compact and countertop refrigerators from Avanti for retail and hospitality.', color:'#6366F1' },
              { icon:IC.coffee, label:'Small Appliances', desc:'Coffee makers, blenders, rice cookers, irons and more from Brentwood, Hamilton Beach, Proctor Silex.', color:'#22c55e' },
              { icon:IC.home2,  label:'Kitchen & Cooking',desc:'Air fryers, deep fryers, griddles, pressure cookers and complete kitchen lineups.', color:'#f59e0b' },
            ].map((cat,i) => (
              <Reveal key={cat.label} delay={i*0.1}>
                <Card3D style={{ height:'100%' }}>
                  <div className="feature-card" style={{ height:'100%', display:'flex', gap:'1.5rem', alignItems:'flex-start' }}>
                    <div style={{ width:54, height:54, borderRadius:10, background:`rgba(${cat.color==='#0EA5E9'?'14,165,233':cat.color==='#6366F1'?'99,102,241':cat.color==='#22c55e'?'34,197,94':'245,158,11'},0.1)`, border:`1px solid rgba(${cat.color==='#0EA5E9'?'14,165,233':cat.color==='#6366F1'?'99,102,241':cat.color==='#22c55e'?'34,197,94':'245,158,11'},0.2)`, display:'flex', alignItems:'center', justifyContent:'center', color:cat.color, flexShrink:0, position:'relative' }}>
                      {cat.icon}
                      <div style={{ position:'absolute', inset:0, borderRadius:10, background:`radial-gradient(circle at 50% 50%, rgba(${cat.color==='#0EA5E9'?'14,165,233':cat.color==='#6366F1'?'99,102,241':cat.color==='#22c55e'?'34,197,94':'245,158,11'},0.2), transparent)` }}/>
                    </div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:8 }}>{cat.label}</div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.7 }}>{cat.desc}</div>
                    </div>
                  </div>
                </Card3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAVE DIVIDER ──────────────────────────────────────── */}
      <div style={{ position:'relative', height:80, overflow:'hidden', marginTop:'-40px' }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ position:'absolute', bottom:0, width:'100%', height:'100%' }}>
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,20 1440,40 L1440,80 L0,80 Z" fill="rgba(14,165,233,0.04)"/>
        </svg>
      </div>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section style={{ padding:'6rem 2rem', background:'rgba(14,165,233,0.04)', borderTop:'1px solid rgba(14,165,233,0.08)', borderBottom:'1px solid rgba(14,165,233,0.08)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(14,165,233,0.06) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'2rem', textAlign:'center' }}>
            {[
              { to:500, s:'+', label:'Active SKUs', sub:'across all brands' },
              { to:48,  s:'h', label:'Avg. dispatch', sub:'from Doral, FL warehouse' },
              { to:7,   s:'+', label:'Premium brands', sub:'direct wholesale access' },
            ].map((stat,i) => (
              <Reveal key={stat.label} delay={i*0.15}>
                <div style={{ padding:'2rem' }}>
                  <div style={{ fontSize:'clamp(48px,6vw,80px)', fontWeight:900, letterSpacing:'-0.03em', color:'#fff', lineHeight:1, textShadow:'0 0 40px rgba(14,165,233,0.4)' }}>
                    <Counter to={stat.to} suffix={stat.s}/>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#0EA5E9', marginTop:10, letterSpacing:'0.05em' }}>{stat.label}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:4 }}>{stat.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAVE DIVIDER 2 ────────────────────────────────────── */}
      <div style={{ position:'relative', height:80, overflow:'hidden' }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ position:'absolute', top:0, width:'100%', height:'100%' }}>
          <path d="M0,40 C360,0 720,80 1080,40 C1260,20 1380,60 1440,40 L1440,0 L0,0 Z" fill="rgba(14,165,233,0.04)"/>
        </svg>
      </div>

      {/* ── PROCESS ───────────────────────────────────────────── */}
      <section id="process" style={{ padding:'7rem 2rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:'-5%', bottom:'10%', width:500, height:500, background:'radial-gradient(circle,rgba(14,165,233,0.04),transparent)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6rem', alignItems:'start' }}>
            <Reveal>
              <div style={{ position:'sticky', top:100 }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', color:'#0EA5E9', textTransform:'uppercase', marginBottom:12 }}>How it works</div>
                <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, letterSpacing:'-0.02em', margin:'0 0 1.5rem', lineHeight:1.1 }}>Simple process.<br/>Real results.</h2>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.35)', lineHeight:1.85, maxWidth:380, marginBottom:'2.5rem' }}>
                  We review every application personally. We work with a select group of serious distributors, resellers, and retailers — not a marketplace.
                </p>
                <Link href="/apply" className="lc-btn-primary">Start your application {IC.arrow}</Link>
              </div>
            </Reveal>
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {[
                { n:'01', title:'Apply online', desc:'Submit your business info — EIN, resale certificate, and a brief description of what you sell and where.' },
                { n:'02', title:'Get approved', desc:'We review every application personally and respond within 1–2 business days.' },
                { n:'03', title:'Access your portal', desc:'Once approved, get private access to our full catalog — live pricing, stock levels, and order tracking.' },
                { n:'04', title:'Order & receive', desc:'Place orders through your portal. We dispatch from Doral, FL with an average 48-hour turnaround.' },
              ].map((step,i) => (
                <Reveal key={step.n} delay={i*0.1}>
                  <div style={{ display:'flex', gap:'1.5rem', padding:'2rem 0', borderBottom:i<3?'1px solid rgba(255,255,255,0.04)':'none', position:'relative' }}>
                    {i < 3 && <div className="step-line"/>}
                    <div style={{ width:40, height:40, borderRadius:'50%', border:'1px solid rgba(14,165,233,0.3)', background:'rgba(14,165,233,0.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, position:'relative', zIndex:1 }}>
                      <span style={{ fontSize:10, fontWeight:900, color:'#0EA5E9', letterSpacing:'0.05em' }}>{step.n}</span>
                    </div>
                    <div style={{ paddingTop:6 }}>
                      <div style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:6 }}>{step.title}</div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.7 }}>{step.desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY LEVAM ─────────────────────────────────────────── */}
      <section style={{ padding:'7rem 2rem', background:'rgba(255,255,255,0.01)', position:'relative', overflow:'hidden' }}>
        {/* Mesh gradient background */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 60% 50% at 0% 50%, rgba(14,165,233,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 100% 50%, rgba(99,102,241,0.04) 0%, transparent 60%)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
          <Reveal>
            <div style={{ textAlign:'center', marginBottom:'4rem' }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', color:'#0EA5E9', textTransform:'uppercase', marginBottom:12 }}>Why partners choose us</div>
              <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, letterSpacing:'-0.02em', margin:0, lineHeight:1.1 }}>Built for serious business.</h2>
            </div>
          </Reveal>

          <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { icon:IC.dollar, title:'Wholesale pricing',      desc:'Direct access to competitive wholesale rates negotiated with top-brand suppliers — not inflated reseller prices.', color:'#22c55e' },
              { icon:IC.shield, title:'Verified partners only', desc:'We work with approved businesses only. Every partner is vetted personally. This protects your margins.',           color:'#0EA5E9' },
              { icon:IC.zap,    title:'48h dispatch average',   desc:'Orders ship from our Doral, FL warehouse. Average 48-hour dispatch with full tracking.',                          color:'#f59e0b' },
              { icon:IC.box,    title:'Live catalog access',    desc:'Your private portal shows real-time pricing and stock. No guessing, no waiting for a quote.',                     color:'#6366F1' },
              { icon:IC.globe,  title:'U.S. based operation',   desc:'6315 NW 99th Ave, Doral, FL 33178. Registered Florida business — not an overseas broker.',                       color:'#0EA5E9' },
              { icon:IC.users,  title:'Dedicated support',      desc:'Real people, Mon–Fri 9AM–5PM ET. We speak English and Spanish. You talk to us directly.',                        color:'#22c55e' },
            ].map((f,i) => (
              <Reveal key={f.title} delay={i*0.08}>
                <Card3D style={{ height:'100%' }}>
                  <div className="feature-card" style={{ height:'100%' }}>
                    <div style={{ width:46, height:46, borderRadius:10, background:`rgba(14,165,233,0.06)`, border:`1px solid rgba(14,165,233,0.12)`, display:'flex', alignItems:'center', justifyContent:'center', color:f.color, marginBottom:'1.25rem' }}>
                      {f.icon}
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:8 }}>{f.title}</div>
                    <div style={{ fontSize:12.5, color:'rgba(255,255,255,0.35)', lineHeight:1.7 }}>{f.desc}</div>
                  </div>
                </Card3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────── */}
      <section id="about" style={{ padding:'7rem 2rem', position:'relative' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5rem', alignItems:'center' }}>
            <Reveal>
              <div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', color:'#0EA5E9', textTransform:'uppercase', marginBottom:12 }}>About Levam Corp</div>
                <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, letterSpacing:'-0.02em', margin:'0 0 1.5rem', lineHeight:1.1 }}>A different kind<br/>of distributor.</h2>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.9, marginBottom:'1rem' }}>
                  Levam Corp Distributors is a B2B wholesale distribution company based in Doral, FL. We source electronics and home appliances directly from top brands and distribute them to approved business partners at competitive wholesale prices.
                </p>
                <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.9, marginBottom:'2rem' }}>
                  We are not a marketplace. We are a distribution company with a real warehouse, a real team, and a real commitment to the partners we work with.
                </p>
                {['Registered Florida business (DBA)','Warehouse in Doral, FL 33178','English & Spanish speaking team','MOQ varies by product — no pressure'].map(item => (
                  <div key={item} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, color:'rgba(255,255,255,0.55)', fontSize:13 }}>
                    <span style={{ color:'#0EA5E9', flexShrink:0 }}>{IC.check}</span>{item}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <Card3D>
                <div className="glass-card" style={{ padding:'2.5rem' }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', marginBottom:'1.5rem' }}>Company information</div>
                  {[
                    ['Legal name','Levam Corp Distributors (DBA)'],
                    ['Address','6315 NW 99th Ave, Doral, FL 33178'],
                    ['State','Florida, United States'],
                    ['Operations','B2B Wholesale Distribution'],
                    ['Brands','Hisense · Samsung · Brentwood · Hamilton Beach · Avanti · Proctor Silex · Magic Bullet'],
                  ].map(([label,value]) => (
                    <div key={label} style={{ padding:'0.875rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 }}>{label}</div>
                      <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:500, lineHeight:1.5 }}>{value}</div>
                    </div>
                  ))}
                </div>
              </Card3D>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── LANGUAGE ──────────────────────────────────────────── */}
      <section style={{ padding:'5rem 2rem', background:'linear-gradient(135deg,rgba(14,165,233,0.06),rgba(99,102,241,0.04))', borderTop:'1px solid rgba(14,165,233,0.1)', borderBottom:'1px solid rgba(14,165,233,0.1)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', gap:'3rem', flexWrap:'wrap', justifyContent:'space-between' }}>
          <Reveal>
            <div style={{ flex:1, minWidth:280 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', color:'#0EA5E9', textTransform:'uppercase', marginBottom:12 }}>We speak your language</div>
              <h2 style={{ fontSize:'clamp(24px,3vw,38px)', fontWeight:900, letterSpacing:'-0.02em', margin:'0 0 1rem', lineHeight:1.15 }}>
                English & Español.<br/>
                <span style={{ color:'rgba(255,255,255,0.35)', fontWeight:500, fontSize:'0.75em' }}>A dedicated rep for every partner.</span>
              </h2>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.85, margin:0, maxWidth:460 }}>
                Whether you communicate in English or Spanish, we have dedicated team members ready to assist you. We'll help you find exactly what you need — the right products, the right quantities, the right price. You are never left searching alone.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display:'flex', flexDirection:'column', gap:10, minWidth:260 }}>
              {[['🇺🇸','English','Full support in English — orders, quotes, invoices, and communication.'],['🌎','Español','Atención completa en español — pedidos, cotizaciones y comunicación.']].map(([flag,lang,desc]) => (
                <Card3D key={lang}>
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'1.1rem 1.25rem', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10 }}>
                    <span style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{flag}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:3 }}>{lang}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.55 }}>{desc}</div>
                    </div>
                  </div>
                </Card3D>
              ))}
              <div style={{ padding:'0.875rem 1.25rem', background:'rgba(14,165,233,0.06)', border:'1px solid rgba(14,165,233,0.15)', borderRadius:10, fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>
                WhatsApp: <a href="https://wa.me/17864909005" style={{ color:'#0EA5E9', textDecoration:'none', fontWeight:600 }}>(786) 490-9005</a> · Mon–Fri 9AM–5PM ET
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── MARKET INSIGHTS PREVIEW ───────────────────────────── */}
      <MarketInsightsPreview/>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section style={{ padding:'6rem 2rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(14,165,233,0.07) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <Particles/>
        <Reveal>
          <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', color:'#0EA5E9', textTransform:'uppercase', marginBottom:16 }}>Ready to become a partner?</div>
            <h2 style={{ fontSize:'clamp(28px,4vw,52px)', fontWeight:900, letterSpacing:'-0.02em', margin:'0 0 1rem', lineHeight:1.1 }}>Apply in 5 minutes.<br/>Response in 48 hours.</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.35)', lineHeight:1.75, marginBottom:'2.5rem' }}>
              We review every application personally. If your business is a fit, you'll get access to our full wholesale catalog with live pricing and stock levels.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link href="/apply" className="lc-btn-primary" style={{ fontSize:13, padding:'15px 36px' }}>Apply for a partner account {IC.arrow}</Link>
              <a href="mailto:partners@levamcorp.com" className="lc-btn-outline">Contact us first</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CONTACT ───────────────────────────────────────────── */}
      <section id="contact" style={{ padding:'6rem 2rem', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <Reveal>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.25em', color:'#0EA5E9', textTransform:'uppercase', marginBottom:12 }}>Contact</div>
            <h2 style={{ fontSize:'clamp(28px,4vw,46px)', fontWeight:900, letterSpacing:'-0.02em', margin:'0 0 3rem', lineHeight:1.1 }}>Get in touch.</h2>
          </Reveal>
          <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { icon:IC.mail,  label:'Email',    value:'partners@levamcorp.com',          href:'mailto:partners@levamcorp.com' },
              { icon:IC.phone, label:'Phone',    value:'(786) 878-4122 · (786) 546-9476', href:'tel:+17868784122' },
              { icon:IC.pin,   label:'Location', value:'6315 NW 99th Ave\nDoral, FL 33178', href:null },
            ].map((c,i) => (
              <Reveal key={c.label} delay={i*0.1}>
                <Card3D style={{ height:'100%' }}>
                  <div className="feature-card" style={{ height:'100%' }}>
                    <div style={{ color:'#0EA5E9', marginBottom:'1rem' }}>{c.icon}</div>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', marginBottom:8 }}>{c.label}</div>
                    {c.href
                      ? <a href={c.href} style={{ fontSize:13, color:'#fff', textDecoration:'none', fontWeight:500 }}>{c.value}</a>
                      : <div style={{ fontSize:13, color:'#fff', fontWeight:500, whiteSpace:'pre-line', lineHeight:1.6 }}>{c.value}</div>
                    }
                  </div>
                </Card3D>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ padding:'2.5rem 2rem', borderTop:'1px solid rgba(14,165,233,0.1)', background:'rgba(6,8,16,0.9)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div style={{ fontSize:13, fontWeight:900, letterSpacing:'0.2em', color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>
            LEVAM<span style={{ color:'#0EA5E9' }}>CORP</span>
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.15)' }}>© {new Date().getFullYear()} Levam Corp Distributors · Doral, FL · B2B wholesale only</div>
          <div style={{ display:'flex', gap:20 }}>
            {[['Portal','/portal'],['Apply','/apply'],['Insights','/insights'],['Contact','#contact']].map(([l,h]) => (
              <a key={l} href={h} style={{ fontSize:11, color:'rgba(255,255,255,0.25)', textDecoration:'none', fontWeight:600, letterSpacing:'0.05em', transition:'color 0.2s' }}
                onMouseOver={e=>e.target.style.color='rgba(255,255,255,0.7)'} onMouseOut={e=>e.target.style.color='rgba(255,255,255,0.25)'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── MARKET INSIGHTS PREVIEW ───────────────────────────────────────────────────
function MarketInsightsPreview() {
  const insights = [
    { tag:'Electronics', title:'Smart TVs dominate wholesale demand in 2026', date:'Aug 2026' },
    { tag:'E-commerce',  title:'FBA sellers shifting to wholesale for better margins', date:'Aug 2026' },
    { tag:'Trending',    title:'Kitchen appliances: consistent high performers for resellers', date:'Jul 2026' },
  ]
  return (
    <section style={{ padding:'6rem 2rem', background:'rgba(255,255,255,0.01)', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <Reveal>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:'3rem', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <span style={{ width:7, height:7, background:'#22c55e', borderRadius:'50%', animation:'pulse 2s infinite', boxShadow:'0 0 6px rgba(34,197,94,0.8)' }}/>
                <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', color:'#22c55e', textTransform:'uppercase' }}>Market Insights</span>
              </div>
              <h2 style={{ fontSize:'clamp(24px,3vw,40px)', fontWeight:900, letterSpacing:'-0.02em', margin:0, lineHeight:1.1 }}>Stay ahead<br/>of the market.</h2>
            </div>
            <Link href="/insights" style={{ fontSize:12, color:'#0EA5E9', textDecoration:'none', fontWeight:600, display:'flex', alignItems:'center', gap:6, padding:'8px 16px', border:'1px solid rgba(14,165,233,0.2)', borderRadius:20, background:'rgba(14,165,233,0.04)' }}>
              View all insights {IC.arrow}
            </Link>
          </div>
        </Reveal>
        <div className="grid-3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {insights.map((ins,i) => (
            <Reveal key={ins.title} delay={i*0.1}>
              <Link href="/insights" style={{ textDecoration:'none', display:'block', height:'100%' }}>
                <Card3D style={{ height:'100%' }}>
                  <div className="feature-card" style={{ height:'100%', display:'flex', flexDirection:'column', gap:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:9, padding:'3px 10px', background:'rgba(14,165,233,0.1)', color:'#0EA5E9', borderRadius:10, fontWeight:700, border:'0.5px solid rgba(14,165,233,0.2)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{ins.tag}</span>
                      <span style={{ fontSize:9, color:'rgba(255,255,255,0.25)' }}>{ins.date}</span>
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.5, flex:1 }}>{ins.title}</div>
                    <div style={{ fontSize:11, color:'#0EA5E9', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>Read insight {IC.arrow}</div>
                  </div>
                </Card3D>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
