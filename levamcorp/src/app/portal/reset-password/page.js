'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

      {/* LEFT */}
      <div style={{ background: '#0d0d0d', padding: '3rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
            <div style={{ position: 'absolute', left: 10, top: 0, width: 4, height: 40, background: '#333' }} />
            <div style={{ position: 'absolute', left: 10, bottom: 0, width: 28, height: 4, background: '#333' }} />
            <div style={{ position: 'absolute', left: 18, bottom: 10, width: 18, height: 4, background: '#2d7dd2' }} />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Levam</div>
            <div style={{ fontSize: 10, letterSpacing: '0.38em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 5 }}>Corp · Distributors</div>
          </div>
        </Link>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '1rem', fontWeight: 600 }}>Password reset</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Create a new password</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8 }}>Choose a strong password to secure your partner account.</p>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>© 2025 Levam Corp Distributors<br />6315 NW 99th Ave, Doral, FL 33178</div>
      </div>

      {/* RIGHT */}
      <div style={{ background: '#fff', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, background: 'rgba(42,125,79,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 32 }}>✅</div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: '0.75rem' }}>Password updated!</h3>
              <p style={{ fontSize: 14, color: '#aaa', marginBottom: '2rem', lineHeight: 1.7 }}>Your password has been changed successfully. You can now sign in with your new password.</p>
              <Link href="/portal" style={{ display: 'block', padding: 14, background: '#2d7dd2', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 16px rgba(45,125,210,0.35)' }}>
                Sign in to portal
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>New password</h3>
                <p style={{ fontSize: 13, color: '#aaa' }}>Enter and confirm your new password below.</p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>New password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                  style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 3, fontSize: 14, padding: '12px 14px', outline: 'none', fontFamily: 'inherit', color: '#111', background: '#fafafa', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#444', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Confirm password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password"
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 3, fontSize: 14, padding: '12px 14px', outline: 'none', fontFamily: 'inherit', color: '#111', background: '#fafafa', boxSizing: 'border-box' }} />
              </div>

              {error && <div style={{ fontSize: 12, color: '#c0392b', marginBottom: '1rem', padding: '10px 14px', background: '#fff5f5', border: '0.5px solid rgba(192,57,43,0.2)', borderRadius: 3 }}>{error}</div>}

              <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: 15, background: loading ? '#aaa' : '#2d7dd2', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 3, boxShadow: '0 4px 16px rgba(45,125,210,0.35)', marginBottom: '1rem' }}>
                {loading ? 'Updating...' : 'Update password'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <Link href="/portal" style={{ fontSize: 12, color: '#aaa', textDecoration: 'none' }}>← Back to login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
