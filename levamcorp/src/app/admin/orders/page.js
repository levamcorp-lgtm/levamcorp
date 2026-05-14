'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState({})
  const [payments, setPayments] = useState({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      await loadAll(supabase)
    })
  }, [])

  const loadAll = async (supabase) => {
    const [{ data: ordersData }, { data: clientsData }, { data: paymentsData }] = await Promise.all([
      supabase.from('orders').select('*, order_items(*)').order('submitted_at', { ascending: false }),
      supabase.from('clients').select('*'),
      supabase.from('payments').select('*'),
    ])
    setOrders(ordersData || [])
    const cMap = {}
    ;(clientsData || []).forEach(c => { cMap[c.email] = c })
    setClients(cMap)
    const pMap = {}
    ;(paymentsData || []).forEach(p => { pMap[p.order_id] = p })
    setPayments(pMap)
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const nextStatus = { new: 'review', review: 'confirmed', confirmed: 'dispatched', dispatched: 'completed' }
  const nextLabel = { new: '→ Move to review', review: '→ Confirm order', confirmed: '→ Mark dispatched', dispatched: '→ Mark completed' }

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('orders').update({
      status: newStatus,
      ...(newStatus === 'confirmed' ? { confirmed_at: new Date().toISOString() } : {}),
      ...(newStatus === 'dispatched' ? { dispatched_at: new Date().toISOString() } : {}),
    }).eq('id', orderId)
    await loadAll(supabase)
    setSelected(prev => prev ? { ...prev, status: newStatus } : null)
    setUpdating(false)
  }

  const statusConfig = {
    new:        { label: 'New',        color: '#2d7dd2', bg: 'rgba(45,125,210,0.12)',  icon: '📥' },
    review:     { label: 'In review',  color: '#854f0b', bg: 'rgba(186,117,23,0.12)',  icon: '🔍' },
    confirmed:  { label: 'Confirmed',  color: '#534ab7', bg: 'rgba(83,74,183,0.12)',   icon: '✅' },
    dispatched: { label: 'Dispatched', color: '#2a7d4f', bg: 'rgba(42,125,79,0.12)',   icon: '🚚' },
    completed:  { label: 'Completed',  color: '#2a7d4f', bg: 'rgba(42,125,79,0.08)',   icon: '🎉' },
    cancelled:  { label: 'Cancelled',  color: '#c0392b', bg: 'rgba(231,76,60,0.08)',   icon: '✕'  },
  }

  const payMethodLabels = { credit_card: 'Credit Card', debit_card: 'Debit Card', ach: 'ACH Transfer', wire: 'Wire Transfer', melio: 'Melio Pay', zelle: 'Zelle' }
  const payMethodIcons = { credit_card: '💳', debit_card: '💳', ach: '🏦', wire: '⚡', melio: '🔗', zelle: '💵' }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const getClientFromOrder = (order) => {
    const emailMatch = order.notes?.match(/Email: ([^\s|,]+)/)?.[1]
    return emailMatch ? clients[emailMatch] : null
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    active: orders.filter(o => ['review','confirmed','dispatched'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0),
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Orders' ? '#2d7dd2' : '#555', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Orders' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* STATS */}
      <div style={{ padding: '1.5rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
        {[
          { label: 'Total orders', value: stats.total, color: '#2d7dd2', icon: '📦' },
          { label: 'New orders', value: stats.new, color: stats.new > 0 ? '#e74c3c' : '#555', icon: '📥' },
          { label: 'Active', value: stats.active, color: '#854f0b', icon: '⏳' },
          { label: 'Completed', value: stats.completed, color: '#2a7d4f', icon: '✅' },
          { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, color: '#2a7d4f', icon: '💰' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{s.value}</div>
              </div>
              <span style={{ fontSize: 20, opacity: 0.3 }}>{s.icon}</span>
            </div>
            <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, marginTop: 8 }}>
              <div style={{ height: 2, background: s.color, borderRadius: 1, width: '60%', opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT */}
        <div>
          {/* FILTERS */}
          <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[['all','All'],['new','New'],['review','In review'],['confirmed','Confirmed'],['dispatched','Dispatched'],['completed','Completed'],['cancelled','Cancelled']].map(([val, label]) => {
              const count = val === 'all' ? orders.length : orders.filter(o => o.status === val).length
              const s = statusConfig[val] || {}
              return (
                <button key={val} onClick={() => setFilter(val)} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${filter === val ? (s.color || '#2d7dd2') : 'rgba(255,255,255,0.08)'}`, background: filter === val ? `${s.bg || 'rgba(45,125,210,0.15)'}` : 'transparent', color: filter === val ? (s.color || '#2d7dd2') : '#555', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {label}
                  <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '1px 6px' }}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* TABLE */}
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#444', fontSize: 13 }}>No orders found</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0d0d0d' }}>
                    {['Order','Client','Business','Items','Units','Amount','Payment','Status','Date',''].map(h => (
                      <th key={h} style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#333', padding: '10px 12px', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(order => {
                    const s = statusConfig[order.status] || statusConfig.new
                    const client = getClientFromOrder(order)
                    const payment = payments[order.id]
                    const totalUnits = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0
                    const emailMatch = order.notes?.match(/Email: ([^\s|,]+)/)?.[1] || '—'
                    const isSelected = selected?.id === order.id
                    return (
                      <tr key={order.id} onClick={() => setSelected(isSelected ? null : order)} style={{ borderTop: '0.5px solid rgba(255,255,255,0.03)', background: isSelected ? 'rgba(45,125,210,0.06)' : 'transparent', cursor: 'pointer', transition: 'background 0.1s' }}>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#2d7dd2' }}>#{order.order_number}</div>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontSize: 11, color: '#ccc', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client?.contact_name || emailMatch}</div>
                          <div style={{ fontSize: 9, color: '#444', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emailMatch}</div>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontSize: 11, color: '#888', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client?.business_name || '—'}</div>
                          <div style={{ fontSize: 9, color: '#333' }}>{client?.business_type || ''}</div>
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: 12, color: '#777', textAlign: 'center' }}>{order.order_items?.length || 0}</td>
                        <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#ccc' }}>{totalUnits}</span>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: order.status === 'completed' ? '#2a7d4f' : '#fff' }}>${order.total?.toLocaleString()}</div>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          {payment ? (
                            <div style={{ fontSize: 10, color: '#2d7dd2' }}>{payMethodIcons[payment.payment_method]} {payMethodLabels[payment.payment_method] || payment.payment_method}</div>
                          ) : (
                            <div style={{ fontSize: 10, color: '#333' }}>—</div>
                          )}
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.icon} {s.label}</span>
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: 10, color: '#444', whiteSpace: 'nowrap' }}>{fmtDate(order.submitted_at)}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <button onClick={(e) => { e.stopPropagation(); setSelected(order) }} style={{ fontSize: 10, color: '#2d7dd2', background: 'transparent', border: '0.5px solid rgba(45,125,210,0.3)', padding: '4px 10px', borderRadius: 2, cursor: 'pointer', whiteSpace: 'nowrap' }}>View →</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT — ORDER DETAIL */}
        {selected && (
          <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>

              {/* Header */}
              <div style={{ background: '#0d0d0d', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 4 }}>Order details</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>#{selected.order_number}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>{fmtDate(selected.submitted_at)} at {fmtTime(selected.submitted_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {(() => { const s = statusConfig[selected.status] || statusConfig.new; return <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 700 }}>{s.icon} {s.label}</span> })()}
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                </div>
              </div>

              {/* Client info */}
              {(() => {
                const client = getClientFromOrder(selected)
                const emailMatch = selected.notes?.match(/Email: ([^\s|,]+)/)?.[1] || '—'
                const payment = payments[selected.id]
                return (
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Client information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        ['Contact', client?.contact_name || '—'],
                        ['Business', client?.business_name || '—'],
                        ['Email', emailMatch],
                        ['Phone', client?.phone || '—'],
                        ['Type', client?.business_type || '—'],
                        ['EIN', client?.ein || '—'],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize: 8, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 11, color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {payment && (
                      <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(45,125,210,0.08)', border: '0.5px solid rgba(45,125,210,0.2)', borderRadius: 3 }}>
                        <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Payment method requested</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#2d7dd2' }}>{payMethodIcons[payment.payment_method]} {payMethodLabels[payment.payment_method]}</div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Items */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Items ordered</div>
                {selected.order_items?.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < selected.order_items.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#ccc', marginBottom: 2 }}>{item.product_name}</div>
                      <div style={{ fontSize: 9, color: '#444', fontFamily: 'monospace' }}>{item.product_sku} · {item.quantity} units × ${item.unit_price?.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#444', marginBottom: 2 }}>{selected.order_items?.length || 0} products · {selected.order_items?.reduce((s, i) => s + i.quantity, 0) || 0} total units</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: selected.status === 'completed' ? '#2a7d4f' : '#2d7dd2' }}>${selected.total?.toLocaleString()}</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '1rem 1.5rem' }}>
                <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Update status</div>
                {nextStatus[selected.status] ? (
                  <button onClick={() => updateStatus(selected.id, nextStatus[selected.status])} disabled={updating} style={{ width: '100%', padding: 11, background: updating ? '#333' : '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: updating ? 'not-allowed' : 'pointer', borderRadius: 3, marginBottom: 8, boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
                    {updating ? 'Updating...' : nextLabel[selected.status]}
                  </button>
                ) : (
                  <div style={{ fontSize: 12, color: '#444', textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 3, marginBottom: 8 }}>
                    {selected.status === 'completed' ? '✅ Order completed' : '✕ Order cancelled'}
                  </div>
                )}
                {!['completed','cancelled'].includes(selected.status) && (
                  <button onClick={() => updateStatus(selected.id, 'cancelled')} style={{ width: '100%', padding: 9, background: 'transparent', color: '#c0392b', fontSize: 11, border: '0.5px solid rgba(231,76,60,0.3)', cursor: 'pointer', borderRadius: 3 }}>Cancel order</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
