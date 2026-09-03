'use client'
import { useState } from 'react'
import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'

const PAYMENT_METHODS = [
  { value:'credit_card', label:'Credit Card' },
  { value:'debit_card',  label:'Debit Card' },
  { value:'ach',         label:'ACH Transfer' },
  { value:'wire',        label:'Wire Transfer' },
]

const STATUS_COLOR = { new:'#2d7dd2', review:'#c49a00', confirmed:'#534ab7', dispatched:'#2a7d4f', completed:'#2a7d4f', cancelled:'#e74c3c' }
const STATUS_LABEL = { new:'New', review:'In review', confirmed:'Confirmed', dispatched:'Dispatched', completed:'Completed', cancelled:'Cancelled' }
const STATUS_BADGE = {
  new:        { bg: '#fee2e2', ink: '#991b1b', edge: '#dc2626' },
  review:     { bg: '#fde68a', ink: '#7c4a03', edge: '#f59e0b' },
  confirmed:  { bg: '#e8f0ff', ink: DEEP,      edge: ACCENT },
  dispatched: { bg: '#e8f0ff', ink: DEEP,      edge: ACCENT },
  completed:  { bg: '#dcfce7', ink: '#166534', edge: 'transparent' },
  cancelled:  { bg: '#f1f2f5', ink: '#6b7280', edge: 'transparent' },
}
const NEXT_STATUS  = { new:'review', review:'confirmed', confirmed:'dispatched', dispatched:'completed' }
const NEXT_LABEL   = { new:'Move to review →', review:'Confirm order →', confirmed:'Mark dispatched →', dispatched:'Mark completed →' }

const NAV_GROUPS_BASE = [
  { label: 'Day to day work', items: [
    { label: 'Dashboard', code: 'DB', href: '/admin/dashboard' },
    { label: 'Applications', code: 'AP', href: '/admin/applications' },
    { label: 'Orders', code: 'OR', href: '/admin/orders' },
    { label: 'Payments', code: 'PY', href: '/admin/payments' },
    { label: 'Messages', code: 'MS', href: '/admin/messages' },
  ]},
  { label: 'Catalog and clients', items: [
    { label: 'Products', code: 'PR', href: '/admin/products' },
    { label: 'Clients', code: 'CL', href: '/admin/clients' },
    { label: 'Invoices', code: 'IN', href: '/admin/invoices' },
    { label: 'Offers', code: 'OF', href: '/admin/offers' },
  ]},
  { label: 'Money and growth', items: [
    { label: 'Profit report', code: 'PF', href: '/admin/profit' },
    { label: 'Analytics', code: 'AN', href: '/admin/insights' },
    { label: 'Marketing', code: 'MK', href: '/admin/marketing' },
    { label: 'Walmart', code: 'WM', href: '/admin/walmart' },
    { label: 'Recruit', code: 'RC', href: '/admin/recruit' },
  ]},
]

const fmt  = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'
const fmtL = (d) => d ? new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}) : '—'
const money = (n) => '$'+(parseFloat(n)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})
const short = (n) => '$'+Math.round(n||0).toLocaleString('en-US')
const inp = { width:'100%', background:'#f7f8fa', border:'1px solid #d9dce2', color:'#16181d', fontSize:13, padding:'9px 11px', borderRadius:7, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }

