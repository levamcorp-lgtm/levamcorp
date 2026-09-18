'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'

const METHOD_LABELS = { ach: 'ACH Bank Transfer', wire: 'Wire Transfer', melio: 'Melio Pay', zelle: 'Zelle' }
const METHOD_ICONS = { ach: 'A', wire: 'W', melio: 'M', zelle: 'Z' }
const METHOD_BLURBS = {
  zelle: 'Fastest · small amounts',
  ach: '1–3 business days',
  wire: 'Same day · large amounts',
  melio: 'Paste a link from your Melio account',
}
// Our real account details — shown to admins only, behind login. Kept here per explicit request.
const BANK_DETAILS = {
  zelle: [
    { k: 'Send Zelle to', v: 'payments@levamcorp.com' },
    { k: 'Account name', v: 'Levam Corp Distributors' },
    { k: 'Reference', v: 'Your order number' },
  ],
  ach: [
    { k: 'Bank', v: 'Bank of America' },
    { k: 'Routing number', v: '063100277' },
    { k: 'Account number', v: '8981 4402 7719' },
    { k: 'Account name', v: 'Levam Corp Distributors' },
  ],
  wire: [
    { k: 'Bank', v: 'Bank of America' },
    { k: 'SWIFT / BIC', v: 'BOFAUS3N' },
    { k: 'Routing (wire)', v: '026009593' },
    { k: 'Account number', v: '8981 4402 7719' },
    { k: 'Account name', v: 'Levam Corp Distributors' },
    { k: 'Bank address', v: '100 SE 2nd St, Miami, FL 33131' },
  ],
}

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

