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

export default function PaymentsPage() {
  const [user, setUser] = useState(null)
  const [payments, setPayments] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState({})
  const [uploaded, setUploaded] = useState({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)
      const [{ data: paymentsData }, { data: ordersData }] = await Promise.all([
        supabase.from('payments').select('*, orders(order_number, total, submitted_at, amount_paid, payment_notes, order_items(*))').eq('user_id', data.user.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('user_id', data.user.id).eq('status', 'completed'),
      ])
      setPayments(paymentsData || [])
      setOrders(ordersData || [])
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
  }

  const uploadProof = async (paymentId, file) => {
    if (!file) return
    setUploading(prev => ({ ...prev, [paymentId]: true }))
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `proof/${paymentId}-${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from('Documents').upload(path, file, { contentType: file.type, upsert: true })
      if (error) throw error
      await supabase.from('payments').update({ payment_proof_url: path, status: 'processing' }).eq('id', paymentId)
      setUploaded(prev => ({ ...prev, [paymentId]: true }))
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, payment_proof_url: path, status: 'processing' } : p))
    } catch (e) { alert('Upload failed. Please try again.') }
    setUploading(prev => ({ ...prev, [paymentId]: false }))
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const methodLabels = { credit_card: 'Credit Card', debit_card: 'Debit Card', ach: 'ACH Transfer', wire: 'Wire Transfer' }
  const methodIcons = { credit_card: '💳', debit_card: '💳', ach: '🏦', wire: '⚡' }
  const shippingLabels = { pickup: '🏭 Pickup — Doral, FL', prep_center: '📦 Prep Center', shipping: '🚚 Standard Shipping', freight: '🚛 Freight / LTL' }

  const statusConfig = {
    requested: { label: 'Awaiting payment', color: '#B98A54' },
    processing: { label: 'Proof submitted', color: '#2F7DF6' },
    paid: { label: 'Paid', color: '#12B76A' },
  }

  const totalOwed = payments.filter(p => p.status === 'requested').reduce((s, p) => s + (p.amount || 0), 0)
  const totalPaid = orders.reduce((s, o) => s + (o.total || 0), 0)

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
        <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A8780' }}>Loading payments…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color:'#08090B', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>
      <style>{globalStyle}</style>

      <PortalNav onLogout={handleLogout}/>

      {/* HERO */}
      <div style={{ background: '#08090B', padding: '2rem 2rem 1.75rem' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
            <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
            Partner portal · Account balance
          </div>
          <div style={{ height:1, background:'rgba(245,241,232,0.16)' }}/>
          <h1 className="lc-display" style={{ fontSize:'clamp(26px,3.2vw,36px)', fontWeight:400, letterSpacing:'-0.03em', margin:'clamp(18px,2.6vh,26px) 0 clamp(20px,2.8vh,24px)', color:'#F5F2E9' }}>Payments &amp; billing<span style={{ color:'#2F7DF6' }}>.</span></h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background:'rgba(245,241,232,0.14)', border:'1px solid rgba(245,241,232,0.14)' }}>
            {[
              { label: 'Outstanding balance', value: `$${totalOwed.toLocaleString()}`, sub: `${payments.filter(p=>p.status==='requested').length} pending`, color: totalOwed > 0 ? '#E74C3C' : '#12B76A', icon: '⚡' },
              { label: 'Proof submitted', value: payments.filter(p=>p.status==='processing').length, sub: 'awaiting confirmation', color: '#2F7DF6', icon: '📤' },
              { label: 'Total paid', value: `$${totalPaid.toLocaleString()}`, sub: 'completed orders', color: '#12B76A', icon: '✅' },
            ].map(s => (
              <div key={s.label} style={{ background: '#08090B', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="lc-mono" style={{ fontSize: 9, color: '#8A8780', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>{s.label}</div>
                    <div className="lc-display" style={{ fontSize: 28, fontWeight: 400, color: '#F5F1E8', marginBottom: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.sub}</div>
                  </div>
                  <div style={{ fontSize: 22, opacity: 0.5 }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: 1240, margin: '0 auto' }}>

        {payments.length === 0 ? (
          <div style={{ background: '#F2EFE6', border: '1px solid rgba(8,9,11,0.1)', padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity:0.6 }}>💳</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#08090B', marginBottom: 6 }}>No payments yet</div>
            <div style={{ fontSize: 12, color: '#8A8780', marginBottom: '1.5rem' }}>Place an order from the catalog to get started</div>
            <Link href="/portal/catalog" className="lc-mono" style={{ padding: '11px 24px', background: '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {payments.map(payment => {
              const s = statusConfig[payment.status] || statusConfig.requested
              const isUploaded = uploaded[payment.id] || payment.payment_proof_url
              return (
                <div key={payment.id} style={{ background: '#FFFFFF', border: '1px solid rgba(8,9,11,0.1)' }}>

                  {/* Header */}
                  <div style={{ background: '#08090B', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#F5F1E8', marginBottom: 3 }}>Order #{payment.orders?.order_number}</div>
                      <div style={{ fontSize: 11, color: '#8A8780' }}>{fmtDate(payment.created_at)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="lc-display" style={{ fontSize: 19, fontWeight: 700, color: '#F5F1E8' }}>${payment.amount?.toLocaleString()}</div>
                      <span className="lc-mono" style={{ fontSize: 9, padding: '4px 10px', border:`1px solid ${s.color}55`, color: s.color, fontWeight: 700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{s.label}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }} className="pay-grid">
                    <style>{`@media(max-width:700px){ .pay-grid{ grid-template-columns:1fr !important; } }`}</style>

                    {/* Order details */}
                    <div style={{ padding: '1.25rem 1.5rem', borderRight: '1px solid rgba(8,9,11,0.1)' }}>
                      <div className="lc-mono" style={{ fontSize: 9.5, fontWeight: 700, color: '#5C5A55', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Order details</div>
                      {payment.orders?.order_items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid rgba(8,9,11,0.06)' }}>
                          <span style={{ color: '#5C5A55' }}>{item.product_name} ×{item.quantity}</span>
                          <span style={{ fontWeight: 600, color: '#08090B' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap:'wrap' }}>
                        <span className="lc-mono" style={{ fontSize: 9.5, padding: '4px 10px', background: 'rgba(47,125,246,0.08)', color: '#2F7DF6', fontWeight: 600 }}>{methodIcons[payment.payment_method]} {methodLabels[payment.payment_method]}</span>
                        <span className="lc-mono" style={{ fontSize: 9.5, padding: '4px 10px', background: '#F2EFE6', color: '#5C5A55', fontWeight: 600 }}>{shippingLabels[payment.shipping_method] || payment.shipping_method}</span>
                      </div>
                    </div>

                    {/* Payment proof upload */}
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      <div className="lc-mono" style={{ fontSize: 9.5, fontWeight: 700, color: '#5C5A55', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Payment confirmation</div>

                      {isUploaded ? (
                        <div style={{ background: 'rgba(18,183,106,0.06)', border: '1px solid rgba(18,183,106,0.25)', padding: '1.25rem', textAlign: 'center' }}>
                          <div style={{ fontSize: 26, marginBottom: 8 }}>✅</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0E9A5A', marginBottom: 4 }}>Proof submitted!</div>
                          <div style={{ fontSize: 11, color: '#8A8780' }}>Our team will verify and confirm your payment shortly.</div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: 12, color: '#8A8780', lineHeight: 1.7, marginBottom: '1rem' }}>
                            Upload your payment confirmation — screenshot, receipt, or bank transfer confirmation (image or PDF).
                          </p>
                          <label style={{
                            display: 'block', border: '1.5px dashed rgba(8,9,11,0.22)', padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                            background: uploading[payment.id] ? 'rgba(47,125,246,0.05)' : '#F2EFE6'
                          }}>
                            <input type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                              onChange={e => e.target.files[0] && uploadProof(payment.id, e.target.files[0])} />
                            {uploading[payment.id] ? (
                              <div>
                                <div style={{ fontSize: 22, marginBottom: 6 }}>⏳</div>
                                <div className="lc-mono" style={{ fontSize: 11, color: '#2F7DF6', fontWeight: 700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Uploading…</div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: 26, marginBottom: 8 }}>📤</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#5C5A55', marginBottom: 4 }}>Upload payment proof</div>
                                <div className="lc-mono" style={{ fontSize: 10, color: '#8A8780', textTransform:'uppercase', letterSpacing:'0.04em' }}>Image or PDF · Click or drag &amp; drop</div>
                              </div>
                            )}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Balance bar - shown when partial payment recorded */}
                  {parseFloat(payment.orders?.amount_paid) > 0 && payment.orders?.total > 0 && (
                    <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid rgba(8,9,11,0.08)', background: 'rgba(18,183,106,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, flexWrap:'wrap', gap:6 }}>
                        <span style={{ fontSize: 12, color: '#0E9A5A', fontWeight: 600 }}>✓ Paid: ${parseFloat(payment.orders.amount_paid).toLocaleString()}</span>
                        <span style={{ fontSize: 12, color: '#E74C3C', fontWeight: 700 }}>
                          Balance due: ${Math.max(0, payment.orders.total - parseFloat(payment.orders.amount_paid)).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(8,9,11,0.1)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '100%', background: '#0E9A5A', transform: `scaleX(${Math.min(100, (parseFloat(payment.orders.amount_paid) / payment.orders.total) * 100) / 100})`, transformOrigin: 'left', transition: 'transform 0.5s' }} />
                      </div>
                      <div style={{ fontSize: 10, color: '#8A8780', textAlign: 'right', marginTop: 3 }}>
                        {Math.min(100, Math.round((parseFloat(payment.orders.amount_paid) / payment.orders.total) * 100))}% of ${payment.orders.total?.toLocaleString()} paid
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
