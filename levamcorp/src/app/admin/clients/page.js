'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const NAV_LINKS = [['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart'],['Offers','/admin/offers'],['Recruit','/admin/recruit'],['Analytics','/admin/insights']]

const statusColor = { new: '#2F7DF6', review: '#F2A93B', confirmed: '#8B7CF6', dispatched: '#12B76A', completed: '#12B76A', cancelled: '#EF4444' }
const statusLabel = { new: 'New', review: 'In review', confirmed: 'Confirmed', dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled' }

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('revenue')
  const [credEmail, setCredEmail] = useState('')
  const [credPassword, setCredPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [tab, setTab] = useState('info')

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

  const openDoc = async (path) => {
    if (!path) { alert('No document path found for this client.'); return }
    if (path.startsWith('http')) { window.open(path, '_blank'); return }
    const supabase = createClient()
    let result = await supabase.storage.from('Documents').createSignedUrl(path, 3600)
    if (result.data?.signedUrl) { window.open(result.data.signedUrl, '_blank'); return }
    result = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (result.data?.signedUrl) { window.open(result.data.signedUrl, '_blank'); return }
    const { data: pubData } = supabase.storage.from('Documents').getPublicUrl(path)
    if (pubData?.publicUrl) { window.open(pubData.publicUrl, '_blank'); return }
    alert('Could not open document.\nPath: ' + path + '\nError: ' + (result.error?.message || 'Unknown error'))
  }

  const sendCredentials = async () => {
    if (!credEmail || !credPassword) { alert('Please enter email and password'); return }
    setSending(true)
    try {
      const res = await fetch('/api/send-credentials-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credEmail, password: credPassword, businessName: selected?.business_name || '', contactName: selected?.contact_name || '' })
      })
      const data = await res.json()
      if (data.success) { setSent(true); setTimeout(() => setSent(false), 3000) }
      else alert('Error: ' + data.error)
    } catch (e) { alert('Error: ' + e.message) }
    setSending(false)
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const fmtMoney = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })
  const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null

  // Match orders to client by email
  const getClientOrders = (client) => {
    return orders.filter(o => {
      const orderEmail = (o.notes || '').split('Email: ')[1]?.split(' ')[0]?.split(',')[0]?.trim()
      return orderEmail === client.email
    })
  }

  const totalRevenue = (client) => getClientOrders(client)
    .filter(o => ['confirmed','dispatched','completed'].includes(o.status))
    .reduce((s, o) => s + (o.total || 0), 0)

  const totalOrdered = (client) => getClientOrders(client).reduce((s, o) => s + (o.total || 0), 0)

  // ── Enriched per-client analytics — all computed client-side from data already loaded ──
  const clientProfile = (client) => {
    const co = getClientOrders(client)
    const completed = co.filter(o => ['confirmed','dispatched','completed'].includes(o.status))
    const cancelled = co.filter(o => o.status === 'cancelled')
    const pending = co.filter(o => !['completed','cancelled'].includes(o.status))
    const revenue = totalRevenue(client)
    const avgOrderValue = completed.length ? revenue / completed.length : 0
    const lastOrder = co[0]
    const firstOrder = co[co.length - 1]
    const lastOrderDays = lastOrder ? daysSince(lastOrder.submitted_at) : null
    const tenureDays = daysSince(client.created_at) || 0
    const itemCounts = {}
    co.forEach(o => (o.order_items || []).forEach(it => {
      itemCounts[it.product_name] = (itemCounts[it.product_name] || 0) + (it.quantity || 0)
    }))
    const topProducts = Object.entries(itemCounts).sort((a,b) => b[1]-a[1]).slice(0,3)
    const totalItems = Object.values(itemCounts).reduce((s,n)=>s+n,0)
    let activity = 'dormant'
    if (lastOrderDays !== null && lastOrderDays <= 30) activity = 'hot'
    else if (lastOrderDays !== null && lastOrderDays <= 90) activity = 'warm'
    else if (co.length === 0) activity = 'no orders'
    let tier = 'Standard'
    if (revenue >= 20000) tier = 'Platinum'
    else if (revenue >= 5000) tier = 'Gold'
    else if (revenue >= 1000) tier = 'Silver'
    return { orders: co, completed, cancelled, pending, revenue, avgOrderValue, lastOrder, firstOrder, lastOrderDays, tenureDays, topProducts, totalItems, activity, tier }
  }

  const ACTIVITY = {
    hot:        { label: 'Active this month', color: '#12B76A' },
    warm:       { label: 'Active this quarter', color: '#F2A93B' },
    dormant:    { label: 'Dormant 90+ days', color: '#EF4444' },
    'no orders':{ label: 'No orders yet', color: 'rgba(154,172,201,0.5)' },
  }
  const TIER = { Platinum: '#E8B657', Gold: '#F2A93B', Silver: '#9AACC9', Standard: 'rgba(154,172,201,0.6)' }

  const filtered = clients
    .filter(c =>
      c.business_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    )
    .map(c => ({ client: c, profile: clientProfile(c) }))
    .sort((a, b) => {
      if (sortBy === 'revenue') return b.profile.revenue - a.profile.revenue
      if (sortBy === 'orders') return b.profile.orders.length - a.profile.orders.length
      if (sortBy === 'recent') return (a.profile.lastOrderDays ?? 99999) - (b.profile.lastOrderDays ?? 99999)
      if (sortBy === 'newest') return new Date(b.client.created_at) - new Date(a.client.created_at)
      return 0
    })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#05070C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(154,172,201,0.6)', fontFamily: '"Inter",-apple-system,sans-serif' }}>
      Loading client intelligence…
    </div>
  )

  const totalAllRevenue = clients.reduce((s, c) => s + totalRevenue(c), 0)
  const selProfile = selected ? clientProfile(selected) : null
  const hotClients = clients.filter(c => clientProfile(c).activity === 'hot').length
  const platinumClients = clients.filter(c => clientProfile(c).tier === 'Platinum').length

  return (
    <div style={{ background: '#05070C', minHeight: '100vh', fontFamily: '"Inter",-apple-system,sans-serif', color: '#F0F4FF' }}>
      <style>{`
        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.01em; }
        .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: rgba(47,125,246,0.5) !important; outline:none; }
        a:hover { color:#fff !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 2rem', background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(240,244,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, border: '1.5px solid rgba(47,125,246,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(47,125,246,0.06)' }}>
              <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width: 15, height: 'auto' }} />
            </div>
            <div className="lc-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', textTransform: 'uppercase' }}>LEVAM<span style={{ color: '#2F7DF6' }}>CORP</span></div>
          </div>
          <div style={{ display: 'flex', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 20, gap: 2, flexWrap: 'wrap' }}>
            {NAV_LINKS.map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 11.5, fontWeight: 600, color: label === 'Clients' ? '#fff' : 'rgba(154,172,201,0.6)', textDecoration: 'none', padding: '5px 10px', borderRadius: 5, background: label === 'Clients' ? 'rgba(47,125,246,0.12)' : 'transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(154,172,201,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* STATS */}
      <div style={{ padding: '1.25rem 2rem', background: 'rgba(17,26,46,0.35)', borderBottom: '1px solid rgba(240,244,255,0.05)', display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
        {[
          { label: 'Approved clients', value: clients.length, color: '#2F7DF6', icon: IC.users },
          { label: 'Total orders', value: orders.length, color: '#F2A93B', icon: IC.package },
          { label: 'Total revenue', value: fmtMoney(totalAllRevenue), color: '#12B76A', icon: IC.dollar },
          { label: 'Active orders', value: orders.filter(o=>!['completed','cancelled'].includes(o.status)).length, color: '#8B7CF6', icon: IC.clock },
          { label: 'Active this month', value: hotClients, color: '#12B76A', icon: IC.pulse },
          { label: 'Platinum tier', value: platinumClients, color: '#E8B657', icon: IC.star },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(17,26,46,0.6)', border: '1px solid rgba(240,244,255,0.07)', borderRadius: 8, padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 8.5, color: 'rgba(154,172,201,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div className="lc-display" style={{ fontSize: 19, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
            <span style={{ color: s.color, opacity: 0.6 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: selected ? '1fr 480px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT — clients list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Approved Partners <span style={{ fontSize: 11, color: 'rgba(154,172,201,0.5)', fontWeight: 400 }}>· {filtered.length} clients</span></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(154,172,201,0.8)', fontSize: 11, padding: '7px 10px', borderRadius: 20, outline: 'none', fontFamily: 'inherit' }}>
                <option value="revenue" style={{ background: '#111A2E' }}>Sort: Revenue</option>
                <option value="orders" style={{ background: '#111A2E' }}>Sort: Orders</option>
                <option value="recent" style={{ background: '#111A2E' }}>Sort: Recent activity</option>
                <option value="newest" style={{ background: '#111A2E' }}>Sort: Newest partner</option>
              </select>
              <div style={{ position: 'relative' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, padding: '7px 12px 7px 30px', borderRadius: 20, fontFamily: 'inherit', width: 200 }} />
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(154,172,201,0.5)' }}>{IC.search}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(({ client, profile }) => {
              const isSelected = selected?.id === client.id
              const act = ACTIVITY[profile.activity]
              return (
                <div key={client.id} onClick={() => { setSelected(isSelected ? null : client); setCredEmail(client.email); setSent(false); setTab('info') }}
                  style={{ background: 'rgba(17,26,46,0.55)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${isSelected ? 'rgba(47,125,246,0.5)' : 'rgba(240,244,255,0.07)'}`, borderRight: `1px solid ${isSelected ? 'rgba(47,125,246,0.5)' : 'rgba(240,244,255,0.07)'}`, borderBottom: `1px solid ${isSelected ? 'rgba(47,125,246,0.5)' : 'rgba(240,244,255,0.07)'}`, borderLeft: `3px solid ${TIER[profile.tier]}`, borderRadius: 10, padding: '1.1rem 1.4rem', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(47,125,246,0.15)', border: '1.5px solid rgba(47,125,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#2F7DF6', flexShrink: 0 }}>
                        {client.business_name?.[0] || '?'}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{client.business_name}</div>
                          <span className="lc-mono" style={{ fontSize: 8.5, padding: '2px 7px', borderRadius: 10, background: `${TIER[profile.tier]}20`, color: TIER[profile.tier], fontWeight: 700, letterSpacing: '0.05em' }}>{profile.tier.toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(154,172,201,0.55)', margin: '3px 0 6px' }}>{client.contact_name} · {client.email}</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {client.business_type && <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.05)', color: 'rgba(154,172,201,0.6)', borderRadius: 10 }}>{client.business_type}</span>}
                          {profile.pending.length > 0 && <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(139,124,246,0.15)', color: '#8B7CF6', borderRadius: 10, fontWeight: 700 }}>{profile.pending.length} active</span>}
                          <span style={{ fontSize: 9, padding: '2px 8px', background: `${act.color}18`, color: act.color, borderRadius: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: act.color }} />{act.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 18, textAlign: 'right', flexShrink: 0 }}>
                      <div>
                        <div style={{ fontSize: 8.5, color: 'rgba(154,172,201,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Orders</div>
                        <div className="lc-mono" style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{profile.orders.length}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 8.5, color: 'rgba(154,172,201,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Avg. order</div>
                        <div className="lc-mono" style={{ fontSize: 16, fontWeight: 700, color: '#9AACC9' }}>{fmtMoney(profile.avgOrderValue)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 8.5, color: 'rgba(154,172,201,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Revenue</div>
                        <div className="lc-mono" style={{ fontSize: 16, fontWeight: 700, color: profile.revenue > 0 ? '#12B76A' : 'rgba(154,172,201,0.6)' }}>{fmtMoney(profile.revenue)}</div>
                      </div>
                    </div>
                  </div>
                  {profile.lastOrder && (
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(240,244,255,0.05)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9, color: 'rgba(154,172,201,0.4)' }}>Last order:</span>
                      <span className="lc-mono" style={{ fontSize: 9, color: 'rgba(154,172,201,0.6)' }}>#{profile.lastOrder.order_number} · {fmtDateShort(profile.lastOrder.submitted_at)}</span>
                      <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, background: `${statusColor[profile.lastOrder.status]}20`, color: statusColor[profile.lastOrder.status], fontWeight: 700 }}>{statusLabel[profile.lastOrder.status]}</span>
                      <span className="lc-mono" style={{ fontSize: 9, color: '#12B76A', marginLeft: 'auto' }}>{fmtMoney(profile.lastOrder.total)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — client detail */}
        {selected && selProfile && (
          <div style={{ position: 'sticky', top: 84, animation: 'fadeUp 0.25s ease' }}>
            <div style={{ background: 'rgba(17,26,46,0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(240,244,255,0.08)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg,rgba(47,125,246,0.1),rgba(139,124,246,0.08))', padding: '1.4rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(47,125,246,0.6),transparent)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(47,125,246,0.15)', border: '2px solid rgba(47,125,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#2F7DF6' }} className="lc-display">
                      {selected.business_name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="lc-display" style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{selected.business_name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(154,172,201,0.6)', marginBottom: 7 }}>{selected.contact_name}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className="lc-mono" style={{ fontSize: 9, color: TIER[selProfile.tier], background: `${TIER[selProfile.tier]}18`, border: `1px solid ${TIER[selProfile.tier]}40`, padding: '3px 10px', borderRadius: 10, fontWeight: 700 }}>{selProfile.tier.toUpperCase()} TIER</span>
                        <span style={{ fontSize: 9, color: '#12B76A', background: 'rgba(18,183,106,0.12)', border: '1px solid rgba(18,183,106,0.25)', padding: '3px 10px', borderRadius: 10, fontWeight: 700 }}>✓ Approved</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(154,172,201,0.7)', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>

                {/* Quick stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: '1.1rem' }}>
                  {[
                    ['Orders', selProfile.orders.length, '#fff'],
                    ['Avg. order', fmtMoney(selProfile.avgOrderValue), '#9AACC9'],
                    ['Revenue', fmtMoney(selProfile.revenue), '#12B76A'],
                    ['Partner for', selProfile.tenureDays < 30 ? `${selProfile.tenureDays}d` : `${Math.round(selProfile.tenureDays/30)}mo`, '#8B7CF6'],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ fontSize: 7.5, color: 'rgba(154,172,201,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                      <div className="lc-mono" style={{ fontSize: 14, fontWeight: 700, color }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Activity + recency strip */}
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: 'rgba(154,172,201,0.6)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACTIVITY[selProfile.activity].color, boxShadow: `0 0 6px ${ACTIVITY[selProfile.activity].color}` }} />
                  {ACTIVITY[selProfile.activity].label}
                  {selProfile.lastOrderDays !== null && <span>· last order {selProfile.lastOrderDays === 0 ? 'today' : `${selProfile.lastOrderDays}d ago`}</span>}
                </div>
              </div>

              {/* TABS */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(240,244,255,0.06)' }}>
                {[['info','Info'],['activity','Activity'],['documents','Docs'],['orders','Orders'],['credentials','Creds']].map(([key, label]) => (
                  <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '10px 4px', fontSize: 10.5, fontWeight: 700, color: tab === key ? '#2F7DF6' : 'rgba(154,172,201,0.55)', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `2px solid ${tab === key ? '#2F7DF6' : 'transparent'}`, cursor: 'pointer' }}>{label}</button>
                ))}
              </div>

              <div style={{ maxHeight: '58vh', overflowY: 'auto' }}>

                {/* INFO TAB */}
                {tab === 'info' && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: 9, color: '#2F7DF6', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Application information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        ['Business name', selected.business_name, IC.business],
                        ['Contact name', selected.contact_name, IC.user],
                        ['Email', selected.email, IC.mail],
                        ['Phone', selected.phone || '—', IC.phone],
                        ['Business type', selected.business_type || '—', IC.factory],
                        ['Monthly volume', selected.monthly_volume || '—', IC.chart],
                        ['Years in business', selected.years_in_business || '—', IC.calendar],
                        ['Address', selected.address || '—', IC.pin],
                        ['EIN number', selected.ein_number || selected.ein || '—', IC.hash],
                        ['Resale tax #', selected.resale_tax_number || '—', IC.doc],
                        ['Member since', fmtDate(selected.created_at), IC.calendar],
                        ['Client ID', `#${selected.id}`, IC.hash],
                      ].map(([label, val, icon]) => (
                        <div key={label} style={{ padding: '9px 11px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,244,255,0.06)', borderRadius: 6 }}>
                          <div style={{ fontSize: 8, color: 'rgba(154,172,201,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ opacity: 0.7 }}>{icon}</span>{label}
                          </div>
                          <div className={label === 'Client ID' || label === 'EIN number' ? 'lc-mono' : ''} style={{ fontSize: 12, fontWeight: 600, color: val === '—' ? 'rgba(154,172,201,0.4)' : '#F0F4FF', wordBreak: 'break-all' }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    {selProfile.topProducts.length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 9, color: '#8B7CF6', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Top purchased products</div>
                        {selProfile.topProducts.map(([name, qty]) => (
                          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(240,244,255,0.05)' }}>
                            <span style={{ fontSize: 11.5, color: '#F0F4FF' }}>{name}</span>
                            <span className="lc-mono" style={{ fontSize: 11, color: '#8B7CF6', fontWeight: 700 }}>×{qty}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                      <a href={`mailto:${selected.email}`} style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(47,125,246,0.1)', border: '1px solid rgba(47,125,246,0.25)', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#2F7DF6', textDecoration: 'none' }}>
                        Email client
                      </a>
                      {selected.phone && (
                        <a href={`tel:${selected.phone}`} style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, fontSize: 12, fontWeight: 700, color: 'rgba(154,172,201,0.8)', textDecoration: 'none' }}>
                          Call client
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* ACTIVITY TAB */}
                {tab === 'activity' && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: 9, color: '#2F7DF6', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Account intelligence</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                      {[
                        ['Lifetime orders', selProfile.orders.length, '#fff'],
                        ['Completed orders', selProfile.completed.length, '#12B76A'],
                        ['Cancelled orders', selProfile.cancelled.length, selProfile.cancelled.length > 0 ? '#EF4444' : 'rgba(154,172,201,0.5)'],
                        ['Total items bought', selProfile.totalItems, '#8B7CF6'],
                        ['Total ordered value', fmtMoney(totalOrdered(selected)), '#9AACC9'],
                        ['Confirmed revenue', fmtMoney(selProfile.revenue), '#12B76A'],
                        ['Avg. order value', fmtMoney(selProfile.avgOrderValue), '#F2A93B'],
                        ['Partner tenure', `${selProfile.tenureDays} days`, '#E8B657'],
                      ].map(([label, val, color]) => (
                        <div key={label} style={{ padding: '9px 11px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,244,255,0.06)', borderRadius: 6 }}>
                          <div style={{ fontSize: 8, color: 'rgba(154,172,201,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                          <div className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color }}>{val}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: 9, color: '#8B7CF6', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Order status breakdown</div>
                    {['new','review','confirmed','dispatched','completed','cancelled'].map(st => {
                      const count = selProfile.orders.filter(o => o.status === st).length
                      if (!count) return null
                      const pct = (count / selProfile.orders.length) * 100
                      return (
                        <div key={st} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 3 }}>
                            <span style={{ color: statusColor[st] }}>{statusLabel[st]}</span>
                            <span className="lc-mono" style={{ color: 'rgba(154,172,201,0.6)' }}>{count}</span>
                          </div>
                          <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: statusColor[st], borderRadius: 3 }} />
                          </div>
                        </div>
                      )
                    })}
                    {selProfile.orders.length === 0 && <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(154,172,201,0.4)', fontSize: 12 }}>No order activity yet.</div>}

                    {selProfile.firstOrder && (
                      <div style={{ marginTop: 14, padding: '10px 12px', background: 'rgba(47,125,246,0.05)', border: '1px solid rgba(47,125,246,0.15)', borderRadius: 6, fontSize: 11, color: 'rgba(154,172,201,0.7)' }}>
                        First order placed <strong style={{ color: '#F0F4FF' }}>{fmtDate(selProfile.firstOrder.submitted_at)}</strong> · Most recent <strong style={{ color: '#F0F4FF' }}>{fmtDate(selProfile.lastOrder.submitted_at)}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* DOCUMENTS TAB */}
                {tab === 'documents' && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: 9, color: '#2F7DF6', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Legal documents</div>
                    {[
                      { label: 'EIN / SS4 Letter', icon: IC.landmark, num: selected.ein_number || selected.ein, numLabel: 'EIN Number', url: selected.ein_document_url },
                      { label: 'Resale Tax Certificate', icon: IC.doc, num: selected.resale_tax_number, numLabel: 'Resale Tax #', url: selected.resale_tax_document_url },
                    ].map(doc => (
                      <div key={doc.label} style={{ background: doc.url ? 'rgba(47,125,246,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${doc.url ? 'rgba(47,125,246,0.2)' : 'rgba(240,244,255,0.06)'}`, borderRadius: 8, padding: '1.25rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                          <span style={{ color: '#2F7DF6' }}>{doc.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{doc.label}</div>
                          </div>
                          {doc.url ? <span style={{ fontSize: 9, padding: '3px 10px', background: 'rgba(18,183,106,0.15)', color: '#12B76A', borderRadius: 10, fontWeight: 700 }}>Uploaded</span>
                            : <span style={{ fontSize: 9, padding: '3px 10px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderRadius: 10, fontWeight: 700 }}>Missing</span>}
                        </div>
                        <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{doc.numLabel}</div>
                          <div className="lc-mono" style={{ fontSize: 14, fontWeight: 700, color: doc.num ? '#fff' : 'rgba(154,172,201,0.4)' }}>{doc.num || 'Not provided'}</div>
                        </div>
                        {doc.url ? (
                          <button onClick={() => openDoc(doc.url)} style={{ width: '100%', padding: '11px', background: 'linear-gradient(135deg,#2F7DF6,#1B5FD1)', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 6, boxShadow: '0 4px 14px rgba(47,125,246,0.3)' }}>
                            Open / Download PDF
                          </button>
                        ) : (
                          <div style={{ padding: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 6, fontSize: 11, color: '#EF4444', textAlign: 'center' }}>
                            Document not submitted by client
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ORDERS TAB */}
                {tab === 'orders' && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: 9, color: '#2F7DF6', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                      Order history · {selProfile.orders.length} orders
                    </div>
                    {selProfile.orders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(154,172,201,0.4)', fontSize: 12 }}>No orders from this client yet.</div>
                    ) : (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: '1rem' }}>
                          {[
                            ['Total orders', selProfile.orders.length, '#fff'],
                            ['Total value', fmtMoney(totalOrdered(selected)), '#2F7DF6'],
                            ['Confirmed revenue', fmtMoney(selProfile.revenue), '#12B76A'],
                          ].map(([label, val, color]) => (
                            <div key={label} style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(240,244,255,0.06)', borderRadius: 6, textAlign: 'center' }}>
                              <div style={{ fontSize: 8, color: 'rgba(154,172,201,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
                              <div className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color }}>{val}</div>
                            </div>
                          ))}
                        </div>
                        {selProfile.orders.map(order => (
                          <div key={order.id} style={{ padding: '12px', marginBottom: 8, background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(240,244,255,0.06)', borderRight: '1px solid rgba(240,244,255,0.06)', borderBottom: '1px solid rgba(240,244,255,0.06)', borderLeft: `3px solid ${statusColor[order.status] || 'rgba(154,172,201,0.5)'}`, borderRadius: 6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                              <div>
                                <div className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color: '#F0F4FF', marginBottom: 2 }}>#{order.order_number}</div>
                                <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)' }}>{fmtDateShort(order.submitted_at)} · {order.order_items?.length || 0} items</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div className="lc-mono" style={{ fontSize: 15, fontWeight: 700, color: ['confirmed','dispatched','completed'].includes(order.status) ? '#12B76A' : '#fff' }}>{fmtMoney(order.total)}</div>
                                <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 8, background: `${statusColor[order.status]}20`, color: statusColor[order.status], fontWeight: 700 }}>{statusLabel[order.status]}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {order.order_items?.slice(0,3).map((item, i) => (
                                <span key={i} style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', color: 'rgba(154,172,201,0.6)', borderRadius: 8 }}>{item.product_name} ×{item.quantity}</span>
                              ))}
                              {order.order_items?.length > 3 && <span style={{ fontSize: 9, color: 'rgba(154,172,201,0.4)' }}>+{order.order_items.length - 3} more</span>}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* CREDENTIALS TAB */}
                {tab === 'credentials' && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: 12, color: 'rgba(154,172,201,0.7)', lineHeight: 1.7, marginBottom: '1.25rem', padding: '10px 14px', background: 'rgba(242,169,59,0.06)', border: '1px solid rgba(242,169,59,0.15)', borderRadius: 6 }}>
                      ⚠️ First create the user in <strong style={{ color: '#F0F4FF' }}>Supabase → Authentication → Users → Add user</strong>, then send credentials here.
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: 9, color: 'rgba(154,172,201,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Client email *</label>
                      <input type="email" value={credEmail} onChange={e => setCredEmail(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, padding: '10px 12px', borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: 9, color: 'rgba(154,172,201,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Temporary password *</label>
                      <input type="text" value={credPassword} onChange={e => setCredPassword(e.target.value)} placeholder="e.g. Levam2025!"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, padding: '10px 12px', borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    {sent ? (
                      <div style={{ padding: '12px', background: 'rgba(18,183,106,0.12)', border: '1px solid rgba(18,183,106,0.3)', borderRadius: 6, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#12B76A' }}>✓ Credentials sent!</div>
                    ) : (
                      <button onClick={sendCredentials} disabled={sending} style={{ width: '100%', padding: 12, background: sending ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#2F7DF6,#1B5FD1)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: sending ? 'not-allowed' : 'pointer', borderRadius: 6, boxShadow: sending ? 'none' : '0 4px 14px rgba(47,125,246,0.3)' }}>
                        {sending ? 'Sending...' : 'Send credentials email'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const IC = {
  users:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  package:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  dollar:   <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  clock:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pulse:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  star:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  search:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  business: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/></svg>,
  user:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  mail:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  phone:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  factory:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M4 20V10l4 3v-3l4 3v-3l4 3V4l4 4v12"/></svg>,
  chart:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  calendar: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  pin:      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  hash:     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  doc:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>,
  landmark: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>,
}
