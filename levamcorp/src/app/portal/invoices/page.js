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

  const today = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>Loading invoices...</div>

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="logo-icon"><div className="logo-l-vert" /><div className="logo-l-horiz" /><div className="logo-accent" /></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#222', textTransform: 'uppercase' }}>Levam</div>
              <div style={{ fontSize: 7, letterSpacing: '0.25em', color: '#2d7dd2', textTransform: 'uppercase' }}>Partner Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, borderLeft: '0.5px solid rgba(0,0,0,0.08)', paddingLeft: 16 }}>
            {[['Dashboard', '/portal/dashboard'], ['Catalog', '/portal/catalog'], ['My orders', '/portal/orders'], ['Invoices', '/portal/invoices']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Invoices' ? '#2d7dd2' : '#888', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Invoices' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#333', border: '0.5px solid rgba(0,0,0,0.12)', padding: '6px 14px', borderRadius: 2, background: '#fff', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '2rem', display: 'flex', gap: '1.5rem' }}>

        {/* LEFT — invoice list */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#111', marginBottom: 4 }}>Invoices</h2>
            <p style={{ fontSize: 12, color: '#aaa' }}>{orders.length} invoice{orders.length !== 1 ? 's' : ''} total</p>
          </div>

          {orders.length === 0 ? (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: '1rem' }}>🧾</div>
              <h3 style={{ fontSize: 16, fontWeight: 500, color: '#333', marginBottom: '0.5rem' }}>No invoices yet</h3>
              <p style={{ fontSize: 13, color: '#aaa', marginBottom: '1.5rem' }}>Your invoices will appear here after you place an order.</p>
              <Link href="/portal/catalog" style={{ padding: '10px 24px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f7f8fa' }}>
                    {['Invoice #', 'Date', 'Items', 'Amount', 'Status', ''].map(h => (
                      <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => {
                    const invNum = `LC-INV-${String(i + 1001).padStart(5, '0')}`
                    const isSelected = selected?.id === order.id
                    return (
                      <tr key={order.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)', background: isSelected ? 'rgba(45,125,210,0.03)' : '#fff', cursor: 'pointer' }} onClick={() => setSelected(isSelected ? null : { ...order, invNum })}>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 500, color: '#2d7dd2' }}>{invNum}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#888' }}>{today(order.submitted_at)}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#888' }}>{order.order_items?.length || 0} items</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 500, color: '#111' }}>${order.total?.toLocaleString()}</td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          <span style={{
                            fontSize: 10, padding: '3px 10px', borderRadius: 2,
                            background: order.status === 'completed' ? 'rgba(42,125,79,0.08)' : 'rgba(45,125,210,0.08)',
                            color: order.status === 'completed' ? '#2a7d4f' : '#2d7dd2',
                            border: `0.5px solid ${order.status === 'completed' ? 'rgba(42,125,79,0.2)' : 'rgba(45,125,210,0.2)'}`
                          }}>
                            {order.status === 'completed' ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          <button onClick={(e) => { e.stopPropagation(); setSelected({ ...order, invNum }) }} style={{ fontSize: 10, color: '#2d7dd2', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}>View →</button>
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
          <div style={{ width: 480, position: 'sticky', top: 80, height: 'fit-content' }}>
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>

              {/* Header */}
              <div style={{ background: '#111', padding: '1.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ position: 'relative', width: 28, height: 28 }}>
                      <div style={{ position: 'absolute', left: 6, top: 0, width: 2, height: 22, background: '#444' }} />
                      <div style={{ position: 'absolute', left: 6, bottom: 0, width: 16, height: 2, background: '#444' }} />
                      <div style={{ position: 'absolute', left: 10, bottom: 6, width: 10, height: 2, background: '#2d7dd2' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.2em', color: '#ddd', textTransform: 'uppercase' }}>Levam</div>
                      <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#2d7dd2', textTransform: 'uppercase' }}>Corp · Distributors</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#555', lineHeight: 1.8 }}>6315 NW 99th Ave, Doral, FL 33178<br />partners@levamcorp.com</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', letterSpacing: '0.1em', marginBottom: 4 }}>INVOICE</div>
                  <div style={{ fontSize: 12, color: '#2d7dd2', fontWeight: 500 }}>#{selected.invNum}</div>
                  <div style={{ fontSize: 10, color: '#555', lineHeight: 2, marginTop: 6 }}>
                    Date: {today(selected.submitted_at)}<br />
                    Terms: Net 15
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 6 }}>From</div>
                  <p style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}><strong style={{ color: '#222' }}>Levam Corp Distributors</strong><br />6315 NW 99th Ave, Doral FL 33178</p>
                </div>
                <div style={{ padding: '1rem 1.5rem', borderLeft: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 6 }}>Bill to</div>
                  <p style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}><strong style={{ color: '#222' }}>Approved Partner</strong><br />{user?.email}</p>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: '0 1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
                  <thead>
                    <tr style={{ background: '#f7f8fa' }}>
                      {['Product', 'SKU', 'Qty', 'Price', 'Total'].map((h, i) => (
                        <th key={h} style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '6px 8px', textAlign: i > 1 ? 'right' : 'left', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.order_items?.map(item => (
                      <tr key={item.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                        <td style={{ padding: '8px', fontSize: 11, fontWeight: 500, color: '#333' }}>{item.product_name}</td>
                        <td style={{ padding: '8px', fontSize: 10, color: '#bbb' }}>{item.product_sku}</td>
                        <td style={{ padding: '8px', fontSize: 11, textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '8px', fontSize: 11, textAlign: 'right' }}>${item.unit_price?.toLocaleString()}</td>
                        <td style={{ padding: '8px', fontSize: 11, fontWeight: 500, color: '#111', textAlign: 'right' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ padding: '0 1.5rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '3px 0' }}><span>Subtotal</span><span>${selected.subtotal?.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '3px 0' }}><span>Shipping</span><span>TBD</span></div>
                <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500, color: '#111' }}><span>Total</span><span>${selected.total?.toLocaleString()}</span></div>
              </div>

              {/* Legal */}
              <div style={{ margin: '0 1.5rem 1rem', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ background: '#111', padding: '5px 10px', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa' }}>Terms & Conditions</div>
                <div style={{ background: '#fafafa', padding: 10, fontSize: 9, color: '#888', lineHeight: 1.7 }}>
                  <strong style={{ color: '#555', textTransform: 'uppercase' }}>All Sales Are Final — </strong>No returns, exchanges, refunds, or cancellations. Claims for damaged goods must be reported within 48 hours to partners@levamcorp.com. Governed by the laws of the State of Florida, Miami-Dade County courts.
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8 }}>
                <button onClick={() => window.print()} style={{ flex: 1, padding: '10px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2 }}>🖨 Print / Save PDF</button>
                <button onClick={() => setSelected(null)} style={{ padding: '10px 16px', background: '#fff', color: '#aaa', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 2 }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
