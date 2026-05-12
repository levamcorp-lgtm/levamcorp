'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      loadOrders(supabase)
    })
  }, [])

  const loadOrders = async (supabase) => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('submitted_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus, ...(newStatus === 'confirmed' ? { confirmed_at: new Date().toISOString() } : {}), ...(newStatus === 'dispatched' ? { dispatched_at: new Date().toISOString() } : {}) }).eq('id', orderId)
    await loadOrders(supabase)
    setSelected(prev => prev ? { ...prev, status: newStatus } : null)
    setUpdating(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const statusConfig = {
    new: { label: 'New', color: '#2d7dd2', bg: 'rgba(45,125,210,0.12)' },
    review: { label: 'In review', color: '#854f0b', bg: 'rgba(186,117,23,0.12)' },
    confirmed: { label: 'Confirmed', color: '#2a7d4f', bg: 'rgba(42,125,79,0.12)' },
    dispatched: { label: 'Dispatched', color: '#2a7d4f', bg: 'rgba(42,125,79,0.15)' },
    completed: { label: 'Completed', color: '#2a7d4f', bg: 'rgba(42,125,79,0.1)' },
    cancelled: { label: 'Cancelled', color: '#c0392b', bg: 'rgba(231,76,60,0.1)' },
  }

  const nextStatus = { new: 'review', review: 'confirmed', confirmed: 'dispatched', dispatched: 'completed' }
  const nextLabel = { new: '→ Move to review', review: '→ Confirm order', confirmed: '→ Mark dispatched', dispatched: '→ Mark completed' }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 24, height: 24 }}>
              <div style={{ position: 'absolute', left: 5, top: 0, width: 2, height: 18, background: '#444' }} />
              <div style={{ position: 'absolute', left: 5, bottom: 0, width: 14, height: 2, background: '#444' }} />
              <div style={{ position: 'absolute', left: 9, bottom: 5, width: 8, height: 2, background: '#2d7dd2' }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>Levam Admin</div>
          </div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Orders' ? '#2d7dd2' : '#555', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Orders' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Orders</h2>
            <p style={{ fontSize: 12, color: '#444' }}>{filtered.length} orders</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all','new','review','confirmed','dispatched','completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 10, padding: '5px 12px', border: '0.5px solid', borderColor: filter === f ? '#2d7dd2' : 'rgba(255,255,255,0.08)', background: filter === f ? 'rgba(45,125,210,0.15)' : 'transparent', color: filter === f ? '#2d7dd2' : '#555', borderRadius: 2, cursor: 'pointer', textTransform: 'capitalize', letterSpacing: '0.05em' }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: '1rem' }}>
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d0d0d' }}>
                  {['Order #', 'Date', 'Items', 'Total', 'Notes', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => {
                  const s = statusConfig[order.status] || statusConfig.new
                  return (
                    <tr key={order.id} onClick={() => setSelected(selected?.id === order.id ? null : order)} style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected?.id === order.id ? 'rgba(45,125,210,0.05)' : 'transparent' }}>
                      <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 500, color: '#ccc' }}>#{order.order_number}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{new Date(order.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{order.order_items?.length || 0}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 500, color: '#fff' }}>${order.total?.toLocaleString()}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#444', maxWidth: 200 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.notes || '—'}</div></td>
                      <td style={{ padding: '12px 1.25rem' }}>
                        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '12px 1.25rem' }}>
                        {nextStatus[order.status] && (
                          <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, nextStatus[order.status]) }} disabled={updating} style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(45,125,210,0.15)', color: '#2d7dd2', border: '0.5px solid rgba(45,125,210,0.3)', borderRadius: 2, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {nextLabel[order.status]}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#444', fontSize: 13 }}>No orders found</div>}
          </div>

          {selected && (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '1.5rem', height: 'fit-content', position: 'sticky', top: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>#{selected.order_number}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Order items</div>
              {selected.order_items?.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                  <div><div style={{ color: '#ccc', fontWeight: 500, marginBottom: 2 }}>{item.product_name}</div><div style={{ color: '#444', fontSize: 10 }}>{item.product_sku} · Qty: {item.quantity}</div></div>
                  <div style={{ color: '#fff', fontWeight: 500 }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                </div>
              ))}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: '1.25rem' }}><span>Total</span><span>${selected.total?.toLocaleString()}</span></div>
                {nextStatus[selected.status] && (
                  <button onClick={() => updateStatus(selected.id, nextStatus[selected.status])} disabled={updating} style={{ width: '100%', padding: 10, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2, marginBottom: 8 }}>
                    {nextLabel[selected.status]}
                  </button>
                )}
                <button onClick={() => updateStatus(selected.id, 'cancelled')} style={{ width: '100%', padding: 8, background: 'transparent', color: '#c0392b', fontSize: 11, border: '0.5px solid rgba(231,76,60,0.3)', cursor: 'pointer', borderRadius: 2 }}>Cancel order</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
