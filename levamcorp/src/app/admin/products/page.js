'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'
const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

const CATEGORIES = ['electronics', 'home', 'kitchen', 'beauty', 'sports', 'toys', 'office', 'automotive', 'garden', 'health', 'fashion', 'other']
const CONDITIONS = ['New', 'Open Box', 'Refurbished', 'Used - Like New', 'Used - Good']

const emptyProduct = {
  name: '', sku: '', brand: '', category: 'electronics', additional_categories: [],
  condition: 'New', price: '', cost_price: '', stock: '', moq: '1',
  dispatch_days: '1-2 days', warehouse: 'WH: FL', upc: '', asin: '',
  weight: '', dimensions: '', description: '', image_url: '',
  amazon_url: '', walmart_url: '', active: true,
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImg, setUploadingImg] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      await loadProducts(supabase)
    })
  }, [])

  const loadProducts = async (supabase) => {
    const { data } = await supabase.from('products').select('*').order('name')
    setProducts(data || [])
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const setField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const toggleCategory = useCallback((cat) => {
    setForm(prev => ({
      ...prev,
      additional_categories: prev.additional_categories?.includes(cat)
        ? prev.additional_categories.filter(c => c !== cat)
        : [...(prev.additional_categories || []), cat]
    }))
  }, [])

  const uploadImage = async (file) => {
    if (!file) return null
    setUploadingImg(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `products/${Date.now()}.${ext}`
      await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setUploadingImg(false)
      return data.publicUrl
    } catch (e) { setUploadingImg(false); return null }
  }

  const saveProduct = async () => {
    if (!form.name || !form.price) { alert('Name and price are required'); return }
    setSaving(true)
    try {
      const supabase = createClient()
      let imageUrl = form.image_url
      if (imageFile) { imageUrl = await uploadImage(imageFile) || imageUrl }
      const payload = { ...form, image_url: imageUrl, price: parseFloat(form.price) || 0, cost_price: parseFloat(form.cost_price) || 0, stock: parseInt(form.stock) || 0, moq: parseInt(form.moq) || 1 }
      if (editingId) {
        await supabase.from('products').update(payload).eq('id', editingId)
      } else {
        await supabase.from('products').insert([payload])
      }
      await loadProducts(supabase)
      setShowAdd(false)
      setEditingId(null)
      setForm(emptyProduct)
      setImageFile(null)
    } catch (e) { alert('Error saving: ' + e.message) }
    setSaving(false)
  }

  const deleteProduct = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    if (expanded === id) setExpanded(null)
  }

  const startEdit = (product) => {
    setForm({ ...emptyProduct, ...product, additional_categories: product.additional_categories || [] })
    setEditingId(product.id)
    setShowAdd(true)
    setExpanded(null)
    setImageFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter || (p.additional_categories || []).includes(categoryFilter)
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const inp = { background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '9px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' }
  const lbl = { fontSize: 9, color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontWeight: 600 }

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Products' ? '#2d7dd2' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Products' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* STATS */}
      <div style={{ padding: '1.25rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
        {[
          { label: 'Total products', value: products.length, color: '#2d7dd2', icon: '📦' },
          { label: 'Active', value: products.filter(p => p.active).length, color: '#2a7d4f', icon: '✅' },
          { label: 'Out of stock', value: products.filter(p => p.stock === 0).length, color: products.filter(p => p.stock === 0).length > 0 ? '#e74c3c' : '#555', icon: '⚠️' },
          { label: 'Low stock (≤5)', value: products.filter(p => p.stock > 0 && p.stock <= 5).length, color: '#854f0b', icon: '📉' },
          { label: 'Total units', value: products.reduce((s, p) => s + (p.stock || 0), 0), color: '#ccc', icon: '🔢' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
            <span style={{ fontSize: 18, opacity: 0.25 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>

        {/* ADD / EDIT FORM */}
        {showAdd && (
          <div style={{ background: '#111', border: `1px solid ${editingId ? 'rgba(45,125,210,0.4)' : 'rgba(42,125,79,0.4)'}`, borderRadius: 6, marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ background: editingId ? 'rgba(45,125,210,0.08)' : 'rgba(42,125,79,0.08)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{editingId ? '✏️ Edit product' : '➕ Add new product'}</div>
              <button onClick={() => { setShowAdd(false); setEditingId(null); setForm(emptyProduct) }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ padding: '1.5rem' }}>

              {/* SECTION: Basic info */}
              <div style={{ fontSize: 10, color: '#2d7dd2', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: 6, borderBottom: '0.5px solid rgba(45,125,210,0.2)' }}>Basic information</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={lbl}>Product name *</label>
                  <input style={inp} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Full product name" />
                </div>
                <div>
                  <label style={lbl}>Brand</label>
                  <input style={inp} value={form.brand} onChange={e => setField('brand', e.target.value)} placeholder="e.g. JBL, LG, Ninja" />
                </div>
                <div>
                  <label style={lbl}>SKU</label>
                  <input style={inp} value={form.sku} onChange={e => setField('sku', e.target.value)} placeholder="Product SKU" />
                </div>
                <div>
                  <label style={lbl}>UPC</label>
                  <input style={inp} value={form.upc} onChange={e => setField('upc', e.target.value)} placeholder="Universal Product Code" />
                </div>
                <div>
                  <label style={lbl}>ASIN (Amazon)</label>
                  <input style={inp} value={form.asin} onChange={e => setField('asin', e.target.value)} placeholder="Amazon ASIN" />
                </div>
                <div>
                  <label style={lbl}>Condition</label>
                  <select style={inp} value={form.condition} onChange={e => setField('condition', e.target.value)}>
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Active</label>
                  <select style={inp} value={form.active ? 'true' : 'false'} onChange={e => setField('active', e.target.value === 'true')}>
                    <option value="true">Active — visible to clients</option>
                    <option value="false">Hidden — not visible</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Top Pick ⭐</label>
                  <select style={inp} value={form.is_top_pick ? 'true' : 'false'} onChange={e => setField('is_top_pick', e.target.value === 'true')}>
                    <option value="false">No — regular product</option>
                    <option value="true">Yes — featured on homepage</option>
                  </select>
                </div>
              </div>

              {/* SECTION: Category */}
              <div style={{ fontSize: 10, color: '#2d7dd2', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: 6, borderBottom: '0.5px solid rgba(45,125,210,0.2)' }}>Category</div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={lbl}>Primary category *</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => setField('category', cat)}
                      style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${form.category === cat ? '#2d7dd2' : 'rgba(255,255,255,0.08)'}`, background: form.category === cat ? 'rgba(45,125,210,0.2)' : 'transparent', color: form.category === cat ? '#2d7dd2' : '#666', fontWeight: form.category === cat ? 700 : 400, textTransform: 'capitalize' }}>
                      {cat}
                    </button>
                  ))}
                </div>
                <label style={lbl}>Additional categories (optional)</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CATEGORIES.filter(c => c !== form.category).map(cat => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                      style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${(form.additional_categories || []).includes(cat) ? '#534ab7' : 'rgba(255,255,255,0.06)'}`, background: (form.additional_categories || []).includes(cat) ? 'rgba(83,74,183,0.2)' : 'transparent', color: (form.additional_categories || []).includes(cat) ? '#a89af0' : '#555', textTransform: 'capitalize' }}>
                      {(form.additional_categories || []).includes(cat) ? '✓ ' : ''}{cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: Pricing & Stock */}
              <div style={{ fontSize: 10, color: '#2a7d4f', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: 6, borderBottom: '0.5px solid rgba(42,125,79,0.2)' }}>Pricing & inventory</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1.25rem' }}>
                <div>
                  <label style={lbl}>Sale price ($) *</label>
                  <input style={inp} type="number" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label style={lbl}>Cost price ($)</label>
                  <input style={inp} type="number" value={form.cost_price} onChange={e => setField('cost_price', e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label style={lbl}>Stock (units)</label>
                  <input style={inp} type="number" value={form.stock} onChange={e => setField('stock', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label style={lbl}>MOQ (min order)</label>
                  <input style={inp} type="number" value={form.moq} onChange={e => setField('moq', e.target.value)} placeholder="1" />
                </div>
                <div>
                  <label style={lbl}>Dispatch time</label>
                  <select style={inp} value={form.dispatch_days} onChange={e => setField('dispatch_days', e.target.value)}>
                    {['Same day','1-2 days','2-3 days','3-5 days','5-7 days','1-2 weeks'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Warehouse</label>
                  <select style={inp} value={form.warehouse} onChange={e => setField('warehouse', e.target.value)}>
                    {['WH: FL','WH: TX','WH: CA','WH: NY','WH: NJ'].map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                {form.price && form.cost_price && (
                  <div style={{ gridColumn: 'span 2', padding: '10px 14px', background: 'rgba(42,125,79,0.08)', border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#888' }}>Profit margin</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#2a7d4f' }}>{(((parseFloat(form.price) - parseFloat(form.cost_price)) / parseFloat(form.price)) * 100).toFixed(1)}% · +${(parseFloat(form.price) - parseFloat(form.cost_price)).toFixed(2)}/unit</span>
                  </div>
                )}
              </div>

              {/* SECTION: Physical */}
              <div style={{ fontSize: 10, color: '#854f0b', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: 6, borderBottom: '0.5px solid rgba(133,79,11,0.2)' }}>Physical details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.25rem' }}>
                <div>
                  <label style={lbl}>Weight (e.g. 2.5 lbs)</label>
                  <input style={inp} value={form.weight} onChange={e => setField('weight', e.target.value)} placeholder="e.g. 2.5 lbs" />
                </div>
                <div>
                  <label style={lbl}>Dimensions (L x W x H)</label>
                  <input style={inp} value={form.dimensions} onChange={e => setField('dimensions', e.target.value)} placeholder="e.g. 12 x 8 x 6 in" />
                </div>
              </div>

              {/* SECTION: Description */}
              <div style={{ fontSize: 10, color: '#534ab7', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: 6, borderBottom: '0.5px solid rgba(83,74,183,0.2)' }}>Description</div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={lbl}>Product description (paste from Amazon)</label>
                <textarea style={{ ...inp, height: 90, resize: 'vertical' }} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Paste full product description from Amazon or write your own..." />
              </div>

              {/* SECTION: Media & Links */}
              <div style={{ fontSize: 10, color: '#e74c3c', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: 6, borderBottom: '0.5px solid rgba(231,76,60,0.2)' }}>Images & links</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
                <div>
                  <label style={lbl}>Upload product image</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                    style={{ ...inp, padding: '7px 12px', cursor: 'pointer' }} />
                  {imageFile && <div style={{ fontSize: 10, color: '#2a7d4f', marginTop: 4 }}>✓ {imageFile.name}</div>}
                </div>
                <div>
                  <label style={lbl}>Or image URL</label>
                  <input style={inp} value={form.image_url} onChange={e => setField('image_url', e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label style={lbl}>Amazon listing URL</label>
                  <input style={inp} value={form.amazon_url} onChange={e => setField('amazon_url', e.target.value)} placeholder="https://amazon.com/..." />
                </div>
                <div>
                  <label style={lbl}>Walmart listing URL</label>
                  <input style={inp} value={form.walmart_url} onChange={e => setField('walmart_url', e.target.value)} placeholder="https://walmart.com/..." />
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveProduct} disabled={saving || uploadingImg}
                  style={{ flex: 1, padding: 13, background: saving ? '#333' : editingId ? '#2d7dd2' : '#2a7d4f', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 4, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
                  {saving ? 'Saving...' : uploadingImg ? 'Uploading image...' : editingId ? '✓ Save changes' : '✓ Add product'}
                </button>
                <button onClick={() => { setShowAdd(false); setEditingId(null); setForm(emptyProduct) }}
                  style={{ padding: '13px 20px', background: 'transparent', color: '#555', fontSize: 12, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 4 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, SKU, brand..."
              style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: 11, padding: '7px 12px 7px 30px', borderRadius: 20, outline: 'none', fontFamily: 'inherit', width: 220 }} />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#555' }}>🔍</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
            {['all', ...CATEGORIES].map(cat => {
              const count = cat === 'all' ? products.length : products.filter(p => p.category === cat || (p.additional_categories || []).includes(cat)).length
              if (count === 0 && cat !== 'all') return null
              return (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${categoryFilter === cat ? '#2d7dd2' : 'rgba(255,255,255,0.08)'}`, background: categoryFilter === cat ? 'rgba(45,125,210,0.15)' : 'transparent', color: categoryFilter === cat ? '#2d7dd2' : '#666', textTransform: 'capitalize', fontWeight: categoryFilter === cat ? 700 : 400 }}>
                  {cat} <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '1px 5px' }}>{count}</span>
                </button>
              )
            })}
          </div>
          <button onClick={() => { setShowAdd(true); setEditingId(null); setForm(emptyProduct); setExpanded(null) }}
            style={{ padding: '9px 20px', background: '#2a7d4f', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 4, boxShadow: '0 4px 14px rgba(42,125,79,0.3)', flexShrink: 0 }}>
            + Add product
          </button>
        </div>

        {/* PRODUCTS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 14, color: '#555' }}>No products found</div>
            </div>
          ) : filtered.map(product => {
            const isExpanded = expanded === product.id
            const margin = product.price && product.cost_price ? (((product.price - product.cost_price) / product.price) * 100).toFixed(1) : null
            const stockColor = product.stock === 0 ? '#e74c3c' : product.stock <= 5 ? '#854f0b' : '#2a7d4f'

            return (
              <div key={product.id} style={{ background: '#111', border: `1px solid ${isExpanded ? 'rgba(45,125,210,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, overflow: 'hidden' }}>

                {/* ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', alignItems: 'center', gap: 0 }}>

                  {/* IMAGE */}
                  <div onClick={() => setExpanded(isExpanded ? null : product.id)} style={{ width: 56, height: 56, background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: 44, height: 44, objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: 22 }}>📦</span>
                    )}
                  </div>

                  {/* INFO */}
                  <div onClick={() => setExpanded(isExpanded ? null : product.id)} style={{ padding: '0.75rem 1rem', cursor: 'pointer', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{product.name}</div>
                      {product.brand && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(83,74,183,0.15)', color: '#a89af0', fontWeight: 600 }}>{product.brand}</span>}
                      {product.condition && product.condition !== 'New' && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(133,79,11,0.15)', color: '#c4893a', fontWeight: 600 }}>{product.condition}</span>}
                      {!product.active && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(100,100,100,0.15)', color: '#666', fontWeight: 600 }}>Hidden</span>}
                      {product.is_top_pick && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(255,180,0,0.15)', color: '#c49a00', fontWeight: 700 }}>⭐ Top Pick</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>{product.sku}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>${product.price?.toLocaleString()}</span>
                      {product.cost_price > 0 && <span style={{ fontSize: 10, color: '#555' }}>Cost: ${product.cost_price}</span>}
                      {margin && <span style={{ fontSize: 10, fontWeight: 600, color: parseFloat(margin) >= 20 ? '#2a7d4f' : '#854f0b' }}>{margin}% margin</span>}
                      <span style={{ fontSize: 10, fontWeight: 600, color: stockColor }}>{product.stock === 0 ? '✕ Out of stock' : product.stock <= 5 ? `⚠ ${product.stock} left` : `✓ ${product.stock} units`}</span>
                      <span style={{ fontSize: 10, color: '#444' }}>MOQ: {product.moq || 1}</span>
                      <span style={{ fontSize: 10, color: '#444', textTransform: 'capitalize' }}>{product.category}</span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div style={{ display: 'flex', gap: 6, padding: '0 1rem', alignItems: 'center', flexShrink: 0 }}>
                    <button onClick={async () => {
                      const supabase = createClient()
                      await supabase.from('products').update({ is_top_pick: !product.is_top_pick }).eq('id', product.id)
                      setProducts(prev => prev.map(p => p.id === product.id ? {...p, is_top_pick: !p.is_top_pick} : p))
                    }} style={{ fontSize: 11, color: product.is_top_pick ? '#c49a00' : '#555', background: product.is_top_pick ? 'rgba(255,180,0,0.1)' : 'rgba(255,255,255,0.04)', border: `0.5px solid ${product.is_top_pick ? 'rgba(255,180,0,0.3)' : 'rgba(255,255,255,0.08)'}`, padding: '5px 10px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }} title={product.is_top_pick ? 'Remove from Top Picks' : 'Add to Top Picks'}>
                      {product.is_top_pick ? '⭐' : '☆'}
                    </button>
                    <button onClick={() => startEdit(product)} style={{ fontSize: 11, color: '#2d7dd2', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.3)', padding: '5px 12px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => deleteProduct(product.id, product.name)} style={{ fontSize: 11, color: '#e74c3c', background: 'rgba(231,76,60,0.08)', border: '0.5px solid rgba(231,76,60,0.25)', padding: '5px 12px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                    <div onClick={() => setExpanded(isExpanded ? null : product.id)} style={{ fontSize: 16, color: '#444', cursor: 'pointer', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', padding: '0 4px' }}>⌄</div>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '1.25rem 1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.5rem' }}>

                      {/* Left: image + links */}
                      <div>
                        {product.image_url && (
                          <div style={{ background: '#0d0d0d', borderRadius: 6, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
                            <img src={product.image_url} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {product.amazon_url && <a href={product.amazon_url} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 10px', background: 'rgba(255,153,0,0.1)', border: '0.5px solid rgba(255,153,0,0.3)', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#FF9900', textDecoration: 'none', textAlign: 'center' }}>🛒 Amazon listing</a>}
                          {product.walmart_url && <a href={product.walmart_url} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 10px', background: 'rgba(0,113,206,0.1)', border: '0.5px solid rgba(0,113,206,0.3)', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#0071CE', textDecoration: 'none', textAlign: 'center' }}>🛒 Walmart listing</a>}
                        </div>
                      </div>

                      {/* Right: all details */}
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: '1rem' }}>
                          {[
                            ['Brand', product.brand || '—'],
                            ['Condition', product.condition || 'New'],
                            ['SKU', product.sku || '—'],
                            ['UPC', product.upc || '—'],
                            ['ASIN', product.asin || '—'],
                            ['Category', product.category],
                            ['Warehouse', product.warehouse || '—'],
                            ['Dispatch', product.dispatch_days || '—'],
                            ['Weight', product.weight || '—'],
                            ['Dimensions', product.dimensions || '—'],
                            ['Sale price', `$${product.price?.toLocaleString()}`],
                            ['Cost price', product.cost_price ? `$${product.cost_price}` : '—'],
                            ['Profit/unit', product.cost_price ? `$${(product.price - product.cost_price).toFixed(2)}` : '—'],
                            ['Margin', margin ? `${margin}%` : '—'],
                            ['Stock', `${product.stock} units`],
                            ['MOQ', `${product.moq || 1} units`],
                          ].map(([label, val]) => (
                            <div key={label} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4 }}>
                              <div style={{ fontSize: 8, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>{val}</div>
                            </div>
                          ))}
                        </div>

                        {product.additional_categories?.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Additional categories</div>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {product.additional_categories.map(cat => (
                                <span key={cat} style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(83,74,183,0.1)', border: '0.5px solid rgba(83,74,183,0.2)', borderRadius: 10, color: '#a89af0', textTransform: 'capitalize' }}>{cat}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {product.description && (
                          <div>
                            <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Description</div>
                            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.8, background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 4, border: '0.5px solid rgba(255,255,255,0.06)', maxHeight: 120, overflowY: 'auto' }}>{product.description}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
