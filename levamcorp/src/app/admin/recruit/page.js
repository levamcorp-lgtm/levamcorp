'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

export default function AdminRecruit() {
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [preview,  setPreview]  = useState(false)
  const [emails,   setEmails]   = useState('')
  const [subject,  setSubject]  = useState('Wholesale partnership opportunity — Levam Corp Distributors')
  const [note,     setNote]     = useState('')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      setLoading(false)
    })
  }, [])

  const parsedEmails = emails.split(/[,\n;]+/).map(e => e.trim()).filter(e => e.includes('@'))

  const send = async () => {
    if (!parsedEmails.length) { alert('Add at least one email'); return }
    if (!window.confirm(`Send recruitment email to ${parsedEmails.length} recipient${parsedEmails.length !== 1 ? 's' : ''}?`)) return
    setSending(true); setResult(null)
    try {
      const res  = await fetch('/api/send-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: parsedEmails, subject, customNote: note }),
      })
      const data = await res.json()
      setResult(data)
    } catch (e) { setResult({ error: e.message }) }
    setSending(false)
  }

  const inp = { width: '100%', background: '#f8f9fa', border: '1px solid #e5e7eb', color: '#111', fontSize: 12, padding: '9px 12px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const lbl = { fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: 5 }

  if (loading) return <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>Loading...</div>

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#111', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(0,0,0,0.08)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Broadcast','/admin/broadcast'],['Offers','/admin/offers'],['Recruit','/admin/recruit']].map(([l,h]) => (
              <Link key={l} href={h} style={{ fontSize: 12, color: l==='Recruit'?'#2a7d4f':'#666', textDecoration: 'none', padding: '4px 14px', borderBottom: l==='Recruit'?'2px solid #2a7d4f':'2px solid transparent', fontWeight: l==='Recruit'?700:400 }}>{l}</Link>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 4 }}>Recruit new partners</div>
            <div style={{ fontSize: 13, color: '#888' }}>Send a professional outreach email to potential clients — explains who we are, what we offer, and invites them to apply.</div>
          </div>

          {/* Email list */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.5rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#2a7d4f', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Recipients</div>
            <label style={lbl}>Email addresses *</label>
            <textarea value={emails} onChange={e => setEmails(e.target.value)} rows={6}
              placeholder={"john@retailstore.com, maria@distributor.com\nsales@company.com\ninfo@reseller.net"}
              style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }}/>
            {parsedEmails.length > 0 && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(42,125,79,0.06)', border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 5, fontSize: 11, color: '#2a7d4f', fontWeight: 600 }}>
                {parsedEmails.length} valid email{parsedEmails.length !== 1 ? 's' : ''} detected
              </div>
            )}
          </div>

          {/* Email settings */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.5rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#2a7d4f', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Email settings</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={lbl}>Subject line</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} style={inp}/>
              </div>
              <div>
                <label style={lbl}>Personal note (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} style={{ ...inp, resize: 'none' }}
                  placeholder="Add a personal note that appears in the email — e.g. 'We came across your business and think there could be a great fit...'"/>
                <div style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>This appears as a highlighted note from your team inside the email</div>
              </div>
            </div>
          </div>

          {/* Email preview */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.5rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#2a7d4f', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Email content preview</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Who we are', 'B2B wholesale distributor based in Doral, FL. Partners with approved businesses to distribute electronics and home appliances from top brands.'],
                ['How it works', '4-step process: Apply → Get approved → Browse catalog → Order & dispatch within 48h.'],
                ['What they get', 'Wholesale pricing, private partner portal, dedicated support, live stock and pricing.'],
                ['Call to action', 'Button linking directly to levamcorp.com/apply'],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: '#fafafa', borderRadius: 6, border: '0.5px solid #f0f0f0' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2a7d4f', marginTop: 5, flexShrink: 0 }}/>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#111', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 78, alignSelf: 'start' }}>

          {/* Summary */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.25rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: '10px', background: '#f0fdf4', border: '1px solid rgba(42,125,79,0.2)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#16a34a' }}>{parsedEmails.length}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>recipients</div>
              </div>
              <div style={{ padding: '10px', background: '#f0f6ff', border: '1px solid rgba(45,125,210,0.2)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2d7dd2', marginTop: 4 }}>Outreach</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>email type</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#888', padding: '8px 12px', background: '#fafafa', borderRadius: 5, lineHeight: 1.6 }}>
              Sent from <strong>partners@levamcorp.com</strong><br/>
              Links to <strong>levamcorp.com/apply</strong>
            </div>
          </div>

          {/* Recipients list */}
          {parsedEmails.length > 0 && (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.25rem' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Will be sent to</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
                {parsedEmails.map(e => (
                  <div key={e} style={{ fontSize: 11, color: '#555', padding: '4px 0', borderBottom: '0.5px solid #f5f5f5' }}>{e}</div>
                ))}
              </div>
            </div>
          )}

          {/* Send */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={send} disabled={sending || !parsedEmails.length}
              style={{ width: '100%', padding: '14px', background: sending || !parsedEmails.length ? '#e5e7eb' : '#2a7d4f', color: sending || !parsedEmails.length ? '#aaa' : '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', borderRadius: 6, cursor: sending || !parsedEmails.length ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: sending || !parsedEmails.length ? 'none' : '0 4px 14px rgba(42,125,79,0.25)' }}>
              {sending ? 'Sending...' : `Send to ${parsedEmails.length} recipient${parsedEmails.length !== 1 ? 's' : ''}`}
            </button>
            {result && (
              <div style={{ padding: '12px 14px', background: result.error ? 'rgba(231,76,60,0.06)' : 'rgba(42,125,79,0.06)', border: `1px solid ${result.error ? 'rgba(231,76,60,0.2)' : 'rgba(42,125,79,0.2)'}`, borderRadius: 6, fontSize: 12, color: result.error ? '#c0392b' : '#2a7d4f', fontWeight: 600, textAlign: 'center' }}>
                {result.error ? `Error: ${result.error}` : `✓ Sent to ${result.sent} recipient${result.sent !== 1 ? 's' : ''}${result.failed > 0 ? ` · ${result.failed} failed` : ''}`}
              </div>
            )}
            <div style={{ fontSize: 10, color: '#ccc', textAlign: 'center' }}>Sent via Resend from partners@levamcorp.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}
