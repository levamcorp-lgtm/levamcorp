'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function InvoicesPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const [payments, setPayments] = useState({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)
      const [{ data: ordersData }, { data: paymentsData }] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').eq('user_id', data.user.id).order('submitted_at', { ascending: false }),
        supabase.from('payments').select('*').eq('user_id', data.user.id),
      ])
      setOrders(ordersData || [])
      const pMap = {}
      ;(paymentsData || []).forEach(p => { pMap[p.order_id] = p })
      setPayments(pMap)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
  }

  const handlePrint = () => {
    if (!selected) return
    const printContent = document.getElementById('invoice-print-area')
    if (!printContent) return
    const win = window.open('', '_blank', 'width=800,height=900')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${selected.invNum} - Levam Corp</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 600)
  }

  const fmtDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const dueDate = (date) => { const d = new Date(date); d.setDate(d.getDate() + 15); return fmtDate(d) }

  const getInvNum = (order, idx) => {
    const d = new Date(order.submitted_at)
    const year = d.getFullYear()
    const seq = String(idx + 1001).padStart(5, '0')
    return `LC-${year}-${seq}`
  }

  const totalInvoiced = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalPaid = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0)
  const totalPending = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0)

  const statusConfig = {
    new: { label: 'Pending', color: '#2d7dd2', bg: 'rgba(45,125,210,0.1)' },
    review: { label: 'In review', color: '#854f0b', bg: 'rgba(186,117,23,0.1)' },
    confirmed: { label: 'Confirmed', color: '#534ab7', bg: 'rgba(83,74,183,0.1)' },
    dispatched: { label: 'Dispatched', color: '#2a7d4f', bg: 'rgba(42,125,79,0.1)' },
    completed: { label: 'Paid', color: '#2a7d4f', bg: 'rgba(42,125,79,0.12)' },
    cancelled: { label: 'Cancelled', color: '#c0392b', bg: 'rgba(231,76,60,0.1)' },
  }

  const steps = ['Submitted', 'Confirmed', 'Dispatched', 'Completed']
  const getStep = (status) => {
    if (status === 'new' || status === 'review') return 0
    if (status === 'confirmed') return 1
    if (status === 'dispatched') return 2
    if (status === 'completed') return 3
    return 0
  }

  const getPaymentStatus = (order) => {
    if (!order) return 'unpaid'
    if (order.status === 'completed') return 'paid'
    const payment = payments[order.id]
    if (payment?.payment_proof_url) return 'proof_submitted'
    return 'unpaid'
  }
  const isPaid = selected?.status === 'completed'
  const paymentStatus = getPaymentStatus(selected)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', left: 10, top: 0, width: 3, height: 38, background: '#333' }} />
          <div style={{ position: 'absolute', left: 10, bottom: 0, width: 26, height: 3, background: '#333' }} />
          <div style={{ position: 'absolute', left: 16, bottom: 10, width: 16, height: 3, background: '#2d7dd2' }} />
        </div>
        <div style={{ fontSize: 12, color: '#444', letterSpacing: '0.1em' }}>Loading invoices...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
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
              <Link key={label} href={href} style={{ fontSize: 13, fontWeight: label === 'Invoices' ? 700 : 500, color: label === 'Invoices' ? '#fff' : 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 16px', borderBottom: label === 'Invoices' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* HERO */}
      <div className="no-print" style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 60%, #0d1a2e 100%)', padding: '2.5rem 2rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 8 }}>Billing history</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>Invoices</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'Total invoiced', value: `$${totalInvoiced.toLocaleString()}`, sub: `${orders.length} invoices`, color: '#2d7dd2', icon: '🧾' },
              { label: 'Amount paid', value: `$${totalPaid.toLocaleString()}`, sub: 'completed orders', color: '#2a7d4f', icon: '✅' },
              { label: 'Outstanding', value: `$${totalPending.toLocaleString()}`, sub: 'pending payment', color: totalPending > 0 ? '#e74c3c' : '#2a7d4f', icon: '⏳' },
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

      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: selected ? '340px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT — list */}
        <div className="no-print">
          <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#2d7dd2', borderRadius: 2, display: 'inline-block' }} />
            Invoice history
          </div>
          {orders.length === 0 ? (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: '1rem' }}>🧾</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>No invoices yet</h3>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: '1.5rem' }}>Place an order to generate your first invoice.</p>
              <Link href="/portal/catalog" style={{ padding: '10px 24px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {orders.map((order, idx) => {
                const invNum = getInvNum(order, idx)
                const isSelected = selected?.id === order.id
                const s = statusConfig[order.status] || statusConfig.new
                const paid = order.status === 'completed'
                return (
                  <div key={order.id} onClick={() => setSelected(isSelected ? null : { ...order, invNum })} style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)', cursor: 'pointer', background: isSelected ? 'rgba(45,125,210,0.04)' : '#fff', borderLeft: isSelected ? '3px solid #2d7dd2' : '3px solid transparent', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#2d7dd2' }}>{invNum}</div>
                          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: paid ? 'rgba(42,125,79,0.1)' : 'rgba(231,76,60,0.08)', color: paid ? '#2a7d4f' : '#c0392b', fontWeight: 700, letterSpacing: '0.06em' }}>
                            {paid ? 'PAID' : payments[order.id]?.payment_proof_url ? 'SUBMITTED' : 'UNPAID'}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#aaa' }}>{fmtDate(order.submitted_at)} · {order.order_items?.length || 0} items</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>${order.total?.toLocaleString()}</div>
                        <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — invoice */}
        {selected && (
          <div style={{ position: 'sticky', top: 80 }}>
            <div id="invoice-print-area" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 32px rgba(0,0,0,0.12)', position: 'relative' }}>

              {/* WATERMARK */}
              <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%) rotate(-35deg)', fontSize: 88, fontWeight: 900, color: isPaid ? 'rgba(42,125,79,0.07)' : 'rgba(220,60,60,0.07)', letterSpacing: '0.1em', pointerEvents: 'none', zIndex: 10, userSelect: 'none', whiteSpace: 'nowrap' }}>
                {paymentStatus === 'paid' ? 'PAID' : paymentStatus === 'proof_submitted' ? 'SUBMITTED' : 'UNPAID'}
              </div>

              {/* DARK HEADER */}
              <div style={{ background: '#0d0d0d', padding: '1.75rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ position: 'relative', width: 32, height: 32 }}>
                        <div style={{ position: 'absolute', left: 7, top: 0, width: 2.5, height: 25, background: '#333' }} />
                        <div style={{ position: 'absolute', left: 7, bottom: 0, width: 18, height: 2.5, background: '#333' }} />
                        <div style={{ position: 'absolute', left: 12, bottom: 7, width: 11, height: 2.5, background: '#2d7dd2' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.2em', color: '#ddd', textTransform: 'uppercase' }}>Levam</div>
                        <div style={{ fontSize: 7, letterSpacing: '0.35em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Corp · Distributors</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: '#555', lineHeight: 1.9 }}>6315 NW 99th Ave, Doral, FL 33178<br />partners@levamcorp.com · levamcorp.com</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '0.12em', marginBottom: 4 }}>INVOICE</div>
                    <div style={{ fontSize: 13, color: '#2d7dd2', fontWeight: 700, marginBottom: 8 }}>{selected.invNum}</div>
                    {/* QR CODE */}
                    <div style={{ width: 56, height: 56, background: '#fff', borderRadius: 4, marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="2" width="16" height="16" fill="none" stroke="#111" strokeWidth="2"/>
                        <rect x="6" y="6" width="8" height="8" fill="#111"/>
                        <rect x="30" y="2" width="16" height="16" fill="none" stroke="#111" strokeWidth="2"/>
                        <rect x="34" y="6" width="8" height="8" fill="#111"/>
                        <rect x="2" y="30" width="16" height="16" fill="none" stroke="#111" strokeWidth="2"/>
                        <rect x="6" y="34" width="8" height="8" fill="#111"/>
                        <rect x="22" y="2" width="4" height="4" fill="#111"/>
                        <rect x="22" y="8" width="4" height="4" fill="#111"/>
                        <rect x="22" y="14" width="4" height="4" fill="#111"/>
                        <rect x="2" y="22" width="4" height="4" fill="#111"/>
                        <rect x="8" y="22" width="4" height="4" fill="#111"/>
                        <rect x="14" y="22" width="4" height="4" fill="#111"/>
                        <rect x="22" y="22" width="4" height="4" fill="#2d7dd2"/>
                        <rect x="28" y="22" width="4" height="4" fill="#111"/>
                        <rect x="34" y="22" width="4" height="4" fill="#111"/>
                        <rect x="40" y="22" width="4" height="4" fill="#111"/>
                        <rect x="28" y="28" width="4" height="4" fill="#111"/>
                        <rect x="34" y="34" width="4" height="4" fill="#111"/>
                        <rect x="40" y="28" width="4" height="4" fill="#111"/>
                        <rect x="22" y="34" width="4" height="4" fill="#111"/>
                        <rect x="22" y="40" width="4" height="4" fill="#111"/>
                        <rect x="28" y="40" width="4" height="4" fill="#2d7dd2"/>
                        <rect x="40" y="40" width="4" height="4" fill="#111"/>
                        <rect x="34" y="28" width="4" height="4" fill="#111"/>
                      </svg>
                    </div>
                    <div style={{ fontSize: 8, color: '#444', marginTop: 3 }}>levamcorp.com/portal</div>
                  </div>
                </div>
              </div>

              {/* DATE BAR */}
              <div style={{ background: '#111', padding: '0.6rem 2rem', display: 'flex', justifyContent: 'space-between' }}>
                {[['Date', fmtDate(selected.submitted_at)], ['Due', dueDate(selected.submitted_at)], ['Terms', 'Net 15'], ['Order #', `#${selected.order_number}`]].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 8, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 10, color: '#ccc', fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* PAYMENT STATUS ALERT */}
              {!isPaid && (
                <div style={{ background: 'rgba(231,76,60,0.06)', borderBottom: '1px solid rgba(231,76,60,0.15)', padding: '10px 2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#c0392b' }}>Payment pending — </span>
                    <span style={{ fontSize: 12, color: '#888' }}>This invoice is not yet final. Payment must be received and confirmed by Levam Corp before the order is processed.</span>
                  </div>
                </div>
              )}

              {/* PAID BANNER */}
              {isPaid && (
                <div style={{ background: 'rgba(42,125,79,0.08)', borderBottom: '1px solid rgba(42,125,79,0.15)', padding: '10px 2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2a7d4f' }}>Payment received — Thank you! This invoice is final and confirmed.</span>
                </div>
              )}

              {/* PROGRESS BAR */}
              <div style={{ padding: '1rem 2rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 12, left: '8%', right: '8%', height: 2, background: '#e0e0e0', zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: 12, left: '8%', height: 2, background: '#2d7dd2', zIndex: 1, width: `${(getStep(selected.status) / 3) * 84}%` }} />
                  {steps.map((step, i) => {
                    const done = i <= getStep(selected.status)
                    const active = i === getStep(selected.status)
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? '#2d7dd2' : '#e0e0e0', border: active ? '3px solid #2d7dd2' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: active ? '0 0 0 3px rgba(45,125,210,0.2)' : 'none' }}>
                          {done ? <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</span> : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ccc', display: 'block' }} />}
                        </div>
                        <div style={{ fontSize: 8, color: done ? '#2d7dd2' : '#bbb', fontWeight: done ? 600 : 400, marginTop: 5, whiteSpace: 'nowrap' }}>{step}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* PARTIES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: 6 }}>From</div>
                  <p style={{ fontSize: 11, color: '#555', lineHeight: 1.9, margin: 0 }}>
                    <strong style={{ color: '#222', fontSize: 12 }}>Levam Corp Distributors</strong><br />
                    6315 NW 99th Ave<br />Doral, FL 33178
                  </p>
                </div>
                <div style={{ padding: '1rem 1.5rem', borderLeft: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: 6 }}>Bill to</div>
                  <p style={{ fontSize: 11, color: '#555', lineHeight: 1.9, margin: 0 }}>
                    <strong style={{ color: '#222', fontSize: 12 }}>Approved Partner</strong><br />
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* ITEMS */}
              <div style={{ padding: '0 1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
                  <thead>
                    <tr style={{ background: '#111' }}>
                      {['#','Product','SKU','Qty','Price','Total'].map((h,i) => (
                        <th key={h} style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666', padding: '8px', textAlign: i > 2 ? 'right' : 'left', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.order_items?.map((item, i) => (
                      <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '10px 8px', fontSize: 11, color: '#bbb' }}>{i+1}</td>
                        <td style={{ padding: '10px 8px', fontSize: 12, fontWeight: 600, color: '#333' }}>{item.product_name}</td>
                        <td style={{ padding: '10px 8px', fontSize: 9, color: '#bbb', fontFamily: 'monospace' }}>{item.product_sku}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right', color: '#555' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right', color: '#555' }}>${item.unit_price?.toLocaleString()}</td>
                        <td style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: '#111', textAlign: 'right' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TOTAL BOX */}
              <div style={{ margin: '0 1.5rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '3px 0' }}><span>Subtotal</span><span>${selected.subtotal?.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '3px 0' }}><span>Shipping</span><span>TBD</span></div>
                <div style={{ background: isPaid ? 'linear-gradient(135deg, #2a7d4f, #1a5f3a)' : 'linear-gradient(135deg, #2d7dd2, #1a5fa8)', borderRadius: 4, padding: '1rem 1.25rem', marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 3 }}>{isPaid ? 'Amount paid' : 'Total due'}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>${selected.total?.toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: 28, opacity: 0.4 }}>{isPaid ? '✅' : '💰'}</div>
                </div>
                {parseFloat(selected?.amount_paid) > 0 && !isPaid && (
                  <div style={{ marginTop: 10, padding: '12px 14px', background: 'rgba(42,125,79,0.06)', border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: '#2a7d4f', fontWeight: 600 }}>✓ Amount paid</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2a7d4f' }}>${parseFloat(selected.amount_paid).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#e74c3c', fontWeight: 600 }}>Balance due</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#e74c3c' }}>${Math.max(0, selected.total - parseFloat(selected.amount_paid)).toLocaleString()}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (parseFloat(selected.amount_paid) / selected.total) * 100)}%`, background: '#2a7d4f', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'right', marginTop: 3 }}>
                      {Math.min(100, Math.round((parseFloat(selected.amount_paid) / selected.total) * 100))}% paid
                    </div>
                  </div>
                )}
              </div>

              {/* DISCLAIMER */}
              {!isPaid && (
                <div style={{ margin: '0 1.5rem 1rem', padding: '10px 14px', background: 'rgba(231,76,60,0.05)', border: '0.5px solid rgba(231,76,60,0.15)', borderRadius: 3 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#c0392b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>⚠ Preliminary Invoice — Not Final</div>
                  <div style={{ fontSize: 10, color: '#888', lineHeight: 1.7 }}>
                    This document is a preliminary invoice and quote. It does not constitute a final confirmed order. Levam Corp Distributors reserves the right to adjust pricing, availability, and terms. The order will only be confirmed and processed upon receipt and verification of full payment.
                  </div>
                </div>
              )}

              {/* TERMS */}
              <div style={{ margin: '0 1.5rem 1.25rem', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ background: '#111', padding: '6px 12px', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555' }}>Terms & Conditions</div>
                <div style={{ background: '#fafafa', padding: '10px 12px', fontSize: 9.5, color: '#888', lineHeight: 1.75 }}>
                  <strong style={{ color: '#555', fontSize: 9, textTransform: 'uppercase' }}>All Sales Are Final — </strong>
                  No returns, exchanges, refunds, or cancellations once payment is confirmed. Damaged goods must be reported within 48 hours to partners@levamcorp.com. Governed by the laws of the State of Florida, Miami-Dade County courts.
                </div>
              </div>

              {/* SIGNATURES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(0,0,0,0.06)', margin: '0 1.5rem 1.25rem' }}>
                <div style={{ background: '#fff', padding: '1rem' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 20 }}>Authorized · Levam Corp</div>
                  <div style={{ borderTop: '0.5px solid #ddd', paddingTop: 5, fontSize: 9, color: '#ccc' }}>Signature & date</div>
                </div>
                <div style={{ background: '#fff', padding: '1rem' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 20 }}>Accepted · Client</div>
                  <div style={{ borderTop: '0.5px solid #ddd', paddingTop: 5, fontSize: 9, color: '#ccc' }}>Signature & date</div>
                </div>
              </div>

              {/* FOOTER */}
              <div style={{ background: '#0d0d0d', padding: '0.75rem 1.5rem', fontSize: 9, color: '#444', textAlign: 'center' }}>
                Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com · levamcorp.com
              </div>

              {/* ACTIONS */}
              <div className="no-print" style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8 }}>
                <button onClick={handlePrint} style={{ flex: 1, padding: 11, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3, boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
                  🖨 Print / Save PDF
                </button>
                {!isPaid && (
                  <Link href="/portal/payments" style={{ padding: '11px 16px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 3, textDecoration: 'none', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                    💳 Pay now
                  </Link>
                )}
                <button onClick={() => setSelected(null)} style={{ padding: '11px 16px', background: '#fff', color: '#aaa', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 3 }}>✕</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
