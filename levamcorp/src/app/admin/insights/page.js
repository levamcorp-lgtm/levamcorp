'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'

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

const money = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null

const TIER_STYLE = {
  Platinum: { bg: '#ede9fe', ink: '#5b21b6' },
  Gold: { bg: '#fef3c7', ink: '#7c4a03' },
  Silver: { bg: '#e8eaee', ink: '#47505e' },
  Standard: { bg: '#eef0f4', ink: '#6b7280' },
}

export default function AdminInsights() {
  const pathname = usePathname()
  const [events, setEvents] = useState([])
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [period, setPeriod] = useState('30')
  const [tab, setTab] = useState('Overview')
  const [clientSort, setClientSort] = useState('Intent')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      await loadAll(sb, period)
    })
  }, [])

  useEffect(() => { if (!loading) loadAll(createClient(), period) }, [period])

  const loadAll = async (sb, days) => {
    setLoading(true)
    const from = new Date(); from.setDate(from.getDate() - parseInt(days))
    const [{ data: ev }, { data: o }, { data: cl }, { data: p }] = await Promise.all([
      sb.from('analytics_events').select('*').gte('created_at', from.toISOString()).order('created_at', { ascending: false }),
      sb.from('orders').select('*,order_items(*)').gte('submitted_at', from.toISOString()).order('submitted_at', { ascending: false }),
      sb.from('clients').select('*'),
      sb.from('products').select('id, name, brand, category, stock, active'),
    ])
    setEvents(ev || []); setOrders(o || []); setClients(cl || []); setProducts(p || [])
    setLoading(false)
  }

  // ── REAL derived data — everything below reads from analytics_events / orders / clients / products ──
  const pageViews = events.filter(e => e.event_type === 'page_view')
  const productViews = events.filter(e => e.event_type === 'product_view')
  const quoteAdds = events.filter(e => e.event_type === 'product_click')
  const searchEvents = events.filter(e => e.event_type === 'catalog_search')
  const uniqueEmails = [...new Set(events.map(e => e.client_email).filter(Boolean))]
  const confirmedOrders = orders.filter(o => ['confirmed', 'dispatched', 'completed'].includes(o.status))

  const clientNameFor = (order) => (order.notes || '').split('Business: ')[1]?.split('|')[0]?.split('\n')[0]?.trim() || 'Client'
  const emailFor = (order) => (order.notes || '').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim() || ''
  const ordersForEmail = (email) => confirmedOrders.filter(o => emailFor(o) === email)

  const revenueByEmail = {}
  confirmedOrders.forEach(o => { const e = emailFor(o); if (e) revenueByEmail[e] = (revenueByEmail[e] || 0) + (o.total || 0) })
  const tierFor = (email) => { const rev = revenueByEmail[email] || 0; if (rev >= 20000) return 'Platinum'; if (rev >= 5000) return 'Gold'; if (rev >= 1000) return 'Silver'; return 'Standard' }

  // Product map — real event counts joined to real current stock
  const productMap = {}
  productViews.forEach(e => {
    const k = e.product_id || e.product_name
    if (!k) return
    if (!productMap[k]) productMap[k] = { id: e.product_id, name: e.product_name, brand: e.product_brand, views: 0, quotes: 0 }
    productMap[k].views++
  })
  quoteAdds.forEach(e => { const k = e.product_id || e.product_name; if (productMap[k]) productMap[k].quotes++ })
  const topProducts = Object.values(productMap).map(p => {
    const real = products.find(rp => rp.id === p.id) || products.find(rp => rp.name === p.name)
    return { ...p, stock: real ? real.stock : null, category: real ? real.category : null, active: real ? real.active : null }
  }).sort((a, b) => b.views - a.views)
  const maxViews = topProducts[0]?.views || 1
  const unfilled = topProducts.filter(p => p.stock === 0 && p.views >= 2).sort((a, b) => b.views - a.views).slice(0, 6)

  // Client map — real event counts joined to real client record + real order history
  const clientMap = {}
  events.filter(e => e.client_email).forEach(e => {
    if (!clientMap[e.client_email]) clientMap[e.client_email] = { email: e.client_email, name: e.client_name || e.client_email, pageViews: 0, productViews: 0, searches: 0, quotes: 0, lastSeen: e.created_at, lastProduct: null, lastProductAt: null }
    const c = clientMap[e.client_email]
    if (e.event_type === 'page_view') c.pageViews++
    if (e.event_type === 'product_view') { c.productViews++; if (!c.lastProductAt || e.created_at > c.lastProductAt) { c.lastProduct = e.product_name; c.lastProductAt = e.created_at } }
    if (e.event_type === 'catalog_search') c.searches++
    if (e.event_type === 'product_click') c.quotes++
    if (e.created_at > c.lastSeen) c.lastSeen = e.created_at
  })
  const clientProfiles = Object.values(clientMap).map(c => {
    const realClient = clients.find(rc => rc.email === c.email)
    const days = daysSince(c.lastSeen)
    const recency = Math.max(0, 30 - (days ?? 30)) / 30
    const score = Math.min(100, Math.round(c.productViews * 0.5 + c.searches * 0.8 + c.quotes * 9 + recency * 22))
    const ordersN = ordersForEmail(c.email).length
    return { ...c, businessName: realClient?.business_name || c.name, phone: realClient?.phone || '', tier: tierFor(c.email), days, score, orders: ordersN }
  })

  const searchMap = {}
  searchEvents.forEach(e => { const q = e.metadata?.query?.toLowerCase()?.trim(); if (q) searchMap[q] = (searchMap[q] || 0) + 1 })
  const topSearches = Object.entries(searchMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([term, n]) => {
    const carried = products.some(p => (p.name + ' ' + (p.brand || '')).toLowerCase().includes(term))
    return { term, n, carried }
  })

  const brandMap = {}
  productViews.forEach(e => { const b = e.product_brand || 'Unknown'; brandMap[b] = (brandMap[b] || 0) + 1 })
  const brandTotal = Object.values(brandMap).reduce((a, b) => a + b, 0) || 1
  const brandColors = [ACCENT, '#16a34a', '#f0b429', '#dc2626', '#7c3aed', '#0ea5e9']
  const brands = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v], i) => ({ k, v, pct: Math.round((v / brandTotal) * 100), color: brandColors[i % brandColors.length] }))

  // Daily activity (blue = page+product views, green = quote adds)
  const dayCount = Math.min(parseInt(period), 14)
  const dayLabels = Array.from({ length: dayCount }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (dayCount - 1 - i)); return d })
  const days = dayLabels.map(d => {
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const views = events.filter(e => (e.event_type === 'page_view' || e.event_type === 'product_view') && new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === key).length
    const q = quoteAdds.filter(e => new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === key).length
    return { label: key, views, quotes: q }
  })
  const maxDayViews = Math.max(...days.map(d => d.views), 1)

  const hourMap = Array(24).fill(0)
  events.forEach(e => hourMap[new Date(e.created_at).getHours()]++)
  const peakHour = hourMap.indexOf(Math.max(...hourMap))
  const maxHour = Math.max(...hourMap, 1)

  const funnel = [
    { k: 'Visited the portal', v: pageViews.length, color: ACCENT },
    { k: 'Opened a product', v: productViews.length, color: '#7c3aed' },
    { k: 'Searched something', v: searchEvents.length, color: '#f0b429' },
    { k: 'Added to quote', v: quoteAdds.length, color: '#16a34a' },
    { k: 'Placed an order', v: confirmedOrders.length, color: '#0ea5e9' },
  ]
  const funnelTop = funnel[0].v || 1
  const endRate = pageViews.length ? (confirmedOrders.length / pageViews.length) * 100 : 0

  // Hot leads — real: added to quote in the period and seen recently, no fabricated $ value
  const hotLeads = clientProfiles.filter(c => c.quotes > 0 && c.days !== null && c.days <= 7).sort((a, b) => b.score - a.score)

  // Revenue — real, per client + per month + per category
  const revClients = Object.entries(revenueByEmail).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([email, revenue]) => {
    const realClient = clients.find(rc => rc.email === email)
    return { email, biz: realClient?.business_name || realClient?.contact_name || email, revenue, tier: tierFor(email) }
  })
  const revMax = revClients[0]?.revenue || 1

  const monthKeys = Array.from(new Set(confirmedOrders.map(o => o.submitted_at && o.submitted_at.slice(0, 7)).filter(Boolean))).sort().slice(-6)
  const revMonths = monthKeys.map(k => {
    const mo = confirmedOrders.filter(o => o.submitted_at && o.submitted_at.startsWith(k))
    const total = mo.reduce((s, o) => s + (o.total || 0), 0)
    const [y, m] = k.split('-')
    return { key: k, label: new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' }), total }
  })
  const revMonthMax = Math.max(...revMonths.map(m => m.total), 1)

  const catMap = {}
  confirmedOrders.forEach(o => (o.order_items || []).forEach(item => {
    const prod = products.find(p => p.id === item.product_id)
    const cat = prod?.category || 'Uncategorized'
    catMap[cat] = (catMap[cat] || 0) + (item.quantity || 0) * (item.unit_price || item.price || 0)
  }))
  const catColors = [ACCENT, '#7c3aed', '#16a34a', '#f0b429', '#dc2626', '#0ea5e9']
  const revCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v], i) => ({ k, v, color: catColors[i % catColors.length] }))
  const revCatMax = revCats[0]?.[1] || Math.max(...revCats.map(c => c.v), 1)

  // Live feed — real events, newest first
  const eventStyle = {
    page_view: { label: 'Page view', icon: 'V', iBg: '#f1f2f5', iInk: '#47505e', edge: 'transparent' },
    product_view: { label: 'Viewed product', icon: 'V', iBg: '#e8f0ff', iInk: DEEP, edge: 'transparent' },
    product_click: { label: 'Added to quote', icon: 'Q', iBg: '#dcfce7', iInk: '#166534', edge: '#16a34a' },
    catalog_search: { label: 'Searched', icon: 'S', iBg: '#fef3c7', iInk: '#7c4a03', edge: '#f0b429' },
  }
  const feed = events.slice(0, 60).map(e => {
    const s = eventStyle[e.event_type] || { label: e.event_type, icon: '•', iBg: '#f1f2f5', iInk: '#6b7280', edge: 'transparent' }
    const realClient = clients.find(rc => rc.email === e.client_email)
    return {
      icon: s.icon, iBg: s.iBg, iInk: s.iInk, edge: s.edge,
      who: e.client_name || e.client_email || 'Unknown',
      detail: e.event_type === 'product_view' || e.event_type === 'product_click' ? e.product_name : e.event_type === 'catalog_search' ? `"${e.metadata?.query || ''}"` : e.page || '',
      label: s.label,
      when: `${fmtShort(e.created_at)} · ${fmtTime(e.created_at)}`,
      phone: realClient?.phone || '',
      showAction: e.event_type === 'product_click',
    }
  })

  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'
  const twoCols = 'minmax(0, 1.18fr) minmax(290px, .82fr)'

  const exportCSV = () => {
    const header = ['Client', 'Email', 'Page views', 'Product views', 'Searches', 'Added to quote', 'Orders', 'Last seen']
    const lines = clientProfiles.map(c => [c.businessName, c.email, c.pageViews, c.productViews, c.searches, c.quotes, c.orders, fmtShort(c.lastSeen)].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `levam-analytics-${period}d.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading analytics…</div>
      </div>
    </div>
  )

  const kpiDefs = [
    { k: 'Page views', v: pageViews.length, sub: 'vs. last period not tracked', bar: ACCENT, iBg: '#e8f0ff', iInk: DEEP },
    { k: 'Active clients', v: uniqueEmails.length, sub: 'signed in', bar: '#7c3aed', iBg: '#ede9fe', iInk: '#5b21b6' },
    { k: 'Product views', v: productViews.length, sub: 'catalog opens', bar: '#f0b429', iBg: '#fef3c7', iInk: '#7c4a03' },
    { k: 'Added to quote', v: quoteAdds.length, sub: 'buying signals', bar: '#16a34a', iBg: '#dcfce7', iInk: '#166534' },
    { k: 'Orders', v: confirmedOrders.length, sub: 'placed in portal', bar: '#0ea5e9', iBg: '#e0f2fe', iInk: '#075985' },
    { k: 'Searches', v: searchEvents.length, sub: 'what they hunt for', bar: '#8b909a', iBg: '#f1f2f5', iInk: '#47505e' },
  ]

  const tabDefs = [
    { key: 'Overview', label: 'Overview', icon: 'O' },
    { key: 'Products', label: 'Products', icon: 'P' },
    { key: 'Clients', label: 'Clients', icon: 'C' },
    { key: 'Revenue', label: 'Revenue', icon: '$' },
    { key: 'Live', label: 'Live feed', icon: 'L' },
  ]

  let sortedClients = clientProfiles.slice()
  if (clientSort === 'Views') sortedClients.sort((a, b) => b.productViews - a.productViews)
  else if (clientSort === 'Recent') sortedClients.sort((a, b) => (a.days ?? 999) - (b.days ?? 999))
  else sortedClients.sort((a, b) => b.score - a.score)

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes lvm-live { 0%,100%{opacity:.3} 50%{opacity:1} }
        .ain-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .ain-shell { grid-template-columns:1fr !important; } .ain-shell > div:first-child { position:static !important; max-height:none !important; } }
        .ain-2col { display:grid; grid-template-columns:${twoCols}; gap:clamp(14px,1.8vw,18px); align-items:start; }
        @media(max-width:820px){ .ain-2col { grid-template-columns:1fr !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="ain-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={{}} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Analytics</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 10px 5px', borderRadius: 999, background: '#dcfce7', color: '#166534' }} className="lc-mono">
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', animation: 'lvm-live 2.4s ease-in-out infinite' }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>Live</span>
              </span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>Last {period} days · {uniqueEmails.length} clients active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span data-scroll style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflowX: 'auto', background: '#f7f8fa' }}>
                {['7', '14', '30', '90'].map(p => { const on = p === period
                  return <button key={p} type="button" onClick={() => setPeriod(p)} style={{ flex: '0 0 auto', border: 0, cursor: 'pointer', padding: '9px 13px 10px', background: on ? '#16181d' : 'transparent', color: on ? '#ffffff' : '#6b7280', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{p} days</button>
                })}
              </span>
              <button type="button" onClick={exportCSV} style={{ padding: '10px 13px 11px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>↓ Export</button>
            </div>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>

            {hotLeads.length > 0 && (
              <div style={{ background: '#ffffff', border: '1px solid #f3d9a4', borderRadius: 13, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', background: '#fffbf2', borderBottom: '1px solid #f3d9a4', borderLeft: '5px solid #f0b429' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 7, background: '#f0b429', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700 }}>!</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em', color: '#8a5a00' }}>{hotLeads.length} client{hotLeads.length === 1 ? '' : 's'} {hotLeads.length === 1 ? 'is' : 'are'} ready to buy</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#47505e' }}>They put products in a quote and did not order — one message closes these</span>
                    </span>
                  </span>
                </div>
                <div data-scroll style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: 900 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(190px,1.3fr) minmax(200px,1.5fr) 88px 128px 104px 176px', gap: 12, alignItems: 'center', padding: '10px 16px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                      <span>Client</span><span>What they keep looking at</span><span style={{ textAlign: 'right' }}>Views</span><span style={{ textAlign: 'center' }}>Intent</span><span style={{ textAlign: 'right' }}>Last seen</span><span style={{ textAlign: 'center' }}>Close the sale</span>
                    </div>
                    {hotLeads.map(c => {
                      const hot = c.score >= 70
                      const msg = `Hi, this is Levam Corp Distributors in Doral. I saw you were looking at ${c.lastProduct || 'a few products'} in the portal. I can hold units and send you a quote today — how many do you need?`
                      const phoneDigits = (c.phone || '').replace(/\D/g, '')
                      const waHref = phoneDigits ? `https://wa.me/${phoneDigits.length === 10 ? '1' + phoneDigits : phoneDigits}?text=${encodeURIComponent(msg)}` : null
                      const mailHref = `mailto:${c.email}?subject=${encodeURIComponent('Levam Corp — quote for ' + (c.lastProduct || 'your selection'))}&body=${encodeURIComponent(msg)}`
                      return (
                        <div key={c.email} style={{ display: 'grid', gridTemplateColumns: 'minmax(190px,1.3fr) minmax(200px,1.5fr) 88px 128px 104px 176px', gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5', background: hot ? '#f7fbf8' : '#ffffff' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 8, background: hot ? '#dcfce7' : '#fef3c7', color: hot ? '#166534' : '#7c4a03', fontSize: 14, fontWeight: 700 }}>{(c.businessName || '?').charAt(0).toUpperCase()}</span>
                            <span style={{ minWidth: 0 }}>
                              <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.businessName}</span>
                              <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#8b909a' }}>{c.tier} · {c.orders} order{c.orders === 1 ? '' : 's'}</span>
                            </span>
                          </span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastProduct || '—'}</span>
                            <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#6b7280' }}>{c.quotes} item{c.quotes === 1 ? '' : 's'} in their quote · {c.searches} searches</span>
                          </span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{c.productViews}</span>
                          <span>
                            <span style={{ display: 'block', height: 8, borderRadius: 4, background: '#f1f2f5', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', borderRadius: 4, background: hot ? '#16a34a' : '#f0b429', width: `${c.score}%` }} /></span>
                            <span className="lc-mono" style={{ display: 'block', paddingTop: 5, textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: hot ? '#166534' : '#8a5a00' }}>{hot ? 'Hot' : 'Warm'} {c.score}</span>
                          </span>
                          <span style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: c.days <= 2 ? '#166534' : '#8a5a00' }}>{c.days === 0 ? 'Today' : `${c.days}d ago`}</span>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                            {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 11px 9px', borderRadius: 7, background: '#16a34a', color: '#ffffff', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>WhatsApp</a>}
                            <a href={mailHref} style={{ padding: '8px 11px 9px', border: '1px solid #d9dce2', borderRadius: 7, color: '#47505e', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>Quote</a>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(168px, 1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
              {kpiDefs.map(d => (
                <div key={d.k} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ height: 4, background: d.bar }} />
                  <div style={{ padding: '13px 14px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span className="lc-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6b7280' }}>{d.k}</span>
                      <span style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: 5, background: d.iBg, color: d.iInk, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{d.k[0]}</span>
                    </div>
                    <div className="lc-mono" style={{ paddingTop: 9, fontWeight: 700, fontSize: 'clamp(21px,2.1vw,27px)', letterSpacing: '-.04em' }}>{d.v.toLocaleString('en-US')}</div>
                    <div style={{ paddingTop: 7, fontSize: 12, color: '#8b909a' }}>{d.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                <span>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>From browsing to an order</span>
                  <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Where partners drop off — fix the widest gap first</span>
                </span>
                <span className="lc-mono" style={{ fontSize: 13, fontWeight: 700, padding: '6px 11px 7px', borderRadius: 7, background: endRate < 2 ? '#fee2e2' : '#dcfce7', color: endRate < 2 ? '#991b1b' : '#166534' }}>{endRate.toFixed(1)}% end to end</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))' }}>
                {funnel.map((f, i) => {
                  const prev = i === 0 ? f.v : funnel[i - 1].v
                  const dropPct = prev ? Math.round((1 - f.v / prev) * 100) : 0
                  return (
                    <div key={f.k} style={{ borderLeft: '1px solid #f1f2f5', padding: '15px 16px 17px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: f.color, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#47505e' }}>{f.k}</span>
                      </div>
                      <div className="lc-mono" style={{ paddingTop: 10, fontWeight: 700, fontSize: 'clamp(22px,2.2vw,28px)', letterSpacing: '-.04em' }}>{f.v.toLocaleString('en-US')}</div>
                      <div style={{ marginTop: 10, height: 8, borderRadius: 4, background: '#f1f2f5', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 4, background: f.color, width: `${Math.max(3, Math.round((f.v / funnelTop) * 100))}%` }} /></div>
                      <div style={{ paddingTop: 7, fontSize: 12.5, fontWeight: 700, color: i === 0 ? '#8b909a' : dropPct > 70 ? '#991b1b' : dropPct > 40 ? '#b45309' : '#166534' }}>{i === 0 ? 'starting point' : dropPct > 0 ? `${dropPct}% dropped off here` : 'no drop-off'}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div data-scroll style={{ display: 'flex', gap: 4, overflowX: 'auto', borderBottom: '1px solid #e2e4e9' }}>
              {tabDefs.map(t => { const on = t.key === tab
                return (
                  <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, borderBottom: `3px solid ${on ? ACCENT : 'transparent'}`, background: 'transparent', cursor: 'pointer', padding: '10px 13px 12px', fontSize: 14.5, fontWeight: on ? 700 : 500, color: on ? '#16181d' : '#6b7280', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: on ? ACCENT : '#eef0f4', color: on ? '#ffffff' : '#6b7280', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{t.icon}</span>
                    {t.label}
                  </button>
                )
              })}
            </div>

            {tab === 'Overview' && (
              <div className="ain-2col">
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Activity per day</div>
                    <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Views in blue, added-to-quote in green</div>
                  </div>
                  <div style={{ padding: '16px 16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(4px,.8vw,9px)', height: 190 }}>
                      {days.map((d, i) => (
                        <div key={i} title={`${d.label} · ${d.views} views · ${d.quotes} added to quote`} style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                          <span style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                            <span style={{ width: '100%', borderRadius: '3px 3px 0 0', background: '#16a34a', height: Math.max(0, d.quotes * 7) }} />
                            <span style={{ width: '100%', borderRadius: d.quotes ? 0 : '3px 3px 0 0', background: i >= days.length - 3 ? ACCENT : '#93b8f5', height: Math.max(3, Math.round((d.views / maxDayViews) * 140)) }} />
                          </span>
                          <span className="lc-mono" style={{ paddingTop: 7, fontSize: 9.5, letterSpacing: '.04em', color: '#8b909a', whiteSpace: 'nowrap' }}>{d.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '13px 16px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>When they browse</div>
                      <div style={{ paddingTop: 4, fontSize: 13, color: '#6b7280' }}>Peak {peakHour}:00–{peakHour + 1}:00 — send offers an hour before</div>
                    </div>
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 108 }}>
                        {hourMap.map((v, i) => (
                          <span key={i} title={`${i}:00 — ${v} events`} style={{ flex: '1 1 0', minWidth: 0, borderRadius: '2px 2px 0 0', background: i === peakHour ? '#7c3aed' : i >= 8 && i <= 18 ? '#a78bfa' : '#ddd6f3', height: Math.max(3, Math.round((v / maxHour) * 96)) }} />
                        ))}
                      </div>
                      <div className="lc-mono" style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 7, fontSize: 9.5, color: '#8b909a' }}><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '13px 16px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>What they search for</div>
                      <div style={{ paddingTop: 4, fontSize: 13, color: '#6b7280' }}>Red means we have nothing to sell them</div>
                    </div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', padding: '14px 16px 16px' }}>
                      {topSearches.length === 0 ? <div style={{ fontSize: 12.5, color: '#8b909a' }}>No searches yet in this period</div> : topSearches.map(s => (
                        <span key={s.term} title={s.carried ? `${s.n} searches · we carry this` : `${s.n} searches · nothing in the catalog to sell them`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 11px 8px', border: `1px solid ${s.carried ? '#d9dce2' : '#f3c9c9'}`, borderRadius: 999, background: s.carried ? '#ffffff' : '#fff6f6', color: s.carried ? '#47505e' : '#991b1b', fontSize: 13, fontWeight: 600 }}>
                          {s.term}<span className="lc-mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{s.n}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'Products' && (
              <div className="ain-2col">
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Most wanted products</div>
                    <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Views, quotes and whether you can actually fill the demand</div>
                  </div>
                  {topProducts.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No product view data yet for this period</div> : topProducts.slice(0, 12).map((p, i) => {
                    const oos = p.stock === 0
                    const hot = p.quotes > 0
                    return (
                      <div key={p.id || p.name} style={{ display: 'grid', gridTemplateColumns: '30px minmax(0,1fr) 96px 78px 118px', gap: 11, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5', background: oos ? '#fffafa' : '#ffffff' }}>
                        <span className="lc-mono" style={{ fontSize: 12, fontWeight: 700, color: '#8b909a' }}>#{i + 1}</span>
                        <span style={{ minWidth: 0 }}>
                          <span className="lc-mono" style={{ display: 'block', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: oos ? '#991b1b' : DEEP }}>{p.brand || '—'}</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                          <span style={{ display: 'block', marginTop: 7, height: 6, borderRadius: 3, background: '#f1f2f5', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', borderRadius: 3, background: oos ? '#dc2626' : hot ? '#16a34a' : ACCENT, width: `${Math.round((p.views / maxViews) * 100)}%` }} /></span>
                        </span>
                        <span style={{ textAlign: 'right' }}>
                          <span className="lc-mono" style={{ display: 'block', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{p.views}</span>
                          <span style={{ display: 'block', paddingTop: 3, fontSize: 11.5, color: '#8b909a' }}>views</span>
                        </span>
                        <span style={{ textAlign: 'right' }}>
                          <span className="lc-mono" style={{ display: 'block', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: hot ? '#166534' : '#c9ced6' }}>{p.quotes}</span>
                          <span style={{ display: 'block', paddingTop: 3, fontSize: 11.5, color: '#8b909a' }}>quotes</span>
                        </span>
                        <span style={{ textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: oos ? '#fee2e2' : hot ? '#dcfce7' : '#f1f2f5', color: oos ? '#991b1b' : hot ? '#166534' : '#6b7280' }}>{p.stock === null ? 'Not in catalog' : oos ? 'Out of stock' : hot ? 'Hot — follow up' : 'Interest only'}</span>
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>
                  {unfilled.length > 0 && (
                    <div style={{ background: '#ffffff', border: '1px solid #f6d5d5', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '13px 16px 14px', borderBottom: '1px solid #f6d5d5', background: '#fff6f6', borderLeft: '5px solid #dc2626' }}>
                        <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#991b1b' }}>Demand you cannot fill</div>
                        <div style={{ paddingTop: 4, fontSize: 13, color: '#47505e' }}>People want these and you have zero stock</div>
                      </div>
                      {unfilled.map(u => (
                        <div key={u.id || u.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5' }}>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                            <span style={{ display: 'block', paddingTop: 3, fontSize: 12, color: '#8b909a' }}>{u.views} views · {u.quotes} quotes waiting</span>
                          </span>
                          <span className="lc-mono" style={{ flex: 'none', fontSize: 14.5, fontWeight: 700, color: '#991b1b' }}>{u.views}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '13px 16px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Interest by brand</div>
                      <div style={{ paddingTop: 4, fontSize: 13, color: '#6b7280' }}>{brandTotal} product views</div>
                    </div>
                    <div style={{ padding: '14px 16px 16px' }}>
                      {brands.length === 0 ? <div style={{ fontSize: 12.5, color: '#8b909a' }}>No data yet</div> : brands.map(b => (
                        <div key={b.k} style={{ paddingBottom: 13 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingBottom: 6 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: b.color }} />{b.k}</span>
                            <span className="lc-mono" style={{ fontSize: 13, fontWeight: 700 }}>{b.v} · {b.pct}%</span>
                          </div>
                          <div style={{ height: 8, borderRadius: 4, background: '#f1f2f5', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 4, background: b.color, width: `${b.pct}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'Clients' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                  <span>
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Every client's activity</span>
                    <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Sorted by intent — the top of this list is your call sheet</span>
                  </span>
                  <span data-scroll style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflowX: 'auto', background: '#f7f8fa' }}>
                    {['Intent', 'Views', 'Recent'].map(s => { const on = s === clientSort
                      return <button key={s} type="button" onClick={() => setClientSort(s)} style={{ flex: '0 0 auto', border: 0, cursor: 'pointer', padding: '8px 12px 9px', background: on ? '#16181d' : 'transparent', color: on ? '#ffffff' : '#6b7280', fontSize: 13, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{s}</button>
                    })}
                  </span>
                </div>
                <div data-scroll style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: 1020 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,1.5fr) 92px 122px 96px 130px 84px 132px 104px', gap: 12, alignItems: 'center', padding: '10px 16px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                      <span>Client</span><span style={{ textAlign: 'right' }}>Sessions</span><span style={{ textAlign: 'right' }}>Product views</span><span style={{ textAlign: 'right' }}>Searches</span><span style={{ textAlign: 'right' }}>Added to quote</span><span style={{ textAlign: 'right' }}>Orders</span><span style={{ textAlign: 'center' }}>Intent</span><span style={{ textAlign: 'right' }}>Last seen</span>
                    </div>
                    {sortedClients.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No client activity yet in this period</div> : sortedClients.map(c => {
                      const hot = c.score >= 70, warm = c.score >= 45 && c.score < 70
                      return (
                        <div key={c.email} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,1.5fr) 92px 122px 96px 130px 84px 132px 104px', gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5', background: hot ? '#f7fbf8' : '#ffffff' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 8, background: hot ? '#dcfce7' : warm ? '#fef3c7' : '#f1f2f5', color: hot ? '#166534' : warm ? '#7c4a03' : '#8b909a', fontSize: 13.5, fontWeight: 700 }}>{(c.businessName || '?').charAt(0).toUpperCase()}</span>
                            <span style={{ minWidth: 0 }}>
                              <span style={{ display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.businessName}</span>
                              <span style={{ display: 'block', paddingTop: 3, fontSize: 12, color: '#8b909a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastProduct || c.email}</span>
                            </span>
                          </span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 13.5, color: '#47505e' }}>{c.pageViews}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, fontWeight: 700 }}>{c.productViews}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 13.5, color: '#47505e' }}>{c.searches}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, fontWeight: 700, color: c.quotes ? '#166534' : '#c9ced6' }}>{c.quotes}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: c.orders ? '#16181d' : '#991b1b' }}>{c.orders}</span>
                          <span>
                            <span style={{ display: 'block', height: 8, borderRadius: 4, background: '#f1f2f5', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', borderRadius: 4, background: hot ? '#16a34a' : warm ? '#f0b429' : '#c9ced6', width: `${c.score}%` }} /></span>
                            <span className="lc-mono" style={{ display: 'block', paddingTop: 5, textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: hot ? '#166534' : warm ? '#8a5a00' : '#8b909a' }}>{hot ? 'Hot' : warm ? 'Warm' : 'Cold'} {c.score}</span>
                          </span>
                          <span style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: c.days <= 2 ? '#166534' : c.days <= 7 ? '#8a5a00' : '#8b909a' }}>{c.days === 0 ? 'Today' : `${c.days}d ago`}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {tab === 'Revenue' && (
              <div className="ain-2col">
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Who actually spends</div>
                    <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Revenue in this period — protect the top, grow the middle</div>
                  </div>
                  {revClients.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No confirmed orders in this period</div> : revClients.map((r, i) => {
                    const t = TIER_STYLE[r.tier] || TIER_STYLE.Standard
                    return (
                      <div key={r.email} style={{ display: 'grid', gridTemplateColumns: '30px minmax(0,1fr) 128px 96px', gap: 11, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5' }}>
                        <span className="lc-mono" style={{ fontSize: 12, fontWeight: 700, color: '#8b909a' }}>#{i + 1}</span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.biz}</span>
                          <span style={{ display: 'block', marginTop: 7, height: 7, borderRadius: 4, background: '#f1f2f5', overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', borderRadius: 4, background: i === 0 ? '#16a34a' : ACCENT, width: `${Math.round((r.revenue / revMax) * 100)}%` }} /></span>
                        </span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{money(r.revenue)}</span>
                        <span style={{ textAlign: 'right' }}><span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: t.bg, color: t.ink }}>{r.tier}</span></span>
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '13px 16px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Revenue per month</div>
                      <div style={{ paddingTop: 4, fontSize: 13, color: '#6b7280' }}>From confirmed orders, most recent months with activity</div>
                    </div>
                    <div style={{ padding: '15px 16px 17px' }}>
                      {revMonths.length === 0 ? <div style={{ fontSize: 12.5, color: '#8b909a' }}>No confirmed orders yet</div> : (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(8px,1.4vw,16px)', height: 150 }}>
                          {revMonths.map((m, i) => (
                            <div key={m.key} style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                              <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, color: '#166534', paddingBottom: 6, whiteSpace: 'nowrap' }}>{money(m.total)}</span>
                              <span style={{ width: '100%', borderRadius: '5px 5px 0 0', background: i === revMonths.length - 1 ? '#93b8f5' : '#16a34a', height: Math.max(8, Math.round((m.total / revMonthMax) * 112)) }} />
                              <span className="lc-mono" style={{ paddingTop: 7, fontSize: 10.5, textTransform: 'uppercase', color: '#8b909a' }}>{m.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '13px 16px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>What sells, by category</div>
                    </div>
                    <div style={{ padding: '14px 16px 16px' }}>
                      {revCats.length === 0 ? <div style={{ fontSize: 12.5, color: '#8b909a' }}>No category data yet</div> : revCats.map(c => (
                        <div key={c.k} style={{ paddingBottom: 13 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingBottom: 6 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: c.color }} />{c.k}</span>
                            <span className="lc-mono" style={{ fontSize: 13, fontWeight: 700 }}>{money(c.v)}</span>
                          </div>
                          <div style={{ height: 8, borderRadius: 4, background: '#f1f2f5', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 4, background: c.color, width: `${Math.round((c.v / revCatMax) * 100)}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'Live' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                  <span>
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>What is happening right now</span>
                    <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Every action in the portal, newest first — a quote added is a call you should make today</span>
                  </span>
                  <span className="lc-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#166534' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', animation: 'lvm-live 2.4s ease-in-out infinite' }} />{feed.length} events
                  </span>
                </div>
                {feed.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No events yet in this period. Clients need to browse the portal for data to appear.</div> : feed.map((f, i) => {
                  const phoneDigits = (f.phone || '').replace(/\D/g, '')
                  const waHref = f.showAction && phoneDigits ? `https://wa.me/${phoneDigits.length === 10 ? '1' + phoneDigits : phoneDigits}?text=${encodeURIComponent(`Hi, this is Levam Corp Distributors. I saw you added ${f.detail} to your quote — I can hold units and send you a price today, how many do you need?`)}` : null
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '30px minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5', borderLeft: `3px solid ${f.edge}` }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 7, background: f.iBg, color: f.iInk, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>{f.icon}</span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 14, color: '#16181d' }}><span style={{ fontWeight: 600 }}>{f.who}</span> — {f.label}{f.detail ? `: ${f.detail}` : ''}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {waHref && <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 11px 8px', borderRadius: 7, background: '#16a34a', color: '#ffffff', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>Call now</a>}
                        <span className="lc-mono" style={{ fontSize: 12, color: '#8b909a', whiteSpace: 'nowrap' }}>{f.when}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
