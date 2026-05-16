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
  const [proofUrl, setProofUrl] = useState(null)

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
  const nextLabel = { new: 'Move to review', review: 'Confirm order', confirmed: 'Mark dispatched', dispatched: 'Mark completed' }
  const nextColor = { new: '#854f0b', review: '#2d7dd2', confirmed: '#2a7d4f', dispatched: '#2a7d4f' }

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    await loadAll(supabase)
    setSelected(prev => prev ? { ...prev, status: newStatus } : null)
    setUpdating(false)
  }

  const getProofUrl = async (path) => {
    const supabase = createClient()
    const { data } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const statusConfig = {
    new:        { label: 'New',        color: '#2d7dd2', bg: 'rgba(45,125,210,0.12)',  icon: '📥', step: 0 },
    review:     { label: 'In review',  color: '#854f0b', bg: 'rgba(186,117,23,0.12)',  icon: '🔍', step: 1 },
    confirmed:  { label: 'Confirmed',  color: '#534ab7', bg: 'rgba(83,74,183,0.12)',   icon: '✅', step: 2 },
    dispatched: { label: 'Dispatched', color: '#2a7d4f', bg: 'rgba(42,125,79,0.12)',   icon: '🚚', step: 3 },
    completed:  { label: 'Completed',  color: '#2a7d4f', bg: 'rgba(42,125,79,0.08)',   icon: '🎉', step: 4 },
    cancelled:  { label: 'Cancelled',  color: '#c0392b', bg: 'rgba(231,76,60,0.08)',   icon: '✕',  step: -1 },
  }

  const payMethodLabels = { credit_card: 'Credit Card', debit_card: 'Debit Card', ach: 'ACH Transfer', wire: 'Wire Transfer' }
  const payMethodIcons = { credit_card: '💳', debit_card: '💳', ach: '🏦', wire: '⚡' }
  const shippingLabels = { pickup: '🏭 Pickup — Doral FL', prep_center: '📦 Prep Center', shipping: '🚚 Standard Shipping', freight: '🚛 Freight / LTL' }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const fmtFull = (d) => `${fmtDate(d)} at ${fmtTime(d)}`

  const getClientEmail = (order) => order.notes?.match(/Email: ([^\s|,]+)/)?.[1] || ''
  const getClient = (order) => clients[getClientEmail(order)]

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
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Orders' ? '#2d7dd2' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Orders' ? '2px solid #2d7dd2' : '2px solid transparent', position: 'relative' }}>
                {label}
                {label === 'Orders' && stats.new > 0 && <span style={{ position: 'absolute', top: 0, right: 4, width: 8, height: 8, background: '#e74c3c', borderRadius: '50%' }} />}
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* STATS */}
      <div style={{ padding: '1.25rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
        {[
          { label: 'Total orders', value: stats.total, color: '#2d7dd2', icon: '📦' },
          { label: 'New', value: stats.new, color: stats.new > 0 ? '#e74c3c' : '#555', icon: '📥' },
          { label: 'Active', value: stats.active, color: '#854f0b', icon: '⏳' },
          { label: 'Completed', value: stats.completed, color: '#2a7d4f', icon: '✅' },
          { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, color: '#2a7d4f', icon: '💰' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
            <span style={{ fontSize: 18, opacity: 0.25 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: selected ? '1fr 460px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT */}
        <div>
          {/* FILTERS */}
          <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[['all','All'],['new','New'],['review','In review'],['confirmed','Confirmed'],['dispatched','Dispatched'],['completed','Completed'],['cancelled','Cancelled']].map(([val, label]) => {
              const count = val === 'all' ? orders.length : orders.filter(o => o.status === val).length
              const s = statusConfig[val] || {}
              return (
                <button key={val} onClick={() => setFilter(val)} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${filter === val ? (s.color || '#2d7dd2') : 'rgba(255,255,255,0.08)'}`, background: filter === val ? `${s.bg || 'rgba(45,125,210,0.15)'}` : 'transparent', color: filter === val ? (s.color || '#2d7dd2') : '#777', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {label} <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '1px 6px' }}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* ORDERS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.length === 0 ? (
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '3rem', textAlign: 'center', color: '#444' }}>No orders found</div>
            ) : filtered.map(order => {
              const s = statusConfig[order.status] || statusConfig.new
              const client = getClient(order)
              const payment = payments[order.id]
              const totalUnits = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0
              const isSelected = selected?.id === order.id
              const hasProof = payment?.payment_proof_url
              return (
                <div key={order.id} onClick={() => setSelected(isSelected ? null : order)}
                  style={{ background: '#111', border: `1px solid ${isSelected ? '#2d7dd2' : 'rgba(255,255,255,0.06)'}`, borderLeft: `4px solid ${s.color}`, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', boxShadow: isSelected ? '0 4px 20px rgba(45,125,210,0.15)' : 'none', transition: 'all 0.15s' }}>

                  {/* Main row */}
                  <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto auto', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 4, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>#{order.order_number}</div>
                        <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 700 }}>{s.label}</span>
                        {hasProof && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: 'rgba(42,125,79,0.15)', color: '#2a7d4f', fontWeight: 700 }}>📤 Proof submitted</span>}
                        {order.status === 'new' && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: 'rgba(231,76,60,0.15)', color: '#e74c3c', fontWeight: 700 }}>⚡ Action needed</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#777' }}>
                        {client?.business_name || getClientEmail(order)} · {fmtFull(order.submitted_at)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Items</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{order.order_items?.length || 0}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Units</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#ccc' }}>{totalUnits}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>Payment</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{payment ? `${payMethodIcons[payment.payment_method]} ${payMethodLabels[payment.payment_method]}` : '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: order.status === 'completed' ? '#2a7d4f' : '#fff' }}>${order.total?.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Items preview */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div style={{ padding: '0 1.25rem 0.875rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {order.order_items.slice(0,4).map((item, i) => (
                        <span key={i} style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, color: '#888' }}>
                          {item.product_name} ×{item.quantity}
                        </span>
                      ))}
                      {order.order_items.length > 4 && <span style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, color: '#555' }}>+{order.order_items.length - 4} more</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — ORDER DETAIL */}
        {selected && (() => {
          const s = statusConfig[selected.status] || statusConfig.new
          const client = getClient(selected)
          const payment = payments[selected.id]
          const email = getClientEmail(selected)
          const totalUnits = selected.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0
          const steps = ['New', 'In review', 'Confirmed', 'Dispatched', 'Completed']
          const currentStep = s.step

          return (
            <div style={{ position: 'sticky', top: 20 }}>
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #0d0d0d, #1a1a2e)', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 4 }}>Order details</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 2 }}>#{selected.order_number}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{fmtFull(selected.submitted_at)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 700 }}>{s.icon} {s.label}</span>
                      <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                    </div>
                  </div>

                  {/* Progress */}
                  {selected.status !== 'cancelled' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 10, left: '5%', right: '5%', height: 2, background: 'rgba(255,255,255,0.06)' }} />
                      <div style={{ position: 'absolute', top: 10, left: '5%', height: 2, background: '#2d7dd2', width: `${Math.max(0, (currentStep / 4) * 90)}%`, transition: 'width 0.5s' }} />
                      {steps.map((step, i) => {
                        const done = i <= currentStep
                        const active = i === currentStep
                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? '#2d7dd2' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? '0 0 0 3px rgba(45,125,210,0.25)' : 'none' }}>
                              {done ? <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>✓</span> : <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'block' }} />}
                            </div>
                            <div style={{ fontSize: 8, color: done ? '#2d7dd2' : '#444', fontWeight: done ? 600 : 400, marginTop: 4, whiteSpace: 'nowrap' }}>{step}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                  {/* Client info */}
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Client information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        ['Business', client?.business_name || '—'],
                        ['Contact', client?.contact_name || '—'],
                        ['Email', email || '—'],
                        ['Phone', client?.phone || '—'],
                        ['Business type', client?.business_type || '—'],
                        ['EIN', client?.ein_number || client?.ein || '—'],
                      ].map(([label, val]) => (
                        <div key={label} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ fontSize: 8, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 11, color: '#ccc', fontWeight: 500, wordBreak: 'break-all' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Shipping */}
                  {payment && (
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(45,125,210,0.04)' }}>
                      <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Payment & Shipping</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        <div style={{ padding: '8px 10px', background: 'rgba(45,125,210,0.08)', border: '0.5px solid rgba(45,125,210,0.2)', borderRadius: 3 }}>
                          <div style={{ fontSize: 8, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Payment method</div>
                          <div style={{ fontSize: 12, color: '#2d7dd2', fontWeight: 600 }}>{payMethodIcons[payment.payment_method]} {payMethodLabels[payment.payment_method]}</div>
                        </div>
                        <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ fontSize: 8, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Shipping method</div>
                          <div style={{ fontSize: 11, color: '#ccc', fontWeight: 500 }}>{shippingLabels[payment.shipping_method] || payment.shipping_method || '—'}</div>
                        </div>
                      </div>

                      {/* Payment proof */}
                      <div style={{ padding: '10px 12px', background: payment.payment_proof_url ? 'rgba(42,125,79,0.08)' : 'rgba(255,255,255,0.03)', border: `0.5px solid ${payment.payment_proof_url ? 'rgba(42,125,79,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 3 }}>
                        <div style={{ fontSize: 8, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Payment proof</div>
                        {payment.payment_proof_url ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: 11, color: '#2a7d4f', fontWeight: 600 }}>✅ Proof submitted by client</div>
                            <button onClick={() => getProofUrl(payment.payment_proof_url)} style={{ fontSize: 10, color: '#2d7dd2', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.3)', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}>View proof →</button>
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: '#555' }}>⏳ Awaiting payment proof from client</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order items */}
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Items ordered · {selected.order_items?.length} products · {totalUnits} units</div>
                    {selected.order_items?.map((item, i) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < selected.order_items.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#ccc', marginBottom: 2 }}>{item.product_name}</div>
                          <div style={{ fontSize: 9, color: '#555', fontFamily: 'monospace' }}>{item.product_sku} · {item.quantity} units × ${item.unit_price?.toLocaleString()}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                      </div>
                    ))}

                    {/* Total */}
                    <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(45,125,210,0.06)', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>Order total</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: selected.status === 'completed' ? '#2a7d4f' : '#2d7dd2' }}>${selected.total?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Update status</div>

                    {nextStatus[selected.status] ? (
                      <button onClick={() => updateStatus(selected.id, nextStatus[selected.status])} disabled={updating}
                        style={{ width: '100%', padding: 12, background: updating ? '#333' : nextColor[selected.status] || '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: updating ? 'not-allowed' : 'pointer', borderRadius: 3, marginBottom: 8, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
                        {updating ? 'Updating...' : `→ ${nextLabel[selected.status]}`}
                      </button>
                    ) : (
                      <div style={{ fontSize: 12, color: '#444', textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 3, marginBottom: 8 }}>
                        {selected.status === 'completed' ? '🎉 Order completed' : '✕ Order cancelled'}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {!['completed','cancelled'].includes(selected.status) && (
                        <button onClick={() => updateStatus(selected.id, 'cancelled')} style={{ padding: 9, background: 'transparent', color: '#c0392b', fontSize: 10, fontWeight: 600, border: '0.5px solid rgba(231,76,60,0.3)', cursor: 'pointer', borderRadius: 3 }}>Cancel order</button>
                      )}
                      {email && (
                        <a href={`mailto:${email}?subject=Re: Order %23${selected.order_number}`} style={{ padding: 9, background: 'rgba(255,255,255,0.04)', color: '#888', fontSize: 10, fontWeight: 600, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 3, textDecoration: 'none', textAlign: 'center', display: 'block' }}>📧 Email client</a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
