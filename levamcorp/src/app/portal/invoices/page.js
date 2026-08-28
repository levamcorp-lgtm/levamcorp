'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const MONO = "'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace"
const DISPLAY = "'Space Grotesk',-apple-system,sans-serif"

const NAV_LINKS = [['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']]

function PortalNav({ onLogout }) {
  const pathname = usePathname()
  return (
    <nav className="no-print" style={{ position:'sticky', top:0, zIndex:40, background:'#08090B', borderBottom:'1px solid rgba(245,241,232,0.1)' }}>
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
    new: { label: 'Pending', color: '#2F7DF6' },
    review: { label: 'In review', color: '#B98A54' },
    confirmed: { label: 'Confirmed', color: '#6B7280' },
    dispatched: { label: 'Dispatched', color: '#12B76A' },
    completed: { label: 'Paid', color: '#12B76A' },
    cancelled: { label: 'Cancelled', color: '#E74C3C' },
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

  const globalStyle = `
    .lc-display { font-family:${DISPLAY}; letter-spacing:-0.02em; }
    .lc-mono { font-family:${MONO}; }
    @keyframes spin { to{transform:rotate(360deg)} }
    @media print {
      .no-print { display: none !important; }
      body { background: #fff !important; }
    }
  `

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{globalStyle}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(8,9,11,0.12)', borderTop:'2px solid #2F7DF6', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 0.7s linear infinite' }}/>
        <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A8780' }}>Loading invoices…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color:'#08090B', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>
      <style>{globalStyle}</style>

      <PortalNav onLogout={handleLogout}/>

      {/* HERO */}
      <div className="no-print" style={{ background: '#08090B', padding: '2rem 2rem 1.75rem' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
            <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
            Partner portal · Billing history
          </div>
          <div style={{ height:1, background:'rgba(245,241,232,0.16)' }}/>
          <h1 className="lc-display" style={{ fontSize:'clamp(26px,3.2vw,36px)', fontWeight:400, letterSpacing:'-0.03em', margin:'clamp(18px,2.6vh,26px) 0 clamp(20px,2.8vh,24px)', color:'#F5F2E9' }}>Invoices<span style={{ color:'#2F7DF6' }}>.</span></h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background:'rgba(245,241,232,0.14)', border:'1px solid rgba(245,241,232,0.14)' }}>
            {[
              { label: 'Total invoiced', value: `$${totalInvoiced.toLocaleString()}`, sub: `${orders.length} invoices`, icon: '🧾' },
              { label: 'Amount paid', value: `$${totalPaid.toLocaleString()}`, sub: 'completed orders', icon: '✅' },
              { label: 'Outstanding', value: `$${totalPending.toLocaleString()}`, sub: 'pending payment', icon: '⏳' },
            ].map(s => (
              <div key={s.label} style={{ background: '#08090B', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="lc-mono" style={{ fontSize: 9, color: '#8A8780', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>{s.label}</div>
                    <div className="lc-display" style={{ fontSize: 28, fontWeight: 400, color: '#F5F1E8', marginBottom: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#8A8780' }}>{s.sub}</div>
                  </div>
                  <div style={{ fontSize: 22, opacity: 0.5 }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: 1240, margin: '0 auto', display: 'grid', gridTemplateColumns: selected ? '340px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT — list */}
        <div className="no-print">
          <div className="lc-mono" style={{ fontSize: 9.5, fontWeight: 700, color: '#5C5A55', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, background: '#2F7DF6', display: 'inline-block' }} />
            Invoice history
          </div>
          {orders.length === 0 ? (
            <div style={{ background: '#F2EFE6', border: '1px solid rgba(8,9,11,0.1)', padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: '1rem', opacity:0.6 }}>🧾</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#08090B', marginBottom: '0.5rem' }}>No invoices yet</h3>
              <p style={{ fontSize: 13, color: '#8A8780', marginBottom: '1.5rem' }}>Place an order to generate your first invoice.</p>
              <Link href="/portal/catalog" className="lc-mono" style={{ padding: '11px 24px', background: '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
            </div>
          ) : (
            <div style={{ background: '#F2EFE6', border: '1px solid rgba(8,9,11,0.1)' }}>
              {orders.map((order, idx) => {
                const invNum = getInvNum(order, idx)
                const isSelected = selected?.id === order.id
                const s = statusConfig[order.status] || statusConfig.new
                const paid = order.status === 'completed'
                return (
                  <div key={order.id} onClick={() => setSelected(isSelected ? null : { ...order, invNum })} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(8,9,11,0.08)', cursor: 'pointer', background: isSelected ? 'rgba(47,125,246,0.06)' : '#F2EFE6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <div className="lc-mono" style={{ fontSize: 12.5, fontWeight: 700, color: '#2F7DF6' }}>{invNum}</div>
                          <span className="lc-mono" style={{ fontSize: 8.5, padding: '3px 7px', background: paid ? 'rgba(18,183,106,0.12)' : 'rgba(231,76,60,0.1)', color: paid ? '#0E9A5A' : '#C0392B', fontWeight: 700, letterSpacing: '0.06em' }}>
                            {paid ? 'PAID' : payments[order.id]?.payment_proof_url ? 'SUBMITTED' : 'UNPAID'}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: '#8A8780' }}>{fmtDate(order.submitted_at)} · {order.order_items?.length || 0} items</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#08090B' }}>${order.total?.toLocaleString()}</div>
                        <span className="lc-mono" style={{ fontSize: 8.5, padding: '3px 8px', border:`1px solid ${s.color}55`, color: s.color, fontWeight: 700, letterSpacing:'0.05em', textTransform:'uppercase' }}>{s.label}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — invoice (printable — inline fonts only, no className, since handlePrint copies raw innerHTML) */}
        {selected && (
          <div style={{ position: 'sticky', top: 76 }}>
            <div id="invoice-print-area" style={{ background: '#fff', border: '1px solid rgba(8,9,11,0.1)', position: 'relative', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif' }}>

              {/* WATERMARK */}
              <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%, -50%) rotate(-35deg)', fontFamily: DISPLAY, fontSize: 88, fontWeight: 700, color: isPaid ? 'rgba(18,183,106,0.08)' : 'rgba(220,60,60,0.08)', letterSpacing: '0.1em', pointerEvents: 'none', zIndex: 10, userSelect: 'none', whiteSpace: 'nowrap' }}>
                {paymentStatus === 'paid' ? 'PAID' : paymentStatus === 'proof_submitted' ? 'SUBMITTED' : 'UNPAID'}
              </div>

              {/* DARK HEADER */}
              <div style={{ background: '#08090B', padding: '1.75rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ width:28, height:28, border:'1.5px solid rgba(245,241,232,0.35)', borderLeft:'3px solid #2F7DF6' }}/>
                      <div>
                        <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, letterSpacing: '0.16em', color: '#F5F1E8', textTransform: 'uppercase' }}>LEVAM<span style={{ color:'#2F7DF6' }}>CORP</span></div>
                        <div style={{ fontFamily: MONO, fontSize: 7, letterSpacing: '0.25em', color: '#6F6D67', textTransform: 'uppercase', marginTop: 2 }}>Distributors</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: '#6F6D67', lineHeight: 1.9 }}>6315 NW 99th Ave, Doral, FL 33178<br />partners@levamcorp.com · levamcorp.com</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: '#F5F1E8', letterSpacing: '0.16em', marginBottom: 4 }}>INVOICE</div>
                    <div style={{ fontFamily: MONO, fontSize: 12, color: '#2F7DF6', fontWeight: 700, marginBottom: 8 }}>{selected.invNum}</div>
                    {/* QR CODE */}
                    <div style={{ width: 56, height: 56, background: '#fff', marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
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
                        <rect x="22" y="22" width="4" height="4" fill="#2F7DF6"/>
                        <rect x="28" y="22" width="4" height="4" fill="#111"/>
                        <rect x="34" y="22" width="4" height="4" fill="#111"/>
                        <rect x="40" y="22" width="4" height="4" fill="#111"/>
                        <rect x="28" y="28" width="4" height="4" fill="#111"/>
                        <rect x="34" y="34" width="4" height="4" fill="#111"/>
                        <rect x="40" y="28" width="4" height="4" fill="#111"/>
                        <rect x="22" y="34" width="4" height="4" fill="#111"/>
                        <rect x="22" y="40" width="4" height="4" fill="#111"/>
                        <rect x="28" y="40" width="4" height="4" fill="#2F7DF6"/>
                        <rect x="40" y="40" width="4" height="4" fill="#111"/>
                        <rect x="34" y="28" width="4" height="4" fill="#111"/>
                      </svg>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 8, color: '#6F6D67', marginTop: 3 }}>levamcorp.com/portal</div>
                  </div>
                </div>
              </div>

              {/* DATE BAR */}
              <div style={{ background: '#000000', padding: '0.6rem 2rem', display: 'flex', justifyContent: 'space-between' }}>
                {[['Date', fmtDate(selected.submitted_at)], ['Due', dueDate(selected.submitted_at)], ['Terms', 'Net 15'], ['Order #', `#${selected.order_number}`]].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: MONO, fontSize: 8, color: '#6F6D67', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: '#DDD8CD', fontWeight: 500 }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* PAYMENT STATUS ALERT */}
              {!isPaid && (
                <div style={{ background: 'rgba(231,76,60,0.06)', borderBottom: '1px solid rgba(231,76,60,0.18)', padding: '10px 2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#C0392B' }}>Payment pending — </span>
                    <span style={{ fontSize: 12, color: '#5C5A55' }}>This invoice is not yet final. Payment must be received and confirmed by Levam Corp before the order is processed.</span>
                  </div>
                </div>
              )}

              {/* PAID BANNER */}
              {isPaid && (
                <div style={{ background: 'rgba(18,183,106,0.08)', borderBottom: '1px solid rgba(18,183,106,0.2)', padding: '10px 2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0E9A5A' }}>Payment received — Thank you! This invoice is final and confirmed.</span>
                </div>
              )}

              {/* PROGRESS BAR */}
              <div style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(8,9,11,0.1)', background: '#F2EFE6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 12, left: '8%', right: '8%', height: 1, background: 'rgba(8,9,11,0.15)', zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: 12, left: '8%', height: 1, background: '#2F7DF6', zIndex: 1, width: `${(getStep(selected.status) / 3) * 84}%` }} />
                  {steps.map((step, i) => {
                    const done = i <= getStep(selected.status)
                    const active = i === getStep(selected.status)
                    return (
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, position: 'relative' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#2F7DF6' : '#FFFFFF', border: active ? '3px solid #2F7DF6' : '1px solid rgba(8,9,11,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {done ? <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>✓</span> : <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#BFBBAF', display: 'block' }} />}
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 8, color: done ? '#2F7DF6' : '#8A8780', fontWeight: done ? 700 : 400, marginTop: 5, whiteSpace: 'nowrap' }}>{step}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* PARTIES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(8,9,11,0.1)' }}>
                <div style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8A8780', marginBottom: 6 }}>From</div>
                  <p style={{ fontSize: 11, color: '#5C5A55', lineHeight: 1.9, margin: 0 }}>
                    <strong style={{ color: '#08090B', fontSize: 12 }}>Levam Corp Distributors</strong><br />
                    6315 NW 99th Ave<br />Doral, FL 33178
                  </p>
                </div>
                <div style={{ padding: '1rem 1.5rem', borderLeft: '1px solid rgba(8,9,11,0.1)' }}>
                  <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#8A8780', marginBottom: 6 }}>Bill to</div>
                  <p style={{ fontSize: 11, color: '#5C5A55', lineHeight: 1.9, margin: 0 }}>
                    <strong style={{ color: '#08090B', fontSize: 12 }}>Approved Partner</strong><br />
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* ITEMS */}
              <div style={{ padding: '0 1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
                  <thead>
                    <tr style={{ background: '#08090B' }}>
                      {['#','Product','SKU','Qty','Price','Total'].map((h,i) => (
                        <th key={h} style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8A8780', padding: '8px', textAlign: i > 2 ? 'right' : 'left', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.order_items?.map((item, i) => (
                      <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#F2EFE6', borderBottom: '1px solid rgba(8,9,11,0.06)' }}>
                        <td style={{ padding: '10px 8px', fontSize: 11, color: '#BFBBAF' }}>{i+1}</td>
                        <td style={{ padding: '10px 8px', fontSize: 12, fontWeight: 600, color: '#08090B' }}>{item.product_name}</td>
                        <td style={{ padding: '10px 8px', fontSize: 9, color: '#8A8780', fontFamily: MONO }}>{item.product_sku}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right', color: '#5C5A55' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right', color: '#5C5A55' }}>${item.unit_price?.toLocaleString()}</td>
                        <td style={{ padding: '10px 8px', fontSize: 12, fontWeight: 700, color: '#08090B', textAlign: 'right' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TOTAL BOX */}
              <div style={{ margin: '0 1.5rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8780', padding: '3px 0' }}><span>Subtotal</span><span>${selected.subtotal?.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8780', padding: '3px 0' }}><span>Shipping</span><span>TBD</span></div>
                <div style={{ background: isPaid ? '#0E9A5A' : '#2F7DF6', padding: '1rem 1.25rem', marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 3 }}>{isPaid ? 'Amount paid' : 'Total due'}</div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, color: '#fff' }}>${selected.total?.toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: 28, opacity: 0.5 }}>{isPaid ? '✅' : '💰'}</div>
                </div>
                {parseFloat(selected?.amount_paid) > 0 && !isPaid && (
                  <div style={{ marginTop: 10, padding: '12px 14px', background: 'rgba(18,183,106,0.06)', border: '1px solid rgba(18,183,106,0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: '#0E9A5A', fontWeight: 600 }}>✓ Amount paid</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0E9A5A' }}>${parseFloat(selected.amount_paid).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: '#E74C3C', fontWeight: 600 }}>Balance due</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#E74C3C' }}>${Math.max(0, selected.total - parseFloat(selected.amount_paid)).toLocaleString()}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(8,9,11,0.1)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, (parseFloat(selected.amount_paid) / selected.total) * 100)}%`, background: '#0E9A5A' }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#8A8780', textAlign: 'right', marginTop: 3 }}>
                      {Math.min(100, Math.round((parseFloat(selected.amount_paid) / selected.total) * 100))}% paid
                    </div>
                  </div>
                )}
              </div>

              {/* DISCLAIMER */}
              {!isPaid && (
                <div style={{ margin: '0 1.5rem 1rem', padding: '10px 14px', background: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.18)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#C0392B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>⚠ Preliminary Invoice — Not Final</div>
                  <div style={{ fontSize: 10, color: '#8A8780', lineHeight: 1.7 }}>
                    This document is a preliminary invoice and quote. It does not constitute a final confirmed order. Levam Corp Distributors reserves the right to adjust pricing, availability, and terms. The order will only be confirmed and processed upon receipt and verification of full payment.
                  </div>
                </div>
              )}

              {/* TERMS */}
              <div style={{ margin: '0 1.5rem 1.25rem', border: '1px solid rgba(8,9,11,0.1)' }}>
                <div style={{ background: '#08090B', padding: '6px 12px', fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8A8780' }}>Terms & Conditions</div>
                <div style={{ background: '#F2EFE6', padding: '10px 12px', fontSize: 9.5, color: '#5C5A55', lineHeight: 1.75 }}>
                  <strong style={{ color: '#3F3D39', fontSize: 9, textTransform: 'uppercase' }}>All Sales Are Final — </strong>
                  No returns, exchanges, refunds, or cancellations once payment is confirmed. Damaged goods must be reported within 48 hours to partners@levamcorp.com. Governed by the laws of the State of Florida, Miami-Dade County courts.
                </div>
              </div>

              {/* SIGNATURES */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(8,9,11,0.1)', margin: '0 1.5rem 1.25rem' }}>
                <div style={{ background: '#fff', padding: '1rem' }}>
                  <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#BFBBAF', marginBottom: 20 }}>Authorized · Levam Corp</div>
                  <div style={{ borderTop: '1px solid rgba(8,9,11,0.15)', paddingTop: 5, fontSize: 9, color: '#BFBBAF' }}>Signature & date</div>
                </div>
                <div style={{ background: '#fff', padding: '1rem' }}>
                  <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#BFBBAF', marginBottom: 20 }}>Accepted · Client</div>
                  <div style={{ borderTop: '1px solid rgba(8,9,11,0.15)', paddingTop: 5, fontSize: 9, color: '#BFBBAF' }}>Signature & date</div>
                </div>
              </div>

              {/* FOOTER */}
              <div style={{ background: '#08090B', padding: '0.75rem 1.5rem', fontFamily: MONO, fontSize: 9, color: '#6F6D67', textAlign: 'center' }}>
                Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com · levamcorp.com
              </div>

              {/* ACTIONS */}
              <div className="no-print" style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(8,9,11,0.1)', display: 'flex', gap: 8 }}>
                <button onClick={handlePrint} style={{ flex: 1, padding: 12, background: '#08090B', color: '#F2EFE6', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', fontFamily: MONO }}>
                  🖨 Print / Save PDF
                </button>
                {!isPaid && (
                  <Link href="/portal/payments" style={{ padding: '12px 16px', background: 'rgba(18,183,106,0.1)', color: '#0E9A5A', fontSize: 11, fontWeight: 700, letterSpacing:'0.06em', textTransform:'uppercase', border: '1px solid rgba(18,183,106,0.25)', textDecoration: 'none', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', fontFamily: MONO }}>
                    💳 Pay now
                  </Link>
                )}
                <button onClick={() => setSelected(null)} style={{ padding: '12px 16px', background: '#F2EFE6', color: '#8A8780', fontSize: 12, border: '1px solid rgba(8,9,11,0.1)', cursor: 'pointer' }}>✕</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
