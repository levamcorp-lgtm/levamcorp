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
        notes: `Payment request for order #${selected.order_number}`
      }])
      setSubmitted(true)
      setSelected(null)
      setPaymentMethod('')
    } catch (e) {
      alert('Error submitting request. Please try again.')
    }
    setSubmitting(false)
  }

  const pendingOrders = orders.filter(o => !['completed'].includes(o.status))
  const totalOwed = pendingOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalPaid = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0)

  const statusColor = {
    new: '#2d7dd2', review: '#854f0b', confirmed: '#2a7d4f',
    dispatched: '#2a7d4f', completed: '#2a7d4f', cancelled: '#c0392b'
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>Loading payments...</div>

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>

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

      <div style={{ padding: '2rem' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 }}>Payments</h2>
          <p style={{ fontSize: 12, color: '#aaa' }}>Manage your outstanding balances and payment requests</p>
        </div>

        {/* SUCCESS MESSAGE */}
        {submitted && (
          <div style={{ background: 'rgba(42,125,79,0.08)', border: '0.5px solid rgba(42,125,79,0.25)', borderRadius: 4, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#2a7d4f' }}>Payment request submitted!</div>
              <div style={{ fontSize: 12, color: '#666' }}>Our team will send you a payment link within 1 business day.</div>
            </div>
          </div>
        )}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.5rem' }}>
          {[
            { label: 'Outstanding balance', value: `$${totalOwed.toLocaleString()}`, color: totalOwed > 0 ? '#c0392b' : '#2a7d4f', note: `${pendingOrders.length} pending orders` },
            { label: 'Total paid', value: `$${totalPaid.toLocaleString()}`, color: '#2a7d4f', note: 'completed orders' },
            { label: 'Total orders', value: orders.length, color: '#2d7dd2', note: 'all time' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '1.5rem' }}>
              <div style={{ fontSize: 9, color: '#bbb', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#111', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 500 }}>{s.note}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: '1.5rem' }}>

          {/* ORDERS TABLE */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Outstanding orders</div>
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: '1.5rem' }}>
              {pendingOrders.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#ccc' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✅</div>
                  <div style={{ fontSize: 13, color: '#aaa' }}>No outstanding balances</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f7f8fa' }}>
                      {['Order #', 'Date', 'Items', 'Amount', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(order => (
                      <tr key={order.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)', background: selected?.id === order.id ? 'rgba(45,125,210,0.03)' : '#fff' }}>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 600, color: '#111' }}>#{order.order_number}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#888' }}>{new Date(order.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#888' }}>{order.order_items?.length || 0} items</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 14, fontWeight: 700, color: '#111' }}>${order.total?.toLocaleString()}</td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: `${statusColor[order.status]}15`, color: statusColor[order.status] }}>{order.status}</span>
                        </td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          <button onClick={() => { setSelected(order); setSubmitted(false) }} style={{ fontSize: 11, fontWeight: 600, padding: '6px 14px', background: '#2d7dd2', color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer' }}>
                            Pay now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* PAYMENT METHODS INFO */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Accepted payment methods</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {[
                { icon: '🏦', title: 'ACH Bank Transfer', desc: 'Direct bank transfer. Free, 1–3 business days.', tag: 'Recommended' },
                { icon: '⚡', title: 'Wire Transfer', desc: 'Same-day domestic wire. Bank fees may apply.', tag: 'Fast' },
                { icon: '💳', title: 'Melio Pay', desc: 'Pay by card or bank via Melio link. We send the link.', tag: 'Easy' },
                { icon: '💵', title: 'Zelle', desc: 'Instant transfer to our registered Zelle account.', tag: 'Instant' },
              ].map(m => (
                <div key={m.title} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{m.title}</div>
                      <span style={{ fontSize: 9, background: 'rgba(45,125,210,0.1)', color: '#2d7dd2', padding: '2px 6px', borderRadius: 2, fontWeight: 600, letterSpacing: '0.06em' }}>{m.tag}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT REQUEST PANEL */}
          {selected && (
            <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
              <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ background: '#111', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Pay order #{selected.order_number}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{new Date(selected.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>

                {/* Order items */}
                <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  {selected.order_items?.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid rgba(0,0,0,0.05)', fontSize: 12 }}>
                      <div><div style={{ fontWeight: 500, color: '#333' }}>{item.product_name}</div><div style={{ color: '#bbb', fontSize: 10 }}>Qty: {item.quantity}</div></div>
                      <div style={{ fontWeight: 600, color: '#111' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontSize: 16, fontWeight: 700, color: '#111' }}>
                    <span>Total due</span>
                    <span style={{ color: '#2d7dd2' }}>${selected.total?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment method selection */}
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How would you like to pay?</div>
                  {[
                    { value: 'ach', label: 'ACH Bank Transfer', icon: '🏦', desc: '1–3 business days · Free' },
                    { value: 'wire', label: 'Wire Transfer', icon: '⚡', desc: 'Same day · Bank fees may apply' },
                    { value: 'melio', label: 'Melio Pay', icon: '💳', desc: 'Card or bank · We send you a link' },
                    { value: 'zelle', label: 'Zelle', icon: '💵', desc: 'Instant · Free' },
                  ].map(method => (
                    <div key={method.value} onClick={() => setPaymentMethod(method.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 3, border: `1.5px solid ${paymentMethod === method.value ? '#2d7dd2' : 'rgba(0,0,0,0.1)'}`, background: paymentMethod === method.value ? 'rgba(45,125,210,0.05)' : '#fff', cursor: 'pointer' }}>
                      <span style={{ fontSize: 20 }}>{method.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{method.label}</div>
                        <div style={{ fontSize: 11, color: '#aaa' }}>{method.desc}</div>
                      </div>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${paymentMethod === method.value ? '#2d7dd2' : '#ddd'}`, background: paymentMethod === method.value ? '#2d7dd2' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {paymentMethod === method.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info box */}
                <div style={{ padding: '1rem 1.5rem', background: 'rgba(45,125,210,0.04)', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                    {paymentMethod === 'melio' ? '💳 After submitting, we\'ll send you a Melio payment link to your email within 1 business day.' :
                     paymentMethod === 'ach' || paymentMethod === 'wire' ? '🏦 After submitting, we\'ll send you our banking details via email within 1 business day.' :
                     paymentMethod === 'zelle' ? '💵 After submitting, we\'ll send you our Zelle info via email within 1 business day.' :
                     '👆 Select a payment method above to continue.'}
                  </div>
                </div>

                <div style={{ padding: '1rem 1.5rem' }}>
                  <button onClick={submitPaymentRequest} disabled={submitting || !paymentMethod} style={{ width: '100%', padding: 13, background: !paymentMethod ? '#e0e0e0' : submitting ? '#aaa' : '#2d7dd2', color: !paymentMethod ? '#aaa' : '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: !paymentMethod ? 'not-allowed' : 'pointer', borderRadius: 3 }}>
                    {submitting ? 'Submitting...' : `Request payment — $${selected.total?.toLocaleString()}`}
                  </button>
                  <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 8 }}>We'll follow up with payment instructions within 1 business day</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
