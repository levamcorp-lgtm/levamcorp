'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

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
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', left: 10, top: 0, width: 3, height: 38, background: '#333' }} />
          <div style={{ position: 'absolute', left: 10, bottom: 0, width: 26, height: 3, background: '#333' }} />
          <div style={{ position: 'absolute', left: 16, bottom: 10, width: 16, height: 3, background: '#2d7dd2' }} />
        </div>
        <div style={{ fontSize: 12, color: '#444', letterSpacing: '0.1em' }}>Loading dashboard...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 28, height: 28 }}>
              <div style={{ position: 'absolute', left: 6, top: 0, width: 2, height: 22, background: '#333' }} />
              <div style={{ position: 'absolute', left: 6, bottom: 0, width: 16, height: 2, background: '#333' }} />
              <div style={{ position: 'absolute', left: 10, bottom: 6, width: 10, height: 2.5, background: '#2d7dd2' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Levam Admin</div>
              <div style={{ fontSize: 7, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Staff only</div>
            </div>
          </div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Dashboard' ? '#2d7dd2' : '#666', textDecoration: 'none', padding: '4px 12px', borderBottom: label === 'Dashboard' ? '2px solid #2d7dd2' : '2px solid transparent', position: 'relative' }}>
                {label}
                {label === 'Orders' && newOrders.length > 0 && <span style={{ position: 'absolute', top: 0, right: 2, width: 7, height: 7, background: '#e74c3c', borderRadius: '50%' }} />}
                {label === 'Messages' && unreadMessages.length > 0 && <span style={{ position: 'absolute', top: 0, right: 2, width: 7, height: 7, background: '#e74c3c', borderRadius: '50%' }} />}
                {label === 'Applications' && pendingApps.length > 0 && <span style={{ position: 'absolute', top: 0, right: 2, width: 7, height: 7, background: '#e74c3c', borderRadius: '50%' }} />}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 11, color: '#444' }}>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      {/* HERO HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #111 50%, #0d1a0d 100%)', padding: '2rem 2rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 6 }}>Command center</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, Levam Corp 👋</h1>
          <p style={{ fontSize: 12, color: '#444' }}>{currentMonth} {currentYear} · Here is everything happening right now</p>
        </div>

        {/* TOP STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
          {[
            { label: 'New orders', value: newOrders.length, color: newOrders.length > 0 ? '#e74c3c' : '#555', bg: newOrders.length > 0 ? 'rgba(231,76,60,0.1)' : 'rgba(255,255,255,0.03)', icon: '📥', href: '/admin/orders', alert: newOrders.length > 0 },
            { label: 'Active orders', value: activeOrders.length, color: '#854f0b', bg: 'rgba(255,255,255,0.03)', icon: '⏳', href: '/admin/orders' },
            { label: 'Pending apps', value: pendingApps.length, color: pendingApps.length > 0 ? '#e74c3c' : '#555', bg: pendingApps.length > 0 ? 'rgba(231,76,60,0.08)' : 'rgba(255,255,255,0.03)', icon: '📋', href: '/admin/applications', alert: pendingApps.length > 0 },
            { label: 'Unread messages', value: unreadMessages.length, color: unreadMessages.length > 0 ? '#2d7dd2' : '#555', bg: unreadMessages.length > 0 ? 'rgba(45,125,210,0.08)' : 'rgba(255,255,255,0.03)', icon: '📩', href: '/admin/messages', alert: unreadMessages.length > 0 },
            { label: 'Payment proofs', value: proofSubmitted.length, color: proofSubmitted.length > 0 ? '#2a7d4f' : '#555', bg: proofSubmitted.length > 0 ? 'rgba(42,125,79,0.08)' : 'rgba(255,255,255,0.03)', icon: '💳', href: '/admin/payments', alert: proofSubmitted.length > 0 },
            { label: 'Approved clients', value: data.clients.length, color: '#2d7dd2', bg: 'rgba(255,255,255,0.03)', icon: '🤝', href: '/admin/clients' },
          ].map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: s.bg, border: `0.5px solid ${s.alert ? s.color + '40' : 'rgba(255,255,255,0.05)'}`, borderRadius: 6, padding: '1rem', cursor: 'pointer', position: 'relative' }}>
                {s.alert && <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: '#e74c3c', borderRadius: '50%' }} />}
                <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>

        {/* COLUMN 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* FINANCIALS */}
          <div style={{ background: '#111', border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', background: 'rgba(42,125,79,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2a7d4f' }}>💰 Financials</div>
              <Link href="/admin/profit" style={{ fontSize: 10, color: '#2a7d4f', textDecoration: 'none' }}>View profit →</Link>
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>All-time revenue</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#2d7dd2' }}>{fmtMoney(totalRevenue)}</div>
              </div>
              {[
                ['Total cost', fmtMoney(totalCost), '#854f0b'],
                ['Total profit', fmtMoney(totalProfit), totalProfit >= 0 ? '#2a7d4f' : '#e74c3c'],
                ['This month revenue', fmtMoney(monthRevenue), '#2d7dd2'],
                ['This month profit', fmtMoney(monthProfit), monthProfit >= 0 ? '#2a7d4f' : '#e74c3c'],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 11, color: '#555' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PARTNER SPLIT */}
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', background: '#0d0d0d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ccc' }}>👥 Partner split — {currentMonth}</div>
              <Link href="/admin/profit" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>Manage →</Link>
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              {[
                { name: 'Victor', invested: victorInvested, profit: monthProfit * victorShare, share: victorShare, color: '#2d7dd2' },
                { name: 'Leopoldo', invested: leopoldoInvested, profit: monthProfit * leopoldoShare, share: leopoldoShare, color: '#534ab7' },
              ].map(p => (
                <div key={p.name} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2a7d4f' }}>{fmtMoney(p.profit)}</div>
                      <div style={{ fontSize: 9, color: '#444' }}>Invested: {fmtMoney(p.invested)}</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${p.share * 100}%`, background: p.color, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
              {totalInvested === 0 && <div style={{ fontSize: 11, color: '#444', textAlign: 'center', padding: '0.5rem' }}>No investments recorded this month</div>}
            </div>
          </div>

          {/* INVENTORY */}
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', background: '#0d0d0d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ccc' }}>📦 Inventory</div>
              <Link href="/admin/products" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>Manage →</Link>
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              {[
                ['Total products', data.products.length, '#ccc'],
                ['In stock', data.products.filter(p => p.stock > 5).length, '#2a7d4f'],
                ['Low stock (≤5)', lowStock.length, lowStock.length > 0 ? '#854f0b' : '#555'],
                ['Out of stock', outOfStock.length, outOfStock.length > 0 ? '#e74c3c' : '#555'],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 11, color: '#555' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
              {outOfStock.length > 0 && (
                <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(231,76,60,0.06)', border: '0.5px solid rgba(231,76,60,0.2)', borderRadius: 3 }}>
                  <div style={{ fontSize: 9, color: '#e74c3c', fontWeight: 700, marginBottom: 4 }}>OUT OF STOCK</div>
                  {outOfStock.slice(0,3).map(p => <div key={p.id} style={{ fontSize: 10, color: '#888' }}>{p.name}</div>)}
                  {outOfStock.length > 3 && <div style={{ fontSize: 10, color: '#555' }}>+{outOfStock.length - 3} more</div>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* RECENT ORDERS */}
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', background: '#0d0d0d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ccc' }}>📋 Recent orders</div>
              <Link href="/admin/orders" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>View all →</Link>
            </div>
            <div>
              {data.orders.slice(0, 6).map(order => {
                const statusConfig = { new: { color: '#2d7dd2', label: 'New' }, review: { color: '#854f0b', label: 'Review' }, confirmed: { color: '#534ab7', label: 'Confirmed' }, dispatched: { color: '#2a7d4f', label: 'Dispatched' }, completed: { color: '#2a7d4f', label: 'Done' }, cancelled: { color: '#e74c3c', label: 'Cancelled' } }
                const s = statusConfig[order.status] || statusConfig.new
                return (
                  <Link key={order.id} href="/admin/orders" style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '0.75rem 1.25rem', borderTop: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', marginBottom: 2 }}>#{order.order_number}</div>
                        <div style={{ fontSize: 10, color: '#444' }}>{fmtDate(order.submitted_at)} at {fmtTime(order.submitted_at)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{fmtMoney(order.total)}</div>
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: s.color + '20', color: s.color, fontWeight: 600 }}>{s.label}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* PAYMENTS */}
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', background: '#0d0d0d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ccc' }}>💳 Payments</div>
              <Link href="/admin/payments" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>Manage →</Link>
            </div>
            <div style={{ padding: '1rem 1.25rem' }}>
              {[
                ['Pending requests', pendingPayments.length, pendingPayments.length > 0 ? '#854f0b' : '#555'],
                ['Proof submitted', proofSubmitted.length, proofSubmitted.length > 0 ? '#2d7dd2' : '#555'],
                ['Paid', data.payments.filter(p => p.status === 'paid').length, '#2a7d4f'],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 11, color: '#555' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMN 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* PENDING APPLICATIONS */}
          <div style={{ background: '#111', border: `0.5px solid ${pendingApps.length > 0 ? 'rgba(231,76,60,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', background: pendingApps.length > 0 ? 'rgba(231,76,60,0.06)' : '#0d0d0d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: pendingApps.length > 0 ? '#e74c3c' : '#ccc' }}>📋 Applications {pendingApps.length > 0 && `(${pendingApps.length} pending)`}</div>
              <Link href="/admin/applications" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>Review →</Link>
            </div>
            {pendingApps.length === 0 ? (
              <div style={{ padding: '1.25rem', fontSize: 11, color: '#444', textAlign: 'center' }}>No pending applications</div>
            ) : pendingApps.slice(0,4).map(app => (
              <Link key={app.id} href="/admin/applications" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', marginBottom: 1 }}>{app.business_name}</div>
                    <div style={{ fontSize: 10, color: '#444' }}>{app.contact_name} · {fmtDate(app.created_at)}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 10, background: 'rgba(231,76,60,0.1)', color: '#e74c3c', fontWeight: 700 }}>Review</span>
                </div>
              </Link>
            ))}
          </div>

          {/* RECENT CLIENTS */}
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', background: '#0d0d0d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ccc' }}>🤝 Recent clients</div>
              <Link href="/admin/clients" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>View all →</Link>
            </div>
            {data.clients.slice(0,4).map(client => (
              <Link key={client.id} href="/admin/clients" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(45,125,210,0.15)', border: '1px solid rgba(45,125,210,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2d7dd2' }}>{client.business_name?.[0]}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{client.business_name}</div>
                      <div style={{ fontSize: 10, color: '#444' }}>{client.contact_name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', fontWeight: 600 }}>Active</div>
                </div>
              </Link>
            ))}
          </div>

          {/* MESSAGES */}
          <div style={{ background: '#111', border: `0.5px solid ${unreadMessages.length > 0 ? 'rgba(45,125,210,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1.25rem', background: '#0d0d0d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: unreadMessages.length > 0 ? '#2d7dd2' : '#ccc' }}>📩 Messages {unreadMessages.length > 0 && `(${unreadMessages.length} new)`}</div>
              <Link href="/admin/messages" style={{ fontSize: 10, color: '#555', textDecoration: 'none' }}>View all →</Link>
            </div>
            {data.messages.slice(0,4).map(msg => (
              <Link key={msg.id} href="/admin/messages" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.75rem 1.25rem', borderTop: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{msg.name}</div>
                      {msg.status === 'new' && <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 8, background: 'rgba(45,125,210,0.2)', color: '#2d7dd2', fontWeight: 700 }}>NEW</span>}
                    </div>
                    <div style={{ fontSize: 10, color: '#444', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 160 }}>{msg.message}</div>
                  </div>
                  <div style={{ fontSize: 9, color: '#333', flexShrink: 0 }}>{fmtDate(msg.created_at)}</div>
                </div>
              </Link>
            ))}
            {data.messages.length === 0 && <div style={{ padding: '1.25rem', fontSize: 11, color: '#444', textAlign: 'center' }}>No messages yet</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
