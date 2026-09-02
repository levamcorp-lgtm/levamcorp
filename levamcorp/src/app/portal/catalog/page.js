'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'
import { trackPageView, trackProductView, trackProductClick, trackSearch } from '../../../lib/analytics'

const NAV_LINKS = [['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']]

const CATEGORY_TABS = [['all','All products'],['top_picks','Top picks'],['tvs','TVs'],['electronics','Electronics'],['small appliances','Small Appliances'],['kitchen appliances','Kitchen'],['gaming','Gaming'],['audio & speakers','Audio'],['computers & laptops','Computers']]

function seededBars(seed, count) {
  let s = seed
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  const out = []
  for (let i = 0; i < count; i++) {
    const r = rnd()
    out.push({ grow: r > 0.82 ? 3 : r > 0.5 ? 2 : 1, h: r > 0.94 ? 18 : 13 })
  }
  return out
}

function PortalNav({ user, onLogout, onDownload, cartCount, onQuote }) {
  const pathname = usePathname()
  return (
    <nav style={{ position:'sticky', top:0, zIndex:40, background:'#08090B', borderBottom:'1px solid rgba(245,241,232,0.1)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, padding:'12px 2rem', maxWidth:1240, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap:32, flexWrap:'wrap' }}>
          <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:30, height:30, border:'1.5px solid rgba(245,241,232,0.35)', borderLeft:'3px solid #2F7DF6', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width:16, height:'auto' }}/>
            </div>
            <div>
              <div className="lc-display" style={{ fontSize:13, fontWeight:700, letterSpacing:'0.16em', color:'#F5F1E8', textTransform:'uppercase', lineHeight:1 }}>LEVAM<span style={{ color:'#2F7DF6' }}>CORP</span></div>
              <div className="lc-mono" style={{ fontSize:7, letterSpacing:'0.2em', color:'#6F6D67', textTransform:'uppercase', marginTop:2 }}>Partner Portal</div>
            </div>
          </Link>
          <div style={{ display:'flex', flexWrap:'wrap', minHeight:60 }}>
            {NAV_LINKS.map(([l,h]) => {
              const active = pathname === h
              return (
                <Link key={l} href={h} className="lc-mono" style={{ display:'flex', alignItems:'center', fontSize:10.5, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color: active ? '#F5F1E8' : '#6F6D67', textDecoration:'none', padding:'0 16px', borderBottom: active ? '2px solid #2F7DF6' : '2px solid transparent' }}>{l}</Link>
              )
            })}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <button onClick={onDownload} className="lc-mono" style={{ display:'flex', alignItems:'center', gap:7, fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', color:'#8A8780', padding:'8px 14px', border:'1px solid rgba(245,241,232,0.18)', background:'transparent', cursor:'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </button>
          <button onClick={onQuote} className="lc-mono" style={{ display:'flex', alignItems:'center', gap:9, fontSize:9.5, letterSpacing:'0.1em', textTransform:'uppercase', color: cartCount > 0 ? '#08090B' : '#8A8780', padding:'8px 16px', border:`1px solid ${cartCount > 0 ? '#2F7DF6' : 'rgba(245,241,232,0.18)'}`, background: cartCount > 0 ? '#2F7DF6' : 'transparent', cursor:'pointer', fontWeight:700 }}>
            Quote {cartCount > 0 && <span style={{ background:'#08090B', color:'#F2EFE6', fontSize:9, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
          </button>
          <button onClick={onLogout} className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#8A8780', border:'1px solid rgba(245,241,232,0.18)', padding:'8px 14px', background:'transparent', cursor:'pointer' }}>Sign out</button>
        </div>
      </div>
    </nav>
  )
}

export default function CatalogPage() {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [cart, setCart] = useState({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [brand, setBrand] = useState('all')
  const [hideOutOfStock, setHideOutOfStock] = useState(false)
  const [showQuote, setShowQuote] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [shippingMethod, setShippingMethod] = useState('')
  const [prepAddress, setPrepAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [hoverId, setHoverId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invoiceNum] = useState(`LC-${Math.floor(20000 + Math.random() * 9999)}`)

  // Product-sheet modal
  const [openIdx, setOpenIdx] = useState(-1)
  const [modalQty, setModalQty] = useState(1)
  const [modalVar, setModalVar] = useState(null)
  const [modalSec, setModalSec] = useState(0)
  const [modalAdded, setModalAdded] = useState(false)

  const barcode = useMemo(() => seededBars(20260902, 96), [])

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/portal'; return }
      const adminEmails = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
      if (adminEmails.includes(data.user.email)) { window.location.href = '/admin/dashboard'; return }
      setUser(data.user)
      const { data: prods } = await supabase.from('products').select('*').eq('active', true).order('name')
      setProducts(prods || [])
      setFiltered(prods || [])
      setLoading(false)
      trackPageView('/portal/catalog')
    })
  }, [])

  useEffect(() => {
    let list = products
    if (category === 'top_picks') list = list.filter(p => p.is_top_pick)
    else if (category !== 'all') list = list.filter(p => p.category === category)
    if (brand !== 'all') list = list.filter(p => p.brand === brand)
    if (hideOutOfStock) list = list.filter(p => (p.stock || 0) > 0)
    if (search.trim().length > 2) trackSearch(search.trim(), list.length)
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    const byStock = (a, b) => (a.stock === 0 ? 1 : 0) - (b.stock === 0 ? 1 : 0)
    setFiltered([...list].sort(byStock))
  }, [search, category, brand, hideOutOfStock, products])

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort()

  const resetFilters = () => { setSearch(''); setCategory('all'); setBrand('all'); setHideOutOfStock(false) }

  // Analytics tracked in addToCart
const addToCart = (product, qty, variation) => {
  const price = product.price + (variation?.price_diff || 0)
  const name  = variation ? `${product.name} — ${variation.color || variation.name}` : product.name
  setCart(c => ({ ...c, [product.id]: {
    ...product, qty: parseInt(qty) || product.moq || 1, price, name,
    image_url: variation?.image_url || product.image_url,
    variation_name: variation?.color || variation?.name || null,
  } }))
  trackProductClick(product, 'add_to_quote')
}
  const removeFromCart = (id) => setCart(c => { const n = { ...c }; delete n[id]; return n })
  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cartItems.length

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
  }

  const downloadExcel = () => {
    if (!products.length) return

    // Build CSV content (Excel compatible)
    const headers = ['Name','Brand','SKU','UPC','Category','Price','MOQ','Stock','Description','Amazon URL','Walmart URL']
    const rows = products.map(p => [
      p.name || '',
      p.brand || '',
      p.sku || '',
      p.upc || '',
      p.category || '',
      p.price ? `$${p.price.toFixed(2)}` : '',
      p.moq || 1,
      p.stock || 0,
      (p.description || '').replace(/,/g, ' ').replace(/\n/g, ' ').replace(/\r/g, ' '),
      p.amazon_url || '',
      p.walmart_url || '',
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `Levam-Corp-Catalog-${new Date().toISOString().slice(0,10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const submitOrder = async () => {
    if (!paymentMethod) { alert('Please select a payment method'); return }
    if (!shippingMethod) { alert('Please select a shipping method'); return }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()

      const { data: order, error } = await supabase.from('orders').insert([{
        user_id: u.id,
        status: 'new',
        subtotal: cartTotal,
        total: cartTotal,
        notes: `Email: ${u.email} | Items: ${cartItems.map(i => `${i.name} x${i.qty}`).join(', ')}`
      }]).select().single()

      if (error || !order) {
        console.error('Order creation failed', error)
        alert('There was a problem submitting your order. Please try again or contact us.')
        setSubmitting(false)
        return
      }

      const { error: itemsError } = await supabase.from('order_items').insert(
        cartItems.map(item => ({
          order_id: order.id,
          product_id: item.id,
          product_name: item.name,
          product_sku: item.sku || '—',
          quantity: item.qty,
          unit_price: item.price,
        }))
      )

      if (itemsError) {
        console.error('order_items insert failed', itemsError)
        alert(`Your order #${order.order_number} was created, but we couldn't save the item list. Please screenshot this and send it to partners@levamcorp.com:\n\n${itemsError.message}${itemsError.details ? '\n' + itemsError.details : ''}${itemsError.hint ? '\nHint: ' + itemsError.hint : ''}`)
        setSubmitting(false)
        return
      }

      // Create payment request automatically
      await supabase.from('payments').insert([{
        user_id: u.id,
        order_id: order.id,
        amount: cartTotal,
        status: 'requested',
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        client_email: u.email,
        notes: `Payment request for order #${order.order_number} | Shipping: ${shippingMethod}${prepAddress ? ' - ' + prepAddress : ''}`
      }])

      await fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order, items: cartItems.map(i => ({ product_name: i.name, product_sku: i.sku, quantity: i.qty, unit_price: i.price })),
          clientEmail: u.email, invoiceNum, total: cartTotal,
        })
      })

      await fetch('/api/send-payment-request-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: u.email, orderNumber: order.order_number,
          total: cartTotal, paymentMethod, shippingMethod,
          items: cartItems.map(i => ({ product_name: i.name, product_sku: i.sku, quantity: i.qty, unit_price: i.price }))
        })
      })

      setOrderSubmitted(true)
    } catch (e) { alert('Error submitting order. Please try again.') }
    setSubmitting(false)
  }

  const categoryIcon = (cat) => cat === 'electronics' ? '📺' : cat === 'home' ? '🏠' : '🍳'

  // Product-sheet modal
  const openAt = (i) => {
    const it = filtered[i]
    if (!it) return
    setOpenIdx(i); setModalQty(it.moq || 1); setModalVar(null); setModalSec(0); setModalAdded(false)
    trackProductView && trackProductView(it)
  }
  const closeModal = () => setOpenIdx(-1)
  const stepModal = (d) => {
    if (!filtered.length) return
    const n = (openIdx + d + filtered.length) % filtered.length
    setOpenIdx(n); setModalQty(filtered[n].moq || 1); setModalVar(null); setModalSec(0); setModalAdded(false)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (openIdx < 0) return
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') stepModal(1)
      if (e.key === 'ArrowLeft') stepModal(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIdx, filtered])

  useEffect(() => {
    document.body.style.overflow = openIdx >= 0 ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [openIdx])

  const modalProduct = openIdx >= 0 ? filtered[openIdx] : null
  const modalActiveVar = modalProduct && modalVar !== null ? modalProduct.variations?.[modalVar] : null
  const modalDisplayStock = modalActiveVar?.stock != null ? modalActiveVar.stock : (modalProduct?.stock || 0)
  const modalDisplayPrice = modalProduct ? modalProduct.price + (modalActiveVar?.price_diff || 0) : 0
  const modalOutOfStock = modalDisplayStock === 0
  const modalTotal = modalDisplayPrice * modalQty

  const globalStyle = `
    .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }
    .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; }
    input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .cat-add-btn:hover:not(:disabled) { background:#2F7DF6 !important; color:#08090B !important; }
  `

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{globalStyle}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width:28, height:28, border:'2px solid rgba(8,9,11,0.12)', borderTop:'2px solid #2F7DF6', borderRadius:'50%', margin:'0 auto 16px', animation:'spin 0.7s linear infinite' }}/>
        <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#8A8780' }}>Loading catalog…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', color:'#08090B', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>
      <style>{globalStyle}</style>

      <PortalNav user={user} onLogout={handleLogout} onDownload={downloadExcel} cartCount={cartCount} onQuote={() => setShowQuote(true)}/>

      {/* CATALOG HEADER */}
      <div style={{ background: '#08090B', color:'#F5F1E8', padding: '2rem 2rem 0' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
            <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
            Partner pricing · Catalog
          </div>
          <div style={{ height:1, background:'rgba(245,241,232,0.16)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap:'wrap', gap:16, padding:'clamp(18px,2.6vh,26px) 0 clamp(18px,2.6vh,22px)' }}>
            <div>
              <h1 className="lc-display" style={{ fontSize:'clamp(26px,3.2vw,36px)', fontWeight:400, letterSpacing:'-0.03em', margin:'0 0 6px', color:'#F5F2E9' }}>Product catalog<span style={{ color:'#2F7DF6' }}>.</span></h1>
              <p style={{ fontSize: 13, color: '#9A968E', margin:0 }}>Showing {filtered.length} of {products.length} products · Approved wholesale pricing</p>
            </div>
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or SKU…"
                className="lc-mono" style={{ background:'transparent', border:'1px solid rgba(245,241,232,0.25)', color:'#F5F1E8', fontSize:12, padding:'10px 14px 10px 34px', outline:'none', width:240 }} />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#6F6D67' }}>🔍</span>
            </div>
          </div>
          <div data-scroll style={{ display: 'flex', alignItems:'stretch', gap: 1, background:'rgba(245,241,232,0.16)', overflowX:'auto' }}>
            {CATEGORY_TABS.map(([val, label]) => {
              const n = val === 'all' ? products.length : val === 'top_picks' ? products.filter(p => p.is_top_pick).length : products.filter(p => p.category === val).length
              const on = category === val
              return (
                <button key={val} onClick={() => setCategory(val)} className="lc-mono" style={{ flex:'1 0 auto', fontSize: 10, fontWeight: 700, letterSpacing:'0.14em', textTransform:'uppercase', padding: '11px 15px 12px', cursor: 'pointer', border: 'none', whiteSpace:'nowrap', background: on ? '#2F7DF6' : 'transparent', color: on ? '#08090B' : '#F5F1E8' }}>{label} <span style={{ color: on ? 'rgba(8,9,11,0.55)' : '#6F6D67' }}>{n}</span></button>
              )
            })}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 0 18px', flexWrap:'wrap' }}>
            {brands.length > 0 && (
              <select value={brand} onChange={e => setBrand(e.target.value)} className="lc-mono"
                style={{ background:'transparent', border:'1px solid rgba(245,241,232,0.25)', color: brand !== 'all' ? '#F5F1E8' : '#8A8780', fontSize:10, fontWeight: brand !== 'all' ? 700 : 400, padding:'8px 10px', outline:'none', cursor:'pointer' }}>
                <option value="all">All brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
            <button onClick={() => setHideOutOfStock(h => !h)} className="lc-mono"
              style={{ fontSize: 10, fontWeight: 700, letterSpacing:'0.06em', textTransform:'uppercase', padding: '8px 14px', cursor: 'pointer', whiteSpace:'nowrap', border: `1px solid ${hideOutOfStock ? '#2F7DF6' : 'rgba(245,241,232,0.25)'}`, background: hideOutOfStock ? '#2F7DF6' : 'transparent', color: hideOutOfStock ? '#08090B' : '#8A8780' }}>
              {hideOutOfStock ? '✓ ' : ''}Hide out of stock
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div style={{ padding: '2rem', maxWidth: 1440, margin: '0 auto' }}>
        {filtered.length === 0 ? (
          <div style={{ border:'1px solid rgba(8,9,11,0.1)', padding: 'clamp(34px,6vh,60px) 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity:0.5 }}>🔍</div>
            <div className="lc-mono" style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', fontWeight: 700, color:'#6F6D67' }}>No products match this filter</div>
            <button onClick={resetFilters} className="lc-mono" style={{ marginTop:14, border:'1px solid rgba(8,9,11,0.85)', background:'transparent', cursor:'pointer', padding:'10px 15px', fontSize:9.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#08090B' }}>Clear filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(228px,1fr))', gap: 1, background:'rgba(8,9,11,0.1)', border:'1px solid rgba(8,9,11,0.1)' }}>
            {filtered.map((product, i) => {
              const isHovered = hoverId === product.id
              const outOfStock = (product.stock || 0) === 0
              const low = !outOfStock && product.stock <= 5
              const teaseText = product.condition && product.condition !== 'New' ? product.condition : (product.dispatch_days ? `Ships in ${product.dispatch_days}` : '')
              return (
                <div key={product.id} role="button" tabIndex={0}
                  onClick={() => openAt(i)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(i) } }}
                  onMouseEnter={() => setHoverId(product.id)} onMouseLeave={() => setHoverId(null)}
                  style={{ position:'relative', display:'flex', flexDirection:'column', cursor:'pointer', background: isHovered ? '#F7FAFF' : '#FFFFFF' }}>
                  <div style={{ position:'absolute', left:0, right:0, top:0, height:3, background: isHovered ? '#2F7DF6' : 'transparent' }}/>

                  <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, padding:'9px 11px 7px', fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase' }}>
                    <span style={{ color: product.is_top_pick ? '#2F7DF6' : '#6F6D67' }}>{product.is_top_pick ? 'Top pick' : product.category}</span>
                    <span style={{ color: outOfStock ? '#8A8780' : low ? '#9A6A1E' : '#0E9A5A' }}>{outOfStock ? 'Out of stock' : `${product.stock} in stock`}</span>
                  </div>

                  <div style={{ position:'relative', margin:'0 11px', aspectRatio:'1 / 1', background:'#F2EFE6', border:'1px solid rgba(8,9,11,0.1)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {product.image_url ? <img src={product.image_url} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'contain', padding:16 }}/> : <span style={{ fontSize:36, color:'#D8D4C8' }}>◻</span>}
                  </div>

                  {product.brand && <div className="lc-mono" style={{ padding:'11px 11px 0', fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#2F7DF6' }}>{product.brand}</div>}
                  <div style={{ padding:'5px 11px 0', fontSize:13, lineHeight:1.4, letterSpacing:'-0.005em', color:'#08090B', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{product.name}</div>

                  {teaseText && <div className="lc-mono" style={{ padding:'8px 11px 0', fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', color: isHovered ? '#1B5FD0' : '#9A968E' }}>{teaseText}</div>}

                  <div style={{ flex:1, minHeight:10 }}/>

                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:8, padding:'12px 11px 0' }}>
                    <span className="lc-display" style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.03em', color:'#08090B' }}>${product.price?.toLocaleString()}</span>
                    <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>MOQ {product.moq || 1}</span>
                  </div>

                  <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, margin:11, padding:'10px 11px', background: isHovered ? '#2F7DF6' : '#E8F1FF', fontWeight:700, fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color: isHovered ? '#08090B' : '#1B5FD0' }}>
                    <span>{isHovered ? 'Open product sheet' : 'Specs · pricing · logistics'}</span>
                    <span style={{ fontWeight:400, fontSize:11 }}>{isHovered ? '→' : '+'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* PRODUCT SHEET MODAL */}
      {openIdx >= 0 && modalProduct && (
        <div style={{ position:'fixed', inset:0, zIndex:20000, display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(8px,2.4vh,30px) clamp(8px,3vw,30px)' }}>
          <div onClick={closeModal} style={{ position:'absolute', inset:0, background:'rgba(8,9,11,0.62)' }}/>
          <div role="dialog" aria-modal="true" style={{ position:'relative', width:'100%', maxWidth:1180, maxHeight:'100%', display:'flex', flexDirection:'column', background:'#FFFFFF', border:'1px solid #08090B', boxShadow:'0 40px 90px -30px rgba(8,9,11,0.7)' }}>

            {/* Header */}
            <div className="lc-mono" style={{ flex:'none', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'12px clamp(14px,2.4vw,26px)', borderBottom:'1px solid #08090B', background:'#08090B', color:'#F2EFE6', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase' }}>
              <span style={{ display:'flex', alignItems:'center', gap:9 }}>
                <span style={{ display:'inline-block', width:11, height:11, border:'1px solid rgba(242,239,230,0.6)', borderLeft:'3px solid #2F7DF6' }}/>
                Product sheet · {modalProduct.sku || '—'}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                <span style={{ color:'#8A8780' }}>Item {openIdx + 1} of {filtered.length}</span>
                <button onClick={() => stepModal(-1)} style={{ border:'1px solid rgba(242,239,230,0.3)', background:'transparent', cursor:'pointer', padding:'6px 10px', color:'#F2EFE6', fontFamily:'inherit', fontSize:10 }}>←</button>
                <button onClick={() => stepModal(1)} style={{ border:'1px solid rgba(242,239,230,0.3)', background:'transparent', cursor:'pointer', padding:'6px 10px', color:'#F2EFE6', fontFamily:'inherit', fontSize:10 }}>→</button>
                <button onClick={closeModal} aria-label="Close" style={{ border:0, background:'#2F7DF6', cursor:'pointer', padding:'7px 12px', color:'#08090B', fontFamily:'inherit', fontWeight:700, fontSize:10, letterSpacing:'0.16em' }}>Close ✕</button>
              </span>
            </div>

            <div data-scroll style={{ flex:1, minHeight:0, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap:1, background:'rgba(8,9,11,0.1)', alignContent:'start' }}>

              {/* LEFT: image, variations, marketplace links */}
              <div style={{ background:'#FFFFFF', padding:'clamp(14px,2.2vw,22px)' }}>
                <div style={{ position:'relative', aspectRatio:'1 / 1', background:'#F2EFE6', border:'1px solid rgba(8,9,11,0.14)', overflow:'hidden' }}>
                  {(modalActiveVar?.image_url || modalProduct.image_url) ? (
                    <img src={modalActiveVar?.image_url || modalProduct.image_url} alt={modalProduct.name} style={{ width:'100%', height:'100%', objectFit:'contain', padding:20 }}/>
                  ) : (
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:44, color:'#D8D4C8' }}>◻</div>
                  )}
                  <div style={{ position:'absolute', left:9, top:9, pointerEvents:'none', width:12, height:12, borderTop:'1px solid rgba(8,9,11,0.4)', borderLeft:'1px solid rgba(8,9,11,0.4)' }}/>
                  <div style={{ position:'absolute', right:9, bottom:9, pointerEvents:'none', width:12, height:12, borderBottom:'1px solid rgba(8,9,11,0.4)', borderRight:'1px solid rgba(8,9,11,0.4)' }}/>
                </div>

                {modalProduct.variations?.length > 0 && (
                  <div style={{ marginTop:14 }}>
                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:9 }}>Color / variation</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {modalProduct.variations.map((v, vi) => (
                        <button key={vi} onClick={() => { setModalVar(modalVar === vi ? null : vi); setModalAdded(false) }} title={v.color || v.name}
                          style={{ width:28, height:28, borderRadius:'50%', background:v.hex || '#888', border:`2px solid ${modalVar === vi ? '#08090B' : 'rgba(8,9,11,0.15)'}`, outline: modalVar === vi ? '1.5px solid #08090B' : 'none', outlineOffset:2, cursor:'pointer', padding:0 }}/>
                      ))}
                    </div>
                    {modalActiveVar && (
                      <div style={{ marginTop:6, fontSize:11, color:'#5C5A55', fontWeight:500 }}>
                        {modalActiveVar.color || modalActiveVar.name}
                        {modalActiveVar.price_diff !== 0 && <span style={{ color: modalActiveVar.price_diff > 0 ? '#E74C3C' : '#0E9A5A', fontWeight:700, marginLeft:4 }}>{modalActiveVar.price_diff > 0 ? '+' : ''}${modalActiveVar.price_diff}</span>}
                      </div>
                    )}
                  </div>
                )}

                {(modalProduct.amazon_url || modalProduct.walmart_url) && (
                  <div style={{ marginTop:14, borderTop:'1px solid rgba(8,9,11,0.1)', paddingTop:12 }}>
                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:9 }}>Marketplace listings</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      {modalProduct.amazon_url && <a href={modalProduct.amazon_url} target="_blank" rel="noopener noreferrer" className="lc-mono" style={{ flex:1, minWidth:96, textAlign:'center', background:'#FF9900', color:'#08090B', fontWeight:700, fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', padding:'9px 8px', textDecoration:'none' }}>Amazon ↗</a>}
                      {modalProduct.walmart_url && <a href={modalProduct.walmart_url} target="_blank" rel="noopener noreferrer" className="lc-mono" style={{ flex:1, minWidth:96, textAlign:'center', background:'#0071CE', color:'#fff', fontWeight:700, fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', padding:'9px 8px', textDecoration:'none' }}>Walmart ↗</a>}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: details, KPIs, sections, order box */}
              <div style={{ background:'#FFFFFF', padding:'clamp(16px,2.4vw,26px)' }}>
                <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase' }}>
                  {modalProduct.brand && <span style={{ color:'#2F7DF6' }}>{modalProduct.brand}</span>}
                  {modalProduct.brand && <span style={{ color:'rgba(8,9,11,0.25)' }}>/</span>}
                  <span style={{ color:'#6F6D67' }}>{modalProduct.category}</span>
                  <span style={{ background: modalOutOfStock ? '#F2EFE6' : (modalDisplayStock <= 5 ? '#FEF3C7' : '#DCFCE7'), color: modalOutOfStock ? '#8A8780' : (modalDisplayStock <= 5 ? '#92400E' : '#166534'), padding:'4px 8px 5px' }}>
                    {modalOutOfStock ? 'Out of stock' : modalDisplayStock <= 5 ? `${modalDisplayStock} left` : 'In stock'}
                  </span>
                </div>

                <h2 className="lc-display" style={{ margin:'12px 0 0', fontSize:'clamp(21px,2.3vw,30px)', fontWeight:400, letterSpacing:'-0.03em', lineHeight:1.16, color:'#08090B' }}>{modalProduct.name}</h2>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:1, background:'rgba(8,9,11,0.1)', marginTop:'clamp(16px,2.4vh,22px)', border:'1px solid rgba(8,9,11,0.1)' }}>
                  <div style={{ background:'#2F7DF6', padding:'11px 12px 12px' }}>
                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(8,9,11,0.62)' }}>Your price</div>
                    <div style={{ paddingTop:6, fontSize:19, fontWeight:500, letterSpacing:'-0.03em', color:'#08090B' }}>${modalDisplayPrice?.toLocaleString()}</div>
                    <div className="lc-mono" style={{ paddingTop:3, fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(8,9,11,0.62)' }}>per unit</div>
                  </div>
                  <div style={{ background:'#FFFFFF', padding:'11px 12px 12px' }}>
                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>In stock</div>
                    <div style={{ paddingTop:6, fontSize:19, fontWeight:500, letterSpacing:'-0.03em', color:'#08090B' }}>{modalDisplayStock}</div>
                    <div className="lc-mono" style={{ paddingTop:3, fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>units available</div>
                  </div>
                  <div style={{ background:'#FFFFFF', padding:'11px 12px 12px' }}>
                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>MOQ</div>
                    <div style={{ paddingTop:6, fontSize:19, fontWeight:500, letterSpacing:'-0.03em', color:'#08090B' }}>{modalProduct.moq || 1}</div>
                    <div className="lc-mono" style={{ paddingTop:3, fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>units minimum</div>
                  </div>
                  <div style={{ background:'#FFFFFF', padding:'11px 12px 12px' }}>
                    <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>Dispatch</div>
                    <div style={{ paddingTop:6, fontSize:19, fontWeight:500, letterSpacing:'-0.03em', color:'#08090B' }}>{modalProduct.dispatch_days || '—'}</div>
                    <div className="lc-mono" style={{ paddingTop:3, fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>from Doral, FL</div>
                  </div>
                </div>

                {(() => {
                  const sections = ['Specifications', 'Logistics', ...(modalProduct.prep_fee ? ['Prep center'] : [])]
                  return (
                    <>
                      <div data-scroll className="lc-mono" style={{ display:'flex', gap:1, background:'rgba(8,9,11,0.1)', marginTop:'clamp(16px,2.4vh,22px)', overflowX:'auto' }}>
                        {sections.map((s, si) => (
                          <button key={s} onClick={() => setModalSec(si)} style={{ flex:1, border:0, cursor:'pointer', whiteSpace:'nowrap', padding:'10px 13px 11px', background: modalSec === si ? '#08090B' : '#FFFFFF', color: modalSec === si ? '#F2EFE6' : '#08090B', fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase' }}>{s}</button>
                        ))}
                      </div>
                      <div style={{ border:'1px solid rgba(8,9,11,0.1)', borderTop:0, padding:'clamp(12px,2vh,18px) clamp(12px,1.8vw,16px)' }}>
                        {modalSec === 0 && (
                          <div>
                            {[
                              ['Brand', modalProduct.brand],
                              ['Category', modalProduct.category],
                              ['Condition', modalProduct.condition || 'New'],
                              ['SKU', modalProduct.sku],
                              ['UPC', modalProduct.upc],
                              ['ASIN', modalProduct.asin],
                              ['Weight', modalProduct.weight],
                              ['Dimensions', modalProduct.dimensions],
                            ].filter(([, v]) => v).map(([k, v]) => (
                              <div key={k} style={{ display:'grid', gridTemplateColumns:'clamp(104px,13vw,158px) 1fr', gap:'8px 14px', alignItems:'baseline', padding:'8px 0 9px', borderBottom:'1px solid rgba(8,9,11,0.1)' }}>
                                <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>{k}</span>
                                <span style={{ fontSize:13.5, lineHeight:1.5, color:'#08090B' }}>{v}</span>
                              </div>
                            ))}
                            {modalProduct.description && (
                              <div style={{ paddingTop:10, fontSize:13, lineHeight:1.7, color:'#5C5A55' }}>{modalProduct.description}</div>
                            )}
                          </div>
                        )}
                        {modalSec === 1 && (
                          <div>
                            {[
                              ['Ships from', modalProduct.warehouse === 'WH: FL' ? 'Doral, FL 33178' : (modalProduct.warehouse || '—')],
                              ['Lead time', modalProduct.dispatch_days || '—'],
                              ['MOQ', `${modalProduct.moq || 1} units`],
                            ].map(([k, v]) => (
                              <div key={k} style={{ display:'grid', gridTemplateColumns:'clamp(104px,13vw,158px) 1fr', gap:'8px 14px', alignItems:'baseline', padding:'8px 0 9px', borderBottom:'1px solid rgba(8,9,11,0.1)' }}>
                                <span className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>{k}</span>
                                <span className="lc-mono" style={{ fontSize:12, letterSpacing:'0.06em', textTransform:'uppercase', color:'#08090B' }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {modalSec === 2 && modalProduct.prep_fee && (
                          <div>
                            <div style={{ fontSize:13.5, lineHeight:1.62, color:'#3F3D39' }}>If you select <strong style={{ color:'#08090B' }}>Prep Center</strong> as your shipping method, labeling and prep services are available for this product — we receive, label and forward to the marketplace on your behalf.</div>
                            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:1, background:'rgba(8,9,11,0.1)', marginTop:14, border:'1px solid rgba(8,9,11,0.1)' }}>
                              <div style={{ background:'#FFFFFF', padding:'10px 11px 11px' }}>
                                <div className="lc-mono" style={{ fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>Prep fee</div>
                                <div className="lc-mono" style={{ paddingTop:5, fontSize:13, fontWeight:700, color:'#08090B' }}>${modalProduct.prep_fee.toFixed(2)} / unit</div>
                              </div>
                              <div style={{ background:'#FFFFFF', padding:'10px 11px 11px' }}>
                                <div className="lc-mono" style={{ fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>For {modalQty} units</div>
                                <div className="lc-mono" style={{ paddingTop:5, fontSize:13, fontWeight:700, color:'#08090B' }}>${(modalProduct.prep_fee * modalQty).toFixed(2)}</div>
                              </div>
                              <div style={{ background:'#FFFFFF', padding:'10px 11px 11px' }}>
                                <div className="lc-mono" style={{ fontSize:8, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6F6D67' }}>Includes</div>
                                <div className="lc-mono" style={{ paddingTop:5, fontSize:13, fontWeight:700, color:'#08090B' }}>Label + prep</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )
                })()}

                <div style={{ marginTop:'clamp(16px,2.4vh,22px)', borderTop:'1px solid #08090B', paddingTop:'clamp(14px,2.2vh,18px)' }}>
                  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:14, flexWrap:'wrap' }}>
                    <div>
                      <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:8 }}>Order quantity · MOQ {modalProduct.moq || 1}</div>
                      <div style={{ display:'flex', alignItems:'stretch', gap:1, background:'rgba(8,9,11,0.1)', border:'1px solid rgba(8,9,11,0.1)' }}>
                        <button onClick={() => setModalQty(q => Math.max(modalProduct.moq || 1, q - 1))} disabled={modalOutOfStock} style={{ border:0, background:'#FFFFFF', cursor: modalOutOfStock ? 'not-allowed' : 'pointer', width:40, fontSize:17, color:'#08090B' }}>−</button>
                        <input
                          type="number"
                          value={modalQty}
                          disabled={modalOutOfStock}
                          onChange={e => {
                            const v = parseInt(e.target.value) || modalProduct.moq || 1
                            setModalQty(Math.max(modalProduct.moq || 1, Math.min(modalDisplayStock || 9999, v)))
                            setModalAdded(false)
                          }}
                          className="lc-mono" style={{ width:88, border:0, background:'#FFFFFF', textAlign:'center', fontSize:15, fontWeight:700, color:'#08090B', outline:'none', fontFamily:'inherit' }}
                        />
                        <button onClick={() => setModalQty(q => Math.min(modalDisplayStock || 9999, q + 1))} disabled={modalOutOfStock} style={{ border:0, background:'#FFFFFF', cursor: modalOutOfStock ? 'not-allowed' : 'pointer', width:40, fontSize:17, color:'#08090B' }}>+</button>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>Order total</div>
                      <div style={{ paddingTop:5, fontSize:'clamp(24px,3vw,34px)', fontWeight:500, letterSpacing:'-0.035em', color:'#08090B' }}>${modalOutOfStock ? '0.00' : modalTotal.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 })}</div>
                      <div className="lc-mono" style={{ fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#2F7DF6' }}>{!modalOutOfStock && `$${modalDisplayPrice?.toLocaleString()} per unit · ${modalQty} units`}</div>
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:9, flexWrap:'wrap', marginTop:'clamp(14px,2.2vh,18px)' }}>
                    <button onClick={() => { if (modalOutOfStock) return; addToCart(modalProduct, modalQty, modalActiveVar); setModalAdded(true) }} disabled={modalOutOfStock}
                      className="lc-mono" style={{ flex:1, minWidth:180, border:0, cursor: modalOutOfStock ? 'not-allowed' : 'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', gap:12, padding:'15px 20px', background: modalOutOfStock ? '#EDEAE1' : modalAdded ? '#86EFAC' : '#2F7DF6', color:'#08090B', fontWeight:700, fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase' }}>
                      {modalOutOfStock ? 'Out of stock' : modalAdded ? 'Added to quote ✓' : 'Add to quote'} {!modalOutOfStock && <span style={{ fontWeight:400, fontSize:12 }}>→</span>}
                    </button>
                    <a href="https://wa.me/17864909005" target="_blank" rel="noopener noreferrer" className="lc-mono" style={{ flex:1, minWidth:150, textAlign:'center', border:'1px solid #08090B', padding:'15px 18px', color:'#08090B', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', textDecoration:'none' }}>Ask your rep</a>
                  </div>

                  <div className="lc-mono" style={{ paddingTop:11, fontSize:8.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>
                    Net terms available on approval · Ships from Doral, FL{modalProduct.dispatch_days ? ` · ${modalProduct.dispatch_days} lead time` : ''}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex:'none', boxSizing:'border-box', display:'flex', alignItems:'flex-end', gap:2, height:28, padding:'8px clamp(14px,2.4vw,26px)', overflow:'hidden', borderTop:'1px solid rgba(8,9,11,0.1)' }}>
              {barcode.map((b, bi) => <div key={bi} style={{ flex:`${b.grow} 1 0`, minWidth:1, height:b.h, background:'#08090B', opacity:0.8 }}/>)}
            </div>
            <div className="lc-mono" style={{ flex:'none', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, padding:'0 clamp(14px,2.4vw,26px) 12px', fontSize:8.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
              <span>Sheet · {modalProduct.sku || '—'} · partner pricing confidential</span>
              <span>levamcorp.com</span>
            </div>
          </div>
        </div>
      )}

      {/* QUOTE PANEL */}
      {showQuote && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
          <div onClick={() => setShowQuote(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,9,11,0.5)' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 400, background: '#FFFFFF', boxShadow: '-4px 0 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            <div className="lc-mono" style={{ padding: '1.4rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#08090B' }}>
              <div>
                <h3 style={{ fontSize: 9.5, fontWeight: 700, letterSpacing:'0.2em', textTransform:'uppercase', color: '#F5F1E8', marginBottom: 4 }}>Your quote</h3>
                <div style={{ fontSize: 11, color: '#8A8780' }}>{cartCount} item{cartCount !== 1 ? 's' : ''} selected</div>
              </div>
              <button onClick={() => setShowQuote(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#8A8780', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#8A8780' }}>
                  <div style={{ fontSize: 36, marginBottom: 10, opacity:0.5 }}>🛒</div>
                  <p style={{ fontSize: 13, color: '#8A8780' }}>Add products to build your quote</p>
                </div>
              ) : cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(8,9,11,0.08)' }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0, background: '#F2EFE6', padding: 4 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, background: '#F2EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{categoryIcon(item.category)}</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#08090B', marginBottom: 2 }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <button onClick={() => setCart(c => ({ ...c, [item.id]: { ...item, qty: Math.max(item.moq||1, item.qty - 1) } }))}
                      style={{ width: 22, height: 22, border: '1px solid rgba(8,9,11,0.18)', background: '#F2EFE6', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#5C5A55', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <input
                      type="number"
                      value={item.qty}
                      min={item.moq || 1}
                      onChange={e => {
                        const val = parseInt(e.target.value) || item.moq || 1
                        setCart(c => ({ ...c, [item.id]: { ...item, qty: Math.max(item.moq||1, val) } }))
                      }}
                      style={{ width: 44, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#08090B', border: '1px solid rgba(8,9,11,0.18)', padding: '2px 0', fontFamily: 'inherit', MozAppearance: 'textfield' }}
                    />
                    <button onClick={() => setCart(c => ({ ...c, [item.id]: { ...item, qty: item.qty + 1 } }))}
                      style={{ width: 22, height: 22, border: '1px solid rgba(8,9,11,0.18)', background: '#F2EFE6', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#5C5A55', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    <span style={{ fontSize: 11, color: '#8A8780' }}>× ${item.price?.toLocaleString()}</span>
                  </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#08090B' }}>${(item.price * item.qty).toLocaleString()}</div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#BFBBAF', cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            {cartItems.length > 0 && (
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid rgba(8,9,11,0.1)', background: '#F2EFE6' }}>
                <div className="lc-display" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 400, color: '#08090B', marginBottom: '1.1rem' }}>
                  <span style={{ fontFamily:'inherit', fontSize:13, alignSelf:'center', color:'#5C5A55' }}>Estimated total</span><span>${cartTotal.toLocaleString()}</span>
                </div>
                <button onClick={() => { setShowQuote(false); setShowCheckout(true) }} className="lc-mono" style={{ width: '100%', padding: 14, display:'flex', alignItems:'center', justifyContent:'space-between', background: '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginBottom: 8 }}>
                  Continue to checkout <span>→</span>
                </button>
                <button onClick={() => setCart({})} className="lc-mono" style={{ width: '100%', padding: 9, background: '#F2EFE6', color: '#8A8780', fontSize: 10, letterSpacing:'0.08em', textTransform:'uppercase', border: '1px solid rgba(8,9,11,0.14)', cursor: 'pointer' }}>Clear quote</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,9,11,0.6)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', width: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>

            {orderSubmitted ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, background: 'rgba(18,183,106,0.1)', border:'1px solid rgba(18,183,106,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 26 }}>✅</div>
                <h2 className="lc-display" style={{ fontSize: 24, fontWeight: 400, letterSpacing:'-0.02em', color: '#08090B', marginBottom: '0.75rem' }}>Order submitted<span style={{ color:'#2F7DF6' }}>.</span></h2>
                <p style={{ fontSize: 14, color: '#5C5A55', lineHeight: 1.8, marginBottom: '1.25rem' }}>Your order has been received. Now go to <strong style={{ color: '#08090B' }}>Payments</strong> to upload your payment confirmation.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link href="/portal/payments" className="lc-mono" style={{ padding: '12px 24px', background: '#08090B', color: '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>Go to payments →</Link>
                  <button onClick={() => { setShowCheckout(false); setCart({}); setOrderSubmitted(false) }} className="lc-mono" style={{ padding: '12px 20px', background: '#F2EFE6', color: '#5C5A55', fontSize: 10.5, letterSpacing:'0.1em', textTransform:'uppercase', border: '1px solid rgba(8,9,11,0.12)', cursor: 'pointer' }}>Back to catalog</button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="lc-mono" style={{ background: '#08090B', padding: '1.4rem 1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6F6D67', marginBottom: 5 }}>Checkout</div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, letterSpacing:'0.02em', color: '#F5F1E8' }}>Complete your order</h2>
                  </div>
                  <button onClick={() => setShowCheckout(false)} style={{ background: 'rgba(245,241,232,0.1)', border: 'none', color: '#8A8780', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>×</button>
                </div>

                {/* Order summary */}
                <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(8,9,11,0.1)', background: '#F2EFE6' }}>
                  <div className="lc-mono" style={{ fontSize: 9.5, fontWeight: 700, color: '#5C5A55', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Order summary</div>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 }}>
                      <span style={{ color: '#5C5A55' }}>{item.name} × {item.qty}</span>
                      <span style={{ fontWeight: 600, color: '#08090B' }}>${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  {/* Prep center fees */}
                  {shippingMethod === 'prep_center' && cartItems.some(i => i.prep_fee) && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(8,9,11,0.08)' }}>
                      <div className="lc-mono" style={{ fontSize: 9, color: '#8A8780', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>Prep center fees</div>
                      {cartItems.filter(i => i.prep_fee).map(item => (
                        <div key={item.id + '_prep'} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}>
                          <span style={{ color: '#8A8780' }}>{item.name} prep ({item.qty} × ${item.prep_fee?.toFixed(2)})</span>
                          <span style={{ fontWeight: 600, color: '#B98A54' }}>${(item.prep_fee * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, fontWeight: 700 }}>
                        <span style={{ color: '#5C5A55' }}>Total prep fees</span>
                        <span style={{ color: '#B98A54' }}>${cartItems.filter(i=>i.prep_fee).reduce((s,i)=>s+(i.prep_fee*i.qty),0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '2px solid #08090B', fontSize: 17, fontWeight: 800, color: '#08090B' }}>
                    <span>Total</span>
                    <span style={{ color: '#2F7DF6' }}>
                      ${(cartTotal + (shippingMethod === 'prep_center' ? cartItems.filter(i=>i.prep_fee).reduce((s,i)=>s+(i.prep_fee*i.qty),0) : 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(8,9,11,0.1)' }}>
                  <div className="lc-mono" style={{ fontSize: 10, fontWeight: 700, color: '#5C5A55', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Payment method *</div>
                  {[
                    { value: 'credit_card', label: 'Credit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
                    { value: 'debit_card', label: 'Debit Card', icon: '💳', desc: 'Bank debit card' },
                    { value: 'ach', label: 'ACH Bank Transfer', icon: '🏦', desc: '1–3 business days · No fees' },
                    { value: 'wire', label: 'Wire Transfer', icon: '⚡', desc: 'Same day · Bank fees may apply' },
                  ].map(method => (
                    <div key={method.value} onClick={() => setPaymentMethod(method.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, border: `1.5px solid ${paymentMethod === method.value ? '#2F7DF6' : 'rgba(8,9,11,0.1)'}`, background: paymentMethod === method.value ? 'rgba(47,125,246,0.05)' : '#FFFFFF', cursor: 'pointer' }}>
                      <span style={{ fontSize: 18 }}>{method.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#08090B' }}>{method.label}</div>
                        <div style={{ fontSize: 11, color: '#8A8780' }}>{method.desc}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === method.value ? '#2F7DF6' : '#D8D4C8'}`, background: paymentMethod === method.value ? '#2F7DF6' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {paymentMethod === method.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping method */}
                <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(8,9,11,0.1)' }}>
                  <div className="lc-mono" style={{ fontSize: 10, fontWeight: 700, color: '#5C5A55', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Shipping method *</div>
                  {[
                    { value: 'pickup', label: 'Pickup — Doral, FL', icon: '🏭', desc: '6315 NW 99th Ave, Doral, FL 33178 · Free', tag: 'FREE', tagColor: '#12B76A' },
                    { value: 'prep_center', label: 'Prep Center Delivery', icon: '📦', desc: 'We ship from our warehouse to your prep center · By quote', tag: 'By quote', tagColor: '#B98A54' },
                    { value: 'shipping', label: 'Standard Shipping', icon: '🚚', desc: 'Domestic shipping to your address · By quote', tag: 'By quote', tagColor: '#B98A54' },
                    { value: 'freight', label: 'Freight / LTL', icon: '🚛', desc: 'Large palletized orders · By quote', tag: 'By quote', tagColor: '#B98A54' },
                  ].map(method => (
                    <div key={method.value} onClick={() => { setShippingMethod(method.value); setPrepAddress('') }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, border: `1.5px solid ${shippingMethod === method.value ? '#2F7DF6' : 'rgba(8,9,11,0.1)'}`, background: shippingMethod === method.value ? 'rgba(47,125,246,0.05)' : '#FFFFFF', cursor: 'pointer' }}>
                      <span style={{ fontSize: 18 }}>{method.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#08090B' }}>{method.label}</div>
                          <span className="lc-mono" style={{ fontSize: 8.5, padding: '2px 7px', background: `${method.tagColor}18`, color: method.tagColor, fontWeight: 700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{method.tag}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#8A8780' }}>{method.desc}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${shippingMethod === method.value ? '#2F7DF6' : '#D8D4C8'}`, background: shippingMethod === method.value ? '#2F7DF6' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {shippingMethod === method.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  ))}

                  {/* Pickup — show our address */}
                  {shippingMethod === 'pickup' && (
                    <div style={{ padding: '10px 14px', background: 'rgba(18,183,106,0.06)', border: '1px solid rgba(18,183,106,0.25)', marginTop: 4 }}>
                      <div className="lc-mono" style={{ fontSize: 9.5, fontWeight: 700, color: '#0E9A5A', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom: 4 }}>📍 Pickup address</div>
                      <div style={{ fontSize: 12, color: '#5C5A55', lineHeight: 1.7 }}>
                        Levam Corp Distributors<br />
                        6315 NW 99th Ave<br />
                        Doral, FL 33178<br />
                        <span style={{ color: '#8A8780', fontSize: 11 }}>Mon–Fri · 9:00 AM – 6:00 PM ET</span>
                      </div>
                    </div>
                  )}

                  {/* Shipping/Freight — ask for address */}
                  {(shippingMethod === 'shipping' || shippingMethod === 'freight') && (
                    <div style={{ marginTop: 6 }}>
                      <input value={prepAddress} onChange={e => setPrepAddress(e.target.value)}
                        placeholder="Enter your shipping address…"
                        style={{ width: '100%', border: '1.5px solid rgba(8,9,11,0.16)', fontSize: 12, padding: '9px 12px', outline: 'none', fontFamily: 'inherit', color: '#08090B', boxSizing: 'border-box' }} />
                      <div style={{ fontSize: 10, color: '#8A8780', marginTop: 4 }}>Shipping cost will be quoted separately and included in your payment instructions.</div>
                    </div>
                  )}
                </div>

                {/* Info box */}
                {paymentMethod && (
                  <div style={{ padding: '0.85rem 1.75rem', background: 'rgba(47,125,246,0.05)', borderBottom: '1px solid rgba(47,125,246,0.14)' }}>
                    <div style={{ fontSize: 12, color: '#5C5A55', lineHeight: 1.7 }}>
                      📋 After submitting, go to <strong style={{ color:'#08090B' }}>Payments</strong> to upload your payment confirmation. Our team will process your order once payment is verified.
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div style={{ padding: '1.25rem 1.75rem' }}>
                  <button onClick={submitOrder} disabled={submitting || !paymentMethod || !shippingMethod} className="lc-mono" style={{ width: '100%', padding: 15, display:'flex', alignItems:'center', justifyContent:'space-between', background: (!paymentMethod || !shippingMethod) ? '#EDEAE1' : submitting ? '#8A8780' : '#08090B', color: (!paymentMethod || !shippingMethod) ? '#BFBBAF' : '#F2EFE6', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: (!paymentMethod || !shippingMethod) ? 'not-allowed' : 'pointer' }}>
                    <span>{submitting ? 'Submitting…' : `Submit order — $${cartTotal.toLocaleString()}`}</span>
                    {!submitting && <span>→</span>}
                  </button>
                  <p style={{ fontSize: 11, color: '#8A8780', textAlign: 'center', marginTop: 10 }}>You&rsquo;ll upload payment proof in the Payments section</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
