'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'
const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

const CATEGORIES = ['tvs', 'electronics', 'small appliances', 'kitchen appliances', 'gaming', 'audio & speakers', 'computers & laptops', 'phones & accessories', 'cameras', 'smart home', 'appliances', 'other']
const CONDITIONS = ['New', 'Open Box', 'Refurbished', 'Used - Like New', 'Used - Good']

const emptyProduct = {
  name: '', sku: '', brand: '', category: 'electronics', additional_categories: [],
  condition: 'New', price: '', cost_price: '', stock: '', moq: '1',
  dispatch_days: '1-2 days', warehouse: 'WH: FL', upc: '', asin: '',
  weight: '', dimensions: '', description: '', image_url: '',
  amazon_url: '', walmart_url: '', active: true, variations: [], prep_fee: '',
}

const emptyVariation = { name: '', color: '', hex: '#888888', stock: '', price_diff: '0', image_url: '' }
const PRESET_COLORS = [
  { name:'Black',   hex:'#1a1a1a' },{ name:'White',   hex:'#f5f5f5' },
  { name:'Red',     hex:'#e74c3c' },{ name:'Blue',    hex:'#2d7dd2' },
  { name:'Green',   hex:'#2a7d4f' },{ name:'Yellow',  hex:'#f1c40f' },
  { name:'Orange',  hex:'#e67e22' },{ name:'Purple',  hex:'#8e44ad' },
  { name:'Pink',    hex:'#e91e8c' },{ name:'Gray',    hex:'#888888' },
  { name:'Silver',  hex:'#bdc3c7' },{ name:'Gold',    hex:'#c49a00' },
  { name:'Navy',    hex:'#2c3e7a' },{ name:'Teal',    hex:'#16a085' },
  { name:'Brown',   hex:'#795548' },{ name:'Beige',   hex:'#d4b896' },
]

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form,       setForm]       = useState(emptyProduct)
  const [importUrl,  setImportUrl]  = useState('')
  const [importing,  setImporting]  = useState(false)
  const [importMsg,  setImportMsg]  = useState('')
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [showVariations, setShowVariations] = useState(false)
  const [newVariation, setNewVariation] = useState(emptyVariation)
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

  const importFromUrl = async () => {
    if (!importUrl.trim()) return
    setImporting(true)
    setImportMsg('')
    try {
      const res  = await fetch('/api/scrape-product', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: importUrl.trim() }),
      })
      const data = await res.json()
      if (!data.success) { setImportMsg('❌ ' + (data.error || 'Failed')); setImporting(false); return }
      const p = data.product
      setForm(prev => ({
        ...prev,
        name:        p.name        || prev.name,
        brand:       p.brand       || prev.brand,
        sku:         p.sku         || p.model_number || prev.sku,
        category:    p.category    || prev.category,
        description: p.description || prev.description,
        weight:      p.weight      || prev.weight,
        dimensions:  p.dimensions  || prev.dimensions,
        amazon_url:  p.amazon_url  || prev.amazon_url,
        walmart_url: p.walmart_url || prev.walmart_url,
        upc:         p.upc         || prev.upc,
        asin:        p.sku?.startsWith('B0') ? p.sku : prev.asin,
      }))
      setImportMsg('✓ Imported: ' + p.name)
      setImportUrl('')
    } catch(e) {
      setImportMsg('❌ Error: ' + e.message)
    }
    setImporting(false)
  }

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
      const payload = {
        ...form,
        image_url: imageUrl,
        price: parseFloat(form.price) || 0,
        cost_price: parseFloat(form.cost_price) || null,
        stock: parseInt(form.stock) || 0,
        moq: parseInt(form.moq) || 1,
        delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
        sku: form.sku || null,
        upc: form.upc || null,
        asin: form.asin || null,
        weight: form.weight || null,
        dimensions: form.dimensions || null,
        condition: form.condition || null,
        warehouse: form.warehouse || null,
        amazon_url: form.amazon_url || null,
        walmart_url: form.walmart_url || null,
        description: form.description || null,
        brand: form.brand || null,
        variations: form.variations || [],
        prep_fee: form.prep_fee ? parseFloat(form.prep_fee) : null,
      }
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
      setShowVariations(false)
      setNewVariation(emptyVariation)
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

  const inp = { background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' }
  const lbl = { fontSize: 9, color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontWeight: 600 }

  if (loading) return <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Loading...</div>

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#111', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(0,0,0,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart'],['Offers','/admin/offers'],['Recruit','/admin/recruit'],['Analytics','/admin/insights']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Products' ? '#2d7dd2' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Products' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#999', border: '0.5px solid rgba(0,0,0,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* STATS */}
      <div style={{ padding: '1.25rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
        {[
          { label: 'Total products', value: products.length, color: '#2d7dd2', icon: '📦' },
          { label: 'Active', value: products.filter(p => p.active).length, color: '#2a7d4f', icon: '✅' },
          { label: 'Out of stock', value: products.filter(p => p.stock === 0).length, color: products.filter(p => p.stock === 0).length > 0 ? '#e74c3c' : '#555', icon: '⚠️' },
          { label: 'Low stock (≤5)', value: products.filter(p => p.stock > 0 && p.stock <= 5).length, color: '#854f0b', icon: '📉' },
          { label: 'Total units', value: products.reduce((s, p) => s + (p.stock || 0), 0), color: '#333', icon: '🔢' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 4, padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 9, color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
            <span style={{ fontSize: 18, opacity: 0.25 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>

        {/* ADD / EDIT FORM */}
        {showAdd && (
          <div style={{ background: '#fff', border: `1px solid ${editingId ? 'rgba(45,125,210,0.4)' : 'rgba(42,125,79,0.4)'}`, borderRadius: 6, marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ background: editingId ? 'rgba(45,125,210,0.08)' : 'rgba(42,125,79,0.08)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{editingId ? '✏️ Edit product' : '➕ Add new product'}</div>
              <button onClick={() => { setShowAdd(false); setEditingId(null); setForm(emptyProduct) }} style={{ background: 'rgba(0,0,0,0.08)', border: 'none', color: '#666', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            <div style={{ padding: '1.5rem' }}>

              {/* SECTION: Basic info */}
              {/* ── IMPORT FROM URL ── */}
              <div style={{ marginBottom: '1.5rem', padding: '16px', background: 'linear-gradient(135deg,rgba(45,125,210,0.06),rgba(83,74,183,0.04))', border: '1.5px solid rgba(45,125,210,0.2)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>
                  ⚡ Auto-import from Amazon or Walmart
                </div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 12, lineHeight: 1.6 }}>
                  Paste a product URL and all fields will fill automatically. You only need to add the price and images.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && importFromUrl()}
                    placeholder="https://www.amazon.com/dp/... or https://www.walmart.com/ip/..."
                    style={{ ...inp, flex: 1, fontSize: 12 }}
                  />
                  <button
                    onClick={importFromUrl}
                    disabled={importing || !importUrl.trim()}
                    style={{ padding: '0 20px', background: importing ? '#aaa' : '#2d7dd2', color: '#fff', border: 'none', borderRadius: 4, cursor: importing ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', whiteSpace: 'nowrap', minWidth: 120 }}
                  >
                    {importing ? '⏳ Importing...' : '⚡ Import'}
                  </button>
                </div>
                {importMsg && (
                  <div style={{ marginTop: 8, fontSize: 12, color: importMsg.startsWith('✓') ? '#2a7d4f' : '#e74c3c', fontWeight: 600 }}>
                    {importMsg}
                  </div>
                )}
              </div>

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
                  <label style={lbl}>Delivery time (days)</label>
                  <input style={inp} type="number" min="1" value={form.delivery_days || 2} onChange={e => setField('delivery_days', parseInt(e.target.value))} placeholder="2" />
                </div>
                <div>
                  <label style={lbl}>Prep center fee ($/unit)</label>
                  <input style={inp} type="number" step="0.25" min="0" value={form.prep_fee || ''} onChange={e => setField('prep_fee', e.target.value)} placeholder="e.g. 0.50 or 1.00" />
                  <div style={{ fontSize: 9, color: '#999', marginTop: 4 }}>Fee for labeling/prep service · typically $0.50–$1.00/unit</div>
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
                      style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${form.category === cat ? '#2d7dd2' : 'rgba(0,0,0,0.08)'}`, background: form.category === cat ? 'rgba(45,125,210,0.2)' : 'transparent', color: form.category === cat ? '#2d7dd2' : '#666', fontWeight: form.category === cat ? 700 : 400, textTransform: 'capitalize' }}>
                      {cat}
                    </button>
                  ))}
                </div>
                <label style={lbl}>Additional categories (optional)</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CATEGORIES.filter(c => c !== form.category).map(cat => (
                    <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                      style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${(form.additional_categories || []).includes(cat) ? '#534ab7' : 'rgba(0,0,0,0.06)'}`, background: (form.additional_categories || []).includes(cat) ? 'rgba(83,74,183,0.2)' : 'transparent', color: (form.additional_categories || []).includes(cat) ? '#a89af0' : '#555', textTransform: 'capitalize' }}>
                      {(form.additional_categories || []).includes(cat) ? '✓ ' : ''}{cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: Pricing & Stock */}
              <div style={{ fontSize: 10, color: '#2a7d4f', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: 6, borderBottom: '0.5px solid rgba(42,125,79,0.2)' }}>Pricing & inventory</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1rem' }}>
                <div>
                  <label style={lbl}>Cost price ($) *</label>
                  <input style={inp} type="number" value={form.cost_price} onChange={e => setField('cost_price', e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label style={lbl}>Sale price ($) *</label>
                  <input style={inp} type="number" value={form.price} onChange={e => setField('price', e.target.value)} placeholder="0.00" />
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
              </div>

              {/* MARGIN BUTTONS — outside grid */}
              {form.cost_price && parseFloat(form.cost_price) > 0 && (
                <div style={{ marginBottom: '1rem', padding: '14px 16px', background: 'rgba(42,125,79,0.04)', border: '1.5px solid rgba(42,125,79,0.2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 9, color: '#2a7d4f', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Auto-calculate sale price — cost: ${form.cost_price}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {[4, 5, 6, 7, 8, 10, 12, 15, 20].map(pct => {
                      const cost = parseFloat(form.cost_price) || 0
                      const salePrice = (cost * (1 + pct/100)).toFixed(2)
                      const isActive = parseFloat(form.price) === parseFloat(salePrice)
                      return (
                        <button key={pct} type="button" onClick={() => setField('price', salePrice)}
                          style={{ padding: '8px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
                            background: isActive ? '#2a7d4f' : '#fff',
                            color: isActive ? '#fff' : '#2a7d4f',
                            border: `2px solid ${isActive ? '#2a7d4f' : 'rgba(42,125,79,0.3)'}`,
                            boxShadow: isActive ? '0 2px 8px rgba(42,125,79,0.3)' : 'none',
                          }}>
                          +{pct}% → <strong>${salePrice}</strong>
                        </button>
                      )
                    })}
                  </div>
                  {form.price && form.cost_price && parseFloat(form.price) > 0 && (
                    <div style={{ fontSize: 12, color: '#2a7d4f', fontWeight: 700, padding: '6px 10px', background: 'rgba(42,125,79,0.08)', borderRadius: 6, display: 'inline-block' }}>
                      Margin: {(((parseFloat(form.price) - parseFloat(form.cost_price)) / parseFloat(form.price)) * 100).toFixed(1)}% · Profit: +${(parseFloat(form.price) - parseFloat(form.cost_price)).toFixed(2)}/unit
                    </div>
                  )}
                </div>
              )}

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

              {/* SECTION: Variations */}
              <div style={{ fontSize: 10, color: '#16a085', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem', paddingBottom: 6, borderBottom: '0.5px solid rgba(22,160,133,0.2)' }}>Color &amp; size variations</div>
              <div style={{ marginBottom: '1.25rem' }}>
                {/* Existing variations */}
                {form.variations?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {form.variations.map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px 6px 8px', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 20 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', background: v.hex, border: '1.5px solid rgba(255,255,255,0.2)', flexShrink: 0 }}/>
                        <span style={{ fontSize: 12, color: '#333', fontWeight: 600 }}>{v.name}</span>
                        {v.stock != null && <span style={{ fontSize: 10, color: '#999' }}>· {v.stock}u</span>}
                        {v.price_diff !== 0 && <span style={{ fontSize: 10, color: v.price_diff > 0 ? '#2a7d4f' : '#e74c3c' }}>{v.price_diff > 0 ? '+' : ''}${v.price_diff}</span>}
                        <button onClick={() => setForm(f => ({ ...f, variations: f.variations.filter((_, idx) => idx !== i) }))}
                          style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 14, padding: 0, marginLeft: 2, lineHeight: 1, display: 'flex', alignItems: 'center' }}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => setShowVariations(!showVariations)}
                  style={{ fontSize: 12, padding: '8px 16px', background: showVariations ? 'rgba(22,160,133,0.12)' : 'rgba(0,0,0,0.05)', color: showVariations ? '#16a085' : '#888', border: `0.5px solid ${showVariations ? 'rgba(22,160,133,0.3)' : 'rgba(0,0,0,0.1)'}`, borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, marginBottom: showVariations ? 12 : 0 }}>
                  {showVariations ? '▲ Close' : '+ Add color / size variation'}
                </button>

                {showVariations && (
                  <div style={{ background: 'rgba(22,160,133,0.04)', border: '1px solid rgba(22,160,133,0.15)', borderRadius: 8, padding: '1.25rem' }}>
                    {/* Preset colors */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>Quick select color</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {PRESET_COLORS.map(pc => (
                          <button key={pc.name} onClick={() => setNewVariation(v => ({ ...v, name: pc.name, hex: pc.hex }))} title={pc.name}
                            style={{ width: 32, height: 32, borderRadius: '50%', background: pc.hex, border: `3px solid ${newVariation.hex === pc.hex ? '#fff' : 'transparent'}`, cursor: 'pointer', outline: 'none', boxShadow: newVariation.hex === pc.hex ? '0 0 0 2px #16a085' : '0 1px 3px rgba(0,0,0,0.4)' }}/>
                        ))}
                      </div>
                    </div>
                    {/* Fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px 100px 100px', gap: 10, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Name * (e.g. Black, XL)</div>
                        <input value={newVariation.name} onChange={e => setNewVariation(v => ({ ...v, name: e.target.value }))} placeholder="Black, Red, XL..."
                          style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Display name (optional)</div>
                        <input value={newVariation.color} onChange={e => setNewVariation(v => ({ ...v, color: e.target.value }))} placeholder="e.g. Midnight Blue"
                          style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Color picker</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={newVariation.hex} onChange={e => setNewVariation(v => ({ ...v, hex: e.target.value }))}
                            style={{ width: 40, height: 38, borderRadius: 4, border: '0.5px solid rgba(0,0,0,0.1)', cursor: 'pointer', padding: 2, background: 'none' }}/>
                          <input value={newVariation.hex} onChange={e => setNewVariation(v => ({ ...v, hex: e.target.value }))}
                            style={{ flex: 1, background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 11, padding: '9px 8px', borderRadius: 4, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}/>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Stock (units)</div>
                        <input type="number" value={newVariation.stock} onChange={e => setNewVariation(v => ({ ...v, stock: e.target.value }))} placeholder="0"
                          style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>Price +/- ($)</div>
                        <input type="number" value={newVariation.price_diff} onChange={e => setNewVariation(v => ({ ...v, price_diff: e.target.value }))} placeholder="0"
                          style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}/>
                      </div>
                    </div>
                    {/* Variation image upload */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 8 }}>Photo for this variation (optional)</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input type="file" accept="image/*" onChange={async e => {
                          const file = e.target.files[0]
                          if (!file) return
                          const sb = createClient()
                          const ext = file.name.split('.').pop()
                          const path = 'products/' + Date.now() + '-var.' + ext
                          await sb.storage.from('product-images').upload(path, file, { upsert: true })
                          const { data } = sb.storage.from('product-images').getPublicUrl(path)
                          setNewVariation(v => ({ ...v, image_url: data.publicUrl }))
                        }}
                        style={{ background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 11, padding: '7px 10px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', cursor: 'pointer', flex: 1 }}/>
                        {newVariation.image_url && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={newVariation.image_url} style={{ width: 48, height: 48, objectFit: 'contain', background: '#fff', borderRadius: 4, border: '0.5px solid rgba(0,0,0,0.1)' }}/>
                            <button onClick={() => setNewVariation(v => ({ ...v, image_url: '' }))} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 18, padding: 0 }}>×</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => {
                          if (!newVariation.name) { alert('Enter a variation name'); return }
                          setForm(f => ({ ...f, variations: [...(f.variations || []), { ...newVariation, stock: newVariation.stock ? parseInt(newVariation.stock) : null, price_diff: parseFloat(newVariation.price_diff) || 0 }] }))
                          setNewVariation(emptyVariation)
                        }}
                        style={{ padding: '9px 20px', background: '#16a085', color: '#111', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
                        + Add variation
                      </button>
                      {newVariation.name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(0,0,0,0.05)', borderRadius: 20, fontSize: 11, color: '#777' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: newVariation.hex, border: '1px solid rgba(255,255,255,0.2)' }}/>
                          Preview: {newVariation.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                  style={{ flex: 1, padding: 13, background: saving ? '#333' : editingId ? '#2d7dd2' : '#2a7d4f', color: '#111', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 4, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
                  {saving ? 'Saving...' : uploadingImg ? 'Uploading image...' : editingId ? '✓ Save changes' : '✓ Add product'}
                </button>
                <button onClick={() => { setShowAdd(false); setEditingId(null); setForm(emptyProduct) }}
                  style={{ padding: '13px 20px', background: 'transparent', color: '#999', fontSize: 12, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 4 }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, SKU, brand..."
              style={{ background: 'rgba(0,0,0,0.05)', border: '0.5px solid rgba(0,0,0,0.1)', color: '#333', fontSize: 11, padding: '7px 12px 7px 30px', borderRadius: 20, outline: 'none', fontFamily: 'inherit', width: 220 }} />
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#999' }}>🔍</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
            {['all', ...CATEGORIES].map(cat => {
              const count = cat === 'all' ? products.length : products.filter(p => p.category === cat || (p.additional_categories || []).includes(cat)).length
              if (count === 0 && cat !== 'all') return null
              return (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  style={{ fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${categoryFilter === cat ? '#2d7dd2' : 'rgba(0,0,0,0.08)'}`, background: categoryFilter === cat ? 'rgba(45,125,210,0.15)' : 'transparent', color: categoryFilter === cat ? '#2d7dd2' : '#666', textTransform: 'capitalize', fontWeight: categoryFilter === cat ? 700 : 400 }}>
                  {cat} <span style={{ fontSize: 9, background: 'rgba(0,0,0,0.06)', borderRadius: 10, padding: '1px 5px' }}>{count}</span>
                </button>
              )
            })}
          </div>
          <button onClick={() => { setShowAdd(true); setEditingId(null); setForm(emptyProduct); setExpanded(null) }}
            style={{ padding: '9px 20px', background: '#2a7d4f', color: '#111', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 4, boxShadow: '0 4px 14px rgba(42,125,79,0.3)', flexShrink: 0 }}>
            + Add product
          </button>
        </div>

        {/* PRODUCTS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 6, padding: '4rem', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 14, color: '#999' }}>No products found</div>
            </div>
          ) : filtered.map(product => {
            const isExpanded = expanded === product.id
            const margin = product.price && product.cost_price ? (((product.price - product.cost_price) / product.price) * 100).toFixed(1) : null
            const stockColor = product.stock === 0 ? '#e74c3c' : product.stock <= 5 ? '#854f0b' : '#2a7d4f'

            return (
              <div key={product.id} style={{ background: '#fff', border: `1px solid ${isExpanded ? 'rgba(45,125,210,0.4)' : 'rgba(0,0,0,0.06)'}`, borderRadius: 6, overflow: 'hidden' }}>

                {/* ROW */}
                <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', alignItems: 'center', gap: 0 }}>

                  {/* IMAGE */}
                  <div onClick={() => setExpanded(isExpanded ? null : product.id)} style={{ width: 56, height: 56, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: 44, height: 44, objectFit: 'contain' }} />
                    ) : (
                      <span style={{ fontSize: 22 }}>📦</span>
                    )}
                  </div>

                  {/* INFO */}
                  <div onClick={() => setExpanded(isExpanded ? null : product.id)} style={{ padding: '0.75rem 1rem', cursor: 'pointer', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{product.name}</div>
                      {product.brand && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(83,74,183,0.15)', color: '#a89af0', fontWeight: 600 }}>{product.brand}</span>}
                      {product.condition && product.condition !== 'New' && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(133,79,11,0.15)', color: '#c4893a', fontWeight: 600 }}>{product.condition}</span>}
                      {!product.active && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(100,100,100,0.15)', color: '#666', fontWeight: 600 }}>Hidden</span>}
                      {product.is_top_pick && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: 'rgba(255,180,0,0.15)', color: '#c49a00', fontWeight: 700 }}>⭐ Top Pick</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#999', fontFamily: 'monospace' }}>{product.sku}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>${product.price?.toLocaleString()}</span>
                      {product.cost_price > 0 && <span style={{ fontSize: 10, color: '#999' }}>Cost: ${product.cost_price}</span>}
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
                    }} style={{ fontSize: 11, color: product.is_top_pick ? '#c49a00' : '#555', background: product.is_top_pick ? 'rgba(255,180,0,0.1)' : 'rgba(0,0,0,0.04)', border: `0.5px solid ${product.is_top_pick ? 'rgba(255,180,0,0.3)' : 'rgba(0,0,0,0.08)'}`, padding: '5px 10px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }} title={product.is_top_pick ? 'Remove from Top Picks' : 'Add to Top Picks'}>
                      {product.is_top_pick ? '⭐' : '☆'}
                    </button>
                    <button onClick={() => startEdit(product)} style={{ fontSize: 11, color: '#2d7dd2', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.3)', padding: '5px 12px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    <button onClick={async (e) => {
                      e.stopPropagation()
                      const sb = createClient()
                      await sb.from('products').update({ stock: 0 }).eq('id', product.id)
                      setProducts(prev => prev.map(p => p.id === product.id ? {...p, stock: 0} : p))
                    }} style={{ fontSize: 11, color: '#e67e22', background: 'rgba(230,126,34,0.08)', border: '0.5px solid rgba(230,126,34,0.25)', padding: '5px 12px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }} title="Set stock to 0">
                      Out of stock
                    </button>
                    <button onClick={() => deleteProduct(product.id, product.name)} style={{ fontSize: 11, color: '#e74c3c', background: 'rgba(231,76,60,0.08)', border: '0.5px solid rgba(231,76,60,0.25)', padding: '5px 12px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                    <div onClick={() => setExpanded(isExpanded ? null : product.id)} style={{ fontSize: 16, color: '#444', cursor: 'pointer', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', padding: '0 4px' }}>⌄</div>
                  </div>
                </div>

                {/* EXPANDED DETAILS */}
                {isExpanded && (
                  <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.06)', padding: '1.25rem 1.5rem', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.5rem' }}>

                      {/* Left: image + links */}
                      <div>
                        {product.image_url && (
                          <div style={{ background: '#f8f9fa', borderRadius: 6, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160 }}>
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
                            <div key={label} style={{ padding: '8px 10px', background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 4 }}>
                              <div style={{ fontSize: 8, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{val}</div>
                            </div>
                          ))}
                        </div>

                        {product.additional_categories?.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: 9, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Additional categories</div>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {product.additional_categories.map(cat => (
                                <span key={cat} style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(83,74,183,0.1)', border: '0.5px solid rgba(83,74,183,0.2)', borderRadius: 10, color: '#a89af0', textTransform: 'capitalize' }}>{cat}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {product.description && (
                          <div>
                            <div style={{ fontSize: 9, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Description</div>
                            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8, background: 'rgba(0,0,0,0.02)', padding: '10px 12px', borderRadius: 4, border: '0.5px solid rgba(0,0,0,0.06)', maxHeight: 120, overflowY: 'auto' }}>{product.description}</div>
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
