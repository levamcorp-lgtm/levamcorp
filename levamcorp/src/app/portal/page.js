'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

function seededBars(seed, count) {
  let s = seed
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  return Array.from({ length: count }, () => {
    const r = rnd()
    return { grow: r > 0.82 ? 3 : r > 0.5 ? 2 : 1, tall: r > 0.94 }
  })
}
const SLIP_BARS = seededBars(30411, 60)

const TAGS = [
  { code:'SKU · 7DF6', label:'Live pricing',  left:'5%',  top:'22%', w:130, z:-250, ry:24,  rz:-7, dur:19, amp:20 },
  { code:'ETA · B705', label:'48 h dispatch', left:'72%', top:'13%', w:124, z:-350, ry:-26, rz:6,  dur:23, amp:24 },
  { code:'PRT · C41D', label:'Portal access', left:'11%', top:'74%', w:136, z:-170, ry:15,  rz:5,  dur:27, amp:18 },
  { code:'ORG · 2F19', label:'Doral · FL',    left:'80%', top:'70%', w:122, z:-440, ry:-30, rz:-8, dur:31, amp:26 },
]

const PERKS = [
  { n:'01', label:'Full product catalog with live pricing', mark:'Real figures' },
  { n:'02', label:'Automatic quote & invoice generation',   mark:'Instant' },
  { n:'03', label:'Real-time availability & dispatch',      mark:'48 h avg' },
  { n:'04', label:'Full order history & tracking',          mark:'Always on' },
]

