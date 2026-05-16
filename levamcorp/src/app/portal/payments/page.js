'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

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
        supabase.from('payments').select('*, orders(order_number, total, submitted_at, order_items(*))').eq('user_id', data.user.id).order('created_at', { ascending: false }),
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
      const { data, error } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type, upsert: true })
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
    requested: { label: 'Awaiting payment', color: '#854f0b', bg: 'rgba(186,117,23,0.1)' },
    processing: { label: 'Proof submitted', color: '#2d7dd2', bg: 'rgba(45,125,210,0.1)' },
    paid: { label: 'Paid', color: '#2a7d4f', bg: 'rgba(42,125,79,0.12)' },
  }

  const totalOwed = payments.filter(p => p.status === 'requested').reduce((s, p) => s + (p.amount || 0), 0)
  const totalPaid = orders.reduce((s, o) => s + (o.total || 0), 0)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', left: 10, top: 0, width: 3, height: 38, background: '#333' }} />
          <div style={{ position: 'absolute', left: 10, bottom: 0, width: 26, height: 3, background: '#333' }} />
          <div style={{ position: 'absolute', left: 16, bottom: 10, width: 16, height: 3, background: '#2d7dd2' }} />
        </div>
        <div style={{ fontSize: 12, color: '#444', letterSpacing: '0.1em' }}>Loading payments...</div>
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
              <Link key={label} href={href} style={{ fontSize: 13, fontWeight: label === 'Payments' ? 700 : 500, color: label === 'Payments' ? '#fff' : 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 16px', borderBottom: label === 'Payments' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 60%, #0d1a2e 100%)', padding: '2.5rem 2rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 8 }}>Account balance</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Payments & Billing</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Outstanding balance', value: `$${totalOwed.toLocaleString()}`, sub: `${payments.filter(p=>p.status==='requested').length} pending`, color: totalOwed > 0 ? '#e74c3c' : '#2a7d4f', icon: '⚡' },
              { label: 'Proof submitted', value: payments.filter(p=>p.status==='processing').length, sub: 'awaiting confirmation', color: '#2d7dd2', icon: '📤' },
              { label: 'Total paid', value: `$${totalPaid.toLocaleString()}`, sub: 'completed orders', color: '#2a7d4f', icon: '✅' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.sub}</div>
                  </div>
                  <div style={{ fontSize: 24, opacity: 0.4 }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>

        {payments.length === 0 ? (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>💳</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 6 }}>No payments yet</div>
            <div style={{ fontSize: 12, color: '#aaa', marginBottom: '1.5rem' }}>Place an order from the catalog to get started</div>
            <Link href="/portal/catalog" style={{ padding: '10px 24px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {payments.map(payment => {
              const s = statusConfig[payment.status] || statusConfig.requested
              const isUploaded = uploaded[payment.id] || payment.payment_proof_url
              return (
                <div key={payment.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>

                  {/* Header */}
                  <div style={{ background: 'linear-gradient(135deg, #0d0d0d, #1a1a2e)', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>Order #{payment.orders?.order_number}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{fmtDate(payment.created_at)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#2d7dd2' }}>${payment.amount?.toLocaleString()}</div>
                      <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 700 }}>{s.label}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>

                    {/* Order details */}
                    <div style={{ padding: '1.25rem 1.5rem', borderRight: '0.5px solid rgba(0,0,0,0.08)' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Order details</div>
                      {payment.orders?.order_items?.map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)' }}>
                          <span style={{ color: '#555' }}>{item.product_name} ×{item.quantity}</span>
                          <span style={{ fontWeight: 600, color: '#111' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', borderRadius: 10, fontWeight: 600 }}>{methodIcons[payment.payment_method]} {methodLabels[payment.payment_method]}</span>
                        <span style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(0,0,0,0.04)', color: '#888', borderRadius: 10, fontWeight: 600 }}>{shippingLabels[payment.shipping_method] || payment.shipping_method}</span>
                      </div>
                    </div>

                    {/* Payment proof upload */}
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Payment confirmation</div>

                      {isUploaded ? (
                        <div style={{ background: 'rgba(42,125,79,0.06)', border: '1px solid rgba(42,125,79,0.2)', borderRadius: 6, padding: '1.25rem', textAlign: 'center' }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#2a7d4f', marginBottom: 4 }}>Proof submitted!</div>
                          <div style={{ fontSize: 11, color: '#888' }}>Our team will verify and confirm your payment shortly.</div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: 12, color: '#888', lineHeight: 1.7, marginBottom: '1rem' }}>
                            Upload your payment confirmation — screenshot, receipt, or bank transfer confirmation (image or PDF).
                          </p>
                          <label style={{
                            display: 'block', border: '2px dashed #e5e7eb', borderRadius: 6, padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
                            background: uploading[payment.id] ? 'rgba(45,125,210,0.04)' : '#fafafa'
                          }}>
                            <input type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                              onChange={e => e.target.files[0] && uploadProof(payment.id, e.target.files[0])} />
                            {uploading[payment.id] ? (
                              <div>
                                <div style={{ fontSize: 24, marginBottom: 6 }}>⏳</div>
                                <div style={{ fontSize: 12, color: '#2d7dd2', fontWeight: 600 }}>Uploading...</div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>📤</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Upload payment proof</div>
                                <div style={{ fontSize: 11, color: '#bbb' }}>Image or PDF · Click or drag & drop</div>
                              </div>
                            )}
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
