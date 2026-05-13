'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: 'electronics', price: '', stock: '', dispatch_days: '1-2 days', description: '', active: true, image_url: '', amazon_url: '', walmart_url: '', moq: '1', warehouse: 'WH: FL' })
  const fileRef = useRef(null)
  const editFileRef = useRef(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      loadProducts(supabase)
    })
  }, [])

  const loadProducts = async (supabase) => {
    const { data } = await supabase.from('products').select('*').order('name')
    setProducts(data || [])
    setLoading(false)
  }

  const uploadImage = async (file, isEditing) => {
    if (!file) return null
    setUploadingImg(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('product-images').upload(filename, file, { upsert: true })
    if (error) { alert('Error uploading image'); setUploadingImg(false); return null }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filename)
    setUploadingImg(false)
    return urlData.publicUrl
  }

  const handleImageChange = async (e, isEditing) => {
    const file = e.target.files[0]
    if (!file) return
    const url = await uploadImage(file, isEditing)
    if (url) {
      if (isEditing) setEditing(prev => ({ ...prev, image_url: url }))
      else setNewProduct(prev => ({ ...prev, image_url: url }))
    }
  }

  const saveProduct = async () => {
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      await supabase.from('products').update({ ...editing, price: parseFloat(editing.price), stock: parseInt(editing.stock) }).eq('id', editing.id)
    } else {
      await supabase.from('products').insert([{ ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) }])
      setAdding(false)
      setNewProduct({ name: '', sku: '', category: 'electronics', price: '', stock: '', dispatch_days: '1-2 days', description: '', active: true, image_url: '' })
    }
    setEditing(null)
    await loadProducts(supabase)
    setSaving(false)
  }

  const toggleActive = async (id, active) => {
    const supabase = createClient()
    await supabase.from('products').update({ active: !active }).eq('id', id)
    await loadProducts(supabase)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const Field = ({ label, value, onChange, type = 'text', options }) => (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{label}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 12, padding: '8px 10px', borderRadius: 2, outline: 'none', fontFamily: 'inherit' }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 12, padding: '8px 10px', borderRadius: 2, outline: 'none', fontFamily: 'inherit' }} />
      )}
    </div>
  )

  const ImageUpload = ({ currentUrl, onChange, fileInputRef }) => (
    <div style={{ marginBottom: 10 }}>
      <label style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Product image</label>
      <div style={{ border: '0.5px dashed rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
        {currentUrl ? (
          <img src={currentUrl} alt="Product" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#1a1a1a' }}>
            <div style={{ fontSize: 24, color: '#333' }}>📷</div>
            <div style={{ fontSize: 11, color: '#444' }}>No image yet</div>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
      <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImg} style={{ width: '100%', padding: '8px', background: 'transparent', border: '0.5px solid rgba(255,255,255,0.1)', color: uploadingImg ? '#444' : '#aaa', fontSize: 11, borderRadius: 2, cursor: 'pointer' }}>
        {uploadingImg ? 'Uploading...' : currentUrl ? '🔄 Change image' : '📷 Upload image'}
      </button>
    </div>
  )

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Products' ? '#2d7dd2' : '#555', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Products' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Products</h2>
            <p style={{ fontSize: 12, color: '#444' }}>{products.length} products in catalog</p>
          </div>
          <button onClick={() => { setAdding(true); setEditing(null) }} style={{ padding: '9px 20px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2 }}>+ Add product</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: (editing || adding) ? '1fr 320px' : '1fr', gap: '1rem' }}>

          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d0d0d' }}>
                  {['Image', 'Product', 'SKU', 'Category', 'Price', 'Stock', 'Dispatch', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', padding: '10px 1rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '8px 1rem' }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 2, display: 'block' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, background: '#1a1a1a', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                          {p.category === 'electronics' ? '📺' : p.category === 'home' ? '🏠' : '🍳'}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '8px 1rem', fontSize: 12, fontWeight: 500, color: '#ccc' }}>{p.name}</td>
                    <td style={{ padding: '8px 1rem', fontSize: 11, color: '#555' }}>{p.sku}</td>
                    <td style={{ padding: '8px 1rem', fontSize: 11, color: '#555', textTransform: 'capitalize' }}>{p.category}</td>
                    <td style={{ padding: '8px 1rem', fontSize: 13, fontWeight: 500, color: '#fff' }}>${p.price?.toLocaleString()}</td>
                    <td style={{ padding: '8px 1rem', fontSize: 12, color: p.stock <= 5 ? '#854f0b' : '#2a7d4f', fontWeight: 500 }}>{p.stock}</td>
                    <td style={{ padding: '8px 1rem', fontSize: 11, color: '#555' }}>{p.dispatch_days}</td>
                    <td style={{ padding: '8px 1rem' }}>
                      <button onClick={() => toggleActive(p.id, p.active)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: p.active ? 'rgba(42,125,79,0.12)' : 'rgba(231,76,60,0.1)', color: p.active ? '#2a7d4f' : '#c0392b', border: 'none', cursor: 'pointer' }}>
                        {p.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td style={{ padding: '8px 1rem' }}>
                      <button onClick={() => { setEditing({...p, image_url: p.image_url || ''}); setAdding(false) }} style={{ fontSize: 10, color: '#2d7dd2', background: 'transparent', border: '0.5px solid rgba(45,125,210,0.3)', padding: '4px 10px', borderRadius: 2, cursor: 'pointer' }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(editing || adding) && (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '1.5rem', height: 'fit-content', position: 'sticky', top: 20, overflowY: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{editing ? 'Edit product' : 'Add product'}</h3>
                <button onClick={() => { setEditing(null); setAdding(false) }} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>

              {editing ? (
                <>
                  <ImageUpload currentUrl={editing.image_url} onChange={(e) => handleImageChange(e, true)} fileInputRef={editFileRef} />
                  <Field label="Name" value={editing.name} onChange={v => setEditing({...editing, name: v})} />
                  <Field label="SKU" value={editing.sku} onChange={v => setEditing({...editing, sku: v})} />
                  <Field label="Category" value={editing.category} onChange={v => setEditing({...editing, category: v})} options={['electronics','home','kitchen']} />
                  <Field label="Price ($)" value={editing.price} onChange={v => setEditing({...editing, price: v})} type="number" />
                  <Field label="Stock" value={editing.stock} onChange={v => setEditing({...editing, stock: v})} type="number" />
                  <Field label="Dispatch time" value={editing.dispatch_days} onChange={v => setEditing({...editing, dispatch_days: v})} />
                  <Field label="Description" value={editing.description || ''} onChange={v => setEditing({...editing, description: v})} />
                  <Field label="Amazon URL" value={editing.amazon_url || ''} onChange={v => setEditing({...editing, amazon_url: v})} />
                  <Field label="Walmart URL" value={editing.walmart_url || ''} onChange={v => setEditing({...editing, walmart_url: v})} />
                  <Field label="MOQ (min order qty)" value={editing.moq || '1'} onChange={v => setEditing({...editing, moq: v})} type="number" />
                  <Field label="Warehouse location" value={editing.warehouse || 'WH: FL'} onChange={v => setEditing({...editing, warehouse: v})} />
                </>
              ) : (
                <>
                  <ImageUpload currentUrl={newProduct.image_url} onChange={(e) => handleImageChange(e, false)} fileInputRef={fileRef} />
                  <Field label="Name *" value={newProduct.name} onChange={v => setNewProduct({...newProduct, name: v})} />
                  <Field label="SKU *" value={newProduct.sku} onChange={v => setNewProduct({...newProduct, sku: v})} />
                  <Field label="Category" value={newProduct.category} onChange={v => setNewProduct({...newProduct, category: v})} options={['electronics','home','kitchen']} />
                  <Field label="Price ($) *" value={newProduct.price} onChange={v => setNewProduct({...newProduct, price: v})} type="number" />
                  <Field label="Stock *" value={newProduct.stock} onChange={v => setNewProduct({...newProduct, stock: v})} type="number" />
                  <Field label="Dispatch time" value={newProduct.dispatch_days} onChange={v => setNewProduct({...newProduct, dispatch_days: v})} />
                  <Field label="Description" value={newProduct.description} onChange={v => setNewProduct({...newProduct, description: v})} />
                  <Field label="Amazon URL" value={newProduct.amazon_url} onChange={v => setNewProduct({...newProduct, amazon_url: v})} />
                  <Field label="Walmart URL" value={newProduct.walmart_url} onChange={v => setNewProduct({...newProduct, walmart_url: v})} />
                  <Field label="MOQ (min order qty)" value={newProduct.moq} onChange={v => setNewProduct({...newProduct, moq: v})} type="number" />
                  <Field label="Warehouse location" value={newProduct.warehouse} onChange={v => setNewProduct({...newProduct, warehouse: v})} />
                </>
              )}

              <button onClick={saveProduct} disabled={saving || uploadingImg} style={{ width: '100%', padding: 10, background: saving ? '#333' : '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2, marginTop: '0.5rem' }}>
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add product'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
