'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function OrdersPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState({})
  const [uploaded, setUploaded] = useState({})

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

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/portal' }

  const uploadDoc = async (orderId, file, type) => {
    if (!file) return
    const key = `${orderId}-${type}`
    setUploading(prev => ({ ...prev, [key]: true }))
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${type}/${orderId}-${Date.now()}.${ext}`
      await supabase.storage.from('Documents').upload(path, file, { contentType: file.type, upsert: true })
      const field = type === 'bol' ? 'bol_url' : 'labels_url'
      await supabase.from('orders').update({ [field]: path }).eq('id', orderId)
      setUploaded(prev => ({ ...prev, [key]: true }))
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: path } : o))
      if (selected?.id === orderId) setSelected(prev => ({ ...prev, [field]: path }))
    } catch (e) { alert('Upload failed. Please try again.') }
    setUploading(prev => ({ ...prev, [key]: false }))
  }

  const statusConfig = {
    new:        { label: 'Received',   color: '#2d7dd2', bg: 'rgba(45,125,210,0.1)',  icon: '📥', step: 0, desc: 'Your order has been received and is pending review.' },
    review:     { label: 'In review',  color: '#854f0b', bg: 'rgba(186,117,23,0.1)',  icon: '🔍', step: 1, desc: 'Our team is reviewing your order.' },
    confirmed:  { label: 'Confirmed',  color: '#534ab7', bg: 'rgba(83,74,183,0.1)',   icon: '✅', step: 2, desc: 'Order confirmed! Please upload your BOL and shipping labels below.' },
    dispatched: { label: 'Dispatched', color: '#2a7d4f', bg: 'rgba(42,125,79,0.1)',   icon: '🚚', step: 3, desc: 'Your order is on its way!' },
    completed:  { label: 'Completed',  color: '#2a7d4f', bg: 'rgba(42,125,79,0.08)',  icon: '🎉', step: 4, desc: 'Order delivered successfully. Thank you!' },
    cancelled:  { label: 'Cancelled',  color: '#c0392b', bg: 'rgba(231,76,60,0.08)',  icon: '✕',  step: -1, desc: 'This order has been cancelled.' },
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const steps = ['Received', 'In review', 'Confirmed', 'Dispatched', 'Completed']

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', left: 10, top: 0, width: 3, height: 38, background: '#333' }} />
          <div style={{ position: 'absolute', left: 10, bottom: 0, width: 26, height: 3, background: '#333' }} />
          <div style={{ position: 'absolute', left: 16, bottom: 10, width: 16, height: 3, background: '#2d7dd2' }} />
        </div>
        <div style={{ fontSize: 12, color: '#444' }}>Loading orders...</div>
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

      <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT — orders list */}
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>My Orders <span style={{ fontSize: 14, color: '#aaa', fontWeight: 400 }}>· {orders.length} total</span></div>

          {orders.length === 0 ? (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>No orders yet</div>
              <Link href="/portal/catalog" style={{ display: 'inline-block', padding: '10px 24px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', marginTop: 8 }}>Browse catalog</Link>
            </div>
          ) : orders.map(order => {
            const s = statusConfig[order.status] || statusConfig.new
            const isSelected = selected?.id === order.id
            const needsDocs = order.status === 'confirmed' && order.shipment_weight && (!order.bol_url || !order.labels_url)
            const totalUnits = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0

            return (
              <div key={order.id} onClick={() => setSelected(isSelected ? null : order)}
                style={{ background: '#fff', border: `1.5px solid ${isSelected ? '#2d7dd2' : needsDocs ? 'rgba(83,74,183,0.4)' : 'rgba(0,0,0,0.08)'}`, borderLeft: `5px solid ${s.color}`, borderRadius: 8, padding: '1.25rem 1.5rem', marginBottom: 10, cursor: 'pointer', boxShadow: isSelected ? '0 4px 20px rgba(45,125,210,0.12)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>Order #{order.order_number}</div>
                      <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 700 }}>{s.icon} {s.label}</span>
                      {needsDocs && <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 10, background: 'rgba(83,74,183,0.1)', color: '#534ab7', fontWeight: 700 }}>⚡ Upload docs needed</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>{fmtDate(order.submitted_at)} · {order.order_items?.length || 0} products · {totalUnits} units</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>${order.total?.toLocaleString()}</div>
                </div>

                {/* Progress bar */}
                {order.status !== 'cancelled' && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: 4 }}>
                      <div style={{ position: 'absolute', top: 8, left: '5%', right: '5%', height: 2, background: '#f0f0f0' }} />
                      <div style={{ position: 'absolute', top: 8, left: '5%', height: 2, background: s.color, width: `${Math.max(0, (s.step / 4) * 90)}%` }} />
                      {steps.map((step, i) => {
                        const done = i <= s.step
                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: done ? s.color : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {done && <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>✓</span>}
                            </div>
                            <div style={{ fontSize: 8, color: done ? s.color : '#bbb', fontWeight: done ? 700 : 400, marginTop: 3, whiteSpace: 'nowrap' }}>{step}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {order.order_items?.slice(0,3).map((item, i) => (
                    <span key={i} style={{ fontSize: 10, padding: '3px 10px', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, color: '#888' }}>{item.product_name} ×{item.quantity}</span>
                  ))}
                  {order.order_items?.length > 3 && <span style={{ fontSize: 10, color: '#bbb' }}>+{order.order_items.length - 3} more</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT — order detail */}
        {selected && (() => {
          const s = statusConfig[selected.status] || statusConfig.new
          const hasShipmentInfo = selected.shipment_weight || selected.shipment_pallets
          const hasBol = selected.bol_url || uploaded[`${selected.id}-bol`]
          const hasLabels = selected.labels_url || uploaded[`${selected.id}-labels`]
          const totalUnits = selected.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0

          return (
            <div style={{ position: 'sticky', top: 80 }}>
              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#0d0d0d,#1a1a2e)', padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: s.color, fontWeight: 600, marginBottom: 4 }}>{s.icon} {s.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 2 }}>Order #{selected.order_number}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{fmtDate(selected.submitted_at)} at {fmtTime(selected.submitted_at)}</div>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                  </div>
                  <div style={{ padding: '10px 14px', background: `${s.color}15`, border: `0.5px solid ${s.color}30`, borderRadius: 6, fontSize: 12, color: '#ccc', lineHeight: 1.6 }}>
                    {s.desc}
                  </div>
                </div>

                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                  {/* SHIPMENT INFO — shown when confirmed */}
                  {hasShipmentInfo && (
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)', background: 'rgba(83,74,183,0.04)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#534ab7', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>📦 Shipment information</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: selected.shipment_notes ? 8 : 0 }}>
                        {[
                          ['Total weight', selected.shipment_weight],
                          ['Dimensions', selected.shipment_dimensions],
                          ['Number of pallets', selected.shipment_pallets ? `${selected.shipment_pallets} pallet${selected.shipment_pallets > 1 ? 's' : ''}` : null],
                        ].filter(([,v]) => v).map(([label, val]) => (
                          <div key={label} style={{ padding: '10px 12px', background: '#fff', border: '0.5px solid rgba(83,74,183,0.15)', borderRadius: 4 }}>
                            <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#333' }}>{val}</div>
                          </div>
                        ))}
                      </div>
                      {selected.shipment_notes && (
                        <div style={{ padding: '10px 12px', background: '#fff', border: '0.5px solid rgba(83,74,183,0.15)', borderRadius: 4 }}>
                          <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Notes</div>
                          <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>{selected.shipment_notes}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BOL & LABELS UPLOAD */}
                  {selected.status === 'confirmed' && (
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)', background: (!hasBol || !hasLabels) ? 'rgba(83,74,183,0.03)' : 'rgba(42,125,79,0.03)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: (!hasBol || !hasLabels) ? '#534ab7' : '#2a7d4f', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                        {(!hasBol || !hasLabels) ? '⚡ Upload required documents' : '✅ Documents uploaded'}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {/* BOL */}
                        <div style={{ padding: '1rem', background: '#fff', border: `1px solid ${hasBol ? 'rgba(42,125,79,0.3)' : 'rgba(83,74,183,0.2)'}`, borderRadius: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: hasBol ? 0 : 10 }}>
                            <span style={{ fontSize: 24 }}>📋</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Bill of Lading (BOL)</div>
                              <div style={{ fontSize: 10, color: '#aaa' }}>PDF or image</div>
                            </div>
                            {hasBol && <span style={{ marginLeft: 'auto', fontSize: 9, padding: '3px 10px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', borderRadius: 10, fontWeight: 700 }}>✅ Uploaded</span>}
                          </div>
                          {!hasBol && (
                            <label style={{ display: 'block', border: '2px dashed #e0e0e0', borderRadius: 4, padding: '12px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                              <input type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                                onChange={e => e.target.files[0] && uploadDoc(selected.id, e.target.files[0], 'bol')} />
                              {uploading[`${selected.id}-bol`] ? (
                                <div style={{ fontSize: 12, color: '#2d7dd2', fontWeight: 600 }}>⏳ Uploading...</div>
                              ) : (
                                <div style={{ fontSize: 12, color: '#aaa' }}>📤 Click to upload BOL</div>
                              )}
                            </label>
                          )}
                        </div>

                        {/* LABELS */}
                        <div style={{ padding: '1rem', background: '#fff', border: `1px solid ${hasLabels ? 'rgba(42,125,79,0.3)' : 'rgba(83,74,183,0.2)'}`, borderRadius: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: hasLabels ? 0 : 10 }}>
                            <span style={{ fontSize: 24 }}>🏷</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Shipping Labels</div>
                              <div style={{ fontSize: 10, color: '#aaa' }}>PDF or image</div>
                            </div>
                            {hasLabels && <span style={{ marginLeft: 'auto', fontSize: 9, padding: '3px 10px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', borderRadius: 10, fontWeight: 700 }}>✅ Uploaded</span>}
                          </div>
                          {!hasLabels && (
                            <label style={{ display: 'block', border: '2px dashed #e0e0e0', borderRadius: 4, padding: '12px', textAlign: 'center', cursor: 'pointer', background: '#fafafa' }}>
                              <input type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                                onChange={e => e.target.files[0] && uploadDoc(selected.id, e.target.files[0], 'labels')} />
                              {uploading[`${selected.id}-labels`] ? (
                                <div style={{ fontSize: 12, color: '#2d7dd2', fontWeight: 600 }}>⏳ Uploading...</div>
                              ) : (
                                <div style={{ fontSize: 12, color: '#aaa' }}>📤 Click to upload labels</div>
                              )}
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ITEMS */}
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Items · {selected.order_items?.length} products · {totalUnits} units</div>
                    {selected.order_items?.map((item, i) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < selected.order_items.length - 1 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 2 }}>{item.product_name}</div>
                          <div style={{ fontSize: 10, color: '#aaa', fontFamily: 'monospace' }}>{item.product_sku} · {item.quantity} units × ${item.unit_price?.toLocaleString()}</div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#555' }}>Order total</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>${selected.total?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* QUICK ACTIONS */}
                  <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: 8 }}>
                    <Link href="/portal/payments" style={{ flex: 1, padding: '10px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 4, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                      💳 View payments
                    </Link>
                    <Link href="/portal/invoices" style={{ flex: 1, padding: '10px', background: '#f7f8fa', color: '#555', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 4, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                      🧾 View invoices
                    </Link>
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
