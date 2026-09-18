'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'
const CATEGORIES = ['tvs', 'electronics', 'small appliances', 'kitchen appliances', 'gaming', 'audio & speakers', 'computers & laptops', 'phones & accessories', 'cameras', 'smart home', 'appliances', 'other']

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
    { label: 'Broadcast', code: 'BC', href: '/admin/broadcast' },
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
const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null

export default function AdminBroadcast() {
  const pathname = usePathname()
  const [products, setProducts] = useState([])
  const [clients, setClients] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tab, setTab] = useState('New')

  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [inStockOnly, setInStockOnly] = useState(true)
  const [picked, setPicked] = useState({})
  const [promos, setPromos] = useState({})
  const [format, setFormat] = useState('Full')
  const [audience, setAudience] = useState('All')
  const [oneClientQuery, setOneClientQuery] = useState('')
  const [oneClient, setOneClient] = useState(null)
  const [copied, setCopied] = useState(false)

  const [header, setHeader] = useState('*LEVAM CORP — NEW ARRIVALS*\n_Premium wholesale deals, limited stock_')
  const [note, setNote] = useState('')
  const [footer, setFooter] = useState('*Minimum order quantities apply*\nDoral, FL — dispatch within days shown\nReply here to place your order')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      const [{ data: p }, { data: cl }, { data: o }] = await Promise.all([
        sb.from('products').select('*').eq('active', true).order('name'),
        sb.from('clients').select('email, contact_name, business_name, phone'),
        sb.from('orders').select('total, status, submitted_at, notes'),
      ])
      setProducts(p || []); setClients(cl || []); setOrders(o || [])
      setLoading(false)
    })
  }, [])

  const logout = async () => { await createClient().auth.signOut(); window.location.href = '/admin' }

  // ── Real tier/activity classifier — same rules as Clients/Offers/Analytics ──
  const emailFor = (order) => (order.notes || '').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim() || ''
  const revenueByEmail = {}
  orders.filter(o => ['confirmed', 'dispatched', 'completed'].includes(o.status)).forEach(o => { const e = emailFor(o); if (e) revenueByEmail[e] = (revenueByEmail[e] || 0) + (o.total || 0) })
  const lastOrderByEmail = {}
  orders.forEach(o => { const e = emailFor(o); if (e && (!lastOrderByEmail[e] || o.submitted_at > lastOrderByEmail[e])) lastOrderByEmail[e] = o.submitted_at })
  const profileFor = (email) => {
    const rev = revenueByEmail[email] || 0
    const tier = rev >= 20000 ? 'Platinum' : rev >= 5000 ? 'Gold' : rev >= 1000 ? 'Silver' : 'Standard'
    const days = daysSince(lastOrderByEmail[email])
    const activity = days === null ? 'no orders' : days <= 30 ? 'hot' : days <= 90 ? 'warm' : 'dormant'
    return { tier, activity }
  }

  const audDefs = [
    { key: 'All', t: 'All partners', b: 'Everyone approved', n: clients.length },
    { key: 'Top', t: 'Platinum & Gold', b: 'Your biggest buyers', n: clients.filter(c => ['Platinum', 'Gold'].includes(profileFor(c.email).tier)).length },
    { key: 'Dormant', t: 'Gone quiet', b: 'No order in 90+ days', n: clients.filter(c => profileFor(c.email).activity === 'dormant').length },
    { key: 'One', t: 'One client', b: oneClient ? (oneClient.business_name || oneClient.contact_name) : 'Pick a specific partner', n: oneClient ? 1 : 0 },
  ]
  const audActive = audDefs.find(a => a.key === audience) || audDefs[0]
  const clientMatches = oneClientQuery.trim() ? clients.filter(c => (c.business_name + ' ' + c.contact_name + ' ' + c.email).toLowerCase().includes(oneClientQuery.toLowerCase())).slice(0, 8) : []

  // ── Products ──
  const q = search.trim().toLowerCase()
  const visible = products.filter(p => {
    const matchCat = cat === 'All' || p.category === cat
    const matchStock = !inStockOnly || (p.stock > 0) || picked[p.id]
    const matchSearch = !q || (p.name + ' ' + (p.brand || '') + ' ' + (p.sku || '')).toLowerCase().includes(q)
    return matchCat && matchStock && matchSearch
  })
  const catCounts = { All: products.length }
  CATEGORIES.forEach(c => { catCounts[c] = products.filter(p => p.category === c).length })

  const pickedProducts = products.filter(p => picked[p.id])
  const oosPicked = pickedProducts.filter(p => (p.stock || 0) === 0)
  const promoFor = (p) => {
    const raw = promos[p.id]
    const n = parseFloat(raw || '')
    const valid = !isNaN(n) && n > 0 && n < (p.price || 0)
    return { raw: raw || '', valid, value: n, off: valid ? Math.round((1 - n / p.price) * 100) : 0 }
  }
  const discountedCount = pickedProducts.filter(p => promoFor(p).valid).length

  const buildMessage = () => {
    const parts = [header, '']
    pickedProducts.forEach((p, i) => {
      const promo = promoFor(p)
      const shown = promo.valid ? promo.value : p.price
      if (format === 'Compact') {
        parts.push(`*${i + 1}.* ${p.name} — *${money(shown)}*${promo.valid ? ` (-${promo.off}%)` : ''} · MOQ ${p.moq || 1}`)
      } else if (format === 'Promo') {
        parts.push(`*${p.name}*`)
        parts.push(promo.valid ? `~${money(p.price)}~  ➜  *${money(shown)}*  _-${promo.off}%_` : `Price: *${money(shown)}*`)
        parts.push(`Min ${p.moq || 1} units · ${p.stock ? p.stock + ' in stock' : 'on request'}`)
        parts.push('')
      } else {
        parts.push(`*${i + 1}. ${p.name}*`)
        if (p.brand) parts.push(`Brand: ${p.brand}`)
        parts.push(`Price: *${money(shown)}*${promo.valid ? `  (was ${money(p.price)}, -${promo.off}%)` : ''}`)
        parts.push(`MOQ: ${p.moq || 1} units`)
        parts.push(p.stock ? `In stock: ${p.stock} units` : 'Stock: on request')
        if (p.delivery_days) parts.push(`Dispatch: ${p.delivery_days} day${p.delivery_days === 1 ? '' : 's'} from Doral, FL`)
        parts.push('')
      }
    })
    if (note) { parts.push(note); parts.push('') }
    parts.push(footer)
    return parts.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  }
  const messageText = buildMessage()
  const chars = messageText.length
  const tooLong = chars > 1200
  const ready = pickedProducts.length > 0 && oosPicked.length === 0 && !tooLong && (audience !== 'One' || !!oneClient)

  const dropOos = () => { const next = { ...picked }; oosPicked.forEach(p => { next[p.id] = false }); setPicked(next) }
  const toggle = (id) => setPicked(prev => ({ ...prev, [id]: !prev[id] }))

  const phoneDigits = oneClient ? (oneClient.phone || '').replace(/\D/g, '') : ''
  const waHref = audience === 'One'
    ? (phoneDigits ? `https://wa.me/${phoneDigits.length === 10 ? '1' + phoneDigits : phoneDigits}?text=${encodeURIComponent(messageText)}` : null)
    : `https://wa.me/?text=${encodeURIComponent(messageText)}`
  const sendLabel = audience === 'One' ? (oneClient ? `Open chat with ${oneClient.business_name || oneClient.contact_name}` : 'Pick a client first') : 'Open WhatsApp to pick the list'

  const copy = () => { if (navigator.clipboard) navigator.clipboard.writeText(messageText); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14.5, color: '#16181d', background: '#ffffff', fontFamily: 'inherit' }
  const labelStyle = { display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }
  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading broadcast…</div>
      </div>
    </div>
  )

  const now = new Date()
  let h = now.getHours(); const m = String(now.getMinutes()).padStart(2, '0'); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12
  const clock = `${String(h).padStart(2, '0')}:${m} ${ap}`

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .abc-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .abc-shell { grid-template-columns:1fr !important; } .abc-shell > div:first-child { position:static !important; max-height:none !important; } }
        .abc-main { display:grid; grid-template-columns: minmax(0,1.25fr) minmax(330px,.8fr); gap:clamp(14px,1.8vw,18px); align-items:start; }
        @media(max-width:900px){ .abc-main { grid-template-columns:1fr !important; } .abc-main > div:last-child { position:static !important; max-height:none !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="abc-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={{}} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>WhatsApp broadcast</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{tab === 'New' ? `${pickedProducts.length} products · ${audActive.n} recipient${audActive.n === 1 ? '' : 's'} · ${chars} characters` : "Sends aren't logged yet"}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflow: 'hidden', background: '#f7f8fa' }}>
                {['New', 'History'].map(t => { const on = t === tab
                  return <button key={t} type="button" onClick={() => setTab(t)} style={{ border: 0, cursor: 'pointer', padding: '9px 14px 10px', background: on ? ACCENT : 'transparent', color: on ? '#ffffff' : '#6b7280', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{t === 'New' ? 'New broadcast' : 'History'}</button>
                })}
              </span>
              <button type="button" onClick={logout} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          {tab === 'New' && (
            <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)' }} className="abc-main">

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)', minWidth: 0 }}>

                {oosPicked.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr) auto', gap: 12, alignItems: 'center', background: '#fff6f6', border: '1px solid #f6d5d5', borderRadius: 11, padding: '14px 16px 15px' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: '#dc2626', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700 }}>!</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em', color: '#991b1b' }}>{oosPicked.length} product{oosPicked.length === 1 ? ' has' : 's have'} no stock</span>
                      <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#47505e' }}>If you broadcast these, partners will ask for something you cannot ship: {oosPicked.map(p => p.name).join(', ')}</span>
                    </span>
                    <button type="button" onClick={dropOos} style={{ cursor: 'pointer', border: 0, borderRadius: 8, background: '#991b1b', color: '#ffffff', padding: '10px 13px 11px', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap' }}>Remove them</button>
                  </div>
                )}

                <div style={{ background: '#ffffff', border: '1px solid #cfe8d7', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #cfe8d7', background: '#f3faf5', borderLeft: '5px solid #16a34a' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#16a34a', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>1</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#166534' }}>Products in the message</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>{pickedProducts.length ? `${pickedProducts.length} selected · ${discountedCount} with a promo price` : 'Nothing selected — a broadcast with no products is just noise'}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', padding: '13px 16px 0' }}>
                    <span style={{ position: 'relative', flex: '1 1 210px', minWidth: 0 }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', marginTop: -9, fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#8b909a' }}>⌕</span>
                      <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, brand or SKU" style={{ ...inputStyle, paddingLeft: 33 }} />
                    </span>
                    <button type="button" onClick={() => { setPicked({}); setPromos({}) }} style={{ flex: 'none', cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', color: '#47505e', padding: '11px 13px 12px', fontSize: 13.5, fontWeight: 700 }}>Clear</button>
                    <button type="button" onClick={() => setInStockOnly(v => !v)} style={{ flex: 'none', cursor: 'pointer', border: `1px solid ${inStockOnly ? '#16181d' : '#d9dce2'}`, borderRadius: 8, background: inStockOnly ? '#16181d' : '#ffffff', color: inStockOnly ? '#ffffff' : '#47505e', padding: '11px 13px 12px', fontSize: 13.5, fontWeight: 700 }}>In stock only</button>
                  </div>
                  <div data-scroll style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '12px 16px 13px' }}>
                    {['All', ...CATEGORIES].map(c => { const on = c === cat; const n = catCounts[c] || 0
                      return (
                        <button key={c} type="button" onClick={() => setCat(c)} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 999, cursor: 'pointer', background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#47505e', padding: '7px 12px 8px', fontSize: 13, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                          {c === 'All' ? 'All products' : c}
                          <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px 2px', borderRadius: 4, background: on ? 'rgba(255,255,255,.2)' : '#eef0f4', color: on ? '#ffffff' : '#6b7280' }}>{n}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div data-scroll style={{ maxHeight: 420, overflowY: 'auto', borderTop: '1px solid #f1f2f5' }}>
                    {visible.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No products match</div> : visible.map(p => {
                      const on = !!picked[p.id]
                      const oos = (p.stock || 0) === 0
                      const promo = promoFor(p)
                      return (
                        <div key={p.id} onClick={() => toggle(p.id)} style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: '26px 44px minmax(0,1fr) 96px 112px', gap: 11, alignItems: 'center', padding: '11px 16px 12px', borderBottom: '1px solid #f1f2f5', background: on ? '#f7fbf8' : oos ? '#fffafa' : '#ffffff', borderLeft: `3px solid ${on ? '#16a34a' : oos ? '#dc2626' : 'transparent'}` }}>
                          <button type="button" onClick={ev => { ev.stopPropagation(); toggle(p.id) }} title={on ? 'Remove from the message' : 'Add to the message'} style={{ cursor: 'pointer', width: 22, height: 22, display: 'grid', placeItems: 'center', border: `1px solid ${on ? '#16a34a' : '#c9ced6'}`, borderRadius: 6, background: on ? '#16a34a' : '#ffffff', color: '#ffffff', fontSize: 12, fontWeight: 700 }}>{on ? '✓' : ''}</button>
                          <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 8, background: oos ? '#fee2e2' : '#e8f0ff', color: oos ? '#991b1b' : DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, overflow: 'hidden' }}>
                            {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : (p.brand || p.name || '').slice(0, 3).toUpperCase()}
                          </span>
                          <span style={{ minWidth: 0 }}>
                            <span className="lc-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: oos ? '#991b1b' : DEEP }}>{p.brand || '—'}</span>
                            <span style={{ display: 'block', paddingTop: 4, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                            <span style={{ display: 'block', paddingTop: 4, fontSize: 12.5, fontWeight: 600, color: oos ? '#991b1b' : '#166534' }}>{oos ? 'No stock — do not broadcast this' : `${p.stock} units available`}</span>
                          </span>
                          <span style={{ textAlign: 'right' }}>
                            <span className="lc-mono" style={{ display: 'block', fontSize: 14, fontWeight: 700, letterSpacing: '-.02em' }}>{money(p.price)}</span>
                            <span style={{ display: 'block', paddingTop: 3, fontSize: 11.5, color: '#8b909a' }}>MOQ {p.moq || 1}</span>
                          </span>
                          <span onClick={ev => ev.stopPropagation()}>
                            {on ? (
                              <span>
                                <input type="text" value={promo.raw} onChange={e => setPromos(prev => ({ ...prev, [p.id]: e.target.value }))} placeholder={money(p.price * 0.92).replace('$', '')} className="lc-mono" style={{ width: '100%', boxSizing: 'border-box', textAlign: 'right', padding: '9px 10px 10px', border: `1px solid ${promo.valid ? '#86dfa5' : promo.raw ? '#f3d9a4' : '#d9dce2'}`, borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#16181d', background: '#ffffff' }} />
                                <span style={{ display: 'block', paddingTop: 4, textAlign: 'right', fontSize: 11, fontWeight: 700, color: promo.valid ? '#166534' : promo.raw ? '#b45309' : '#8b909a' }}>{promo.valid ? `-${promo.off}% shown` : promo.raw ? 'must be under list' : 'promo price'}</span>
                              </span>
                            ) : <span style={{ display: 'block', textAlign: 'right', fontSize: 12.5, color: '#c9ced6' }}>—</span>}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #f3e4bd', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #f3e4bd', background: '#fffdf5', borderLeft: '5px solid #f0b429' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#f0b429', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>2</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#8a5a00' }}>Who receives it</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>{audActive.n} {audActive.n === 1 ? 'recipient' : 'recipients'} · {audActive.b}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 16px 16px' }}>
                    {audDefs.map(a => { const on = a.key === audience
                      return (
                        <button key={a.key} type="button" onClick={() => setAudience(a.key)} style={{ flex: '1 1 158px', cursor: 'pointer', border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 9, background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#16181d', padding: '11px 13px 12px', textAlign: 'left' }}>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 9 }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{a.t}</span>
                            <span className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color: on ? '#fde68a' : '#8a5a00' }}>{a.n}</span>
                          </span>
                          <span style={{ display: 'block', paddingTop: 5, fontSize: 12.5, color: on ? '#c9ced6' : '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.b}</span>
                        </button>
                      )
                    })}
                  </div>
                  {audience === 'One' && (
                    <div style={{ padding: '0 16px 16px' }}>
                      <label style={labelStyle}>Search your clients</label>
                      <input type="text" value={oneClientQuery} onChange={e => { setOneClientQuery(e.target.value); setOneClient(null) }} placeholder="Business name or contact" style={inputStyle} />
                      {clientMatches.length > 0 && !oneClient && (
                        <div style={{ marginTop: 8, border: '1px solid #e2e4e9', borderRadius: 8, overflow: 'hidden' }}>
                          {clientMatches.map(c => (
                            <div key={c.email} onClick={() => { setOneClient(c); setOneClientQuery(c.business_name || c.contact_name) }} style={{ padding: '9px 12px', borderBottom: '1px solid #f1f2f5', cursor: 'pointer', fontSize: 13 }}>
                              <span style={{ fontWeight: 600 }}>{c.business_name || c.contact_name}</span> <span style={{ color: '#8b909a' }}>{c.email}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {oneClient && !oneClient.phone && <div style={{ marginTop: 8, fontSize: 12.5, color: '#b45309' }}>No phone on file for this client — you'll need to add one before broadcasting to them directly.</div>}
                    </div>
                  )}
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #cfe0fb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #cfe0fb', background: '#f2f7ff', borderLeft: `5px solid ${ACCENT}` }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: ACCENT, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>3</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: DEEP }}>How the message reads</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>Pick a length, then edit the wording</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 16px 0' }}>
                    {[{ k: 'Full', b: 'Brand, price, MOQ, stock, dispatch' }, { k: 'Compact', b: 'One line per product' }, { k: 'Promo', b: 'Old price crossed out, discount shown' }].map(f => { const on = f.k === format
                      return (
                        <button key={f.k} type="button" onClick={() => setFormat(f.k)} style={{ flex: '1 1 150px', cursor: 'pointer', border: `1px solid ${on ? ACCENT : '#d9dce2'}`, borderRadius: 9, background: on ? '#f2f7ff' : '#ffffff', color: on ? DEEP : '#16181d', padding: '11px 13px 12px', textAlign: 'left' }}>
                          <span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>{f.k}</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 12.5, color: '#6b7280' }}>{f.b}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 14 }}>
                    <div style={{ borderLeft: '1px solid #f1f2f5', borderTop: '1px solid #f1f2f5', padding: '13px 16px 14px', gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Header</label>
                      <textarea value={header} onChange={e => setHeader(e.target.value)} rows={3} style={{ ...inputStyle, lineHeight: 1.6, resize: 'vertical' }} />
                      <div style={{ paddingTop: 6, fontSize: 12, color: '#6b7280' }}>*bold* and _italic_ work in WhatsApp</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #f1f2f5', borderTop: '1px solid #f1f2f5', padding: '13px 16px 14px' }}>
                      <label style={labelStyle}>Note (optional)</label>
                      <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Valid until Friday, limited stock" style={inputStyle} />
                    </div>
                    <div style={{ borderLeft: '1px solid #f1f2f5', borderTop: '1px solid #f1f2f5', padding: '13px 16px 14px' }}>
                      <label style={labelStyle}>Footer</label>
                      <textarea value={footer} onChange={e => setFooter(e.target.value)} rows={3} style={{ ...inputStyle, lineHeight: 1.6, resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div data-scroll style={{ position: 'sticky', top: 74, display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)', minWidth: 0, maxHeight: 'calc(100vh - 92px)', overflowY: 'auto' }}>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))' }}>
                    {[
                      { v: String(audActive.n), k: 'recipients', bg: '#f3faf5', ink: '#166534' },
                      { v: String(pickedProducts.length), k: 'products', bg: '#f2f7ff', ink: DEEP },
                      { v: String(discountedCount), k: 'with promo', bg: '#fffdf5', ink: '#8a5a00' },
                    ].map(s => (
                      <div key={s.k} style={{ borderLeft: '1px solid #f1f2f5', padding: '13px 14px 14px', background: s.bg }}>
                        <div className="lc-mono" style={{ fontWeight: 700, fontSize: 21, letterSpacing: '-.035em', color: s.ink }}>{s.v}</div>
                        <div style={{ paddingTop: 5, fontSize: 12.5, color: '#6b7280' }}>{s.k}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '14px 15px 16px', borderTop: '1px solid #e2e4e9' }}>
                    <a href={ready && waHref ? waHref : undefined} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 16px 15px', borderRadius: 9, background: ready && waHref ? '#16a34a' : '#c9ced6', color: '#ffffff', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em', pointerEvents: ready && waHref ? 'auto' : 'none' }}>{sendLabel} <span style={{ fontWeight: 400, opacity: .85 }}>↗</span></a>
                    <div style={{ paddingTop: 9, fontSize: 12.5, lineHeight: 1.5, color: ready ? '#6b7280' : '#b45309' }}>
                      {oosPicked.length ? 'Remove the out-of-stock products first.'
                        : !pickedProducts.length ? 'Pick at least one product.'
                        : tooLong ? 'The message is too long — WhatsApp truncates it and people stop reading. Trim to 3–5 products.'
                        : audience === 'One' && !oneClient ? 'Pick a specific client to message.'
                        : audience === 'One' ? 'Opens the chat with the message already written. Nothing is sent until you press send in WhatsApp.'
                        : 'Opens WhatsApp with the message ready — choose the group or list there.'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 11 }}>
                      <button type="button" onClick={copy} style={{ flex: '1 1 120px', cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 8, background: copied ? '#dcfce7' : '#ffffff', color: copied ? '#166534' : '#47505e', padding: '10px 12px 11px', fontSize: 13.5, fontWeight: 700 }}>{copied ? 'Copied' : 'Copy text'}</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 12, marginTop: 12, borderTop: '1px solid #f1f2f5' }} className="lc-mono">
                      <span style={{ fontSize: 11.5, color: '#6b7280' }}>{chars} characters</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: tooLong ? '#991b1b' : chars > 700 ? '#b45309' : '#166534' }}>{tooLong ? 'too long — trim it' : chars > 700 ? 'getting long' : 'good length'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 15px 13px', borderBottom: '1px solid #e2e4e9' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>Preview</span>
                    <span style={{ fontSize: 12.5, color: '#6b7280' }}>As it lands on their phone</span>
                  </div>
                  <div style={{ padding: 14, background: '#e5ddd5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px 12px' }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', background: '#16181d', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700 }}>L</span>
                      <span>
                        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700 }}>Levam Corp Distributors</span>
                        <span style={{ display: 'block', paddingTop: 2, fontSize: 11.5, color: '#4a5a52' }}>+1 (786) 878-4122 · business account</span>
                      </span>
                    </div>
                    <div style={{ background: '#d9fdd3', borderRadius: '10px 10px 2px 10px', padding: '11px 12px 8px', boxShadow: '0 1px 1px rgba(0,0,0,.12)' }}>
                      <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#111b21', whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{messageText}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, paddingTop: 5 }}>
                        <span style={{ fontSize: 10.5, color: '#667781' }}>{clock}</span>
                        <span style={{ fontSize: 11, color: '#53bdeb' }}>✓✓</span>
                      </div>
                    </div>
                    {pickedProducts.length === 0 && (
                      <div style={{ marginTop: 12, padding: '16px 14px', border: '1px dashed #97a49c', borderRadius: 9, textAlign: 'center', fontSize: 12.5, color: '#4a5a52' }}>Pick products on the left and they appear inside this message.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'History' && (
            <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ display: 'grid', placeItems: 'center', width: 44, height: 44, margin: '0 auto', borderRadius: 10, background: '#e8f0ff', color: DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700 }}>i</div>
                <div style={{ paddingTop: 14, fontSize: 16, fontWeight: 700 }}>Broadcasts aren't logged yet</div>
                <div style={{ maxWidth: 480, margin: '8px auto 0', fontSize: 13.5, lineHeight: 1.6, color: '#6b7280' }}>
                  A broadcast opens WhatsApp with the message ready to send — it happens inside WhatsApp itself, so this app has no record of what was sent, who replied, or which orders came from it. Check WhatsApp Business directly for delivery and reply history.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
