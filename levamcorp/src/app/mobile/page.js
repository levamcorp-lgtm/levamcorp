'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

// ── ICONS ──────────────────────────────────────────────
const Icon = ({ d, size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}
  </svg>
)
const IC = {
  home:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  orders:  ["M6 2h12l4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z","M16 2v4H8V2","M12 11v6","M9 14h6"],
  apps:    ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],
  clients: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  products:"M6 2h12l4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z",
  plus:    "M12 5v14M5 12h14",
  check:   "M20 6L9 17l-5-5",
  x:       "M18 6L6 18M6 6l12 12",
  phone:   "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  mail:    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  signout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  back:    "M19 12H5M12 19l-7-7 7-7",
  img:     ["M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z","M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z","M21 15l-5-5L5 21"],
  star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  alert:   ["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
}

// ── COLORS ─────────────────────────────────────────────
const C = {
  bg: '#0a0a0a', card: '#141414', border: 'rgba(255,255,255,0.08)',
  blue: '#2d7dd2', green: '#2a7d4f', red: '#e74c3c',
  gold: '#c49a00', text: '#fff', muted: '#888', dim: '#555',
}

const statusColor = { new:'#2d7dd2', review:'#854f0b', confirmed:'#534ab7', dispatched:'#2a7d4f', completed:'#2a7d4f', cancelled:'#e74c3c' }
const statusLabel = { new:'New', review:'Review', confirmed:'Confirmed', dispatched:'Dispatched', completed:'Completed', cancelled:'Cancelled' }

