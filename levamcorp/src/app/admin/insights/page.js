'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

// ── MINI CHART COMPONENTS ─────────────────────────────────────────────────────
function BarChart({ data, color = '#2d7dd2', height = 80 }) {
  if (!data?.length) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:11 }}>No data</div>
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:3, height, paddingTop:8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, height:'100%', justifyContent:'flex-end' }}>
          <div title={`${d.label}: ${d.value}`} style={{ width:'100%', background:color, borderRadius:'2px 2px 0 0', height:`${(d.value/max)*100}%`, minHeight: d.value > 0 ? 3 : 0, opacity: d.value === 0 ? 0.2 : 1, transition:'height 0.4s ease', cursor:'default' }}/>
          <div style={{ fontSize:8, color:'#aaa', textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', width:'100%', textOverflow:'ellipsis' }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data, color = '#2d7dd2', height = 80 }) {
  if (!data?.length || data.length < 2) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:11 }}>Not enough data</div>
  const max = Math.max(...data.map(d => d.value), 1)
  const W = 300, H = height - 20
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (d.value / max) * H,
  }))
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H} L 0 ${H} Z`
  return (
    <div style={{ position:'relative', height }}>
      <svg viewBox={`0 0 ${W} ${H+20}`} style={{ width:'100%', height:'100%' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#grad-${color.replace('#','')})`}/>
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} opacity={0.8}/>
        ))}
      </svg>
    </div>
  )
}

