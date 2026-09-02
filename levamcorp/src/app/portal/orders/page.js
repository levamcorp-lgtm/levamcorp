'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const NAV_LINKS = [['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']]
const ACCENT = '#2F7DF6'

const TABS = ['All', 'Open', 'In review', 'Confirmed', 'Dispatched', 'Completed', 'Cancelled']
const TAB_TO_STATUS = { 'In review': 'review', 'Confirmed': 'confirmed', 'Dispatched': 'dispatched', 'Completed': 'completed', 'Cancelled': 'cancelled' }

const STATUS_CONFIG = {
  new:        { label: 'Received',   step: 0, desc: 'Your order has been received and is pending review.',              bg: '#EFF6FF', ink: '#1E40AF', band: '#2F7DF6' },
  review:     { label: 'In review',  step: 1, desc: 'Our team is reviewing your order.',                                 bg: '#FFFBEB', ink: '#92400E', band: '#B98A54' },
  confirmed:  { label: 'Confirmed',  step: 2, desc: 'Order confirmed! Please upload your BOL and shipping labels below.', bg: '#E0E7FF', ink: '#3730A3', band: '#6366F1' },
  dispatched: { label: 'Dispatched', step: 3, desc: "Your order is on its way!",                                         bg: '#DBEAFE', ink: '#1E40AF', band: '#12B76A' },
  completed:  { label: 'Completed',  step: 4, desc: 'Order delivered successfully. Thank you!',                          bg: '#DCFCE7', ink: '#166534', band: '#12B76A' },
  cancelled:  { label: 'Cancelled',  step: -1, desc: 'This order has been cancelled.',                                   bg: '#FEE2E2', ink: '#991B1B', band: '#E74C3C' },
}
const STAGES = ['Received', 'In review', 'Confirmed', 'Dispatched', 'Completed']

const PAY_STATUS = {
  requested:  { label: 'Awaiting payment', ink: '#B45309' },
  processing: { label: 'Proof submitted',  ink: '#1D4ED8' },
  paid:       { label: 'Paid',             ink: '#166534' },
}
const PAYMENT_METHOD_LABELS = { credit_card: 'Credit Card', debit_card: 'Debit Card', ach: 'ACH Transfer', wire: 'Wire Transfer' }
const SHIPPING_METHOD_LABELS = { pickup: 'Pickup — Doral, FL', prep_center: 'Prep Center Delivery', shipping: 'Standard Shipping', freight: 'Freight / LTL' }

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase()
}

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

