'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

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
      setUser(data.user)
      const { data: prods } = await supabase.from('products').select('*').eq('active', true).order('name')
      setProducts(prods || [])
      setFiltered(prods || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let list = products
    if (category !== 'all') list = list.filter(p => p.category === category)
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    setFiltered(list)
  }, [search, category, products])

  const addToCart = (product, qty) => setCart(c => ({ ...c, [product.id]: { ...product, qty: parseInt(qty) || product.moq || 1 } }))
  const removeFromCart = (id) => setCart(c => { const n = { ...c }; delete n[id]; return n })
  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cartItems.length

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
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
            {[['all', 'All products'], ['electronics', 'Electronics'], ['home', 'Home appliances'], ['kitchen', 'Kitchen']].map(([val, label]) => (
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
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} inCart={!!cart[product.id]} onAdd={(qty) => addToCart(product, qty)} categoryIcon={categoryIcon} isHovered={hoveredId === product.id} onHover={setHoveredId} />
            ))}
          </div>
        )}
      </div>

      {/* QUOTE PANEL */}
      {showQuote && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
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
                    <div style={{ fontSize: 11, color: '#aaa' }}>Qty: {item.qty} × ${item.price?.toLocaleString()}</div>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: 16, fontWeight: 800, color: '#111' }}>
                    <span>Total</span><span style={{ color: '#2d7dd2' }}>${cartTotal.toLocaleString()}</span>
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
                    { value: 'pickup', label: 'Pickup — Doral, FL', icon: '🏭', desc: '6315 NW 99th Ave · Free', tag: 'FREE', tagColor: '#2a7d4f' },
                    { value: 'prep_center', label: 'Prep Center Delivery', icon: '📦', desc: 'Ship to your prep center · By quote', tag: 'By quote', tagColor: '#854f0b' },
                    { value: 'shipping', label: 'Standard Shipping', icon: '🚚', desc: 'Domestic · By quote', tag: 'By quote', tagColor: '#854f0b' },
                    { value: 'freight', label: 'Freight / LTL', icon: '🚛', desc: 'Large orders · By quote', tag: 'By quote', tagColor: '#854f0b' },
                  ].map(method => (
                    <div key={method.value} onClick={() => setShippingMethod(method.value)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 4, border: `1.5px solid ${shippingMethod === method.value ? '#2d7dd2' : 'rgba(0,0,0,0.08)'}`, background: shippingMethod === method.value ? 'rgba(45,125,210,0.05)' : '#fff', cursor: 'pointer' }}>
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
                  {shippingMethod === 'prep_center' && (
                    <input value={prepAddress} onChange={e => setPrepAddress(e.target.value)} placeholder="Enter prep center address..." style={{ width: '100%', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 3, fontSize: 12, padding: '8px 12px', outline: 'none', fontFamily: 'inherit', color: '#333', boxSizing: 'border-box', marginTop: 4 }} />
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
  const maxQty = product.stock || 0
  const outOfStock = product.stock === 0 || product.stock === null
  const handleAdd = () => { if (outOfStock) return; onAdd(qty); setAdded(true) }

  return (
    <div onMouseEnter={() => onHover(product.id)} onMouseLeave={() => onHover(null)}
      style={{ background: '#fff', border: `1px solid ${added ? 'rgba(45,125,210,0.4)' : isHovered ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 6, overflow: 'hidden', transition: 'all 0.2s ease', boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)', transform: isHovered ? 'translateY(-2px)' : 'none' }}>

      <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', overflow: 'hidden', background: '#fafafa', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>{categoryIcon(product.category)}</div>
        )}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 20, background: outOfStock ? 'rgba(150,150,150,0.12)' : product.stock <= 5 ? 'rgba(231,76,60,0.1)' : 'rgba(42,125,79,0.1)', color: outOfStock ? '#aaa' : product.stock <= 5 ? '#c0392b' : '#2a7d4f', fontWeight: 600, border: `0.5px solid ${outOfStock ? 'rgba(150,150,150,0.2)' : product.stock <= 5 ? 'rgba(231,76,60,0.2)' : 'rgba(42,125,79,0.2)'}` }}>
            {outOfStock ? '✕ Out of stock' : product.stock <= 5 ? `⚠ ${product.stock} left` : `✓ ${product.stock} in stock`}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 20, background: 'rgba(0,0,0,0.5)', color: '#fff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{product.category}</span>
        </div>
      </div>

      <div style={{ padding: '0.875rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ fontSize: 10, color: '#bbb', marginBottom: 8, fontFamily: 'monospace' }}>{product.sku}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>${product.price?.toLocaleString()}<span style={{ fontSize: 10, color: '#bbb', fontWeight: 400 }}>/unit</span></div>
          <div style={{ fontSize: 10, color: '#bbb' }}>⏱ {product.dispatch_days}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 9, padding: '3px 8px', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', borderRadius: 2, fontWeight: 600, border: '0.5px solid rgba(45,125,210,0.15)' }}>Min. order: {product.moq || 1} units</span>
          <span style={{ fontSize: 9, padding: '3px 8px', background: 'rgba(0,0,0,0.04)', color: '#888', borderRadius: 2, fontWeight: 600, border: '0.5px solid rgba(0,0,0,0.08)' }}>📍 {product.warehouse || 'WH: FL'}</span>
        </div>
        {(product.amazon_url || product.walmart_url) && (
          <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
            {product.amazon_url && <a href={product.amazon_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '5px', background: '#FF9900', borderRadius: 3, textDecoration: 'none' }}><span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>Amazon</span></a>}
            {product.walmart_url && <a href={product.walmart_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '5px', background: '#0071CE', borderRadius: 3, textDecoration: 'none' }}><span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>Walmart</span></a>}
          </div>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden', opacity: outOfStock ? 0.4 : 1 }}>
            <button onClick={() => setQty(q => Math.max(product.moq || 1, q-1))} disabled={outOfStock} style={{ width: 28, height: 30, background: '#f7f8fa', border: 'none', cursor: outOfStock ? 'not-allowed' : 'pointer', fontSize: 14, color: '#888', fontWeight: 700 }}>−</button>
            <input type="number" value={qty} disabled={outOfStock}
              onChange={e => setQty(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
              onBlur={e => { const val = parseInt(e.target.value) || (product.moq || 1); setQty(Math.min(maxQty || 9999, Math.max(product.moq || 1, val))) }}
              style={{ width: 36, textAlign: 'center', fontSize: 12, fontWeight: 600, border: 'none', outline: 'none', background: '#fff', color: '#333', fontFamily: 'inherit' }} />
            <button onClick={() => setQty(q => Math.min(maxQty || 9999, q+1))} disabled={outOfStock} style={{ width: 28, height: 30, background: '#f7f8fa', border: 'none', cursor: outOfStock ? 'not-allowed' : 'pointer', fontSize: 14, color: '#888', fontWeight: 700 }}>+</button>
          </div>
          <button onClick={handleAdd} disabled={outOfStock} style={{ flex: 1, padding: '6px 0', background: outOfStock ? '#e0e0e0' : added ? '#2a7d4f' : '#2d7dd2', color: outOfStock ? '#aaa' : '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: outOfStock ? 'not-allowed' : 'pointer', borderRadius: 3, transition: 'all 0.2s' }}>
            {outOfStock ? '⏳ Out of stock' : added ? '✓ Added' : 'Add to quote'}
          </button>
        </div>
      </div>
    </div>
  )
}
