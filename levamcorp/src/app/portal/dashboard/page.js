'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'
import { trackPageView } from '../../../lib/analytics'

const ACCENT = '#2F7DF6'

const IC = {
  orders:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12l4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M16 2v4H8V2"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>,
  catalog:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  invoice:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>,
  payment:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  mail:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  phone:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  check:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  arrow:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  truck:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  pin:      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
}

const STATUS = {
  new:        { label:'Received',   color:'#2F7DF6' },
  review:     { label:'In review',  color:'#B98A54' },
  confirmed:  { label:'Confirmed',  color:'#6B7280' },
  dispatched: { label:'Dispatched', color:'#12B76A' },
  completed:  { label:'Completed',  color:'#12B76A' },
  cancelled:  { label:'Cancelled',  color:'#E74C3C' },
}

function seededBars(seed, count) {
  let s = seed
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  return Array.from({ length: count }, () => {
    const r = rnd()
    return { grow: r > 0.82 ? 3 : r > 0.5 ? 2 : 1, tall: r > 0.94 }
  })
}
const DASH_BARS = seededBars(101010, 90)

const NAV_LINKS = [['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']]

const SHORTCUTS = [
  { code:'CAT', label:'Catalog',  note:'Browse products & pricing', href:'/portal/catalog',  icon:IC.catalog },
  { code:'ORD', label:'Orders',   note:'Track your order status',   href:'/portal/orders',   icon:IC.orders },
  { code:'INV', label:'Invoices', note:'Download & print invoices', href:'/portal/invoices', icon:IC.invoice },
  { code:'PAY', label:'Payments', note:'View balance & history',    href:'/portal/payments', icon:IC.payment },
]

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name[0].toUpperCase()
}

