'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const PARTNERS = ['Victor', 'Leopoldo']
const EXPENSE_CATS = ['Rent/Storage','Shipping & Logistics','Marketing','Software & Tools','Utilities','Office','Travel','Legal & Accounting','Other']

const money = (n) => '$'+(parseFloat(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
const moneyK = (n) => { const v = parseFloat(n)||0; return v >= 1000 ? '$'+(v/1000).toFixed(1)+'k' : '$'+v.toLocaleString() }
const fmt = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'
const fmtM = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'}) : '—'

const inp = {width:'100%',background:'#1a1a1a',border:'0.5px solid rgba(255,255,255,0.1)',color:'#ddd',fontSize:12,padding:'9px 10px',borderRadius:4,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}
const lbl = {fontSize:9,color:'#777',textTransform:'uppercase',letterSpacing:'0.1em',display:'block',marginBottom:4}

export default function AdminProfit() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [inventory, setInventory] = useState([])
  const [partnerTx, setPartnerTx] = useState([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))
  const [view, setView] = useState('overview') // overview | expenses | inventory | partners
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddInventory, setShowAddInventory] = useState(false)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expForm, setExpForm] = useState({date:new Date().toISOString().split('T')[0],category:'Rent/Storage',description:'',amount:'',paid_by:'company',notes:''})
  const [invForm, setInvForm] = useState({date:new Date().toISOString().split('T')[0],product_name:'',supplier:'',units:'',unit_cost:'',paid_by:'company',notes:''})
  const [ptxForm, setPtxForm] = useState({date:new Date().toISOString().split('T')[0],partner:'Victor',type:'investment',amount:'',description:'',notes:''})

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({data}) => {
      if (!data.user||!ADMIN_EMAILS.includes(data.user.email)) {window.location.href='/admin';return}
      await loadAll(sb)
    })
  },[])

  const loadAll = async (sb) => {
    sb = sb||createClient()
    const [
      {data:o},{data:p},{data:e},{data:iv},{data:pt}
    ] = await Promise.all([
      sb.from('orders').select('*,order_items(*)').order('submitted_at',{ascending:false}),
      sb.from('products').select('*'),
      sb.from('expenses').select('*').order('date',{ascending:false}),
      sb.from('inventory_purchases').select('*').order('date',{ascending:false}),
      sb.from('partner_transactions').select('*').order('date',{ascending:false}),
    ])
    setOrders(o||[]); setProducts(p||[]); setExpenses(e||[]); setInventory(iv||[]); setPartnerTx(pt||[])
    setLoading(false)
  }

  const logout = async () => { await createClient().auth.signOut(); window.location.href='/admin' }

  // ── CALCULATIONS ──────────────────────────────────────────
  const inMonth = (dateStr) => dateStr && dateStr.startsWith(month)
  const inMonthTS = (ts) => ts && new Date(ts).toISOString().slice(0,7) === month

  // Revenue from confirmed/dispatched/completed orders this month
  const monthOrders = orders.filter(o => inMonthTS(o.submitted_at) && ['confirmed','dispatched','completed'].includes(o.status))
  const revenue = monthOrders.reduce((s,o)=>s+(o.total||0),0)
  const collected = monthOrders.reduce((s,o)=>s+(parseFloat(o.amount_paid)||0),0)
  const outstanding = monthOrders.reduce((s,o)=>s+Math.max(0,(o.total||0)-(parseFloat(o.amount_paid)||0)),0)

  // COGS from order items × product cost
  const cogs = monthOrders.reduce((s,o) => {
    return s + (o.order_items||[]).reduce((ss,item) => {
      const prod = products.find(p=>p.id===item.product_id||p.name===item.product_name)
      return ss + ((prod?.cost_price||0)*item.quantity)
    },0)
  },0)

  // Monthly expenses
  const monthExpenses = expenses.filter(e=>inMonth(e.date))
  const totalExpenses = monthExpenses.reduce((s,e)=>s+(e.amount||0),0)

  // Monthly inventory purchases
  const monthInventory = inventory.filter(i=>inMonth(i.date))
  const totalInventory = monthInventory.reduce((s,i)=>s+(i.total_cost||0),0)

  // Gross profit = revenue - cogs
  const grossProfit = revenue - cogs

  // Net profit = gross - expenses (NOT including inventory purchases — those are assets)
  const netProfit = grossProfit - totalExpenses

  // Profit per partner (50/50)
  const profitPerPartner = netProfit / 2

  // All-time totals
  const allRevenue = orders.filter(o=>['confirmed','dispatched','completed'].includes(o.status)).reduce((s,o)=>s+(o.total||0),0)
  const allExpenses = expenses.reduce((s,e)=>s+(e.amount||0),0)
  const allInventory = inventory.reduce((s,i)=>s+(i.total_cost||0),0)

  // Partner investments this month
  const partnerInvThisMonth = (partner) => partnerTx.filter(t=>inMonth(t.date)&&t.partner===partner&&t.type==='investment').reduce((s,t)=>s+(t.amount||0),0)
  const partnerWithThisMonth = (partner) => partnerTx.filter(t=>inMonth(t.date)&&t.partner===partner&&t.type==='withdrawal').reduce((s,t)=>s+(t.amount||0),0)

  // Expense by category
  const byCat = EXPENSE_CATS.map(cat => ({
    cat, total: monthExpenses.filter(e=>e.category===cat).reduce((s,e)=>s+(e.amount||0),0)
  })).filter(x=>x.total>0).sort((a,b)=>b.total-a.total)

  const maxCat = byCat[0]?.total||1

  // Save functions
  const saveExpense = async () => {
    if (!expForm.description||!expForm.amount){alert('Fill required fields');return}
    setSaving(true)
    await createClient().from('expenses').insert([{...expForm,amount:parseFloat(expForm.amount)}])
    await loadAll(); setShowAddExpense(false); setSaving(false)
    setExpForm({date:new Date().toISOString().split('T')[0],category:'Rent/Storage',description:'',amount:'',paid_by:'company',notes:''})
  }

  const saveInventory = async () => {
    if (!invForm.product_name||!invForm.units||!invForm.unit_cost){alert('Fill required fields');return}
    setSaving(true)
    const total_cost = parseFloat(invForm.unit_cost)*parseInt(invForm.units)
    await createClient().from('inventory_purchases').insert([{...invForm,units:parseInt(invForm.units),unit_cost:parseFloat(invForm.unit_cost),total_cost}])
    await loadAll(); setShowAddInventory(false); setSaving(false)
    setInvForm({date:new Date().toISOString().split('T')[0],product_name:'',supplier:'',units:'',unit_cost:'',paid_by:'company',notes:''})
  }

  const savePartnerTx = async () => {
    if (!ptxForm.amount||!ptxForm.description){alert('Fill required fields');return}
    setSaving(true)
    await createClient().from('partner_transactions').insert([{...ptxForm,amount:parseFloat(ptxForm.amount)}])
    await loadAll(); setShowAddPartner(false); setSaving(false)
    setPtxForm({date:new Date().toISOString().split('T')[0],partner:'Victor',type:'investment',amount:'',description:'',notes:''})
  }

  const deleteExp = async (id) => { await createClient().from('expenses').delete().eq('id',id); await loadAll() }
  const deleteInv = async (id) => { await createClient().from('inventory_purchases').delete().eq('id',id); await loadAll() }
  const deletePtx = async (id) => { await createClient().from('partner_transactions').delete().eq('id',id); await loadAll() }

  if (loading) return <div style={{minHeight:'100vh',background:'#080808',display:'flex',alignItems:'center',justifyContent:'center',color:'#555'}}>Loading...</div>

  const isPos = netProfit >= 0

  return (
    <div style={{background:'#0a0a0a',minHeight:'100vh'}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 2rem',background:'#111',borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{fontSize:13,fontWeight:700,letterSpacing:'0.15em',color:'#fff',textTransform:'uppercase'}}>Levam Admin</div>
          <div style={{display:'flex',borderLeft:'0.5px solid rgba(255,255,255,0.06)',paddingLeft:16}}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart']].map(([l,h])=>(
              <Link key={l} href={h} style={{fontSize:12,color:l==='Profit'?'#2d7dd2':'#777',textDecoration:'none',padding:'4px 14px',borderBottom:l==='Profit'?'2px solid #2d7dd2':'2px solid transparent',fontWeight:l==='Profit'?700:400}}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)}
            style={{background:'#1a1a1a',border:'0.5px solid rgba(255,255,255,0.1)',color:'#ccc',fontSize:12,padding:'6px 10px',borderRadius:4,outline:'none',colorScheme:'dark'}}/>
          <button onClick={logout} style={{fontSize:11,color:'#555',border:'0.5px solid rgba(255,255,255,0.08)',padding:'6px 14px',borderRadius:2,background:'transparent',cursor:'pointer'}}>Sign out</button>
        </div>
      </nav>

      <div style={{padding:'2rem'}}>

        {/* ── HERO PROFIT CARD ─────────────────────────────── */}
        <div style={{background:isPos?'linear-gradient(135deg,#0a1f12,#0d2b1a)':'linear-gradient(135deg,#1f0a0a,#2b0d0d)',border:`1px solid ${isPos?'rgba(42,125,79,0.35)':'rgba(231,76,60,0.35)'}`,borderRadius:16,padding:'2rem',marginBottom:'1.5rem',position:'relative',overflow:'hidden',animation:'fadeIn 0.4s ease'}}>
          <div style={{position:'absolute',top:-30,right:-30,fontSize:160,opacity:0.04,lineHeight:1}}>{isPos?'↑':'↓'}</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{fontSize:11,color:isPos?'rgba(74,222,128,0.7)':'rgba(248,113,113,0.7)',textTransform:'uppercase',letterSpacing:'0.2em',fontWeight:700,marginBottom:6}}>{fmtM(month+'-01')} · Net profit</div>
              <div style={{fontSize:56,fontWeight:900,color:isPos?'#4ade80':'#f87171',letterSpacing:'-0.02em',lineHeight:1}}>
                {isPos?'+':''}{netProfit>=0?money(netProfit):'-'+money(Math.abs(netProfit))}
              </div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.35)',marginTop:8}}>
                {money(grossProfit)} gross · {money(totalExpenses)} expenses
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,minWidth:280}}>
              {PARTNERS.map(partner=>{
                const pProfit = profitPerPartner
                const inv = partnerInvThisMonth(partner)
                const wit = partnerWithThisMonth(partner)
                return (
                  <div key={partner} style={{background:'rgba(255,255,255,0.05)',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'1rem'}}>
                    <div style={{fontSize:10,color:'#888',marginBottom:4,fontWeight:700}}>👤 {partner}</div>
                    <div style={{fontSize:22,fontWeight:800,color:pProfit>=0?'#4ade80':'#f87171'}}>{pProfit>=0?'+':''}{money(pProfit)}</div>
                    <div style={{fontSize:10,color:'#555',marginTop:4}}>50% share</div>
                    {inv>0&&<div style={{fontSize:9,color:'#60a5fa',marginTop:4}}>⬆ Invested {money(inv)}</div>}
                    {wit>0&&<div style={{fontSize:9,color:'#fbbf24',marginTop:2}}>⬇ Withdrew {money(wit)}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── KPI GRID ──────────────────────────────────────── */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:'1.5rem'}}>
          {[
            {label:'Revenue',value:money(revenue),sub:`${monthOrders.length} orders`,color:'#60a5fa',icon:'💰'},
            {label:'Collected',value:money(collected),sub:`${money(outstanding)} outstanding`,color:'#34d399',icon:'✓'},
            {label:'Cost of goods',value:money(cogs),sub:'from confirmed orders',color:'#f87171',icon:'📦'},
            {label:'Gross profit',value:money(grossProfit),sub:`${revenue>0?((grossProfit/revenue)*100).toFixed(1):0}% margin`,color:grossProfit>=0?'#a78bfa':'#f87171',icon:'📊'},
            {label:'Operating expenses',value:money(totalExpenses),sub:`${monthExpenses.length} items`,color:'#fbbf24',icon:'🧾'},
          ].map(k=>(
            <div key={k.label} style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'1.25rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div style={{fontSize:9,color:'#555',textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:600}}>{k.label}</div>
                <span style={{fontSize:16,opacity:0.4}}>{k.icon}</span>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:k.color,marginBottom:4}}>{k.value}</div>
              <div style={{fontSize:10,color:'#444'}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── SUB VIEWS TABS ─────────────────────────────────── */}
        <div style={{display:'flex',gap:8,marginBottom:'1.5rem',borderBottom:'0.5px solid rgba(255,255,255,0.06)',paddingBottom:0}}>
          {[['overview','📊 Overview'],['expenses','🧾 Expenses'],['inventory','📦 Inventory'],['partners','🤝 Partners']].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} style={{padding:'10px 18px',fontSize:12,fontWeight:600,color:view===k?'#2d7dd2':'#555',background:'transparent',border:'none',borderBottom:`2px solid ${view===k?'#2d7dd2':'transparent'}`,cursor:'pointer',fontFamily:'inherit'}}>
              {l}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW ══════════════════════════════════════════ */}
        {view==='overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',animation:'fadeIn 0.3s ease'}}>

            {/* P&L BREAKDOWN */}
            <div style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'1.5rem'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:'1.25rem'}}>P&L Breakdown — {fmtM(month+'-01')}</div>
              {[
                {label:'Gross revenue',value:revenue,color:'#60a5fa',positive:true},
                {label:'Cost of goods sold',value:-cogs,color:'#f87171',positive:false},
                {label:'— Gross profit',value:grossProfit,color:grossProfit>=0?'#a78bfa':'#f87171',border:true},
                {label:'Operating expenses',value:-totalExpenses,color:'#fbbf24',positive:false},
                {label:'= Net profit',value:netProfit,color:netProfit>=0?'#4ade80':'#f87171',border:true,bold:true},
                {label:'Per partner (÷2)',value:profitPerPartner,color:profitPerPartner>=0?'#34d399':'#f87171',sub:true},
              ].map((row,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:`${row.bold?'12px':'8px'} 0`,borderTop:row.border?`1px solid rgba(255,255,255,0.08)`:i>0?'0.5px solid rgba(255,255,255,0.04)':'none',marginTop:row.border?4:0}}>
                  <span style={{fontSize:row.bold?13:11,color:row.sub?'#555':'#888',paddingLeft:row.sub?12:0}}>{row.label}</span>
                  <span style={{fontSize:row.bold?18:13,fontWeight:row.bold?800:600,color:row.color}}>
                    {row.value>=0?'+':''}{money(row.value)}
                  </span>
                </div>
              ))}
            </div>

            {/* EXPENSE BY CATEGORY */}
            <div style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'1.5rem'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:'1.25rem'}}>Expenses by category</div>
              {byCat.length===0
                ? <div style={{textAlign:'center',color:'#555',fontSize:12,padding:'2rem'}}>No expenses this month</div>
                : byCat.map(({cat,total},i)=>{
                  const colors=['#f87171','#fbbf24','#a78bfa','#60a5fa','#34d399','#f97316','#e879f9','#94a3b8']
                  const c = colors[i%colors.length]
                  return (
                    <div key={cat} style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:11,color:'#aaa'}}>{cat}</span>
                        <span style={{fontSize:12,fontWeight:700,color:c}}>{money(total)}</span>
                      </div>
                      <div style={{height:5,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${(total/maxCat)*100}%`,background:c,borderRadius:3}}/>
                      </div>
                    </div>
                  )
                })
              }
            </div>

            {/* TOP SELLING PRODUCTS THIS MONTH */}
            <div style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'1.5rem'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:'1.25rem'}}>Top products this month</div>
              {(() => {
                const pMap = {}
                monthOrders.forEach(o=>(o.order_items||[]).forEach(item=>{
                  const prod = products.find(p=>p.id===item.product_id||p.name===item.product_name)
                  const key = item.product_name
                  if (!pMap[key]) pMap[key] = {name:key,units:0,rev:0,cost:0}
                  pMap[key].units += item.quantity
                  pMap[key].rev   += item.unit_price*item.quantity
                  pMap[key].cost  += (prod?.cost_price||0)*item.quantity
                }))
                const top = Object.values(pMap).sort((a,b)=>b.rev-a.rev).slice(0,6)
                const maxRev = top[0]?.rev||1
                if (top.length===0) return <div style={{textAlign:'center',color:'#555',fontSize:12,padding:'2rem'}}>No sales this month</div>
                return top.map((p,i)=>{
                  const colors=['#fbbf24','#60a5fa','#a78bfa','#34d399','#f87171','#f97316']
                  const c=colors[i%colors.length]
                  const margin = p.rev>0?((p.rev-p.cost)/p.rev*100).toFixed(0):0
                  return (
                    <div key={p.name} style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                        <span style={{fontSize:12,color:'#ccc',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginRight:8}}>{p.name}</span>
                        <div style={{textAlign:'right',flexShrink:0}}>
                          <span style={{fontSize:12,fontWeight:700,color:c}}>{money(p.rev)}</span>
                          <span style={{fontSize:9,color:'#555',marginLeft:6}}>{margin}% margin</span>
                        </div>
                      </div>
                      <div style={{height:4,background:'rgba(255,255,255,0.05)',borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${(p.rev/maxRev)*100}%`,background:c,borderRadius:3}}/>
                      </div>
                      <div style={{fontSize:9,color:'#555',marginTop:2}}>{p.units} units · cost {money(p.cost)}</div>
                    </div>
                  )
                })
              })()}
            </div>

            {/* PROFIT PER ORDER */}
            <div style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'1.5rem',gridColumn:'span 2'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:'1.25rem'}}>Profit per order — {fmtM(month+'-01')}</div>
              {monthOrders.length===0
                ? <div style={{textAlign:'center',color:'#555',fontSize:12,padding:'2rem'}}>No confirmed orders this month</div>
                : (
                  <>
                    <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'8px 12px',background:'#0d0d0d',borderRadius:6,marginBottom:6}}>
                      {['Order / Client','Revenue','Cost','Gross profit','Margin','Status'].map((h,i)=>(
                        <div key={h} style={{fontSize:9,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,textAlign:i>0?'right':'left'}}>{h}</div>
                      ))}
                    </div>
                    {monthOrders.map((order,i)=>{
                      const orderCogs = (order.order_items||[]).reduce((s,item)=>{
                        const prod = products.find(p=>p.id===item.product_id||p.name===item.product_name)
                        return s + ((prod?.cost_price||0)*item.quantity)
                      },0)
                      const orderRevenue = order.total||0
                      const orderProfit  = orderRevenue - orderCogs
                      const orderMargin  = orderRevenue>0 ? ((orderProfit/orderRevenue)*100).toFixed(1) : 0
                      const isProfitable = orderProfit >= 0
                      const clientName = (order.notes||'').split('Business: ')[1]?.split('|')[0]?.split('\n')[0]?.trim() || 'Client'
                      return (
                        <div key={order.id} style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 12px',borderTop:'0.5px solid rgba(255,255,255,0.05)',alignItems:'center',background:i%2===1?'rgba(255,255,255,0.01)':'transparent'}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:'#ccc'}}>#{order.order_number}</div>
                            <div style={{fontSize:10,color:'#555'}}>{clientName}</div>
                          </div>
                          <div style={{fontSize:12,fontWeight:600,color:'#60a5fa',textAlign:'right'}}>{money(orderRevenue)}</div>
                          <div style={{fontSize:12,color:'#f87171',textAlign:'right'}}>{orderCogs>0?money(orderCogs):<span style={{color:'#444'}}>No cost data</span>}</div>
                          <div style={{fontSize:13,fontWeight:700,color:isProfitable?'#4ade80':'#f87171',textAlign:'right'}}>
                            {isProfitable?'+':''}{money(orderProfit)}
                          </div>
                          <div style={{textAlign:'right'}}>
                            <span style={{fontSize:11,fontWeight:700,color:parseFloat(orderMargin)>30?'#4ade80':parseFloat(orderMargin)>15?'#fbbf24':'#f87171'}}>
                              {orderCogs>0?orderMargin+'%':'—'}
                            </span>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <span style={{fontSize:9,padding:'2px 8px',borderRadius:8,background:'rgba(83,74,183,0.15)',color:'#a78bfa',fontWeight:600}}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    {/* Summary row */}
                    <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'12px',background:'rgba(255,255,255,0.03)',borderTop:'1px solid rgba(255,255,255,0.08)',borderRadius:'0 0 8px 8px',marginTop:4}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#888'}}>{monthOrders.length} orders total</div>
                      <div style={{fontSize:13,fontWeight:800,color:'#60a5fa',textAlign:'right'}}>{money(revenue)}</div>
                      <div style={{fontSize:13,fontWeight:800,color:'#f87171',textAlign:'right'}}>{money(cogs)}</div>
                      <div style={{fontSize:14,fontWeight:900,color:grossProfit>=0?'#4ade80':'#f87171',textAlign:'right'}}>{grossProfit>=0?'+':''}{money(grossProfit)}</div>
                      <div style={{fontSize:12,fontWeight:700,color:revenue>0&&((grossProfit/revenue)*100)>20?'#4ade80':'#fbbf24',textAlign:'right'}}>
                        {revenue>0?((grossProfit/revenue)*100).toFixed(1)+'%':'—'}
                      </div>
                      <div/>
                    </div>
                  </>
                )
              }
            </div>

            {/* RECENT INVENTORY PURCHASES */}
            <div style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'1.5rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>Inventory purchased</div>
                <button onClick={()=>{setView('inventory');setShowAddInventory(true)}} style={{fontSize:11,color:'#2d7dd2',background:'rgba(45,125,210,0.1)',border:'0.5px solid rgba(45,125,210,0.25)',padding:'5px 10px',borderRadius:4,cursor:'pointer',fontWeight:600}}>+ Add</button>
              </div>
              {monthInventory.length===0
                ? <div style={{textAlign:'center',color:'#555',fontSize:12,padding:'2rem'}}>No inventory purchases this month</div>
                : <>
                  {monthInventory.slice(0,5).map(iv=>(
                    <div key={iv.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderTop:'0.5px solid rgba(255,255,255,0.05)'}}>
                      <div>
                        <div style={{fontSize:12,color:'#ccc',fontWeight:600}}>{iv.product_name}</div>
                        <div style={{fontSize:10,color:'#555'}}>{fmt(iv.date)} · {iv.units} units × {money(iv.unit_cost)}{iv.supplier?' · '+iv.supplier:''}</div>
                      </div>
                      <div style={{fontSize:13,fontWeight:700,color:'#60a5fa',flexShrink:0}}>{money(iv.total_cost)}</div>
                    </div>
                  ))}
                  <div style={{marginTop:10,padding:'8px 10px',background:'rgba(96,165,250,0.06)',border:'0.5px solid rgba(96,165,250,0.15)',borderRadius:4,display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:11,color:'#888'}}>Total invested in inventory</span>
                    <span style={{fontSize:14,fontWeight:700,color:'#60a5fa'}}>{money(totalInventory)}</span>
                  </div>
                </>
              }
            </div>
          </div>
        )}

        {/* ══ EXPENSES ══════════════════════════════════════════ */}
        {view==='expenses' && (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>Operating expenses</div>
                <div style={{fontSize:12,color:'#555',marginTop:2}}>{fmtM(month+'-01')} · {money(totalExpenses)} total</div>
              </div>
              <button onClick={()=>setShowAddExpense(true)} style={{padding:'10px 18px',background:'#2d7dd2',color:'#fff',fontSize:12,fontWeight:700,border:'none',borderRadius:6,cursor:'pointer'}}>+ Add expense</button>
            </div>

            {/* Add expense form */}
            {showAddExpense && (
              <div style={{background:'#141414',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'1.5rem',marginBottom:'1.5rem',animation:'fadeIn 0.2s ease'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:'1rem'}}>New expense</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
                  <div><label style={lbl}>Date *</label><input type="date" value={expForm.date} onChange={e=>setExpForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'dark'}}/></div>
                  <div><label style={lbl}>Category *</label>
                    <select value={expForm.category} onChange={e=>setExpForm(f=>({...f,category:e.target.value}))} style={inp}>
                      {EXPENSE_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Amount ($) *</label><input type="number" value={expForm.amount} onChange={e=>setExpForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" style={inp}/></div>
                  <div style={{gridColumn:'span 2'}}><label style={lbl}>Description *</label><input value={expForm.description} onChange={e=>setExpForm(f=>({...f,description:e.target.value}))} placeholder="What was this for?" style={inp}/></div>
                  <div><label style={lbl}>Paid by</label>
                    <select value={expForm.paid_by} onChange={e=>setExpForm(f=>({...f,paid_by:e.target.value}))} style={inp}>
                      <option value="company">Company</option>
                      <option value="Victor">Victor</option>
                      <option value="Leopoldo">Leopoldo</option>
                    </select>
                  </div>
                  <div style={{gridColumn:'span 3'}}><label style={lbl}>Notes</label><input value={expForm.notes} onChange={e=>setExpForm(f=>({...f,notes:e.target.value}))} placeholder="Additional details..." style={inp}/></div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={saveExpense} disabled={saving} style={{padding:'10px 20px',background:'#2d7dd2',color:'#fff',fontSize:12,fontWeight:700,border:'none',borderRadius:4,cursor:'pointer'}}>{saving?'Saving...':'✓ Save expense'}</button>
                  <button onClick={()=>setShowAddExpense(false)} style={{padding:'10px 16px',background:'transparent',color:'#555',fontSize:12,border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:4,cursor:'pointer'}}>Cancel</button>
                </div>
              </div>
            )}

            {/* Expenses table */}
            <div style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:10,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 140px 120px 100px 80px 40px',padding:'10px 16px',background:'#0d0d0d',borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>
                {['Description','Category','Amount','Paid by','Date',''].map((h,i)=><div key={i} style={{fontSize:9,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,textAlign:i>=2?'right':'left'}}>{h}</div>)}
              </div>
              {monthExpenses.length===0
                ? <div style={{padding:'3rem',textAlign:'center',color:'#555',fontSize:12}}>No expenses for {fmtM(month+'-01')}</div>
                : monthExpenses.map((e,i)=>(
                  <div key={e.id} style={{display:'grid',gridTemplateColumns:'1fr 140px 120px 100px 80px 40px',padding:'12px 16px',borderTop:i>0?'0.5px solid rgba(255,255,255,0.04)':'none',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:13,color:'#ccc',fontWeight:500}}>{e.description}</div>
                      {e.notes&&<div style={{fontSize:10,color:'#555',marginTop:1}}>{e.notes}</div>}
                    </div>
                    <div><span style={{fontSize:10,padding:'2px 8px',background:'rgba(251,191,36,0.1)',color:'#fbbf24',borderRadius:10,fontWeight:600}}>{e.category}</span></div>
                    <div style={{fontSize:13,fontWeight:700,color:'#f87171',textAlign:'right'}}>{money(e.amount)}</div>
                    <div style={{fontSize:11,color:'#888',textAlign:'right'}}>{e.paid_by}</div>
                    <div style={{fontSize:10,color:'#555',textAlign:'right'}}>{fmt(e.date)}</div>
                    <div style={{textAlign:'right'}}><button onClick={()=>deleteExp(e.id)} style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer',fontSize:14,opacity:0.5,padding:0}}>×</button></div>
                  </div>
                ))
              }
              {monthExpenses.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 140px 120px 100px 80px 40px',padding:'12px 16px',background:'rgba(255,255,255,0.03)',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#888'}}>Total</div>
                  <div/><div style={{fontSize:15,fontWeight:800,color:'#fbbf24',textAlign:'right'}}>{money(totalExpenses)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ INVENTORY ══════════════════════════════════════════ */}
        {view==='inventory' && (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>Inventory purchases</div>
                <div style={{fontSize:12,color:'#555',marginTop:2}}>Track what you bought, at what cost, and from where</div>
              </div>
              <button onClick={()=>setShowAddInventory(true)} style={{padding:'10px 18px',background:'#2a7d4f',color:'#fff',fontSize:12,fontWeight:700,border:'none',borderRadius:6,cursor:'pointer'}}>+ Add purchase</button>
            </div>

            {showAddInventory && (
              <div style={{background:'#141414',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'1.5rem',marginBottom:'1.5rem',animation:'fadeIn 0.2s ease'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:'1rem'}}>New inventory purchase</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
                  <div><label style={lbl}>Date *</label><input type="date" value={invForm.date} onChange={e=>setInvForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'dark'}}/></div>
                  <div style={{gridColumn:'span 2'}}><label style={lbl}>Product name *</label><input value={invForm.product_name} onChange={e=>setInvForm(f=>({...f,product_name:e.target.value}))} placeholder="e.g. JBL PartyBox 710" style={inp}/></div>
                  <div><label style={lbl}>Supplier</label><input value={invForm.supplier} onChange={e=>setInvForm(f=>({...f,supplier:e.target.value}))} placeholder="e.g. D&H Distributing" style={inp}/></div>
                  <div><label style={lbl}>Units *</label><input type="number" value={invForm.units} onChange={e=>setInvForm(f=>({...f,units:e.target.value}))} placeholder="0" style={inp}/></div>
                  <div><label style={lbl}>Unit cost ($) *</label><input type="number" value={invForm.unit_cost} onChange={e=>setInvForm(f=>({...f,unit_cost:e.target.value}))} placeholder="0.00" style={inp}/></div>
                  <div><label style={lbl}>Paid by</label>
                    <select value={invForm.paid_by} onChange={e=>setInvForm(f=>({...f,paid_by:e.target.value}))} style={inp}>
                      <option value="company">Company</option>
                      <option value="Victor">Victor</option>
                      <option value="Leopoldo">Leopoldo</option>
                    </select>
                  </div>
                  <div style={{gridColumn:'span 2'}}><label style={lbl}>Notes</label><input value={invForm.notes} onChange={e=>setInvForm(f=>({...f,notes:e.target.value}))} placeholder="PO number, tracking, etc." style={inp}/></div>
                </div>
                {invForm.units&&invForm.unit_cost&&(
                  <div style={{padding:'8px 12px',background:'rgba(96,165,250,0.08)',border:'0.5px solid rgba(96,165,250,0.2)',borderRadius:4,marginBottom:10,fontSize:12,color:'#60a5fa'}}>
                    Total: <strong>{money(parseFloat(invForm.unit_cost)*parseInt(invForm.units))}</strong>
                  </div>
                )}
                <div style={{display:'flex',gap:8}}>
                  <button onClick={saveInventory} disabled={saving} style={{padding:'10px 20px',background:'#2a7d4f',color:'#fff',fontSize:12,fontWeight:700,border:'none',borderRadius:4,cursor:'pointer'}}>{saving?'Saving...':'✓ Save purchase'}</button>
                  <button onClick={()=>setShowAddInventory(false)} style={{padding:'10px 16px',background:'transparent',color:'#555',fontSize:12,border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:4,cursor:'pointer'}}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:10,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 100px 80px 100px 120px 80px 40px',padding:'10px 16px',background:'#0d0d0d',borderBottom:'0.5px solid rgba(255,255,255,0.06)'}}>
                {['Product','Units','Unit cost','Total','Supplier','Date',''].map((h,i)=><div key={i} style={{fontSize:9,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,textAlign:i>=1?'right':'left'}}>{h}</div>)}
              </div>
              {inventory.length===0
                ? <div style={{padding:'3rem',textAlign:'center',color:'#555',fontSize:12}}>No inventory purchases recorded</div>
                : inventory.map((iv,i)=>(
                  <div key={iv.id} style={{display:'grid',gridTemplateColumns:'1fr 100px 80px 100px 120px 80px 40px',padding:'12px 16px',borderTop:i>0?'0.5px solid rgba(255,255,255,0.04)':'none',alignItems:'center',background:inMonth(iv.date)?'transparent':'rgba(255,255,255,0.01)'}}>
                    <div>
                      <div style={{fontSize:13,color:'#ccc',fontWeight:600}}>{iv.product_name}</div>
                      {iv.notes&&<div style={{fontSize:10,color:'#555',marginTop:1}}>{iv.notes}</div>}
                      <div style={{fontSize:10,color:'#444',marginTop:1}}>Paid by: {iv.paid_by}</div>
                    </div>
                    <div style={{fontSize:12,color:'#aaa',textAlign:'right'}}>{iv.units}</div>
                    <div style={{fontSize:12,color:'#aaa',textAlign:'right'}}>{money(iv.unit_cost)}</div>
                    <div style={{fontSize:13,fontWeight:700,color:'#60a5fa',textAlign:'right'}}>{money(iv.total_cost)}</div>
                    <div style={{fontSize:11,color:'#888',textAlign:'right'}}>{iv.supplier||'—'}</div>
                    <div style={{fontSize:10,color:inMonth(iv.date)?'#ccc':'#555',textAlign:'right'}}>{fmt(iv.date)}</div>
                    <div style={{textAlign:'right'}}><button onClick={()=>deleteInv(iv.id)} style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer',fontSize:14,opacity:0.5,padding:0}}>×</button></div>
                  </div>
                ))
              }
              <div style={{display:'grid',gridTemplateColumns:'1fr 100px 80px 100px 120px 80px 40px',padding:'12px 16px',background:'rgba(255,255,255,0.03)',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{fontSize:12,color:'#888',fontWeight:700}}>All-time total invested</div>
                <div/><div/><div style={{fontSize:15,fontWeight:800,color:'#60a5fa',textAlign:'right'}}>{money(allInventory)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ══ PARTNERS ══════════════════════════════════════════ */}
        {view==='partners' && (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>Partner transactions</div>
                <div style={{fontSize:12,color:'#555',marginTop:2}}>Investments, withdrawals & distributions</div>
              </div>
              <button onClick={()=>setShowAddPartner(true)} style={{padding:'10px 18px',background:'#534ab7',color:'#fff',fontSize:12,fontWeight:700,border:'none',borderRadius:6,cursor:'pointer'}}>+ Add transaction</button>
            </div>

            {showAddPartner && (
              <div style={{background:'#141414',border:'0.5px solid rgba(255,255,255,0.1)',borderRadius:10,padding:'1.5rem',marginBottom:'1.5rem',animation:'fadeIn 0.2s ease'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:'1rem'}}>New transaction</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
                  <div><label style={lbl}>Date *</label><input type="date" value={ptxForm.date} onChange={e=>setPtxForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'dark'}}/></div>
                  <div><label style={lbl}>Partner *</label>
                    <select value={ptxForm.partner} onChange={e=>setPtxForm(f=>({...f,partner:e.target.value}))} style={inp}>
                      {PARTNERS.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Type *</label>
                    <select value={ptxForm.type} onChange={e=>setPtxForm(f=>({...f,type:e.target.value}))} style={inp}>
                      <option value="investment">Investment (put money in)</option>
                      <option value="withdrawal">Withdrawal (take money out)</option>
                      <option value="distribution">Distribution (profit share)</option>
                      <option value="expense_reimbursement">Expense reimbursement</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Amount ($) *</label><input type="number" value={ptxForm.amount} onChange={e=>setPtxForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" style={inp}/></div>
                  <div style={{gridColumn:'span 2'}}><label style={lbl}>Description *</label><input value={ptxForm.description} onChange={e=>setPtxForm(f=>({...f,description:e.target.value}))} placeholder="What is this for?" style={inp}/></div>
                  <div style={{gridColumn:'span 3'}}><label style={lbl}>Notes</label><input value={ptxForm.notes} onChange={e=>setPtxForm(f=>({...f,notes:e.target.value}))} placeholder="Additional details..." style={inp}/></div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={savePartnerTx} disabled={saving} style={{padding:'10px 20px',background:'#534ab7',color:'#fff',fontSize:12,fontWeight:700,border:'none',borderRadius:4,cursor:'pointer'}}>{saving?'Saving...':'✓ Save'}</button>
                  <button onClick={()=>setShowAddPartner(false)} style={{padding:'10px 16px',background:'transparent',color:'#555',fontSize:12,border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:4,cursor:'pointer'}}>Cancel</button>
                </div>
              </div>
            )}

            {/* Partner summary cards */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
              {PARTNERS.map(partner=>{
                const txs = partnerTx.filter(t=>t.partner===partner)
                const totalIn = txs.filter(t=>['investment'].includes(t.type)).reduce((s,t)=>s+(t.amount||0),0)
                const totalOut = txs.filter(t=>['withdrawal','distribution'].includes(t.type)).reduce((s,t)=>s+(t.amount||0),0)
                const reimbursed = txs.filter(t=>t.type==='expense_reimbursement').reduce((s,t)=>s+(t.amount||0),0)
                const monthShare = profitPerPartner
                return (
                  <div key={partner} style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'1.5rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
                      <div style={{fontSize:16,fontWeight:800,color:'#fff'}}>👤 {partner}</div>
                      <span style={{fontSize:10,padding:'3px 10px',background:'rgba(83,74,183,0.15)',color:'#a78bfa',borderRadius:10,fontWeight:700}}>50% partner</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:'1rem'}}>
                      {[
                        ['This month profit','$'+(monthShare>=0?'+':'')+money(monthShare).replace('$',''),monthShare>=0?'#4ade80':'#f87171'],
                        ['Total invested',money(totalIn),'#60a5fa'],
                        ['Total withdrawn',money(totalOut),'#fbbf24'],
                        ['Reimbursed',money(reimbursed),'#34d399'],
                      ].map(([l,v,c])=>(
                        <div key={l} style={{padding:'8px',background:'rgba(255,255,255,0.03)',border:'0.5px solid rgba(255,255,255,0.06)',borderRadius:6}}>
                          <div style={{fontSize:9,color:'#555',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:3}}>{l}</div>
                          <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:9,color:'#555',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6,fontWeight:700}}>Recent activity</div>
                    {txs.slice(0,3).map((t,i)=>{
                      const typeColor = {investment:'#60a5fa',withdrawal:'#fbbf24',distribution:'#4ade80',expense_reimbursement:'#34d399'}
                      return (
                        <div key={t.id} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderTop:i>0?'0.5px solid rgba(255,255,255,0.04)':'none',fontSize:11}}>
                          <div>
                            <span style={{color:typeColor[t.type]||'#ccc',fontSize:9,fontWeight:600,textTransform:'uppercase'}}>{t.type.replace('_',' ')} </span>
                            <span style={{color:'#888'}}>{t.description}</span>
                          </div>
                          <span style={{color:'#ccc',fontWeight:600}}>{money(t.amount)}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* All transactions table */}
            <div style={{background:'#111',border:'0.5px solid rgba(255,255,255,0.08)',borderRadius:10,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',background:'#0d0d0d',borderBottom:'0.5px solid rgba(255,255,255,0.06)',fontSize:11,fontWeight:700,color:'#888'}}>All partner transactions</div>
              {partnerTx.length===0
                ? <div style={{padding:'3rem',textAlign:'center',color:'#555',fontSize:12}}>No transactions yet</div>
                : partnerTx.map((t,i)=>{
                  const typeColor = {investment:'#60a5fa',withdrawal:'#fbbf24',distribution:'#4ade80',expense_reimbursement:'#34d399'}
                  const typeIcon = {investment:'⬆',withdrawal:'⬇',distribution:'💚',expense_reimbursement:'🔄'}
                  return (
                    <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderTop:i>0?'0.5px solid rgba(255,255,255,0.04)':'none'}}>
                      <div style={{display:'flex',alignItems:'center',gap:12,flex:1}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:`${typeColor[t.type]||'#888'}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>
                          {typeIcon[t.type]||'·'}
                        </div>
                        <div>
                          <div style={{fontSize:12,color:'#ccc',fontWeight:600}}>{t.description}</div>
                          <div style={{fontSize:10,color:'#555'}}>{t.partner} · {t.type.replace('_',' ')} · {fmt(t.date)}</div>
                          {t.notes&&<div style={{fontSize:10,color:'#444'}}>{t.notes}</div>}
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:14,fontWeight:700,color:typeColor[t.type]||'#ccc'}}>{money(t.amount)}</span>
                        <button onClick={()=>deletePtx(t.id)} style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer',fontSize:14,opacity:0.5,padding:0}}>×</button>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
