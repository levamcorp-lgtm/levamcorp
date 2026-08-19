'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = n => n?.toLocaleString() ?? '0'
const pct = (a, b) => b ? Math.round((a / b) * 100) : 0

function KPI({ label, value, sub, color = '#0EA5E9', icon }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:10, padding:'1.25rem 1.5rem', borderTop:`3px solid ${color}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#888', letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</div>
        <div style={{ color, opacity:0.7 }}>{icon}</div>
      </div>
      <div style={{ fontSize:28, fontWeight:900, color:'#111', letterSpacing:'-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>{sub}</div>}
    </div>
  )
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const IC = {
  eye:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  users:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  box:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  search: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  zap:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  clock:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  trend:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
}

export default function AdminInsights() {
  const [events,       setEvents]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [range,        setRange]        = useState('7')  // days
  const [activeTab,    setActiveTab]    = useState('overview')

  useEffect(() => {
    load()
  }, [range])

  const load = async () => {
    setLoading(true)
    try {
      const sb   = createClient()
      const from = new Date()
      from.setDate(from.getDate() - parseInt(range))

      const { data } = await sb
        .from('analytics_events')
        .select('*')
        .gte('created_at', from.toISOString())
        .order('created_at', { ascending: false })

      setEvents(data || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  // ── DERIVED DATA ──────────────────────────────────────────────────────────
  const totalViews      = events.filter(e => e.event_type === 'page_view').length
  const productViews    = events.filter(e => e.event_type === 'product_view').length
  const productClicks   = events.filter(e => e.event_type === 'product_click').length
  const searches        = events.filter(e => e.event_type === 'catalog_search').length
  const ordersStarted   = events.filter(e => e.event_type === 'order_started').length
  const uniqueClients   = [...new Set(events.map(e => e.client_email).filter(Boolean))].length

  // Top products by views
  const productMap = {}
  events.filter(e => e.event_type === 'product_view' && e.product_name).forEach(e => {
    const k = e.product_id || e.product_name
    if (!productMap[k]) productMap[k] = { name: e.product_name, brand: e.product_brand, views: 0, clicks: 0 }
    productMap[k].views++
  })
  events.filter(e => e.event_type === 'product_click' && e.product_name).forEach(e => {
    const k = e.product_id || e.product_name
    if (productMap[k]) productMap[k].clicks++
  })
  const topProducts = Object.values(productMap).sort((a,b) => b.views - a.views).slice(0, 10)

  // Top clients by activity
  const clientMap = {}
  events.filter(e => e.client_email).forEach(e => {
    if (!clientMap[e.client_email]) clientMap[e.client_email] = {
      email: e.client_email, name: e.client_name || e.client_email,
      views: 0, productViews: 0, clicks: 0, lastSeen: e.created_at,
    }
    if (e.event_type === 'page_view')    clientMap[e.client_email].views++
    if (e.event_type === 'product_view') clientMap[e.client_email].productViews++
    if (e.event_type === 'product_click') clientMap[e.client_email].clicks++
    if (e.created_at > clientMap[e.client_email].lastSeen) clientMap[e.client_email].lastSeen = e.created_at
  })
  const topClients = Object.values(clientMap).sort((a,b) => b.productViews - a.productViews).slice(0, 10)

  // Top searches
  const searchMap = {}
  events.filter(e => e.event_type === 'catalog_search' && e.metadata?.query).forEach(e => {
    const q = e.metadata.query.toLowerCase()
    searchMap[q] = (searchMap[q] || 0) + 1
  })
  const topSearches = Object.entries(searchMap).sort((a,b) => b[1]-a[1]).slice(0, 8)

  // Recent activity feed
  const recentActivity = events.slice(0, 20)

  // High-interest products (viewed but not clicked = opportunity)
  const opportunities = topProducts.filter(p => p.views >= 2 && p.clicks === 0).slice(0, 5)

  const tabs = [
    { id:'overview', label:'Overview' },
    { id:'products', label:'Products' },
    { id:'clients',  label:'Clients' },
    { id:'activity', label:'Live feed' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#f7f8fa', fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #eee', padding:'1rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <Link href="/admin" style={{ fontSize:12, color:'#888', textDecoration:'none' }}>← Admin</Link>
          <h1 style={{ fontSize:18, fontWeight:800, color:'#111', margin:0 }}>Analytics & Insights</h1>
          <div style={{ fontSize:10, padding:'3px 10px', background:'rgba(14,165,233,0.1)', color:'#0EA5E9', borderRadius:20, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>Live</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:12, color:'#888' }}>Last</span>
          {['7','14','30','90'].map(d => (
            <button key={d} onClick={()=>setRange(d)}
              style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:6, cursor:'pointer', fontFamily:'inherit',
                background: range===d?'#111':'#fff', color: range===d?'#fff':'#666',
                border: range===d?'1px solid #111':'1px solid #e5e7eb' }}>
              {d}d
            </button>
          ))}
          <button onClick={load} style={{ fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:6, cursor:'pointer', fontFamily:'inherit', background:'#f0f0f0', border:'none', color:'#555' }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'2rem' }}>

        {/* ── KPI CARDS ──────────────────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12, marginBottom:'2rem' }}>
          <KPI label="Page views"      value={fmt(totalViews)}    sub={`Last ${range} days`}              color="#0EA5E9"  icon={IC.eye}/>
          <KPI label="Active clients"  value={fmt(uniqueClients)} sub="Unique logged-in clients"          color="#6366F1"  icon={IC.users}/>
          <KPI label="Product views"   value={fmt(productViews)}  sub={`${pct(productClicks,productViews)}% clicked`} color="#f59e0b" icon={IC.box}/>
          <KPI label="Add-to-order"    value={fmt(productClicks)} sub="Products requested"                color="#22c55e"  icon={IC.zap}/>
          <KPI label="Catalog searches"value={fmt(searches)}      sub="Search queries"                   color="#ec4899"  icon={IC.search}/>
          <KPI label="Orders started"  value={fmt(ordersStarted)} sub="Checkout initiated"               color="#14b8a6"  icon={IC.trend}/>
        </div>

        {/* ── TABS ───────────────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:0, marginBottom:'1.5rem', borderBottom:'2px solid #eee' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setActiveTab(t.id)}
              style={{ padding:'10px 20px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'transparent', border:'none',
                color: activeTab===t.id?'#111':'#aaa',
                borderBottom: activeTab===t.id?'2px solid #111':'2px solid transparent',
                marginBottom:'-2px' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#aaa', fontSize:14 }}>Loading analytics...</div>
        ) : events.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#333', marginBottom:8 }}>No data yet</div>
            <div style={{ fontSize:13, color:'#aaa', maxWidth:400, margin:'0 auto' }}>
              Once clients start browsing the portal, their activity will appear here. Make sure the tracking code is active in the catalog page.
            </div>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

                {/* Top products */}
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>Top products viewed</div>
                    <div style={{ fontSize:10, color:'#aaa' }}>Last {range} days</div>
                  </div>
                  {topProducts.slice(0,6).map((p,i) => (
                    <div key={i} style={{ padding:'0.75rem 1.25rem', borderBottom:'1px solid #f7f8fa', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:'#ccc', width:20 }}>#{i+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize:10, color:'#aaa' }}>{p.brand}</div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#0EA5E9' }}>{p.views} views</div>
                        {p.clicks > 0 && <div style={{ fontSize:10, padding:'2px 7px', background:'rgba(34,197,94,0.1)', color:'#22c55e', borderRadius:10, fontWeight:600 }}>{p.clicks} clicks</div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top clients */}
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>Most active clients</div>
                    <div style={{ fontSize:10, color:'#aaa' }}>By product views</div>
                  </div>
                  {topClients.slice(0,6).map((c,i) => (
                    <div key={i} style={{ padding:'0.75rem 1.25rem', borderBottom:'1px solid #f7f8fa', display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:`hsl(${i*47},60%,55%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>
                        {(c.name||c.email).charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                        <div style={{ fontSize:10, color:'#aaa' }}>{c.email}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#6366F1' }}>{c.productViews} views</div>
                        <div style={{ fontSize:10, color:'#aaa' }}>{c.clicks} clicks</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Opportunities */}
                {opportunities.length > 0 && (
                  <div style={{ background:'#fff', border:'1.5px solid rgba(245,158,11,0.3)', borderRadius:10, overflow:'hidden', gridColumn:'1/-1' }}>
                    <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid rgba(245,158,11,0.15)', background:'rgba(245,158,11,0.04)', display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:16 }}>💡</span>
                      <div style={{ fontSize:13, fontWeight:700, color:'#92400e' }}>Sales opportunities — viewed but never clicked</div>
                      <div style={{ fontSize:11, color:'#b45309', marginLeft:'auto' }}>These products have interest but no action taken</div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:0 }}>
                      {opportunities.map((p,i) => (
                        <div key={i} style={{ padding:'1rem 1.25rem', borderRight:'1px solid #fef3c7', borderBottom:'1px solid #fef3c7' }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:2 }}>{p.name}</div>
                          <div style={{ fontSize:10, color:'#aaa', marginBottom:6 }}>{p.brand}</div>
                          <div style={{ fontSize:11, color:'#f59e0b', fontWeight:600 }}>{p.views} clients viewed · 0 requested</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top searches */}
                {topSearches.length > 0 && (
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                    <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f0f0f0' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>What clients are searching</div>
                    </div>
                    <div style={{ padding:'1rem 1.25rem', display:'flex', flexWrap:'wrap', gap:8 }}>
                      {topSearches.map(([q,n]) => (
                        <div key={q} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', background:'#f7f8fa', borderRadius:20, border:'1px solid #eee' }}>
                          <span style={{ fontSize:11, fontWeight:600, color:'#333' }}>{q}</span>
                          <span style={{ fontSize:10, fontWeight:700, color:'#0EA5E9' }}>{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PRODUCTS TAB ─────────────────────────────────────────── */}
            {activeTab === 'products' && (
              <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>All products — sorted by interest</div>
                  <div style={{ fontSize:11, color:'#aaa' }}>{topProducts.length} products tracked</div>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#f7f8fa' }}>
                      {['#','Product','Brand','Views','Clicks','Conversion','Opportunity'].map(h => (
                        <th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:'#888', textAlign:'left', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid #eee' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={i} style={{ borderBottom:'1px solid #f7f8fa' }}>
                        <td style={{ padding:'10px 14px', fontSize:11, color:'#ccc', fontWeight:700 }}>#{i+1}</td>
                        <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:'#111' }}>{p.name}</td>
                        <td style={{ padding:'10px 14px', fontSize:11, color:'#888' }}>{p.brand}</td>
                        <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#0EA5E9' }}>{p.views}</td>
                        <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#22c55e' }}>{p.clicks}</td>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ flex:1, height:4, background:'#f0f0f0', borderRadius:2, overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${pct(p.clicks,p.views)}%`, background:'#22c55e', borderRadius:2 }}/>
                            </div>
                            <span style={{ fontSize:10, color:'#888', minWidth:28 }}>{pct(p.clicks,p.views)}%</span>
                          </div>
                        </td>
                        <td style={{ padding:'10px 14px' }}>
                          {p.views >= 2 && p.clicks === 0 && (
                            <div style={{ fontSize:10, padding:'3px 8px', background:'rgba(245,158,11,0.1)', color:'#f59e0b', borderRadius:10, fontWeight:700, display:'inline-block' }}>
                              Follow up
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── CLIENTS TAB ──────────────────────────────────────────── */}
            {activeTab === 'clients' && (
              <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f0f0f0' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>Client activity — last {range} days</div>
                </div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#f7f8fa' }}>
                      {['Client','Email','Page views','Product views','Clicks','Last seen','Status'].map(h => (
                        <th key={h} style={{ padding:'10px 14px', fontSize:10, fontWeight:700, color:'#888', textAlign:'left', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid #eee' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.map((c, i) => {
                      const daysSince = Math.floor((Date.now() - new Date(c.lastSeen)) / 86400000)
                      return (
                        <tr key={i} style={{ borderBottom:'1px solid #f7f8fa' }}>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ width:28, height:28, borderRadius:'50%', background:`hsl(${i*47},60%,55%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>
                                {(c.name||'?').charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize:12, fontWeight:600, color:'#111' }}>{c.name}</span>
                            </div>
                          </td>
                          <td style={{ padding:'10px 14px', fontSize:12, color:'#666' }}>{c.email}</td>
                          <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#333' }}>{c.views}</td>
                          <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#6366F1' }}>{c.productViews}</td>
                          <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#22c55e' }}>{c.clicks}</td>
                          <td style={{ padding:'10px 14px', fontSize:11, color:'#aaa', display:'flex', alignItems:'center', gap:4 }}>
                            {IC.clock} {daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince}d ago`}
                          </td>
                          <td style={{ padding:'10px 14px' }}>
                            {c.clicks === 0 && c.productViews >= 3
                              ? <div style={{ fontSize:10, padding:'3px 8px', background:'rgba(245,158,11,0.1)', color:'#f59e0b', borderRadius:10, fontWeight:700 }}>Reach out</div>
                              : c.clicks > 0
                              ? <div style={{ fontSize:10, padding:'3px 8px', background:'rgba(34,197,94,0.1)', color:'#22c55e', borderRadius:10, fontWeight:700 }}>Active buyer</div>
                              : <div style={{ fontSize:10, padding:'3px 8px', background:'rgba(0,0,0,0.04)', color:'#aaa', borderRadius:10, fontWeight:700 }}>Browsing</div>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── LIVE FEED TAB ─────────────────────────────────────────── */}
            {activeTab === 'activity' && (
              <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>Live activity feed</div>
                  <div style={{ fontSize:10, color:'#aaa' }}>Most recent first</div>
                </div>
                {recentActivity.map((e, i) => {
                  const eventLabels = {
                    page_view:      { label:'Viewed page',      color:'#6366F1', bg:'rgba(99,102,241,0.08)' },
                    product_view:   { label:'Viewed product',   color:'#0EA5E9', bg:'rgba(14,165,233,0.08)' },
                    product_click:  { label:'Requested product',color:'#22c55e', bg:'rgba(34,197,94,0.08)'  },
                    catalog_search: { label:'Searched catalog', color:'#f59e0b', bg:'rgba(245,158,11,0.08)' },
                    order_started:  { label:'Started order',    color:'#ec4899', bg:'rgba(236,72,153,0.08)' },
                  }
                  const ev = eventLabels[e.event_type] || { label:e.event_type, color:'#aaa', bg:'#f7f8fa' }
                  const time = new Date(e.created_at)
                  return (
                    <div key={i} style={{ padding:'0.75rem 1.25rem', borderBottom:'1px solid #f7f8fa', display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ fontSize:9, fontWeight:700, padding:'3px 8px', background:ev.bg, color:ev.color, borderRadius:10, whiteSpace:'nowrap', letterSpacing:'0.05em' }}>
                        {ev.label}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:'#333' }}>{e.client_name || e.client_email || 'Unknown'}</span>
                        {e.product_name && <span style={{ fontSize:12, color:'#888' }}> → {e.product_name}</span>}
                        {e.page && !e.product_name && <span style={{ fontSize:12, color:'#aaa' }}> {e.page}</span>}
                        {e.metadata?.query && <span style={{ fontSize:12, color:'#aaa' }}> "{e.metadata.query}"</span>}
                      </div>
                      <div style={{ fontSize:10, color:'#ccc', whiteSpace:'nowrap' }}>
                        {time.toLocaleDateString('en-US',{month:'short',day:'numeric'})} {time.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
