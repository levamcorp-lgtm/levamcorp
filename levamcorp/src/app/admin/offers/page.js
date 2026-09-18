'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'
const DRAFT_KEY = 'levam-offer-draft'

const NAV_GROUPS_BASE = [
  { label: 'Day to day work', items: [
    { label: 'Dashboard', code: 'DB', href: '/admin/dashboard' },
    { label: 'Applications', code: 'AP', href: '/admin/applications' },
    { label: 'Orders', code: 'OR', href: '/admin/orders' },
    { label: 'Payments', code: 'PY', href: '/admin/payments' },
    { label: 'Messages', code: 'MS', href: '/admin/messages' },
  ]},
  { label: 'Catalog and clients', items: [
    { label: 'Products', code: 'PR', href: '/admin/products' },
    { label: 'Clients', code: 'CL', href: '/admin/clients' },
    { label: 'Invoices', code: 'IN', href: '/admin/invoices' },
    { label: 'Offers', code: 'OF', href: '/admin/offers' },
  ]},
  { label: 'Money and growth', items: [
    { label: 'Profit report', code: 'PF', href: '/admin/profit' },
    { label: 'Analytics', code: 'AN', href: '/admin/insights' },
    { label: 'Marketing', code: 'MK', href: '/admin/marketing' },
    { label: 'Walmart', code: 'WM', href: '/admin/walmart' },
    { label: 'Recruit', code: 'RC', href: '/admin/recruit' },
  ]},
]

