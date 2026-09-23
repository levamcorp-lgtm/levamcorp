'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'

const HEARD_ABOUT_OPTIONS = [
  ['google', 'Google'], ['instagram', 'Instagram'], ['facebook', 'Facebook'],
  ['friend', 'A friend'], ['broker', 'A broker'], ['existing_client', 'Existing client'],
  ['trade_show', 'Trade show'], ['whatsapp', 'WhatsApp'], ['youtube', 'YouTube'],
  ['tiktok', 'TikTok'], ['amazon_seller', 'Amazon seller community'], ['walmart_seller', 'Walmart seller community'],
  ['other', 'Other'],
]

const EXTERNAL_DOC_MARKER = 'external:whatsapp'
const isExternalDoc = (path) => typeof path === 'string' && path.startsWith(EXTERNAL_DOC_MARKER)

const STATUS_LABEL = { new: 'New', review: 'In review', confirmed: 'Confirmed', dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled' }
const STATUS_BADGE = {
  new: { bg: '#fee2e2', ink: '#991b1b' },
  review: { bg: '#fde68a', ink: '#7c4a03' },
  confirmed: { bg: '#e8f0ff', ink: DEEP },
  dispatched: { bg: '#e8f0ff', ink: DEEP },
  completed: { bg: '#dcfce7', ink: '#166534' },
  cancelled: { bg: '#f1f2f5', ink: '#6b7280' },
}
const NEXT_STATUS = { new: 'review', review: 'confirmed', confirmed: 'dispatched', dispatched: 'completed' }
const NEXT_LABEL = { new: 'Move to review', review: 'Confirm order', confirmed: 'Mark dispatched', dispatched: 'Mark completed' }

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
const fmtFull = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
const money = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const short = (n) => { const v = parseFloat(n) || 0; return v >= 1000 ? '$' + (v / 1000).toFixed(1) + 'k' : money(v) }
const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0

function IconHome({ on }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? ACCENT : '#8b909a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9.5h13V10" /><path d="M10 19.5v-6h4v6" /></svg>
}
function IconApps({ on }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? ACCENT : '#8b909a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4.5" width="14" height="16" rx="2.2" /><path d="M9 4.5V3h6v1.5" /><path d="M8.3 11h7.4M8.3 14.7h4.8" /></svg>
}
function IconBox({ on }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={on ? ACCENT : '#8b909a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 7.2 12 3.5l8.5 3.7-8.5 3.7-8.5-3.7Z" /><path d="M3.5 7.2v9.6L12 20.5l8.5-3.7V7.2" /><path d="M12 10.9v9.6" /></svg>
}
function IconBack() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16181d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 5.5 7 12l7.5 6.5" /></svg>
}

function Chip({ label, count, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '9px 13px 10px', borderRadius: 20, border: `1px solid ${active ? '#16181d' : '#d9dce2'}`, background: active ? '#16181d' : '#ffffff', color: active ? '#ffffff' : '#47505e', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {label}{count != null && <span style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 6px 3px', borderRadius: 9, background: active ? 'rgba(255,255,255,.18)' : '#f1f2f5', color: active ? '#ffffff' : '#6b7280' }}>{count}</span>}
    </button>
  )
}

function StatCard({ label, value, sub, bg, ink, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ textAlign: 'left', border: 'none', borderRadius: 14, padding: '15px 16px 14px', background: bg, color: ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, opacity: .85, letterSpacing: '.01em' }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>{value}</span>
      <span style={{ fontSize: 12, opacity: .8 }}>{sub}</span>
    </button>
  )
}

function InfoRow({ k, v, mono, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 0', borderBottom: '1px solid #f1f2f5' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#8b909a', flex: 'none' }}>{k}</span>
      {action ? action : <span className={mono ? 'lc-mono' : ''} style={{ fontSize: 14.5, fontWeight: 600, color: '#16181d', textAlign: 'right', wordBreak: 'break-word' }}>{v || '—'}</span>}
    </div>
  )
}

function AppCard({ app, onClick }) {
  const isPending = !app.status || app.status === 'pending'
  const docsOk = [app.ein_document_url, app.resale_tax_document_url].filter(Boolean).length === 2
  const days = daysSince(app.created_at)
  return (
    <button type="button" onClick={onClick} style={{ width: '100%', textAlign: 'left', border: '1px solid #e4e7ec', borderRadius: 13, background: '#ffffff', padding: '13px 15px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.01em', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.business_name || 'Untitled business'}</span>
        {isPending ? (
          <span style={{ flex: 'none', fontSize: 11.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 6, background: days > 2 ? '#fee2e2' : '#fde68a', color: days > 2 ? '#991b1b' : '#7c4a03' }}>{days > 1 ? `${days}d` : 'New'}</span>
        ) : (
          <span style={{ flex: 'none', fontSize: 11.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 6, background: app.status === 'approved' ? '#dcfce7' : '#f1f2f5', color: app.status === 'approved' ? '#166534' : '#6b7280' }}>{app.status === 'approved' ? 'Approved' : 'Rejected'}</span>
        )}
      </span>
      <span style={{ fontSize: 13.5, color: '#6b7280' }}>{app.contact_name || 'No contact name'} · {app.monthly_volume || 'volume n/a'}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: docsOk ? '#166534' : '#991b1b', fontWeight: 600 }}>{docsOk ? '✓ Both documents on file' : '! Missing a document'}</span>
    </button>
  )
}