export default function MobileAdmin() {
  const [screen, setScreen] = useState('login')
  const [tab, setTab] = useState('home')
  const [user, setUser] = useState(null)

  // Data
  const [orders, setOrders] = useState([])
  const [applications, setApplications] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Detail views
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showETA, setShowETA] = useState(false)
  const [etaForm, setEtaForm] = useState({ eta: '', eta_notes: '' })
  const [savingETA, setSavingETA] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showAddProduct, setShowAddProduct] = useState(false)

  // Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Product form
  const [productForm, setProductForm] = useState({ name:'', brand:'', category:'electronics', price:'', cost_price:'', stock:'', moq:'1', description:'', active:true, is_top_pick:false })
  const [savingProduct, setSavingProduct] = useState(false)
  const [productImage, setProductImage] = useState(null)
  const [productImagePreview, setProductImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [productSuccess, setProductSuccess] = useState(false)

  const [toast, setToast] = useState(null)

  const showToast = (msg, type='success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = useCallback(async (supabase, quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    const [{ data: o }, { data: a }, { data: c }, { data: p }] = await Promise.all([
      supabase.from('orders').select('*, order_items(*)').order('submitted_at', { ascending: false }).limit(50),
      supabase.from('applications').select('*').order('id', { ascending: false }).limit(30),
      supabase.from('clients').select('*').order('id', { ascending: false }),
      supabase.from('products').select('*').order('name'),
    ])
    setOrders(o || [])
    setApplications(a || [])
    setClients(c || [])
    setProducts(p || [])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && ADMIN_EMAILS.includes(data.user.email)) {
        setUser(data.user)
        setScreen('app')
        loadData(supabase)
      }
    })
  }, [])

  const login = async () => {
    setLoginLoading(true); setLoginError('')
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !ADMIN_EMAILS.includes(data.user?.email)) {
      if (data.user) await supabase.auth.signOut()
      setLoginError('Invalid credentials'); setLoginLoading(false); return
    }
    setUser(data.user); setScreen('app')
    loadData(supabase)
    setLoginLoading(false)
  }

  const logout = async () => {
    await createClient().auth.signOut()
    setScreen('login'); setUser(null)
  }

  const saveETA = async () => {
    if (!etaForm.eta) { showToast('Select a date', 'error'); return }
    setSavingETA(true)
    const supabase = createClient()
    await supabase.from('orders').update({ eta: etaForm.eta, eta_notes: etaForm.eta_notes }).eq('id', selectedOrder.id)
    setSelectedOrder(prev => ({ ...prev, eta: etaForm.eta, eta_notes: etaForm.eta_notes }))
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, eta: etaForm.eta, eta_notes: etaForm.eta_notes } : o))
    setShowETA(false)
    setSavingETA(false)
    showToast('✓ ETA saved!')
  }

  const downloadInvoice = (order) => {
    const items = order.order_items || []
    const date = new Date(order.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const eta = order.eta ? new Date(order.eta).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'
    const html = \`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, Arial, sans-serif; color: #111; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #111; }
  .logo { font-size: 22px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; }
  .logo span { color: #2d7dd2; }
  .logo-sub { font-size: 10px; color: #888; letter-spacing: 0.2em; margin-top: 2px; text-transform: uppercase; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 28px; font-weight: 800; color: #111; }
  .invoice-title .num { font-size: 14px; color: #888; margin-top: 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .meta-box { background: #f7f8fa; padding: 16px; border-radius: 6px; }
  .meta-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
  .meta-value { font-size: 14px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #111; color: #fff; padding: 12px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; text-align: left; }
  td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
  tr:nth-child(even) td { background: #fafafa; }
  .total-row { background: #111 !important; }
  .total-row td { color: #fff; font-weight: 700; font-size: 15px; border: none; }
  .footer { text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; }
  .eta-box { background: #e8f4e8; border: 1px solid #2a7d4f; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px; }
  .eta-box .label { font-size: 10px; color: #2a7d4f; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; }
  .eta-box .value { font-size: 16px; font-weight: 800; color: #2a7d4f; margin-top: 2px; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">Levam<span>Corp</span></div>
    <div class="logo-sub">Corp · Distributors</div>
    <div style="margin-top:12px;font-size:12px;color:#888;line-height:1.6">
      6315 NW 99th Ave, Doral, FL 33178<br>
      partners@levamcorp.com<br>
      (786) 878-4122
    </div>
  </div>
  <div class="invoice-title">
    <h1>INVOICE</h1>
    <div class="num">#\${order.order_number}</div>
    <div style="margin-top:8px;font-size:12px;color:#888">Date: \${date}</div>
  </div>
</div>

\${order.eta ? \`<div class="eta-box"><div class="label">Estimated arrival</div><div class="value">\${eta}</div>\${order.eta_notes ? \`<div style="font-size:12px;color:#555;margin-top:4px">\${order.eta_notes}</div>\` : ''}</div>\` : ''}

<div class="meta">
  <div class="meta-box">
    <div class="meta-label">Bill to</div>
    <div class="meta-value">\${order.notes?.match(/Business: ([^\n|]+)/)?.[1]?.trim() || 'Client'}</div>
    <div style="font-size:12px;color:#888;margin-top:4px">\${order.notes?.match(/Email: ([^\s|,]+)/)?.[1] || ''}</div>
  </div>
  <div class="meta-box">
    <div class="meta-label">Order details</div>
    <div class="meta-value">Order #\${order.order_number}</div>
    <div style="font-size:12px;color:#888;margin-top:4px">Status: \${order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</div>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Product</th>
      <th>SKU</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Unit price</th>
      <th style="text-align:right">Total</th>
    </tr>
  </thead>
  <tbody>
    \${items.map(item => \`
    <tr>
      <td>\${item.product_name}</td>
      <td style="color:#888;font-size:11px">\${item.product_sku || '—'}</td>
      <td style="text-align:center">\${item.quantity}</td>
      <td style="text-align:right">$\${item.unit_price?.toLocaleString()}</td>
      <td style="text-align:right;font-weight:600">$\${(item.unit_price * item.quantity)?.toLocaleString()}</td>
    </tr>\`).join('')}
    <tr class="total-row">
      <td colspan="4">Total</td>
      <td style="text-align:right">$\${order.total?.toLocaleString()}</td>
    </tr>
  </tbody>
</table>

<div class="footer">
  Thank you for your business · Levam Corp Distributors · www.levamcorp.com · All sales are final
</div>
</body>
</html>\`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = \`Invoice-\${order.order_number}.html\`
    a.click()
    URL.revokeObjectURL(url)
    showToast('✓ Invoice downloaded!')
  }

  const approveApp = async (app) => {
    const supabase = createClient()
    await supabase.from('applications').update({ status: 'approved' }).eq('id', app.id)
    await supabase.from('clients').insert([{
      business_name: app.business_name, contact_name: app.contact_name,
      email: app.email, phone: app.phone, business_type: app.business_type,
      monthly_volume: app.monthly_volume, address: app.address,
      ein_number: app.ein_number, resale_tax_number: app.resale_tax_number,
      ein_document_url: app.ein_document_url, resale_tax_document_url: app.resale_tax_document_url,
    }])
    setApplications(prev => prev.map(a => a.id === app.id ? {...a, status:'approved'} : a))
    setSelectedApp(null)
    showToast('✓ Application approved!')
  }

  const rejectApp = async (app) => {
    const supabase = createClient()
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', app.id)
    setApplications(prev => prev.map(a => a.id === app.id ? {...a, status:'rejected'} : a))
    setSelectedApp(null)
    showToast('Application rejected', 'error')
  }

  const updateOrderStatus = async (order, newStatus) => {
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
    setOrders(prev => prev.map(o => o.id === order.id ? {...o, status: newStatus} : o))
    if (selectedOrder?.id === order.id) setSelectedOrder(prev => ({...prev, status: newStatus}))
    showToast(`Order moved to ${statusLabel[newStatus]}`)
  }

  const handleImagePick = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setProductImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setProductImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price) { showToast('Name and price required', 'error'); return }
    setSavingProduct(true)
    const supabase = createClient()
    let image_url = null
    if (productImage) {
      setUploadingImage(true)
      const ext = productImage.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data: imgData } = await supabase.storage.from('product-images').upload(path, productImage, { contentType: productImage.type, upsert: true })
      if (imgData) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        image_url = urlData.publicUrl
      }
      setUploadingImage(false)
    }
    await supabase.from('products').insert([{
      name: productForm.name, brand: productForm.brand,
      category: productForm.category, price: parseFloat(productForm.price),
      cost_price: productForm.cost_price ? parseFloat(productForm.cost_price) : null,
      stock: parseInt(productForm.stock) || 0, moq: parseInt(productForm.moq) || 1,
      description: productForm.description, active: productForm.active,
      is_top_pick: productForm.is_top_pick, image_url,
    }])
    setProductForm({ name:'', brand:'', category:'electronics', price:'', cost_price:'', stock:'', moq:'1', description:'', active:true, is_top_pick:false })
    setProductImage(null)
    setProductImagePreview(null)
    setShowAddProduct(false)
    setProductSuccess(true)
    setTimeout(() => setProductSuccess(false), 3000)
    showToast('✓ Product added!')
    loadData(supabase, true)
    setSavingProduct(false)
  }

  const fmtDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const newApps = applications.filter(a => !a.status || a.status === 'pending')
  const newOrders = orders.filter(o => o.status === 'new')

  // ── STYLES ──────────────────────────────────────────
  const s = {
    screen: { minHeight: '100svh', background: C.bg, color: C.text, fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', paddingBottom: 80 },
    card: { background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' },
    pill: (color) => ({ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${color}20`, color, display: 'inline-block' }),
    input: { width: '100%', background: '#1c1c1c', border: `1px solid ${C.border}`, color: C.text, fontSize: 15, padding: '12px 14px', borderRadius: 10, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
    btn: (color, bg) => ({ width: '100%', padding: 14, background: bg || color, color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }),
    section: { padding: '0 16px', marginBottom: 24 },
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  }

  // ── LOGIN ────────────────────────────────────────────
  if (screen === 'login') return (
    <div style={{ minHeight: '100svh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', color: C.blue, textTransform: 'uppercase', marginBottom: 8 }}>Levam Corp</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.text }}>Admin</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Staff access only</div>
      </div>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ ...s.input, marginBottom: 12 }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ ...s.input, marginBottom: 16 }} />
        {loginError && <div style={{ color: C.red, fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{loginError}</div>}
        <button onClick={login} disabled={loginLoading} style={s.btn(C.blue)}>
          {loginLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </div>
  )

  // ── LOADING ──────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100svh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.blue}`, borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: C.muted, fontSize: 13 }}>Loading...</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── DETAIL: ORDER ─────────────────────────────────────
  if (selectedOrder) {
    const o = selectedOrder
    const nextStatus = { new:'review', review:'confirmed', confirmed:'dispatched', dispatched:'completed' }
    const nextLabel = { new:'Move to review', review:'Confirm order', confirmed:'Mark dispatched', dispatched:'Mark completed' }
    return (
      <div style={s.screen}>
        {/* Header */}
        <div style={{ padding: '16px 16px 12px', background: '#111', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setSelectedOrder(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: C.text, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={IC.back} size={18} />
          </button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Order #{o.order_number}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{fmtDate(o.submitted_at)}</div>
          </div>
          <span style={{ marginLeft: 'auto', ...s.pill(statusColor[o.status] || C.muted) }}>{statusLabel[o.status]}</span>
        </div>

        <div style={{ padding: 16 }}>
          {/* Total */}
          <div style={{ ...s.card, padding: 20, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Order total</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: C.text }}>${o.total?.toLocaleString()}</div>
          </div>

          {/* Client info */}
          <div style={{ ...s.card, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Client</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{o.notes?.match(/Business: ([^\n|]+)/)?.[1]?.trim() || 'Client'}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{o.notes?.match(/Email: ([^\s|,]+)/)?.[1] || '—'}</div>
            {o.notes?.match(/Phone: ([^\n|]+)/)?.[1] && (
              <a href={`tel:${o.notes.match(/Phone: ([^\n|]+)/)[1].trim()}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 14px', background: 'rgba(45,125,210,0.1)', border: `0.5px solid rgba(45,125,210,0.2)`, borderRadius: 10, color: C.blue, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                <Icon d={IC.phone} size={16} color={C.blue} /> Call client
              </a>
            )}
          </div>

          {/* Items */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', borderBottom: `0.5px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Items · {o.order_items?.length} products</div>
            </div>
            {o.order_items?.map((item, i) => (
              <div key={item.id} style={{ padding: '12px 16px', borderBottom: i < o.order_items.length - 1 ? `0.5px solid ${C.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.product_name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>×{item.quantity} units · ${item.unit_price?.toLocaleString()} each</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* ETA */}
          <div style={{ ...s.card, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showETA ? 12 : 0 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Estimated arrival (ETA)</div>
                {o.eta ? (
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.green }}>
                    {new Date(o.eta + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                ) : (
                  <div style={{ fontSize: 14, color: C.dim }}>Not set</div>
                )}
                {o.eta_notes && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{o.eta_notes}</div>}
              </div>
              <button onClick={() => { setShowETA(!showETA); setEtaForm({ eta: o.eta || '', eta_notes: o.eta_notes || '' }) }}
                style={{ background: 'rgba(45,125,210,0.1)', border: `0.5px solid rgba(45,125,210,0.3)`, color: C.blue, fontSize: 13, fontWeight: 600, padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit' }}>
                {o.eta ? 'Edit' : '+ Set ETA'}
              </button>
            </div>
            {showETA && (
              <div style={{ marginTop: 12 }}>
                <input type="date" value={etaForm.eta} onChange={e => setEtaForm(f => ({...f, eta: e.target.value}))}
                  style={{ ...s.input, marginBottom: 10, colorScheme: 'dark' }} />
                <input type="text" placeholder="Notes (e.g. Arriving by truck)" value={etaForm.eta_notes} onChange={e => setEtaForm(f => ({...f, eta_notes: e.target.value}))}
                  style={{ ...s.input, marginBottom: 12 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button onClick={saveETA} disabled={savingETA}
                    style={{ padding: 12, background: C.blue, color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {savingETA ? 'Saving...' : '✓ Save ETA'}
                  </button>
                  <button onClick={() => setShowETA(false)}
                    style={{ padding: 12, background: 'transparent', color: C.muted, fontSize: 14, border: `0.5px solid ${C.border}`, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Download Invoice */}
          <button onClick={() => downloadInvoice(o)}
            style={{ ...s.btn(C.blue), marginBottom: 16, background: 'rgba(45,125,210,0.1)', color: C.blue, border: `0.5px solid rgba(45,125,210,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            📄 Download Invoice
          </button>

          {/* Actions */}
          {nextStatus[o.status] && (
            <button onClick={() => updateOrderStatus(o, nextStatus[o.status])}
              style={{ ...s.btn(C.blue), marginBottom: 10, background: `linear-gradient(135deg, ${C.blue}, #1a5fa8)`, boxShadow: '0 4px 20px rgba(45,125,210,0.3)' }}>
              {nextLabel[o.status]} →
            </button>
          )}
          {o.status !== 'cancelled' && o.status !== 'completed' && (
            <button onClick={() => updateOrderStatus(o, 'cancelled')}
              style={{ ...s.btn(C.red), background: 'rgba(231,76,60,0.12)', color: C.red, border: `0.5px solid rgba(231,76,60,0.3)` }}>
              Cancel order
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── DETAIL: APPLICATION ───────────────────────────────
  if (selectedApp) {
    const a = selectedApp
    const isPending = !a.status || a.status === 'pending'
    return (
      <div style={s.screen}>
        <div style={{ padding: '16px 16px 12px', background: '#111', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setSelectedApp(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: C.text, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={IC.back} size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{a.business_name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{a.contact_name}</div>
          </div>
          {!isPending && <span style={s.pill(a.status === 'approved' ? C.green : C.red)}>{a.status}</span>}
        </div>

        <div style={{ padding: 16 }}>
          {/* Contact quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <a href={`tel:${a.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, background: 'rgba(45,125,210,0.1)', border: `0.5px solid rgba(45,125,210,0.2)`, borderRadius: 12, color: C.blue, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <Icon d={IC.phone} size={18} color={C.blue} /> Call
            </a>
            <a href={`mailto:${a.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, background: 'rgba(45,125,210,0.1)', border: `0.5px solid rgba(45,125,210,0.2)`, borderRadius: 12, color: C.blue, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <Icon d={IC.mail} size={18} color={C.blue} /> Email
            </a>
          </div>

          {/* Info */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            {[
              ['Business', a.business_name],
              ['Contact', a.contact_name],
              ['Email', a.email],
              ['Phone', a.phone],
              ['Type', a.business_type],
              ['Monthly volume', a.monthly_volume],
              ['Years in business', a.years_in_business],
              ['Address', a.address],
              ['EIN', a.ein_number],
              ['Resale tax #', a.resale_tax_number],
            ].filter(([,v]) => v).map(([label, val], i, arr) => (
              <div key={label} style={{ padding: '12px 16px', borderBottom: i < arr.length - 1 ? `0.5px solid ${C.border}` : 'none' }}>
                <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, color: C.text }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Documents */}
          <div style={{ ...s.card, marginBottom: 20 }}>
            <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Documents</div>
            </div>
            {[['EIN / SS4 Letter', a.ein_document_url], ['Resale Tax Certificate', a.resale_tax_document_url]].map(([label, url]) => (
              <div key={label} style={{ padding: '12px 16px', borderBottom: `0.5px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: C.text }}>{label}</div>
                {url ? <span style={s.pill(C.green)}>✓ Uploaded</span> : <span style={s.pill(C.dim)}>Missing</span>}
              </div>
            ))}
          </div>

          {/* Actions */}
          {isPending && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => approveApp(a)} style={{ padding: 16, background: `linear-gradient(135deg, ${C.green}, #1a5f3a)`, color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 20px rgba(42,125,79,0.3)' }}>
                ✓ Approve
              </button>
              <button onClick={() => rejectApp(a)} style={{ padding: 16, background: 'rgba(231,76,60,0.12)', color: C.red, fontSize: 15, fontWeight: 700, border: `0.5px solid rgba(231,76,60,0.3)`, borderRadius: 12, cursor: 'pointer' }}>
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── DETAIL: CLIENT ────────────────────────────────────
  if (selectedClient) {
    const c = selectedClient
    return (
      <div style={s.screen}>
        <div style={{ padding: '16px 16px 12px', background: '#111', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setSelectedClient(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: C.text, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={IC.back} size={18} />
          </button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{c.business_name}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{c.contact_name}</div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <a href={`tel:${c.phone}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, background: 'rgba(45,125,210,0.1)', border: `0.5px solid rgba(45,125,210,0.2)`, borderRadius: 12, color: C.blue, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <Icon d={IC.phone} size={18} color={C.blue} /> Call
            </a>
            <a href={`mailto:${c.email}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, background: 'rgba(45,125,210,0.1)', border: `0.5px solid rgba(45,125,210,0.2)`, borderRadius: 12, color: C.blue, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <Icon d={IC.mail} size={18} color={C.blue} /> Email
            </a>
          </div>
          <div style={{ ...s.card }}>
            {[['Business', c.business_name],['Contact', c.contact_name],['Email', c.email],['Phone', c.phone],['Type', c.business_type],['Volume', c.monthly_volume],['Address', c.address],['EIN', c.ein_number]].filter(([,v])=>v).map(([label,val],i,arr)=>(
              <div key={label} style={{ padding: '12px 16px', borderBottom: i<arr.length-1?`0.5px solid ${C.border}`:'none' }}>
                <div style={{ fontSize: 10, color: C.dim, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── ADD PRODUCT ───────────────────────────────────────
  if (showAddProduct) {
    const pf = (field, val) => setProductForm(p => ({...p, [field]: val}))
    return (
      <div style={s.screen}>
        <div style={{ padding: '16px 16px 12px', background: '#111', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => setShowAddProduct(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: C.text, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={IC.back} size={18} />
          </button>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Add product</div>
        </div>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* IMAGE UPLOAD */}
          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Product photo</div>
            <label style={{ display: 'block', cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: 'none' }} />
              {productImagePreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={productImagePreview} alt="preview" style={{ width: '100%', height: 200, objectFit: 'contain', background: '#1c1c1c', borderRadius: 12, border: `1px solid ${C.border}` }} />
                  <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, padding: '6px 12px', borderRadius: 20, fontWeight: 600 }}>Change photo</div>
                </div>
              ) : (
                <div style={{ height: 160, background: '#1c1c1c', border: `2px dashed ${C.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Icon d={IC.img} size={32} color={C.dim} />
                  <div style={{ fontSize: 14, color: C.muted }}>Tap to add photo</div>
                  <div style={{ fontSize: 11, color: C.dim }}>JPG, PNG, WEBP</div>
                </div>
              )}
            </label>
          </div>

          {[
            ['Product name *', 'name', 'text', 'e.g. JBL PartyBox 710'],
            ['Brand', 'brand', 'text', 'e.g. JBL'],
            ['Wholesale price ($) *', 'price', 'number', '0.00'],
            ['Cost price ($)', 'cost_price', 'number', '0.00'],
            ['Stock units', 'stock', 'number', '0'],
            ['MOQ', 'moq', 'number', '1'],
          ].map(([label, field, type, ph]) => (
            <div key={field}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{label}</div>
              <input type={type} placeholder={ph} value={productForm[field]}
                onChange={e => pf(field, e.target.value)}
                style={s.input} />
            </div>
          ))}

          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Category</div>
            <select value={productForm.category} onChange={e => pf('category', e.target.value)}
              style={{ ...s.input }}>
              {['electronics','home_appliances','kitchen','other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Description</div>
            <textarea value={productForm.description} onChange={e => pf('description', e.target.value)}
              placeholder="Product description..." rows={3}
              style={{ ...s.input, resize: 'none' }} />
          </div>

          {/* Toggles */}
          {[['active', 'Active — visible to clients'], ['is_top_pick', '⭐ Top Pick — featured on homepage']].map(([field, label]) => (
            <button key={field} onClick={() => pf(field, !productForm[field])}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 12, cursor: 'pointer', color: C.text, fontFamily: 'inherit', fontSize: 14 }}>
              <span>{label}</span>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: productForm[field] ? C.blue : '#333', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, left: productForm[field] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
              </div>
            </button>
          ))}

          <button onClick={saveProduct} disabled={savingProduct}
            style={{ ...s.btn(C.blue), marginTop: 8, background: `linear-gradient(135deg, ${C.blue}, #1a5fa8)`, boxShadow: '0 4px 20px rgba(45,125,210,0.3)', fontSize: 16, padding: 16 }}>
            {uploadingImage ? 'Uploading photo...' : savingProduct ? 'Saving...' : 'Add product'}
          </button>
        </div>
      </div>
    )
  }

  // ── MAIN APP ──────────────────────────────────────────
  return (
    <div style={s.screen}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { -webkit-tap-highlight-color: transparent; }
        input, select, textarea { -webkit-appearance: none; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: 16, right: 16, zIndex: 999, padding: '14px 18px', background: toast.type === 'error' ? C.red : C.green, color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 16px 12px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, borderBottom: `0.5px solid ${C.border}` }}>
        <div>
          <div style={{ fontSize: 11, color: C.blue, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Levam Corp</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Admin</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {refreshing && <div style={{ width: 18, height: 18, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.blue}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: C.muted, width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon d={IC.signout} size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 16 }}>

        {/* HOME TAB */}
        {tab === 'home' && (
          <div>
            {/* Alert badges */}
            {(newApps.length > 0 || newOrders.length > 0) && (
              <div style={{ padding: '0 16px', marginBottom: 16 }}>
                <div style={{ background: 'rgba(231,76,60,0.08)', border: `0.5px solid rgba(231,76,60,0.2)`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon d={IC.alert} size={20} color={C.red} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Attention needed</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                      {[newApps.length > 0 && `${newApps.length} new application${newApps.length > 1?'s':''}`, newOrders.length > 0 && `${newOrders.length} new order${newOrders.length > 1?'s':''}`].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px', marginBottom: 24 }}>
              {[
                { label: 'New orders', value: newOrders.length, color: C.blue, action: () => setTab('orders') },
                { label: 'Pending apps', value: newApps.length, color: C.red, action: () => setTab('apps') },
                { label: 'Total clients', value: clients.length, color: C.green, action: () => setTab('clients') },
                { label: 'Products', value: products.length, color: C.gold, action: () => setTab('products') },
              ].map(stat => (
                <button key={stat.label} onClick={stat.action}
                  style={{ background: C.card, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: '18px 16px', textAlign: 'left', cursor: 'pointer', color: C.text, fontFamily: 'inherit' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{stat.label}</div>
                </button>
              ))}
            </div>

            {/* Recent orders */}
            <div style={s.section}>
              <div style={{ ...s.row, marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Recent orders</div>
                <button onClick={() => setTab('orders')} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>See all</button>
              </div>
              <div style={s.card}>
                {orders.slice(0,5).map((o, i) => (
                  <div key={o.id} onClick={() => setSelectedOrder(o)}
                    style={{ padding: '14px 16px', borderBottom: i < 4 ? `0.5px solid ${C.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>#{o.order_number}</div>
                      <span style={s.pill(statusColor[o.status])}>{statusLabel[o.status]}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>${o.total?.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: C.dim }}>{fmtDate(o.submitted_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent apps */}
            {newApps.length > 0 && (
              <div style={s.section}>
                <div style={{ ...s.row, marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>New applications</div>
                  <div style={s.pill(C.red)}>{newApps.length} pending</div>
                </div>
                <div style={s.card}>
                  {newApps.slice(0,3).map((a, i) => (
                    <div key={a.id} onClick={() => setSelectedApp(a)}
                      style={{ padding: '14px 16px', borderBottom: i < Math.min(newApps.length,3) - 1 ? `0.5px solid ${C.border}` : 'none', cursor: 'pointer' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{a.business_name}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{a.contact_name} · {a.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div style={s.section}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>All orders <span style={{ fontSize: 13, color: C.muted, fontWeight: 400 }}>· {orders.length}</span></div>
            <div style={s.card}>
              {orders.map((o, i) => (
                <div key={o.id} onClick={() => setSelectedOrder(o)}
                  style={{ padding: '14px 16px', borderBottom: i < orders.length - 1 ? `0.5px solid ${C.border}` : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>#{o.order_number}</div>
                    <span style={s.pill(statusColor[o.status])}>{statusLabel[o.status]}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>${o.total?.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: C.dim }}>{fmtDate(o.submitted_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {tab === 'apps' && (
          <div style={s.section}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Applications <span style={{ fontSize: 13, color: C.muted, fontWeight: 400 }}>· {applications.length}</span></div>
            <div style={s.card}>
              {applications.map((a, i) => (
                <div key={a.id} onClick={() => setSelectedApp(a)}
                  style={{ padding: '14px 16px', borderBottom: i < applications.length - 1 ? `0.5px solid ${C.border}` : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{a.business_name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{a.contact_name}</div>
                  </div>
                  {a.status === 'approved' ? <span style={s.pill(C.green)}>Approved</span>
                    : a.status === 'rejected' ? <span style={s.pill(C.red)}>Rejected</span>
                    : <span style={s.pill(C.gold)}>Pending</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENTS TAB */}
        {tab === 'clients' && (
          <div style={s.section}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Clients <span style={{ fontSize: 13, color: C.muted, fontWeight: 400 }}>· {clients.length}</span></div>
            <div style={s.card}>
              {clients.map((c, i) => (
                <div key={c.id} onClick={() => setSelectedClient(c)}
                  style={{ padding: '14px 16px', borderBottom: i < clients.length - 1 ? `0.5px solid ${C.border}` : 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{c.business_name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{c.contact_name} · {c.phone}</div>
                  </div>
                  <Icon d={IC.phone} size={16} color={C.blue} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div style={s.section}>
            <div style={{ ...s.row, marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Products <span style={{ fontSize: 13, color: C.muted, fontWeight: 400 }}>· {products.length}</span></div>
              <button onClick={() => setShowAddProduct(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: C.blue, color: '#fff', border: 'none', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                <Icon d={IC.plus} size={14} color="#fff" /> Add
              </button>
            </div>
            <div style={s.card}>
              {products.map((p, i) => (
                <div key={p.id} style={{ padding: '14px 16px', borderBottom: i < products.length - 1 ? `0.5px solid ${C.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      {p.is_top_pick && <Icon d={IC.star} size={12} color={C.gold} />}
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted }}>{p.brand} · {p.stock} units</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>${p.price?.toLocaleString()}</div>
                    <span style={s.pill(p.active ? C.green : C.dim)}>{p.active ? 'Active' : 'Hidden'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: `0.5px solid ${C.border}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {[
          { key: 'home', icon: IC.home, label: 'Home' },
          { key: 'orders', icon: IC.orders, label: 'Orders', badge: newOrders.length },
          { key: 'apps', icon: IC.apps, label: 'Apps', badge: newApps.length },
          { key: 'clients', icon: IC.clients, label: 'Clients' },
          { key: 'products', icon: IC.products, label: 'Products' },
        ].map(item => (
          <button key={item.key} onClick={() => setTab(item.key)}
            style={{ flex: 1, padding: '10px 4px 8px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative', fontFamily: 'inherit' }}>
            {item.badge > 0 && (
              <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(4px)', width: 16, height: 16, background: C.red, borderRadius: '50%', fontSize: 9, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.badge}
              </div>
            )}
            <Icon d={item.icon} size={22} color={tab === item.key ? C.blue : C.dim} />
            <div style={{ fontSize: 10, color: tab === item.key ? C.blue : C.dim, fontWeight: tab === item.key ? 700 : 400 }}>{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
