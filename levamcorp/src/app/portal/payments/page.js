'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function PaymentsPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', data.user.id)
        .not('status', 'eq', 'cancelled')
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

  const submitPaymentRequest = async () => {
    if (!paymentMethod) { alert('Please select a payment method'); return }
    setSubmitting(true)
    try {
      const supabase = createClient()
      await supabase.from('payments').insert([{
        user_id: user.id,
        order_id: selected.id,
        amount: selected.total,
        status: 'requested',
        payment_method: paymentMethod,
        client_email: user.email,
        notes: `Payment request for order #${selected.order_number}`
      }])
      await fetch('/api/send-payment-request-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: user.email,
          orderNumber: selected.order_number,
          total: selected.total,
          paymentMethod,
          items: selected.order_items || []
        })
      })
      setSubmitted(true)
      setSelected(null)
      setPaymentMethod('')
    } catch (e) { alert('Error submitting request. Please try again.') }
    setSubmitting(false)
  }

  const pendingOrders = orders.filter(o => !['completed'].includes(o.status))
  const totalOwed = pendingOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalPaid = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0)

  const statusColor = {
    new: '#2d7dd2', review: '#854f0b', confirmed: '#2a7d4f',
    dispatched: '#2a7d4f', completed: '#2a7d4f', cancelled: '#c0392b'
  }

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

      {/* HERO HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 60%, #0d1a2e 100%)', padding: '2.5rem 2rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 8 }}>Account balance</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Payments & Billing</h1>

          {/* STATS ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Outstanding balance', value: `$${totalOwed.toLocaleString()}`, sub: `${pendingOrders.length} pending orders`, color: totalOwed > 0 ? '#e74c3c' : '#2a7d4f', icon: '⚡' },
              { label: 'Total paid', value: `$${totalPaid.toLocaleString()}`, sub: 'completed orders', color: '#2a7d4f', icon: '✅' },
              { label: 'Total orders', value: orders.length, sub: 'all time', color: '#2d7dd2', icon: '📦' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '1.25rem 1.5rem', backdropFilter: 'blur(10px)' }}>
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

        {/* SUCCESS MESSAGE */}
        {submitted && (
          <div style={{ background: 'linear-gradient(135deg, rgba(42,125,79,0.12), rgba(42,125,79,0.06))', border: '1px solid rgba(42,125,79,0.25)', borderRadius: 6, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(42,125,79,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✅</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2a7d4f', marginBottom: 2 }}>Payment request submitted!</div>
              <div style={{ fontSize: 12, color: '#666' }}>Our team will send you payment instructions within 1 business day at <strong>{user?.email}</strong>.</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem' }}>

          {/* LEFT */}
          <div>
            {/* OUTSTANDING ORDERS */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 3, height: 14, background: '#e74c3c', borderRadius: 2, display: 'inline-block' }} />
                Outstanding orders
              </div>
              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {pendingOrders.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#2a7d4f', marginBottom: 4 }}>All clear!</div>
                    <div style={{ fontSize: 12, color: '#aaa' }}>No outstanding balances</div>
                  </div>
                ) : pendingOrders.map(order => (
                  <div key={order.id} onClick={() => { setSelected(order); setSubmitted(false) }} style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)', cursor: 'pointer', background: selected?.id === order.id ? 'rgba(45,125,210,0.03)' : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s' }}>
                    <div style={{ display: 'flex', align: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, background: 'rgba(45,125,210,0.08)', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📋</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3 }}>Order #{order.order_number}</div>
                        <div style={{ fontSize: 11, color: '#aaa' }}>{new Date(order.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · {order.order_items?.length || 0} items</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>${order.total?.toLocaleString()}</div>
                        <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: `${statusColor[order.status]}15`, color: statusColor[order.status], fontWeight: 600 }}>{order.status}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setSelected(order); setSubmitted(false) }} style={{ padding: '8px 16px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', borderRadius: 3, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(45,125,210,0.3)' }}>
                        Pay now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PAYMENT METHODS */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 3, height: 14, background: '#2d7dd2', borderRadius: 2, display: 'inline-block' }} />
                Accepted payment methods
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
                {[
                  { icon: '🏦', title: 'ACH Bank Transfer', desc: 'Direct bank-to-bank transfer. Free, 1–3 business days.', tag: 'Recommended', tagColor: '#2a7d4f' },
                  { icon: '⚡', title: 'Wire Transfer', desc: 'Same-day domestic wire transfer. Bank fees may apply.', tag: 'Fast', tagColor: '#854f0b' },
                  { icon: '💳', title: 'Melio Pay', desc: 'Pay by card or bank via Melio. We send you the link.', tag: 'Easy', tagColor: '#2d7dd2' },
                  { icon: '💵', title: 'Zelle', desc: 'Instant transfer to our Zelle account. Free.', tag: 'Instant', tagColor: '#534ab7' },
                ].map(m => (
                  <div key={m.title} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 26 }}>{m.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4 }}>{m.title}</div>
                        <span style={{ fontSize: 9, background: `${m.tagColor}15`, color: m.tagColor, padding: '2px 8px', borderRadius: 10, fontWeight: 700, letterSpacing: '0.06em' }}>{m.tag}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — PAYMENT REQUEST PANEL */}
          {selected && (
            <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #0d0d0d, #1a1a2e)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 6 }}>Payment request</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Order #{selected.order_number}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{new Date(selected.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                </div>

                {/* Order items */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)', background: '#fafafa' }}>
                  {selected.order_items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#333' }}>{item.product_name}</div>
                        <div style={{ color: '#bbb', fontSize: 10 }}>Qty: {item.quantity} × ${item.unit_price?.toLocaleString()}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#111' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: 18, fontWeight: 800 }}>
                    <span style={{ color: '#111' }}>Total due</span>
                    <span style={{ color: '#2d7dd2' }}>${selected.total?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Select payment method</div>
                  {[
                    { value: 'ach', label: 'ACH Bank Transfer', icon: '🏦', desc: '1–3 business days · Free' },
                    { value: 'wire', label: 'Wire Transfer', icon: '⚡', desc: 'Same day · Bank fees may apply' },
                    { value: 'melio', label: 'Melio Pay', icon: '💳', desc: 'Card or bank · We send a payment link' },
                    { value: 'zelle', label: 'Zelle', icon: '💵', desc: 'Instant · Free' },
                  ].map(method => (
                    <div key={method.value} onClick={() => setPaymentMethod(method.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 4, border: `1.5px solid ${paymentMethod === method.value ? '#2d7dd2' : 'rgba(0,0,0,0.08)'}`, background: paymentMethod === method.value ? 'rgba(45,125,210,0.05)' : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
                      <span style={{ fontSize: 20 }}>{method.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{method.label}</div>
                        <div style={{ fontSize: 11, color: '#aaa' }}>{method.desc}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === method.value ? '#2d7dd2' : '#ddd'}`, background: paymentMethod === method.value ? '#2d7dd2' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {paymentMethod === method.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info */}
                {paymentMethod && (
                  <div style={{ padding: '1rem 1.5rem', background: 'rgba(45,125,210,0.04)', borderBottom: '0.5px solid rgba(45,125,210,0.1)' }}>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                      {paymentMethod === 'melio' ? '💳 After submitting, we\'ll send you a Melio payment link to your email within 1 business day.' :
                       paymentMethod === 'ach' || paymentMethod === 'wire' ? '🏦 After submitting, we\'ll send you our banking details via email within 1 business day.' :
                       '💵 After submitting, we\'ll send you our Zelle info via email within 1 business day.'}
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <button onClick={submitPaymentRequest} disabled={submitting || !paymentMethod} style={{ width: '100%', padding: 14, background: !paymentMethod ? '#e0e0e0' : submitting ? '#aaa' : '#2d7dd2', color: !paymentMethod ? '#aaa' : '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: !paymentMethod ? 'not-allowed' : 'pointer', borderRadius: 4, boxShadow: paymentMethod ? '0 4px 16px rgba(45,125,210,0.3)' : 'none', transition: 'all 0.2s' }}>
                    {submitting ? 'Submitting...' : `Request payment — $${selected.total?.toLocaleString()}`}
                  </button>
                  <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 8 }}>We'll follow up within 1 business day</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
