'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentEntry, setPaymentEntry] = useState({ amount: '', notes: '' })
  const [savingPayment, setSavingPayment] = useState(false)
  const [showShipment, setShowShipment] = useState(false)
  const [shipmentForm, setShipmentForm] = useState({})
  const [savingShipment, setSavingShipment] = useState(false)
  const [showEditUnits, setShowEditUnits] = useState(false)
  const [editUnits, setEditUnits] = useState([])
  const [savingUnits, setSavingUnits] = useState(false)
  const printRef = useRef(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      await loadAll(supabase)
    })
  }, [])

  const loadAll = async (supabase) => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('submitted_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const updateStatus = async (orderId, newStatus) => {
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    if (selected?.id === orderId) setSelected(prev => ({ ...prev, status: newStatus }))
  }

  const saveEdit = async () => {
    const supabase = createClient()
    await supabase.from('orders').update({ status: editForm.status, total: parseFloat(editForm.total), notes: editForm.notes }).eq('id', selected.id)
    await loadAll(supabase)
    setSelected(prev => ({ ...prev, ...editForm, total: parseFloat(editForm.total) }))
    setEditing(false)
  }

  const deleteOrder = async () => {
    const supabase = createClient()
    await supabase.from('order_items').delete().eq('order_id', selected.id)
    await supabase.from('orders').delete().eq('id', selected.id)
    setOrders(prev => prev.filter(o => o.id !== selected.id))
    setSelected(null)
    setDeleteConfirm(false)
  }

  const savePartialPayment = async () => {
    if (!paymentEntry.amount) { alert('Enter an amount'); return }
    setSavingPayment(true)
    const supabase = createClient()
    const newAmountPaid = (parseFloat(selected.amount_paid) || 0) + parseFloat(paymentEntry.amount)
    const newNotes = paymentEntry.notes
      ? `${selected.payment_notes || ''}\n${new Date().toLocaleDateString()}: $${paymentEntry.amount}${paymentEntry.notes ? ' - ' + paymentEntry.notes : ''}`.trim()
      : selected.payment_notes
    await supabase.from('orders').update({ amount_paid: newAmountPaid, payment_notes: newNotes }).eq('id', selected.id)
    await loadAll(supabase)
    setSelected(prev => ({ ...prev, amount_paid: newAmountPaid, payment_notes: newNotes }))
    setPaymentEntry({ amount: '', notes: '' })
    setShowPayment(false)
    setSavingPayment(false)
  }

  const saveShipment = async () => {
    setSavingShipment(true)
    const supabase = createClient()
    await supabase.from('orders').update({
      shipment_weight: shipmentForm.shipment_weight,
      shipment_dimensions: shipmentForm.shipment_dimensions,
      shipment_pallets: parseInt(shipmentForm.shipment_pallets) || null,
      shipment_notes: shipmentForm.shipment_notes,
      eta: shipmentForm.eta || null,
      eta_notes: shipmentForm.eta_notes,
    }).eq('id', selected.id)
    await loadAll(supabase)
    setSelected(prev => ({ ...prev, ...shipmentForm }))
    setShowShipment(false)
    setSavingShipment(false)
  }

  const saveEditUnits = async () => {
    setSavingUnits(true)
    const supabase = createClient()
    const newTotal = editUnits.reduce((s, i) => s + (parseFloat(i.unit_price) * parseInt(i.quantity)), 0)
    for (const item of editUnits) {
      await supabase.from('order_items').update({ quantity: parseInt(item.quantity) }).eq('id', item.id)
    }
    await supabase.from('orders').update({ total: newTotal }).eq('id', selected.id)
    await loadAll(supabase)
    const updated = orders.find(o => o.id === selected.id)
    if (updated) setSelected({ ...updated, order_items: editUnits, total: newTotal })
    setShowEditUnits(false)
    setSavingUnits(false)
  }

  const getDocUrl = async (path) => {
    if (!path) return
    const supabase = createClient()
    let result = await supabase.storage.from('Documents').createSignedUrl(path, 3600)
    if (!result.data?.signedUrl) result = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (result.data?.signedUrl) window.open(result.data.signedUrl, '_blank')
  }

  const getProofUrl = async (path) => {
    if (!path) { alert('No file path found'); return }
    try {
      const supabase = createClient()
      let result = await supabase.storage.from('Documents').createSignedUrl(path, 3600)
      if (!result.data?.signedUrl) result = await supabase.storage.from('documents').createSignedUrl(path, 3600)
      if (result.data?.signedUrl) window.open(result.data.signedUrl, '_blank')
      else alert('Could not open file: ' + (result.error?.message || 'File not found'))
    } catch(e) { alert('Error: ' + e.message) }
  }

  const printInvoice = () => {
    const o = selected
    if (!o) return
    const items = o.order_items || []
    const date = new Date(o.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const business = (o.notes || '').split('Business: ')[1]?.split('|')[0]?.split('\n')[0]?.trim() || 'Client'
    const email = (o.notes || '').split('Email: ')[1]?.split(' ')[0]?.split(',')[0]?.trim() || ''
    const phone = (o.notes || '').split('Phone: ')[1]?.split('|')[0]?.split('\n')[0]?.trim() || ''
    const status = o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1) : ''
    const itemRows = items.map(item =>
      '<tr><td style="padding:12px 16px;font-size:13px;color:#333;border-bottom:1px solid #f5f5f5">' + item.product_name + '</td>' +
      '<td style="padding:12px 16px;font-size:13px;color:#555;text-align:center;border-bottom:1px solid #f5f5f5">' + item.quantity + '</td>' +
      '<td style="padding:12px 16px;font-size:13px;color:#555;text-align:right;border-bottom:1px solid #f5f5f5">$' + item.unit_price?.toLocaleString() + '</td>' +
      '<td style="padding:12px 16px;font-size:13px;font-weight:600;color:#111;text-align:right;border-bottom:1px solid #f5f5f5">$' + (item.unit_price * item.quantity)?.toLocaleString() + '</td></tr>'
    ).join('')

    const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#111}@media print{body{-webkit-print-color-adjust:exact}}</style></head><body>' +
      '<div style="background:#111;padding:32px 40px;display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div><div style="font-size:11px;letter-spacing:0.3em;color:#888;text-transform:uppercase;margin-bottom:4px">Corp · Distributors</div>' +
      '<div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:0.15em;text-transform:uppercase">LEVAM<span style="color:#2d7dd2">CORP</span></div>' +
      '<div style="margin-top:16px;font-size:11px;color:#666;line-height:1.8">6315 NW 99th Ave, Doral, FL 33178<br>partners@levamcorp.com<br>www.levamcorp.com<br>(786) 878-4122</div></div>' +
      '<div style="text-align:right"><div style="font-size:36px;font-weight:900;color:#fff;margin-bottom:8px">INVOICE</div>' +
      '<div style="font-size:16px;color:#2d7dd2;font-weight:700;margin-bottom:16px">#' + o.order_number + '</div>' +
      '<div style="font-size:11px;color:#666;line-height:2"><span style="color:#888">Date: </span><span style="color:#ccc">' + date + '</span><br>' +
      '<span style="color:#888">Status: </span><span style="color:#ccc">' + status + '</span></div></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;padding:28px 40px;border-bottom:1px solid #f0f0f0;gap:40px">' +
      '<div><div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;font-weight:600;margin-bottom:10px">From</div>' +
      '<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px">Levam Corp Distributors</div>' +
      '<div style="font-size:12px;color:#666;line-height:1.8">6315 NW 99th Ave<br>Doral, FL 33178<br>partners@levamcorp.com</div></div>' +
      '<div><div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;font-weight:600;margin-bottom:10px">Bill to</div>' +
      '<div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px">' + business + '</div>' +
      '<div style="font-size:12px;color:#666;line-height:1.8">' + email + (phone ? '<br>' + phone : '') + '</div></div></div>' +
      '<div style="padding:0 40px 28px"><table style="width:100%;border-collapse:collapse;margin-top:28px">' +
      '<thead><tr style="background:#111"><th style="padding:12px 16px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.1em;text-align:left">Product</th>' +
      '<th style="padding:12px 16px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;text-align:center">Qty</th>' +
      '<th style="padding:12px 16px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;text-align:right">Unit price</th>' +
      '<th style="padding:12px 16px;font-size:10px;font-weight:700;color:#fff;text-transform:uppercase;text-align:right">Total</th></tr></thead>' +
      '<tbody>' + itemRows + '</tbody></table>' +
      '<div style="display:flex;justify-content:flex-end;margin-top:20px">' +
      '<div style="width:280px"><div style="display:flex;justify-content:space-between;padding:8px 16px;font-size:12px;color:#888;border-top:1px solid #eee"><span>Subtotal</span><span>$' + o.total?.toLocaleString() + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;padding:14px 16px;background:#111;border-radius:4px"><span style="font-size:13px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:0.08em">Total due</span>' +
      '<span style="font-size:20px;font-weight:900;color:#fff">$' + o.total?.toLocaleString() + '</span></div></div></div></div>' +
      '<div style="margin:0 40px 28px;padding:20px 24px;background:#f7f8fa;border:1px solid #e8e8e8;border-radius:4px">' +
      '<div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;font-weight:700;margin-bottom:10px">Terms & Conditions</div>' +
      '<div style="font-size:11px;color:#555;line-height:1.9"><strong style="color:#111">ALL SALES ARE FINAL</strong> — No returns or refunds except for damaged/defective items reported within 48 hours. ' +
      '<strong style="color:#111">PAYMENT</strong> — Due within 15 days. Accepted: Wire, ACH, Credit/Debit. ' +
      '<strong style="color:#111">JURISDICTION</strong> — Governed by Florida law, Miami-Dade courts.</div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;padding:0 40px 40px">' +
      '<div><div style="border-top:1px solid #ddd;padding-top:8px"><div style="font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em">Authorized · Levam Corp</div>' +
      '<div style="font-size:10px;color:#ccc;margin-top:4px">Signature & date</div></div></div>' +
      '<div><div style="border-top:1px solid #ddd;padding-top:8px"><div style="font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em">Accepted · Client</div>' +
      '<div style="font-size:10px;color:#ccc;margin-top:4px">Signature & date</div></div></div></div>' +
      '<div style="background:#111;padding:16px 40px;display:flex;justify-content:space-between;align-items:center">' +
      '<div style="font-size:10px;color:#555">Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178</div>' +
      '<div style="font-size:10px;color:#555">partners@levamcorp.com · levamcorp.com</div></div>' +
      '</body></html>'

    const win = window.open('', '_blank')
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  const nextStatus = { new: 'review', review: 'confirmed', confirmed: 'dispatched', dispatched: 'completed' }
  const nextLabel = { new: 'Move to review', review: 'Confirm order', confirmed: 'Mark dispatched', dispatched: 'Mark completed' }
  const statusColor = { new: '#2d7dd2', review: '#854f0b', confirmed: '#534ab7', dispatched: '#2a7d4f', completed: '#2a7d4f', cancelled: '#e74c3c' }
  const statusLabel = { new: 'New', review: 'In review', confirmed: 'Confirmed', dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled' }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchSearch = !search || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.notes?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const grouped = { new: [], review: [], confirmed: [], dispatched: [], completed: [], cancelled: [] }
  filtered.forEach(o => { if (grouped[o.status]) grouped[o.status].push(o) })

  const totalUnits = selected?.order_items?.reduce((s, i) => s + i.quantity, 0) || 0
  const s = selected ? (statusColor[selected.status] || '#555') : '#555'

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Orders' ? '#2d7dd2' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Orders' ? '2px solid #2d7dd2' : '2px solid transparent', fontWeight: label === 'Orders' ? 700 : 400 }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* STATS */}
      <div style={{ padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
        {[
          ['All', orders.length, '#ccc'],
          ['New', grouped.new.length, '#2d7dd2'],
          ['Review', grouped.review.length, '#854f0b'],
          ['Confirmed', grouped.confirmed.length, '#534ab7'],
          ['Dispatched', grouped.dispatched.length, '#2a7d4f'],
          ['Revenue', '$' + orders.filter(o=>['confirmed','dispatched','completed'].includes(o.status)).reduce((s,o)=>s+(o.total||0),0).toLocaleString(), '#2a7d4f'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: selected ? '1fr 440px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT */}
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: 12, padding: '8px 12px 8px 30px', borderRadius: 20, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#555' }}>🔍</span>
            </div>
            {['all','new','review','confirmed','dispatched','completed','cancelled'].map(st => (
              <button key={st} onClick={() => setFilterStatus(st)}
                style={{ fontSize: 11, padding: '6px 12px', borderRadius: 20, border: `0.5px solid ${filterStatus === st ? (statusColor[st] || '#2d7dd2') : 'rgba(255,255,255,0.08)'}`, background: filterStatus === st ? `${statusColor[st] || '#2d7dd2'}20` : 'transparent', color: filterStatus === st ? (statusColor[st] || '#2d7dd2') : '#555', cursor: 'pointer', fontWeight: filterStatus === st ? 700 : 400, textTransform: 'capitalize', fontFamily: 'inherit' }}>
                {st === 'all' ? `All (${orders.length})` : `${statusLabel[st] || st} (${grouped[st]?.length || 0})`}
              </button>
            ))}
          </div>

          {Object.entries(grouped).filter(([, arr]) => arr.length > 0).map(([status, group]) => (
            filterStatus !== 'all' && filterStatus !== status ? null :
            <div key={status} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: statusColor[status], letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[status], display: 'inline-block' }} />
                {statusLabel[status]} · {group.length} order{group.length > 1 ? 's' : ''} · ${group.reduce((s,o)=>s+(o.total||0),0).toLocaleString()}
              </div>
              {group.map(order => (
                <div key={order.id} onClick={() => { setSelected(order); setEditing(false); setDeleteConfirm(false); setShowPayment(false); setShowShipment(false); setShowEditUnits(false) }}
                  style={{ background: '#111', border: `1px solid ${selected?.id === order.id ? statusColor[status] : 'rgba(255,255,255,0.06)'}`, borderLeft: `4px solid ${statusColor[status]}`, borderRadius: 6, padding: '1rem 1.25rem', marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>#{order.order_number}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{fmtDate(order.submitted_at)} at {fmtTime(order.submitted_at)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>${order.total?.toLocaleString()}</div>
                      {order.amount_paid > 0 && order.amount_paid < order.total && (
                        <div style={{ fontSize: 10, color: '#854f0b' }}>${(order.total - order.amount_paid).toLocaleString()} remaining</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {order.order_items?.slice(0,3).map((item, i) => (
                      <span key={i} style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(255,255,255,0.04)', color: '#666', borderRadius: 8 }}>{item.product_name} ×{item.quantity}</span>
                    ))}
                    {order.order_items?.length > 3 && <span style={{ fontSize: 9, color: '#444' }}>+{order.order_items.length - 3} more</span>}
                    {order.payment_proof_url && <span style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', borderRadius: 8 }}>✓ Proof</span>}
                    {order.bol_url && <span style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(45,125,210,0.1)', color: '#2d7dd2', borderRadius: 8 }}>BOL</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* RIGHT — order detail */}
        {selected && (
          <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg,#0d0d0d,#1a1a2e)', padding: '1.25rem 1.5rem', position: 'sticky', top: 0, zIndex: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: s, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>{statusLabel[selected.status]}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>#{selected.order_number}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{fmtDate(selected.submitted_at)} at {fmtTime(selected.submitted_at)}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {nextStatus[selected.status] && (
                    <button onClick={() => updateStatus(selected.id, nextStatus[selected.status])}
                      style={{ flex: 1, padding: '8px', background: s, color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 4, minWidth: 100 }}>
                      {nextLabel[selected.status]}
                    </button>
                  )}
                  <button onClick={printInvoice}
                    style={{ padding: '8px 12px', background: 'rgba(45,125,210,0.15)', color: '#2d7dd2', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(45,125,210,0.3)', cursor: 'pointer', borderRadius: 4 }}>
                    🖨 Invoice
                  </button>
                  <button onClick={() => { setEditing(!editing); setEditForm({ status: selected.status, total: selected.total, notes: selected.notes || '' }) }}
                    style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.06)', color: '#888', fontSize: 11, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 4 }}>Edit</button>
                  <button onClick={() => setDeleteConfirm(true)}
                    style={{ padding: '8px 10px', background: 'rgba(231,76,60,0.08)', color: '#e74c3c', fontSize: 11, border: '0.5px solid rgba(231,76,60,0.2)', cursor: 'pointer', borderRadius: 4 }}>Delete</button>
                </div>
              </div>

              {/* Delete confirm */}
              {deleteConfirm && (
                <div style={{ padding: '1rem 1.5rem', background: 'rgba(231,76,60,0.08)', borderBottom: '0.5px solid rgba(231,76,60,0.2)' }}>
                  <div style={{ fontSize: 12, color: '#e74c3c', marginBottom: 8 }}>Delete this order permanently?</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={deleteOrder} style={{ padding: '7px 14px', background: '#e74c3c', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 3 }}>Yes, delete</button>
                    <button onClick={() => setDeleteConfirm(false)} style={{ padding: '7px 14px', background: 'transparent', color: '#555', fontSize: 11, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Edit form */}
              {editing && (
                <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div>
                      <label style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Status</label>
                      <select value={editForm.status} onChange={e => setEditForm(f => ({...f, status: e.target.value}))}
                        style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '8px', borderRadius: 3, outline: 'none', fontFamily: 'inherit' }}>
                        {['new','review','confirmed','dispatched','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>Total ($)</label>
                      <input type="number" value={editForm.total} onChange={e => setEditForm(f => ({...f, total: e.target.value}))}
                        style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '8px', borderRadius: 3, outline: 'none', fontFamily: 'inherit' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={saveEdit} style={{ flex: 1, padding: 8, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 3 }}>Save</button>
                    <button onClick={() => setEditing(false)} style={{ padding: '8px 12px', background: 'transparent', color: '#555', fontSize: 11, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Client info */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Client</div>
                {[
                  ['Business', selected.notes?.match(/Business: ([^\n|]+)/)?.[1]?.trim()],
                  ['Email', selected.notes?.match(/Email: ([^\s|,]+)/)?.[1]],
                  ['Phone', selected.notes?.match(/Phone: ([^\n|]+)/)?.[1]?.trim()],
                  ['Payment', selected.notes?.match(/Payment: ([^\n|]+)/)?.[1]?.trim()],
                  ['Shipping', selected.notes?.match(/Shipping: ([^\n|]+)/)?.[1]?.trim()],
                ].filter(([,v]) => v).map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: '#555' }}>{label}</span>
                    <span style={{ color: '#ccc', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
                  </div>
                ))}
                {/* Payment proof */}
                {selected.payment_proof_url && (
                  <button onClick={() => getProofUrl(selected.payment_proof_url)}
                    style={{ marginTop: 8, width: '100%', padding: '7px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(42,125,79,0.3)', borderRadius: 4, cursor: 'pointer' }}>
                    ✓ View payment proof
                  </button>
                )}
              </div>

              {/* Shipment */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showShipment ? 10 : 0 }}>
                  <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>📦 Shipment & ETA</div>
                  <button onClick={() => { setShowShipment(!showShipment); setShipmentForm({ shipment_weight: selected.shipment_weight || '', shipment_dimensions: selected.shipment_dimensions || '', shipment_pallets: selected.shipment_pallets || '', shipment_notes: selected.shipment_notes || '', eta: selected.eta || '', eta_notes: selected.eta_notes || '' }) }}
                    style={{ fontSize: 10, color: '#2d7dd2', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.3)', padding: '4px 10px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>
                    ✏️ {selected.shipment_weight ? 'Edit' : 'Add'}
                  </button>
                </div>
                {!showShipment && (selected.shipment_weight || selected.eta) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
                    {[['Weight', selected.shipment_weight], ['Dimensions', selected.shipment_dimensions], ['Pallets', selected.shipment_pallets ? selected.shipment_pallets + ' pallet(s)' : null], ['ETA', selected.eta ? new Date(selected.eta + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null]].filter(([,v]) => v).map(([label, val]) => (
                      <div key={label} style={{ padding: '6px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 3, border: '0.5px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: 8, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#ccc' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}
                {showShipment && (
                  <div style={{ background: 'rgba(45,125,210,0.04)', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 4, padding: '0.875rem', marginTop: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                      {[['Weight', 'shipment_weight', 'e.g. 250 lbs'], ['Dimensions', 'shipment_dimensions', 'e.g. 48×40×60 in'], ['Pallets', 'shipment_pallets', 'e.g. 2'], ['ETA date', 'eta', 'date'], ['Notes', 'shipment_notes', 'Notes for client'], ['ETA notes', 'eta_notes', 'e.g. By truck']].map(([label, field, ph]) => (
                        <div key={field} style={{ gridColumn: ['shipment_notes','eta_notes'].includes(field) ? 'span 2' : 'auto' }}>
                          <label style={{ fontSize: 8, color: '#777', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>{label}</label>
                          <input type={field === 'eta' ? 'date' : 'text'} value={shipmentForm[field] || ''} onChange={e => setShipmentForm(f => ({...f, [field]: e.target.value}))} placeholder={field !== 'eta' ? ph : ''}
                            style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 11, padding: '6px 8px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', colorScheme: 'dark' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={saveShipment} disabled={savingShipment} style={{ flex: 1, padding: 7, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 3 }}>
                        {savingShipment ? 'Saving...' : '✓ Save'}
                      </button>
                      <button onClick={() => setShowShipment(false)} style={{ padding: '7px 10px', background: 'transparent', color: '#555', fontSize: 11, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
                    </div>
                  </div>
                )}
                {/* BOL & Labels */}
                {(selected.bol_url || selected.labels_url) && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {selected.bol_url && <button onClick={() => getDocUrl(selected.bol_url)} style={{ flex: 1, padding: '6px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', fontSize: 10, fontWeight: 600, border: '0.5px solid rgba(42,125,79,0.3)', borderRadius: 3, cursor: 'pointer' }}>📋 BOL</button>}
                    {selected.labels_url && <button onClick={() => getDocUrl(selected.labels_url)} style={{ flex: 1, padding: '6px', background: 'rgba(45,125,210,0.1)', color: '#2d7dd2', fontSize: 10, fontWeight: 600, border: '0.5px solid rgba(45,125,210,0.3)', borderRadius: 3, cursor: 'pointer' }}>🏷 Labels</button>}
                  </div>
                )}
              </div>

              {/* Items */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>Items · {selected.order_items?.length} products · {totalUnits} units</div>
                  <button onClick={() => { setShowEditUnits(!showEditUnits); setEditUnits(selected.order_items?.map(i => ({...i})) || []) }}
                    style={{ fontSize: 10, color: '#854f0b', background: 'rgba(133,79,11,0.1)', border: '0.5px solid rgba(133,79,11,0.3)', padding: '4px 10px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>
                    ✏️ Edit units
                  </button>
                </div>
                {showEditUnits ? (
                  <div style={{ background: 'rgba(133,79,11,0.04)', border: '0.5px solid rgba(133,79,11,0.15)', borderRadius: 4, padding: '0.875rem' }}>
                    {editUnits.map((item, i) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < editUnits.length-1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div style={{ fontSize: 12, color: '#ccc', flex: 1 }}>{item.product_name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="number" min="1" value={item.quantity}
                            onChange={e => setEditUnits(prev => prev.map((it, idx) => idx === i ? {...it, quantity: parseInt(e.target.value) || 1} : it))}
                            style={{ width: 60, background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '5px 8px', borderRadius: 3, outline: 'none', textAlign: 'center' }} />
                          <span style={{ fontSize: 11, color: '#555' }}>${(item.unit_price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 3, display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#888' }}>New total</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>${editUnits.reduce((s,i) => s + (i.unit_price * i.quantity), 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={saveEditUnits} disabled={savingUnits} style={{ flex: 1, padding: 7, background: '#854f0b', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 3 }}>
                        {savingUnits ? 'Saving...' : '✓ Save units'}
                      </button>
                      <button onClick={() => setShowEditUnits(false)} style={{ padding: '7px 10px', background: 'transparent', color: '#555', fontSize: 11, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {selected.order_items?.map((item, i) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < selected.order_items.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc', marginBottom: 1 }}>{item.product_name}</div>
                          <div style={{ fontSize: 10, color: '#555', fontFamily: 'monospace' }}>{item.product_sku} · {item.quantity} units × ${item.unit_price?.toLocaleString()}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>${(item.unit_price * item.quantity)?.toLocaleString()}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: '10px 12px', background: `${s}10`, border: `0.5px solid ${s}30`, borderRadius: 3, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>Total</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: s }}>${selected.total?.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Payment tracking */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>💳 Payment tracking</div>
                  <button onClick={() => setShowPayment(!showPayment)} style={{ fontSize: 10, color: '#2d7dd2', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.3)', padding: '4px 10px', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>+ Add payment</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#888' }}>Paid</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2a7d4f' }}>${(parseFloat(selected.amount_paid) || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#888' }}>Balance due</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: Math.max(0, selected.total - (parseFloat(selected.amount_paid) || 0)) > 0 ? '#e74c3c' : '#2a7d4f' }}>
                    ${Math.max(0, selected.total - (parseFloat(selected.amount_paid) || 0)).toLocaleString()}
                  </span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, ((parseFloat(selected.amount_paid) || 0) / selected.total) * 100)}%`, background: '#2a7d4f', borderRadius: 3 }} />
                </div>
                {showPayment && (
                  <div style={{ marginTop: 8, background: 'rgba(45,125,210,0.04)', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 4, padding: '0.875rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
                      <div>
                        <label style={{ fontSize: 8, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 3 }}>Amount ($)</label>
                        <input type="number" value={paymentEntry.amount} onChange={e => setPaymentEntry(p => ({...p, amount: e.target.value}))} placeholder="0.00"
                          style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '7px 8px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 8, color: '#777', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 3 }}>Notes</label>
                        <input value={paymentEntry.notes} onChange={e => setPaymentEntry(p => ({...p, notes: e.target.value}))} placeholder="e.g. Wire"
                          style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '7px 8px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={savePartialPayment} disabled={savingPayment} style={{ flex: 1, padding: 7, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 3 }}>
                        {savingPayment ? 'Saving...' : '✓ Record'}
                      </button>
                      <button onClick={() => setShowPayment(false)} style={{ padding: '7px 10px', background: 'transparent', color: '#555', fontSize: 11, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
                    </div>
                  </div>
                )}
                {selected.payment_notes && (
                  <div style={{ marginTop: 6, fontSize: 10, color: '#555', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{selected.payment_notes}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