// Drifting 3D tag backdrop — isolated in its own component so its ~60fps
// animation state doesn't re-render the sign-in form on every frame.
function LoginBackdrop() {
  const [frame, setFrame] = useState({ t: 0, mx: 0, my: 0 })
  const raw = useRef({ x: 0, y: 0 })
  const smooth = useRef({ mx: 0, my: 0 })

  useEffect(() => {
    const t0 = performance.now()
    const onMove = (e) => {
      raw.current.x = e.clientX / (window.innerWidth || 1) - 0.5
      raw.current.y = e.clientY / (window.innerHeight || 1) - 0.5
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    let raf
    const loop = () => {
      const t = (performance.now() - t0) / 1000
      smooth.current.mx += (raw.current.x - smooth.current.mx) * 0.06
      smooth.current.my += (raw.current.y - smooth.current.my) * 0.06
      setFrame({ t, mx: smooth.current.mx, my: smooth.current.my })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  const { t, mx, my } = frame
  const tags = TAGS.map((d, i) => {
    const ph = (t / d.dur) * Math.PI * 2 + i
    const bob = Math.sin(ph) * d.amp
    const sway = Math.cos(ph * 0.7) * (d.amp * 0.5)
    const wob = Math.sin(ph * 0.9) * 5
    const far = Math.min(1, -d.z / 440)
    return {
      ...d,
      index: '0' + (i + 1),
      transform: `translate3d(${sway.toFixed(1)}px,${bob.toFixed(1)}px,${d.z}px) rotateY(${(d.ry + wob).toFixed(1)}deg) rotateZ(${d.rz}deg)`,
      opacity: (0.8 - far * 0.48).toFixed(2),
      blur: far > 0.55 ? `blur(${(far * 1.6).toFixed(1)}px)` : 'none',
    }
  })
  const floorScroll = ((t * 14) % 120).toFixed(1) + 'px'
  const px = (-mx * 30).toFixed(1) + 'px'
  const py = (-my * 18).toFixed(1) + 'px'

  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', perspective:900, perspectiveOrigin:'50% 44%' }}>
      <div style={{ position:'absolute', inset:'-24%', transform:`rotateX(73deg) translateY(${floorScroll}) translateZ(-200px)` }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(to right, rgba(242,239,230,.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(242,239,230,.12) 1px, transparent 1px)', backgroundSize:'120px 120px' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at center, #2F7DF6 1.4px, transparent 2px)', backgroundSize:'480px 480px', backgroundPosition:'240px 240px', opacity:0.5 }}/>
      </div>
      <div style={{ position:'absolute', inset:0, transform:`translate3d(${px},${py},0)` }}>
        {tags.map((tag, i) => (
          <div key={i} className="lc-mono" style={{ position:'absolute', left:tag.left, top:tag.top, width:tag.w, transform:tag.transform, opacity:tag.opacity, filter:tag.blur }}>
            <div style={{ border:'1px solid rgba(8,9,11,.85)', background:'rgba(242,239,230,.88)', padding:'8px 10px 9px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, paddingBottom:6, borderBottom:'1px solid rgba(8,9,11,.2)', fontSize:7.5, letterSpacing:'.2em', textTransform:'uppercase', color:'#5c5a55' }}>
                <span>{tag.code}</span><span>{tag.index}</span>
              </div>
              <div style={{ paddingTop:7, fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', color:'#08090b' }}>{tag.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(110% 74% at 50% 46%, rgba(8,9,11,.42) 14%, rgba(8,9,11,.95) 100%)' }}/>
    </div>
  )
}

export default function PortalPage() {
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [resetSent,    setResetSent]    = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [showPass,     setShowPass]     = useState(false)
  const [remember,     setRemember]     = useState(false)

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

  const hasEmail = /\S+@\S+\.\S+/.test(email)
  const hasPw = password.length >= 6
  const ready = hasEmail && hasPw
  const filled = (hasEmail ? 1 : 0) + (hasPw ? 1 : 0)
  const clearance = ready ? 'Ready to board' : filled === 1 ? '1 of 2 fields' : 'Approved partners only'
  const stubStatus = loading ? 'Validated · opening portal' : ready ? 'Slip complete · ready' : 'Awaiting credentials'
  const statusLine = loading ? 'Signing in…' : ready ? 'Slip complete · press sign in' : 'Not a partner yet?'
  const barCut = Math.round((filled / 2) * SLIP_BARS.length)

  return (
    <div style={{ position:'relative', minHeight:'100vh', boxSizing:'border-box', display:'flex', flexDirection:'column', overflow:'hidden', background:'#08090B', color:'#F2EFE6', fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif', padding:'clamp(18px,3.4vh,34px) clamp(16px,4vw,56px) clamp(16px,3vh,28px)' }}>
      <style>{`
        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }
        .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
        input::placeholder { color: rgba(8,9,11,0.3); }
        input:focus { border-color: rgba(47,125,246,0.6) !important; }
        .portal-submit:hover:not(:disabled) { background:#2F7DF6 !important; color:#08090B !important; }
        @media(max-width:860px) { .portal-login-grid { grid-template-columns:1fr !important; } }
      `}</style>

      <LoginBackdrop/>

      {/* TOP BAR */}
      <div className="lc-mono" style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', gap:18, flexWrap:'wrap' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:11, textDecoration:'none' }}>
          <span style={{ width:24, height:24, border:'1px solid rgba(242,239,230,0.55)', borderLeft:'4px solid #2F7DF6', display:'inline-block' }}/>
          <span style={{ fontWeight:700, fontSize:12, letterSpacing:'0.2em', color:'#F2EFE6', textTransform:'uppercase' }}>Levamcorp</span>
        </Link>
        <span style={{ fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73' }}>Access point · Form 09</span>
      </div>

      {/* CENTER */}
      <div style={{ position:'relative', flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(26px,5vh,60px) 0' }}>
        <div style={{ width:'100%', maxWidth:980 }}>

          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:18, flexWrap:'wrap', paddingBottom:'clamp(14px,2.2vh,20px)' }}>
            <h1 className="lc-display" style={{ margin:0, fontSize:'clamp(30px,4.2vw,52px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1, color:'#F5F2E9' }}>
              Your private distribution hub<span style={{ color:'#2F7DF6' }}>.</span>
            </h1>
            <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', textAlign:'right', lineHeight:1.9 }}>
              Partner portal<br/>Doral · FL 33178
            </div>
          </div>

          <div className="portal-login-grid" style={{ display:'grid', gridTemplateColumns:'1.45fr 1fr', boxShadow:'0 42px 90px -40px rgba(0,0,0,0.9)' }}>

            {/* SIGN-IN SLIP */}
            <div style={{ background:'#F2EFE6', color:'#08090B', padding:'clamp(20px,3vh,30px) clamp(20px,3vw,34px) clamp(20px,3vh,28px)' }}>
              <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', paddingBottom:12, borderBottom:'2px solid #08090B', fontSize:9.5, letterSpacing:'0.22em', textTransform:'uppercase', color:'#5C5A55' }}>
                <span style={{ display:'flex', alignItems:'center', gap:9, color:'#08090B' }}>
                  <span style={{ width:11, height:11, border:'1px solid #08090B', borderLeft:'3px solid #2F7DF6', display:'inline-block' }}/>
                  Sign-in slip · Form 09
                </span>
                <span>{clearance}</span>
              </div>

              <h2 className="lc-display" style={{ margin:'clamp(18px,2.8vh,26px) 0 0', fontSize:'clamp(24px,2.8vw,34px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1.04, color:'#08090B' }}>
                Sign in to your account<span style={{ color:'#2F7DF6' }}>.</span>
              </h2>

              <div style={{ marginTop:'clamp(16px,2.4vh,22px)', border:'1px solid #08090B', display:'grid', gap:1, background:'rgba(8,9,11,0.85)' }}>
                <label style={{ display:'grid', gridTemplateColumns:'clamp(76px,9vw,100px) 1fr', alignItems:'center', background:'#F2EFE6' }}>
                  <span className="lc-mono" style={{ padding:'0 12px', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64' }}>Email</span>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                    placeholder="you@yourbusiness.com"
                    className="lc-mono" style={{ boxSizing:'border-box', width:'100%', border:0, borderLeft:'1px solid rgba(8,9,11,0.28)', background:'transparent', padding:'15px 12px', fontSize:12.5, letterSpacing:'0.04em', color:'#08090B' }}/>
                </label>
                <label style={{ display:'grid', gridTemplateColumns:'clamp(76px,9vw,100px) 1fr auto', alignItems:'center', background:'#F2EFE6' }}>
                  <span className="lc-mono" style={{ padding:'0 12px', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64' }}>Password</span>
                  <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&handleLogin()}
                    placeholder="••••••••••"
                    className="lc-mono" style={{ boxSizing:'border-box', width:'100%', border:0, borderLeft:'1px solid rgba(8,9,11,0.28)', background:'transparent', padding:'15px 12px', fontSize:12.5, letterSpacing:'0.12em', color:'#08090B' }}/>
                  <button type="button" onClick={()=>setShowPass(s=>!s)}
                    className="lc-mono" style={{ border:0, borderLeft:'1px solid rgba(8,9,11,0.16)', cursor:'pointer', background:'transparent', padding:'15px 13px', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6D6A64' }}>
                    {showPass?'Hide':'Show'}
                  </button>
                </label>
              </div>

              <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', paddingTop:13 }}>
                <button type="button" onClick={()=>setRemember(r=>!r)}
                  style={{ display:'flex', alignItems:'center', gap:9, border:0, cursor:'pointer', background:'transparent', padding:0, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6D6A64' }}>
                  <span style={{ display:'block', width:13, height:13, border:'1px solid #08090B', background: remember?'#2F7DF6':'transparent' }}/>
                  Keep me signed in
                </button>
                <button onClick={handleForgotPassword} disabled={resetLoading}
                  style={{ fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color: resetSent?'#12B76A':'#2F7DF6', background:'none', border:'none', cursor:'pointer', fontWeight:700, padding:0 }}>
                  {resetLoading?'Sending…':resetSent?'✓ Email sent!':'Forgot password?'}
                </button>
              </div>

              {error && (
                <div style={{ marginTop:14, padding:'10px 14px', background:'rgba(231,76,60,0.06)', border:'1px solid rgba(231,76,60,0.35)', fontSize:12, color:'#C0392B' }}>
                  {error}
                </div>
              )}

              <button onClick={handleLogin} disabled={loading}
                className="portal-submit lc-mono" style={{ boxSizing:'border-box', width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, border:0, cursor: loading?'not-allowed':'pointer', marginTop:'clamp(16px,2.4vh,20px)', padding:18, background: loading?'rgba(8,9,11,0.4)':'#08090B', color:'#F2EFE6', fontWeight:700, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', transition:'background 0.2s, color 0.2s' }}>
                {loading?'Signing in…':'Sign in to portal'}
                <span style={{ fontSize:13, fontWeight:400 }}>→</span>
              </button>

              <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', paddingTop:14, marginTop:14, borderTop:'1px dashed rgba(8,9,11,0.28)', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6D6A64' }}>
                <span>{statusLine}</span>
                <Link href="/apply" style={{ color:'#08090B', borderBottom:'1px solid #2F7DF6', paddingBottom:1, textDecoration:'none' }}>Apply for access →</Link>
              </div>
            </div>

            {/* PARTNER STUB */}
            <div style={{ position:'relative', background:'#2F7DF6', color:'#08090B', padding:'clamp(20px,3vh,30px) clamp(18px,2.4vw,26px) clamp(18px,2.6vh,24px)' }}>
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width:1, backgroundImage:'repeating-linear-gradient(to bottom, rgba(8,9,11,.5) 0 5px, rgba(8,9,11,0) 5px 12px)' }}/>
              <div style={{ position:'absolute', left:-11, top:-11, width:22, height:22, borderRadius:'50%', background:'#08090B' }}/>
              <div style={{ position:'absolute', left:-11, bottom:-11, width:22, height:22, borderRadius:'50%', background:'#08090B' }}/>

              <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, paddingBottom:11, borderBottom:'2px solid #08090B', fontSize:9, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase' }}>
                <span>Partner stub</span>
                <span>Seq · 09</span>
              </div>

              <div style={{ padding:'clamp(18px,2.8vh,26px) 0 clamp(16px,2.4vh,22px)' }}>
                <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', opacity:0.72 }}>Unlocked inside</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:3, marginTop:8 }}>
                  <span style={{ fontSize:'clamp(46px,6vw,68px)', fontWeight:400, letterSpacing:'-0.055em', lineHeight:0.84, fontVariantNumeric:'tabular-nums' }}>500</span>
                  <span className="lc-mono" style={{ fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', paddingBottom:8 }}>+ skus</span>
                </div>
              </div>

              <div style={{ display:'grid', gap:1, background:'rgba(8,9,11,0.4)' }}>
                {PERKS.map(p => (
                  <div key={p.n} style={{ display:'grid', gridTemplateColumns:'26px 1fr', gap:10, alignItems:'baseline', background:'#2F7DF6', padding:'10px 2px 11px' }}>
                    <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.14em', opacity:0.7 }}>{p.n}</span>
                    <span>
                      <span style={{ display:'block', fontSize:13.5, letterSpacing:'-0.01em', lineHeight:1.32 }}>{p.label}</span>
                      <span className="lc-mono" style={{ display:'block', marginTop:4, fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', opacity:0.72 }}>{p.mark}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:26, marginTop:'clamp(16px,2.4vh,22px)' }}>
                {SLIP_BARS.map((b,i) => (
                  <div key={i} style={{ flex:`${b.grow} 1 0`, minWidth:1, height: b.tall?'22px':'15px', background:'#08090B', opacity: i<barCut?1:0.3 }}/>
                ))}
              </div>
              <div className="lc-mono" style={{ paddingTop:8, fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', opacity:0.8 }}>{stubStatus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="lc-mono" style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', paddingTop:'clamp(14px,2.2vh,20px)', borderTop:'1px solid rgba(242,239,230,0.16)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5F5D58' }}>
        <span>© {new Date().getFullYear()} Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178</span>
        <span>Secured connection · Data encrypted</span>
      </div>
    </div>
  )
}
