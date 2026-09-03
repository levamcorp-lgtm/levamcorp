'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'

const CATEGORIES = ['tvs', 'electronics', 'small appliances', 'kitchen appliances', 'gaming', 'audio & speakers', 'computers & laptops', 'phones & accessories', 'cameras', 'smart home', 'appliances', 'other']
const CONDITIONS = ['New', 'Open Box', 'Refurbished', 'Used - Like New', 'Used - Good']
const DISPATCH_OPTIONS = ['Same day', '1-2 days', '2-3 days', '3-5 days', '5-7 days', '1-2 weeks']
const WAREHOUSE_OPTIONS = ['WH: FL', 'WH: TX', 'WH: CA', 'WH: NY', 'WH: NJ']

const emptyProduct = {
  name: '', sku: '', brand: '', category: 'electronics', additional_categories: [],
  condition: 'New', price: '', cost_price: '', stock: '', moq: '1',
  dispatch_days: '1-2 days', warehouse: 'WH: FL', upc: '', asin: '',
  weight: '', dimensions: '', description: '', image_url: '',
  amazon_url: '', walmart_url: '', active: true, is_top_pick: false, variations: [], prep_fee: '', delivery_days: '2',
}
const emptyVariation = { name: '', color: '', hex: '#888888', stock: '', price_diff: '0', image_url: '' }
const PRESET_COLORS = [
  { name: 'Black', hex: '#1a1a1a' }, { name: 'White', hex: '#f5f5f5' },
  { name: 'Red', hex: '#e74c3c' }, { name: 'Blue', hex: '#2d7dd2' },
  { name: 'Green', hex: '#2a7d4f' }, { name: 'Yellow', hex: '#f1c40f' },
  { name: 'Orange', hex: '#e67e22' }, { name: 'Purple', hex: '#8e44ad' },
  { name: 'Pink', hex: '#e91e8c' }, { name: 'Gray', hex: '#888888' },
  { name: 'Silver', hex: '#bdc3c7' }, { name: 'Gold', hex: '#c49a00' },
  { name: 'Navy', hex: '#2c3e7a' }, { name: 'Teal', hex: '#16a085' },
  { name: 'Brown', hex: '#795548' }, { name: 'Beige', hex: '#d4b896' },
]

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
    <div data-scroll style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#ffffff', borderRight: '1px solid #e2e4e9' }}>
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

