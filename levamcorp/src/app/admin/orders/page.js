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
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [search, setSearch] = useState('')

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

  const statusConfig = {
    new:        { label: 'New',        color: '#e74c3c', bg: 'rgba(231,76,60,0.12)',   icon: '📥', step: 0 },
    review:     { label: 'In review',  color: '#854f0b', bg: 'rgba(186,117,23,0.12)',  icon: '🔍', step: 1 },
    confirmed:  { label: 'Confirmed',  color: '#534ab7', bg: 'rgba(83,74,183,0.12)',   icon: '✅', step: 2 },
    dispatched: { label: 'Dispatched', color: '#2d7dd2', bg: 'rgba(45,125,210,0.12)',  icon: '🚚', step: 3 },
    completed:  { label: 'Completed',  color: '#2a7d4f', bg: 'rgba(42,125,79,0.08)',   icon: '🎉', step: 4 },
    cancelled:  { label: 'Cancelled',  color: '#555',    bg: 'rgba(100,100,100,0.08)', icon: '✕',  step: -1 },
  }

  const groups = [
    { key: 'new',        label: '⚡ Action needed',                color: '#e74c3c', desc: 'Requires your attention' },
    { key: 'review',     label: '🔍 In review',                    color: '#854f0b', desc: 'Being reviewed' },
    { key: 'confirmed',  label: '✅ Confirmed — Ready to dispatch', color: '#534ab7', desc: 'Confirmed, prepare shipment' },
    { key: 'dispatched', label: '🚚 Dispatched — In transit',      color: '#2d7dd2', desc: 'Shipped to client' },
    { key: 'completed',  label: '🎉 Completed',                    color: '#2a7d4f', desc: 'Delivered and done' },
    { key: 'cancelled',  label: '✕ Cancelled',                     color: '#555',    desc: '' },
  ]

  const payMethodLabels = { credit_card: 'Credit Card', debit_card: 'Debit Card', ach: 'ACH Transfer', wire: 'Wire Transfer' }
  const payMethodIcons  = { credit_card: '💳', debit_card: '💳', ach: '🏦', wire: '⚡' }
  const shippingLabels  = { pickup: '🏭 Pickup', prep_center: '📦 Prep Center', shipping: '🚚 Shipping', freight: '🚛 Freight' }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const getClientEmail = (order) => order.notes?.match(/Email: ([^\s|,]+)/)?.[1] || ''
  const getClient = (order) => clients[getClientEmail(order)]

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    await loadAll(supabase)
    setSelected(prev => prev ? { ...prev, status: newStatus } : null)
    setUpdating(false)
  }

  const saveEdit = async () => {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('orders').update({
      status: editForm.status,
      total: parseFloat(editForm.total) || selected.total,
      subtotal: parseFloat(editForm.subtotal) || selected.subtotal,
      notes: editForm.notes,
    }).eq('id', selected.id)
    await loadAll(supabase)
    setSelected(prev => ({ ...prev, ...editForm, total: parseFloat(editForm.total), subtotal: parseFloat(editForm.subtotal) }))
    setEditing(false)
    setUpdating(false)
  }

  const deleteOrder = async () => {
    setUpdating(true)
    const supabase = createClient()
    await supabase.from('order_items').delete().eq('order_id', selected.id)
    await supabase.from('payments').delete().eq('order_id', selected.id)
    await supabase.from('orders').delete().eq('id', selected.id)
    await loadAll(supabase)
    setSelected(null)
    setDeleteConfirm(false)
    setUpdating(false)
  }

  const getProofUrl = async (path) => {
    const supabase = createClient()
    const { data } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  const nextStatus = { new: 'review', review: 'confirmed', confirmed: 'dispatched', dispatched: 'completed' }
  const nextLabel  = { new: 'Move to review', review: 'Confirm order', confirmed: 'Mark dispatched', dispatched: 'Mark completed' }
  const nextColor  = { new: '#854f0b', review: '#534ab7', confirmed: '#2d7dd2', dispatched: '#2a7d4f' }

  const filteredOrders = orders.filter(o => {
    const matchFilter = filter === 'all' || o.status === filter
    const matchSearch = !search || String(o.order_number).includes(search) || getClientEmail(o).toLowerCase().includes(search.toLowerCase()) || (getClient(o)?.business_name || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    active: orders.filter(o => ['review','confirmed','dispatched'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => ['confirmed','dispatched','completed'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0),
  }

  const OrderCard = ({ order }) => {
    const s = statusConfig[order.status] || statusConfig.new
    const client = getClient(order)
    const payment = payments[order.id]
    const totalUnits = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0
    const isSelected = selected?.id === order.id
    const hasProof = payment?.payment_proof_url

    return (
      <div onClick={() => { setSelected(isSelected ? null : order); setEditing(false); setDeleteConfirm(false) }}
        style={{ background: isSelected ? 'rgba(45,125,210,0.04)' : '#111', border: `1px solid ${isSelected ? '#2d7dd2' : 'rgba(255,255,255,0.06)'}`, borderLeft: `4px solid ${s.color}`, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s', marginBottom: 8 }}>
        <div style={{ padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div style={{ width: 38, height: 38, borderRadius: 4, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>#{order.order_number}</div>
                {hasProof && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 8, background: 'rgba(42,125,79,0.15)', color: '#2a7d4f', fontWeight: 700 }}>📤 Proof submitted</span>}
              </div>
              <div style={{ fontSize: 11, color: '#666' }}>{client?.business_name || getClientEmail(order)} · {fmtDate(order.submitted_at)} at {fmtTime(order.submitted_at)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#444', marginBottom: 1 }}>Items</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>{order.order_items?.length || 0}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#444', marginBottom: 1 }}>Units</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>{totalUnits}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#444', marginBottom: 1 }}>Payment</div>
              <div style={{ fontSize: 12, color: '#777' }}>{payment ? payMethodIcons[payment.payment_method] : '—'}</div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 80 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: order.status === 'completed' ? '#2a7d4f' : order.status === 'new' ? '#e74c3c' : '#fff' }}>${order.total?.toLocaleString()}</div>
            </div>
          </div>
        </div>
        {order.order_items && order.order_items.length > 0 && (
          <div style={{ padding: '0 1.25rem 0.75rem', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {order.order_items.slice(0,3).map((item, i) => (
              <span key={i} style={{ fontSize: 10, padding: '2px 9px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 20, color: '#777' }}>
                {item.product_name} ×{item.quantity}
              </span>
            ))}
            {order.order_items.length > 3 && <span style={{ fontSize: 10, padding: '2px 9px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 20, color: '#444' }}>+{order.order_items.length - 3} more</span>}
          </div>
        )}
      </div>
    )
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
          { label: 'New — action needed', value: stats.new, color: stats.new > 0 ? '#e74c3c' : '#555', icon: '📥' },
          { label: 'Active', value: stats.active, color: '#854f0b', icon: '⏳' },
          { label: 'Completed', value: stats.completed, color: '#2a7d4f', icon: '🎉' },
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
          {/* SEARCH + FILTERS */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order # or client..."
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: 11, padding: '7px 12px 7px 30px', borderRadius: 20, outline: 'none', fontFamily: 'inherit', width: 220 }} />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#555' }}>🔍</span>
            </div>
            <button onClick={() => setFilter('all')} style={{ fontSize: 11, fontWeight: filter === 'all' ? 700 : 400, padding: '5px 14px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${filter === 'all' ? '#2d7dd2' : 'rgba(255,255,255,0.08)'}`, background: filter === 'all' ? 'rgba(45,125,210,0.15)' : 'transparent', color: filter === 'all' ? '#2d7dd2' : '#777' }}>
              All <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '1px 6px', marginLeft: 4 }}>{orders.length}</span>
            </button>
            {groups.map(g => {
              const count = orders.filter(o => o.status === g.key).length
              if (count === 0 && filter !== g.key) return null
              return (
                <button key={g.key} onClick={() => setFilter(g.key)} style={{ fontSize: 11, fontWeight: filter === g.key ? 700 : 400, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${filter === g.key ? g.color : 'rgba(255,255,255,0.08)'}`, background: filter === g.key ? g.color + '20' : 'transparent', color: filter === g.key ? g.color : '#777', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10 }}>{statusConfig[g.key]?.icon}</span>
                  {statusConfig[g.key]?.label}
                  <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '1px 6px' }}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* GROUPED or FILTERED LIST */}
          {filteredOrders.length === 0 ? (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '3rem', textAlign: 'center', color: '#444' }}>No orders found</div>
          ) : filter === 'all' ? (
            groups.map(g => {
              const groupOrders = filteredOrders.filter(o => o.status === g.key)
              if (groupOrders.length === 0) return null
              return (
                <div key={g.key} style={{ marginBottom: '1.5rem' }}>
                  {/* Group header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem', padding: '8px 14px', background: g.color + '12', border: `0.5px solid ${g.color}30`, borderRadius: 6 }}>
                    <div style={{ fontSize: 16 }}>{statusConfig[g.key]?.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: g.color }}>{g.label}</div>
                      {g.desc && <div style={{ fontSize: 10, color: g.color, opacity: 0.6 }}>{g.desc}</div>}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: g.color }}>{groupOrders.length}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: g.color, opacity: 0.7 }}>${groupOrders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}</div>
                  </div>
                  {groupOrders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
              )
            })
          ) : (
            filteredOrders.map(order => <OrderCard key={order.id} order={order} />)
          )}
        </div>

        {/* RIGHT — ORDER DETAIL */}
        {selected && (() => {
          const s = statusConfig[selected.status] || statusConfig.new
          const client = getClient(selected)
          const payment = payments[selected.id]
          const email = getClientEmail(selected)
          const totalUnits = selected.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0
          const steps = ['New', 'Review', 'Confirmed', 'Dispatched', 'Completed']

          return (
            <div style={{ position: 'sticky', top: 20 }}>
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #0d0d0d, #1a1a2e)', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: s.color, fontWeight: 600, marginBottom: 4 }}>{s.icon} {s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Order #{selected.order_number}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{fmtDate(selected.submitted_at)} at {fmtTime(selected.submitted_at)}</div>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                  </div>
                  {/* Progress */}
                  {selected.status !== 'cancelled' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 10, left: '5%', right: '5%', height: 2, background: 'rgba(255,255,255,0.06)' }} />
                      <div style={{ position: 'absolute', top: 10, left: '5%', height: 2, background: s.color, width: `${Math.max(0, (s.step / 4) * 90)}%`, transition: 'width 0.5s' }} />
                      {steps.map((step, i) => {
                        const done = i <= s.step
                        const active = i === s.step
                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? s.color : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? `0 0 0 3px ${s.color}30` : 'none' }}>
                              {done ? <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>✓</span> : <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'block' }} />}
                            </div>
                            <div style={{ fontSize: 8, color: done ? s.color : '#444', fontWeight: done ? 600 : 400, marginTop: 4, whiteSpace: 'nowrap' }}>{step}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div style={{ maxHeight: '72vh', overflowY: 'auto' }}>

                  {/* ACTION BUTTONS */}
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {nextStatus[selected.status] && (
                      <button onClick={() => updateStatus(selected.id, nextStatus[selected.status])} disabled={updating}
                        style={{ flex: 1, padding: '9px', background: nextColor[selected.status] || '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: updating ? 'not-allowed' : 'pointer', borderRadius: 3 }}>
                        → {nextLabel[selected.status]}
                      </button>
                    )}
                    <button onClick={() => { setEditing(!editing); setDeleteConfirm(false); setEditForm({ status: selected.status, total: selected.total, subtotal: selected.subtotal, notes: selected.notes || '' }) }}
                      style={{ padding: '9px 14px', background: editing ? 'rgba(45,125,210,0.15)' : 'rgba(255,255,255,0.06)', color: editing ? '#2d7dd2' : '#ccc', fontSize: 11, fontWeight: 600, border: `0.5px solid ${editing ? 'rgba(45,125,210,0.4)' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', borderRadius: 3 }}>
                      ✏️ Edit
                    </button>
                    {email && (
                      <a href={`mailto:${email}?subject=Re: Order %23${selected.order_number}`}
                        style={{ padding: '9px 12px', background: 'rgba(45,125,210,0.1)', color: '#2d7dd2', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(45,125,210,0.2)', cursor: 'pointer', borderRadius: 3, textDecoration: 'none' }}>
                        📧
                      </a>
                    )}
                    <button onClick={() => { setDeleteConfirm(!deleteConfirm); setEditing(false) }}
                      style={{ padding: '9px 12px', background: deleteConfirm ? 'rgba(231,76,60,0.15)' : 'transparent', color: '#e74c3c', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(231,76,60,0.3)', cursor: 'pointer', borderRadius: 3 }}>
                      🗑
                    </button>
                  </div>

                  {/* QUICK STATUS */}
                  <div style={{ padding: '0.75rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 4 }}>Status:</span>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <button key={key} onClick={() => key !== selected.status && updateStatus(selected.id, key)} disabled={selected.status === key || updating}
                        style={{ fontSize: 9, padding: '3px 9px', borderRadius: 10, cursor: selected.status === key ? 'default' : 'pointer', border: `1px solid ${selected.status === key ? val.color : 'rgba(255,255,255,0.06)'}`, background: selected.status === key ? val.bg : 'transparent', color: selected.status === key ? val.color : '#555', fontWeight: selected.status === key ? 700 : 400 }}>
                        {val.icon} {val.label}
                      </button>
                    ))}
                  </div>

                  {/* EDIT FORM */}
                  {editing && (
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(45,125,210,0.04)' }}>
                      <div style={{ fontSize: 10, color: '#2d7dd2', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Edit order</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <div>
                          <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Status</label>
                          <select value={editForm.status} onChange={e => setEditForm(f => ({...f, status: e.target.value}))}
                            style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '8px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                            {Object.entries(statusConfig).map(([key, val]) => <option key={key} value={key}>{val.icon} {val.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Total ($)</label>
                          <input type="number" value={editForm.total} onChange={e => setEditForm(f => ({...f, total: e.target.value}))}
                            style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '8px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Notes</label>
                        <textarea value={editForm.notes} onChange={e => setEditForm(f => ({...f, notes: e.target.value}))} rows={2}
                          style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '8px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }} />
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={saveEdit} disabled={updating} style={{ flex: 1, padding: 9, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 3 }}>
                          {updating ? 'Saving...' : '✓ Save changes'}
                        </button>
                        <button onClick={() => setEditing(false)} style={{ padding: '9px 14px', background: 'transparent', color: '#555', fontSize: 11, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* DELETE CONFIRM */}
                  {deleteConfirm && (
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(231,76,60,0.2)', background: 'rgba(231,76,60,0.06)' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#e74c3c', marginBottom: 6 }}>⚠️ Delete order #{selected.order_number}?</div>
                      <p style={{ fontSize: 11, color: '#888', lineHeight: 1.7, marginBottom: 10 }}>Permanently deletes the order, items and payment records. Cannot be undone.</p>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={deleteOrder} disabled={updating} style={{ flex: 1, padding: 9, background: '#e74c3c', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 3 }}>
                          {updating ? 'Deleting...' : '🗑 Delete permanently'}
                        </button>
                        <button onClick={() => setDeleteConfirm(false)} style={{ padding: '9px 14px', background: 'transparent', color: '#555', fontSize: 11, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* CLIENT */}
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Client</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[['Business', client?.business_name||'—'],['Contact', client?.contact_name||'—'],['Email', email||'—'],['Phone', client?.phone||'—'],['Type', client?.business_type||'—'],['EIN', client?.ein_number||client?.ein||'—']].map(([label, val]) => (
                        <div key={label} style={{ padding: '7px 10px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ fontSize: 8, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 11, color: '#ccc', fontWeight: 500, wordBreak: 'break-all' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PAYMENT */}
                  {payment && (
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Payment & Shipping</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <div style={{ padding: '8px 10px', background: 'rgba(45,125,210,0.08)', border: '0.5px solid rgba(45,125,210,0.2)', borderRadius: 3 }}>
                          <div style={{ fontSize: 8, color: '#888', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment</div>
                          <div style={{ fontSize: 12, color: '#2d7dd2', fontWeight: 600 }}>{payMethodIcons[payment.payment_method]} {payMethodLabels[payment.payment_method]}</div>
                        </div>
                        <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                          <div style={{ fontSize: 8, color: '#888', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shipping</div>
                          <div style={{ fontSize: 11, color: '#ccc', fontWeight: 500 }}>{shippingLabels[payment.shipping_method] || payment.shipping_method || '—'}</div>
                        </div>
                      </div>
                      <div style={{ padding: '8px 12px', background: payment.payment_proof_url ? 'rgba(42,125,79,0.08)' : 'rgba(255,255,255,0.02)', border: `0.5px solid ${payment.payment_proof_url ? 'rgba(42,125,79,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {payment.payment_proof_url ? (
                          <>
                            <div style={{ fontSize: 11, color: '#2a7d4f', fontWeight: 600 }}>✅ Payment proof submitted</div>
                            <button onClick={() => getProofUrl(payment.payment_proof_url)} style={{ fontSize: 10, color: '#2d7dd2', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.3)', padding: '4px 10px', borderRadius: 10, cursor: 'pointer' }}>View →</button>
                          </>
                        ) : (
                          <div style={{ fontSize: 11, color: '#555' }}>⏳ Awaiting payment proof from client</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ITEMS */}
                  <div style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Items · {selected.order_items?.length} products · {totalUnits} units</div>
                    {selected.order_items?.map((item, i) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < selected.order_items.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#ccc', marginBottom: 2 }}>{item.product_name}</div>
                          <div style={{ fontSize: 9, color: '#555', fontFamily: 'monospace' }}>{item.product_sku} · {item.quantity} units × ${item.unit_price?.toLocaleString()}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: '10px 12px', background: `${s.color}10`, border: `0.5px solid ${s.color}30`, borderRadius: 3, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>Total</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>${selected.total?.toLocaleString()}</span>
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
