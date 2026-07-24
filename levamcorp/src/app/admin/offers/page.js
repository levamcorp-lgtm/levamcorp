'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

export default function AdminOffers() {
  const [products,     setProducts]     = useState([])
  const [clients,      setClients]      = useState([])
  const [selected,     setSelected]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [sending,      setSending]      = useState(false)
  const [result,       setResult]       = useState(null)
  const [search,       setSearch]       = useState('')
  const [preview,      setPreview]      = useState(false)
  const [sendMode,     setSendMode]     = useState('all')
  const [selClients,   setSelClients]   = useState([])
  const [clientSearch, setClientSearch] = useState('')
  const [extraEmails,  setExtraEmails]  = useState('')

  const [form, setForm] = useState({
    subject:  '🔥 Exclusive wholesale offer from Levam Corp',
    headline: 'New arrivals — limited stock',
    message:  'we have handpicked these products exclusively for our partners. These deals are available for a limited time, so order early to secure your units.',
    ctaText:  'Browse catalog & place order',
    footer:   'Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com',
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

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selProds = products.filter(p => selected.includes(p.id))
  const visible  = products.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))

  const parseEmails = (str) => str.split(',').flatMap(s => s.split(';')).flatMap(s => s.split('\n')).map(e => e.trim()).filter(e => e.includes('@'))
  const parsedExtras = parseEmails(extraEmails)

  const send = async () => {
    if (!selProds.length) { alert('Select at least one product'); return }
    if (!form.subject)    { alert('Add a subject line'); return }
    const base = sendMode === 'selected' ? clients.filter(c => selClients.includes(c.email)) : clients
    const extras = parsedExtras.map(e => ({ email: e, contact_name: '', business_name: '' }))
    const allTargets = [...base, ...extras]
    if (!allTargets.length) { alert('Add at least one recipient'); return }
    if (!window.confirm(`Send to ${allTargets.length} recipient${allTargets.length !== 1 ? 's' : ''}?`)) return
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

  const totalRecipients = (sendMode === 'all' ? clients.length : selClients.length) + parsedExtras.length

  const inp = { width: '100%', background: '#f8f9fa', border: '1px solid #e5e7eb', color: '#111', fontSize: 13, padding: '10px 12px', borderRadius: 6, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
  const lbl = { fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: 6 }
  const card = { background: '#fff', border: '0.5px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }

  if (loading) return <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>Loading...</div>

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .nav-links { display: flex; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .nav-links::-webkit-scrollbar { display: none; }
        .offers-layout { display: flex; flex-direction: column; padding: 1rem; gap: 0; max-width: 1200px; margin: 0 auto; }
        .offers-send-box { background: #fff; border: 0.5px solid rgba(0,0,0,0.07); border-radius: 10px; padding: 1.25rem; margin-bottom: 1rem; }
        @media (min-width: 1024px) {
          .offers-layout { flex-direction: row; align-items: flex-start; padding: 1.5rem 2rem; gap: 1.5rem; }
          .offers-left  { flex: 1; min-width: 0; }
          .offers-right { width: 360px; flex-shrink: 0; position: sticky; top: 72px; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', color: '#111', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Levam</div>
          <div className="nav-links" style={{ borderLeft: '0.5px solid rgba(0,0,0,0.1)', paddingLeft: 12 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Broadcast','/admin/broadcast'],['Offers','/admin/offers'],['Recruit','/admin/recruit']].map(([l,h]) => (
              <Link key={l} href={h} style={{ fontSize: 12, color: l==='Offers'?'#2d7dd2':'#777', textDecoration: 'none', padding: '6px 12px', borderBottom: l==='Offers'?'2px solid #2d7dd2':'2px solid transparent', fontWeight: l==='Offers'?700:400, display: 'inline-block' }}>{l}</Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="offers-layout">

        {/* LEFT */}
        <div className="offers-left">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 4 }}>Send featured offer</div>
            <div style={{ fontSize: 13, color: '#888' }}>Select products → customize → send to {clients.length} approved clients</div>
          </div>

          {/* Email form */}
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Email content</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><label style={lbl}>Subject line *</label><input value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Headline</label><input value={form.headline} onChange={e => setForm(f=>({...f,headline:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>Message</label><textarea value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} rows={3} style={{...inp,resize:'none'}}/></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={lbl}>Button text</label><input value={form.ctaText} onChange={e => setForm(f=>({...f,ctaText:e.target.value}))} style={inp}/></div>
                <div><label style={lbl}>Footer</label><input value={form.footer} onChange={e => setForm(f=>({...f,footer:e.target.value}))} style={inp}/></div>
              </div>
            </div>
          </div>

          {/* Product selector */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Products · {selected.length} selected</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setSelected(visible.map(p => p.id))} style={{ fontSize: 11, padding: '5px 10px', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', border: '0.5px solid rgba(45,125,210,0.2)', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>All</button>
                {selected.length > 0 && <button onClick={() => setSelected([])} style={{ fontSize: 11, padding: '5px 10px', background: '#f8f9fa', color: '#888', border: '0.5px solid #e5e7eb', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>}
              </div>
            </div>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{...inp, paddingLeft: 30}}/>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#ccc' }}>🔍</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 320, overflowY: 'auto' }}>
              {visible.map(p => {
                const isSel = selected.includes(p.id)
                return (
                  <div key={p.id} onClick={() => toggle(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: isSel ? 'rgba(45,125,210,0.05)' : '#fafafa', border: `1px solid ${isSel ? 'rgba(45,125,210,0.3)' : '#f0f0f0'}`, borderRadius: 7, cursor: 'pointer' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isSel ? '#2d7dd2' : '#ddd'}`, background: isSel ? '#2d7dd2' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {isSel && <span style={{ color: '#fff', fontSize: 10, fontWeight: 900 }}>✓</span>}
                    </div>
                    {p.image_url ? <img src={p.image_url} style={{ width: 36, height: 36, objectFit: 'contain', background: '#f8f8f8', borderRadius: 4, flexShrink: 0 }}/> : <div style={{ width: 36, height: 36, background: '#f0f2f4', borderRadius: 4, flexShrink: 0 }}/>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {p.brand && <div style={{ fontSize: 9, color: '#2d7dd2', fontWeight: 700, textTransform: 'uppercase' }}>{p.brand}</div>}
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: '#aaa' }}>MOQ {p.moq||1} · {p.stock} units</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: isSel ? '#2d7dd2' : '#111', flexShrink: 0 }}>${p.price?.toLocaleString()}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Audience */}
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Audience</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
              {[['all',`All (${clients.length})`],['selected','Specific']].map(([mode,label]) => (
                <button key={mode} onClick={() => { setSendMode(mode); setSelClients([]) }}
                  style={{ padding: '9px', fontSize: 12, fontWeight: 700, background: sendMode===mode ? '#111' : '#f8f9fa', color: sendMode===mode ? '#fff' : '#888', border: `1px solid ${sendMode===mode ? '#111' : '#e5e7eb'}`, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {label}
                </button>
              ))}
            </div>
            {sendMode === 'all' && (
              <div style={{ maxHeight: 120, overflowY: 'auto' }}>
                {clients.map(c => (
                  <div key={c.email} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderTop: '0.5px solid #f5f5f5', fontSize: 11 }}>
                    <span style={{ fontWeight: 500, color: '#444' }}>{c.contact_name || c.business_name}</span>
                    <span style={{ color: '#ccc', fontSize: 10 }}>{c.email}</span>
                  </div>
                ))}
              </div>
            )}
            {sendMode === 'selected' && (
              <div>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Search clients..." style={{...inp, paddingLeft: 28, fontSize: 11}}/>
                  <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#ccc' }}>🔍</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#aaa' }}>{selClients.length} selected</span>
                  <button onClick={() => setSelClients(clients.map(c => c.email))} style={{ fontSize: 10, color: '#2d7dd2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Select all</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
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
                          <div style={{ fontSize: 9, color: '#aaa' }}>{c.email}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* External emails */}
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>External emails (optional)</div>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>Add prospects or leads outside your client list. Separate by comma, semicolon or new line.</div>
            <textarea value={extraEmails} onChange={e => setExtraEmails(e.target.value)} rows={3}
              placeholder="john@company.com, sarah@business.com"
              style={{...inp, resize: 'none'}}/>
            {parsedExtras.length > 0 && (
              <div style={{ marginTop: 6, fontSize: 11, color: '#2d7dd2', fontWeight: 600 }}>
                {parsedExtras.length} valid email{parsedExtras.length !== 1 ? 's' : ''} detected
              </div>
            )}
          </div>

          {/* SEND BOX — visible on mobile at bottom */}
          <div className="offers-send-box">
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 8 }}>
              Ready to send · {totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''}
              {selProds.length > 0 && <span style={{ fontSize: 11, color: '#888', fontWeight: 400, marginLeft: 8 }}>{selProds.length} product{selProds.length !== 1 ? 's' : ''}</span>}
            </div>
            <button onClick={send} disabled={sending || !selProds.length}
              style={{ width: '100%', padding: '13px', background: sending || !selProds.length ? '#e5e7eb' : '#111', color: sending || !selProds.length ? '#aaa' : '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', borderRadius: 6, cursor: sending || !selProds.length ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>
              {sending ? 'Sending...' : `Send to ${totalRecipients} recipient${totalRecipients !== 1 ? 's' : ''}`}
            </button>
            {result && (
              <div style={{ padding: '10px 14px', background: result.error ? 'rgba(231,76,60,0.06)' : 'rgba(42,125,79,0.06)', border: `1px solid ${result.error ? 'rgba(231,76,60,0.2)' : 'rgba(42,125,79,0.2)'}`, borderRadius: 6, fontSize: 12, color: result.error ? '#c0392b' : '#2a7d4f', fontWeight: 600, textAlign: 'center' }}>
                {result.error ? `Error: ${result.error}` : `✓ Sent to ${result.sent} recipient${result.sent !== 1 ? 's' : ''}${result.failed > 0 ? ` · ${result.failed} failed` : ''}`}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — desktop sidebar */}
        <div className="offers-right">

          {/* Summary */}
          <div style={{...card, marginBottom: '1rem'}}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
              <div style={{ padding: '10px', background: '#f0fdf4', border: '1px solid rgba(42,125,79,0.2)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#16a34a' }}>{totalRecipients}</div>
                <div style={{ fontSize: 10, color: '#888' }}>recipients</div>
              </div>
              <div style={{ padding: '10px', background: '#f0f6ff', border: '1px solid rgba(45,125,210,0.2)', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#2d7dd2' }}>{selProds.length}</div>
                <div style={{ fontSize: 10, color: '#888' }}>products</div>
              </div>
            </div>
            <button onClick={send} disabled={sending || !selProds.length}
              style={{ width: '100%', padding: '12px', background: sending || !selProds.length ? '#e5e7eb' : '#111', color: sending || !selProds.length ? '#aaa' : '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', borderRadius: 6, cursor: sending || !selProds.length ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>
              {sending ? 'Sending...' : `Send now`}
            </button>
            {result && (
              <div style={{ padding: '10px 14px', background: result.error ? 'rgba(231,76,60,0.06)' : 'rgba(42,125,79,0.06)', border: `1px solid ${result.error ? 'rgba(231,76,60,0.2)' : 'rgba(42,125,79,0.2)'}`, borderRadius: 6, fontSize: 12, color: result.error ? '#c0392b' : '#2a7d4f', fontWeight: 600, textAlign: 'center' }}>
                {result.error ? `Error: ${result.error}` : `✓ Sent to ${result.sent}${result.failed > 0 ? ` · ${result.failed} failed` : ''}`}
              </div>
            )}
          </div>

          {/* Selected products */}
          <div style={{...card, marginBottom: '1rem'}}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Selected products</div>
            {selProds.length === 0
              ? <div style={{ fontSize: 12, color: '#ccc', textAlign: 'center', padding: '1rem' }}>None selected</div>
              : selProds.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderTop: '0.5px solid #f5f5f5' }}>
                  <div style={{ fontSize: 11, color: '#444', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>{p.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#111', flexShrink: 0 }}>${p.price?.toLocaleString()}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {preview && selProds.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setPreview(false)}>
          <div style={{ background: '#fff', borderRadius: 10, maxWidth: 580, width: '100%', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{form.subject}</div>
              <button onClick={() => setPreview(false)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#aaa', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ background: '#111', padding: '16px 20px', borderRadius: '6px 6px 0 0' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>LEVAM<span style={{ color: '#2d7dd2' }}>CORP</span></div>
              </div>
              <div style={{ height: 2, background: '#2d7dd2', marginBottom: 16 }}/>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#111', marginBottom: 8 }}>{form.headline}</div>
                <div style={{ fontSize: 12, color: '#888' }}>Hi Partner, {form.message}</div>
              </div>
              {selProds.map(p => (
                <div key={p.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderTop: '1px solid #f5f5f5', alignItems: 'center' }}>
                  {p.image_url && <img src={p.image_url} style={{ width: 48, height: 48, objectFit: 'contain', background: '#f8f8f8', borderRadius: 4, flexShrink: 0 }}/>}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{p.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#111' }}>${p.price?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ display: 'inline-block', background: '#111', color: '#fff', fontSize: 11, fontWeight: 700, padding: '10px 24px', borderRadius: 4 }}>{form.ctaText}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
