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

  const handlePrint = () => window.print()

  const fmtDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const dueDate = (date) => { const d = new Date(date); d.setDate(d.getDate() + 15); return fmtDate(d) }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>Loading invoices...</div>

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>

      {/* NAV — hidden on print */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 32, height: 32 }}>
              <div style={{ position: 'absolute', left: 7, top: 0, width: 2, height: 25, background: '#444' }} />
              <div style={{ position: 'absolute', left: 7, bottom: 0, width: 18, height: 2, background: '#444' }} />
              <div style={{ position: 'absolute', left: 11, bottom: 7, width: 11, height: 2.5, background: '#2d7dd2' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase' }}>Levam</div>
              <div style={{ fontSize: 8, letterSpacing: '0.28em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Partner Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, borderLeft: '0.5px solid rgba(255,255,255,0.08)', paddingLeft: 20 }}>
            {[['Dashboard', '/portal/dashboard'], ['Catalog', '/portal/catalog'], ['My orders', '/portal/orders'], ['Invoices', '/portal/invoices']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, fontSize: 13, fontWeight: label === 'Invoices' ? 700 : 500, color: label === 'Invoices' ? '#fff' : 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 16px', borderBottom: label === 'Invoices' ? '2px solid #2d7dd2' : '2px solid transparent', letterSpacing: '0.02em' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
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
                      <tr key={order.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)', background: isSelected ? 'rgba(45,125,210,0.03)' : '#fff', cursor: 'pointer' }}
                        onClick={() => setSelected(isSelected ? null : { ...order, invNum })}>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 500, color: '#2d7dd2' }}>{invNum}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#888' }}>{fmtDate(order.submitted_at)}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#888' }}>{order.order_items?.length || 0} items</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 500, color: '#111' }}>${order.total?.toLocaleString()}</td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 2, background: order.status === 'completed' ? 'rgba(42,125,79,0.08)' : 'rgba(45,125,210,0.08)', color: order.status === 'completed' ? '#2a7d4f' : '#2d7dd2', border: `0.5px solid ${order.status === 'completed' ? 'rgba(42,125,79,0.2)' : 'rgba(45,125,210,0.2)'}` }}>
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

        {/* RIGHT — invoice preview with print class */}
        {selected && (
          <div style={{ width: 500, position: 'sticky', top: 80, height: 'fit-content' }}>
            <div className="invoice-print" style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>

              {/* Header dark */}
              <div style={{ background: '#111', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ position: 'relative', width: 36, height: 36 }}>
                      <div style={{ position: 'absolute', left: 8, top: 0, width: 2.5, height: 28, background: '#444' }} />
                      <div style={{ position: 'absolute', left: 8, bottom: 0, width: 20, height: 2.5, background: '#444' }} />
                      <div style={{ position: 'absolute', left: 13, bottom: 8, width: 12, height: 2.5, background: '#2d7dd2' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500, letterSpacing: '0.2em', color: '#ddd', textTransform: 'uppercase' }}>Levam</div>
                      <div style={{ fontSize: 8, letterSpacing: '0.35em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Corp · Distributors</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: '#555', lineHeight: 1.8 }}>
                    6315 NW 99th Ave, Doral, FL 33178<br />
                    partners@levamcorp.com · levamcorp.com<br />
                    Phone: +1 (305) 000-0000
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 500, color: '#fff', letterSpacing: '0.15em', marginBottom: 6 }}>INVOICE</div>
                  <div style={{ fontSize: 13, color: '#2d7dd2', fontWeight: 500 }}>#{selected.invNum}</div>
                  <div style={{ fontSize: 10, color: '#555', lineHeight: 2, marginTop: 8 }}>
                    <strong style={{ color: '#aaa' }}>Date:</strong> {fmtDate(selected.submitted_at)}<br />
                    <strong style={{ color: '#aaa' }}>Due:</strong> {dueDate(selected.submitted_at)}<br />
                    <strong style={{ color: '#aaa' }}>Terms:</strong> Net 15
                  </div>
                </div>
              </div>

              {/* Parties */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>From</div>
                  <p style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}>
                    <strong style={{ color: '#222' }}>Levam Corp Distributors</strong><br />
                    6315 NW 99th Ave<br />
                    Doral, FL 33178<br />
                    partners@levamcorp.com
                  </p>
                </div>
                <div style={{ padding: '1.25rem 1.5rem', borderLeft: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>Bill to</div>
                  <p style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}>
                    <strong style={{ color: '#222' }}>Approved Partner</strong><br />
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Items table */}
              <div style={{ padding: '0 1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
                  <thead>
                    <tr style={{ background: '#f7f8fa' }}>
                      {['#', 'Product', 'SKU', 'Qty', 'Unit price', 'Total'].map((h, i) => (
                        <th key={h} style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '8px', textAlign: i > 2 ? 'right' : 'left', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.order_items?.map((item, i) => (
                      <tr key={item.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                        <td style={{ padding: '10px 8px', fontSize: 11, color: '#bbb' }}>{i + 1}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, fontWeight: 500, color: '#333' }}>{item.product_name}</td>
                        <td style={{ padding: '10px 8px', fontSize: 10, color: '#bbb' }}>{item.product_sku}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right' }}>${item.unit_price?.toLocaleString()}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, fontWeight: 500, color: '#111', textAlign: 'right' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div style={{ padding: '0 1.5rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '4px 0' }}><span>Subtotal</span><span>${selected.subtotal?.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '4px 0' }}><span>Shipping</span><span>TBD</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '4px 0' }}><span>Tax</span><span>TBD</span></div>
                <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 500, color: '#111', padding: '4px 0' }}><span>Estimated Total</span><span>${selected.total?.toLocaleString()}</span></div>
              </div>

              {/* Legal */}
              <div style={{ margin: '0 1.5rem 1.25rem', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ background: '#111', padding: '7px 12px', fontSize: 8, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#aaa' }}>Terms & Conditions · Legal Notice</div>
                <div style={{ background: '#fafafa', padding: 12, fontSize: 9.5, color: '#888', lineHeight: 1.75 }}>
                  <strong style={{ color: '#555', fontSize: 9, textTransform: 'uppercase' }}>All Sales Are Final — </strong>
                  All sales made by Levam Corp Distributors are final. Once an order has been confirmed, no returns, exchanges, refunds, or cancellations will be accepted under any circumstances. By accepting this invoice, the buyer acknowledges and agrees to this policy in full.<br /><br />
                  <strong style={{ color: '#555', fontSize: 9, textTransform: 'uppercase' }}>No Return Policy — </strong>
                  Levam Corp Distributors does not accept returns for any reason. Claims for damaged goods must be reported in writing to partners@levamcorp.com within 48 hours of delivery.<br /><br />
                  <strong style={{ color: '#555', fontSize: 9, textTransform: 'uppercase' }}>Governing Law — </strong>
                  This agreement is governed by the laws of the State of Florida. Any disputes shall be resolved exclusively in the courts of Miami-Dade County, Florida.
                </div>
              </div>

              {/* Signature */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(0,0,0,0.08)', margin: '0 1.5rem 1.25rem' }}>
                <div style={{ background: '#fff', padding: '1rem' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 20 }}>Authorized by · Levam Corp</div>
                  <div style={{ borderTop: '0.5px solid #ddd', paddingTop: 5, fontSize: 9, color: '#ccc' }}>Signature & date</div>
                </div>
                <div style={{ background: '#fff', padding: '1rem' }}>
                  <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 20 }}>Accepted by · Client</div>
                  <div style={{ borderTop: '0.5px solid #ddd', paddingTop: 5, fontSize: 9, color: '#ccc' }}>Signature & date</div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: '#f7f8fa', padding: '0.75rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', fontSize: 9, color: '#bbb', textAlign: 'center' }}>
                Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com · levamcorp.com
              </div>

              {/* Action buttons — hidden on print */}
              <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8 }}>
                <button onClick={handlePrint} style={{ flex: 1, padding: 11, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2 }}>
                  🖨 Print / Save PDF
                </button>
                <button onClick={() => setSelected(null)} style={{ padding: '11px 16px', background: '#fff', color: '#aaa', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 2 }}>Close</button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