function OrderCard({ order, client, onClick }) {
  const badge = STATUS_BADGE[order.status] || STATUS_BADGE.new
  return (
    <button type="button" onClick={onClick} style={{ width: '100%', textAlign: 'left', border: '1px solid #e4e7ec', borderRadius: 13, background: '#ffffff', padding: '13px 15px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span className="lc-mono" style={{ fontSize: 14.5, fontWeight: 700 }}>{order.order_number}</span>
        <span style={{ flex: 'none', fontSize: 11.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 6, background: badge.bg, color: badge.ink }}>{STATUS_LABEL[order.status] || order.status}</span>
      </span>
      <span style={{ fontSize: 13.5, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{client?.business_name || 'Unknown client'} · {fmt(order.submitted_at)}</span>
      <span style={{ fontSize: 15, fontWeight: 700 }}>{money(order.total)}</span>
    </button>
  )
}

export default function MobileAdmin() {
  const [ready, setReady] = useState(false)
  const [applications, setApplications] = useState([])
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])

  const [tab, setTab] = useState('home')
  const [appFilter, setAppFilter] = useState('Pending')
  const [orderFilter, setOrderFilter] = useState('Needs action')
  const [appSearch, setAppSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')

  const [openAppId, setOpenAppId] = useState(null)
  const [openOrderId, setOpenOrderId] = useState(null)
  const [approving, setApproving] = useState(null)

  const [uploadingBol, setUploadingBol] = useState(false)
  const [editingSerialId, setEditingSerialId] = useState(null)
  const [serialDraft, setSerialDraft] = useState('')
  const [savingSerial, setSavingSerial] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      await loadAll(sb)
    })
  }, [])

  const loadAll = async (sb) => {
    sb = sb || createClient()
    const [{ data: a }, { data: o }, { data: c }, { data: p }] = await Promise.all([
      sb.from('applications').select('*').order('id', { ascending: false }),
      sb.from('orders').select('*, order_items(*)').order('submitted_at', { ascending: false }),
      sb.from('clients').select('*'),
      sb.from('products').select('id,name,cost_price'),
    ])
    setApplications(a || [])
    setOrders(o || [])
    setClients(c || [])
    setProducts(p || [])
    setReady(true)
  }

  const handleLogout = async () => { await createClient().auth.signOut(); window.location.href = '/admin' }

  const clientFor = (order) => {
    const email = (order.notes || '').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim() || ''
    return clients.find(c => c.email?.toLowerCase() === email.toLowerCase()) || null
  }

  // what we pay the supplier for a line item — null when the product's cost price was never set
  const costFor = (item) => {
    const p = products.find(p => p.id === item.product_id) || products.find(p => p.name === item.product_name)
    return p && p.cost_price != null ? parseFloat(p.cost_price) : null
  }

  // ---- applications ----
  const pending = applications.filter(a => !a.status || a.status === 'pending')
  const approved = applications.filter(a => a.status === 'approved')
  const rejected = applications.filter(a => a.status === 'rejected')
  const appList = (appFilter === 'All' ? applications : appFilter === 'Pending' ? pending : appFilter === 'Approved' ? approved : rejected)
    .filter(a => !appSearch.trim() || `${a.business_name} ${a.contact_name} ${a.email}`.toLowerCase().includes(appSearch.trim().toLowerCase()))
  const openApp = applications.find(a => a.id === openAppId) || null

  const approveApp = async (app) => {
    setApproving(app.id)
    const provision = await fetch('/api/approve-application', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: app.id, email: app.email, businessName: app.business_name, contactName: app.contact_name,
        phone: app.phone, address: app.address, businessType: app.business_type, monthlyVolume: app.monthly_volume,
        yearsInBusiness: app.years_in_business, einNumber: app.ein_number, resaleTaxNumber: app.resale_tax_number,
        einDocumentUrl: app.ein_document_url, resaleTaxDocumentUrl: app.resale_tax_document_url,
      })
    }).then(r => r.json()).catch(() => ({ success: false }))
    if (!provision.success) { alert(`Couldn't approve this client: ${provision.error || 'unknown error'}`); setApproving(null); return }
    const [welcomeRes, credsRes] = await Promise.all([
      fetch('/api/send-approval-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: app.email, contactName: app.contact_name, businessName: app.business_name }) }),
      fetch('/api/send-credentials-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: app.email, password: provision.tempPassword, businessName: app.business_name, contactName: app.contact_name }) }),
    ])
    if (!welcomeRes.ok || !credsRes.ok) alert('Client approved and their login was created, but an email failed to send. Please share their credentials manually.')
    await loadAll()
    setApproving(null)
  }

  const rejectApp = async (id) => {
    if (!confirm('Reject this application?')) return
    const sb = createClient()
    await sb.from('applications').update({ status: 'rejected' }).eq('id', id)
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
  }

  const markDocExternal = async (app, field) => {
    const value = `${EXTERNAL_DOC_MARKER}|${new Date().toISOString()}`
    const sb = createClient()
    const { error } = await sb.from('applications').update({ [field]: value }).eq('id', app.id)
    if (!error) setApplications(prev => prev.map(a => a.id === app.id ? { ...a, [field]: value } : a))
  }
  const undoDocExternal = async (app, field) => {
    const sb = createClient()
    const { error } = await sb.from('applications').update({ [field]: null }).eq('id', app.id)
    if (!error) setApplications(prev => prev.map(a => a.id === app.id ? { ...a, [field]: null } : a))
  }

  const viewDoc = async (path) => {
    if (!path) return
    const sb = createClient()
    let r = await sb.storage.from('Documents').createSignedUrl(path, 3600)
    if (!r.data?.signedUrl) r = await sb.storage.from('documents').createSignedUrl(path, 3600)
    if (r.data?.signedUrl) window.open(r.data.signedUrl, '_blank')
  }

  const openWhatsApp = (app) => {
    const digits = (app.phone || '').replace(/\D/g, '')
    if (!digits) { alert('No phone number on file.'); return }
    const withCountry = digits.length === 10 ? '1' + digits : digits
    const firstName = (app.contact_name || '').trim().split(' ')[0] || 'there'
    const missing = [!app.ein_document_url && 'EIN / SS-4 letter', !app.resale_tax_document_url && 'Florida resale certificate'].filter(Boolean)
    const message = missing.length
      ? `Hi ${firstName}! 👋 This is the Levam Corp Distributors team. We're finishing up your wholesale application${app.business_name ? ` for *${app.business_name}*` : ''} — we just need ${missing.join(' and ')} (PDF). Could you send it over here whenever you get a chance? 🙌`
      : `Hi ${firstName}! 👋 This is the Levam Corp Distributors team — thank you for applying${app.business_name ? ` with *${app.business_name}*` : ''}! We review every application personally and will be in touch shortly. Feel free to reply here anytime 🙌`
    window.open(`https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // ---- orders ----
  const needsAction = orders.filter(o => ['new', 'review', 'confirmed', 'dispatched'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'completed')
  const revenue = orders.filter(o => ['confirmed', 'dispatched', 'completed'].includes(o.status)).reduce((s, o) => s + (parseFloat(o.total) || 0), 0)
  const orderList = (orderFilter === 'All' ? orders : orderFilter === 'Needs action' ? needsAction : completedOrders)
    .filter(o => !orderSearch.trim() || `${o.order_number} ${clientFor(o)?.business_name || ''}`.toLowerCase().includes(orderSearch.trim().toLowerCase()))
  const openOrder = orders.find(o => o.id === openOrderId) || null
  const openOrderClient = openOrder ? clientFor(openOrder) : null

  const advanceStatus = async (order) => {
    const next = NEXT_STATUS[order.status]
    if (!next) return
    const sb = createClient()
    await sb.from('orders').update({ status: next }).eq('id', order.id)
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o))
  }

  const uploadBol = async (order, file) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) { alert('Please upload a PDF or a photo.'); return }
    if (file.size > 15 * 1024 * 1024) { alert('Max file size is 15MB.'); return }
    setUploadingBol(true)
    const sb = createClient()
    const path = `bol/${order.order_number}-${Date.now()}-${file.name}`
    const { data, error } = await sb.storage.from('Documents').upload(path, file, { contentType: file.type })
    if (error) { alert(`Couldn't upload: ${error.message}`); setUploadingBol(false); return }
    const { error: updateError } = await sb.from('orders').update({ bol_url: data.path }).eq('id', order.id)
    if (updateError) { alert(`Uploaded, but couldn't save it to the order: ${updateError.message}`); setUploadingBol(false); return }
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, bol_url: data.path } : o))
    setUploadingBol(false)
  }

  const startEditSerial = (item) => { setEditingSerialId(item.id); setSerialDraft(item.serial_numbers || '') }
  const saveSerial = async (item) => {
    setSavingSerial(true)
    const sb = createClient()
    const value = serialDraft.trim() || null
    const { error } = await sb.from('order_items').update({ serial_numbers: value }).eq('id', item.id)
    if (error) { alert(`Couldn't save serial numbers: ${error.message}`); setSavingSerial(false); return }
    setOrders(prev => prev.map(o => o.id === item.order_id ? { ...o, order_items: o.order_items.map(i => i.id === item.id ? { ...i, serial_numbers: value } : i) } : o))
    setSavingSerial(false)
    setEditingSerialId(null)
  }

  const btnPrimary = { padding: '13px 18px 14px', borderRadius: 11, background: ACCENT, color: '#ffffff', fontSize: 14.5, fontWeight: 700, border: 'none', cursor: 'pointer', width: '100%' }
  const btnGhost = { padding: '12px 16px 13px', borderRadius: 11, background: '#ffffff', color: '#47505e', fontSize: 14, fontWeight: 600, border: '1px solid #d9dce2', cursor: 'pointer' }

  if (!ready) return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#f2f5fa', fontFamily: "'DM Sans',sans-serif", color: '#8b909a', fontSize: 14 }}>Loading…</div>
  )

  // ---------------- Application detail screen ----------------
  if (openApp) {
    const isPending = !openApp.status || openApp.status === 'pending'
    const einOk = !!openApp.ein_document_url
    const resaleOk = !!openApp.resale_tax_document_url
    const partial = !einOk || !resaleOk
    return (
      <div style={{ minHeight: '100dvh', background: '#f2f5fa', fontFamily: "'DM Sans',sans-serif", color: '#16181d' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#ffffff', borderBottom: '1px solid #e4e7ec', padding: '14px 16px 13px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => setOpenAppId(null)} aria-label="Back" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}><IconBack /></button>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span style={{ display: 'block', fontSize: 16.5, fontWeight: 700, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{openApp.business_name || 'Untitled business'}</span>
            <span style={{ display: 'block', fontSize: 12.5, color: '#8b909a' }}>{openApp.contact_name}</span>
          </span>
        </div>

        <div style={{ padding: '16px 16px 130px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#ffffff', border: '1px solid #e4e7ec', borderRadius: 13, padding: '4px 15px' }}>
            <InfoRow k="Email" v={openApp.email} action={openApp.email ? <a href={`mailto:${openApp.email}`} style={{ fontSize: 13.5, fontWeight: 700, color: DEEP }}>{openApp.email}</a> : null} />
            <InfoRow k="Phone" v={openApp.phone} mono action={openApp.phone ? <a href={`tel:${openApp.phone}`} style={{ fontSize: 14.5, fontWeight: 700, color: DEEP }}>{openApp.phone}</a> : null} />
            <InfoRow k="Address" v={openApp.address} />
            <InfoRow k="Business type" v={openApp.business_type} />
            <InfoRow k="Years operating" v={openApp.years_in_business} />
            <InfoRow k="Monthly volume" v={openApp.monthly_volume} />
            <InfoRow k="Heard about us" v={openApp.heard_about ? (HEARD_ABOUT_OPTIONS.find(([val]) => val === openApp.heard_about)?.[1] || openApp.heard_about) + (openApp.heard_about_detail ? ` — ${openApp.heard_about_detail}` : '') : null} />
            <InfoRow k="EIN number" v={openApp.ein_number} mono />
            <InfoRow k="Resale number" v={openApp.resale_tax_number} mono />
            <InfoRow k="Applied" v={fmtFull(openApp.created_at)} />
          </div>

          <button type="button" onClick={() => openWhatsApp(openApp)} style={{ ...btnPrimary, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>WhatsApp {openApp.contact_name?.split(' ')[0] || 'client'} ↗</button>

          <div style={{ background: '#ffffff', border: '1px solid #e4e7ec', borderRadius: 13, overflow: 'hidden' }}>
            <div style={{ padding: '13px 15px 12px', borderBottom: '1px solid #f1f2f5', fontSize: 14.5, fontWeight: 700 }}>Documents</div>
            {[
              { label: 'EIN / SS-4 letter', field: 'ein_document_url', path: openApp.ein_document_url },
              { label: 'Resale certificate', field: 'resale_tax_document_url', path: openApp.resale_tax_document_url },
            ].map(d => (
              <div key={d.field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 15px', borderBottom: '1px solid #f1f2f5' }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 600 }}>{d.label}</span>
                  <span style={{ display: 'block', fontSize: 12, color: isExternalDoc(d.path) ? DEEP : d.path ? '#166534' : '#991b1b' }}>{isExternalDoc(d.path) ? '✓ Confirmed via WhatsApp' : d.path ? '✓ On file' : 'Missing'}</span>
                </span>
                {d.path && !isExternalDoc(d.path) && <button type="button" onClick={() => viewDoc(d.path)} style={{ ...btnGhost, padding: '8px 12px 9px', fontSize: 13 }}>View</button>}
                {isExternalDoc(d.path) && <button type="button" onClick={() => undoDocExternal(openApp, d.field)} style={{ ...btnGhost, padding: '8px 12px 9px', fontSize: 12.5 }}>Undo</button>}
                {!d.path && <button type="button" onClick={() => markDocExternal(openApp, d.field)} style={{ padding: '8px 11px 9px', border: '1px solid #cfe0fb', borderRadius: 8, fontSize: 12, fontWeight: 700, color: DEEP, background: '#f2f7ff', cursor: 'pointer' }}>✓ Got it on WhatsApp</button>}
              </div>
            ))}
          </div>
        </div>

        {isPending && (
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#ffffff', borderTop: `3px solid ${partial ? '#dc2626' : '#16a34a'}`, padding: '13px 16px calc(14px + env(safe-area-inset-bottom, 0px))', display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => rejectApp(openApp.id)} style={{ ...btnGhost, flex: '0 0 auto', color: '#991b1b', borderColor: '#f3c9c9' }}>Reject</button>
            <button type="button" onClick={() => approveApp(openApp)} disabled={partial || approving === openApp.id} style={{ ...btnPrimary, flex: 1, background: partial ? '#c9ced6' : '#16a34a', cursor: partial ? 'not-allowed' : 'pointer' }}>{approving === openApp.id ? 'Approving…' : partial ? 'Missing a document' : 'Approve & create login'}</button>
          </div>
        )}
        {!isPending && (
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: openApp.status === 'approved' ? '#f3faf5' : '#faf5f5', borderTop: `3px solid ${openApp.status === 'approved' ? '#16a34a' : '#dc2626'}`, padding: '14px 16px calc(14px + env(safe-area-inset-bottom, 0px))', textAlign: 'center', fontSize: 14, fontWeight: 700, color: openApp.status === 'approved' ? '#166534' : '#991b1b' }}>
            {openApp.status === 'approved' ? `Approved — ${openApp.business_name} is now a partner` : 'Rejected'}
          </div>
        )}
      </div>
    )
  }

  // ---------------- Order detail screen ----------------
  if (openOrder) {
    const badge = STATUS_BADGE[openOrder.status] || STATUS_BADGE.new
    const next = NEXT_STATUS[openOrder.status]
    return (
      <div style={{ minHeight: '100dvh', background: '#f2f5fa', fontFamily: "'DM Sans',sans-serif", color: '#16181d' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#ffffff', borderBottom: '1px solid #e4e7ec', padding: '14px 16px 13px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => setOpenOrderId(null)} aria-label="Back" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}><IconBack /></button>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span className="lc-mono" style={{ display: 'block', fontSize: 16.5, fontWeight: 700 }}>{openOrder.order_number}</span>
            <span style={{ display: 'block', fontSize: 12.5, color: '#8b909a' }}>{openOrderClient?.business_name || 'Unknown client'}</span>
          </span>
          <span style={{ flex: 'none', fontSize: 12, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 7, background: badge.bg, color: badge.ink }}>{STATUS_LABEL[openOrder.status]}</span>
        </div>

        <div style={{ padding: '16px 16px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#ffffff', border: '1px solid #e4e7ec', borderRadius: 13, padding: '14px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>{money(openOrder.total)}</span>
            {next && <button type="button" onClick={() => advanceStatus(openOrder)} style={{ padding: '10px 14px 11px', borderRadius: 9, background: '#16181d', color: '#ffffff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{NEXT_LABEL[openOrder.status]} →</button>}
          </div>

          {openOrderClient && (
            <div style={{ background: '#ffffff', border: '1px solid #e4e7ec', borderRadius: 13, padding: '4px 15px' }}>
              <InfoRow k="Contact" v={openOrderClient.contact_name} />
              <InfoRow k="Phone" v={openOrderClient.phone} action={openOrderClient.phone ? <a href={`tel:${openOrderClient.phone}`} style={{ fontSize: 14.5, fontWeight: 700, color: DEEP }}>{openOrderClient.phone}</a> : null} />
              <InfoRow k="Email" v={openOrderClient.email} action={openOrderClient.email ? <a href={`mailto:${openOrderClient.email}`} style={{ fontSize: 13.5, fontWeight: 700, color: DEEP }}>{openOrderClient.email}</a> : null} />
            </div>
          )}

          <div style={{ background: '#ffffff', border: '1px solid #e4e7ec', borderRadius: 13, overflow: 'hidden' }}>
            <div style={{ padding: '13px 15px 12px', borderBottom: '1px solid #f1f2f5', fontSize: 14.5, fontWeight: 700 }}>Items &amp; serial numbers</div>
            {(openOrder.order_items || []).map(item => (
              <div key={item.id} style={{ padding: '13px 15px', borderBottom: '1px solid #f1f2f5' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</span>
                  <span style={{ flex: 'none', fontSize: 13, color: '#6b7280' }}>×{item.quantity}</span>
                </div>
                {editingSerialId === item.id ? (
                  <div style={{ marginTop: 9, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea value={serialDraft} onChange={e => setSerialDraft(e.target.value)} placeholder="One serial number per line" rows={3} style={{ width: '100%', border: '1px solid #d9dce2', borderRadius: 9, padding: '9px 11px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => setEditingSerialId(null)} style={{ ...btnGhost, flex: 1, padding: '9px 0', fontSize: 13 }}>Cancel</button>
                      <button type="button" onClick={() => saveSerial(item)} disabled={savingSerial} style={{ ...btnPrimary, flex: 1, padding: '9px 0', fontSize: 13 }}>{savingSerial ? 'Saving…' : 'Save'}</button>
                    </div>
                  </div>
                ) : item.serial_numbers ? (
                  <button type="button" onClick={() => startEditSerial(item)} style={{ marginTop: 8, width: '100%', textAlign: 'left', background: '#f7f8fa', border: '1px solid #e4e7ec', borderRadius: 9, padding: '9px 11px', cursor: 'pointer' }}>
                    <span className="lc-mono" style={{ display: 'block', fontSize: 12.5, color: '#47505e', whiteSpace: 'pre-line' }}>{item.serial_numbers}</span>
                    <span style={{ display: 'block', marginTop: 4, fontSize: 11.5, fontWeight: 700, color: DEEP }}>Edit</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => startEditSerial(item)} style={{ marginTop: 8, padding: '8px 12px 9px', border: '1px dashed #d9dce2', borderRadius: 9, fontSize: 12.5, fontWeight: 700, color: '#6b7280', background: '#f7f8fa', cursor: 'pointer' }}>+ Add serial numbers</button>
                )}
              </div>
            ))}
            {!(openOrder.order_items || []).length && <div style={{ padding: '15px', fontSize: 13, color: '#8b909a' }}>No items on this order</div>}
          </div>

          {openOrder.order_items?.length > 0 && (() => {
            const known = openOrder.order_items.filter(i => costFor(i) != null)
            const unknown = openOrder.order_items.filter(i => costFor(i) == null)
            const totalCost = known.reduce((s, i) => s + costFor(i) * i.quantity, 0)
            const profit = openOrder.total - totalCost
            const marginPct = openOrder.total > 0 ? (profit / openOrder.total) * 100 : 0
            return (
              <div style={{ background: '#ffffff', border: '1px solid #e4e7ec', borderRadius: 13, overflow: 'hidden' }}>
                <div style={{ padding: '13px 15px 12px', borderBottom: '1px solid #f1f2f5', fontSize: 14.5, fontWeight: 700 }}>Cost &amp; profit</div>
                <div style={{ padding: '0 15px' }}>
                  <InfoRow k="Pay the supplier" v={money(totalCost)} />
                  <InfoRow k="Client pays" v={money(openOrder.total)} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, padding: '12px 15px 13px' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: profit >= 0 ? '#166534' : '#991b1b' }}>{profit >= 0 ? 'Falls into your account' : 'Shortfall'}</span>
                  <span className="lc-mono" style={{ fontSize: 16, fontWeight: 700, color: profit >= 0 ? '#166534' : '#991b1b' }}>{money(profit)} <span style={{ fontSize: 12, fontWeight: 600, color: '#8b909a' }}>({marginPct.toFixed(1)}%)</span></span>
                </div>
                {unknown.length > 0 && (
                  <div style={{ padding: '9px 15px 10px', background: '#fffdf5', borderTop: '1px solid #f3e4bd', fontSize: 12, color: '#7c4a03' }}>⚠ Cost price missing for {unknown.length} item{unknown.length !== 1 ? 's' : ''} — set it on the Products page for an accurate number.</div>
                )}
              </div>
            )
          })()}

          <div style={{ background: '#ffffff', border: '1px solid #e4e7ec', borderRadius: 13, padding: '14px 15px' }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 3 }}>Proof of delivery</div>
            <div style={{ fontSize: 12.5, color: '#8b909a', marginBottom: 11 }}>Signed BOL or delivery invoice — PDF or a photo.</div>
            {openOrder.bol_url && (
              <button type="button" onClick={() => viewDoc(openOrder.bol_url)} style={{ ...btnGhost, width: '100%', marginBottom: 8, background: '#f3faf5', borderColor: '#cfe8d7', color: '#166534', fontWeight: 700 }}>✓ View proof of delivery</button>
            )}
            <label style={{ display: 'block' }}>
              <span style={{ ...btnGhost, width: '100%', display: 'block', textAlign: 'center', boxSizing: 'border-box', borderStyle: 'dashed', cursor: 'pointer' }}>{uploadingBol ? 'Uploading…' : openOrder.bol_url ? '↻ Replace — upload new PDF or take a photo' : '+ Upload BOL / take a photo'}</span>
              <input type="file" accept="application/pdf,image/*" capture="environment" disabled={uploadingBol} onChange={e => { const f = e.target.files?.[0]; if (f) uploadBol(openOrder, f); e.target.value = '' }} style={{ opacity: 0, width: 1, height: 1, position: 'absolute' }} />
            </label>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- Main shell ----------------
  return (
    <div style={{ minHeight: '100dvh', background: '#f2f5fa', fontFamily: "'DM Sans',sans-serif", color: '#16181d', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#ffffff', borderBottom: '1px solid #e4e7ec', padding: '14px 16px 13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>
          <span style={{ display: 'block', fontSize: 16.5, fontWeight: 800, letterSpacing: '-.01em' }}>Levam Corp</span>
          <span style={{ display: 'block', fontSize: 11.5, color: '#8b909a' }}>Admin · Mobile</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" onClick={() => loadAll()} aria-label="Refresh" style={{ border: '1px solid #d9dce2', background: '#ffffff', borderRadius: 9, width: 34, height: 34, cursor: 'pointer', fontSize: 15, color: '#47505e' }}>↻</button>
          <button type="button" onClick={handleLogout} style={{ border: '1px solid #d9dce2', background: '#ffffff', borderRadius: 9, padding: '8px 11px 9px', fontSize: 12.5, fontWeight: 600, color: '#47505e', cursor: 'pointer' }}>Sign out</button>
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 90px' }}>
        {tab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatCard label="Applications waiting" value={pending.length} sub="Tap to review" bg="#fef3e2" ink="#7c4a03" onClick={() => { setAppFilter('Pending'); setTab('applications') }} />
              <StatCard label="Orders needing you" value={needsAction.length} sub={short(needsAction.reduce((s, o) => s + (o.total || 0), 0)) + ' waiting'} bg="#e8f0ff" ink={DEEP} onClick={() => { setOrderFilter('Needs action'); setTab('orders') }} />
              <StatCard label="Completed orders" value={completedOrders.length} sub="All time" bg="#dcfce7" ink="#166534" onClick={() => { setOrderFilter('Completed'); setTab('orders') }} />
              <StatCard label="Revenue to date" value={short(revenue)} sub="Confirmed or later" bg="#f1f2f5" ink="#16181d" onClick={() => { setOrderFilter('All'); setTab('orders') }} />
            </div>

            {pending.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700 }}>Applications to review</span>
                  <button type="button" onClick={() => { setAppFilter('Pending'); setTab('applications') }} style={{ border: 'none', background: 'transparent', color: DEEP, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>See all →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {pending.slice(0, 3).map(a => <AppCard key={a.id} app={a} onClick={() => setOpenAppId(a.id)} />)}
                </div>
              </div>
            )}

            {needsAction.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700 }}>Orders needing you</span>
                  <button type="button" onClick={() => { setOrderFilter('Needs action'); setTab('orders') }} style={{ border: 'none', background: 'transparent', color: DEEP, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>See all →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {needsAction.slice(0, 3).map(o => <OrderCard key={o.id} order={o} client={clientFor(o)} onClick={() => setOpenOrderId(o.id)} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'applications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={appSearch} onChange={e => setAppSearch(e.target.value)} placeholder="Search by business, contact, email" style={{ width: '100%', border: '1px solid #d9dce2', borderRadius: 10, padding: '11px 13px', fontSize: 14.5, boxSizing: 'border-box', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              <Chip label="Pending" count={pending.length} active={appFilter === 'Pending'} onClick={() => setAppFilter('Pending')} />
              <Chip label="Approved" count={approved.length} active={appFilter === 'Approved'} onClick={() => setAppFilter('Approved')} />
              <Chip label="Rejected" count={rejected.length} active={appFilter === 'Rejected'} onClick={() => setAppFilter('Rejected')} />
              <Chip label="All" count={applications.length} active={appFilter === 'All'} onClick={() => setAppFilter('All')} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {appList.map(a => <AppCard key={a.id} app={a} onClick={() => setOpenAppId(a.id)} />)}
              {!appList.length && <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>Nothing here</div>}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={orderSearch} onChange={e => setOrderSearch(e.target.value)} placeholder="Search by order # or client" style={{ width: '100%', border: '1px solid #d9dce2', borderRadius: 10, padding: '11px 13px', fontSize: 14.5, boxSizing: 'border-box', fontFamily: 'inherit' }} />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              <Chip label="Needs action" count={needsAction.length} active={orderFilter === 'Needs action'} onClick={() => setOrderFilter('Needs action')} />
              <Chip label="Completed" count={completedOrders.length} active={orderFilter === 'Completed'} onClick={() => setOrderFilter('Completed')} />
              <Chip label="All" count={orders.length} active={orderFilter === 'All'} onClick={() => setOrderFilter('All')} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {orderList.map(o => <OrderCard key={o.id} order={o} client={clientFor(o)} onClick={() => setOpenOrderId(o.id)} />)}
              {!orderList.length && <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>Nothing here</div>}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#ffffff', borderTop: '1px solid #e4e7ec', display: 'flex', padding: '8px 8px calc(8px + env(safe-area-inset-bottom, 0px))' }}>
        {[
          { key: 'home', label: 'Home', icon: IconHome },
          { key: 'applications', label: 'Applications', icon: IconApps },
          { key: 'orders', label: 'Orders', icon: IconBox },
        ].map(t => {
          const on = tab === t.key
          const Icon = t.icon
          return (
            <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '7px 0 5px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <Icon on={on} />
              <span style={{ fontSize: 11, fontWeight: 700, color: on ? ACCENT : '#8b909a' }}>{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
