'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function OrdersPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('submitted_at', { ascending: false })
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
    new: { label: 'Received', bg: 'rgba(45,125,210,0.08)', color: '#2d7dd2' },
    review: { label: 'In review', bg: 'rgba(186,117,23,0.08)', color: '#854f0b' },
    confirmed: { label: 'Confirmed', bg: 'rgba(42,125,79,0.08)', color: '#2a7d4f' },
    dispatched: { label: 'Dispatched', bg: 'rgba(42,125,79,0.12)', color: '#2a7d4f' },
    completed: { label: 'Completed', bg: 'rgba(42,125,79,0.08)', color: '#2a7d4f' },
    cancelled: { label: 'Cancelled', bg: 'rgba(231,76,60,0.08)', color: '#c0392b' },
  }

  const StatusBadge = ({ status }) => {
    const s = statusConfig[status] || { label: status, bg: '#f0f0f0', color: '#888' }
    return <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 2, background: s.bg, color: s.color, border: `0.5px solid ${s.color}30`, whiteSpace: 'nowrap' }}>{s.label}</span>
  }

  const Timeline = ({ status }) => {
    const steps = [
      { key: 'new', label: 'Order received' },
      { key: 'review', label: 'Being reviewed' },
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'dispatched', label: 'Dispatched' },
      { key: 'completed', label: 'Completed' },
    ]
    const idx = steps.findIndex(s => s.key === status)
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: '1rem' }}>
        {steps.map((step, i) => (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500,
                background: i <= idx ? '#2d7dd2' : '#f0f0f0',
                color: i <= idx ? '#fff' : '#ccc',
                border: `2px solid ${i <= idx ? '#2d7dd2' : '#e0e0e0'}`
              }}>
                {i < idx ? '✓' : i + 1}
              </div>
              <div style={{ fontSize: 9, color: i <= idx ? '#2d7dd2' : '#bbb', textAlign: 'center', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>{step.label}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < idx ? '#2d7dd2' : '#e0e0e0', margin: '0 4px', marginBottom: 18 }} />
            )}
          </div>
        ))}
      </div>
    )
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>Loading orders...</div>

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="logo-icon"><div className="logo-l-vert" /><div className="logo-l-horiz" /><div className="logo-accent" /></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#222', textTransform: 'uppercase' }}>Levam</div>
              <div style={{ fontSize: 7, letterSpacing: '0.25em', color: '#2d7dd2', textTransform: 'uppercase' }}>Partner Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, borderLeft: '0.5px solid rgba(0,0,0,0.08)', paddingLeft: 16 }}>
            {[['Dashboard', '/portal/dashboard'], ['Catalog', '/portal/catalog'], ['My orders', '/portal/orders'], ['Invoices', '/portal/invoices']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'My orders' ? '#2d7dd2' : '#888', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'My orders' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#333', border: '0.5px solid rgba(0,0,0,0.12)', padding: '6px 14px', borderRadius: 2, background: '#fff', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#111', marginBottom: 4 }}>My orders</h2>
            <p style={{ fontSize: 12, color: '#aaa' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link href="/portal/catalog" style={{ padding: '9px 20px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none' }}>+ New order</Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: '1rem' }}>📦</div>
            <h3 style={{ fontSize: 16, fontWeight: 500, color: '#333', marginBottom: '0.5rem' }}>No orders yet</h3>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: '1.5rem' }}>Browse the catalog and place your first order.</p>
            <Link href="/portal/catalog" style={{ padding: '10px 24px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem' }}>

            {/* ORDER LIST */}
            <div style={{ flex: 1 }}>
              {orders.map(order => (
                <div key={order.id} onClick={() => setSelected(selected?.id === order.id ? null : order)} style={{
                  background: '#fff', border: `0.5px solid ${selected?.id === order.id ? 'rgba(45,125,210,0.35)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: 4, padding: '1.25rem', marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.15s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 3 }}>#{order.order_number}</div>
                      <div style={{ fontSize: 11, color: '#bbb' }}>{new Date(order.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 15, fontWeight: 500, color: '#111' }}>${order.total?.toLocaleString()}</div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Items preview */}
                  {order.order_items?.length > 0 && (
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>
                      {order.order_items.slice(0, 3).map(item => `${item.product_name} ×${item.quantity}`).join(' · ')}
                      {order.order_items.length > 3 && ` · +${order.order_items.length - 3} more`}
                    </div>
                  )}

                  {/* Timeline */}
                  {selected?.id === order.id && <Timeline status={order.status} />}
                </div>
              ))}
            </div>

            {/* ORDER DETAIL */}
            {selected && (
              <div style={{ width: 320, background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '1.5rem', height: 'fit-content', position: 'sticky', top: 80 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>#{selected.order_number}</h3>
                  <StatusBadge status={selected.status} />
                </div>

                <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>Order items</div>
                {selected.order_items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)', fontSize: 12 }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#333', marginBottom: 2 }}>{item.product_name}</div>
                      <div style={{ color: '#bbb', fontSize: 10 }}>{item.product_sku} · Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 500, color: '#111' }}>${(item.unit_price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}

                <div style={{ marginTop: '1rem', padding: '1rem 0', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 6 }}><span>Subtotal</span><span>${selected.subtotal?.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 6 }}><span>Shipping</span><span>TBD</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500, color: '#111', marginTop: 8, paddingTop: 8, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}><span>Total</span><span>${selected.total?.toLocaleString()}</span></div>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(45,125,210,0.05)', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 2, fontSize: 11, color: '#555' }}>
                  Questions about this order?<br />
                  <a href="mailto:partners@levamcorp.com" style={{ color: '#2d7dd2', textDecoration: 'none' }}>partners@levamcorp.com</a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