function Sidebar({ open, setOpen, pathname, badges }) {
  const navGroups = NAV_GROUPS_BASE.map(g => ({
    label: g.label,
    items: g.items.map(n => {
      const active = n.href === pathname
      const meta = badges[n.label] || {}
      const badge = active ? '' : (meta.badge || '')
      const urgent = !active && meta.urgent
      return {
        label: n.label, code: n.code, href: n.href,
        bg: active ? '#16181d' : 'transparent',
        ink: active ? '#ffffff' : '#3d4652',
        weight: active ? 700 : 500,
        iconBg: active ? ACCENT : urgent ? '#fde68a' : '#eef0f4',
        iconInk: active ? '#ffffff' : urgent ? '#7c4a03' : '#6b7280',
        badge,
        badgeBg: badge ? (urgent ? '#fde68a' : '#eef0f4') : 'transparent',
        badgeInk: badge ? (urgent ? '#7c4a03' : '#6b7280') : 'transparent',
        collapsedDot: !open && urgent,
      }
    })
  }))
  return (
    <div data-scroll style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#ffffff', borderRight: '1px solid #e2e4e9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', gap: 12, padding: '16px 14px 17px', borderBottom: '1px solid #e2e4e9' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 8, background: '#16181d' }}><img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width: 20, height: 'auto' }} /></span>
          {open && (
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.015em', whiteSpace: 'nowrap' }}>Levam Corp</span>
              <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#6b7280', whiteSpace: 'nowrap' }}>Admin console</span>
            </span>
          )}
        </span>
        {open && <button type="button" onClick={() => setOpen(false)} aria-label="Collapse menu" title="Collapse menu" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', cursor: 'pointer', width: 32, height: 32, display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#47505e' }}>‹</button>}
      </div>
      {!open && (
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={() => setOpen(true)} aria-label="Expand menu" title="Expand menu" style={{ border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', cursor: 'pointer', width: 38, height: 34, display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#47505e' }}>›</button>
        </div>
      )}
      <div style={{ padding: '14px 10px 20px' }}>
        {navGroups.map(g => (
          <div key={g.label} style={{ paddingBottom: 18 }}>
            {open ? (
              <div style={{ padding: '0 8px 8px', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9aa0aa', whiteSpace: 'nowrap' }}>{g.label}</div>
            ) : (
              <div style={{ margin: '0 8px 10px', height: 1, background: '#e8eaee' }} />
            )}
            {g.items.map(n => (
              <Link key={n.label} href={n.href} title={n.badge ? `${n.label} · ${n.badge}` : n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', gap: 11, padding: open ? '9px 10px' : '9px 0', marginBottom: 3, borderRadius: 8, background: n.bg, color: n.ink, fontSize: 15, fontWeight: n.weight, letterSpacing: '-.01em', position: 'relative' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                  <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 6, background: n.iconBg, color: n.iconInk, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 11 }}>{n.code}</span>
                  {open && <span style={{ whiteSpace: 'nowrap' }}>{n.label}</span>}
                </span>
                {open && n.badge && <span style={{ flex: 'none', fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 700, padding: '3px 7px 4px', borderRadius: 5, background: n.badgeBg, color: n.badgeInk }}>{n.badge}</span>}
                {n.collapsedDot && <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: '#dc2626', border: '2px solid #ffffff' }} />}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

const money = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const short = (n) => '$' + Math.round(parseFloat(n) || 0).toLocaleString('en-US')
const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null

export default function AdminOffers() {
  const pathname = usePathname()
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [orders, setOrders] = useState([])
  const [adminEmail, setAdminEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tab, setTab] = useState('New')

  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState('All')
  const [picked, setPicked] = useState({})
  const [offers, setOffers] = useState({})
  const [extraEmails, setExtraEmails] = useState('')

  const [form, setForm] = useState({
    subject: 'Exclusive wholesale offer from Levam Corp',
    headline: 'New arrivals — limited stock',
    message: 'We have handpicked these products exclusively for our partners. These deals are available for a limited time, so order early to secure your units.',
    ctaText: 'Browse catalog & place order',
    footer: 'Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com · (786) 878-4122',
  })

  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)
  const [testSending, setTestSending] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      setAdminEmail(data.user.email)
      const [{ data: p }, { data: c }, { data: o }] = await Promise.all([
        sb.from('products').select('*').eq('active', true).order('name'),
        sb.from('clients').select('email, contact_name, business_name, created_at'),
        sb.from('orders').select('total, status, submitted_at, notes'),
      ])
      setProducts(p || []); setClients(c || []); setOrders(o || [])
      setLoading(false)
      try { if (localStorage.getItem(DRAFT_KEY)) setHasDraft(true) } catch {}
    })
  }, [])

  const logout = async () => { await createClient().auth.signOut(); window.location.href = '/admin' }

  // ── Real client tier/activity classifier — same rules as the Clients page ──
  const getClientOrders = (client) => orders.filter(o => {
    const orderEmail = (o.notes || '').split('Email: ')[1]?.split(' ')[0]?.split(',')[0]?.trim()
    return orderEmail === client.email
  })
  const clientProfile = (client) => {
    const co = getClientOrders(client)
    const completed = co.filter(o => ['confirmed', 'dispatched', 'completed'].includes(o.status))
    const revenue = completed.reduce((s, o) => s + (o.total || 0), 0)
    const lastOrder = co[0]
    const lastOrderDays = lastOrder ? daysSince(lastOrder.submitted_at) : null
    let activity = 'dormant'
    if (lastOrderDays !== null && lastOrderDays <= 30) activity = 'hot'
    else if (lastOrderDays !== null && lastOrderDays <= 90) activity = 'warm'
    else if (co.length === 0) activity = 'no orders'
    let tier = 'Standard'
    if (revenue >= 20000) tier = 'Platinum'
    else if (revenue >= 5000) tier = 'Gold'
    else if (revenue >= 1000) tier = 'Silver'
    return { revenue, activity, tier }
  }
  const profiles = clients.map(c => ({ client: c, profile: clientProfile(c) }))

  const segDefs = [
    { key: 'All', t: 'All partners', b: 'Everyone approved', match: () => true },
    { key: 'Top', t: 'Platinum & Gold', b: 'Your biggest buyers', match: p => p.tier === 'Platinum' || p.tier === 'Gold' },
    { key: 'Dormant', t: 'Gone quiet', b: 'No order in 90+ days', match: p => p.activity === 'dormant' },
    { key: 'Never', t: 'Never ordered', b: 'Approved but cold', match: p => p.activity === 'no orders' },
  ]
  const segments = segDefs.map(s => ({ ...s, n: profiles.filter(x => s.match(x.profile)).length }))
  const segTargets = profiles.filter(x => (segDefs.find(s => s.key === segment) || segDefs[0]).match(x.profile)).map(x => x.client)

  const parseEmails = (str) => str.split(/[,;\n]+/).map(s => s.trim()).filter(s => s.includes('@'))
  const extraList = parseEmails(extraEmails)
  const recipients = segTargets.length + extraList.length

  const q = search.trim().toLowerCase()
  const visible = products.filter(p => !q || (p.name + ' ' + (p.brand || '') + ' ' + (p.sku || '')).toLowerCase().includes(q))
  const pickedIds = Object.keys(picked).filter(k => picked[k])
  const pickedProducts = products.filter(p => picked[p.id])

  const offerFor = (p) => {
    const raw = offers[p.id]
    const n = parseFloat(raw || '')
    const valid = !isNaN(n) && n > 0 && n < (p.price || 0)
    return { raw: raw || '', valid, value: n, off: valid ? Math.round((1 - n / p.price) * 100) : 0 }
  }
  const discountedCount = pickedProducts.filter(p => offerFor(p).valid).length
  const oosPicked = pickedProducts.filter(p => (p.stock || 0) === 0).length
  const ready = pickedProducts.length > 0 && recipients > 0 && form.subject.trim().length > 3 && oosPicked === 0

  const toggle = (id) => setPicked(prev => ({ ...prev, [id]: !prev[id] }))

  const buildProductsPayload = () => pickedProducts.map(p => {
    const o = offerFor(p)
    return o.valid ? { ...p, offer_price: o.value } : p
  })

  const send = async () => {
    if (!pickedProducts.length) { alert('Select at least one product'); return }
    if (oosPicked) { alert('Remove out-of-stock products from the offer first'); return }
    if (!form.subject.trim()) { alert('Add a subject line'); return }
    const extras = extraList.map(e => ({ email: e, contact_name: '', business_name: '' }))
    const targets = [...segTargets, ...extras]
    if (!targets.length) { alert('Pick an audience or add external emails'); return }
    if (!window.confirm(`Send to ${targets.length} recipient${targets.length !== 1 ? 's' : ''}?`)) return
    setSending(true); setSendResult(null)
    try {
      const res = await fetch('/api/send-offer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, products: buildProductsPayload(), targetClients: targets }),
      })
      setSendResult(await res.json())
    } catch (e) { setSendResult({ error: e.message }) }
    setSending(false)
  }

  const sendTest = async () => {
    if (!pickedProducts.length) { alert('Select at least one product'); return }
    if (!adminEmail) { alert('No admin email on file for this session'); return }
    setTestSending(true); setTestResult(null)
    try {
      const res = await fetch('/api/send-offer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, products: buildProductsPayload(), targetClients: [{ email: adminEmail, contact_name: 'You', business_name: '' }] }),
      })
      setTestResult(await res.json())
    } catch (e) { setTestResult({ error: e.message }) }
    setTestSending(false)
  }

  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, picked, offers, segment, extraEmails })); setHasDraft(true); alert('Draft saved on this device.') } catch { alert('Could not save the draft.') }
  }
  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const d = JSON.parse(raw)
      if (d.form) setForm(d.form)
      if (d.picked) setPicked(d.picked)
      if (d.offers) setOffers(d.offers)
      if (d.segment) setSegment(d.segment)
      if (typeof d.extraEmails === 'string') setExtraEmails(d.extraEmails)
    } catch {}
  }
  const discardDraft = () => { try { localStorage.removeItem(DRAFT_KEY) } catch {}; setHasDraft(false) }

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14.5, color: '#16181d', background: '#ffffff', fontFamily: 'inherit' }
  const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading offers…</div>
      </div>
    </div>
  )

  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .aof-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .aof-shell { grid-template-columns:1fr !important; } .aof-shell > div:first-child { position:static !important; max-height:none !important; } }
        .aof-main { display:grid; grid-template-columns: minmax(0,1.25fr) minmax(320px,.82fr); gap:clamp(14px,1.8vw,18px); align-items:start; }
        @media(max-width:900px){ .aof-main { grid-template-columns:1fr !important; } .aof-main > div:last-child { position:static !important; max-height:none !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="aof-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={{}} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Offers</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{tab === 'New' ? `${pickedProducts.length} products · ${recipients} recipients` : "Sends aren't logged yet"}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflow: 'hidden', background: '#f7f8fa' }}>
                {['New', 'Sent'].map(t => { const on = t === tab
                  return <button key={t} type="button" onClick={() => setTab(t)} style={{ border: 0, cursor: 'pointer', padding: '9px 14px 10px', background: on ? ACCENT : 'transparent', color: on ? '#ffffff' : '#6b7280', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{t === 'New' ? 'New offer' : 'Sent offers'}</button>
                })}
              </span>
              <button type="button" onClick={logout} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          {tab === 'New' && (
            <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)' }} className="aof-main">

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)', minWidth: 0 }}>

                {hasDraft && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', background: '#fffbf2', border: '1px solid #f3d9a4', borderRadius: 10, padding: '11px 15px' }}>
                    <span style={{ fontSize: 13.5, color: '#8a5a00' }}>You have a saved draft on this device.</span>
                    <span style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={loadDraft} style={{ padding: '7px 12px', border: '1px solid #f3d9a4', borderRadius: 7, background: '#ffffff', color: '#8a5a00', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Restore</button>
                      <button type="button" onClick={discardDraft} style={{ padding: '7px 12px', border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', color: '#6b7280', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Discard</button>
                    </span>
                  </div>
                )}

                {/* STEP 1 — Products */}
                <div style={{ background: '#ffffff', border: '1px solid #cfe0fb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #cfe0fb', background: '#f2f7ff', borderLeft: `5px solid ${ACCENT}` }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: ACCENT, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>1</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: DEEP }}>Pick the products you are pushing</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>{pickedProducts.length ? `${pickedProducts.length} selected · ${discountedCount} with a real discount` : 'Nothing selected yet — an offer without products is just an email'}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', padding: '13px 16px 0' }}>
                    <span style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', marginTop: -9, fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#8b909a' }}>⌕</span>
                      <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, brand or SKU" style={{ ...inputStyle, paddingLeft: 33 }} />
                    </span>
                    <button type="button" onClick={() => { setPicked({}); setOffers({}) }} style={{ flex: 'none', cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', color: '#47505e', padding: '11px 13px 12px', fontSize: 13.5, fontWeight: 700 }}>Clear selection</button>
                  </div>
                  <div data-scroll style={{ maxHeight: 360, overflowY: 'auto', marginTop: 13, borderTop: '1px solid #f1f2f5' }}>
                    {visible.map(p => {
                      const on = !!picked[p.id]
                      const oos = (p.stock || 0) === 0
                      const o = offerFor(p)
                      return (
                        <div key={p.id} onClick={() => toggle(p.id)} style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: '26px 44px minmax(0,1fr) 104px 116px', gap: 11, alignItems: 'center', padding: '11px 16px 12px', borderBottom: '1px solid #f1f2f5', background: on ? '#f7fbf8' : oos ? '#fcfcfd' : '#ffffff' }}>
                          <button type="button" onClick={ev => { ev.stopPropagation(); toggle(p.id) }} title={on ? 'Remove from the offer' : 'Add to the offer'} style={{ cursor: 'pointer', width: 22, height: 22, display: 'grid', placeItems: 'center', border: `1px solid ${on ? '#16a34a' : '#c9ced6'}`, borderRadius: 6, background: on ? '#16a34a' : '#ffffff', color: '#ffffff', fontSize: 12, fontWeight: 700 }}>{on ? '✓' : ''}</button>
                          <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 8, background: oos ? '#f1f2f5' : '#e8f0ff', color: oos ? '#8b909a' : DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, overflow: 'hidden' }}>
                            {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : (p.brand || p.name || '').slice(0, 3).toUpperCase()}
                          </span>
                          <span style={{ minWidth: 0 }}>
                            <span className="lc-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: oos ? '#991b1b' : DEEP }}>{p.brand || '—'}</span>
                            <span style={{ display: 'block', paddingTop: 4, fontSize: 14, fontWeight: 600, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                            <span style={{ display: 'block', paddingTop: 4, fontSize: 12.5, color: oos ? '#991b1b' : '#6b7280' }}>{oos ? 'Out of stock — cannot be offered' : `MOQ ${p.moq || 1} · ${p.stock} units in stock`}</span>
                          </span>
                          <span style={{ textAlign: 'right' }}>
                            <span className="lc-mono" style={{ display: 'block', fontSize: 14, fontWeight: 700, letterSpacing: '-.02em' }}>{money(p.price)}</span>
                            <span style={{ display: 'block', paddingTop: 3, fontSize: 12, color: '#8b909a' }}>list price</span>
                          </span>
                          <span onClick={ev => ev.stopPropagation()}>
                            {on ? (
                              <span>
                                <input type="text" value={o.raw} onChange={e => setOffers(prev => ({ ...prev, [p.id]: e.target.value }))} placeholder={money(p.price * 0.92).replace('$', '')} className="lc-mono" style={{ width: '100%', boxSizing: 'border-box', textAlign: 'right', padding: '9px 10px 10px', border: `1px solid ${o.valid ? '#86dfa5' : o.raw ? '#f3d9a4' : '#d9dce2'}`, borderRadius: 8, fontSize: 13.5, fontWeight: 700, color: '#16181d', background: '#ffffff' }} />
                                <span style={{ display: 'block', paddingTop: 4, textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: o.valid ? '#166534' : o.raw ? '#b45309' : '#8b909a' }}>{o.valid ? `${o.off}% off` : o.raw ? 'must be under list' : 'offer price'}</span>
                              </span>
                            ) : <span style={{ display: 'block', textAlign: 'right', fontSize: 12.5, color: '#c9ced6' }}>—</span>}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* STEP 2 — Audience */}
                <div style={{ background: '#ffffff', border: '1px solid #f3e4bd', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #f3e4bd', background: '#fffdf5', borderLeft: '5px solid #f0b429' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#f0b429', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>2</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#8a5a00' }}>Who gets it</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>{segTargets.length} partners in this group{extraList.length ? ` · ${extraList.length} extra emails` : ''}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 16px 0' }}>
                    {segments.map(s => { const on = s.key === segment
                      return (
                        <button key={s.key} type="button" onClick={() => setSegment(s.key)} style={{ flex: '1 1 165px', cursor: 'pointer', border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 9, background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#16181d', padding: '11px 13px 12px', textAlign: 'left' }}>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9 }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{s.t}</span>
                            <span className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color: on ? '#fde68a' : '#8a5a00' }}>{s.n}</span>
                          </span>
                          <span style={{ display: 'block', paddingTop: 5, fontSize: 12.5, color: on ? '#c9ced6' : '#6b7280' }}>{s.b}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ padding: '14px 16px 16px' }}>
                    <label style={labelStyle}>Extra emails outside your client list (optional)</label>
                    <input type="text" value={extraEmails} onChange={e => setExtraEmails(e.target.value)} placeholder="john@company.com, sarah@business.com" style={inputStyle} />
                    <div style={{ paddingTop: 6, fontSize: 12.5, color: '#6b7280' }}>{extraList.length ? `${extraList.length} valid email${extraList.length === 1 ? '' : 's'} added` : 'Separate with commas. Use it for prospects who are not partners yet.'}</div>
                  </div>
                </div>

                {/* STEP 3 — Copy */}
                <div style={{ background: '#ffffff', border: '1px solid #cfe8d7', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #cfe8d7', background: '#f3faf5', borderLeft: '5px solid #16a34a' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#16a34a', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>3</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#166534' }}>What the email says</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>The preview on the right updates as you type</span>
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                    <div style={{ borderLeft: '1px solid #f1f2f5', borderTop: '1px solid #f1f2f5', padding: '13px 16px 14px', gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Subject line *</label>
                      <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inputStyle} />
                      <div style={{ paddingTop: 6, fontSize: 12, color: '#6b7280' }}>First thing they see in the inbox — keep it under 60 characters</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #f1f2f5', borderTop: '1px solid #f1f2f5', padding: '13px 16px 14px', gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Headline</label>
                      <input type="text" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} placeholder="New arrivals — limited stock" style={inputStyle} />
                    </div>
                    <div style={{ borderLeft: '1px solid #f1f2f5', borderTop: '1px solid #f1f2f5', padding: '13px 16px 14px', gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Message</label>
                      <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Why they should order now…" style={{ ...inputStyle, lineHeight: 1.6, resize: 'vertical' }} />
                    </div>
                    <div style={{ borderLeft: '1px solid #f1f2f5', borderTop: '1px solid #f1f2f5', padding: '13px 16px 14px' }}>
                      <label style={labelStyle}>Button text</label>
                      <input type="text" value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Browse catalog & place order" style={inputStyle} />
                    </div>
                    <div style={{ borderLeft: '1px solid #f1f2f5', borderTop: '1px solid #f1f2f5', padding: '13px 16px 14px' }}>
                      <label style={labelStyle}>Footer</label>
                      <input type="text" value={form.footer} onChange={e => setForm(f => ({ ...f, footer: e.target.value }))} style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — summary + preview */}
              <div data-scroll style={{ position: 'sticky', top: 74, display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)', minWidth: 0, maxHeight: 'calc(100vh - 92px)', overflowY: 'auto' }}>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))' }}>
                    {[
                      { v: String(recipients), k: 'recipients', bg: '#f3faf5', ink: '#166534' },
                      { v: String(pickedProducts.length), k: 'products', bg: '#f2f7ff', ink: DEEP },
                      { v: String(discountedCount), k: 'discounted', bg: '#fffdf5', ink: '#8a5a00' },
                    ].map(s => (
                      <div key={s.k} style={{ borderLeft: '1px solid #f1f2f5', padding: '13px 14px 14px', background: s.bg }}>
                        <div className="lc-mono" style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-.035em', color: s.ink }}>{s.v}</div>
                        <div style={{ paddingTop: 5, fontSize: 12.5, color: '#6b7280' }}>{s.k}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px 15px 16px', borderTop: '1px solid #e2e4e9' }}>
                    <button type="button" onClick={send} disabled={sending || !ready} style={{ width: '100%', border: 0, borderRadius: 9, cursor: sending || !ready ? 'not-allowed' : 'pointer', padding: '14px 16px 15px', background: sending ? '#8b909a' : ready ? '#16a34a' : '#c9ced6', color: '#ffffff', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>
                      {sending ? 'Sending…' : ready ? `Send to ${recipients} recipient${recipients === 1 ? '' : 's'}` : 'Send now'}
                    </button>
                    <div style={{ paddingTop: 9, fontSize: 12.5, lineHeight: 1.5, color: ready && discountedCount ? '#6b7280' : '#b45309' }}>
                      {oosPicked ? `${oosPicked} selected product${oosPicked === 1 ? ' is' : 's are'} out of stock — remove it before sending.`
                        : !pickedProducts.length ? 'Pick at least one product to send an offer.'
                        : !recipients ? 'Pick an audience or add external emails.'
                        : form.subject.trim().length <= 3 ? 'Write a subject line.'
                        : discountedCount === 0 ? 'Ready — but no product has a discount. Clients respond far better when they see a price drop.'
                        : 'Ready to send. Nothing goes out until you press the button.'}
                    </div>
                    {sendResult && (
                      <div style={{ marginTop: 10, padding: '10px 14px', background: sendResult.error ? '#fff6f6' : '#f0fdf4', border: `1px solid ${sendResult.error ? '#f6d5d5' : '#bbf7d0'}`, borderRadius: 8, fontSize: 12.5, color: sendResult.error ? '#991b1b' : '#166534', fontWeight: 600, textAlign: 'center' }}>
                        {sendResult.error ? `Error: ${sendResult.error}` : `✓ Sent to ${sendResult.sent} recipient${sendResult.sent !== 1 ? 's' : ''}${sendResult.failed > 0 ? ` · ${sendResult.failed} failed` : ''}`}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 11 }}>
                      <button type="button" onClick={saveDraft} style={{ flex: '1 1 110px', cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', color: '#47505e', padding: '10px 12px 11px', fontSize: 13.5, fontWeight: 700 }}>Save draft</button>
                      <button type="button" onClick={sendTest} disabled={testSending || !pickedProducts.length} style={{ flex: '1 1 110px', cursor: testSending || !pickedProducts.length ? 'not-allowed' : 'pointer', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', color: '#47505e', padding: '10px 12px 11px', fontSize: 13.5, fontWeight: 700 }}>{testSending ? 'Sending…' : 'Send test to me'}</button>
                    </div>
                    {testResult && (
                      <div style={{ marginTop: 8, fontSize: 12, color: testResult.error ? '#991b1b' : '#166534', textAlign: 'center' }}>{testResult.error ? `Error: ${testResult.error}` : `✓ Test sent to ${adminEmail}`}</div>
                    )}
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 15px 13px', borderBottom: '1px solid #e2e4e9' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>Preview</span>
                    <span style={{ fontSize: 12.5, color: '#6b7280' }}>What the client opens</span>
                  </div>
                  <div style={{ padding: '13px 15px 16px', background: '#eceef2' }}>
                    <div style={{ padding: '0 0 10px', fontSize: 12.5, color: '#47505e' }}><span style={{ fontWeight: 700 }}>Subject:</span> {form.subject}</div>
                    <div style={{ background: '#ffffff', border: '1px solid #d9dce2', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px 14px', borderBottom: '2px solid #16181d' }}>
                        <img src="/levamcorp-logo_1.png" alt="Levam Corp" style={{ display: 'block', width: 66, height: 41, objectFit: 'contain' }} />
                        <span className="lc-mono" style={{ fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6b7280', lineHeight: 1.7 }}>Wholesale offer<br />Doral · FL</span>
                      </div>
                      <div style={{ padding: '16px 16px 4px' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.25 }}>{form.headline}</div>
                        <div style={{ paddingTop: 9, fontSize: 13.5, lineHeight: 1.6, color: '#47505e' }}>{form.message}</div>
                      </div>
                      {pickedProducts.length > 0 ? (
                        <div style={{ padding: '14px 16px 0' }}>
                          {pickedProducts.map(p => { const o = offerFor(p)
                            return (
                              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '44px minmax(0,1fr) 96px', gap: 11, alignItems: 'center', padding: '11px 0 12px', borderTop: '1px solid #f1f2f5' }}>
                                <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 6, background: '#f1f2f5', color: '#6b7280', fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, fontWeight: 700, overflow: 'hidden' }}>
                                  {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : (p.brand || p.name || '').slice(0, 3).toUpperCase()}
                                </span>
                                <span style={{ minWidth: 0 }}>
                                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{p.name}</span>
                                  <span style={{ display: 'block', paddingTop: 4, fontSize: 11.5, color: '#8b909a' }}>MOQ {p.moq || 1} units</span>
                                </span>
                                <span style={{ textAlign: 'right' }}>
                                  {o.valid && <span style={{ display: 'block', fontSize: 11.5, textDecoration: 'line-through', color: '#8b909a' }}>{money(p.price)}</span>}
                                  <span className="lc-mono" style={{ display: 'block', fontSize: 14.5, fontWeight: 700, letterSpacing: '-.02em', color: o.valid ? '#166534' : '#16181d' }}>{money(o.valid ? o.value : p.price)}</span>
                                  {o.valid && <span style={{ display: 'block', paddingTop: 2, fontSize: 11, fontWeight: 700, color: '#166534' }}>{o.off}% off</span>}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div style={{ margin: '14px 16px 0', padding: '20px 14px', border: '1px dashed #c9ced6', borderRadius: 8, textAlign: 'center', fontSize: 13, color: '#8b909a' }}>Pick products above and they appear here, with the offer price the client sees.</div>
                      )}
                      <div style={{ padding: 16 }}>
                        <div style={{ padding: '13px 14px 14px', background: ACCENT, color: '#ffffff', textAlign: 'center', fontSize: 13.5, fontWeight: 700 }}>{form.ctaText}</div>
                      </div>
                      <div style={{ padding: '12px 16px 14px', borderTop: '1px solid #f1f2f5', fontSize: 11, lineHeight: 1.6, color: '#8b909a' }}>{form.footer}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'Sent' && (
            <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, margin: '0 auto', borderRadius: 10, background: '#e8f0ff', color: DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700 }}>i</div>
                <div style={{ paddingTop: 14, fontSize: 16, fontWeight: 700 }}>Sent offers aren't logged yet</div>
                <div style={{ maxWidth: 480, margin: '8px auto 0', fontSize: 13.5, lineHeight: 1.6, color: '#6b7280' }}>
                  This app sends offer emails through Resend but doesn't currently save a record of what was sent, when it was opened, or which orders came from it. Check your <a href="https://resend.com" target="_blank" rel="noopener noreferrer" style={{ color: DEEP, fontWeight: 700 }}>Resend dashboard</a> for delivery history in the meantime.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
