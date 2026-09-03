'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'
const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const DEFAULT_GOAL = 100000
const DEFAULT_MARGIN_ALERT = 15
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

const ORDER_LABEL = {
  new:        { label: 'Needs payment', bg: '#fee2e2', ink: '#991b1b' },
  review:     { label: 'In review',     bg: '#fde68a', ink: '#7c4a03' },
  confirmed:  { label: 'Getting ready', bg: '#fde68a', ink: '#7c4a03' },
  dispatched: { label: 'Shipped',       bg: '#dbeafe', ink: '#1e40af' },
  completed:  { label: 'Delivered',     bg: '#dcfce7', ink: '#166534' },
  cancelled:  { label: 'Cancelled',     bg: '#f1f2f5', ink: '#6b7280' },
}

const SHIPPING_METHOD_TEXT = { pickup: 'pickup at the Doral warehouse', prep_center: 'prep center delivery', shipping: 'standard shipping', freight: 'freight / LTL' }

const RANGES = ['This month', 'Last 30 days', 'All time']

export default function AdminDashboard() {
  const pathname = usePathname()
  const [data, setData] = useState({
    orders: [], clients: [], applications: [], products: [],
    payments: [], messages: [], expenses: []
  })
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [range, setRange] = useState('This month')

  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalForm, setGoalForm] = useState({ revenue_goal: DEFAULT_GOAL, margin_alert_pct: DEFAULT_MARGIN_ALERT })
  const [savingGoal, setSavingGoal] = useState(false)

  const now = new Date()
  const currentMonth = now.toLocaleString('en-US', { month: 'long' })
  const currentYear = now.getFullYear()
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const fmtDateTime = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const fmtMoney = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  const fmtMargin = (pct) => (pct >= 0 ? '' : '−') + Math.abs(pct).toFixed(1) + '%'

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: authData }) => {
      if (!authData.user || !ADMIN_EMAILS.includes(authData.user.email)) { window.location.href = '/admin'; return }
      const [
        { data: orders }, { data: clients }, { data: applications },
        { data: products }, { data: payments }, { data: messages },
        { data: expenses }, { data: settingsRows }
      ] = await Promise.all([
        supabase.from('orders').select('*, order_items(*, products(cost_price, category))').order('submitted_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name'),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('dashboard_settings').select('*').eq('id', 1).maybeSingle(),
      ])
      setData({ orders: orders||[], clients: clients||[], applications: applications||[], products: products||[], payments: payments||[], messages: messages||[], expenses: expenses||[] })
      const goal = settingsRows?.revenue_goal ?? DEFAULT_GOAL
      const marginAlert = settingsRows?.margin_alert_pct ?? DEFAULT_MARGIN_ALERT
      setSettings({ revenue_goal: goal, margin_alert_pct: marginAlert })
      setGoalForm({ revenue_goal: goal, margin_alert_pct: marginAlert })
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const saveGoal = async () => {
    setSavingGoal(true)
    const revenue_goal = parseFloat(goalForm.revenue_goal) || 0
    const margin_alert_pct = parseFloat(goalForm.margin_alert_pct) || 0
    await createClient().from('dashboard_settings').upsert({ id: 1, revenue_goal, margin_alert_pct, updated_at: new Date().toISOString() })
    setSettings({ revenue_goal, margin_alert_pct })
    setSavingGoal(false)
    setShowGoalModal(false)
  }

  // ── Calculations ──────────────────────────────────────────────────────────
  const completedOrders = data.orders.filter(o => ['confirmed','dispatched','completed'].includes(o.status))
  const newOrders = data.orders.filter(o => o.status === 'new')
  const readyToShip = data.orders.filter(o => o.status === 'confirmed')
  const pendingApps = data.applications.filter(a => a.status === 'pending' || !a.status)
  const unreadMessages = data.messages.filter(m => m.status === 'new')
  const pendingPayments = data.payments.filter(p => p.status === 'requested')
  const proofSubmitted = data.payments.filter(p => p.status === 'processing')
  const proofHeldAmount = proofSubmitted.reduce((s, p) => s + (p.amount || 0), 0)
  const outOfStock = data.products.filter(p => p.stock === 0)
  const outOfStockPct = data.products.length ? Math.round((outOfStock.length / data.products.length) * 100) : 0
  const distinctBrands = new Set(data.products.map(p => p.brand).filter(Boolean)).size

  const paymentByOrderId = {}
  data.payments.forEach(p => { if (p.order_id && !paymentByOrderId[p.order_id]) paymentByOrderId[p.order_id] = p })
  const nextToShip = readyToShip[0] || null
  const nextToShipText = nextToShip ? `${nextToShip.order_number} — ${SHIPPING_METHOD_TEXT[paymentByOrderId[nextToShip.id]?.shipping_method] || 'fulfillment pending'}.` : 'Nothing waiting to ship right now.'

  const hoursSince = (d) => (now - new Date(d)) / 3600000
  const oldestAppDays = pendingApps.length ? Math.max(...pendingApps.map(a => Math.floor(hoursSince(a.created_at) / 24))) : 0
  const staleApps = pendingApps.filter(a => hoursSince(a.created_at) > 48).length

  const clientFor = (order) => {
    const email = (order.notes || '').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim() || ''
    return data.clients.find(c => c.email?.toLowerCase() === email.toLowerCase()) || null
  }

  const totalRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0)
  const calcCost = (order) => (order.order_items || []).reduce((s, i) => s + ((i.products?.cost_price || 0) * i.quantity), 0)
  const totalCost = completedOrders.reduce((s, o) => s + calcCost(o), 0)

  const monthOrders = completedOrders.filter(o => {
    const d = new Date(o.submitted_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === currentYear
  })
  const monthRevenue = monthOrders.reduce((s, o) => s + (o.total || 0), 0)
  const monthCost = monthOrders.reduce((s, o) => s + calcCost(o), 0)
  const monthMargin = monthRevenue > 0 ? ((monthRevenue - monthCost) / monthRevenue) * 100 : 0

  // Business-health KPIs respond to the range tabs; the 12-month chart, the category split and the
  // monthly goal each declare their own fixed period in their subtitle, so they stay pinned regardless.
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000)
  const rangeOrders = range === 'This month' ? monthOrders : range === 'Last 30 days' ? completedOrders.filter(o => new Date(o.submitted_at) >= thirtyDaysAgo) : completedOrders
  const rangeRevenue = rangeOrders.reduce((s, o) => s + (o.total || 0), 0)
  const rangeCost = rangeOrders.reduce((s, o) => s + calcCost(o), 0)
  const rangeMargin = rangeRevenue > 0 ? ((rangeRevenue - rangeCost) / rangeRevenue) * 100 : 0

  // Goal, pacing & projection — tied to the calendar month regardless of the range tabs
  const revenueGoal = settings?.revenue_goal ?? DEFAULT_GOAL
  const marginAlertPct = settings?.margin_alert_pct ?? DEFAULT_MARGIN_ALERT
  const goalPct = revenueGoal > 0 ? (monthRevenue / revenueGoal) * 100 : 0
  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate()
  const dayOfMonth = now.getDate()
  const daysLeft = daysInMonth - dayOfMonth
  const dailyPace = dayOfMonth > 0 ? monthRevenue / dayOfMonth : 0
  const projectedRevenue = dailyPace * daysInMonth
  const remainingToGoal = Math.max(0, revenueGoal - monthRevenue)
  const neededDailyPace = daysLeft > 0 ? remainingToGoal / daysLeft : remainingToGoal

  const approvedThisMonth = data.clients.filter(c => {
    const d = new Date(c.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === currentYear
  }).length

  // Last 12 months revenue series (for the bar chart + its footer stats)
  const monthlySeries = Array.from({ length: 12 }, (_, i) => {
    const idx = 11 - i
    const d = new Date(currentYear, now.getMonth() - idx, 1)
    const rev = completedOrders.filter(o => {
      const od = new Date(o.submitted_at)
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
    }).reduce((s, o) => s + (o.total || 0), 0)
    return { label: d.toLocaleString('en-US', { month: 'short' }), rev }
  })
  const prevMonthRevenue = monthlySeries[monthlySeries.length - 2]?.rev || 0
  const peak = Math.max(...monthlySeries.map(m => m.rev), 1)
  const bestIdx = monthlySeries.reduce((bi, m, i, arr) => (m.rev > arr[bi].rev ? i : bi), 0)

  // Revenue by product category — all-time, per this card's own stated scope
  const categoryRevenue = {}
  completedOrders.forEach(o => (o.order_items || []).forEach(item => {
    const cat = item.products?.category || 'Other'
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.unit_price || 0) * (item.quantity || 0)
  }))
  const categoryEntries = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])
  const catMax = categoryEntries[0]?.[1] || 1

  // Expenses — same table the Profit page manages; used here only to drive the growth alert
  const currentMonthKey = now.toISOString().slice(0, 7)
  const priorMonthKey = new Date(currentYear, now.getMonth() - 1, 1).toISOString().slice(0, 7)
  const currentExpenses = data.expenses.filter(e => e.date?.startsWith(currentMonthKey))
  const priorExpenses = data.expenses.filter(e => e.date?.startsWith(priorMonthKey))
  const expenseByCatCurrent = {}
  currentExpenses.forEach(e => { expenseByCatCurrent[e.category] = (expenseByCatCurrent[e.category] || 0) + (e.amount || 0) })
  const expenseByCatPrior = {}
  priorExpenses.forEach(e => { expenseByCatPrior[e.category] = (expenseByCatPrior[e.category] || 0) + (e.amount || 0) })
  const expenseGrowthAlerts = Object.keys(expenseByCatCurrent)
    .filter(cat => expenseByCatPrior[cat] > 0 && ((expenseByCatCurrent[cat] - expenseByCatPrior[cat]) / expenseByCatPrior[cat]) * 100 > 20)
    .map(cat => ({ cat, growth: ((expenseByCatCurrent[cat] - expenseByCatPrior[cat]) / expenseByCatPrior[cat]) * 100 }))

  // Problems to watch
  const alerts = []
  if (monthRevenue > 0 && monthMargin < marginAlertPct) {
    alerts.push({ dot: '#dc2626', t: `Margin is ${monthMargin.toFixed(1)}%, below your ${marginAlertPct}% alert threshold.`, cta: 'Open profit report', href: '/admin/profit' })
  }
  if (dayOfMonth >= 5 && projectedRevenue < revenueGoal) {
    alerts.push({ dot: '#f59e0b', t: `At the current pace you'll close the month at ${fmtMoney(projectedRevenue)}, ${fmtMoney(revenueGoal - projectedRevenue)} short of your ${fmtMoney(revenueGoal)} goal.`, cta: 'Open profit report', href: '/admin/profit' })
  }
  expenseGrowthAlerts.forEach(({ cat, growth }) => {
    alerts.push({ dot: '#f59e0b', t: `"${cat}" expenses are up ${growth.toFixed(0)}% vs last month (${fmtMoney(expenseByCatCurrent[cat])} vs ${fmtMoney(expenseByCatPrior[cat])}).`, cta: 'Open profit report', href: '/admin/profit' })
  })
  if (outOfStock.length > 0) {
    alerts.push({ dot: '#dc2626', t: `${outOfStock.length} product${outOfStock.length > 1 ? 's are' : ' is'} out of stock — hidden from the partner catalog while unavailable.`, cta: 'See restock list', href: '/admin/products' })
  }
  if (staleApps > 0) {
    alerts.push({ dot: '#dc2626', t: `${staleApps} application${staleApps > 1 ? 's are' : ' is'} older than the 48-hour reply time promised on your website.`, cta: 'Review them now', href: '/admin/applications' })
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading dashboard…</div>
      </div>
    </div>
  )

  // ── Derived view data ────────────────────────────────────────────────────
  const navItemsMeta = {
    Applications: { badge: String(pendingApps.length), urgent: pendingApps.length > 0 },
    Orders: { badge: String(newOrders.length), urgent: newOrders.length > 0 },
    Payments: { badge: String(pendingPayments.length + proofSubmitted.length), urgent: (pendingPayments.length + proofSubmitted.length) > 0 },
    Messages: { badge: String(unreadMessages.length), urgent: unreadMessages.length > 0 },
    Products: { badge: String(outOfStock.length), urgent: outOfStock.length > 0 },
    Clients: { badge: String(data.clients.length) },
  }
  const navGroups = NAV_GROUPS_BASE.map(g => ({
    label: g.label,
    items: g.items.map(n => {
      const active = n.href === pathname
      const meta = navItemsMeta[n.label] || {}
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
        collapsedDot: !sidebarOpen && urgent,
      }
    })
  }))

  const queue = [
    { k: 'Partner applications', v: String(pendingApps.length), unit: 'waiting for a reply', tag: pendingApps.length ? `Oldest ${oldestAppDays} day${oldestAppDays !== 1 ? 's' : ''}` : 'None waiting', tagBg: staleApps > 0 ? '#fee2e2' : '#eef0f4', tagInk: staleApps > 0 ? '#991b1b' : '#6b7280', ink: staleApps > 0 ? '#991b1b' : '#16181d', sub: staleApps > 0 ? `${staleApps} ${staleApps > 1 ? 'are' : 'is'} past the 48-hour reply we promise on the website.` : 'All within the 48-hour reply window.', cta: 'Review applications', href: '/admin/applications' },
    { k: 'Payment proofs', v: String(proofSubmitted.length), unit: 'to confirm', tag: `${fmtMoney(proofHeldAmount)} held`, tagBg: '#eef0f4', tagInk: '#16181d', ink: '#16181d', sub: 'These orders stay on hold until you confirm each transfer.', cta: 'Confirm payments', href: '/admin/payments' },
    { k: 'Orders to send out', v: String(readyToShip.length), unit: readyToShip.length === 1 ? 'order active' : 'orders active', tag: readyToShip.length ? 'Ready now' : 'None waiting', tagBg: readyToShip.length ? '#fde68a' : '#eef0f4', tagInk: readyToShip.length ? '#7c4a03' : '#6b7280', ink: '#16181d', sub: nextToShipText, cta: 'Open orders', href: '/admin/orders' },
    { k: 'Products out of stock', v: String(outOfStock.length), unit: 'SKUs unavailable', tag: `${outOfStockPct}% of catalog`, tagBg: outOfStock.length ? '#fee2e2' : '#eef0f4', tagInk: outOfStock.length ? '#991b1b' : '#6b7280', ink: outOfStock.length ? '#991b1b' : '#16181d', sub: 'Hidden from the partner catalog while they are unavailable.', cta: 'See restock list', href: '/admin/products' },
  ]
  const queueCount = pendingApps.length + proofSubmitted.length + readyToShip.length

  const soldTitle = range === 'This month' ? 'Sold this month' : range === 'Last 30 days' ? 'Sold last 30 days' : 'Sold all time'
  const soldSub = range === 'This month' ? `${currentMonth} · ${dayOfMonth} of ${daysInMonth} days elapsed` : range === 'Last 30 days' ? 'Rolling 30-day window' : `${completedOrders.length} orders total`
  const momPct = prevMonthRevenue > 0 ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : null

  const kpis = [
    { k: soldTitle, v: fmtMoney(rangeRevenue), sub: soldSub, delta: `${rangeOrders.length} order${rangeOrders.length !== 1 ? 's' : ''}`, dBg: rangeOrders.length ? '#dcfce7' : '#fee2e2', dInk: rangeOrders.length ? '#166534' : '#991b1b', ink: '#16181d', hasBar: false },
    { k: 'Sold since we opened', v: fmtMoney(totalRevenue), sub: `${completedOrders.length} orders · ${fmtMoney(completedOrders.length ? totalRevenue / completedOrders.length : 0)} average per order`, delta: momPct === null ? 'All-time' : `${momPct >= 0 ? '+' : ''}${momPct}% vs last month`, dBg: momPct === null || momPct >= 0 ? '#dcfce7' : '#fee2e2', dInk: momPct === null || momPct >= 0 ? '#166534' : '#991b1b', ink: '#16181d', hasBar: false },
    { k: 'Profit margin', v: fmtMargin(rangeMargin), sub: `We spent ${fmtMoney(rangeCost)} to sell ${fmtMoney(rangeRevenue)}. Target is ${marginAlertPct}%.`, delta: rangeRevenue === 0 ? 'No sales yet' : rangeMargin < marginAlertPct ? 'Below target' : 'Healthy margin', dBg: rangeRevenue > 0 && rangeMargin >= marginAlertPct ? '#dcfce7' : '#fee2e2', dInk: rangeRevenue > 0 && rangeMargin >= marginAlertPct ? '#166534' : '#991b1b', ink: rangeMargin < 0 ? '#991b1b' : '#16181d', hasBar: true, barW: `${Math.max(2, Math.min(100, rangeMargin))}%`, barC: rangeMargin < marginAlertPct ? '#dc2626' : '#16a34a' },
    { k: 'Approved partners', v: String(data.clients.length), sub: `${approvedThisMonth} approved this month · ${pendingApps.length} still waiting`, delta: approvedThisMonth > 0 ? `+${approvedThisMonth} this month` : 'None yet', dBg: approvedThisMonth > 0 ? '#dcfce7' : '#eef0f4', dInk: approvedThisMonth > 0 ? '#166534' : '#6b7280', ink: '#16181d', hasBar: false },
  ]

  const bars = monthlySeries.map((m, i) => {
    const last = i === monthlySeries.length - 1
    const pct = m.rev === 0 ? 2 : Math.max(4, Math.round((m.rev / peak) * 100))
    return { m: m.label, h: `${pct}%`, fill: m.rev === 0 ? '#e2e4e9' : last ? ACCENT : 'rgba(47,125,246,0.32)', label: m.rev === 0 ? '—' : `$${Math.round(m.rev / 1000)}k`, labelInk: last ? DEEP : '#6b7280', monthInk: last ? '#16181d' : '#8b909a', monthWeight: last ? 700 : 500 }
  })
  const chartFoot = [
    { k: 'Best month so far', v: `${fmtMoney(monthlySeries[bestIdx].rev)} in ${monthlySeries[bestIdx].label}`, ink: '#16181d' },
    { k: 'Monthly average (12mo)', v: fmtMoney(monthlySeries.reduce((s, m) => s + m.rev, 0) / 12), ink: '#16181d' },
    { k: 'Last month', v: fmtMoney(prevMonthRevenue), ink: '#16181d' },
    { k: 'This month so far', v: fmtMoney(monthRevenue), ink: monthRevenue === 0 ? '#991b1b' : '#16181d' },
  ]

  const pace = [
    { k: 'Days left this month', v: `${daysLeft} days`, ink: '#16181d' },
    { k: 'Sold so far', v: fmtMoney(monthRevenue), ink: '#16181d' },
    { k: 'Need to sell per day', v: fmtMoney(neededDailyPace), ink: DEEP },
    { k: 'Where we will land at this pace', v: fmtMoney(projectedRevenue), ink: projectedRevenue >= revenueGoal ? '#166534' : '#991b1b' },
  ]

  const cats = categoryEntries.map(([k, v], i) => ({ k, v: fmtMoney(v), w: `${Math.round((v / catMax) * 100)}%`, fill: `rgba(47,125,246,${Math.max(0.14, 1 - i * 0.18)})` }))

  const orders = data.orders.slice(0, 5).map(o => {
    const st = ORDER_LABEL[o.status] || ORDER_LABEL.new
    const c = clientFor(o)
    return { id: o.id, num: o.order_number, date: fmtDateTime(o.submitted_at), client: c?.business_name || '—', total: fmtMoney(o.total), amtInk: o.status === 'cancelled' ? '#8b909a' : '#16181d', status: st.label, stBg: st.bg, stInk: st.ink }
  })

  const apps = pendingApps.slice(0, 4).map(a => {
    const days = Math.floor(hoursSince(a.created_at) / 24)
    return { id: a.id, biz: a.business_name, who: `${a.contact_name || '—'}${a.address ? ' · ' + a.address : ''}`, age: days <= 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`, ageInk: hoursSince(a.created_at) > 48 ? '#991b1b' : '#8b909a' }
  })

  const shellCols = sidebarOpen ? 'clamp(226px, 18vw, 262px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .adb-shell { display:grid; grid-template-columns:${shellCols}; align-items:start; }
        .adb-chart-cols { display:grid; grid-template-columns: minmax(0,1.85fr) minmax(0,1fr); gap:clamp(12px,1.4vw,16px); align-items:start; }
        .adb-list-cols { display:grid; grid-template-columns: minmax(0,1.35fr) minmax(0,1fr); gap:clamp(12px,1.4vw,16px); align-items:start; }
        @media(max-width:960px){ .adb-chart-cols, .adb-list-cols { grid-template-columns:1fr !important; } }
        @media(max-width:860px){ .adb-shell { grid-template-columns:1fr !important; } .adb-sidebar { position:relative !important; max-height:none !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="adb-shell">
        {/* SIDEBAR */}
        <div data-scroll className="adb-sidebar" style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#ffffff', borderRight: '1px solid #e2e4e9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', gap: 12, padding: '16px 14px 17px', borderBottom: '1px solid #e2e4e9' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 8, background: '#16181d' }}><img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width: 20, height: 'auto' }} /></span>
              {sidebarOpen && (
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.015em', whiteSpace: 'nowrap' }}>Levam Corp</span>
                  <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#6b7280', whiteSpace: 'nowrap' }}>Admin console</span>
                </span>
              )}
            </span>
            {sidebarOpen && (
              <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Collapse menu" title="Collapse menu" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', cursor: 'pointer', width: 32, height: 32, display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#47505e' }}>‹</button>
            )}
          </div>
          {!sidebarOpen && (
            <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Expand menu" title="Expand menu" style={{ border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', cursor: 'pointer', width: 38, height: 34, display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#47505e' }}>›</button>
            </div>
          )}
          <div style={{ padding: '14px 10px 20px' }}>
            {navGroups.map(g => (
              <div key={g.label} style={{ paddingBottom: 18 }}>
                {sidebarOpen ? (
                  <div style={{ padding: '0 8px 8px', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9aa0aa', whiteSpace: 'nowrap' }}>{g.label}</div>
                ) : (
                  <div style={{ margin: '0 8px 10px', height: 1, background: '#e8eaee' }} />
                )}
                {g.items.map(n => (
                  <Link key={n.label} href={n.href} title={n.badge ? `${n.label} · ${n.badge}` : n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarOpen ? 'space-between' : 'center', gap: 11, padding: sidebarOpen ? '9px 10px' : '9px 0', marginBottom: 3, borderRadius: 8, background: n.bg, color: n.ink, fontSize: 15, fontWeight: n.weight, letterSpacing: '-.01em', position: 'relative' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 6, background: n.iconBg, color: n.iconInk, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 11 }}>{n.code}</span>
                      {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{n.label}</span>}
                    </span>
                    {sidebarOpen && n.badge && <span style={{ flex: 'none', fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 700, padding: '3px 7px 4px', borderRadius: 5, background: n.badgeBg, color: n.badgeInk }}>{n.badge}</span>}
                    {n.collapsedDot && <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: '#dc2626', border: '2px solid #ffffff' }} />}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Dashboard</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>Everything happening right now</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 11px 7px', border: '1px solid #d9dce2', borderRadius: 999, fontSize: 13, color: '#47505e' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#16a34a' }} />All systems operational
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflow: 'hidden', background: '#f7f8fa' }}>
                {RANGES.map(r => (
                  <button key={r} type="button" onClick={() => setRange(r)} aria-pressed={range === r} style={{ border: 0, cursor: 'pointer', padding: '9px 15px 10px', background: range === r ? '#ffffff' : 'transparent', color: range === r ? '#16181d' : '#6b7280', fontSize: 14, fontWeight: range === r ? 700 : 500 }}>{r}</button>
                ))}
              </span>
              <span style={{ fontSize: 13, color: '#8b909a' }}>{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              <button onClick={handleLogout} style={{ padding: '9px 14px 10px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: 'transparent', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,24px) clamp(14px,2.4vw,28px) clamp(44px,6vh,70px)', display: 'flex', flexDirection: 'column', gap: 'clamp(16px,2vw,22px)' }}>

            {/* NEEDS YOUR ATTENTION */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', padding: '15px 18px 16px', borderBottom: '1px solid #e2e4e9', background: '#fffbf2' }}>
                <span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 19, fontWeight: 700, letterSpacing: '-.02em' }}>
                    <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#f59e0b' }} />
                    Needs your attention
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, padding: '3px 9px 4px', borderRadius: 999, background: '#fde68a', color: '#7c4a03' }}>{queueCount} thing{queueCount !== 1 ? 's' : ''} to do</span>
                  </span>
                  <span style={{ display: 'block', paddingTop: 6, fontSize: 14, color: '#6b7280' }}>Each box below is blocking money or a partner. Click one to go fix it.</span>
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(272px, 1fr))' }}>
                {queue.map(q => (
                  <Link key={q.k} href={q.href} style={{ display: 'block', padding: '16px 18px 17px', borderRight: '1px solid #eceef2', borderBottom: '1px solid #eceef2', background: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', color: '#16181d' }}>{q.k}</span>
                      <span className="lc-mono" style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: q.tagBg, color: q.tagInk }}>{q.tag}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, paddingTop: 11 }}>
                      <span className="lc-mono" style={{ fontWeight: 700, fontSize: 34, letterSpacing: '-.035em', color: q.ink }}>{q.v}</span>
                      <span style={{ fontSize: 15, color: '#47505e' }}>{q.unit}</span>
                    </div>
                    <div style={{ paddingTop: 9, fontSize: 14, lineHeight: 1.5, color: '#47505e' }}>{q.sub}</div>
                    <div style={{ paddingTop: 12, fontSize: 14.5, fontWeight: 700, color: DEEP }}>{q.cta} →</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* BUSINESS HEALTH */}
            <div>
              <div style={{ paddingBottom: 11 }}>
                <span style={{ display: 'block', fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>Business health</span>
                <span style={{ display: 'block', paddingTop: 4, fontSize: 14, color: '#6b7280' }}>The four numbers that tell you if the business is working</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(232px, 1fr))', gap: 'clamp(12px,1.4vw,16px)' }}>
                {kpis.map(k => (
                  <div key={k.k} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '16px 17px 17px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', color: '#16181d' }}>{k.k}</span>
                      <span className="lc-mono" style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: k.dBg, color: k.dInk }}>{k.delta}</span>
                    </div>
                    <div className="lc-mono" style={{ paddingTop: 11, fontWeight: 700, fontSize: 'clamp(28px,2.6vw,36px)', letterSpacing: '-.04em', color: k.ink }}>{k.v}</div>
                    <div style={{ paddingTop: 8, fontSize: 14, lineHeight: 1.45, color: '#6b7280' }}>{k.sub}</div>
                    {k.hasBar && (
                      <div style={{ marginTop: 12, height: 7, borderRadius: 4, background: '#eceef2', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: k.barW, background: k.barC }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CHART + GOAL/CATEGORY */}
            <div className="adb-chart-cols">
              <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', padding: '16px 18px 17px', borderBottom: '1px solid #e2e4e9' }}>
                  <span>
                    <span style={{ display: 'block', fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>How much we sold each month</span>
                    <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>Last 12 months of revenue · {currentMonth} is still in progress</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: 'rgba(47,125,246,0.32)' }} />Past months</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: ACCENT }} />This month</span>
                  </span>
                </div>
                <div style={{ padding: '18px 18px 8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(5px,.9vw,12px)', height: 'clamp(180px,24vh,236px)', borderBottom: '1px solid #e2e4e9' }}>
                    {bars.map(b => (
                      <div key={b.m + b.label} style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', height: '100%', gap: 7 }}>
                        <span className="lc-mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-.02em', color: b.labelInk }}>{b.label}</span>
                        <div style={{ width: '100%', maxWidth: 46, borderRadius: '4px 4px 0 0', height: b.h, background: b.fill }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 'clamp(5px,.9vw,12px)', paddingTop: 9 }}>
                    {bars.map((b, i) => <span key={i} style={{ flex: '1 1 0', textAlign: 'center', fontSize: 13, fontWeight: b.monthWeight, color: b.monthInk }}>{b.m}</span>)}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(168px, 1fr))', borderTop: '1px solid #e2e4e9' }}>
                  {chartFoot.map(f => (
                    <div key={f.k} style={{ padding: '13px 18px 15px', borderRight: '1px solid #eceef2' }}>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{f.k}</div>
                      <div className="lc-mono" style={{ paddingTop: 6, fontWeight: 700, fontSize: 19, letterSpacing: '-.03em', color: f.ink }}>{f.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.4vw,16px)' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12 }}>
                  <div style={{ padding: '16px 18px 17px', borderBottom: '1px solid #e2e4e9' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>This month's goal</span>
                      <button type="button" onClick={() => setShowGoalModal(true)} title="Edit monthly goal" className="lc-mono" style={{ cursor: 'pointer', border: 'none', fontSize: 13, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: goalPct >= 100 ? '#dcfce7' : '#fee2e2', color: goalPct >= 100 ? '#166534' : '#991b1b' }}>{Math.round(goalPct)}% reached ✎</button>
                    </span>
                    <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>How close {currentMonth} is to the target</span>
                  </div>
                  <div style={{ padding: '16px 18px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                      <span className="lc-mono" style={{ fontWeight: 700, fontSize: 30, letterSpacing: '-.035em' }}>{fmtMoney(monthRevenue)}</span>
                      <span style={{ fontSize: 15, color: '#47505e' }}>of {fmtMoney(revenueGoal)}</span>
                    </div>
                    <div style={{ marginTop: 13, height: 10, borderRadius: 5, background: '#eceef2', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.max(1, Math.min(100, goalPct))}%`, background: ACCENT }} />
                    </div>
                    {pace.map(p => (
                      <div key={p.k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '11px 0 12px', borderBottom: '1px solid #eceef2' }}>
                        <span style={{ fontSize: 14, color: '#47505e' }}>{p.k}</span>
                        <span className="lc-mono" style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-.02em', color: p.ink }}>{p.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12 }}>
                  <div style={{ padding: '16px 18px 17px', borderBottom: '1px solid #e2e4e9' }}>
                    <span style={{ display: 'block', fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>What sells the most</span>
                    <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>All-time revenue split by product category</span>
                  </div>
                  <div style={{ padding: '16px 18px 18px' }}>
                    {cats.length === 0 ? (
                      <div style={{ fontSize: 13, color: '#8b909a', textAlign: 'center', padding: '1rem 0' }}>No completed sales yet</div>
                    ) : cats.map(c => (
                      <div key={c.k} style={{ paddingBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingBottom: 6 }}>
                          <span style={{ fontSize: 14.5, color: '#16181d' }}>{c.k}</span>
                          <span className="lc-mono" style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.02em', color: '#16181d' }}>{c.v}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: '#eceef2', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: c.w, background: c.fill }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ paddingTop: 2, fontSize: 13.5, color: '#8b909a' }}>{data.products.length} SKU{data.products.length !== 1 ? 's' : ''}{distinctBrands ? ` across ${distinctBrands} brand${distinctBrands !== 1 ? 's' : ''}` : ''}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* LATEST ORDERS + APPLICATIONS/ALERTS */}
            <div className="adb-list-cols">
              <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '16px 18px 17px', borderBottom: '1px solid #e2e4e9' }}>
                  <span>
                    <span style={{ display: 'block', fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>Latest orders</span>
                    <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>The five most recent orders and where each one stands</span>
                  </span>
                  <Link href="/admin/orders" style={{ fontSize: 14.5, fontWeight: 700, color: DEEP }}>See all {data.orders.length} orders →</Link>
                </div>
                <div data-scroll style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: 620 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '178px minmax(0,1fr) 112px 132px', gap: 12, padding: '11px 18px 12px', borderBottom: '1px solid #eceef2', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                      <span>Order number</span><span>Client</span><span style={{ textAlign: 'right' }}>Amount</span><span style={{ textAlign: 'right' }}>Status</span>
                    </div>
                    {orders.length === 0 ? (
                      <div style={{ padding: '2rem 18px', fontSize: 13, color: '#8b909a', textAlign: 'center' }}>No orders yet</div>
                    ) : orders.map(o => (
                      <Link key={o.id} href="/admin/orders" style={{ display: 'grid', gridTemplateColumns: '178px minmax(0,1fr) 112px 132px', gap: 12, alignItems: 'center', padding: '14px 18px 15px', borderBottom: '1px solid #f1f2f5', cursor: 'pointer' }}>
                        <span>
                          <span className="lc-mono" style={{ display: 'block', fontSize: 13, fontWeight: 700, letterSpacing: '-.02em', color: '#16181d' }}>{o.num}</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 12.5, color: '#8b909a' }}>{o.date}</span>
                        </span>
                        <span style={{ minWidth: 0, fontSize: 15, color: '#16181d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.client}</span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: o.amtInk }}>{o.total}</span>
                        <span style={{ textAlign: 'right' }}><span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: o.stBg, color: o.stInk }}>{o.status}</span></span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.4vw,16px)' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '16px 18px 17px', borderBottom: '1px solid #e2e4e9' }}>
                    <span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>
                        New partner applications
                        {pendingApps.length > 0 && <span style={{ fontSize: 12.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: '#fde68a', color: '#7c4a03' }}>{pendingApps.length} waiting</span>}
                      </span>
                      <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>Businesses asking for wholesale access</span>
                    </span>
                  </div>
                  {apps.length === 0 ? (
                    <div style={{ padding: '1.5rem', fontSize: 13, color: '#8b909a', textAlign: 'center' }}>No pending applications</div>
                  ) : apps.map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 18px 15px', borderBottom: '1px solid #f1f2f5' }}>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.biz}</span>
                        <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.who}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: a.ageInk }}>{a.age}</span>
                        <Link href="/admin/applications" style={{ padding: '8px 13px 9px', borderRadius: 7, background: '#eef0f4', color: DEEP, fontSize: 14, fontWeight: 700 }}>Review</Link>
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12 }}>
                  <div style={{ padding: '16px 18px 17px', borderBottom: '1px solid #e2e4e9' }}>
                    <span style={{ display: 'block', fontSize: 18, fontWeight: 700, letterSpacing: '-.02em' }}>Problems to watch</span>
                    <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>Things that are quietly costing you sales</span>
                  </div>
                  {alerts.length === 0 ? (
                    <div style={{ padding: '1.5rem', fontSize: 13, color: '#166534', textAlign: 'center' }}>Nothing to flag — all metrics look healthy.</div>
                  ) : alerts.map((al, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '10px minmax(0,1fr)', gap: 12, alignItems: 'start', padding: '14px 18px 15px', borderBottom: '1px solid #f1f2f5' }}>
                      <span style={{ width: 9, height: 9, marginTop: 6, borderRadius: '50%', background: al.dot }} />
                      <span>
                        <span style={{ display: 'block', fontSize: 14.5, lineHeight: 1.5, color: '#16181d' }}>{al.t}</span>
                        <Link href={al.href} style={{ display: 'inline-block', paddingTop: 7, fontSize: 14, fontWeight: 700, color: DEEP }}>{al.cta} →</Link>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GOAL SETTINGS MODAL */}
      {showGoalModal && (
        <div onClick={() => setShowGoalModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(22,24,29,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 380, background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#16181d', marginBottom: 4 }}>Edit monthly goal</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: '1.25rem' }}>Used for the goal bar, projection and margin alerts.</div>

            <label style={{ fontSize: 11, color: '#6b7280', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Monthly revenue goal (USD)</label>
            <input type="number" value={goalForm.revenue_goal} onChange={e => setGoalForm(f => ({ ...f, revenue_goal: e.target.value }))}
              style={{ width: '100%', background: '#f7f8fa', border: '1px solid #d9dce2', color: '#16181d', fontSize: 13, padding: '10px 12px', borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }} />

            <label style={{ fontSize: 11, color: '#6b7280', letterSpacing: '.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Margin alert threshold (%)</label>
            <input type="number" value={goalForm.margin_alert_pct} onChange={e => setGoalForm(f => ({ ...f, margin_alert_pct: e.target.value }))}
              style={{ width: '100%', background: '#f7f8fa', border: '1px solid #d9dce2', color: '#16181d', fontSize: 13, padding: '10px 12px', borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 18 }} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowGoalModal(false)} style={{ flex: 1, padding: 11, background: '#f7f8fa', color: '#47505e', fontSize: 12, fontWeight: 700, border: '1px solid #d9dce2', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveGoal} disabled={savingGoal} style={{ flex: 1, padding: 11, background: savingGoal ? '#9aa0aa' : ACCENT, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6, cursor: savingGoal ? 'not-allowed' : 'pointer' }}>{savingGoal ? 'Saving…' : 'Save goal'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
