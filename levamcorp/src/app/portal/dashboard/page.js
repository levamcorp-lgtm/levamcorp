'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'
import { trackPageView } from '../../../lib/analytics'

const IC = {
  orders:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12l4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M16 2v4H8V2"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>,
  pending:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  value:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  done:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>,
  catalog:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  invoice:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>,
  payment:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  mail:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  phone:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  check:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>,
  arrow:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
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
    return { w: r > 0.82 ? 3 : r > 0.5 ? 2 : 1, tall: r > 0.94 }
  })
}
const DASH_BARS = seededBars(42007, 90)

const NAV_LINKS = [['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']]

const QUICK_ACTIONS = [
  { icon:IC.catalog, label:'Catalog',  desc:'Browse products & pricing', href:'/portal/catalog',  accent:'#2F7DF6' },
  { icon:IC.orders,  label:'Orders',   desc:'Track your order status',   href:'/portal/orders',   accent:'#B98A54' },
  { icon:IC.invoice, label:'Invoices', desc:'Download & print invoices', href:'/portal/invoices', accent:'#6B7280' },
  { icon:IC.payment, label:'Payments', desc:'View balance & history',    href:'/portal/payments', accent:'#12B76A' },
]

function PortalNav({ user, onLogout }) {
  const pathname = usePathname()
  return (
    <nav style={{ position:'sticky', top:0, zIndex:40, background:'#08090B', borderBottom:'1px solid rgba(245,241,232,0.1)' }}>
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
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:28, height:28, background:'#F2EFE6', color:'#08090B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700 }}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <span className="lc-mono" style={{ fontSize:10, letterSpacing:'0.06em', color:'#8A8780' }}>{user?.email}</span>
          <button onClick={onLogout} className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#8A8780', border:'1px solid rgba(245,241,232,0.18)', padding:'7px 14px', background:'transparent', cursor:'pointer' }}>Sign out</button>
        </div>
      </div>
    </nav>
  )
}

