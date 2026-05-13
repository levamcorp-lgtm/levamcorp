'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)
      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', data.user.id)
        .order('submitted_at', { ascending: false })
        .limit(5)
      setOrders(ordersData || [])
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
  }

  const statusBadge = (status) => {
    const map = {
      new: { label: 'New', bg: 'rgba(231,76,60,0.1)', color: '#c0392b' },
      review: { label: 'In review', bg: 'rgba(45,125,210,0.1)', color: '#2d7dd2' },
      confirmed: { label: 'Confirmed', bg: 'rgba(42,125,79,0.08)', color: '#2a7d4f' },
      completed: { label: 'Completed', bg: 'rgba(42,125,79,0.08)', color: '#2a7d4f' },
      dispatched: { label: 'Dispatched', bg: 'rgba(42,125,79,0.08)', color: '#2a7d4f' },
    }
    const s = map[status] || { label: status, bg: '#f0f0f0', color: '#888' }
    return (
      <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 2, background: s.bg, color: s.color, border: `0.5px solid ${s.color}30` }}>
        {s.label}
      </span>
    )
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>
      Loading...
    </div>
  )

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 32, height: 32 }}>
              <div style={{ position: 'absolute', left: 7, top: 0, width: 2, height: 25, background: '#444' }} />
              <div style={{ position: 'absolute', left: 7, bottom: 0, width: 18, height: 2, background: '#444' }} />
              <div style={{ position: 'absolute', left: 11, bottom: 7, width: 11, height: 2.5, background: '#2d7dd2' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase' }}>Levam</div>
              <div style={{ fontSize: 8, letterSpacing: '0.28em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Partner Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, borderLeft: '0.5px solid rgba(255,255,255,0.08)', paddingLeft: 20 }}>
            {[['Dashboard', '/portal/dashboard'], ['Catalog', '/portal/catalog'], ['My orders', '/portal/orders'], ['Invoices', '/portal/invoices'], ['Payments', '/portal/payments']].map(([label, href]) => (
              <Link key={label} href={href} style={{
                fontSize: 12, color: label === 'Dashboard' ? '#2d7dd2' : '#888',
                textDecoration: 'none', padding: '4px 14px',
                borderBottom: label === 'Dashboard' ? '2px solid #2d7dd2' : '2px solid transparent'
              }}>{label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#2d7dd2' }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer', fontWeight: 500 }}>Sign out</button>
        </div>
      </nav>

      <div style={{ padding: '2rem' }}>

        {/* WELCOME */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111', marginBottom: 4 }}>Welcome back 👋</h2>
          <p style={{ fontSize: 12, color: '#aaa' }}>{user?.email} · Approved partner</p>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1.5rem' }}>
          {[
            { icon: '📦', label: 'Browse catalog', desc: 'View products & pricing', href: '/portal/catalog', color: '#2d7dd2' },
            { icon: '📋', label: 'New quote', desc: 'Start an order quote', href: '/portal/catalog', color: '#2a7d4f' },
            { icon: '🧾', label: 'My invoices', desc: 'View & download', href: '/portal/invoices', color: '#854f0b' },
            { icon: '📜', label: 'Order history', desc: 'Track your orders', href: '/portal/orders', color: '#534ab7' },
          ].map(item => (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s' }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* RECENT ORDERS */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>Recent orders</div>
            <Link href="/portal/orders" style={{ fontSize: 11, color: '#2d7dd2', textDecoration: 'none' }}>View all →</Link>
          </div>

          {orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#ccc' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📦</div>
              <div style={{ fontSize: 13, color: '#bbb', marginBottom: 8 }}>No orders yet</div>
              <Link href="/portal/catalog" style={{
                fontSize: 11, padding: '8px 20px', background: '#2d7dd2', color: '#fff',
                borderRadius: 2, textDecoration: 'none', display: 'inline-block', fontWeight: 500
              }}>Browse catalog to start</Link>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f7f8fa' }}>
                  {['Order ID', 'Items', 'Total', 'Date', 'Status'].map(h => (
                    <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '8px 1.25rem', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                    <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 500, color: '#333' }}>#{order.order_number}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#888' }}>{order.items_count || '—'} items</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 500, color: '#111' }}>${order.total?.toLocaleString()}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#bbb' }}>{new Date(order.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td style={{ padding: '12px 1.25rem' }}>{statusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* FOOTER NOTE */}
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(45,125,210,0.05)', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 4, fontSize: 12, color: '#555' }}>
          📍 Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com
        </div>

      </div>
    </div>
  )
}
