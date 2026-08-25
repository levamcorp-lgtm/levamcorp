'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Chart from 'chart.js/auto'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'
const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const EXPENSE_CATS = ['Rent/Storage','Shipping & Logistics','Marketing','Software & Tools','Utilities','Office','Travel','Legal & Accounting','Other']
const DEFAULT_GOAL = 100000
const DEFAULT_MARGIN_ALERT = 15

const NAV_LINKS = [['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart'],['Offers','/admin/offers'],['Recruit','/admin/recruit'],['Analytics','/admin/insights']]

const STATUS = {
  new:        { color: '#2F7DF6', label: 'New' },
  review:     { color: '#F2A93B', label: 'Review' },
  confirmed:  { color: '#8B7CF6', label: 'Confirmed' },
  dispatched: { color: '#12B76A', label: 'Dispatched' },
  completed:  { color: '#12B76A', label: 'Done' },
  cancelled:  { color: '#EF4444', label: 'Cancelled' },
}

const CATEGORY_COLOR = ['#2F7DF6', '#8B7CF6', '#12B76A', '#F2A93B', '#E8B657', '#EF4444']

function AdminNav({ active, newOrders, unreadMessages, pendingApps, onLogout, now }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 2rem', background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(240,244,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, border: '1.5px solid rgba(47,125,246,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(47,125,246,0.06)' }}>
            <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width: 15, height: 'auto' }} />
          </div>
          <div>
            <div className="lc-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>LEVAM<span style={{ color: '#2F7DF6' }}>CORP</span></div>
            <div className="lc-mono" style={{ fontSize: 7, color: 'rgba(154,172,201,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Mission control</div>
          </div>
        </div>
        <div style={{ display: 'flex', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 20, gap: 2, flexWrap: 'wrap' }}>
          {NAV_LINKS.map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 11.5, fontWeight: 600, color: label === active ? '#fff' : 'rgba(154,172,201,0.6)', textDecoration: 'none', padding: '5px 10px', borderRadius: 5, position: 'relative', background: label === active ? 'rgba(47,125,246,0.12)' : 'transparent', transition: 'color 0.15s,background 0.15s' }}>
              {label}
              {label === 'Orders' && newOrders > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, background: '#EF4444', borderRadius: '50%', boxShadow: '0 0 6px #EF4444' }} />}
              {label === 'Messages' && unreadMessages > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, background: '#EF4444', borderRadius: '50%', boxShadow: '0 0 6px #EF4444' }} />}
              {label === 'Applications' && pendingApps > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, background: '#EF4444', borderRadius: '50%', boxShadow: '0 0 6px #EF4444' }} />}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="lc-mono">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#12B76A', boxShadow: '0 0 6px #12B76A' }} />
          <span style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)' }}>{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <button onClick={onLogout} style={{ fontSize: 11, color: 'rgba(154,172,201,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </div>
    </nav>
  )
}

