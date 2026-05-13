'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [paymentLink, setPaymentLink] = useState('')
  const [bankDetails, setBankDetails] = useState('')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [clientEmailInput, setClientEmailInput] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      loadPayments(supabase)
    })
  }, [])

  const loadPayments = async (supabase) => {
    const { data } = await supabase
      .from('payments')
      .select('*, orders(order_number, total, submitted_at, notes)')
      .order('created_at', { ascending: false })
    setPayments(data || [])
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const methodLabels = {
    ach: 'ACH Bank Transfer', wire: 'Wire Transfer',
    melio: 'Melio Pay', zelle: 'Zelle'
  }

  const methodIcons = { ach: '🏦', wire: '⚡', melio: '💳', zelle: '💵' }

  const sendPaymentLink = async () => {
    if (selected.payment_method === 'melio' && !paymentLink) { alert('Please enter the Melio payment link'); return }
    if (['ach','wire','zelle'].includes(selected.payment_method) && !bankDetails) { alert('Please enter the payment details'); return }
    setSending(true)
    try {
      const supabase = createClient()
      if (!clientEmailInput) { alert('Please enter the client email'); setSending(false); return }

      const res = await fetch('/api/send-payment-link-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: clientEmailInput,
          orderNumber: selected.orders?.order_number,
          total: selected.amount,
          paymentMethod: selected.payment_method,
          paymentLink: paymentLink || null,
          bankDetails: bankDetails || null,
          notes: notes || null,
        })
      })
      const result = await res.json()
      if (result.success) {
        // Update payment status
        await supabase.from('payments').update({ status: 'processing' }).eq('id', selected.id)
        setSent(true)
        setPaymentLink('')
        setBankDetails('')
        setNotes('')
        await loadPayments(supabase)
        setTimeout(() => setSent(false), 3000)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (e) { alert('Error: ' + e.message) }
    setSending(false)
  }

  const statusConfig = {
    pending: { label: 'Pending', color: '#854f0b', bg: 'rgba(186,117,23,0.1)' },
    requested: { label: 'Requested', color: '#2d7dd2', bg: 'rgba(45,125,210,0.1)' },
    processing: { label: 'Link sent', color: '#2a7d4f', bg: 'rgba(42,125,79,0.1)' },
    paid: { label: 'Paid', color: '#2a7d4f', bg: 'rgba(42,125,79,0.15)' },
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Payments' ? '#2d7dd2' : '#555', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Payments' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: '1.5rem' }}>

        {/* LEFT */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Payment requests</h2>
            <p style={{ fontSize: 12, color: '#444' }}>{payments.filter(p => p.status === 'requested').length} pending · {payments.length} total</p>
          </div>

          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            {payments.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#444', fontSize: 13 }}>No payment requests yet</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0d0d0d' }}>
                    {['Order', 'Client email', 'Method', 'Amount', 'Status', 'Date', ''].map(h => (
                      <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => {
                    const s = statusConfig[payment.status] || statusConfig.pending
                    const clientEmail = payment.notes?.match(/Email: ([^\s|]+)/)?.[1] || '—'
                    return (
                      <tr key={payment.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)', background: selected?.id === payment.id ? 'rgba(45,125,210,0.05)' : 'transparent', cursor: 'pointer' }}
                        onClick={() => { setSelected(payment); setSent(false); setPaymentLink(''); setBankDetails(''); setNotes(''); setClientEmailInput(payment.orders?.notes?.match(/Email: ([^\s|,]+)/)?.[1] || '') }}>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 600, color: '#ccc' }}>#{payment.orders?.order_number}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{clientEmail}</td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          <span style={{ fontSize: 11, color: '#ccc' }}>{methodIcons[payment.payment_method]} {methodLabels[payment.payment_method]}</span>
                        </td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 600, color: '#fff' }}>${payment.amount?.toLocaleString()}</td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: s.bg, color: s.color }}>{s.label}</span>
                        </td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#444' }}>{new Date(payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          {payment.status === 'requested' && (
                            <button onClick={(e) => { e.stopPropagation(); setSelected(payment); setSent(false); setPaymentLink(''); setBankDetails(''); setNotes(''); setClientEmailInput(payment.orders?.notes?.match(/Email: ([^\s|,]+)/)?.[1] || '') }}
                              style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(45,125,210,0.15)', color: '#2d7dd2', border: '0.5px solid rgba(45,125,210,0.3)', borderRadius: 2, cursor: 'pointer' }}>
                              Send →
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT — send payment panel */}
        {selected && (
          <div style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>

              <div style={{ background: '#0d0d0d', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>Send payment instructions</div>
                  <div style={{ fontSize: 11, color: '#444', marginTop: 3 }}>Order #{selected.orders?.order_number} · ${selected.amount?.toLocaleString()}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>

              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ padding: '10px 14px', background: 'rgba(45,125,210,0.08)', border: '0.5px solid rgba(45,125,210,0.2)', borderRadius: 2, marginBottom: '1rem' }}>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 3 }}>Payment method requested</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2d7dd2' }}>{methodIcons[selected.payment_method]} {methodLabels[selected.payment_method]}</div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Client email *</label>
                  <input type="email" value={clientEmailInput} onChange={e => setClientEmailInput(e.target.value)}
                    placeholder="client@business.com"
                    style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 12, padding: '10px 12px', borderRadius: 2, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>

                {selected.payment_method === 'melio' ? (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Melio payment link *</label>
                    <input type="url" value={paymentLink} onChange={e => setPaymentLink(e.target.value)}
                      placeholder="https://app.meliopayments.com/..."
                      style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 12, padding: '10px 12px', borderRadius: 2, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>Generate this link in your Melio account first.</div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                      {selected.payment_method === 'ach' || selected.payment_method === 'wire' ? 'Banking details *' : 'Zelle info *'}
                    </label>
                    <textarea value={bankDetails} onChange={e => setBankDetails(e.target.value)}
                      rows={selected.payment_method === 'zelle' ? 2 : 5}
                      placeholder={selected.payment_method === 'zelle'
                        ? 'Zelle email or phone: partners@levamcorp.com'
                        : 'Bank name: ...\nRouting number: ...\nAccount number: ...\nAccount name: Levam Corp Distributors'}
                      style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 12, padding: '10px 12px', borderRadius: 2, outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Additional notes (optional)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    placeholder="Any additional instructions for the client..."
                    style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 12, padding: '10px 12px', borderRadius: 2, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }} />
                </div>

                {sent ? (
                  <div style={{ padding: '12px', background: 'rgba(42,125,79,0.12)', border: '0.5px solid rgba(42,125,79,0.3)', borderRadius: 2, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#2a7d4f' }}>
                    ✓ Payment instructions sent!
                  </div>
                ) : (
                  <button onClick={sendPaymentLink} disabled={sending} style={{ width: '100%', padding: 11, background: sending ? '#333' : '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: sending ? 'not-allowed' : 'pointer', borderRadius: 2 }}>
                    {sending ? 'Sending...' : '📧 Send payment instructions'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
