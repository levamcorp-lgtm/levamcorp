'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)

      // Check if first visit
      const visited = localStorage.getItem(`lc_visited_${data.user.id}`)
      if (!visited) {
        setIsFirstVisit(true)
        setShowWelcome(true)
        localStorage.setItem(`lc_visited_${data.user.id}`, '1')
      }

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

  const statusConfig = {
    new: { label: 'Received', bg: 'rgba(45,125,210,0.1)', color: '#2d7dd2' },
    review: { label: 'In review', bg: 'rgba(186,117,23,0.08)', color: '#854f0b' },
    confirmed: { label: 'Confirmed', bg: 'rgba(42,125,79,0.08)', color: '#2a7d4f' },
    dispatched: { label: 'Dispatched', bg: 'rgba(42,125,79,0.12)', color: '#2a7d4f' },
    completed: { label: 'Completed', bg: 'rgba(42,125,79,0.08)', color: '#2a7d4f' },
    cancelled: { label: 'Cancelled', bg: 'rgba(231,76,60,0.08)', color: '#c0392b' },
  }

  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const pendingOrders = orders.filter(o => !['completed','cancelled'].includes(o.status)).length
  const firstName = user?.email?.split('@')[0]?.split('.')[0]
  const displayName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : 'Partner'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', left: 10, top: 0, width: 3, height: 38, background: '#333' }} />
          <div style={{ position: 'absolute', left: 10, bottom: 0, width: 26, height: 3, background: '#333' }} />
          <div style={{ position: 'absolute', left: 16, bottom: 10, width: 16, height: 3, background: '#2d7dd2' }} />
        </div>
        <div style={{ fontSize: 12, color: '#444', letterSpacing: '0.1em' }}>Loading your portal...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>

      {/* WELCOME MODAL — first visit */}
      {showWelcome && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', width: 520, borderRadius: 8, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
            <div style={{ background: '#0d0d0d', padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 56, height: 56, margin: '0 auto 16px' }}>
                <div style={{ position: 'absolute', left: 12, top: 0, width: 3, height: 44, background: '#333' }} />
                <div style={{ position: 'absolute', left: 12, bottom: 0, width: 30, height: 3, background: '#333' }} />
                <div style={{ position: 'absolute', left: 18, bottom: 12, width: 18, height: 3, background: '#2d7dd2' }} />
              </div>
              <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: 8, fontWeight: 600 }}>Welcome to</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase', marginBottom: 4 }}>Levam Corp</div>
              <div style={{ fontSize: 10, letterSpacing: '0.35em', color: '#555', textTransform: 'uppercase' }}>Distributors · Partner Portal</div>
            </div>
            <div style={{ padding: '2.5rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: '0.75rem' }}>You're in, {displayName}! 🎉</h2>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: '2rem' }}>
                Your partner account is active. You now have access to our full catalog, wholesale pricing, and automated invoicing system.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '2rem' }}>
                {[
                  ['📦', 'Browse catalog', 'Live pricing & availability'],
                  ['🧾', 'Generate quotes', 'Auto invoice creation'],
                  ['📋', 'Track orders', 'Real-time status updates'],
                  ['💳', 'Manage payments', 'Multiple payment methods'],
                ].map(([icon, title, desc]) => (
                  <div key={title} style={{ background: '#f7f8fa', borderRadius: 4, padding: '1rem', textAlign: 'left' }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowWelcome(false)} style={{ width: '100%', padding: 14, background: '#2d7dd2', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 4, boxShadow: '0 4px 16px rgba(45,125,210,0.35)' }}>
                Enter my portal →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 32, height: 32 }}>
              <div style={{ position: 'absolute', left: 7, top: 0, width: 2, height: 25, background: '#444' }} />
              <div style={{ position: 'absolute', left: 7, bottom: 0, width: 18, height: 2, background: '#444' }} />
              <div style={{ position: 'absolute', left: 11, bottom: 7, width: 11, height: 2.5, background: '#2d7dd2' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase' }}>Levam</div>
              <div style={{ fontSize: 8, letterSpacing: '0.28em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Partner Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.08)', paddingLeft: 20 }}>
            {[['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['My orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, fontWeight: label === 'Dashboard' ? 700 : 500, color: label === 'Dashboard' ? '#fff' : 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 16px', borderBottom: label === 'Dashboard' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(45,125,210,0.2)', border: '1px solid rgba(45,125,210,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#2d7dd2' }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ padding: '2rem' }}>

        {/* WELCOME HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 6 }}>Partner portal</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', marginBottom: 4 }}>Welcome back, {displayName} 👋</h2>
            <p style={{ fontSize: 13, color: '#aaa' }}>{user?.email} · Approved distributor</p>
          </div>
          <Link href="/portal/catalog" style={{ padding: '11px 24px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
            + New order
          </Link>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1.5rem' }}>
          {[
            { icon: '📦', label: 'Total orders', value: totalOrders, color: '#2d7dd2', sub: 'all time' },
            { icon: '⏳', label: 'Pending', value: pendingOrders, color: '#854f0b', sub: 'in progress' },
            { icon: '💰', label: 'Total value', value: `$${totalSpent.toLocaleString()}`, color: '#2a7d4f', sub: 'ordered' },
            { icon: '✅', label: 'Completed', value: orders.filter(o => o.status === 'completed').length, color: '#2a7d4f', sub: 'orders' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 22, opacity: 0.15 }}>{s.icon}</div>
              <div style={{ fontSize: 9, color: '#bbb', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#111', marginBottom: 3 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1.5rem' }}>
          {[
            { icon: '🛍', label: 'Browse catalog', desc: 'View products & pricing', href: '/portal/catalog', color: '#2d7dd2' },
            { icon: '📋', label: 'My orders', desc: 'Track order status', href: '/portal/orders', color: '#854f0b' },
            { icon: '🧾', label: 'Invoices', desc: 'Download & print', href: '/portal/invoices', color: '#534ab7' },
            { icon: '💳', label: 'Payments', desc: 'Manage balances', href: '/portal/payments', color: '#2a7d4f' },
          ].map(item => (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 42, height: 42, background: `${item.color}12`, border: `0.5px solid ${item.color}25`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#222', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{item.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>

          {/* RECENT ORDERS */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Recent orders</div>
              <Link href="/portal/orders" style={{ fontSize: 11, color: '#2d7dd2', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
            </div>
            {orders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 6 }}>No orders yet</div>
                <div style={{ fontSize: 12, color: '#aaa', marginBottom: '1.5rem' }}>Start by browsing our catalog</div>
                <Link href="/portal/catalog" style={{ padding: '9px 22px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7f8fa' }}>
                    {['Order #','Date','Items','Total','Status'].map(h => (
                      <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '8px 1.25rem', textAlign: 'left', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const s = statusConfig[order.status] || statusConfig.new
                    return (
                      <tr key={order.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 600, color: '#333' }}>#{order.order_number}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#aaa' }}>{new Date(order.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#888' }}>{order.items_count || '—'}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 600, color: '#111' }}>${order.total?.toLocaleString()}</td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* ACCOUNT INFO */}
            <div style={{ background: '#111', borderRadius: 4, padding: '1.5rem', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(45,125,210,0.2)', border: '1.5px solid rgba(45,125,210,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#2d7dd2', flexShrink: 0 }}>
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{displayName}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#2a7d4f', background: 'rgba(42,125,79,0.1)', border: '0.5px solid rgba(42,125,79,0.2)', padding: '6px 12px', borderRadius: 2 }}>
                <span>✓</span> Approved distributor
              </div>
            </div>

            {/* NEED HELP */}
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '1.25rem' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 8 }}>Need help?</div>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.7, marginBottom: '1rem' }}>Our team is available Monday–Friday 9am–6pm ET.</p>
              <a href="mailto:partners@levamcorp.com" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2d7dd2', textDecoration: 'none', fontWeight: 500, padding: '8px 12px', background: 'rgba(45,125,210,0.06)', borderRadius: 2, border: '0.5px solid rgba(45,125,210,0.15)' }}>
                📧 partners@levamcorp.com
              </a>
            </div>

            {/* PARTNER PERKS */}
            <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)', borderRadius: 4, padding: '1.25rem', border: '0.5px solid rgba(45,125,210,0.2)' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: 8, fontWeight: 600 }}>Partner perks</div>
              {['Wholesale pricing on all products','Dedicated account support','Auto-generated invoices','Priority dispatch — 48h avg'].map(perk => (
                <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                  <span style={{ color: '#2d7dd2', fontWeight: 700 }}>✓</span> {perk}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(45,125,210,0.04)', border: '0.5px solid rgba(45,125,210,0.1)', borderRadius: 4, fontSize: 12, color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>📍 Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178</span>
          <a href="mailto:partners@levamcorp.com" style={{ color: '#2d7dd2', textDecoration: 'none' }}>partners@levamcorp.com</a>
        </div>
      </div>
    </div>
  )
}
