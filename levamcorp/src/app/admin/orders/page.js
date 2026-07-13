'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

const STATUS_COLOR = { new:'#2d7dd2', review:'#c49a00', confirmed:'#534ab7', dispatched:'#2a7d4f', completed:'#2a7d4f', cancelled:'#e74c3c' }
const STATUS_LABEL = { new:'New', review:'In review', confirmed:'Confirmed', dispatched:'Dispatched', completed:'Completed', cancelled:'Cancelled' }
const NEXT_STATUS  = { new:'review', review:'confirmed', confirmed:'dispatched', dispatched:'completed' }
const NEXT_LABEL   = { new:'Move to review', review:'Confirm order', confirmed:'Mark dispatched', dispatched:'Mark completed' }

const fmt  = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'
const fmtL = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—'
const money = (n) => '$'+(parseFloat(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
const inp = { width:'100%', background:'#f0f1f3', border:'0.5px solid rgba(0,0,0,0.1)', color:'#888', fontSize:12, padding:'8px 10px', borderRadius:4, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [sel,     setSel]     = useState(null)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [tab,     setTab]     = useState('details')
  // sub-forms
  const [showETA,      setShowETA]      = useState(false)
  const [showPayment,  setShowPayment]  = useState(false)
  const [showUnits,    setShowUnits]    = useState(false)
  const [etaForm,      setEtaForm]      = useState({eta:'',eta_notes:''})
  const [payForm,      setPayForm]      = useState({amount:'',notes:''})
  const [unitItems,    setUnitItems]    = useState([])
  const [saving,       setSaving]       = useState(false)
  const [showDone,     setShowDone]     = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href='/admin'; return }
      await reload(sb)
    })
  }, [])

  const reload = async (sb) => {
    sb = sb || createClient()
    const [{ data: o }, { data: c }] = await Promise.all([
      sb.from('orders').select('*, order_items(*)').order('submitted_at',{ascending:false}),
      sb.from('clients').select('*'),
    ])
    setOrders(o||[])
    setClients(c||[])
    setLoading(false)
  }

  const logout = async () => { await createClient().auth.signOut(); window.location.href='/admin' }

  // get client record for an order
  const clientFor = (order) => {
    const email = (order.notes||'').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim() || ''
    return clients.find(c => c.email?.toLowerCase() === email.toLowerCase()) || null
  }

  const updateStatus = async (orderId, status) => {
    const sb = createClient()
    await sb.from('orders').update({status}).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id===orderId ? {...o,status} : o))
    setSel(prev => prev?.id===orderId ? {...prev,status} : prev)
  }

  const saveETA = async () => {
    setSaving(true)
    await createClient().from('orders').update({eta:etaForm.eta||null, eta_notes:etaForm.eta_notes}).eq('id',sel.id)
    await reload(); setSel(prev=>({...prev,...etaForm})); setShowETA(false); setSaving(false)
  }

  const savePayment = async () => {
    if (!payForm.amount) return
    setSaving(true)
    const sb = createClient()
    const newPaid = (parseFloat(sel.amount_paid)||0) + parseFloat(payForm.amount)
    const log = `${new Date().toLocaleDateString()}: ${money(payForm.amount)}${payForm.notes?' — '+payForm.notes:''}`
    const newNotes = sel.payment_notes ? sel.payment_notes+'\n'+log : log
    await sb.from('orders').update({amount_paid:newPaid, payment_notes:newNotes}).eq('id',sel.id)
    await reload(); setSel(prev=>({...prev,amount_paid:newPaid,payment_notes:newNotes}))
    setPayForm({amount:'',notes:''}); setShowPayment(false); setSaving(false)
  }

  const saveUnits = async () => {
    setSaving(true)
    const sb = createClient()
    const newTotal = unitItems.reduce((s,i)=>s+(parseFloat(i.unit_price)*parseInt(i.quantity||1)),0)
    for (const item of unitItems) {
      await sb.from('order_items').update({quantity:parseInt(item.quantity)||1}).eq('id',item.id)
    }
    await sb.from('orders').update({total:newTotal}).eq('id',sel.id)
    // Update local state immediately without full reload
    const updatedItems = unitItems.map(i=>({...i,quantity:parseInt(i.quantity)||1}))
    setOrders(prev => prev.map(o => o.id===sel.id ? {...o, total:newTotal, order_items:updatedItems} : o))
    setSel(prev => ({...prev, total:newTotal, order_items:updatedItems}))
    setShowUnits(false)
    setSaving(false)
  }

  const openDoc = async (path) => {
    if (!path) return
    const sb = createClient()
    let r = await sb.storage.from('Documents').createSignedUrl(path,3600)
    if (!r.data?.signedUrl) r = await sb.storage.from('documents').createSignedUrl(path,3600)
    if (r.data?.signedUrl) window.open(r.data.signedUrl,'_blank')
  }

  const printInvoice = (order) => {
    const c   = clientFor(order)
    const items = order.order_items || []
    const eta   = order.eta ? new Date(order.eta+'T00:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : null

    const billTo = [
      c?.contact_name || (order.notes||'').split('Business: ')[1]?.split(/[|\n]/)[0]?.trim() || 'Client',
      c?.business_name || '',
      c?.email || (order.notes||'').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim() || '',
      c?.phone || (order.notes||'').split('Phone: ')[1]?.split(/[|\n]/)[0]?.trim() || '',
      c?.address || '',
      c?.ein_number ? 'EIN: '+c.ein_number : '',
    ].filter(Boolean)

    const rows = items.map(i =>
      `<tr>
        <td style="padding:11px 16px;font-size:13px;border-bottom:1px solid #f0f0f0">${i.product_name}</td>
        <td style="padding:11px 16px;font-size:13px;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
        <td style="padding:11px 16px;font-size:13px;border-bottom:1px solid #f0f0f0;text-align:right">${money(i.unit_price)}</td>
        <td style="padding:11px 16px;font-size:13px;font-weight:700;border-bottom:1px solid #f0f0f0;text-align:right">${money(i.unit_price*i.quantity)}</td>
      </tr>`
    ).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Helvetica Neue',Arial,sans-serif;color:#111;background:#fff}
      @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body>
    <!-- HEADER -->
    <div style="background:#111;padding:32px 48px;display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:10px;letter-spacing:0.3em;color:#666;text-transform:uppercase;margin-bottom:6px">Corp · Distributors</div>
        <div style="font-size:30px;font-weight:900;color:#fff;letter-spacing:0.12em;text-transform:uppercase">LEVAM<span style="color:#2d7dd2">CORP</span></div>
        <div style="margin-top:14px;font-size:11px;color:#777;line-height:2">
          6315 NW 99th Ave, Doral, FL 33178<br>
          partners@levamcorp.com &nbsp;·&nbsp; www.levamcorp.com<br>
          (786) 878-4122
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:38px;font-weight:900;color:#fff;letter-spacing:0.06em">INVOICE</div>
        <div style="font-size:17px;color:#2d7dd2;font-weight:700;margin-top:4px">#${order.order_number}</div>
        <div style="margin-top:14px;font-size:11px;color:#777;line-height:2">
          <span style="color:#555">Date:</span> <span style="color:#ccc">${fmtL(order.submitted_at)}</span><br>
          <span style="color:#555">Status:</span> <span style="color:#ccc">${STATUS_LABEL[order.status]||order.status}</span><br>
          <span style="color:#555">Terms:</span> <span style="color:#ccc">Net 15</span>
        </div>
      </div>
    </div>
    <!-- BLUE LINE -->
    <div style="height:3px;background:#2d7dd2"></div>
    <!-- FROM / BILL TO -->
    <div style="display:grid;grid-template-columns:1fr 1fr;padding:28px 48px;border-bottom:1px solid #eee;gap:48px">
      <div>
        <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;font-weight:700;margin-bottom:10px">From</div>
        <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:6px">Levam Corp Distributors</div>
        <div style="font-size:12px;color:#666;line-height:1.9">
          6315 NW 99th Ave<br>Doral, FL 33178<br>
          partners@levamcorp.com<br>(786) 878-4122
        </div>
      </div>
      <div>
        <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;font-weight:700;margin-bottom:10px">Bill to</div>
        <div style="font-size:12px;color:#333;line-height:1.9">
          ${billTo.map((line,i)=>`<div style="${i===0?'font-size:14px;font-weight:700;color:#111;margin-bottom:4px':''}">${line}</div>`).join('')}
        </div>
      </div>
    </div>
    ${eta ? `<div style="margin:20px 48px 0;padding:12px 18px;background:#eef7ee;border:1px solid #2a7d4f;border-radius:4px;display:flex;align-items:center;gap:12px">
      <div style="font-size:10px;color:#2a7d4f;text-transform:uppercase;letter-spacing:0.1em;font-weight:700">Estimated arrival</div>
      <div style="font-size:15px;font-weight:800;color:#2a7d4f">${eta}</div>
      ${order.eta_notes?`<div style="font-size:11px;color:#555;margin-left:auto">${order.eta_notes}</div>`:''}
    </div>` : ''}
    <!-- ITEMS -->
    <div style="padding:24px 48px 0">
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#111">
            <th style="padding:12px 16px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.1em;text-align:left">Product / Description</th>
            <th style="padding:12px 16px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;text-align:center">Qty</th>
            <th style="padding:12px 16px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;text-align:right">Unit price</th>
            <th style="padding:12px 16px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <!-- TOTAL -->
      <div style="display:flex;justify-content:flex-end;margin-top:16px;margin-bottom:28px">
        <div style="width:300px">
          <div style="display:flex;justify-content:space-between;padding:8px 16px;font-size:12px;color:#888;border-top:1px solid #eee">
            <span>Subtotal</span><span>${money(order.total)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:16px;background:#111;border-radius:4px;margin-top:4px">
            <span style="font-size:13px;font-weight:700;color:#fff;letter-spacing:0.08em;text-transform:uppercase">Total due</span>
            <span style="font-size:22px;font-weight:900;color:#fff">${money(order.total)}</span>
          </div>
          ${(parseFloat(order.amount_paid)||0)>0?`<div style="display:flex;justify-content:space-between;padding:8px 16px;font-size:12px;margin-top:4px;background:#eef7ee;border-radius:4px">
            <span style="color:#2a7d4f;font-weight:600">Amount paid</span><span style="color:#2a7d4f;font-weight:700">${money(order.amount_paid)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 16px;font-size:13px;font-weight:700;background:#fff3cd;border-radius:4px;margin-top:4px">
            <span>Balance due</span><span>${money(Math.max(0,order.total-(parseFloat(order.amount_paid)||0)))}</span>
          </div>`:''}
        </div>
      </div>
    </div>
    <!-- PAYMENT INFO -->
    <div style="margin:0 48px 24px;padding:20px 24px;background:#f7f8fa;border:1px solid #e8e8e8;border-radius:4px">
      <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;font-weight:700;margin-bottom:12px">Payment instructions</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px">
        <div><span style="color:#aaa">Bank:</span> <strong>Bank of America</strong></div>
        <div><span style="color:#aaa">Account name:</span> <strong>Levam Corp</strong></div>
        <div><span style="color:#aaa">Account #:</span> <strong>898169098220</strong></div>
        <div><span style="color:#aaa">ACH routing:</span> <strong>063100277</strong></div>
        <div><span style="color:#aaa">Wire routing:</span> <strong>026009593</strong></div>
        <div><span style="color:#aaa">Address:</span> <strong>6315 NW 99th Ave, Doral, FL 33178</strong></div>
      </div>
    </div>
    <!-- T&C -->
    <div style="margin:0 48px 28px;padding:18px 22px;background:#f7f8fa;border:1px solid #e8e8e8;border-radius:4px">
      <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;font-weight:700;margin-bottom:10px">Terms & Conditions</div>
      <div style="font-size:11px;color:#555;line-height:1.9">
        <strong style="color:#111">ALL SALES ARE FINAL</strong> — No returns or refunds except for damaged/defective items reported within 48 hours with photo evidence.
        <strong style="color:#111"> PAYMENT</strong> — Due within 15 days. Accepted: Wire Transfer, ACH, Credit/Debit Card. Late payments subject to 1.5% monthly fee.
        <strong style="color:#111"> JURISDICTION</strong> — Governed by the laws of the State of Florida, Miami-Dade County courts.
        <strong style="color:#111"> CHARGEBACKS</strong> — Unauthorized chargebacks will be disputed and may result in termination of the business relationship.
      </div>
    </div>
    <!-- SIGNATURES -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;padding:0 48px 40px">
      ${['Authorized · Levam Corp','Accepted · Client'].map(l=>`
      <div>
        <div style="border-top:1px solid #ddd;padding-top:8px">
          <div style="font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em">${l}</div>
          <div style="font-size:10px;color:#ccc;margin-top:4px">Signature &amp; date</div>
        </div>
      </div>`).join('')}
    </div>
    <!-- FOOTER -->
    <div style="background:#111;padding:14px 48px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:10px;color:#555">Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178</div>
      <div style="font-size:10px;color:#555">partners@levamcorp.com · levamcorp.com</div>
    </div>
    </body></html>`

    const w = window.open('','_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(()=>w.print(),600)
  }

  const grouped = {new:[],review:[],confirmed:[],dispatched:[],completed:[],cancelled:[]}
  orders.forEach(o => { if(grouped[o.status]) grouped[o.status].push(o) })
  const visible = orders.filter(o => {
    const matchF = filter==='all' || o.status===filter
    const matchS = !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      (o.notes||'').toLowerCase().includes(search.toLowerCase())
    return matchF && matchS
  })

  if (loading) return <div style={{minHeight:'100vh',background:'#f4f5f7',display:'flex',alignItems:'center',justifyContent:'center',color:'#999'}}>Loading...</div>

  const sc = sel ? (STATUS_COLOR[sel.status]||'#888') : '#888'
  const paid = parseFloat(sel?.amount_paid)||0
  const balance = Math.max(0,(sel?.total||0)-paid)
  const selClient = sel ? clientFor(sel) : null

  return (
    <div style={{background:'#f4f5f7',minHeight:'100vh'}}>
      {/* NAV */}
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 2rem',background:'#fff',borderBottom:'0.5px solid rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{fontSize:13,fontWeight:700,letterSpacing:'0.15em',color:'#333',textTransform:'uppercase'}}>Levam Admin</div>
          <div style={{display:'flex',borderLeft:'0.5px solid rgba(0,0,0,0.06)',paddingLeft:16}}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart']].map(([l,h])=>(
              <Link key={l} href={h} style={{fontSize:12,color:l==='Orders'?'#2d7dd2':'#777',textDecoration:'none',padding:'4px 14px',borderBottom:l==='Orders'?'2px solid #2d7dd2':'2px solid transparent',fontWeight:l==='Orders'?700:400}}>{l}</Link>
            ))}
          </div>
        </div>
        <button onClick={logout} style={{fontSize:11,color:'#666',border:'0.5px solid rgba(0,0,0,0.15)',padding:'6px 14px',borderRadius:2,background:'transparent',cursor:'pointer'}}>Sign out</button>
      </nav>

      {/* STATS BAR */}
      <div style={{padding:'1rem 2rem',background:'#fff',borderBottom:'0.5px solid rgba(0,0,0,0.08)',display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8}}>
        {[
          ['New',grouped.new.length,'#2d7dd2'],
          ['Review',grouped.review.length,'#c49a00'],
          ['Confirmed',grouped.confirmed.length,'#534ab7'],
          ['Dispatched',grouped.dispatched.length,'#2a7d4f'],
          ['Completed',grouped.completed.length,'#2a7d4f'],
          ['Cancelled',grouped.cancelled.length,'#e74c3c'],
          ['Revenue','$'+orders.filter(o=>['confirmed','dispatched','completed'].includes(o.status)).reduce((s,o)=>s+(o.total||0),0).toLocaleString(),'#2a7d4f'],
        ].map(([l,v,c])=>(
          <div key={l} style={{background:'rgba(0,0,0,0.03)',border:'0.5px solid rgba(0,0,0,0.06)',borderRadius:4,padding:'0.6rem 0.875rem'}}>
            <div style={{fontSize:9,color:'#999',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:3}}>{l}</div>
            <div style={{fontSize:17,fontWeight:700,color:c}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{padding:'1.5rem 2rem',display:'grid',gridTemplateColumns:sel?'1fr 460px':'1fr',gap:'1.5rem',alignItems:'start'}}>

        {/* LEFT LIST */}
        <div>
          {/* FILTERS */}
          <div style={{display:'flex',gap:8,marginBottom:'1rem',flexWrap:'wrap',alignItems:'center'}}>
            <div style={{position:'relative',flex:1,minWidth:180}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders..."
                style={{...inp,padding:'7px 12px 7px 28px',borderRadius:20,background:'rgba(0,0,0,0.05)',border:'0.5px solid rgba(0,0,0,0.1)',color:'#333'}}/>
              <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',fontSize:12,color:'#999'}}>🔍</span>
            </div>
            {['all','new','review','confirmed','dispatched','completed','cancelled'].map(s=>(
              <button key={s} onClick={()=>setFilter(s)} style={{fontSize:11,padding:'6px 12px',borderRadius:20,border:`0.5px solid ${filter===s?(STATUS_COLOR[s]||'#2d7dd2'):'rgba(0,0,0,0.08)'}`,background:filter===s?`${STATUS_COLOR[s]||'#2d7dd2'}20`:'transparent',color:filter===s?(STATUS_COLOR[s]||'#2d7dd2'):'#555',cursor:'pointer',fontWeight:filter===s?700:400,fontFamily:'inherit'}}>
                {s==='all'?`All (${orders.length})`:STATUS_LABEL[s]+' ('+grouped[s].length+')'}
              </button>
            ))}
          </div>

          {/* ORDERS */}
          {(() => {
            const DONE = ['completed','cancelled','dispatched']
            const activeRaw = visible.filter(o => !DONE.includes(o.status))
            const done      = visible.filter(o => DONE.includes(o.status))

            // Sort active: unpaid first → partial → paid
            const payPriority = (o) => {
              const paid = parseFloat(o.amount_paid)||0
              if (paid <= 0) return 0          // unpaid — top
              if (paid < o.total) return 1     // partial
              return 2                         // fully paid
            }
            const active = [...activeRaw].sort((a,b) => payPriority(a) - payPriority(b))

            const renderOrder = (order) => {
              const oc = clientFor(order)
              const isPaid = (parseFloat(order.amount_paid)||0) >= order.total
              const hasPartial = (parseFloat(order.amount_paid)||0) > 0 && !isPaid
              return (
                <div key={order.id} onClick={()=>{setSel(order===sel?null:order);setTab('details');setShowETA(false);setShowPayment(false);setShowUnits(false)}}
                  style={{background: (parseFloat(order.amount_paid)||0)<=0 && !['completed','cancelled'].includes(order.status) ? 'rgba(231,76,60,0.03)' : '#111', border:`1px solid ${sel?.id===order.id?STATUS_COLOR[order.status]:'rgba(0,0,0,0.06)'}`,borderLeft:`4px solid ${STATUS_COLOR[order.status]||'#555'}`,borderRadius:6,padding:'1rem 1.25rem',marginBottom:8,cursor:'pointer'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:1}}>#{order.order_number}</div>
                      <div style={{fontSize:12,fontWeight:600,color:'#777',marginBottom:1}}>
                        {oc ? `${oc.contact_name} · ${oc.business_name}` : (order.notes||'').split('Business: ')[1]?.split(/[|\n]/)[0]?.trim() || 'Unknown client'}
                      </div>
                      <div style={{fontSize:10,color:'#999'}}>{fmt(order.submitted_at)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:18,fontWeight:800,color:'#111'}}>{money(order.total)}</div>
                      <span style={{fontSize:9,padding:'2px 8px',borderRadius:10,background:STATUS_COLOR[order.status]+'20',color:STATUS_COLOR[order.status],fontWeight:700}}>{STATUS_LABEL[order.status]}</span>
                      {isPaid
                        ? <div style={{fontSize:9,color:'#2a7d4f',marginTop:2,fontWeight:700}}>✓ Paid</div>
                        : hasPartial
                          ? <div style={{fontSize:9,color:'#c49a00',marginTop:2,fontWeight:700}}>⚡ {money(parseFloat(order.amount_paid))} paid · <span style={{color:'#e74c3c'}}>{money(order.total-parseFloat(order.amount_paid))} due</span></div>
                          : <div style={{fontSize:9,color:'#e74c3c',marginTop:2,fontWeight:700}}>⚠ Unpaid</div>
                      }
                    {order.payment_account && order.payment_account !== 'company' && (
                      <div style={{fontSize:9,marginTop:2,fontWeight:700,color:'#a78bfa'}}>
                        → {order.payment_account}
                      </div>
                    )}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                    {order.order_items?.slice(0,3).map((i,idx)=>(
                      <span key={idx} style={{fontSize:9,padding:'2px 7px',background:'rgba(0,0,0,0.04)',color:'#666',borderRadius:8}}>{i.product_name} ×{i.quantity}</span>
                    ))}
                    {order.order_items?.length>3 && <span style={{fontSize:9,color:'#888'}}>+{order.order_items.length-3} more</span>}
                    {order.payment_proof_url && <span style={{fontSize:9,padding:'2px 7px',background:'rgba(42,125,79,0.1)',color:'#2a7d4f',borderRadius:8}}>✓ Proof</span>}
                    {order.bol_url && <span style={{fontSize:9,padding:'2px 7px',background:'rgba(45,125,210,0.1)',color:'#2d7dd2',borderRadius:8}}>BOL</span>}
                  </div>
                </div>
              )
            }

            return (
              <>
                {/* ACTIVE ORDERS */}
                {active.length === 0 && filter==='all'
                  ? <div style={{padding:'2rem',textAlign:'center',color:'#999',fontSize:13,background:'#fff',border:'0.5px solid rgba(0,0,0,0.06)',borderRadius:6,marginBottom:12}}>No active orders 🎉</div>
                  : active.map(renderOrder)
                }

                {/* DIVIDER — completed/dispatched/cancelled */}
                {done.length > 0 && filter==='all' && (
                  <div style={{marginTop:8,marginBottom:4}}>
                    <button onClick={()=>setShowDone(p=>!p)}
                      style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'rgba(0,0,0,0.02)',border:'0.5px solid rgba(0,0,0,0.06)',borderRadius:6,cursor:'pointer',color:'#999',fontFamily:'inherit',fontSize:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontSize:14}}>{showDone?'▾':'▸'}</span>
                        <span style={{fontWeight:600,color:'#666'}}>Completed & archived</span>
                        <span style={{fontSize:10,padding:'2px 8px',background:'rgba(0,0,0,0.06)',borderRadius:10,color:'#999'}}>{done.length} orders</span>
                      </div>
                      <span style={{fontSize:11,color:'#2a7d4f',fontWeight:600}}>
                        ${done.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+(o.total||0),0).toLocaleString()} completed
                      </span>
                    </button>
                    {showDone && (
                      <div style={{marginTop:8}}>
                        {done.map(renderOrder)}
                      </div>
                    )}
                  </div>
                )}

                {/* When filtered to a specific done status */}
                {filter!=='all' && DONE.includes(filter) && visible.map(renderOrder)}
              </>
            )
          })()}
        </div>

        {/* RIGHT DETAIL */}
        {sel && (
          <div style={{position:'sticky',top:20}}>
            <div style={{background:'#fff',border:'0.5px solid rgba(0,0,0,0.06)',borderRadius:8,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.4)',maxHeight:'92vh',display:'flex',flexDirection:'column'}}>

              {/* HEADER */}
              <div style={{background:'linear-gradient(135deg,#0d0d0d,#1a1a2e)',padding:'1.25rem 1.5rem',flexShrink:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.875rem'}}>
                  <div>
                    <div style={{fontSize:10,color:sc,letterSpacing:'0.2em',textTransform:'uppercase',marginBottom:3,fontWeight:700}}>{STATUS_LABEL[sel.status]}</div>
                    <div style={{fontSize:22,fontWeight:900,color:'#111',marginBottom:2}}>#{sel.order_number}</div>
                    <div style={{fontSize:11,color:'#999'}}>{fmt(sel.submitted_at)}</div>
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <button onClick={()=>printInvoice(sel)} style={{padding:'8px 14px',background:'rgba(45,125,210,0.15)',color:'#2d7dd2',fontSize:11,fontWeight:700,border:'0.5px solid rgba(45,125,210,0.35)',cursor:'pointer',borderRadius:4}}>🖨 Invoice</button>
                    <button onClick={()=>setSel(null)} style={{background:'rgba(0,0,0,0.08)',border:'none',color:'#666',cursor:'pointer',width:28,height:28,borderRadius:'50%',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                  </div>
                </div>
                {/* Next action */}
                {NEXT_STATUS[sel.status] && (
                  <button onClick={()=>updateStatus(sel.id,NEXT_STATUS[sel.status])}
                    style={{width:'100%',padding:'9px',background:sc,color:'#111',fontSize:12,fontWeight:700,border:'none',cursor:'pointer',borderRadius:4,boxShadow:`0 4px 16px ${sc}40`,marginBottom:6}}>
                    {NEXT_LABEL[sel.status]} →
                  </button>
                )}
                {sel.status!=='cancelled'&&sel.status!=='completed' && (
                  <button onClick={()=>updateStatus(sel.id,'cancelled')} style={{width:'100%',padding:'7px',background:'rgba(231,76,60,0.08)',color:'#e74c3c',fontSize:11,fontWeight:600,border:'0.5px solid rgba(231,76,60,0.2)',cursor:'pointer',borderRadius:4}}>Cancel order</button>
                )}
              </div>

              {/* TABS */}
              <div style={{display:'flex',background:'#f8f9fa',borderBottom:'0.5px solid rgba(0,0,0,0.08)',flexShrink:0}}>
                {[['details','📋 Details'],['client','👤 Client'],['payment','💳 Payment'],['shipment','📦 Shipment']].map(([k,l])=>(
                  <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:'9px 4px',fontSize:10,fontWeight:600,color:tab===k?'#2d7dd2':'#555',background:'transparent',border:'none',borderBottom:`2px solid ${tab===k?'#2d7dd2':'transparent'}`,cursor:'pointer'}}>
                    {l}
                  </button>
                ))}
              </div>

              {/* SCROLLABLE CONTENT */}
              <div style={{overflowY:'auto',flex:1}}>

                {/* DETAILS TAB */}
                {tab==='details' && (
                  <div style={{padding:'1.25rem 1.5rem'}}>
                    {/* Items */}
                    <div style={{fontSize:9,color:'#666',letterSpacing:'0.15em',textTransform:'uppercase',fontWeight:700,marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span>Items · {sel.order_items?.length} products · {sel.order_items?.reduce((s,i)=>s+i.quantity,0)} units</span>
                      <button onClick={()=>{setShowUnits(!showUnits);setUnitItems(sel.order_items?.map(i=>({...i}))||[])}} style={{fontSize:10,color:'#c49a00',background:'rgba(196,154,0,0.1)',border:'0.5px solid rgba(196,154,0,0.25)',padding:'4px 10px',borderRadius:3,cursor:'pointer',fontWeight:600}}>✏️ Edit qty</button>
                    </div>
                    {showUnits ? (
                      <div style={{background:'rgba(196,154,0,0.04)',border:'0.5px solid rgba(196,154,0,0.15)',borderRadius:4,padding:'0.875rem',marginBottom:12}}>
                        {unitItems.map((item,i)=>(
                          <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<unitItems.length-1?'0.5px solid rgba(0,0,0,0.04)':'none'}}>
                            <span style={{fontSize:12,color:'#333',flex:1}}>{item.product_name}</span>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <input type="number" min="1" value={item.quantity}
                                onChange={e=>setUnitItems(prev=>prev.map((it,idx)=>idx===i?{...it,quantity:parseInt(e.target.value)||1}:it))}
                                style={{width:60,background:'#f0f1f3',border:'0.5px solid rgba(0,0,0,0.1)',color:'#888',fontSize:12,padding:'5px 8px',borderRadius:3,outline:'none',textAlign:'center'}}/>
                              <span style={{fontSize:11,color:'#999'}}>${(item.unit_price*(unitItems[i].quantity||1)).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                        <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',marginTop:4,borderTop:'0.5px solid rgba(0,0,0,0.08)'}}>
                          <span style={{fontSize:11,color:'#666'}}>New total</span>
                          <span style={{fontSize:14,fontWeight:700,color:'#111'}}>${unitItems.reduce((s,i)=>s+(i.unit_price*(parseInt(i.quantity)||1)),0).toLocaleString()}</span>
                        </div>
                        <div style={{display:'flex',gap:6,marginTop:8}}>
                          <button onClick={saveUnits} disabled={saving} style={{flex:1,padding:8,background:'#c49a00',color:'#111',fontSize:11,fontWeight:700,border:'none',cursor:'pointer',borderRadius:3}}>{saving?'Saving...':'✓ Save'}</button>
                          <button onClick={()=>setShowUnits(false)} style={{padding:'8px 12px',background:'transparent',color:'#999',fontSize:11,border:'0.5px solid rgba(0,0,0,0.08)',cursor:'pointer',borderRadius:3}}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {sel.order_items?.map((item,i)=>(
                          <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:i<sel.order_items.length-1?'0.5px solid rgba(0,0,0,0.05)':'none'}}>
                            <div>
                              <div style={{fontSize:13,fontWeight:600,color:'#333',marginBottom:1}}>{item.product_name}</div>
                              <div style={{fontSize:10,color:'#999'}}>{item.quantity} units × {money(item.unit_price)}</div>
                            </div>
                            <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{money(item.unit_price*item.quantity)}</div>
                          </div>
                        ))}
                        <div style={{marginTop:10,padding:'12px 14px',background:`${sc}15`,border:`0.5px solid ${sc}30`,borderRadius:4,display:'flex',justifyContent:'space-between'}}>
                          <span style={{fontSize:12,fontWeight:600,color:'#333'}}>Order total</span>
                          <span style={{fontSize:22,fontWeight:900,color:sc}}>{money(sel.total)}</span>
                        </div>
                      </>
                    )}

                    {/* ETA quick view */}
                    {sel.eta && (
                      <div style={{marginTop:12,padding:'10px 14px',background:'rgba(42,125,79,0.08)',border:'0.5px solid rgba(42,125,79,0.25)',borderRadius:4}}>
                        <div style={{fontSize:9,color:'#2a7d4f',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,marginBottom:2}}>ETA</div>
                        <div style={{fontSize:14,fontWeight:700,color:'#4ade80'}}>{new Date(sel.eta+'T00:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
                        {sel.eta_notes && <div style={{fontSize:11,color:'#666',marginTop:2}}>{sel.eta_notes}</div>}
                      </div>
                    )}
                  </div>
                )}

                {/* CLIENT TAB */}
                {tab==='client' && (
                  <div style={{padding:'1.25rem 1.5rem'}}>
                    {selClient ? (
                      <>
                        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:'1.25rem',padding:'12px',background:'rgba(45,125,210,0.06)',border:'0.5px solid rgba(45,125,210,0.15)',borderRadius:6}}>
                          <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(45,125,210,0.15)',border:'1.5px solid rgba(45,125,210,0.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#2d7dd2',flexShrink:0}}>
                            {selClient.business_name?.[0]||'?'}
                          </div>
                          <div>
                            <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{selClient.business_name}</div>
                            <div style={{fontSize:11,color:'#666'}}>{selClient.contact_name}</div>
                          </div>
                          <Link href="/admin/clients" style={{marginLeft:'auto',fontSize:10,color:'#2d7dd2',textDecoration:'none',background:'rgba(45,125,210,0.1)',padding:'5px 10px',borderRadius:3,border:'0.5px solid rgba(45,125,210,0.2)'}}>View profile →</Link>
                        </div>
                        {[
                          ['Business','🏢',selClient.business_name],
                          ['Contact','👤',selClient.contact_name],
                          ['Email','📧',selClient.email],
                          ['Phone','📞',selClient.phone],
                          ['Address','📍',selClient.address],
                          ['Business type','🏭',selClient.business_type],
                          ['Monthly volume','📊',selClient.monthly_volume],
                          ['EIN','🔢',selClient.ein_number||selClient.ein],
                          ['Resale tax #','📄',selClient.resale_tax_number],
                        ].filter(([,, v])=>v).map(([label,icon,val])=>(
                          <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderTop:'0.5px solid rgba(0,0,0,0.05)',alignItems:'flex-start',gap:8}}>
                            <span style={{fontSize:11,color:'#999',flexShrink:0}}>{icon} {label}</span>
                            <span style={{fontSize:11,color:'#333',textAlign:'right',wordBreak:'break-all'}}>{val}</span>
                          </div>
                        ))}
                        <a href={`tel:${selClient.phone}`} style={{display:'block',marginTop:10,padding:'9px',background:'rgba(45,125,210,0.1)',border:'0.5px solid rgba(45,125,210,0.25)',borderRadius:4,fontSize:12,fontWeight:600,color:'#2d7dd2',textAlign:'center',textDecoration:'none'}}>📞 Call client</a>
                        <a href={`mailto:${selClient.email}`} style={{display:'block',marginTop:6,padding:'9px',background:'rgba(0,0,0,0.04)',border:'0.5px solid rgba(0,0,0,0.08)',borderRadius:4,fontSize:12,fontWeight:600,color:'#777',textAlign:'center',textDecoration:'none'}}>📧 Email client</a>
                      </>
                    ) : (
                      <div>
                        <div style={{padding:'10px 14px',background:'rgba(231,76,60,0.06)',border:'0.5px solid rgba(231,76,60,0.2)',borderRadius:4,fontSize:12,color:'#e74c3c',marginBottom:'1rem'}}>
                          ⚠️ Client not found in approved list
                        </div>
                        {[
                          ['Business',(sel.notes||'').split('Business: ')[1]?.split(/[|\n]/)[0]?.trim()],
                          ['Email',(sel.notes||'').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim()],
                          ['Phone',(sel.notes||'').split('Phone: ')[1]?.split(/[|\n]/)[0]?.trim()],
                        ].filter(([,v])=>v).map(([l,v])=>(
                          <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderTop:'0.5px solid rgba(0,0,0,0.05)',fontSize:11}}>
                            <span style={{color:'#999'}}>{l}</span>
                            <span style={{color:'#333'}}>{v}</span>
                          </div>
                        ))}
                        {sel.payment_proof_url && (
                          <button onClick={()=>openDoc(sel.payment_proof_url)} style={{width:'100%',padding:'9px',background:'rgba(42,125,79,0.1)',color:'#2a7d4f',fontSize:12,fontWeight:600,border:'0.5px solid rgba(42,125,79,0.25)',borderRadius:4,cursor:'pointer',marginTop:10}}>
                            ✓ View payment proof
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* PAYMENT TAB */}
                {tab==='payment' && (
                  <div style={{padding:'1.25rem 1.5rem'}}>
                    {/* Summary */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:'1.25rem'}}>
                      {[
                        ['Order total',money(sel.total),'#ccc'],
                        ['Paid',money(paid),'#2a7d4f'],
                        ['Balance',money(balance),balance>0?'#e74c3c':'#2a7d4f'],
                      ].map(([l,v,c])=>(
                        <div key={l} style={{padding:'10px',background:'rgba(0,0,0,0.03)',border:'0.5px solid rgba(0,0,0,0.06)',borderRadius:4,textAlign:'center'}}>
                          <div style={{fontSize:8,color:'#999',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>{l}</div>
                          <div style={{fontSize:15,fontWeight:700,color:c}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    {/* Progress bar */}
                    <div style={{height:5,background:'rgba(0,0,0,0.06)',borderRadius:3,overflow:'hidden',marginBottom:'1rem'}}>
                      <div style={{height:'100%',width:`${Math.min(100,(paid/sel.total)*100)}%`,background:'#2a7d4f',borderRadius:3}}/>
                    </div>
                    {/* Payment log */}
                    {sel.payment_notes && (
                      <div style={{marginBottom:'1rem',padding:'10px 12px',background:'rgba(0,0,0,0.03)',border:'0.5px solid rgba(0,0,0,0.06)',borderRadius:4}}>
                        <div style={{fontSize:9,color:'#666',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6,fontWeight:700}}>Payment log</div>
                        {sel.payment_notes.split('\n').filter(Boolean).map((line,i)=>(
                          <div key={i} style={{fontSize:11,color:'#777',padding:'4px 0',borderTop:i>0?'0.5px solid rgba(0,0,0,0.04)':'none'}}>{line}</div>
                        ))}
                      </div>
                    )}
                    {/* Payment account selector */}
                    <div style={{marginBottom:'1rem',padding:'12px 14px',background:'rgba(167,139,250,0.06)',border:'0.5px solid rgba(167,139,250,0.2)',borderRadius:6}}>
                      <div style={{fontSize:9,color:'#a78bfa',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:700,marginBottom:8}}>Payment received in account</div>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                        {['Company','Victor','Leopoldo','World Family'].map(acc=>(
                          <button key={acc} onClick={async()=>{
                            const val = acc.toLowerCase().replace(' ','_')
                            await createClient().from('orders').update({payment_account:val}).eq('id',sel.id)
                            setSel(prev=>({...prev,payment_account:val}))
                            setOrders(prev=>prev.map(o=>o.id===sel.id?{...o,payment_account:val}:o))
                          }} style={{padding:'7px 4px',fontSize:10,fontWeight:700,border:`1px solid ${(sel.payment_account||'company')===acc.toLowerCase().replace(' ','_')?'#a78bfa':'rgba(0,0,0,0.08)'}`,background:(sel.payment_account||'company')===acc.toLowerCase().replace(' ','_')?'rgba(167,139,250,0.15)':'transparent',color:(sel.payment_account||'company')===acc.toLowerCase().replace(' ','_')?'#a78bfa':'#555',borderRadius:4,cursor:'pointer',fontFamily:'inherit',textAlign:'center'}}>
                            {acc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Add payment */}
                    <button onClick={()=>setShowPayment(!showPayment)} style={{width:'100%',padding:'9px',background:'rgba(45,125,210,0.1)',color:'#2d7dd2',fontSize:12,fontWeight:600,border:'0.5px solid rgba(45,125,210,0.25)',borderRadius:4,cursor:'pointer',marginBottom:showPayment?'0.75rem':0}}>
                      + Record payment
                    </button>
                    {showPayment && (
                      <div style={{background:'rgba(45,125,210,0.04)',border:'0.5px solid rgba(45,125,210,0.15)',borderRadius:4,padding:'0.875rem'}}>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                          <div>
                            <label style={{fontSize:9,color:'#777',textTransform:'uppercase',letterSpacing:'0.1em',display:'block',marginBottom:4}}>Amount ($)</label>
                            <input type="number" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))} placeholder="0.00" style={inp}/>
                          </div>
                          <div>
                            <label style={{fontSize:9,color:'#777',textTransform:'uppercase',letterSpacing:'0.1em',display:'block',marginBottom:4}}>Method / notes</label>
                            <input value={payForm.notes} onChange={e=>setPayForm(p=>({...p,notes:e.target.value}))} placeholder="Wire, ACH..." style={inp}/>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:6}}>
                          <button onClick={savePayment} disabled={saving} style={{flex:1,padding:8,background:'#2d7dd2',color:'#111',fontSize:11,fontWeight:700,border:'none',cursor:'pointer',borderRadius:3}}>{saving?'Saving...':'✓ Record'}</button>
                          <button onClick={()=>setShowPayment(false)} style={{padding:'8px 12px',background:'transparent',color:'#999',fontSize:11,border:'0.5px solid rgba(0,0,0,0.08)',cursor:'pointer',borderRadius:3}}>Cancel</button>
                        </div>
                      </div>
                    )}
                    {/* Payment proof */}
                    {sel.payment_proof_url && (
                      <button onClick={()=>openDoc(sel.payment_proof_url)} style={{width:'100%',padding:'9px',background:'rgba(42,125,79,0.1)',color:'#2a7d4f',fontSize:12,fontWeight:600,border:'0.5px solid rgba(42,125,79,0.25)',borderRadius:4,cursor:'pointer',marginTop:10}}>
                        ✓ View payment proof
                      </button>
                    )}
                  </div>
                )}

                {/* SHIPMENT TAB */}
                {tab==='shipment' && (
                  <div style={{padding:'1.25rem 1.5rem'}}>
                    {/* ETA */}
                    <div style={{marginBottom:'1.25rem'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                        <div style={{fontSize:9,color:'#666',letterSpacing:'0.15em',textTransform:'uppercase',fontWeight:700}}>ETA — Estimated arrival</div>
                        <button onClick={()=>{setShowETA(!showETA);setEtaForm({eta:sel.eta||'',eta_notes:sel.eta_notes||''})}} style={{fontSize:10,color:'#2d7dd2',background:'rgba(45,125,210,0.1)',border:'0.5px solid rgba(45,125,210,0.25)',padding:'4px 10px',borderRadius:3,cursor:'pointer',fontWeight:600}}>
                          {sel.eta?'✏️ Edit':'+ Set ETA'}
                        </button>
                      </div>
                      {sel.eta && !showETA && (
                        <div style={{padding:'12px',background:'rgba(42,125,79,0.08)',border:'0.5px solid rgba(42,125,79,0.25)',borderRadius:4}}>
                          <div style={{fontSize:16,fontWeight:700,color:'#4ade80'}}>{new Date(sel.eta+'T00:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
                          {sel.eta_notes && <div style={{fontSize:11,color:'#666',marginTop:2}}>{sel.eta_notes}</div>}
                        </div>
                      )}
                      {showETA && (
                        <div style={{background:'rgba(45,125,210,0.04)',border:'0.5px solid rgba(45,125,210,0.15)',borderRadius:4,padding:'0.875rem'}}>
                          <div style={{marginBottom:8}}>
                            <label style={{fontSize:9,color:'#777',textTransform:'uppercase',letterSpacing:'0.1em',display:'block',marginBottom:4}}>Arrival date</label>
                            <input type="date" value={etaForm.eta} onChange={e=>setEtaForm(f=>({...f,eta:e.target.value}))} style={{...inp,colorScheme:'light'}}/>
                          </div>
                          <div style={{marginBottom:8}}>
                            <label style={{fontSize:9,color:'#777',textTransform:'uppercase',letterSpacing:'0.1em',display:'block',marginBottom:4}}>Notes (optional)</label>
                            <input value={etaForm.eta_notes} onChange={e=>setEtaForm(f=>({...f,eta_notes:e.target.value}))} placeholder="e.g. Arriving by truck" style={inp}/>
                          </div>
                          <div style={{display:'flex',gap:6}}>
                            <button onClick={saveETA} disabled={saving} style={{flex:1,padding:8,background:'#2d7dd2',color:'#111',fontSize:11,fontWeight:700,border:'none',cursor:'pointer',borderRadius:3}}>{saving?'Saving...':'✓ Save ETA'}</button>
                            <button onClick={()=>setShowETA(false)} style={{padding:'8px 12px',background:'transparent',color:'#999',fontSize:11,border:'0.5px solid rgba(0,0,0,0.08)',cursor:'pointer',borderRadius:3}}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Shipment details */}
                    <div style={{fontSize:9,color:'#666',letterSpacing:'0.15em',textTransform:'uppercase',fontWeight:700,marginBottom:8}}>Shipment details</div>
                    {[
                      ['Weight',sel.shipment_weight],
                      ['Dimensions',sel.shipment_dimensions],
                      ['Pallets',sel.shipment_pallets ? sel.shipment_pallets+' pallet(s)':null],
                      ['Notes',sel.shipment_notes],
                    ].filter(([,v])=>v).map(([l,v])=>(
                      <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderTop:'0.5px solid rgba(0,0,0,0.05)',fontSize:11}}>
                        <span style={{color:'#999'}}>{l}</span>
                        <span style={{color:'#333'}}>{v}</span>
                      </div>
                    ))}
                    {/* BOL & Labels */}
                    {(sel.bol_url||sel.labels_url) && (
                      <div style={{display:'flex',gap:6,marginTop:10}}>
                        {sel.bol_url && <button onClick={()=>openDoc(sel.bol_url)} style={{flex:1,padding:'8px',background:'rgba(42,125,79,0.1)',color:'#2a7d4f',fontSize:11,fontWeight:600,border:'0.5px solid rgba(42,125,79,0.25)',borderRadius:3,cursor:'pointer'}}>📋 BOL</button>}
                        {sel.labels_url && <button onClick={()=>openDoc(sel.labels_url)} style={{flex:1,padding:'8px',background:'rgba(45,125,210,0.1)',color:'#2d7dd2',fontSize:11,fontWeight:600,border:'0.5px solid rgba(45,125,210,0.25)',borderRadius:3,cursor:'pointer'}}>🏷 Labels</button>}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