function Panel({ title, icon, accent = '#2F7DF6', href, linkLabel = 'Manage →', alert, children }) {
  return (
    <div style={{ background: 'rgba(17,26,46,0.55)', backdropFilter: 'blur(16px)', border: `1px solid ${alert ? accent + '40' : 'rgba(240,244,255,0.07)'}`, borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${accent}60,transparent)` }} />
      <div style={{ padding: '0.8rem 1.1rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(240,244,255,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, display: 'flex', alignItems: 'center', gap: 6 }}>{icon} {title}</div>
        {href && <Link href={href} style={{ fontSize: 9.5, color: 'rgba(154,172,201,0.5)', textDecoration: 'none' }}>{linkLabel}</Link>}
      </div>
      {children}
    </div>
  )
}

const Row = ({ label, val, color = '#9AACC9' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: '1px solid rgba(240,244,255,0.04)' }}>
    <span style={{ fontSize: 11, color: 'rgba(154,172,201,0.6)' }}>{label}</span>
    <span className="lc-mono" style={{ fontSize: 12, fontWeight: 700, color }}>{val}</span>
  </div>
)

// Circular goal-progress ring, built with a conic-gradient — no chart lib needed for this one.
function GoalRing({ pct, color }) {
  const clamped = Math.max(0, Math.min(100, pct))
  return (
    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `conic-gradient(${color} ${clamped * 3.6}deg, rgba(255,255,255,0.08) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#111A2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, color }}>{Math.round(pct)}%</span>
      </div>
    </div>
  )
}

// Large hero KPI tile for the executive row
function KpiTile({ label, value, sub, color, ring }) {
  return (
    <div style={{ background: 'rgba(17,26,46,0.65)', backdropFilter: 'blur(16px)', border: `1px solid ${color}30`, borderRadius: 14, padding: '1.25rem 1.4rem', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${color}70,transparent)` }} />
      <div style={{ position: 'absolute', bottom: -30, right: -30, width: 110, height: 110, background: `radial-gradient(circle,${color}22 0%,transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
        <div className="lc-display" style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 10.5, color, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
      </div>
      {ring !== undefined && <GoalRing pct={ring} color={color} />}
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState({
    orders: [], clients: [], applications: [], products: [],
    payments: [], messages: [], investments: [], expenses: []
  })
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalForm, setGoalForm] = useState({ revenue_goal: DEFAULT_GOAL, margin_alert_pct: DEFAULT_MARGIN_ALERT })
  const [savingGoal, setSavingGoal] = useState(false)

  const [expenseForm, setExpenseForm] = useState({ description: '', category: EXPENSE_CATS[0], amount: '' })
  const [savingExpense, setSavingExpense] = useState(false)

  const barCanvasRef = useRef(null)
  const donutCanvasRef = useRef(null)
  const chartsRef = useRef({ bar: null, donut: null })

  const now = new Date()
  const currentMonth = now.toLocaleString('en-US', { month: 'long' })
  const currentYear = now.getFullYear()
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const fmtMoney = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: authData }) => {
      if (!authData.user || authData.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      const [
        { data: orders }, { data: clients }, { data: applications },
        { data: products }, { data: payments }, { data: messages },
        { data: investments }, { data: expenses }, { data: settingsRows }
      ] = await Promise.all([
        supabase.from('orders').select('*, order_items(*, products(cost_price, category))').order('submitted_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name'),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('partner_investments').select('*'),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
        supabase.from('dashboard_settings').select('*').eq('id', 1).maybeSingle(),
      ])
      setData({ orders: orders||[], clients: clients||[], applications: applications||[], products: products||[], payments: payments||[], messages: messages||[], investments: investments||[], expenses: expenses||[] })
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

  const addExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) return
    setSavingExpense(true)
    const row = { date: new Date().toISOString().slice(0,10), category: expenseForm.category, description: expenseForm.description, amount: parseFloat(expenseForm.amount) || 0, paid_by: 'company' }
    const { data: inserted } = await createClient().from('expenses').insert([row]).select()
    if (inserted) setData(d => ({ ...d, expenses: [...inserted, ...d.expenses] }))
    setExpenseForm({ description: '', category: EXPENSE_CATS[0], amount: '' })
    setSavingExpense(false)
  }

  const deleteExpense = async (id) => {
    await createClient().from('expenses').delete().eq('id', id)
    setData(d => ({ ...d, expenses: d.expenses.filter(e => e.id !== id) }))
  }

  // ── Calculations ──────────────────────────────────────────────────────────
  const completedOrders = data.orders.filter(o => ['confirmed','dispatched','completed'].includes(o.status))
  const newOrders = data.orders.filter(o => o.status === 'new')
  const activeOrders = data.orders.filter(o => ['review','confirmed','dispatched'].includes(o.status))
  const pendingApps = data.applications.filter(a => a.status === 'pending' || !a.status)
  const unreadMessages = data.messages.filter(m => m.status === 'new')
  const pendingPayments = data.payments.filter(p => p.status === 'requested')
  const proofSubmitted = data.payments.filter(p => p.status === 'processing')
  const outOfStock = data.products.filter(p => p.stock === 0)
  const lowStock = data.products.filter(p => p.stock > 0 && p.stock <= 5)

  const totalRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0)
  const calcCost = (order) => (order.order_items || []).reduce((s, i) => s + ((i.products?.cost_price || 0) * i.quantity), 0)
  const totalCost = completedOrders.reduce((s, o) => s + calcCost(o), 0)
  const totalProfit = totalRevenue - totalCost

  const monthOrders = completedOrders.filter(o => {
    const d = new Date(o.submitted_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === currentYear
  })
  const monthRevenue = monthOrders.reduce((s, o) => s + (o.total || 0), 0)
  const monthCost = monthOrders.reduce((s, o) => s + calcCost(o), 0)
  const monthProfit = monthRevenue - monthCost
  const monthMargin = monthRevenue > 0 ? (monthProfit / monthRevenue) * 100 : 0

  const currentInvestments = data.investments.filter(i => i.month === currentMonth && i.year === currentYear)
  const victorInvested = currentInvestments.filter(i => i.partner_name === 'Victor').reduce((s, i) => s + i.amount, 0)
  const leopoldoInvested = currentInvestments.filter(i => i.partner_name === 'Leopoldo').reduce((s, i) => s + i.amount, 0)
  const totalInvested = victorInvested + leopoldoInvested
  const victorShare = totalInvested > 0 ? victorInvested / totalInvested : 0.5
  const leopoldoShare = totalInvested > 0 ? leopoldoInvested / totalInvested : 0.5

  // Goal, pacing & projection
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

  // Last 12 months revenue series (for the bar+target chart)
  const monthlySeries = Array.from({ length: 12 }, (_, i) => {
    const idx = 11 - i
    const d = new Date(currentYear, now.getMonth() - idx, 1)
    const rev = completedOrders.filter(o => {
      const od = new Date(o.submitted_at)
      return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear()
    }).reduce((s, o) => s + (o.total || 0), 0)
    return { label: d.toLocaleString('en-US', { month: 'short' }), rev }
  })

  // Revenue by product category, this month
  const categoryRevenue = {}
  monthOrders.forEach(o => (o.order_items || []).forEach(item => {
    const cat = item.products?.category || 'Other'
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.unit_price || 0) * (item.quantity || 0)
  }))
  const categoryEntries = Object.entries(categoryRevenue).sort((a, b) => b[1] - a[1])

  // Expenses — current & prior month, from the same table the Profit page manages
  const currentMonthKey = now.toISOString().slice(0, 7)
  const priorMonthKey = new Date(currentYear, now.getMonth() - 1, 1).toISOString().slice(0, 7)
  const currentExpenses = data.expenses.filter(e => e.date?.startsWith(currentMonthKey))
  const priorExpenses = data.expenses.filter(e => e.date?.startsWith(priorMonthKey))
  const totalExpensesMonth = currentExpenses.reduce((s, e) => s + (e.amount || 0), 0)
  const expenseByCatCurrent = {}
  currentExpenses.forEach(e => { expenseByCatCurrent[e.category] = (expenseByCatCurrent[e.category] || 0) + (e.amount || 0) })
  const expenseByCatPrior = {}
  priorExpenses.forEach(e => { expenseByCatPrior[e.category] = (expenseByCatPrior[e.category] || 0) + (e.amount || 0) })
  const expenseGrowthAlerts = Object.keys(expenseByCatCurrent)
    .filter(cat => expenseByCatPrior[cat] > 0 && ((expenseByCatCurrent[cat] - expenseByCatPrior[cat]) / expenseByCatPrior[cat]) * 100 > 20)
    .map(cat => ({ cat, growth: ((expenseByCatCurrent[cat] - expenseByCatPrior[cat]) / expenseByCatPrior[cat]) * 100 }))

  // Alerts
  const alerts = []
  if (monthRevenue > 0 && monthMargin < marginAlertPct) {
    alerts.push({ color: '#EF4444', icon: IC.alert, text: `Margin is ${monthMargin.toFixed(1)}%, below your ${marginAlertPct}% alert threshold.` })
  }
  if (dayOfMonth >= 5 && projectedRevenue < revenueGoal) {
    alerts.push({ color: '#F2A93B', icon: IC.trend, text: `At the current pace you'll close the month at ${fmtMoney(projectedRevenue)}, ${fmtMoney(revenueGoal - projectedRevenue)} short of your ${fmtMoney(revenueGoal)} goal.` })
  }
  expenseGrowthAlerts.forEach(({ cat, growth }) => {
    alerts.push({ color: '#F2A93B', icon: IC.trend, text: `"${cat}" expenses are up ${growth.toFixed(0)}% vs last month (${fmtMoney(expenseByCatCurrent[cat])} vs ${fmtMoney(expenseByCatPrior[cat])}).` })
  })
  if (outOfStock.length > 0) {
    alerts.push({ color: '#EF4444', icon: IC.box, text: `${outOfStock.length} product${outOfStock.length>1?'s':''} out of stock — may be limiting sales.` })
  }

  // ── Charts ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !barCanvasRef.current || !donutCanvasRef.current) return

    chartsRef.current.bar?.destroy()
    chartsRef.current.bar = new Chart(barCanvasRef.current, {
      data: {
        labels: monthlySeries.map(m => m.label),
        datasets: [
          {
            type: 'bar',
            label: 'Revenue',
            data: monthlySeries.map(m => m.rev),
            backgroundColor: monthlySeries.map((_, i) => i === 11 ? 'rgba(47,125,246,0.85)' : 'rgba(47,125,246,0.35)'),
            borderRadius: 4,
            maxBarThickness: 28,
          },
          {
            type: 'line',
            label: 'Goal',
            data: monthlySeries.map(() => revenueGoal),
            borderColor: '#E8B657',
            borderDash: [6, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111A2E', borderColor: 'rgba(240,244,255,0.1)', borderWidth: 1,
            titleColor: '#fff', bodyColor: '#9AACC9', padding: 10, displayColors: false,
            callbacks: { label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: 'rgba(154,172,201,0.6)', font: { size: 10 } } },
          y: { grid: { color: 'rgba(240,244,255,0.05)' }, ticks: { color: 'rgba(154,172,201,0.5)', font: { size: 9 }, callback: (v) => `$${(v/1000)}k` } },
        },
      },
    })

    chartsRef.current.donut?.destroy()
    chartsRef.current.donut = new Chart(donutCanvasRef.current, {
      type: 'doughnut',
      data: {
        labels: categoryEntries.map(([cat]) => cat),
        datasets: [{
          data: categoryEntries.map(([, v]) => v),
          backgroundColor: categoryEntries.map((_, i) => CATEGORY_COLOR[i % CATEGORY_COLOR.length]),
          borderColor: '#111A2E',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(154,172,201,0.7)', font: { size: 10 }, boxWidth: 8, padding: 10 } },
          tooltip: {
            backgroundColor: '#111A2E', borderColor: 'rgba(240,244,255,0.1)', borderWidth: 1,
            titleColor: '#fff', bodyColor: '#9AACC9', padding: 10, displayColors: false,
            callbacks: { label: (ctx) => `${ctx.label}: $${ctx.parsed.toLocaleString()}` },
          },
        },
      },
    })

    return () => { chartsRef.current.bar?.destroy(); chartsRef.current.donut?.destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, settings, data.orders])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#05070C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",-apple-system,sans-serif' }}>
      <style>{`@keyframes pulseDot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, margin: '0 auto 16px', borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(47,125,246,0.15)', borderTopColor: '#2F7DF6', borderRadius: '50%', animation: 'pulseDot 1s linear infinite' }} />
        <div style={{ fontSize: 11, color: 'rgba(154,172,201,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading command center…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#05070C', minHeight: '100vh', fontFamily: '"Inter",-apple-system,sans-serif', color: '#F0F4FF' }}>
      <style>{`
        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.01em; }
        .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; font-variant-numeric: tabular-nums; }
        @keyframes pulseDot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        a:hover { color: #fff !important; }
        input:focus, select:focus { outline: none; border-color: rgba(47,125,246,0.5) !important; }
      `}</style>

      <AdminNav active="Dashboard" newOrders={newOrders.length} unreadMessages={unreadMessages.length} pendingApps={pendingApps.length} onLogout={handleLogout} now={now} />

      {/* SYSTEM STATUS TICKER */}
      <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '7px 2rem', background: 'rgba(47,125,246,0.04)', borderBottom: '1px solid rgba(47,125,246,0.1)', fontSize: 9.5, color: 'rgba(154,172,201,0.55)', letterSpacing: '0.06em', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: '50%', background: '#12B76A', boxShadow: '0 0 5px #12B76A', animation: 'pulseDot 2s infinite' }} />ALL SYSTEMS OPERATIONAL</span>
        <span>ORDERS: {data.orders.length}</span>
        <span>CLIENTS: {data.clients.length}</span>
        <span>PRODUCTS: {data.products.length}</span>
        <span style={{ color: '#12B76A' }}>REVENUE: {fmtMoney(totalRevenue)}</span>
        <span style={{ color: monthMargin < marginAlertPct ? '#EF4444' : '#12B76A' }}>MARGIN: {monthMargin.toFixed(1)}%</span>
        {newOrders.length > 0 && <span style={{ color: '#EF4444' }}>⚠ {newOrders.length} ORDER{newOrders.length>1?'S':''} AWAITING REVIEW</span>}
        {pendingApps.length > 0 && <span style={{ color: '#F2A93B' }}>⚠ {pendingApps.length} APPLICATION{pendingApps.length>1?'S':''} PENDING</span>}
      </div>

      {/* HERO HEADER */}
      <div style={{ position: 'relative', padding: '2.25rem 2rem 1.5rem', borderBottom: '1px solid rgba(240,244,255,0.05)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(47,125,246,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '15%', width: 360, height: 360, background: 'radial-gradient(circle,rgba(139,124,246,0.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2F7DF6', fontWeight: 700, marginBottom: 8 }}>Command center</div>
            <h1 className="lc-display" style={{ fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 5, letterSpacing: '-0.02em' }}>Good {now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, Levam Corp</h1>
            <p style={{ fontSize: 13, color: 'rgba(154,172,201,0.6)' }}>{currentMonth} {currentYear} · Here is everything happening right now</p>
          </div>
          <button onClick={() => setShowGoalModal(true)} style={{ fontSize: 11, fontWeight: 700, color: '#E8B657', background: 'rgba(232,182,87,0.08)', border: '1px solid rgba(232,182,87,0.25)', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {IC.target} Edit monthly goal
          </button>
        </div>

        {/* EXECUTIVE KPI ROW */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
          <KpiTile label="Revenue this month" value={fmtMoney(monthRevenue)} sub={`${fmtMoney(totalRevenue)} all-time`} color="#2F7DF6" />
          <KpiTile label="Net profit this month" value={fmtMoney(monthProfit)} sub={monthProfit >= 0 ? 'Profitable' : 'Loss this month'} color={monthProfit >= 0 ? '#12B76A' : '#EF4444'} />
          <KpiTile label="Margin" value={`${monthMargin.toFixed(1)}%`} sub={monthMargin < marginAlertPct ? `Below ${marginAlertPct}% target` : 'Healthy margin'} color={monthMargin < marginAlertPct ? '#EF4444' : '#12B76A'} />
          <KpiTile label="Goal completion" value={fmtMoney(revenueGoal)} sub={`${fmtMoney(remainingToGoal)} to go · ${daysLeft}d left`} color="#E8B657" ring={goalPct} />
        </div>

        {/* TOP STATS — operational */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10 }}>
          {[
            { label: 'New orders', value: newOrders.length, color: '#EF4444', icon: IC.inbox, href: '/admin/orders', alert: newOrders.length > 0 },
            { label: 'Active orders', value: activeOrders.length, color: '#F2A93B', icon: IC.clock, href: '/admin/orders' },
            { label: 'Pending apps', value: pendingApps.length, color: '#EF4444', icon: IC.clipboard, href: '/admin/applications', alert: pendingApps.length > 0 },
            { label: 'Unread messages', value: unreadMessages.length, color: '#2F7DF6', icon: IC.mail, href: '/admin/messages', alert: unreadMessages.length > 0 },
            { label: 'Payment proofs', value: proofSubmitted.length, color: '#12B76A', icon: IC.card, href: '/admin/payments', alert: proofSubmitted.length > 0 },
            { label: 'Approved clients', value: data.clients.length, color: '#8B7CF6', icon: IC.users, href: '/admin/clients' },
            { label: 'Analytics', value: '→', color: '#E8B657', icon: IC.chart, href: '/admin/insights' },
          ].map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(17,26,46,0.6)', backdropFilter: 'blur(12px)', border: `1px solid ${s.alert ? s.color + '55' : 'rgba(240,244,255,0.07)'}`, borderRadius: 10, padding: '1rem', cursor: 'pointer', position: 'relative', transition: 'transform 0.15s, border-color 0.15s', boxShadow: s.alert ? `0 0 24px ${s.color}22` : 'none' }}>
                {s.alert && <span style={{ position: 'absolute', top: 10, right: 10, width: 7, height: 7, background: s.color, borderRadius: '50%', boxShadow: `0 0 8px ${s.color}`, animation: 'pulseDot 1.6s infinite' }} />}
                <div style={{ color: s.color, marginBottom: 10 }}>{s.icon}</div>
                <div className="lc-display" style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 8.5, color: 'rgba(154,172,201,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 12-MONTH REVENUE CHART */}
      <div style={{ padding: '1.5rem 2rem 0' }}>
        <Panel title="Revenue — last 12 months vs. goal" icon={IC.chart} accent="#2F7DF6">
          <div style={{ padding: '1.25rem 1.25rem 0.75rem', height: 260 }}>
            <canvas ref={barCanvasRef} />
          </div>
        </Panel>
      </div>

      {/* CATEGORY DONUT + GOAL CARD + ALERTS */}
      <div style={{ padding: '1rem 2rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <Panel title="Revenue by category" icon={IC.pie} accent="#8B7CF6">
          <div style={{ padding: '1rem 1rem 0.5rem', height: 220 }}>
            {categoryEntries.length > 0 ? <canvas ref={donutCanvasRef} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 11, color: 'rgba(154,172,201,0.4)' }}>No sales yet this month</div>}
          </div>
        </Panel>

        <Panel title="Monthly goal" icon={IC.target} accent="#E8B657">
          <div style={{ padding: '1.1rem 1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Remaining to goal</div>
                <div className="lc-display" style={{ fontSize: 22, fontWeight: 700, color: '#E8B657' }}>{fmtMoney(remainingToGoal)}</div>
              </div>
              <GoalRing pct={goalPct} color="#E8B657" />
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 12 }}>
              <div style={{ height: '100%', width: `${Math.min(100, goalPct)}%`, background: 'linear-gradient(90deg,#E8B657,#F2A93B)', borderRadius: 3, boxShadow: '0 0 8px rgba(232,182,87,0.6)' }} />
            </div>
            <Row label="Days left in month" val={daysLeft} />
            <Row label="Current daily pace" val={fmtMoney(dailyPace)} color="#2F7DF6" />
            <Row label="Projected month end" val={fmtMoney(projectedRevenue)} color={projectedRevenue >= revenueGoal ? '#12B76A' : '#F2A93B'} />
            <Row label="Daily pace needed" val={fmtMoney(neededDailyPace)} color="#E8B657" />
          </div>
        </Panel>

        <Panel title={`Alerts${alerts.length > 0 ? ` (${alerts.length})` : ''}`} icon={IC.alert} accent={alerts.length > 0 ? '#EF4444' : '#12B76A'} alert={alerts.length > 0}>
          {alerts.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ color: '#12B76A', marginBottom: 6 }}>{IC.check}</div>
              <div style={{ fontSize: 11, color: 'rgba(154,172,201,0.5)' }}>All metrics look healthy</div>
            </div>
          ) : (
            <div style={{ padding: '0.6rem 0' }}>
              {alerts.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '0.6rem 1.1rem', borderTop: i > 0 ? '1px solid rgba(240,244,255,0.04)' : 'none' }}>
                  <span style={{ color: a.color, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
                  <span style={{ fontSize: 11, color: 'rgba(220,228,245,0.85)', lineHeight: 1.5 }}>{a.text}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>

        {/* COLUMN 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* FINANCIALS */}
          <Panel title="Financials" icon={IC.dollar} accent="#12B76A" href="/admin/profit" linkLabel="View profit →">
            <div style={{ padding: '1rem 1.1rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>All-time revenue</div>
                <div className="lc-display" style={{ fontSize: 26, fontWeight: 700, color: '#2F7DF6' }}>{fmtMoney(totalRevenue)}</div>
              </div>
              <Row label="Total cost" val={fmtMoney(totalCost)} color="#F2A93B" />
              <Row label="Total profit" val={fmtMoney(totalProfit)} color={totalProfit >= 0 ? '#12B76A' : '#EF4444'} />
              <Row label="This month revenue" val={fmtMoney(monthRevenue)} color="#2F7DF6" />
              <Row label="This month profit" val={fmtMoney(monthProfit)} color={monthProfit >= 0 ? '#12B76A' : '#EF4444'} />
            </div>
          </Panel>

          {/* EXPENSES — reads/writes the same `expenses` table as the Profit page */}
          <Panel title="Operating expenses" icon={IC.receipt} accent="#F2A93B" href="/admin/profit" linkLabel="Full manager →">
            <div style={{ padding: '1rem 1.1rem' }}>
              <Row label={`${currentMonth} total`} val={fmtMoney(totalExpensesMonth)} color="#F2A93B" />
              {currentExpenses.slice(0, 4).map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderTop: '1px solid rgba(240,244,255,0.04)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: '#F0F4FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</div>
                    <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.45)' }}>{e.category}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, color: '#F0F4FF' }}>{fmtMoney(e.amount)}</span>
                    <button onClick={() => deleteExpense(e.id)} style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </div>
                </div>
              ))}
              {currentExpenses.length > 4 && <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.4)', marginTop: 4 }}>+{currentExpenses.length - 4} more this month</div>}
              {currentExpenses.length === 0 && <div style={{ fontSize: 11, color: 'rgba(154,172,201,0.4)', textAlign: 'center', padding: '0.5rem 0' }}>No expenses logged this month</div>}

              {/* Quick add */}
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(240,244,255,0.06)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} placeholder="Expense description"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, padding: '8px 10px', borderRadius: 6, fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <select value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(154,172,201,0.8)', fontSize: 10.5, padding: '8px 6px', borderRadius: 6, fontFamily: 'inherit' }}>
                    {EXPENSE_CATS.map(c => <option key={c} value={c} style={{ background: '#111A2E' }}>{c}</option>)}
                  </select>
                  <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} placeholder="$"
                    style={{ width: 70, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11, padding: '8px 8px', borderRadius: 6, fontFamily: 'inherit' }} />
                </div>
                <button onClick={addExpense} disabled={savingExpense} style={{ padding: '8px', background: savingExpense ? 'rgba(255,255,255,0.06)' : 'rgba(242,169,59,0.15)', color: '#F2A93B', fontSize: 11, fontWeight: 700, border: '1px solid rgba(242,169,59,0.3)', borderRadius: 6, cursor: savingExpense ? 'not-allowed' : 'pointer' }}>
                  {savingExpense ? 'Adding…' : '+ Add expense'}
                </button>
              </div>
            </div>
          </Panel>

          {/* PARTNER SPLIT */}
          <Panel title={`Partner split — ${currentMonth}`} icon={IC.users} accent="#8B7CF6" href="/admin/profit">
            <div style={{ padding: '1rem 1.1rem' }}>
              {[
                { name: 'Victor', invested: victorInvested, profit: monthProfit * victorShare, share: victorShare, color: '#2F7DF6' },
                { name: 'Leopoldo', invested: leopoldoInvested, profit: monthProfit * leopoldoShare, share: leopoldoShare, color: '#8B7CF6' },
              ].map(p => (
                <div key={p.name} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.name}</span>
                    <div style={{ textAlign: 'right' }}>
                      <div className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color: '#12B76A' }}>{fmtMoney(p.profit)}</div>
                      <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.5)' }}>Invested: {fmtMoney(p.invested)}</div>
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${p.share * 100}%`, background: p.color, borderRadius: 3, boxShadow: `0 0 8px ${p.color}88` }} />
                  </div>
                </div>
              ))}
              {totalInvested === 0 && <div style={{ fontSize: 11, color: 'rgba(154,172,201,0.4)', textAlign: 'center', padding: '0.5rem' }}>No investments recorded this month</div>}
            </div>
          </Panel>

          {/* INVENTORY */}
          <Panel title="Inventory" icon={IC.box} accent="#E8B657" href="/admin/products">
            <div style={{ padding: '1rem 1.1rem' }}>
              <Row label="Total products" val={data.products.length} color="rgba(255,255,255,0.7)" />
              <Row label="In stock" val={data.products.filter(p => p.stock > 5).length} color="#12B76A" />
              <Row label="Low stock (≤5)" val={lowStock.length} color={lowStock.length > 0 ? '#F2A93B' : 'rgba(255,255,255,0.7)'} />
              <Row label="Out of stock" val={outOfStock.length} color={outOfStock.length > 0 ? '#EF4444' : 'rgba(255,255,255,0.7)'} />
              {outOfStock.length > 0 && (
                <div style={{ marginTop: 10, padding: '9px 11px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6 }}>
                  <div style={{ fontSize: 9, color: '#EF4444', fontWeight: 700, marginBottom: 5, letterSpacing: '0.06em' }}>OUT OF STOCK</div>
                  {outOfStock.slice(0,3).map(p => <div key={p.id} style={{ fontSize: 10.5, color: 'rgba(154,172,201,0.7)' }}>{p.name}</div>)}
                  {outOfStock.length > 3 && <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.4)' }}>+{outOfStock.length - 3} more</div>}
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* COLUMN 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* RECENT ORDERS */}
          <Panel title="Recent orders" icon={IC.package} href="/admin/orders" linkLabel="View all →">
            <div>
              {data.orders.slice(0, 6).map(order => {
                const s = STATUS[order.status] || STATUS.new
                return (
                  <Link key={order.id} href="/admin/orders" style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '0.7rem 1.1rem', borderTop: '1px solid rgba(240,244,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                      <div>
                        <div className="lc-mono" style={{ fontSize: 12, fontWeight: 700, color: '#F0F4FF', marginBottom: 2 }}>#{order.order_number}</div>
                        <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)' }}>{fmtDate(order.submitted_at)} at {fmtTime(order.submitted_at)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="lc-mono" style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{fmtMoney(order.total)}</div>
                        <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: s.color + '20', color: s.color, fontWeight: 700 }}>{s.label}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Panel>

          {/* PAYMENTS */}
          <Panel title="Payments" icon={IC.card} accent="#12B76A" href="/admin/payments">
            <div style={{ padding: '1rem 1.1rem' }}>
              <Row label="Pending requests" val={pendingPayments.length} color={pendingPayments.length > 0 ? '#F2A93B' : 'rgba(255,255,255,0.7)'} />
              <Row label="Proof submitted" val={proofSubmitted.length} color={proofSubmitted.length > 0 ? '#2F7DF6' : 'rgba(255,255,255,0.7)'} />
              <Row label="Paid" val={data.payments.filter(p => p.status === 'paid').length} color="#12B76A" />
            </div>
          </Panel>
        </div>

        {/* COLUMN 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* PENDING APPLICATIONS */}
          <Panel title={`Applications${pendingApps.length > 0 ? ` (${pendingApps.length} pending)` : ''}`} icon={IC.clipboard} accent="#EF4444" href="/admin/applications" linkLabel="Review →" alert={pendingApps.length > 0}>
            {pendingApps.length === 0 ? (
              <div style={{ padding: '1.25rem', fontSize: 11, color: 'rgba(154,172,201,0.4)', textAlign: 'center' }}>No pending applications</div>
            ) : pendingApps.slice(0,4).map(app => (
              <Link key={app.id} href="/admin/applications" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.7rem 1.1rem', borderTop: '1px solid rgba(240,244,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#F0F4FF', marginBottom: 1 }}>{app.business_name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)' }}>{app.contact_name} · {fmtDate(app.created_at)}</div>
                  </div>
                  <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#EF4444', fontWeight: 700 }}>Review</span>
                </div>
              </Link>
            ))}
          </Panel>

          {/* RECENT CLIENTS */}
          <Panel title="Recent clients" icon={IC.handshake} href="/admin/clients" linkLabel="View all →">
            {data.clients.slice(0,4).map(client => (
              <Link key={client.id} href="/admin/clients" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.7rem 1.1rem', borderTop: '1px solid rgba(240,244,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(47,125,246,0.15)', border: '1px solid rgba(47,125,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2F7DF6' }}>{client.business_name?.[0]}</div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#F0F4FF' }}>{client.business_name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)' }}>{client.contact_name}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 9, padding: '2px 8px', borderRadius: 10, background: 'rgba(18,183,106,0.12)', color: '#12B76A', fontWeight: 700 }}>Active</div>
                </div>
              </Link>
            ))}
          </Panel>

          {/* MESSAGES */}
          <Panel title={`Messages${unreadMessages.length > 0 ? ` (${unreadMessages.length} new)` : ''}`} icon={IC.mail} href="/admin/messages" linkLabel="View all →" alert={unreadMessages.length > 0}>
            {data.messages.slice(0,4).map(msg => (
              <Link key={msg.id} href="/admin/messages" style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.7rem 1.1rem', borderTop: '1px solid rgba(240,244,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, marginRight: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#F0F4FF' }}>{msg.name}</div>
                      {msg.status === 'new' && <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 8, background: 'rgba(47,125,246,0.2)', color: '#2F7DF6', fontWeight: 700 }}>NEW</span>}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(154,172,201,0.5)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 160 }}>{msg.message}</div>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(154,172,201,0.4)', flexShrink: 0 }}>{fmtDate(msg.created_at)}</div>
                </div>
              </Link>
            ))}
            {data.messages.length === 0 && <div style={{ padding: '1.25rem', fontSize: 11, color: 'rgba(154,172,201,0.4)', textAlign: 'center' }}>No messages yet</div>}
          </Panel>
        </div>
      </div>

      {/* GOAL SETTINGS MODAL */}
      {showGoalModal && (
        <div onClick={() => setShowGoalModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(5,7,12,0.75)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 380, background: '#111A2E', border: '1px solid rgba(240,244,255,0.08)', borderRadius: 12, padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
            <div className="lc-display" style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Edit monthly goal</div>
            <div style={{ fontSize: 11, color: 'rgba(154,172,201,0.55)', marginBottom: '1.25rem' }}>Used for the goal ring, projection and margin alerts.</div>

            <label style={{ fontSize: 9, color: 'rgba(154,172,201,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Monthly revenue goal (USD)</label>
            <input type="number" value={goalForm.revenue_goal} onChange={e => setGoalForm(f => ({ ...f, revenue_goal: e.target.value }))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, padding: '10px 12px', borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }} />

            <label style={{ fontSize: 9, color: 'rgba(154,172,201,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Margin alert threshold (%)</label>
            <input type="number" value={goalForm.margin_alert_pct} onChange={e => setGoalForm(f => ({ ...f, margin_alert_pct: e.target.value }))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, padding: '10px 12px', borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 18 }} />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowGoalModal(false)} style={{ flex: 1, padding: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(154,172,201,0.7)', fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveGoal} disabled={savingGoal} style={{ flex: 1, padding: 11, background: savingGoal ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#2F7DF6,#1B5FD1)', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 6, cursor: savingGoal ? 'not-allowed' : 'pointer' }}>{savingGoal ? 'Saving…' : 'Save goal'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const IC = {
  inbox:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  clock:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  clipboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  mail:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>,
  card:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  users:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chart:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  dollar:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  box:       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>,
  package:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  handshake: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  target:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  pie:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  receipt:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/></svg>,
  alert:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  trend:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  check:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
}
