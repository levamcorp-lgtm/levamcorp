'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) { setError('Please fill in all required fields.'); return }
    setLoading(true); setError('')
    try {
      await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setSent(true)
    } catch (e) { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 4,
    fontSize: 14, padding: '12px 14px', outline: 'none',
    fontFamily: 'inherit', color: '#111', background: '#fafafa',
    boxSizing: 'border-box'
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 3rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 34, height: 34 }}>
            <div style={{ position: 'absolute', left: 7, top: 0, width: 2.5, height: 27, background: '#444' }} />
            <div style={{ position: 'absolute', left: 7, bottom: 0, width: 20, height: 2.5, background: '#444' }} />
            <div style={{ position: 'absolute', left: 12, bottom: 7, width: 12, height: 2.5, background: '#2d7dd2' }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Levam</div>
            <div style={{ fontSize: 9, letterSpacing: '0.32em', color: '#fff', opacity: 0.7, textTransform: 'uppercase', marginTop: 3 }}>Corp · Distributors</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="/#catalog" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Products</a>
          <a href="/#how" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>How it works</a>
          <a href="/#about" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>About us</a>
          <Link href="/contact" style={{ fontSize: 13, fontWeight: 500, color: '#fff', textDecoration: 'none' }}>Contact us</Link>
          <Link href="/portal" style={{ fontSize: 12, fontWeight: 600, padding: '9px 22px', border: '0.5px solid #2d7dd2', background: 'rgba(45,125,210,0.15)', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none' }}>Client portal ↗</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 60%, #0d1a2e 100%)', padding: '4rem 3rem 3rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 10 }}>Get in touch</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Contact us</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
            Have questions about becoming a partner or need help with your account? We're here to help.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '4rem', alignItems: 'start' }}>

        {/* LEFT — Company info */}
        <div>
          {/* Logo card */}
          <div style={{ background: '#111', borderRadius: 8, padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                <div style={{ position: 'absolute', left: 10, top: 0, width: 4, height: 38, background: '#333' }} />
                <div style={{ position: 'absolute', left: 10, bottom: 0, width: 26, height: 4, background: '#333' }} />
                <div style={{ position: 'absolute', left: 16, bottom: 10, width: 16, height: 4, background: '#2d7dd2' }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Levam</div>
                <div style={{ fontSize: 9, letterSpacing: '0.35em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 4 }}>Corp · Distributors</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: 0 }}>
              B2B wholesale distribution of consumer electronics, home and kitchen appliances — exclusively for verified distributor partners.
            </p>
          </div>

          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '📍', label: 'Address', value: '6315 NW 99th Ave\nDoral, FL 33178' },
              { icon: '📧', label: 'Email', value: 'partners@levamcorp.com' },
              { icon: '📞', label: 'Phone', value: '(786) 878-4122\n(786) 546-9476' },
              { icon: '🌐', label: 'Website', value: 'levamcorp.com' },
              { icon: '⏰', label: 'Hours', value: 'Monday – Friday\n9:00 AM – 6:00 PM ET' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 14, padding: '1rem 1.25rem', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6 }}>
                <div style={{ width: 38, height: 38, background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 9, color: '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: '#333', fontWeight: 500, lineHeight: 1.7, whiteSpace: 'pre-line' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Apply CTA */}
          <div style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #0d0d0d, #1a1a2e)', borderRadius: 6, padding: '1.5rem', border: '0.5px solid rgba(45,125,210,0.2)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Ready to become a partner?</div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '1rem' }}>Apply to join our exclusive distributor network and get access to wholesale pricing.</p>
            <Link href="/apply" style={{ display: 'inline-block', padding: '10px 22px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', boxShadow: '0 4px 14px rgba(45,125,210,0.35)' }}>Apply now →</Link>
          </div>
        </div>

        {/* RIGHT — Contact form */}
        <div>
          {sent ? (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '3rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <div style={{ width: 72, height: 72, background: 'rgba(42,125,79,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 32 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: '0.75rem' }}>Message sent!</h2>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: '2rem' }}>
                Thank you, <strong style={{ color: '#333' }}>{form.name}</strong>. Our team will get back to you at <strong style={{ color: '#333' }}>{form.email}</strong> within 1–2 business days.
              </p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', company: '', phone: '', message: '' }) }} style={{ padding: '11px 28px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3 }}>
                Send another message
              </button>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
              <div style={{ background: 'linear-gradient(135deg, #0d0d0d, #1a1a2e)', padding: '1.5rem 2rem' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 6 }}>Send us a message</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>How can we help you?</h2>
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#222', display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Full name <span style={{ color: '#2d7dd2' }}>*</span></label>
                    <input style={inputStyle} value={form.name} onChange={update('name')} placeholder="Your full name" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#222', display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email address <span style={{ color: '#2d7dd2' }}>*</span></label>
                    <input style={inputStyle} type="email" value={form.email} onChange={update('email')} placeholder="you@company.com" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#222', display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Company name</label>
                    <input style={inputStyle} value={form.company} onChange={update('company')} placeholder="Your company" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#222', display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Phone number</label>
                    <input style={inputStyle} type="tel" value={form.phone} onChange={update('phone')} placeholder="+1 (305) 000-0000" />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#222', display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Message <span style={{ color: '#2d7dd2' }}>*</span></label>
                  <textarea style={{ ...inputStyle, height: 130, resize: 'vertical' }} value={form.message} onChange={update('message')} placeholder="Tell us how we can help you..." />
                </div>

                {error && <div style={{ fontSize: 13, color: '#c0392b', marginBottom: '1rem', padding: '10px 14px', background: '#fff5f5', border: '0.5px solid rgba(192,57,43,0.2)', borderRadius: 4 }}>{error}</div>}

                <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 15, background: loading ? '#aaa' : '#2d7dd2', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 4, boxShadow: '0 4px 16px rgba(45,125,210,0.35)' }}>
                  {loading ? 'Sending...' : 'Send message →'}
                </button>
                <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: '0.75rem' }}>We respond within 1–2 business days</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          © 2025 Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['Privacy','Terms','Contact us'].map(link => (
            <a key={link} href={link === 'Contact us' ? '/contact' : '#'} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{link}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
