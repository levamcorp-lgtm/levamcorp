'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function InvoicesPage() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
  }

  const fmtDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const dueDate = (date) => { const d = new Date(date); d.setDate(d.getDate() + 15); return fmtDate(d) }

  const totalInvoiced = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalPaid = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0)
  const totalPending = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0)

  const statusConfig = {
    new: { label: 'Pending', color: '#2d7dd2', bg: 'rgba(45,125,210,0.1)' },
    review: { label: 'Pending', color: '#854f0b', bg: 'rgba(186,117,23,0.1)' },
    confirmed: { label: 'Pending', color: '#854f0b', bg: 'rgba(186,117,23,0.1)' },
    dispatched: { label: 'Pending', color: '#854f0b', bg: 'rgba(186,117,23,0.1)' },
    completed: { label: 'Paid', color: '#2a7d4f', bg: 'rgba(42,125,79,0.1)' },
    cancelled: { label: 'Cancelled', color: '#c0392b', bg: 'rgba(231,76,60,0.1)' },
  }

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
              <Link key={label} href={href} style={{ fontSize: 13, fontWeight: label === 'Invoices' ? 700 : 500, color: label === 'Invoices' ? '#fff' : 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 16px', borderBottom: label === 'Invoices' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* HERO HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 60%, #0d1a2e 100%)', padding: '2.5rem 2rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
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

      <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: selected ? '1fr 520px' : '1fr', gap: '1.5rem' }}>

        {/* LEFT — invoice list */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 3, height: 14, background: '#2d7dd2', borderRadius: 2, display: 'inline-block' }} />
            Invoice history
          </div>

          {orders.length === 0 ? (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '4rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 44, marginBottom: '1rem' }}>🧾</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: '0.5rem' }}>No invoices yet</h3>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: '1.5rem' }}>Your invoices will appear here after you place an order.</p>
              <Link href="/portal/catalog" style={{ padding: '10px 24px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7f8fa' }}>
                    {['Invoice #','Date','Items','Amount','Status',''].map(h => (
                      <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '12px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => {
                    const invNum = `LC-INV-${String(i + 1001).padStart(5, '0')}`
                    const isSelected = selected?.id === order.id
                    const s = statusConfig[order.status] || statusConfig.new
                    return (
                      <tr key={order.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)', background: isSelected ? 'rgba(45,125,210,0.03)' : '#fff', cursor: 'pointer', transition: 'background 0.15s' }}
                        onClick={() => setSelected(isSelected ? null : { ...order, invNum })}>
                        <td style={{ padding: '14px 1.25rem' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#2d7dd2' }}>{invNum}</div>
                          <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>#{order.order_number}</div>
                        </td>
                        <td style={{ padding: '14px 1.25rem', fontSize: 12, color: '#666' }}>{fmtDate(order.submitted_at)}</td>
                        <td style={{ padding: '14px 1.25rem', fontSize: 12, color: '#888' }}>{order.order_items?.length || 0} items</td>
                        <td style={{ padding: '14px 1.25rem', fontSize: 15, fontWeight: 700, color: '#111' }}>${order.total?.toLocaleString()}</td>
                        <td style={{ padding: '14px 1.25rem' }}>
                          <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
                        </td>
                        <td style={{ padding: '14px 1.25rem' }}>
                          <button onClick={(e) => { e.stopPropagation(); setSelected({ ...order, invNum }) }} style={{ fontSize: 11, fontWeight: 600, color: '#2d7dd2', background: 'rgba(45,125,210,0.08)', border: '0.5px solid rgba(45,125,210,0.2)', padding: '5px 14px', borderRadius: 3, cursor: 'pointer' }}>View →</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT — invoice preview */}
        {selected && (
          <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
            <div className="invoice-print" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>

              {/* Dark header */}
              <div style={{ background: '#0d0d0d', padding: '2rem' }}>
                <table width="100%" cellPadding="0" cellSpacing="0">
                  <tbody>
                    <tr>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                          <div style={{ position: 'relative', width: 36, height: 36 }}>
                            <div style={{ position: 'absolute', left: 8, top: 0, width: 2.5, height: 28, background: '#333' }} />
                            <div style={{ position: 'absolute', left: 8, bottom: 0, width: 20, height: 2.5, background: '#333' }} />
                            <div style={{ position: 'absolute', left: 13, bottom: 8, width: 12, height: 2.5, background: '#2d7dd2' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.2em', color: '#ddd', textTransform: 'uppercase' }}>Levam</div>
                            <div style={{ fontSize: 8, letterSpacing: '0.35em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Corp · Distributors</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: '#555', lineHeight: 1.8 }}>
                          6315 NW 99th Ave, Doral, FL 33178<br />
                          partners@levamcorp.com · levamcorp.com
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.12em', marginBottom: 6 }}>INVOICE</div>
                        <div style={{ fontSize: 14, color: '#2d7dd2', fontWeight: 600 }}>{selected.invNum}</div>
                        <div style={{ fontSize: 10, color: '#555', lineHeight: 2.2, marginTop: 8 }}>
                          <span style={{ color: '#666' }}>Date:</span> {fmtDate(selected.submitted_at)}<br />
                          <span style={{ color: '#666' }}>Due:</span> {dueDate(selected.submitted_at)}<br />
                          <span style={{ color: '#666' }}>Terms:</span> Net 15
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status banner */}
              <div style={{ background: selected.status === 'completed' ? 'rgba(42,125,79,0.1)' : 'rgba(45,125,210,0.08)', borderBottom: `1px solid ${selected.status === 'completed' ? 'rgba(42,125,79,0.2)' : 'rgba(45,125,210,0.15)'}`, padding: '10px 2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{selected.status === 'completed' ? '✅' : '⏳'}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: selected.status === 'completed' ? '#2a7d4f' : '#2d7dd2' }}>
                  {selected.status === 'completed' ? 'Payment received — Thank you!' : 'Payment pending · Due ' + dueDate(selected.submitted_at)}
                </span>
              </div>

              {/* Parties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>From</div>
                  <p style={{ fontSize: 11, color: '#555', lineHeight: 1.9 }}>
                    <strong style={{ color: '#222', fontSize: 12 }}>Levam Corp Distributors</strong><br />
                    6315 NW 99th Ave<br />
                    Doral, FL 33178
                  </p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', borderLeft: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>Bill to</div>
                  <p style={{ fontSize: 11, color: '#555', lineHeight: 1.9 }}>
                    <strong style={{ color: '#222', fontSize: 12 }}>Approved Partner</strong><br />
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '0 1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
                  <thead>
                    <tr style={{ background: '#f7f8fa' }}>
                      {['#','Product','SKU','Qty','Price','Total'].map((h,i) => (
                        <th key={h} style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '8px', textAlign: i > 2 ? 'right' : 'left', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.order_items?.map((item, i) => (
                      <tr key={item.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                        <td style={{ padding: '10px 8px', fontSize: 11, color: '#bbb' }}>{i+1}</td>
                        <td style={{ padding: '10px 8px', fontSize: 12, fontWeight: 600, color: '#333' }}>{item.product_name}</td>
                        <td style={{ padding: '10px 8px', fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>{item.product_sku}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right', color: '#555' }}>${item.unit_price?.toLocaleString()}</td>
                        <td style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: '#111', textAlign: 'right' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ padding: '0 1.5rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', padding: '4px 0' }}><span>Subtotal</span><span>${selected.subtotal?.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', padding: '4px 0' }}><span>Shipping</span><span>TBD</span></div>
                <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#111', padding: '4px 0' }}>
                  <span>Total</span>
                  <span style={{ color: '#2d7dd2' }}>${selected.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Legal */}
              <div style={{ margin: '0 1.5rem 1.25rem', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ background: '#111', padding: '7px 14px', fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#aaa' }}>Terms & Conditions</div>
                <div style={{ background: '#fafafa', padding: 12, fontSize: 9.5, color: '#888', lineHeight: 1.75 }}>
                  <strong style={{ color: '#555', fontSize: 9, textTransform: 'uppercase' }}>All Sales Are Final — </strong>
                  No returns, exchanges, refunds, or cancellations. Claims for damaged goods must be reported within 48 hours to partners@levamcorp.com. Governed by the laws of the State of Florida, Miami-Dade County courts.
                </div>
              </div>

              {/* Signatures */}
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

              {/* Footer */}
              <div style={{ background: '#0d0d0d', padding: '0.75rem 1.5rem', fontSize: 9, color: '#444', textAlign: 'center' }}>
                Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com · levamcorp.com
              </div>

              {/* Actions */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8 }}>
                <button onClick={() => window.print()} style={{ flex: 1, padding: 11, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3, boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
                  🖨 Print / Save PDF
                </button>
                <Link href="/portal/payments" style={{ padding: '11px 16px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(42,125,79,0.2)', cursor: 'pointer', borderRadius: 3, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  💳 Pay
                </Link>
                <button onClick={() => setSelected(null)} style={{ padding: '11px 16px', background: '#fff', color: '#aaa', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 3 }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
