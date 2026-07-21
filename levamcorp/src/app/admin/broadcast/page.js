'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

export default function AdminBroadcast() {
  const [products, setProducts]   = useState([])
  const [selected, setSelected]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [search,   setSearch]     = useState('')
  const [filter,   setFilter]     = useState('all')
  const [copied,   setCopied]     = useState(false)
  const [template, setTemplate]   = useState('full') // full | compact | promo
  const [header,   setHeader]     = useState('🔥 *LEVAM CORP — NEW ARRIVALS*\n_Premium wholesale deals, limited stock_\n\n')
  const [footer,   setFooter]     = useState('\n\n📦 *Minimum order quantities apply*\n📍 Doral, FL — Fast dispatch\n📲 Contact us to place your order!')
  const [note,     setNote]       = useState('')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      const { data: p } = await sb.from('products').select('*').eq('active', true).order('name')
      setProducts(p || [])
      setLoading(false)
    })
  }, [])

  const logout = async () => { await createClient().auth.signOut(); window.location.href = '/admin' }

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const selProducts = products.filter(p => selected.includes(p.id))

  const cats = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
  const visible = products.filter(p => {
    const matchCat = filter === 'all' || p.category === filter
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const buildMessage = () => {
    if (selProducts.length === 0) return ''
    const divider = '━━━━━━━━━━━━━━━━━━━━━━━'

    const lines = selProducts.map((p, i) => {
      if (template === 'full') {
        const parts = []
        parts.push(`*${i + 1}. ${p.name}*`)
        if (p.brand) parts.push(`🏷 Brand: ${p.brand}`)
        parts.push(`💰 Price: *$${p.price?.toLocaleString()}*`)
        if (p.moq) parts.push(`📦 MOQ: ${p.moq} unit${p.moq > 1 ? 's' : ''}`)
        if (p.stock) parts.push(`✅ In stock: ${p.stock} units`)
        if (p.delivery_days) parts.push(`⏱ Delivery: ${p.delivery_days} days`)
        if (p.description) parts.push(`_${p.description}_`)
        return parts.join('\n')
      }
      if (template === 'compact') {
        return `*${i + 1}. ${p.name}*${p.brand ? ' — ' + p.brand : ''}\n💰 $${p.price?.toLocaleString()} | 📦 MOQ ${p.moq || 1} | ✅ ${p.stock || '?'} units`
      }
      if (template === 'promo') {
        return `🔥 *${p.name}*\n💥 Only *$${p.price?.toLocaleString()}* per unit\n📦 MOQ: ${p.moq || 1} | Stock: ${p.stock || '?'} units`
      }
      return ''
    }).join('\n' + divider + '\n')

    return header + divider + '\n' + lines + '\n' + divider + (note ? '\n\n📝 ' + note : '') + footer
  }

  const message = buildMessage()

  const copy = () => {
    navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openWhatsApp = () => {
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Loading...</div>

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#111', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(0,0,0,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Broadcast','/admin/broadcast'],['Offers','/admin/offers']].map(([l,h])=>(
              <Link key={l} href={h} style={{ fontSize: 12, color: l==='Broadcast'?'#25D366':'#777', textDecoration: 'none', padding: '4px 14px', borderBottom: l==='Broadcast'?'2px solid #25D366':'2px solid transparent', fontWeight: l==='Broadcast'?700:400 }}>{l}</Link>
            ))}
          </div>
        </div>
        <button onClick={logout} style={{ fontSize: 11, color: '#999', border: '0.5px solid rgba(0,0,0,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', height: 'calc(100vh - 57px)' }}>

        {/* LEFT — Product selector */}
        <div style={{ overflowY: 'auto', padding: '1.5rem 2rem', borderRight: '0.5px solid rgba(0,0,0,0.06)' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 4 }}>Select products to broadcast</div>
            <div style={{ fontSize: 12, color: '#999' }}>{selected.length} selected · {products.length} available</div>
          </div>

          {/* Search + filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                style={{ width: '100%', background: 'rgba(0,0,0,0.05)', border: '0.5px solid rgba(0,0,0,0.1)', color: '#333', fontSize: 12, padding: '8px 12px 8px 28px', borderRadius: 20, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#999' }}>🔍</span>
            </div>
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                style={{ fontSize: 11, padding: '6px 12px', borderRadius: 20, border: `0.5px solid ${filter===c?'#25D366':'rgba(0,0,0,0.08)'}`, background: filter===c?'rgba(37,211,102,0.1)':'transparent', color: filter===c?'#25D366':'#555', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                {c}
              </button>
            ))}
          </div>

          {/* Select all / clear */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
            <button onClick={() => setSelected(visible.map(p => p.id))}
              style={{ fontSize: 11, padding: '6px 14px', background: 'rgba(37,211,102,0.08)', border: '0.5px solid rgba(37,211,102,0.2)', color: '#25D366', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
              Select all visible
            </button>
            {selected.length > 0 && (
              <button onClick={() => setSelected([])}
                style={{ fontSize: 11, padding: '6px 14px', background: 'rgba(231,76,60,0.08)', border: '0.5px solid rgba(231,76,60,0.2)', color: '#e74c3c', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear
              </button>
            )}
          </div>

          {/* Product grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visible.map(p => {
              const isSel = selected.includes(p.id)
              return (
                <div key={p.id} onClick={() => toggle(p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: isSel ? 'rgba(37,211,102,0.06)' : '#111', border: `1px solid ${isSel ? 'rgba(37,211,102,0.4)' : 'rgba(0,0,0,0.06)'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {/* Checkbox */}
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSel ? '#25D366' : '#333'}`, background: isSel ? '#25D366' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isSel && <span style={{ color: '#111', fontSize: 11, fontWeight: 900 }}>✓</span>}
                  </div>
                  {/* Image */}
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6, background: '#f0f1f3', flexShrink: 0 }} />
                    : <div style={{ width: 44, height: 44, borderRadius: 6, background: '#f0f1f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📦</div>
                  }
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isSel ? '#fff' : '#ccc', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{p.brand} · MOQ {p.moq || 1} · {p.stock} units</div>
                  </div>
                  {/* Price */}
                  <div style={{ fontSize: 15, fontWeight: 800, color: isSel ? '#25D366' : '#fff', flexShrink: 0 }}>${p.price?.toLocaleString()}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — Preview & send */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>

          {/* Template selector */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: '#fff' }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700 }}>Message format</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {[['full','📋 Full','All details'],['compact','⚡ Compact','Quick view'],['promo','🔥 Promo','Sales pitch']].map(([k,l,sub])=>(
                <button key={k} onClick={() => setTemplate(k)}
                  style={{ padding: '8px', background: template===k?'rgba(37,211,102,0.1)':'rgba(0,0,0,0.03)', border: `1px solid ${template===k?'rgba(37,211,102,0.4)':'rgba(0,0,0,0.08)'}`, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: template===k?'#25D366':'#aaa', fontWeight: 700 }}>{l}</div>
                  <div style={{ fontSize: 9, color: '#999', marginTop: 2 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom header/footer */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Header</div>
              <textarea value={header} onChange={e => setHeader(e.target.value)} rows={2}
                style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.08)', color: '#333', fontSize: 11, padding: '8px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Note (optional)</div>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Valid until Friday, limited stock..."
                style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.08)', color: '#333', fontSize: 11, padding: '8px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Footer</div>
              <textarea value={footer} onChange={e => setFooter(e.target.value)} rows={3}
                style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.08)', color: '#333', fontSize: 11, padding: '8px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Preview */}
          <div style={{ flex: 1, padding: '1rem 1.5rem', overflowY: 'auto' }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700 }}>
              Preview · {selected.length} product{selected.length !== 1 ? 's' : ''}
            </div>
            {selected.length === 0
              ? <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#444', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📲</div>
                  Select products on the left to preview your WhatsApp message
                </div>
              : (
                <div style={{ background: '#0d1f0d', border: '0.5px solid rgba(37,211,102,0.15)', borderRadius: 10, padding: '1rem', fontFamily: 'monospace', fontSize: 12, color: '#333', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {message}
                </div>
              )
            }
          </div>

          {/* Send buttons */}
          {selected.length > 0 && (
            <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8, background: '#f8f9fa' }}>
              <button onClick={openWhatsApp}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#111', fontSize: 14, fontWeight: 800, border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 20px rgba(37,211,102,0.3)', letterSpacing: '0.04em' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Open in WhatsApp
              </button>
              <button onClick={copy}
                style={{ width: '100%', padding: '11px', background: copied ? 'rgba(37,211,102,0.1)' : 'rgba(0,0,0,0.06)', color: copied ? '#25D366' : '#aaa', fontSize: 13, fontWeight: 600, border: `0.5px solid ${copied ? 'rgba(37,211,102,0.3)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 8, cursor: 'pointer' }}>
                {copied ? '✓ Copied!' : '📋 Copy to clipboard'}
              </button>
              <div style={{ fontSize: 10, color: '#444', textAlign: 'center' }}>
                {message.length} characters · ~{Math.ceil(message.length / 160)} SMS equivalent
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
