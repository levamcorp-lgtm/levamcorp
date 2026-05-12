'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: 'electronics', price: '', stock: '', dispatch_days: '1-2 days', description: '', active: true })

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

  const saveProduct = async () => {
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      await supabase.from('products').update({ ...editing, price: parseFloat(editing.price), stock: parseInt(editing.stock) }).eq('id', editing.id)
    } else {
      await supabase.from('products').insert([{ ...newProduct, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) }])
      setAdding(false)
      setNewProduct({ name: '', sku: '', category: 'electronics', price: '', stock: '', dispatch_days: '1-2 days', description: '', active: true })
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

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products']].map(([label, href]) => (
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

        <div style={{ display: 'grid', gridTemplateColumns: (editing || adding) ? '1fr 340px' : '1fr', gap: '1rem' }}>

          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d0d0d' }}>
                  {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Dispatch', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', padding: '10px 1rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 1rem', fontSize: 12, fontWeight: 500, color: '#ccc' }}>{p.name}</td>
                    <td style={{ padding: '12px 1rem', fontSize: 11, color: '#555' }}>{p.sku}</td>
                    <td style={{ padding: '12px 1rem', fontSize: 11, color: '#555', textTransform: 'capitalize' }}>{p.category}</td>
                    <td style={{ padding: '12px 1rem', fontSize: 13, fontWeight: 500, color: '#fff' }}>${p.price?.toLocaleString()}</td>
                    <td style={{ padding: '12px 1rem', fontSize: 12, color: p.stock <= 5 ? '#854f0b' : '#2a7d4f', fontWeight: 500 }}>{p.stock}</td>
                    <td style={{ padding: '12px 1rem', fontSize: 11, color: '#555' }}>{p.dispatch_days}</td>
                    <td style={{ padding: '12px 1rem' }}>
                      <button onClick={() => toggleActive(p.id, p.active)} style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: p.active ? 'rgba(42,125,79,0.12)' : 'rgba(231,76,60,0.1)', color: p.active ? '#2a7d4f' : '#c0392b', border: 'none', cursor: 'pointer' }}>
                        {p.active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 1rem' }}>
                      <button onClick={() => { setEditing({...p}); setAdding(false) }} style={{ fontSize: 10, color: '#2d7dd2', background: 'transparent', border: '0.5px solid rgba(45,125,210,0.3)', padding: '4px 10px', borderRadius: 2, cursor: 'pointer' }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(editing || adding) && (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '1.5rem', height: 'fit-content', position: 'sticky', top: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{editing ? 'Edit product' : 'Add product'}</h3>
                <button onClick={() => { setEditing(null); setAdding(false) }} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              {editing ? (
                <>
                  <Field label="Name" value={editing.name} onChange={v => setEditing({...editing, name: v})} />
                  <Field label="SKU" value={editing.sku} onChange={v => setEditing({...editing, sku: v})} />
                  <Field label="Category" value={editing.category} onChange={v => setEditing({...editing, category: v})} options={['electronics','home','kitchen']} />
                  <Field label="Price ($)" value={editing.price} onChange={v => setEditing({...editing, price: v})} type="number" />
                  <Field label="Stock" value={editing.stock} onChange={v => setEditing({...editing, stock: v})} type="number" />
                  <Field label="Dispatch time" value={editing.dispatch_days} onChange={v => setEditing({...editing, dispatch_days: v})} />
                </>
              ) : (
                <>
                  <Field label="Name *" value={newProduct.name} onChange={v => setNewProduct({...newProduct, name: v})} />
                  <Field label="SKU *" value={newProduct.sku} onChange={v => setNewProduct({...newProduct, sku: v})} />
                  <Field label="Category" value={newProduct.category} onChange={v => setNewProduct({...newProduct, category: v})} options={['electronics','home','kitchen']} />
                  <Field label="Price ($) *" value={newProduct.price} onChange={v => setNewProduct({...newProduct, price: v})} type="number" />
                  <Field label="Stock *" value={newProduct.stock} onChange={v => setNewProduct({...newProduct, stock: v})} type="number" />
                  <Field label="Dispatch time" value={newProduct.dispatch_days} onChange={v => setNewProduct({...newProduct, dispatch_days: v})} />
                </>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
                <button onClick={saveProduct} disabled={saving} style={{ flex: 1, padding: 10, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2 }}>
                  {saving ? 'Saving...' : editing ? 'Save changes' : 'Add product'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