export default function Dashboard() {
  const [user,    setUser]    = useState(null)
  const [orders,  setOrders]  = useState([])
  const [client,  setClient]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      // Make sure this is a client, not an admin
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

  const totalOrders   = orders.length
  const totalSpent    = orders.reduce((s, o) => s + (o.total || 0), 0)
  const pendingOrders = orders.filter(o => !['completed','cancelled'].includes(o.status))
  const pendingValue  = pendingOrders.reduce((s, o) => s + (o.total || 0), 0)
  const completedOrders = orders.filter(o => o.status === 'completed')
  const displayName   = client?.contact_name || user?.email?.split('@')[0] || 'Partner'
  const businessName  = client?.business_name || ''
  const lastOrder     = orders[0]

  const money = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const globalStyle = `
    .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }
    .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    .dash-action:hover { background:#000000 !important; color:#F2EFE6 !important; }
    .dash-action:hover .dash-action-desc { color:#9A968E !important; }
  `

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{globalStyle}</style>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(8,9,11,0.12)', borderTop:'2px solid #2F7DF6', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 0.7s linear infinite' }}/>
        <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A8780' }}>Loading your portal…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#FFFFFF', minHeight:'100vh', color:'#08090B', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>
      <style>{globalStyle}</style>

      <PortalNav user={user} onLogout={logout}/>

      <div style={{ padding:'clamp(28px,4vh,44px) 2rem clamp(56px,8vh,96px)', maxWidth:1240, margin:'0 auto', animation:'fadeIn 0.35s ease' }}>

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap', paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#8A8780' }}>
          <span style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
            Partner portal · Dashboard
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:8, color:'#12B76A' }}>
            {IC.check} Approved distributor
          </span>
        </div>
        <div style={{ height:1, background:'rgba(8,9,11,0.16)' }}/>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:20, padding:'clamp(24px,3.4vh,32px) 0 clamp(28px,4vh,40px)' }}>
          <div>
            <h1 className="lc-display" style={{ margin:0, fontSize:'clamp(28px,3.4vw,40px)', fontWeight:400, letterSpacing:'-0.03em', lineHeight:1.05, color:'#08090B' }}>
              Welcome back, {displayName}<span style={{ color:'#2F7DF6' }}>.</span>
            </h1>
            {businessName && <p style={{ margin:'8px 0 0', fontSize:14, color:'#5C5A55' }}>{businessName}</p>}
          </div>
          <Link href="/portal/catalog" className="lc-mono" style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'14px 22px', background:'#08090B', color:'#F2EFE6', fontWeight:700, fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none' }}>
            Browse catalog {IC.arrow}
          </Link>
        </div>

        {/* ── KPI TICKET ─────────────────────────────────────────────────*/}
        <div style={{ background:'#F2EFE6', color:'#08090B', padding:'clamp(14px,2vw,22px)', border:'1px solid rgba(8,9,11,0.1)' }}>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, padding:'0 2px clamp(12px,1.8vh,16px)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
            <span style={{ display:'flex', alignItems:'center', gap:9 }}>
              <span style={{ display:'inline-block', width:11, height:11, border:'1px solid #08090B', borderLeft:'3px solid #2F7DF6' }}/>
              Manifest · Metrics
            </span>
            <span>Account · {user?.email}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:1, background:'rgba(8,9,11,0.14)' }}>
            {[
              { label:'Total orders',    value:totalOrders,           sub:'all time' },
              { label:'Active orders',   value:pendingOrders.length,  sub:`${money(pendingValue)} in progress` },
              { label:'Total purchased', value:money(totalSpent),     sub:'lifetime value' },
              { label:'Completed',       value:completedOrders.length,sub:'orders fulfilled' },
            ].map(k => (
              <div key={k.label} style={{ background:'#F2EFE6', padding:'16px 18px' }}>
                <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6D6A64', marginBottom:10 }}>{k.label}</div>
                <div className="lc-display" style={{ fontSize:30, fontWeight:400, letterSpacing:'-0.02em', color:'#08090B', marginBottom:6 }}>{k.value}</div>
                <div style={{ fontSize:11, color:'#8A8780' }}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:1.5, height:16, marginTop:'clamp(12px,1.8vh,16px)' }}>
            {DASH_BARS.map((b,i) => <div key={i} style={{ flex:`${b.w} 1 0`, minWidth:1, height: b.tall ? 15 : 10, background:'#08090B', opacity:0.35 }}/>)}
          </div>
        </div>

        {/* ── QUICK ACTIONS ──────────────────────────────────────────────*/}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:1, background:'rgba(8,9,11,0.1)', border:'1px solid rgba(8,9,11,0.1)', marginTop:'clamp(20px,3vh,28px)' }}>
          {QUICK_ACTIONS.map(item => (
            <Link key={item.label} href={item.href} className="dash-action" style={{ textDecoration:'none', display:'block', background:'#F2EFE6', color:'#08090B', padding:'18px 20px', borderTop:`3px solid ${item.accent}`, transition:'background 0.2s, color 0.2s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ color:item.accent, flexShrink:0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:700 }}>{item.label}</div>
                  <div className="dash-action-desc" style={{ fontSize:11.5, color:'#8A8780', marginTop:2, transition:'color 0.2s' }}>{item.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', alignItems:'start', gap:'clamp(20px,3vw,28px)', marginTop:'clamp(20px,3vh,28px)' }} className="dash-grid">
          <style>{`@media(max-width:900px){ .dash-grid{ grid-template-columns:1fr !important; } }`}</style>

          {/* ── ORDER LOG ────────────────────────────────────────────── */}
          <div style={{ background:'#F2EFE6', color:'#08090B', border:'1px solid rgba(8,9,11,0.1)' }}>
            <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, padding:'14px 18px', borderBottom:'2px solid #08090B', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
              <span style={{ color:'#08090B', fontWeight:700 }}>Order log · Recent</span>
              <Link href="/portal/orders" style={{ display:'flex', alignItems:'center', gap:6, color:'#2F7DF6', textDecoration:'none', fontWeight:700 }}>View all {IC.arrow}</Link>
            </div>

            {orders.length === 0 ? (
              <div style={{ padding:'3.5rem 2rem', textAlign:'center' }}>
                <div style={{ color:'#6D6A64', marginBottom:14 }}>{IC.orders}</div>
                <div style={{ fontSize:15, fontWeight:700, color:'#08090B', marginBottom:6 }}>No orders yet</div>
                <div style={{ fontSize:12.5, color:'#8A8780', marginBottom:'1.5rem' }}>Start by browsing our wholesale catalog</div>
                <Link href="/portal/catalog" className="lc-mono" style={{ display:'inline-block', padding:'12px 22px', background:'#08090B', color:'#F2EFE6', fontSize:10.5, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', textDecoration:'none' }}>Browse catalog</Link>
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    {['Order','Date','Products','Total','Status','ETA'].map(h => (
                      <th key={h} className="lc-mono" style={{ fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'#8A8780', padding:'10px 16px', textAlign:'left', fontWeight:700, borderBottom:'1px solid rgba(8,9,11,0.16)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => {
                    const st = STATUS[order.status] || STATUS.new
                    const etaDate = order.eta ? new Date(order.eta + 'T00:00:00') : null
                    const etaStr = etaDate ? etaDate.toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '—'
                    const isPast = etaDate && etaDate < new Date()
                    return (
                      <tr key={order.id} style={{ borderTop: i > 0 ? '1px solid rgba(8,9,11,0.08)' : 'none' }}>
                        <td style={{ padding:'12px 16px', fontSize:12.5, fontWeight:700 }}>#{order.order_number}</td>
                        <td style={{ padding:'12px 16px', fontSize:11.5, color:'#8A8780' }}>{fmtDate(order.submitted_at)}</td>
                        <td style={{ padding:'12px 16px', fontSize:11.5, color:'#5C5A55' }}>{order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}</td>
                        <td style={{ padding:'12px 16px', fontSize:13.5, fontWeight:700 }}>{money(order.total)}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', padding:'4px 9px', border:`1px solid ${st.color}55`, color:st.color, fontWeight:700 }}>{st.label}</span>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:11.5, color: order.eta ? (isPast && order.status !== 'completed' ? '#E74C3C' : '#12B76A') : '#BFBBAF', fontWeight: order.eta ? 700 : 400 }}>
                          {order.eta ? (
                            <span style={{ display:'flex', alignItems:'center', gap:5 }}>{IC.truck} {etaStr}</span>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────────── */}
          <div style={{ display:'flex', flexDirection:'column', gap:'clamp(16px,2.2vh,20px)' }}>

            {/* Account record */}
            <div style={{ background:'#08090B', border:'1px solid rgba(245,241,232,0.12)', padding:'1.4rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.1rem' }}>
                <div style={{ width:42, height:42, background:'#F2EFE6', color:'#08090B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, flexShrink:0 }}>
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:'#F5F1E8' }}>{displayName}</div>
                  {businessName && <div style={{ fontSize:11, color:'#8A8780', marginTop:1 }}>{businessName}</div>}
                  <div className="lc-mono" style={{ fontSize:9.5, color:'#6F6D67', marginTop:2 }}>{user?.email}</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(245,241,232,0.1)', marginBottom:'1rem' }}>
                {[
                  ['Orders',totalOrders],
                  ['Completed',completedOrders.length],
                  ['Pending',pendingOrders.length],
                  ['Total spent',money(totalSpent)],
                ].map(([l,v]) => (
                  <div key={l} style={{ padding:'10px 12px', background:'#08090B' }}>
                    <div className="lc-mono" style={{ fontSize:8, color:'#6F6D67', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:15, fontWeight:700, color:'#F5F1E8' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:8, fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', color:'#12B76A' }}>
                {IC.check} Approved distributor
              </div>
            </div>

            {/* Latest order */}
            {lastOrder && (
              <div style={{ background:'#F2EFE6', color:'#08090B', padding:'1.2rem', border:'1px solid rgba(8,9,11,0.1)' }}>
                <div className="lc-mono" style={{ fontSize:9, color:'#6D6A64', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:10, fontWeight:700 }}>Latest order</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700 }}>#{lastOrder.order_number}</div>
                    <div style={{ fontSize:11, color:'#8A8780' }}>{fmtDate(lastOrder.submitted_at)}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div className="lc-display" style={{ fontSize:18, fontWeight:400 }}>{money(lastOrder.total)}</div>
                    <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 8px', border:`1px solid ${(STATUS[lastOrder.status]||STATUS.new).color}55`, color:(STATUS[lastOrder.status]||STATUS.new).color, fontWeight:700 }}>{(STATUS[lastOrder.status]||STATUS.new).label}</span>
                  </div>
                </div>
                {lastOrder.eta && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11.5, color:'#12B76A', padding:'8px 10px', background:'rgba(18,183,106,0.08)', fontWeight:700 }}>
                    {IC.truck} ETA: {new Date(lastOrder.eta + 'T00:00:00').toLocaleDateString('en-US', { month:'long', day:'numeric' })}
                  </div>
                )}
                <Link href="/portal/orders" className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:12, padding:'10px', background:'#08090B', color:'#F2EFE6', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', fontWeight:700 }}>
                  View all orders {IC.arrow}
                </Link>
              </div>
            )}

            {/* Contact */}
            <div style={{ background:'#08090B', border:'1px solid rgba(245,241,232,0.12)', padding:'1.2rem' }}>
              <div className="lc-mono" style={{ fontSize:9, color:'#6F6D67', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:12, fontWeight:700 }}>Your account team</div>
              <div style={{ fontSize:12, color:'#9A968E', lineHeight:1.7, marginBottom:'0.9rem' }}>
                We&rsquo;re here Monday–Friday, 9AM–5PM ET. Reach us anytime:
              </div>
              {[
                [IC.mail, 'partners@levamcorp.com', 'mailto:partners@levamcorp.com'],
                [IC.phone, '(786) 878-4122', 'tel:+17868784122'],
              ].map(([icon, label, href]) => (
                <a key={label} href={href} style={{ display:'flex', alignItems:'center', gap:9, fontSize:12, color:'#F5F1E8', textDecoration:'none', fontWeight:500, padding:'9px 10px', border:'1px solid rgba(245,241,232,0.1)', marginBottom:6 }}>
                  <span style={{ color:'#2F7DF6' }}>{icon}</span> {label}
                </a>
              ))}
            </div>

            {/* Perks */}
            <div style={{ background:'#F2EFE6', color:'#08090B', padding:'1.2rem', border:'1px solid rgba(8,9,11,0.1)' }}>
              <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'#5C5A55', marginBottom:12, fontWeight:700 }}>Partner benefits</div>
              {['Wholesale pricing on all products','Dedicated account support','Auto-generated invoices & quotes','Priority dispatch — 48h average'].map(p => (
                <div key={p} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:11.5, color:'#3F3D39', marginBottom:8, lineHeight:1.5 }}>
                  <span style={{ color:'#2F7DF6', marginTop:1, flexShrink:0 }}>{IC.check}</span>{p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <div className="lc-mono" style={{ marginTop:'clamp(20px,3vh,28px)', padding:'14px 18px', border:'1px solid rgba(8,9,11,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, fontSize:9.5, letterSpacing:'0.12em', textTransform:'uppercase', color:'#8A8780' }}>
          <span style={{ display:'flex', alignItems:'center', gap:6 }}>{IC.pin} Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178</span>
          <a href="mailto:partners@levamcorp.com" style={{ color:'#2F7DF6', textDecoration:'none' }}>partners@levamcorp.com</a>
        </div>
      </div>
    </div>
  )
}
