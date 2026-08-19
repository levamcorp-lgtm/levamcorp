'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

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
      const { error: err } = await sb.auth.signInWithPassword({ email, password })
      if (err) throw err
      window.location.href = '/portal/dashboard'
    } catch { setError('Invalid credentials. Please try again.') }
    finally { setLoading(false) }
  }

  const eyeIcon = showPass
    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

  return (
    <div style={{ minHeight:'100vh', background:'#060810', fontFamily:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif', display:'grid', gridTemplateColumns:'1fr 1fr' }} className="portal-grid">
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDot { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: rgba(14,165,233,0.5) !important; background: rgba(14,165,233,0.04) !important; outline: none; }
        @media(max-width:768px) { .portal-grid { grid-template-columns:1fr !important; } .portal-left { display:none !important; } }
      `}</style>

      {/* ── LEFT PANEL ────────────────────────────────────────────────── */}
      <div className="portal-left" style={{ position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'3rem', background:'rgba(6,8,16,0.8)' }}>

        {/* Dot grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(14,165,233,0.12) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }}/>
        {/* Blue glow */}
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'70%', height:'70%', background:'radial-gradient(circle,rgba(14,165,233,0.07) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-10%', right:'-10%', width:'50%', height:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)', pointerEvents:'none' }}/>
        {/* Border right */}
        <div style={{ position:'absolute', right:0, top:0, bottom:0, width:1, background:'linear-gradient(180deg,transparent,rgba(14,165,233,0.2),transparent)' }}/>

        {/* LOGO */}
        <div style={{ position:'relative', zIndex:1 }}>
          <Link href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, border:'1.5px solid rgba(14,165,233,0.4)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(14,165,233,0.06)' }}>
              <div style={{ width:10, height:10, background:'#0EA5E9', borderRadius:2 }}/>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:900, letterSpacing:'0.2em', color:'#fff', textTransform:'uppercase', lineHeight:1 }}>LEVAM<span style={{ color:'#0EA5E9' }}>CORP</span></div>
              <div style={{ fontSize:7, letterSpacing:'0.22em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', marginTop:2 }}>Distributors · Doral, FL</div>
            </div>
          </Link>
        </div>

        {/* CENTER */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.25em', color:'#0EA5E9', textTransform:'uppercase', marginBottom:14 }}>Partner portal</div>
          <h2 style={{ fontSize:'clamp(28px,3.5vw,42px)', fontWeight:900, color:'#fff', lineHeight:1.1, marginBottom:'1rem', letterSpacing:'-0.02em' }}>
            Your private<br/>
            <span style={{ color:'transparent', backgroundImage:'linear-gradient(90deg,#0EA5E9,#38BDF8,#7DD3FC,#0EA5E9)', backgroundSize:'200% auto', WebkitBackgroundClip:'text', backgroundClip:'text', animation:'shimmer 4s linear infinite' }}>distribution hub.</span>
          </h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.35)', lineHeight:1.85, marginBottom:'2.5rem', maxWidth:320 }}>
            Access your full catalog, submit orders, generate quotes and invoices — all in one place.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label:'Full product catalog with live pricing' },
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label:'Automatic quote & invoice generation' },
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label:'Real-time availability & dispatch times' },
              { icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, label:'Full order history & tracking' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#0EA5E9', flexShrink:0 }}>
                  {icon}
                </div>
                <span style={{ fontSize:13, color:'rgba(255,255,255,0.5)', fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ fontSize:10, color:'rgba(255,255,255,0.15)', lineHeight:1.7, position:'relative', zIndex:1 }}>
          © {new Date().getFullYear()} Levam Corp Distributors<br/>
          6315 NW 99th Ave, Doral, FL 33178
        </div>
      </div>

      {/* ── RIGHT PANEL — LOGIN FORM ───────────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', padding:'3rem 2.5rem', background:'rgba(8,10,18,0.95)', position:'relative' }}>
        {/* Subtle gradient */}
        <div style={{ position:'absolute', top:0, right:0, width:'60%', height:'40%', background:'radial-gradient(circle at 100% 0%,rgba(14,165,233,0.05),transparent)', pointerEvents:'none' }}/>

        <div style={{ maxWidth:380, width:'100%', margin:'0 auto', position:'relative', animation:'fadeUp 0.5s ease' }}>

          {/* Header */}
          <div style={{ marginBottom:'2.5rem' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', border:'1px solid rgba(14,165,233,0.2)', borderRadius:20, background:'rgba(14,165,233,0.05)', marginBottom:'1rem' }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px #22c55e', animation:'pulseDot 2s infinite' }}/>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:'rgba(255,255,255,0.5)', textTransform:'uppercase' }}>Approved partners only</span>
            </div>
            <h3 style={{ fontSize:'clamp(24px,3vw,32px)', fontWeight:900, color:'#fff', marginBottom:'0.5rem', letterSpacing:'-0.02em' }}>Sign in to your account</h3>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)' }}>
              Don't have access? <Link href="/apply" style={{ color:'#0EA5E9', textDecoration:'none', fontWeight:600 }}>Apply to become a partner →</Link>
            </p>
          </div>

          {/* Email */}
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:6, letterSpacing:'0.12em', textTransform:'uppercase' }}>Email address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&handleLogin()}
              placeholder="you@yourbusiness.com"
              style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, fontSize:13, padding:'12px 14px', color:'#fff', fontFamily:'inherit', boxSizing:'border-box', transition:'all 0.2s' }}/>
          </div>

          {/* Password */}
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:6, letterSpacing:'0.12em', textTransform:'uppercase' }}>Password</label>
            <div style={{ position:'relative' }}>
              <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                placeholder="••••••••••"
                style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, fontSize:13, padding:'12px 44px 12px 14px', color:'#fff', fontFamily:'inherit', boxSizing:'border-box', transition:'all 0.2s' }}/>
              <button type="button" onClick={()=>setShowPass(s=>!s)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', padding:0, display:'flex' }}>
                {eyeIcon}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(255,255,255,0.35)', cursor:'pointer' }}>
              <input type="checkbox" style={{ accentColor:'#0EA5E9' }}/> Keep me signed in
            </label>
            <button onClick={handleForgotPassword} disabled={resetLoading}
              style={{ fontSize:12, color:resetSent?'#22c55e':'#0EA5E9', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, padding:0 }}>
              {resetLoading?'Sending…':resetSent?'✓ Email sent!':'Forgot password?'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding:'10px 14px', background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.25)', borderRadius:6, fontSize:12, color:'#e74c3c', marginBottom:'1rem' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleLogin} disabled={loading}
            style={{ width:'100%', padding:'13px', background:loading?'rgba(255,255,255,0.06)':'linear-gradient(135deg,#0EA5E9,#0284C7)', color:'#fff', fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', border:'none', borderRadius:6, cursor:loading?'not-allowed':'pointer', fontFamily:'inherit', marginBottom:'1.25rem', boxShadow:loading?'none':'0 4px 16px rgba(14,165,233,0.35)', transition:'all 0.2s' }}>
            {loading?'Signing in…':'Sign in to portal'}
          </button>

          {/* Apply link */}
          <div style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.25)' }}>
            Not a partner yet? <Link href="/apply" style={{ color:'#0EA5E9', textDecoration:'none', fontWeight:600 }}>Apply for access</Link>
          </div>

          {/* Security note */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:10, color:'rgba(255,255,255,0.15)', marginTop:'2rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secured connection · Approved partners only · Data encrypted
          </div>
        </div>
      </div>
    </div>
  )
}
