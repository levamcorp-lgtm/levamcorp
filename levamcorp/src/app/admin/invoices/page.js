'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'

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

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, color: '#16181d', background: '#ffffff', fontFamily: 'inherit' }
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, letterSpacing: '.02em', color: '#6b7280', marginBottom: 5 }

export default function AdminInvoices() {
  const pathname = usePathname()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(false)
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
        status: 'unpaid',
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

  const updateStatus = async (inv, status) => {
    setUpdating(true)
    const supabase = createClient()
    const { error } = await supabase.from('manual_invoices').update({ status }).eq('id', inv.id)
    if (error) { alert(`Couldn't update the invoice: ${error.message}`); setUpdating(false); return }
    setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status } : i))
    setSelected(s => s && s.id === inv.id ? { ...s, status } : s)
    setUpdating(false)
  }

  const printInvoice = () => {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${selected?.invoice_number}</title><style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #08090b; background: #fff; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    </style></head><body>${content}</body></html>`)
    win.document.close()
    setTimeout(() => { win.print() }, 500)
  }

  const exportCSV = (list) => {
    const header = ['Invoice #', 'Client', 'Company', 'Email', 'Total', 'Status', 'Date', 'Due date']
    const lines = list.map(i => [i.invoice_number, i.client_name, i.client_company || '', i.client_email || '', i.total || 0, i.status, i.date || '', i.due_date || '']
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `levam-invoices-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'
  const fmtMoney = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading invoices…</div>
      </div>
    </div>
  )

  const unpaid = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
  const unpaidSum = unpaid.reduce((s, i) => s + (parseFloat(i.total) || 0), 0)
  const paidAll = invoices.filter(i => i.status === 'paid')
  const paidSum = paidAll.reduce((s, i) => s + (parseFloat(i.total) || 0), 0)
  const cancelledAll = invoices.filter(i => i.status === 'cancelled')

  const badges = { Invoices: { badge: String(unpaid.length), urgent: unpaid.length > 0 } }
  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'

  const chipDefs = [
    { key: 'All', label: 'All invoices', dot: '#c9ced6', n: invoices.length },
    { key: 'Unpaid', label: 'Unpaid', dot: '#f0b429', n: unpaid.length },
    { key: 'Paid', label: 'Paid', dot: '#16a34a', n: paidAll.length },
    { key: 'Cancelled', label: 'Cancelled', dot: '#dc2626', n: cancelledAll.length },
  ]

  let list = invoices.slice()
  if (view === 'Unpaid') list = list.filter(i => i.status !== 'paid' && i.status !== 'cancelled')
  else if (view === 'Paid') list = list.filter(i => i.status === 'paid')
  else if (view === 'Cancelled') list = list.filter(i => i.status === 'cancelled')

  const q = search.trim().toLowerCase()
  if (q) list = list.filter(i => (i.invoice_number + ' ' + (i.client_company || '') + ' ' + i.client_name + ' ' + (i.client_email || '')).toLowerCase().includes(q))

  const sel = selected

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ainv-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .ainv-shell { grid-template-columns:1fr !important; } .ainv-shell > div:first-child { position:static !important; max-height:none !important; } }
        .ainv-split { display:grid; grid-template-columns:${sel ? '320px minmax(0,1fr)' : '1fr'}; gap:16px; align-items:start; }
        @media(max-width:760px){ .ainv-split { grid-template-columns:1fr !important; } }
        .ainv-doc-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:560px){ .ainv-doc-grid2 { grid-template-columns:1fr !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="ainv-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={badges} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Invoices</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{fmtMoney(unpaidSum)} outstanding · {unpaid.length} unpaid</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => exportCSV(list)} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>↓ Export</button>
              <button type="button" onClick={() => setShowCreate(true)} style={{ padding: '10px 16px', border: 0, borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#ffffff', background: ACCENT, cursor: 'pointer' }}>+ New invoice</button>
              <button type="button" onClick={handleLogout} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(192px, 1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
              {[
                { k: 'Outstanding', v: fmtMoney(unpaidSum), sub: `${unpaid.length} invoice${unpaid.length !== 1 ? 's' : ''} unpaid`, icon: '$', warn: true },
                { k: 'Collected', v: fmtMoney(paidSum), sub: `${paidAll.length} invoice${paidAll.length !== 1 ? 's' : ''} paid`, icon: '✓', good: true },
                { k: 'Cancelled', v: String(cancelledAll.length), sub: 'voided, no charge', icon: '×', danger: true },
                { k: 'All invoices', v: String(invoices.length), sub: 'total on record', icon: '#' },
              ].map(d => (
                <div key={d.k} style={{ border: `1px solid ${d.danger ? '#f6d5d5' : d.warn ? '#f3d9a4' : d.good ? '#cfe8d7' : '#e2e4e9'}`, borderRadius: 12, background: d.danger ? '#fff6f6' : d.warn ? '#fffbf2' : d.good ? '#f3faf5' : '#ffffff', padding: '14px 15px 15px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 6, background: d.danger ? '#fee2e2' : d.warn ? '#fef3c7' : d.good ? '#dcfce7' : '#e8f0ff', color: d.danger ? '#991b1b' : d.warn ? '#7c4a03' : d.good ? '#166534' : DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>{d.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em' }}>{d.k}</span>
                  </span>
                  <span className="lc-mono" style={{ display: 'block', paddingTop: 9, fontWeight: 700, fontSize: 'clamp(22px,2.2vw,28px)', letterSpacing: '-.04em', color: d.danger ? '#991b1b' : d.warn ? '#b45309' : d.good ? '#166534' : '#16181d' }}>{d.v}</span>
                  <span style={{ display: 'block', paddingTop: 5, fontSize: 13, color: '#6b7280' }}>{d.sub}</span>
                </div>
              ))}
            </div>

            <div className="ainv-split">

              {/* LIST */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9' }}>
                  <span style={{ position: 'relative', display: 'block' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', marginTop: -9, fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#8b909a' }}>⌕</span>
                    <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice # or client" style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px 33px', border: '1px solid #d9dce2', borderRadius: 9, fontSize: 14, color: '#16181d', background: '#ffffff' }} />
                  </span>
                </div>
                <div data-scroll style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '12px 15px 13px', borderBottom: '1px solid #e2e4e9' }}>
                  {chipDefs.map(c => {
                    const on = c.key === view
                    return (
                      <button key={c.key} type="button" onClick={() => setView(c.key)} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 999, cursor: 'pointer', background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#47505e', padding: '7px 13px 8px', fontSize: 13, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot }} />{c.label}
                        <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px 2px', borderRadius: 4, background: on ? 'rgba(255,255,255,.2)' : '#eef0f4', color: on ? '#ffffff' : '#6b7280' }}>{c.n}</span>
                      </button>
                    )
                  })}
                </div>

                <div data-scroll style={{ maxHeight: 620, overflowY: 'auto' }}>
                  {list.length === 0 ? (
                    <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No invoices match</div>
                  ) : list.map(inv => {
                    const on = sel?.id === inv.id
                    const isPaid = inv.status === 'paid'
                    const isCancelled = inv.status === 'cancelled'
                    const barColor = isPaid ? '#16a34a' : isCancelled ? '#dc2626' : ACCENT
                    return (
                      <div key={inv.id} role="button" tabIndex={0} onClick={() => setSelected(inv)} onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setSelected(inv) } }}
                        style={{ padding: '12px 15px 13px', borderBottom: '1px solid #f1f2f5', cursor: 'pointer', background: on ? '#f7f9fc' : '#ffffff', borderLeft: `4px solid ${barColor}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                          <span className="lc-mono" style={{ fontSize: 13.5, fontWeight: 700, color: DEEP }}>{inv.invoice_number}</span>
                          <span className="lc-mono" style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-.02em' }}>{fmtMoney(inv.total)}</span>
                        </div>
                        <div style={{ display: 'block', paddingTop: 4, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.client_company || inv.client_name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 5 }}>
                          <span style={{ fontSize: 12, color: '#8b909a' }}>{fmtDate(inv.date)}</span>
                          <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: isPaid ? '#dcfce7' : isCancelled ? '#fee2e2' : '#fef3c7', color: isPaid ? '#166534' : isCancelled ? '#991b1b' : '#7c4a03' }}>{isPaid ? 'Paid' : isCancelled ? 'Cancelled' : 'Unpaid'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* DOCUMENT */}
              {sel && (() => {
                const paid = sel.status === 'paid'
                const cancelled = sel.status === 'cancelled'
                const stamp = paid ? 'Paid in full' : cancelled ? 'Cancelled · void' : 'Payment due'
                const stampBg = paid ? '#dcfce7' : cancelled ? '#fee2e2' : '#fef3c7'
                const stampInk = paid ? '#166534' : cancelled ? '#991b1b' : '#92400e'
                const hasRemit = sel.bank_name || sel.account_number || sel.routing_number
                const showRemit = hasRemit && !paid && !cancelled
                const notice = paid
                  ? { bar: '#16a34a', title: 'Payment received — invoice settled', body: 'Payment has been received and verified for this invoice. Kept here for your records.' }
                  : cancelled
                    ? { bar: '#dc2626', title: 'Invoice cancelled', body: 'This invoice was cancelled and carries no charge. It is kept for your records only and is not a valid demand for payment.' }
                    : { bar: '#f59e0b', title: 'Preliminary invoice — payment pending', body: 'This is a preliminary invoice. The order is confirmed once we receive and verify full payment. Transfer details are below.' }
                const dueLabel = paid ? 'Paid in full' : cancelled ? 'Charged' : 'Total due'
                const dueBg = paid ? '#16a34a' : cancelled ? '#f6f5f2' : '#16181d'
                const dueInk = cancelled ? '#16181d' : '#ffffff'
                const dueValue = cancelled ? '$0.00' : fmtMoney(sel.total)

                return (
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 12 }}>
                      <button type="button" onClick={printInvoice} style={{ padding: '10px 18px', background: ACCENT, color: '#ffffff', fontSize: 13.5, fontWeight: 700, border: 0, cursor: 'pointer', borderRadius: 8 }}>Print / Download PDF</button>
                      {sel.status !== 'paid' && (
                        <button type="button" disabled={updating} onClick={() => updateStatus(sel, 'paid')} style={{ padding: '10px 16px', background: '#dcfce7', color: '#166534', fontSize: 13.5, fontWeight: 700, border: '1px solid #86dfa5', cursor: updating ? 'not-allowed' : 'pointer', borderRadius: 8 }}>✓ Mark as paid</button>
                      )}
                      {sel.status !== 'cancelled' && sel.status !== 'paid' && (
                        <button type="button" disabled={updating} onClick={() => updateStatus(sel, 'cancelled')} style={{ padding: '10px 16px', background: '#fee2e2', color: '#991b1b', fontSize: 13.5, fontWeight: 700, border: '1px solid #f6b8b8', cursor: updating ? 'not-allowed' : 'pointer', borderRadius: 8 }}>Cancel invoice</button>
                      )}
                      {sel.status !== 'unpaid' && (
                        <button type="button" disabled={updating} onClick={() => updateStatus(sel, 'unpaid')} style={{ padding: '10px 16px', background: '#ffffff', color: '#47505e', fontSize: 13.5, fontWeight: 700, border: '1px solid #d9dce2', cursor: updating ? 'not-allowed' : 'pointer', borderRadius: 8 }}>Reopen as unpaid</button>
                      )}
                      <button type="button" onClick={() => setSelected(null)} style={{ padding: '10px 16px', background: 'transparent', color: '#6b7280', fontSize: 13.5, border: '1px solid #d9dce2', cursor: 'pointer', borderRadius: 8, marginLeft: 'auto' }}>Close</button>
                    </div>

                    <div ref={printRef} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, color: '#08090b', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize: 13, lineHeight: 1.4, padding: 'clamp(20px,3vw,40px)' }}>

                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', paddingBottom: 12, borderBottom: '1px solid rgba(8,9,11,0.45)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                          <img src="https://www.levamcorp.com/levamcorp-logo_1.png" alt="Levam Corp Distributors" style={{ display: 'block', width: 78, height: 'auto', objectFit: 'contain' }} />
                          <div className="lc-mono" style={{ paddingTop: 3, fontSize: 9, letterSpacing: '0.1em', lineHeight: 1.85, color: '#4a4741' }}>
                            6315 NW 99th Ave, Doral, FL 33178<br />
                            partners@levamcorp.com · (786) 878-4122<br />
                            levamcorp.com
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flex: 'none' }}>
                          <div style={{ fontSize: 26, fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1 }}>Invoice</div>
                          <div className="lc-mono" style={{ paddingTop: 7, fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', color: ACCENT }}>{sel.invoice_number}</div>
                          <div className="lc-mono" style={{ display: 'inline-block', marginTop: 8, background: stampBg, color: stampInk, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 9px 5px' }}>{stamp}</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 21, marginTop: 12, paddingBottom: 12, borderBottom: '1px solid rgba(8,9,11,0.14)' }}>
                        {[
                          ['Invoice date', fmtDate(sel.date), '#08090b'],
                          ['Payment due', sel.due_date ? fmtDate(sel.due_date) : 'On receipt', paid ? '#166534' : cancelled ? '#08090b' : '#b45309'],
                          ['Status', paid ? 'Paid' : cancelled ? 'Cancelled' : 'Unpaid', paid ? '#166534' : cancelled ? '#991b1b' : '#08090b'],
                        ].map(([k, v, ink]) => (
                          <div key={k}>
                            <div className="lc-mono" style={{ fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6f6d67' }}>{k}</div>
                            <div className="lc-mono" style={{ paddingTop: 4, fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', color: ink }}>{v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: 15 }}>
                        <div className="lc-mono" style={{ fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6f6d67', paddingBottom: 7 }}>Bill to</div>
                        <div style={{ fontSize: 15, fontWeight: 500, letterSpacing: '-0.01em' }}>{sel.client_name}</div>
                        <div style={{ paddingTop: 4, fontSize: 12, lineHeight: 1.55, color: '#4a4741' }}>
                          {sel.client_company && <>{sel.client_company}<br /></>}
                          {sel.client_email && <>{sel.client_email}<br /></>}
                          {sel.client_phone && <>{sel.client_phone}<br /></>}
                          {sel.client_address}
                        </div>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', minWidth: 460, borderCollapse: 'collapse', marginTop: 19 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(8,9,11,0.45)' }}>
                              {['#', 'Description', 'Qty', 'Unit', 'Amount'].map((h, i) => (
                                <th key={h} className="lc-mono" style={{ textAlign: i >= 2 ? 'right' : 'left', padding: i === 0 ? '7px 8px 8px 0' : '7px 8px 8px', fontSize: 8.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6f6d67' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(sel.items || []).map((item, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(8,9,11,0.1)' }}>
                                <td className="lc-mono" style={{ padding: '9px 8px 10px 0', verticalAlign: 'top', fontSize: 11, color: '#9a968e' }}>{String(i + 1).padStart(2, '0')}</td>
                                <td style={{ padding: '9px 8px 10px', verticalAlign: 'top', fontSize: 13 }}>{item.description}</td>
                                <td className="lc-mono" style={{ padding: '9px 8px 10px', verticalAlign: 'top', textAlign: 'right', fontSize: 12 }}>{item.qty}</td>
                                <td className="lc-mono" style={{ padding: '9px 8px 10px', verticalAlign: 'top', textAlign: 'right', fontSize: 12 }}>{fmtMoney(item.unit_price)}</td>
                                <td className="lc-mono" style={{ padding: '9px 8px 10px', verticalAlign: 'top', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{fmtMoney(parseFloat(item.qty) * parseFloat(item.unit_price))}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="ainv-doc-grid2" style={{ marginTop: 13, justifyContent: showRemit ? 'stretch' : 'end' }}>
                        {showRemit && (
                          <div>
                            <div className="lc-mono" style={{ paddingBottom: 8, borderBottom: '1px solid rgba(8,9,11,0.14)', fontSize: 8.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6f6d67' }}>Remit payment to</div>
                            <div style={{ paddingTop: 9 }}>
                              {[
                                ['Bank', sel.bank_name],
                                ['Account name', sel.account_name],
                                ['Account #', sel.account_number],
                                ['Routing', sel.routing_number],
                                ['SWIFT / BIC', sel.swift],
                                ['Bank address', sel.bank_address],
                              ].filter(([, v]) => v).map(([k, v]) => (
                                <div key={k} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10, padding: '3px 0' }}>
                                  <span className="lc-mono" style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6f6d67' }}>{k}</span>
                                  <span className="lc-mono" style={{ fontSize: 11, letterSpacing: '0.04em', color: '#08090b', wordBreak: 'break-word' }}>{v}</span>
                                </div>
                              ))}
                              <div className="lc-mono" style={{ marginTop: 8, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT }}>Reference {sel.invoice_number} on your transfer</div>
                            </div>
                          </div>
                        )}
                        <div style={!showRemit ? { maxWidth: 285, marginLeft: 'auto', width: '100%' } : undefined}>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '4px 0 5px', borderBottom: '1px solid rgba(8,9,11,0.12)' }}>
                            <span className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6f6d67' }}>Subtotal</span>
                            <span className="lc-mono" style={{ fontSize: 12, letterSpacing: '0.02em', color: '#08090b' }}>{fmtMoney(sel.total)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 7, background: dueBg, padding: '8px 13px 9px' }}>
                            <span className="lc-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: paid ? 'rgba(255,255,255,.85)' : cancelled ? '#6f6d67' : '#8f8c85' }}>{dueLabel}</span>
                            <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.03em', color: dueInk }}>{dueValue}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 19, borderLeft: `2px solid ${notice.bar}`, padding: '1px 0 2px 12px' }}>
                        <div className="lc-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6f6d67' }}>{notice.title}</div>
                        <div style={{ paddingTop: 4, fontSize: 11.5, lineHeight: 1.5, color: '#3f3d39' }}>{notice.body}</div>
                      </div>

                      {sel.notes && (
                        <div style={{ marginTop: 15, borderLeft: `2px solid ${ACCENT}`, padding: '1px 0 2px 12px' }}>
                          <div className="lc-mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6f6d67' }}>Notes</div>
                          <div style={{ paddingTop: 4, fontSize: 11.5, lineHeight: 1.5, color: '#3f3d39' }}>{sel.notes}</div>
                        </div>
                      )}

                      <div style={{ marginTop: 21, paddingTop: 9, borderTop: '1px solid rgba(8,9,11,0.14)' }}>
                        <div className="lc-mono" style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6f6d67', paddingBottom: 7 }}>Terms &amp; conditions</div>
                        <div style={{ fontSize: 9.5, lineHeight: 1.55, color: '#6f6d67' }}>All sales are final — no returns, exchanges, refunds or cancellations once payment is confirmed. Damaged or defective goods must be reported to partners@levamcorp.com within 48 hours of delivery with photographic evidence. Late payments accrue 1.5% monthly interest. Governed by Florida law; venue Miami-Dade County. Unauthorized chargebacks will be disputed and may result in termination of the business relationship.</div>
                      </div>

                      <div className="ainv-doc-grid2" style={{ marginTop: 15 }}>
                        <div>
                          <div style={{ height: 25, borderBottom: '1px solid #08090b' }} />
                          <div className="lc-mono" style={{ paddingTop: 5, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6f6d67' }}>Authorized · Levam Corp Distributors</div>
                        </div>
                        <div>
                          <div style={{ height: 25, borderBottom: '1px solid #08090b' }} />
                          <div className="lc-mono" style={{ paddingTop: 5, fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6f6d67' }}>Accepted · {sel.client_name}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 21, flexWrap: 'wrap', marginTop: 21, paddingTop: 8, borderTop: '1px solid rgba(8,9,11,0.14)' }}>
                        <span className="lc-mono" style={{ fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6f6d67' }}>Levam Corp Distributors · {sel.invoice_number} · {fmtDate(sel.date)}</span>
                        <span className="lc-mono" style={{ fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6f6d67' }}>levamcorp.com</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(22,24,29,.55)', zIndex: 200, overflowY: 'auto', padding: '2rem 1rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e4e9', borderRadius: 12, maxWidth: 720, margin: '0 auto' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e4e9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>New invoice</div>
              <button onClick={() => setShowCreate(false)} style={{ background: '#eef0f4', border: 'none', color: '#47505e', cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div>
                <div style={{ fontSize: 11.5, color: DEEP, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Invoice info</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 10 }}>
                  {[['Invoice number *', 'invoice_number', 'text'], ['Date', 'date', 'date'], ['Due date', 'due_date', 'date']].map(([label, field, type]) => (
                    <div key={field}>
                      <label style={labelStyle}>{label}</label>
                      <input type={type} value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: DEEP, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Client info</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 10 }}>
                  {[['Contact name *', 'client_name'], ['Business name', 'client_company'], ['Email', 'client_email'], ['Phone', 'client_phone']].map(([label, field]) => (
                    <div key={field}>
                      <label style={labelStyle}>{label}</label>
                      <input value={form[field]} onChange={e => setForm(f => ({...f, [field]: e.target.value}))} style={inputStyle} />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Address</label>
                    <input value={form.client_address} onChange={e => setForm(f => ({...f, client_address: e.target.value}))} style={inputStyle} />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: DEEP, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Items</div>
                {form.items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 100px 34px', gap: 8, marginBottom: 8 }}>
                    <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} style={inputStyle} />
                    <input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} style={inputStyle} />
                    <input type="number" placeholder="Unit price" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', e.target.value)} style={inputStyle} />
                    <button onClick={() => removeItem(i)} style={{ background: '#fee2e2', border: '1px solid #f6b8b8', color: '#991b1b', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>×</button>
                  </div>
                ))}
                <button onClick={addItem} style={{ fontSize: 13, color: DEEP, background: '#e8f0ff', border: '1px solid #cfe0fb', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }}>+ Add item</button>
                <div className="lc-mono" style={{ textAlign: 'right', marginTop: 12, fontSize: 17, fontWeight: 700 }}>Total: {fmtMoney(total)}</div>
              </div>

              <div>
                <div style={{ fontSize: 11.5, color: DEEP, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Payment instructions (shown on invoice)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 10 }}>
                  {[['Bank name', 'bank_name'], ['Account name', 'account_name'], ['Account number', 'account_number'], ['Routing number', 'routing_number'], ['SWIFT / BIC', 'swift'], ['Bank address', 'bank_address']].map(([label, field]) => (
                    <div key={field}>
                      <label style={labelStyle}>{label}</label>
                      <input value={form[field] || ''} onChange={e => setForm(f => ({...f, [field]: e.target.value}))} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} placeholder="e.g. All sales are final. Payment due within 15 days." style={{ ...inputStyle, resize: 'none' }} />
              </div>

              <button onClick={saveInvoice} disabled={saving} style={{ padding: '13px', background: saving ? '#8b909a' : ACCENT, color: '#ffffff', fontSize: 14, fontWeight: 700, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 8, letterSpacing: '0.02em' }}>
                {saving ? 'Saving...' : 'Create invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
