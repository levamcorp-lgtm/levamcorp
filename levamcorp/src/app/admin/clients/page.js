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

const TIER_STYLE = {
  Platinum: { bg: '#ede9fe', ink: '#5b21b6', bar: '#7c3aed', avBg: '#7c3aed', avInk: '#ffffff' },
  Gold:     { bg: '#fef3c7', ink: '#7c4a03', bar: '#f0b429', avBg: '#f0b429', avInk: '#ffffff' },
  Silver:   { bg: '#e8eaee', ink: '#47505e', bar: '#8b909a', avBg: '#8b909a', avInk: '#ffffff' },
  Standard: { bg: '#eef0f4', ink: '#6b7280', bar: '#c9ced6', avBg: '#c9ced6', avInk: '#16181d' },
}
const ACTIVITY_STYLE = {
  hot:         { label: 'Buying now', dot: '#16a34a', ink: '#166534' },
  warm:        { label: 'Active this quarter', dot: '#f0b429', ink: '#7c4a03' },
  dormant:     { label: 'Quiet 90+ days', dot: '#dc2626', ink: '#991b1b' },
  'no orders': { label: 'No orders yet', dot: '#8b909a', ink: '#47505e' },
}
const STATUS_LABEL = { new: 'New', review: 'In review', confirmed: 'Confirmed', dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled' }
const STATUS_BADGE = {
  new: { bg: '#fee2e2', ink: '#991b1b' }, review: { bg: '#fde68a', ink: '#7c4a03' },
  confirmed: { bg: '#e8f0ff', ink: DEEP }, dispatched: { bg: '#e8f0ff', ink: DEEP },
  completed: { bg: '#dcfce7', ink: '#166534' }, cancelled: { bg: '#f1f2f5', ink: '#6b7280' },
}

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

export default function AdminClients() {
  const pathname = usePathname()
  const [clients, setClients] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState('Revenue')
  const [selId, setSelId] = useState(null)
  const [rtab, setRtab] = useState('Info')
  const [credPw, setCredPw] = useState('')
  const [credSentMap, setCredSentMap] = useState({})
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState('')
  const [docUrls, setDocUrls] = useState({})
  const [docLoading, setDocLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      const [{ data: clientsData }, { data: ordersData }] = await Promise.all([
        supabase.from('clients').select('*').order('id', { ascending: false }),
        supabase.from('orders').select('*, order_items(*)').order('submitted_at', { ascending: false }),
      ])
      setClients(clientsData || [])
      setOrders(ordersData || [])
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const resolveDocUrl = async (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const supabase = createClient()
    let result = await supabase.storage.from('Documents').createSignedUrl(path, 3600)
    if (result.data?.signedUrl) return result.data.signedUrl
    result = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (result.data?.signedUrl) return result.data.signedUrl
    const { data: pub } = supabase.storage.from('Documents').getPublicUrl(path)
    return pub?.publicUrl || null
  }

  const sendCredentialsEmail = async (client) => {
    if (!client || !credPw) return
    setSending(true)
    try {
      const res = await fetch('/api/send-credentials-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: client.email, password: credPw, businessName: client.business_name, contactName: client.contact_name })
      })
      const data = await res.json()
      if (data.success) setCredSentMap(prev => ({ ...prev, [client.id]: true }))
      else alert('Error: ' + data.error)
    } catch (e) { alert('Error: ' + e.message) }
    setSending(false)
  }

  const genPw = () => {
    const words = ['Levam', 'Doral', 'Wholesale', 'Partner', 'Miami']
    const w = words[Math.floor(Math.random() * words.length)]
    const n = String(Math.floor(1000 + Math.random() * 9000))
    const sym = '!#$@'[Math.floor(Math.random() * 4)]
    setCredPw(w + n + sym)
  }

  const copyText = (what, text) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text)
    setCopied(what)
    setTimeout(() => setCopied(prev => prev === what ? '' : prev), 2000)
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const fmtMoney = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null

  const getClientOrders = (client) => orders.filter(o => {
    const orderEmail = (o.notes || '').split('Email: ')[1]?.split(' ')[0]?.split(',')[0]?.trim()
    return orderEmail === client.email
  })
  const totalRevenue = (client) => getClientOrders(client).filter(o => ['confirmed','dispatched','completed'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0)
  const totalOrdered = (client) => getClientOrders(client).reduce((s, o) => s + (o.total || 0), 0)

  const clientProfile = (client) => {
    const co = getClientOrders(client)
    const completed = co.filter(o => ['confirmed','dispatched','completed'].includes(o.status))
    const cancelled = co.filter(o => o.status === 'cancelled')
    const pending = co.filter(o => !['completed','cancelled'].includes(o.status))
    const revenue = totalRevenue(client)
    const avgOrderValue = completed.length ? revenue / completed.length : 0
    const lastOrder = co[0]
    const lastOrderDays = lastOrder ? daysSince(lastOrder.submitted_at) : null
    const tenureDays = daysSince(client.created_at) || 0
    let activity = 'dormant'
    if (lastOrderDays !== null && lastOrderDays <= 30) activity = 'hot'
    else if (lastOrderDays !== null && lastOrderDays <= 90) activity = 'warm'
    else if (co.length === 0) activity = 'no orders'
    let tier = 'Standard'
    if (revenue >= 20000) tier = 'Platinum'
    else if (revenue >= 5000) tier = 'Gold'
    else if (revenue >= 1000) tier = 'Silver'
    return { orders: co, completed, cancelled, pending, revenue, avgOrderValue, lastOrder, lastOrderDays, tenureDays, activity, tier }
  }

  const outreachFor = (profile, client) => {
    const first = (client.contact_name || '').trim().split(' ')[0] || 'there'
    const lead = `Hi ${first}, this is Levam Corp Distributors in Doral. `
    if (profile.activity === 'no orders') return { label: 'WhatsApp · nudge first order', text: lead + 'Welcome aboard — want me to walk you through the catalog and help you put together your first order?' }
    if (profile.activity === 'dormant') return { label: 'WhatsApp · win them back', text: lead + 'We noticed it has been a while since your last order — we have new stock and better pricing. Want me to send you the list?' }
    return { label: `WhatsApp ${first}`, text: lead + 'Thanks for your business. Do you want me to put together a quote for your next order?' }
  }

  const selectClient = (id) => { setSelId(id); setRtab('Info'); setCredPw(''); setCopied('') }

  useEffect(() => {
    if (rtab !== 'Docs') return
    const c = clients.find(x => x.id === selId)
    if (!c) return
    let cancelled = false
    setDocLoading(true)
    Promise.all([resolveDocUrl(c.ein_document_url), resolveDocUrl(c.resale_tax_document_url)]).then(([ein, resale]) => {
      if (!cancelled) { setDocUrls({ ein, resale }); setDocLoading(false) }
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtab, selId])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading clients…</div>
      </div>
    </div>
  )

  const profiles = clients.map(c => ({ client: c, profile: clientProfile(c) }))
  const badges = { Clients: { badge: String(clients.length) } }
  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) clamp(290px, 23vw, 350px) minmax(0, 1fr)' : '76px clamp(290px, 25vw, 364px) minmax(0, 1fr)'

  const filterDefs = [
    { key: 'All', label: `All ${clients.length}`, dot: '#c9ced6' },
    { key: 'Active', label: `Buying now ${profiles.filter(p => p.profile.activity === 'hot').length}`, dot: '#16a34a' },
    { key: 'Dormant', label: `Gone quiet ${profiles.filter(p => p.profile.activity === 'dormant').length}`, dot: '#dc2626' },
    { key: 'Platinum', label: `Platinum ${profiles.filter(p => p.profile.tier === 'Platinum').length}`, dot: '#7c3aed' },
    { key: 'Gold', label: `Gold ${profiles.filter(p => p.profile.tier === 'Gold').length}`, dot: '#f0b429' },
  ]

  let list = profiles
  if (filter === 'Active') list = list.filter(p => p.profile.activity === 'hot')
  else if (filter === 'Dormant') list = list.filter(p => p.profile.activity === 'dormant')
  else if (filter === 'Platinum' || filter === 'Gold') list = list.filter(p => p.profile.tier === filter)

  const q = search.trim().toLowerCase()
  if (q) list = list.filter(({ client: c }) => (c.business_name + ' ' + c.contact_name + ' ' + c.email + ' ' + (c.phone||'') + ' ' + (c.ein_number||'') + ' ' + (c.resale_tax_number||'') + ' ' + String(c.id)).toLowerCase().includes(q))

  if (sort === 'Recent') list = [...list].sort((a, b) => (a.profile.lastOrderDays ?? 99999) - (b.profile.lastOrderDays ?? 99999))
  else if (sort === 'Name') list = [...list].sort((a, b) => a.client.business_name.localeCompare(b.client.business_name))
  else list = [...list].sort((a, b) => b.profile.revenue - a.profile.revenue)

  const sel = list.find(p => p.client.id === selId)?.client || list[0]?.client || null
  const selProfile = sel ? clientProfile(sel) : null

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .acl-shell { height:100vh; overflow:hidden; display:grid; grid-template-columns:${shellCols}; align-items:stretch; }
        .acl-info-cols { display:grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap:clamp(12px,1.5vw,16px); align-items:start; }
        .acl-access-cols { display:grid; grid-template-columns: minmax(0,1.15fr) minmax(280px,.85fr); gap:clamp(12px,1.5vw,16px); align-items:start; }
        @media(max-width:900px){ .acl-access-cols { grid-template-columns:1fr !important; } }
        @media(max-width:860px){ .acl-shell { height:auto; overflow:visible; grid-template-columns:1fr !important; } .acl-shell > div { height:auto !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="acl-shell">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={badges} />

        {/* LIST */}
        <div data-scroll style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#f7fbff', borderRight: '1px solid #e2e4e9', minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#f7fbff', borderBottom: `2px solid ${ACCENT}`, padding: '15px 15px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 10 }}>
              <span className="lc-mono" style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: ACCENT, color: '#fff', fontSize: 11, fontWeight: 700 }}>1</span>
              <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: DEEP }}>Find a client</span>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', marginTop: -8, fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#8b909a' }}>⌕</span>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, email, EIN, phone" style={{ width: '100%', boxSizing: 'border-box', padding: '12px 12px 13px 33px', border: '1px solid #b9cdf0', borderRadius: 9, fontSize: 15, color: '#16181d', background: '#ffffff' }} />
            </div>
            <div style={{ paddingTop: 7, fontSize: 12.5, color: '#6b7280' }}>You can also paste a client ID</div>
            <div data-scroll style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 12 }}>
              {filterDefs.map(f => {
                const on = f.key === filter
                return (
                  <button key={f.key} type="button" onClick={() => { setFilter(f.key); setSelId(null) }} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 999, cursor: 'pointer', background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#47505e', padding: '7px 12px 8px', fontSize: 13, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.dot }} />{f.label}
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 12 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{list.length} of {clients.length} clients</span>
              <span data-scroll style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 7, overflowX: 'auto', background: '#ffffff' }}>
                {['Revenue','Recent','Name'].map(label => {
                  const on = sort === label
                  return <button key={label} type="button" onClick={() => setSort(label)} style={{ flex: '0 0 auto', border: 0, cursor: 'pointer', padding: '6px 10px 7px', background: on ? '#16181d' : 'transparent', color: on ? '#ffffff' : '#6b7280', fontSize: 12.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{label}</button>
                })}
              </span>
            </div>
          </div>

          {list.length === 0 ? (
            <div style={{ padding: '2.5rem 16px', textAlign: 'center', fontSize: 13.5, color: '#8b909a' }}>No clients match</div>
          ) : list.map(({ client: c, profile: p }) => {
            const on = sel?.id === c.id
            const t = TIER_STYLE[p.tier]
            const st = ACTIVITY_STYLE[p.activity]
            return (
              <button key={c.id} type="button" onClick={() => selectClient(c.id)} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, borderBottom: '1px solid #e8eef7', borderLeft: `4px solid ${on ? ACCENT : st.dot}`, cursor: 'pointer', background: on ? '#e8f1ff' : '#ffffff', padding: '13px 15px 14px' }}>
                <span style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 9, background: t.avBg, color: t.avInk, fontSize: 15, fontWeight: 700 }}>{c.business_name?.[0]?.toUpperCase() || '?'}</span>
                  <span style={{ minWidth: 0, flex: '1 1 auto' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.business_name}</span>
                      <span className="lc-mono" style={{ flex: 'none', fontSize: 10, fontWeight: 700, letterSpacing: '.06em', padding: '2px 6px 3px', borderRadius: 4, background: t.bg, color: t.ink }}>{p.tier.toUpperCase()}</span>
                    </span>
                    <span style={{ display: 'block', paddingTop: 3, fontSize: 13, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.contact_name}{c.business_type ? ` · ${c.business_type}` : ''}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', paddingTop: 8 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: st.ink }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: st.dot }} />{st.label}</span>
                      <span className="lc-mono" style={{ fontSize: 12, color: '#47505e' }}>{p.orders.length === 1 ? '1 order' : `${p.orders.length} orders`}</span>
                      <span className="lc-mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{p.orders.length ? fmtMoney(p.revenue) : 'no orders'}</span>
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* DETAIL */}
        <div data-scroll style={{ height: '100vh', overflowY: 'auto', background: '#f4f5f7', minWidth: 0 }}>
          {!sel ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8b909a', fontSize: 14 }}>Select a client from the list</div>
          ) : (() => {
            const t0 = TIER_STYLE[selProfile.tier]
            const st0 = ACTIVITY_STYLE[selProfile.activity]
            const outreach = outreachFor(selProfile, sel)
            const waHref = `https://wa.me/1${(sel.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(outreach.text)}`
            const mailHref = `mailto:${sel.email}?subject=${encodeURIComponent('Levam Corp Distributors — ' + sel.business_name)}`
            const hasOrders = selProfile.orders.length > 0
            const dormant = selProfile.activity === 'dormant'

            const rtabDefs = [
              { key: 'Info', label: 'Business info' }, { key: 'Orders', label: 'Orders' },
              { key: 'Docs', label: 'Documents' }, { key: 'Activity', label: 'History' }, { key: 'Access', label: 'Access & terms' },
            ]

            const kpis = [
              { k: 'Total spent', v: hasOrders ? fmtMoney(selProfile.revenue) : '—', sub: hasOrders ? `since ${fmtDate(sel.created_at)}` : 'no orders yet', bar: hasOrders ? '#16a34a' : '#c9ced6' },
              { k: 'Orders placed', v: String(selProfile.orders.length), sub: selProfile.orders.length > 1 ? 'repeat buyer' : selProfile.orders.length === 1 ? 'first order only' : 'has not ordered yet', bar: ACCENT },
              { k: 'Average order', v: hasOrders ? fmtMoney(selProfile.avgOrderValue) : '—', sub: hasOrders ? 'per purchase' : 'nothing to average', bar: hasOrders ? '#0ea5e9' : '#c9ced6' },
              { k: 'Last order', v: hasOrders ? `${selProfile.lastOrderDays}d ago` : 'Never', sub: hasOrders ? `${fmtDateShort(selProfile.lastOrder.submitted_at)}` : 'waiting for their first order', bar: hasOrders ? (dormant ? '#dc2626' : '#16a34a') : '#c9ced6' },
              { k: 'Buys per month', v: sel.monthly_volume || '—', sub: 'the range they declared', bar: '#f0b429' },
            ]

            const groups = [
              { label: 'How to reach them', bar: '#0ea5e9', headBg: '#f2fafe', border: '#cfe8f6', rows: [
                { k: 'Business', v: sel.business_name, size: 16, weight: 700 },
                { k: 'Contact', v: sel.contact_name },
                { k: 'Email', v: sel.email, copy: true },
                { k: 'Phone', v: sel.phone || '—', mono: true, copy: !!sel.phone },
                { k: 'Address', v: sel.address || '—' },
              ]},
              { label: 'What kind of business', bar: '#f0b429', headBg: '#fffdf5', border: '#f3e4bd', rows: [
                { k: 'Type', v: sel.business_type || '—' },
                { k: 'Years running', v: sel.years_in_business || '—' },
                { k: 'Monthly volume', v: sel.monthly_volume || '—', size: 15.5, weight: 700 },
                { k: 'Partner since', v: fmtDate(sel.created_at) },
              ]},
              { label: 'Tax and ID numbers', bar: '#7c3aed', headBg: '#f7f5fe', border: '#ddd6f3', rows: [
                { k: 'EIN', v: sel.ein_number || '—', mono: true, size: 16, weight: 700, copy: !!sel.ein_number },
                { k: 'Resale tax #', v: sel.resale_tax_number || '—', mono: true, size: 16, weight: 700, copy: !!sel.resale_tax_number },
                { k: 'Client ID', v: `#${sel.id}`, mono: true },
              ]},
            ]

            const clientOrders = selProfile.orders
            const strong = credPw.length >= 8
            const sentThisSession = !!credSentMap[sel.id]
            const first = (sel.contact_name || '').split(' ')[0] || 'there'
            const previewText = `Hi ${first}, your Levam Corp partner account is ready.\n\nPortal: levamcorp.com/portal\nEmail: ${sel.email}\nTemporary password: ${credPw || '— set one below —'}\n\nPlease change the password after your first sign-in. We never ask for it by email or phone.`
            const credWaHref = `https://wa.me/1${(sel.phone||'').replace(/\D/g,'')}?text=${encodeURIComponent(previewText)}`

            const events = [
              { icon: '✓', t: 'Application approved', b: `Documents verified · ${selProfile.tier} tier`, when: sel.created_at, iBg: '#fef3c7', iInk: '#7c4a03' },
              ...clientOrders.map(o => ({
                icon: o.status === 'cancelled' ? '✕' : '#', t: `Order ${o.order_number}`, b: `${STATUS_LABEL[o.status]} · ${fmtMoney(o.total)}`, when: o.submitted_at,
                iBg: o.status === 'cancelled' ? '#fee2e2' : '#e8f0ff', iInk: o.status === 'cancelled' ? '#991b1b' : DEEP,
              })),
              ...(sentThisSession ? [{ icon: 'K', t: 'Portal access sent', b: `Login and temporary password sent to ${sel.email} this session`, when: new Date().toISOString(), iBg: '#ede9fe', iInk: '#5b21b6' }] : []),
            ].sort((a, b) => new Date(b.when) - new Date(a.when))

            return (
              <>
                <div style={{ position: 'sticky', top: 0, zIndex: 6, background: '#ffffff', borderBottom: `2px solid ${t0.bar}`, padding: '16px clamp(14px,2vw,24px) 0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'flex-start', gap: 13, minWidth: 0 }}>
                      <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 50, height: 50, borderRadius: 12, background: t0.avBg, color: t0.avInk, fontSize: 21, fontWeight: 700 }}>{sel.business_name?.[0]?.toUpperCase() || '?'}</span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-.025em' }}>{sel.business_name}</span>
                          <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', padding: '4px 9px 5px', borderRadius: 5, background: t0.bg, color: t0.ink }}>{selProfile.tier.toUpperCase()} TIER</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: st0.ink }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: st0.dot }} />{st0.label}</span>
                        </span>
                        <span style={{ display: 'block', paddingTop: 6, fontSize: 15, color: '#47505e' }}>{sel.contact_name}{sel.business_type ? ` · ${sel.business_type}` : ''} · partner since {fmtDate(sel.created_at)}</span>
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                      <a href={waHref} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 15px 11px', borderRadius: 8, background: '#16a34a', color: '#ffffff', fontSize: 14, fontWeight: 700 }}>{outreach.label} <span style={{ fontWeight: 400, opacity: .85 }}>↗</span></a>
                      <a href={mailHref} style={{ padding: '10px 14px 11px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e' }}>Email</a>
                      <Link href={`/admin/orders?client=${sel.id}`} style={{ padding: '10px 14px 11px', borderRadius: 8, background: ACCENT, color: '#ffffff', fontSize: 14, fontWeight: 700 }}>+ New order</Link>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, paddingTop: 14, overflowX: 'auto' }}>
                    {rtabDefs.map(t => {
                      const on = rtab === t.key
                      return <button key={t.key} type="button" onClick={() => setRtab(t.key)} style={{ flex: 'none', border: 0, borderBottom: `3px solid ${on ? ACCENT : 'transparent'}`, background: 'transparent', cursor: 'pointer', padding: '9px 12px 11px', fontSize: 14.5, fontWeight: on ? 700 : 500, color: on ? '#16181d' : '#6b7280', whiteSpace: 'nowrap' }}>{t.label}</button>
                    })}
                  </div>
                </div>

                <div style={{ padding: 'clamp(14px,1.8vw,20px) clamp(14px,2vw,24px) clamp(40px,6vh,60px)', display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
                    {kpis.map(k => (
                      <div key={k.k} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 11, padding: '13px 14px 14px', borderLeft: `5px solid ${k.bar}` }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>{k.k}</span>
                        <div className="lc-mono" style={{ paddingTop: 9, fontWeight: 700, fontSize: 'clamp(20px,2vw,25px)', letterSpacing: '-.035em' }}>{k.v}</div>
                        <div style={{ paddingTop: 5, fontSize: 12.5, color: '#6b7280' }}>{k.sub}</div>
                      </div>
                    ))}
                  </div>

                  {dormant && (
                    <div style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr) auto', gap: 12, alignItems: 'center', background: '#fff6f6', border: '1px solid #f6d5d5', borderRadius: 11, padding: '14px 16px 15px' }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: '#dc2626', color: '#fff', fontSize: 12, fontWeight: 700 }}>!</span>
                      <span style={{ fontSize: 14.5, lineHeight: 1.5, color: '#7f1d1d' }}>{sel.business_name} has not ordered in {selProfile.lastOrderDays} days. They spent {fmtMoney(selProfile.revenue)} with us before going quiet.</span>
                      <a href={waHref} target="_blank" rel="noreferrer" style={{ padding: '9px 13px 10px', borderRadius: 8, background: '#dc2626', color: '#ffffff', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap' }}>Message them</a>
                    </div>
                  )}

                  {rtab === 'Info' && (
                    <div className="acl-info-cols">
                      {groups.map(g => (
                        <div key={g.label} style={{ background: '#ffffff', border: `1px solid ${g.border}`, borderRadius: 12, overflow: 'hidden' }}>
                          <div style={{ padding: '13px 16px 14px', borderBottom: `1px solid ${g.border}`, background: g.headBg, borderLeft: `5px solid ${g.bar}` }}>
                            <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>{g.label}</span>
                          </div>
                          {g.rows.map(r => (
                            <div key={r.k} style={{ display: 'grid', gridTemplateColumns: 'clamp(96px,26%,140px) minmax(0,1fr)', gap: 11, alignItems: 'baseline', padding: '11px 16px 12px', borderBottom: '1px solid #f1f2f5' }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>{r.k}</span>
                              <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, minWidth: 0 }}>
                                <span className={r.mono ? 'lc-mono' : ''} style={{ fontSize: r.size || 15, fontWeight: r.weight || 500, lineHeight: 1.45, color: '#16181d', wordBreak: 'break-word' }}>{r.v}</span>
                                {r.copy && <button type="button" onClick={() => copyText(r.k, r.v)} style={{ flex: 'none', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: DEEP }}>{copied === r.k ? 'Copied' : 'Copy'}</button>}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {rtab === 'Orders' && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Every order this client placed</span>
                        <span style={{ fontSize: 13.5, color: '#6b7280' }}>{hasOrders ? `${clientOrders.length} order${clientOrders.length!==1?'s':''} · ${fmtMoney(totalOrdered(sel))} total` : 'No orders yet'}</span>
                      </div>
                      {clientOrders.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#8b909a', fontSize: 13 }}>No orders from this client yet.</div>
                      ) : clientOrders.map(o => {
                        const done = !['cancelled'].includes(o.status)
                        const st = STATUS_BADGE[o.status] || STATUS_BADGE.new
                        return (
                          <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '26px 168px minmax(0,1fr) 104px 116px', gap: 12, alignItems: 'center', padding: '13px 16px 14px', borderBottom: '1px solid #f1f2f5' }}>
                            <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: o.status === 'cancelled' ? '#f1f2f5' : '#dcfce7', color: o.status === 'cancelled' ? '#6b7280' : '#166534', fontSize: 11, fontWeight: 700 }}>{o.status === 'cancelled' ? '✕' : '✓'}</span>
                            <span>
                              <span className="lc-mono" style={{ display: 'block', fontSize: 13, fontWeight: 700, letterSpacing: '-.02em' }}>{o.order_number}</span>
                              <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#8b909a' }}>{fmtDateShort(o.submitted_at)}</span>
                            </span>
                            <span style={{ minWidth: 0, fontSize: 14, color: '#47505e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.order_items?.length ? o.order_items[0].product_name + (o.order_items.length > 1 ? ` +${o.order_items.length - 1} more` : '') : 'No products added'}</span>
                            <span style={{ fontSize: 12.5, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: st.bg, color: st.ink, textAlign: 'center' }}>{STATUS_LABEL[o.status]}</span>
                            <span style={{ textAlign: 'right' }} className="lc-mono"><span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{fmtMoney(o.total)}</span></span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {rtab === 'Docs' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(276px, 1fr))', gap: 'clamp(12px,1.5vw,16px)' }}>
                      {[
                        { key: 'ein', t: 'EIN / SS-4 letter', path: sel.ein_document_url, num: sel.ein_number, numLabel: 'EIN number' },
                        { key: 'resale', t: 'Resale certificate', path: sel.resale_tax_document_url, num: sel.resale_tax_number, numLabel: 'Resale tax #' },
                      ].map(dc => {
                        const url = docUrls[dc.key]
                        return (
                          <div key={dc.key} style={{ background: '#ffffff', border: '1px solid #ddd6f3', borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 16px 14px', borderBottom: '1px solid #ddd6f3', background: '#f7f5fe' }}>
                              <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: '#4c1d95' }}>{dc.t}</span>
                              <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, color: '#6b7280' }}>{dc.numLabel}: {dc.num || '—'}</span>
                            </div>
                            <div style={{ padding: '13px 16px 0' }}>
                              <div style={{ border: '1px solid #d9dce2', borderRadius: 9, background: '#eceef2', padding: 11, minHeight: 260, display: 'flex' }}>
                                {!dc.path ? (
                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff6f6', border: '1px dashed #f3c9c9', borderRadius: 6, padding: '1.5rem' }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b' }}>Document not submitted</div>
                                    <div style={{ fontSize: 12.5, color: '#6b7280', textAlign: 'center' }}>This client never uploaded this file.</div>
                                  </div>
                                ) : docLoading ? (
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b909a', fontSize: 13 }}>Loading document…</div>
                                ) : url ? (
                                  <iframe src={url} title={dc.t} style={{ flex: 1, width: '100%', minHeight: 260, border: 'none', borderRadius: 4, background: '#fff' }} />
                                ) : (
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991b1b', fontSize: 13 }}>Couldn't load this document</div>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '12px 16px 15px' }}>
                              {url && <button type="button" onClick={() => window.open(url, '_blank')} style={{ padding: '7px 11px 8px', border: '1px solid #d9dce2', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Full size</button>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {rtab === 'Activity' && (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Everything that happened with this client</div>
                      {events.map((e, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr) auto', gap: 12, alignItems: 'start', padding: '13px 16px 14px', borderBottom: '1px solid #f1f2f5' }}>
                          <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: e.iBg, color: e.iInk, fontSize: 11, fontWeight: 700 }}>{e.icon}</span>
                          <span>
                            <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600 }}>{e.t}</span>
                            <span style={{ display: 'block', paddingTop: 3, fontSize: 13, color: '#6b7280' }}>{e.b}</span>
                          </span>
                          <span style={{ fontSize: 12.5, color: '#8b909a', whiteSpace: 'nowrap' }}>{fmtDateShort(e.when)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {rtab === 'Access' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr) auto', gap: 12, alignItems: 'center', background: sentThisSession ? '#f3faf5' : '#fffbf2', border: `1px solid ${sentThisSession ? '#cfe8d7' : '#f3d9a4'}`, borderRadius: 11, padding: '14px 16px 15px' }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: sentThisSession ? '#16a34a' : '#f0b429', color: '#fff', fontSize: 12, fontWeight: 700 }}>{sentThisSession ? '✓' : '!'}</span>
                        <span>
                          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: sentThisSession ? '#166534' : '#8a5a00' }}>{sentThisSession ? 'Credentials sent this session' : "This app doesn't track past logins"}</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#47505e' }}>{sentThisSession ? `Sent just now to ${sel.email}. Generate a new password only if they lost it.` : 'Check Supabase → Authentication → Users, or ask the client if they can sign in.'}</span>
                        </span>
                        <span className="lc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '5px 10px 6px', borderRadius: 6, background: sentThisSession ? '#16a34a' : '#f0b429', color: '#fff', whiteSpace: 'nowrap' }}>{sentThisSession ? 'Sent' : 'Check manually'}</span>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px solid #cfe0fb', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #cfe0fb', background: '#f2f7ff', borderLeft: `5px solid ${ACCENT}` }}>
                          <span className="lc-mono" style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: ACCENT, color: '#fff', fontSize: 11, fontWeight: 700 }}>1</span>
                          <span>
                            <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: DEEP }}>Set the login you will give them</span>
                            <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>This is what they type at levamcorp.com/portal</span>
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(268px, 1fr))', gap: 1, background: '#eceef2' }}>
                          <div style={{ background: '#ffffff', padding: '15px 16px 17px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 9 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>Login email</span>
                              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, padding: '2px 7px 3px', borderRadius: 4, background: '#dcfce7', color: '#166534' }}>Fixed</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: '1 1 auto', minWidth: 0, padding: '12px 13px 13px', border: '1px solid #e2e4e9', borderRadius: 9, background: '#fafbfc', fontFamily: "'JetBrains Mono',monospace", fontSize: 14.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel.email}</div>
                              <button type="button" onClick={() => copyText('cred-email', sel.email)} style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 8, background: copied === 'cred-email' ? '#dcfce7' : '#ffffff', cursor: 'pointer', padding: '12px 13px 13px', fontSize: 13.5, fontWeight: 700, color: copied === 'cred-email' ? '#166534' : '#47505e' }}>{copied === 'cred-email' ? 'Copied' : 'Copy'}</button>
                            </div>
                            <div style={{ paddingTop: 8, fontSize: 12.5, color: '#6b7280' }}>Taken from their application — do not change it.</div>
                          </div>
                          <div style={{ background: '#ffffff', padding: '15px 16px 17px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 9 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>Temporary password</span>
                              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, padding: '2px 7px 3px', borderRadius: 4, background: '#ede9fe', color: '#5b21b6' }}>You choose</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <input type="text" value={credPw} onChange={e => setCredPw(e.target.value)} placeholder="Type or generate one" style={{ flex: '1 1 auto', minWidth: 0, boxSizing: 'border-box', padding: '12px 13px 13px', border: `1px solid ${strong ? '#cfe8d7' : credPw ? '#f3d9a4' : '#d9dce2'}`, borderRadius: 9, background: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, letterSpacing: '.06em' }} />
                              <button type="button" onClick={genPw} title="Make a strong password" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '12px 12px 13px', fontSize: 13.5, fontWeight: 700, color: '#47505e' }}>Generate</button>
                              <button type="button" onClick={() => copyText('cred-pw', credPw)} disabled={!credPw} style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 8, background: copied === 'cred-pw' ? '#dcfce7' : '#ffffff', cursor: credPw ? 'pointer' : 'not-allowed', padding: '12px 13px 13px', fontSize: 13.5, fontWeight: 700, color: copied === 'cred-pw' ? '#166534' : '#47505e' }}>{copied === 'cred-pw' ? 'Copied' : 'Copy'}</button>
                            </div>
                            <div style={{ paddingTop: 8, fontSize: 12.5, color: !credPw ? '#6b7280' : strong ? '#166534' : '#b45309' }}>{!credPw ? 'Type one or press Generate. Minimum 8 characters.' : strong ? 'Good — strong enough to send.' : 'Too short. Use at least 8 characters.'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="acl-access-cols">
                        <div style={{ background: '#ffffff', border: '1px solid #cfe8d7', borderRadius: 12, overflow: 'hidden' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #cfe8d7', background: '#f3faf5', borderLeft: '5px solid #16a34a' }}>
                            <span className="lc-mono" style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700 }}>2</span>
                            <span>
                              <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#166534' }}>Send it to {first}</span>
                              <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>Both options already include the login and the password</span>
                            </span>
                          </div>
                          <div style={{ padding: '15px 16px 17px' }}>
                            <div style={{ border: '1px solid #e2e4e9', borderRadius: 10, background: '#fafbfc', padding: '14px 15px 15px' }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b7280', paddingBottom: 9 }}>What they will receive</div>
                              <div style={{ fontSize: 14.5, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{previewText}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', paddingTop: 13 }}>
                              <a href={strong ? credWaHref : undefined} target="_blank" rel="noreferrer" onClick={() => strong && setCredSentMap(prev => ({ ...prev, [sel.id]: true }))} style={{ flex: '1 1 190px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, textAlign: 'center', padding: '13px 15px 14px', borderRadius: 9, background: strong ? '#16a34a' : '#c9ced6', color: '#ffffff', fontSize: 14.5, fontWeight: 700, pointerEvents: strong ? 'auto' : 'none' }}>Send on WhatsApp <span style={{ fontWeight: 400, opacity: .85 }}>↗</span></a>
                              <button type="button" onClick={() => sendCredentialsEmail(sel)} disabled={!strong || sending} style={{ flex: '1 1 160px', textAlign: 'center', padding: '13px 15px 14px', border: '1px solid #d9dce2', borderRadius: 9, color: '#47505e', fontSize: 14.5, fontWeight: 700, background: '#ffffff', cursor: strong ? 'pointer' : 'not-allowed' }}>{sending ? 'Sending…' : 'Send by email'}</button>
                            </div>
                            <div style={{ paddingTop: 10, fontSize: 12.5, color: strong ? '#6b7280' : '#b45309' }}>{strong ? 'WhatsApp opens with this text prefilled; email is sent for real from our system — check both before sending.' : 'Set a password of 8 characters or more to unlock sending.'}</div>
                            <div style={{ marginTop: 12, padding: '10px 12px', background: '#fffbf2', border: '1px solid #f3d9a4', borderRadius: 8, fontSize: 12.5, color: '#8a5a00' }}>First create this user in Supabase → Authentication → Users → Add user, then send the credentials here.</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>
                          <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Account status</div>
                            {[
                              { k: 'Buying status', v: st0.label, ink: st0.ink },
                              { k: 'Credentials', v: sentThisSession ? 'Sent this session' : 'Unknown — check Supabase', ink: sentThisSession ? '#166534' : '#b45309' },
                              { k: 'Approved on', v: fmtDate(sel.created_at), ink: '#16181d' },
                            ].map(ac => (
                              <div key={ac.k} style={{ display: 'grid', gridTemplateColumns: 'clamp(92px,30%,132px) minmax(0,1fr)', gap: 11, alignItems: 'baseline', padding: '11px 16px 12px', borderBottom: '1px solid #f1f2f5' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>{ac.k}</span>
                                <span style={{ fontSize: 14.5, color: ac.ink }}>{ac.v}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                            <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Terms we gave them</div>
                            {[
                              { k: 'Payment terms', v: 'Net 15' },
                              { k: 'Sales tax', v: 'Resale exempt' },
                            ].map(tm => (
                              <div key={tm.k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '11px 16px 12px', borderBottom: '1px solid #f1f2f5' }}>
                                <span style={{ fontSize: 14, color: '#47505e' }}>{tm.k}</span>
                                <span className="lc-mono" style={{ fontSize: 14, fontWeight: 700 }}>{tm.v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
