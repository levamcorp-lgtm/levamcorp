'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function OrdersPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', data.user.id)
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
    new:       { label: 'Received',   color: '#2d7dd2', bg: 'rgba(45,125,210,0.1)',   icon: '📥', step: 0 },
    review:    { label: 'In review',  color: '#854f0b', bg: 'rgba(186,117,23,0.1)',   icon: '🔍', step: 1 },
    confirmed: { label: 'Confirmed',  color: '#534ab7', bg: 'rgba(83,74,183,0.1)',    icon: '✅', step: 2 },
    dispatched:{ label: 'Dispatched', color: '#2a7d4f', bg: 'rgba(42,125,79,0.12)',   icon: '🚚', step: 3 },
    completed: { label: 'Completed',  color: '#2a7d4f', bg: 'rgba(42,125,79,0.08)',   icon: '🎉', step: 4 },
    cancelled: { label: 'Cancelled',  color: '#c0392b', bg: 'rgba(231,76,60,0.08)',   icon: '✕',  step: -1 },
  }

  const steps = [
    { key: 'new',        label: 'Received',   icon: '📥', desc: 'Order received by our team' },
    { key: 'review',     label: 'In review',  icon: '🔍', desc: 'Being reviewed & verified' },
    { key: 'confirmed',  label: 'Confirmed',  icon: '✅', desc: 'Order confirmed, payment pending' },
    { key: 'dispatched', label: 'Dispatched', icon: '🚚', desc: 'Shipped and on its way' },
    { key: 'completed',  label: 'Completed',  icon: '🎉', desc: 'Delivered & order closed' },
  ]

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const totalOrders = orders.length
  const totalValue = orders.reduce((s, o) => s + (o.total || 0), 0)
  const activeOrders = orders.filter(o => !['completed','cancelled'].includes(o.status)).length
  const completedOrders = orders.filter(o => o.status === 'completed').length

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', left: 10, top: 0, width: 3, height: 38, background: '#333' }} />
          <div style={{ position: 'absolute', left: 10, bottom: 0, width: 26, height: 3, background: '#333' }} />
          <div style={{ position: 'absolute', left: 16, bottom: 10, width: 16, height: 3, background: '#2d7dd2' }} />
        </div>
        <div style={{ fontSize: 12, color: '#444', letterSpacing: '0.1em' }}>Loading orders...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>

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
              <Link key={label} href={href} style={{ fontSize: 13, fontWeight: label === 'My orders' ? 700 : 500, color: label === 'My orders' ? '#fff' : 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 16px', borderBottom: label === 'My orders' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 60%, #0d1a2e 100%)', padding: '2.5rem 2rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 8 }}>Order history</div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>My Orders</h1>
            </div>
            <Link href="/portal/catalog" style={{ padding: '11px 24px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', boxShadow: '0 4px 14px rgba(45,125,210,0.35)' }}>+ New order</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: 'Total orders', value: totalOrders, color: '#2d7dd2', icon: '📦', sub: 'all time' },
              { label: 'Active orders', value: activeOrders, color: '#854f0b', icon: '⏳', sub: 'in progress' },
              { label: 'Completed', value: completedOrders, color: '#2a7d4f', icon: '✅', sub: 'delivered' },
              { label: 'Total value', value: `$${totalValue.toLocaleString()}`, color: '#2a7d4f', icon: '💰', sub: 'ordered' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.sub}</div>
                  </div>
                  <div style={{ fontSize: 22, opacity: 0.35 }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT */}
        <div>
          {/* FILTER TABS */}
          <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[['all','All'],['new','Received'],['review','In review'],['confirmed','Confirmed'],['dispatched','Dispatched'],['completed','Completed'],['cancelled','Cancelled']].map(([val, label]) => {
              const count = val === 'all' ? orders.length : orders.filter(o => o.status === val).length
              return (
                <button key={val} onClick={() => setFilter(val)} style={{ fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', border: `1.5px solid ${filter === val ? '#2d7dd2' : 'rgba(0,0,0,0.1)'}`, background: filter === val ? '#2d7dd2' : '#fff', color: filter === val ? '#fff' : '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {label}
                  <span style={{ fontSize: 9, background: filter === val ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)', borderRadius: 10, padding: '1px 6px', fontWeight: 700 }}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* ORDERS */}
          {filtered.length === 0 ? (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>No orders found</div>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: '1.5rem' }}>Start by browsing our product catalog</div>
              <Link href="/portal/catalog" style={{ padding: '9px 22px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(order => {
                const s = statusConfig[order.status] || statusConfig.new
                const isSelected = selected?.id === order.id
                const isCompleted = order.status === 'completed'
                return (
                  <div key={order.id} onClick={() => setSelected(isSelected ? null : order)} style={{ background: '#fff', border: `1px solid ${isSelected ? '#2d7dd2' : 'rgba(0,0,0,0.08)'}`, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', boxShadow: isSelected ? '0 4px 20px rgba(45,125,210,0.15)' : '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s' }}>
                    {/* Status bar on top */}
                    <div style={{ height: 3, background: s.color, opacity: 0.7 }} />
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 4, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Order #{order.order_number}</div>
                            <span style={{ fontSize: 10, padding: '2px 10px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 700 }}>{s.label}</span>
                          </div>
                          <div style={{ fontSize: 11, color: '#aaa' }}>{fmtDate(order.submitted_at)} · {order.order_items?.length || 0} items</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: isCompleted ? '#2a7d4f' : '#111', marginBottom: 2 }}>${order.total?.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: '#bbb' }}>{isCompleted ? '✅ Paid' : '⏳ Pending payment'}</div>
                      </div>
                    </div>
                    {/* Items preview */}
                    {order.order_items && order.order_items.length > 0 && (
                      <div style={{ padding: '0 1.5rem 1rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {order.order_items.slice(0,4).map((item, i) => (
                          <span key={i} style={{ fontSize: 10, padding: '3px 10px', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 20, color: '#666', fontWeight: 500 }}>
                            {item.product_name} ×{item.quantity}
                          </span>
                        ))}
                        {order.order_items.length > 4 && (
                          <span style={{ fontSize: 10, padding: '3px 10px', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 20, color: '#aaa' }}>+{order.order_items.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — ORDER DETAIL */}
        {selected && (
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #0d0d0d, #1a1a2e)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 6 }}>Order details</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 3 }}>#{selected.order_number}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{fmtDate(selected.submitted_at)} at {fmtTime(selected.submitted_at)}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#888', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>×</button>
                </div>
              </div>

              {/* STATUS TIMELINE */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Order status</div>
                {selected.status === 'cancelled' ? (
                  <div style={{ padding: '10px 14px', background: 'rgba(231,76,60,0.08)', border: '0.5px solid rgba(231,76,60,0.2)', borderRadius: 3, fontSize: 12, fontWeight: 600, color: '#c0392b' }}>✕ This order has been cancelled</div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    {steps.map((step, i) => {
                      const currentStep = statusConfig[selected.status]?.step || 0
                      const isDone = i < currentStep
                      const isActive = i === currentStep
                      const isFuture = i > currentStep
                      return (
                        <div key={step.key} style={{ display: 'flex', gap: 12, marginBottom: i < steps.length - 1 ? 0 : 0, position: 'relative' }}>
                          {/* Line */}
                          {i < steps.length - 1 && (
                            <div style={{ position: 'absolute', left: 11, top: 24, width: 2, height: '100%', background: isDone ? '#2d7dd2' : '#e0e0e0', zIndex: 0 }} />
                          )}
                          {/* Dot */}
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: isDone || isActive ? '#2d7dd2' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, boxShadow: isActive ? '0 0 0 4px rgba(45,125,210,0.15)' : 'none', marginTop: 2 }}>
                            {isDone ? <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</span> : isActive ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'block' }} /> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ccc', display: 'block' }} />}
                          </div>
                          <div style={{ paddingBottom: i < steps.length - 1 ? '1rem' : 0 }}>
                            <div style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isFuture ? '#bbb' : '#222', marginBottom: 1 }}>{step.icon} {step.label}</div>
                            <div style={{ fontSize: 10, color: isFuture ? '#ddd' : '#aaa' }}>{step.desc}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ITEMS */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Items ordered</div>
                {selected.order_items?.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < selected.order_items.length - 1 ? '0.5px solid rgba(0,0,0,0.05)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 2 }}>{item.product_name}</div>
                      <div style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>{item.product_sku} · Qty: {item.quantity}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: '#bbb' }}>${item.unit_price?.toLocaleString()}/unit</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 4 }}><span>Subtotal</span><span>${selected.subtotal?.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 8 }}><span>Shipping</span><span>TBD</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: selected.status === 'completed' ? 'rgba(42,125,79,0.08)' : 'rgba(45,125,210,0.06)', border: `0.5px solid ${selected.status === 'completed' ? 'rgba(42,125,79,0.2)' : 'rgba(45,125,210,0.15)'}`, borderRadius: 4, padding: '10px 14px' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: selected.status === 'completed' ? '#2a7d4f' : '#2d7dd2' }}>${selected.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* ACTIONS */}
              <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: 8 }}>
                <Link href="/portal/invoices" style={{ flex: 1, padding: 11, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 14px rgba(45,125,210,0.3)', display: 'block' }}>🧾 View invoice</Link>
                {!['completed','cancelled'].includes(selected.status) && (
                  <Link href="/portal/payments" style={{ padding: '11px 14px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 3, textDecoration: 'none', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>💳 Pay</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
