'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const PARTNERS = ['Victor', 'Leopoldo']
const EXPENSE_CATS = ['Rent/Storage','Shipping & Logistics','Marketing','Software & Tools','Utilities','Office','Travel','Legal & Accounting','Other']
const ACCOUNTS = [
  { key:'company',      label:'Company',      color:'#60a5fa', icon:'🏢' },
  { key:'victor',       label:'Victor',       color:'#4ade80', icon:'👤' },
  { key:'leopoldo',     label:'Leopoldo',     color:'#a78bfa', icon:'👤' },
  { key:'world_family', label:'World Family', color:'#fbbf24', icon:'🏭' },
]

const money  = (n) => '$'+(parseFloat(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
const fmt    = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'
const fmtM   = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'}) : '—'
const inp    = {width:'100%',background:'#f0f1f3',border:'0.5px solid rgba(0,0,0,0.1)',color:'#888',fontSize:12,padding:'9px 10px',borderRadius:4,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}
const lbl    = {fontSize:9,color:'#777',textTransform:'uppercase',letterSpacing:'0.1em',display:'block',marginBottom:4}

export default function AdminProfit() {
  const [orders,   setOrders]   = useState([])
  const [products, setProducts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [inventory,setInventory]= useState([])
  const [partnerTx,setPartnerTx]= useState([])
  const [acctPay,  setAcctPay]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const getDefaultMonth = () => {
    const d = new Date()
    d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0,7)
  }
  const [month, setMonth] = useState(getDefaultMonth())
  const [view,     setView]     = useState('overview')
  const [allTime,  setAllTime]  = useState(false)
  const [saving,   setSaving]   = useState(false)

  // Forms
  const [showAddExpense,  setShowAddExpense]  = useState(false)
  const [showAddInv,      setShowAddInv]      = useState(false)
  const [showAddPartner,  setShowAddPartner]  = useState(false)
  const [showAddAcctPay,  setShowAddAcctPay]  = useState(false)
  const [expForm,  setExpForm]  = useState({date:today(),category:'Rent/Storage',description:'',amount:'',paid_by:'company',notes:''})
  const [invForm,  setInvForm]  = useState({date:today(),product_name:'',supplier:'',units:'',unit_cost:'',paid_by:'company',notes:''})
  const [ptxForm,  setPtxForm]  = useState({date:today(),partner:'Victor',type:'investment',amount:'',description:'',notes:''})
  const [apForm,   setApForm]   = useState({date:today(),partner:'Victor',type:'supplier_payment',amount:'',description:'',selectedOrders:[],notes:''})

  function today(){ return new Date().toISOString().split('T')[0] }

  useEffect(()=>{
    const sb = createClient()
    sb.auth.getUser().then(async({data})=>{
      if(!data.user||!ADMIN_EMAILS.includes(data.user.email)){window.location.href='/admin';return}
      await loadAll(sb)
    })
  },[])

  const [clients, setClients] = useState([])

  const loadAll = async(sb)=>{
    sb=sb||createClient()
    const [
      {data:o},{data:p},{data:e},{data:iv},{data:pt},{data:ap},{data:cl}
    ] = await Promise.all([
      sb.from('orders').select('*,order_items(*)').order('submitted_at',{ascending:false}),
      sb.from('products').select('*'),
      sb.from('expenses').select('*').order('date',{ascending:false}),
      sb.from('inventory_purchases').select('*').order('date',{ascending:false}),
      sb.from('partner_transactions').select('*').order('date',{ascending:false}),
      sb.from('account_payments').select('*').order('date',{ascending:false}),
      sb.from('clients').select('*'),
    ])
    setOrders(o||[]); setProducts(p||[]); setExpenses(e||[])
    setInventory(iv||[]); setPartnerTx(pt||[]); setAcctPay(ap||[]); setClients(cl||[])
    setLoading(false)
  }

  const logout = async()=>{ await createClient().auth.signOut(); window.location.href='/admin' }

  // ── HELPERS ──────────────────────────────────────────────
  const inMonth   = (d)  => allTime ? true : (d && d.startsWith(month))
  const inMonthTS = (ts) => allTime ? true : (ts && new Date(ts).toISOString().slice(0,7)===month)

  const confirmedOrders = orders.filter(o=>['confirmed','dispatched','completed'].includes(o.status))

  // ── MONTH P&L ────────────────────────────────────────────
  const monthOrders = confirmedOrders.filter(o=>inMonthTS(o.submitted_at))
  const revenue     = monthOrders.reduce((s,o)=>s+(o.total||0),0)
  const collected   = monthOrders.reduce((s,o)=>s+(parseFloat(o.amount_paid)||0),0)
  const outstanding = monthOrders.reduce((s,o)=>s+Math.max(0,(o.total||0)-(parseFloat(o.amount_paid)||0)),0)
  const cogs        = monthOrders.reduce((s,o)=>s+(o.order_items||[]).reduce((ss,item)=>{
    const prod=products.find(p=>p.id===item.product_id||p.name===item.product_name)
    return ss+((prod?.cost_price||0)*item.quantity)
  },0),0)
  const totalExpenses  = expenses.filter(e=>inMonth(e.date)).reduce((s,e)=>s+(e.amount||0),0)
  const grossProfit    = revenue - cogs
  const netProfit      = grossProfit - totalExpenses
  const profitPerPart  = netProfit / 2

  // ── ACCOUNT BALANCES ─────────────────────────────────────
  // For each partner account:
  //   IN  = orders where payment_account = partner (amount_paid)
  //   OUT = account_payments where partner = partner (supplier_payment)
  //   PROFIT TRANSFERRED = account_payments type profit_transfer
  const getAccountData = (accKey) => {
    const partnerLabel = ACCOUNTS.find(a=>a.key===accKey)?.label || accKey

    // All collected into this account (all time)
    const inOrders = confirmedOrders.filter(o=>(o.payment_account||'company')===accKey)
    const totalIn  = inOrders.reduce((s,o)=>s+(parseFloat(o.amount_paid)||0),0)

    // Unpaid orders assigned to this account
    const unpaidOrders = inOrders.filter(o=>(parseFloat(o.amount_paid)||0)<(o.total||0))

    // Payments OUT from this account
    const payments     = acctPay.filter(p=>p.partner===partnerLabel)
    const supplierPaid = payments.filter(p=>p.type==='supplier_payment').reduce((s,p)=>s+(p.amount||0),0)
    const profitXfer   = payments.filter(p=>p.type==='profit_transfer').reduce((s,p)=>s+(p.amount||0),0)
    const otherOut     = payments.filter(p=>p.type==='other').reduce((s,p)=>s+(p.amount||0),0)
    const totalOut     = supplierPaid + profitXfer + otherOut

    // Current balance in account
    const balance      = totalIn - totalOut

    // Of that balance: how much is for pending orders (orders assigned but not yet covered by supplier payment)
    // We track this via linked order_ids on account_payments
    const coveredOrderIds = payments.filter(p=>p.type==='supplier_payment').flatMap(p=>p.order_ids||[])
    const pendingOrdersCost = inOrders
      .filter(o=>!coveredOrderIds.includes(o.id))
      .reduce((s,o)=>{
        const orderCost=(o.order_items||[]).reduce((ss,item)=>{
          const prod=products.find(p=>p.id===item.product_id||p.name===item.product_name)
          return ss+((prod?.cost_price||0)*item.quantity)
        },0)
        return s+orderCost
      },0)

    // What's actually free profit vs committed to orders
    const committedToOrders = Math.min(pendingOrdersCost, balance)
    const freeProfitBalance = Math.max(0, balance - committedToOrders)

    return {
      totalIn, totalOut, supplierPaid, profitXfer, otherOut,
      balance, committedToOrders, freeProfitBalance,
      inOrders, unpaidOrders, payments,
      coveredOrderIds, pendingOrdersCost,
    }
  }

  // Expense by category
  const monthExpenses = expenses.filter(e=>inMonth(e.date))
  const byCat = EXPENSE_CATS.map(cat=>({
    cat, total:monthExpenses.filter(e=>e.category===cat).reduce((s,e)=>s+(e.amount||0),0)
  })).filter(x=>x.total>0).sort((a,b)=>b.total-a.total)
  const maxCat = byCat[0]?.total||1

  // Save functions
  const saveExpense = async()=>{
    if(!expForm.description||!expForm.amount){alert('Fill required');return}
    setSaving(true)
    await createClient().from('expenses').insert([{...expForm,amount:parseFloat(expForm.amount)}])
    await loadAll(); setShowAddExpense(false); setSaving(false)
    setExpForm({date:today(),category:'Rent/Storage',description:'',amount:'',paid_by:'company',notes:''})
  }
  const saveInv = async()=>{
    if(!invForm.product_name||!invForm.units||!invForm.unit_cost){alert('Fill required');return}
    setSaving(true)
    const total_cost=parseFloat(invForm.unit_cost)*parseInt(invForm.units)
    await createClient().from('inventory_purchases').insert([{...invForm,units:parseInt(invForm.units),unit_cost:parseFloat(invForm.unit_cost),total_cost}])
    await loadAll(); setShowAddInv(false); setSaving(false)
    setInvForm({date:today(),product_name:'',supplier:'',units:'',unit_cost:'',paid_by:'company',notes:''})
  }
  const savePtx = async()=>{
    if(!ptxForm.amount||!ptxForm.description){alert('Fill required');return}
    setSaving(true)
    await createClient().from('partner_transactions').insert([{...ptxForm,amount:parseFloat(ptxForm.amount)}])
    await loadAll(); setShowAddPartner(false); setSaving(false)
    setPtxForm({date:today(),partner:'Victor',type:'investment',amount:'',description:'',notes:''})
  }
  const saveAcctPay = async()=>{
    if(!apForm.amount||!apForm.description){alert('Fill required');return}
    setSaving(true)
    await createClient().from('account_payments').insert([{
      date:apForm.date, partner:apForm.partner, type:apForm.type,
      amount:parseFloat(apForm.amount), description:apForm.description,
      order_ids:apForm.selectedOrders, notes:apForm.notes
    }])
    await loadAll(); setShowAddAcctPay(false); setSaving(false)
    setApForm({date:today(),partner:'Victor',type:'supplier_payment',amount:'',description:'',selectedOrders:[],notes:''})
  }

  const del = (table,id) => createClient().from(table).delete().eq('id',id).then(()=>loadAll())

  if(loading) return <div style={{minHeight:'100vh',background:'#f4f5f7',display:'flex',alignItems:'center',justifyContent:'center',color:'#999'}}>Loading...</div>

  const isPos = netProfit>=0

  // Orders for account payment form — all confirmed, not yet covered
  const apPartnerKey = ACCOUNTS.find(a=>a.label===apForm.partner)?.key||'company'

  return (
    <div style={{background:'#f4f5f7',minHeight:'100vh'}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 2rem',background:'#fff',borderBottom:'0.5px solid rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{fontSize:13,fontWeight:700,letterSpacing:'0.15em',color:'#333',textTransform:'uppercase'}}>Levam Admin</div>
          <div style={{display:'flex',borderLeft:'0.5px solid rgba(0,0,0,0.06)',paddingLeft:16}}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart']].map(([l,h])=>(
              <Link key={l} href={h} style={{fontSize:12,color:l==='Profit'?'#2d7dd2':'#777',textDecoration:'none',padding:'4px 14px',borderBottom:l==='Profit'?'2px solid #2d7dd2':'2px solid transparent',fontWeight:l==='Profit'?700:400}}>{l}</Link>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:6,background:'#f0f1f3',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:4,overflow:'hidden'}}>
            <button onClick={()=>setAllTime(false)} style={{padding:'6px 12px',fontSize:11,fontWeight:600,background:!allTime?'#2d7dd2':'transparent',color:!allTime?'#fff':'#555',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Monthly</button>
            <button onClick={()=>setAllTime(true)} style={{padding:'6px 12px',fontSize:11,fontWeight:600,background:allTime?'#2d7dd2':'transparent',color:allTime?'#fff':'#555',border:'none',cursor:'pointer',fontFamily:'inherit'}}>All time</button>
          </div>
          <input type="month" value={month} onChange={e=>setMonth(e.target.value)} disabled={allTime}
            style={{background:'#f0f1f3',border:'0.5px solid rgba(0,0,0,0.1)',color:allTime?'#444':'#ccc',fontSize:12,padding:'6px 10px',borderRadius:4,outline:'none',colorScheme:'light'}}/>
          <button onClick={logout} style={{fontSize:11,color:'#666',border:'0.5px solid rgba(0,0,0,0.15)',padding:'6px 14px',borderRadius:2,background:'transparent',cursor:'pointer'}}>Sign out</button>
        </div>
      </nav>

      <div style={{padding:'2rem'}}>

        {/* HERO */}
        <div style={{background:isPos?'linear-gradient(135deg,#0a1f12,#0d2b1a)':'linear-gradient(135deg,#1f0a0a,#2b0d0d)',border:`1px solid ${isPos?'rgba(42,125,79,0.35)':'rgba(231,76,60,0.35)'}`,borderRadius:16,padding:'2rem',marginBottom:'1.5rem',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-30,right:-30,fontSize:160,opacity:0.04}}>{isPos?'↑':'↓'}</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{fontSize:11,color:isPos?'rgba(74,222,128,0.7)':'rgba(248,113,113,0.7)',textTransform:'uppercase',letterSpacing:'0.2em',fontWeight:700,marginBottom:6}}>{allTime?'All time':''+fmtM(month+'-01')} · Net profit</div>
              <div style={{fontSize:56,fontWeight:900,color:isPos?'#4ade80':'#f87171',letterSpacing:'-0.02em',lineHeight:1}}>
                {isPos?'+':''}{netProfit>=0?money(netProfit):'-'+money(Math.abs(netProfit))}
              </div>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.35)',marginTop:8}}>{money(grossProfit)} gross · {money(totalExpenses)} expenses</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,minWidth:280}}>
              {PARTNERS.map(partner=>{
                const accKey = partner.toLowerCase()
                const ad = getAccountData(accKey)
                return (
                  <div key={partner} style={{background:'rgba(0,0,0,0.05)',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:10,padding:'1rem'}}>
                    <div style={{fontSize:10,color:'#666',marginBottom:4,fontWeight:700}}>👤 {partner}</div>
                    <div style={{fontSize:11,color:'#777',marginBottom:2}}>Month profit share</div>
                    <div style={{fontSize:20,fontWeight:800,color:profitPerPart>=0?'#4ade80':'#f87171'}}>{money(profitPerPart)}</div>
                    <div style={{marginTop:8,paddingTop:8,borderTop:'0.5px solid rgba(0,0,0,0.06)'}}>
                      <div style={{fontSize:9,color:'#999',marginBottom:2}}>Balance in account</div>
                      <div style={{fontSize:16,fontWeight:700,color:ad.balance>=0?'#60a5fa':'#f87171'}}>{money(ad.balance)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:'1.5rem'}}>
          {[
            {label:'Revenue',value:money(revenue),sub:`${monthOrders.length} orders`,color:'#60a5fa',icon:'💰'},
            {label:'Collected',value:money(collected),sub:`${money(outstanding)} outstanding`,color:'#34d399',icon:'✓'},
            {label:'Cost of goods',value:money(cogs),sub:'from orders',color:'#f87171',icon:'📦'},
            {label:'Gross profit',value:money(grossProfit),sub:`${revenue>0?((grossProfit/revenue)*100).toFixed(1):0}% margin`,color:grossProfit>=0?'#a78bfa':'#f87171',icon:'📊'},
            {label:'Expenses',value:money(totalExpenses),sub:`${monthExpenses.length} items`,color:'#fbbf24',icon:'🧾'},
          ].map(k=>(
            <div key={k.label} style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:10,padding:'1.25rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <div style={{fontSize:9,color:'#999',textTransform:'uppercase',letterSpacing:'0.12em',fontWeight:600}}>{k.label}</div>
                <span style={{fontSize:16,opacity:0.4}}>{k.icon}</span>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:k.color,marginBottom:4}}>{k.value}</div>
              <div style={{fontSize:10,color:'#888'}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div style={{display:'flex',gap:8,marginBottom:'1.5rem',borderBottom:'0.5px solid rgba(0,0,0,0.08)'}}>
          {[['overview','📊 Overview'],['accounts','💳 Accounts'],['expenses','🧾 Expenses'],['inventory','📦 Inventory'],['partners','🤝 Partners']].map(([k,l])=>(
            <button key={k} onClick={()=>setView(k)} style={{padding:'10px 18px',fontSize:12,fontWeight:600,color:view===k?'#2d7dd2':'#555',background:'transparent',border:'none',borderBottom:`2px solid ${view===k?'#2d7dd2':'transparent'}`,cursor:'pointer',fontFamily:'inherit'}}>{l}</button>
          ))}
        </div>

        {/* ══ OVERVIEW ════════════════════════════════════════ */}
        {view==='overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',animation:'fadeIn 0.3s ease'}}>

            {/* P&L */}
            <div style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:12,padding:'1.5rem'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:'1.25rem'}}>P&L — {fmtM(month+'-01')}</div>
              {[
                {label:'Gross revenue',      value:revenue,      color:'#60a5fa'},
                {label:'Cost of goods sold', value:-cogs,        color:'#f87171'},
                {label:'— Gross profit',     value:grossProfit,  color:grossProfit>=0?'#a78bfa':'#f87171', border:true},
                {label:'Operating expenses', value:-totalExpenses,color:'#fbbf24'},
                {label:'= Net profit',       value:netProfit,    color:netProfit>=0?'#4ade80':'#f87171', border:true, bold:true},
                {label:'Per partner (÷2)',   value:profitPerPart,color:profitPerPart>=0?'#34d399':'#f87171', sub:true},
              ].map((row,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:`${row.bold?'12px':'8px'} 0`,borderTop:row.border?'1px solid rgba(0,0,0,0.08)':i>0?'0.5px solid rgba(0,0,0,0.04)':'none',marginTop:row.border?4:0}}>
                  <span style={{fontSize:row.bold?13:11,color:row.sub?'#555':'#888',paddingLeft:row.sub?12:0}}>{row.label}</span>
                  <span style={{fontSize:row.bold?18:13,fontWeight:row.bold?800:600,color:row.color}}>
                    {row.value>=0?'+':''}{money(row.value)}
                  </span>
                </div>
              ))}
            </div>

            {/* EXPENSE CATEGORIES */}
            <div style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:12,padding:'1.5rem'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:'1.25rem'}}>Expenses by category</div>
              {byCat.length===0
                ? <div style={{textAlign:'center',color:'#999',fontSize:12,padding:'2rem'}}>No expenses this month</div>
                : byCat.map(({cat,total},i)=>{
                  const cols=['#f87171','#fbbf24','#a78bfa','#60a5fa','#34d399','#f97316','#e879f9','#94a3b8']
                  const c=cols[i%cols.length]
                  return (
                    <div key={cat} style={{marginBottom:10}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <span style={{fontSize:11,color:'#777'}}>{cat}</span>
                        <span style={{fontSize:12,fontWeight:700,color:c}}>{money(total)}</span>
                      </div>
                      <div style={{height:5,background:'rgba(0,0,0,0.06)',borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${(total/maxCat)*100}%`,background:c,borderRadius:3}}/>
                      </div>
                    </div>
                  )
                })
              }
            </div>

            {/* PROFIT PER ORDER */}
            <div style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:12,padding:'1.5rem',gridColumn:'span 2'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:'1.25rem'}}>Profit per order — {fmtM(month+'-01')}</div>
              {monthOrders.length===0
                ? <div style={{textAlign:'center',color:'#999',fontSize:12,padding:'2rem'}}>No confirmed orders this month</div>
                : <>
                  <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'8px 12px',background:'#f8f9fa',borderRadius:6,marginBottom:6}}>
                    {['Order / Client','Revenue','Cost','Gross profit','Margin','Account'].map((h,i)=>(
                      <div key={h} style={{fontSize:9,color:'#999',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,textAlign:i>0?'right':'left'}}>{h}</div>
                    ))}
                  </div>
                  {monthOrders.map((order,i)=>{
                    const orderCogs=(order.order_items||[]).reduce((s,item)=>{
                      const prod=products.find(p=>p.id===item.product_id||p.name===item.product_name)
                      return s+((prod?.cost_price||0)*item.quantity)
                    },0)
                    const orderProfit = order.total - orderCogs
                    const orderMargin = order.total>0?((orderProfit/order.total)*100).toFixed(1):0
                    const clientName  = (order.notes||'').split('Business: ')[1]?.split('|')[0]?.split('\n')[0]?.trim()||'Client'
                    const accLabel    = ACCOUNTS.find(a=>a.key===(order.payment_account||'company'))?.label||'Company'
                    const accColor    = ACCOUNTS.find(a=>a.key===(order.payment_account||'company'))?.color||'#60a5fa'
                    return (
                      <div key={order.id} style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'10px 12px',borderTop:'0.5px solid rgba(0,0,0,0.05)',alignItems:'center',background:i%2===1?'rgba(255,255,255,0.01)':'transparent'}}>
                        <div>
                          <div style={{fontSize:12,fontWeight:600,color:'#333'}}>#{order.order_number}</div>
                          <div style={{fontSize:10,color:'#999'}}>{clientName}</div>
                        </div>
                        <div style={{fontSize:12,fontWeight:600,color:'#60a5fa',textAlign:'right'}}>{money(order.total)}</div>
                        <div style={{fontSize:12,color:'#f87171',textAlign:'right'}}>{orderCogs>0?money(orderCogs):<span style={{color:'#888'}}>—</span>}</div>
                        <div style={{fontSize:13,fontWeight:700,color:orderProfit>=0?'#4ade80':'#f87171',textAlign:'right'}}>{orderProfit>=0?'+':''}{money(orderProfit)}</div>
                        <div style={{textAlign:'right'}}>
                          <span style={{fontSize:11,fontWeight:700,color:parseFloat(orderMargin)>30?'#4ade80':parseFloat(orderMargin)>15?'#fbbf24':'#f87171'}}>
                            {orderCogs>0?orderMargin+'%':'—'}
                          </span>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <span style={{fontSize:9,padding:'2px 8px',borderRadius:8,background:accColor+'20',color:accColor,fontWeight:600}}>{accLabel}</span>
                        </div>
                      </div>
                    )
                  })}
                  <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr',padding:'12px',background:'rgba(0,0,0,0.03)',borderTop:'1px solid rgba(0,0,0,0.08)',borderRadius:'0 0 8px 8px',marginTop:4}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#666'}}>{monthOrders.length} orders</div>
                    <div style={{fontSize:13,fontWeight:800,color:'#60a5fa',textAlign:'right'}}>{money(revenue)}</div>
                    <div style={{fontSize:13,fontWeight:800,color:'#f87171',textAlign:'right'}}>{money(cogs)}</div>
                    <div style={{fontSize:14,fontWeight:900,color:grossProfit>=0?'#4ade80':'#f87171',textAlign:'right'}}>{grossProfit>=0?'+':''}{money(grossProfit)}</div>
                    <div style={{fontSize:12,fontWeight:700,color:revenue>0&&((grossProfit/revenue)*100)>20?'#4ade80':'#fbbf24',textAlign:'right'}}>{revenue>0?((grossProfit/revenue)*100).toFixed(1)+'%':'—'}</div>
                    <div/>
                  </div>
                </>
              }
            </div>
          </div>
        )}

        {/* ══ ACCOUNTS ════════════════════════════════════════ */}
        {view==='accounts' && (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Account balances</div>
                <div style={{fontSize:12,color:'#999',marginTop:2}}>What each account actually has right now</div>
              </div>
              <button onClick={()=>setShowAddAcctPay(true)} style={{padding:'10px 18px',background:'#534ab7',color:'#111',fontSize:12,fontWeight:700,border:'none',borderRadius:6,cursor:'pointer'}}>+ Record payment</button>
            </div>

            {/* ADD PAYMENT FORM */}
            {showAddAcctPay && (
              <div style={{background:'#f8f9fa',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'1.5rem',marginBottom:'1.5rem',animation:'fadeIn 0.2s ease'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:'1rem'}}>Record account payment</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
                  <div>
                    <label style={lbl}>Date</label>
                    <input type="date" value={apForm.date} onChange={e=>setApForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'light'}}/>
                  </div>
                  <div>
                    <label style={lbl}>Account (who paid)</label>
                    <select value={apForm.partner} onChange={e=>setApForm(f=>({...f,partner:e.target.value,selectedOrders:[]}))} style={inp}>
                      {ACCOUNTS.map(a=><option key={a.key} value={a.label}>{a.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Payment type</label>
                    <select value={apForm.type} onChange={e=>setApForm(f=>({...f,type:e.target.value}))} style={inp}>
                      <option value="supplier_payment">Supplier payment (paid for orders)</option>
                      <option value="profit_transfer">Profit transfer (sent to company)</option>
                      <option value="other">Other outgoing payment</option>
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Amount ($)</label>
                    <input type="number" value={apForm.amount} onChange={e=>setApForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" style={inp}/>
                  </div>
                  <div style={{gridColumn:'span 2'}}>
                    <label style={lbl}>Description</label>
                    <input value={apForm.description} onChange={e=>setApForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Paid World Family for JBL order" style={inp}/>
                  </div>
                </div>

                {/* Order selector for supplier payments — ALL confirmed orders not yet covered */}
                {apForm.type==='supplier_payment' && (()=>{
                  const alreadyCovered = acctPay.filter(p=>p.type==='supplier_payment').flatMap(p=>p.order_ids||[])
                  const available = confirmedOrders.filter(o=>!alreadyCovered.includes(o.id))
                  if(available.length===0) return <div style={{padding:'10px 12px',background:'rgba(42,125,79,0.06)',border:'0.5px solid rgba(42,125,79,0.2)',borderRadius:4,fontSize:11,color:'#2a7d4f',marginBottom:12}}>✓ All orders are already covered by previous payments</div>
                  const selectedTotal = available.filter(o=>apForm.selectedOrders.includes(o.id)).reduce((s,o)=>{
                    const orderCogs=(o.order_items||[]).reduce((ss,item)=>{
                      const prod=products.find(p=>p.id===item.product_id||p.name===item.product_name)
                      return ss+((prod?.cost_price||0)*item.quantity)
                    },0)
                    return s+orderCogs
                  },0)
                  return (
                    <div style={{marginBottom:12}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                        <label style={lbl}>Orders this payment covers</label>
                        <button onClick={()=>setApForm(f=>({...f,selectedOrders:available.map(o=>o.id)}))} style={{fontSize:10,color:'#a78bfa',background:'rgba(83,74,183,0.1)',border:'0.5px solid rgba(83,74,183,0.25)',padding:'3px 10px',borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>Select all</button>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:240,overflowY:'auto',background:'#f8f9fa',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:6,padding:8}}>
                        {available.map(o=>{
                          const isSelected = apForm.selectedOrders.includes(o.id)
                          const clientName = (o.notes||'').split('Business: ')[1]?.split('|')[0]?.split('\n')[0]?.trim()||'Client'
                          const clientEmail = (o.notes||'').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim()||''
                          const client = clients?.find ? clients.find(c=>c.email===clientEmail) : null
                          const displayName = client ? `${client.contact_name} · ${client.business_name}` : clientName
                          const orderCogs=(o.order_items||[]).reduce((s,item)=>{
                            const prod=products.find(p=>p.id===item.product_id||p.name===item.product_name)
                            return s+((prod?.cost_price||0)*item.quantity)
                          },0)
                          const accLabel = ACCOUNTS.find(a=>a.key===(o.payment_account||'company'))?.label||'Company'
                          const accColor = ACCOUNTS.find(a=>a.key===(o.payment_account||'company'))?.color||'#60a5fa'
                          return (
                            <div key={o.id} onClick={()=>setApForm(f=>({...f,selectedOrders:isSelected?f.selectedOrders.filter(id=>id!==o.id):[...f.selectedOrders,o.id]}))}
                              style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:isSelected?'rgba(83,74,183,0.12)':'rgba(0,0,0,0.02)',border:`1px solid ${isSelected?'rgba(83,74,183,0.5)':'rgba(0,0,0,0.06)'}`,borderRadius:5,cursor:'pointer',transition:'all 0.15s'}}>
                              <div style={{display:'flex',alignItems:'center',gap:10}}>
                                <div style={{width:22,height:22,borderRadius:'50%',background:isSelected?'#534ab7':'rgba(0,0,0,0.06)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                  {isSelected&&<span style={{color:'#111',fontSize:12}}>✓</span>}
                                </div>
                                <div>
                                  <div style={{fontSize:12,fontWeight:700,color:isSelected?'#a78bfa':'#ccc'}}>#{o.order_number} · {displayName}</div>
                                  <div style={{fontSize:10,color:'#999',marginTop:1}}>
                                    {fmt(o.submitted_at)} · {(o.order_items||[]).length} products · 
                                    <span style={{color:accColor,marginLeft:4}}>{accLabel}</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                                <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{money(o.total)}</div>
                                {orderCogs>0
                                  ? <div style={{fontSize:10,color:'#f87171'}}>cost {money(orderCogs)}</div>
                                  : <div style={{fontSize:10,color:'#888'}}>no cost data</div>
                                }
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      {apForm.selectedOrders.length>0&&(
                        <div style={{marginTop:8,display:'flex',gap:10,alignItems:'center',padding:'8px 12px',background:'rgba(83,74,183,0.08)',border:'0.5px solid rgba(83,74,183,0.2)',borderRadius:4}}>
                          <span style={{fontSize:11,color:'#a78bfa',fontWeight:600}}>{apForm.selectedOrders.length} order(s) selected</span>
                          <span style={{fontSize:11,color:'#999'}}>·</span>
                          <span style={{fontSize:11,color:'#fbbf24'}}>Total cost: {money(selectedTotal)}</span>
                          {apForm.amount&&<><span style={{fontSize:11,color:'#999'}}>·</span><span style={{fontSize:11,color:parseFloat(apForm.amount)>=selectedTotal?'#4ade80':'#f87171'}}>Payment: {money(apForm.amount)}</span></>}
                        </div>
                      )}
                    </div>
                  )
                })()}

                <div>
                  <label style={lbl}>Notes</label>
                  <input value={apForm.notes} onChange={e=>setApForm(f=>({...f,notes:e.target.value}))} placeholder="Additional details..." style={{...inp,marginBottom:10}}/>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={saveAcctPay} disabled={saving} style={{padding:'10px 20px',background:'#534ab7',color:'#111',fontSize:12,fontWeight:700,border:'none',borderRadius:4,cursor:'pointer'}}>{saving?'Saving...':'✓ Record payment'}</button>
                  <button onClick={()=>setShowAddAcctPay(false)} style={{padding:'10px 16px',background:'transparent',color:'#999',fontSize:12,border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:4,cursor:'pointer'}}>Cancel</button>
                </div>
              </div>
            )}

            {/* ACCOUNT CARDS */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
              {ACCOUNTS.map(acc=>{
                const ad = getAccountData(acc.key)
                if(ad.totalIn===0 && ad.payments.length===0) return null
                return (
                  <div key={acc.key} style={{background:'#fff',border:`1px solid ${acc.color}25`,borderLeft:`4px solid ${acc.color}`,borderRadius:12,padding:'1.5rem'}}>
                    {/* Header */}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.25rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <span style={{fontSize:22}}>{acc.icon}</span>
                        <div>
                          <div style={{fontSize:15,fontWeight:800,color:'#111'}}>{acc.label}</div>
                          <div style={{fontSize:9,color:'#999',textTransform:'uppercase',letterSpacing:'0.1em'}}>Account balance</div>
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:28,fontWeight:900,color:ad.balance>=0?'#4ade80':'#f87171'}}>{money(ad.balance)}</div>
                        <div style={{fontSize:10,color:'#999'}}>current balance</div>
                      </div>
                    </div>

                    {/* IN / OUT / FREE */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:'1rem'}}>
                      {[
                        ['💰 Total in',money(ad.totalIn),'#34d399'],
                        ['💸 Total out',money(ad.totalOut),'#f87171'],
                        ['🏦 Balance',money(ad.balance),ad.balance>=0?'#4ade80':'#f87171'],
                      ].map(([l,v,c])=>(
                        <div key={l} style={{padding:'8px',background:'rgba(0,0,0,0.03)',border:`0.5px solid ${c}15`,borderRadius:6,textAlign:'center'}}>
                          <div style={{fontSize:9,color:'#999',marginBottom:3}}>{l}</div>
                          <div style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* BREAKDOWN of balance */}
                    <div style={{padding:'10px 12px',background:'rgba(0,0,0,0.02)',border:'0.5px solid rgba(0,0,0,0.06)',borderRadius:6,marginBottom:'1rem'}}>
                      <div style={{fontSize:9,color:'#666',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,marginBottom:8}}>Balance breakdown</div>
                      <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:11}}>
                        <span style={{color:'#666'}}>📦 Committed to pending orders</span>
                        <span style={{color:'#fbbf24',fontWeight:600}}>{money(ad.committedToOrders)}</span>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:11,borderTop:'0.5px solid rgba(0,0,0,0.04)'}}>
                        <span style={{color:'#666'}}>✅ Free profit (can transfer)</span>
                        <span style={{color:ad.freeProfitBalance>0?'#4ade80':'#555',fontWeight:700}}>{money(ad.freeProfitBalance)}</span>
                      </div>
                      {ad.profitXfer>0&&(
                        <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:11,borderTop:'0.5px solid rgba(0,0,0,0.04)'}}>
                          <span style={{color:'#666'}}>🔄 Already transferred to company</span>
                          <span style={{color:'#34d399',fontWeight:600}}>{money(ad.profitXfer)}</span>
                        </div>
                      )}
                    </div>

                    {/* Unpaid orders */}
                    {ad.unpaidOrders.length>0&&(
                      <div style={{padding:'8px 12px',background:'rgba(248,113,113,0.05)',border:'0.5px solid rgba(248,113,113,0.15)',borderRadius:6,marginBottom:'1rem'}}>
                        <div style={{fontSize:9,color:'#f87171',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,marginBottom:6}}>⚠ Orders awaiting payment</div>
                        {ad.unpaidOrders.slice(0,3).map(o=>{
                          const remaining=Math.max(0,(o.total||0)-(parseFloat(o.amount_paid)||0))
                          const clientName=(o.notes||'').split('Business: ')[1]?.split('|')[0]?.split('\n')[0]?.trim()||'Client'
                          return (
                            <div key={o.id} style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#666',padding:'2px 0'}}>
                              <span>#{o.order_number} {clientName}</span>
                              <span style={{color:'#f87171',fontWeight:600}}>{money(remaining)} due</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Payment history */}
                    {ad.payments.length>0&&(
                      <div>
                        <div style={{fontSize:9,color:'#999',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,marginBottom:6}}>Payment history</div>
                        {ad.payments.map(p=>{
                          const typeColor={supplier_payment:'#fbbf24',profit_transfer:'#34d399',other:'#888'}
                          const typeLabel={supplier_payment:'Supplier paid',profit_transfer:'Profit transferred',other:'Other'}
                          return (
                            <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'7px 0',borderTop:'0.5px solid rgba(0,0,0,0.04)'}}>
                              <div>
                                <div style={{fontSize:11,color:'#333'}}>{p.description}</div>
                                <div style={{fontSize:9,color:'#999'}}>{typeLabel[p.type]} · {fmt(p.date)}</div>
                                {p.order_ids?.length>0&&<div style={{fontSize:9,color:'#a78bfa'}}>covers {p.order_ids.length} order(s)</div>}
                              </div>
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <span style={{fontSize:12,fontWeight:700,color:typeColor[p.type]||'#888'}}>-{money(p.amount)}</span>
                                <button onClick={()=>del('account_payments',p.id)} style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer',fontSize:12,opacity:0.4,padding:0}}>×</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ══ EXPENSES ════════════════════════════════════════ */}
        {view==='expenses' && (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Operating expenses</div>
                <div style={{fontSize:12,color:'#999',marginTop:2}}>{fmtM(month+'-01')} · {money(totalExpenses)} total</div>
              </div>
              <button onClick={()=>setShowAddExpense(true)} style={{padding:'10px 18px',background:'#2d7dd2',color:'#111',fontSize:12,fontWeight:700,border:'none',borderRadius:6,cursor:'pointer'}}>+ Add expense</button>
            </div>
            {showAddExpense&&(
              <div style={{background:'#f8f9fa',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'1.5rem',marginBottom:'1.5rem'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:'1rem'}}>New expense</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
                  <div><label style={lbl}>Date</label><input type="date" value={expForm.date} onChange={e=>setExpForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'light'}}/></div>
                  <div><label style={lbl}>Category</label><select value={expForm.category} onChange={e=>setExpForm(f=>({...f,category:e.target.value}))} style={inp}>{EXPENSE_CATS.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label style={lbl}>Amount ($)</label><input type="number" value={expForm.amount} onChange={e=>setExpForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" style={inp}/></div>
                  <div style={{gridColumn:'span 2'}}><label style={lbl}>Description</label><input value={expForm.description} onChange={e=>setExpForm(f=>({...f,description:e.target.value}))} placeholder="What was this for?" style={inp}/></div>
                  <div><label style={lbl}>Paid by</label><select value={expForm.paid_by} onChange={e=>setExpForm(f=>({...f,paid_by:e.target.value}))} style={inp}><option value="company">Company</option><option value="Victor">Victor</option><option value="Leopoldo">Leopoldo</option></select></div>
                  <div style={{gridColumn:'span 3'}}><label style={lbl}>Notes</label><input value={expForm.notes} onChange={e=>setExpForm(f=>({...f,notes:e.target.value}))} placeholder="Additional details..." style={inp}/></div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={saveExpense} disabled={saving} style={{padding:'10px 20px',background:'#2d7dd2',color:'#111',fontSize:12,fontWeight:700,border:'none',borderRadius:4,cursor:'pointer'}}>{saving?'Saving...':'✓ Save'}</button>
                  <button onClick={()=>setShowAddExpense(false)} style={{padding:'10px 16px',background:'transparent',color:'#999',fontSize:12,border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:4,cursor:'pointer'}}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:10,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 140px 120px 100px 80px 40px',padding:'10px 16px',background:'#f8f9fa',borderBottom:'0.5px solid rgba(0,0,0,0.08)'}}>
                {['Description','Category','Amount','Paid by','Date',''].map((h,i)=><div key={i} style={{fontSize:9,color:'#999',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,textAlign:i>=2?'right':'left'}}>{h}</div>)}
              </div>
              {monthExpenses.length===0
                ? <div style={{padding:'3rem',textAlign:'center',color:'#999',fontSize:12}}>No expenses for {fmtM(month+'-01')}</div>
                : monthExpenses.map((e,i)=>(
                  <div key={e.id} style={{display:'grid',gridTemplateColumns:'1fr 140px 120px 100px 80px 40px',padding:'12px 16px',borderTop:i>0?'0.5px solid rgba(0,0,0,0.04)':'none',alignItems:'center'}}>
                    <div><div style={{fontSize:13,color:'#333'}}>{e.description}</div>{e.notes&&<div style={{fontSize:10,color:'#999'}}>{e.notes}</div>}</div>
                    <div><span style={{fontSize:10,padding:'2px 8px',background:'rgba(251,191,36,0.1)',color:'#fbbf24',borderRadius:10}}>{e.category}</span></div>
                    <div style={{fontSize:13,fontWeight:700,color:'#f87171',textAlign:'right'}}>{money(e.amount)}</div>
                    <div style={{fontSize:11,color:'#666',textAlign:'right'}}>{e.paid_by}</div>
                    <div style={{fontSize:10,color:'#999',textAlign:'right'}}>{fmt(e.date)}</div>
                    <div style={{textAlign:'right'}}><button onClick={()=>del('expenses',e.id)} style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer',fontSize:14,opacity:0.5,padding:0}}>×</button></div>
                  </div>
                ))
              }
              {monthExpenses.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 140px 120px 100px 80px 40px',padding:'12px 16px',background:'rgba(0,0,0,0.03)',borderTop:'1px solid rgba(0,0,0,0.08)'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'#666'}}>Total</div><div/><div style={{fontSize:15,fontWeight:800,color:'#fbbf24',textAlign:'right'}}>{money(totalExpenses)}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ INVENTORY ════════════════════════════════════════ */}
        {view==='inventory' && (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <div><div style={{fontSize:16,fontWeight:700,color:'#111'}}>Inventory purchases</div><div style={{fontSize:12,color:'#999',marginTop:2}}>All-time · {money(inventory.reduce((s,i)=>s+(i.total_cost||0),0))} total invested</div></div>
              <button onClick={()=>setShowAddInv(true)} style={{padding:'10px 18px',background:'#2a7d4f',color:'#111',fontSize:12,fontWeight:700,border:'none',borderRadius:6,cursor:'pointer'}}>+ Add purchase</button>
            </div>
            {showAddInv&&(
              <div style={{background:'#f8f9fa',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'1.5rem',marginBottom:'1.5rem'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:'1rem'}}>New inventory purchase</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
                  <div><label style={lbl}>Date</label><input type="date" value={invForm.date} onChange={e=>setInvForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'light'}}/></div>
                  <div style={{gridColumn:'span 2'}}><label style={lbl}>Product name</label><input value={invForm.product_name} onChange={e=>setInvForm(f=>({...f,product_name:e.target.value}))} placeholder="e.g. JBL PartyBox 710" style={inp}/></div>
                  <div><label style={lbl}>Supplier</label><input value={invForm.supplier} onChange={e=>setInvForm(f=>({...f,supplier:e.target.value}))} placeholder="e.g. World Family" style={inp}/></div>
                  <div><label style={lbl}>Units</label><input type="number" value={invForm.units} onChange={e=>setInvForm(f=>({...f,units:e.target.value}))} placeholder="0" style={inp}/></div>
                  <div><label style={lbl}>Unit cost ($)</label><input type="number" value={invForm.unit_cost} onChange={e=>setInvForm(f=>({...f,unit_cost:e.target.value}))} placeholder="0.00" style={inp}/></div>
                  <div><label style={lbl}>Paid by</label><select value={invForm.paid_by} onChange={e=>setInvForm(f=>({...f,paid_by:e.target.value}))} style={inp}><option value="company">Company</option><option value="Victor">Victor</option><option value="Leopoldo">Leopoldo</option></select></div>
                  <div style={{gridColumn:'span 2'}}><label style={lbl}>Notes</label><input value={invForm.notes} onChange={e=>setInvForm(f=>({...f,notes:e.target.value}))} placeholder="PO, tracking, etc." style={inp}/></div>
                </div>
                {invForm.units&&invForm.unit_cost&&<div style={{padding:'8px 12px',background:'rgba(96,165,250,0.08)',border:'0.5px solid rgba(96,165,250,0.2)',borderRadius:4,marginBottom:10,fontSize:12,color:'#60a5fa'}}>Total: <strong>{money(parseFloat(invForm.unit_cost)*parseInt(invForm.units))}</strong></div>}
                <div style={{display:'flex',gap:8}}>
                  <button onClick={saveInv} disabled={saving} style={{padding:'10px 20px',background:'#2a7d4f',color:'#111',fontSize:12,fontWeight:700,border:'none',borderRadius:4,cursor:'pointer'}}>{saving?'Saving...':'✓ Save'}</button>
                  <button onClick={()=>setShowAddInv(false)} style={{padding:'10px 16px',background:'transparent',color:'#999',fontSize:12,border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:4,cursor:'pointer'}}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:10,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 100px 80px 110px 120px 80px 40px',padding:'10px 16px',background:'#f8f9fa',borderBottom:'0.5px solid rgba(0,0,0,0.08)'}}>
                {['Product','Units','Unit cost','Total','Supplier','Date',''].map((h,i)=><div key={i} style={{fontSize:9,color:'#999',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,textAlign:i>=1?'right':'left'}}>{h}</div>)}
              </div>
              {inventory.length===0
                ? <div style={{padding:'3rem',textAlign:'center',color:'#999',fontSize:12}}>No purchases recorded</div>
                : inventory.map((iv,i)=>(
                  <div key={iv.id} style={{display:'grid',gridTemplateColumns:'1fr 100px 80px 110px 120px 80px 40px',padding:'12px 16px',borderTop:i>0?'0.5px solid rgba(0,0,0,0.04)':'none',alignItems:'center'}}>
                    <div><div style={{fontSize:13,color:'#333',fontWeight:600}}>{iv.product_name}</div>{iv.notes&&<div style={{fontSize:10,color:'#999'}}>{iv.notes}</div>}<div style={{fontSize:10,color:'#888'}}>Paid by: {iv.paid_by}</div></div>
                    <div style={{fontSize:12,color:'#777',textAlign:'right'}}>{iv.units}</div>
                    <div style={{fontSize:12,color:'#777',textAlign:'right'}}>{money(iv.unit_cost)}</div>
                    <div style={{fontSize:13,fontWeight:700,color:'#60a5fa',textAlign:'right'}}>{money(iv.total_cost)}</div>
                    <div style={{fontSize:11,color:'#666',textAlign:'right'}}>{iv.supplier||'—'}</div>
                    <div style={{fontSize:10,color:'#999',textAlign:'right'}}>{fmt(iv.date)}</div>
                    <div style={{textAlign:'right'}}><button onClick={()=>del('inventory_purchases',iv.id)} style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer',fontSize:14,opacity:0.5,padding:0}}>×</button></div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* ══ PARTNERS ════════════════════════════════════════ */}
        {view==='partners' && (
          <div style={{animation:'fadeIn 0.3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <div><div style={{fontSize:16,fontWeight:700,color:'#111'}}>Partner transactions</div><div style={{fontSize:12,color:'#999',marginTop:2}}>Investments, withdrawals & distributions</div></div>
              <button onClick={()=>setShowAddPartner(true)} style={{padding:'10px 18px',background:'#534ab7',color:'#111',fontSize:12,fontWeight:700,border:'none',borderRadius:6,cursor:'pointer'}}>+ Add transaction</button>
            </div>
            {showAddPartner&&(
              <div style={{background:'#f8f9fa',border:'0.5px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'1.5rem',marginBottom:'1.5rem'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:'1rem'}}>New transaction</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
                  <div><label style={lbl}>Date</label><input type="date" value={ptxForm.date} onChange={e=>setPtxForm(f=>({...f,date:e.target.value}))} style={{...inp,colorScheme:'light'}}/></div>
                  <div><label style={lbl}>Partner</label><select value={ptxForm.partner} onChange={e=>setPtxForm(f=>({...f,partner:e.target.value}))} style={inp}>{PARTNERS.map(p=><option key={p}>{p}</option>)}</select></div>
                  <div><label style={lbl}>Type</label><select value={ptxForm.type} onChange={e=>setPtxForm(f=>({...f,type:e.target.value}))} style={inp}><option value="investment">Investment</option><option value="withdrawal">Withdrawal</option><option value="distribution">Distribution</option><option value="expense_reimbursement">Expense reimbursement</option></select></div>
                  <div><label style={lbl}>Amount ($)</label><input type="number" value={ptxForm.amount} onChange={e=>setPtxForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" style={inp}/></div>
                  <div style={{gridColumn:'span 2'}}><label style={lbl}>Description</label><input value={ptxForm.description} onChange={e=>setPtxForm(f=>({...f,description:e.target.value}))} placeholder="What is this?" style={inp}/></div>
                  <div style={{gridColumn:'span 3'}}><label style={lbl}>Notes</label><input value={ptxForm.notes} onChange={e=>setPtxForm(f=>({...f,notes:e.target.value}))} placeholder="Additional details..." style={inp}/></div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={savePtx} disabled={saving} style={{padding:'10px 20px',background:'#534ab7',color:'#111',fontSize:12,fontWeight:700,border:'none',borderRadius:4,cursor:'pointer'}}>{saving?'Saving...':'✓ Save'}</button>
                  <button onClick={()=>setShowAddPartner(false)} style={{padding:'10px 16px',background:'transparent',color:'#999',fontSize:12,border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:4,cursor:'pointer'}}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
              {PARTNERS.map(partner=>{
                const txs=partnerTx.filter(t=>t.partner===partner)
                const totalIn=txs.filter(t=>t.type==='investment').reduce((s,t)=>s+(t.amount||0),0)
                const totalOut=txs.filter(t=>['withdrawal','distribution'].reduce((s,t)=>s+(t.amount||0),0))
                return(
                  <div key={partner} style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:12,padding:'1.5rem'}}>
                    <div style={{fontSize:15,fontWeight:800,color:'#111',marginBottom:'1rem'}}>👤 {partner}</div>
                    {txs.slice(0,5).map((t,i)=>{
                      const tc={investment:'#60a5fa',withdrawal:'#fbbf24',distribution:'#4ade80',expense_reimbursement:'#34d399'}
                      const ti={investment:'⬆',withdrawal:'⬇',distribution:'💚',expense_reimbursement:'🔄'}
                      return(
                        <div key={t.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderTop:i>0?'0.5px solid rgba(0,0,0,0.04)':'none'}}>
                          <div>
                            <div style={{fontSize:11,color:'#333'}}><span style={{color:tc[t.type]||'#ccc'}}>{ti[t.type]} </span>{t.description}</div>
                            <div style={{fontSize:9,color:'#999'}}>{t.type.replace('_',' ')} · {fmt(t.date)}</div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <span style={{fontSize:13,fontWeight:700,color:tc[t.type]||'#ccc'}}>{money(t.amount)}</span>
                            <button onClick={()=>del('partner_transactions',t.id)} style={{background:'none',border:'none',color:'#e74c3c',cursor:'pointer',fontSize:12,opacity:0.4,padding:0}}>×</button>
                          </div>
                        </div>
                      )
                    })}
                    {txs.length===0&&<div style={{textAlign:'center',color:'#999',fontSize:12,padding:'1rem'}}>No transactions</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
