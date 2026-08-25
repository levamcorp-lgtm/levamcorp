'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'
const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

const NAV_LINKS = [['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart'],['Offers','/admin/offers'],['Recruit','/admin/recruit'],['Analytics','/admin/insights']]

const STATUS = {
  new:        { color: '#2F7DF6', label: 'New' },
  review:     { color: '#F2A93B', label: 'Review' },
  confirmed:  { color: '#8B7CF6', label: 'Confirmed' },
  dispatched: { color: '#12B76A', label: 'Dispatched' },
  completed:  { color: '#12B76A', label: 'Done' },
  cancelled:  { color: '#EF4444', label: 'Cancelled' },
}

function AdminNav({ active, newOrders, unreadMessages, pendingApps, onLogout, now }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 2rem', background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(240,244,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, border: '1.5px solid rgba(47,125,246,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(47,125,246,0.06)' }}>
            <div style={{ width: 9, height: 9, background: '#2F7DF6', borderRadius: 2, boxShadow: '0 0 8px rgba(47,125,246,0.6)' }} />
          </div>
          <div>
            <div className="lc-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>LEVAM<span style={{ color: '#2F7DF6' }}>CORP</span></div>
            <div className="lc-mono" style={{ fontSize: 7, color: 'rgba(154,172,201,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Mission control</div>
          </div>
        </div>
        <div style={{ display: 'flex', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 20, gap: 2, flexWrap: 'wrap' }}>
          {NAV_LINKS.map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 11.5, fontWeight: 600, color: label === active ? '#fff' : 'rgba(154,172,201,0.6)', textDecoration: 'none', padding: '5px 10px', borderRadius: 5, position: 'relative', background: label === active ? 'rgba(47,125,246,0.12)' : 'transparent', transition: 'color 0.15s,background 0.15s' }}>
              {label}
              {label === 'Orders' && newOrders > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, background: '#EF4444', borderRadius: '50%', boxShadow: '0 0 6px #EF4444' }} />}
              {label === 'Messages' && unreadMessages > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, background: '#EF4444', borderRadius: '50%', boxShadow: '0 0 6px #EF4444' }} />}
              {label === 'Applications' && pendingApps > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, background: '#EF4444', borderRadius: '50%', boxShadow: '0 0 6px #EF4444' }} />}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="lc-mono">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#12B76A', boxShadow: '0 0 6px #12B76A' }} />
          <span style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)' }}>{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <button onClick={onLogout} style={{ fontSize: 11, color: 'rgba(154,172,201,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </div>
    </nav>
  )
}