export default function AdminProducts() {
  const pathname = usePathname()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [hideOOS, setHideOOS] = useState(false)
  const [sort, setSort] = useState('Name')
  const [view, setView] = useState('All')
  const [selId, setSelId] = useState(null)
  const [dtab, setDtab] = useState('Money')
  const [edits, setEdits] = useState({})
  const [saving, setSaving] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyProduct)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [showVariations, setShowVariations] = useState(false)
  const [newVariation, setNewVariation] = useState(emptyVariation)

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

  const setField = useCallback((field, value) => setForm(prev => ({ ...prev, [field]: value })), [])
  const toggleCategory = useCallback((cat) => {
    setForm(prev => ({
      ...prev,
      additional_categories: prev.additional_categories?.includes(cat)
        ? prev.additional_categories.filter(c => c !== cat)
        : [...(prev.additional_categories || []), cat]
    }))
  }, [])

  const importFromUrl = async () => {
    if (!importUrl.trim()) return
    setImporting(true)
    setImportMsg('')
    try {
      const res = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      })
      const data = await res.json()
      if (!data.success) { setImportMsg('❌ ' + (data.error || 'Failed')); setImporting(false); return }
      const p = data.product
      setForm(prev => ({
        ...prev,
        name: p.name || prev.name,
        brand: p.brand || prev.brand,
        sku: p.sku || p.model_number || prev.sku,
        category: p.category || prev.category,
        description: p.description || prev.description,
        weight: p.weight || prev.weight,
        dimensions: p.dimensions || prev.dimensions,
        amazon_url: p.amazon_url || prev.amazon_url,
        walmart_url: p.walmart_url || prev.walmart_url,
        upc: p.upc || prev.upc,
        asin: p.asin || (p.sku?.startsWith('B0') ? p.sku : prev.asin),
        image_url: p.image_url || prev.image_url,
      }))
      const imgNote = p.image_url ? ' · Image preview ready — save product to upload image' : ' · No image found'
      setImportMsg('✓ Imported: ' + p.name + imgNote)
      setImportUrl('')
    } catch (e) {
      setImportMsg('❌ Error: ' + e.message)
    }
    setImporting(false)
  }

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
        const { error: updateErr } = await supabase.from('products').update(payload).eq('id', editingId)
        if (updateErr) throw new Error('Update failed: ' + updateErr.message)
      } else {
        const { error: insertErr } = await supabase.from('products').insert([payload])
        if (insertErr) throw new Error('Insert failed: ' + insertErr.message)
      }
      await loadProducts(supabase)
      closeAdd()
      alert('✓ Product saved successfully!')
    } catch (e) {
      console.error('Save error:', e)
      if (e.message.includes('duplicate key') && e.message.includes('sku')) {
        try {
          const supabase2 = createClient()
          let imageUrl2 = form.image_url
          if (imageFile) { imageUrl2 = await uploadImage(imageFile) || imageUrl2 }
          const payload2 = {
            ...form, image_url: imageUrl2, sku: null,
            price: parseFloat(form.price) || 0,
            cost_price: parseFloat(form.cost_price) || null,
            stock: parseInt(form.stock) || 0,
            moq: parseInt(form.moq) || 1,
          }
          if (editingId) await supabase2.from('products').update(payload2).eq('id', editingId)
          else {
            const { error: e2 } = await supabase2.from('products').insert([payload2])
            if (e2) throw new Error(e2.message)
          }
          await loadProducts(supabase2)
          closeAdd()
          alert('✓ Product saved! (SKU was duplicate so it was cleared — add a unique SKU manually)')
        } catch (e3) { alert('Error saving product: ' + e3.message) }
      } else {
        alert('Error saving product: ' + e.message)
      }
    }
    setSaving(false)
  }

  const closeAdd = () => {
    setShowAdd(false); setEditingId(null); setForm(emptyProduct); setImageFile(null)
    setShowVariations(false); setNewVariation(emptyVariation)
  }

  const startEdit = (product) => {
    setForm({ ...emptyProduct, ...product, additional_categories: product.additional_categories || [] })
    setEditingId(product.id)
    setShowAdd(true)
    setSelId(null)
    setImageFile(null)
  }

  const deleteProduct = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    if (selId === id) setSelId(null)
  }

  const toggleStockZero = async (product, ev) => {
    ev?.stopPropagation()
    const sb = createClient()
    const newStock = product.stock === 0 ? 1 : 0
    await sb.from('products').update({ stock: newStock }).eq('id', product.id)
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: newStock } : p))
    setEdits(prev => { if (!prev[product.id]?.stock) return prev; const n = { ...prev }; delete n[product.id].stock; return n })
  }

  const toggleActive = async (product) => {
    const sb = createClient()
    const next = !product.active
    await sb.from('products').update({ active: next }).eq('id', product.id)
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: next } : p))
  }

  const toggleTopPick = async (product) => {
    const sb = createClient()
    const next = !product.is_top_pick
    await sb.from('products').update({ is_top_pick: next }).eq('id', product.id)
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_top_pick: next } : p))
  }

  const setEdit = (id, key, value) => setEdits(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [key]: value } }))
  const clearEdits = (id) => setEdits(prev => { const n = { ...prev }; delete n[id]; return n })

  const saveEdits = async (product) => {
    const e = effectiveFor(product)
    setSaving(true)
    const sb = createClient()
    const { error } = await sb.from('products').update({ cost_price: e.nCost, price: e.nPrice, stock: e.nStock, moq: e.nMoq }).eq('id', product.id)
    if (error) { alert("Couldn't save changes: " + error.message); setSaving(false); return }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, cost_price: e.nCost, price: e.nPrice, stock: e.nStock, moq: e.nMoq } : p))
    clearEdits(product.id)
    setSaving(false)
  }

  const money = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const short = (n) => '$' + Math.round(n).toLocaleString('en-US')

  const effectiveFor = (p) => {
    const e = edits[p.id] || {}
    const cost = e.cost !== undefined ? e.cost : String(p.cost_price ?? 0)
    const price = e.price !== undefined ? e.price : String(p.price ?? 0)
    const stock = e.stock !== undefined ? e.stock : String(p.stock ?? 0)
    const moq = e.moq !== undefined ? e.moq : String(p.moq ?? 1)
    const nCost = parseFloat(cost) || 0
    const nPrice = parseFloat(price) || 0
    const nStock = parseInt(stock, 10) || 0
    const nMoq = parseInt(moq, 10) || 1
    return {
      cost, price, stock, moq, nCost, nPrice, nStock, nMoq,
      margin: nPrice > 0 ? ((nPrice - nCost) / nPrice) * 100 : 0,
      profit: nPrice - nCost,
      dirty: Object.keys(e).length > 0,
    }
  }

  const exportCSV = (list) => {
    const header = ['Name', 'Brand', 'SKU', 'UPC', 'ASIN', 'Category', 'Cost', 'Price', 'Margin %', 'Stock', 'MOQ', 'Visible', 'Top pick']
    const lines = list.map(p => {
      const margin = p.price > 0 ? (((p.price - (p.cost_price || 0)) / p.price) * 100).toFixed(1) : '0'
      return [p.name, p.brand || '', p.sku || '', p.upc || '', p.asin || '', p.category || '', p.cost_price || 0, p.price || 0, margin, p.stock || 0, p.moq || 1, p.active ? 'Yes' : 'No', p.is_top_pick ? 'Yes' : 'No']
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `levam-products-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectProduct = (id) => { setSelId(id); setDtab('Money') }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading products…</div>
      </div>
    </div>
  )

  const eff = {}
  products.forEach(p => { eff[p.id] = effectiveFor(p) })
  const outOfStock = products.filter(p => eff[p.id].nStock === 0)
  const hiddenByHand = products.filter(p => !p.active && eff[p.id].nStock > 0)
  const thin = products.filter(p => eff[p.id].margin < 5)
  const inventoryValue = products.reduce((s, p) => s + eff[p.id].nCost * eff[p.id].nStock, 0)
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort()
  const badges = { Products: { badge: String(products.length) } }
  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'

  const kpiDefs = [
    { key: 'All', k: 'Products in catalog', v: String(products.length), sub: 'everything you sell', icon: 'P' },
    { key: 'Out', k: 'Out of stock', v: String(outOfStock.length), sub: 'zero units — still listed, marked unavailable', icon: '!', strong: true },
    { key: 'Thin', k: 'Margin under 5%', v: String(thin.length), sub: 'barely making money', icon: '%', warn: true },
  ]

  let list = products.slice()
  if (hideOOS && view !== 'Out') list = list.filter(p => eff[p.id].nStock > 0)
  if (view === 'Out') list = list.filter(p => eff[p.id].nStock === 0)
  else if (view === 'Thin') list = list.filter(p => eff[p.id].margin < 5)
  if (categoryFilter !== 'all') list = list.filter(p => p.category === categoryFilter || (p.additional_categories || []).includes(categoryFilter))
  if (brandFilter !== 'all') list = list.filter(p => p.brand === brandFilter)
  const q = search.trim().toLowerCase()
  if (q) list = list.filter(p => (p.name + ' ' + (p.brand || '') + ' ' + (p.sku || '') + ' ' + (p.upc || '') + ' ' + (p.asin || '')).toLowerCase().includes(q))
  if (sort === 'Best margin') list.sort((a, b) => eff[b.id].margin - eff[a.id].margin)
  else if (sort === 'Worst margin') list.sort((a, b) => eff[a.id].margin - eff[b.id].margin)
  else if (sort === 'Most stock') list.sort((a, b) => eff[b.id].nStock - eff[a.id].nStock)
  else list.sort((a, b) => a.name.localeCompare(b.name))

  const sel = selId ? products.find(p => p.id === selId) : null
  const selEff = sel ? eff[sel.id] : null

  const cols = '42px minmax(230px, 1.9fr) 84px 100px 82px 100px 58px 92px 150px'

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .apr-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .apr-shell { grid-template-columns:1fr !important; } .apr-shell > div:first-child { position:static !important; max-height:none !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="apr-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={badges} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Products</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{products.length} products · {outOfStock.length} out of stock · {thin.length} with thin margin{hiddenByHand.length ? ` · ${hiddenByHand.length} hidden by you` : ''}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => { setShowAdd(true); setEditingId(null); setForm(emptyProduct); setSelId(null) }} style={{ border: 0, cursor: 'pointer', padding: '10px 16px 11px', borderRadius: 8, background: ACCENT, color: '#ffffff', fontSize: 14, fontWeight: 700 }}>+ Add product</button>
              <button type="button" onClick={() => exportCSV(list)} style={{ padding: '10px 14px 11px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>↓ Export list</button>
              <button type="button" onClick={handleLogout} style={{ padding: '10px 14px 11px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(196px, 1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
              {kpiDefs.map(d => {
                const on = d.key === view
                return (
                  <button key={d.key} type="button" onClick={() => { setView(on ? 'All' : d.key); setSelId(null) }} style={{ textAlign: 'left', cursor: 'pointer', border: `1px solid ${on ? '#16181d' : d.strong ? '#f6d5d5' : d.warn ? '#f3d9a4' : '#e2e4e9'}`, borderRadius: 12, background: on ? '#16181d' : d.strong ? '#fff6f6' : d.warn ? '#fffbf2' : '#ffffff', padding: '14px 15px 15px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 6, background: on ? 'rgba(255,255,255,.18)' : d.strong ? '#fee2e2' : d.warn ? '#fef3c7' : '#e8f0ff', color: on ? '#ffffff' : d.strong ? '#991b1b' : d.warn ? '#7c4a03' : DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>{d.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', color: on ? '#ffffff' : '#16181d' }}>{d.k}</span>
                    </span>
                    <span className="lc-mono" style={{ display: 'block', paddingTop: 9, fontWeight: 700, fontSize: 28, letterSpacing: '-.04em', color: on ? '#ffffff' : d.strong ? '#991b1b' : d.warn ? '#b45309' : '#16181d' }}>{d.v}</span>
                    <span style={{ display: 'block', paddingTop: 5, fontSize: 13, color: on ? '#c9ced6' : '#6b7280' }}>{d.sub}</span>
                  </button>
                )
              })}
              <div style={{ textAlign: 'left', border: '1px solid #e2e4e9', borderRadius: 12, background: '#ffffff', padding: '14px 15px 15px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 6, background: '#dcfce7', color: '#166534', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>$</span>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em' }}>Stock value at cost</span>
                </span>
                <span className="lc-mono" style={{ display: 'block', paddingTop: 9, fontWeight: 700, fontSize: 28, letterSpacing: '-.04em' }}>{short(inventoryValue)}</span>
                <span style={{ display: 'block', paddingTop: 5, fontSize: 13, color: '#6b7280' }}>what your inventory is worth</span>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9' }}>
                <span style={{ position: 'relative', flex: '1 1 250px', minWidth: 0 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', marginTop: -9, fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#8b909a' }}>⌕</span>
                  <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, SKU, UPC, ASIN or brand" style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px 33px', border: '1px solid #d9dce2', borderRadius: 9, fontSize: 14.5, color: '#16181d', background: '#ffffff' }} />
                </span>
                {brands.length > 0 && (
                  <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)} style={{ padding: '10px 12px 11px', border: '1px solid #d9dce2', borderRadius: 9, fontSize: 13.5, fontWeight: brandFilter !== 'all' ? 700 : 500, color: brandFilter !== 'all' ? DEEP : '#47505e', background: brandFilter !== 'all' ? '#e8f0ff' : '#ffffff', cursor: 'pointer' }}>
                    <option value="all">All brands</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                )}
                <span data-scroll style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflowX: 'auto', background: '#f7f8fa' }}>
                  {['Name', 'Best margin', 'Worst margin', 'Most stock'].map(label => {
                    const on = sort === label
                    return <button key={label} type="button" onClick={() => setSort(label)} style={{ flex: '0 0 auto', border: 0, cursor: 'pointer', padding: '9px 12px 10px', background: on ? '#ffffff' : 'transparent', color: on ? '#16181d' : '#6b7280', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{label}</button>
                  })}
                </span>
              </div>

              <div data-scroll style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '12px 15px 13px', borderBottom: '1px solid #e2e4e9' }}>
                <button type="button" onClick={() => { setHideOOS(h => !h); setSelId(null) }} title={hideOOS ? `Showing only products with stock — click to show all ${products.length}` : `Hide the ${outOfStock.length} products with no stock`} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${hideOOS ? '#16181d' : '#d9dce2'}`, borderRadius: 999, cursor: 'pointer', background: hideOOS ? '#16181d' : '#ffffff', color: hideOOS ? '#ffffff' : '#47505e', padding: '7px 13px 8px', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 17, height: 17, borderRadius: 4, border: `1px solid ${hideOOS ? '#ffffff' : '#c9ced6'}`, background: '#ffffff', color: '#16181d', fontSize: 11, fontWeight: 700 }}>{hideOOS ? '✓' : ''}</span>
                  Hide out of stock
                </button>
                <span style={{ flex: 'none', width: 1, alignSelf: 'stretch', background: '#e2e4e9', margin: '0 3px' }} />
                {['all', ...CATEGORIES].map(cat => {
                  const on = cat === categoryFilter
                  const n = cat === 'all' ? products.length : products.filter(p => p.category === cat || (p.additional_categories || []).includes(cat)).length
                  if (n === 0 && cat !== 'all') return null
                  return (
                    <button key={cat} type="button" onClick={() => { setCategoryFilter(cat); setSelId(null) }} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 999, cursor: 'pointer', background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#47505e', padding: '7px 13px 8px', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                      {cat === 'all' ? 'All products' : cat}
                      <span className="lc-mono" style={{ fontSize: 11.5, fontWeight: 700, padding: '1px 6px 2px', borderRadius: 4, background: on ? 'rgba(255,255,255,.2)' : '#eef0f4', color: on ? '#ffffff' : '#6b7280' }}>{n}</span>
                    </button>
                  )
                })}
              </div>

              <div data-scroll style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 1140 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'center', padding: '10px 15px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                    <span /><span>Product</span>
                    <span style={{ textAlign: 'right' }}>Cost</span>
                    <span style={{ textAlign: 'right' }}>We sell at</span>
                    <span style={{ textAlign: 'right' }}>Margin</span>
                    <span style={{ textAlign: 'right' }}>In stock</span>
                    <span style={{ textAlign: 'right' }}>MOQ</span>
                    <span style={{ textAlign: 'center' }}>Shown?</span>
                    <span style={{ textAlign: 'center' }}>Actions</span>
                  </div>

                  {list.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No products match</div>
                  ) : list.map(p => {
                    const e = eff[p.id]
                    const oos = e.nStock === 0
                    const dim = !p.active
                    const low = e.nStock > 0 && e.nStock <= 30
                    const thinM = e.margin < 5
                    const visible = p.active
                    const on = selId === p.id
                    return (
                      <div key={p.id} role="button" tabIndex={0} onClick={() => selectProduct(p.id)} onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectProduct(p.id) } }} style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'center', padding: '12px 15px 13px', borderBottom: '1px solid #f1f2f5', cursor: 'pointer', background: on ? '#f7f9fc' : dim ? '#fcfcfd' : '#ffffff', borderLeft: `4px solid ${!visible ? '#dc2626' : thinM ? '#f0b429' : 'transparent'}` }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 8, background: dim ? '#f1f2f5' : '#e8f0ff', color: dim ? '#8b909a' : DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, overflow: 'hidden' }}>
                          {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: 34, height: 34, objectFit: 'contain' }} /> : (p.brand || '?').slice(0, 3).toUpperCase()}
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <span title={p.name} style={{ minWidth: 0, fontSize: 14.5, fontWeight: 600, letterSpacing: '-.01em', lineHeight: 1.35, color: dim ? '#6b7280' : '#16181d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                            {p.is_top_pick && <span style={{ flex: 'none', fontSize: 11.5, fontWeight: 700, padding: '2px 7px 3px', borderRadius: 4, background: '#fef3c7', color: '#7c4a03' }}>Top pick</span>}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'nowrap', paddingTop: 5, fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: '#8b909a', overflow: 'hidden' }}>
                            <span style={{ flex: 'none', whiteSpace: 'nowrap', fontWeight: 700, color: '#47505e' }}>{p.brand || '—'}</span>
                            <span style={{ flex: 'none', whiteSpace: 'nowrap' }}>SKU {p.sku || '—'}</span>
                            <span style={{ flex: '0 1 auto', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'capitalize' }}>{p.category}</span>
                          </span>
                        </span>
                        <span style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: '#47505e' }}>{money(e.nCost)}</span>
                        <span style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: dim ? '#6b7280' : '#16181d' }}>{money(e.nPrice)}</span>
                        <span style={{ textAlign: 'right' }}>
                          <span className="lc-mono" style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, padding: '4px 8px 5px', borderRadius: 5, background: thinM ? '#fee2e2' : e.margin < 8 ? '#fef3c7' : '#dcfce7', color: thinM ? '#991b1b' : e.margin < 8 ? '#7c4a03' : '#166534' }}>{e.margin.toFixed(1)}%</span>
                        </span>
                        <span style={{ textAlign: 'right' }}>
                          <span className="lc-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: oos ? '#991b1b' : low ? '#8a5a00' : '#166534' }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: oos ? '#dc2626' : low ? '#f0b429' : '#16a34a' }} />{oos ? 'None' : `${e.nStock} u`}
                          </span>
                        </span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 13.5, color: '#47505e' }}>{e.nMoq}</span>
                        <span style={{ textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: visible ? '#dcfce7' : '#fee2e2', color: visible ? '#166534' : '#991b1b' }}>{visible ? 'Visible' : 'Hidden'}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button type="button" onClick={ev => toggleStockZero(p, ev)} title={oos ? 'Restore the stock this product had' : 'Set the stock to zero — it shows as unavailable to clients'} style={{ cursor: 'pointer', border: `1px solid ${oos ? '#86dfa5' : '#f3c9c9'}`, borderRadius: 7, background: oos ? '#dcfce7' : '#ffffff', color: oos ? '#166534' : '#991b1b', padding: '7px 9px 8px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{oos ? 'Back in stock' : 'Out of stock'}</button>
                          <span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 700, padding: '7px 9px 8px', borderRadius: 7, background: on ? ACCENT : '#eef0f4', color: on ? '#ffffff' : '#47505e' }}>Edit</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 15px 14px', background: '#fafbfc', borderTop: '1px solid #eceef2', fontSize: 13.5, color: '#6b7280' }}>
                <span>Showing {list.length} of {products.length} products{hideOOS ? ' · out-of-stock hidden' : ''}</span>
                <span>{hiddenByHand.length ? `${hiddenByHand.length} product${hiddenByHand.length === 1 ? '' : 's'} you hid on purpose` : 'Out-of-stock products still appear in the partner catalog, marked unavailable, unless a client hides them'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sel && (() => {
        const e0 = selEff
        const profitPerUnit = e0.nPrice - e0.nCost
        const oos = e0.nStock === 0
        const thinM = e0.margin < 5
        const dtabDefs = [
          { key: 'Money', label: 'Price & stock', icon: '$' },
          { key: 'Info', label: 'Product details', icon: 'i' },
          { key: 'Links', label: 'Photo & links', icon: 'P' },
        ]
        return (
          <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(22,24,29,.42)', display: 'flex', justifyContent: 'flex-end' }} onClick={() => setSelId(null)}>
            <div data-scroll onClick={ev => ev.stopPropagation()} style={{ width: '100%', maxWidth: 620, height: '100%', overflowY: 'auto', background: '#ffffff', borderLeft: '1px solid #d9dce2' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#ffffff', borderBottom: '1px solid #e2e4e9', padding: '16px 20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                  <span style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                    <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: 10, background: '#e8f0ff', color: DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, overflow: 'hidden' }}>
                      {sel.image_url ? <img src={sel.image_url} alt={sel.name} style={{ width: 38, height: 38, objectFit: 'contain' }} /> : (sel.brand || '?').slice(0, 3).toUpperCase()}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 17, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.35 }}>{sel.name}</span>
                      <span className="lc-mono" style={{ display: 'block', paddingTop: 5, fontSize: 12.5, color: '#6b7280' }}>{sel.brand || '—'} · SKU {sel.sku || '—'} · {sel.category}</span>
                    </span>
                  </span>
                  <button type="button" onClick={() => setSelId(null)} aria-label="Close" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '8px 12px 9px', fontSize: 14, fontWeight: 600, color: '#47505e' }}>Close ✕</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 12 }}>
                  <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
                    {dtabDefs.map(t => {
                      const on = dtab === t.key
                      return <button key={t.key} type="button" onClick={() => setDtab(t.key)} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, borderBottom: `3px solid ${on ? ACCENT : 'transparent'}`, background: 'transparent', cursor: 'pointer', padding: '9px 12px 11px', fontSize: 14.5, fontWeight: on ? 700 : 500, color: on ? '#16181d' : '#6b7280', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: 5, background: on ? ACCENT : '#eef0f4', color: on ? '#ffffff' : '#6b7280', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{t.icon}</span>
                        {t.label}
                      </button>
                    })}
                  </div>
                  <button type="button" onClick={() => startEdit(sel)} style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '7px 11px 8px', fontSize: 12.5, fontWeight: 700, color: DEEP, whiteSpace: 'nowrap' }}>Edit full details →</button>
                </div>
              </div>

              <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {dtab === 'Money' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))', gap: 10 }}>
                      {[
                        { k: 'You pay', v: money(e0.nCost), sub: 'your cost', bg: '#ffffff', border: '#e2e4e9', ink: '#16181d' },
                        { k: 'You sell at', v: money(e0.nPrice), sub: 'partner price', bg: '#ffffff', border: '#e2e4e9', ink: '#16181d' },
                        { k: 'You keep', v: money(profitPerUnit), sub: 'per unit', bg: thinM ? '#fff6f6' : '#f3faf5', border: thinM ? '#f6d5d5' : '#cfe8d7', ink: thinM ? '#991b1b' : '#166534' },
                        { k: 'Margin', v: e0.margin.toFixed(1) + '%', sub: thinM ? 'under 5% — very thin' : 'healthy', bg: thinM ? '#fff6f6' : '#f3faf5', border: thinM ? '#f6d5d5' : '#cfe8d7', ink: thinM ? '#991b1b' : '#166534' },
                      ].map(m => (
                        <div key={m.k} style={{ border: `1px solid ${m.border}`, borderRadius: 11, background: m.bg, padding: '12px 13px 13px' }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#6b7280' }}>{m.k}</div>
                          <div className="lc-mono" style={{ paddingTop: 7, fontWeight: 700, fontSize: 21, letterSpacing: '-.03em', color: m.ink }}>{m.v}</div>
                          <div style={{ paddingTop: 4, fontSize: 12, color: '#6b7280' }}>{m.sub}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9', background: '#f3faf5', borderLeft: '5px solid #16a34a', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: '#166534' }}>Change the numbers</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: '#eceef2' }}>
                        {[
                          { k: 'Cost price ($)', field: 'cost', v: e0.cost, hint: 'what you pay the supplier' },
                          { k: 'Sale price ($)', field: 'price', v: e0.price, hint: 'what partners pay you' },
                          { k: 'Units in stock', field: 'stock', v: e0.stock, hint: oos ? 'at zero it shows as unavailable' : 'counted at the Doral warehouse', warn: oos },
                          { k: 'Minimum order (MOQ)', field: 'moq', v: e0.moq, hint: 'smallest quantity a partner can buy' },
                        ].map(f => (
                          <div key={f.k} style={{ background: '#ffffff', padding: '13px 15px 14px' }}>
                            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }}>{f.k}</label>
                            <input type="text" value={f.v} onChange={ev => setEdit(sel.id, f.field, ev.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px', border: '1px solid #d9dce2', borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 700, color: '#16181d', background: '#ffffff' }} />
                            <div style={{ paddingTop: 6, fontSize: 12, color: f.warn ? '#991b1b' : '#6b7280' }}>{f.hint}</div>
                          </div>
                        ))}
                      </div>
                      {e0.dirty && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '13px 15px 14px', background: '#fffbf2', borderTop: '1px solid #f3d9a4' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#b45309' }}>Unsaved changes</span>
                          <span style={{ display: 'flex', gap: 8 }}>
                            <button type="button" onClick={() => clearEdits(sel.id)} style={{ border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '9px 13px 10px', fontSize: 13, fontWeight: 600, color: '#47505e' }}>Undo</button>
                            <button type="button" onClick={() => saveEdits(sel)} disabled={saving} style={{ border: 0, borderRadius: 8, background: '#16a34a', cursor: saving ? 'not-allowed' : 'pointer', padding: '9px 15px 10px', fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{saving ? 'Saving…' : 'Save changes'}</button>
                          </span>
                        </div>
                      )}
                    </div>

                    <div style={{ border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>Should clients see it?</div>
                      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', padding: '14px 15px 0' }}>
                        <button type="button" onClick={() => sel.active && toggleActive(sel)} style={{ flex: '1 1 150px', cursor: 'pointer', border: `1px solid ${sel.active ? '#16a34a' : '#d9dce2'}`, borderRadius: 9, background: sel.active ? '#f3faf5' : '#ffffff', color: sel.active ? '#166534' : '#16181d', padding: '12px 13px 13px', textAlign: 'left' }}>
                          <span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>Visible</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 12.5, color: '#6b7280' }}>Partners can see and order it</span>
                        </button>
                        <button type="button" onClick={() => !sel.active && toggleActive(sel)} style={{ flex: '1 1 150px', cursor: 'pointer', border: `1px solid ${!sel.active ? '#dc2626' : '#d9dce2'}`, borderRadius: 9, background: !sel.active ? '#fff6f6' : '#ffffff', color: !sel.active ? '#991b1b' : '#16181d', padding: '12px 13px 13px', textAlign: 'left' }}>
                          <span style={{ display: 'block', fontSize: 14, fontWeight: 700 }}>Hidden</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 12.5, color: '#6b7280' }}>Kept in the catalog but not shown at all</span>
                        </button>
                      </div>
                      {oos && (
                        <div style={{ margin: '11px 15px 0', padding: '10px 12px 11px', borderRadius: 8, background: '#fffbf2', borderLeft: '4px solid #f0b429', fontSize: 13, lineHeight: 1.5, color: '#8a5a00' }}>Zero stock does not hide this on its own — it still appears in the catalog marked "Out of stock" unless you set it to Hidden or a client filters it out.</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', margin: '14px 15px 16px', padding: '13px 14px 14px', border: `1px solid ${sel.is_top_pick ? '#f0b429' : '#d9dce2'}`, borderRadius: 9, background: sel.is_top_pick ? '#fffbf2' : '#ffffff' }}>
                        <span>
                          <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: sel.is_top_pick ? '#8a5a00' : '#16181d' }}>Feature as a Top pick</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 12.5, color: '#6b7280' }}>Shown first in the partner catalog</span>
                        </span>
                        <button type="button" onClick={() => toggleTopPick(sel)} style={{ flex: 'none', cursor: 'pointer', border: `1px solid ${sel.is_top_pick ? '#f0b429' : '#d9dce2'}`, borderRadius: 8, background: '#ffffff', color: sel.is_top_pick ? '#8a5a00' : '#47505e', padding: '10px 14px 11px', fontSize: 13.5, fontWeight: 700 }}>{sel.is_top_pick ? 'Yes — featured first' : 'No — regular product'}</button>
                      </div>
                    </div>
                  </div>
                )}

                {dtab === 'Info' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { label: 'What it is', icon: 'i', bar: '#0ea5e9', headBg: '#f2fafe', border: '#cfe8f6', titleInk: '#075985', rows: [
                        ['Full name', sel.name, 14.5, 600],
                        ['Brand', sel.brand || '—', 15, 700],
                        ['Category', sel.category, 14.5, 500],
                        ['Condition', sel.condition || 'New', 14.5, 500],
                      ]},
                      { label: 'Codes that identify it', icon: '#', bar: '#7c3aed', headBg: '#f7f5fe', border: '#ddd6f3', titleInk: '#4c1d95', mono: true, rows: [
                        ['SKU', sel.sku || '—', 15, 700],
                        ['UPC', sel.upc || '—', 15, 700],
                        ['ASIN (Amazon)', sel.asin || '—', 15, 700],
                      ]},
                      { label: 'Shipping and handling', icon: 'W', bar: '#f0b429', headBg: '#fffdf5', border: '#f3e4bd', titleInk: '#8a5a00', rows: [
                        ['Weight', sel.weight || '—', 14.5, 600],
                        ['Dimensions', sel.dimensions || '—', 14.5, 600],
                        ['Warehouse', sel.warehouse || '—', 14.5, 500],
                        ['Dispatch time', sel.dispatch_days || '—', 14.5, 500],
                        ['Delivery time', sel.delivery_days ? `${sel.delivery_days} days` : '—', 14.5, 500],
                        ['Prep centre fee', sel.prep_fee ? `${money(sel.prep_fee)} per unit` : '—', 14.5, 500],
                      ]},
                    ].map(g => (
                      <div key={g.label} style={{ border: `1px solid ${g.border}`, borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px 14px', borderBottom: `1px solid ${g.border}`, background: g.headBg, borderLeft: `5px solid ${g.bar}` }}>
                          <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: g.bar, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>{g.icon}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: g.titleInk }}>{g.label}</span>
                        </div>
                        {g.rows.map(([k, v, size, weight]) => (
                          <div key={k} style={{ display: 'grid', gridTemplateColumns: 'clamp(104px,30%,150px) minmax(0,1fr)', gap: 12, alignItems: 'baseline', padding: '11px 15px 12px', borderBottom: '1px solid #f1f2f5' }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>{k}</span>
                            <span className={g.mono ? 'lc-mono' : ''} style={{ fontSize: size, fontWeight: weight, lineHeight: 1.5, color: '#16181d', wordBreak: 'break-word' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                    {sel.additional_categories?.length > 0 && (
                      <div style={{ border: '1px solid #ddd6f3', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ padding: '13px 15px 14px', borderBottom: '1px solid #ddd6f3', background: '#f7f5fe', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: '#4c1d95' }}>Also listed under</div>
                        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', padding: '14px 15px 15px' }}>
                          {sel.additional_categories.map(c => <span key={c} style={{ fontSize: 12.5, fontWeight: 600, padding: '5px 11px 6px', borderRadius: 999, background: '#f7f5fe', border: '1px solid #ddd6f3', color: '#4c1d95', textTransform: 'capitalize' }}>{c}</span>)}
                        </div>
                      </div>
                    )}
                    {sel.description && (
                      <div style={{ border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>Description clients see</div>
                        <div style={{ padding: '14px 15px 15px', fontSize: 13.5, lineHeight: 1.7, color: '#47505e', maxHeight: 160, overflowY: 'auto' }}>{sel.description}</div>
                      </div>
                    )}
                  </div>
                )}

                {dtab === 'Links' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ border: '1px solid #ddd6f3', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px 14px', borderBottom: '1px solid #ddd6f3', background: '#f7f5fe' }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#7c3aed', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>P</span>
                        <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: '#4c1d95' }}>Product photo</span>
                      </div>
                      <div style={{ padding: '14px 15px 16px' }}>
                        <div style={{ display: 'grid', placeItems: 'center', aspectRatio: '16 / 9', border: '1px dashed #c9ced6', borderRadius: 10, background: '#fafbfc', overflow: 'hidden' }}>
                          {sel.image_url ? <img src={sel.image_url} alt={sel.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /> : (
                            <span style={{ textAlign: 'center' }}>
                              <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700, color: '#47505e' }}>No photo uploaded yet</span>
                              <span style={{ display: 'block', paddingTop: 5, fontSize: 12.5, color: '#8b909a' }}>Partners see a grey box until you add one</span>
                            </span>
                          )}
                        </div>
                        <button type="button" onClick={() => startEdit(sel)} style={{ marginTop: 12, width: '100%', textAlign: 'center', padding: '11px 13px 12px', borderRadius: 8, background: ACCENT, color: '#ffffff', fontSize: 14, fontWeight: 700, border: 0, cursor: 'pointer' }}>Change photo in full editor →</button>
                      </div>
                    </div>

                    <div style={{ border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>Where it is listed</div>
                      {[
                        sel.asin && { k: 'Amazon listing', v: `amazon.com/dp/${sel.asin}`, href: sel.amazon_url || `https://www.amazon.com/dp/${sel.asin}`, icon: 'A', iBg: '#fef3c7', iInk: '#7c4a03' },
                        sel.upc && { k: 'Walmart search by UPC', v: `walmart.com/search?q=${sel.upc}`, href: sel.walmart_url || `https://www.walmart.com/search?q=${sel.upc}`, icon: 'W', iBg: '#e8f0ff', iInk: DEEP },
                      ].filter(Boolean).map(l => (
                        <div key={l.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 15px 13px', borderBottom: '1px solid #f1f2f5' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 5, background: l.iBg, color: l.iInk, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{l.icon}</span>
                            <span style={{ minWidth: 0 }}>
                              <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{l.k}</span>
                              <span className="lc-mono" style={{ display: 'block', paddingTop: 3, fontSize: 12, color: '#8b909a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.v}</span>
                            </span>
                          </span>
                          <a href={l.href} target="_blank" rel="noopener noreferrer" style={{ flex: 'none', padding: '7px 11px 8px', border: '1px solid #d9dce2', borderRadius: 7, fontSize: 13, fontWeight: 700, color: '#47505e' }}>Open ↗</a>
                        </div>
                      ))}
                      {!sel.asin && !sel.upc && <div style={{ padding: '2rem', textAlign: 'center', color: '#8b909a', fontSize: 13 }}>No marketplace links on file</div>}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: 'sticky', bottom: 0, background: '#ffffff', borderTop: '1px solid #e2e4e9', padding: '13px 20px 16px' }}>
                <button type="button" onClick={() => deleteProduct(sel.id, sel.name)} style={{ padding: '11px 14px 12px', border: '1px solid #f3c9c9', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#991b1b', background: '#ffffff', cursor: 'pointer' }}>Delete product</button>
              </div>
            </div>
          </div>
        )
      })()}

      {showAdd && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(22,24,29,.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'clamp(10px,3vh,32px) clamp(10px,3vw,30px)', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: 1080, background: '#ffffff', border: '1px solid #d9dce2', borderRadius: 14, overflow: 'hidden' }}>

            <div style={{ position: 'sticky', top: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '16px 20px 17px', borderBottom: '1px solid #e2e4e9', background: '#ffffff' }}>
              <span>
                <span style={{ display: 'block', fontSize: 19, fontWeight: 700, letterSpacing: '-.02em' }}>{editingId ? 'Edit product' : 'Add a new product'}</span>
                <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>Fields marked * are required. Everything else is optional.</span>
              </span>
              <button type="button" onClick={closeAdd} aria-label="Close" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '8px 12px 9px', fontSize: 14, fontWeight: 600, color: '#47505e' }}>Close ✕</button>
            </div>

            <div style={{ padding: '16px 20px 0' }}>
              <div style={{ border: '1px solid #cfe0fb', borderRadius: 12, background: '#f2f7ff', padding: '15px 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10 }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: ACCENT, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>⚡</span>
                  <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: DEEP }}>Auto-import from Amazon or Walmart</span>
                </div>
                <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                  <input type="url" value={importUrl} onChange={e => setImportUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && importFromUrl()} placeholder="https://www.amazon.com/dp/… or https://www.walmart.com/ip/…" style={{ flex: '1 1 320px', minWidth: 0, boxSizing: 'border-box', padding: '12px 13px 13px', border: '1px solid #b9cdf0', borderRadius: 9, fontSize: 14.5, color: '#16181d', background: '#ffffff' }} />
                  <button type="button" onClick={importFromUrl} disabled={importing || !importUrl.trim()} style={{ flex: '0 0 auto', padding: '12px 20px 13px', border: 0, borderRadius: 9, background: importing ? '#8b909a' : ACCENT, color: '#ffffff', fontSize: 14.5, fontWeight: 700, cursor: importing ? 'not-allowed' : 'pointer' }}>{importing ? '⏳ Importing…' : '⚡ Import'}</button>
                </div>
                <div style={{ paddingTop: 8, fontSize: 12.5, color: '#47505e' }}>Paste a product URL and all fields fill automatically. You only need to add the price and images.</div>
                {importMsg && <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 700, color: importMsg.startsWith('✓') ? '#166534' : '#991b1b' }}>{importMsg}</div>}
              </div>
            </div>

            {/* Basic information */}
            <div style={{ padding: '18px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 11 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: ACCENT, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>1</span>
                <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: DEEP }}>Basic information</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>What the product is</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, background: '#eceef2', border: '1px solid #cfe0fb', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: '#ffffff', padding: '13px 15px 14px', gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }}>Product name *</label>
                  <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Full product name" style={fieldInp} />
                  <div style={{ paddingTop: 6, fontSize: 12, color: '#6b7280' }}>Exactly as partners should see it</div>
                </div>
                <FormField label="Brand" value={form.brand} onChange={v => setField('brand', v)} placeholder="e.g. JBL, LG, Ninja" />
                <FormField label="SKU" value={form.sku} onChange={v => setField('sku', v)} placeholder="Product SKU" />
                <FormField label="UPC" value={form.upc} onChange={v => setField('upc', v)} placeholder="Universal product code" />
                <FormField label="ASIN (Amazon)" value={form.asin} onChange={v => setField('asin', v)} placeholder="Amazon ASIN" />
                <ChipSelectField label="Condition" options={CONDITIONS} value={form.condition} onChange={v => setField('condition', v)} />
                <FormField label="Delivery time (days)" value={form.delivery_days} onChange={v => setField('delivery_days', v)} placeholder="2" />
                <FormField label="Prep center fee ($/unit)" value={form.prep_fee} onChange={v => setField('prep_fee', v)} placeholder="e.g. 0.50 or 1.00" hint="Labeling/prep service · typically $0.50–$1.00 per unit" />
                <ChipSelectField label="Shown to clients" options={['Active — visible', 'Hidden']} value={form.active ? 'Active — visible' : 'Hidden'} onChange={v => setField('active', v === 'Active — visible')} />
                <ChipSelectField label="Top pick" options={['No — regular product', 'Yes — featured first']} value={form.is_top_pick ? 'Yes — featured first' : 'No — regular product'} onChange={v => setField('is_top_pick', v.startsWith('Yes'))} />
              </div>
            </div>

            {/* Category */}
            <div style={{ padding: '18px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 11 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#0ea5e9', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>2</span>
                <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#075985' }}>Category</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Where it appears in the catalog</span>
              </div>
              <div style={{ display: 'grid', gap: 1, background: '#eceef2', border: '1px solid #cfe8f6', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: '#ffffff', padding: '13px 15px 14px' }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }}>Primary category *</label>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => setField('category', cat)} style={{ cursor: 'pointer', border: `1px solid ${form.category === cat ? '#16181d' : '#d9dce2'}`, borderRadius: 999, background: form.category === cat ? '#16181d' : '#ffffff', color: form.category === cat ? '#ffffff' : '#47505e', padding: '7px 13px 8px', fontSize: 13.5, fontWeight: form.category === cat ? 700 : 500, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{cat}</button>
                    ))}
                  </div>
                  <div style={{ paddingTop: 6, fontSize: 12, color: '#6b7280' }}>Pick one</div>
                </div>
                <div style={{ background: '#ffffff', padding: '13px 15px 14px' }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }}>Additional categories (optional)</label>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {CATEGORIES.filter(c => c !== form.category).map(cat => {
                      const on = (form.additional_categories || []).includes(cat)
                      return <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{ cursor: 'pointer', border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 999, background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#47505e', padding: '7px 13px 8px', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{cat}</button>
                    })}
                  </div>
                  <div style={{ paddingTop: 6, fontSize: 12, color: '#6b7280' }}>Pick as many as apply</div>
                </div>
              </div>
            </div>

            {/* Pricing and inventory */}
            <div style={{ padding: '18px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 11 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#16a34a', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>3</span>
                <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#166534' }}>Pricing and inventory</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>The money and the stock</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 1, background: '#eceef2', border: '1px solid #cfe8d7', borderRadius: 12, overflow: 'hidden' }}>
                <FormField label="Cost price ($) *" value={form.cost_price} onChange={v => setField('cost_price', v)} placeholder="0.00" hint="what you pay the supplier" mono />
                <FormField label="Sale price ($) *" value={form.price} onChange={v => setField('price', v)} placeholder="0.00" hint="what partners pay you" mono />
                <FormField label="Stock (units)" value={form.stock} onChange={v => setField('stock', v)} placeholder="0" hint="at zero it stays unavailable until restocked" mono />
                <FormField label="MOQ (min order)" value={form.moq} onChange={v => setField('moq', v)} placeholder="1" hint="smallest quantity a partner can buy" mono />
                <ChipSelectField label="Dispatch time" options={DISPATCH_OPTIONS} value={form.dispatch_days} onChange={v => setField('dispatch_days', v)} />
                <ChipSelectField label="Warehouse" options={WAREHOUSE_OPTIONS} value={form.warehouse} onChange={v => setField('warehouse', v)} />
              </div>
              {form.cost_price && parseFloat(form.cost_price) > 0 && (
                <div style={{ marginTop: 10, padding: '14px 15px 15px', background: '#f3faf5', border: '1px solid #cfe8d7', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Auto-calculate sale price — cost: ${form.cost_price}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[4, 5, 6, 7, 8, 10, 12, 15, 20].map(pct => {
                      const cost = parseFloat(form.cost_price) || 0
                      const salePrice = (cost * (1 + pct / 100)).toFixed(2)
                      const isActive = parseFloat(form.price) === parseFloat(salePrice)
                      return (
                        <button key={pct} type="button" onClick={() => setField('price', salePrice)} style={{ padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontWeight: 700, background: isActive ? '#16a34a' : '#ffffff', color: isActive ? '#ffffff' : '#166534', border: `1.5px solid ${isActive ? '#16a34a' : '#cfe8d7'}` }}>+{pct}% → ${salePrice}</button>
                      )
                    })}
                  </div>
                  {form.price && parseFloat(form.price) > 0 && (
                    <div style={{ marginTop: 10, fontSize: 12.5, fontWeight: 700, color: '#166534', padding: '7px 11px', background: '#ffffff', borderRadius: 8, display: 'inline-block' }}>
                      Margin: {(((parseFloat(form.price) - parseFloat(form.cost_price)) / parseFloat(form.price)) * 100).toFixed(1)}% · Profit: +${(parseFloat(form.price) - parseFloat(form.cost_price)).toFixed(2)}/unit
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Physical details */}
            <div style={{ padding: '18px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 11 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#f0b429', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>4</span>
                <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#8a5a00' }}>Physical details</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Used for freight quotes</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 1, background: '#eceef2', border: '1px solid #f3e4bd', borderRadius: 12, overflow: 'hidden' }}>
                <FormField label="Weight" value={form.weight} onChange={v => setField('weight', v)} placeholder="e.g. 2.5 lbs" />
                <FormField label="Dimensions (L x W x H)" value={form.dimensions} onChange={v => setField('dimensions', v)} placeholder="e.g. 12 x 8 x 6 in" />
              </div>
            </div>

            {/* Description */}
            <div style={{ padding: '18px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 11 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#7c3aed', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>5</span>
                <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#4c1d95' }}>Description</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Paste it from Amazon or write your own</span>
              </div>
              <div style={{ border: '1px solid #ddd6f3', borderRadius: 12, background: '#ffffff', padding: '13px 15px 14px' }}>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }}>Product description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={5} placeholder="Paste the full product description from Amazon or write your own…" style={{ ...fieldInp, resize: 'vertical', lineHeight: 1.55 }} />
              </div>
            </div>

            {/* Variations */}
            <div style={{ padding: '18px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 11 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#8b909a', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>6</span>
                <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Colour and size variations</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Only if the product comes in options</span>
              </div>
              <div style={{ border: '1px solid #e2e4e9', borderRadius: 12, background: '#ffffff', padding: '13px 15px 14px' }}>
                {form.variations?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {form.variations.map((v, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px 7px 9px', background: '#f7f8fa', border: '1px solid #d9dce2', borderRadius: 999 }}>
                        {v.image_url ? <img src={v.image_url} style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 4, background: '#fff' }} /> : <div style={{ width: 16, height: 16, borderRadius: '50%', background: v.hex, border: '1.5px solid #ffffff', boxShadow: '0 0 0 1px #d9dce2', flexShrink: 0 }} />}
                        <span style={{ fontSize: 13, color: '#16181d', fontWeight: 600 }}>{v.color || v.name}</span>
                        {v.stock != null && v.stock !== '' && <span className="lc-mono" style={{ fontSize: 11, color: '#8b909a' }}>· {v.stock}u</span>}
                        {parseFloat(v.price_diff) !== 0 && <span className="lc-mono" style={{ fontSize: 11, color: parseFloat(v.price_diff) > 0 ? '#166534' : '#991b1b' }}>{parseFloat(v.price_diff) > 0 ? '+' : ''}${v.price_diff}</span>}
                        <button type="button" onClick={() => setForm(f => ({ ...f, variations: f.variations.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', color: '#8b909a', cursor: 'pointer', fontSize: 15, padding: 0, lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => setShowVariations(v => !v)} style={{ fontSize: 13, padding: '9px 15px 10px', background: showVariations ? '#e8f0ff' : '#eef0f4', color: showVariations ? DEEP : '#47505e', border: `1px solid ${showVariations ? '#b9cdf0' : '#d9dce2'}`, borderRadius: 8, cursor: 'pointer', fontWeight: 700, marginBottom: showVariations ? 12 : 0 }}>{showVariations ? '▲ Close' : '+ Add colour / size variation'}</button>

                {showVariations && (
                  <div style={{ background: '#f7f9fc', border: '1px solid #e2e4e9', borderRadius: 10, padding: '15px' }}>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11.5, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 8 }}>Quick select colour</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {PRESET_COLORS.map(pc => (
                          <button key={pc.name} type="button" onClick={() => setNewVariation(v => ({ ...v, name: pc.name, hex: pc.hex }))} title={pc.name} style={{ width: 32, height: 32, borderRadius: '50%', background: pc.hex, border: `3px solid ${newVariation.hex === pc.hex ? '#ffffff' : 'transparent'}`, cursor: 'pointer', outline: 'none', boxShadow: newVariation.hex === pc.hex ? `0 0 0 2px ${ACCENT}` : '0 1px 3px rgba(0,0,0,0.25)' }} />
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 12 }}>
                      <VarInput label="Name * (e.g. Black, XL)" value={newVariation.name} onChange={v => setNewVariation(x => ({ ...x, name: v }))} placeholder="Black, Red, XL…" />
                      <VarInput label="Display name (optional)" value={newVariation.color} onChange={v => setNewVariation(x => ({ ...x, color: v }))} placeholder="e.g. Midnight Blue" />
                      <div>
                        <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5, fontWeight: 700 }}>Colour picker</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <input type="color" value={newVariation.hex} onChange={e => setNewVariation(v => ({ ...v, hex: e.target.value }))} style={{ width: 40, height: 38, borderRadius: 6, border: '1px solid #d9dce2', cursor: 'pointer', padding: 2, background: 'none' }} />
                          <input value={newVariation.hex} onChange={e => setNewVariation(v => ({ ...v, hex: e.target.value }))} className="lc-mono" style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', background: '#ffffff', border: '1px solid #d9dce2', color: '#16181d', fontSize: 12, padding: '10px 9px', borderRadius: 6 }} />
                        </div>
                      </div>
                      <VarInput label="Stock (units)" value={newVariation.stock} onChange={v => setNewVariation(x => ({ ...x, stock: v }))} placeholder="0" mono />
                      <VarInput label="Price +/- ($)" value={newVariation.price_diff} onChange={v => setNewVariation(x => ({ ...x, price_diff: v }))} placeholder="0" mono />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11.5, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, marginBottom: 8 }}>Photo for this variation (optional)</div>
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
                        }} style={{ background: '#ffffff', border: '1px solid #d9dce2', color: '#47505e', fontSize: 12.5, padding: '8px 11px', borderRadius: 8, cursor: 'pointer', flex: 1 }} />
                        {newVariation.image_url && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <img src={newVariation.image_url} style={{ width: 44, height: 44, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '1px solid #d9dce2' }} />
                            <button type="button" onClick={() => setNewVariation(v => ({ ...v, image_url: '' }))} style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: 18, padding: 0 }}>×</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button type="button" onClick={() => {
                        if (!newVariation.name) { alert('Enter a variation name'); return }
                        setForm(f => ({ ...f, variations: [...(f.variations || []), { ...newVariation, stock: newVariation.stock ? parseInt(newVariation.stock) : null, price_diff: parseFloat(newVariation.price_diff) || 0 }] }))
                        setNewVariation(emptyVariation)
                      }} style={{ padding: '10px 18px 11px', background: ACCENT, color: '#ffffff', fontSize: 13.5, fontWeight: 700, border: 0, borderRadius: 8, cursor: 'pointer' }}>+ Add variation</button>
                      {newVariation.name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#eef0f4', borderRadius: 999, fontSize: 12, color: '#47505e' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: newVariation.hex, border: '1px solid #ffffff', boxShadow: '0 0 0 1px #d9dce2' }} />
                          Preview: {newVariation.name}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div style={{ paddingTop: 8, fontSize: 12, color: '#6b7280' }}>{form.variations?.length ? 'Each variation keeps its own stock and extra cost.' : 'No variations — this product is sold as one item.'}</div>
              </div>
            </div>

            {/* Images and links */}
            <div style={{ padding: '18px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 11 }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#dc2626', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>7</span>
                <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#991b1b' }}>Images and links</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Photo the partners will see</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1, background: '#eceef2', border: '1px solid #f6d5d5', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ background: '#ffffff', padding: '13px 15px 14px' }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }}>Upload product image</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ ...fieldInp, padding: '9px 12px', cursor: 'pointer' }} />
                  {imageFile && <div style={{ fontSize: 12, color: '#166534', marginTop: 6, fontWeight: 700 }}>✓ {imageFile.name}</div>}
                </div>
                <FormField label="Or image URL" value={form.image_url} onChange={v => setField('image_url', v)} placeholder="https://…" />
                <FormField label="Amazon listing URL" value={form.amazon_url} onChange={v => setField('amazon_url', v)} placeholder="https://amazon.com/…" />
                <FormField label="Walmart listing URL" value={form.walmart_url} onChange={v => setField('walmart_url', v)} placeholder="https://walmart.com/…" />
              </div>
              {form.image_url && !form.image_url.includes('supabase') && (
                <div style={{ marginTop: 10, padding: '12px 14px 13px', background: '#fffbf2', border: '1px solid #f3d9a4', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: '#8a5a00', fontWeight: 700, marginBottom: 8 }}>⚠️ External image URL — save product then re-upload image manually for permanent storage</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={form.image_url} alt="preview" style={{ width: 56, height: 56, objectFit: 'contain', background: '#fff', borderRadius: 6, border: '1px solid #e2e4e9' }} onError={e => e.target.style.display = 'none'} />
                    <a href={form.image_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: DEEP, fontWeight: 700, padding: '7px 12px', border: '1px solid #b9cdf0', borderRadius: 8, background: '#e8f0ff' }}>Open image in new tab →</a>
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'sticky', bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 20, padding: '14px 20px 17px', borderTop: '1px solid #e2e4e9', background: '#fafbfc' }}>
              <span style={{ fontSize: 13.5, color: '#6b7280' }}>{editingId ? 'Changes save when you press Save changes.' : 'Nothing is saved until you press Add product.'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <button type="button" onClick={closeAdd} style={{ border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '11px 15px 12px', fontSize: 14, fontWeight: 600, color: '#47505e' }}>Cancel</button>
                <button type="button" onClick={saveProduct} disabled={saving || uploadingImg} style={{ border: 0, borderRadius: 8, background: saving ? '#8b909a' : '#16a34a', cursor: saving ? 'not-allowed' : 'pointer', padding: '12px 22px 13px', fontSize: 14.5, fontWeight: 700, color: '#ffffff' }}>{saving ? 'Saving…' : uploadingImg ? 'Uploading image…' : editingId ? '✓ Save changes' : '✓ Add product'}</button>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const fieldInp = { width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14.5, color: '#16181d', background: '#ffffff' }

function FormField({ label, value, onChange, placeholder, hint, mono }) {
  return (
    <div style={{ background: '#ffffff', padding: '13px 15px 14px' }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }}>{label}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...fieldInp, ...(mono ? { fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 } : {}) }} />
      {hint && <div style={{ paddingTop: 6, fontSize: 12, color: '#6b7280' }}>{hint}</div>}
    </div>
  )
}

function ChipSelectField({ label, options, value, onChange }) {
  return (
    <div style={{ background: '#ffffff', padding: '13px 15px 14px' }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }}>{label}</label>
      <div data-scroll style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {options.map(o => {
          const on = o === value
          return <button key={o} type="button" onClick={() => onChange(o)} style={{ flex: 'none', cursor: 'pointer', border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 8, background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#47505e', padding: '9px 12px 10px', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{o}</button>
        })}
      </div>
    </div>
  )
}

function VarInput({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5, fontWeight: 700 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={mono ? 'lc-mono' : ''} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 11px 11px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, background: '#ffffff' }} />
    </div>
  )
}
