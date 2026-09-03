'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const MONO = "'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace"
const DISPLAY = "'Space Grotesk',-apple-system,sans-serif"
const ACCENT = '#2F7DF6'

const NAV_LINKS = [['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']]

// Real company remittance details — the same ones already sent in the order-confirmation email (admin/orders/page.js) and shown on invoices
const REMIT = [
  { k: 'Bank', v: 'Bank of America' },
  { k: 'Account name', v: 'Levam Corp' },
  { k: 'Account #', v: '898169098220' },
  { k: 'ACH routing', v: '063100277' },
  { k: 'Wire routing', v: '026009593' },
]

const SHIPPING_METHOD_LABELS = { pickup: 'Pickup — Doral, FL', prep_center: 'Prep Center Delivery', shipping: 'Standard Shipping', freight: 'Freight / LTL' }
const METHOD_LABELS = { credit_card: 'Credit Card', debit_card: 'Debit Card', ach: 'ACH Transfer', wire: 'Wire Transfer' }
const STATUS_CONFIG = {
  requested: { label: 'Awaiting payment', color: '#B45309', bg: '#FEF3C7' },
  processing: { label: 'Under review', color: '#1B5FD0', bg: '#E8F1FF' },
  paid: { label: 'Cleared', color: '#166534', bg: '#DCFCE7' },
}

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase()
}

function money(n) { return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function short(n) { return '$' + Math.round(n || 0).toLocaleString('en-US') }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }

