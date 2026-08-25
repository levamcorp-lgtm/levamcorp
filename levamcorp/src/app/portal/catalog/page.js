'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'
import { trackPageView, trackProductView, trackProductClick, trackSearch } from '../../../lib/analytics'

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
const addToCart = (product, qty) => {
  setCart(c => ({ ...c, [product.id]: { ...product, qty: parseInt(qty) || product.moq || 1 } }))
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
      .join('
')

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

      if (!error && order) {
        await supabase.from('order_items').insert(
          cartItems.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.name,
            product_sku: item.sku,
            quantity: item.qty,
            unit_price: item.price,
          }))
        )

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
      }
      setOrderSubmitted(true)
    } catch (e) { alert('Error submitting order. Please try again.') }
    setSubmitting(false)
  }

  const categoryIcon = (cat) => cat === 'electronics' ? '📺' : cat === 'home' ? '🏠' : '🍳'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 16px' }}>
          <div style={{ position: 'absolute', left: 10, top: 0, width: 3, height: 38, background: '#333' }} />
          <div style={{ position: 'absolute', left: 10, bottom: 0, width: 26, height: 3, background: '#333' }} />
          <div style={{ position: 'absolute', left: 16, bottom: 10, width: 16, height: 3, background: '#2d7dd2' }} />
        </div>
        <div style={{ fontSize: 12, color: '#444', letterSpacing: '0.1em' }}>Loading catalog...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      <style>{`input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type=number] { -moz-appearance: textfield; }`}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: 32, height: 32 }}>
              <div style={{ position: 'absolute', left: 7, top: 0, width: 2, height: 25, background: '#444' }} />
              <div style={{ position: 'absolute', left: 7, bottom: 0, width: 18, height: 2, background: '#444' }} />
              <div style={{ position: 'absolute', left: 11, bottom: 7, width: 11, height: 2.5, background: '#2d7dd2' }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase' }}>Levam</div>
              <div style={{ fontSize: 8, letterSpacing: '0.28em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Partner Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.08)', paddingLeft: 20 }}>
            {[['Dashboard','/portal/dashboard'],['Catalog','/portal/catalog'],['My orders','/portal/orders'],['Invoices','/portal/invoices'],['Payments','/portal/payments']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 13, fontWeight: label === 'Catalog' ? 700 : 500, color: label === 'Catalog' ? '#fff' : 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '6px 16px', borderBottom: label === 'Catalog' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={downloadExcel}
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'rgba(255,255,255,0.6)', padding:'7px 14px', border:'0.5px solid rgba(255,255,255,0.15)', background:'transparent', borderRadius:2, cursor:'pointer', fontWeight:600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download catalog
          </button>
          <button onClick={() => setShowQuote(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: cartCount > 0 ? '#fff' : 'rgba(255,255,255,0.5)', padding: '7px 16px', border: `0.5px solid ${cartCount > 0 ? '#2d7dd2' : 'rgba(255,255,255,0.15)'}`, background: cartCount > 0 ? '#2d7dd2' : 'transparent', borderRadius: 2, cursor: 'pointer', fontWeight: 600 }}>
            🧾 Quote {cartCount > 0 && <span style={{ background: '#fff', color: '#2d7dd2', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
          </button>
          <button onClick={handleLogout} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      {/* CATALOG HEADER */}
      <div style={{ background: '#111', padding: '2rem 2rem 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 6 }}>Partner pricing</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Product Catalog</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Showing {filtered.length} products · Approved wholesale pricing</p>
            </div>
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or SKU..."
                style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, padding: '9px 14px 9px 36px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', width: 240 }} />
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#555' }}>🔍</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            {[['all', 'All products'], ['tvs', 'TVs'], ['electronics', 'Electronics'], ['small appliances', 'Small Appliances'], ['kitchen appliances', 'Kitchen'], ['gaming', 'Gaming'], ['audio & speakers', 'Audio'], ['computers & laptops', 'Computers']].map(([val, label]) => (
              <button key={val} onClick={() => setCategory(val)} style={{ fontSize: 12, fontWeight: 600, padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'transparent', color: category === val ? '#fff' : 'rgba(255,255,255,0.4)', borderBottom: `2px solid ${category === val ? '#2d7dd2' : 'transparent'}` }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#ccc' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#aaa' }}>No products found</div>
          </div>
        ) : (() => {
          const topPicks = filtered.filter(p => p.is_top_pick)
          const regular = filtered.filter(p => !p.is_top_pick)
          return (
            <>
              {/* TOP PICKS */}
              {topPicks.length > 0 && (
                <div style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', padding: '10px 16px', background: 'linear-gradient(135deg, #1a1400, #2a1f00)', border: '1px solid rgba(255,180,0,0.3)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>⭐</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#FFD700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Top Picks</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,215,0,0.6)' }}>Handpicked by Levam Corp — our best sellers right now</div>
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,215,0,0.5)', fontWeight: 600 }}>{topPicks.length} featured product{topPicks.length > 1 ? 's' : ''}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, padding: '4px' }}>
                    {topPicks.map(product => (
                      <div key={product.id} style={{ filter: 'drop-shadow(0 4px 12px rgba(255,215,0,0.12))' }}>
                        <ProductCard product={product} inCart={!!cart[product.id]} onAdd={(qty) => addToCart(product, qty)} categoryIcon={categoryIcon} isHovered={hoveredId === product.id} onHover={setHoveredId} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REGULAR PRODUCTS */}
              {regular.length > 0 && (
                <div>
                  {topPicks.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                      <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.08)' }} />
                      <div style={{ fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>All products</div>
                      <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.08)' }} />
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                    {regular.map(product => (
                      <ProductCard key={product.id} product={product} inCart={!!cart[product.id]} onAdd={(qty) => addToCart(product, qty)} categoryIcon={categoryIcon} isHovered={hoveredId === product.id} onHover={setHoveredId} />
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
          <div onClick={() => setShowQuote(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 400, background: '#fff', boxShadow: '-4px 0 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>🧾 Your quote</h3>
                <div style={{ fontSize: 11, color: '#555' }}>{cartCount} item{cartCount !== 1 ? 's' : ''} selected</div>
              </div>
              <button onClick={() => setShowQuote(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#555', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#ccc' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🛒</div>
                  <p style={{ fontSize: 13, color: '#aaa' }}>Add products to build your quote</p>
                </div>
              ) : cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 3, flexShrink: 0, background: '#f7f8fa', padding: 4 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, background: '#f7f8fa', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{categoryIcon(item.category)}</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#222', marginBottom: 2 }}>{item.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <button onClick={() => setCart(c => ({ ...c, [item.id]: { ...item, qty: Math.max(item.moq||1, item.qty - 1) } }))}
                      style={{ width: 22, height: 22, border: '1px solid #ddd', borderRadius: 4, background: '#f7f8fa', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <input
                      type="number"
                      value={item.qty}
                      min={item.moq || 1}
                      onChange={e => {
                        const val = parseInt(e.target.value) || item.moq || 1
                        setCart(c => ({ ...c, [item.id]: { ...item, qty: Math.max(item.moq||1, val) } }))
                      }}
                      style={{ width: 44, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#111', border: '1px solid #ddd', borderRadius: 4, padding: '2px 0', fontFamily: 'inherit', MozAppearance: 'textfield' }}
                    />
                    <button onClick={() => setCart(c => ({ ...c, [item.id]: { ...item, qty: item.qty + 1 } }))}
                      style={{ width: 22, height: 22, border: '1px solid #ddd', borderRadius: 4, background: '#f7f8fa', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    <span style={{ fontSize: 11, color: '#aaa' }}>× ${item.price?.toLocaleString()}</span>
                  </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>${(item.price * item.qty).toLocaleString()}</div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
            {cartItems.length > 0 && (
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#111', marginBottom: '1.25rem' }}>
                  <span>Estimated total</span><span>${cartTotal.toLocaleString()}</span>
                </div>
                <button onClick={() => { setShowQuote(false); setShowCheckout(true) }} style={{ width: '100%', padding: 13, background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3, marginBottom: 8, boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
                  Continue to checkout →
                </button>
                <button onClick={() => setCart({})} style={{ width: '100%', padding: 8, background: '#fff', color: '#aaa', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 3 }}>Clear quote</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', width: 560, maxHeight: '92vh', overflowY: 'auto', borderRadius: 8, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>

            {orderSubmitted ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, background: 'rgba(42,125,79,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 32 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: '0.75rem' }}>Order submitted!</h2>
                <p style={{ fontSize: 14, color: '#888', lineHeight: 1.8, marginBottom: '1rem' }}>Your order has been received. Now go to <strong style={{ color: '#333' }}>Payments</strong> to upload your payment confirmation.</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <Link href="/portal/payments" style={{ padding: '11px 24px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none' }}>Go to payments →</Link>
                  <button onClick={() => { setShowCheckout(false); setCart({}); setOrderSubmitted(false) }} style={{ padding: '11px 20px', background: '#f7f8fa', color: '#666', fontSize: 12, border: '0.5px solid rgba(0,0,0,0.1)', cursor: 'pointer', borderRadius: 3 }}>Back to catalog</button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ background: '#0d0d0d', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 4 }}>Checkout</div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Complete your order</h2>
                  </div>
                  <button onClick={() => setShowCheckout(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#888', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>×</button>
                </div>

                {/* Order summary */}
                <div style={{ padding: '1.25rem 2rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Order summary</div>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 }}>
                      <span style={{ color: '#555' }}>{item.name} × {item.qty}</span>
                      <span style={{ fontWeight: 600, color: '#111' }}>${(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  {/* Prep center fees */}
                  {shippingMethod === 'prep_center' && cartItems.some(i => i.prep_fee) && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>Prep center fees</div>
                      {cartItems.filter(i => i.prep_fee).map(item => (
                        <div key={item.id + '_prep'} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}>
                          <span style={{ color: '#888' }}>{item.name} prep ({item.qty} × ${item.prep_fee?.toFixed(2)})</span>
                          <span style={{ fontWeight: 600, color: '#854f0b' }}>${(item.prep_fee * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, fontWeight: 700 }}>
                        <span style={{ color: '#555' }}>Total prep fees</span>
                        <span style={{ color: '#854f0b' }}>${cartItems.filter(i=>i.prep_fee).reduce((s,i)=>s+(i.prep_fee*i.qty),0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: 16, fontWeight: 800, color: '#111' }}>
                    <span>Total</span>
                    <span style={{ color: '#2d7dd2' }}>
                      ${(cartTotal + (shippingMethod === 'prep_center' ? cartItems.filter(i=>i.prep_fee).reduce((s,i)=>s+(i.prep_fee*i.qty),0) : 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ padding: '1.25rem 2rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Payment method *</div>
                  {[
                    { value: 'credit_card', label: 'Credit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
                    { value: 'debit_card', label: 'Debit Card', icon: '💳', desc: 'Bank debit card' },
                    { value: 'ach', label: 'ACH Bank Transfer', icon: '🏦', desc: '1–3 business days · No fees' },
                    { value: 'wire', label: 'Wire Transfer', icon: '⚡', desc: 'Same day · Bank fees may apply' },
                  ].map(method => (
                    <div key={method.value} onClick={() => setPaymentMethod(method.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 4, border: `1.5px solid ${paymentMethod === method.value ? '#2d7dd2' : 'rgba(0,0,0,0.08)'}`, background: paymentMethod === method.value ? 'rgba(45,125,210,0.05)' : '#fff', cursor: 'pointer' }}>
                      <span style={{ fontSize: 18 }}>{method.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{method.label}</div>
                        <div style={{ fontSize: 11, color: '#aaa' }}>{method.desc}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${paymentMethod === method.value ? '#2d7dd2' : '#ddd'}`, background: paymentMethod === method.value ? '#2d7dd2' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {paymentMethod === method.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping method */}
                <div style={{ padding: '1.25rem 2rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Shipping method *</div>
                  {[
                    { value: 'pickup', label: 'Pickup — Doral, FL', icon: '🏭', desc: '6315 NW 99th Ave, Doral, FL 33178 · Free', tag: 'FREE', tagColor: '#2a7d4f' },
                    { value: 'prep_center', label: 'Prep Center Delivery', icon: '📦', desc: 'We ship from our warehouse to your prep center · By quote', tag: 'By quote', tagColor: '#854f0b' },
                    { value: 'shipping', label: 'Standard Shipping', icon: '🚚', desc: 'Domestic shipping to your address · By quote', tag: 'By quote', tagColor: '#854f0b' },
                    { value: 'freight', label: 'Freight / LTL', icon: '🚛', desc: 'Large palletized orders · By quote', tag: 'By quote', tagColor: '#854f0b' },
                  ].map(method => (
                    <div key={method.value} onClick={() => { setShippingMethod(method.value); setPrepAddress('') }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 4, border: `1.5px solid ${shippingMethod === method.value ? '#2d7dd2' : 'rgba(0,0,0,0.08)'}`, background: shippingMethod === method.value ? 'rgba(45,125,210,0.05)' : '#fff', cursor: 'pointer' }}>
                      <span style={{ fontSize: 18 }}>{method.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{method.label}</div>
                          <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: `${method.tagColor}15`, color: method.tagColor, fontWeight: 700 }}>{method.tag}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#aaa' }}>{method.desc}</div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${shippingMethod === method.value ? '#2d7dd2' : '#ddd'}`, background: shippingMethod === method.value ? '#2d7dd2' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {shippingMethod === method.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  ))}

                  {/* Pickup — show our address */}
                  {shippingMethod === 'pickup' && (
                    <div style={{ padding: '10px 14px', background: 'rgba(42,125,79,0.06)', border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 3, marginTop: 4 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#2a7d4f', marginBottom: 4 }}>📍 Pickup address</div>
                      <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                        Levam Corp Distributors<br />
                        6315 NW 99th Ave<br />
                        Doral, FL 33178<br />
                        <span style={{ color: '#888', fontSize: 11 }}>Mon–Fri · 9:00 AM – 6:00 PM ET</span>
                      </div>
                    </div>
                  )}

                  {/* Shipping/Freight — ask for address */}
                  {(shippingMethod === 'shipping' || shippingMethod === 'freight') && (
                    <div style={{ marginTop: 6 }}>
                      <input value={prepAddress} onChange={e => setPrepAddress(e.target.value)}
                        placeholder="Enter your shipping address..."
                        style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 3, fontSize: 12, padding: '9px 12px', outline: 'none', fontFamily: 'inherit', color: '#333', boxSizing: 'border-box' }} />
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>Shipping cost will be quoted separately and included in your payment instructions.</div>
                    </div>
                  )}
                </div>

                {/* Info box */}
                {paymentMethod && (
                  <div style={{ padding: '0.75rem 2rem', background: 'rgba(45,125,210,0.04)', borderBottom: '0.5px solid rgba(45,125,210,0.1)' }}>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7 }}>
                      📋 After submitting, go to <strong>Payments</strong> to upload your payment confirmation. Our team will process your order once payment is verified.
                    </div>
                  </div>
                )}

                {/* Submit */}
                <div style={{ padding: '1.25rem 2rem' }}>
                  <button onClick={submitOrder} disabled={submitting || !paymentMethod || !shippingMethod} style={{ width: '100%', padding: 14, background: (!paymentMethod || !shippingMethod) ? '#e0e0e0' : submitting ? '#aaa' : '#2d7dd2', color: (!paymentMethod || !shippingMethod) ? '#aaa' : '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: (!paymentMethod || !shippingMethod) ? 'not-allowed' : 'pointer', borderRadius: 4, boxShadow: (paymentMethod && shippingMethod) ? '0 4px 16px rgba(45,125,210,0.3)' : 'none' }}>
                    {submitting ? 'Submitting...' : `Submit order — $${cartTotal.toLocaleString()}`}
                  </button>
                  <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 8 }}>You'll upload payment proof in the Payments section</p>
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
  const handleAdd = () => { if (outOfStock) return; onAdd(qty); setAdded(true) }

  return (
    <div onMouseEnter={() => onHover(product.id)} onMouseLeave={() => onHover(null)}
      style={{ background: '#fff', border: `1px solid ${added ? '#2d7dd2' : isHovered ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.07)'}`, borderRadius: 10, overflow: 'hidden', transition: 'all 0.2s ease', boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)', transform: isHovered ? 'translateY(-3px)' : 'none', display: 'flex', flexDirection: 'column' }}>

      {/* IMAGE */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '80%', background: '#f8f8f8' }}>
        {displayImage
          ? <img src={displayImage} alt={activeVar?.name || product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 16, transition: 'all 0.3s' }} />
          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, color: '#ddd' }}>◻</div>
        }
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {product.is_top_pick && <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, background: '#111', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.05em' }}>TOP PICK</span>}
          {product.condition && product.condition !== 'New' && <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 4, background: 'rgba(133,79,11,0.9)', color: '#fff', fontWeight: 700 }}>{product.condition.toUpperCase()}</span>}
        </div>
        {/* Stock badge */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span style={{ fontSize: 9, padding: '4px 9px', borderRadius: 20, background: outOfStock ? '#f1f1f1' : displayStock <= 5 ? '#fff3cd' : '#f0faf4', color: outOfStock ? '#aaa' : displayStock <= 5 ? '#854f0b' : '#2a7d4f', fontWeight: 700, border: `1px solid ${outOfStock ? '#ddd' : displayStock <= 5 ? 'rgba(133,79,11,0.25)' : 'rgba(42,125,79,0.2)'}` }}>
            {outOfStock ? 'Out of stock' : displayStock <= 5 ? `Only ${displayStock} left` : `${displayStock} in stock`}
          </span>
        </div>
      </div>

      {/* MAIN INFO */}
      <div style={{ padding: '14px 14px 0', flex: 1 }}>
        {/* Brand */}
        {product.brand && <div style={{ fontSize: 9, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{product.brand}</div>}
        {/* Name */}
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10, lineHeight: 1.35 }}>{product.name}</div>

        {/* COLOR VARIATIONS */}
        {hasVariations && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 7 }}>Color</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {product.variations.map((v, i) => (
                <button key={i} onClick={() => setSelVar(selVar === i ? null : i)}
                  title={v.color || v.name}
                  style={{ width: 26, height: 26, borderRadius: '50%', background: v.hex || '#888', border: `3px solid ${selVar === i ? '#111' : 'transparent'}`, outline: selVar === i ? '1.5px solid #111' : 'none', outlineOffset: 2, cursor: 'pointer', padding: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'all 0.15s' }}/>
              ))}
            </div>
            {activeVar && (
              <div style={{ marginTop: 6, fontSize: 10, color: '#666', fontWeight: 500 }}>
                {activeVar.color || activeVar.name}
                {activeVar.price_diff !== 0 && <span style={{ color: activeVar.price_diff > 0 ? '#e74c3c' : '#2a7d4f', fontWeight: 700, marginLeft: 4 }}>{activeVar.price_diff > 0 ? '+' : ''}${activeVar.price_diff}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRICE + STOCK + MOQ */}
      <div style={{ padding: '0 14px', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#111', letterSpacing: '-0.02em' }}>${displayPrice?.toLocaleString()}</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>/ unit</span>
          {product.delivery_days && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#888' }}>{product.delivery_days}d delivery</span>}
        </div>

        {/* Stock + MOQ — CLEAR AND PROMINENT */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
          {/* STOCK */}
          <div style={{ padding: '10px 12px', background: outOfStock ? '#fafafa' : displayStock <= 5 ? '#fffbeb' : '#f0fdf4', border: `1.5px solid ${outOfStock ? '#e5e5e5' : displayStock <= 5 ? '#fcd34d' : '#86efac'}`, borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: outOfStock ? '#bbb' : displayStock <= 5 ? '#92400e' : '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 700 }}>
              {outOfStock ? 'Out of stock' : displayStock <= 5 ? 'Low stock' : 'In stock'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: outOfStock ? '#d1d5db' : displayStock <= 5 ? '#b45309' : '#16a34a', lineHeight: 1 }}>
              {outOfStock ? '0' : displayStock}
            </div>
            <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>units available</div>
          </div>
          {/* MOQ */}
          <div style={{ padding: '10px 12px', background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: 8 }}>
            <div style={{ fontSize: 9, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, fontWeight: 700 }}>Min. order</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#1d4ed8', lineHeight: 1 }}>{moq}</div>
            <div style={{ fontSize: 9, color: '#aaa', marginTop: 2 }}>units minimum</div>
          </div>
        </div>

        {/* Description preview */}
        {product.description && (
          <div style={{ fontSize: 11, color: '#888', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </div>
        )}

        {/* Marketplace links */}
        {(product.amazon_url || product.walmart_url) && (
          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
            {product.amazon_url && <a href={product.amazon_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '5px 0', background: '#FF9900', borderRadius: 4, textDecoration: 'none', textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>Amazon</a>}
            {product.walmart_url && <a href={product.walmart_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '5px 0', background: '#0071CE', borderRadius: 4, textDecoration: 'none', textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>Walmart</a>}
          </div>
        )}
      </div>

      {/* PREP CENTER NOTE */}
      {product.prep_fee && (
        <div style={{ margin: '0 14px 10px', padding: '10px 12px', background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div style={{ fontSize: 9, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>Prep center service</div>
          <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.6 }}>
            If you select <strong>Prep Center</strong> as your shipping method, labeling and prep services are available for this product.
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>${product.prep_fee.toFixed(2)}</span>
            <span style={{ fontSize: 10, color: '#9ca3af' }}>per unit · includes labeling & prep</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 10, color: '#9ca3af' }}>
            For {qty} units: <strong style={{ color: '#374151' }}>${(product.prep_fee * qty).toFixed(2)}</strong> additional
          </div>
        </div>
      )}

      {/* ADD TO QUOTE — fixed at bottom */}
      <div style={{ padding: '0 14px 14px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f7f8fa', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, overflow: 'hidden' }}>
            <button onClick={() => setQty(q => Math.max(moq, q - 1))} disabled={outOfStock}
              style={{ width: 32, height: 36, border: 'none', background: 'transparent', cursor: outOfStock ? 'not-allowed' : 'pointer', fontSize: 16, color: '#888', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
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
              style={{ width: 48, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#111', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit', MozAppearance: 'textfield' }}
            />
            <button onClick={() => setQty(q => Math.min(displayStock || 9999, q + 1))} disabled={outOfStock}
              style={{ width: 32, height: 36, border: 'none', background: 'transparent', cursor: outOfStock ? 'not-allowed' : 'pointer', fontSize: 16, color: '#888', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          <button onClick={handleAdd} disabled={outOfStock}
            style={{ flex: 1, padding: '10px 0', background: outOfStock ? '#f0f0f0' : added ? '#2a7d4f' : '#111', color: outOfStock ? '#aaa' : '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: outOfStock ? 'not-allowed' : 'pointer', borderRadius: 6, transition: 'all 0.2s' }}>
            {outOfStock ? 'Out of stock' : added ? '✓ Added' : 'Add to quote'}
          </button>
        </div>
        <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center' }}>
          {!outOfStock && `Total: $${(displayPrice * qty).toLocaleString()} · ${qty} units`}
        </div>
      </div>
    </div>
  )
}