function PortalNav({ user, displayName, onExport, onLogout }) {
  const pathname = usePathname()
  return (
    <nav style={{ position:'sticky', top:0, zIndex:40, background:'#08090B', borderBottom:'1px solid rgba(245,241,232,0.1)' }}>
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
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <button onClick={onExport} className="lc-mono" style={{ display:'flex', alignItems:'center', gap:7, fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', color:'#8A8780', padding:'8px 14px', border:'1px solid rgba(245,241,232,0.18)', background:'transparent', cursor:'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <Link href="/portal/catalog" className="lc-mono" style={{ fontSize:9.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#08090B', padding:'9px 16px', background:'#2F7DF6', textDecoration:'none' }}>New order →</Link>
          <span style={{ display:'flex', alignItems:'center', gap:9 }}>
            <span className="lc-mono" style={{ display:'grid', placeItems:'center', width:28, height:28, background:'#2F7DF6', color:'#08090B', fontWeight:700, fontSize:11 }}>{initials(displayName)}</span>
          </span>
          <button onClick={onLogout} className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#8A8780', border:'1px solid rgba(245,241,232,0.18)', padding:'8px 14px', background:'transparent', cursor:'pointer' }}>Sign out</button>
        </div>
      </div>
    </nav>
  )
}

export default function OrdersPage() {
  const [user, setUser] = useState(null)
  const [client, setClient] = useState(null)
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState({})
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState({})
  const [uploaded, setUploaded] = useState({})

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('All')
  const [hoverId, setHoverId] = useState(null)
  const [openIdx, setOpenIdx] = useState(-1)

  const barcode = useMemo(() => seededBars(20260903, 96), [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      setUser(data.user)
      const [{ data: ordersData }, { data: clientData }] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').or(`user_id.eq.${data.user.id},notes.ilike.%${data.user.email}%`).order('submitted_at', { ascending: false }),
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

  const displayName = client?.contact_name || user?.email?.split('@')[0] || 'Partner'

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/portal' }

  const uploadDoc = async (orderId, file, type) => {
    if (!file) return
    const key = `${orderId}-${type}`
    setUploading(prev => ({ ...prev, [key]: true }))
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${type}/${orderId}-${Date.now()}.${ext}`
      await supabase.storage.from('Documents').upload(path, file, { contentType: file.type, upsert: true })
      const field = type === 'bol' ? 'bol_url' : 'labels_url'
      await supabase.from('orders').update({ [field]: path }).eq('id', orderId)
      setUploaded(prev => ({ ...prev, [key]: true }))
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: path } : o))
    } catch (e) { alert('Upload failed. Please try again.') }
    setUploading(prev => ({ ...prev, [key]: false }))
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtDateLong = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const money = (n) => '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const units = (o) => (o.order_items || []).reduce((s, i) => s + (i.quantity || 0), 0)
  const deliveryFeeFrom = (o) => {
    const m = (o.notes || '').match(/Delivery fee:\s*\$([\d,.]+)/)
    return m ? parseFloat(m[1].replace(/,/g, '')) : 0
  }

  const openOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status))
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0)
  const stillOwe = orders.reduce((s, o) => { const p = payments[o.id]; return s + (p && p.status === 'requested' ? (p.amount || 0) : 0) }, 0)

  const tabCount = (t) => {
    if (t === 'All') return orders.length
    if (t === 'Open') return openOrders.length
    return orders.filter(o => o.status === TAB_TO_STATUS[t]).length
  }

  const filtered = useMemo(() => {
    let list = orders
    if (tab === 'Open') list = list.filter(o => !['completed', 'cancelled'].includes(o.status))
    else if (tab !== 'All') list = list.filter(o => o.status === TAB_TO_STATUS[tab])
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(o => {
        const hay = (o.order_number || '') + ' ' + (o.order_items || []).map(i => `${i.product_sku || ''} ${i.product_name || ''}`).join(' ')
        return hay.toLowerCase().includes(q)
      })
    }
    return list
  }, [orders, tab, search])

  const resetFilters = () => { setSearch(''); setTab('All') }

  const downloadCSV = () => {
    if (!orders.length) return
    const headers = ['Order #', 'Date', 'Status', 'Products', 'Units', 'Total']
    const rows = orders.map(o => [
      o.order_number || '',
      fmtDate(o.submitted_at),
      (STATUS_CONFIG[o.status] || {}).label || o.status,
      (o.order_items || []).map(i => `${i.product_name} x${i.quantity}`).join('; '),
      units(o),
      o.total ? o.total.toFixed(2) : '',
    ])
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Levam-Corp-Orders-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Order-record modal
  const openAt = (i) => setOpenIdx(i)
  const closeModal = () => setOpenIdx(-1)
  const stepModal = (d) => {
    if (!filtered.length) return
    setOpenIdx((openIdx + d + filtered.length) % filtered.length)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (openIdx < 0) return
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') stepModal(1)
      if (e.key === 'ArrowLeft') stepModal(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIdx, filtered])

  useEffect(() => {
    document.body.style.overflow = openIdx >= 0 ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [openIdx])

  const order = openIdx >= 0 ? filtered[openIdx] : null
  const payment = order ? payments[order.id] : null

  const globalStyle = `
    .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }
    .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
    @keyframes spin { to{transform:rotate(360deg)} }
  `

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{globalStyle}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(8,9,11,0.12)', borderTop:'2px solid #2F7DF6', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 0.7s linear infinite' }}/>
        <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A8780' }}>Loading orders…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color:'#08090B', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>
      <style>{globalStyle}</style>

      <PortalNav user={user} displayName={displayName} onExport={downloadCSV} onLogout={handleLogout}/>

      <div style={{ padding: 'clamp(24px,4vh,40px) 2rem 0' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:11, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
            <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
            Partner portal · My orders
          </div>
          <div style={{ height:1, background:'rgba(8,9,11,0.16)' }}/>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap:'wrap', gap:20, padding:'clamp(20px,3vh,30px) 0 clamp(16px,2.4vh,24px)' }}>
            <div>
              <h1 className="lc-display" style={{ fontSize:'clamp(26px,3.2vw,36px)', fontWeight:400, letterSpacing:'-0.03em', margin:'0 0 6px', color:'#08090B' }}>My orders<span style={{ color:'#2F7DF6' }}>.</span></h1>
              <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'#8A8780' }}>Showing {filtered.length} of {orders.length} orders · {money(totalSpent)} lifetime</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(8,9,11,0.28)', padding: '11px 14px', minWidth: 'min(300px,100%)' }}>
              <span style={{ fontSize: 11, color: '#6F6D67' }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Order #, product or SKU…" style={{ flex:1, minWidth:0, border:0, background:'transparent', color:'#08090B', fontSize:13.5, outline:'none', fontFamily:'inherit' }}/>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 1, background:'rgba(8,9,11,0.1)', border:'1px solid rgba(8,9,11,0.1)' }}>
            <div style={{ background:'#2F7DF6', padding:'13px 14px 15px' }}>
              <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(8,9,11,0.62)' }}>Orders in progress</div>
              <div style={{ paddingTop:7, fontSize:'clamp(23px,2.6vw,31px)', fontWeight:500, letterSpacing:'-0.035em', lineHeight:1, color:'#08090B' }}>{openOrders.length}</div>
              <div className="lc-mono" style={{ paddingTop:5, fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(8,9,11,0.72)' }}>we&rsquo;re working on these</div>
            </div>
            <div style={{ background: stillOwe > 0 ? '#FFFBEB' : '#FFFFFF', padding:'13px 14px 15px' }}>
              <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>You still owe</div>
              <div style={{ paddingTop:7, fontSize:'clamp(23px,2.6vw,31px)', fontWeight:500, letterSpacing:'-0.035em', lineHeight:1, color: stillOwe > 0 ? '#B45309' : '#166534' }}>{money(stillOwe)}</div>
              <div className="lc-mono" style={{ paddingTop:5, fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color: stillOwe > 0 ? '#B45309' : '#166534' }}>{stillOwe > 0 ? 'awaiting payment' : "nothing due — you're clear"}</div>
            </div>
            <div style={{ background:'#FFFFFF', padding:'13px 14px 15px' }}>
              <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>Total you&rsquo;ve spent</div>
              <div style={{ paddingTop:7, fontSize:'clamp(23px,2.6vw,31px)', fontWeight:500, letterSpacing:'-0.035em', lineHeight:1, color:'#08090B' }}>{money(totalSpent)}</div>
              <div className="lc-mono" style={{ paddingTop:5, fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>across {orders.length} order{orders.length !== 1 ? 's' : ''}</div>
            </div>
          </div>

          <div data-scroll style={{ display:'flex', alignItems:'stretch', gap:1, background:'rgba(8,9,11,0.1)', marginTop:'clamp(16px,2.4vh,24px)', overflowX:'auto' }}>
            {TABS.map(t => {
              const on = tab === t
              return (
                <button key={t} onClick={() => setTab(t)} className="lc-mono" style={{ flex:'1 0 auto', border:0, cursor:'pointer', whiteSpace:'nowrap', padding:'11px 15px 12px', background: on ? '#08090B' : '#FFFFFF', color: on ? '#F2EFE6' : '#08090B', fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase' }}>{t} <span style={{ color: on ? '#2F7DF6' : '#9A968E' }}>{tabCount(t)}</span></button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: 'clamp(16px,2.4vh,22px) 2rem clamp(50px,8vh,90px)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', border: '1px solid rgba(8,9,11,0.1)' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 'clamp(34px,6vh,60px) 20px', textAlign: 'center' }}>
              <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>No orders match this filter</div>
              <button onClick={resetFilters} className="lc-mono" style={{ marginTop:14, border:'1px solid rgba(8,9,11,0.85)', background:'transparent', cursor:'pointer', padding:'10px 15px', fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#08090B' }}>Clear filters</button>
            </div>
          ) : (
            <div data-scroll style={{ overflowX:'auto' }}>
              <div style={{ minWidth: 1020 }}>
                <div style={{ display:'grid', gridTemplateColumns:'158px 92px minmax(0,1fr) 68px 104px 130px 122px', gap:12, alignItems:'center', padding:'10px 15px 11px', borderBottom:'1px solid #08090B', background:'#F6F5F2' }}>
                  {['Order','Date','Products','Units','Total','Status & payment','Details'].map((h, i) => (
                    <span key={h} className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67', textAlign: i === 3 ? 'right' : i === 6 ? 'center' : 'left' }}>{h}</span>
                  ))}
                </div>

                {filtered.map((o, i) => {
                  const s = STATUS_CONFIG[o.status] || STATUS_CONFIG.new
                  const on = hoverId === o.id
                  const p = payments[o.id]
                  const payLabel = p ? (PAY_STATUS[p.status]?.label || p.status) : (o.status === 'cancelled' ? '—' : 'No request yet')
                  const payInk = p ? (PAY_STATUS[p.status]?.ink || '#6F6D67') : '#9A968E'
                  const lead = o.order_items?.[0]?.product_name || '—'
                  const extra = (o.order_items?.length || 0) - 1

                  return (
                    <div key={o.id} role="button" tabIndex={0}
                      onClick={() => openAt(i)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(i) } }}
                      onMouseEnter={() => setHoverId(o.id)} onMouseLeave={() => setHoverId(null)}
                      style={{ position:'relative', display:'grid', gridTemplateColumns:'158px 92px minmax(0,1fr) 68px 104px 130px 122px', gap:12, alignItems:'center', padding:'14px 15px 15px', cursor:'pointer', borderBottom:'1px solid rgba(8,9,11,0.12)', background: on ? '#F7FAFF' : '#FFFFFF' }}>
                      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background: on ? '#2F7DF6' : s.band }}/>

                      <span style={{ minWidth:0 }}>
                        <span className="lc-mono" style={{ display:'block', fontSize:12, fontWeight:700, letterSpacing:'0.02em', color:'#08090B' }}>#{o.order_number}</span>
                        <span className="lc-mono" style={{ display:'block', paddingTop:3, fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#1B5FD0' }}>{on ? 'Click to open →' : ''}</span>
                      </span>

                      <span className="lc-mono" style={{ fontSize:11, letterSpacing:'0.04em', color:'#3F3D39' }}>{fmtDate(o.submitted_at)}</span>

                      <span style={{ minWidth:0 }}>
                        <span style={{ display:'block', fontSize:13.5, lineHeight:1.38, color:'#08090B', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{lead}</span>
                        <span className="lc-mono" style={{ display:'block', paddingTop:3, fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>{extra > 0 ? `and ${extra} more product${extra > 1 ? 's' : ''}` : ''}</span>
                      </span>

                      <span className="lc-mono" style={{ textAlign:'right', fontSize:12, color:'#3F3D39' }}>{units(o)}</span>

                      <span style={{ textAlign:'right', fontSize:16, fontWeight:500, letterSpacing:'-0.02em', color:'#08090B' }}>{money(o.total)}</span>

                      <span style={{ minWidth:0 }}>
                        <span className="lc-mono" style={{ display:'inline-block', background:s.bg, color:s.ink, fontSize:8.5, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', padding:'5px 8px 6px' }}>{s.label}</span>
                        <span className="lc-mono" style={{ display:'block', paddingTop:5, fontSize:8, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:payInk }}>{payLabel}</span>
                      </span>

                      <span className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, background: on ? '#2F7DF6' : '#EFF6FF', border:`1px solid ${on ? '#2F7DF6' : 'rgba(43,127,255,0.45)'}`, padding:'9px 10px', fontWeight:700, fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', color: on ? '#08090B' : '#1B5FD0' }}>
                        View details <span style={{ fontWeight:400, fontSize:10 }}>→</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORDER RECORD MODAL */}
      {openIdx >= 0 && order && (() => {
        const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.new
        const cancelled = order.status === 'cancelled'
        const reached = cancelled ? 1 : s.step + 1
        const hasShipmentInfo = order.shipment_weight || order.shipment_pallets || order.shipment_dimensions
        const hasBol = order.bol_url || uploaded[`${order.id}-bol`]
        const hasLabels = order.labels_url || uploaded[`${order.id}-labels`]
        const deliveryFee = deliveryFeeFrom(order)
        const subtotal = order.subtotal ?? (order.total - deliveryFee)
        const noticeInfo = cancelled
          ? { title: 'Order cancelled', bg: '#FDF2F2', ink: '#991B1B', bar: '#DC2626' }
          : (order.status === 'review' || order.status === 'dispatched')
            ? { title: order.status === 'review' ? 'Awaiting confirmation' : 'In transit', bg: order.status === 'review' ? '#FFFBEB' : '#EFF6FF', ink: order.status === 'review' ? '#92400E' : '#1E40AF', bar: order.status === 'review' ? '#F59E0B' : '#2F7DF6' }
            : null
        const reorderText = `Hi! I'd like to reorder items from order #${order.order_number}: ` + (order.order_items || []).map(i => `${i.product_name} x${i.quantity}`).join(', ')

        return (
          <div style={{ position:'fixed', inset:0, zIndex:20000, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(8px,2.4vh,30px) clamp(8px,3vw,30px)' }}>
            <div onClick={closeModal} style={{ position:'absolute', inset:0, background:'rgba(8,9,11,0.62)' }}/>
            <div role="dialog" aria-modal="true" style={{ position:'relative', width:'100%', maxWidth:1120, maxHeight:'100%', display:'flex', flexDirection:'column', background:'#FFFFFF', border:'1px solid #08090B', boxShadow:'0 40px 90px -30px rgba(8,9,11,0.7)' }}>

              <div className="lc-mono" style={{ flex:'none', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'12px clamp(14px,2.4vw,26px)', background:'#08090B', color:'#F2EFE6', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase' }}>
                <span style={{ display:'flex', alignItems:'center', gap:9, flexWrap:'wrap' }}>
                  <span style={{ display:'inline-block', width:11, height:11, border:'1px solid rgba(242,239,230,0.6)', borderLeft:'3px solid #2F7DF6' }}/>
                  Order record · #{order.order_number}
                  <span style={{ background:s.bg, color:s.ink, fontWeight:700, padding:'4px 8px 5px' }}>{s.label}</span>
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <span style={{ color:'#8F8C85' }}>Order {openIdx + 1} of {filtered.length}</span>
                  <button onClick={() => stepModal(-1)} style={{ border:'1px solid rgba(242,239,230,0.3)', background:'transparent', cursor:'pointer', padding:'6px 10px', color:'#F2EFE6', fontFamily:'inherit', fontSize:10 }}>←</button>
                  <button onClick={() => stepModal(1)} style={{ border:'1px solid rgba(242,239,230,0.3)', background:'transparent', cursor:'pointer', padding:'6px 10px', color:'#F2EFE6', fontFamily:'inherit', fontSize:10 }}>→</button>
                  <button onClick={closeModal} aria-label="Close" style={{ border:0, background:'#2F7DF6', cursor:'pointer', padding:'7px 12px', color:'#08090B', fontFamily:'inherit', fontWeight:700, fontSize:10, letterSpacing:'0.16em' }}>Close ✕</button>
                </span>
              </div>

              <div data-scroll style={{ flex:1, minHeight:0, overflowY:'auto' }}>

                <div style={{ padding:'clamp(16px,2.4vw,26px) clamp(14px,2.4vw,26px) 0' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap', paddingBottom:14 }}>
                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>Placed {fmtDateLong(order.submitted_at)} at {fmtTime(order.submitted_at)} · {order.order_items?.length || 0} SKU · {units(order)} units</div>
                  </div>

                  <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:9 }}>Where your order is right now</div>
                  <div style={{ display:'flex', gap:1, background:'rgba(8,9,11,0.1)', border:'1px solid rgba(8,9,11,0.1)' }}>
                    {STAGES.map((stage, i) => {
                      const dead = cancelled && i >= 1
                      const done = cancelled ? i === 0 : i < reached - 1
                      const now = i === reached - 1 && !cancelled
                      const bg = dead ? '#DC2626' : done ? '#16A34A' : now ? '#2F7DF6' : '#F6F5F2'
                      const ink = dead || done ? '#FFFFFF' : now ? '#08090B' : '#9A968E'
                      return (
                        <div key={stage} style={{ flex:1, background:bg, padding:'13px 11px 14px', textAlign:'center' }}>
                          <div style={{ fontSize:17, lineHeight:1, color:ink }}>{dead ? '✕' : done ? '✓' : now ? '◆' : '○'}</div>
                          <div style={{ paddingTop:9, fontSize:13.5, fontWeight:500, letterSpacing:'-0.01em', color:ink }}>{stage}</div>
                          <div className="lc-mono" style={{ paddingTop:5, fontSize:8.5, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color: dead || done ? 'rgba(255,255,255,0.85)' : now ? 'rgba(8,9,11,0.7)' : '#9A968E' }}>{dead ? 'Cancelled' : done ? 'Done' : now ? 'You are here' : 'Not yet'}</div>
                        </div>
                      )
                    })}
                  </div>

                  {noticeInfo && (
                    <div style={{ marginTop:14, borderLeft:`3px solid ${noticeInfo.bar}`, background:noticeInfo.bg, padding:'11px 14px 12px' }}>
                      <div className="lc-mono" style={{ fontSize:8.5, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:noticeInfo.ink }}>{noticeInfo.title}</div>
                      <div style={{ paddingTop:5, fontSize:13.5, lineHeight:1.55, color:'#3F3D39' }}>{s.desc}</div>
                    </div>
                  )}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap:1, background:'rgba(8,9,11,0.1)', margin:'clamp(16px,2.4vw,26px)', border:'1px solid rgba(8,9,11,0.1)' }}>

                  <div style={{ background:'#FFFFFF', padding:'clamp(13px,2vw,18px)' }}>
                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:11, borderBottom:'1px solid rgba(8,9,11,0.85)' }}>What you ordered · {order.order_items?.length || 0} products · {units(order)} units</div>
                    {(order.order_items || []).map((it, i) => (
                      <div key={it.id || i} style={{ display:'grid', gridTemplateColumns:'26px minmax(0,1fr) auto', gap:'6px 12px', alignItems:'baseline', padding:'11px 0 12px', borderBottom:'1px solid rgba(8,9,11,0.1)' }}>
                        <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.1em', color:'#9A968E' }}>{String(i + 1).padStart(2, '0')}</span>
                        <span style={{ minWidth:0 }}>
                          <span className="lc-mono" style={{ display:'block', fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'#1B5FD0' }}>{it.product_sku || '—'}</span>
                          <span style={{ display:'block', paddingTop:4, fontSize:13.5, lineHeight:1.45, color:'#08090B' }}>{it.product_name}</span>
                          <span className="lc-mono" style={{ display:'block', paddingTop:4, fontSize:8.5, letterSpacing:'0.12em', textTransform:'uppercase', color:'#6F6D67' }}>{it.quantity} units × {money(it.unit_price)}</span>
                        </span>
                        <span className="lc-mono" style={{ textAlign:'right', fontSize:13, fontWeight:700, color:'#08090B' }}>{money(it.quantity * it.unit_price)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background:'#FFFFFF', padding:'clamp(13px,2vw,18px)' }}>
                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:11, borderBottom:'1px solid rgba(8,9,11,0.85)' }}>Shipment details</div>
                    {[
                      ['Method', payment?.shipping_method ? SHIPPING_METHOD_LABELS[payment.shipping_method] || payment.shipping_method : '—'],
                      ['Ships from', 'Doral, FL 33178'],
                      ['Total weight', order.shipment_weight],
                      ['Dimensions', order.shipment_dimensions],
                      ['Pallets', order.shipment_pallets ? `${order.shipment_pallets} pallet${order.shipment_pallets > 1 ? 's' : ''}` : null],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k} style={{ display:'grid', gridTemplateColumns:'clamp(96px,12vw,132px) 1fr', gap:'8px 12px', alignItems:'baseline', padding:'8px 0 9px', borderBottom:'1px solid rgba(8,9,11,0.1)' }}>
                        <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>{k}</span>
                        <span className="lc-mono" style={{ fontSize:11.5, letterSpacing:'0.05em', textTransform:'uppercase', color:'#08090B', wordBreak:'break-word' }}>{v}</span>
                      </div>
                    ))}
                    {order.shipment_notes && (
                      <div style={{ padding:'8px 0 9px' }}>
                        <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67', marginBottom:4 }}>Notes</div>
                        <div style={{ fontSize:12, color:'#5C5A55', lineHeight:1.7 }}>{order.shipment_notes}</div>
                      </div>
                    )}

                    {order.status === 'confirmed' && (
                      <div style={{ marginTop:18 }}>
                        <div style={{ background:'#08090B', color:'#F2EFE6', padding:'11px 13px 12px' }}>
                          <div className="lc-mono" style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase' }}>{(!hasBol || !hasLabels) ? 'Upload required documents' : 'Documents uploaded'}</div>
                          <div className="lc-mono" style={{ paddingTop:4, fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', color:'#8F8C85' }}>BOL &amp; shipping labels, PDF or image</div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:10 }}>
                          {[['bol', 'Bill of Lading (BOL)', hasBol], ['labels', 'Shipping Labels', hasLabels]].map(([type, label, done]) => (
                            <div key={type} style={{ background: done ? '#F0FDF4' : '#FFFFFF', border:`1px solid ${done ? 'rgba(22,163,74,0.35)' : 'rgba(8,9,11,0.14)'}`, padding:'11px 12px 12px' }}>
                              {done ? (
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                  <span style={{ flex:'none', display:'grid', placeItems:'center', width:30, height:30, background:'#16A34A', color:'#fff', fontWeight:700, fontSize:13 }}>✓</span>
                                  <div>
                                    <div style={{ fontSize:13.5, fontWeight:500, color:'#08090B' }}>{label}</div>
                                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#166534' }}>Uploaded</div>
                                  </div>
                                </div>
                              ) : (
                                <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                                  <input type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e => e.target.files[0] && uploadDoc(order.id, e.target.files[0], type)} />
                                  <span style={{ flex:'none', display:'grid', placeItems:'center', width:30, height:30, background:'#08090B', color:'#F2EFE6', fontWeight:700, fontSize:13 }}>↓</span>
                                  <div style={{ flex:1 }}>
                                    <div style={{ fontSize:13.5, fontWeight:500, color:'#08090B' }}>{label}</div>
                                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6F6D67' }}>{uploading[`${order.id}-${type}`] ? 'Uploading…' : 'Click to upload'}</div>
                                  </div>
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ margin:'0 clamp(14px,2.4vw,26px) clamp(16px,2.4vw,26px)', border:'1px solid rgba(8,9,11,0.1)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap:1, background:'rgba(8,9,11,0.1)' }}>
                    <div style={{ background:'#FFFFFF', padding:'clamp(13px,2vw,18px)' }}>
                      <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:10 }}>Payment status</div>
                      {[
                        ['Status', payment ? (PAY_STATUS[payment.status]?.label || payment.status) : 'No request yet', payment ? PAY_STATUS[payment.status]?.ink : '#9A968E'],
                        ['Method', payment?.payment_method ? PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method : '—', '#08090B'],
                        ['Proof', payment?.payment_proof_url ? 'Submitted' : 'Not submitted', payment?.payment_proof_url ? '#166534' : '#9A968E'],
                      ].map(([k, v, ink]) => (
                        <div key={k} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, padding:'7px 0 8px', borderBottom:'1px solid rgba(8,9,11,0.1)' }}>
                          <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>{k}</span>
                          <span className="lc-mono" style={{ fontSize:11.5, letterSpacing:'0.05em', textTransform:'uppercase', color:ink }}>{v}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ background:'#FFFFFF', padding:'clamp(13px,2vw,18px)' }}>
                      <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:10 }}>What it costs</div>
                      {[
                        ['Subtotal', money(subtotal), '#08090B'],
                        ...(deliveryFee > 0 ? [['Delivery fee', money(deliveryFee), '#08090B']] : []),
                      ].map(([k, v, ink]) => (
                        <div key={k} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, padding:'7px 0 8px', borderBottom:'1px solid rgba(8,9,11,0.1)' }}>
                          <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>{k}</span>
                          <span className="lc-mono" style={{ fontSize:12, letterSpacing:'0.04em', color:ink }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, marginTop:11, background:'#08090B', padding:'12px 13px 13px' }}>
                        <span className="lc-mono" style={{ fontSize:8.5, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8F8C85' }}>{cancelled ? 'Charged to you' : 'Order total'}</span>
                        <span style={{ fontSize:'clamp(21px,2.4vw,27px)', fontWeight:500, letterSpacing:'-0.03em', color:'#F2EFE6' }}>{money(cancelled ? 0 : order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ margin:'0 clamp(14px,2.4vw,26px) clamp(16px,2.4vw,26px)', display:'flex', gap:9, flexWrap:'wrap' }}>
                  <a href={`https://wa.me/17864909005?text=${encodeURIComponent(reorderText)}`} target="_blank" rel="noopener noreferrer" className="lc-mono" style={{ flex:1, minWidth:170, textAlign:'center', border:0, padding:'15px 18px', background:'#2F7DF6', color:'#08090B', fontWeight:700, fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none' }}>Reorder via WhatsApp →</a>
                  <Link href="/portal/invoices" className="lc-mono" style={{ flex:1, minWidth:150, textAlign:'center', border:'1px solid #08090B', padding:'15px 16px', color:'#08090B', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', textDecoration:'none' }}>View invoice</Link>
                  <a href="https://wa.me/17864909005" target="_blank" rel="noopener noreferrer" className="lc-mono" style={{ flex:1, minWidth:150, textAlign:'center', border:'1px solid #08090B', padding:'15px 16px', color:'#08090B', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', textDecoration:'none' }}>Ask your rep</a>
                </div>
              </div>

              <div style={{ flex:'none', boxSizing:'border-box', display:'flex', alignItems:'flex-end', gap:2, height:28, padding:'8px clamp(14px,2.4vw,26px)', overflow:'hidden', borderTop:'1px solid rgba(8,9,11,0.1)' }}>
                {barcode.map((b, bi) => <div key={bi} style={{ flex:`${b.grow} 1 0`, minWidth:1, height:b.h, background:'#08090B', opacity:0.8 }}/>)}
              </div>
              <div className="lc-mono" style={{ flex:'none', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, padding:'0 clamp(14px,2.4vw,26px) 12px', fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
                <span>Record · #{order.order_number} · partner pricing confidential</span>
                <span>levamcorp.com</span>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