function PortalNav({ user, displayName, onPrint, onLogout }) {
  const pathname = usePathname()
  return (
    <nav style={{ position:'sticky', top:0, zIndex:40, background:'#08090B', color:'#F2EFE6' }}>
      <div style={{ maxWidth:1240, margin:'0 auto', padding:'0 clamp(16px,3vw,32px)', display:'flex', alignItems:'stretch', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'clamp(16px,2.4vw,32px)', flexWrap:'wrap' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', textDecoration:'none' }}>
            <div style={{ width:30, height:30, border:'1.5px solid rgba(245,241,232,0.35)', borderLeft:'3px solid #2F7DF6', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width:16, height:'auto' }}/>
            </div>
            <span className="lc-mono" style={{ display:'block', paddingLeft:12, borderLeft:'1px solid rgba(242,239,230,0.25)', fontSize:8.5, letterSpacing:'0.22em', textTransform:'uppercase', lineHeight:1.6, color:'#7C7A73' }}>Partner<br/>portal</span>
          </Link>
          <div style={{ display:'flex', flexWrap:'wrap', minHeight:60 }}>
            {NAV_LINKS.map(([l,h]) => {
              const active = pathname === h
              return (
                <Link key={l} href={h} className="lc-mono" style={{ display:'flex', alignItems:'center', fontSize:9.5, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color: active ? '#F2EFE6' : '#8F8C85', textDecoration:'none', padding:'8px 12px', borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent' }}>{l}</Link>
              )
            })}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', padding:'10px 0' }}>
          <button onClick={onPrint} className="lc-mono" style={{ padding:'9px 13px', border:'1px solid rgba(242,239,230,0.3)', background:'transparent', color:'#F2EFE6', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer' }}>↓ Statement</button>
          <span style={{ display:'flex', alignItems:'center', gap:9 }}>
            <span className="lc-mono" style={{ display:'grid', placeItems:'center', width:28, height:28, background:ACCENT, color:'#08090B', fontWeight:700, fontSize:11 }}>{initials(displayName)}</span>
            <span className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.06em', color:'#C9C5BA' }}>{user?.email}</span>
          </span>
          <button onClick={onLogout} className="lc-mono" style={{ padding:'9px 13px', border:'1px solid rgba(242,239,230,0.35)', background:'transparent', color:'#F2EFE6', fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', cursor:'pointer' }}>Sign out</button>
        </div>
      </div>
    </nav>
  )
}

export default function PaymentsPage() {
  const [user, setUser] = useState(null)
  const [client, setClient] = useState(null)
  const [payments, setPayments] = useState([])
  const [orderList, setOrderList] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState({})
  const [methTab, setMethTab] = useState({})
  const [copiedFor, setCopiedFor] = useState(null)
  const [histTab, setHistTab] = useState('All')
  const [openId, setOpenId] = useState(null)
  const [hoverId, setHoverId] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)
      const [{ data: paymentsData }, { data: clientData }, { data: ordersData }] = await Promise.all([
        supabase.from('payments').select('*, orders(order_number, total, submitted_at, amount_paid, order_items(*))').eq('user_id', data.user.id).order('created_at', { ascending: false }),
        supabase.from('clients').select('*').eq('email', data.user.email).single(),
        supabase.from('orders').select('id, order_number, submitted_at').eq('user_id', data.user.id).order('submitted_at', { ascending: false }),
      ])
      setPayments(paymentsData || [])
      setClient(clientData || null)
      setOrderList(ordersData || [])
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
      const { error } = await supabase.storage.from('Documents').upload(path, file, { contentType: file.type, upsert: true })
      if (error) throw error
      await supabase.from('payments').update({ payment_proof_url: path, status: 'processing' }).eq('id', paymentId)
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, payment_proof_url: path, status: 'processing' } : p))
    } catch (e) { alert('Upload failed. Please try again.') }
    setUploading(prev => ({ ...prev, [paymentId]: false }))
  }

  const openDoc = async (path) => {
    if (!path) return
    const supabase = createClient()
    let r = await supabase.storage.from('Documents').createSignedUrl(path, 3600)
    if (!r.data?.signedUrl) r = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (r.data?.signedUrl) window.open(r.data.signedUrl, '_blank')
  }

  const copyRemit = (paymentId) => {
    const txt = REMIT.map(r => r.k + ': ' + r.v).join('\n')
    if (navigator.clipboard) navigator.clipboard.writeText(txt)
    setCopiedFor(paymentId)
    setTimeout(() => setCopiedFor(prev => prev === paymentId ? null : prev), 2000)
  }

  // Same synthesized invoice-number scheme as the invoices page, so "Applied to" matches what the client sees there
  const invNumByOrder = useMemo(() => {
    const map = {}
    orderList.forEach((o, i) => { map[o.order_number] = `LC-${new Date(o.submitted_at).getFullYear()}-${String(i + 1001).padStart(5, '0')}` })
    return map
  }, [orderList])

  const displayName = client?.contact_name || user?.email?.split('@')[0] || 'Partner'
  const businessName = client?.business_name || ''
  const acctRef = user?.id ? user.id.slice(-4).toUpperCase() : '----'

  const due = payments.filter(p => p.status === 'requested')
  const reviewing = payments.filter(p => p.status === 'processing')
  const cleared = payments.filter(p => p.status === 'paid')
  const totalDue = due.reduce((s, p) => s + (p.amount || 0), 0)
  const totalReview = reviewing.reduce((s, p) => s + (p.amount || 0), 0)
  const totalPaid = cleared.reduce((s, p) => s + (p.amount || 0), 0)

  const historyAll = useMemo(() => payments.filter(p => p.status === 'processing' || p.status === 'paid'), [payments])
  const historyFiltered = histTab === 'All' ? historyAll : histTab === 'Cleared' ? cleared : reviewing
  const openPayment = historyFiltered.find(p => p.id === openId) || null

  const kpis = [
    { k: 'Due now', v: short(totalDue), sub: due.length ? `${due.length} order${due.length>1?'s':''} · pay to release` : 'nothing due', dot: due.length ? '#F59E0B' : '#16A34A', subColor: due.length ? '#B45309' : '#166534' },
    { k: 'Awaiting our confirmation', v: short(totalReview), sub: reviewing.length ? `${reviewing.length} proof under review` : 'no proofs pending', dot: reviewing.length ? ACCENT : '#08090B', subColor: reviewing.length ? '#1B5FD0' : '#6F6D67' },
    { k: 'Paid to date', v: short(totalPaid), sub: `${cleared.length} payment${cleared.length!==1?'s':''} cleared`, dot: '#16A34A', subColor: '#166534' },
  ]

  const handleStatement = () => {
    const rows = payments.map(p => {
      const invNum = p.orders?.order_number ? (invNumByOrder[p.orders.order_number] || '—') : '—'
      const s = STATUS_CONFIG[p.status] || STATUS_CONFIG.requested
      return `<tr>
        <td style="padding:8px 10px;border-bottom:1px solid rgba(8,9,11,.1);font-size:11px">${fmtDate(p.created_at)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid rgba(8,9,11,.1);font-size:11px">${invNum} · Order ${p.orders?.order_number || '—'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid rgba(8,9,11,.1);font-size:11px">${METHOD_LABELS[p.payment_method] || p.payment_method || '—'}</td>
        <td style="padding:8px 10px;border-bottom:1px solid rgba(8,9,11,.1);font-size:11px;text-align:right">${money(p.amount)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid rgba(8,9,11,.1);font-size:11px;color:${s.color}">${s.label}</td>
      </tr>`
    }).join('')
    const html = `<!DOCTYPE html><html><head><title>Statement — ${businessName || user?.email}</title><style>
      body{font-family:-apple-system,Arial,sans-serif;color:#08090B;padding:40px;max-width:820px;margin:0 auto}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{text-align:left;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#6F6D67;padding:8px 10px;border-bottom:2px solid #08090B}
      @media print{body{padding:0}}
    </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #08090B;padding-bottom:16px">
        <div><div style="font-weight:700;font-size:18px;letter-spacing:-0.02em">Levam Corp Distributors</div><div style="font-size:11px;color:#6F6D67;margin-top:4px">6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com</div></div>
        <div style="text-align:right"><div style="font-size:14px;font-weight:700">Payment statement</div><div style="font-size:11px;color:#6F6D67;margin-top:4px">${fmtDate(new Date())}</div></div>
      </div>
      <div style="margin-top:16px;font-size:12px;color:#5C5A55">${businessName ? businessName + ' · ' : ''}${user?.email}</div>
      <table><thead><tr><th>Date</th><th>Applied to</th><th>Method</th><th style="text-align:right">Amount</th><th>Status</th></tr></thead><tbody>${rows || '<tr><td colspan="5" style="padding:16px 10px;color:#6F6D67;font-size:12px">No payments yet</td></tr>'}</tbody></table>
      <div style="margin-top:24px;font-size:10px;color:#6F6D67">Due now: ${money(totalDue)} · Under review: ${money(totalReview)} · Paid to date: ${money(totalPaid)}</div>
    </body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
  }

  const globalStyle = `
    .lc-mono { font-family:${MONO}; }
    .lc-display { font-family:${DISPLAY}; letter-spacing:-0.02em; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .pmt-layout { display:grid; grid-template-columns: minmax(0,1fr) clamp(268px,25vw,330px); gap: clamp(18px,2.6vw,30px); align-items:start; }
    .due-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1px; background: rgba(8,9,11,.14); }
    @media(max-width:900px){ .pmt-layout{ grid-template-columns:1fr !important; } }
    [data-scroll]::-webkit-scrollbar { height:6px; width:6px; }
    [data-scroll]::-webkit-scrollbar-thumb { background: rgba(8,9,11,.28); }
  `

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{globalStyle}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(8,9,11,0.12)', borderTop:`2px solid ${ACCENT}`, borderRadius:'50%', margin:'0 auto 16px', animation:'spin 0.7s linear infinite' }}/>
        <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A8780' }}>Loading payments…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color:'#08090B', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>
      <style>{globalStyle}</style>

      <PortalNav user={user} displayName={displayName} onPrint={handleStatement} onLogout={handleLogout}/>

      {/* HERO */}
      <div style={{ padding: 'clamp(24px,4vh,40px) clamp(16px,4vw,32px) 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:11 }}>
            <span style={{ width:6, height:6, background:ACCENT, display:'inline-block' }}/>Partner portal · Payments &amp; billing
          </div>
          <div style={{ height:1, background:'rgba(8,9,11,0.9)' }}/>

          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:20, flexWrap:'wrap', padding:'clamp(18px,2.6vh,26px) 0 clamp(16px,2.4vh,22px)' }}>
            <div>
              <h1 className="lc-display" style={{ margin:0, fontSize:'clamp(30px,3.6vw,46px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1 }}>Payments &amp; billing<span style={{ color:ACCENT }}>.</span></h1>
              <div className="lc-mono" style={{ paddingTop:9, fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>{businessName ? businessName + ' · ' : ''}Acct {acctRef} · Net 15</div>
            </div>
            <div style={{ display:'flex', alignItems:'stretch', gap:1, background:'rgba(8,9,11,0.85)', border:'1px solid rgba(8,9,11,0.85)' }}>
              <div style={{ background:'#08090B', color:'#F2EFE6', padding:'11px 16px 12px' }}>
                <div className="lc-mono" style={{ fontSize:8, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8F8C85' }}>Due now</div>
                <div className="lc-mono" style={{ paddingTop:4, fontWeight:700, fontSize:18, letterSpacing:'-0.02em' }}>{money(totalDue)}</div>
              </div>
              {due.length > 0 ? (
                <a href="#due" className="lc-mono" style={{ display:'flex', alignItems:'center', padding:'11px 18px 12px', background:ACCENT, color:'#08090B', fontWeight:700, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', textDecoration:'none' }}>Pay now →</a>
              ) : reviewing.length > 0 ? (
                <span className="lc-mono" style={{ display:'flex', alignItems:'center', padding:'11px 18px 12px', background:'#E8F1FF', color:'#1B5FD0', fontWeight:700, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase' }}>Proof under review</span>
              ) : (
                <span className="lc-mono" style={{ display:'flex', alignItems:'center', padding:'11px 18px 12px', background:'#DCFCE7', color:'#166534', fontWeight:700, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase' }}>All caught up</span>
              )}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(196px,1fr))', gap:1, background:'rgba(8,9,11,0.85)', border:'1px solid rgba(8,9,11,0.85)' }}>
            {kpis.map(k => (
              <div key={k.k} style={{ background:'#FFFFFF', padding:'clamp(13px,1.9vh,17px) 15px clamp(14px,2vh,18px)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                  <span className="lc-mono" style={{ fontSize:8, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>{k.k}</span>
                  <span style={{ width:5, height:5, background:k.dot, display:'inline-block' }}/>
                </div>
                <div className="lc-display" style={{ paddingTop:8, fontSize:'clamp(24px,2.6vw,32px)', fontWeight:400, letterSpacing:'-0.035em', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{k.v}</div>
                <div className="lc-mono" style={{ paddingTop:7, fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', color:k.subColor }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: 'clamp(20px,3vh,30px) clamp(16px,4vw,32px) clamp(50px,8vh,90px)' }}>
        <div className="pmt-layout" style={{ maxWidth: 1240, margin: '0 auto' }}>

          {/* LEFT COLUMN */}
          <div style={{ minWidth: 0 }}>
            {payments.length === 0 ? (
              <div style={{ background: '#F2EFE6', border: '1px solid rgba(8,9,11,0.1)', padding: '4rem', textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#08090B', marginBottom: 6 }}>No payments yet</div>
                <div style={{ fontSize: 12, color: '#8A8780', marginBottom: '1.5rem' }}>Place an order from the catalog to get started</div>
                <Link href="/portal/catalog" className="lc-mono" style={{ padding: '11px 24px', background: '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block' }}>Browse catalog</Link>
              </div>
            ) : (
              <>
                <div id="due" style={{ border: '1px solid rgba(8,9,11,0.85)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap', padding:'11px 15px 12px', background:'#08090B', color:'#F2EFE6' }}>
                    <span className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, fontSize:9.5, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>
                      <span style={{ width:6, height:6, background: due.length ? '#F59E0B' : '#16A34A', display:'inline-block' }}/>
                      {due.length ? 'Action required' : 'Nothing due'} · {due.length} order{due.length!==1?'s':''}
                    </span>
                    <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#8F8C85' }}>{due.length ? 'Send payment, then upload proof' : 'You’re all caught up'}</span>
                  </div>

                  {due.length === 0 && reviewing.length === 0 && (
                    <div style={{ padding:'2.5rem 1.5rem', textAlign:'center', color:'#6F6D67', fontSize:12 }}>Nothing to pay right now.</div>
                  )}

                  {due.map(payment => {
                    const order = payment.orders
                    const invNum = order?.order_number ? (invNumByOrder[order.order_number] || '—') : '—'
                    const shipLabel = SHIPPING_METHOD_LABELS[payment.shipping_method] || payment.shipping_method
                    const tab = methTab[payment.id] || (['ach','wire'].includes(payment.payment_method) ? 'Wire / ACH' : 'Card')
                    const amountPaid = parseFloat(order?.amount_paid) || 0
                    const balance = Math.max(0, (order?.total || 0) - amountPaid)
                    return (
                      <div key={payment.id} style={{ borderBottom: '1px solid rgba(8,9,11,0.85)' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'13px 15px 14px', background:'#F6F5F2', borderBottom:'1px solid rgba(8,9,11,0.14)' }}>
                          <span>
                            <span className="lc-mono" style={{ display:'block', fontWeight:700, fontSize:11.5, letterSpacing:'0.06em' }}>Order #{order?.order_number}</span>
                            <span className="lc-mono" style={{ display:'block', paddingTop:5, fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6F6D67' }}>{invNum} · placed {fmtDate(order?.submitted_at)} · {shipLabel}</span>
                          </span>
                          <span style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                            <span className="lc-mono" style={{ fontSize:8.5, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', background:'#FEF3C7', color:'#92400E', padding:'5px 9px 6px' }}>Awaiting payment</span>
                            <span className="lc-mono" style={{ fontWeight:700, fontSize:19, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }}>{money(payment.amount)}</span>
                          </span>
                        </div>

                        {amountPaid > 0 && (
                          <div style={{ padding:'9px 15px 10px', background:'rgba(18,183,106,0.06)', borderBottom:'1px solid rgba(8,9,11,0.08)' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:6, fontSize:11 }}>
                              <span style={{ color:'#166534', fontWeight:600 }}>✓ Already applied: {money(amountPaid)}</span>
                              <span style={{ color:'#B91C1C', fontWeight:700 }}>Balance due: {money(balance)}</span>
                            </div>
                          </div>
                        )}

                        <div className="due-grid">
                          <div style={{ background:'#FFFFFF', padding:'14px 15px 16px' }}>
                            <div className="lc-mono" style={{ fontSize:8, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:10 }}>Step 1 · Send {money(balance > 0 ? balance : payment.amount)}</div>

                            <div style={{ display:'flex', gap:1, background:'rgba(8,9,11,0.85)', border:'1px solid rgba(8,9,11,0.85)', marginBottom:12 }}>
                              {['Wire / ACH','Card'].map(label => {
                                const on = tab === label
                                return (
                                  <button key={label} type="button" onClick={() => setMethTab(prev => ({ ...prev, [payment.id]: label }))}
                                    className="lc-mono" style={{ flex:'1 1 0', border:0, cursor:'pointer', padding:'9px 8px 10px', background: on ? '#08090B' : '#FFFFFF', color: on ? '#F2EFE6' : '#4A4741', fontWeight:700, fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase' }}>{label}</button>
                                )
                              })}
                            </div>

                            {tab === 'Wire / ACH' ? (
                              <>
                                <div style={{ border:'1px solid rgba(8,9,11,0.16)' }}>
                                  {REMIT.map(r => (
                                    <div key={r.k} style={{ display:'grid', gridTemplateColumns:'clamp(78px,9vw,104px) minmax(0,1fr)', gap:10, alignItems:'baseline', padding:'9px 11px 10px', borderBottom:'1px solid rgba(8,9,11,0.09)' }}>
                                      <span className="lc-mono" style={{ fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>{r.k}</span>
                                      <span className="lc-mono" style={{ fontSize:11.5, fontWeight:700, letterSpacing:'0.06em', color:'#08090B', wordBreak:'break-word' }}>{r.v}</span>
                                    </div>
                                  ))}
                                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'9px 11px 10px', background:'#F6F5F2' }}>
                                    <span className="lc-mono" style={{ fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>No fee · ACH 1–3 days · Wire same day</span>
                                    <button type="button" onClick={() => copyRemit(payment.id)} className="lc-mono" style={{ border:'1px solid rgba(8,9,11,0.3)', cursor:'pointer', background: copiedFor === payment.id ? ACCENT : '#FFFFFF', color:'#08090B', padding:'6px 10px 7px', fontWeight:700, fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase' }}>{copiedFor === payment.id ? 'Copied ✓' : 'Copy details'}</button>
                                  </div>
                                </div>
                                <div style={{ marginTop:12, padding:'9px 11px 10px', borderLeft:`2px solid ${ACCENT}`, background:'#F0F6FF' }}>
                                  <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.1em', lineHeight:1.7, textTransform:'uppercase', color:'#1B5FD0' }}>Reference · Order #{order?.order_number}</span>
                                  <div style={{ fontSize:11, color:'#4A4741', marginTop:2 }}>Include it so we can match your payment</div>
                                </div>
                              </>
                            ) : (
                              <div style={{ border:'1px solid rgba(8,9,11,0.16)', padding:'16px 14px' }}>
                                <div style={{ fontSize:12.5, lineHeight:1.6, color:'#4A4741', marginBottom:12 }}>We don&rsquo;t process card payments online yet. Message your rep on WhatsApp to pay by card, then upload your receipt below.</div>
                                <a href="https://wa.me/17864909005" target="_blank" rel="noreferrer" className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'10px 12px 11px', background:ACCENT, color:'#08090B', fontWeight:700, fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', textDecoration:'none' }}>WhatsApp us <span>→</span></a>
                              </div>
                            )}
                          </div>

                          <div style={{ background:'#FFFFFF', padding:'14px 15px 16px' }}>
                            <div className="lc-mono" style={{ fontSize:8, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:10 }}>Step 2 · Upload proof</div>

                            <label style={{ display:'block', cursor:'pointer', border:`1px dashed ${uploading[payment.id] ? ACCENT : 'rgba(8,9,11,0.35)'}`, background: uploading[payment.id] ? '#F0F6FF' : '#F6F5F2', padding:'clamp(18px,3vh,28px) 16px', textAlign:'center' }}>
                              <input type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e => e.target.files[0] && uploadProof(payment.id, e.target.files[0])} />
                              {uploading[payment.id] ? (
                                <div className="lc-mono" style={{ fontWeight:700, fontSize:10.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#1B5FD0' }}>Uploading…</div>
                              ) : (
                                <>
                                  <div className="lc-mono" style={{ fontWeight:700, fontSize:10.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#08090B' }}>Upload payment proof</div>
                                  <div className="lc-mono" style={{ paddingTop:7, fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>Screenshot, receipt or bank confirmation · image or PDF</div>
                                </>
                              )}
                            </label>

                            <div style={{ marginTop:12, borderTop:'1px solid rgba(8,9,11,0.14)' }}>
                              {[
                                { k: 'Invoice issued', v: fmtDate(order?.submitted_at), done: true },
                                { k: 'Payment sent by you', v: 'Waiting', done: false },
                                { k: 'Confirmed by Levam Corp', v: '—', done: false },
                                { k: 'Order released', v: '—', done: false },
                              ].map((t, i) => (
                                <div key={t.k} style={{ display:'grid', gridTemplateColumns:'16px minmax(0,1fr) auto', gap:10, alignItems:'center', padding:'9px 0 10px', borderBottom:'1px solid rgba(8,9,11,0.09)' }}>
                                  <span className="lc-mono" style={{ display:'grid', placeItems:'center', width:15, height:15, background: t.done ? '#16A34A' : '#E3E0D9', color: t.done ? '#FFFFFF' : '#6F6D67', fontSize:8, fontWeight:700 }}>{t.done ? '✓' : i+1}</span>
                                  <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color: t.done ? '#08090B' : '#6F6D67' }}>{t.k}</span>
                                  <span className="lc-mono" style={{ fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6F6D67' }}>{t.v}</span>
                                </div>
                              ))}
                            </div>
                            <div className="lc-mono" style={{ paddingTop:11, fontSize:8, letterSpacing:'0.14em', lineHeight:1.8, textTransform:'uppercase', color:'#6F6D67' }}>Orders ship or release for pickup once payment clears.</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {reviewing.map(payment => {
                    const order = payment.orders
                    const invNum = order?.order_number ? (invNumByOrder[order.order_number] || '—') : '—'
                    return (
                      <div key={payment.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'13px 15px 14px', borderBottom:'1px solid rgba(8,9,11,0.85)', background:'#F0F6FF' }}>
                        <span>
                          <span className="lc-mono" style={{ display:'block', fontWeight:700, fontSize:11.5, letterSpacing:'0.06em' }}>Order #{order?.order_number}</span>
                          <span className="lc-mono" style={{ display:'block', paddingTop:5, fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#1B5FD0' }}>{invNum} · proof submitted · awaiting our confirmation</span>
                        </span>
                        <span style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                          <span className="lc-mono" style={{ fontWeight:700, fontSize:16, letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }}>{money(payment.amount)}</span>
                          {payment.payment_proof_url && (
                            <button type="button" onClick={() => openDoc(payment.payment_proof_url)} className="lc-mono" style={{ border:`1px solid ${ACCENT}`, cursor:'pointer', background:'#FFFFFF', color:ACCENT, padding:'7px 11px 8px', fontWeight:700, fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase' }}>View proof</button>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* PAYMENT HISTORY */}
                <div style={{ marginTop: 'clamp(18px,2.6vh,26px)', border:'1px solid rgba(8,9,11,0.85)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap', padding:'11px 15px 12px', borderBottom:'1px solid #08090B', background:'#F6F5F2' }}>
                    <span className="lc-mono" style={{ fontWeight:700, fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase' }}>Payment history</span>
                    <span style={{ display:'flex', alignItems:'center', gap:1, background:'rgba(8,9,11,0.85)', border:'1px solid rgba(8,9,11,0.85)' }}>
                      {['All','Cleared','Under review'].map(label => {
                        const on = histTab === label
                        return (
                          <button key={label} type="button" onClick={() => { setHistTab(label); setOpenId(null) }} className="lc-mono" style={{ border:0, cursor:'pointer', padding:'7px 11px 8px', background: on ? '#08090B' : '#FFFFFF', color: on ? '#F2EFE6' : '#4A4741', fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{label}</button>
                        )
                      })}
                    </span>
                  </div>

                  {historyFiltered.length === 0 ? (
                    <div style={{ padding:'2.5rem 1.5rem', textAlign:'center', color:'#6F6D67', fontSize:12 }}>No payments in this view yet.</div>
                  ) : (
                    <div data-scroll style={{ overflowX:'auto' }}>
                      <div style={{ minWidth: 820 }}>
                        <div style={{ display:'grid', gridTemplateColumns:'104px 128px minmax(0,1fr) 118px 112px 128px', gap:12, alignItems:'center', padding:'10px 15px 11px', borderBottom:'1px solid rgba(8,9,11,0.55)' }}>
                          {['Date','Payment','Applied to','Method','Amount','Receipt'].map((h,i) => (
                            <span key={h} className="lc-mono" style={{ fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67', textAlign: i===4?'right':i===5?'center':'left' }}>{h}</span>
                          ))}
                        </div>
                        {historyFiltered.map(p => {
                          const invNum = p.orders?.order_number ? (invNumByOrder[p.orders.order_number] || '—') : '—'
                          const on = hoverId === p.id
                          const pend = p.status === 'processing'
                          return (
                            <div key={p.id} role="button" tabIndex={0} onClick={() => setOpenId(p.id)} onKeyDown={e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); setOpenId(p.id) } }}
                              onMouseEnter={() => setHoverId(p.id)} onMouseLeave={() => setHoverId(null)}
                              style={{ display:'grid', gridTemplateColumns:'104px 128px minmax(0,1fr) 118px 112px 128px', gap:12, alignItems:'center', padding:'13px 15px 14px', cursor:'pointer', borderBottom:'1px solid rgba(8,9,11,0.1)', background: on ? '#F0F6FF' : '#FFFFFF' }}>
                              <span className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.06em', color:'#4A4741' }}>{fmtDate(p.created_at)}</span>
                              <span className="lc-mono" style={{ fontWeight:700, fontSize:10, letterSpacing:'0.06em' }}>{'PMT-' + p.id.slice(-6).toUpperCase()}</span>
                              <span style={{ minWidth:0, fontSize:13, lineHeight:1.4, color:'#08090B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{invNum} · Order {p.orders?.order_number}</span>
                              <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'#4A4741' }}>{METHOD_LABELS[p.payment_method] || p.payment_method}</span>
                              <span className="lc-mono" style={{ textAlign:'right', fontWeight:700, fontSize:13, letterSpacing:'-0.01em', fontVariantNumeric:'tabular-nums', color: pend ? '#1B5FD0' : '#08090B' }}>{money(p.amount)}</span>
                              {pend ? (
                                <span onClick={e => { e.stopPropagation(); openDoc(p.payment_proof_url) }} className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, background: on ? ACCENT : '#E8F1FF', color: on ? '#08090B' : '#1B5FD0', border:`1px solid ${on ? ACCENT : '#CFE0FB'}`, padding:'8px 9px 9px', fontWeight:700, fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase' }}>View proof<span style={{ fontWeight:400, fontSize:10 }}>→</span></span>
                              ) : (
                                <Link href="/portal/invoices" onClick={e => e.stopPropagation()} className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, background: on ? ACCENT : '#E8F1FF', color: on ? '#08090B' : '#1B5FD0', border:`1px solid ${on ? ACCENT : '#CFE0FB'}`, padding:'8px 9px 9px', fontWeight:700, fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', textDecoration:'none' }}>Invoice<span style={{ fontWeight:400, fontSize:10 }}>↓</span></Link>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap', padding:'10px 15px 12px', background:'#F6F5F2' }}>
                    <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6F6D67' }}>{historyFiltered.length} of {historyAll.length} payments · {money(historyFiltered.reduce((a,p) => a + (p.amount||0), 0))} shown</span>
                    <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6F6D67' }}>Pending proofs are reviewed within one business day</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display:'flex', flexDirection:'column', gap:'clamp(16px,2.4vh,22px)' }}>
            <div style={{ border:'1px solid rgba(8,9,11,0.85)' }}>
              <div className="lc-mono" style={{ padding:'11px 14px 12px', borderBottom:'1px solid #08090B', background:'#F6F5F2', fontWeight:700, fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase' }}>How billing works</div>
              {[
                { n:'01', t:'You place an order', b:'We issue the invoice the same day, with your total and terms.' },
                { n:'02', t:'You send payment', b:'Wire, ACH or card — always with your order number as the reference.' },
                { n:'03', t:'You upload the proof', b:'A screenshot or bank confirmation lets us match it right away.' },
                { n:'04', t:'We release the order', b:'Confirmation within one business day, then it ships or is ready for pickup.' },
              ].map(s => (
                <div key={s.n} style={{ display:'grid', gridTemplateColumns:'22px minmax(0,1fr)', gap:11, alignItems:'start', padding:'12px 14px 13px', borderBottom:'1px solid rgba(8,9,11,0.09)' }}>
                  <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.1em', color: s.n==='01' || s.n==='04' ? '#6F6D67' : ACCENT }}>{s.n}</span>
                  <span>
                    <span style={{ display:'block', fontSize:13.5, letterSpacing:'-0.01em' }}>{s.t}</span>
                    <span style={{ display:'block', paddingTop:4, fontSize:12.5, lineHeight:1.55, color:'#6F6D67' }}>{s.b}</span>
                  </span>
                </div>
              ))}
            </div>

            <div style={{ border:'1px solid rgba(8,9,11,0.85)' }}>
              <div className="lc-mono" style={{ padding:'11px 14px 12px', borderBottom:'1px solid #08090B', background:'#F6F5F2', fontWeight:700, fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase' }}>Payment info</div>
              {[
                { k:'Payment terms', v:'Net 15' },
                { k:'ACH fee', v:'None' },
                { k:'Wire fee', v:'Bank fees may apply' },
                { k:'Sales tax', v:'Resale exempt' },
              ].map(t => (
                <div key={t.k} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, padding:'10px 14px 11px', borderBottom:'1px solid rgba(8,9,11,0.09)' }}>
                  <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>{t.k}</span>
                  <span className="lc-mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', textAlign:'right' }}>{t.v}</span>
                </div>
              ))}
            </div>

            <div style={{ background:'#08090B', color:'#F2EFE6', padding:'15px 15px 17px' }}>
              <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8F8C85' }}>Billing questions</div>
              <div style={{ paddingTop:9, fontSize:15, lineHeight:1.5 }}>Talk to your rep — English or Español, no ticket queue.</div>
              <div style={{ paddingTop:13, display:'flex', flexDirection:'column', gap:8 }}>
                <a href="https://wa.me/17864909005" target="_blank" rel="noreferrer" className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'10px 12px 11px', background:ACCENT, color:'#08090B', fontWeight:700, fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', textDecoration:'none' }}>WhatsApp us <span>→</span></a>
                <a href="mailto:partners@levamcorp.com" className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, padding:'10px 12px 11px', border:'1px solid rgba(242,239,230,0.3)', color:'#F2EFE6', fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', textDecoration:'none' }}>partners@levamcorp.com <span>→</span></a>
              </div>
              <div className="lc-mono" style={{ paddingTop:12, fontSize:8, letterSpacing:'0.16em', lineHeight:1.8, textTransform:'uppercase', color:'#7C7A73' }}>Mon–Fri 9AM–5PM ET<br/>We never ask for card details by email</div>
            </div>
          </div>
        </div>
      </div>

      {openPayment && (() => {
        const p = openPayment
        const order = p.orders
        const invNum = order?.order_number ? (invNumByOrder[order.order_number] || '—') : '—'
        const s = STATUS_CONFIG[p.status] || STATUS_CONFIG.requested
        const fields = [
          { k:'Payment date', v: fmtDate(p.created_at) },
          { k:'Method', v: METHOD_LABELS[p.payment_method] || p.payment_method },
          { k:'Applied to', v: `${invNum} · Order ${order?.order_number}` },
          { k:'Shipping', v: SHIPPING_METHOD_LABELS[p.shipping_method] || p.shipping_method || '—' },
        ]
        return (
          <div role="dialog" aria-modal="true" style={{ position:'fixed', inset:0, zIndex:60, background:'rgba(8,9,11,0.72)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'clamp(14px,4vh,44px) clamp(12px,4vw,40px)', overflowY:'auto' }} onClick={() => setOpenId(null)}>
            <div style={{ width:'100%', maxWidth:620, background:'#FFFFFF', border:'1px solid #08090B' }} onClick={e => e.stopPropagation()}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'12px 16px 13px', background:'#08090B', color:'#F2EFE6' }}>
                <span className="lc-mono" style={{ display:'flex', alignItems:'center', gap:12, fontSize:9.5, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>
                  <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width:16, height:'auto' }}/>
                  Payment · PMT-{p.id.slice(-6).toUpperCase()}
                </span>
                <button type="button" onClick={() => setOpenId(null)} aria-label="Close" className="lc-mono" style={{ border:'1px solid rgba(242,239,230,0.35)', background:'transparent', color:'#F2EFE6', cursor:'pointer', padding:'6px 10px 7px', fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase' }}>Close ✕</button>
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'15px 16px 16px', background:'#F6F5F2', borderBottom:'1px solid rgba(8,9,11,0.2)' }}>
                <span>
                  <span className="lc-mono" style={{ display:'block', fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>Amount</span>
                  <span className="lc-display" style={{ display:'block', paddingTop:5, fontSize:30, fontWeight:400, letterSpacing:'-0.035em', fontVariantNumeric:'tabular-nums' }}>{money(p.amount)}</span>
                </span>
                <span className="lc-mono" style={{ fontSize:9, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', background:s.bg, color:s.color, padding:'7px 11px 8px' }}>{s.label}</span>
              </div>

              {fields.map(f => (
                <div key={f.k} style={{ display:'grid', gridTemplateColumns:'clamp(104px,13vw,140px) minmax(0,1fr)', gap:12, alignItems:'baseline', padding:'11px 16px 12px', borderBottom:'1px solid rgba(8,9,11,0.09)' }}>
                  <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>{f.k}</span>
                  <span className="lc-mono" style={{ fontSize:11, letterSpacing:'0.06em', lineHeight:1.5, color:'#08090B', wordBreak:'break-word' }}>{f.v}</span>
                </div>
              ))}

              <div style={{ display:'flex', gap:9, flexWrap:'wrap', padding:'15px 16px 17px' }}>
                {p.status === 'processing' && p.payment_proof_url && (
                  <button type="button" onClick={() => openDoc(p.payment_proof_url)} className="lc-mono" style={{ flex:'1 1 190px', textAlign:'center', padding:'12px 14px 13px', background:ACCENT, color:'#08090B', fontWeight:700, fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', border:'none', cursor:'pointer' }}>View uploaded proof →</button>
                )}
                <Link href="/portal/invoices" className="lc-mono" style={{ flex:'1 1 170px', textAlign:'center', padding:'12px 14px 13px', border:'1px solid rgba(8,9,11,0.4)', color:'#08090B', fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', textDecoration:'none' }}>View invoice →</Link>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
