'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com' // cambia esto a tu email admin

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your credentials.'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      if (data.user.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut()
        throw new Error('Unauthorized')
      }
      window.location.href = '/admin/dashboard'
    } catch (e) {
      setError('Invalid credentials or unauthorized access.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '0.75rem' }}>
            <div style={{ position: 'relative', width: 32, height: 32 }}>
              <div style={{ position: 'absolute', left: 7, top: 0, width: 2, height: 25, background: '#444' }} />
              <div style={{ position: 'absolute', left: 7, bottom: 0, width: 18, height: 2, background: '#444' }} />
              <div style={{ position: 'absolute', left: 11, bottom: 7, width: 11, height: 2, background: '#2d7dd2' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.2em', color: '#ccc', textTransform: 'uppercase' }}>Levam</div>
              <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#2d7dd2', textTransform: 'uppercase' }}>Corp · Admin</div>
            </div>
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#e74c3c', background: 'rgba(231,76,60,0.1)', border: '0.5px solid rgba(231,76,60,0.2)', padding: '4px 14px', borderRadius: 2, display: 'inline-block' }}>
            🔒 Staff only
          </div>
        </div>

        <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '2rem' }}>
          <h3 style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: '0.35rem' }}>Admin access</h3>
          <p style={{ fontSize: 12, color: '#555', marginBottom: '1.5rem' }}>Levam Corp internal panel</p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 4, letterSpacing: '0.04em' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@levamcorp.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 13, padding: '10px 14px', borderRadius: 2, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 10, color: '#555', display: 'block', marginBottom: 4, letterSpacing: '0.04em' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 13, padding: '10px 14px', borderRadius: 2, outline: 'none', fontFamily: 'inherit' }} />
          </div>

          {error && <div style={{ fontSize: 12, color: '#e74c3c', marginBottom: '1rem', padding: '8px 12px', background: 'rgba(231,76,60,0.1)', border: '0.5px solid rgba(231,76,60,0.2)', borderRadius: 2 }}>{error}</div>}

          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 13, background: loading ? '#333' : '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 2 }}>
            {loading ? 'Signing in...' : 'Sign in to admin'}
          </button>
        </div>
      </div>
    </div>
  )
}
