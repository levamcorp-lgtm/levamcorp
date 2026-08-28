'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'
import { trackPageView, trackProductView, trackProductClick, trackSearch } from '../../../lib/analytics'

const NAV_LINKS = [['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['Orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']]

const CATEGORY_TABS = [['all','All products'],['tvs','TVs'],['electronics','Electronics'],['small appliances','Small Appliances'],['kitchen appliances','Kitchen'],['gaming','Gaming'],['audio & speakers','Audio'],['computers & laptops','Computers']]

function PortalNav({ user, onLogout, onDownload, cartCount, onQuote }) {
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
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
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
  const [showQuote, setShowQuote] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [shippingMethod, setShippingMethod] = useState('')
  const [prepAddress, setPrepAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invoiceNum] = useState(`LC-${Math.floor(20000 + Math.random() * 9999)}`)

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
    if (category !== 'all') list = list.filter(p => p.category === category)
    if (search.trim().length > 2) trackSearch(search.trim(), list.length)
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    setFiltered(list)
  }, [search, category, products])

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
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:12, fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>
            <span style={{ width:6, height:6, background:'#2F7DF6', display:'inline-block' }}/>
            Partner pricing · Catalog
          </div>
          <div style={{ height:1, background:'rgba(245,241,232,0.16)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap:'wrap', gap:16, padding:'clamp(18px,2.6vh,26px) 0 clamp(18px,2.6vh,22px)' }}>
            <div>
              <h1 className="lc-display" style={{ fontSize:'clamp(26px,3.2vw,36px)', fontWeight:400, letterSpacing:'-0.03em', margin:'0 0 6px', color:'#F5F2E9' }}>Product catalog<span style={{ color:'#2F7DF6' }}>.</span></h1>
              <p style={{ fontSize: 13, color: '#9A968E', margin:0 }}>Showing {filtered.length} products · Approved wholesale pricing</p>
            </div>
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or SKU…"
                className="lc-mono" style={{ background:'transparent', border:'1px solid rgba(245,241,232,0.25)', color:'#F5F1E8', fontSize:12, padding:'10px 14px 10px 34px', outline:'none', width:240 }} />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#6F6D67' }}>🔍</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, flexWrap:'wrap' }}>
            {CATEGORY_TABS.map(([val, label]) => (
              <button key={val} onClick={() => setCategory(val)} className="lc-mono" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing:'0.08em', textTransform:'uppercase', padding: '10px 18px', cursor: 'pointer', border: 'none', background: 'transparent', color: category === val ? '#F5F1E8' : '#6F6D67', borderBottom: `2px solid ${category === val ? '#2F7DF6' : 'transparent'}` }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div style={{ padding: '2rem', maxWidth: 1240, margin: '0 auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#8A8780' }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity:0.5 }}>🔍</div>
            <div className="lc-mono" style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', fontWeight: 700 }}>No products found</div>
          </div>
        ) : (() => {
          const topPicks = filtered.filter(p => p.is_top_pick)
          const regular = filtered.filter(p => !p.is_top_pick)
          return (
            <>
              {/* TOP PICKS */}
              {topPicks.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.1rem', padding: '12px 18px', background: '#08090B', border:'1px solid rgba(8,9,11,0.1)', borderLeft:'3px solid #B98A54' }}>
                    <div>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: '#F5F1E8', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Top picks</div>
                      <div style={{ fontSize: 9.5, color: '#8A8780', marginTop:2 }}>Handpicked by Levam Corp — our best sellers right now</div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 9.5, color: '#6F6D67', fontWeight: 600, letterSpacing:'0.08em', textTransform:'uppercase' }}>{topPicks.length} featured</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background:'rgba(8,9,11,0.1)', border:'1px solid rgba(8,9,11,0.1)' }}>
                    {topPicks.map(product => (
                      <ProductCard key={product.id} product={product} inCart={!!cart[product.id]} onAdd={(qty, variation) => addToCart(product, qty, variation)} categoryIcon={categoryIcon} isHovered={hoveredId === product.id} onHover={setHoveredId} />
                    ))}
                  </div>
                </div>
              )}

              {/* REGULAR PRODUCTS */}
              {regular.length > 0 && (
                <div>
                  {topPicks.length > 0 && (
                    <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', fontSize: 9.5, color: '#6F6D67', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>
                      <div style={{ height: 1, flex: 1, background: 'rgba(8,9,11,0.12)' }} />
                      All products
                      <div style={{ height: 1, flex: 1, background: 'rgba(8,9,11,0.12)' }} />
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background:'rgba(8,9,11,0.1)', border:'1px solid rgba(8,9,11,0.1)' }}>
                    {regular.map(product => (
                      <ProductCard key={product.id} product={product} inCart={!!cart[product.id]} onAdd={(qty, variation) => addToCart(product, qty, variation)} categoryIcon={categoryIcon} isHovered={hoveredId === product.id} onHover={setHoveredId} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )
        })()}
      </div>

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

function ProductCard({ product, inCart, onAdd, categoryIcon, isHovered, onHover }) {
  const [qty, setQty] = useState(product.moq || 1)
  const [added, setAdded] = useState(inCart)
  const [selVar, setSelVar] = useState(null)
  const hasVariations = product.variations?.length > 0
  const activeVar = selVar !== null ? product.variations?.[selVar] : null
  const displayImage = activeVar?.image_url || product.image_url
  const displayPrice = product.price + (activeVar?.price_diff || 0)
  const displayStock = activeVar?.stock != null ? activeVar.stock : (product.stock || 0)
  const outOfStock = displayStock === 0
  const moq = product.moq || 1
  const handleAdd = () => { if (outOfStock) return; onAdd(qty, activeVar); setAdded(true) }

  return (
    <div onMouseEnter={() => onHover(product.id)} onMouseLeave={() => onHover(null)}
      style={{ background: '#FFFFFF', boxShadow: isHovered ? 'inset 0 0 0 1.5px #2F7DF6' : 'none', transition: 'box-shadow 0.15s ease', display: 'flex', flexDirection: 'column' }}>

      {/* IMAGE */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '80%', background: '#F2EFE6' }}>
        {displayImage
          ? <img src={displayImage} alt={activeVar?.name || product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 16 }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, color: '#D8D4C8' }}>◻</div>
        }
        <div style={{ position: 'absolute', left: 8, top: 8, pointerEvents:'none', width: 10, height: 10, borderTop:'1px solid rgba(8,9,11,0.45)', borderLeft:'1px solid rgba(8,9,11,0.45)' }}/>
        <div style={{ position: 'absolute', right: 8, bottom: 8, pointerEvents:'none', width: 10, height: 10, borderBottom:'1px solid rgba(8,9,11,0.45)', borderRight:'1px solid rgba(8,9,11,0.45)' }}/>
        {/* Badges */}
        <div className="lc-mono" style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {product.is_top_pick && <span style={{ fontSize: 8.5, padding: '3px 8px', background: '#08090B', color: '#B98A54', fontWeight: 700, letterSpacing: '0.08em' }}>TOP PICK</span>}
          {product.condition && product.condition !== 'New' && <span style={{ fontSize: 8.5, padding: '3px 8px', background: '#08090B', color: '#F2EFE6', fontWeight: 700, letterSpacing:'0.06em' }}>{product.condition.toUpperCase()}</span>}
        </div>
        {/* Stock badge */}
        <div className="lc-mono" style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{ fontSize: 8.5, padding: '4px 9px', letterSpacing:'0.04em', background: outOfStock ? 'rgba(245,241,232,0.9)' : displayStock <= 5 ? 'rgba(245,241,232,0.9)' : 'rgba(245,241,232,0.9)', color: outOfStock ? '#8A8780' : displayStock <= 5 ? '#9A6A1E' : '#0E9A5A', fontWeight: 700 }}>
            {outOfStock ? 'Out of stock' : displayStock <= 5 ? `Only ${displayStock} left` : `${displayStock} in stock`}
          </span>
        </div>
      </div>

      {/* MAIN INFO */}
      <div style={{ padding: '14px 14px 0', flex: 1 }}>
        {/* Brand */}
        {product.brand && <div className="lc-mono" style={{ fontSize: 9, fontWeight: 700, color: '#2F7DF6', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>{product.brand}</div>}
        {/* Name */}
        <div style={{ fontSize: 13, fontWeight: 700, color: '#08090B', marginBottom: 10, lineHeight: 1.35 }}>{product.name}</div>

        {/* COLOR VARIATIONS */}
        {hasVariations && (
          <div style={{ marginBottom: 12 }}>
            <div className="lc-mono" style={{ fontSize: 8.5, color: '#8A8780', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 7 }}>Color</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {product.variations.map((v, i) => (
                <button key={i} onClick={() => setSelVar(selVar === i ? null : i)}
                  title={v.color || v.name}
                  style={{ width: 24, height: 24, borderRadius: '50%', background: v.hex || '#888', border: `2px solid ${selVar === i ? '#08090B' : 'rgba(8,9,11,0.15)'}`, outline: selVar === i ? '1.5px solid #08090B' : 'none', outlineOffset: 2, cursor: 'pointer', padding: 0 }}/>
              ))}
            </div>
            {activeVar && (
              <div style={{ marginTop: 6, fontSize: 10, color: '#5C5A55', fontWeight: 500 }}>
                {activeVar.color || activeVar.name}
                {activeVar.price_diff !== 0 && <span style={{ color: activeVar.price_diff > 0 ? '#E74C3C' : '#0E9A5A', fontWeight: 700, marginLeft: 4 }}>{activeVar.price_diff > 0 ? '+' : ''}${activeVar.price_diff}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRICE + STOCK + MOQ */}
      <div style={{ padding: '0 14px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
          <span className="lc-display" style={{ fontSize: 25, fontWeight: 700, color: '#08090B', letterSpacing: '-0.02em' }}>${displayPrice?.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: '#8A8780' }}>/ unit</span>
          {product.delivery_days && <span className="lc-mono" style={{ marginLeft: 'auto', fontSize: 9.5, color: '#8A8780' }}>{product.delivery_days}d delivery</span>}
        </div>

        {/* Stock + MOQ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background:'rgba(8,9,11,0.1)', marginBottom: 10, border:'1px solid rgba(8,9,11,0.1)' }}>
          {/* STOCK */}
          <div style={{ padding: '10px 12px', background: '#F2EFE6' }}>
            <div className="lc-mono" style={{ fontSize: 8.5, color: outOfStock ? '#8A8780' : displayStock <= 5 ? '#9A6A1E' : '#0E9A5A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 700 }}>
              {outOfStock ? 'Out of stock' : displayStock <= 5 ? 'Low stock' : 'In stock'}
            </div>
            <div className="lc-display" style={{ fontSize: 19, fontWeight: 700, color: outOfStock ? '#BFBBAF' : displayStock <= 5 ? '#9A6A1E' : '#0E9A5A', lineHeight: 1 }}>
              {outOfStock ? '0' : displayStock}
            </div>
            <div style={{ fontSize: 9, color: '#8A8780', marginTop: 2 }}>units available</div>
          </div>
          {/* MOQ */}
          <div style={{ padding: '10px 12px', background: '#F2EFE6' }}>
            <div className="lc-mono" style={{ fontSize: 8.5, color: '#2F7DF6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 700 }}>Min. order</div>
            <div className="lc-display" style={{ fontSize: 19, fontWeight: 700, color: '#2F7DF6', lineHeight: 1 }}>{moq}</div>
            <div style={{ fontSize: 9, color: '#8A8780', marginTop: 2 }}>units minimum</div>
          </div>
        </div>

        {/* Description preview */}
        {product.description && (
          <div style={{ fontSize: 11, color: '#8A8780', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </div>
        )}

        {/* Marketplace links */}
        {(product.amazon_url || product.walmart_url) && (
          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            {product.amazon_url && <a href={product.amazon_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '5px 0', background: '#FF9900', textDecoration: 'none', textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>Amazon</a>}
            {product.walmart_url && <a href={product.walmart_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '5px 0', background: '#0071CE', textDecoration: 'none', textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>Walmart</a>}
          </div>
        )}
      </div>

      {/* PREP CENTER NOTE */}
      {product.prep_fee && (
        <div style={{ margin: '0 14px 10px', padding: '10px 12px', background: '#F2EFE6', border: '1px solid rgba(8,9,11,0.1)' }}>
          <div className="lc-mono" style={{ fontSize: 8.5, color: '#6D6A64', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>Prep center service</div>
          <div style={{ fontSize: 11, color: '#3F3D39', lineHeight: 1.6 }}>
            If you select <strong>Prep Center</strong> as your shipping method, labeling and prep services are available for this product.
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#08090B' }}>${product.prep_fee.toFixed(2)}</span>
            <span style={{ fontSize: 10, color: '#8A8780' }}>per unit · includes labeling & prep</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 10, color: '#8A8780' }}>
            For {qty} units: <strong style={{ color: '#3F3D39' }}>${(product.prep_fee * qty).toFixed(2)}</strong> additional
          </div>
        </div>
      )}

      {/* ADD TO QUOTE — fixed at bottom */}
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#F2EFE6', border: '1px solid rgba(8,9,11,0.14)', overflow: 'hidden' }}>
            <button onClick={() => setQty(q => Math.max(moq, q - 1))} disabled={outOfStock}
              style={{ width: 30, height: 34, border: 'none', background: 'transparent', cursor: outOfStock ? 'not-allowed' : 'pointer', fontSize: 15, color: '#5C5A55', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
            <input
              type="number"
              value={qty}
              min={moq}
              max={displayStock || 9999}
              onChange={e => {
                const val = parseInt(e.target.value) || moq
                setQty(Math.max(moq, Math.min(displayStock || 9999, val)))
              }}
              onBlur={e => {
                const val = parseInt(e.target.value) || moq
                setQty(Math.max(moq, val))
              }}
              disabled={outOfStock}
              className="lc-mono" style={{ width: 44, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#08090B', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', MozAppearance: 'textfield' }}
            />
            <button onClick={() => setQty(q => Math.min(displayStock || 9999, q + 1))} disabled={outOfStock}
              style={{ width: 30, height: 34, border: 'none', background: 'transparent', cursor: outOfStock ? 'not-allowed' : 'pointer', fontSize: 15, color: '#5C5A55', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          <button onClick={handleAdd} disabled={outOfStock} className="cat-add-btn lc-mono"
            style={{ flex: 1, padding: '10px 0', background: outOfStock ? '#EDEAE1' : added ? '#0E9A5A' : '#08090B', color: outOfStock ? '#BFBBAF' : '#F2EFE6', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: outOfStock ? 'not-allowed' : 'pointer', transition: 'background 0.15s, color 0.15s' }}>
            {outOfStock ? 'Out of stock' : added ? '✓ Added' : 'Add to quote'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#8A8780', textAlign: 'center' }}>
          {!outOfStock && `Total: $${(displayPrice * qty).toLocaleString()} · ${qty} units`}
        </div>
      </div>
    </div>
  )
}