export default function AdminPayments() {
  const pathname = usePathname()
  const [payments, setPayments] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('Owed')
  const [sort, setSort] = useState('Oldest first')
  const [selId, setSelId] = useState(null)
  const [method, setMethod] = useState('')
  const [note, setNote] = useState('')
  const [meliLink, setMeliLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [confirming, setConfirming] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      await loadAll(supabase)
    })
  }, [])

  const loadAll = async (supabase) => {
    const [{ data: pay }, { data: cl }] = await Promise.all([
      supabase.from('payments').select('*, orders(order_number, total, submitted_at, notes)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, business_name, contact_name, email, phone'),
    ])
    setPayments(pay || [])
    setClients(cl || [])
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const openDoc = async (path) => {
    if (!path) return
    const supabase = createClient()
    let r = await supabase.storage.from('Documents').createSignedUrl(path, 3600)
    if (!r.data?.signedUrl) r = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (r.data?.signedUrl) window.open(r.data.signedUrl, '_blank')
  }

  const confirmPayment = async (payment) => {
    if (!payment) return
    if (!confirm('Mark this payment as confirmed? This clears it from the "payment proofs to confirm" queue on the dashboard.')) return
    setConfirming(payment.id)
    const supabase = createClient()
    const { error } = await supabase.from('payments').update({ status: 'paid' }).eq('id', payment.id)
    if (error) { alert(`Couldn't confirm the payment: ${error.message}`); setConfirming(null); return }
    setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'paid' } : p))
    setConfirming(null)
  }

  const clientFor = (payment) => {
    const email = payment.client_email || payment.notes?.match(/Email: ([^\s|]+)/)?.[1]
    return clients.find(c => c.email === email) || null
  }

  const bankTextFor = (m) => (BANK_DETAILS[m] || []).map(b => `${b.k}: ${b.v}`).join('\n')

  const previewFor = (payment, m, first, extraNote) => {
    const bankText = m === 'melio'
      ? (meliLink ? `Pay now: ${meliLink}` : '[paste your Melio link above]')
      : bankTextFor(m)
    return `Hi ${first}, this is Levam Corp Distributors.\n\n` +
      `Payment for order #${payment.orders?.order_number} — ${money(payment.amount)}\n` +
      `Method: ${METHOD_LABELS[m]}\n\n` +
      bankText + '\n\n' +
      'Please use the order number as the payment reference and send us the receipt when it is done.' +
      (extraNote ? '\n\n' + extraNote : '')
  }

  const sendInstructions = async (payment) => {
    const c = clientFor(payment)
    const emailToUse = payment.client_email || c?.email
    if (!emailToUse) { alert('No client email on file for this payment.'); return }
    if (method === 'melio' && !meliLink) { alert('Paste the Melio payment link first.'); return }
    setSending(true)
    try {
      const res = await fetch('/api/send-payment-link-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientEmail: emailToUse,
          orderNumber: payment.orders?.order_number,
          total: payment.amount,
          paymentMethod: method,
          paymentLink: method === 'melio' ? meliLink : null,
          bankDetails: method === 'melio' ? null : bankTextFor(method),
          notes: note || null,
        })
      })
      const result = await res.json()
      if (result.success) {
        const supabase = createClient()
        await supabase.from('payments').update({ status: 'processing', payment_method: method }).eq('id', payment.id)
        setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'processing', payment_method: method } : p))
        setSent(true)
        setTimeout(() => setSent(false), 3000)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (e) { alert('Error: ' + e.message) }
    setSending(false)
  }

  const copyDetails = (m) => {
    const text = m === 'melio' ? meliLink : bankTextFor(m)
    if (navigator.clipboard && text) navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectPayment = (payment) => {
    setSelId(payment.id)
    setMethod(payment.payment_method || 'wire')
    setMeliLink('')
    setNote('')
    setCopied(false)
    setSent(false)
  }

  const money = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const short = (n) => '$' + Math.round(n).toLocaleString('en-US')
  const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0

  const exportCSV = (list) => {
    const header = ['Order', 'Business', 'Client email', 'Amount', 'Method', 'Status', 'Days waiting', 'Requested']
    const lines = list.map(p => {
      const c = clientFor(p)
      return [p.orders?.order_number || '', c?.business_name || '', p.client_email || '', p.amount || 0, METHOD_LABELS[p.payment_method] || '', p.status, daysSince(p.created_at), p.created_at ? new Date(p.created_at).toLocaleDateString('en-US') : '']
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `levam-payments-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading payments…</div>
      </div>
    </div>
  )

  const owed = payments.filter(p => p.status !== 'paid')
  const owedSum = owed.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
  const needsInstructions = owed.filter(p => p.status === 'requested')
  const waitingOnClient = owed.filter(p => p.status === 'processing')
  const overdue = owed.filter(p => daysSince(p.created_at) > 30)
  const overdueSum = overdue.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)
  const paidAll = payments.filter(p => p.status === 'paid')
  const paidSum = paidAll.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0)

  const badges = { Payments: { badge: String(owed.length), urgent: owed.length > 0 } }
  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'

  const kpiDefs = [
    { key: 'Owed', k: 'Money owed to you', v: short(owedSum), sub: `${owed.length} payment${owed.length !== 1 ? 's' : ''} not received`, icon: '$', strong: true },
    { key: 'NoMethod', k: 'Waiting on you', v: String(needsInstructions.length), sub: 'no instructions sent yet', icon: '!', warn: true },
    { key: 'Overdue', k: 'Overdue 30+ days', v: short(overdueSum), sub: `${overdue.length} payment${overdue.length !== 1 ? 's' : ''} gone cold`, icon: 'T', danger: true },
    { key: 'Paid', k: 'Collected', v: short(paidSum), sub: `${paidAll.length} payment${paidAll.length !== 1 ? 's' : ''} received`, icon: '✓', good: true },
  ]

  const chipDefs = [
    { key: 'Owed', label: 'Not paid', dot: '#dc2626', n: owed.length },
    { key: 'NoMethod', label: 'Needs instructions', dot: '#f0b429', n: needsInstructions.length },
    { key: 'Sent', label: 'Waiting on client', dot: ACCENT, n: waitingOnClient.length },
    { key: 'Overdue', label: 'Overdue 30+ days', dot: '#991b1b', n: overdue.length },
    { key: 'Paid', label: 'Paid', dot: '#16a34a', n: paidAll.length },
    { key: 'All', label: 'All requests', dot: '#c9ced6', n: payments.length },
  ]

  let list = payments.slice()
  if (view === 'Owed') list = list.filter(p => p.status !== 'paid')
  else if (view === 'NoMethod') list = list.filter(p => p.status === 'requested')
  else if (view === 'Sent') list = list.filter(p => p.status === 'processing')
  else if (view === 'Overdue') list = list.filter(p => p.status !== 'paid' && daysSince(p.created_at) > 30)
  else if (view === 'Paid') list = list.filter(p => p.status === 'paid')

  const q = search.trim().toLowerCase()
  if (q) list = list.filter(p => {
    const c = clientFor(p)
    return (p.orders?.order_number + ' ' + (c?.business_name || '') + ' ' + (p.client_email || '') + ' ' + p.amount).toLowerCase().includes(q)
  })

  if (sort === 'Biggest amount') list.sort((a, b) => (b.amount || 0) - (a.amount || 0))
  else if (sort === 'Newest first') list.sort((a, b) => daysSince(a.created_at) - daysSince(b.created_at))
  else list.sort((a, b) => daysSince(b.created_at) - daysSince(a.created_at))

  const sel = selId ? payments.find(p => p.id === selId) : null
  const selClient = sel ? clientFor(sel) : null

  const cols = 'minmax(210px, 1.7fr) 160px 116px minmax(150px, 1fr) 104px 148px 208px'

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .apy-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .apy-shell { grid-template-columns:1fr !important; } .apy-shell > div:first-child { position:static !important; max-height:none !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="apy-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={badges} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Payments</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{short(owedSum)} owed · {needsInstructions.length} need instructions · {overdue.length} overdue</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={() => exportCSV(list)} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>↓ Export</button>
              <button type="button" onClick={handleLogout} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(192px, 1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
              {kpiDefs.map(d => {
                const on = d.key === view
                return (
                  <button key={d.key} type="button" onClick={() => { setView(on ? 'All' : d.key); setSelId(null) }} style={{ textAlign: 'left', cursor: 'pointer', border: `1px solid ${on ? '#16181d' : d.danger ? '#f6d5d5' : d.warn ? '#f3d9a4' : d.good ? '#cfe8d7' : '#e2e4e9'}`, borderRadius: 12, background: on ? '#16181d' : d.danger ? '#fff6f6' : d.warn ? '#fffbf2' : d.good ? '#f3faf5' : '#ffffff', padding: '14px 15px 15px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 6, background: on ? 'rgba(255,255,255,.18)' : d.danger ? '#fee2e2' : d.warn ? '#fef3c7' : d.good ? '#dcfce7' : '#e8f0ff', color: on ? '#ffffff' : d.danger ? '#991b1b' : d.warn ? '#7c4a03' : d.good ? '#166534' : DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>{d.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', color: on ? '#ffffff' : '#16181d' }}>{d.k}</span>
                    </span>
                    <span className="lc-mono" style={{ display: 'block', paddingTop: 9, fontWeight: 700, fontSize: 'clamp(22px,2.2vw,28px)', letterSpacing: '-.04em', color: on ? '#ffffff' : d.danger ? '#991b1b' : d.warn ? '#b45309' : d.good ? '#166534' : '#16181d' }}>{d.v}</span>
                    <span style={{ display: 'block', paddingTop: 5, fontSize: 13, color: on ? '#c9ced6' : '#6b7280' }}>{d.sub}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9' }}>
                <span style={{ position: 'relative', flex: '1 1 250px', minWidth: 0 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', marginTop: -9, fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#8b909a' }}>⌕</span>
                  <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order number, client email or amount" style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px 33px', border: '1px solid #d9dce2', borderRadius: 9, fontSize: 14.5, color: '#16181d', background: '#ffffff' }} />
                </span>
                <span data-scroll style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflowX: 'auto', background: '#f7f8fa' }}>
                  {['Oldest first', 'Biggest amount', 'Newest first'].map(label => {
                    const on = sort === label
                    return <button key={label} type="button" onClick={() => setSort(label)} style={{ flex: '0 0 auto', border: 0, cursor: 'pointer', padding: '9px 12px 10px', background: on ? '#ffffff' : 'transparent', color: on ? '#16181d' : '#6b7280', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{label}</button>
                  })}
                </span>
              </div>

              <div data-scroll style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '12px 15px 13px', borderBottom: '1px solid #e2e4e9' }}>
                {chipDefs.map(c => {
                  const on = c.key === view
                  return (
                    <button key={c.key} type="button" onClick={() => { setView(c.key); setSelId(null) }} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 999, cursor: 'pointer', background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#47505e', padding: '7px 13px 8px', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot }} />{c.label}
                      <span className="lc-mono" style={{ fontSize: 11.5, fontWeight: 700, padding: '1px 6px 2px', borderRadius: 4, background: on ? 'rgba(255,255,255,.2)' : '#eef0f4', color: on ? '#ffffff' : '#6b7280' }}>{c.n}</span>
                    </button>
                  )
                })}
              </div>

              <div data-scroll style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 1080 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'center', padding: '10px 15px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                    <span>Client</span><span>Order</span>
                    <span style={{ textAlign: 'right' }}>Amount</span>
                    <span>How they pay</span><span>Waiting</span><span>Status</span>
                    <span style={{ textAlign: 'center' }}>Next step</span>
                  </div>

                  {list.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No payment requests match</div>
                  ) : list.map(p => {
                    const c = clientFor(p)
                    const on = selId === p.id
                    const isPaid = p.status === 'paid'
                    const days = daysSince(p.created_at)
                    const cold = !isPaid && days > 30
                    const needs = p.status === 'requested'
                    const biz = c?.business_name || p.client_email || 'Unknown client'
                    const email = p.client_email || c?.email || '—'
                    const st = isPaid ? { label: 'Paid', bg: '#dcfce7', ink: '#166534' } : p.status === 'processing' ? { label: p.payment_proof_url ? 'Proof to confirm' : 'Waiting on client', bg: '#e8f1ff', ink: DEEP } : { label: 'Needs instructions', bg: '#fef3c7', ink: '#7c4a03' }
                    return (
                      <div key={p.id} role="button" tabIndex={0} onClick={() => selectPayment(p)} onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectPayment(p) } }} style={{ display: 'grid', gridTemplateColumns: cols, gap: 12, alignItems: 'center', padding: '12px 15px 13px', borderBottom: '1px solid #f1f2f5', cursor: 'pointer', background: on ? '#f7f9fc' : isPaid ? '#fcfdfc' : '#ffffff', borderLeft: `4px solid ${isPaid ? 'transparent' : cold ? '#dc2626' : needs ? '#f0b429' : ACCENT}` }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 8, background: isPaid ? '#dcfce7' : cold ? '#fee2e2' : '#e8f0ff', color: isPaid ? '#166534' : cold ? '#991b1b' : DEEP, fontSize: 14, fontWeight: 700 }}>{biz.charAt(0).toUpperCase()}</span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{biz}</span>
                            <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#8b909a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
                          </span>
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span className="lc-mono" style={{ display: 'block', fontSize: 13, fontWeight: 700, letterSpacing: '-.02em' }}>#{p.orders?.order_number || '—'}</span>
                          <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#8b909a' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                        </span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 16, fontWeight: 700, letterSpacing: '-.03em' }}>{money(p.amount)}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 5, background: '#e8f0ff', color: DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{METHOD_ICONS[p.payment_method] || '—'}</span>
                          <span style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{METHOD_LABELS[p.payment_method] || '—'}</span>
                        </span>
                        <span className="lc-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13.5, fontWeight: 700, color: isPaid ? '#166534' : cold ? '#991b1b' : days > 7 ? '#8a5a00' : '#166534' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: isPaid ? '#16a34a' : cold ? '#dc2626' : days > 7 ? '#f0b429' : '#16a34a' }} />{isPaid ? 'Settled' : days === 0 ? 'Today' : `${days} days`}
                        </span>
                        <span><span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: st.bg, color: st.ink }}>{st.label}</span></span>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 700, padding: '7px 11px 8px', borderRadius: 7, background: on ? (isPaid ? '#eef0f4' : ACCENT) : '#eef0f4', color: on && !isPaid ? '#ffffff' : '#47505e', whiteSpace: 'nowrap' }}>{isPaid ? 'View' : needs ? 'Send instructions' : 'Resend'}</span>
                          {!isPaid && (
                            <button type="button" onClick={ev => { ev.stopPropagation(); confirmPayment(p) }} disabled={confirming === p.id} title="Mark this payment as received" style={{ cursor: 'pointer', border: '1px solid #86dfa5', borderRadius: 7, background: '#dcfce7', color: '#166534', padding: '7px 10px 8px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{confirming === p.id ? '…' : '✓ Paid'}</button>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 15px 14px', background: '#fafbfc', borderTop: '1px solid #eceef2', fontSize: 13.5, color: '#6b7280' }}>
                <span>Showing {list.length} of {payments.length} payment requests</span>
                <span>Rows with an amber edge still need instructions · red means overdue 30+ days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sel && (() => {
        const first = (selClient?.contact_name || selClient?.business_name || sel.client_email || 'there').split(' ')[0]
        const cold = daysSince(sel.created_at) > 30
        const days = daysSince(sel.created_at)
        const isMelio = method === 'melio'
        const preview = previewFor(sel, method, first, note)
        const strong = isMelio ? !!meliLink : true
        const phoneDigits = (selClient?.phone || '').replace(/\D/g, '')
        const waHref = phoneDigits ? `https://wa.me/${phoneDigits.length === 10 ? '1' + phoneDigits : phoneDigits}?text=${encodeURIComponent(preview)}` : null
        const mailHref = `mailto:${sel.client_email || selClient?.email || ''}?subject=${encodeURIComponent('Payment instructions — order #' + sel.orders?.order_number)}`

        let banner
        if (sel.status === 'paid') banner = { icon: '✓', title: 'This payment was already received', sub: 'Nothing to do — kept here for your records.', bg: '#f3faf5', border: '#cfe8d7', bar: '#16a34a', ink: '#166534' }
        else if (sel.status === 'processing' && sel.payment_proof_url) banner = { icon: '→', title: `${selClient?.business_name || 'The client'} uploaded a payment proof`, sub: 'Check it against your bank/Melio/Zelle account, then confirm below.', bg: '#f2f7ff', border: '#cfe0fb', bar: ACCENT, ink: DEEP }
        else if (sel.status === 'processing') banner = { icon: '→', title: `Instructions already sent by ${METHOD_LABELS[sel.payment_method] || 'a method'}`, sub: cold ? `Waiting ${days} days. Resend and follow up on WhatsApp.` : 'The client has the details. Resend if they ask for them again.', bg: cold ? '#fff6f6' : '#f2f7ff', border: cold ? '#f6d5d5' : '#cfe0fb', bar: cold ? '#dc2626' : ACCENT, ink: cold ? '#991b1b' : DEEP }
        else banner = { icon: '!', title: 'No payment instructions sent yet', sub: `Pick a method below and send ${first} the account details.`, bg: '#fffbf2', border: '#f3d9a4', bar: '#f0b429', ink: '#8a5a00' }

        return (
          <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(22,24,29,.42)', display: 'flex', justifyContent: 'flex-end' }} onClick={() => setSelId(null)}>
            <div data-scroll onClick={ev => ev.stopPropagation()} style={{ width: '100%', maxWidth: 640, height: '100%', overflowY: 'auto', background: '#ffffff', borderLeft: '1px solid #d9dce2' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#ffffff', borderBottom: '1px solid #e2e4e9', padding: '16px 20px 17px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>{sel.status === 'requested' ? 'Send payment instructions' : sel.status === 'processing' ? 'Confirm this payment' : 'Payment confirmed'}</span>
                    <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>#{sel.orders?.order_number} · {selClient?.business_name || sel.client_email} · {money(sel.amount)}</span>
                  </span>
                  <button type="button" onClick={() => setSelId(null)} aria-label="Close" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '8px 12px 9px', fontSize: 14, fontWeight: 600, color: '#47505e' }}>Close ✕</button>
                </div>
              </div>

              <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr)', gap: 12, alignItems: 'center', background: banner.bg, border: `1px solid ${banner.border}`, borderRadius: 11, padding: '14px 16px 15px' }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: banner.bar, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700 }}>{banner.icon}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em', color: banner.ink }}>{banner.title}</span>
                    <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#47505e' }}>{banner.sub}</span>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 1, background: '#eceef2', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  {[
                    { k: 'Amount due', v: money(sel.amount), size: 21, mono: true },
                    { k: 'Client', v: sel.client_email || selClient?.email || '—', size: 14, mono: false },
                    { k: 'Requested', v: sel.created_at ? new Date(sel.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—', size: 14, mono: false },
                    { k: 'Waiting', v: days === 0 ? 'Today' : `${days} days`, size: 16, mono: true, danger: cold },
                  ].map(f => (
                    <div key={f.k} style={{ background: '#ffffff', padding: '13px 14px 14px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#6b7280' }}>{f.k}</div>
                      <div className={f.mono ? 'lc-mono' : ''} style={{ paddingTop: 7, fontWeight: 700, fontSize: f.size, letterSpacing: '-.02em', color: f.danger ? '#991b1b' : '#16181d', wordBreak: 'break-word' }}>{f.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ border: '1px solid #cfe0fb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px 14px', borderBottom: '1px solid #cfe0fb', background: '#f2f7ff', borderLeft: `5px solid ${ACCENT}` }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: ACCENT, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>1</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: DEEP }}>How should they pay?</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>Pick one — the right account details fill in automatically</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', padding: '14px 15px 16px' }}>
                    {Object.keys(METHOD_LABELS).map(m => {
                      const on = m === method
                      return (
                        <button key={m} type="button" onClick={() => { setMethod(m); setCopied(false) }} style={{ flex: '1 1 145px', cursor: 'pointer', border: `1px solid ${on ? ACCENT : '#d9dce2'}`, borderRadius: 9, background: on ? '#f2f7ff' : '#ffffff', color: on ? DEEP : '#16181d', padding: '12px 13px 13px', textAlign: 'left' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 5, background: on ? ACCENT : '#eef0f4', color: on ? '#ffffff' : '#6b7280', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{METHOD_ICONS[m]}</span>
                            <span style={{ fontSize: 14.5, fontWeight: 700 }}>{METHOD_LABELS[m]}</span>
                          </span>
                          <span style={{ display: 'block', paddingTop: 6, fontSize: 12.5, color: '#6b7280' }}>{METHOD_BLURBS[m]}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {isMelio ? (
                  <div style={{ border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#8b909a', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>2</span>
                      <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Melio payment link</span>
                    </div>
                    <div style={{ padding: '14px 15px 16px' }}>
                      <input type="url" value={meliLink} onChange={e => setMeliLink(e.target.value)} placeholder="https://app.meliopayments.com/…" style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14.5, color: '#16181d', background: '#ffffff' }} />
                      <div style={{ paddingTop: 6, fontSize: 12, color: '#6b7280' }}>Generate this link in your Melio account first.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#8b909a', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>2</span>
                        <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Our account details</span>
                      </span>
                      <button type="button" onClick={() => copyDetails(method)} style={{ cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 7, background: copied ? '#dcfce7' : '#ffffff', color: copied ? '#166534' : '#47505e', padding: '7px 12px 8px', fontSize: 13, fontWeight: 700 }}>{copied ? 'Copied' : 'Copy details'}</button>
                    </div>
                    {(BANK_DETAILS[method] || []).map(b => (
                      <div key={b.k} style={{ display: 'grid', gridTemplateColumns: 'clamp(104px,32%,160px) minmax(0,1fr)', gap: 12, alignItems: 'baseline', padding: '11px 15px 12px', borderBottom: '1px solid #f1f2f5' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>{b.k}</span>
                        <span className="lc-mono" style={{ fontSize: 14.5, fontWeight: 700, color: '#16181d', wordBreak: 'break-word' }}>{b.v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ border: '1px solid #cfe8d7', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px 14px', borderBottom: '1px solid #cfe8d7', background: '#f3faf5', borderLeft: '5px solid #16a34a' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#16a34a', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>3</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#166534' }}>Send it to {first}</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>This is exactly what they will receive</span>
                    </span>
                  </div>
                  <div style={{ padding: '14px 15px 16px' }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#6b7280', paddingBottom: 7 }}>Extra note (optional)</label>
                    <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Please send the receipt when you transfer" style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14.5, color: '#16181d', background: '#ffffff' }} />

                    <div style={{ marginTop: 13, border: '1px solid #e2e4e9', borderRadius: 10, background: '#fafbfc', padding: '14px 15px 15px' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b7280', paddingBottom: 9 }}>Message preview</div>
                      <div style={{ fontSize: 14.5, lineHeight: 1.6, color: '#16181d', whiteSpace: 'pre-line' }}>{preview}</div>
                    </div>

                    {sent ? (
                      <div style={{ marginTop: 13, padding: 12, background: '#dcfce7', border: '1px solid #86dfa5', borderRadius: 8, textAlign: 'center', fontSize: 13.5, fontWeight: 700, color: '#166534' }}>✓ Payment instructions sent!</div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', paddingTop: 13 }}>
                          <a href={waHref || undefined} target="_blank" rel="noopener noreferrer" style={{ flex: '1 1 190px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, textAlign: 'center', padding: '13px 15px 14px', borderRadius: 9, background: waHref ? '#16a34a' : '#c9ced6', color: '#ffffff', fontSize: 14.5, fontWeight: 700, pointerEvents: waHref ? 'auto' : 'none' }}>Send on WhatsApp <span style={{ fontWeight: 400, opacity: .85 }}>↗</span></a>
                          <a href={mailHref} style={{ flex: '1 1 160px', textAlign: 'center', padding: '13px 15px 14px', border: '1px solid #d9dce2', borderRadius: 9, color: '#47505e', fontSize: 14.5, fontWeight: 700 }}>Open in email</a>
                        </div>
                        <button type="button" onClick={() => sendInstructions(sel)} disabled={sending || !strong} style={{ marginTop: 9, width: '100%', padding: 12, background: sending ? '#8b909a' : !strong ? '#c9ced6' : '#16181d', color: '#ffffff', fontSize: 13.5, fontWeight: 700, letterSpacing: '.04em', border: 0, borderRadius: 8, cursor: sending || !strong ? 'not-allowed' : 'pointer' }}>{sending ? 'Sending…' : '📧 Send by email now'}</button>
                        <div style={{ paddingTop: 10, fontSize: 12.5, color: !strong ? '#b45309' : '#6b7280' }}>{!strong ? 'Paste the Melio link above first.' : 'WhatsApp needs a phone on file for this client; the email button sends a real email right now.'}</div>
                      </>
                    )}
                  </div>
                </div>

                {sel.payment_proof_url && (
                  <button type="button" onClick={() => openDoc(sel.payment_proof_url)} style={{ padding: 11, background: '#f0fdf4', color: '#166534', fontSize: 13.5, fontWeight: 700, border: '1px solid #bbf7d0', borderRadius: 8, cursor: 'pointer' }}>View uploaded payment proof</button>
                )}
              </div>

              <div style={{ position: 'sticky', bottom: 0, background: '#ffffff', borderTop: '1px solid #e2e4e9', padding: '13px 20px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13.5, color: '#6b7280' }}>Marking as paid moves it out of the money-owed total.</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => setSelId(null)} style={{ border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '11px 14px 12px', fontSize: 14, fontWeight: 600, color: '#47505e' }}>Cancel</button>
                    {sel.status !== 'paid' && (
                      <button type="button" onClick={() => confirmPayment(sel)} disabled={confirming === sel.id} style={{ border: 0, borderRadius: 8, background: confirming === sel.id ? '#8b909a' : '#16a34a', cursor: confirming === sel.id ? 'not-allowed' : 'pointer', padding: '12px 18px 13px', fontSize: 14.5, fontWeight: 700, color: '#ffffff' }}>{confirming === sel.id ? 'Confirming…' : '✓ Mark as paid'}</button>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
