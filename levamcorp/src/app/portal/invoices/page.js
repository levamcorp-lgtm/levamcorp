'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const MONO = "'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace"
const DISPLAY = "'Space Grotesk',-apple-system,sans-serif"

const NAV_LINKS = [['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']]
const TABS = ['All', 'Unpaid', 'Paid', 'Cancelled']

// Real company remittance details — the same ones already sent in the order-confirmation email (admin/orders/page.js)
const REMIT = [
  { k: 'Bank', v: 'Bank of America' },
  { k: 'Account name', v: 'Levam Corp' },
  { k: 'Account #', v: '898169098220' },
  { k: 'ACH routing', v: '063100277' },
  { k: 'Wire routing', v: '026009593' },
]

function seededBars(seed, count) {
  let s = seed
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  const out = []
  for (let i = 0; i < count; i++) {
    const r = rnd()
    out.push({ grow: r > 0.82 ? 3 : r > 0.5 ? 2 : 1, h: r > 0.94 ? 18 : 13 })
  }
  return out
}

function PortalNav({ onLogout }) {
  const pathname = usePathname()
  return (
    <nav className="no-print" style={{ position:'sticky', top:0, zIndex:40, background:'#08090B', borderBottom:'1px solid rgba(245,241,232,0.1)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, padding:'12px 2rem', maxWidth:1440, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:32, flexWrap:'wrap' }}>
          <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:30, height:30, border:'1.5px solid rgba(245,241,232,0.35)', borderLeft:'3px solid #2F7DF6', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width:16, height:'auto' }}/>
            </div>
            <div>
              <div className="lc-display" style={{ fontSize:13, fontWeight:700, letterSpacing:'0.16em', color:'#F5F1E8', textTransform:'uppercase', lineHeight:1 }}>LEVAM<span style={{ color:'#2F7DF6' }}>CORP</span></div>
              <div className="lc-mono" style={{ fontSize:7, letterSpacing:'0.2em', color:'#6F6D67', textTransform:'uppercase', marginTop:2 }}>Partner Portal</div>
            </div>
          </Link>
          <div style={{ display:'flex', flexWrap:'wrap', minHeight:60 }}>
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

const SHIPPING_METHOD_LABELS = { pickup: 'Pickup — Doral, FL', prep_center: 'Prep Center Delivery', shipping: 'Standard Shipping', freight: 'Freight / LTL' }

export default function InvoicesPage() {
  const [user, setUser] = useState(null)
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [payments, setPayments] = useState({})

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('All')
  const [hoverId, setHoverId] = useState(null)

  const barcode = useMemo(() => seededBars(20260905, 80), [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)
      const [{ data: ordersData }, { data: clientData }] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').eq('user_id', data.user.id).order('submitted_at', { ascending: false }),
        supabase.from('clients').select('*').eq('email', data.user.email).single(),
      ])
      setOrders(ordersData || [])
      setClient(clientData || null)
      const orderIds = (ordersData || []).map(o => o.id)
      if (orderIds.length) {
        const { data: paymentsData } = await supabase.from('payments').select('*').in('order_id', orderIds)
        const pMap = {}
        ;(paymentsData || []).forEach(p => { pMap[p.order_id] = p })
        setPayments(pMap)
      }
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
  }

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-print-area')
    if (!printContent) return
    const win = window.open('', '_blank', 'width=800,height=900')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${selected?.invNum} - Levam Corp</title>
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

  const fmtDateShort = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const dueDateShort = (date) => { const d = new Date(date); d.setDate(d.getDate() + 15); return fmtDateShort(d) }
  const money = (n) => '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const getInvNum = (order, idx) => {
    const d = new Date(order.submitted_at)
    const year = d.getFullYear()
    const seq = String(idx + 1001).padStart(5, '0')
    return `LC-${year}-${seq}`
  }

  const deliveryFeeFrom = (order) => {
    const m = (order.notes || '').match(/Delivery fee:\s*\$([\d,.]+)/)
    return m ? parseFloat(m[1].replace(/,/g, '')) : 0
  }

  // Ship-to address is only ever captured, as free text, when the client picks Standard Shipping
  // or Freight at checkout (portal/catalog's "Shipping: {method} - {address}" note on the payment row).
  const shipAddressFrom = (payment) => {
    const m = (payment?.notes || '').match(/Shipping:.*? - (.+)$/)
    return m ? m[1].trim() : null
  }

  const invoiceStatus = (order) => order.status === 'completed' ? 'Paid' : order.status === 'cancelled' ? 'Cancelled' : 'Unpaid'
  const grand = (order) => order.total || 0
  const owed = (order) => invoiceStatus(order) === 'Unpaid' ? grand(order) : 0

  const invoices = useMemo(() => orders.map((o, i) => ({ ...o, invNum: getInvNum(o, i) })), [orders])

  const filtered = useMemo(() => {
    let list = invoices
    if (tab !== 'All') list = list.filter(iv => invoiceStatus(iv) === tab)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(iv => {
        const hay = iv.invNum + ' ' + (iv.order_number || '') + ' ' + (iv.order_items || []).map(l => `${l.product_sku || ''} ${l.product_name || ''}`).join(' ')
        return hay.toLowerCase().includes(q)
      })
    }
    return list
  }, [invoices, tab, search])

  const resetFilters = () => { setSearch(''); setTab('All') }

  const billed = invoices.filter(iv => iv.status !== 'cancelled').reduce((a, iv) => a + grand(iv), 0)
  const paidSum = invoices.filter(iv => iv.status === 'completed').reduce((a, iv) => a + grand(iv), 0)
  const owedSum = invoices.reduce((a, iv) => a + owed(iv), 0)
  const owedCount = invoices.filter(iv => invoiceStatus(iv) === 'Unpaid').length
  const cancelledCount = invoices.filter(iv => iv.status === 'cancelled').length
  const billedCount = invoices.length - cancelledCount

  const tabCount = (t) => t === 'All' ? invoices.length : invoices.filter(iv => invoiceStatus(iv) === t).length

  const selected = selectedId ? invoices.find(iv => iv.id === selectedId) : (filtered[0] || null)
  const status = selected ? invoiceStatus(selected) : null
  const isPaid = status === 'Paid'
  const isCancelled = status === 'Cancelled'
  const globalStyle = `
    .lc-display { font-family:${DISPLAY}; letter-spacing:-0.02em; }
    .lc-mono { font-family:${MONO}; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .inv-grid { grid-template-columns: minmax(300px,440px) minmax(0,1fr); }
    @media (max-width: 860px) {
      .inv-grid { grid-template-columns: 1fr !important; }
    }
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

      <div className="no-print" style={{ padding: 'clamp(24px,4vh,40px) 2rem 0' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:11, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
            <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
            Partner portal · Invoices
          </div>
          <div style={{ height:1, background:'rgba(8,9,11,0.16)' }}/>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap:'wrap', gap:20, padding:'clamp(20px,3vh,30px) 0 clamp(16px,2.4vh,24px)' }}>
            <div>
              <h1 className="lc-display" style={{ fontSize:'clamp(26px,3.2vw,36px)', fontWeight:400, letterSpacing:'-0.03em', margin:'0 0 6px', color:'#08090B' }}>Invoices<span style={{ color:'#2F7DF6' }}>.</span></h1>
              <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'#8A8780' }}>{filtered.length} of {invoices.length} invoices · {money(owedSum)} outstanding{cancelledCount ? ' · cancelled not counted as billed' : ''}</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(8,9,11,0.28)', padding: '11px 14px', minWidth: 'min(300px,100%)' }}>
              <span style={{ fontSize: 11, color: '#6F6D67' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Invoice # or order #…" style={{ flex:1, minWidth:0, border:0, background:'transparent', color:'#08090B', fontSize:13.5, outline:'none', fontFamily:'inherit' }}/>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 1, background:'rgba(8,9,11,0.1)', border:'1px solid rgba(8,9,11,0.1)' }}>
            <div style={{ background: owedSum > 0 ? '#2F7DF6' : '#FFFFFF', padding:'13px 14px 15px' }}>
              <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color: owedSum > 0 ? 'rgba(8,9,11,0.62)' : '#6F6D67' }}>You still owe</div>
              <div style={{ paddingTop:7, fontSize:'clamp(23px,2.6vw,31px)', fontWeight:500, letterSpacing:'-0.035em', lineHeight:1, color: owedSum > 0 ? '#08090B' : '#166534' }}>{money(owedSum)}</div>
              <div className="lc-mono" style={{ paddingTop:5, fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color: owedSum > 0 ? 'rgba(8,9,11,0.75)' : '#166534' }}>{owedSum > 0 ? `${owedCount} invoice${owedCount > 1 ? 's' : ''} to pay` : "nothing due — you're clear"}</div>
            </div>
            <div style={{ background:'#FFFFFF', padding:'13px 14px 15px' }}>
              <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>Already paid</div>
              <div style={{ paddingTop:7, fontSize:'clamp(23px,2.6vw,31px)', fontWeight:500, letterSpacing:'-0.035em', lineHeight:1, color:'#08090B' }}>{money(paidSum)}</div>
              <div className="lc-mono" style={{ paddingTop:5, fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#166534' }}>{invoices.filter(iv => iv.status === 'completed').length} invoices settled</div>
            </div>
            <div style={{ background:'#FFFFFF', padding:'13px 14px 15px' }}>
              <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>Total invoiced</div>
              <div style={{ paddingTop:7, fontSize:'clamp(23px,2.6vw,31px)', fontWeight:500, letterSpacing:'-0.035em', lineHeight:1, color:'#08090B' }}>{money(billed)}</div>
              <div className="lc-mono" style={{ paddingTop:5, fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>{billedCount} billed{cancelledCount ? ` · ${cancelledCount} cancelled, not counted` : ''}</div>
            </div>
          </div>

          <div data-scroll style={{ display:'flex', alignItems:'stretch', gap:1, background:'rgba(8,9,11,0.1)', marginTop:'clamp(16px,2.4vh,24px)', overflowX:'auto' }}>
            {TABS.map(t => {
              const on = tab === t
              return (
                <button key={t} onClick={() => { setTab(t); setSelectedId(null) }} className="lc-mono" style={{ flex:'1 0 auto', border:0, cursor:'pointer', whiteSpace:'nowrap', padding:'11px 15px 12px', background: on ? '#08090B' : '#FFFFFF', color: on ? '#F2EFE6' : '#08090B', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase' }}>{t} <span style={{ color: on ? '#2F7DF6' : '#9A968E' }}>{tabCount(t)}</span></button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: 'clamp(16px,2.4vh,22px) 2rem clamp(50px,8vh,90px)' }}>
        <div className={selected ? 'inv-grid' : ''} style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: selected ? undefined : '1fr', gap: 'clamp(16px,2.4vw,26px)', alignItems: 'start' }}>

          <div className="no-print" style={{ border: '1px solid rgba(8,9,11,0.1)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 92px 108px', gap:12, alignItems:'center', padding:'10px 14px 11px', borderBottom:'1px solid #08090B', background:'#F6F5F2' }}>
              {['Invoice','Amount','Status'].map((h, i) => (
                <span key={h} className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67', textAlign: i === 1 ? 'right' : i === 2 ? 'center' : 'left' }}>{h}</span>
              ))}
            </div>

            {filtered.map(iv => {
              const st = invoiceStatus(iv)
              const on = selected?.id === iv.id
              const hov = hoverId === iv.id
              const sColors = st === 'Paid' ? { bg:'#DCFCE7', ink:'#166534', band:'#16A34A' } : st === 'Cancelled' ? { bg:'#F6F5F2', ink:'#6F6D67', band:'#9A968E' } : { bg:'#FEF3C7', ink:'#92400E', band:'#F59E0B' }
              return (
                <div key={iv.id} role="button" tabIndex={0}
                  onClick={() => setSelectedId(iv.id)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(iv.id) } }}
                  onMouseEnter={() => setHoverId(iv.id)} onMouseLeave={() => setHoverId(null)}
                  style={{ position:'relative', display:'grid', gridTemplateColumns:'minmax(0,1fr) 92px 108px', gap:12, alignItems:'center', padding:'13px 14px 14px', cursor:'pointer', borderBottom:'1px solid rgba(8,9,11,0.12)', background: on ? '#EFF6FF' : hov ? '#F7FAFF' : '#FFFFFF' }}>
                  <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background: on ? '#2F7DF6' : sColors.band }}/>
                  <span style={{ minWidth:0 }}>
                    <span className="lc-mono" style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.02em', color:'#08090B' }}>{iv.invNum}</span>
                    <span className="lc-mono" style={{ display:'block', paddingTop:3, fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6F6D67' }}>{fmtDateShort(iv.submitted_at)} · {iv.order_items?.length || 0} product{iv.order_items?.length !== 1 ? 's' : ''}</span>
                    <span className="lc-mono" style={{ display:'block', paddingTop:3, fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', color: st === 'Unpaid' ? '#B45309' : st === 'Cancelled' ? '#9A968E' : '#166534' }}>{st === 'Unpaid' ? `Due ${dueDateShort(iv.submitted_at)}` : st === 'Cancelled' ? 'Void — nothing owed' : 'Paid in full'}</span>
                  </span>
                  <span style={{ textAlign:'right', fontSize:15, fontWeight:500, letterSpacing:'-0.02em', color:'#08090B' }}>{money(grand(iv))}</span>
                  <span style={{ textAlign:'center' }}>
                    <span className="lc-mono" style={{ display:'inline-block', background:sColors.bg, color:sColors.ink, fontSize:8, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', padding:'5px 7px 6px' }}>{st}</span>
                    <span className="lc-mono" style={{ display:'block', paddingTop:5, fontSize:8, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#1B5FD0' }}>{on ? 'Showing' : hov ? 'Open →' : ''}</span>
                  </span>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div style={{ padding: 'clamp(30px,5vh,50px) 18px', textAlign: 'center' }}>
                <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>{invoices.length === 0 ? 'No invoices yet' : 'No invoices match this filter'}</div>
                {invoices.length === 0 ? (
                  <Link href="/portal/catalog" className="lc-mono" style={{ display:'inline-block', marginTop:13, padding:'11px 24px', background:'#08090B', color:'#F2EFE6', fontSize:10.5, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', textDecoration:'none' }}>Browse catalog</Link>
                ) : (
                  <button onClick={resetFilters} className="lc-mono" style={{ marginTop:13, border:'1px solid rgba(8,9,11,0.85)', background:'transparent', cursor:'pointer', padding:'10px 15px', fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#08090B' }}>Clear filters</button>
                )}
              </div>
            )}
          </div>

          {/* INVOICE SUMMARY */}
          {selected && (() => {
            const deliveryFee = deliveryFeeFrom(selected)
            const subtotal = selected.subtotal ?? (selected.total - deliveryFee)
            const units = selected.order_items?.reduce((s, i) => s + i.quantity, 0) || 0
            const dueBg = isPaid ? '#16A34A' : isCancelled ? '#F6F5F2' : '#08090B'
            const dueInk = isCancelled ? '#08090B' : '#FFFFFF'
            const notice = isPaid
              ? { title: 'Payment received', body: 'We received and verified your payment. This order is confirmed — nothing further is owed on this invoice.', bg: '#F0FDF4', ink: '#166534', bar: '#16A34A' }
              : isCancelled
                ? { title: 'Invoice void', body: 'This invoice was cancelled before dispatch and carries no charge. It stays here for your records only.', bg: '#F6F5F2', ink: '#6F6D67', bar: '#9A968E' }
                : { title: 'Payment needed to confirm this order', body: 'This document is a preliminary invoice. Pricing and availability are held pending payment — your order is confirmed and processed only once we receive and verify full payment. Transfer details are below.', bg: '#FFFBEB', ink: '#92400E', bar: '#F59E0B' }

            // Data for the printable full document
            const payment = payments[selected.id]
            const stamp = isPaid ? 'Paid in full' : isCancelled ? 'Cancelled · void' : 'Payment due'
            const stampBg = isPaid ? '#DCFCE7' : isCancelled ? '#FEE2E2' : '#FEF3C7'
            const stampInk = isPaid ? '#166534' : isCancelled ? '#991B1B' : '#92400E'
            const billName = client?.business_name || client?.contact_name || 'Approved Partner'
            const billLine2 = client?.address || ''
            const billTax = [client?.resale_tax_number ? `Resale cert. ${client.resale_tax_number}` : '', client?.ein_number ? `EIN ${client.ein_number}` : ''].filter(Boolean).join(' · ')
            const shipMethod = payment?.shipping_method ? (SHIPPING_METHOD_LABELS[payment.shipping_method] || payment.shipping_method) : null
            const shipAddr = payment?.shipping_method === 'pickup' ? '6315 NW 99th Ave, Doral, FL 33178' : shipAddressFrom(payment)

            return (
              <div style={{ border: '1px solid rgba(8,9,11,0.1)' }}>
                <div className="no-print" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap', padding:'11px clamp(13px,1.8vw,18px) 12px', background:'#08090B', color:'#F2EFE6' }}>
                  <span className="lc-mono" style={{ display:'flex', alignItems:'center', gap:9, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase' }}>
                    <span style={{ display:'inline-block', width:6, height:6, background:'#2F7DF6' }}/>
                    {selected.invNum}
                  </span>
                  <span className="lc-mono" style={{ background: status === 'Paid' ? '#DCFCE7' : status === 'Cancelled' ? '#F6F5F2' : '#FEF3C7', color: status === 'Paid' ? '#166534' : status === 'Cancelled' ? '#6F6D67' : '#92400E', fontWeight:700, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', padding:'4px 8px 5px' }}>{status}</span>
                </div>

                <div className="no-print" style={{ padding:'clamp(14px,2vw,20px) clamp(13px,1.8vw,18px) 0' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:1, background:'rgba(8,9,11,0.1)', border:'1px solid rgba(8,9,11,0.1)' }}>
                    {[
                      ['Invoice date', fmtDateShort(selected.submitted_at), '#08090B'],
                      [isPaid ? 'Payment' : 'Payment due', isPaid ? 'Paid in full' : isCancelled ? 'Cancelled — no charge' : dueDateShort(selected.submitted_at), isPaid ? '#166534' : isCancelled ? '#9A968E' : '#B45309'],
                      ['Terms', 'Net 15', '#08090B'],
                      ['Order', `#${selected.order_number}`, '#1B5FD0'],
                    ].map(([k, v, ink]) => (
                      <div key={k} style={{ background:'#FFFFFF', padding:'9px 10px 10px' }}>
                        <div className="lc-mono" style={{ fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>{k}</div>
                        <div className="lc-mono" style={{ paddingTop:4, fontSize:11, fontWeight:700, letterSpacing:'0.02em', color:ink }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div className="lc-mono" style={{ marginTop:'clamp(14px,2vh,18px)', fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:9, borderBottom:'1px solid rgba(8,9,11,0.85)' }}>What was invoiced · {selected.order_items?.length || 0} products · {units} units</div>
                  {(selected.order_items || []).map((l, i) => (
                    <div key={l.id || i} style={{ display:'grid', gridTemplateColumns:'24px minmax(0,1fr) auto', gap:'6px 11px', alignItems:'baseline', padding:'10px 0 11px', borderBottom:'1px solid rgba(8,9,11,0.1)' }}>
                      <span className="lc-mono" style={{ fontSize:8.5, color:'#9A968E' }}>{String(i + 1).padStart(2, '0')}</span>
                      <span style={{ minWidth:0 }}>
                        <span className="lc-mono" style={{ display:'block', fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#1B5FD0' }}>{l.product_sku || '—'}</span>
                        <span style={{ display:'block', paddingTop:3, fontSize:13, lineHeight:1.42, color:'#08090B' }}>{l.product_name}</span>
                        <span className="lc-mono" style={{ display:'block', paddingTop:3, fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase', color:'#6F6D67' }}>{l.quantity} units × {money(l.unit_price)}</span>
                      </span>
                      <span className="lc-mono" style={{ textAlign:'right', fontSize:12.5, fontWeight:700, color:'#08090B' }}>{money(l.quantity * l.unit_price)}</span>
                    </div>
                  ))}

                  <div style={{ marginTop:'clamp(14px,2vh,18px)' }}>
                    {[
                      ['Subtotal', money(subtotal), '#08090B'],
                      ...(deliveryFee > 0 ? [['Delivery fee', money(deliveryFee), '#08090B']] : []),
                      ['Sales tax · resale exempt', '$0.00', '#6F6D67'],
                    ].map(([k, v, ink]) => (
                      <div key={k} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, padding:'6px 0 7px', borderBottom:'1px solid rgba(8,9,11,0.1)' }}>
                        <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>{k}</span>
                        <span className="lc-mono" style={{ fontSize:12, letterSpacing:'0.03em', color:ink }}>{v}</span>
                      </div>
                    ))}
                    {isCancelled && (
                      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, padding:'6px 0 7px', borderBottom:'1px solid rgba(8,9,11,0.1)' }}>
                        <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#991B1B' }}>Cancelled · voided</span>
                        <span className="lc-mono" style={{ fontSize:12, letterSpacing:'0.03em', color:'#991B1B' }}>− {money(grand(selected))}</span>
                      </div>
                    )}
                    <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, marginTop:10, background:dueBg, padding:'12px 13px 13px' }}>
                      <span className="lc-mono" style={{ fontSize:8.5, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color: isPaid ? 'rgba(255,255,255,0.85)' : isCancelled ? '#6F6D67' : '#8F8C85' }}>{isPaid ? 'Paid in full' : isCancelled ? 'Charged to you' : 'Total due'}</span>
                      <span style={{ fontSize:'clamp(21px,2.4vw,27px)', fontWeight:500, letterSpacing:'-0.03em', color:dueInk }}>{isCancelled ? '$0.00' : money(grand(selected))}</span>
                    </div>
                  </div>

                  <div style={{ marginTop:'clamp(14px,2vh,18px)', borderLeft:`3px solid ${notice.bar}`, background:notice.bg, padding:'10px 13px 11px' }}>
                    <div className="lc-mono" style={{ fontSize:8.5, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:notice.ink }}>{notice.title}</div>
                    <div style={{ paddingTop:4, fontSize:13, lineHeight:1.55, color:'#3F3D39' }}>{notice.body}</div>
                  </div>

                  {status === 'Unpaid' && (
                    <div style={{ marginTop:'clamp(14px,2vh,18px)', border:'1px solid rgba(8,9,11,0.85)' }}>
                      <div className="lc-mono" style={{ background:'#08090B', color:'#F2EFE6', padding:'9px 12px 10px', fontSize:8.5, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase' }}>How to pay this invoice</div>
                      <div style={{ padding:'10px 12px 11px' }}>
                        {REMIT.map(r => (
                          <div key={r.k} style={{ display:'grid', gridTemplateColumns:'clamp(84px,10vw,108px) 1fr', gap:10, padding:'4px 0 5px' }}>
                            <span className="lc-mono" style={{ fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>{r.k}</span>
                            <span className="lc-mono" style={{ fontSize:11, letterSpacing:'0.03em', color:'#08090B', wordBreak:'break-word' }}>{r.v}</span>
                          </div>
                        ))}
                        <div className="lc-mono" style={{ marginTop:8, paddingTop:8, borderTop:'1px solid rgba(8,9,11,0.14)', fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#1B5FD0' }}>Put {selected.invNum} in the transfer reference</div>
                      </div>
                    </div>
                  )}

                  <div className="no-print" style={{ display:'flex', gap:8, flexWrap:'wrap', margin:'clamp(14px,2vh,18px) 0' }}>
                    <button onClick={handlePrint} className="lc-mono" style={{ flex:1, minWidth:150, textAlign:'center', background:'#2F7DF6', color:'#08090B', fontWeight:700, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', padding:'14px 14px', border:'none', cursor:'pointer' }}>↓ Download PDF</button>
                    <Link href="/portal/orders" className="lc-mono" style={{ flex:1, minWidth:130, textAlign:'center', border:'1px solid #08090B', color:'#08090B', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', padding:'14px 12px', textDecoration:'none' }}>See order</Link>
                    <a href="https://wa.me/17864909005" target="_blank" rel="noopener noreferrer" className="lc-mono" style={{ flex:1, minWidth:130, textAlign:'center', border:'1px solid #08090B', color:'#08090B', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', padding:'14px 12px', textDecoration:'none' }}>Ask your rep</a>
                  </div>
                </div>

                <div className="no-print" style={{ boxSizing:'border-box', display:'flex', alignItems:'flex-end', gap:2, height:28, padding:'8px clamp(13px,1.8vw,18px)', overflow:'hidden', borderTop:'1px solid rgba(8,9,11,0.1)' }}>
                  {barcode.map((b, bi) => <div key={bi} style={{ flex:`${b.grow} 1 0`, minWidth:1, height:b.h, background:'#08090B', opacity:0.8 }}/>)}
                </div>
                <div className="no-print lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'0 clamp(13px,1.8vw,18px) 12px', fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>
                  <span>{selected.invNum} · {fmtDateShort(selected.submitted_at)}</span>
                  <span>levamcorp.com</span>
                </div>

                {/* PRINTABLE FULL INVOICE — hidden on screen, only used by handlePrint (raw innerHTML, no className) */}
                <div id="invoice-print-area" style={{ display: 'none', background: '#fff', color: '#08090B', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize: 13, lineHeight: 1.4, padding: 40 }}>

                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, paddingBottom: 12, borderBottom: '1px solid rgba(8,9,11,0.45)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <img src="https://www.levamcorp.com/levamcorp-logo_1.png" alt="Levam Corp Distributors" style={{ display: 'block', width: 85, height: 'auto', objectFit: 'contain' }} />
                      <div style={{ paddingTop: 3, fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', lineHeight: 1.85, color: '#4A4741' }}>
                        6315 NW 99th Ave, Doral, FL 33178<br />
                        partners@levamcorp.com · (786) 878-4122<br />
                        levamcorp.com
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flex: 'none' }}>
                      <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1 }}>Invoice</div>
                      <div style={{ paddingTop: 7, fontFamily: MONO, fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', color: '#1B5FD0' }}>{selected.invNum}</div>
                      <div style={{ display: 'inline-block', marginTop: 8, background: stampBg, color: stampInk, fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 9px 5px' }}>{stamp}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 21, marginTop: 12, paddingBottom: 12, borderBottom: '1px solid rgba(8,9,11,0.14)' }}>
                    {[
                      ['Invoice date', fmtDateShort(selected.submitted_at), '#08090B'],
                      [isPaid ? 'Payment' : 'Payment due', isPaid ? 'Paid in full' : isCancelled ? 'Cancelled — no charge' : dueDateShort(selected.submitted_at), isPaid ? '#166534' : isCancelled ? '#6F6D67' : '#B45309'],
                      ['Terms', 'Net 15', '#08090B'],
                      ['Order ref', selected.order_number, '#1B5FD0'],
                    ].map(([k, v, ink]) => (
                      <div key={k}>
                        <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6F6D67' }}>{k}</div>
                        <div style={{ paddingTop: 4, fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', color: ink }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 15 }}>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6F6D67', paddingBottom: 7 }}>Bill to</div>
                      <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>{billName}</div>
                      <div style={{ paddingTop: 4, fontSize: 12, lineHeight: 1.55, color: '#4A4741' }}>{billLine2 && <>{billLine2}<br /></>}{user?.email}</div>
                      {billTax && <div style={{ paddingTop: 5, fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6F6D67' }}>{billTax}</div>}
                    </div>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6F6D67', paddingBottom: 7 }}>Ship to</div>
                      <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>{billName}</div>
                      <div style={{ paddingTop: 4, fontSize: 12, lineHeight: 1.55, color: '#4A4741' }}>{shipAddr || (shipMethod ? 'Coordinated directly with Levam Corp' : '—')}</div>
                      {shipMethod && <div style={{ paddingTop: 5, fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6F6D67' }}>{shipMethod}</div>}
                    </div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 19 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(8,9,11,0.45)' }}>
                        {['#', 'Description', 'SKU', 'Qty', 'Unit', 'Amount'].map((h, i) => (
                          <th key={h} style={{ textAlign: i >= 3 ? 'right' : 'left', padding: i === 0 ? '7px 8px 8px 0' : '7px 8px 8px', fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6F6D67' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.order_items?.map((item, i) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(8,9,11,0.1)' }}>
                          <td style={{ padding: '9px 8px 10px 0', verticalAlign: 'top', fontFamily: MONO, fontSize: 11, color: '#9A968E' }}>{String(i + 1).padStart(2, '0')}</td>
                          <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', fontSize: 13, lineHeight: 1.4, letterSpacing: '-0.005em' }}>{item.product_name}</td>
                          <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', fontFamily: MONO, fontSize: 11, letterSpacing: '0.04em', color: '#1B5FD0' }}>{item.product_sku || '—'}</td>
                          <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', textAlign: 'right', fontFamily: MONO, fontSize: 12 }}>{item.quantity.toLocaleString('en-US')}</td>
                          <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', textAlign: 'right', fontFamily: MONO, fontSize: 12 }}>{money(item.unit_price)}</td>
                          <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', textAlign: 'right', fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>{money(item.quantity * item.unit_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ display: 'grid', gridTemplateColumns: status === 'Unpaid' ? '1fr 285px' : '285px', justifyContent: status === 'Unpaid' ? 'stretch' : 'end', gap: 24, marginTop: 13 }}>
                    {status === 'Unpaid' && (
                      <div>
                        <div style={{ paddingBottom: 8, borderBottom: '1px solid rgba(8,9,11,0.14)', fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6F6D67' }}>Remit payment to</div>
                        <div style={{ paddingTop: 9 }}>
                          {REMIT.map(r => (
                            <div key={r.k} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10, padding: '3px 0' }}>
                              <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6F6D67' }}>{r.k}</span>
                              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.04em', color: '#08090B' }}>{r.v}</span>
                            </div>
                          ))}
                          <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1B5FD0' }}>Reference {selected.invNum} on your transfer</div>
                        </div>
                      </div>
                    )}
                    <div>
                      {[
                        ['Subtotal', money(subtotal), '#08090B', '#6F6D67'],
                        ...(deliveryFee > 0 ? [['Delivery fee', money(deliveryFee), '#08090B', '#6F6D67']] : []),
                        ['Sales tax · resale exempt', '$0.00', '#6F6D67', '#6F6D67'],
                      ].map(([k, v, ink, meta]) => (
                        <div key={k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '4px 0 5px', borderBottom: '1px solid rgba(8,9,11,0.12)' }}>
                          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: meta }}>{k}</span>
                          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.02em', color: ink }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 7, background: dueBg, padding: '8px 13px 9px' }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: isPaid ? 'rgba(255,255,255,0.85)' : isCancelled ? '#6F6D67' : '#8F8C85' }}>{isPaid ? 'Paid in full' : isCancelled ? 'Charged' : 'Total due'}</span>
                        <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.03em', color: dueInk }}>{isCancelled ? '$0.00' : money(grand(selected))}</span>
                      </div>
                      <div style={{ paddingTop: 5, textAlign: 'right', fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: isPaid ? '#166534' : isCancelled ? '#991B1B' : '#B45309' }}>
                        {isPaid ? 'Payment received' : isCancelled ? 'Voided before dispatch — nothing owed' : `Due by ${dueDateShort(selected.submitted_at)} · Net 15`}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 19, borderLeft: `2px solid ${notice.bar}`, padding: '1px 0 2px 12px' }}>
                    <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: notice.ink }}>{notice.title}</div>
                    <div style={{ paddingTop: 4, fontSize: 11.5, lineHeight: 1.5, color: '#3F3D39' }}>{notice.body}</div>
                  </div>

                  <div style={{ marginTop: 21, paddingTop: 9, borderTop: '1px solid rgba(8,9,11,0.14)' }}>
                    <div style={{ fontFamily: MONO, fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6F6D67', paddingBottom: 7 }}>Terms &amp; conditions</div>
                    <div style={{ fontSize: 9.5, lineHeight: 1.55, color: '#6F6D67' }}>All sales are final — no returns, exchanges, refunds or cancellations once payment is confirmed. Damaged or defective goods must be reported to partners@levamcorp.com within 48 hours of delivery with photographic evidence. Title passes to buyer on dispatch from Doral, FL. Buyer certifies goods are purchased for resale under a valid resale certificate. Late payments accrue 1.5% monthly interest. Governed by Florida law; venue Miami-Dade County.</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 37, marginTop: 15 }}>
                    <div>
                      <div style={{ height: 25, borderBottom: '1px solid #08090B' }} />
                      <div style={{ paddingTop: 5, fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6F6D67' }}>Authorized · Levam Corp Distributors</div>
                    </div>
                    <div>
                      <div style={{ height: 25, borderBottom: '1px solid #08090B' }} />
                      <div style={{ paddingTop: 5, fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6F6D67' }}>Accepted · {billName}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 21, marginTop: 21, paddingTop: 8, borderTop: '1px solid rgba(8,9,11,0.14)', fontFamily: MONO, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6F6D67' }}>
                    <span>Levam Corp Distributors · {selected.invNum} · {fmtDateShort(selected.submitted_at)}</span>
                    <span>levamcorp.com</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