function Sidebar({ open, setOpen, pathname, badges }) {
  const navGroups = NAV_GROUPS_BASE.map(g => ({
    label: g.label,
    items: g.items.map(n => {
      const active = n.href === pathname
      const meta = badges[n.label] || {}
      const badge = active ? '' : (meta.badge || '')
      const urgent = !active && meta.urgent
      return {
        label: n.label, code: n.code, href: n.href,
        bg: active ? '#16181d' : 'transparent',
        ink: active ? '#ffffff' : '#3d4652',
        weight: active ? 700 : 500,
        iconBg: active ? ACCENT : urgent ? '#fde68a' : '#eef0f4',
        iconInk: active ? '#ffffff' : urgent ? '#7c4a03' : '#6b7280',
        badge,
        badgeBg: badge ? (urgent ? '#fde68a' : '#eef0f4') : 'transparent',
        badgeInk: badge ? (urgent ? '#7c4a03' : '#6b7280') : 'transparent',
        collapsedDot: !open && urgent,
      }
    })
  }))
  return (
    <div data-scroll className="ado-sidebar" style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#ffffff', borderRight: '1px solid #e2e4e9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', gap: 12, padding: '16px 14px 17px', borderBottom: '1px solid #e2e4e9' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 8, background: '#16181d' }}><img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width: 20, height: 'auto' }} /></span>
          {open && (
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.015em', whiteSpace: 'nowrap' }}>Levam Corp</span>
              <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#6b7280', whiteSpace: 'nowrap' }}>Admin console</span>
            </span>
          )}
        </span>
        {open && <button type="button" onClick={() => setOpen(false)} aria-label="Collapse menu" title="Collapse menu" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', cursor: 'pointer', width: 32, height: 32, display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#47505e' }}>‹</button>}
      </div>
      {!open && (
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={() => setOpen(true)} aria-label="Expand menu" title="Expand menu" style={{ border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', cursor: 'pointer', width: 38, height: 34, display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#47505e' }}>›</button>
        </div>
      )}
      <div style={{ padding: '14px 10px 20px' }}>
        {navGroups.map(g => (
          <div key={g.label} style={{ paddingBottom: 18 }}>
            {open ? (
              <div style={{ padding: '0 8px 8px', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9aa0aa', whiteSpace: 'nowrap' }}>{g.label}</div>
            ) : (
              <div style={{ margin: '0 8px 10px', height: 1, background: '#e8eaee' }} />
            )}
            {g.items.map(n => (
              <Link key={n.label} href={n.href} title={n.badge ? `${n.label} · ${n.badge}` : n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', gap: 11, padding: open ? '9px 10px' : '9px 0', marginBottom: 3, borderRadius: 8, background: n.bg, color: n.ink, fontSize: 15, fontWeight: n.weight, letterSpacing: '-.01em', position: 'relative' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                  <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 6, background: n.iconBg, color: n.iconInk, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 11 }}>{n.code}</span>
                  {open && <span style={{ whiteSpace: 'nowrap' }}>{n.label}</span>}
                </span>
                {open && n.badge && <span style={{ flex: 'none', fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 700, padding: '3px 7px 4px', borderRadius: 5, background: n.badgeBg, color: n.badgeInk }}>{n.badge}</span>}
                {n.collapsedDot && <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: '#dc2626', border: '2px solid #ffffff' }} />}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminOrders() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersInner />
    </Suspense>
  )
}

function AdminOrdersInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [orders,   setOrders]   = useState([])
  const [clients,  setClients]  = useState([])
  const [products, setProducts] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sel,     setSel]     = useState(null)
  const [search,  setSearch]  = useState('')
  const [stage,   setStage]   = useState('Needs action')
  const [sort,    setSort]    = useState('Newest')
  const [tab,     setTab]     = useState('Items')
  // sub-forms
  const [showETA,      setShowETA]      = useState(false)
  const [showPayment,  setShowPayment]  = useState(false)
  const [showUnits,    setShowUnits]    = useState(false)
  const [showAddItem,  setShowAddItem]  = useState(false)
  const [etaForm,      setEtaForm]      = useState({eta:'',eta_notes:''})
  const [payForm,      setPayForm]      = useState({amount:'',notes:''})
  const [unitItems,    setUnitItems]    = useState([])
  const [addItemForm,  setAddItemForm]  = useState({productId:'',search:'',quantity:'1',unitPrice:''})
  const [saving,       setSaving]       = useState(false)
  // new order (admin entering a WhatsApp/off-portal deal for an existing client)
  const [showNewOrder,   setShowNewOrder]   = useState(false)
  const [creatingOrder,  setCreatingOrder]  = useState(false)
  const [noClientId,     setNoClientId]     = useState(null)
  const [noClientSearch, setNoClientSearch] = useState('')
  const [noItems,        setNoItems]        = useState([])
  const [noItemForm,     setNoItemForm]     = useState({ productId:'', search:'', quantity:'1', unitPrice:'' })
  const [noPaymentMethod,setNoPaymentMethod]= useState('')
  const [noDeliveryFee,  setNoDeliveryFee]  = useState('')
  const [noNotify,       setNoNotify]       = useState(true)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href='/admin'; return }
      await reload(sb)
    })
  }, [])

  useEffect(() => {
    const clientId = searchParams.get('client')
    if (!clientId || !clients.length) return
    const c = clients.find(c => String(c.id) === clientId)
    if (!c) return
    resetNewOrder()
    setNoClientId(c.id)
    setShowNewOrder(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients])

  const reload = async (sb) => {
    sb = sb || createClient()
    const [{ data: o }, { data: c }, { data: p }, { data: pay }] = await Promise.all([
      sb.from('orders').select('*, order_items(*)').order('submitted_at',{ascending:false}),
      sb.from('clients').select('*'),
      sb.from('products').select('id,name,sku,price').order('name'),
      sb.from('payments').select('*').order('created_at',{ascending:false}),
    ])
    setOrders(o||[])
    setClients(c||[])
    setProducts(p||[])
    setPayments(pay||[])
    setLoading(false)
  }

  const addOrderItem = async () => {
    const product = products.find(p => p.id === addItemForm.productId)
    if (!product) { alert('Pick a product first'); return }
    const quantity  = parseInt(addItemForm.quantity) || 1
    const unitPrice = parseFloat(addItemForm.unitPrice)
    if (!(unitPrice >= 0)) { alert('Enter a unit price'); return }
    setSaving(true)
    const sb = createClient()
    const { data: newItem, error } = await sb.from('order_items').insert([{
      order_id: sel.id,
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku || '—',
      quantity,
      unit_price: unitPrice,
    }]).select().single()
    if (error || !newItem) {
      console.error('add order item failed', error)
      alert(`Couldn't add the item: ${error?.message || 'unknown error'}${error?.details ? '\n' + error.details : ''}`)
      setSaving(false)
      return
    }
    const updatedItems = [...(sel.order_items || []), newItem]
    const newTotal = updatedItems.reduce((s,i)=>s+(i.unit_price*i.quantity),0)
    await sb.from('orders').update({total:newTotal}).eq('id',sel.id)
    setOrders(prev => prev.map(o => o.id===sel.id ? {...o, total:newTotal, order_items:updatedItems} : o))
    setSel(prev => ({...prev, total:newTotal, order_items:updatedItems}))
    setAddItemForm({productId:'',search:'',quantity:'1',unitPrice:''})
    setSaving(false)
  }

  const removeOrderItem = async (itemId) => {
    if (!confirm('Remove this item from the order?')) return
    setSaving(true)
    const sb = createClient()
    const { error } = await sb.from('order_items').delete().eq('id', itemId)
    if (error) {
      console.error('remove order item failed', error)
      alert(`Couldn't remove the item: ${error.message}`)
      setSaving(false)
      return
    }
    const updatedItems = (sel.order_items || []).filter(i => i.id !== itemId)
    const newTotal = updatedItems.reduce((s,i)=>s+(i.unit_price*i.quantity),0)
    await sb.from('orders').update({total:newTotal}).eq('id',sel.id)
    setOrders(prev => prev.map(o => o.id===sel.id ? {...o, total:newTotal, order_items:updatedItems} : o))
    setSel(prev => ({...prev, total:newTotal, order_items:updatedItems}))
    setSaving(false)
  }

  const resetNewOrder = () => {
    setNoClientId(null); setNoClientSearch(''); setNoItems([])
    setNoItemForm({ productId:'', search:'', quantity:'1', unitPrice:'' })
    setNoPaymentMethod(''); setNoDeliveryFee('')
    setNoNotify(true)
  }

  const addNewOrderItem = () => {
    const product = products.find(p => p.id === noItemForm.productId)
    if (!product) { alert('Pick a product first'); return }
    const quantity  = parseInt(noItemForm.quantity) || 1
    const unitPrice = parseFloat(noItemForm.unitPrice)
    if (!(unitPrice >= 0)) { alert('Enter a unit price'); return }
    setNoItems(prev => [...prev, { product_id: product.id, product_name: product.name, product_sku: product.sku || '—', quantity, unit_price: unitPrice }])
    setNoItemForm({ productId:'', search:'', quantity:'1', unitPrice:'' })
  }

  const removeNewOrderItem = (idx) => setNoItems(prev => prev.filter((_, i) => i !== idx))

  const createOrder = async () => {
    const client = clients.find(c => c.id === noClientId)
    if (!client) { alert('Select a client first'); return }
    if (!noItems.length) { alert('Add at least one item'); return }
    setCreatingOrder(true)
    const sb = createClient()
    const subtotal = noItems.reduce((s,i) => s + i.unit_price * i.quantity, 0)
    const deliveryFee = parseFloat(noDeliveryFee) || 0
    const total = subtotal + deliveryFee
    const notesParts = [
      `Email: ${client.email}`,
      `Items: ${noItems.map(i => `${i.product_name} x${i.quantity}`).join(', ')}`,
    ]
    if (deliveryFee > 0) notesParts.push(`Delivery fee: ${money(deliveryFee)}`)
    if (noPaymentMethod) notesParts.push(`Payment: ${PAYMENT_METHODS.find(m=>m.value===noPaymentMethod)?.label}`)
    notesParts.push('Entered by admin — WhatsApp order')
    const { data: order, error } = await sb.from('orders').insert([{
      status: 'new',
      subtotal,
      total,
      notes: notesParts.join(' | '),
    }]).select().single()
    if (error || !order) {
      console.error('admin order creation failed', error)
      alert(`Couldn't create the order: ${error?.message || 'unknown error'}`)
      setCreatingOrder(false)
      return
    }
    const { error: itemsError } = await sb.from('order_items').insert(
      noItems.map(i => ({ order_id: order.id, product_id: i.product_id, product_name: i.product_name, product_sku: i.product_sku, quantity: i.quantity, unit_price: i.unit_price }))
    )
    if (itemsError) {
      console.error('admin order_items insert failed', itemsError)
      alert(`Order #${order.order_number} was created, but the items failed to save: ${itemsError.message}`)
      await reload(sb)
      setShowNewOrder(false)
      setCreatingOrder(false)
      return
    }
    if (noPaymentMethod) {
      await sb.from('payments').insert([{
        order_id: order.id,
        amount: total,
        status: 'requested',
        payment_method: noPaymentMethod,
        client_email: client.email,
        notes: `Payment request for order #${order.order_number} | Entered by admin — WhatsApp order`,
      }]).then(({ error: payError }) => { if (payError) console.error('admin payment row failed', payError) })
    }
    if (noNotify) {
      const invoiceNum = `LC-${Math.floor(20000 + Math.random() * 9999)}`
      await fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          items: noItems.map(i => ({ product_name: i.product_name, product_sku: i.product_sku, quantity: i.quantity, unit_price: i.unit_price })),
          clientEmail: client.email, invoiceNum, total,
        })
      }).catch(() => {})
    }
    await reload(sb)
    setSel({ ...order, order_items: noItems })
    setTab('Items')
    setShowNewOrder(false)
    resetNewOrder()
    setCreatingOrder(false)
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
    if (!unitItems.length) return
    setSaving(true)
    const sb = createClient()
    const cleaned = unitItems.map(i => ({
      id: i.id,
      product_id: i.product_id,
      product_name: i.product_name,
      product_sku: i.product_sku || '—',
      quantity: parseInt(i.quantity) || 1,
      unit_price: parseFloat(i.unit_price) || 0,
    }))
    for (const item of cleaned) {
      const { error } = await sb.from('order_items').update({
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }).eq('id', item.id)
      if (error) {
        console.error('update order item failed', error)
        alert(`Couldn't save "${item.product_name}": ${error.message}`)
        setSaving(false)
        return
      }
    }
    const newTotal = cleaned.reduce((s,i)=>s+(i.unit_price*i.quantity),0)
    await sb.from('orders').update({total:newTotal}).eq('id',sel.id)
    setOrders(prev => prev.map(o => o.id===sel.id ? {...o, total:newTotal, order_items:cleaned} : o))
    setSel(prev => ({...prev, total:newTotal, order_items:cleaned}))
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
    const paid  = (parseFloat(order.amount_paid)||0) >= order.total
    const cancelled = order.status === 'cancelled'
    const billName = c?.business_name || (order.notes||'').split('Business: ')[1]?.split(/[|\n]/)[0]?.trim() || 'Client'
    const billLine1 = c?.contact_name || ''
    const billLine2 = c?.address || ''
    const billEmail = c?.email || (order.notes||'').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim() || ''
    const billTax = [c?.resale_tax_number ? `Resale cert ${c.resale_tax_number}` : null, c?.ein_number ? `EIN ${c.ein_number}` : null].filter(Boolean).join(' · ')
    const stampBg = cancelled ? '#f1f2f5' : paid ? '#dcfce7' : '#fde68a'
    const stampInk = cancelled ? '#6b7280' : paid ? '#166534' : '#92400e'
    const stampText = cancelled ? 'Cancelled · void' : paid ? 'Paid in full' : 'Payment due'
    const html = `<!DOCTYPE html><html><head><title>Invoice ${order.order_number}</title><style>
      body{font-family:-apple-system,Arial,sans-serif;color:#08090b;padding:40px;font-size:13px;max-width:820px;margin:0 auto}
      table{width:100%;border-collapse:collapse}
      th{text-align:left;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6f6d67;padding:6px 8px;border-bottom:1px solid #08090b}
      td{padding:8px;border-bottom:1px solid rgba(8,9,11,.08);font-size:12px}
      @media print{body{padding:0}}
    </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #08090b;padding-bottom:16px">
        <div style="display:flex;align-items:center;gap:12px">
          <img src="https://www.levamcorp.com/levamcorp-logo_1.png" style="height:44px" alt="Levam Corp" />
          <div><div style="font-weight:700;font-size:16px">Levam Corp Distributors</div><div style="font-size:11px;color:#6f6d67;margin-top:4px">6315 NW 99th Ave, Doral, FL 33178<br>partners@levamcorp.com · (786) 878-4122</div></div>
        </div>
        <div style="text-align:right">
          <div style="font-size:16px;font-weight:700">Invoice #${order.order_number}</div>
          <div style="display:inline-block;margin-top:8px;padding:5px 12px;border-radius:20px;background:${stampBg};color:${stampInk};font-weight:700;font-size:11px">${stampText}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-top:16px;font-size:11px;color:#6f6d67">
        <div><div>Invoice date</div><strong style="color:#08090b">${fmtL(order.submitted_at)}</strong></div>
        <div><div>Order status</div><strong style="color:#08090b">${STATUS_LABEL[order.status]}</strong></div>
        <div><div>Payment due</div><strong style="color:#08090b">${cancelled?'Cancelled – no charge':paid?'Paid in full':'On receipt'}</strong></div>
        <div><div>ETA</div><strong style="color:#08090b">${eta||'—'}</strong></div>
      </div>
      <div style="margin-top:20px"><div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6f6d67;margin-bottom:6px">Bill to</div>
        <div style="font-weight:700">${billName}</div>
        ${billLine1?`<div style="font-size:12px;color:#47505e">${billLine1}</div>`:''}
        ${billLine2?`<div style="font-size:12px;color:#47505e">${billLine2}</div>`:''}
        ${billEmail?`<div style="font-size:12px;color:#47505e">${billEmail}</div>`:''}
        ${billTax?`<div style="font-size:11px;color:#6f6d67;margin-top:4px">${billTax}</div>`:''}
      </div>
      <table style="margin-top:20px"><thead><tr><th>#</th><th>Description</th><th>SKU</th><th style="text-align:right">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${items.map((it,i)=>`<tr><td>${i+1}</td><td>${it.product_name}</td><td>${it.product_sku||'—'}</td><td style="text-align:right">${it.quantity}</td><td style="text-align:right">${money(it.unit_price)}</td><td style="text-align:right">${money(it.unit_price*it.quantity)}</td></tr>`).join('')}</tbody></table>
      <div style="display:flex;justify-content:flex-end;margin-top:16px">
        <div style="width:280px">
          <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px"><span>Subtotal</span><span>${money(order.subtotal ?? items.reduce((s,i)=>s+i.unit_price*i.quantity,0))}</span></div>
          <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#6f6d67"><span>Sales tax · resale exempt</span><span>$0.00</span></div>
          <div style="display:flex;justify-content:space-between;padding-top:8px;margin-top:6px;border-top:1px solid #08090b;font-weight:700;font-size:15px"><span>${cancelled?'Charged':'Total'}</span><span>${cancelled?'$0.00':money(order.total)}</span></div>
        </div>
      </div>
      ${!paid && !cancelled ? `<div style="margin-top:19px;border-left:2px solid #f59e0b;padding:1px 0 2px 12px">
        <div style="font-family:monospace;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#92400e">Payment needed to confirm this order</div>
        <div style="padding-top:4px;font-size:11.5px;line-height:1.5;color:#3f3d39">This document is a preliminary invoice. Pricing and availability are held pending payment — the order is confirmed and processed only once we receive and verify full payment. Transfer details are below.</div>
      </div>` : paid ? `<div style="margin-top:19px;border-left:2px solid #16a34a;padding:1px 0 2px 12px">
        <div style="font-family:monospace;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#166534">Payment received</div>
        <div style="padding-top:4px;font-size:11.5px;line-height:1.5;color:#3f3d39">Payment has been received and verified. This order is confirmed and scheduled for dispatch from our Doral, FL warehouse.</div>
      </div>` : `<div style="margin-top:19px;border-left:2px solid #9a968e;padding:1px 0 2px 12px">
        <div style="font-family:monospace;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6f6d67">Invoice void</div>
        <div style="padding-top:4px;font-size:11.5px;line-height:1.5;color:#3f3d39">This invoice was cancelled before dispatch and carries no charge. It is retained for records only.</div>
      </div>`}

      ${!paid && !cancelled ? `<div style="margin-top:19px;border:1px solid rgba(8,9,11,.85)">
        <div style="background:#08090b;padding:6px 12px;font-family:monospace;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#8f8c85">Payment instructions</div>
        <div style="background:#f2efe6;padding:10px 12px;display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <div style="font-size:10.5px;color:#5c5a55"><span style="color:#8a8780">Bank: </span><strong style="color:#3f3d39">Bank of America</strong></div>
          <div style="font-size:10.5px;color:#5c5a55"><span style="color:#8a8780">Account name: </span><strong style="color:#3f3d39">Levam Corp</strong></div>
          <div style="font-size:10.5px;color:#5c5a55"><span style="color:#8a8780">Account #: </span><strong style="color:#3f3d39">898169098220</strong></div>
          <div style="font-size:10.5px;color:#5c5a55"><span style="color:#8a8780">ACH routing: </span><strong style="color:#3f3d39">063100277</strong></div>
          <div style="font-size:10.5px;color:#5c5a55"><span style="color:#8a8780">Wire routing: </span><strong style="color:#3f3d39">026009593</strong></div>
        </div>
      </div>` : ''}

      <div style="margin-top:21px;padding-top:9px;border-top:1px solid rgba(8,9,11,.14)">
        <div style="font-family:monospace;font-size:8.5px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6f6d67;padding-bottom:7px">Terms &amp; conditions</div>
        <div style="font-size:9.5px;line-height:1.55;color:#6f6d67">All sales are final — no returns, exchanges, refunds or cancellations once payment is confirmed. Damaged or defective goods must be reported to partners@levamcorp.com within 48 hours of delivery with photographic evidence. Title passes to buyer on dispatch from Doral, FL. Buyer certifies goods are purchased for resale under a valid resale certificate. Late payments accrue 1.5% monthly interest. Governed by Florida law; venue Miami-Dade County.</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:37px;margin-top:15px">
        <div>
          <div style="height:25px;border-bottom:1px solid #08090b"></div>
          <div style="padding-top:5px;font-family:monospace;font-size:8.5px;letter-spacing:0.16em;text-transform:uppercase;color:#6f6d67">Authorized · Levam Corp Distributors</div>
        </div>
        <div>
          <div style="height:25px;border-bottom:1px solid #08090b"></div>
          <div style="padding-top:5px;font-family:monospace;font-size:8.5px;letter-spacing:0.16em;text-transform:uppercase;color:#6f6d67">Accepted · ${billName}</div>
        </div>
      </div>

      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:21px;margin-top:21px;padding-top:8px;border-top:1px solid rgba(8,9,11,.14);font-family:monospace;font-size:8.5px;letter-spacing:0.16em;text-transform:uppercase;color:#6f6d67">
        <span>Levam Corp Distributors · ${order.order_number} · ${fmtL(order.submitted_at)}</span>
        <span>levamcorp.com</span>
      </div>
    </div>
    </body></html>`

    const w = window.open('','_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(()=>w.print(),600)
  }

  const exportCSV = (list) => {
    const header = ['Order number','Date','Client','Contact','Items','Units','Amount','Payment','Stage']
    const rows = list.map(o => {
      const c = clientFor(o)
      return [
        o.order_number, fmt(o.submitted_at),
        c?.business_name || '—', c?.contact_name || '—',
        (o.order_items||[]).map(i=>`${i.product_name} x${i.quantity}`).join('; ') || 'No products added',
        (o.order_items||[]).reduce((s,i)=>s+i.quantity,0),
        (o.total||0).toFixed(2), payStatusFor(o), STATUS_LABEL[o.status],
      ]
    })
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Real 3-way payment signal, combining the admin's own manual amount_paid ledger with the
  // client-facing payments-table proof flow — the two coexist in this schema, neither alone tells the full story.
  const paymentByOrderId = {}
  payments.forEach(p => { if (p.order_id && !paymentByOrderId[p.order_id]) paymentByOrderId[p.order_id] = p })
  const payStatusFor = (order) => {
    const paid = parseFloat(order.amount_paid) || 0
    if (paid >= order.total && order.total > 0) return 'Paid'
    if (paymentByOrderId[order.id]?.status === 'processing') return 'Proof sent'
    return paid > 0 ? 'Partial' : 'Unpaid'
  }
  const PAY_BADGE = { Paid: { bg:'#dcfce7', ink:'#166534' }, 'Proof sent': { bg:'#e8f0ff', ink:DEEP }, Partial: { bg:'#fde68a', ink:'#7c4a03' }, Unpaid: { bg:'#fee2e2', ink:'#991b1b' } }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading orders…</div>
      </div>
    </div>
  )

  // ── Derived view data ────────────────────────────────────────────────────
  const needsAction = orders.filter(o => ['new','review','confirmed','dispatched'].includes(o.status))
  const delivered = orders.filter(o => o.status === 'completed')
  const cancelled = orders.filter(o => o.status === 'cancelled')
  const revenueOrders = orders.filter(o => ['confirmed','dispatched','completed'].includes(o.status))
  const revenue = revenueOrders.reduce((s,o)=>s+(o.total||0),0)

  const stageDefs = [
    { key: 'Needs action', label: 'Needs you now', n: needsAction.length, sub: needsAction.length ? `Ready to move · ${short(needsAction.reduce((a,o)=>a+(o.total||0),0))}` : 'Nothing waiting', dot: '#f59e0b', strong: true },
    { key: 'All', label: 'All orders', n: orders.length, sub: 'Everything ever placed', dot: '#c9ced6' },
    { key: 'Delivered', label: 'Completed', n: delivered.length, sub: `${short(delivered.reduce((a,o)=>a+(o.total||0),0))} delivered`, dot: '#16a34a' },
    { key: 'Cancelled', label: 'Cancelled', n: cancelled.length, sub: 'Not counted in revenue', dot: '#c9ced6' },
    { key: 'Revenue', label: 'Revenue to date', n: short(revenue), sub: 'Confirmed, dispatched or completed', dot: ACCENT, isMoney: true },
  ]

  let list = orders.slice()
  if (stage === 'Needs action') list = needsAction.slice()
  else if (stage === 'Delivered') list = delivered.slice()
  else if (stage === 'Cancelled') list = cancelled.slice()

  const q = search.trim().toLowerCase()
  if (q) list = list.filter(o => (o.order_number + ' ' + (clientFor(o)?.business_name||'') + ' ' + (clientFor(o)?.contact_name||'') + ' ' + (o.notes||'')).toLowerCase().includes(q))

  if (sort === 'Biggest') list = [...list].sort((a,b) => (b.total||0) - (a.total||0))
  else if (sort === 'Client') list = [...list].sort((a,b) => (clientFor(a)?.business_name||'').localeCompare(clientFor(b)?.business_name||''))

  const titleMap = { 'Needs action': 'Orders that need you', All: 'All orders', Delivered: 'Completed orders', Cancelled: 'Cancelled orders' }
  const cols = '168px minmax(140px, 1.1fr) minmax(160px, 1.6fr) 62px 104px 104px 130px 92px'

  const sc = sel ? (STATUS_COLOR[sel.status]||'#888') : '#888'
  const paid = parseFloat(sel?.amount_paid)||0
  const balance = Math.max(0,(sel?.total||0)-paid)
  const selClient = sel ? clientFor(sel) : null
  const selPayment = sel ? paymentByOrderId[sel.id] : null
  const deliveryFeeFrom = (order) => { const m = (order?.notes||'').match(/Delivery fee:\s*\$([\d,.]+)/); return m ? parseFloat(m[1].replace(/,/g,'')) : 0 }
  const clientOrders = selClient ? orders.filter(o => clientFor(o)?.id === selClient.id) : []
  const clientLifetime = clientOrders.filter(o => o.status !== 'cancelled').reduce((s,o)=>s+(o.total||0),0)

  const shellCols = sidebarOpen ? 'clamp(226px, 18vw, 262px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'
  const badges = {
    Orders: { badge: String(needsAction.length), urgent: needsAction.length > 0 },
    Clients: { badge: String(clients.length) },
  }

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ado-shell { display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .ado-shell { grid-template-columns:1fr !important; } .ado-sidebar { position:relative !important; max-height:none !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="ado-shell">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={badges} />

        {/* MAIN */}
        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Orders</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{needsAction.length} order{needsAction.length !== 1 ? 's' : ''} waiting on you · {short(revenue)} collected to date</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => { resetNewOrder(); setShowNewOrder(true) }} style={{ padding: '9px 15px 10px', borderRadius: 8, background: ACCENT, color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>+ New order</button>
              <button onClick={() => exportCSV(list)} style={{ padding: '9px 14px 10px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: 'transparent', cursor: 'pointer' }}>↓ Export CSV</button>
              <button onClick={logout} style={{ padding: '9px 14px 10px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: 'transparent', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,24px) clamp(14px,2.4vw,28px) clamp(44px,6vh,70px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,20px)' }}>

            {/* STAGE CARDS */}
            <div>
              <div style={{ paddingBottom: 11 }}>
                <span style={{ display: 'block', fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>Where all {orders.length} orders stand</span>
                <span style={{ display: 'block', paddingTop: 4, fontSize: 14, color: '#6b7280' }}>Click a box to see only those orders</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(178px, 1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
                {stageDefs.map(s => {
                  const on = s.key === stage
                  const clickable = s.key !== 'Revenue'
                  return (
                    <button key={s.key} type="button" onClick={() => clickable && setStage(s.key)} style={{ textAlign: 'left', cursor: clickable ? 'pointer' : 'default', border: `1px solid ${on ? '#16181d' : s.strong ? '#f3d9a4' : '#e2e4e9'}`, borderRadius: 12, background: on ? '#16181d' : s.strong ? '#fffbf2' : '#ffffff', padding: '14px 15px 15px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', color: on ? '#ffffff' : '#16181d' }}>{s.label}</span>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: s.dot }} />
                      </span>
                      <span className="lc-mono" style={{ display: 'block', paddingTop: 9, fontWeight: 700, fontSize: 30, letterSpacing: '-.04em', color: on ? '#ffffff' : s.strong ? '#b45309' : '#16181d' }}>{s.n}</span>
                      <span style={{ display: 'block', paddingTop: 6, fontSize: 13.5, color: '#6b7280' }}>{s.sub}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* LIST */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>{titleMap[stage] || 'All orders'}</span>
                  <span style={{ fontSize: 14, color: '#6b7280' }}>Showing {list.length}{q ? ` matching "${search}"` : ''}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order number or client" style={{ width: 'clamp(200px,26vw,320px)', padding: '9px 12px 10px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, color: '#16181d', background: '#ffffff' }} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflow: 'hidden', background: '#f7f8fa' }}>
                    {['Newest','Biggest','Client'].map(label => {
                      const on = sort === label
                      return <button key={label} type="button" onClick={() => setSort(label)} style={{ border: 0, cursor: 'pointer', padding: '9px 13px 10px', background: on ? '#ffffff' : 'transparent', color: on ? '#16181d' : '#6b7280', fontSize: 13.5, fontWeight: on ? 700 : 500 }}>{label}</button>
                    })}
                  </span>
                </span>
              </div>

              <div data-scroll style={{ overflowX: 'auto', minWidth: 0 }}>
                <div style={{ minWidth: 1010 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'center', padding: '11px 16px 12px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                    <span>Order</span><span>Client</span><span>What they ordered</span><span style={{ textAlign: 'right' }}>Units</span><span style={{ textAlign: 'right' }}>Amount</span><span>Payment</span><span>Stage</span><span style={{ textAlign: 'center' }}>Open</span>
                  </div>
                  {list.length === 0 ? (
                    <div style={{ padding: '2.5rem 16px', textAlign: 'center', fontSize: 13, color: '#8b909a' }}>No orders here</div>
                  ) : list.map(o => {
                    const dim = o.status === 'cancelled'
                    const c = clientFor(o)
                    const st = STATUS_BADGE[o.status] || STATUS_BADGE.new
                    const payLabel = payStatusFor(o)
                    const py = PAY_BADGE[payLabel]
                    const units = (o.order_items||[]).reduce((s,i)=>s+i.quantity,0)
                    return (
                      <div key={o.id} role="button" tabIndex={0} onClick={() => { setSel(o); setTab('Items'); setShowETA(false); setShowPayment(false); setShowUnits(false); setShowAddItem(false) }} onKeyDown={e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); setSel(o) } }}
                        style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'center', padding: '14px 16px 15px', borderBottom: '1px solid #f1f2f5', cursor: 'pointer', background: dim ? '#fcfcfd' : '#ffffff', borderLeft: `4px solid ${st.edge}` }}>
                        <span>
                          <span className="lc-mono" style={{ display: 'block', fontSize: 13, fontWeight: 700, letterSpacing: '-.02em', color: dim ? '#8b909a' : '#16181d' }}>{o.order_number}</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 12.5, color: '#8b909a' }}>{fmt(o.submitted_at)}</span>
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 15, fontWeight: 600, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: dim ? '#8b909a' : '#16181d' }}>{c?.business_name || 'Unknown client'}</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 12.5, color: '#8b909a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c?.contact_name || '—'}</span>
                        </span>
                        <span style={{ minWidth: 0, fontSize: 14, color: dim ? '#a2a7b0' : '#47505e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.order_items?.length ? o.order_items[0].product_name + (o.order_items.length > 1 ? ` +${o.order_items.length - 1} more` : '') : 'No products added'}</span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: dim ? '#a2a7b0' : '#47505e' }}>{units || '—'}</span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: dim ? '#a2a7b0' : '#16181d' }}>{o.total ? money(o.total) : '—'}</span>
                        <span><span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: py.bg, color: py.ink }}>{payLabel}</span></span>
                        <span><span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: st.bg, color: st.ink }}>{STATUS_LABEL[o.status]}</span></span>
                        <span style={{ textAlign: 'center' }}><span style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, padding: '7px 11px 8px', borderRadius: 7, background: '#eef0f4', color: '#47505e' }}>Open →</span></span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 16px 14px', background: '#fafbfc', borderTop: '1px solid #eceef2', fontSize: 13.5, color: '#6b7280' }}>
                <span>Showing {list.length} of {orders.length} orders · sorted by {sort.toLowerCase()}</span>
                <span>Cancelled orders are greyed out — they are not counted in revenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {sel && (() => {
        const nx = NEXT_STATUS[sel.status] ? { label: NEXT_LABEL[sel.status], onClick: () => updateStatus(sel.id, NEXT_STATUS[sel.status]), bg: ACCENT, ink: '#ffffff' }
          : sel.status === 'cancelled' ? { label: 'Restore to new →', onClick: () => updateStatus(sel.id, 'new'), bg: '#eef0f4', ink: '#16181d' }
          : null
        const deliveryFee = deliveryFeeFrom(sel)
        const subtotal = sel.subtotal ?? (sel.order_items||[]).reduce((s,i)=>s+i.unit_price*i.quantity,0) - deliveryFee
        const totals = [
          { k: 'Products subtotal', v: money(subtotal), ink: '#16181d' },
          { k: 'Sales tax · resale exempt', v: '$0.00', ink: '#6b7280' },
          ...(deliveryFee > 0 ? [{ k: 'Delivery / freight fee', v: money(deliveryFee), ink: '#16181d' }] : []),
          ...(sel.status === 'cancelled' ? [{ k: 'Cancelled · voided', v: '− ' + money(sel.total), ink: '#991b1b' }] : []),
        ]
        const st = STATUS_BADGE[sel.status] || STATUS_BADGE.new
        const payLabel = payStatusFor(sel)
        const py = PAY_BADGE[payLabel]
        return (
          <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(22,24,29,.42)', display: 'flex', justifyContent: 'flex-end' }} onClick={() => setSel(null)}>
            <div data-scroll style={{ width: '100%', maxWidth: 560, height: '100%', overflowY: 'auto', background: '#ffffff', borderLeft: '1px solid #d9dce2' }} onClick={e => e.stopPropagation()}>

              <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#ffffff', borderBottom: '1px solid #e2e4e9', padding: '16px 20px 17px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                  <span>
                    <span className="lc-mono" style={{ display: 'block', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{sel.order_number}</span>
                    <span style={{ display: 'block', paddingTop: 6, fontSize: 15, color: '#47505e' }}>{selClient?.business_name || 'Unknown client'} · {fmt(sel.submitted_at)}</span>
                  </span>
                  <button type="button" onClick={() => setSel(null)} aria-label="Close" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '8px 12px 9px', fontSize: 14, fontWeight: 600, color: '#47505e' }}>Close ✕</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', paddingTop: 13 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, padding: '5px 10px 6px', borderRadius: 6, background: st.bg, color: st.ink }}>{STATUS_LABEL[sel.status]}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, padding: '5px 10px 6px', borderRadius: 6, background: py.bg, color: py.ink }}>{payLabel}</span>
                  <span className="lc-mono" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginLeft: 'auto' }}>{money(sel.total)}</span>
                </div>
              </div>

              <div style={{ padding: '16px 20px 0' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280', paddingBottom: 9 }}>What happens next</div>
                <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                  {nx && <button type="button" onClick={nx.onClick} style={{ flex: '1 1 200px', textAlign: 'center', padding: '13px 15px 14px', borderRadius: 9, background: nx.bg, color: nx.ink, fontSize: 14.5, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{nx.label}</button>}
                  <button type="button" onClick={() => printInvoice(sel)} style={{ flex: nx ? '0 1 150px' : '1 1 200px', textAlign: 'center', padding: '13px 15px 14px', borderRadius: 9, border: '1px solid #d9dce2', color: '#47505e', fontSize: 14.5, fontWeight: 700, background: '#ffffff', cursor: 'pointer' }}>↓ Invoice</button>
                </div>
                {sel.status !== 'cancelled' && sel.status !== 'completed' && (
                  <button type="button" onClick={() => updateStatus(sel.id, 'cancelled')} style={{ display: 'block', width: '100%', marginTop: 9, textAlign: 'center', padding: '11px 15px 12px', borderRadius: 9, border: '1px solid #f3c9c9', color: '#991b1b', fontSize: 14, fontWeight: 700, background: '#ffffff', cursor: 'pointer' }}>Cancel this order</button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 4, padding: '18px 20px 0', borderBottom: '1px solid #e2e4e9' }}>
                {['Items','Client','Payment','Shipping'].map(label => {
                  const on = tab === label
                  return <button key={label} type="button" onClick={() => setTab(label)} style={{ border: 0, borderBottom: `3px solid ${on ? ACCENT : 'transparent'}`, background: 'transparent', cursor: 'pointer', padding: '9px 12px 11px', fontSize: 14.5, fontWeight: on ? 700 : 500, color: on ? '#16181d' : '#6b7280' }}>{label}</button>
                })}
              </div>

              <div style={{ padding: '18px 20px 26px' }}>

                {tab === 'Items' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingBottom: 11, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, color: '#6b7280' }}>{sel.order_items?.length ? `${sel.order_items.length} product${sel.order_items.length!==1?'s':''} · ${sel.order_items.reduce((s,i)=>s+i.quantity,0)} units` : 'No products in this order'}</span>
                      <span style={{ display: 'flex', gap: 8 }}>
                        <button type="button" onClick={() => { setShowAddItem(!showAddItem); setShowUnits(false); setAddItemForm({productId:'',search:'',quantity:'1',unitPrice:''}) }} style={{ fontSize: 13, fontWeight: 700, color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>+ Add item</button>
                        {sel.order_items?.length > 0 && <button type="button" onClick={() => { setShowUnits(!showUnits); setShowAddItem(false); setUnitItems(sel.order_items.map(i=>({...i}))) }} style={{ fontSize: 13, fontWeight: 700, color: DEEP, background: 'transparent', border: 'none', cursor: 'pointer' }}>Edit items</button>}
                      </span>
                    </div>

                    {showAddItem && (
                      <div style={{ border: '1px solid #e2e4e9', borderRadius: 10, padding: '13px 14px 14px', marginBottom: 12, background: '#f7f9fc' }}>
                        <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Product</label>
                        <input value={addItemForm.search} onChange={e=>setAddItemForm(f=>({...f,search:e.target.value,productId:''}))} placeholder="Search product name or SKU…" style={{...inp, marginBottom: 6}} />
                        {addItemForm.search && !addItemForm.productId && (
                          <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #e2e4e9', borderRadius: 6, marginBottom: 8, background: '#fff' }}>
                            {products.filter(p => p.name?.toLowerCase().includes(addItemForm.search.toLowerCase()) || p.sku?.toLowerCase().includes(addItemForm.search.toLowerCase())).slice(0,20).map(p => (
                              <div key={p.id} onClick={() => setAddItemForm(f=>({...f,productId:p.id,search:p.name,unitPrice:String(p.price||0)}))} style={{ padding: '7px 10px', fontSize: 12.5, cursor: 'pointer', borderBottom: '1px solid #f1f2f5' }}>{p.name} <span style={{ color: '#8b909a' }}>· {p.sku||'no sku'} · {money(p.price)}</span></div>
                            ))}
                          </div>
                        )}
                        {addItemForm.productId && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                            <div><label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Quantity</label><input type="number" min="1" value={addItemForm.quantity} onChange={e=>setAddItemForm(f=>({...f,quantity:e.target.value}))} style={inp} /></div>
                            <div><label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Unit price ($)</label><input type="number" step="0.01" value={addItemForm.unitPrice} onChange={e=>setAddItemForm(f=>({...f,unitPrice:e.target.value}))} style={inp} /></div>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={addOrderItem} disabled={saving || !addItemForm.productId} style={{ flex: 1, padding: 9, background: !addItemForm.productId ? '#d9dce2' : ACCENT, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 6, cursor: !addItemForm.productId ? 'not-allowed' : 'pointer' }}>{saving?'Saving…':'Add to order'}</button>
                          <button onClick={() => setShowAddItem(false)} style={{ padding: '9px 14px', background: 'transparent', color: '#6b7280', fontSize: 13, border: '1px solid #d9dce2', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {showUnits ? (
                      <div style={{ border: '1px solid #e2e4e9', borderRadius: 10, padding: '13px 14px 14px', marginBottom: 12, background: '#f7f9fc' }}>
                        {unitItems.map((it,i) => (
                          <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 90px 28px', gap: 8, alignItems: 'center', padding: '6px 0' }}>
                            <span style={{ fontSize: 12.5 }}>{it.product_name}</span>
                            <input type="number" value={it.quantity} onChange={e => setUnitItems(prev => prev.map((x,xi)=>xi===i?{...x,quantity:e.target.value}:x))} style={{...inp, padding:'6px 7px', fontSize:12}} />
                            <input type="number" step="0.01" value={it.unit_price} onChange={e => setUnitItems(prev => prev.map((x,xi)=>xi===i?{...x,unit_price:e.target.value}:x))} style={{...inp, padding:'6px 7px', fontSize:12}} />
                            <button onClick={() => removeOrderItem(it.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16 }}>×</button>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginTop: 4, borderTop: '1px solid #e2e4e9' }}>
                          <span style={{ fontSize: 12, color: '#6b7280' }}>New total</span>
                          <span className="lc-mono" style={{ fontSize: 14, fontWeight: 700 }}>{money(unitItems.reduce((s,i)=>s+((parseFloat(i.unit_price)||0)*(parseInt(i.quantity)||1)),0))}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button onClick={saveUnits} disabled={saving} style={{ flex: 1, padding: 9, background: ACCENT, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer' }}>{saving?'Saving…':'Save'}</button>
                          <button onClick={() => setShowUnits(false)} style={{ padding: '9px 14px', background: 'transparent', color: '#6b7280', fontSize: 13, border: '1px solid #d9dce2', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    ) : sel.order_items?.length > 0 ? sel.order_items.map(li => (
                      <div key={li.id} style={{ border: '1px solid #e2e4e9', borderRadius: 10, padding: '13px 14px 14px', marginBottom: 9 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, lineHeight: 1.45, color: '#16181d' }}>{li.product_name}</span>
                            <span className="lc-mono" style={{ display: 'block', paddingTop: 5, fontSize: 12.5, color: '#6b7280' }}>{li.product_sku || '—'} · {li.quantity} units × {money(li.unit_price)}</span>
                          </span>
                          <span className="lc-mono" style={{ flex: 'none', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{money(li.unit_price * li.quantity)}</span>
                        </div>
                      </div>
                    )) : (
                      <div style={{ border: '1px dashed #f3c9c9', borderRadius: 10, background: '#fff6f6', padding: 16, textAlign: 'center' }}>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#991b1b' }}>This order has no products in it</div>
                        <div style={{ paddingTop: 6, fontSize: 13.5, color: '#6b7280' }}>{(sel.notes||'').includes('Items: ') ? <>Recovered from the order notes: <strong>{(sel.notes||'').split('Items: ')[1].split(' | ')[0]}</strong></> : 'It was created but never filled. Add items or cancel it.'}</div>
                      </div>
                    )}

                    <div style={{ marginTop: 12, borderTop: '1px solid #e2e4e9' }}>
                      {totals.map(t => (
                        <div key={t.k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '10px 0 11px', borderBottom: '1px solid #f1f2f5' }}>
                          <span style={{ fontSize: 14, color: '#47505e' }}>{t.k}</span>
                          <span className="lc-mono" style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-.02em', color: t.ink }}>{t.v}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 11, padding: '13px 14px 14px', borderRadius: 10, background: '#16181d', color: '#ffffff' }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700 }}>{sel.status === 'cancelled' ? 'Charged to client' : 'Order total'}</span>
                        <span className="lc-mono" style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.03em' }}>{money(sel.status === 'cancelled' ? 0 : sel.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'Client' && (
                  selClient ? (
                    <div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, padding: 12, background: '#f7f9fc', border: '1px solid #e2e4e9', borderRadius: 10 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e8f0ff', border: `1.5px solid ${ACCENT}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: DEEP, flexShrink: 0 }}>{selClient.business_name?.[0] || '?'}</div>
                        <div><div style={{ fontSize: 14, fontWeight: 700 }}>{selClient.business_name}</div><div style={{ fontSize: 12.5, color: '#6b7280' }}>{selClient.contact_name}</div></div>
                        <Link href="/admin/clients" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: DEEP, background: '#e8f0ff', padding: '6px 11px', borderRadius: 6 }}>View profile →</Link>
                      </div>
                      {[
                        ['Contact', selClient.contact_name], ['Email', selClient.email], ['Phone', selClient.phone], ['Address', selClient.address],
                        ['Business type', selClient.business_type], ['Monthly volume', selClient.monthly_volume],
                        ['EIN', selClient.ein_number], ['Resale tax #', selClient.resale_tax_number],
                        ['Orders placed', `${clientOrders.length} order${clientOrders.length!==1?'s':''} · ${short(clientLifetime)} lifetime`],
                      ].filter(([,v]) => v).map(([k,v]) => (
                        <div key={k} style={{ display: 'grid', gridTemplateColumns: 'clamp(112px,30%,156px) minmax(0,1fr)', gap: 12, alignItems: 'baseline', padding: '12px 0 13px', borderBottom: '1px solid #f1f2f5' }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>{k}</span>
                          <span style={{ fontSize: 14.5, lineHeight: 1.5, color: '#16181d', wordBreak: 'break-word' }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <a href={`tel:${selClient.phone}`} style={{ flex: 1, textAlign: 'center', padding: '11px', background: '#e8f0ff', border: `1px solid ${ACCENT}55`, borderRadius: 8, fontSize: 13.5, fontWeight: 700, color: DEEP }}>Call client</a>
                        <a href={`mailto:${selClient.email}`} style={{ flex: 1, textAlign: 'center', padding: '11px', background: '#f7f9fc', border: '1px solid #e2e4e9', borderRadius: 8, fontSize: 13.5, fontWeight: 700, color: '#47505e' }}>Email client</a>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ padding: '13px 14px', background: '#fff6f6', border: '1px solid #f3c9c9', borderRadius: 10, fontSize: 13.5, color: '#991b1b', marginBottom: 14 }}>Client not found in approved list</div>
                      {[
                        ['Business', (sel.notes||'').split('Business: ')[1]?.split(/[|\n]/)[0]?.trim()],
                        ['Email', (sel.notes||'').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim()],
                        ['Phone', (sel.notes||'').split('Phone: ')[1]?.split(/[|\n]/)[0]?.trim()],
                      ].filter(([,v]) => v).map(([k,v]) => (
                        <div key={k} style={{ display: 'grid', gridTemplateColumns: 'clamp(112px,30%,156px) minmax(0,1fr)', gap: 12, alignItems: 'baseline', padding: '12px 0 13px', borderBottom: '1px solid #f1f2f5' }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>{k}</span>
                          <span style={{ fontSize: 14.5, color: '#16181d', wordBreak: 'break-word' }}>{v}</span>
                        </div>
                      ))}
                      {sel.payment_proof_url && <button onClick={() => openDoc(sel.payment_proof_url)} style={{ width: '100%', marginTop: 12, padding: 11, background: '#f0fdf4', color: '#166534', fontSize: 13.5, fontWeight: 700, border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer' }}>View payment proof</button>}
                    </div>
                  )
                )}

                {tab === 'Payment' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                      {[['Order total', money(sel.total), '#16181d'], ['Paid', money(paid), '#166534'], ['Balance', money(balance), balance>0?'#991b1b':'#166534']].map(([l,v,c]) => (
                        <div key={l} style={{ padding: 10, background: '#f7f9fc', border: '1px solid #e2e4e9', borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: 10.5, color: '#6b7280', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                          <div className="lc-mono" style={{ fontSize: 15, fontWeight: 700, color: c }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 6, background: '#eceef2', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
                      <div style={{ height: '100%', width: `${sel.total ? Math.min(100,(paid/sel.total)*100) : 0}%`, background: '#16a34a' }} />
                    </div>
                    {[
                      { k: 'Status', v: payLabel }, { k: 'Method', v: selPayment ? PAYMENT_METHODS.find(m=>m.value===selPayment.payment_method)?.label || selPayment.payment_method : '—' },
                      { k: 'Terms', v: 'Net 15' }, { k: 'Order reference', v: sel.order_number },
                    ].map(p => (
                      <div key={p.k} style={{ display: 'grid', gridTemplateColumns: 'clamp(112px,30%,156px) minmax(0,1fr)', gap: 12, alignItems: 'baseline', padding: '10px 0 11px', borderBottom: '1px solid #f1f2f5' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>{p.k}</span>
                        <span style={{ fontSize: 14.5, color: '#16181d' }}>{p.v}</span>
                      </div>
                    ))}
                    {payLabel === 'Proof sent' && (
                      <div style={{ marginTop: 14, padding: '13px 14px 14px', borderRadius: 10, background: '#f7f9fc', borderLeft: `4px solid ${ACCENT}`, fontSize: 14, lineHeight: 1.55, color: '#47505e' }}>The client uploaded a payment confirmation. Check it against your bank, then record it below to release the order.</div>
                    )}

                    {sel.payment_notes && (
                      <div style={{ marginTop: 16, padding: '10px 12px', background: '#f7f9fc', border: '1px solid #e2e4e9', borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6, fontWeight: 700 }}>Payment log</div>
                        {sel.payment_notes.split('\n').filter(Boolean).map((line,i) => <div key={i} style={{ fontSize: 12.5, color: '#47505e', padding: '4px 0', borderTop: i>0 ? '1px solid #eceef2' : 'none' }}>{line}</div>)}
                      </div>
                    )}

                    <button onClick={() => setShowPayment(!showPayment)} style={{ width: '100%', marginTop: 14, padding: 11, background: '#e8f0ff', color: DEEP, fontSize: 13.5, fontWeight: 700, border: `1px solid ${ACCENT}40`, borderRadius: 8, cursor: 'pointer' }}>+ Record payment</button>
                    {showPayment && (
                      <div style={{ marginTop: 10, border: '1px solid #e2e4e9', borderRadius: 10, padding: '13px 14px 14px', background: '#f7f9fc' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                          <div><label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Amount ($)</label><input type="number" value={payForm.amount} onChange={e=>setPayForm(p=>({...p,amount:e.target.value}))} placeholder="0.00" style={inp} /></div>
                          <div><label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Method / notes</label><input value={payForm.notes} onChange={e=>setPayForm(p=>({...p,notes:e.target.value}))} placeholder="Wire, ACH…" style={inp} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={savePayment} disabled={saving} style={{ flex: 1, padding: 9, background: ACCENT, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer' }}>{saving?'Saving…':'Record'}</button>
                          <button onClick={() => setShowPayment(false)} style={{ padding: '9px 14px', background: 'transparent', color: '#6b7280', fontSize: 13, border: '1px solid #d9dce2', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    )}
                    {sel.payment_proof_url && <button onClick={() => openDoc(sel.payment_proof_url)} style={{ width: '100%', marginTop: 10, padding: 11, background: '#f0fdf4', color: '#166534', fontSize: 13.5, fontWeight: 700, border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer' }}>View payment proof</button>}
                  </div>
                )}

                {tab === 'Shipping' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>ETA — Estimated arrival</span>
                      <button onClick={() => { setShowETA(!showETA); setEtaForm({eta:sel.eta||'',eta_notes:sel.eta_notes||''}) }} style={{ fontSize: 13, fontWeight: 700, color: DEEP, background: '#e8f0ff', border: `1px solid ${ACCENT}40`, padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>{sel.eta ? 'Edit' : '+ Set ETA'}</button>
                    </div>
                    {sel.eta && !showETA && (
                      <div style={{ padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#166534' }}>{new Date(sel.eta+'T00:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</div>
                        {sel.eta_notes && <div style={{ fontSize: 12.5, color: '#47505e', marginTop: 2 }}>{sel.eta_notes}</div>}
                      </div>
                    )}
                    {showETA && (
                      <div style={{ border: '1px solid #e2e4e9', borderRadius: 10, padding: '13px 14px 14px', marginBottom: 16, background: '#f7f9fc' }}>
                        <div style={{ marginBottom: 8 }}><label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Arrival date</label><input type="date" value={etaForm.eta} onChange={e=>setEtaForm(f=>({...f,eta:e.target.value}))} style={inp} /></div>
                        <div style={{ marginBottom: 8 }}><label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Notes (optional)</label><input value={etaForm.eta_notes} onChange={e=>setEtaForm(f=>({...f,eta_notes:e.target.value}))} placeholder="e.g. Arriving by truck" style={inp} /></div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={saveETA} disabled={saving} style={{ flex: 1, padding: 9, background: ACCENT, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer' }}>{saving?'Saving…':'Save ETA'}</button>
                          <button onClick={() => setShowETA(false)} style={{ padding: '9px 14px', background: 'transparent', color: '#6b7280', fontSize: 13, border: '1px solid #d9dce2', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    )}
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>Shipment details</div>
                    {[['Weight', sel.shipment_weight], ['Dimensions', sel.shipment_dimensions], ['Pallets', sel.shipment_pallets ? sel.shipment_pallets+' pallet(s)' : null], ['Notes', sel.shipment_notes], ['Origin', '6315 NW 99th Ave, Doral, FL 33178']].filter(([,v]) => v).map(([k,v]) => (
                      <div key={k} style={{ display: 'grid', gridTemplateColumns: 'clamp(112px,30%,156px) minmax(0,1fr)', gap: 12, alignItems: 'baseline', padding: '12px 0 13px', borderBottom: '1px solid #f1f2f5' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>{k}</span>
                        <span style={{ fontSize: 14.5, color: '#16181d', wordBreak: 'break-word' }}>{v}</span>
                      </div>
                    ))}
                    {(sel.bol_url || sel.labels_url) && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        {sel.bol_url && <button onClick={() => openDoc(sel.bol_url)} style={{ flex: 1, padding: 11, background: '#f0fdf4', color: '#166534', fontSize: 13.5, fontWeight: 700, border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer' }}>BOL</button>}
                        {sel.labels_url && <button onClick={() => openDoc(sel.labels_url)} style={{ flex: 1, padding: 11, background: '#e8f0ff', color: DEEP, fontSize: 13.5, fontWeight: 700, border: `1px solid ${ACCENT}40`, borderRadius: 8, cursor: 'pointer' }}>Labels</button>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* NEW ORDER MODAL — admin enters a WhatsApp/off-portal deal for an existing client */}
      {showNewOrder && (() => {
        const noClient = clients.find(c => c.id === noClientId)
        const noSubtotal = noItems.reduce((s,i) => s + i.unit_price * i.quantity, 0)
        const noDeliveryFeeNum = parseFloat(noDeliveryFee) || 0
        const noTotal = noSubtotal + noDeliveryFeeNum
        const clientMatches = noClientSearch
          ? clients.filter(c => c.business_name?.toLowerCase().includes(noClientSearch.toLowerCase()) || c.contact_name?.toLowerCase().includes(noClientSearch.toLowerCase()) || c.email?.toLowerCase().includes(noClientSearch.toLowerCase())).slice(0,20)
          : []
        const productMatches = noItemForm.search
          ? products.filter(p => p.name?.toLowerCase().includes(noItemForm.search.toLowerCase()) || p.sku?.toLowerCase().includes(noItemForm.search.toLowerCase())).slice(0,20)
          : []
        return (
          <div onClick={() => setShowNewOrder(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(22,24,29,.42)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '2rem' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, width: 520, maxWidth: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e4e9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div><div style={{ fontSize: 16, fontWeight: 700 }}>New order</div><div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>For a deal closed off-portal — e.g. over WhatsApp</div></div>
                <button onClick={() => setShowNewOrder(false)} style={{ background: '#eef0f4', border: 'none', color: '#47505e', cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', fontSize: 15 }}>×</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, padding: '1.25rem 1.5rem' }}>
                <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6, fontWeight: 700 }}>Client</label>
                {noClient ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#e8f0ff', border: `1px solid ${ACCENT}40`, borderRadius: 8, marginBottom: 16 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: DEEP, flexShrink: 0 }}>{noClient.business_name?.[0] || '?'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{noClient.business_name}</div><div style={{ fontSize: 12, color: '#6b7280' }}>{noClient.contact_name} · {noClient.email}</div></div>
                    <button onClick={() => { setNoClientId(null); setNoClientSearch('') }} style={{ fontSize: 12, color: '#6b7280', background: 'none', border: '1px solid #d9dce2', padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>Change</button>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    <input value={noClientSearch} onChange={e=>setNoClientSearch(e.target.value)} placeholder="Search by business, contact, or email…" style={inp} />
                    {noClientSearch && (
                      <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #e2e4e9', borderRadius: 8, marginTop: 6, background: '#fff' }}>
                        {clientMatches.map(c => <div key={c.id} onClick={() => { setNoClientId(c.id); setNoClientSearch('') }} style={{ padding: '8px 10px', fontSize: 12.5, cursor: 'pointer', borderBottom: '1px solid #f1f2f5' }}><strong>{c.business_name}</strong> <span style={{ color: '#8b909a' }}>· {c.contact_name} · {c.email}</span></div>)}
                        {clientMatches.length === 0 && <div style={{ padding: '8px 10px', fontSize: 12.5, color: '#8b909a' }}>No matching registered clients</div>}
                      </div>
                    )}
                  </div>
                )}

                <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 6, fontWeight: 700 }}>Items</label>
                {noItems.map((item,i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f2f5' }}>
                    <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{item.product_name}</div><div style={{ fontSize: 11, color: '#8b909a' }}>{item.quantity} units × {money(item.unit_price)}</div></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{money(item.unit_price*item.quantity)}</div><button onClick={() => removeNewOrderItem(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16 }}>×</button></div>
                  </div>
                ))}
                <div style={{ background: '#f7f9fc', border: '1px solid #e2e4e9', borderRadius: 8, padding: '0.875rem', marginTop: noItems.length ? 10 : 6 }}>
                  <input value={noItemForm.search} onChange={e=>setNoItemForm(f=>({...f,search:e.target.value,productId:''}))} placeholder="Search product name or SKU…" style={{...inp, marginBottom: noItemForm.search && !noItemForm.productId ? 6 : 0}} />
                  {noItemForm.search && !noItemForm.productId && (
                    <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid #e2e4e9', borderRadius: 6, marginBottom: 8, background: '#fff' }}>
                      {productMatches.map(p => <div key={p.id} onClick={() => setNoItemForm(f=>({...f,productId:p.id,search:p.name,unitPrice:String(p.price||0)}))} style={{ padding: '7px 10px', fontSize: 12.5, cursor: 'pointer', borderBottom: '1px solid #f1f2f5' }}>{p.name} <span style={{ color: '#8b909a' }}>· {p.sku||'no sku'} · {money(p.price)}</span></div>)}
                      {productMatches.length === 0 && <div style={{ padding: '7px 10px', fontSize: 12.5, color: '#8b909a' }}>No matching products</div>}
                    </div>
                  )}
                  {noItemForm.productId && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8, marginBottom: 8 }}>
                      <div><label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Quantity</label><input type="number" min="1" value={noItemForm.quantity} onChange={e=>setNoItemForm(f=>({...f,quantity:e.target.value}))} style={inp} /></div>
                      <div><label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 4 }}>Unit price ($)</label><input type="number" step="0.01" value={noItemForm.unitPrice} onChange={e=>setNoItemForm(f=>({...f,unitPrice:e.target.value}))} style={inp} /></div>
                    </div>
                  )}
                  <button onClick={addNewOrderItem} disabled={!noItemForm.productId} style={{ width: '100%', padding: 9, background: !noItemForm.productId ? '#d9dce2' : ACCENT, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 6, cursor: !noItemForm.productId ? 'not-allowed' : 'pointer' }}>+ Add to order</button>
                </div>

                <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginTop: 16, marginBottom: 6, fontWeight: 700 }}>Delivery / freight fee (optional)</label>
                <input type="number" step="0.01" min="0" value={noDeliveryFee} onChange={e=>setNoDeliveryFee(e.target.value)} placeholder="0.00" style={inp} />

                <label style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginTop: 16, marginBottom: 6, fontWeight: 700 }}>Payment method (optional)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                  {PAYMENT_METHODS.map(m => (
                    <button key={m.value} onClick={() => setNoPaymentMethod(prev => prev===m.value?'':m.value)} style={{ padding: '8px 4px', fontSize: 11, fontWeight: 700, border: `1px solid ${noPaymentMethod===m.value?ACCENT:'#d9dce2'}`, background: noPaymentMethod===m.value?'#e8f0ff':'transparent', color: noPaymentMethod===m.value?DEEP:'#47505e', borderRadius: 6, cursor: 'pointer', textAlign: 'center' }}>{m.label}</button>
                  ))}
                </div>
                {noPaymentMethod && <div style={{ fontSize: 11.5, color: '#8b909a', marginTop: 6 }}>A payment request will be logged for the admin to track and mark paid.</div>}

                {noItems.length > 0 && (
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#47505e', marginBottom: 4 }}><span>Items subtotal</span><span>{money(noSubtotal)}</span></div>
                    {noDeliveryFeeNum > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#47505e', marginBottom: 4 }}><span>Delivery / freight</span><span>{money(noDeliveryFeeNum)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #d9dce2' }}><span style={{ fontSize: 13, fontWeight: 600 }}>Order total</span><span style={{ fontSize: 20, fontWeight: 700, color: '#166534' }}>{money(noTotal)}</span></div>
                  </div>
                )}

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 13, color: '#47505e', cursor: 'pointer' }}>
                  <input type="checkbox" checked={noNotify} onChange={e=>setNoNotify(e.target.checked)} />
                  Email an order confirmation to the client
                </label>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e4e9', display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={createOrder} disabled={creatingOrder || !noClient || !noItems.length} style={{ flex: 1, padding: 12, background: (!noClient||!noItems.length) ? '#d9dce2' : ACCENT, color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: (!noClient||!noItems.length) ? 'not-allowed' : 'pointer', borderRadius: 8 }}>{creatingOrder ? 'Creating…' : 'Create order'}</button>
                <button onClick={() => setShowNewOrder(false)} style={{ padding: '12px 16px', background: 'transparent', color: '#6b7280', fontSize: 14, border: '1px solid #d9dce2', cursor: 'pointer', borderRadius: 8 }}>Cancel</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
