'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'
const PARTNERS = ['Victor', 'Leopoldo']

export default function ProfitPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [investments, setInvestments] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedSnapshot, setSelectedSnapshot] = useState(null)
  const [newInvestment, setNewInvestment] = useState({ partner_name: 'Victor', amount: '', notes: '' })
  const [addingInvestment, setAddingInvestment] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const now = new Date()
  const currentMonth = now.toLocaleString('en-US', { month: 'long' })
  const currentYear = now.getFullYear()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      await loadAll(supabase)
    })
  }, [])

  const loadAll = async (supabase) => {
    const [{ data: ordersData }, { data: productsData }, { data: invData }, { data: snapData }] = await Promise.all([
      supabase.from('orders').select('*, order_items(*, products(cost_price))').order('submitted_at', { ascending: false }),
      supabase.from('products').select('*').order('name'),
      supabase.from('partner_investments').select('*').order('created_at', { ascending: false }),
      supabase.from('monthly_snapshots').select('*').order('year', { ascending: false }).order('month', { ascending: false }),
    ])
    setOrders(ordersData || [])
    setProducts(productsData || [])
    setInvestments(invData || [])
    setSnapshots(snapData || [])
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  // Current month calculations
  const completedOrders = orders.filter(o => ['confirmed','dispatched','completed'].includes(o.status))
  const currentMonthOrders = completedOrders.filter(o => {
    const d = new Date(o.submitted_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === currentYear
  })
  // Status label for revenue counting
  const revenueNote = '(confirmed + dispatched + completed)'

  const calcOrderRevenue = (order) => order.total || 0
  const calcOrderCost = (order) => {
    return (order.order_items || []).reduce((sum, item) => {
      const costPrice = item.products?.cost_price || 0
      return sum + (costPrice * item.quantity)
    }, 0)
  }
  const calcOrderProfit = (order) => calcOrderRevenue(order) - calcOrderCost(order)

  const currentRevenue = currentMonthOrders.reduce((s, o) => s + calcOrderRevenue(o), 0)
  const currentCost = currentMonthOrders.reduce((s, o) => s + calcOrderCost(o), 0)
  const currentProfit = currentRevenue - currentCost
  const profitMargin = currentRevenue > 0 ? ((currentProfit / currentRevenue) * 100).toFixed(1) : 0

  const totalRevenue = completedOrders.reduce((s, o) => s + calcOrderRevenue(o), 0)
  const totalCost = completedOrders.reduce((s, o) => s + calcOrderCost(o), 0)
  const totalProfit = totalRevenue - totalCost

  // Partner investments this month
  const currentInvestments = investments.filter(i => i.month === currentMonth && i.year === currentYear)
  const victorInvested = currentInvestments.filter(i => i.partner_name === 'Victor').reduce((s, i) => s + i.amount, 0)
  const leopoldoInvested = currentInvestments.filter(i => i.partner_name === 'Leopoldo').reduce((s, i) => s + i.amount, 0)
  const totalInvested = victorInvested + leopoldoInvested
  const victorShare = totalInvested > 0 ? victorInvested / totalInvested : 0.5
  const leopoldoShare = totalInvested > 0 ? leopoldoInvested / totalInvested : 0.5
  const victorProfit = currentProfit * victorShare
  const leopoldoProfit = currentProfit * leopoldoShare

  const addInvestment = async () => {
    if (!newInvestment.amount) { alert('Please enter an amount'); return }
    setSaving(true)
    const supabase = createClient()
    await supabase.from('partner_investments').insert([{
      partner_name: newInvestment.partner_name,
      amount: parseFloat(newInvestment.amount),
      notes: newInvestment.notes,
      month: currentMonth,
      year: currentYear,
    }])
    setNewInvestment({ partner_name: 'Victor', amount: '', notes: '' })
    setAddingInvestment(false)
    await loadAll(supabase)
    setSaving(false)
  }

  const deleteInvestment = async (id) => {
    const supabase = createClient()
    await supabase.from('partner_investments').delete().eq('id', id)
    await loadAll(supabase)
  }

  const closeMonth = async () => {
    setSaving(true)
    const supabase = createClient()
    // Save snapshot
    await supabase.from('monthly_snapshots').insert([{
      month: currentMonth,
      year: currentYear,
      total_revenue: currentRevenue,
      total_cost: currentCost,
      total_profit: currentProfit,
      total_orders: currentMonthOrders.length,
      victor_investment: victorInvested,
      leopoldo_investment: leopoldoInvested,
      victor_profit: victorProfit,
      leopoldo_profit: leopoldoProfit,
      snapshot_data: {
        orders: currentMonthOrders.map(o => ({ id: o.id, number: o.order_number, revenue: calcOrderRevenue(o), cost: calcOrderCost(o), profit: calcOrderProfit(o) })),
        investments: currentInvestments,
      }
    }])
    await loadAll(supabase)
    setShowResetConfirm(false)
    setSaving(false)
    alert(`✅ Month of ${currentMonth} ${currentYear} has been archived!`)
  }

  const fmtMoney = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Profit' ? '#2a7d4f' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Profit' ? '2px solid #2a7d4f' : '2px solid transparent', fontWeight: label === 'Profit' ? 700 : 400 }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #0a1a0a, #0d1a0d)', padding: '2rem', borderBottom: '0.5px solid rgba(42,125,79,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2a7d4f', fontWeight: 600, marginBottom: 8 }}>Financial dashboard</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Profit & Revenue</h1>
            <p style={{ fontSize: 13, color: '#555' }}>{currentMonth} {currentYear} · Active month</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowResetConfirm(true)} style={{ padding: '9px 18px', background: 'rgba(231,76,60,0.1)', color: '#e74c3c', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(231,76,60,0.3)', borderRadius: 3, cursor: 'pointer', letterSpacing: '0.06em' }}>
              📦 Close & Archive Month
            </button>
          </div>
        </div>

        {/* BIG STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginTop: '1.5rem' }}>
          {[
            { label: 'Revenue', value: fmtMoney(currentRevenue), sub: `${currentMonthOrders.length} orders`, color: '#2d7dd2', icon: '💰' },
            { label: 'Cost', value: fmtMoney(currentCost), sub: 'product cost', color: '#854f0b', icon: '📦' },
            { label: 'Profit', value: fmtMoney(currentProfit), sub: `${profitMargin}% margin`, color: currentProfit > 0 ? '#2a7d4f' : '#e74c3c', icon: '📈' },
            { label: "Victor's share", value: fmtMoney(victorProfit), sub: `${(victorShare * 100).toFixed(0)}% of profit`, color: '#534ab7', icon: '👤' },
            { label: "Leopoldo's share", value: fmtMoney(leopoldoProfit), sub: `${(leopoldoShare * 100).toFixed(0)}% of profit`, color: '#534ab7', icon: '👤' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#444' }}>{s.sub}</div>
                </div>
                <span style={{ fontSize: 20, opacity: 0.3 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '0 2rem', display: 'flex', gap: 0 }}>
        {[['overview','📊 Overview'],['orders','📦 Orders'],['investments','💼 Investments'],['products','🏷 Product margins'],['history','📅 History']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ fontSize: 12, fontWeight: activeTab === key ? 700 : 400, color: activeTab === key ? '#2a7d4f' : '#555', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === key ? '#2a7d4f' : 'transparent'}`, padding: '12px 16px', cursor: 'pointer' }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Partner split */}
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Partner profit split — {currentMonth}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Based on investment ratio</div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {[
                  { name: 'Victor', invested: victorInvested, profit: victorProfit, share: victorShare, color: '#2d7dd2' },
                  { name: 'Leopoldo', invested: leopoldoInvested, profit: leopoldoProfit, share: leopoldoShare, color: '#534ab7' },
                ].map(p => (
                  <div key={p.name} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${p.color}20`, border: `1.5px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: p.color }}>
                          {p.name[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                          <div style={{ fontSize: 10, color: '#555' }}>Invested: {fmtMoney(p.invested)}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#2a7d4f' }}>{fmtMoney(p.profit)}</div>
                        <div style={{ fontSize: 10, color: '#555' }}>{(p.share * 100).toFixed(1)}% share</div>
                      </div>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${p.share * 100}%`, background: p.color, borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                ))}

                <div style={{ padding: '1rem', background: 'rgba(42,125,79,0.06)', border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 4, marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 6 }}>
                    <span>Total invested this month</span><span style={{ color: '#ccc', fontWeight: 600 }}>{fmtMoney(totalInvested)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                    <span>Total profit to split</span><span style={{ color: '#2a7d4f' }}>{fmtMoney(currentProfit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* All-time stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>All-time totals</div>
                {[
                  ['Total revenue', fmtMoney(totalRevenue), '#2d7dd2'],
                  ['Total cost', fmtMoney(totalCost), '#854f0b'],
                  ['Total profit', fmtMoney(totalProfit), '#2a7d4f'],
                  ['Completed orders', completedOrders.length, '#ccc'],
                  ['Avg order value', fmtMoney(completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0), '#888'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: '#777' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '1.25rem 1.5rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>This month summary</div>
                {[
                  ['Orders completed', currentMonthOrders.length, '#ccc'],
                  ['Revenue', fmtMoney(currentRevenue), '#2d7dd2'],
                  ['Product cost', fmtMoney(currentCost), '#854f0b'],
                  ['Gross profit', fmtMoney(currentProfit), currentProfit >= 0 ? '#2a7d4f' : '#e74c3c'],
                  ['Profit margin', `${profitMargin}%`, currentProfit >= 0 ? '#2a7d4f' : '#e74c3c'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: '#777' }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>Completed orders this month — {currentMonthOrders.length} orders</div>
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              {currentMonthOrders.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>No completed orders this month</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#0d0d0d' }}>
                      {['Order #','Date','Revenue','Cost','Profit','Margin'].map(h => (
                        <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentMonthOrders.map(order => {
                      const rev = calcOrderRevenue(order)
                      const cost = calcOrderCost(order)
                      const profit = calcOrderProfit(order)
                      const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : 0
                      return (
                        <tr key={order.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 600, color: '#2d7dd2' }}>#{order.order_number}</td>
                          <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#777' }}>{fmtDate(order.submitted_at)}</td>
                          <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 600, color: '#ccc' }}>{fmtMoney(rev)}</td>
                          <td style={{ padding: '12px 1.25rem', fontSize: 12, color: '#854f0b' }}>{fmtMoney(cost)}</td>
                          <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 700, color: profit >= 0 ? '#2a7d4f' : '#e74c3c' }}>{fmtMoney(profit)}</td>
                          <td style={{ padding: '12px 1.25rem' }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: parseFloat(margin) >= 20 ? '#2a7d4f' : '#854f0b' }}>{margin}%</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(42,125,79,0.06)' }}>
                      <td colSpan={2} style={{ padding: '12px 1.25rem', fontSize: 11, fontWeight: 700, color: '#888' }}>TOTALS</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 14, fontWeight: 800, color: '#2d7dd2' }}>{fmtMoney(currentRevenue)}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 700, color: '#854f0b' }}>{fmtMoney(currentCost)}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 14, fontWeight: 800, color: '#2a7d4f' }}>{fmtMoney(currentProfit)}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 700, color: '#2a7d4f' }}>{profitMargin}%</td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        )}

        {/* INVESTMENTS TAB */}
        {activeTab === 'investments' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Partner investments — {currentMonth} {currentYear}</div>
                <button onClick={() => setAddingInvestment(true)} style={{ padding: '8px 16px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', borderRadius: 3 }}>+ Add investment</button>
              </div>

              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: '1.5rem' }}>
                {currentInvestments.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#444', fontSize: 12 }}>No investments recorded this month</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#0d0d0d' }}>
                        {['Partner','Amount','Notes','Date',''].map(h => (
                          <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentInvestments.map(inv => (
                        <tr key={inv.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px 1.25rem' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: inv.partner_name === 'Victor' ? '#2d7dd2' : '#534ab7' }}>{inv.partner_name}</span>
                          </td>
                          <td style={{ padding: '12px 1.25rem', fontSize: 13, fontWeight: 700, color: '#2a7d4f' }}>{fmtMoney(inv.amount)}</td>
                          <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#777' }}>{inv.notes || '—'}</td>
                          <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{fmtDate(inv.created_at)}</td>
                          <td style={{ padding: '12px 1.25rem' }}>
                            <button onClick={() => deleteInvestment(inv.id)} style={{ fontSize: 10, color: '#e74c3c', background: 'transparent', border: '0.5px solid rgba(231,76,60,0.3)', padding: '3px 8px', borderRadius: 2, cursor: 'pointer' }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Add investment panel */}
            {addingInvestment && (
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', height: 'fit-content' }}>
                <div style={{ background: '#0d0d0d', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Add investment</div>
                  <button onClick={() => setAddingInvestment(false)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16 }}>×</button>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Partner</label>
                    <select value={newInvestment.partner_name} onChange={e => setNewInvestment(p => ({...p, partner_name: e.target.value}))}
                      style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '9px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                      {PARTNERS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Amount ($) *</label>
                    <input type="number" value={newInvestment.amount} onChange={e => setNewInvestment(p => ({...p, amount: e.target.value}))} placeholder="0.00"
                      style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '9px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
                    <input value={newInvestment.notes} onChange={e => setNewInvestment(p => ({...p, notes: e.target.value}))} placeholder="e.g. Product purchase, inventory"
                      style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '9px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={addInvestment} disabled={saving} style={{ width: '100%', padding: 10, background: saving ? '#333' : '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3 }}>
                    {saving ? 'Saving...' : '+ Add investment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS MARGINS TAB */}
        {activeTab === 'products' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Product margins</div>
            <p style={{ fontSize: 11, color: '#555', marginBottom: '1rem' }}>Set cost price in Products section. Margin = (Sale price - Cost) / Sale price</p>
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0d0d0d' }}>
                    {['Product','SKU','Cost price','Sale price','Margin','Stock'].map(h => (
                      <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const cost = p.cost_price || 0
                    const sale = p.price || 0
                    const margin = sale > 0 && cost > 0 ? (((sale - cost) / sale) * 100).toFixed(1) : null
                    const profit = sale - cost
                    return (
                      <tr key={p.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 500, color: '#ccc', maxWidth: 200 }}>{p.name}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 10, color: '#555', fontFamily: 'monospace' }}>{p.sku}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: cost > 0 ? '#854f0b' : '#444' }}>{cost > 0 ? fmtMoney(cost) : '—'}</td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 600, color: '#ccc' }}>{fmtMoney(sale)}</td>
                        <td style={{ padding: '12px 1.25rem' }}>
                          {margin !== null ? (
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: parseFloat(margin) >= 20 ? '#2a7d4f' : parseFloat(margin) >= 10 ? '#854f0b' : '#e74c3c' }}>{margin}%</span>
                              <span style={{ fontSize: 10, color: '#555', marginLeft: 6 }}>(+{fmtMoney(profit)}/unit)</span>
                            </div>
                          ) : <span style={{ fontSize: 10, color: '#444' }}>Set cost price</span>}
                        </td>
                        <td style={{ padding: '12px 1.25rem', fontSize: 12, color: p.stock === 0 ? '#e74c3c' : '#777' }}>{p.stock}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>Archived months — {snapshots.length} months</div>
            {snapshots.length === 0 ? (
              <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '3rem', textAlign: 'center', color: '#444' }}>
                No archived months yet. Close a month to archive it.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {snapshots.map(snap => (
                  <div key={snap.id} onClick={() => setSelectedSnapshot(selectedSnapshot?.id === snap.id ? null : snap)}
                    style={{ background: '#111', border: `1px solid ${selectedSnapshot?.id === snap.id ? '#2a7d4f' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, overflow: 'hidden', cursor: 'pointer' }}>
                    <div style={{ padding: '1rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr repeat(5,auto)', gap: '2rem', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{snap.month} {snap.year}</div>
                        <div style={{ fontSize: 11, color: '#555' }}>{snap.total_orders} orders completed</div>
                      </div>
                      {[
                        ['Revenue', fmtMoney(snap.total_revenue), '#2d7dd2'],
                        ['Cost', fmtMoney(snap.total_cost), '#854f0b'],
                        ['Profit', fmtMoney(snap.total_profit), '#2a7d4f'],
                        ["Victor's cut", fmtMoney(snap.victor_profit), '#534ab7'],
                        ["Leopoldo's cut", fmtMoney(snap.leopoldo_profit), '#534ab7'],
                      ].map(([label, val, color]) => (
                        <div key={label} style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {selectedSnapshot?.id === snap.id && snap.snapshot_data?.orders && (
                      <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '1rem 1.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {['Order #','Revenue','Cost','Profit'].map(h => (
                                <th key={h} style={{ fontSize: 8, color: '#444', padding: '4px 8px', textAlign: 'left', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {snap.snapshot_data.orders.map(o => (
                              <tr key={o.id}>
                                <td style={{ padding: '5px 8px', fontSize: 11, color: '#2d7dd2' }}>#{o.number}</td>
                                <td style={{ padding: '5px 8px', fontSize: 11, color: '#ccc' }}>{fmtMoney(o.revenue)}</td>
                                <td style={{ padding: '5px 8px', fontSize: 11, color: '#854f0b' }}>{fmtMoney(o.cost)}</td>
                                <td style={{ padding: '5px 8px', fontSize: 11, color: '#2a7d4f', fontWeight: 600 }}>{fmtMoney(o.profit)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RESET CONFIRM MODAL */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '2rem', maxWidth: 420, width: '90%' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>📦 Archive {currentMonth} {currentYear}?</div>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              This will save a permanent snapshot of <strong style={{ color: '#ccc' }}>{currentMonth} {currentYear}</strong> including all revenue, costs, profit and partner splits. The data will be archived in History and the current month will reset.
            </p>
            <div style={{ background: 'rgba(42,125,79,0.06)', border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 4, padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}><span>Total profit to archive</span><span style={{ color: '#2a7d4f', fontWeight: 700 }}>{fmtMoney(currentProfit)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 4 }}><span>Victor's cut</span><span style={{ color: '#2d7dd2', fontWeight: 700 }}>{fmtMoney(victorProfit)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888' }}><span>Leopoldo's cut</span><span style={{ color: '#534ab7', fontWeight: 700 }}>{fmtMoney(leopoldoProfit)}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={closeMonth} disabled={saving} style={{ flex: 1, padding: 12, background: saving ? '#333' : '#2a7d4f', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 3 }}>
                {saving ? 'Archiving...' : 'Yes, archive month'}
              </button>
              <button onClick={() => setShowResetConfirm(false)} style={{ padding: '12px 20px', background: 'transparent', color: '#555', fontSize: 12, border: '0.5px solid rgba(255,255,255,0.1)', cursor: 'pointer', borderRadius: 3 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
