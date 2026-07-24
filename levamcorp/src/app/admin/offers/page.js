'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

export default function AdminOffers() {
  const [products,  setProducts]  = useState([])
  const [clients,   setClients]   = useState([])
  const [selected,  setSelected]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [sendMode,  setSendMode]  = useState('all') // 'all' | 'selected'
  const [selClients,setSelClients]= useState([])
  const [clientSearch, setClientSearch] = useState('')
  const [extraEmails,  setExtraEmails]  = useState('')
  const [search,    setSearch]    = useState('')
  const [preview,   setPreview]   = useState(false)

  const [form, setForm] = useState({
    subject:   '🔥 Exclusive wholesale offer from Levam Corp',
    headline:  'New arrivals — limited stock',
    message:   'we have handpicked these products exclusively for our partners. These deals are available for a limited time, so order early to secure your units.',
    ctaText:   'Browse catalog & place order',
    footer:    'Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com',
  })

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      const [{ data: p }, { data: c }] = await Promise.all([
        sb.from('products').select('*').eq('active', true).order('name'),
        sb.from('clients').select('email, contact_name, business_name'),
      ])
      setProducts(p || [])
      setClients(c || [])
      setLoading(false)
    })
  }, [])

  const toggle  = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selProds = products.filter(p => selected.includes(p.id))
  const visible  = products.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))

  const send = async () => {
    if (!selProds.length)    { alert('Select at least one product'); return }
    if (!form.subject)       { alert('Add a subject line'); return }
    if (!form.headline)      { alert('Add a headline'); return }
    const targetClients = sendMode === 'selected' ? clients.filter(c => selClients.includes(c.email)) : clients
    if (sendMode === 'selected' && !targetClients.length && !extraEmails.trim()) { alert('Select at least one client or add external emails'); return }
    // Parse extra emails
    const parsedExtras = extraEmails.split(',').join('\n').split(';').join('\n').split('\n').map(e => e.trim()).filter(e => e.includes('@')).map(e => ({ email: e, contact_name: '', business_name: '' }))
    const allTargets = [...targetClients, ...parsedExtras]
    if (!window.confirm(`Send this offer to ${allTargets.length} recipient${allTargets.length !== 1 ? 's' : ''}${parsedExtras.length ? ` (including ${parsedExtras.length} external)` : ''}?`)) return
    setSending(true); setResult(null)
    try {
      const res  = await fetch('/api/send-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, products: selProds, targetClients: allTargets }),
      })
      const data = await res.json()
      setResult(data)
    } catch (e) { setResult({ error: e.message }) }
    setSending(false)
  }

  const inp = { width: '100%', background: '#f8f9fa', border: '1px solid #e5e7eb', color: '#111', fontSize: 12, padding: '9px 12px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }

  if (loading) return <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>Loading...</div>

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <style>{`
        .offers-grid { display: grid; grid-template-columns: 1fr; gap: 1.25rem; }
        @media (min-width: 1024px) { .offers-grid { grid-template-columns: 1fr 360px; } }
        .offers-sidebar { display: flex; flex-direction: column; gap: 1rem; }
        @media (min-width: 1024px) { .offers-sidebar { position: sticky; top: 78px; align-self: start; } }
        .admin-nav-scroll { display: flex; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .admin-nav-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 40, overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#111', textTransform: 'uppercase' }}>Levam Admin</div>
          <div className="admin-nav-scroll" style={{ borderLeft: '0.5px solid rgba(0,0,0,0.08)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Broadcast','/admin/broadcast'],['Offers','/admin/offers'],['Recruit','/admin/recruit']].map(([l,h]) => (
              <Link key={l} href={h} style={{ fontSize: 12, color: l==='Offers'?'#2d7dd2':'#666', textDecoration: 'none', padding: '4px 14px', borderBottom: l==='Offers'?'2px solid #2d7dd2':'2px solid transparent', fontWeight: l==='Offers'?700:400 }}>{l}</Link>
            ))}
          </div>
        </div>
        <Link href="/admin/dashboard" style={{ fontSize: 11, color: '#888', textDecoration: 'none', border: '0.5px solid #e5e7eb', padding: '6px 14px', borderRadius: 4 }}>← Back</Link>
      </nav>

      <div className="offers-grid" style={{ padding: '1rem', maxWidth: 1280, margin: '0 auto' }}>

        {/* LEFT — product selector + form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Header */}
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 4 }}>Send featured offer</div>
            <div style={{ fontSize: 13, color: '#888' }}>Select products → customize email → send to all {clients.length} approved clients</div>
          </div>

          {/* Email form */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.5rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Email content</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: 5 }}>Subject line *</label>
                <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} style={inp} placeholder="e.g. 🔥 Exclusive wholesale offer from Levam Corp"/>
              </div>
              <div>
                <label style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: 5 }}>Headline (large text in email) *</label>
                <input value={form.headline} onChange={e => setForm(f => ({...f, headline: e.target.value}))} style={inp} placeholder="e.g. New arrivals — limited stock"/>
              </div>
              <div>
                <label style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: 5 }}>Message body</label>
                <textarea value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} rows={3} style={{ ...inp, resize: 'none' }} placeholder="Message that appears after 'Hi [name],'"/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: 5 }}>Button text</label>
                  <input value={form.ctaText} onChange={e => setForm(f => ({...f, ctaText: e.target.value}))} style={inp} placeholder="Browse catalog & place order"/>
                </div>
                <div>
                  <label style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: 5 }}>Footer note</label>
                  <input value={form.footer} onChange={e => setForm(f => ({...f, footer: e.target.value}))} style={inp} placeholder="Levam Corp · Doral, FL"/>
                </div>
              </div>
            </div>
          </div>

          {/* Product selector */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Select products</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setSelected(visible.map(p => p.id))} style={{ fontSize: 11, padding: '5px 12px', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', border: '0.5px solid rgba(45,125,210,0.2)', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Select all</button>
                {selected.length > 0 && <button onClick={() => setSelected([])} style={{ fontSize: 11, padding: '5px 12px', background: '#f8f9fa', color: '#888', border: '0.5px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>}
              </div>
            </div>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                style={{ ...inp, paddingLeft: 30 }}/>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#ccc' }}>🔍</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 360, overflowY: 'auto' }}>
              {visible.map(p => {
                const isSel = selected.includes(p.id)
                return (
                  <div key={p.id} onClick={() => toggle(p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: isSel ? 'rgba(45,125,210,0.05)' : '#fafafa', border: `1px solid ${isSel ? 'rgba(45,125,210,0.35)' : '#f0f0f0'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSel ? '#2d7dd2' : '#ddd'}`, background: isSel ? '#2d7dd2' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isSel && <span style={{ color: '#fff', fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </div>
                    {p.image_url
                      ? <img src={p.image_url} style={{ width: 40, height: 40, objectFit: 'contain', background: '#f8f8f8', borderRadius: 5, flexShrink: 0 }}/>
                      : <div style={{ width: 40, height: 40, background: '#f0f2f4', borderRadius: 5, flexShrink: 0 }}/>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {p.brand && <div style={{ fontSize: 9, color: '#2d7dd2', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.brand}</div>}
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: '#aaa' }}>MOQ {p.moq || 1} · {p.stock} in stock</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isSel ? '#2d7dd2' : '#111', flexShrink: 0 }}>${p.price?.toLocaleString()}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — summary + send */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 78, alignSelf: 'start' }}>

          {/* Audience */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.25rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Audience</div>

            {/* Mode toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
              {[['all', `All clients (${clients.length})`], ['selected', 'Select specific']].map(([mode, label]) => (
                <button key={mode} onClick={() => { setSendMode(mode); setSelClients([]) }}
                  style={{ padding: '9px 8px', fontSize: 11, fontWeight: 700, background: sendMode === mode ? '#111' : '#f8f9fa', color: sendMode === mode ? '#fff' : '#888', border: `1px solid ${sendMode === mode ? '#111' : '#e5e7eb'}`, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* All clients preview */}
            {sendMode === 'all' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
                {clients.map(c => (
                  <div key={c.email} style={{ fontSize: 11, color: '#888', padding: '5px 0', borderTop: '0.5px solid #f5f5f5', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500, color: '#444' }}>{c.contact_name || c.business_name}</span>
                    <span style={{ color: '#ccc', fontSize: 10 }}>{c.email}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Specific client selector */}
            {sendMode === 'selected' && (
              <div>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Search clients..."
                    style={{ width: '100%', background: '#f8f9fa', border: '1px solid #e5e7eb', color: '#111', fontSize: 11, padding: '7px 10px 7px 26px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                  <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#ccc' }}>🔍</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#aaa' }}>{selClients.length} selected</span>
                  <button onClick={() => setSelClients(clients.map(c => c.email))} style={{ fontSize: 10, color: '#2d7dd2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Select all</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
                  {clients.filter(c => !clientSearch || c.contact_name?.toLowerCase().includes(clientSearch.toLowerCase()) || c.business_name?.toLowerCase().includes(clientSearch.toLowerCase()) || c.email?.toLowerCase().includes(clientSearch.toLowerCase())).map(c => {
                    const isSel = selClients.includes(c.email)
                    return (
                      <div key={c.email} onClick={() => setSelClients(prev => isSel ? prev.filter(e => e !== c.email) : [...prev, c.email])}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', background: isSel ? 'rgba(45,125,210,0.05)' : '#fafafa', border: `1px solid ${isSel ? 'rgba(45,125,210,0.3)' : '#f0f0f0'}`, borderRadius: 6, cursor: 'pointer' }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isSel ? '#2d7dd2' : '#ddd'}`, background: isSel ? '#2d7dd2' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isSel && <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.contact_name || c.business_name}</div>
                          <div style={{ fontSize: 9, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* External emails */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.25rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>External emails (optional)</div>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>Add emails outside your client list — prospects, leads, partners. Separate by comma, semicolon or new line.</div>
            <textarea value={extraEmails} onChange={e => setExtraEmails(e.target.value)} rows={3}
              placeholder={"john@company.com, sarah@business.com\ninfo@prospect.com"}
              style={{ width: '100%', background: '#f8f9fa', border: '1px solid #e5e7eb', color: '#111', fontSize: 12, padding: '9px 12px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}/>
            {extraEmails.trim() && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#2d7dd2', fontWeight: 600 }}>
                {extraEmails.split(',').concat(extraEmails.split(';')).join(' ').split(' ').map(e=>e.trim()).filter(e=>e.includes('@')).length} valid email{extraEmails.split(',').concat(extraEmails.split(';')).join(' ').split(' ').map(e=>e.trim()).filter(e=>e.includes('@')).length !== 1 ? 's' : ''} detected
              </div>
            )}
          </div>

          {/* Selected products summary */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.25rem' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Selected products · {selProds.length}</div>
            {selProds.length === 0
              ? <div style={{ fontSize: 12, color: '#ccc', textAlign: 'center', padding: '1.5rem' }}>No products selected yet</div>
              : selProds.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: '0.5px solid #f5f5f5' }}>
                  <div style={{ fontSize: 12, color: '#444', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{p.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#111', flexShrink: 0 }}>${p.price?.toLocaleString()}</div>
                </div>
              ))
            }
          </div>

          {/* Preview + Send */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => setPreview(!preview)}
              style={{ width: '100%', padding: '11px', background: '#f8f9fa', color: '#555', fontSize: 12, fontWeight: 600, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
              {preview ? 'Hide preview' : '👁 Preview email'}
            </button>
            <button onClick={send} disabled={sending || !selProds.length}
              style={{ width: '100%', padding: '13px', background: sending || !selProds.length ? '#e5e7eb' : '#111', color: sending || !selProds.length ? '#aaa' : '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', borderRadius: 6, cursor: sending || !selProds.length ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: sending || !selProds.length ? 'none' : '0 4px 14px rgba(0,0,0,0.15)' }}>
              {(() => {
              const base = sendMode === 'all' ? clients.length : selClients.length
              const extras = extraEmails.split(',').join('\n').split(';').join('\n').split('\n').map(e=>e.trim()).filter(e=>e.includes('@')).length
              const total = base + extras
              return sending ? 'Sending...' : `Send to ${total} recipient${total !== 1 ? 's' : ''}`
            })()}
            </button>
            {result && (
              <div style={{ padding: '12px 14px', background: result.error ? 'rgba(231,76,60,0.06)' : 'rgba(42,125,79,0.06)', border: `1px solid ${result.error ? 'rgba(231,76,60,0.2)' : 'rgba(42,125,79,0.2)'}`, borderRadius: 6, fontSize: 12, color: result.error ? '#c0392b' : '#2a7d4f', fontWeight: 600, textAlign: 'center' }}>
                {result.error ? `Error: ${result.error}` : `✓ Sent to ${result.sent} clients${result.failed > 0 ? ` · ${result.failed} failed` : ''}`}
              </div>
            )}
            <div style={{ fontSize: 10, color: '#ccc', textAlign: 'center' }}>
              Emails sent from partners@levamcorp.com via Resend
            </div>
          </div>
        </div>
      </div>

      {/* EMAIL PREVIEW MODAL */}
      {preview && selProds.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setPreview(false)}>
          <div style={{ background: '#f4f5f7', borderRadius: 10, maxWidth: 640, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '0.5px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '10px 10px 0 0' }}>
              <div>
                <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Subject</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{form.subject}</div>
              </div>
              <button onClick={() => setPreview(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#aaa', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 16 }}>
              {/* Mini preview */}
              <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ background: '#111', padding: '20px 24px' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>LEVAM<span style={{ color: '#2d7dd2' }}>CORP</span></div>
                </div>
                <div style={{ height: 2, background: '#2d7dd2' }}/>
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-block', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>Exclusive Partner Offer</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#111', marginBottom: 10 }}>{form.headline}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>Hi Partner, {form.message}</div>
                </div>
                {selProds.map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: 12, padding: '12px 24px', borderTop: '1px solid #f5f5f5', alignItems: 'center' }}>
                    {p.image_url && <img src={p.image_url} style={{ width: 52, height: 52, objectFit: 'contain', background: '#f8f8f8', borderRadius: 5, flexShrink: 0 }}/>}
                    <div>
                      {p.brand && <div style={{ fontSize: 9, color: '#2d7dd2', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>{p.brand}</div>}
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{p.name}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#111', marginTop: 4 }}>${p.price?.toLocaleString()}<span style={{ fontSize: 10, fontWeight: 400, color: '#aaa' }}>/unit</span></div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '20px 24px', textAlign: 'center', borderTop: '1px solid #f5f5f5' }}>
                  <div style={{ display: 'inline-block', background: '#111', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '12px 28px', borderRadius: 4 }}>{form.ctaText}</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '14px 24px', textAlign: 'center', fontSize: 10, color: '#aaa' }}>{form.footer}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
