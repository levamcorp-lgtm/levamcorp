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
  const [loading, setLoading] = useState(true)

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
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    setFiltered(list)
  }, [search, category, products])

  const addToCart = (product, qty) => {
    setCart(c => ({ ...c, [product.id]: { ...product, qty: parseInt(qty) || 1 } }))
  }

  const removeFromCart = (id) => {
    setCart(c => { const n = { ...c }; delete n[id]; return n })
  }

  const cartItems = Object.values(cart)
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const cartCount = cartItems.length

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
  }

  const submitOrder = async () => {
    if (cartItems.length === 0) return
    const supabase = createClient()
    const { data: { user: u } } = await supabase.auth.getUser()

    // Get client record
    const { data: client } = await supabase.from('clients').select('id').eq('user_id', u.id).single()

    // Create order
    const { data: order, error } = await supabase.from('orders').insert([{
      client_id: client?.id,
      status: 'new',
      subtotal: cartTotal,
      total: cartTotal,
    }]).select().single()

    if (error || !order) { alert('Error submitting order. Please try again.'); return }

    // Insert order items
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

    setShowInvoice(true)
    setShowQuote(false)
  }

  const invNum = `LC-${Math.floor(20000 + Math.random() * 9999)}`
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const validDate = new Date(); validDate.setDate(validDate.getDate() + 7)
  const validStr = validDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>Loading catalog...</div>

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="logo-icon"><div className="logo-l-vert" /><div className="logo-l-horiz" /><div className="logo-accent" /></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#222', textTransform: 'uppercase' }}>Levam</div>
              <div style={{ fontSize: 7, letterSpacing: '0.25em', color: '#2d7dd2', textTransform: 'uppercase' }}>Partner Portal</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, borderLeft: '0.5px solid rgba(0,0,0,0.08)', paddingLeft: 16 }}>
            {[['Dashboard', '/portal/dashboard'], ['Catalog', '/portal/catalog'], ['My orders', '/portal/orders'], ['Invoices', '/portal/invoices']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Catalog' ? '#2d7dd2' : '#888', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Catalog' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setShowQuote(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: cartCount > 0 ? '#2d7dd2' : '#888',
            padding: '7px 16px', border: `0.5px solid ${cartCount > 0 ? '#2d7dd2' : 'rgba(0,0,0,0.1)'}`,
            background: cartCount > 0 ? 'rgba(45,125,210,0.08)' : '#fff', borderRadius: 2, cursor: 'pointer', fontWeight: 500
          }}>
            🧾 Quote {cartCount > 0 && <span style={{ background: '#2d7dd2', color: '#fff', fontSize: 10, fontWeight: 500, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cartCount}</span>}
          </button>
          <button onClick={handleLogout} style={{ fontSize: 11, color: '#333', border: '0.5px solid rgba(0,0,0,0.12)', padding: '6px 14px', borderRadius: 2, background: '#fff', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', minHeight: 'calc(100vh - 57px)' }}>

        {/* SIDEBAR */}
        <div style={{ background: '#fff', borderRight: '0.5px solid rgba(0,0,0,0.08)', padding: '1.5rem 0' }}>
          <div style={{ padding: '0 1.25rem', marginBottom: '0.5rem', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb' }}>Search</div>
          <div style={{ padding: '0 1rem', marginBottom: '1.25rem' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Product or SKU..." style={{ width: '100%', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', color: '#333', fontSize: 12, padding: '8px 10px', borderRadius: 2, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div style={{ padding: '0 1.25rem', marginBottom: '0.5rem', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb' }}>Categories</div>
          {[['all','All products'],['electronics','Electronics'],['home','Home appliances'],['kitchen','Kitchen']].map(([val, label]) => (
            <div key={val} onClick={() => setCategory(val)} style={{
              padding: '8px 1.25rem', fontSize: 12, cursor: 'pointer',
              color: category === val ? '#2d7dd2' : '#888',
              background: category === val ? 'rgba(45,125,210,0.08)' : 'transparent',
              borderLeft: `2px solid ${category === val ? '#2d7dd2' : 'transparent'}`
            }}>{label}</div>
          ))}
        </div>

        {/* MAIN */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: '#111' }}>Product catalog</h2>
              <p style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>Showing {filtered.length} products · Approved partner pricing</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} inCart={!!cart[product.id]} onAdd={(qty) => addToCart(product, qty)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#ccc' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 13 }}>No products found</div>
            </div>
          )}
        </div>
      </div>

      {/* QUOTE PANEL */}
      {showQuote && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <div onClick={() => setShowQuote(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 360, background: '#fff', borderLeft: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>🧾 Order quote</h3>
              <button onClick={() => setShowQuote(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#bbb', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#ccc' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🛒</div>
                  <p style={{ fontSize: 12 }}>Add products to build your quote</p>
                </div>
              ) : cartItems.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#333', marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>Qty: {item.qty} × ${item.price}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>${(item.price * item.qty).toLocaleString()}</div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div style={{ padding: '1.25rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 6 }}><span>Subtotal</span><span>${cartTotal.toLocaleString()}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 10 }}><span>Shipping</span><span>TBD</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 500, color: '#111', marginBottom: '1.25rem', paddingTop: 10, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}><span>Estimated total</span><span>${cartTotal.toLocaleString()}</span></div>
                <button onClick={submitOrder} style={{ width: '100%', padding: 12, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2, marginBottom: 8 }}>Generate quote & invoice</button>
                <button onClick={() => setCart({})} style={{ width: '100%', padding: 8, background: '#fff', color: '#aaa', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 2 }}>Clear quote</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {showInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: 520, maxHeight: '90vh', overflowY: 'auto', borderRadius: 4 }}>

            {/* Invoice header */}
            <div style={{ background: '#111', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div className="logo-icon"><div style={{ position: 'absolute', left: 6, top: 0, width: 2, height: 22, background: '#444' }} /><div style={{ position: 'absolute', left: 6, bottom: 0, width: 16, height: 2, background: '#444' }} /><div className="logo-accent" /></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: '0.2em', color: '#ddd', textTransform: 'uppercase' }}>Levam</div>
                    <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#2d7dd2', textTransform: 'uppercase' }}>Corp · Distributors</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: '#555', lineHeight: 1.8 }}>6315 NW 99th Ave, Doral, FL 33178<br />partners@levamcorp.com · levamcorp.com</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '0.1em', marginBottom: 6 }}>QUOTE / INVOICE</div>
                <div style={{ fontSize: 13, color: '#2d7dd2', fontWeight: 500 }}>#{invNum}</div>
                <div style={{ fontSize: 10, color: '#555', lineHeight: 2, marginTop: 6 }}>
                  Date: {today}<br />Valid until: {validStr}<br />Terms: Net 15
                </div>
              </div>
            </div>

            {/* Parties */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>From</div>
                <p style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}><strong style={{ color: '#222' }}>Levam Corp Distributors</strong><br />6315 NW 99th Ave<br />Doral, FL 33178<br />partners@levamcorp.com</p>
              </div>
              <div style={{ padding: '1.25rem 1.5rem', borderLeft: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', marginBottom: 8 }}>Bill to</div>
                <p style={{ fontSize: 11, color: '#555', lineHeight: 1.8 }}><strong style={{ color: '#222' }}>Approved Partner</strong><br />{user?.email}</p>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: '0 1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0' }}>
                <thead>
                  <tr style={{ background: '#f7f8fa' }}>
                    {['#','Product','SKU','Qty','Unit price','Total'].map(h => (
                      <th key={h} style={{ fontSize: 8, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#bbb', padding: '8px', textAlign: h === 'Total' || h === 'Unit price' || h === 'Qty' ? 'right' : 'left', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, i) => (
                    <tr key={item.id} style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)' }}>
                      <td style={{ padding: '10px 8px', fontSize: 11, color: '#bbb' }}>{i+1}</td>
                      <td style={{ padding: '10px 8px', fontSize: 11, fontWeight: 500, color: '#333' }}>{item.name}</td>
                      <td style={{ padding: '10px 8px', fontSize: 10, color: '#bbb' }}>{item.sku}</td>
                      <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right' }}>{item.qty}</td>
                      <td style={{ padding: '10px 8px', fontSize: 11, textAlign: 'right' }}>${item.price.toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', fontSize: 11, fontWeight: 500, color: '#111', textAlign: 'right' }}>${(item.price * item.qty).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ padding: '0 1.5rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '4px 0' }}><span>Subtotal</span><span>${cartTotal.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', padding: '4px 0' }}><span>Shipping</span><span>TBD</span></div>
              <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.08)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 500, color: '#111', padding: '4px 0' }}><span>Estimated Total</span><span>${cartTotal.toLocaleString()}</span></div>
            </div>

            {/* Legal */}
            <div style={{ margin: '0 1.5rem 1.25rem', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ background: '#111', padding: '6px 12px', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa' }}>Terms & Conditions · Legal Notice</div>
              <div style={{ background: '#fafafa', padding: 12, fontSize: 9.5, color: '#888', lineHeight: 1.75 }}>
                <strong style={{ color: '#555', fontSize: 9, textTransform: 'uppercase' }}>All Sales Are Final — </strong>All sales made by Levam Corp Distributors are final. Once an order has been confirmed, no returns, exchanges, refunds, or cancellations will be accepted. By accepting this invoice, the buyer agrees to this policy in full.<br /><br />
                <strong style={{ color: '#555', fontSize: 9, textTransform: 'uppercase' }}>Governing Law — </strong>This agreement is governed by the laws of the State of Florida. Any disputes shall be resolved exclusively in the courts of Miami-Dade County, Florida.
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowInvoice(false); setCart({}); window.location.href = '/portal/orders' }} style={{ flex: 1, padding: 10, background: '#2a7d4f', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2 }}>✓ Order submitted</button>
              <button onClick={() => window.print()} style={{ padding: '10px 16px', background: '#fff', color: '#333', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.12)', cursor: 'pointer', borderRadius: 2 }}>🖨 Print</button>
              <button onClick={() => setShowInvoice(false)} style={{ padding: '10px 16px', background: '#fff', color: '#aaa', fontSize: 11, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 2 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, inCart, onAdd }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(inCart)

  const handleAdd = () => {
    onAdd(qty)
    setAdded(true)
  }

  return (
    <div style={{ background: '#fff', border: `0.5px solid ${added ? 'rgba(45,125,210,0.35)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ height: 100, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
        {product.category === 'electronics' ? '📺' : product.category === 'home' ? '🏠' : '🍳'}
      </div>
      <div style={{ padding: '1rem' }}>
        <div style={{ fontSize: 9, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{product.category}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 4, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ fontSize: 10, color: '#ccc', marginBottom: 8 }}>{product.sku}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#111' }}>${product.price}<span style={{ fontSize: 10, color: '#bbb', fontWeight: 400 }}>/unit</span></div>
          <div style={{ fontSize: 10, color: product.stock <= 5 ? '#b07c00' : '#2a7d4f' }}>{product.stock <= 5 ? '⚠ Low stock' : '✓ In stock'}</div>
        </div>
        <div style={{ fontSize: 10, color: '#aaa', marginBottom: 10 }}>⏱ Ships in {product.dispatch_days}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width: 26, height: 28, background: '#f7f8fa', border: 'none', cursor: 'pointer', fontSize: 14, color: '#888' }}>−</button>
            <input type="number" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value)||1))} style={{ width: 36, textAlign: 'center', fontSize: 12, border: 'none', outline: 'none', background: '#fff', color: '#333', fontFamily: 'inherit' }} />
            <button onClick={() => setQty(q => q+1)} style={{ width: 26, height: 28, background: '#f7f8fa', border: 'none', cursor: 'pointer', fontSize: 14, color: '#888' }}>+</button>
          </div>
          <button onClick={handleAdd} style={{ flex: 1, padding: '6px 0', background: added ? '#2a7d4f' : '#2d7dd2', color: '#fff', fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2 }}>
            {added ? '✓ Added' : 'Add to quote'}
          </button>
        </div>
      </div>
    </div>
  )
}
