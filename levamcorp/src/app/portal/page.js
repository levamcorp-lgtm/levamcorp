'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

function seededBars(seed, count) {
  let s = seed
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  return Array.from({ length: count }, () => {
    const r = rnd()
    return { w: r > 0.82 ? 3 : r > 0.5 ? 2 : 1, tall: r > 0.94 }
  })
}
const LOGIN_BARS = seededBars(51001, 70)

const PORTAL_FEATURES = [
  { k: 'Catalog', v: 'Full product catalog with live pricing' },
  { k: 'Billing', v: 'Automatic quote & invoice generation' },
  { k: 'Stock', v: 'Real-time availability & dispatch times' },
  { k: 'Orders', v: 'Full order history & tracking' },
]

export default function PortalPage() {
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [resetSent,   setResetSent]   = useState(false)
  const [showPass,    setShowPass]    = useState(false)
  const [resetLoading,setResetLoading]= useState(false)

  const handleForgotPassword = async () => {
    if (!email) { setError('Please enter your email address first.'); return }
    setResetLoading(true); setError('')
    try {
      const sb = createClient()
      const { error: err } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://www.levamcorp.com/portal/reset-password',
      })
      if (err) throw err
      setResetSent(true)
    } catch { setError('Could not send reset email. Please try again.') }
    setResetLoading(false)
  }

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')
    try {
      const sb = createClient()
      const { data, error: err } = await sb.auth.signInWithPassword({ email, password })
      if (err) throw err
      const adminEmails = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
      if (adminEmails.includes(data.user.email)) {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/portal/dashboard'
      }
    } catch { setError('Invalid credentials. Please try again.') }
    finally { setLoading(false) }
  }

  const eyeIcon = showPass
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

  return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', color:'#08090B', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif', display:'grid', gridTemplateColumns:'1fr 1fr' }} className="portal-grid">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDot { 0%,100%{opacity:.5} 50%{opacity:1} }
        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }
        .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
        input::placeholder { color: rgba(8,9,11,0.3); }
        input:focus { border-color: rgba(47,125,246,0.6) !important; }
        .portal-submit:hover:not(:disabled) { background:#2F7DF6 !important; color:#08090B !important; }
        @media(max-width:768px) { .portal-grid { grid-template-columns:1fr !important; } .portal-left { display:none !important; } }
      `}</style>

      {/* ── LEFT PANEL — ticket ledger ───────────────────────────────────── */}
      <div className="portal-left" style={{ position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'clamp(32px,4vw,56px)', background:'#08090B', color:'#F5F1E8' }}>

        <div>
          <Link href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, border:'1.5px solid rgba(245,241,232,0.35)', borderLeft:'3px solid #2F7DF6', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width:16, height:'auto' }}/>
            </div>
            <div>
              <div className="lc-display" style={{ fontSize:14, fontWeight:700, letterSpacing:'0.16em', color:'#F5F1E8', textTransform:'uppercase', lineHeight:1 }}>LEVAM<span style={{ color:'#2F7DF6' }}>CORP</span></div>
              <div className="lc-mono" style={{ fontSize:7, letterSpacing:'0.22em', color:'#6F6D67', textTransform:'uppercase', marginTop:2 }}>Distributors · Doral, FL</div>
            </div>
          </Link>

          <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, marginTop:'clamp(28px,4vh,44px)', paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8A8780' }}>
            <span style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
              Access point · Form 09
            </span>
            <span>Partner portal</span>
          </div>
          <div style={{ height:1, background:'rgba(245,241,232,0.25)' }}/>
        </div>

        <div>
          <h2 className="lc-display" style={{ fontSize:'clamp(28px,3.5vw,42px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1.05, margin:'0 0 1rem', color:'#F5F2E9' }}>
            Your private<br/>distribution hub<span style={{ color:'#2F7DF6' }}>.</span>
          </h2>
          <p style={{ fontSize:14, lineHeight:1.75, color:'#9A968E', maxWidth:340, margin:'0 0 clamp(24px,3.4vh,36px)' }}>
            Access your full catalog, submit orders, generate quotes and invoices — all in one place.
          </p>

          <div style={{ borderTop:'1px solid rgba(245,241,232,0.16)' }}>
            {PORTAL_FEATURES.map((f, i) => (
              <div key={f.k} style={{ display:'grid', gridTemplateColumns:'28px 1fr', gap:14, alignItems:'baseline', padding:'12px 0', borderBottom:'1px solid rgba(245,241,232,0.09)' }}>
                <span className="lc-mono" style={{ fontSize:10, letterSpacing:'0.14em', color:'#8A8780' }}>0{i+1}</span>
                <span style={{ fontSize:13.5, color:'#DDD8CD' }}>{f.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:20, marginBottom:16 }}>
            {LOGIN_BARS.map((b,i) => <div key={i} style={{ flex:`${b.w} 1 0`, minWidth:1, height: b.tall ? 18 : 12, background:'#F5F1E8', opacity:0.2 }}/>)}
          </div>
          <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67', lineHeight:1.8 }}>
            © {new Date().getFullYear()} Levam Corp Distributors<br/>6315 NW 99th Ave, Doral, FL 33178
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — sign-in slip ─────────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 2rem' }}>
        <div style={{ maxWidth:420, width:'100%', background:'#FFFFFF', border:'1px solid rgba(8,9,11,0.1)', color:'#08090B', padding:'clamp(26px,3.6vw,40px)', animation:'fadeUp 0.5s ease' }}>

          <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', paddingBottom:12, borderBottom:'2px solid #08090B', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
            <span style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#12B76A', boxShadow:'0 0 6px #12B76A', animation:'pulseDot 2s infinite', display:'inline-block' }}/>
              Approved partners only
            </span>
            <span>Sign-in slip</span>
          </div>

          <h3 className="lc-display" style={{ fontSize:'clamp(22px,2.8vw,30px)', fontWeight:400, letterSpacing:'-0.03em', lineHeight:1.1, margin:'clamp(18px,2.6vh,24px) 0 8px', color:'#08090B' }}>
            Sign in to your account<span style={{ color:'#2F7DF6' }}>.</span>
          </h3>
          <p style={{ fontSize:13, color:'#5C5A55', margin:'0 0 clamp(20px,2.8vh,28px)' }}>
            Don&rsquo;t have access? <Link href="/apply" style={{ color:'#2F7DF6', fontWeight:600, textDecoration:'none' }}>Apply to become a partner →</Link>
          </p>

          <div style={{ display:'grid', gap:1, background:'rgba(8,9,11,0.16)', border:'1px solid #08090B' }}>
            <label style={{ display:'grid', gridTemplateColumns:'clamp(78px,9vw,96px) 1fr', alignItems:'center', background:'#FFFFFF' }}>
              <span className="lc-mono" style={{ padding:'0 12px', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64' }}>Email</span>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                placeholder="you@yourbusiness.com"
                className="lc-mono" style={{ border:0, borderLeft:'1px solid rgba(8,9,11,0.16)', background:'transparent', padding:'13px 12px', fontSize:12, letterSpacing:'0.04em', color:'#08090B', width:'100%', boxSizing:'border-box' }}/>
            </label>
            <label style={{ display:'grid', gridTemplateColumns:'clamp(78px,9vw,96px) 1fr', alignItems:'center', background:'#FFFFFF', position:'relative' }}>
              <span className="lc-mono" style={{ padding:'0 12px', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64' }}>Password</span>
              <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                placeholder="••••••••••"
                className="lc-mono" style={{ border:0, borderLeft:'1px solid rgba(8,9,11,0.16)', background:'transparent', padding:'13px 40px 13px 12px', fontSize:12, letterSpacing:'0.04em', color:'#08090B', width:'100%', boxSizing:'border-box' }}/>
              <button type="button" onClick={()=>setShowPass(s=>!s)}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#6D6A64', padding:0, display:'flex' }}>
                {eyeIcon}
              </button>
            </label>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'14px 0 clamp(18px,2.6vh,24px)' }}>
            <label className="lc-mono" style={{ display:'flex', alignItems:'center', gap:8, fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'#5C5A55', cursor:'pointer' }}>
              <input type="checkbox" style={{ accentColor:'#2F7DF6' }}/> Keep me signed in
            </label>
            <button onClick={handleForgotPassword} disabled={resetLoading}
              className="lc-mono" style={{ fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:resetSent?'#12B76A':'#2F7DF6', background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:0 }}>
              {resetLoading?'Sending…':resetSent?'✓ Email sent!':'Forgot password?'}
            </button>
          </div>

          {error && (
            <div style={{ padding:'10px 14px', background:'rgba(231,76,60,0.06)', border:'1px solid rgba(231,76,60,0.35)', fontSize:12, color:'#C0392B', marginBottom:14 }}>
              {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            className="portal-submit lc-mono" style={{ width:'100%', padding:'15px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, background: loading?'rgba(8,9,11,0.4)':'#08090B', color:'#F2EFE6', fontWeight:700, fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', border:'none', cursor:loading?'not-allowed':'pointer', marginBottom:'1.25rem', transition:'background 0.2s, color 0.2s' }}>
            {loading?'Signing in…':'Sign in to portal'}
            <span style={{ fontSize:13, fontWeight:400 }}>→</span>
          </button>

          <div style={{ textAlign:'center', fontSize:12, color:'#5C5A55' }}>
            Not a partner yet? <Link href="/apply" style={{ color:'#2F7DF6', fontWeight:600, textDecoration:'none' }}>Apply for access</Link>
          </div>

          <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'#8A8780', marginTop:'1.75rem', paddingTop:'1.25rem', borderTop:'1px dashed rgba(8,9,11,0.24)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secured connection · Data encrypted
          </div>
        </div>
      </div>
    </div>
  )
}