function PortalNav({ user, displayName, onLogout }) {
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

export default function Dashboard() {
  const [user,        setUser]        = useState(null)
  const [orders,      setOrders]      = useState([])
  const [client,      setClient]      = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [metricHover, setMetricHover] = useState(-1)
  const [scHover,     setScHover]     = useState(-1)
  const [orderHover,  setOrderHover]  = useState(-1)
  const [filter,      setFilter]      = useState('All')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      const adminEmails = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
      if (adminEmails.includes(data.user.email)) { window.location.href = '/admin/dashboard'; return }
      setUser(data.user)
      trackPageView('/portal/dashboard')
      const [{ data: o }, { data: cl }] = await Promise.all([
        sb.from('orders').select('*, order_items(*)').order('submitted_at', { ascending: false }).limit(10),
        sb.from('clients').select('*').eq('email', data.user.email).single(),
      ])
      setOrders(o || [])
      setClient(cl || null)
      setLoading(false)
    })
  }, [])

  const logout = async () => { await createClient().auth.signOut(); window.location.href = '/portal' }

  const totalOrders     = orders.length
  const totalSpent      = orders.reduce((s, o) => s + (o.total || 0), 0)
  const pendingOrders   = orders.filter(o => !['completed','cancelled'].includes(o.status))
  const pendingValue    = pendingOrders.reduce((s, o) => s + (o.total || 0), 0)
  const completedOrders = orders.filter(o => o.status === 'completed')
  const cancelledOrders = orders.filter(o => o.status === 'cancelled')
  const displayName     = client?.contact_name || user?.email?.split('@')[0] || 'Partner'
  const businessName    = client?.business_name || ''
  const lastOrder       = orders[0]
  const accountRef      = (businessName ? businessName.slice(0,3) : 'PRT').toUpperCase() + ' · ' + (user?.id ? user.id.slice(-4).toUpperCase() : '----')
  const today           = new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })

  const money = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const metrics = [
    { code:'ORD', label:'Total orders',    value:totalOrders,            unit:'all time',  note:'Since first order' },
    { code:'ACT', label:'Active orders',   value:pendingOrders.length,   unit:'in flight',  note:`${money(pendingValue)} in progress` },
    { code:'VAL', label:'Total purchased', value:money(totalSpent),      unit:'usd',        note:'Lifetime value' },
    { code:'CPL', label:'Completed',       value:completedOrders.length, unit:'fulfilled',  note:'Orders delivered' },
  ]

  const groups = {
    All:       () => true,
    Open:      o => !['completed','cancelled'].includes(o.status),
    Completed: o => o.status === 'completed',
    Cancelled: o => o.status === 'cancelled',
  }
  const filterCounts = { All: orders.length, Open: pendingOrders.length, Completed: completedOrders.length, Cancelled: cancelledOrders.length }
  const shownOrders = orders.filter(groups[filter] || groups.All)

  const barCut = metricHover >= 0 ? Math.round(((metricHover + 1) / metrics.length) * DASH_BARS.length) : 0

  const globalStyle = `
    .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }
    .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @media(max-width:900px){ .dash-grid{ grid-template-columns:1fr !important; } }
  `

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#E4DFD2', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{globalStyle}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(8,9,11,0.12)', borderTop:'2px solid #2F7DF6', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 0.7s linear infinite' }}/>
        <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A8780' }}>Loading your portal…</div>
      </div>
    </div>
  )

  return (
    <div style={{ position:'relative', minHeight:'100vh', background:'#E4DFD2', color:'#08090B', fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{globalStyle}</style>

      {/* Dot-grid ground texture, matching the sign-in page's backdrop family */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(to right, rgba(8,9,11,.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(8,9,11,.028) 1px, transparent 1px)', backgroundSize:'88px 88px' }}/>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'radial-gradient(circle at center, rgba(47,125,246,.28) 1px, transparent 1.7px)', backgroundSize:'352px 352px', backgroundPosition:'176px 176px' }}/>

      <div style={{ position:'relative' }}>
        <PortalNav user={user} displayName={displayName} onLogout={logout}/>

        <div style={{ position:'relative', maxWidth:1240, margin:'0 auto', padding:'clamp(22px,3.6vh,38px) clamp(16px,3vw,32px) clamp(56px,8vh,90px)', animation:'fadeIn 0.35s ease' }}>

          {/* HEADER */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:20, flexWrap:'wrap', paddingBottom:'clamp(18px,3vh,26px)' }}>
            <div>
              <div className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64', paddingBottom:11 }}>Dashboard · Form 10 · {today}</div>
              <h1 className="lc-display" style={{ margin:0, fontSize:'clamp(28px,3.8vw,44px)', fontWeight:400, letterSpacing:'-0.03em', lineHeight:1.02, color:'#08090B' }}>
                Welcome back, {displayName}<span style={{ color:ACCENT }}>.</span>
              </h1>
              <div className="lc-mono" style={{ marginTop:11, fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'#5C5A55' }}>
                {businessName ? businessName + ' · ' : ''}Approved distributor
              </div>
            </div>
            <Link href="/portal/catalog" className="lc-mono" style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'15px 19px', background:ACCENT, color:'#08090B', fontWeight:700, fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', textDecoration:'none' }}>
              Browse catalog {IC.arrow}
            </Link>
          </div>

          {/* MANIFEST · ACCOUNT METRICS */}
          <div style={{ background:'#F7F5EE', border:'1px solid rgba(8,9,11,0.85)' }}>
            <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'12px 16px', borderBottom:'1px solid rgba(8,9,11,0.85)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
              <span style={{ display:'flex', alignItems:'center', gap:10, color:'#08090B' }}>
                <span style={{ width:11, height:11, border:'1px solid #08090B', borderLeft:`3px solid ${ACCENT}`, display:'inline-block' }}/>
                Manifest · Account metrics
              </span>
              <span>Ref · {accountRef}</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))' }}>
              {metrics.map((m, i) => {
                const on = metricHover === i
                return (
                  <div key={m.code} tabIndex={0} onMouseEnter={()=>setMetricHover(i)} onMouseLeave={()=>setMetricHover(-1)}
                    style={{ position:'relative', borderLeft:'1px solid rgba(8,9,11,0.18)', borderTop:'1px solid rgba(8,9,11,0.18)', background: on?'#08090B':'#F7F5EE', color: on?'#F5F2E9':'#08090B', padding:'clamp(17px,2.6vh,24px) 16px clamp(16px,2.4vh,22px)', transition:'background 0.15s, color 0.15s' }}>
                    <div style={{ position:'absolute', left:0, right:0, top:0, height:3, background: on?ACCENT:'transparent' }}/>
                    <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color: on?'#8F8C85':'#6D6A64' }}>
                      <span>{m.label}</span><span>{m.code}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:3, marginTop:'clamp(13px,1.9vh,18px)' }}>
                      <span className="lc-display" style={{ fontSize:'clamp(34px,3.9vw,48px)', fontWeight:400, letterSpacing:'-0.05em', lineHeight:0.86 }}>{m.value}</span>
                      <span className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', paddingBottom:5, color: on?'#8F8C85':'#6D6A64' }}>{m.unit}</span>
                    </div>
                    <div className="lc-mono" style={{ marginTop:11, fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color: on?'#8F8C85':'#6D6A64' }}>{m.note}</div>
                  </div>
                )
              })}
            </div>

            <div style={{ boxSizing:'border-box', display:'flex', alignItems:'flex-end', gap:2, height:28, padding:'8px 16px', borderTop:'1px solid rgba(8,9,11,0.85)', background:'rgba(8,9,11,0.03)' }}>
              {DASH_BARS.map((b,i) => (
                <div key={i} style={{ flex:`${b.grow} 1 0`, minWidth:1, height: b.tall?'20px':'14px', background: i<barCut?ACCENT:'#08090B', opacity: i<barCut?1:0.2, transition:'background 0.15s, opacity 0.15s' }}/>
              ))}
            </div>
            <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'9px 16px 11px', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64' }}>
              <span>{metricHover>=0 ? `Cell 0${metricHover+1} · ${metrics[metricHover].code} · selected` : 'Manifest closed · 04 cells'}</span>
              <span>Doral · FL 33178</span>
            </div>
          </div>

          {/* SHORTCUTS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', background:'#F7F5EE', border:'1px solid rgba(8,9,11,0.85)', borderTop:0 }}>
            {SHORTCUTS.map((s, i) => {
              const on = scHover === i
              return (
                <Link key={s.code} href={s.href} onMouseEnter={()=>setScHover(i)} onMouseLeave={()=>setScHover(-1)}
                  style={{ position:'relative', display:'flex', flexDirection:'column', minHeight:110, borderLeft:'1px solid rgba(8,9,11,0.85)', borderTop:'1px solid rgba(8,9,11,0.85)', padding:'clamp(15px,2.2vh,20px) 15px clamp(14px,2vh,18px)', background: on?'#08090B':'#F7F5EE', color: on?'#F5F2E9':'#08090B', textDecoration:'none', transition:'background 0.15s, color 0.15s' }}>
                  <div style={{ position:'absolute', left:0, right:0, top:0, height:3, background: on?ACCENT:'transparent' }}/>
                  <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color: on?'#8F8C85':'#6D6A64' }}>
                    <span>{s.code}</span><span style={{ color: on?ACCENT:'inherit' }}>{s.icon}</span>
                  </div>
                  <div style={{ flex:1 }}/>
                  <div style={{ fontSize:17, letterSpacing:'-0.02em' }}>{s.label}</div>
                  <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, marginTop:8, paddingTop:9, borderTop: `1px solid ${on?'rgba(242,239,230,0.2)':'rgba(8,9,11,0.16)'}`, fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color: on?'#8F8C85':'#6D6A64' }}>
                    <span>{s.note}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>Open {IC.arrow}</span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* BODY */}
          <div className="dash-grid" style={{ display:'grid', gridTemplateColumns:'1fr 320px', alignItems:'start', gap:'clamp(20px,3vw,28px)', marginTop:'clamp(22px,3.4vh,32px)' }}>

            {/* ORDER LOG */}
            <div style={{ background:'#F7F5EE', border:'1px solid rgba(8,9,11,0.85)' }}>
              <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'12px 16px', borderBottom:'1px solid rgba(8,9,11,0.85)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
                <span style={{ color:'#08090B' }}>Order log · Recent</span>
                <Link href="/portal/orders" style={{ color:'#08090B', textDecoration:'none', borderBottom:`1px solid ${ACCENT}`, paddingBottom:1 }}>View all →</Link>
              </div>

              <div style={{ display:'flex', gap:1, background:'rgba(8,9,11,0.18)', borderBottom:'1px solid rgba(8,9,11,0.85)', flexWrap:'wrap' }}>
                {Object.keys(groups).map(label => {
                  const on = filter === label
                  return (
                    <button key={label} onClick={()=>setFilter(label)} className="lc-mono"
                      style={{ flex:'1 1 auto', minWidth:82, border:0, cursor:'pointer', padding:'11px 12px', background: on?'#08090B':'#F7F5EE', color: on?'#F5F2E9':'#6D6A64', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', textAlign:'left' }}>
                      <span style={{ display:'block' }}>{label}</span>
                      <span style={{ display:'block', marginTop:5, fontSize:13, letterSpacing:'0.04em' }}>{filterCounts[label] < 10 ? '0'+filterCounts[label] : filterCounts[label]}</span>
                    </button>
                  )
                })}
              </div>

              {shownOrders.length === 0 ? (
                <div style={{ padding:'3.5rem 2rem', textAlign:'center' }}>
                  <div style={{ color:'#6D6A64', marginBottom:14 }}>{IC.orders}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#08090B', marginBottom:6 }}>{orders.length===0 ? 'No orders yet' : 'No orders in this filter'}</div>
                  <div style={{ fontSize:12.5, color:'#8A8780', marginBottom:'1.5rem' }}>{orders.length===0 ? 'Start by browsing our wholesale catalog' : 'Try a different status filter'}</div>
                  {orders.length===0 && (
                    <Link href="/portal/catalog" className="lc-mono" style={{ display:'inline-block', padding:'12px 22px', background:'#08090B', color:'#F2EFE6', fontSize:10.5, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', textDecoration:'none' }}>Browse catalog</Link>
                  )}
                </div>
              ) : (
                <div>
                  {shownOrders.map((order, i) => {
                    const st = STATUS[order.status] || STATUS.new
                    const etaDate = order.eta ? new Date(order.eta + 'T00:00:00') : null
                    const etaStr = etaDate ? etaDate.toLocaleDateString('en-US', { month:'short', day:'numeric' }) : null
                    const on = orderHover === i
                    return (
                      <Link key={order.id} href="/portal/orders" onMouseEnter={()=>setOrderHover(i)} onMouseLeave={()=>setOrderHover(-1)}
                        style={{ position:'relative', display:'grid', gridTemplateColumns:'1.4fr 1fr 0.8fr 0.8fr 1fr', gap:'6px 12px', alignItems:'center', padding:'clamp(12px,1.8vh,16px) 16px', borderBottom:'1px solid rgba(8,9,11,0.1)', background: on?'#08090B':'#F7F5EE', color: on?'#F5F2E9':'#08090B', textDecoration:'none', transition:'background 0.15s, color 0.15s' }}>
                        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background: on?ACCENT:'transparent' }}/>
                        <span className="lc-mono" style={{ fontSize:11.5, letterSpacing:'0.04em' }}>#{order.order_number}</span>
                        <span className="lc-mono" style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color: on?'#8F8C85':'#6D6A64' }}>{fmtDate(order.submitted_at)}</span>
                        <span className="lc-mono" style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color: on?'#8F8C85':'#6D6A64' }}>{order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}</span>
                        <span className="lc-mono" style={{ textAlign:'right', fontSize:12.5, letterSpacing:'0.02em' }}>{money(order.total)}</span>
                        <span className="lc-mono" style={{ display:'flex', alignItems:'center', gap:8, fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color: on?'#C9C5BA':st.color }}>
                          <span style={{ flex:'none', width:6, height:6, background: order.status==='cancelled'?'#9A5B4A':ACCENT, display:'inline-block' }}/>
                          {st.label}{etaStr && <span style={{ display:'flex', alignItems:'center', gap:4, marginLeft:4 }}>{IC.truck} {etaStr}</span>}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}

              <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'11px 16px 13px', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64' }}>
                <span>Showing {shownOrders.length} of {orders.length} · filter {filter.toLowerCase()}</span>
                <span>Click a row for full detail</span>
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={{ display:'flex', flexDirection:'column', gap:'clamp(16px,2.4vh,24px)' }}>

              {/* Partner stub */}
              <div style={{ background:'#08090B', color:'#F2EFE6' }}>
                <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'12px 16px', borderBottom:'1px solid rgba(242,239,230,0.2)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73' }}>
                  <span style={{ color:'#F2EFE6' }}>Partner stub</span>
                  <span>Seq · 10</span>
                </div>
                <div style={{ padding:'clamp(15px,2.2vh,20px) 16px clamp(13px,1.9vh,17px)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <span className="lc-mono" style={{ display:'grid', placeItems:'center', flex:'none', width:42, height:42, background:ACCENT, color:'#08090B', fontWeight:700, fontSize:14 }}>{initials(displayName)}</span>
                    <span style={{ minWidth:0 }}>
                      <span style={{ display:'block', fontSize:17, letterSpacing:'-0.02em', color:'#F5F2E9' }}>{displayName}</span>
                      {businessName && <span className="lc-mono" style={{ display:'block', marginTop:3, fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'#8F8C85' }}>{businessName}</span>}
                    </span>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(242,239,230,0.16)' }}>
                  {[['Orders',totalOrders],['Completed',completedOrders.length],['In flight',pendingOrders.length],['Total spent',money(totalSpent)]].map(([k,v]) => (
                    <div key={k} style={{ background:'#08090B', padding:'11px 14px 12px' }}>
                      <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73' }}>{k}</div>
                      <div className="lc-mono" style={{ marginTop:6, fontSize:15, letterSpacing:'0.02em', color:'#F2EFE6' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px 14px', borderTop:'1px solid rgba(242,239,230,0.16)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:ACCENT }}>
                  <span style={{ width:7, height:7, background:ACCENT, display:'inline-block' }}/>
                  Approved distributor · Cleared
                </div>
              </div>

              {/* Latest order */}
              {lastOrder && (
                <div style={{ background:'#F7F5EE', border:'1px solid rgba(8,9,11,0.85)' }}>
                  <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, padding:'12px 16px', borderBottom:'1px solid rgba(8,9,11,0.85)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
                    <span style={{ color:'#08090B' }}>Latest order</span>
                    <span>{fmtDate(lastOrder.submitted_at)}</span>
                  </div>
                  <div style={{ padding:'clamp(15px,2.2vh,20px) 16px 0' }}>
                    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
                      <span className="lc-mono" style={{ fontSize:13, letterSpacing:'0.04em' }}>#{lastOrder.order_number}</span>
                      <span className="lc-display" style={{ fontSize:26, letterSpacing:'-0.03em' }}>{money(lastOrder.total)}</span>
                    </div>
                    <div style={{ marginTop:10 }}>
                      <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', padding:'4px 9px', border:`1px solid ${(STATUS[lastOrder.status]||STATUS.new).color}55`, color:(STATUS[lastOrder.status]||STATUS.new).color, fontWeight:700 }}>{(STATUS[lastOrder.status]||STATUS.new).label}</span>
                    </div>
                  </div>
                  {lastOrder.eta && (
                    <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:6, margin:'12px 16px 0', padding:'8px 10px', background:'rgba(18,183,106,0.08)', fontSize:11, fontWeight:700, color:'#12B76A' }}>
                      {IC.truck} ETA: {new Date(lastOrder.eta + 'T00:00:00').toLocaleDateString('en-US', { month:'long', day:'numeric' })}
                    </div>
                  )}
                  <Link href="/portal/orders" className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, margin:'14px 16px 16px', padding:'12px', background:'#08090B', color:'#F2EFE6', fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', textDecoration:'none', fontWeight:700 }}>
                    View all orders {IC.arrow}
                  </Link>
                </div>
              )}

              {/* Contact */}
              <div style={{ background:'#08090B', color:'#F2EFE6' }}>
                <div className="lc-mono" style={{ padding:'12px 16px', borderBottom:'1px solid rgba(242,239,230,0.2)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#7C7A73' }}>Your account team</div>
                <div style={{ padding:'14px 16px 6px', fontSize:12, color:'#9A968E', lineHeight:1.7 }}>
                  We&rsquo;re here Monday–Friday, 9AM–5PM ET. Reach us anytime:
                </div>
                <div style={{ padding:'0 16px 16px', display:'flex', flexDirection:'column', gap:6 }}>
                  {[[IC.mail, 'partners@levamcorp.com', 'mailto:partners@levamcorp.com'], [IC.phone, '(786) 878-4122', 'tel:+17868784122']].map(([icon, label, href]) => (
                    <a key={label} href={href} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 10px', border:'1px solid rgba(242,239,230,0.14)', fontSize:12, color:'#F5F2E9', textDecoration:'none', fontWeight:500 }}>
                      <span style={{ color:ACCENT }}>{icon}</span>{label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Perks */}
              <div style={{ background:'#F7F5EE', border:'1px solid rgba(8,9,11,0.85)' }}>
                <div className="lc-mono" style={{ padding:'12px 16px', borderBottom:'1px solid rgba(8,9,11,0.85)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>Partner benefits</div>
                <div style={{ padding:'14px 16px 16px', display:'flex', flexDirection:'column', gap:9 }}>
                  {['Wholesale pricing on all products','Dedicated account support','Auto-generated invoices & quotes','Priority dispatch — 48h average'].map(p => (
                    <div key={p} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:12, color:'#3F3D39', lineHeight:1.5 }}>
                      <span style={{ color:ACCENT, marginTop:1, flexShrink:0 }}>{IC.check}</span>{p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', marginTop:'clamp(24px,3.6vh,32px)', paddingTop:14, borderTop:'1px solid rgba(8,9,11,0.3)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6D6A64' }}>
            <span style={{ display:'flex', alignItems:'center', gap:6 }}>{IC.pin} Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178</span>
            <a href="mailto:partners@levamcorp.com" style={{ color:ACCENT, textDecoration:'none' }}>partners@levamcorp.com</a>
          </div>
        </div>
      </div>
    </div>
  )
}
