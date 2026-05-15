'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    client_name: '', client_email: '', client_company: '',
    client_address: '', client_phone: '', notes: ''
  })
  const [items, setItems] = useState([{ description: '', quantity: 1, unit_price: '' }])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      const { data: invData } = await supabase.from('manual_invoices').select('*').order('created_at', { ascending: false })
      setInvoices(invData || [])
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const addItem = () => setItems(prev => [...prev, { description: '', quantity: 1, unit_price: '' }])
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i))
  const updateItem = (i, field, val) => setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const subtotal = items.reduce((sum, item) => sum + ((parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0)), 0)

  const getInvoiceNum = () => {
    const d = new Date()
    return `LC-EXT-${d.getFullYear()}-${String(invoices.length + 1001).padStart(4, '0')}`
  }

  const handleSave = async () => {
    if (!form.client_name || !form.client_email) { alert('Please enter client name and email'); return }
    if (items.some(i => !i.description || !i.unit_price)) { alert('Please fill in all item fields'); return }
    setSaving(true)
    try {
      const supabase = createClient()
      const invNum = getInvoiceNum()
      const { data } = await supabase.from('manual_invoices').insert([{
        invoice_number: invNum,
        client_name: form.client_name,
        client_email: form.client_email,
        client_company: form.client_company,
        client_address: form.client_address,
        client_phone: form.client_phone,
        notes: form.notes,
        items: items,
        subtotal,
        total: subtotal,
        status: 'paid'
      }]).select().single()
      setInvoices(prev => [data, ...prev])
      setPreview(data)
      setCreating(false)
      setForm({ client_name: '', client_email: '', client_company: '', client_address: '', client_phone: '', notes: '' })
      setItems([{ description: '', quantity: 1, unit_price: '' }])
    } catch (e) { alert('Error saving invoice: ' + e.message) }
    setSaving(false)
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const handlePrint = (inv) => {
    const win = window.open('', '_blank', 'width=800,height=900')
    const itemsRows = (inv.items || []).map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'}">
        <td style="padding:10px 12px;font-size:12px;color:#333">${item.description}</td>
        <td style="padding:10px 12px;font-size:12px;color:#555;text-align:right">${item.quantity}</td>
        <td style="padding:10px 12px;font-size:12px;color:#555;text-align:right">$${parseFloat(item.unit_price).toLocaleString()}</td>
        <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#111;text-align:right">$${(parseFloat(item.unit_price) * parseInt(item.quantity)).toLocaleString()}</td>
      </tr>`).join('')

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${inv.invoice_number} - Levam Corp</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#fff; }
    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      @page { margin:0; size:letter; }
    }
  </style>
</head>
<body>
<div style="max-width:680px;margin:0 auto;background:#fff">

  <!-- HEADER -->
  <div style="background:#0d0d0d;padding:36px 40px;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="position:relative;width:32px;height:32px">
          <div style="position:absolute;left:7px;top:0;width:2.5px;height:25px;background:#333"></div>
          <div style="position:absolute;left:7px;bottom:0;width:18px;height:2.5px;background:#333"></div>
          <div style="position:absolute;left:12px;bottom:7px;width:11px;height:2.5px;background:#2d7dd2"></div>
        </div>
        <div>
          <div style="font-size:16px;font-weight:700;letter-spacing:0.2em;color:#ddd;text-transform:uppercase">LEVAM</div>
          <div style="font-size:7px;letter-spacing:0.35em;color:#2d7dd2;text-transform:uppercase;margin-top:2px">CORP · DISTRIBUTORS</div>
        </div>
      </div>
      <div style="font-size:10px;color:#555;line-height:1.9">6315 NW 99th Ave, Doral, FL 33178<br>partners@levamcorp.com · levamcorp.com</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:0.12em;margin-bottom:6px">INVOICE</div>
      <div style="font-size:14px;color:#2d7dd2;font-weight:700;margin-bottom:10px">${inv.invoice_number}</div>
      <div style="font-size:10px;color:#555;line-height:2.2">
        <span style="color:#666">Date:</span> ${fmtDate(inv.created_at)}<br>
        <span style="color:#666">Terms:</span> Net 15
      </div>
    </div>
  </div>



  <!-- PARTIES -->
  <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #ebebeb">
    <div style="padding:20px 40px">
      <div style="font-size:8px;letter-spacing:0.25em;text-transform:uppercase;color:#bbb;margin-bottom:8px">From</div>
      <p style="font-size:11px;color:#555;line-height:1.9"><strong style="color:#222;font-size:12px">Levam Corp Distributors</strong><br>6315 NW 99th Ave<br>Doral, FL 33178<br>partners@levamcorp.com</p>
    </div>
    <div style="padding:20px 40px;border-left:1px solid #ebebeb">
      <div style="font-size:8px;letter-spacing:0.25em;text-transform:uppercase;color:#bbb;margin-bottom:8px">Bill to</div>
      <p style="font-size:11px;color:#555;line-height:1.9">
        <strong style="color:#222;font-size:12px">${inv.client_name}</strong><br>
        ${inv.client_company ? inv.client_company + '<br>' : ''}
        ${inv.client_email}<br>
        ${inv.client_phone ? inv.client_phone + '<br>' : ''}
        ${inv.client_address || ''}
      </p>
    </div>
  </div>

  <!-- ITEMS -->
  <div style="padding:0 40px">
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <thead>
        <tr style="background:#111">
          <th style="font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:#666;padding:10px 12px;text-align:left;font-weight:400">Description</th>
          <th style="font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:#666;padding:10px 12px;text-align:right;font-weight:400">Qty</th>
          <th style="font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:#666;padding:10px 12px;text-align:right;font-weight:400">Unit price</th>
          <th style="font-size:8px;letter-spacing:0.15em;text-transform:uppercase;color:#666;padding:10px 12px;text-align:right;font-weight:400">Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
  </div>

  <!-- TOTAL BOX -->
  <div style="padding:0 40px 24px">
    <div style="background:linear-gradient(135deg,#2a7d4f,#1a5f3a);border-radius:4px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:9px;color:rgba(255,255,255,0.6);letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px">Total paid</div>
        <div style="font-size:28px;font-weight:800;color:#fff">$${inv.total?.toLocaleString()}</div>
      </div>
      <div style="font-size:36px;opacity:0.3">✅</div>
    </div>
  </div>

  ${inv.notes ? `
  <div style="padding:0 40px 20px">
    <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:8px">Notes</div>
    <p style="font-size:12px;color:#666;line-height:1.8;background:#fafafa;padding:12px 14px;border:0.5px solid #e5e7eb;border-radius:3px">${inv.notes}</p>
  </div>` : ''}

  <!-- TERMS -->
  <div style="margin:0 40px 20px;border:0.5px solid rgba(0,0,0,0.06);border-radius:3px;overflow:hidden">
    <div style="background:#111;padding:6px 14px;font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#555">Terms & Conditions</div>
    <div style="background:#fafafa;padding:10px 14px;font-size:9.5px;color:#888;line-height:1.75">
      <strong style="color:#555;font-size:9px;text-transform:uppercase">All Sales Are Final — </strong>
      No returns, exchanges, or refunds. Governed by the laws of the State of Florida, Miami-Dade County courts.
    </div>
  </div>

  <!-- SIGNATURES -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(0,0,0,0.06);margin:0 40px 20px">
    <div style="background:#fff;padding:16px">
      <div style="font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#bbb;margin-bottom:22px">Authorized · Levam Corp</div>
      <div style="border-top:0.5px solid #ddd;padding-top:5px;font-size:9px;color:#ccc">Signature & date</div>
    </div>
    <div style="background:#fff;padding:16px">
      <div style="font-size:8px;letter-spacing:0.2em;text-transform:uppercase;color:#bbb;margin-bottom:22px">Accepted · Client</div>
      <div style="border-top:0.5px solid #ddd;padding-top:5px;font-size:9px;color:#ccc">Signature & date</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="background:#0d0d0d;padding:16px 40px;text-align:center">
    <div style="font-size:9px;color:#444;line-height:1.8">Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com · levamcorp.com</div>
  </div>

</div>
</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 600)
  }

  const inputStyle = { width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '9px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Invoices' ? '#2d7dd2' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Invoices' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '1.5rem 2rem' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>External Invoices</h2>
            <p style={{ fontSize: 11, color: '#888' }}>{invoices.length} invoices created</p>
          </div>
          <button onClick={() => { setCreating(true); setPreview(null) }} style={{ padding: '10px 20px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3, boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
            + Create invoice
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: creating || preview ? '1fr 520px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT — invoices list */}
          <div>
            {invoices.length === 0 ? (
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🧾</div>
                <div style={{ fontSize: 14, color: '#555', marginBottom: 6 }}>No external invoices yet</div>
                <div style={{ fontSize: 12, color: '#444' }}>Click "Create invoice" to get started</div>
              </div>
            ) : (
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0d0d0d' }}>
                      {['Invoice #','Client','Company','Amount','Date',''].map(h => (
                        <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)', background: preview?.id === inv.id ? 'rgba(45,125,210,0.06)' : 'transparent', cursor: 'pointer' }}
                        onClick={() => { setPreview(inv); setCreating(false) }}>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 600, color: '#2d7dd2' }}>{inv.invoice_number}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#ccc' }}>{inv.client_name}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#777' }}>{inv.client_company || '—'}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 700, color: '#2a7d4f' }}>${inv.total?.toLocaleString()}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{fmtDate(inv.created_at)}</td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          <button onClick={(e) => { e.stopPropagation(); handlePrint(inv) }} style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(42,125,79,0.15)', color: '#2a7d4f', border: '0.5px solid rgba(42,125,79,0.3)', borderRadius: 2, cursor: 'pointer' }}>🖨 Print PDF</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT — create form */}
          {creating && (
            <div style={{ position: 'sticky', top: 20 }}>
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ background: '#0d0d0d', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Create external invoice</div>
                  <button onClick={() => setCreating(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Client information</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      ['client_name','Full name *','John Smith'],
                      ['client_email','Email *','client@business.com'],
                      ['client_company','Company name','Business LLC'],
                      ['client_phone','Phone','(305) 000-0000'],
                      ['client_address','Address','City, State, ZIP'],
                    ].map(([field, label, placeholder]) => (
                      <div key={field}>
                        <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{label}</label>
                        <input style={inputStyle} value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))} placeholder={placeholder} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Items</div>
                    <button type="button" onClick={addItem} style={{ fontSize: 10, color: '#2d7dd2', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.3)', padding: '3px 10px', borderRadius: 2, cursor: 'pointer' }}>+ Add item</button>
                  </div>
                  {items.map((item, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3, padding: '10px', marginBottom: 8 }}>
                      <div style={{ marginBottom: 6 }}>
                        <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Description *</label>
                        <input style={inputStyle} value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Product or service description" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div>
                          <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Quantity</label>
                          <input style={inputStyle} type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                        </div>
                        <div>
                          <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>Unit price ($)</label>
                          <input style={inputStyle} type="number" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} placeholder="0.00" />
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} style={{ marginTop: 6, fontSize: 10, color: '#c0392b', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Remove item</button>
                      )}
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(42,125,79,0.08)', border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>Total</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#2a7d4f' }}>${subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                  <textarea style={{ ...inputStyle, height: 60, resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Any additional notes..." />
                </div>

                <div style={{ padding: '1rem 1.5rem' }}>
                  <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: 12, background: saving ? '#333' : '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 3, boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
                    {saving ? 'Creating...' : '✓ Create invoice & preview'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT — invoice preview */}
          {preview && !creating && (
            <div style={{ position: 'sticky', top: 20 }}>
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ background: '#0d0d0d', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{preview.invoice_number}</div>
                    <div style={{ fontSize: 10, color: '#555' }}>{preview.client_name} · {fmtDate(preview.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handlePrint(preview)} style={{ padding: '8px 16px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 3 }}>🖨 Print / PDF</button>
                    <button onClick={() => setPreview(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                  </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
                    {[['Client', preview.client_name], ['Email', preview.client_email], ['Company', preview.client_company || '—'], ['Phone', preview.client_phone || '—']].map(([label, val]) => (
                      <div key={label} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                        <div style={{ fontSize: 8, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 11, color: '#ccc', fontWeight: 500 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {preview.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                      <div>
                        <div style={{ color: '#ccc', fontWeight: 500 }}>{item.description}</div>
                        <div style={{ color: '#555', fontSize: 10 }}>Qty: {item.quantity} × ${parseFloat(item.unit_price).toLocaleString()}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>${(parseFloat(item.unit_price) * parseInt(item.quantity)).toLocaleString()}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#ccc' }}>Total paid</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#2a7d4f' }}>${preview.total?.toLocaleString()}</span>
                  </div>
                </div>



                <div style={{ padding: '1rem 1.5rem' }}>
                  <button onClick={() => handlePrint(preview)} style={{ width: '100%', padding: 12, background: '#2a7d4f', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3, boxShadow: '0 4px 14px rgba(42,125,79,0.3)' }}>
                    🖨 Download / Print PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
