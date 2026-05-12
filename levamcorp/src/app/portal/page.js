'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

export default function PortalPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      window.location.href = '/portal/dashboard'
    } catch (e) { setError('Invalid credentials. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
      <div style={{ background: '#111', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon">
            <div style={{ position: 'absolute', left: 6, top: 0, width: 2, height: 22, background: '#444' }} />
            <div style={{ position: 'absolute', left: 6, bottom: 0, width: 16, height: 2, background: '#444' }} />
            <div className="logo-accent" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.18em', color: '#ccc', textTransform: 'uppercase' }}>Levam</div>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Corp · Distributors</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '1rem' }}>Partner portal</div>
          <h2 style={{ fontSize: 26, fontWeight: 500, color: '#fff', lineHeight: 1.3, marginBottom: '1rem' }}>Your private distribution hub</h2>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>Access your full catalog, submit orders, generate quotes and invoices — all in one place.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[['📋','Full product catalog with live pricing'],['🧾','Automatic quote & invoice generation'],['⏱','Real-time availability & dispatch times'],['📦','Full order history & tracking']].map(([icon,label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#555' }}>
              <span>{icon}</span> {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div className="section-tag">Approved partners only</div>
            <h3 style={{ fontSize: 22, fontWeight: 500, color: '#111', marginBottom: '0.35rem' }}>Sign in to your account</h3>
            <p style={{ fontSize: 12, color: '#aaa' }}>Don't have access yet? <Link href="/apply" style={{ color: '#2d7dd2', textDecoration: 'none' }}>Apply to become a partner →</Link></p>
          </div>

          <div className="field"><label>Email address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourbusiness.com" onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>
          <div className="field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" onKeyDown={e => e.key === 'Enter' && handleLogin()} /></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#aaa', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#2d7dd2' }} /> Keep me signed in
            </label>
            <a href="#" style={{ fontSize: 11, color: '#2d7dd2', textDecoration: 'none' }}>Forgot password?</a>
          </div>

          {error && <div style={{ fontSize: 12, color: '#c0392b', marginBottom: '1rem', padding: '8px 12px', background: '#fff5f5', border: '0.5px solid rgba(192,57,43,0.2)', borderRadius: 2 }}>{error}</div>}

          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 13, background: loading ? '#aaa' : '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 2, marginBottom: '1rem' }}>
            {loading ? 'Signing in...' : 'Sign in to portal'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 12, color: '#aaa' }}>
            Not a partner yet? <Link href="/apply" style={{ color: '#2d7dd2', textDecoration: 'none', fontWeight: 500 }}>Apply for access</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#ccc', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
            🔒 Secured connection · Approved partners only · Data encrypted
          </div>
        </div>
      </div>
    </div>
  )
}
