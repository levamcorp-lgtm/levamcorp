'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'

const PARTNERS = ['Victor', 'Leopoldo']
const EXPENSE_CATS = ['Rent/Storage','Shipping & Logistics','Marketing','Software & Tools','Utilities','Office','Travel','Legal & Accounting','Other']
const CAT_COLORS = ['#dc2626','#f0b429','#7c3aed','#2F7DF6','#16a34a','#f97316','#0ea5e9','#db2777','#8b909a']
const ACCOUNTS = [
  { key: 'company',      label: 'Company',      color: '#2F7DF6', icon: 'CO' },
  { key: 'victor',       label: 'Victor',       color: '#16a34a', icon: 'V' },
  { key: 'leopoldo',     label: 'Leopoldo',     color: '#7c3aed', icon: 'L' },
  { key: 'world_family', label: 'World Family', color: '#f0b429', icon: 'WF' },
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

const money = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const signed = (n) => (n >= 0 ? '+' : '-') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const fmtM = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'
const monthShort = (key) => { const [y, m] = key.split('-'); return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' }) }
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '9px 10px', border: '1px solid #d9dce2', borderRadius: 6, fontSize: 12.5, color: '#16181d', background: '#f7f8fa', fontFamily: 'inherit' }
const labelStyle = { fontSize: 10.5, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 5, fontWeight: 700 }

export default function AdminProfit() {
  const pathname = usePathname()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [expenses, setExpenses] = useState([])
  const [inventory, setInventory] = useState([])
  const [partnerTx, setPartnerTx] = useState([])
  const [acctPay, setAcctPay] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const getDefaultMonth = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7) }
  const [month, setMonth] = useState(getDefaultMonth())
  const [tab, setTab] = useState('Overview')
  const [allTime, setAllTime] = useState(false)
  const [saving, setSaving] = useState(false)

  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddInv, setShowAddInv] = useState(false)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [showAddAcctPay, setShowAddAcctPay] = useState(false)
  const today = () => new Date().toISOString().split('T')[0]
  const [expForm, setExpForm] = useState({ date: today(), category: 'Rent/Storage', description: '', amount: '', paid_by: 'company', notes: '' })
  const [invForm, setInvForm] = useState({ date: today(), product_name: '', supplier: '', units: '', unit_cost: '', paid_by: 'company', notes: '' })
  const [ptxForm, setPtxForm] = useState({ date: today(), partner: 'Victor', type: 'investment', amount: '', description: '', notes: '' })
  const [apForm, setApForm] = useState({ date: today(), partner: 'Victor', type: 'supplier_payment', amount: '', description: '', selectedOrders: [], notes: '' })

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      await loadAll(sb)
    })
  }, [])

  const loadAll = async (sb) => {
    sb = sb || createClient()
    const [{ data: o }, { data: p }, { data: e }, { data: iv }, { data: pt }, { data: ap }, { data: cl }] = await Promise.all([
      sb.from('orders').select('*,order_items(*)').order('submitted_at', { ascending: false }),
      sb.from('products').select('*'),
      sb.from('expenses').select('*').order('date', { ascending: false }),
      sb.from('inventory_purchases').select('*').order('date', { ascending: false }),
      sb.from('partner_transactions').select('*').order('date', { ascending: false }),
      sb.from('account_payments').select('*').order('date', { ascending: false }),
      sb.from('clients').select('*'),
    ])
    setOrders(o || []); setProducts(p || []); setExpenses(e || [])
    setInventory(iv || []); setPartnerTx(pt || []); setAcctPay(ap || []); setClients(cl || [])
    setLoading(false)
  }

  const logout = async () => { await createClient().auth.signOut(); window.location.href = '/admin' }

  const inMonth = (d) => allTime ? true : (d && d.startsWith(month))
  const inMonthTS = (ts) => allTime ? true : (ts && new Date(ts).toISOString().slice(0, 7) === month)
  const clientNameFor = (order) => (order.notes || '').split('Business: ')[1]?.split('|')[0]?.split('\n')[0]?.trim() || 'Client'
  const orderCogs = (order) => (order.order_items || []).reduce((s, item) => {
    const prod = products.find(p => p.id === item.product_id || p.name === item.product_name)
    return s + ((prod?.cost_price || 0) * item.quantity)
  }, 0)

  const confirmedOrders = orders.filter(o => ['confirmed', 'dispatched', 'completed'].includes(o.status))

  // ── SCOPE (month or all-time) ───────────────────────────
  const monthOrders = confirmedOrders.filter(o => inMonthTS(o.submitted_at))
  const revenue = monthOrders.reduce((s, o) => s + (o.total || 0), 0)
  const collected = monthOrders.reduce((s, o) => s + (parseFloat(o.amount_paid) || 0), 0)
  const outstanding = monthOrders.reduce((s, o) => s + Math.max(0, (o.total || 0) - (parseFloat(o.amount_paid) || 0)), 0)
  const cogs = monthOrders.reduce((s, o) => s + orderCogs(o), 0)
  const monthExpenses = expenses.filter(e => inMonth(e.date))
  const totalExpenses = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0)
  const grossProfit = revenue - cogs
  const netProfit = grossProfit - totalExpenses
  const profitPerPart = netProfit / 2
  const margin = revenue ? (grossProfit / revenue) * 100 : 0

  // ── DISTINCT REAL MONTHS (for the month picker + trend + partner split) ──
  const monthKeys = Array.from(new Set([
    ...confirmedOrders.map(o => o.submitted_at && new Date(o.submitted_at).toISOString().slice(0, 7)).filter(Boolean),
    ...expenses.map(e => e.date && e.date.slice(0, 7)).filter(Boolean),
  ])).sort().reverse().slice(0, 12)
  if (monthKeys.length === 0) monthKeys.push(month)
  else if (!monthKeys.includes(month)) monthKeys.unshift(month)

  const totalsForMonth = (key) => {
    const mo = confirmedOrders.filter(o => o.submitted_at && new Date(o.submitted_at).toISOString().slice(0, 7) === key)
    const mExp = expenses.filter(e => e.date && e.date.startsWith(key))
    const rev = mo.reduce((s, o) => s + (o.total || 0), 0)
    const cost = mo.reduce((s, o) => s + orderCogs(o), 0)
    const exp = mExp.reduce((s, e) => s + (e.amount || 0), 0)
    return { revenue: rev, cost, gross: rev - cost, expenses: exp, net: rev - cost - exp }
  }

  // ── ACCOUNT BALANCES (unchanged real logic) ──────────────
  const getAccountData = (accKey) => {
    const partnerLabel = ACCOUNTS.find(a => a.key === accKey)?.label || accKey
    const inOrders = confirmedOrders.filter(o => (o.payment_account || 'company') === accKey)
    const totalIn = inOrders.reduce((s, o) => s + (parseFloat(o.amount_paid) || 0), 0)
    const unpaidOrders = inOrders.filter(o => (parseFloat(o.amount_paid) || 0) < (o.total || 0))
    const payments = acctPay.filter(p => p.partner === partnerLabel)
    const supplierPaid = payments.filter(p => p.type === 'supplier_payment').reduce((s, p) => s + (p.amount || 0), 0)
    const profitXfer = payments.filter(p => p.type === 'profit_transfer').reduce((s, p) => s + (p.amount || 0), 0)
    const otherOut = payments.filter(p => p.type === 'other').reduce((s, p) => s + (p.amount || 0), 0)
    const totalOut = supplierPaid + profitXfer + otherOut
    const balance = totalIn - totalOut
    const coveredOrderIds = payments.filter(p => p.type === 'supplier_payment').flatMap(p => p.order_ids || [])
    const pendingOrdersCost = inOrders.filter(o => !coveredOrderIds.includes(o.id)).reduce((s, o) => s + orderCogs(o), 0)
    const committedToOrders = Math.min(pendingOrdersCost, balance)
    const freeProfitBalance = Math.max(0, balance - committedToOrders)
    return { totalIn, totalOut, supplierPaid, profitXfer, otherOut, balance, committedToOrders, freeProfitBalance, inOrders, unpaidOrders, payments, coveredOrderIds, pendingOrdersCost }
  }

  // ── REAL "money movements" ledger — merges real money in (order payments) with real money out (account_payments) ──
  const movementsFor = (accKey) => {
    const partnerLabel = ACCOUNTS.find(a => a.key === accKey)?.label || accKey
    const ins = confirmedOrders.filter(o => (o.payment_account || 'company') === accKey && (parseFloat(o.amount_paid) || 0) > 0).map(o => ({
      date: o.submitted_at ? o.submitted_at.slice(0, 10) : '', what: `Payment received — ${clientNameFor(o)}`, note: `Order #${o.order_number}`, amount: parseFloat(o.amount_paid) || 0,
    }))
    const outs = acctPay.filter(p => p.partner === partnerLabel).map(p => ({
      date: p.date || '', what: p.description || (p.type === 'supplier_payment' ? 'Supplier payment' : p.type === 'profit_transfer' ? 'Profit transfer' : 'Other payment'),
      note: p.order_ids?.length ? `covers ${p.order_ids.length} order${p.order_ids.length === 1 ? '' : 's'}` : (p.type === 'profit_transfer' ? 'Profit transferred to company' : ''), amount: -(p.amount || 0),
    }))
    const chrono = [...ins, ...outs].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    let running = 0
    const withBalance = chrono.map(m => { running += m.amount; return { ...m, after: running } })
    return withBalance.reverse()
  }

  // ── EXPENSE CATEGORY BREAKDOWN (real) ─────────────────────
  const byCategory = (list) => {
    const totals = {}
    list.forEach(e => { totals[e.category] = (totals[e.category] || 0) + (e.amount || 0) })
    const sum = list.reduce((s, e) => s + (e.amount || 0), 0) || 1
    return EXPENSE_CATS.map((cat, i) => ({ cat, total: totals[cat] || 0, pct: Math.round(((totals[cat] || 0) / sum) * 100), color: CAT_COLORS[i % CAT_COLORS.length] })).filter(x => x.total > 0).sort((a, b) => b.total - a.total)
  }
  const allTimeCategories = byCategory(expenses)
  const scopeCategories = byCategory(monthExpenses)

  // Save functions (unchanged real writes)
  const saveExpense = async () => {
    if (!expForm.description || !expForm.amount) { alert('Fill required'); return }
    setSaving(true)
    await createClient().from('expenses').insert([{ ...expForm, amount: parseFloat(expForm.amount) }])
    await loadAll(); setShowAddExpense(false); setSaving(false)
    setExpForm({ date: today(), category: 'Rent/Storage', description: '', amount: '', paid_by: 'company', notes: '' })
  }
  const saveInv = async () => {
    if (!invForm.product_name || !invForm.units || !invForm.unit_cost) { alert('Fill required'); return }
    setSaving(true)
    const total_cost = parseFloat(invForm.unit_cost) * parseInt(invForm.units)
    await createClient().from('inventory_purchases').insert([{ ...invForm, units: parseInt(invForm.units), unit_cost: parseFloat(invForm.unit_cost), total_cost }])
    await loadAll(); setShowAddInv(false); setSaving(false)
    setInvForm({ date: today(), product_name: '', supplier: '', units: '', unit_cost: '', paid_by: 'company', notes: '' })
  }
  const savePtx = async () => {
    if (!ptxForm.amount || !ptxForm.description) { alert('Fill required'); return }
    setSaving(true)
    await createClient().from('partner_transactions').insert([{ ...ptxForm, amount: parseFloat(ptxForm.amount) }])
    await loadAll(); setShowAddPartner(false); setSaving(false)
    setPtxForm({ date: today(), partner: 'Victor', type: 'investment', amount: '', description: '', notes: '' })
  }
  const saveAcctPay = async () => {
    if (!apForm.amount || !apForm.description) { alert('Fill required'); return }
    setSaving(true)
    await createClient().from('account_payments').insert([{ date: apForm.date, partner: apForm.partner, type: apForm.type, amount: parseFloat(apForm.amount), description: apForm.description, order_ids: apForm.selectedOrders, notes: apForm.notes }])
    await loadAll(); setShowAddAcctPay(false); setSaving(false)
    setApForm({ date: today(), partner: 'Victor', type: 'supplier_payment', amount: '', description: '', selectedOrders: [], notes: '' })
  }
  const del = (table, id) => createClient().from(table).delete().eq('id', id).then(() => loadAll())

  const exportOrdersCSV = () => {
    const header = ['Order #', 'Client', 'Revenue', 'Cost', 'Gross profit', 'Margin %', 'Account']
    const lines = monthOrders.map(o => { const p = o.total - orderCogs(o); const m = o.total ? (p / o.total) * 100 : 0
      return [o.order_number, clientNameFor(o), o.total || 0, orderCogs(o), p, m.toFixed(1), ACCOUNTS.find(a => a.key === (o.payment_account || 'company'))?.label || 'Company'].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `levam-profit-${allTime ? 'all-time' : month}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading profit report…</div>
      </div>
    </div>
  )

  const isPos = netProfit >= 0
  const periodLabel = allTime ? 'All time' : fmtM(month + '-01')
  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'
  const twoCols = 'minmax(0, 1.08fr) minmax(300px, .92fr)'

  const tabDefs = [
    { key: 'Overview', label: 'Overview', icon: 'O' },
    { key: 'Accounts', label: 'Accounts', icon: '$' },
    { key: 'Expenses', label: 'Expenses', icon: 'E' },
    { key: 'Inventory', label: 'Inventory', icon: 'I' },
    { key: 'Partners', label: 'Partners', icon: 'P' },
  ]

  const trend = monthKeys.slice(0, 6).map(k => ({ key: k, label: monthShort(k), ...totalsForMonth(k) })).reverse()
  const maxNet = Math.max(...trend.map(b => Math.abs(b.net)), 1)

  const alreadyCovered = acctPay.filter(p => p.type === 'supplier_payment').flatMap(p => p.order_ids || [])
  const availableForCoverage = confirmedOrders.filter(o => !alreadyCovered.includes(o.id))
  const selectedTotal = availableForCoverage.filter(o => apForm.selectedOrders.includes(o.id)).reduce((s, o) => s + orderCogs(o), 0)

  const allTimeInvested = inventory.reduce((s, i) => s + (i.total_cost || 0), 0)

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .apf-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .apf-shell { grid-template-columns:1fr !important; } .apf-shell > div:first-child { position:static !important; max-height:none !important; } }
        .apf-hero { display:grid; grid-template-columns: minmax(0,1.25fr) minmax(260px,.85fr); }
        @media(max-width:760px){ .apf-hero { grid-template-columns:1fr !important; } }
        .apf-2col { display:grid; grid-template-columns:${twoCols}; gap:clamp(14px,1.8vw,18px); align-items:start; }
        @media(max-width:760px){ .apf-2col { grid-template-columns:1fr !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="apf-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={{}} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Profit report</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{periodLabel} · {money(netProfit)} net · {margin.toFixed(1)}% margin</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflow: 'hidden', background: '#f7f8fa' }}>
                {['Monthly', 'All time'].map(label => { const on = (label === 'All time') === allTime
                  return <button key={label} type="button" onClick={() => setAllTime(label === 'All time')} style={{ border: 0, cursor: 'pointer', padding: '9px 14px 10px', background: on ? ACCENT : 'transparent', color: on ? '#ffffff' : '#6b7280', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{label}</button>
                })}
              </span>
              {!allTime && (
                <span data-scroll style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflowX: 'auto', background: '#ffffff', maxWidth: 300 }}>
                  {monthKeys.map(k => { const on = k === month
                    return <button key={k} type="button" onClick={() => setMonth(k)} style={{ flex: '0 0 auto', border: 0, cursor: 'pointer', padding: '9px 12px 10px', background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#6b7280', fontSize: 12.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }} className="lc-mono">{k}</button>
                  })}
                </span>
              )}
              <button type="button" onClick={exportOrdersCSV} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>↓ Export</button>
              <button type="button" onClick={logout} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>

            {/* HERO */}
            <div className="apf-hero" style={{ borderRadius: 14, overflow: 'hidden', background: isPos ? '#0b1a12' : '#1a0b0b' }}>
              <div style={{ padding: 'clamp(22px,3vw,34px) clamp(20px,2.6vw,30px)' }}>
                <div className="lc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: isPos ? '#6ee7a0' : '#fca5a5' }}>{periodLabel.toUpperCase()} · NET PROFIT</div>
                <div className="lc-mono" style={{ paddingTop: 12, fontWeight: 700, fontSize: 'clamp(38px,5vw,62px)', letterSpacing: '-.045em', lineHeight: 1, color: isPos ? '#6ee7a0' : '#fca5a5' }}>{signed(netProfit)}</div>
                <div style={{ paddingTop: 11, fontSize: 14.5, color: '#9fb3a6' }}>{money(grossProfit)} gross · {money(totalExpenses)} expenses · {money(cogs)} cost of goods</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 16 }}>
                  {[margin.toFixed(1) + '% margin', monthOrders.length + (monthOrders.length === 1 ? ' order' : ' orders'), money(revenue / (monthOrders.length || 1)) + ' avg order'].map(t => (
                    <span key={t} className="lc-mono" style={{ padding: '6px 11px 7px', borderRadius: 6, background: 'rgba(255,255,255,.08)', color: '#ffffff', fontSize: 11.5, fontWeight: 700, letterSpacing: '.06em' }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', background: 'rgba(255,255,255,.05)' }}>
                {PARTNERS.map(partner => {
                  const ad = getAccountData(partner.toLowerCase())
                  return (
                    <div key={partner} style={{ borderLeft: '1px solid rgba(255,255,255,.08)', padding: 'clamp(18px,2.4vw,26px) clamp(16px,2vw,22px)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 5, background: 'rgba(110,231,160,.16)', color: '#6ee7a0', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{partner[0]}</span>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: '#ffffff' }}>{partner}</span>
                      </div>
                      <div className="lc-mono" style={{ paddingTop: 14, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7f9488' }}>{allTime ? 'All-time share' : 'Month profit share'}</div>
                      <div className="lc-mono" style={{ paddingTop: 6, fontWeight: 700, fontSize: 'clamp(19px,2vw,24px)', letterSpacing: '-.03em', color: '#6ee7a0' }}>{money(profitPerPart)}</div>
                      <div className="lc-mono" style={{ paddingTop: 13, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#7f9488' }}>Balance in account</div>
                      <div className="lc-mono" style={{ paddingTop: 6, fontWeight: 700, fontSize: 17, letterSpacing: '-.02em', color: '#9ec9ff' }}>{money(ad.balance)}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(178px, 1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
              {[
                { k: 'Revenue', v: money(revenue), sub: `${monthOrders.length} order${monthOrders.length === 1 ? '' : 's'}`, icon: '$', bar: ACCENT, iBg: '#e8f0ff', iInk: DEEP, ink: DEEP },
                { k: 'Collected', v: money(collected), sub: `${money(Math.max(0, revenue - collected))} outstanding`, icon: '✓', bar: '#16a34a', iBg: '#dcfce7', iInk: '#166534', ink: '#166534' },
                { k: 'Cost of goods', v: money(cogs), sub: 'what you paid suppliers', icon: 'C', bar: '#dc2626', iBg: '#fee2e2', iInk: '#991b1b', ink: '#991b1b' },
                { k: 'Gross profit', v: money(grossProfit), sub: `${margin.toFixed(1)}% margin`, icon: 'G', bar: '#7c3aed', iBg: '#ede9fe', iInk: '#5b21b6', ink: '#5b21b6' },
                { k: 'Expenses', v: money(totalExpenses), sub: `${monthExpenses.length} item${monthExpenses.length === 1 ? '' : 's'}`, icon: 'E', bar: '#f0b429', iBg: '#fef3c7', iInk: '#7c4a03', ink: '#8a5a00' },
              ].map(d => (
                <div key={d.k} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '14px 15px 15px', borderLeft: `5px solid ${d.bar}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 6, background: d.iBg, color: d.iInk, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>{d.icon}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>{d.k}</span>
                  </div>
                  <div className="lc-mono" style={{ paddingTop: 9, fontWeight: 700, fontSize: 'clamp(20px,2vw,25px)', letterSpacing: '-.035em', color: d.ink }}>{d.v}</div>
                  <div style={{ paddingTop: 5, fontSize: 12.5, color: '#6b7280' }}>{d.sub}</div>
                </div>
              ))}
            </div>

            {/* SUBTABS */}
            <div data-scroll style={{ display: 'flex', gap: 4, overflowX: 'auto', borderBottom: '1px solid #e2e4e9' }}>
              {tabDefs.map(t => { const on = t.key === tab
                return (
                  <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, border: 0, borderBottom: `3px solid ${on ? ACCENT : 'transparent'}`, background: 'transparent', cursor: 'pointer', padding: '10px 13px 12px', fontSize: 14.5, fontWeight: on ? 700 : 500, color: on ? '#16181d' : '#6b7280', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: on ? ACCENT : '#eef0f4', color: on ? '#ffffff' : '#6b7280', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{t.icon}</span>
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* ══ OVERVIEW ══ */}
            {tab === 'Overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>
                <div className="apf-2col">
                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Profit &amp; loss — {periodLabel}</div>
                      <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Every dollar in and out, in order</div>
                    </div>
                    {[
                      { k: 'Gross revenue', v: revenue, ink: DEEP },
                      { k: 'Cost of goods sold', v: -cogs, ink: '#991b1b' },
                      { k: '= Gross profit', v: grossProfit, ink: '#5b21b6', bg: '#fbfaff', bold: true },
                      { k: 'Operating expenses', v: -totalExpenses, ink: totalExpenses ? '#991b1b' : '#8a5a00' },
                      { k: '= Net profit', v: netProfit, ink: netProfit >= 0 ? '#166534' : '#991b1b', bg: '#f3faf5', bold: true, big: true },
                      { k: 'Per partner (÷2)', v: profitPerPart, ink: '#166534', sub: true },
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14, padding: row.big ? '16px 16px 17px' : '13px 16px 14px', borderBottom: '1px solid #f1f2f5', background: row.bg || '#ffffff' }}>
                        <span style={{ fontSize: row.sub ? 14 : row.bold ? 15 : 14.5, fontWeight: row.sub ? 600 : row.bold ? 700 : 500, color: row.sub ? '#6b7280' : '#16181d', paddingLeft: row.sub ? 12 : 0 }}>{row.k}</span>
                        <span className="lc-mono" style={{ fontSize: row.big ? 21 : row.bold ? 16 : 15, fontWeight: 700, letterSpacing: '-.02em', color: row.ink }}>{signed(row.v)}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Net profit by month</div>
                      <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Last {trend.length} months with real activity, most recent on the right</div>
                    </div>
                    <div style={{ padding: '16px 16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(8px,1.4vw,16px)', height: 168 }}>
                        {trend.map(b => (
                          <div key={b.key} style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                            <span className="lc-mono" style={{ fontSize: 11.5, fontWeight: 700, color: b.net >= 0 ? '#166534' : '#991b1b', paddingBottom: 6, whiteSpace: 'nowrap' }}>${Math.round(Math.abs(b.net)).toLocaleString('en-US')}</span>
                            <span style={{ width: '100%', borderRadius: '5px 5px 0 0', background: b.net >= 0 ? '#16a34a' : '#dc2626', height: Math.max(6, Math.round((Math.abs(b.net) / maxNet) * 118)) }} />
                            <span className="lc-mono" style={{ paddingTop: 8, fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#8b909a' }}>{b.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <span>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Profit per order — {periodLabel}</span>
                      <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>What each order actually left you</span>
                    </span>
                    <span style={{ fontSize: 13.5, color: '#6b7280' }}>{monthOrders.length} order{monthOrders.length === 1 ? '' : 's'}</span>
                  </div>
                  <div data-scroll style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 880 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(230px,1.7fr) 128px 128px 140px 104px 118px', gap: 12, alignItems: 'center', padding: '10px 16px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                        <span>Order / client</span><span style={{ textAlign: 'right' }}>Revenue</span><span style={{ textAlign: 'right' }}>Cost</span><span style={{ textAlign: 'right' }}>Gross profit</span><span style={{ textAlign: 'right' }}>Margin</span><span style={{ textAlign: 'center' }}>Account</span>
                      </div>
                      {monthOrders.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No confirmed orders in {periodLabel}</div>
                      ) : monthOrders.slice().sort((a, b) => (b.total - orderCogs(b)) - (a.total - orderCogs(a))).map(o => {
                        const p = o.total - orderCogs(o)
                        const m = o.total ? (p / o.total) * 100 : 0
                        const acc = ACCOUNTS.find(a => a.key === (o.payment_account || 'company'))
                        return (
                          <div key={o.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(230px,1.7fr) 128px 128px 140px 104px 118px', gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5' }}>
                            <span style={{ minWidth: 0 }}>
                              <span className="lc-mono" style={{ display: 'block', fontSize: 13.5, fontWeight: 700, letterSpacing: '-.02em' }}>#{o.order_number}</span>
                              <span style={{ display: 'block', paddingTop: 3, fontSize: 13, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{clientNameFor(o)}</span>
                            </span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, color: DEEP }}>{money(o.total)}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, color: '#991b1b' }}>{orderCogs(o) > 0 ? money(orderCogs(o)) : '—'}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: '#166534' }}>{signed(p)}</span>
                            <span style={{ textAlign: 'right' }}>
                              <span className="lc-mono" style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, padding: '4px 8px 5px', borderRadius: 5, background: m < 6 ? '#fee2e2' : m < 8 ? '#fef3c7' : '#dcfce7', color: m < 6 ? '#991b1b' : m < 8 ? '#7c4a03' : '#166534' }}>{orderCogs(o) > 0 ? m.toFixed(1) + '%' : '—'}</span>
                            </span>
                            <span style={{ textAlign: 'center' }}>
                              <span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: acc?.key === 'company' ? '#e8f0ff' : '#ede9fe', color: acc?.key === 'company' ? DEEP : '#5b21b6' }}>{acc?.label || 'Company'}</span>
                            </span>
                          </div>
                        )
                      })}
                      {monthOrders.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(230px,1.7fr) 128px 128px 140px 104px 118px', gap: 12, alignItems: 'center', padding: '13px 16px 14px', background: '#fafbfc', fontWeight: 700 }}>
                          <span style={{ fontSize: 14 }}>{monthOrders.length} order{monthOrders.length === 1 ? '' : 's'}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, color: DEEP }}>{money(revenue)}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, color: '#991b1b' }}>{money(cogs)}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 16, letterSpacing: '-.02em', color: '#166534' }}>{signed(grossProfit)}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, color: '#8a5a00' }}>{margin.toFixed(1)}%</span>
                          <span />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ACCOUNTS ══ */}
            {tab === 'Accounts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Account balances</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>What each account actually has right now — all time</div>
                  </div>
                  <button type="button" onClick={() => setShowAddAcctPay(v => !v)} style={{ padding: '10px 16px', background: ACCENT, color: '#ffffff', fontSize: 13.5, fontWeight: 700, border: 0, borderRadius: 8, cursor: 'pointer' }}>+ Record payment</button>
                </div>

                {showAddAcctPay && (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '1.25rem' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>Record account payment</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 10, marginBottom: 12 }}>
                      <div><label style={labelStyle}>Date</label><input type="date" value={apForm.date} onChange={e => setApForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Account (who paid)</label><select value={apForm.partner} onChange={e => setApForm(f => ({ ...f, partner: e.target.value, selectedOrders: [] }))} style={inputStyle}>{ACCOUNTS.map(a => <option key={a.key} value={a.label}>{a.label}</option>)}</select></div>
                      <div><label style={labelStyle}>Payment type</label>
                        <select value={apForm.type} onChange={e => setApForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                          <option value="supplier_payment">Supplier payment (paid for orders)</option>
                          <option value="profit_transfer">Profit transfer (sent to company)</option>
                          <option value="other">Other outgoing payment</option>
                        </select>
                      </div>
                      <div><label style={labelStyle}>Amount ($)</label><input type="number" value={apForm.amount} onChange={e => setApForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" style={inputStyle} /></div>
                      <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><input value={apForm.description} onChange={e => setApForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Paid World Family for JBL order" style={inputStyle} /></div>
                    </div>

                    {apForm.type === 'supplier_payment' && (
                      availableForCoverage.length === 0 ? (
                        <div style={{ padding: '10px 12px', background: '#f3faf5', border: '1px solid #cfe8d7', borderRadius: 6, fontSize: 12.5, color: '#166534', marginBottom: 12 }}>✓ All orders are already covered by previous payments</div>
                      ) : (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <label style={labelStyle}>Orders this payment covers</label>
                            <button type="button" onClick={() => setApForm(f => ({ ...f, selectedOrders: availableForCoverage.map(o => o.id) }))} style={{ fontSize: 11, color: DEEP, background: '#e8f0ff', border: '1px solid #cfe0fb', padding: '3px 10px', borderRadius: 5, cursor: 'pointer' }}>Select all</button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 240, overflowY: 'auto', background: '#f7f8fa', border: '1px solid #e2e4e9', borderRadius: 8, padding: 8 }}>
                            {availableForCoverage.map(o => {
                              const isSelected = apForm.selectedOrders.includes(o.id)
                              const acc = ACCOUNTS.find(a => a.key === (o.payment_account || 'company'))
                              return (
                                <div key={o.id} onClick={() => setApForm(f => ({ ...f, selectedOrders: isSelected ? f.selectedOrders.filter(id => id !== o.id) : [...f.selectedOrders, o.id] }))}
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: isSelected ? '#e8f0ff' : '#ffffff', border: `1px solid ${isSelected ? ACCENT : '#e2e4e9'}`, borderRadius: 7, cursor: 'pointer' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: isSelected ? ACCENT : '#eef0f4', display: 'grid', placeItems: 'center' }}>{isSelected && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}</div>
                                    <div>
                                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>#{o.order_number} · {clientNameFor(o)}</div>
                                      <div style={{ fontSize: 11, color: '#8b909a', marginTop: 1 }}>{fmt(o.submitted_at)} · {(o.order_items || []).length} products · <span style={{ color: acc?.color }}>{acc?.label}</span></div>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div className="lc-mono" style={{ fontSize: 13, fontWeight: 700 }}>{money(o.total)}</div>
                                    {orderCogs(o) > 0 ? <div style={{ fontSize: 11, color: '#991b1b' }}>cost {money(orderCogs(o))}</div> : <div style={{ fontSize: 11, color: '#8b909a' }}>no cost data</div>}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          {apForm.selectedOrders.length > 0 && (
                            <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '8px 12px', background: '#e8f0ff', border: '1px solid #cfe0fb', borderRadius: 6 }}>
                              <span style={{ fontSize: 12, color: DEEP, fontWeight: 700 }}>{apForm.selectedOrders.length} order(s) selected</span>
                              <span style={{ fontSize: 12, color: '#6b7280' }}>Total cost: {money(selectedTotal)}</span>
                              {apForm.amount && <span style={{ fontSize: 12, color: parseFloat(apForm.amount) >= selectedTotal ? '#166534' : '#991b1b' }}>Payment: {money(apForm.amount)}</span>}
                            </div>
                          )}
                        </div>
                      )
                    )}

                    <div style={{ marginBottom: 12 }}><label style={labelStyle}>Notes</label><input value={apForm.notes} onChange={e => setApForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..." style={inputStyle} /></div>
                    <div style={{ display: 'flex', gap: 9 }}>
                      <button type="button" onClick={saveAcctPay} disabled={saving} style={{ padding: '10px 18px', background: saving ? '#8b909a' : ACCENT, color: '#ffffff', fontSize: 13, fontWeight: 700, border: 0, borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : '✓ Record payment'}</button>
                      <button type="button" onClick={() => setShowAddAcctPay(false)} style={{ padding: '10px 16px', background: 'transparent', color: '#6b7280', fontSize: 13, border: '1px solid #d9dce2', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'clamp(12px,1.4vw,16px)' }}>
                  {ACCOUNTS.map(acc => {
                    const ad = getAccountData(acc.key)
                    if (ad.totalIn === 0 && ad.payments.length === 0) return null
                    return (
                      <div key={acc.key} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 15px 14px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', borderLeft: `5px solid ${acc.color}` }}>
                          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>{acc.label}</span>
                          <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6b7280' }}>{acc.key === 'company' ? 'Operating' : 'Partner'}</span>
                        </div>
                        <div style={{ padding: '15px 15px 16px' }}>
                          <div className="lc-mono" style={{ fontSize: 10.5, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6b7280' }}>Balance</div>
                          <div className="lc-mono" style={{ paddingTop: 7, fontWeight: 700, fontSize: 'clamp(22px,2.2vw,28px)', letterSpacing: '-.035em', color: ad.balance >= 0 ? '#16181d' : '#991b1b' }}>{money(ad.balance)}</div>
                          <div style={{ paddingTop: 12, borderTop: '1px solid #f1f2f5' }}>
                            {[
                              { k: 'Total in', v: money(ad.totalIn), ink: '#166534' },
                              { k: 'Total out', v: money(ad.totalOut), ink: '#991b1b' },
                              { k: 'Committed to pending orders', v: money(ad.committedToOrders), ink: '#8a5a00' },
                              { k: 'Free profit (can transfer)', v: money(ad.freeProfitBalance), ink: ad.freeProfitBalance > 0 ? '#166534' : '#6b7280' },
                            ].map(r => (
                              <div key={r.k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '8px 0 9px', borderBottom: '1px solid #f1f2f5' }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>{r.k}</span>
                                <span className="lc-mono" style={{ fontSize: 13.5, fontWeight: 700, color: r.ink }}>{r.v}</span>
                              </div>
                            ))}
                          </div>
                          {ad.unpaidOrders.length > 0 && (
                            <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff6f6', border: '1px solid #f6d5d5', borderRadius: 8 }}>
                              <div className="lc-mono" style={{ fontSize: 10, color: '#991b1b', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Orders awaiting payment</div>
                              {ad.unpaidOrders.slice(0, 3).map(o => (
                                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#47505e', padding: '2px 0' }}>
                                  <span>#{o.order_number} {clientNameFor(o)}</span>
                                  <span style={{ color: '#991b1b', fontWeight: 700 }}>{money(Math.max(0, (o.total || 0) - (parseFloat(o.amount_paid) || 0)))} due</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Money movements</div>
                    <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Real order payments in and account payments out, per account — newest first</div>
                  </div>
                  {ACCOUNTS.map(acc => {
                    const mv = movementsFor(acc.key)
                    if (mv.length === 0) return null
                    return (
                      <div key={acc.key}>
                        <div style={{ padding: '10px 16px 8px', fontSize: 12.5, fontWeight: 700, color: acc.color, background: '#fafbfc', borderBottom: '1px solid #f1f2f5' }}>{acc.label}</div>
                        {mv.slice(0, 8).map((m, i) => (
                          <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px minmax(0,1fr) 110px 110px', gap: 12, alignItems: 'center', padding: '10px 16px 11px', borderBottom: '1px solid #f1f2f5' }}>
                            <span className="lc-mono" style={{ fontSize: 12, color: '#47505e' }}>{fmt(m.date)}</span>
                            <span style={{ minWidth: 0 }}>
                              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.what}</span>
                              {m.note && <span style={{ display: 'block', paddingTop: 2, fontSize: 11.5, color: '#8b909a' }}>{m.note}</span>}
                            </span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 13.5, fontWeight: 700, color: m.amount >= 0 ? '#166534' : '#991b1b' }}>{signed(m.amount)}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 12.5, color: '#47505e' }}>{money(m.after)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ══ EXPENSES ══ */}
            {tab === 'Expenses' && (
              <div className="apf-2col">
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <span>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Expenses — {periodLabel}</span>
                      <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>{monthExpenses.length ? `${monthExpenses.length} item${monthExpenses.length === 1 ? '' : 's'} · ${money(totalExpenses)}` : 'Nothing recorded yet for this period'}</span>
                    </span>
                    <button type="button" onClick={() => setShowAddExpense(v => !v)} style={{ padding: '10px 14px', borderRadius: 8, background: ACCENT, color: '#ffffff', fontSize: 13.5, fontWeight: 700, border: 0, cursor: 'pointer' }}>+ Add expense</button>
                  </div>

                  {showAddExpense && (
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e4e9', background: '#fafbfc' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 10, marginBottom: 10 }}>
                        <div><label style={labelStyle}>Date</label><input type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
                        <div><label style={labelStyle}>Category</label><select value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>{EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div><label style={labelStyle}>Amount ($)</label><input type="number" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" style={inputStyle} /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><input value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} placeholder="What was this for?" style={inputStyle} /></div>
                        <div><label style={labelStyle}>Paid by</label><select value={expForm.paid_by} onChange={e => setExpForm(f => ({ ...f, paid_by: e.target.value }))} style={inputStyle}><option value="company">Company</option><option value="Victor">Victor</option><option value="Leopoldo">Leopoldo</option></select></div>
                        <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Notes</label><input value={expForm.notes} onChange={e => setExpForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..." style={inputStyle} /></div>
                      </div>
                      <div style={{ display: 'flex', gap: 9 }}>
                        <button type="button" onClick={saveExpense} disabled={saving} style={{ padding: '10px 18px', background: saving ? '#8b909a' : ACCENT, color: '#ffffff', fontSize: 13, fontWeight: 700, border: 0, borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : '✓ Save'}</button>
                        <button type="button" onClick={() => setShowAddExpense(false)} style={{ padding: '10px 16px', background: 'transparent', color: '#6b7280', fontSize: 13, border: '1px solid #d9dce2', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {monthExpenses.length === 0 ? (
                    <div style={{ padding: '34px 20px 36px', textAlign: 'center' }}>
                      <div style={{ display: 'grid', placeItems: 'center', width: 40, height: 40, margin: '0 auto', borderRadius: 10, background: '#f3faf5', color: '#166534', fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700 }}>✓</div>
                      <div style={{ paddingTop: 12, fontSize: 15.5, fontWeight: 700 }}>No expenses recorded in {periodLabel}</div>
                      <div style={{ paddingTop: 6, fontSize: 13.5, lineHeight: 1.6, color: '#6b7280' }}>Every dollar of gross profit stayed in the business. Add rent, software, freight or bank fees as they come in so the net profit stays honest.</div>
                    </div>
                  ) : (
                    <div>
                      {monthExpenses.map(e => (
                        <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '96px minmax(0,1fr) 132px 110px 30px', gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5' }}>
                          <span className="lc-mono" style={{ fontSize: 13, color: '#47505e' }}>{fmt(e.date)}</span>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</span>
                            {e.notes && <span style={{ display: 'block', paddingTop: 3, fontSize: 12, color: '#8b909a' }}>{e.notes}</span>}
                          </span>
                          <span><span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: '#f1f2f5', color: '#47505e' }}>{e.category}</span></span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, fontWeight: 700, color: '#991b1b' }}>{money(e.amount)}</span>
                          <span style={{ textAlign: 'right' }}><button type="button" onClick={() => del('expenses', e.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 15, opacity: .6 }}>×</button></span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '13px 16px 15px', background: '#fafbfc' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
                        <span className="lc-mono" style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em', color: '#991b1b' }}>{money(totalExpenses)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Where the money goes</div>
                    <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>By category, all time</div>
                  </div>
                  <div style={{ padding: '15px 16px 18px' }}>
                    {allTimeCategories.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#8b909a', fontSize: 13, padding: '1.5rem' }}>No expenses recorded yet</div>
                    ) : allTimeCategories.map(c => (
                      <div key={c.cat} style={{ paddingBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingBottom: 7 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: c.color }} />{c.cat}</span>
                          <span className="lc-mono" style={{ fontSize: 13.5, fontWeight: 700 }}>{money(c.total)}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: '#f1f2f5', overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 4, background: c.color, width: `${c.pct}%` }} /></div>
                        <div style={{ paddingTop: 5, fontSize: 12, color: '#8b909a' }}>{c.pct}% of all expenses</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══ INVENTORY ══ */}
            {tab === 'Inventory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Inventory purchases</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>All time · {money(allTimeInvested)} total invested</div>
                  </div>
                  <button type="button" onClick={() => setShowAddInv(v => !v)} style={{ padding: '10px 16px', background: ACCENT, color: '#ffffff', fontSize: 13.5, fontWeight: 700, border: 0, borderRadius: 8, cursor: 'pointer' }}>+ Add purchase</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(182px, 1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
                  {[
                    { k: 'Capital invested', v: money(allTimeInvested), sub: 'all time, at cost', bar: ACCENT },
                    { k: 'Purchases logged', v: String(inventory.length), sub: 'inventory purchase records', bar: '#0ea5e9' },
                    { k: 'Avg. purchase size', v: money(inventory.length ? allTimeInvested / inventory.length : 0), sub: 'across all logged purchases', bar: '#7c3aed' },
                  ].map(d => (
                    <div key={d.k} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '14px 15px 15px', borderLeft: `5px solid ${d.bar}` }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>{d.k}</div>
                      <div className="lc-mono" style={{ paddingTop: 9, fontWeight: 700, fontSize: 'clamp(20px,2vw,25px)', letterSpacing: '-.035em' }}>{d.v}</div>
                      <div style={{ paddingTop: 5, fontSize: 12.5, color: '#6b7280' }}>{d.sub}</div>
                    </div>
                  ))}
                </div>

                {showAddInv && (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '1.25rem' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>New inventory purchase</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 10, marginBottom: 10 }}>
                      <div><label style={labelStyle}>Date</label><input type="date" value={invForm.date} onChange={e => setInvForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
                      <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Product name</label><input value={invForm.product_name} onChange={e => setInvForm(f => ({ ...f, product_name: e.target.value }))} placeholder="e.g. JBL PartyBox 710" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Supplier</label><input value={invForm.supplier} onChange={e => setInvForm(f => ({ ...f, supplier: e.target.value }))} placeholder="e.g. World Family" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Units</label><input type="number" value={invForm.units} onChange={e => setInvForm(f => ({ ...f, units: e.target.value }))} placeholder="0" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Unit cost ($)</label><input type="number" value={invForm.unit_cost} onChange={e => setInvForm(f => ({ ...f, unit_cost: e.target.value }))} placeholder="0.00" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Paid by</label><select value={invForm.paid_by} onChange={e => setInvForm(f => ({ ...f, paid_by: e.target.value }))} style={inputStyle}><option value="company">Company</option><option value="Victor">Victor</option><option value="Leopoldo">Leopoldo</option></select></div>
                      <div style={{ gridColumn: 'span 2' }}><label style={labelStyle}>Notes</label><input value={invForm.notes} onChange={e => setInvForm(f => ({ ...f, notes: e.target.value }))} placeholder="PO, tracking, etc." style={inputStyle} /></div>
                    </div>
                    {invForm.units && invForm.unit_cost && <div style={{ padding: '8px 12px', background: '#e8f0ff', border: '1px solid #cfe0fb', borderRadius: 6, marginBottom: 10, fontSize: 12.5, color: DEEP }}>Total: <strong>{money(parseFloat(invForm.unit_cost) * parseInt(invForm.units))}</strong></div>}
                    <div style={{ display: 'flex', gap: 9 }}>
                      <button type="button" onClick={saveInv} disabled={saving} style={{ padding: '10px 18px', background: saving ? '#8b909a' : ACCENT, color: '#ffffff', fontSize: 13, fontWeight: 700, border: 0, borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : '✓ Save'}</button>
                      <button type="button" onClick={() => setShowAddInv(false)} style={{ padding: '10px 16px', background: 'transparent', color: '#6b7280', fontSize: 13, border: '1px solid #d9dce2', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div data-scroll style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 780 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 130px 100px 110px 120px 90px 30px', gap: 12, alignItems: 'center', padding: '10px 16px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                        <span>Product</span><span>Supplier</span><span style={{ textAlign: 'right' }}>Units</span><span style={{ textAlign: 'right' }}>Unit cost</span><span style={{ textAlign: 'right' }}>Total</span><span style={{ textAlign: 'right' }}>Date</span><span />
                      </div>
                      {inventory.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#8b909a', fontSize: 13.5 }}>No purchases recorded</div>
                      ) : inventory.map(iv => (
                        <div key={iv.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 130px 100px 110px 120px 90px 30px', gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5' }}>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{iv.product_name}</span>
                            {iv.notes && <span style={{ display: 'block', paddingTop: 2, fontSize: 11.5, color: '#8b909a' }}>{iv.notes}</span>}
                            <span style={{ display: 'block', paddingTop: 2, fontSize: 11, color: '#8b909a' }}>Paid by: {iv.paid_by}</span>
                          </span>
                          <span style={{ fontSize: 12.5, color: '#47505e' }}>{iv.supplier || '—'}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 13.5 }}>{iv.units}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 13.5, color: '#47505e' }}>{money(iv.unit_cost)}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, fontWeight: 700, letterSpacing: '-.02em', color: DEEP }}>{money(iv.total_cost)}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 12, color: '#8b909a' }}>{fmt(iv.date)}</span>
                          <span style={{ textAlign: 'right' }}><button type="button" onClick={() => del('inventory_purchases', iv.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 15, opacity: .6 }}>×</button></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ PARTNERS ══ */}
            {tab === 'Partners' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Partners</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Investments, withdrawals &amp; distributions — 50 / 50 after expenses</div>
                  </div>
                  <button type="button" onClick={() => setShowAddPartner(v => !v)} style={{ padding: '10px 16px', background: ACCENT, color: '#ffffff', fontSize: 13.5, fontWeight: 700, border: 0, borderRadius: 8, cursor: 'pointer' }}>+ Add transaction</button>
                </div>

                {showAddPartner && (
                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '1.25rem' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 12 }}>New transaction</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 10, marginBottom: 10 }}>
                      <div><label style={labelStyle}>Date</label><input type="date" value={ptxForm.date} onChange={e => setPtxForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Partner</label><select value={ptxForm.partner} onChange={e => setPtxForm(f => ({ ...f, partner: e.target.value }))} style={inputStyle}>{PARTNERS.map(p => <option key={p}>{p}</option>)}</select></div>
                      <div><label style={labelStyle}>Type</label>
                        <select value={ptxForm.type} onChange={e => setPtxForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                          <option value="investment">Investment</option><option value="withdrawal">Withdrawal</option><option value="distribution">Distribution</option><option value="expense_reimbursement">Expense reimbursement</option>
                        </select>
                      </div>
                      <div><label style={labelStyle}>Amount ($)</label><input type="number" value={ptxForm.amount} onChange={e => setPtxForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" style={inputStyle} /></div>
                      <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Description</label><input value={ptxForm.description} onChange={e => setPtxForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this?" style={inputStyle} /></div>
                      <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Notes</label><input value={ptxForm.notes} onChange={e => setPtxForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional details..." style={inputStyle} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 9 }}>
                      <button type="button" onClick={savePtx} disabled={saving} style={{ padding: '10px 18px', background: saving ? '#8b909a' : ACCENT, color: '#ffffff', fontSize: 13, fontWeight: 700, border: 0, borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : '✓ Save'}</button>
                      <button type="button" onClick={() => setShowAddPartner(false)} style={{ padding: '10px 16px', background: 'transparent', color: '#6b7280', fontSize: 13, border: '1px solid #d9dce2', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(12px,1.4vw,16px)' }}>
                  {PARTNERS.map(partner => {
                    const txs = partnerTx.filter(t => t.partner === partner)
                    const invested = txs.filter(t => t.type === 'investment').reduce((s, t) => s + (t.amount || 0), 0)
                    const drawn = txs.filter(t => t.type === 'withdrawal' || t.type === 'distribution').reduce((s, t) => s + (t.amount || 0), 0)
                    const allNet = monthKeys.reduce((s, k) => s + totalsForMonth(k).net, 0)
                    const earnedAllTime = allNet / 2
                    const available = invested + earnedAllTime - drawn
                    const bar = partner === 'Victor' ? '#16a34a' : '#7c3aed'
                    const avBg = partner === 'Victor' ? '#dcfce7' : '#ede9fe'
                    const avInk = partner === 'Victor' ? '#166534' : '#5b21b6'
                    return (
                      <div key={partner} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9', borderLeft: `5px solid ${bar}` }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 9, background: avBg, color: avInk, fontSize: 15, fontWeight: 700 }}>{partner[0]}</span>
                            <span>
                              <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>{partner}</span>
                              <span style={{ display: 'block', paddingTop: 3, fontSize: 13, color: '#6b7280' }}>Co-founder &amp; partner</span>
                            </span>
                          </span>
                          <span className="lc-mono" style={{ fontSize: 15, fontWeight: 700, padding: '5px 11px 6px', borderRadius: 6, background: '#eef0f4' }}>50%</span>
                        </div>
                        {[
                          { k: `${periodLabel} profit share`, v: money(profitPerPart), ink: '#166534', size: 16 },
                          { k: 'Earned all time', v: money(earnedAllTime), ink: '#16181d', size: 14.5 },
                          { k: 'Capital contributed', v: money(invested), ink: invested ? '#166534' : '#16181d', size: 14.5 },
                          { k: 'Draws taken all time', v: money(-drawn), ink: drawn ? '#991b1b' : '#16181d', size: 14.5 },
                          { k: 'Balance available', v: money(available), ink: '#16181d', size: 16 },
                        ].map(r => (
                          <div key={r.k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '11px 16px 12px', borderBottom: '1px solid #f1f2f5' }}>
                            <span style={{ fontSize: 13.5, color: '#6b7280' }}>{r.k}</span>
                            <span className="lc-mono" style={{ fontSize: r.size, fontWeight: 700, letterSpacing: '-.02em', color: r.ink }}>{r.v}</span>
                          </div>
                        ))}
                        <div style={{ padding: '9px 16px 11px', fontSize: 11.5, color: '#8b909a' }}>Computed from investments, draws and the profit split above — a separate number from the "Balance in account" on the Accounts tab, which tracks real order payments and account payments instead.</div>

                        <div style={{ padding: '0 16px 16px' }}>
                          {txs.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#8b909a', fontSize: 12.5, padding: '1rem 0' }}>No transactions</div>
                          ) : txs.slice(0, 6).map(t => {
                            const tc = { investment: DEEP, withdrawal: '#8a5a00', distribution: '#166534', expense_reimbursement: '#0ea5e9' }[t.type] || '#6b7280'
                            return (
                              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: '1px solid #f1f2f5' }}>
                                <div>
                                  <div style={{ fontSize: 12.5 }}>{t.description}</div>
                                  <div style={{ fontSize: 11, color: '#8b909a' }}>{t.type.replace('_', ' ')} · {fmt(t.date)}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color: tc }}>{money(t.amount)}</span>
                                  <button type="button" onClick={() => del('partner_transactions', t.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13, opacity: .5 }}>×</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Profit split month by month</div>
                    <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>50 / 50 after expenses — this is what each partner earned, not what they withdrew</div>
                  </div>
                  <div data-scroll style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 640 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '110px 130px 130px 1fr 1fr', gap: 12, alignItems: 'center', padding: '10px 16px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                        <span>Month</span><span style={{ textAlign: 'right' }}>Gross profit</span><span style={{ textAlign: 'right' }}>Expenses</span><span style={{ textAlign: 'right' }}>Victor</span><span style={{ textAlign: 'right' }}>Leopoldo</span>
                      </div>
                      {monthKeys.slice(0, 12).map(k => {
                        const t = totalsForMonth(k)
                        return (
                          <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 130px 130px 1fr 1fr', gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5' }}>
                            <span className="lc-mono" style={{ fontSize: 13.5, fontWeight: 600 }}>{k}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 13.5, color: '#5b21b6' }}>{money(t.gross)}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 13.5, color: '#991b1b' }}>{money(t.expenses)}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#166534' }}>{money(t.net / 2)}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#166534' }}>{money(t.net / 2)}</span>
                          </div>
                        )
                      })}
                      {(() => { const allNet = monthKeys.reduce((s, k) => s + totalsForMonth(k).net, 0); const allGrossN = monthKeys.reduce((s, k) => s + totalsForMonth(k).gross, 0); const allExpN = monthKeys.reduce((s, k) => s + totalsForMonth(k).expenses, 0)
                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: '110px 130px 130px 1fr 1fr', gap: 12, alignItems: 'center', padding: '13px 16px 14px', background: '#fafbfc', fontWeight: 700 }}>
                            <span style={{ fontSize: 14 }}>All time</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, color: '#5b21b6' }}>{money(allGrossN)}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, color: '#991b1b' }}>{money(allExpN)}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 16, letterSpacing: '-.02em', color: '#166534' }}>{money(allNet / 2)}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 16, letterSpacing: '-.02em', color: '#166534' }}>{money(allNet / 2)}</span>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
