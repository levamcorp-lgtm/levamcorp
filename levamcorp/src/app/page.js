'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// ── MOBILE MENU ──────────────────────────────────────────────────────────────
function MobileMenu() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button onClick={() => setOpen(!open)}
        style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
        className="lc-hamburger">
        {[0,1,2].map(i => (
          <span key={i} style={{ width: 22, height: 2, background: '#fff', borderRadius: 2, display: 'block', transition: 'all 0.25s',
            transform: open && i===0 ? 'rotate(45deg) translateY(7px)' : open && i===2 ? 'rotate(-45deg) translateY(-7px)' : 'none',
            opacity: open && i===1 ? 0 : 1 }}/>
        ))}
      </button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, background: '#060810', zIndex: 200, display: 'flex', flexDirection: 'column', padding: '5rem 2rem 3rem' }}>
          <button onClick={() => setOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: '50%', fontSize: 20, cursor: 'pointer' }}>×</button>
          {[['#brands','Products'],['#process','How it works'],['#about','About'],['#contact','Contact'],['/apply','Apply now']].map(([href, label]) => (
            <a key={label} href={href} onClick={() => setOpen(false)}
              style={{ fontSize: 26, fontWeight: 800, color: label==='Apply now' ? '#0EA5E9' : '#fff', textDecoration: 'none', padding: '1.1rem 0', borderBottom: '0.5px solid rgba(255,255,255,0.07)', letterSpacing: '-0.01em' }}>
              {label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}

// ── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function Counter({ to, prefix='', suffix='', duration=1800 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(ease * to))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

// ── BRAND TICKER ─────────────────────────────────────────────────────────────
function BrandTicker() {
  const brands = ['HISENSE','SAMSUNG','BRENTWOOD','PROCTOR SILEX','HAMILTON BEACH','AVANTI','MAGIC BULLET','NINJA','JBL','LG','SHARK']
  const doubled = [...brands, ...brands]
  return (
    <div style={{ overflow: 'hidden', padding: '1.25rem 0', borderTop: '0.5px solid rgba(255,255,255,0.07)', borderBottom: '0.5px solid rgba(255,255,255,0.07)', background: 'rgba(14,165,233,0.03)' }}>
      <div style={{ display: 'flex', gap: '3rem', animation: 'ticker 28s linear infinite', width: 'max-content' }}>
        {doubled.map((b, i) => (
          <span key={i} style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.25em', color: i % 2 === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(14,165,233,0.45)', whiteSpace: 'nowrap' }}>{b}</span>
        ))}
      </div>
    </div>
  )
}

// ── SVG ICONS ────────────────────────────────────────────────────────────────
const IC = {
  check:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  arrow:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  clock:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  shield:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  dollar:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  globe:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  box:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>,
  users:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  zap:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  mail:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  phone:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  pin:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  tv:      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  home2:   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  coffee:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  fridge:  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 10h16"/><path d="M8 6v2M8 14v4"/></svg>,
}


// ── MARKET INSIGHTS ──────────────────────────────────────────────────────────
function MarketInsights() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`https://newsapi.org/v2/everything?q=electronics+wholesale+appliances+retail&language=en&sortBy=publishedAt&pageSize=4&apiKey=e8fc41dbc05743fda639248c99d039f6`)
      .then(r => r.json())
      .then(data => {
        if (data.articles) setArticles(data.articles.filter(a => a.title && a.url && a.title !== '[Removed]').slice(0, 4))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section style={{ padding: '6rem 2rem', background: 'rgba(255,255,255,0.015)', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>Market Insights</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,40px)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>Industry news &<br/>market trends.</h2>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>Powered by NewsAPI · Updated daily</div>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 12 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '1.5rem', height: 160, animation: 'pulse 1.5s infinite' }}/>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No articles available at the moment.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 12 }}>
            {articles.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="lc-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    {a.source?.name || 'News'} · {new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.5, flex: 1 }}>{a.title}</div>
                  {a.description && (
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {a.description}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: '#0EA5E9', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Read article <span style={{ fontSize: 12 }}>→</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div style={{ background: '#060810', color: '#fff', fontFamily: '-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif', overflowX: 'hidden' }}>
      <style>{`
        @keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:.6 } 50% { opacity:1 } }
        @keyframes shimmer { 0% { background-position:-200% center } 100% { background-position:200% center } }
        .lc-hamburger { display: none !important; }
        .lc-nav-link { font-size:13px; font-weight:600; color:rgba(255,255,255,0.55); text-decoration:none; transition:color 0.2s; letter-spacing:0.02em; }
        .lc-nav-link:hover { color:#fff; }
        .lc-btn-primary { display:inline-flex; align-items:center; gap:8px; padding:14px 28px; background:#0EA5E9; color:#fff; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; border:none; border-radius:3px; text-decoration:none; cursor:pointer; transition:all 0.2s; }
        .lc-btn-primary:hover { background:#38BDF8; transform:translateY(-1px); box-shadow:0 8px 24px rgba(14,165,233,0.3); }
        .lc-btn-outline { display:inline-flex; align-items:center; gap:8px; padding:14px 28px; background:transparent; color:#fff; font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; border:1px solid rgba(255,255,255,0.2); border-radius:3px; text-decoration:none; cursor:pointer; transition:all 0.2s; }
        .lc-btn-outline:hover { border-color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.05); }
        .lc-card { background:rgba(255,255,255,0.025); border:0.5px solid rgba(255,255,255,0.07); border-radius:8px; padding:2rem; transition:all 0.3s; backdrop-filter:blur(4px); }
        .lc-card:hover { background:rgba(14,165,233,0.05); border-color:rgba(14,165,233,0.2); transform:translateY(-2px); }
        .lc-step { display:flex; gap:1.5rem; align-items:flex-start; padding:1.5rem 0; border-bottom:0.5px solid rgba(255,255,255,0.06); }
        .lc-step:last-child { border-bottom:none; }
        @media (max-width: 768px) {
          .lc-hamburger { display:flex !important; }
          .lc-nav-links { display:none !important; }
          .lc-hero-headline { font-size:clamp(36px,9vw,80px) !important; }
          .lc-grid-3 { grid-template-columns:1fr !important; }
          .lc-grid-2 { grid-template-columns:1fr !important; }
          .lc-stats { grid-template-columns:1fr 1fr !important; }
          .lc-hero-btns { flex-direction:column !important; }
        }
        /* Dot grid background */
        .lc-dotgrid {
          background-image: radial-gradient(rgba(14,165,233,0.18) 1px, transparent 1px);
          background-size: 28px 28px;
          background-color: #060810;
        }
      `}</style>

      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        .lc-scanline {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(14,165,233,0.015) 2px, rgba(14,165,233,0.015) 4px);
          pointer-events: none;
          z-index: 1;
          animation: scanlines 0.1s linear infinite;
        }
      `}</style>
      <div className="lc-scanline"/>
      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, borderBottom: '0.5px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', background: 'rgba(6,8,16,0.92)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: 64, maxWidth: 1200, margin: '0 auto' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 28, height: 28 }}>
              <div style={{ position: 'absolute', left: 6, top: 0, width: 2.5, height: 22, background: 'rgba(255,255,255,0.3)' }}/>
              <div style={{ position: 'absolute', left: 6, bottom: 0, width: 16, height: 2.5, background: 'rgba(255,255,255,0.3)' }}/>
              <div style={{ position: 'absolute', left: 9, bottom: 7, width: 10, height: 2.5, background: '#0EA5E9' }}/>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>LEVAM<span style={{ color: '#0EA5E9' }}>CORP</span></div>
              <div style={{ fontSize: 7.5, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: 2 }}>Distributors · Doral, FL</div>
            </div>
          </Link>
          {/* Links */}
          <div className="lc-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[['#brands','Products'],['#process','Process'],['#about','About'],['#contact','Contact']].map(([h,l]) => (
              <a key={l} href={h} className="lc-nav-link" style={{ padding: '6px 14px' }}>{l}</a>
            ))}
            <a href="/insights" className="lc-nav-link" style={{ padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.8)', animation: 'pulse 2s infinite', flexShrink: 0 }}/>
              Market Insights
            </a>
            <Link href="/apply" className="lc-btn-primary" style={{ padding: '9px 20px', fontSize: 12, marginLeft: 8 }}>Apply to partner {IC.arrow}</Link>
          </div>
          <MobileMenu/>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="lc-dotgrid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8rem 2rem 4rem', position: 'relative', overflow: 'hidden' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 900, background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(56,189,248,0.04) 40%, transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: '5%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }}/>
        {/* Corner grid decoration */}
        <div style={{ position: 'absolute', bottom: 60, right: 60, opacity: 0.12, pointerEvents: 'none' }}>
          {Array.from({length:6}).map((_,row) => (
            <div key={row} style={{ display:'flex', gap:16, marginBottom:16 }}>
              {Array.from({length:8}).map((_,col) => (
                <div key={col} style={{ width:4, height:4, borderRadius:'50%', background:'#0EA5E9' }}/>
              ))}
            </div>
          ))}
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: '1px solid rgba(14,165,233,0.4)', borderRadius: 2, background: 'rgba(14,165,233,0.1)', boxShadow: '0 0 20px rgba(14,165,233,0.15)', marginBottom: '2rem', animation: 'fadeUp 0.6s ease' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0EA5E9', animation: 'pulse 2s infinite' }}/>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: '#0EA5E9', textTransform: 'uppercase' }}>B2B Wholesale Distribution · Doral, FL</span>
          </div>

          {/* Headline */}
          <h1 className="lc-hero-headline" style={{ fontSize: 'clamp(44px,7vw,96px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 1.5rem', animation: 'fadeUp 0.6s 0.1s ease both' }}>
            Premium brands.<br/>
            <span style={{ color: 'transparent', backgroundImage: 'linear-gradient(90deg, #0EA5E9, #38BDF8, #7DD3FC, #60A5FA, #0EA5E9)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', animation: 'shimmer 3s linear infinite', textShadow: 'none', filter: 'drop-shadow(0 0 40px rgba(14,165,233,0.4))' }}>Wholesale pricing.</span><br/>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>Built for resellers.</span>
          </h1>

          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 560, marginBottom: '2.5rem', animation: 'fadeUp 0.6s 0.2s ease both' }}>
            Levam Corp connects approved U.S. distributors and resellers to top consumer electronics and appliance brands — at competitive wholesale prices, with fast dispatch from our Doral, FL warehouse.
          </p>

          <div className="lc-hero-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.6s 0.3s ease both', marginBottom: '3.5rem' }}>
            <Link href="/apply" className="lc-btn-primary" style={{ fontSize: 13 }}>Apply for wholesale access {IC.arrow}</Link>
            <Link href="/portal" className="lc-btn-outline">Partner portal login</Link>
          </div>

          {/* Mini stats */}
          <div className="lc-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', maxWidth: 640, animation: 'fadeUp 0.6s 0.4s ease both' }}>
            {[
              ['48h', 'Avg. dispatch'],
              ['7+', 'Premium brands'],
              ['500+', 'Active SKUs'],
              ['100%', 'B2B only'],
            ].map(([n, l]) => (
              <div key={l} style={{ borderLeft: '2px solid rgba(14,165,233,0.3)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{n}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND TICKER ─────────────────────────────────────── */}
      <BrandTicker/>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section id="brands" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '3.5rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>What we distribute</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>One source.<br/>Every category.</h2>
          </div>
          <div className="lc-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: IC.tv,     label: 'Televisions',       desc: 'Smart TVs, 4K UHD, QLED & Mini-LED from Hisense and Samsung. 32" to 100".' },
              { icon: IC.fridge, label: 'Refrigerators',     desc: 'Compact and countertop refrigerators from Avanti. Perfect for retail and hospitality.' },
              { icon: IC.coffee, label: 'Small Appliances',  desc: 'Coffee makers, blenders, rice cookers, irons, and more from Brentwood, Hamilton Beach, Proctor Silex.' },
              { icon: IC.home2,  label: 'Kitchen & Cooking', desc: 'Air fryers, deep fryers, griddles, pressure cookers, and complete kitchen lineups.' },
            ].map(cat => (
              <div key={cat.label} className="lc-card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, borderRadius: 8, background: 'rgba(14,165,233,0.08)', border: '0.5px solid rgba(14,165,233,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0EA5E9', flexShrink: 0 }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{cat.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{cat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <section style={{ padding: '4rem 2rem', background: 'rgba(14,165,233,0.06)', borderTop: '1px solid rgba(14,165,233,0.2)', borderBottom: '1px solid rgba(14,165,233,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="lc-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2rem', textAlign: 'center' }}>
            {[
              { n: 500, s: '+', label: 'Active SKUs', sub: 'across all brands' },
              { n: 48, s: 'h', label: 'Avg. dispatch', sub: 'from Doral, FL warehouse' },
              { n: 7, s: '+', label: 'Premium brands', sub: 'direct wholesale access' },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1, textShadow: '0 0 40px rgba(14,165,233,0.5)' }}>
                  <Counter to={stat.n} suffix={stat.s}/>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0EA5E9', marginTop: 8, letterSpacing: '0.02em' }}>{stat.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────── */}
      <section id="process" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'start' }} className="lc-grid-2">
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 2rem', lineHeight: 1.1 }}>Simple process.<br/>Real results.</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, maxWidth: 400, marginBottom: '2rem' }}>
              We review every application personally. We work with a select group of serious distributors, resellers, and retailers — not a marketplace.
            </p>
            <Link href="/apply" className="lc-btn-primary">Start your application {IC.arrow}</Link>
          </div>
          <div>
            {[
              { n: '01', title: 'Apply online', desc: 'Submit your business info — EIN, resale certificate, and a brief description of what you sell and where.' },
              { n: '02', title: 'Get approved', desc: 'We review every application personally and respond within 1–2 business days.' },
              { n: '03', title: 'Access your portal', desc: 'Once approved you get private access to our full catalog — live pricing, stock levels, and order tracking.' },
              { n: '04', title: 'Order & receive', desc: 'Place orders through your portal. We dispatch from our Doral, FL warehouse with an average 48-hour turnaround.' },
            ].map(step => (
              <div key={step.n} className="lc-step">
                <div style={{ fontSize: 11, fontWeight: 900, color: '#0EA5E9', letterSpacing: '0.1em', minWidth: 28, paddingTop: 2, fontVariantNumeric: 'tabular-nums' }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 5 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY LEVAM ────────────────────────────────────────── */}
      <section style={{ padding: '6rem 2rem', background: 'rgba(255,255,255,0.015)', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>Why partners choose us</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>Built for serious business.</h2>
          </div>
          <div className="lc-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { icon: IC.dollar, title: 'Wholesale pricing', desc: 'Direct access to competitive wholesale rates negotiated with top-brand suppliers — not inflated reseller prices.' },
              { icon: IC.shield, title: 'Verified partners only', desc: 'We work with approved businesses only. Every partner is vetted personally. This protects your margins.' },
              { icon: IC.zap,    title: '48h dispatch average', desc: 'Orders ship from our Doral, FL warehouse. Average 48-hour dispatch with full tracking.' },
              { icon: IC.box,    title: 'Live catalog access', desc: 'Your private portal shows real-time pricing and stock. No guessing, no waiting for a quote.' },
              { icon: IC.globe,  title: 'U.S. based operation', desc: '6315 NW 99th Ave, Doral, FL 33178. We are a registered Florida business — not an overseas broker.' },
              { icon: IC.users,  title: 'Dedicated support', desc: 'Real people, Monday–Friday 9AM–5PM ET. We speak English and Spanish. You talk to us directly.' },
            ].map(f => (
              <div key={f.title} className="lc-card">
                <div style={{ color: '#0EA5E9', marginBottom: '1rem' }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section id="about" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }} className="lc-grid-2">
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>About Levam Corp</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 1.5rem', lineHeight: 1.1 }}>A different kind<br/>of distributor.</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.85, marginBottom: '1.25rem' }}>
              Levam Corp Distributors is a B2B wholesale distribution company based in Doral, FL. We source electronics and home appliances directly from top brands and distribute them to approved business partners at competitive wholesale prices.
            </p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.85, marginBottom: '2rem' }}>
              We are not a marketplace. We are not a broker. We are a distribution company with a real warehouse, a real team, and a real commitment to the partners we work with. Every relationship starts with a conversation.
            </p>
            {[
              'Registered Florida business (DBA)',
              'Warehouse in Doral, FL 33178',
              'English & Spanish speaking team',
              'MOQ varies by product — no pressure',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                <span style={{ color: '#0EA5E9', flexShrink: 0 }}>{IC.check}</span>{item}
              </div>
            ))}
          </div>
          {/* Info card */}
          <div style={{ background: 'rgba(14,165,233,0.04)', border: '0.5px solid rgba(14,165,233,0.15)', borderRadius: 12, padding: '2.5rem' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Company information</div>
            {[
              ['Legal name', 'Levam Corp Distributors (DBA)'],
              ['Address', '6315 NW 99th Ave, Doral, FL 33178'],
              ['State', 'Florida, United States'],
              ['Operations', 'B2B Wholesale Distribution'],
              ['Brands', 'Hisense · Samsung · Brentwood · Hamilton Beach · Avanti · Proctor Silex · Magic Bullet'],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: '0.875rem 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, lineHeight: 1.5 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, rgba(14,165,233,0.1) 0%, rgba(99,102,241,0.06) 50%, rgba(14,165,233,0.04) 100%)', borderTop: '1px solid rgba(14,165,233,0.2)', borderBottom: '1px solid rgba(14,165,233,0.2)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 16 }}>Ready to become a partner?</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 1rem', lineHeight: 1.1 }}>Apply in 5 minutes.<br/>Response in 48 hours.</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '2rem' }}>
            We review every application personally. If your business is a fit, you'll get access to our full wholesale catalog with live pricing and stock levels.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/apply" className="lc-btn-primary" style={{ fontSize: 14, padding: '15px 36px' }}>Apply for a partner account {IC.arrow}</Link>
            <a href="mailto:partners@levamcorp.com" className="lc-btn-outline">Contact us first</a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────── */}
      <section id="contact" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>Contact</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 3rem', lineHeight: 1.1 }}>Get in touch.</h2>
          <div className="lc-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { icon: IC.mail,  label: 'Email', value: 'partners@levamcorp.com', href: 'mailto:partners@levamcorp.com' },
              { icon: IC.phone, label: 'Phone', value: '(786) 878-4122 · (786) 546-9476', href: 'tel:+17868784122' },
              { icon: IC.pin,   label: 'Location', value: '6315 NW 99th Ave\nDoral, FL 33178', href: null },
            ].map(c => (
              <div key={c.label} className="lc-card">
                <div style={{ color: '#0EA5E9', marginBottom: '1rem' }}>{c.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>{c.label}</div>
                {c.href
                  ? <a href={c.href} style={{ fontSize: 14, color: '#fff', textDecoration: 'none', fontWeight: 500 }}>{c.value}</a>
                  : <div style={{ fontSize: 14, color: '#fff', fontWeight: 500, whiteSpace: 'pre-line', lineHeight: 1.6 }}>{c.value}</div>
                }
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKET INSIGHTS ─────────────────────────────────── */}
      <MarketInsights/>

      {/* ── LANGUAGE BANNER ─────────────────────────────────── */}
      <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.06) 100%)', borderTop: '1px solid rgba(14,165,233,0.15)', borderBottom: '1px solid rgba(14,165,233,0.15)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>We speak your language</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 1rem', lineHeight: 1.15 }}>
              English & Español.<br/>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontSize: '0.75em' }}>A dedicated rep for every partner.</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, margin: 0, maxWidth: 480 }}>
              Whether you communicate in English or Spanish, we have dedicated team members ready to assist you. We'll help you find exactly what you need — the right products, the right quantities, the right price. You are never left searching alone.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 260 }}>
            {[
              ['🇺🇸', 'English', 'Full support in English — orders, quotes, invoices, and communication.'],
              ['🌎', 'Español', 'Atención completa en español — pedidos, cotizaciones y comunicación.'],
            ].map(([flag, lang, desc]) => (
              <div key={lang} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 8 }}>
                <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{flag}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{lang}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: '0.875rem 1.25rem', background: 'rgba(14,165,233,0.08)', border: '0.5px solid rgba(14,165,233,0.2)', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              📲 WhatsApp: <a href="https://wa.me/17864909005" style={{ color: '#0EA5E9', textDecoration: 'none', fontWeight: 600 }}>(786) 490-9005</a> · Mon–Fri 9AM–5PM ET
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ padding: '2.5rem 2rem', borderTop: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(6,8,16,0.9)', borderTop: '1px solid rgba(14,165,233,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            LEVAM<span style={{ color: '#0EA5E9' }}>CORP</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Levam Corp Distributors · Doral, FL · B2B wholesale only
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['Portal','/portal'],['Apply','/apply'],['Contact','#contact']].map(([l,h]) => (
              <a key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.05em' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
