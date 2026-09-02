'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const printRef = useRef(null)

  const [form, setForm] = useState({
    invoice_number: '',
    client_name: '',
    client_company: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    items: [{ description: '', qty: 1, unit_price: '' }],
    notes: '',
    status: 'unpaid',
    // Payment info
    bank_name: 'Bank of America',
    account_name: 'Levam Corp Distributors',
    account_number: '',
    routing_number: '',
    bank_address: '',
    swift: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      const { data: inv } = await supabase.from('manual_invoices').select('*').order('created_at', { ascending: false })
      setInvoices(inv || [])
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, unit_price: '' }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i, field, val) => setForm(f => ({ ...f, items: f.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item) }))

  const total = form.items.reduce((s, i) => s + (parseFloat(i.qty) * parseFloat(i.unit_price) || 0), 0)

  const saveInvoice = async () => {
    if (!form.client_name || !form.invoice_number) { alert('Invoice number and client name required'); return }
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('manual_invoices').insert([{
        invoice_number: form.invoice_number,
        client_name: form.client_name,
        client_company: form.client_company,
        client_email: form.client_email,
        client_phone: form.client_phone,
        client_address: form.client_address,
        notes: form.notes,
        status: form.status,
        items: form.items,
        total,
        due_date: form.due_date || null,
        bank_name: form.bank_name,
        account_name: form.account_name,
        account_number: form.account_number,
        routing_number: form.routing_number,
        swift: form.swift,
        bank_address: form.bank_address,
      }]).select().single()
    setInvoices(prev => [data, ...prev])
    setSelected(data)
    setShowCreate(false)
    setSaving(false)
  }

  const printInvoice = () => {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${selected?.invoice_number}</title><style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; background: #fff; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    </style></head><body>${content}</body></html>`)
    win.document.close()
    setTimeout(() => { win.print() }, 500)
  }

  const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  const fmtMoney = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (loading) return <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Loading...</div>

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#111', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(0,0,0,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart'],['Offers','/admin/offers']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Invoices' ? '#2d7dd2' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Invoices' ? '2px solid #2d7dd2' : '2px solid transparent', fontWeight: label === 'Invoices' ? 700 : 400 }}>{label}</Link>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowCreate(true)} style={{ fontSize: 12, color: '#111', background: '#2d7dd2', border: 'none', padding: '8px 18px', borderRadius: 3, cursor: 'pointer', fontWeight: 700 }}>+ New invoice</button>
          <button onClick={handleLogout} style={{ fontSize: 11, color: '#999', border: '0.5px solid rgba(0,0,0,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: selected ? '320px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LIST */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: '1rem' }}>Invoices <span style={{ fontSize: 11, color: '#999', fontWeight: 400 }}>· {invoices.length}</span></div>
          {invoices.length === 0 ? (
            <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 6, padding: '3rem', textAlign: 'center', color: '#999' }}>No invoices yet</div>
          ) : invoices.map(inv => (
            <div key={inv.id} onClick={() => setSelected(inv)}
              style={{ background: '#fff', borderTop: `1px solid ${selected?.id === inv.id ? '#2d7dd2' : 'rgba(0,0,0,0.06)'}`, borderRight: `1px solid ${selected?.id === inv.id ? '#2d7dd2' : 'rgba(0,0,0,0.06)'}`, borderBottom: `1px solid ${selected?.id === inv.id ? '#2d7dd2' : 'rgba(0,0,0,0.06)'}`, borderLeft: `4px solid ${inv.status === 'paid' ? '#2a7d4f' : '#2d7dd2'}`, borderRadius: 6, padding: '1rem 1.25rem', marginBottom: 8, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{inv.invoice_number}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{fmtMoney(inv.total)}</div>
              </div>
              <div style={{ fontSize: 11, color: '#777' }}>{inv.client_company || inv.client_name}</div>
              <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{fmtDate(inv.date)}</div>
            </div>
          ))}
        </div>

        {/* INVOICE PREVIEW */}
        {selected && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
              <button onClick={printInvoice} style={{ padding: '10px 20px', background: '#2d7dd2', color: '#111', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 4, letterSpacing: '0.06em' }}>Print / Download PDF</button>
              <button onClick={() => setSelected(null)} style={{ padding: '10px 16px', background: 'transparent', color: '#999', fontSize: 12, border: '0.5px solid rgba(0,0,0,0.08)', cursor: 'pointer', borderRadius: 4 }}>Close</button>
            </div>

            {/* INVOICE DOCUMENT */}
            {(() => {
              const paid = selected.status === 'paid'
              const stamp = paid ? 'Paid in full' : 'Payment due'
              const stampBg = paid ? '#dcfce7' : '#fef3c7'
              const stampInk = paid ? '#166534' : '#92400e'
              const hasRemit = selected.bank_name || selected.account_number || selected.routing_number
              return (
              <div ref={printRef} style={{ background: '#fff', color: '#08090b', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize: 13, lineHeight: 1.4, padding: 40 }}>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, paddingBottom: 12, borderBottom: '1px solid rgba(8,9,11,0.45)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <img src="https://www.levamcorp.com/levamcorp-logo_1.png" alt="Levam Corp Distributors" style={{ display: 'block', width: 85, height: 'auto', objectFit: 'contain' }} />
                    <div style={{ paddingTop: 3, fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em', lineHeight: 1.85, color: '#4a4741' }}>
                      6315 NW 99th Ave, Doral, FL 33178<br />
                      partners@levamcorp.com · (786) 878-4122<br />
                      levamcorp.com
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flex: 'none' }}>
                    <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1 }}>Invoice</div>
                    <div style={{ paddingTop: 7, fontFamily: 'monospace', fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', color: '#2d7dd2' }}>{selected.invoice_number}</div>
                    <div style={{ display: 'inline-block', marginTop: 8, background: stampBg, color: stampInk, fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 9px 5px' }}>{stamp}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 21, marginTop: 12, paddingBottom: 12, borderBottom: '1px solid rgba(8,9,11,0.14)' }}>
                  {[
                    ['Invoice date', fmtDate(selected.date), '#08090b'],
                    ['Payment due', selected.due_date ? fmtDate(selected.due_date) : 'Net 15', paid ? '#166534' : '#b45309'],
                    ['Status', paid ? 'Paid' : 'Unpaid', paid ? '#166534' : '#08090b'],
                  ].map(([k, v, ink]) => (
                    <div key={k}>
                      <div style={{ fontFamily: 'monospace', fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#777' }}>{k}</div>
                      <div style={{ paddingTop: 4, fontFamily: 'monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', color: ink }}>{v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 15 }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#777', paddingBottom: 7 }}>Bill to</div>
                  <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>{selected.client_name}</div>
                  <div style={{ paddingTop: 4, fontSize: 12, lineHeight: 1.55, color: '#4a4741' }}>
                    {selected.client_company && <>{selected.client_company}<br /></>}
                    {selected.client_email && <>{selected.client_email}<br /></>}
                    {selected.client_phone && <>{selected.client_phone}<br /></>}
                    {selected.client_address}
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 19 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(8,9,11,0.45)' }}>
                      {['#', 'Description', 'Qty', 'Unit', 'Amount'].map((h, i) => (
                        <th key={h} style={{ textAlign: i >= 2 ? 'right' : 'left', padding: i === 0 ? '7px 8px 8px 0' : '7px 8px 8px', fontFamily: 'monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#777' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items || []).map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(8,9,11,0.1)' }}>
                        <td style={{ padding: '9px 8px 10px 0', verticalAlign: 'top', fontFamily: 'monospace', fontSize: 11, color: '#9a968e' }}>{String(i + 1).padStart(2, '0')}</td>
                        <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', fontSize: 13 }}>{item.description}</td>
                        <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', textAlign: 'right', fontFamily: 'monospace', fontSize: 12 }}>{item.qty}</td>
                        <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', textAlign: 'right', fontFamily: 'monospace', fontSize: 12 }}>{fmtMoney(item.unit_price)}</td>
                        <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', textAlign: 'right', fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{fmtMoney(parseFloat(item.qty) * parseFloat(item.unit_price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'grid', gridTemplateColumns: hasRemit && !paid ? '1fr 285px' : '285px', justifyContent: hasRemit && !paid ? 'stretch' : 'end', gap: 24, marginTop: 13 }}>
                  {hasRemit && !paid && (
                    <div>
                      <div style={{ paddingBottom: 8, borderBottom: '1px solid rgba(8,9,11,0.14)', fontFamily: 'monospace', fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#777' }}>Remit payment to</div>
                      <div style={{ paddingTop: 9 }}>
                        {[
                          ['Bank', selected.bank_name],
                          ['Account name', selected.account_name],
                          ['Account #', selected.account_number],
                          ['Routing', selected.routing_number],
                          ['SWIFT / BIC', selected.swift],
                          ['Bank address', selected.bank_address],
                        ].filter(([, v]) => v).map(([k, v]) => (
                          <div key={k} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10, padding: '3px 0' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#777' }}>{k}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.04em', color: '#08090b' }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2d7dd2' }}>Reference {selected.invoice_number} on your transfer</div>
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '4px 0 5px', borderBottom: '1px solid rgba(8,9,11,0.12)' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#777' }}>Subtotal</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.02em', color: '#08090b' }}>{fmtMoney(selected.total)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 7, background: paid ? '#16a34a' : '#08090b', padding: '8px 13px 9px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: paid ? 'rgba(255,255,255,0.85)' : '#8f8c85' }}>{paid ? 'Paid in full' : 'Total due'}</span>
                      <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.03em', color: '#fff' }}>{fmtMoney(selected.total)}</span>
                    </div>
                  </div>
                </div>

                {selected.notes && (
                  <div style={{ marginTop: 19, borderLeft: '2px solid #2d7dd2', padding: '1px 0 2px 12px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#777' }}>Notes</div>
                    <div style={{ paddingTop: 4, fontSize: 11.5, lineHeight: 1.5, color: '#3f3d39' }}>{selected.notes}</div>
                  </div>
                )}

                <div style={{ marginTop: 21, paddingTop: 9, borderTop: '1px solid rgba(8,9,11,0.14)' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#777', paddingBottom: 7 }}>Terms &amp; conditions</div>
                  <div style={{ fontSize: 9.5, lineHeight: 1.55, color: '#777' }}>All sales are final — no returns, exchanges, refunds or cancellations once payment is confirmed. Damaged or defective goods must be reported to partners@levamcorp.com within 48 hours of delivery with photographic evidence. Late payments accrue 1.5% monthly interest. Governed by Florida law; venue Miami-Dade County. Unauthorized chargebacks will be disputed and may result in termination of the business relationship.</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 37, marginTop: 15 }}>
                  <div>
                    <div style={{ height: 25, borderBottom: '1px solid #08090b' }} />
                    <div style={{ paddingTop: 5, fontFamily: 'monospace', fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#777' }}>Authorized · Levam Corp Distributors</div>
                  </div>
                  <div>
                    <div style={{ height: 25, borderBottom: '1px solid #08090b' }} />
                    <div style={{ paddingTop: 5, fontFamily: 'monospace', fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#777' }}>Accepted · {selected.client_name}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 21, marginTop: 21, paddingTop: 8, borderTop: '1px solid rgba(8,9,11,0.14)', fontFamily: 'monospace', fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#777' }}>
                  <span>Levam Corp Distributors · {selected.invoice_number} · {fmtDate(selected.date)}</span>
                  <span>levamcorp.com</span>
                </div>
              </div>
              )
            })()}
          </div>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, overflowY: 'auto', padding: '2rem' }}>
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 8, maxWidth: 720, margin: '0 auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>New invoice</div>
              <button onClick={() => setShowCreate(false)} style={{ background: 'rgba(0,0,0,0.08)', border: 'none', color: '#666', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Invoice info */}
              <div>
                <div style={{ fontSize: 10, color: '#2d7dd2', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Invoice info</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[['Invoice number *', 'invoice_number', 'text'], ['Date', 'date', 'date'], ['Due date', 'due_date', 'date']].map(([label, field, type]) => (
                    <div key={field}>
                      <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{label}</label>
                      <input type={type} value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                        style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Client info */}
              <div>
                <div style={{ fontSize: 10, color: '#2d7dd2', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Client info</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['Contact name *', 'client_name'], ['Business name', 'client_company'], ['Email', 'client_email'], ['Phone', 'client_phone']].map(([label, field]) => (
                    <div key={field}>
                      <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{label}</label>
                      <input value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                        style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Address</label>
                    <input value={form.client_address} onChange={e => setForm(f => ({...f, client_address: e.target.value}))}
                      style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <div style={{ fontSize: 10, color: '#2d7dd2', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Items</div>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 110px 36px', gap: 8, marginBottom: 8 }}>
                    <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                      style={{ background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit' }} />
                    <input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)}
                      style={{ background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit' }} />
                    <input type="number" placeholder="Unit price" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)}
                      style={{ background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit' }} />
                    <button onClick={() => removeItem(i)} style={{ background: 'rgba(231,76,60,0.1)', border: '0.5px solid rgba(231,76,60,0.2)', color: '#e74c3c', borderRadius: 3, cursor: 'pointer', fontSize: 16 }}>×</button>
                  </div>
                ))}
                <button onClick={addItem} style={{ fontSize: 11, color: '#2d7dd2', background: 'rgba(45,125,210,0.08)', border: '0.5px solid rgba(45,125,210,0.2)', padding: '7px 14px', borderRadius: 3, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>+ Add item</button>
                <div style={{ textAlign: 'right', marginTop: 12, fontSize: 16, fontWeight: 700, color: '#111' }}>Total: {fmtMoney(total)}</div>
              </div>

              {/* Payment info */}
              <div>
                <div style={{ fontSize: 10, color: '#2d7dd2', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Payment instructions (shown on invoice)</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[['Bank name', 'bank_name'], ['Account name', 'account_name'], ['Account number', 'account_number'], ['Routing number', 'routing_number'], ['SWIFT / BIC', 'swift'], ['Bank address', 'bank_address']].map(([label, field]) => (
                    <div key={field}>
                      <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{label}</label>
                      <input value={form[field] || ''} onChange={e => setForm(f => ({...f, [field]: e.target.value}))}
                        style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} placeholder="e.g. All sales are final. Payment due within 15 days."
                  style={{ width: '100%', background: '#f0f1f3', border: '0.5px solid rgba(0,0,0,0.1)', color: '#444', fontSize: 12, padding: '9px 10px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }} />
              </div>

              <button onClick={saveInvoice} disabled={saving}
                style={{ padding: '13px', background: saving ? '#333' : '#2d7dd2', color: '#111', fontSize: 13, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 4, letterSpacing: '0.06em' }}>
                {saving ? 'Saving...' : 'Create invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