function Panel({ title, icon, accent = '#2F7DF6', href, linkLabel = 'Manage →', alert, children }) {
  return (
    <div style={{ background: 'rgba(17,26,46,0.55)', backdropFilter: 'blur(16px)', border: `1px solid ${alert ? accent + '40' : 'rgba(240,244,255,0.07)'}`, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${accent}60,transparent)` }} />
      <div style={{ padding: '0.8rem 1.1rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(240,244,255,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, display: 'flex', alignItems: 'center', gap: 6 }}>{icon} {title}</div>
        {href && <Link href={href} style={{ fontSize: 9.5, color: 'rgba(154,172,201,0.5)', textDecoration: 'none' }}>{linkLabel}</Link>}
      </div>
      {children}
    </div>
  )
}

const Row = ({ label, val, color = '#9AACC9' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: '1px solid rgba(240,244,255,0.04)' }}>
    <span style={{ fontSize: 11, color: 'rgba(154,172,201,0.6)' }}>{label}</span>
    <span className="lc-mono" style={{ fontSize: 12, fontWeight: 700, color }}>{val}</span>
  </div>
)

export default function AdminDashboard() {
  const [data, setData] = useState({
    orders: [], clients: [], applications: [], products: [],
    payments: [], messages: [], investments: []
  })
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentMonth = now.toLocaleString('en-US', { month: 'long' })
  const currentYear = now.getFullYear()
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const fmtMoney = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: authData }) => {
      if (!authData.user || authData.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      const [
        { data: orders }, { data: clients }, { data: applications },
        { data: products }, { data: payments }, { data: messages },
        { data: investments }
      ] = await Promise.all([
        supabase.from('orders').select('*, order_items(*, products(cost_price))').order('submitted_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name'),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('partner_investments').select('*'),
      ])
      setData({ orders: orders||[], clients: clients||[], applications: applications||[], products: products||[], payments: payments||[], messages: messages||[], investments: investments||[] })
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  // Calculations
  const completedOrders = data.orders.filter(o => ['confirmed','dispatched','completed'].includes(o.status))
  const newOrders = data.orders.filter(o => o.status === 'new')
  const activeOrders = data.orders.filter(o => ['review','confirmed','dispatched'].includes(o.status))
  const pendingApps = data.applications.filter(a => a.status === 'pending' || !a.status)
  const unreadMessages = data.messages.filter(m => m.status === 'new')
  const pendingPayments = data.payments.filter(p => p.status === 'requested')
  const proofSubmitted = data.payments.filter(p => p.status === 'processing')
  const outOfStock = data.products.filter(p => p.stock === 0)
  const lowStock = data.products.filter(p => p.stock > 0 && p.stock <= 5)

  const totalRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0)
  const calcCost = (order) => (order.order_items || []).reduce((s, i) => s + ((i.products?.cost_price || 0) * i.quantity), 0)
  const totalCost = completedOrders.reduce((s, o) => s + calcCost(o), 0)
  const totalProfit = totalRevenue - totalCost

  // Revenue includes confirmed, dispatched and completed orders
  const monthOrders = completedOrders.filter(o => {
    const d = new Date(o.submitted_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === currentYear
  })
  const monthRevenue = monthOrders.reduce((s, o) => s + (o.total || 0), 0)
  const monthCost = monthOrders.reduce((s, o) => s + calcCost(o), 0)
  const monthProfit = monthRevenue - monthCost

  const currentInvestments = data.investments.filter(i => i.month === currentMonth && i.year === currentYear)
  const victorInvested = currentInvestments.filter(i => i.partner_name === 'Victor').reduce((s, i) => s + i.amount, 0)
  const leopoldoInvested = currentInvestments.filter(i => i.partner_name === 'Leopoldo').reduce((s, i) => s + i.amount, 0)
  const totalInvested = victorInvested + leopoldoInvested
  const victorShare = totalInvested > 0 ? victorInvested / totalInvested : 0.5
  const leopoldoShare = totalInvested > 0 ? leopoldoInvested / totalInvested : 0.5

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#05070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",-apple-system,sans-serif' }}>
      <style>{`@keyframes pulseDot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, margin: '0 auto 16px', borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(47,125,246,0.15)', borderTopColor: '#2F7DF6', borderRadius: '50%', animation: 'pulseDot 1s linear infinite' }} />
        <div style={{ fontSize: 11, color: 'rgba(154,172,201,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading command center…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#05070C', minHeight: '100vh', fontFamily: '"Inter",-apple-system,sans-serif', color: '#F0F4FF' }}>
      <style>{`
        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.01em; }
        .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
        @keyframes pulseDot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        a:hover { color: #fff !important; }
      `}</style>

      <AdminNav active="Dashboard" newOrders={newOrders.length} unreadMessages={unreadMessages.length} pendingApps={pendingApps.length} onLogout={handleLogout} now={now} />

      {/* SYSTEM STATUS TICKER */}
      <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '7px 2rem', background: 'rgba(47,125,246,0.04)', borderBottom: '1px solid rgba(47,125,246,0.1)', fontSize: 9.5, color: 'rgba(154,172,201,0.55)', letterSpacing: '0.06em', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#12B76A', boxShadow: '0 0 5px #12B76A', animation: 'pulseDot 2s infinite' }} />ALL SYSTEMS OPERATIONAL</span>
        <span>ORDERS: {data.orders.length}</span>
        <span>CLIENTS: {data.clients.length}</span>
        <span>PRODUCTS: {data.products.length}</span>
        <span style={{ color: '#12B76A' }}>REVENUE: {fmtMoney(totalRevenue)}</span>
        {newOrders.length > 0 && <span style={{ color: '#EF4444' }}>⚠ {newOrders.length} ORDER{newOrders.length>1?'S':''} AWAITING REVIEW</span>}
        {pendingApps.length > 0 && <span style={{ color: '#F2A93B' }}>⚠ {pendingApps.length} APPLICATION{pendingApps.length>1?'S':''} PENDING</span>}
      </div>

      {/* HERO HEADER */}
      <div style={{ position: 'relative', padding: '2.25rem 2rem 1.5rem', borderBottom: '1px solid rgba(240,244,255,0.05)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(47,125,246,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '15%', width: 360, height: 360, background: 'radial-gradient(circle,rgba(139,124,246,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2F7DF6', fontWeight: 700, marginBottom: 8 }}>Command center</div>
          <h1 className="lc-display" style={{ fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 5, letterSpacing: '-0.02em' }}>Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, Levam Corp</h1>
          <p style={{ fontSize: 13, color: 'rgba(154,172,201,0.6)' }}>{currentMonth} {currentYear} · Here is everything happening right now</p>
        </div>

        {/* TOP STATS */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10 }}>
          {[
            { label: 'New orders', value: newOrders.length, color: '#EF4444', icon: IC.inbox, href: '/admin/orders', alert: newOrders.length > 0 },
            { label: 'Active orders', value: activeOrders.length, color: '#F2A93B', icon: IC.clock, href: '/admin/orders' },
            { label: 'Pending apps', value: pendingApps.length, color: '#EF4444', icon: IC.clipboard, href: '/admin/applications', alert: pendingApps.length > 0 },
            { label: 'Unread messages', value: unreadMessages.length, color: '#2F7DF6', icon: IC.mail, href: '/admin/messages', alert: unreadMessages.length > 0 },
            { label: 'Payment proofs', value: proofSubmitted.length, color: '#12B76A', icon: IC.card, href: '/admin/payments', alert: proofSubmitted.length > 0 },
            { label: 'Approved clients', value: data.clients.length, color: '#8B7CF6', icon: IC.users, href: '/admin/clients' },
            { label: 'Analytics', value: '→', color: '#E8B657', icon: IC.chart, href: '/admin/insights' },
          ].map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(17,26,46,0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${s.alert ? s.color + '55' : 'rgba(240,244,255,0.07)'}`, borderRadius: 10, padding: '1rem', cursor: 'pointer', position: 'relative', transition: 'transform 0.15s, border-color 0.15s', boxShadow: s.alert ? `0 0 24px ${s.color}22` : 'none' }}>
                {s.alert && <span style={{ position: 'absolute', top: 10, right: 10, width: 7, height: 7, background: s.color, borderRadius: '50%', boxShadow: `0 0 8px ${s.color}`, animation: 'pulseDot 1.6s infinite' }} />}
                <div style={{ color: s.color, marginBottom: 10 }}>{s.icon}</div>
                <div className="lc-display" style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 8.5, color: 'rgba(154,172,201,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>

        {/* COLUMN 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* FINANCIALS */}
          <Panel title="Financials" icon={IC.dollar} accent="#12B76A" href="/admin/profit" linkLabel="View profit →">
            <div style={{ padding: '1rem 1.1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>All-time revenue</div>
                <div className="lc-display" style={{ fontSize: 26, fontWeight: 700, color: '#2F7DF6' }}>{fmtMoney(totalRevenue)}</div>
              </div>
              <Row label="Total cost" val={fmtMoney(totalCost)} color="#F2A93B" />
              <Row label="Total profit" val={fmtMoney(totalProfit)} color={totalProfit >= 0 ? '#12B76A' : '#EF4444'} />
              <Row label="This month revenue" val={fmtMoney(monthRevenue)} color="#2F7DF6" />
              <Row label="This month profit" val={fmtMoney(monthProfit)} color={monthProfit >= 0 ? '#12B76A' : '#EF4444'} />
            </div>
          </Panel>

          {/* PARTNER SPLIT */}
          <Panel title={`Partner split — ${currentMonth}`} icon={IC.users} accent="#8B7CF6" href="/admin/profit">
            <div style={{ padding: '1rem 1.1rem' }}>
              {[
                { name: 'Victor', invested: victorInvested, profit: monthProfit * victorShare, share: victorShare, color: '#2F7DF6' },
                { name: 'Leopoldo', invested: leopoldoInvested, profit: monthProfit * leopoldoShare, share: leopoldoShare, color: '#8B7CF6' },
              ].map(p => (
                <div key={p.name} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color: '#12B76A' }}>{fmtMoney(p.profit)}</div>
                      <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.5)' }}>Invested: {fmtMoney(p.invested)}</div>
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${p.share * 100}%`, background: p.color, borderRadius: 3, boxShadow: `0 0 8px ${p.color}88` }} />
                  </div>
                </div>
              ))}
              {totalInvested === 0 && <div style={{ fontSize: 11, color: 'rgba(154,172,201,0.4)', textAlign: 'center', padding: '0.5rem' }}>No investments recorded this month</div>}
            </div>
          </Panel>

          {/* INVENTORY */}
          <Panel title="Inventory" icon={IC.box} accent="#E8B657" href="/admin/products">
            <div style={{ padding: '1rem 1.1rem' }}>
              <Row label="Total products" val={data.products.length} color="rgba(255,255,255,0.7)" />
              <Row label="In stock" val={data.products.filter(p => p.stock > 5).length} color="#12B76A" />
              <Row label="Low stock (≤5)" val={lowStock.length} color={lowStock.length > 0 ? '#F2A93B' : 'rgba(255,255,255,0.7)'} />
              <Row label="Out of stock" val={outOfStock.length} color={outOfStock.length > 0 ? '#EF4444' : 'rgba(255,255,255,0.7)'} />
              {outOfStock.length > 0 && (
                <div style={{ marginTop: 10, padding: '9px 11px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6 }}>
                  <div style={{ fontSize: 9, color: '#EF4444', fontWeight: 700, marginBottom: 5, letterSpacing: '0.06em' }}>OUT OF STOCK</div>
                  {outOfStock.slice(0,3).map(p => <div key={p.id} style={{ fontSize: 10.5, color: 'rgba(154,172,201,0.7)' }}>{p.name}</div>)}
                  {outOfStock.length > 3 && <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.4)' }}>+{outOfStock.length - 3} more</div>}
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* COLUMN 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* RECENT ORDERS */}
          <Panel title="Recent orders" icon={IC.package} href="/admin/orders" linkLabel="View all →">
            <div>
              {data.orders.slice(0, 6).map(order => {
                const s = STATUS[order.status] || STATUS.new
                return (
                  <Link key={order.id} href="/admin/orders" style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '0.7rem 1.1rem', borderTop: '1px solid rgba(240,244,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div>
                        <div className="lc-mono" style={{ fontSize: 12, fontWeight: 700, color: '#F0F4FF', marginBottom: 2 }}>#{order.order_number}</div>
                        <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)' }}>{fmtDate(order.submitted_at)} at {fmtTime(order.submitted_at)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{fmtMoney(order.total)}</div>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: s.color + '20', color: s.color, fontWeight: 700 }}>{s.label}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Panel>

          {/* PAYMENTS */}
          <Panel title="Payments" icon={IC.card} accent="#12B76A" href="/admin/payments">
            <div style={{ padding: '1rem 1.1rem' }}>
              <Row label="Pending requests" val={pendingPayments.length} color={pendingPayments.length > 0 ? '#F2A93B' : 'rgba(255,255,255,0.7)'} />
              <Row label="Proof submitted" val={proofSubmitted.length} color={proofSubmitted.length > 0 ? '#2F7DF6' : 'rgba(255,255,255,0.7)'} />
              <Row label="Paid" val={data.payments.filter(p => p.status === 'paid').length} color="#12B76A" />
            </div>
          </Panel>
        </div>

        {/* COLUMN 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* PENDING APPLICATIONS */}
          <Panel title={`Applications${pendingApps.length > 0 ? ` (${pendingApps.length} pending)` : ''}`} icon={IC.clipboard} accent="#EF4444" href="/admin/applications" linkLabel="Review →" alert={pendingApps.length > 0}>
            {pendingApps.length === 0 ? (
              <div style={{ padding: '1.25rem', fontSize: 11, color: 'rgba(154,172,201,0.4)', textAlign: 'center' }}>No pending applications</div>
            ) : pendingApps.slice(0,4).map(app => (
              <Link key={app.id} href="/admin/applications" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.7rem 1.1rem', borderTop: '1px solid rgba(240,244,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#F0F4FF', marginBottom: 1 }}>{app.business_name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)' }}>{app.contact_name} · {fmtDate(app.created_at)}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#EF4444', fontWeight: 700 }}>Review</span>
                </div>
              </Link>
            ))}
          </Panel>

          {/* RECENT CLIENTS */}
          <Panel title="Recent clients" icon={IC.handshake} href="/admin/clients" linkLabel="View all →">
            {data.clients.slice(0,4).map(client => (
              <Link key={client.id} href="/admin/clients" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.7rem 1.1rem', borderTop: '1px solid rgba(240,244,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(47,125,246,0.15)', border: '1px solid rgba(47,125,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2F7DF6' }}>{client.business_name?.[0]}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#F0F4FF' }}>{client.business_name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)' }}>{client.contact_name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: 'rgba(18,183,106,0.12)', color: '#12B76A', fontWeight: 700 }}>Active</div>
                </div>
              </Link>
            ))}
          </Panel>

          {/* MESSAGES */}
          <Panel title={`Messages${unreadMessages.length > 0 ? ` (${unreadMessages.length} new)` : ''}`} icon={IC.mail} href="/admin/messages" linkLabel="View all →" alert={unreadMessages.length > 0}>
            {data.messages.slice(0,4).map(msg => (
              <Link key={msg.id} href="/admin/messages" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.7rem 1.1rem', borderTop: '1px solid rgba(240,244,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#F0F4FF' }}>{msg.name}</div>
                      {msg.status === 'new' && <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 8, background: 'rgba(47,125,246,0.2)', color: '#2F7DF6', fontWeight: 700 }}>NEW</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 160 }}>{msg.message}</div>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.4)', flexShrink: 0 }}>{fmtDate(msg.created_at)}</div>
                </div>
              </Link>
            ))}
            {data.messages.length === 0 && <div style={{ padding: '1.25rem', fontSize: 11, color: 'rgba(154,172,201,0.4)', textAlign: 'center' }}>No messages yet</div>}
          </Panel>
        </div>
      </div>
    </div>
  )
}

const IC = {
  inbox:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  clock:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  clipboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  mail:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  card:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chart:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  dollar:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  box:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>,
  package:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  handshake: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
}
