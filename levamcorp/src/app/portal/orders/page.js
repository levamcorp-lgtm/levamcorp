'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const NAV_LINKS = [['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']]

function PortalNav({ onLogout }) {
  const pathname = usePathname()
  return (
    <nav style={{ position:'sticky', top:0, zIndex:40, background:'#08090B', borderBottom:'1px solid rgba(245,241,232,0.1)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', height:60, maxWidth:1240, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:32 }}>
          <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:30, height:30, border:'1.5px solid rgba(245,241,232,0.35)', borderLeft:'3px solid #2F7DF6', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width:16, height:'auto' }}/>
            </div>
            <div>
              <div className="lc-display" style={{ fontSize:13, fontWeight:700, letterSpacing:'0.16em', color:'#F5F1E8', textTransform:'uppercase', lineHeight:1 }}>LEVAM<span style={{ color:'#2F7DF6' }}>CORP</span></div>
              <div className="lc-mono" style={{ fontSize:7, letterSpacing:'0.2em', color:'#6F6D67', textTransform:'uppercase', marginTop:2 }}>Partner Portal</div>
            </div>
          </Link>
          <div style={{ display:'flex', height:60 }}>
            {NAV_LINKS.map(([l,h]) => {
              const active = pathname === h
              return (
                <Link key={l} href={h} className="lc-mono" style={{ display:'flex', alignItems:'center', fontSize:10.5, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color: active ? '#F5F1E8' : '#6F6D67', textDecoration:'none', padding:'0 16px', borderBottom: active ? '2px solid #2F7DF6' : '2px solid transparent' }}>{l}</Link>
              )
            })}
          </div>
        </div>
        <button onClick={onLogout} className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#8A8780', border:'1px solid rgba(245,241,232,0.18)', padding:'8px 14px', background:'transparent', cursor:'pointer' }}>Sign out</button>
      </div>
    </nav>
  )
}

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
        .or(`user_id.eq.${data.user.id},notes.ilike.%${data.user.email}%`)
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
    new:        { label: 'Received',   color: '#2F7DF6', icon: '📥', step: 0, desc: 'Your order has been received and is pending review.' },
    review:     { label: 'In review',  color: '#B98A54', icon: '🔍', step: 1, desc: 'Our team is reviewing your order.' },
    confirmed:  { label: 'Confirmed',  color: '#6B7280', icon: '✅', step: 2, desc: 'Order confirmed! Please upload your BOL and shipping labels below.' },
    dispatched: { label: 'Dispatched', color: '#12B76A', icon: '🚚', step: 3, desc: 'Your order is on its way!' },
    completed:  { label: 'Completed',  color: '#12B76A', icon: '🎉', step: 4, desc: 'Order delivered successfully. Thank you!' },
    cancelled:  { label: 'Cancelled',  color: '#E74C3C', icon: '✕',  step: -1, desc: 'This order has been cancelled.' },
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const steps = ['Received', 'In review', 'Confirmed', 'Dispatched', 'Completed']

  const globalStyle = `
    .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }
    .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
    @keyframes spin { to{transform:rotate(360deg)} }
  `

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{globalStyle}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(8,9,11,0.12)', borderTop:'2px solid #2F7DF6', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 0.7s linear infinite' }}/>
        <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A8780' }}>Loading orders…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color:'#08090B', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>
      <style>{globalStyle}</style>

      <PortalNav onLogout={handleLogout}/>

      <div style={{ padding: '2rem', maxWidth: 1240, margin: '0 auto' }}>
        <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8A8780' }}>
          <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
          Partner portal · My orders
        </div>
        <div style={{ height:1, background:'rgba(8,9,11,0.16)' }}/>
        <h1 className="lc-display" style={{ fontSize:'clamp(26px,3.2vw,36px)', fontWeight:400, letterSpacing:'-0.03em', margin:'clamp(18px,2.6vh,26px) 0 clamp(20px,3vh,28px)', color:'#08090B' }}>
          My orders<span style={{ color:'#2F7DF6' }}>.</span> <span style={{ fontSize:15, color:'#8A8780', fontWeight:400, fontFamily:'inherit' }}>{orders.length} total</span>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT — orders list */}
          <div>
            {orders.length === 0 ? (
              <div style={{ background: '#F2EFE6', border: '1px solid rgba(8,9,11,0.1)', padding: '4rem', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity:0.6 }}>📦</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#08090B', marginBottom: 6 }}>No orders yet</div>
                <Link href="/portal/catalog" className="lc-mono" style={{ display: 'inline-block', padding: '11px 24px', background: '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', marginTop: 8 }}>Browse catalog</Link>
              </div>
            ) : orders.map(order => {
              const s = statusConfig[order.status] || statusConfig.new
              const isSelected = selected?.id === order.id
              const needsDocs = order.status === 'confirmed' && order.shipment_weight && (!order.bol_url || !order.labels_url)
              const totalUnits = order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0

              return (
                <div key={order.id} onClick={() => setSelected(isSelected ? null : order)}
                  style={{ background: '#F2EFE6', borderTop: `1px solid ${isSelected ? '#2F7DF6' : needsDocs ? 'rgba(107,114,128,0.5)' : 'rgba(8,9,11,0.1)'}`, borderRight: `1px solid ${isSelected ? '#2F7DF6' : needsDocs ? 'rgba(107,114,128,0.5)' : 'rgba(8,9,11,0.1)'}`, borderBottom: `1px solid ${isSelected ? '#2F7DF6' : needsDocs ? 'rgba(107,114,128,0.5)' : 'rgba(8,9,11,0.1)'}`, borderLeft: `4px solid ${s.color}`, padding: '1.1rem 1.4rem', marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap:'wrap', gap:8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap:'wrap' }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#08090B' }}>Order #{order.order_number}</div>
                        <span className="lc-mono" style={{ fontSize: 9, padding: '4px 9px', border:`1px solid ${s.color}55`, color: s.color, fontWeight: 700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.icon} {s.label}</span>
                        {needsDocs && <span className="lc-mono" style={{ fontSize: 9, padding: '4px 9px', border:'1px solid rgba(107,114,128,0.5)', color: '#6B7280', fontWeight: 700, letterSpacing:'0.06em', textTransform:'uppercase' }}>⚡ Upload docs needed</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#8A8780' }}>{fmtDate(order.submitted_at)} · {order.order_items?.length || 0} products · {totalUnits} units</div>
                    </div>
                    <div className="lc-display" style={{ fontSize: 21, fontWeight: 700, color: '#08090B' }}>${order.total?.toLocaleString()}</div>
                  </div>

                  {/* Progress bar */}
                  {order.status !== 'cancelled' && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: 4 }}>
                        <div style={{ position: 'absolute', top: 8, left: '5%', right: '5%', height: 1, background: 'rgba(8,9,11,0.14)' }} />
                        <div style={{ position: 'absolute', top: 8, left: '5%', height: 1, background: s.color, width: `${Math.max(0, (s.step / 4) * 90)}%` }} />
                        {steps.map((step, i) => {
                          const done = i <= s.step
                          return (
                            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                              <div style={{ width: 15, height: 15, borderRadius: '50%', background: done ? s.color : '#FFFFFF', border: done ? 'none' : '1px solid rgba(8,9,11,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {done && <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>✓</span>}
                              </div>
                              <div className="lc-mono" style={{ fontSize: 8, color: done ? s.color : '#BFBBAF', fontWeight: done ? 700 : 400, marginTop: 3, whiteSpace: 'nowrap' }}>{step}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {order.order_items?.slice(0,3).map((item, i) => (
                      <span key={i} className="lc-mono" style={{ fontSize: 9.5, padding: '4px 10px', background: '#FFFFFF', border: '1px solid rgba(8,9,11,0.1)', color: '#5C5A55' }}>{item.product_name} ×{item.quantity}</span>
                    ))}
                    {order.order_items?.length > 3 && <span style={{ fontSize: 10, color: '#8A8780' }}>+{order.order_items.length - 3} more</span>}
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
              <div style={{ position: 'sticky', top: 76 }}>
                <div style={{ background: '#FFFFFF', border: '1px solid rgba(8,9,11,0.1)' }}>

                  {/* Header */}
                  <div style={{ background: '#08090B', padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div className="lc-mono" style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: s.color, fontWeight: 700, marginBottom: 5 }}>{s.icon} {s.label}</div>
                        <div style={{ fontSize: 19, fontWeight: 800, color: '#F5F1E8', marginBottom: 2 }}>Order #{selected.order_number}</div>
                        <div style={{ fontSize: 11, color: '#6F6D67' }}>{fmtDate(selected.submitted_at)} at {fmtTime(selected.submitted_at)}</div>
                      </div>
                      <button onClick={() => setSelected(null)} style={{ background: 'rgba(245,241,232,0.1)', border: 'none', color: '#8A8780', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                    </div>
                    <div className="lc-mono" style={{ padding: '10px 14px', background: `${s.color}18`, border: `1px solid ${s.color}40`, fontSize: 11.5, color: '#DDD8CD', lineHeight: 1.6 }}>
                      {s.desc}
                    </div>
                  </div>

                  <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>

                    {/* SHIPMENT INFO — shown when confirmed */}
                    {hasShipmentInfo && (
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(8,9,11,0.08)', background: 'rgba(107,114,128,0.05)' }}>
                        <div className="lc-mono" style={{ fontSize: 9.5, fontWeight: 700, color: '#6B7280', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem' }}>📦 Shipment information</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: selected.shipment_notes ? 8 : 0 }}>
                          {[
                            ['Total weight', selected.shipment_weight],
                            ['Dimensions', selected.shipment_dimensions],
                            ['Number of pallets', selected.shipment_pallets ? `${selected.shipment_pallets} pallet${selected.shipment_pallets > 1 ? 's' : ''}` : null],
                          ].filter(([,v]) => v).map(([label, val]) => (
                            <div key={label} style={{ padding: '10px 12px', background: '#FFFFFF', border: '1px solid rgba(107,114,128,0.25)' }}>
                              <div className="lc-mono" style={{ fontSize: 8.5, color: '#8A8780', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#08090B' }}>{val}</div>
                            </div>
                          ))}
                        </div>
                        {selected.shipment_notes && (
                          <div style={{ padding: '10px 12px', background: '#FFFFFF', border: '1px solid rgba(107,114,128,0.25)' }}>
                            <div className="lc-mono" style={{ fontSize: 8.5, color: '#8A8780', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Notes</div>
                            <div style={{ fontSize: 12, color: '#5C5A55', lineHeight: 1.7 }}>{selected.shipment_notes}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* BOL & LABELS UPLOAD */}
                    {selected.status === 'confirmed' && (
                      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(8,9,11,0.08)', background: (!hasBol || !hasLabels) ? 'rgba(107,114,128,0.04)' : 'rgba(18,183,106,0.04)' }}>
                        <div className="lc-mono" style={{ fontSize: 9.5, fontWeight: 700, color: (!hasBol || !hasLabels) ? '#6B7280' : '#0E9A5A', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                          {(!hasBol || !hasLabels) ? '⚡ Upload required documents' : '✅ Documents uploaded'}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {/* BOL */}
                          <div style={{ padding: '1rem', background: '#FFFFFF', border: `1px solid ${hasBol ? 'rgba(18,183,106,0.35)' : 'rgba(107,114,128,0.3)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: hasBol ? 0 : 10 }}>
                              <span style={{ fontSize: 22 }}>📋</span>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#08090B' }}>Bill of Lading (BOL)</div>
                                <div style={{ fontSize: 10, color: '#8A8780' }}>PDF or image</div>
                              </div>
                              {hasBol && <span className="lc-mono" style={{ marginLeft: 'auto', fontSize: 9, padding: '4px 9px', background: 'rgba(18,183,106,0.1)', color: '#0E9A5A', fontWeight: 700, letterSpacing:'0.04em', textTransform:'uppercase' }}>✅ Uploaded</span>}
                            </div>
                            {!hasBol && (
                              <label style={{ display: 'block', border: '1.5px dashed rgba(8,9,11,0.22)', padding: '12px', textAlign: 'center', cursor: 'pointer', background: '#F2EFE6' }}>
                                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                                  onChange={e => e.target.files[0] && uploadDoc(selected.id, e.target.files[0], 'bol')} />
                                {uploading[`${selected.id}-bol`] ? (
                                  <div className="lc-mono" style={{ fontSize: 11, color: '#2F7DF6', fontWeight: 700, textTransform:'uppercase', letterSpacing:'0.06em' }}>⏳ Uploading…</div>
                                ) : (
                                  <div className="lc-mono" style={{ fontSize: 11, color: '#8A8780', textTransform:'uppercase', letterSpacing:'0.06em' }}>📤 Click to upload BOL</div>
                                )}
                              </label>
                            )}
                          </div>

                          {/* LABELS */}
                          <div style={{ padding: '1rem', background: '#FFFFFF', border: `1px solid ${hasLabels ? 'rgba(18,183,106,0.35)' : 'rgba(107,114,128,0.3)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: hasLabels ? 0 : 10 }}>
                              <span style={{ fontSize: 22 }}>🏷</span>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#08090B' }}>Shipping Labels</div>
                                <div style={{ fontSize: 10, color: '#8A8780' }}>PDF or image</div>
                              </div>
                              {hasLabels && <span className="lc-mono" style={{ marginLeft: 'auto', fontSize: 9, padding: '4px 9px', background: 'rgba(18,183,106,0.1)', color: '#0E9A5A', fontWeight: 700, letterSpacing:'0.04em', textTransform:'uppercase' }}>✅ Uploaded</span>}
                            </div>
                            {!hasLabels && (
                              <label style={{ display: 'block', border: '1.5px dashed rgba(8,9,11,0.22)', padding: '12px', textAlign: 'center', cursor: 'pointer', background: '#F2EFE6' }}>
                                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                                  onChange={e => e.target.files[0] && uploadDoc(selected.id, e.target.files[0], 'labels')} />
                                {uploading[`${selected.id}-labels`] ? (
                                  <div className="lc-mono" style={{ fontSize: 11, color: '#2F7DF6', fontWeight: 700, textTransform:'uppercase', letterSpacing:'0.06em' }}>⏳ Uploading…</div>
                                ) : (
                                  <div className="lc-mono" style={{ fontSize: 11, color: '#8A8780', textTransform:'uppercase', letterSpacing:'0.06em' }}>📤 Click to upload labels</div>
                                )}
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ITEMS */}
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(8,9,11,0.08)' }}>
                      <div className="lc-mono" style={{ fontSize: 9.5, fontWeight: 700, color: '#8A8780', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '1rem' }}>Items · {selected.order_items?.length} products · {totalUnits} units</div>
                      {selected.order_items?.map((item, i) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < selected.order_items.length - 1 ? '1px solid rgba(8,9,11,0.08)' : 'none' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#08090B', marginBottom: 2 }}>{item.product_name}</div>
                            <div className="lc-mono" style={{ fontSize: 10, color: '#8A8780' }}>{item.product_sku} · {item.quantity} units × ${item.unit_price?.toLocaleString()}</div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#08090B' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                        </div>
                      ))}
                      <div style={{ marginTop: 10, padding: '10px 14px', background: '#F2EFE6', border: '1px solid rgba(8,9,11,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#5C5A55' }}>Order total</span>
                        <span className="lc-display" style={{ fontSize: 19, fontWeight: 700, color: '#08090B' }}>${selected.total?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: 8 }}>
                      <Link href="/portal/payments" className="lc-mono" style={{ flex: 1, padding: '11px', background: '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                        💳 View payments
                      </Link>
                      <Link href="/portal/invoices" className="lc-mono" style={{ flex: 1, padding: '11px', background: '#F2EFE6', color: '#5C5A55', fontSize: 10.5, fontWeight: 700, letterSpacing:'0.1em', textTransform:'uppercase', border: '1px solid rgba(8,9,11,0.14)', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
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
    </div>
  )
}
