'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase sends token_hash and type in the URL
    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type = params.get('type')

    if (tokenHash && type === 'recovery') {
      const supabase = createClient()
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error }) => {
          if (error) setError('This reset link has expired or is invalid. Please request a new one.')
          else setReady(true)
        })
    } else {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [])

  const handleReset = async () => {
    if (!password || !confirm) { setError('Please fill in both fields.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
    } catch (e) { setError('Could not update password. Please request a new reset link.') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', color:'#08090B', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif', display:'grid', gridTemplateColumns:'1fr 1fr' }} className="portal-grid">
      <style>{`
        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }
        .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
        input::placeholder { color: rgba(8,9,11,0.3); }
        input:focus { border-color: rgba(47,125,246,0.6) !important; }
        .reset-submit:hover:not(:disabled) { background:#2F7DF6 !important; color:#08090B !important; }
        @media(max-width:768px) { .portal-grid { grid-template-columns:1fr !important; } .portal-left { display:none !important; } }
      `}</style>

      {/* LEFT */}
      <div className="portal-left" style={{ background: '#08090B', color:'#F5F1E8', padding: 'clamp(32px,4vw,56px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, border:'1.5px solid rgba(245,241,232,0.35)', borderLeft:'3px solid #2F7DF6', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width:16, height:'auto' }}/>
          </div>
          <div>
            <div className="lc-display" style={{ fontSize:14, fontWeight:700, letterSpacing:'0.16em', color:'#F5F1E8', textTransform:'uppercase', lineHeight:1 }}>LEVAM<span style={{ color:'#2F7DF6' }}>CORP</span></div>
            <div className="lc-mono" style={{ fontSize:7, letterSpacing:'0.22em', color:'#6F6D67', textTransform:'uppercase', marginTop:2 }}>Distributors · Doral, FL</div>
          </div>
        </Link>

        <div>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.1rem', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8A8780' }}>
            <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
            Security · Form 09b
          </div>
          <h2 className="lc-display" style={{ fontSize:'clamp(28px,3.5vw,40px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1.1, margin:'0 0 1rem', color:'#F5F2E9' }}>Create a new password<span style={{ color:'#2F7DF6' }}>.</span></h2>
          <p style={{ fontSize:14, color:'#9A968E', lineHeight:1.75 }}>Choose a strong password to keep your partner account secure.</p>
        </div>

        <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67', lineHeight:1.8 }}>© {new Date().getFullYear()} Levam Corp Distributors<br />6315 NW 99th Ave, Doral, FL 33178</div>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems:'center', justifyContent:'center', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 420, width: '100%', background:'#F2EFE6', color:'#08090B', padding:'clamp(26px,3.6vw,40px)' }}>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, background: 'rgba(18,183,106,0.1)', border:'1px solid rgba(18,183,106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 26 }}>✅</div>
              <h3 className="lc-display" style={{ fontSize: 24, fontWeight: 400, letterSpacing:'-0.02em', color: '#08090B', marginBottom: '0.75rem' }}>Password updated<span style={{ color:'#2F7DF6' }}>.</span></h3>
              <p style={{ fontSize: 14, color: '#5C5A55', marginBottom: '2rem', lineHeight: 1.7 }}>Your password has been changed successfully. You can now sign in with your new password.</p>
              <Link href="/portal" className="lc-mono" style={{ display: 'flex', alignItems:'center', justifyContent:'space-between', padding: 14, background: '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none' }}>
                <span>Sign in to portal</span><span>→</span>
              </Link>
            </div>
          ) : error && !ready ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, background: 'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 26 }}>⚠️</div>
              <h3 className="lc-display" style={{ fontSize: 22, fontWeight: 400, letterSpacing:'-0.02em', color: '#08090B', marginBottom: '0.75rem' }}>Link expired<span style={{ color:'#2F7DF6' }}>.</span></h3>
              <p style={{ fontSize: 14, color: '#5C5A55', marginBottom: '2rem', lineHeight: 1.7 }}>{error}</p>
              <Link href="/portal" className="lc-mono" style={{ display: 'block', padding: 14, background: '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>
                Back to login
              </Link>
            </div>
          ) : !ready ? (
            <div className="lc-mono" style={{ textAlign: 'center', color: '#8A8780', fontSize: 11, letterSpacing:'0.1em', textTransform:'uppercase' }}>Verifying link…</div>
          ) : (
            <>
              <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, paddingBottom:12, borderBottom:'2px solid #08090B', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
                <span>Reset slip</span>
                <span>Secured connection</span>
              </div>
              <h3 className="lc-display" style={{ fontSize:'clamp(22px,2.8vw,30px)', fontWeight:400, letterSpacing:'-0.03em', lineHeight:1.1, margin:'clamp(18px,2.6vh,24px) 0 8px', color:'#08090B' }}>
                New password<span style={{ color:'#2F7DF6' }}>.</span>
              </h3>
              <p style={{ fontSize: 13, color: '#5C5A55', margin:'0 0 clamp(20px,2.8vh,28px)' }}>Enter and confirm your new password below.</p>

              <div style={{ display:'grid', gap:1, background:'rgba(8,9,11,0.16)', border:'1px solid #08090B' }}>
                <label style={{ display:'grid', gridTemplateColumns:'clamp(78px,9vw,110px) 1fr', alignItems:'center', background:'#F2EFE6' }}>
                  <span className="lc-mono" style={{ padding:'0 12px', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64' }}>New pass.</span>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                    className="lc-mono" style={{ border:0, borderLeft:'1px solid rgba(8,9,11,0.16)', background:'transparent', padding:'13px 12px', fontSize:12, letterSpacing:'0.04em', color:'#08090B', width:'100%', boxSizing:'border-box' }}/>
                </label>
                <label style={{ display:'grid', gridTemplateColumns:'clamp(78px,9vw,110px) 1fr', alignItems:'center', background:'#F2EFE6' }}>
                  <span className="lc-mono" style={{ padding:'0 12px', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64' }}>Confirm</span>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password"
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                    className="lc-mono" style={{ border:0, borderLeft:'1px solid rgba(8,9,11,0.16)', background:'transparent', padding:'13px 12px', fontSize:12, letterSpacing:'0.04em', color:'#08090B', width:'100%', boxSizing:'border-box' }}/>
                </label>
              </div>

              {error && <div style={{ fontSize: 12, color: '#C0392B', marginTop: 14, padding: '10px 14px', background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.35)' }}>{error}</div>}

              <button onClick={handleReset} disabled={loading} className="reset-submit lc-mono" style={{ width: '100%', padding: '15px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', background: loading ? 'rgba(8,9,11,0.4)' : '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 14, marginBottom: '1.25rem', transition:'background 0.2s, color 0.2s' }}>
                <span>{loading ? 'Updating…' : 'Update password'}</span>
                {!loading && <span style={{ fontSize:13, fontWeight:400 }}>→</span>}
              </button>

              <div style={{ textAlign: 'center' }}>
                <Link href="/portal" style={{ fontSize: 12, color: '#2F7DF6', fontWeight:600, textDecoration: 'none' }}>← Back to login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