function DonutChart({ data, size = 100 }) {
  if (!data?.length) return null
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null
  const colors = ['#2d7dd2','#22c55e','#f59e0b','#e74c3c','#8b5cf6','#14b8a6']
  let cumulative = 0
  const r = 35, cx = 50, cy = 50, circumference = 2 * Math.PI * r

  return (
    <div style={{ display:'flex', alignItems:'center', gap:16 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {data.map((d, i) => {
          const pct = d.value / total
          const offset = circumference * (1 - cumulative)
          const dash = circumference * pct
          cumulative += pct
          return (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={colors[i % colors.length]} strokeWidth="18"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={offset}
              style={{ transform:'rotate(-90deg)', transformOrigin:'center', transition:'all 0.5s ease' }}/>
          )
        })}
        <circle cx={cx} cy={cy} r={24} fill="#fff"/>
        <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill="#111">{total}</text>
        <text x={cx} y={cy+14} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="#aaa">total</text>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:colors[i % colors.length], flexShrink:0 }}/>
            <span style={{ fontSize:11, color:'#555', flex:1 }}>{d.label}</span>
            <span style={{ fontSize:11, fontWeight:700, color:'#111' }}>{d.value}</span>
            <span style={{ fontSize:10, color:'#aaa' }}>{Math.round((d.value/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SparkLine({ values, color = '#2d7dd2' }) {
  if (!values?.length) return null
  const max = Math.max(...values, 1)
  const W = 80, H = 28
  const pts = values.map((v, i) => ({ x:(i/(values.length-1))*W, y:H-(v/max)*H }))
  const d = pts.map((p,i) => `${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ')
  return (
    <svg width={W} height={H} style={{ display:'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── KPI CARD ──────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, color='#2d7dd2', icon, trend, sparkValues }) {
  const trendUp = trend > 0
  return (
    <div style={{ background:'#fff', border:'1px solid #f0f0f0', borderRadius:10, padding:'1.25rem 1.5rem', borderTop:`3px solid ${color}`, display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#888', letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</div>
        <div style={{ color, opacity:0.7 }}>{icon}</div>
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:28, fontWeight:900, color:'#111', letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>{sub}</div>}
        </div>
        {sparkValues && <SparkLine values={sparkValues} color={color}/>}
      </div>
      {trend !== undefined && (
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color: trendUp?'#22c55e':'#e74c3c', fontWeight:600 }}>
          <span>{trendUp ? '↑' : '↓'} {Math.abs(trend)}%</span>
          <span style={{ color:'#aaa', fontWeight:400 }}>vs prev period</span>
        </div>
      )}
    </div>
  )
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const IC = {
  eye:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  users:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  box:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  zap:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  cart:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  clock:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  fire:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  dollar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AdminInsights() {
  const [events,   setEvents]   = useState([])
  const [orders,   setOrders]   = useState([])
  const [clients,  setClients]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [range,    setRange]    = useState('30')
  const [tab,      setTab]      = useState('overview')

  useEffect(() => { load() }, [range])

  const load = async () => {
    setLoading(true)
    try {
      const sb   = createClient()
      const from = new Date()
      from.setDate(from.getDate() - parseInt(range))
      const fromISO = from.toISOString()

      const [evRes, ordRes, cliRes] = await Promise.all([
        sb.from('analytics_events').select('*').gte('created_at', fromISO).order('created_at', { ascending: false }),
        sb.from('orders').select('*,order_items(*)').gte('created_at', fromISO).order('created_at', { ascending: false }),
        sb.from('clients').select('*').order('created_at', { ascending: false }),
      ])
      setEvents(evRes.data || [])
      setOrders(ordRes.data || [])
      setClients(cliRes.data || [])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  // ── DERIVED ───────────────────────────────────────────────────────────────
  const pageViews    = events.filter(e => e.event_type === 'page_view')
  const productViews = events.filter(e => e.event_type === 'product_view')
  const clicks       = events.filter(e => e.event_type === 'product_click')
  const searches     = events.filter(e => e.event_type === 'catalog_search')
  const uniqueEmails = [...new Set(events.map(e => e.client_email).filter(Boolean))]

  // Daily breakdown for charts
  const days = parseInt(range)
  const dailyLabels = Array.from({ length: Math.min(days, 14) }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (Math.min(days,14) - 1 - i))
    return d.toLocaleDateString('en-US', { month:'short', day:'numeric' })
  })
  const dailyData = (evType) => dailyLabels.map(label => ({
    label,
    value: events.filter(e => {
      if (evType && e.event_type !== evType) return false
      const d = new Date(e.created_at)
      return d.toLocaleDateString('en-US', { month:'short', day:'numeric' }) === label
    }).length
  }))

  // Product stats
  const productMap = {}
  productViews.forEach(e => {
    const k = e.product_id || e.product_name
    if (!k) return
    if (!productMap[k]) productMap[k] = { name:e.product_name, brand:e.product_brand, views:0, clicks:0, searches:0 }
    productMap[k].views++
  })
  clicks.forEach(e => {
    const k = e.product_id || e.product_name
    if (productMap[k]) productMap[k].clicks++
  })
  const topProducts = Object.values(productMap).sort((a,b) => b.views - a.views)
  const opportunities = topProducts.filter(p => p.views >= 2 && p.clicks === 0)

  // Client stats
  const clientMap = {}
  events.filter(e => e.client_email).forEach(e => {
    if (!clientMap[e.client_email]) clientMap[e.client_email] = {
      email:e.client_email, name:e.client_name||e.client_email,
      pageViews:0, productViews:0, clicks:0, searches:0, lastSeen:e.created_at,
      days: new Set()
    }
    const c = clientMap[e.client_email]
    if (e.event_type==='page_view')     c.pageViews++
    if (e.event_type==='product_view')  c.productViews++
    if (e.event_type==='product_click') c.clicks++
    if (e.event_type==='catalog_search') c.searches++
    if (e.created_at > c.lastSeen)      c.lastSeen = e.created_at
    c.days.add(new Date(e.created_at).toDateString())
  })
  const topClients = Object.values(clientMap).sort((a,b) => b.productViews - a.productViews)

  // Revenue from orders
  const totalRevenue  = orders.reduce((s,o) => s + (o.total||0), 0)
  const avgOrderValue = orders.length ? totalRevenue/orders.length : 0

  // Search terms
  const searchMap = {}
  searches.forEach(e => {
    const q = e.metadata?.query?.toLowerCase()
    if (q) searchMap[q] = (searchMap[q]||0)+1
  })
  const topSearches = Object.entries(searchMap).sort((a,b)=>b[1]-a[1]).slice(0,10)

  // Category breakdown
  const catMap = {}
  productViews.forEach(e => {
    const brand = e.product_brand || 'Unknown'
    catMap[brand] = (catMap[brand]||0)+1
  })
  const brandData = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([label,value])=>({label,value}))

  // Hourly activity (what time do clients browse?)
  const hourMap = Array(24).fill(0)
  events.forEach(e => { hourMap[new Date(e.created_at).getHours()]++ })
  const peakHour = hourMap.indexOf(Math.max(...hourMap))
  const hourData = hourMap.map((value,i) => ({ label: i%4===0?`${i}h`:'', value }))

  // Conversion funnel
  const funnel = [
    { label:'Page views',      value:pageViews.length,   color:'#2d7dd2' },
    { label:'Product views',   value:productViews.length,color:'#6366f1' },
    { label:'Add to quote',    value:clicks.length,       color:'#f59e0b' },
    { label:'Orders placed',   value:orders.length,       color:'#22c55e' },
  ]
  const funnelMax = funnel[0].value || 1

  const tabs = [
    { id:'overview',  label:'Overview'    },
    { id:'products',  label:'Products'    },
    { id:'clients',   label:'Clients'     },
    { id:'revenue',   label:'Revenue'     },
    { id:'activity',  label:'Live feed'   },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#f4f5f7', fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif' }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .insight-section { animation: fadeIn 0.3s ease }
        table { border-collapse: collapse; width: 100% }
        th, td { text-align: left; }
      `}</style>

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ background:'#fff', borderBottom:'1px solid #eee', padding:'1rem 2rem', position:'sticky', top:0, zIndex:40 }}>
        <div style={{ maxWidth:1300, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <Link href="/admin/dashboard" style={{ fontSize:12, color:'#888', textDecoration:'none' }}>← Dashboard</Link>
            <div style={{ width:1, height:16, background:'#eee' }}/>
            <h1 style={{ fontSize:18, fontWeight:800, color:'#111', margin:0 }}>Analytics & Insights</h1>
            <div style={{ fontSize:9, padding:'3px 10px', background:'rgba(34,197,94,0.1)', color:'#22c55e', borderRadius:20, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }}/>Live
            </div>
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontSize:11, color:'#888' }}>Period:</span>
            {[['7','7 days'],['14','14 days'],['30','30 days'],['90','90 days']].map(([val,label]) => (
              <button key={val} onClick={()=>setRange(val)}
                style={{ fontSize:11, fontWeight:700, padding:'5px 14px', borderRadius:20, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
                  background:range===val?'#111':'#fff', color:range===val?'#fff':'#666', border:range===val?'1px solid #111':'1px solid #e5e7eb' }}>
                {label}
              </button>
            ))}
            <button onClick={load} style={{ fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:20, cursor:'pointer', fontFamily:'inherit', background:'#f0f0f0', border:'none', color:'#555', marginLeft:4 }}>
              ↻
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1300, margin:'0 auto', padding:'1.5rem 2rem' }}>

        {/* ── KPI STRIP ────────────────────────────────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:10, marginBottom:'1.5rem' }}>
          <KPI label="Page views"       value={pageViews.length.toLocaleString()}    color="#2d7dd2" icon={IC.eye}    sparkValues={dailyData('page_view').map(d=>d.value)}/>
          <KPI label="Active clients"   value={uniqueEmails.length}                  color="#6366f1" icon={IC.users}  sparkValues={dailyData().map(d=>d.value)}/>
          <KPI label="Product views"    value={productViews.length.toLocaleString()} color="#f59e0b" icon={IC.box}    sparkValues={dailyData('product_view').map(d=>d.value)}/>
          <KPI label="Add to quote"     value={clicks.length.toLocaleString()}        color="#22c55e" icon={IC.zap}   sparkValues={dailyData('product_click').map(d=>d.value)}/>
          <KPI label="Orders"           value={orders.length.toLocaleString()}        color="#14b8a6" icon={IC.cart}  sparkValues={orders.slice(-14).map(_=>1)}/>
          <KPI label="Revenue"          value={`$${totalRevenue.toLocaleString()}`}   color="#e74c3c" icon={IC.dollar}/>
          <KPI label="Avg order value"  value={`$${Math.round(avgOrderValue).toLocaleString()}`} color="#8b5cf6" icon={IC.dollar}/>
          <KPI label="Searches"         value={searches.length.toLocaleString()}      color="#ec4899" icon={IC.search}/>
        </div>

        {/* ── CONVERSION FUNNEL ────────────────────────────────────────── */}
        <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.25rem 1.5rem', marginBottom:'1.5rem' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:'1rem' }}>Conversion funnel</div>
          <div style={{ display:'flex', gap:0, alignItems:'stretch' }}>
            {funnel.map((f, i) => (
              <div key={f.label} style={{ flex:1, display:'flex', flexDirection:'column', gap:8, position:'relative' }}>
                <div style={{ height:8, background: f.color, width:`${(f.value/funnelMax)*100}%`, borderRadius:4, transition:'width 0.6s ease', minWidth: f.value > 0 ? 8 : 0 }}/>
                <div style={{ fontSize:20, fontWeight:900, color:'#111' }}>{f.value.toLocaleString()}</div>
                <div style={{ fontSize:11, color:'#888' }}>{f.label}</div>
                {i > 0 && funnel[i-1].value > 0 && (
                  <div style={{ fontSize:10, color: f.value/funnel[i-1].value > 0.5 ? '#22c55e' : '#e74c3c', fontWeight:700 }}>
                    {Math.round((f.value/funnel[i-1].value)*100)}% conv.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ─────────────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:0, borderBottom:'2px solid #eee', marginBottom:'1.5rem', background:'#fff', borderRadius:'8px 8px 0 0', padding:'0 1rem' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ padding:'12px 18px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'transparent', border:'none',
                color:tab===t.id?'#111':'#aaa', borderBottom:tab===t.id?'2px solid #111':'2px solid transparent', marginBottom:'-2px', transition:'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'4rem', color:'#aaa', fontSize:14 }}>Loading data...</div>
        ) : (

          <div className="insight-section">

            {/* ── OVERVIEW ─────────────────────────────────────────────── */}
            {tab === 'overview' && (
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>

                {/* Activity over time */}
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.25rem 1.5rem' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:'0.5rem' }}>Activity over time</div>
                  <div style={{ fontSize:10, color:'#aaa', marginBottom:'1rem' }}>Page views per day · last {Math.min(days,14)} days</div>
                  <BarChart data={dailyData('page_view')} color="#2d7dd2" height={120}/>
                </div>

                {/* Peak hours */}
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.25rem 1.5rem' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:'0.5rem' }}>When clients browse</div>
                  <div style={{ fontSize:10, color:'#aaa', marginBottom:'1rem' }}>Peak hour: {peakHour}:00 – {peakHour+1}:00</div>
                  <BarChart data={hourData} color="#6366f1" height={120}/>
                </div>

                {/* Top products */}
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.25rem 1.5rem' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:'1rem' }}>Top products by interest</div>
                  {topProducts.slice(0,8).map((p,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f7f8fa' }}>
                      <div style={{ fontSize:10, fontWeight:800, color:'#ccc', width:18 }}>#{i+1}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize:10, color:'#aaa' }}>{p.brand}</div>
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#2d7dd2', display:'flex', alignItems:'center', gap:3 }}>{IC.eye} {p.views}</div>
                        <div style={{ fontSize:11, fontWeight:700, color:'#22c55e', display:'flex', alignItems:'center', gap:3 }}>{IC.zap} {p.clicks}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Brand breakdown donut */}
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.25rem 1.5rem', flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:'1rem' }}>Views by brand</div>
                    {brandData.length > 0
                      ? <DonutChart data={brandData}/>
                      : <div style={{ fontSize:11, color:'#ccc', textAlign:'center', padding:'1rem' }}>No brand data yet</div>
                    }
                  </div>

                  {/* Searches */}
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.25rem 1.5rem', flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:'1rem' }}>Top search terms</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {topSearches.length > 0
                        ? topSearches.map(([q,n]) => (
                          <div key={q} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', background:'#f7f8fa', borderRadius:20, border:'1px solid #eee' }}>
                            <span style={{ fontSize:11, color:'#333', fontWeight:600 }}>{q}</span>
                            <span style={{ fontSize:10, fontWeight:700, color:'#2d7dd2', background:'rgba(45,125,210,0.1)', padding:'1px 6px', borderRadius:10 }}>{n}</span>
                          </div>
                        ))
                        : <div style={{ fontSize:11, color:'#ccc' }}>No searches yet</div>
                      }
                    </div>
                  </div>
                </div>

                {/* OPPORTUNITIES */}
                {opportunities.length > 0 && (
                  <div style={{ gridColumn:'1/-1', background:'#fff', border:'2px solid rgba(245,158,11,0.3)', borderRadius:10, overflow:'hidden' }}>
                    <div style={{ padding:'1rem 1.5rem', background:'rgba(245,158,11,0.05)', borderBottom:'1px solid rgba(245,158,11,0.15)', display:'flex', alignItems:'center', gap:10 }}>
                      <span>{IC.fire}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:'#92400e' }}>Sales opportunities — {opportunities.length} products with interest but no action</div>
                        <div style={{ fontSize:11, color:'#b45309' }}>These clients viewed but didn't add to quote — reach out and close the sale</div>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:0 }}>
                      {opportunities.slice(0,6).map((p,i) => (
                        <div key={i} style={{ padding:'1rem 1.25rem', borderRight:'1px solid #fef3c7', borderBottom:'1px solid #fef3c7' }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:2 }}>{p.name}</div>
                          <div style={{ fontSize:10, color:'#aaa', marginBottom:6 }}>{p.brand}</div>
                          <div style={{ fontSize:11, color:'#f59e0b', fontWeight:600 }}>{p.views} views · 0 quote requests</div>
                          <div style={{ fontSize:10, color:'#bbb', marginTop:2 }}>Contact these clients and offer a deal</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── PRODUCTS ─────────────────────────────────────────────── */}
            {tab === 'products' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

                {/* Product views line chart */}
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.25rem 1.5rem' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:'0.5rem' }}>Product view trend</div>
                  <div style={{ fontSize:10, color:'#aaa', marginBottom:'1rem' }}>Daily product views · last {Math.min(days,14)} days</div>
                  <LineChart data={dailyData('product_view')} color="#f59e0b" height={100}/>
                </div>

                {/* Full product table */}
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>All products ranked by interest</div>
                    <div style={{ fontSize:11, color:'#aaa' }}>{topProducts.length} products tracked</div>
                  </div>
                  <table>
                    <thead>
                      <tr style={{ background:'#f7f8fa' }}>
                        {['#','Product','Brand','Views','Quote requests','Conversion','Revenue potential','Action'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', fontSize:9, fontWeight:700, color:'#888', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid #eee' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => {
                        const conv = p.views > 0 ? Math.round((p.clicks/p.views)*100) : 0
                        return (
                          <tr key={i} style={{ borderBottom:'1px solid #f7f8fa', background: i%2===0?'#fff':'#fafafa' }}>
                            <td style={{ padding:'10px 14px', fontSize:11, color:'#ccc', fontWeight:700 }}>#{i+1}</td>
                            <td style={{ padding:'10px 14px', fontSize:13, fontWeight:600, color:'#111' }}>{p.name}</td>
                            <td style={{ padding:'10px 14px', fontSize:11, color:'#888' }}>{p.brand}</td>
                            <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#2d7dd2' }}>{p.views}</td>
                            <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#22c55e' }}>{p.clicks}</td>
                            <td style={{ padding:'10px 14px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <div style={{ flex:1, height:6, background:'#f0f0f0', borderRadius:3, overflow:'hidden', maxWidth:80 }}>
                                  <div style={{ height:'100%', width:`${conv}%`, background:conv>50?'#22c55e':conv>20?'#f59e0b':'#e74c3c', borderRadius:3, transition:'width 0.4s' }}/>
                                </div>
                                <span style={{ fontSize:11, color:'#888', minWidth:32 }}>{conv}%</span>
                              </div>
                            </td>
                            <td style={{ padding:'10px 14px', fontSize:11, color:'#888' }}>
                              {p.views > 0 ? `${p.views} potential orders` : '—'}
                            </td>
                            <td style={{ padding:'10px 14px' }}>
                              {p.views >= 2 && p.clicks === 0
                                ? <span style={{ fontSize:10, padding:'3px 8px', background:'rgba(245,158,11,0.1)', color:'#f59e0b', borderRadius:10, fontWeight:700 }}>Follow up</span>
                                : p.clicks > 2
                                ? <span style={{ fontSize:10, padding:'3px 8px', background:'rgba(34,197,94,0.1)', color:'#22c55e', borderRadius:10, fontWeight:700 }}>Hot product</span>
                                : null
                              }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {topProducts.length === 0 && (
                    <div style={{ padding:'3rem', textAlign:'center', color:'#ccc', fontSize:13 }}>No product view data yet. Make sure analytics tracking is active in the portal catalog.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── CLIENTS ──────────────────────────────────────────────── */}
            {tab === 'clients' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {/* Client activity trend */}
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.25rem 1.5rem' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:'0.5rem' }}>Daily active clients</div>
                    <LineChart data={dailyLabels.map(label => ({
                      label,
                      value: [...new Set(events.filter(e => e.client_email && new Date(e.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})===label).map(e=>e.client_email))].length
                    }))} color="#6366f1" height={100}/>
                  </div>

                  {/* Client engagement breakdown */}
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.25rem 1.5rem' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#111', marginBottom:'1rem' }}>Client engagement breakdown</div>
                    <DonutChart size={90} data={[
                      { label:'Active buyers', value:topClients.filter(c=>c.clicks>0).length },
                      { label:'Just browsing', value:topClients.filter(c=>c.clicks===0&&c.productViews>0).length },
                      { label:'Reach out now', value:topClients.filter(c=>c.productViews>=3&&c.clicks===0).length },
                    ].filter(d=>d.value>0)}/>
                  </div>
                </div>

                {/* Client table */}
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #f0f0f0' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>All client activity — last {range} days</div>
                  </div>
                  <table>
                    <thead>
                      <tr style={{ background:'#f7f8fa' }}>
                        {['Client','Email','Page views','Product views','Quotes','Active days','Last seen','Status','Action'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', fontSize:9, fontWeight:700, color:'#888', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid #eee' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topClients.map((c, i) => {
                        const days = [...c.days].length
                        const daysSince = Math.floor((Date.now()-new Date(c.lastSeen))/86400000)
                        const isHot = c.clicks > 2
                        const needsFollowup = c.productViews >= 3 && c.clicks === 0
                        return (
                          <tr key={i} style={{ borderBottom:'1px solid #f7f8fa', background: needsFollowup?'rgba(245,158,11,0.02)':isHot?'rgba(34,197,94,0.02)':'#fff' }}>
                            <td style={{ padding:'10px 14px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ width:28,height:28,borderRadius:'50%',background:`hsl(${i*47},60%,55%)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0 }}>
                                  {(c.name||'?').charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize:12, fontWeight:600, color:'#111' }}>{c.name}</span>
                              </div>
                            </td>
                            <td style={{ padding:'10px 14px', fontSize:11, color:'#666' }}>{c.email}</td>
                            <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#333' }}>{c.pageViews}</td>
                            <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#6366f1' }}>{c.productViews}</td>
                            <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#22c55e' }}>{c.clicks}</td>
                            <td style={{ padding:'10px 14px', fontSize:12, color:'#888' }}>{days} day{days!==1?'s':''}</td>
                            <td style={{ padding:'10px 14px', fontSize:11, color:'#aaa' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                                {IC.clock} {daysSince===0?'Today':daysSince===1?'Yesterday':`${daysSince}d ago`}
                              </div>
                            </td>
                            <td style={{ padding:'10px 14px' }}>
                              {isHot
                                ? <span style={{ fontSize:10,padding:'3px 8px',background:'rgba(34,197,94,0.1)',color:'#22c55e',borderRadius:10,fontWeight:700 }}>Active buyer</span>
                                : needsFollowup
                                ? <span style={{ fontSize:10,padding:'3px 8px',background:'rgba(245,158,11,0.1)',color:'#f59e0b',borderRadius:10,fontWeight:700 }}>Reach out</span>
                                : <span style={{ fontSize:10,padding:'3px 8px',background:'rgba(0,0,0,0.04)',color:'#aaa',borderRadius:10,fontWeight:700 }}>Browsing</span>
                              }
                            </td>
                            <td style={{ padding:'10px 14px' }}>
                              <a href={`mailto:${c.email}`} style={{ fontSize:10, color:'#2d7dd2', textDecoration:'none', fontWeight:600, padding:'4px 10px', border:'1px solid rgba(45,125,210,0.25)', borderRadius:10, background:'rgba(45,125,210,0.04)' }}>
                                Email →
                              </a>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {topClients.length === 0 && (
                    <div style={{ padding:'3rem', textAlign:'center', color:'#ccc', fontSize:13 }}>No client activity yet in this period.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── REVENUE ──────────────────────────────────────────────── */}
            {tab === 'revenue' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.5rem', textAlign:'center', borderTop:'3px solid #22c55e' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#888', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Total revenue</div>
                    <div style={{ fontSize:36, fontWeight:900, color:'#111', letterSpacing:'-0.02em' }}>${totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>Last {range} days</div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.5rem', textAlign:'center', borderTop:'3px solid #2d7dd2' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#888', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Orders placed</div>
                    <div style={{ fontSize:36, fontWeight:900, color:'#111', letterSpacing:'-0.02em' }}>{orders.length}</div>
                    <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>Completed orders</div>
                  </div>
                  <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, padding:'1.5rem', textAlign:'center', borderTop:'3px solid #8b5cf6' }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'#888', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Avg order value</div>
                    <div style={{ fontSize:36, fontWeight:900, color:'#111', letterSpacing:'-0.02em' }}>${Math.round(avgOrderValue).toLocaleString()}</div>
                    <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>Per order</div>
                  </div>
                </div>

                {/* Orders table */}
                <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #f0f0f0' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>Recent orders</div>
                  </div>
                  <table>
                    <thead>
                      <tr style={{ background:'#f7f8fa' }}>
                        {['Order #','Client','Date','Items','Total','Status'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', fontSize:9, fontWeight:700, color:'#888', letterSpacing:'0.06em', textTransform:'uppercase', borderBottom:'1px solid #eee' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0,20).map((o,i) => (
                        <tr key={i} style={{ borderBottom:'1px solid #f7f8fa' }}>
                          <td style={{ padding:'10px 14px', fontSize:12, fontWeight:700, color:'#2d7dd2' }}>#{o.order_number||o.id?.slice(0,8)}</td>
                          <td style={{ padding:'10px 14px', fontSize:12, color:'#555' }}>{o.client_email||o.notes?.split('Email: ')[1]?.split(' |')[0]||'—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:11, color:'#888' }}>{new Date(o.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                          <td style={{ padding:'10px 14px', fontSize:12, color:'#555' }}>{o.order_items?.length||'—'} items</td>
                          <td style={{ padding:'10px 14px', fontSize:13, fontWeight:700, color:'#111' }}>${(o.total||0).toLocaleString()}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <span style={{ fontSize:10, padding:'3px 10px', borderRadius:10, fontWeight:700,
                              background:o.status==='completed'?'rgba(34,197,94,0.1)':o.status==='new'?'rgba(45,125,210,0.1)':'rgba(245,158,11,0.1)',
                              color:o.status==='completed'?'#22c55e':o.status==='new'?'#2d7dd2':'#f59e0b' }}>
                              {o.status||'new'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div style={{ padding:'3rem', textAlign:'center', color:'#ccc', fontSize:13 }}>No orders in this period.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── LIVE FEED ─────────────────────────────────────────────── */}
            {tab === 'activity' && (
              <div style={{ background:'#fff', border:'1px solid #eee', borderRadius:10, overflow:'hidden' }}>
                <div style={{ padding:'1rem 1.5rem', borderBottom:'1px solid #f0f0f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#111' }}>Live activity feed</div>
                  <div style={{ fontSize:10, color:'#aaa' }}>{events.length} events in last {range} days</div>
                </div>
                {events.slice(0,50).map((e,i) => {
                  const types = {
                    page_view:      { label:'Page view',        color:'#6366f1', bg:'rgba(99,102,241,0.08)' },
                    product_view:   { label:'Viewed product',   color:'#2d7dd2', bg:'rgba(45,125,210,0.08)' },
                    product_click:  { label:'Added to quote',   color:'#22c55e', bg:'rgba(34,197,94,0.08)'  },
                    catalog_search: { label:'Searched',         color:'#f59e0b', bg:'rgba(245,158,11,0.08)' },
                    order_started:  { label:'Order started',    color:'#ec4899', bg:'rgba(236,72,153,0.08)' },
                  }
                  const ev = types[e.event_type]||{label:e.event_type,color:'#aaa',bg:'#f7f8fa'}
                  const time = new Date(e.created_at)
                  return (
                    <div key={i} style={{ padding:'0.75rem 1.5rem', borderBottom:'1px solid #f7f8fa', display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ fontSize:9, fontWeight:700, padding:'3px 8px', background:ev.bg, color:ev.color, borderRadius:10, whiteSpace:'nowrap', letterSpacing:'0.05em', flexShrink:0 }}>
                        {ev.label}
                      </div>
                      <div style={{ flex:1, minWidth:0, fontSize:12, color:'#555' }}>
                        <span style={{ fontWeight:600, color:'#111' }}>{e.client_name||e.client_email||'Unknown'}</span>
                        {e.product_name && <span style={{ color:'#888' }}> → {e.product_name}</span>}
                        {e.page && !e.product_name && <span style={{ color:'#aaa' }}> {e.page}</span>}
                        {e.metadata?.query && <span style={{ color:'#aaa' }}> "{e.metadata.query}"</span>}
                      </div>
                      <div style={{ fontSize:10, color:'#ccc', whiteSpace:'nowrap', flexShrink:0 }}>
                        {time.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {time.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                  )
                })}
                {events.length === 0 && (
                  <div style={{ padding:'3rem', textAlign:'center', color:'#ccc', fontSize:13 }}>No events yet. Clients need to browse the portal for data to appear.</div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
