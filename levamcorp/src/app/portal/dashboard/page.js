'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  new:        { label:'Received',   color:'#2d7dd2', bg:'rgba(45,125,210,0.08)',  border:'rgba(45,125,210,0.2)'  },
  review:     { label:'In review',  color:'#c49a00', bg:'rgba(196,154,0,0.08)',   border:'rgba(196,154,0,0.2)'   },
  confirmed:  { label:'Confirmed',  color:'#534ab7', bg:'rgba(83,74,183,0.08)',   border:'rgba(83,74,183,0.2)'   },
  dispatched: { label:'Dispatched', color:'#2a7d4f', bg:'rgba(42,125,79,0.08)',   border:'rgba(42,125,79,0.2)'   },
  completed:  { label:'Completed',  color:'#2a7d4f', bg:'rgba(42,125,79,0.08)',   border:'rgba(42,125,79,0.2)'   },
  cancelled:  { label:'Cancelled',  color:'#e74c3c', bg:'rgba(231,76,60,0.08)',   border:'rgba(231,76,60,0.2)'   },
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

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f7f8fa', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:32, height:32, border:'2.5px solid #e5e7eb', borderTop:'2.5px solid #2d7dd2', borderRadius:'50%', margin:'0 auto 14px', animation:'spin 0.7s linear infinite' }}/>
        <div style={{ fontSize:12, color:'#aaa', letterSpacing:'0.08em' }}>Loading your portal...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#f4f5f7', minHeight:'100vh', fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* NAV */}
      <nav style={{ background:'#111', borderBottom:'0.5px solid rgba(255,255,255,0.06)', position:'sticky', top:0, zIndex:40 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', height:58 }}>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ position:'relative', width:28, height:28 }}>
                <div style={{ position:'absolute', left:6, top:0, width:2, height:22, background:'#444' }}/>
                <div style={{ position:'absolute', left:6, bottom:0, width:16, height:2, background:'#444' }}/>
                <div style={{ position:'absolute', left:9, bottom:7, width:10, height:2.5, background:'#2d7dd2' }}/>
              </div>
              <div>
                <div style={{ fontSize:15, fontWeight:800, letterSpacing:'0.18em', color:'#fff', textTransform:'uppercase', lineHeight:1 }}>Levam<span style={{ color:'#2d7dd2' }}>Corp</span></div>
                <div style={{ fontSize:7.5, letterSpacing:'0.25em', color:'#555', textTransform:'uppercase', marginTop:2 }}>Partner Portal</div>
              </div>
            </div>
            {/* Nav links */}
            <div style={{ display:'flex', height:58 }}>
              {[['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']].map(([l,h]) => (
                <Link key={l} href={h} style={{ display:'flex', alignItems:'center', fontSize:12, fontWeight:l==='Dashboard'?700:500, color:l==='Dashboard'?'#fff':'rgba(255,255,255,0.45)', textDecoration:'none', padding:'0 16px', borderBottom:l==='Dashboard'?'2px solid #2d7dd2':'2px solid transparent' }}>{l}</Link>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(45,125,210,0.15)', border:'1px solid rgba(45,125,210,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#2d7dd2' }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>{user?.email}</span>
            <button onClick={logout} style={{ fontSize:11, color:'rgba(255,255,255,0.45)', border:'0.5px solid rgba(255,255,255,0.12)', padding:'6px 14px', borderRadius:3, background:'transparent', cursor:'pointer' }}>Sign out</button>
          </div>
        </div>
      </nav>

      <div style={{ padding:'1.75rem 2rem', maxWidth:1200, margin:'0 auto', animation:'fadeIn 0.35s ease' }}>

        {/* HEADER */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#2d7dd2', fontWeight:700, marginBottom:5 }}>Partner portal</div>
            <div style={{ fontSize:24, fontWeight:800, color:'#111', marginBottom:3 }}>Welcome back, {displayName}</div>
            {businessName && <div style={{ fontSize:13, color:'#888', fontWeight:500 }}>{businessName}</div>}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6, fontSize:11, color:'#2a7d4f', background:'rgba(42,125,79,0.07)', border:'0.5px solid rgba(42,125,79,0.2)', padding:'4px 10px', borderRadius:20, display:'inline-flex' }}>
              <span style={{ color:'#2a7d4f' }}>{IC.check}</span> Approved distributor
            </div>
          </div>
          <Link href="/portal/catalog" style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 22px', background:'#2d7dd2', color:'#fff', fontSize:12, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', borderRadius:4, textDecoration:'none', boxShadow:'0 4px 14px rgba(45,125,210,0.3)' }}>
            Browse catalog {IC.arrow}
          </Link>
        </div>

        {/* KPI CARDS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.5rem' }}>
          {[
            { icon:IC.orders,  label:'Total orders',    value:totalOrders,                    color:'#2d7dd2', sub:'all time' },
            { icon:IC.pending, label:'Active orders',   value:pendingOrders.length,            color:'#c49a00', sub:`${money(pendingValue)} in progress` },
            { icon:IC.value,   label:'Total purchased', value:money(totalSpent),               color:'#111',    sub:'lifetime value' },
            { icon:IC.done,    label:'Completed',       value:completedOrders.length,          color:'#2a7d4f', sub:'orders fulfilled' },
          ].map(k => (
            <div key={k.label} style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.07)', borderRadius:8, padding:'1.25rem 1.5rem', position:'relative', overflow:'hidden' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'#aaa', fontWeight:600 }}>{k.label}</div>
                <div style={{ color:'#ddd' }}>{k.icon}</div>
              </div>
              <div style={{ fontSize:26, fontWeight:900, color:k.color, marginBottom:4 }}>{k.value}</div>
              <div style={{ fontSize:11, color:'#bbb' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:'1.5rem' }}>
          {[
            { icon:IC.catalog, label:'Catalog',  desc:'Browse products & pricing',  href:'/portal/catalog',  color:'#2d7dd2' },
            { icon:IC.orders,  label:'Orders',   desc:'Track your order status',    href:'/portal/orders',   color:'#534ab7' },
            { icon:IC.invoice, label:'Invoices', desc:'Download & print invoices',  href:'/portal/invoices', color:'#c49a00' },
            { icon:IC.payment, label:'Payments', desc:'View balance & history',     href:'/portal/payments', color:'#2a7d4f' },
          ].map(item => (
            <Link key={item.label} href={item.href} style={{ textDecoration:'none' }}>
              <div style={{ background:'#fff', border:`1px solid rgba(0,0,0,0.06)`, borderTop:`3px solid ${item.color}`, borderRadius:8, padding:'1.25rem', cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'box-shadow 0.15s' }}>
                <div style={{ width:40, height:40, background:`${item.color}10`, border:`0.5px solid ${item.color}20`, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', color:item.color, flexShrink:0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#222', marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>{item.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.25rem' }}>

          {/* ORDERS TABLE */}
          <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.07)', borderRadius:8, overflow:'hidden' }}>
            <div style={{ padding:'1rem 1.5rem', borderBottom:'0.5px solid rgba(0,0,0,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>Recent orders</div>
              <Link href="/portal/orders" style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#2d7dd2', textDecoration:'none', fontWeight:600 }}>View all {IC.arrow}</Link>
            </div>

            {orders.length === 0 ? (
              <div style={{ padding:'3.5rem', textAlign:'center' }}>
                <div style={{ width:48, height:48, background:'rgba(45,125,210,0.07)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#2d7dd2' }}>{IC.orders}</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#333', marginBottom:6 }}>No orders yet</div>
                <div style={{ fontSize:12, color:'#bbb', marginBottom:'1.5rem' }}>Start by browsing our wholesale catalog</div>
                <Link href="/portal/catalog" style={{ padding:'9px 22px', background:'#2d7dd2', color:'#fff', fontSize:11, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', borderRadius:4, textDecoration:'none' }}>Browse catalog</Link>
              </div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#fafafa' }}>
                    {['Order','Date','Products','Total','Status','ETA'].map(h => (
                      <th key={h} style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'#bbb', padding:'9px 16px', textAlign:'left', fontWeight:600, borderBottom:'0.5px solid rgba(0,0,0,0.06)' }}>{h}</th>
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
                      <tr key={order.id} style={{ borderTop: i > 0 ? '0.5px solid rgba(0,0,0,0.05)' : 'none' }}>
                        <td style={{ padding:'12px 16px', fontSize:12, fontWeight:700, color:'#333' }}>#{order.order_number}</td>
                        <td style={{ padding:'12px 16px', fontSize:11, color:'#aaa' }}>{fmtDate(order.submitted_at)}</td>
                        <td style={{ padding:'12px 16px', fontSize:11, color:'#888' }}>{order.order_items?.length || 0} item{order.order_items?.length !== 1 ? 's' : ''}</td>
                        <td style={{ padding:'12px 16px', fontSize:13, fontWeight:700, color:'#111' }}>{money(order.total)}</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ fontSize:10, padding:'3px 9px', borderRadius:20, background:st.bg, color:st.color, border:`0.5px solid ${st.border}`, fontWeight:600 }}>{st.label}</span>
                        </td>
                        <td style={{ padding:'12px 16px', fontSize:11, color: order.eta ? (isPast && order.status !== 'completed' ? '#e74c3c' : '#2a7d4f') : '#ccc', fontWeight: order.eta ? 600 : 400 }}>
                          {order.eta ? (
                            <span style={{ display:'flex', alignItems:'center', gap:4 }}>{IC.truck} {etaStr}</span>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

            {/* ACCOUNT CARD */}
            <div style={{ background:'#111', borderRadius:8, padding:'1.5rem', color:'#fff' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.25rem' }}>
                <div style={{ width:46, height:46, borderRadius:'50%', background:'rgba(45,125,210,0.15)', border:'1.5px solid rgba(45,125,210,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#2d7dd2', flexShrink:0 }}>
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:1 }}>{displayName}</div>
                  {businessName && <div style={{ fontSize:11, color:'#555', marginBottom:2 }}>{businessName}</div>}
                  <div style={{ fontSize:10, color:'#444' }}>{user?.email}</div>
                </div>
              </div>
              {/* Account stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:'1rem' }}>
                {[
                  ['Orders',totalOrders,'#60a5fa'],
                  ['Completed',completedOrders.length,'#4ade80'],
                  ['Pending',pendingOrders.length,'#fbbf24'],
                  ['Total spent',money(totalSpent),'#a78bfa'],
                ].map(([l,v,c]) => (
                  <div key={l} style={{ padding:'8px 10px', background:'rgba(255,255,255,0.04)', borderRadius:5 }}>
                    <div style={{ fontSize:8, color:'#444', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:c }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#2a7d4f', background:'rgba(42,125,79,0.1)', border:'0.5px solid rgba(42,125,79,0.2)', padding:'7px 12px', borderRadius:4 }}>
                <span style={{ color:'#2a7d4f' }}>{IC.check}</span> Approved distributor
              </div>
            </div>

            {/* LAST ORDER */}
            {lastOrder && (
              <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.07)', borderRadius:8, padding:'1.25rem' }}>
                <div style={{ fontSize:10, color:'#bbb', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8, fontWeight:600 }}>Latest order</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#111', marginBottom:2 }}>#{lastOrder.order_number}</div>
                    <div style={{ fontSize:11, color:'#aaa' }}>{fmtDate(lastOrder.submitted_at)}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:16, fontWeight:800, color:'#111' }}>{money(lastOrder.total)}</div>
                    <span style={{ fontSize:9, padding:'2px 8px', borderRadius:10, background:STATUS[lastOrder.status]?.bg, color:STATUS[lastOrder.status]?.color, fontWeight:600 }}>{STATUS[lastOrder.status]?.label}</span>
                  </div>
                </div>
                {lastOrder.eta && (
                  <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#2a7d4f', padding:'6px 10px', background:'rgba(42,125,79,0.06)', borderRadius:4, fontWeight:600 }}>
                    {IC.truck} ETA: {new Date(lastOrder.eta + 'T00:00:00').toLocaleDateString('en-US', { month:'long', day:'numeric' })}
                  </div>
                )}
                <Link href="/portal/orders" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginTop:10, padding:'8px', background:'rgba(45,125,210,0.06)', border:'0.5px solid rgba(45,125,210,0.15)', borderRadius:4, fontSize:11, color:'#2d7dd2', textDecoration:'none', fontWeight:600 }}>
                  View all orders {IC.arrow}
                </Link>
              </div>
            )}

            {/* CONTACT */}
            <div style={{ background:'#fff', border:'0.5px solid rgba(0,0,0,0.07)', borderRadius:8, padding:'1.25rem' }}>
              <div style={{ fontSize:10, color:'#bbb', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12, fontWeight:600 }}>Your account team</div>
              <div style={{ fontSize:12, color:'#888', lineHeight:1.7, marginBottom:'0.875rem' }}>
                We're here Monday–Friday, 9:00 AM – 5:00 PM ET. Reach us anytime:
              </div>
              {[
                [IC.mail, 'partners@levamcorp.com', 'mailto:partners@levamcorp.com'],
                [IC.phone, '(786) 878-4122', 'tel:+17868784122'],
              ].map(([icon, label, href]) => (
                <a key={label} href={href} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#2d7dd2', textDecoration:'none', fontWeight:500, padding:'8px 12px', background:'rgba(45,125,210,0.05)', borderRadius:4, border:'0.5px solid rgba(45,125,210,0.12)', marginBottom:6 }}>
                  <span style={{ color:'#2d7dd2' }}>{icon}</span> {label}
                </a>
              ))}
            </div>

            {/* PERKS */}
            <div style={{ background:'linear-gradient(135deg,#0d0d0d,#1a1a2e)', borderRadius:8, padding:'1.25rem', border:'0.5px solid rgba(45,125,210,0.15)' }}>
              <div style={{ fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'#2d7dd2', marginBottom:12, fontWeight:700 }}>Partner benefits</div>
              {['Wholesale pricing on all products','Dedicated account support','Auto-generated invoices & quotes','Priority dispatch — 48h average'].map(p => (
                <div key={p} style={{ display:'flex', alignItems:'flex-start', gap:8, fontSize:11, color:'rgba(255,255,255,0.55)', marginBottom:8, lineHeight:1.5 }}>
                  <span style={{ color:'#2d7dd2', marginTop:1, flexShrink:0 }}>{IC.check}</span>{p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop:'1.5rem', padding:'0.875rem 1.25rem', background:'rgba(0,0,0,0.03)', border:'0.5px solid rgba(0,0,0,0.06)', borderRadius:6, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#bbb' }}>
            <span style={{ color:'#ccc' }}>{IC.pin}</span> Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178
          </div>
          <a href="mailto:partners@levamcorp.com" style={{ fontSize:11, color:'#2d7dd2', textDecoration:'none', fontWeight:500 }}>partners@levamcorp.com</a>
        </div>
      </div>
    </div>
  )
}
