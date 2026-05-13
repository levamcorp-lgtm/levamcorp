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
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceNum] = useState(`LC-${Math.floor(20000 + Math.random() * 9999)}`)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const validDate = new Date(); validDate.setDate(validDate.getDate() + 7)
  const validStr = validDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

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

  const addToCart = (product, qty) => setCart(c => ({ ...c, [product.id]: { ...product, qty: parseInt(qty) || 1 } }))
  const removeFromCart = (id) => setCart(c => { const n = { ...c }; delete n[id]; return n })
  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cartItems.length

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
  }

  const generateInvoice = () => {
    if (cartItems.length === 0) return
    setShowQuote(false)
    setShowInvoice(true)
  }

  const submitOrder = async () => {
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
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order,
            items: cartItems.map(i => ({ product_name: i.name, product_sku: i.sku, quantity: i.qty, unit_price: i.price })),
            clientEmail: u.email,
            invoiceNum,
            total: cartTotal,
          })
        })
      }
    } catch (e) { console.log('Order error:', e) }
    setSubmitting(false)
    setOrderSubmitted(true)
  }

  const categories = [...new Set(products.map(p => p.category))]
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
          <button onClick={() => setShowQuote(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
            color: cartCount > 0 ? '#fff' : 'rgba(255,255,255,0.5)',
            padding: '7px 16px', border: `0.5px solid ${cartCount > 0 ? '#2d7dd2' : 'rgba(255,255,255,0.15)'}`,
            background: cartCount > 0 ? '#2d7dd2' : 'transparent', borderRadius: 2, cursor: 'pointer', fontWeight: 600
          }}>
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
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4, letterSpacing: '-0.01em' }}>Product Catalog</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Showing {filtered.length} products · Approved wholesale pricing</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or SKU..."
                  style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, padding: '9px 14px 9px 36px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', width: 240 }} />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#555' }}>🔍</span>
              </div>
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div style={{ display: 'flex', gap: 0 }}>
            {[['all', 'All products'], ['electronics', 'Electronics'], ['home', 'Home appliances'], ['kitchen', 'Kitchen']].map(([val, label]) => (
              <button key={val} onClick={() => setCategory(val)} style={{
                fontSize: 12, fontWeight: 600, padding: '10px 20px', cursor: 'pointer', border: 'none', background: 'transparent',
                color: category === val ? '#fff' : 'rgba(255,255,255,0.4)',
                borderBottom: `2px solid ${category === val ? '#2d7dd2' : 'transparent'}`,
                letterSpacing: '0.03em'
              }}>{label}</button>
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
              <ProductCard
                key={product.id}
                product={product}
                inCart={!!cart[product.id]}
                onAdd={(qty) => addToCart(product, qty)}
                categoryIcon={categoryIcon}
                isHovered={hoveredId === product.id}
                onHover={setHoveredId}
              />
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
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>🧾 Order quote</h3>
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
                    <img src={item.image_url} alt={item.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 3, flexShrink: 0, background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', padding: 4 }} />
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginBottom: 6 }}><span>Subtotal</span><span>${cartTotal.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginBottom: 12 }}><span>Shipping</span><span>TBD</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: '#111', marginBottom: '1.25rem', paddingTop: 12, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}><span>Estimated total</span><span>${cartTotal.toLocaleString()}</span></div>
                <button onClick={generateInvoice} style={{ width: '100%', padding: 13, background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3, marginBottom: 8, boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>Generate quote & invoice</button>
                <button onClick={() => setCart({})} style={{ width: '100%', padding: 8, background: '#fff', color: '#aaa', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 3 }}>Clear quote</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {showInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', width: 560, maxHeight: '92vh', overflowY: 'auto', borderRadius: 6, boxShadow: '0 24px 80px rgba(0,0,0,0.3)' }}>
            {orderSubmitted ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, background: 'rgba(42,125,79,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 32 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: '0.75rem' }}>Order submitted!</h2>
                <p style={{ fontSize: 14, color: '#888', lineHeight: 1.8, marginBottom: '2rem' }}>
                  Your order <strong style={{ color: '#333' }}>#{invoiceNum}</strong> has been received.<br />
                  Our team will confirm within 1–2 business days.
                </p>
                <button onClick={() => { setShowInvoice(false); setCart({}); setOrderSubmitted(false) }} style={{ padding: '11px 28px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3 }}>Back to catalog</button>
              </div>
            ) : (
              <>
                <div style={{ background: '#111', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{ position: 'relative', width: 28, height: 28 }}>
                        <div style={{ position: 'absolute', left: 6, top: 0, width: 2, height: 22, background: '#444' }} />
                        <div style={{ position: 'absolute', left: 6, bottom: 0, width: 16, height: 2, background: '#444' }} />
                        <div style={{ position: 'absolute', left: 10, bottom: 6, width: 10, height: 2, background: '#2d7dd2' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.2em', color: '#ddd', textTransform: 'uppercase' }}>Levam</div>
                        <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#2d7dd2', textTransform: 'uppercase' }}>Corp · Distributors</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: '#555', lineHeight: 1.8 }}>6315 NW 99th Ave, Doral, FL 33178<br />partners@levamcorp.com · levamcorp.com</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', marginBottom: 6 }}>QUOTE / INVOICE</div>
                    <div style={{ fontSize: 13, color: '#2d7dd2', fontWeight: 600 }}>#{invoiceNum}</div>
                    <div style={{ fontSize: 10, color: '#555', lineHeight: 2, marginTop: 6 }}>Date: {today}<br />Valid until: {validStr}<br />Terms: Net 15</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>From</div>
                    <p style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}><strong style={{ color: '#222' }}>Levam Corp Distributors</strong><br />6315 NW 99th Ave<br />Doral, FL 33178</p>
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem', borderLeft: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>Bill to</div>
                    <p style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}><strong style={{ color: '#222' }}>Approved Partner</strong><br />{user?.email}</p>
                  </div>
                </div>
                <div style={{ padding: '0 1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
                    <thead>
                      <tr style={{ background: '#f7f8fa' }}>
                        {['#','Product','SKU','Qty','Unit price','Total'].map((h,i) => (
                          <th key={h} style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '8px', textAlign: i > 2 ? 'right' : 'left', fontWeight: 400 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, i) => (
                        <tr key={item.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                          <td style={{ padding: '10px 8px', fontSize: 11, color: '#bbb' }}>{i+1}</td>
                          <td style={{ padding: '10px 8px', fontSize: 11, fontWeight: 600, color: '#333' }}>{item.name}</td>
                          <td style={{ padding: '10px 8px', fontSize: 10, color: '#bbb' }}>{item.sku}</td>
                          <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right' }}>{item.qty}</td>
                          <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right' }}>${item.price?.toLocaleString()}</td>
                          <td style={{ padding: '10px 8px', fontSize: 11, fontWeight: 600, color: '#111', textAlign: 'right' }}>${(item.price * item.qty)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '0 1.5rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '4px 0' }}><span>Subtotal</span><span>${cartTotal.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '4px 0' }}><span>Shipping</span><span>TBD</span></div>
                  <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#111', padding: '4px 0' }}><span>Estimated Total</span><span>${cartTotal.toLocaleString()}</span></div>
                </div>
                <div style={{ margin: '0 1.5rem 1.25rem', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ background: '#111', padding: '6px 12px', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa' }}>Terms & Conditions · Legal Notice</div>
                  <div style={{ background: '#fafafa', padding: 12, fontSize: 9.5, color: '#888', lineHeight: 1.75 }}>
                    <strong style={{ color: '#555', fontSize: 9, textTransform: 'uppercase' }}>All Sales Are Final — </strong>All sales made by Levam Corp Distributors are final. Once an order has been confirmed, no returns, exchanges, refunds, or cancellations will be accepted under any circumstances.<br /><br />
                    <strong style={{ color: '#555', fontSize: 9, textTransform: 'uppercase' }}>Governing Law — </strong>This agreement is governed by the laws of the State of Florida. Any disputes shall be resolved exclusively in the courts of Miami-Dade County, Florida.
                  </div>
                </div>
                <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8 }}>
                  <button onClick={submitOrder} disabled={submitting} style={{ flex: 1, padding: 12, background: submitting ? '#aaa' : '#2a7d4f', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', borderRadius: 3 }}>
                    {submitting ? 'Submitting...' : '✓ Submit order'}
                  </button>
                  <button onClick={() => window.print()} style={{ padding: '12px 16px', background: '#e8e8e8', color: '#333', fontSize: 11, border: 'none', cursor: 'pointer', borderRadius: 3 }}>🖨</button>
                  <button onClick={() => setShowInvoice(false)} style={{ padding: '12px 16px', background: '#fff', color: '#aaa', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 3 }}>Close</button>
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
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(inCart)

  const handleAdd = () => { onAdd(qty); setAdded(true) }

  return (
    <div
      onMouseEnter={() => onHover(product.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: '#fff',
        border: `1px solid ${added ? 'rgba(45,125,210,0.4)' : isHovered ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 6,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
      }}>

      {/* IMAGE */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', overflow: 'hidden', background: '#fafafa', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: 12 }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
            {categoryIcon(product.category)}
          </div>
        )}
        {/* Stock badge */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 20, background: product.stock <= 5 ? 'rgba(231,76,60,0.1)' : 'rgba(42,125,79,0.1)', color: product.stock <= 5 ? '#c0392b' : '#2a7d4f', fontWeight: 600, border: `0.5px solid ${product.stock <= 5 ? 'rgba(231,76,60,0.2)' : 'rgba(42,125,79,0.2)'}` }}>
            {product.stock <= 5 ? `⚠ ${product.stock} left` : `✓ ${product.stock} in stock`}
          </span>
        </div>
        {/* Category badge */}
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 20, background: 'rgba(0,0,0,0.5)', color: '#fff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {product.category}
          </span>
        </div>
      </div>

      {/* INFO */}
      <div style={{ padding: '0.875rem' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 3, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ fontSize: 10, color: '#bbb', marginBottom: 8, fontFamily: 'monospace' }}>{product.sku}</div>

        {product.description && (
          <div style={{ fontSize: 11, color: '#999', lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#111' }}>${product.price?.toLocaleString()}<span style={{ fontSize: 10, color: '#bbb', fontWeight: 400 }}>/unit</span></div>
          <div style={{ fontSize: 10, color: '#bbb' }}>⏱ {product.dispatch_days}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 9, padding: '3px 8px', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', borderRadius: 2, fontWeight: 600, border: '0.5px solid rgba(45,125,210,0.15)' }}>
            MOQ: {product.moq || 1} units
          </span>
          <span style={{ fontSize: 9, padding: '3px 8px', background: 'rgba(0,0,0,0.04)', color: '#888', borderRadius: 2, fontWeight: 600, border: '0.5px solid rgba(0,0,0,0.08)' }}>
            📍 {product.warehouse || 'WH: FL'}
          </span>
        </div>

        {/* Amazon & Walmart */}
        {(product.amazon_url || product.walmart_url) && (
          <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
            {product.amazon_url && (
              <a href={product.amazon_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '5px', background: '#FF9900', borderRadius: 3, textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M13.958 10.09c0 1.232.031 2.257-.59 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.698-3.182v.685zm3.186 7.705c-.209.188-.512.201-.745.074-1.047-.872-1.234-1.276-1.814-2.106-1.734 1.768-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.927 0-2.565 1.391-4.309 3.37-5.164 1.715-.755 4.113-.891 5.945-1.098v-.41c0-.753.059-1.642-.384-2.294-.385-.579-1.124-.818-1.774-.818-1.205 0-2.277.618-2.54 1.9-.054.285-.261.567-.549.582l-3.065-.331c-.259-.058-.548-.266-.472-.66C5.9 1.766 9.08.5 11.9.5c1.44 0 3.318.383 4.455 1.476 1.441 1.346 1.303 3.141 1.303 5.094v4.617c0 1.387.576 1.997 1.118 2.747.192.271.234.593-.01.793l-1.622 1.568z"/></svg>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>Amazon</span>
              </a>
            )}
            {product.walmart_url && (
              <a href={product.walmart_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '5px', background: '#0071CE', borderRadius: 3, textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5L12 2Z"/></svg>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>Walmart</span>
              </a>
            )}
          </div>
        )}

        {/* ADD TO QUOTE */}
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden' }}>
            <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width: 28, height: 30, background: '#f7f8fa', border: 'none', cursor: 'pointer', fontSize: 14, color: '#888', fontWeight: 700 }}>−</button>
            <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value)||1))} style={{ width: 36, textAlign: 'center', fontSize: 12, fontWeight: 600, border: 'none', outline: 'none', background: '#fff', color: '#333', fontFamily: 'inherit' }} />
            <button onClick={() => setQty(q => q+1)} style={{ width: 28, height: 30, background: '#f7f8fa', border: 'none', cursor: 'pointer', fontSize: 14, color: '#888', fontWeight: 700 }}>+</button>
          </div>
          <button onClick={handleAdd} style={{ flex: 1, padding: '6px 0', background: added ? '#2a7d4f' : '#2d7dd2', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3, boxShadow: added ? '0 2px 8px rgba(42,125,79,0.3)' : '0 2px 8px rgba(45,125,210,0.3)', transition: 'all 0.2s' }}>
            {added ? '✓ Added' : 'Add to quote'}
          </button>
        </div>
      </div>
    </div>
  )
}
