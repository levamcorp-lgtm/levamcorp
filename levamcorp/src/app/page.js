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

      {/* LEFT — dark side */}
      <div style={{ background: '#0d0d0d', padding: '3rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* LOGO — big and imposing */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '3rem' }}>
            <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
              <div style={{ position: 'absolute', left: 9, top: 0, width: 3, height: 34, background: '#333' }} />
              <div style={{ position: 'absolute', left: 9, bottom: 0, width: 24, height: 3, background: '#333' }} />
              <div style={{ position: 'absolute', left: 15, bottom: 9, width: 15, height: 3, background: '#2d7dd2' }} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Levam</div>
              <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 4 }}>Corp · Distributors</div>
            </div>
          </div>

          <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '1rem', fontWeight: 600 }}>Partner portal</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>Your private distribution hub</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 340 }}>Access your full catalog, submit orders, generate quotes and invoices — all in one place.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              [<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, 'Full product catalog with live pricing'],
              [<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, 'Automatic quote & invoice generation'],
              [<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, 'Real-time availability & dispatch times'],
              [<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, 'Full order history & tracking'],
            ].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
                {icon} {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
          © 2025 Levam Corp Distributors<br />6315 NW 99th Ave, Doral, FL 33178
        </div>
      </div>

      {/* RIGHT — login form */}
      <div style={{ background: '#fff', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 700, marginBottom: '0.75rem' }}>Approved partners only</div>
            <h3 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Sign in to your account</h3>
            <p style={{ fontSize: 13, color: '#aaa' }}>Don't have access yet? <Link href="/apply" style={{ color: '#2d7dd2', textDecoration: 'none', fontWeight: 600 }}>Apply to become a partner →</Link></p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourbusiness.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 3, fontSize: 14, padding: '11px 14px', outline: 'none', fontFamily: 'inherit', color: '#111', background: '#fafafa' }} />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 3, fontSize: 14, padding: '11px 14px', outline: 'none', fontFamily: 'inherit', color: '#111', background: '#fafafa' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888', cursor: 'pointer' }}>
              <input type="checkbox" style={{ accentColor: '#2d7dd2' }} /> Keep me signed in
            </label>
            <a href="#" style={{ fontSize: 12, color: '#2d7dd2', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
          </div>

          {error && <div style={{ fontSize: 12, color: '#c0392b', marginBottom: '1rem', padding: '10px 14px', background: '#fff5f5', border: '0.5px solid rgba(192,57,43,0.2)', borderRadius: 3 }}>{error}</div>}

          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 14, background: loading ? '#aaa' : '#2d7dd2', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 3, marginBottom: '1.25rem', boxShadow: '0 4px 14px rgba(45,125,210,0.35)' }}>
            {loading ? 'Signing in...' : 'Sign in to portal'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 13, color: '#aaa' }}>
            Not a partner yet? <Link href="/apply" style={{ color: '#2d7dd2', textDecoration: 'none', fontWeight: 600 }}>Apply for access</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 10, color: '#ccc', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f0f0f0' }}>
            🔒 Secured connection · Approved partners only · Data encrypted
          </div>
        </div>
      </div>
    </div>
  )
}
