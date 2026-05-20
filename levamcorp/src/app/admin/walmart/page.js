'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function WalmartPage() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [analysisName, setAnalysisName] = useState('')
  const [files, setFiles] = useState({ settlement: null, rts: null })
  const [activeTab, setActiveTab] = useState('overview')
  const [costInputs, setCostInputs] = useState({ productCost: '', inboundCost: '' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      await loadAnalyses(supabase)
    })
  }, [])

  const loadAnalyses = async (supabase) => {
    const { data } = await supabase.from('walmart_analyses').select('*').order('created_at', { ascending: false })
    setAnalyses(data || [])
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const runAnalysis = async () => {
    if (!files.settlement) { alert('Settlement report is required'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('name', analysisName || `Analysis ${new Date().toLocaleDateString()}`)
      formData.append('settlement', files.settlement)
      if (files.rts) formData.append('rts', files.rts)

      const res = await fetch('/api/walmart-analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      const supabase = createClient()
      await loadAnalyses(supabase)
      setSelected(data.analysis)
      setShowUpload(false)
      setFiles({ settlement: null, rts: null })
      setAnalysisName('')
    } catch (e) { alert('Error: ' + e.message) }
    setUploading(false)
  }

  const fmtMoney = (n) => `$${(parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const severityColor = { high: '#e74c3c', medium: '#854f0b', low: '#2d7dd2', info: '#2d7dd2' }
  const severityBg = { high: 'rgba(231,76,60,0.1)', medium: 'rgba(133,79,11,0.1)', low: 'rgba(45,125,210,0.1)', info: 'rgba(45,125,210,0.08)' }

  // Profit calculator
  const calcProfit = (s) => {
    if (!s) return null
    const revenue = parseFloat(costInputs.revenue) || 0
    const productCost = parseFloat(costInputs.productCost) || 0
    const inboundCost = parseFloat(costInputs.inboundCost) || 0
    const fees = (s.summary?.settlement?.fulfillmentFees || 0) +
                 (s.summary?.settlement?.returnProcessingFees || 0) +
                 (s.summary?.settlement?.storageFees || 0) +
                 (s.summary?.settlement?.inventoryRemoval || 0) +
                 (s.summary?.settlement?.rtvFees || 0) +
                 (s.summary?.settlement?.refundsIssued || 0) +
                 inboundCost
    const credits = s.summary?.settlement?.lostInventoryCredit || 0
    const profit = revenue - productCost - fees + credits
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0
    return { revenue, productCost, fees, credits, profit, margin, inboundCost }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Products','/admin/products'],['Profit','/admin/profit'],['Walmart','/admin/walmart']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Walmart' ? '#0071CE' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Walmart' ? '2px solid #0071CE' : '2px solid transparent', fontWeight: label === 'Walmart' ? 700 : 400 }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #001a33 0%, #0071CE20 100%)', padding: '2rem', borderBottom: '0.5px solid rgba(0,113,206,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>🛒</span>
              <div>
                <div style={{ fontSize: 10, color: '#0071CE', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Walmart WFS</div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0 }}>Financial Audit Tool</h1>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Upload your Walmart reports to detect discrepancies, duplicate charges, and profit leaks</p>
          </div>
          <button onClick={() => setShowUpload(true)} style={{ padding: '11px 24px', background: '#0071CE', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 4, letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: '0 4px 16px rgba(0,113,206,0.4)' }}>
            + New Analysis
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: selected ? '300px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT — analyses list */}
        <div>
          {analyses.length === 0 ? (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
              <div style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>No analyses yet</div>
              <div style={{ fontSize: 12, color: '#444' }}>Upload your Walmart reports to get started</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analyses.map(a => {
                const alertCount = a.alerts?.filter(x => x.severity === 'high').length || 0
                const isSelected = selected?.id === a.id
                return (
                  <div key={a.id} onClick={() => { setSelected(a); setActiveTab('overview'); setCostInputs({ productCost: '', inboundCost: '', revenue: '' }) }}
                    style={{ background: '#111', border: `1px solid ${isSelected ? '#0071CE' : 'rgba(255,255,255,0.06)'}`, borderLeft: `4px solid ${alertCount > 0 ? '#e74c3c' : '#0071CE'}`, borderRadius: 6, padding: '1rem 1.25rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{a.name}</div>
                      {alertCount > 0 && <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(231,76,60,0.15)', color: '#e74c3c', borderRadius: 10, fontWeight: 700 }}>{alertCount} alert{alertCount > 1 ? 's' : ''}</span>}
                    </div>
                    {a.summary?.period?.start && (
                      <div style={{ fontSize: 10, color: '#555', marginBottom: 6 }}>{a.summary.period.start} → {a.summary.period.end}</div>
                    )}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ fontSize: 11, color: '#777' }}>
                        <span style={{ color: '#e74c3c', fontWeight: 600 }}>{fmtMoney(a.summary?.settlement?.totalFees)}</span> fees
                      </div>
                      <div style={{ fontSize: 11, color: '#777' }}>
                        <span style={{ color: '#2a7d4f', fontWeight: 600 }}>{fmtMoney(a.summary?.settlement?.totalCredits)}</span> credits
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>{fmtDate(a.created_at)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — analysis detail */}
        {selected && (
          <div>
            {/* TABS */}
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: '6px 6px 0 0', display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
              {[['overview','📊 Overview'],['alerts','🚨 Alerts'],['fees','💰 Fees breakdown'],['profit','📈 Profit calculator'],['transactions','📋 All transactions']].map(([key, label]) => {
                const alertCount = key === 'alerts' ? (selected.alerts?.length || 0) : 0
                return (
                  <button key={key} onClick={() => setActiveTab(key)} style={{ flex: 1, padding: '12px 8px', fontSize: 11, fontWeight: activeTab === key ? 700 : 400, color: activeTab === key ? '#0071CE' : '#555', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === key ? '#0071CE' : 'transparent'}`, cursor: 'pointer', position: 'relative' }}>
                    {label}
                    {alertCount > 0 && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, background: '#e74c3c', borderRadius: '50%' }} />}
                  </button>
                )
              })}
            </div>

            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '1.5rem' }}>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{selected.name}</div>
                      <div style={{ fontSize: 12, color: '#555' }}>
                        Settlement period: {selected.summary?.period?.start} → {selected.summary?.period?.end}
                      </div>
                    </div>
                    {selected.alerts?.some(a => a.severity === 'high') && (
                      <div style={{ padding: '8px 14px', background: 'rgba(231,76,60,0.1)', border: '0.5px solid rgba(231,76,60,0.3)', borderRadius: 6, fontSize: 12, fontWeight: 700, color: '#e74c3c' }}>
                        ⚠️ {selected.alerts.filter(a => a.severity === 'high').length} High priority alert(s)
                      </div>
                    )}
                  </div>

                  {/* Big numbers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1.5rem' }}>
                    {[
                      { label: 'Total fees paid', value: fmtMoney(selected.summary?.settlement?.totalFees), color: '#e74c3c', icon: '💸' },
                      { label: 'Total credits', value: fmtMoney(selected.summary?.settlement?.totalCredits), color: '#2a7d4f', icon: '💚' },
                      { label: 'Net payable', value: fmtMoney(selected.summary?.settlement?.netPayable), color: '#0071CE', icon: '💰' },
                      { label: 'Alerts found', value: selected.alerts?.length || 0, color: selected.alerts?.length > 0 ? '#e74c3c' : '#555', icon: '🚨' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '1rem' }}>
                        <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                        <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Fee breakdown visual */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '1.25rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Fee breakdown</div>
                    {[
                      ['WFS Fulfillment Fee', selected.summary?.settlement?.fulfillmentFees, '#0071CE', selected.summary?.counts?.fulfillmentFeeOrders + ' orders'],
                      ['Inbound Transportation', selected.summary?.settlement?.inboundTransportation, '#534ab7', ''],
                      ['Return Processing', selected.summary?.settlement?.returnProcessingFees, '#854f0b', selected.summary?.counts?.returnFeeCount + ' returns'],
                      ['Storage Fee', selected.summary?.settlement?.storageFees, '#e74c3c', ''],
                      ['Inventory Removal', selected.summary?.settlement?.inventoryRemoval, '#e74c3c', ''],
                      ['RTV Fees', selected.summary?.settlement?.rtvFees, '#666', ''],
                    ].filter(([,v]) => v > 0).map(([label, val, color, note]) => {
                      const total = selected.summary?.settlement?.totalFees || 1
                      const pct = ((val / total) * 100).toFixed(0)
                      return (
                        <div key={label} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <div style={{ fontSize: 12, color: '#ccc' }}>{label} {note && <span style={{ fontSize: 10, color: '#555' }}>({note})</span>}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color }}>{fmtMoney(val)} <span style={{ fontSize: 10, color: '#555' }}>{pct}%</span></div>
                          </div>
                          <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Credits */}
                  {(selected.summary?.settlement?.lostInventoryCredit > 0 || selected.summary?.settlement?.refundsIssued > 0) && (
                    <div style={{ background: 'rgba(42,125,79,0.06)', border: '0.5px solid rgba(42,125,79,0.15)', borderRadius: 6, padding: '1.25rem' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#2a7d4f', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Credits received</div>
                      {[
                        ['Lost Inventory Credit', selected.summary?.settlement?.lostInventoryCredit],
                      ].filter(([,v]) => v > 0).map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0' }}>
                          <span style={{ color: '#888' }}>{label}</span>
                          <span style={{ fontWeight: 700, color: '#2a7d4f' }}>{fmtMoney(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ALERTS TAB */}
              {activeTab === 'alerts' && (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                    {selected.alerts?.length || 0} alerts found
                  </div>
                  {!selected.alerts?.length ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#555' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                      <div>No alerts found for this period</div>
                    </div>
                  ) : selected.alerts.map((alert, i) => (
                    <div key={i} style={{ background: severityBg[alert.severity] || severityBg.info, border: `0.5px solid ${severityColor[alert.severity] || '#555'}30`, borderLeft: `4px solid ${severityColor[alert.severity] || '#555'}`, borderRadius: 6, padding: '1.25rem', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{alert.title}</div>
                          <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.7 }}>{alert.description}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: 9, padding: '3px 8px', background: `${severityColor[alert.severity]}20`, color: severityColor[alert.severity], borderRadius: 8, fontWeight: 700, flexShrink: 0, textTransform: 'uppercase' }}>{alert.severity}</span>
                      </div>
                      {alert.details?.length > 0 && (
                        <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
                          {alert.details.map((d, j) => (
                            <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', padding: '3px 0', borderBottom: j < alert.details.length - 1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none' }}>
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{d.item || d.order || '—'}</span>
                              <span style={{ color: '#ccc', fontWeight: 600, flexShrink: 0 }}>${parseFloat(d.amount || 0).toFixed(2)}</span>
                              {d.date && <span style={{ color: '#555', marginLeft: 8, flexShrink: 0 }}>{d.date?.split('T')[0]}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* FEES BREAKDOWN TAB */}
              {activeTab === 'fees' && (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>All charges by type</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#0d0d0d' }}>
                        {['Transaction type', 'Count', 'Total amount', '% of fees'].map(h => (
                          <th key={h} style={{ fontSize: 9, color: '#555', padding: '10px 12px', textAlign: 'left', fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selected.summary?.byType?.map((row, i) => {
                        const totalAbs = selected.summary?.settlement?.totalFees || 1
                        const pct = row.total > 0 ? ((row.total / totalAbs) * 100).toFixed(1) : '—'
                        const isNeg = row.total < 0
                        return (
                          <tr key={i} style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '12px', fontSize: 13, color: '#ccc', fontWeight: 500 }}>{row.type}</td>
                            <td style={{ padding: '12px', fontSize: 12, color: '#777' }}>{row.count}</td>
                            <td style={{ padding: '12px', fontSize: 13, fontWeight: 700, color: isNeg ? '#2a7d4f' : '#e74c3c' }}>
                              {isNeg ? '+' : '-'}{fmtMoney(Math.abs(row.total))}
                              <span style={{ fontSize: 10, color: '#555', marginLeft: 4 }}>{isNeg ? 'credit' : 'charge'}</span>
                            </td>
                            <td style={{ padding: '12px', fontSize: 12, color: '#555' }}>{row.total > 0 ? pct + '%' : '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,113,206,0.06)' }}>
                        <td colSpan={2} style={{ padding: '12px', fontSize: 12, fontWeight: 700, color: '#888' }}>NET PAYABLE TO WALMART</td>
                        <td colSpan={2} style={{ padding: '12px', fontSize: 16, fontWeight: 800, color: '#0071CE' }}>{fmtMoney(selected.summary?.settlement?.netPayable)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* PROFIT CALCULATOR TAB */}
              {activeTab === 'profit' && (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>Profit calculator</div>
                  <p style={{ fontSize: 12, color: '#555', marginBottom: '1.5rem', lineHeight: 1.7 }}>Enter your revenue and costs to calculate your real profit after all Walmart fees for this settlement period.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
                    {[
                      ['revenue', 'Total revenue (GMV)', 'Total sales amount in this period', '#2a7d4f'],
                      ['productCost', 'Product cost (COGS)', 'What you paid for the inventory', '#854f0b'],
                      ['inboundCost', 'Inbound shipping cost', 'Cost to ship to Walmart warehouse', '#534ab7'],
                    ].map(([field, label, hint, color]) => (
                      <div key={field}>
                        <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: 13 }}>$</span>
                          <input type="number" value={costInputs[field] || ''} onChange={e => setCostInputs(p => ({...p, [field]: e.target.value}))} placeholder="0.00"
                            style={{ width: '100%', background: '#1a1a1a', border: `0.5px solid ${color}40`, color: '#ddd', fontSize: 13, padding: '10px 10px 10px 24px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ fontSize: 10, color: '#444', marginTop: 3 }}>{hint}</div>
                      </div>
                    ))}
                  </div>

                  {costInputs.revenue && (() => {
                    const p = calcProfit(selected)
                    if (!p) return null
                    return (
                      <div>
                        {/* Waterfall */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '1.25rem', marginBottom: '1rem' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Profit waterfall</div>
                          {[
                            ['Revenue (GMV)', p.revenue, '#2a7d4f', '+'],
                            ['Product cost', p.productCost, '#e74c3c', '-'],
                            ['Walmart fees', p.fees, '#e74c3c', '-'],
                            ['Credits received', p.credits, '#2a7d4f', '+'],
                          ].map(([label, val, color, sign]) => val > 0 ? (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
                              <span style={{ fontSize: 12, color: '#888' }}>{label}</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color }}>{sign}{fmtMoney(val)}</span>
                            </div>
                          ) : null)}
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Net profit</span>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 24, fontWeight: 800, color: p.profit >= 0 ? '#2a7d4f' : '#e74c3c' }}>{fmtMoney(p.profit)}</div>
                              <div style={{ fontSize: 11, color: p.profit >= 0 ? '#2a7d4f' : '#e74c3c' }}>{p.margin}% margin</div>
                            </div>
                          </div>
                        </div>

                        <div style={{ padding: '1rem', background: p.profit >= 0 ? 'rgba(42,125,79,0.08)' : 'rgba(231,76,60,0.08)', border: `0.5px solid ${p.profit >= 0 ? 'rgba(42,125,79,0.2)' : 'rgba(231,76,60,0.2)'}`, borderRadius: 6, textAlign: 'center' }}>
                          <div style={{ fontSize: 13, color: p.profit >= 0 ? '#2a7d4f' : '#e74c3c', fontWeight: 600 }}>
                            {p.profit >= 0 ? `✅ Profitable — you made ${fmtMoney(p.profit)} this period` : `⚠️ Loss — you are ${fmtMoney(Math.abs(p.profit))} in the red this period`}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* TRANSACTIONS TAB */}
              {activeTab === 'transactions' && (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
                    All transactions <span style={{ fontSize: 11, color: '#555', fontWeight: 400 }}>· {selected.settlement_data?.length || 0} rows</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr style={{ background: '#0d0d0d' }}>
                          {['Order #', 'Type', 'Item', 'Date', 'Amount'].map(h => (
                            <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: '#555', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 9, borderBottom: '0.5px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(selected.settlement_data || []).slice(0, 100).map((row, i) => {
                          const amount = parseFloat(row['Net Payable']) || 0
                          const isNeg = amount < 0
                          return (
                            <tr key={i} style={{ borderTop: '0.5px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '8px 10px', color: '#2d7dd2', fontFamily: 'monospace', fontSize: 10 }}>{(row['Walmart.com Order #'] || '').replace(/[="]/g, '').slice(-8)}</td>
                              <td style={{ padding: '8px 10px' }}>
                                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 8, background: isNeg ? 'rgba(42,125,79,0.15)' : 'rgba(231,76,60,0.1)', color: isNeg ? '#2a7d4f' : '#e74c3c', fontWeight: 600 }}>
                                  {row['Transaction Type']}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px', color: '#888', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row['Partner Item Name']}</td>
                              <td style={{ padding: '8px 10px', color: '#555', whiteSpace: 'nowrap' }}>{row['Transaction Date/Time']?.split('T')[0]}</td>
                              <td style={{ padding: '8px 10px', fontWeight: 700, color: isNeg ? '#2a7d4f' : '#e74c3c', whiteSpace: 'nowrap' }}>
                                {isNeg ? '+' : '-'}{fmtMoney(Math.abs(amount))}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {selected.settlement_data?.length > 100 && (
                      <div style={{ padding: '12px', textAlign: 'center', fontSize: 11, color: '#444' }}>Showing first 100 of {selected.settlement_data.length} transactions</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 500, overflow: 'hidden' }}>
            <div style={{ background: '#0d0d0d', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>🛒 New Walmart Analysis</div>
              <button onClick={() => setShowUpload(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Analysis name</label>
                <input value={analysisName} onChange={e => setAnalysisName(e.target.value)} placeholder={`Analysis ${new Date().toLocaleDateString()}`}
                  style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 13, padding: '10px 12px', borderRadius: 4, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>

              <div style={{ background: 'rgba(0,113,206,0.06)', border: '0.5px solid rgba(0,113,206,0.15)', borderRadius: 6, padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: 10, color: '#0071CE', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>How to download from Walmart Seller Center</div>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.8 }}>
                  1. Go to <strong style={{ color: '#ccc' }}>Reports → Financial → Settlement</strong> and download settlement CSV<br />
                  2. Go to <strong style={{ color: '#ccc' }}>Returns → Returned to Seller</strong> and download CSV<br />
                  3. Make sure dates match for accurate analysis
                </div>
              </div>

              {[
                ['settlement', '📄 Settlement Report (CSV) *', 'Required — the main financial report', true],
                ['rts', '📦 Returned to Seller (CSV)', 'Optional — items sent back to your warehouse', false],
              ].map(([key, label, hint, required]) => (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
                  <label style={{ display: 'block', border: `2px dashed ${files[key] ? '#0071CE' : 'rgba(255,255,255,0.1)'}`, borderRadius: 4, padding: '1rem', textAlign: 'center', cursor: 'pointer', background: files[key] ? 'rgba(0,113,206,0.06)' : 'transparent', transition: 'all 0.15s' }}>
                    <input type="file" accept=".csv,.xlsx" style={{ display: 'none' }} onChange={e => setFiles(f => ({...f, [key]: e.target.files[0]}))} />
                    {files[key] ? (
                      <div style={{ fontSize: 12, color: '#0071CE', fontWeight: 600 }}>✓ {files[key].name}</div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>📤 Click to upload {required ? '' : '(optional)'}</div>
                        <div style={{ fontSize: 10, color: '#444' }}>{hint}</div>
                      </div>
                    )}
                  </label>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                <button onClick={runAnalysis} disabled={uploading || !files.settlement}
                  style={{ flex: 1, padding: 13, background: uploading || !files.settlement ? '#333' : '#0071CE', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: uploading || !files.settlement ? 'not-allowed' : 'pointer', borderRadius: 4, letterSpacing: '0.06em' }}>
                  {uploading ? '⏳ Analyzing...' : '🔍 Run analysis'}
                </button>
                <button onClick={() => setShowUpload(false)} style={{ padding: '13px 20px', background: 'transparent', color: '#555', fontSize: 12, border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', borderRadius: 4 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
