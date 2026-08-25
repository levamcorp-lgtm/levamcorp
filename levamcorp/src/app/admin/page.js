'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [time, setTime] = useState(null)

  useEffect(() => {
    setTime(new Date())
    const iv = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your credentials.'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      if (!ADMIN_EMAILS.includes(data.user.email)) {
        await supabase.auth.signOut()
        throw new Error('Unauthorized')
      }
      window.location.href = '/admin/dashboard'
    } catch (e) {
      setError('Invalid credentials or unauthorized access.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#05070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",-apple-system,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
        .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.01em; }
        input::placeholder { color: rgba(255,255,255,0.18); }
        input:focus { border-color: rgba(47,125,246,0.5) !important; background: rgba(47,125,246,0.05) !important; outline: none; }
      `}</style>

      {/* Grid + scanline backdrop */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(47,125,246,0.14) 1px, transparent 1px)', backgroundSize: '26px 26px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, background: 'radial-gradient(circle,rgba(47,125,246,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.5 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 120, background: 'linear-gradient(180deg,transparent,rgba(47,125,246,0.05),transparent)', animation: 'scan 7s linear infinite' }} />
      </div>

      <div style={{ width: 400, position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease' }}>

        {/* Status strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: 10 }} className="lc-mono">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(154,172,201,0.5)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#12B76A', boxShadow: '0 0 8px #12B76A', animation: 'pulseDot 2s infinite' }} />
            SYSTEM ONLINE
          </div>
          <div style={{ color: 'rgba(154,172,201,0.5)' }}>
            {time ? time.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, border: '1.5px solid rgba(47,125,246,0.4)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(47,125,246,0.06)' }}>
              <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width: 22, height: 'auto' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="lc-display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>LEVAM<span style={{ color: '#2F7DF6' }}>CORP</span></div>
              <div className="lc-mono" style={{ fontSize: 8, letterSpacing: '0.25em', color: '#2F7DF6', textTransform: 'uppercase', marginTop: 3 }}>Mission Control</div>
            </div>
          </div>
          <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EF4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 14px', borderRadius: 20, display: 'inline-block' }}>
            🔒 Restricted access · Staff only
          </div>
        </div>

        <div style={{ background: 'rgba(17,26,46,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(240,244,255,0.08)', borderRadius: 12, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(47,125,246,0.5),transparent)' }} />

          <h3 className="lc-display" style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>Admin access</h3>
          <p style={{ fontSize: 12, color: 'rgba(154,172,201,0.6)', marginBottom: '1.5rem' }}>Levam Corp internal command panel</p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(154,172,201,0.6)', display: 'block', marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@levamcorp.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, padding: '12px 14px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'all 0.2s' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: 'rgba(154,172,201,0.6)', display: 'block', marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, padding: '12px 14px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'all 0.2s' }} />
          </div>

          {error && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: '1rem', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6 }}>{error}</div>}

          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 13, background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#2F7DF6,#1B5FD1)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 6, boxShadow: loading ? 'none' : '0 4px 20px rgba(47,125,246,0.35)', transition: 'all 0.2s' }}>
            {loading ? 'Authenticating…' : 'Sign in to admin'}
          </button>

          <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 9, color: 'rgba(154,172,201,0.3)', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            ENCRYPTED CONNECTION · LEVAM CORP INTERNAL
          </div>
        </div>
      </div>
    </div>
  )
}
