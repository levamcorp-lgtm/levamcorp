'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Chart from 'chart.js/auto'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const NAV_LINKS = [['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Marketing','/admin/marketing'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart'],['Offers','/admin/offers'],['Recruit','/admin/recruit'],['Analytics','/admin/insights']]

// Buckets real `applications.heard_about` values into friendly, zero-cost "organic" channels.
const ORGANIC_CHANNEL_MAP = {
  google: 'Google (organic)',
  instagram: 'Instagram (organic)',
  facebook: 'Facebook (organic)',
  tiktok: 'TikTok (organic)',
  youtube: 'YouTube (organic)',
  whatsapp: 'WhatsApp',
  trade_show: 'Trade shows & events',
  friend: 'Referrals',
  broker: 'Referrals',
  existing_client: 'Referrals',
  amazon_seller: 'Marketplace communities',
  walmart_seller: 'Marketplace communities',
}
const bucketChannel = (heard) => ORGANIC_CHANNEL_MAP[heard] || 'Other / unspecified'

function AdminNav({ active, newOrders, unreadMessages, pendingApps, onLogout, now }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 2rem', background: 'rgba(18,12,12,0.85)', backdropFilter: 'blur(20px) saturate(180%)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, border: '1.5px solid rgba(255,59,59,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,59,59,0.06)' }}>
            <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width: 15, height: 'auto' }} />
          </div>
          <div>
            <div className="lc-display" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>LEVAM<span style={{ color: '#FF3B3B' }}>CORP</span></div>
            <div className="lc-mono" style={{ fontSize: 7, color: 'rgba(220,200,200,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Marketing</div>
          </div>
        </div>
        <div style={{ display: 'flex', borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 20, gap: 2, flexWrap: 'wrap' }}>
          {NAV_LINKS.map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 11.5, fontWeight: 600, color: label === active ? '#fff' : 'rgba(220,200,200,0.55)', textDecoration: 'none', padding: '5px 10px', borderRadius: 5, position: 'relative', background: label === active ? 'rgba(255,59,59,0.14)' : 'transparent' }}>
              {label}
              {label === 'Orders' && newOrders > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, background: '#FF3B3B', borderRadius: '50%' }} />}
              {label === 'Messages' && unreadMessages > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, background: '#FF3B3B', borderRadius: '50%' }} />}
              {label === 'Applications' && pendingApps > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 6, height: 6, background: '#FF3B3B', borderRadius: '50%' }} />}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="lc-mono">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
          <span style={{ fontSize: 10, color: 'rgba(220,200,200,0.5)' }}>{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <button onClick={onLogout} style={{ fontSize: 11, color: 'rgba(220,200,200,0.6)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </div>
    </nav>
  )
}

function Panel({ title, icon, accent = '#FF3B3B', href, linkLabel, alert, children }) {
  return (
    <div style={{ background: 'rgba(28,18,18,0.6)', backdropFilter: 'blur(16px)', border: `1px solid ${alert ? accent + '40' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${accent}60,transparent)` }} />
      <div style={{ padding: '0.8rem 1.1rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, display: 'flex', alignItems: 'center', gap: 6 }}>{icon} {title}</div>
        {href && <Link href={href} style={{ fontSize: 9.5, color: 'rgba(220,200,200,0.5)', textDecoration: 'none' }}>{linkLabel}</Link>}
      </div>
      {children}
    </div>
  )
}

const Row = ({ label, val, color = '#D8C6C6' }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
    <span style={{ fontSize: 11, color: 'rgba(220,200,200,0.6)' }}>{label}</span>
    <span className="lc-mono" style={{ fontSize: 12, fontWeight: 700, color }}>{val}</span>
  </div>
)

function Ring({ pct, color, size = 56 }) {
  const clamped = Math.max(0, Math.min(100, pct))
  const inner = size - 12
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${color} ${clamped * 3.6}deg, rgba(255,255,255,0.08) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: inner, height: inner, borderRadius: '50%', background: '#1C1212', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="lc-mono" style={{ fontSize: size > 48 ? 11 : 9, fontWeight: 700, color }}>{Math.round(pct)}%</span>
      </div>
    </div>
  )
}

function KpiTile({ label, value, sub, color, ring }) {
  return (
    <div style={{ background: 'rgba(28,18,18,0.7)', backdropFilter: 'blur(16px)', border: `1px solid ${color}30`, borderRadius: 16, padding: '1.25rem 1.4rem', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${color}70,transparent)` }} />
      <div style={{ position: 'absolute', bottom: -30, right: -30, width: 110, height: 110, background: `radial-gradient(circle,${color}22 0%,transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 9, color: 'rgba(220,200,200,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
        <div className="lc-display" style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 10.5, color, marginTop: 6, fontWeight: 600 }}>{sub}</div>}
      </div>
      {ring !== undefined && ring !== null && <Ring pct={ring} color={color} />}
    </div>
  )
}

export default function AdminMarketing() {
  const [applications, setApplications] = useState([])
  const [clients, setClients] = useState([])
  const [orders, setOrders] = useState([])
  const [channels, setChannels] = useState([])
  const [channelMonthly, setChannelMonthly] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [campaignMonthly, setCampaignMonthly] = useState([])
  const [loading, setLoading] = useState(true)
  const [dbReady, setDbReady] = useState(true)

  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [sortBy, setSortBy] = useState('conversions')

  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState('log')
  const [logForm, setLogForm] = useState({})
  const [savingLog, setSavingLog] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newCampaign, setNewCampaign] = useState({ name: '', channel_id: '' })

  const barCanvasRef = useRef(null)
  const funnelCanvasRef = useRef(null)
  const chartsRef = useRef({ bar: null, funnel: null })

  const now = new Date()
  const fmtMoney = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

  const loadAll = async (supabase) => {
    const [
      { data: apps }, { data: cl }, { data: ord },
      chRes, chmRes, campRes, campmRes,
    ] = await Promise.all([
      supabase.from('applications').select('id,email,heard_about,status,created_at').order('created_at', { ascending: false }),
      supabase.from('clients').select('id,email,created_at').order('created_at', { ascending: false }),
      supabase.from('orders').select('total,status,submitted_at,notes'),
      supabase.from('marketing_channels').select('*').order('created_at', { ascending: true }),
      supabase.from('marketing_channel_monthly').select('*'),
      supabase.from('marketing_campaigns').select('*').order('created_at', { ascending: true }),
      supabase.from('marketing_campaign_monthly').select('*'),
    ])
    setApplications(apps || [])
    setClients(cl || [])
    setOrders(ord || [])
    // marketing_* tables may not exist yet until the SQL setup runs — degrade gracefully instead of crashing.
    if (chRes.error) { setDbReady(false) } else {
      setChannels(chRes.data || [])
      setChannelMonthly(chmRes.data || [])
      setCampaigns(campRes.data || [])
      setCampaignMonthly(campmRes.data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      await loadAll(supabase)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  // ── Real revenue per converted client, from actual order history (same email-matching used on /admin/clients) ──
  const getClientOrders = (email) => orders.filter(o => {
    const orderEmail = (o.notes || '').split('Email: ')[1]?.split(' ')[0]?.split(',')[0]?.trim()
    return orderEmail === email
  })
  const clientsWithRevenue = clients.map(c => ({
    ...c,
    revenue: getClientOrders(c.email).filter(o => ['confirmed','dispatched','completed'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0),
    hasOrder: getClientOrders(c.email).length > 0,
  }))
  const totalClientRevenue = clientsWithRevenue.reduce((s, c) => s + c.revenue, 0)
  const avgRevenuePerClient = clients.length > 0 ? totalClientRevenue / clients.length : 0

  const clientEmails = new Set(clients.map(c => c.email))
  const clientWithOrderEmails = new Set(clientsWithRevenue.filter(c => c.hasOrder).map(c => c.email))

  // ── Organic channels — real, derived from applications.heard_about, for the selected month ──
  const monthApps = applications.filter(a => a.created_at?.slice(0, 7) === month)
  const organicByChannel = {}
  monthApps.forEach(a => {
    const ch = bucketChannel(a.heard_about)
    if (!organicByChannel[ch]) organicByChannel[ch] = { leads: 0, conversions: 0 }
    organicByChannel[ch].leads++
    if (a.status === 'approved') organicByChannel[ch].conversions++
  })

  // ── Paid channels — manual monthly entries ──
  const activeChannels = channels.filter(c => c.is_active !== false)
  const paidRows = activeChannels.map(ch => {
    const entry = channelMonthly.find(m => m.channel_id === ch.id && m.month === month)
    const spend = entry?.spend || 0
    const leads = entry?.leads || 0
    const conversions = entry?.conversions || 0
    const cac = conversions > 0 ? spend / conversions : null
    const returnValue = conversions * avgRevenuePerClient
    const roi = spend > 0 ? ((returnValue - spend) / spend) * 100 : null
    return { id: ch.id, name: ch.name, isOrganic: false, spend, leads, conversions, cac, roi, clicks: entry?.clicks, reach: entry?.reach }
  })
  const organicRows = Object.entries(organicByChannel).map(([name, d]) => ({
    id: name, name, isOrganic: true, spend: 0, leads: d.leads, conversions: d.conversions, cac: null, roi: null,
  }))
  const channelRows = [...paidRows, ...organicRows].sort((a, b) => {
    if (sortBy === 'conversions') return b.conversions - a.conversions
    if (sortBy === 'leads') return b.leads - a.leads
    if (sortBy === 'spend') return b.spend - a.spend
    if (sortBy === 'cac') return (a.cac ?? Infinity) - (b.cac ?? Infinity)
    if (sortBy === 'roi') return (b.roi ?? -Infinity) - (a.roi ?? -Infinity)
    return 0
  })

  // ── Hero KPIs for the selected month ──
  const totalInvestment = paidRows.reduce((s, r) => s + r.spend, 0)
  const totalLeads = channelRows.reduce((s, r) => s + r.leads, 0)
  const totalConversions = channelRows.reduce((s, r) => s + r.conversions, 0)
  const blendedCAC = totalInvestment > 0 && totalConversions > 0 ? totalInvestment / totalConversions : null
  const globalReturn = totalConversions * avgRevenuePerClient
  const globalROI = totalInvestment > 0 ? ((globalReturn - totalInvestment) / totalInvestment) * 100 : null
  const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0

  // ── 12-month evolution: real historical leads/conversions, real logged paid spend ──
  const monthlySeries = Array.from({ length: 12 }, (_, i) => {
    const idx = 11 - i
    const d = new Date(now.getFullYear(), now.getMonth() - idx, 1)
    const key = d.toISOString().slice(0, 7)
    const appsInMonth = applications.filter(a => a.created_at?.slice(0, 7) === key)
    const spend = channelMonthly.filter(m => m.month === key).reduce((s, m) => s + (m.spend || 0), 0)
    return { label: d.toLocaleString('en-US', { month: 'short' }), leads: appsInMonth.length, conversions: appsInMonth.filter(a => a.status === 'approved').length, spend }
  })

  // ── Funnel — real, lifetime-to-date: Applications → Approved → Active client with ≥1 order ──
  const funnelApplied = applications.length
  const funnelApproved = applications.filter(a => a.status === 'approved').length
  const funnelActive = clientWithOrderEmails.size

  // ── Verdict ──
  const spendingChannels = paidRows.filter(r => r.spend > 0)
  const bestOrganic = organicRows.sort((a, b) => b.conversions - a.conversions)[0]
  let verdict = null
  if (spendingChannels.length === 0) {
    verdict = {
      tone: 'info',
      text: bestOrganic
        ? `No paid spend logged yet for ${monthName(month)}. Your top organic source is "${bestOrganic.name}" with ${bestOrganic.leads} lead${bestOrganic.leads===1?'':'s'} and ${bestOrganic.conversions} conversion${bestOrganic.conversions===1?'':'s'}. Once you start running Google Ads, log the spend here each month to see real CAC and ROI.`
        : `No leads or paid spend logged yet for ${monthName(month)}. Once applications come in and you log Google Ads spend, this card will tell you what's working.`,
    }
  } else {
    const best = [...spendingChannels].sort((a, b) => (a.cac ?? Infinity) - (b.cac ?? Infinity))[0]
    const worst = [...spendingChannels].sort((a, b) => (b.cac ?? -Infinity) - (a.cac ?? -Infinity))[0]
    const cacVsValue = best.cac !== null && avgRevenuePerClient > 0 ? (best.cac / avgRevenuePerClient) * 100 : null
    verdict = {
      tone: best.roi !== null && best.roi < 0 ? 'warn' : 'good',
      text: best === worst
        ? `"${best.name}" is your only paid channel with spend this month: ${fmtMoney(best.spend)} → ${best.conversions} conversion${best.conversions===1?'':'s'} at ${best.cac !== null ? fmtMoney(best.cac) : '—'} CAC.${cacVsValue !== null ? ` That's ${cacVsValue.toFixed(0)}% of your average client value (${fmtMoney(avgRevenuePerClient)}) — ${cacVsValue < 40 ? 'a healthy ratio, consider scaling it up.' : cacVsValue < 80 ? 'workable, but watch it closely as you scale.' : 'tight — a client needs to reorder to be profitable here.'}` : ''}`
        : `"${best.name}" is your best-performing paid channel at ${fmtMoney(best.cac)} CAC, vs. "${worst.name}" at ${fmtMoney(worst.cac)}. Consider shifting budget from "${worst.name}" toward "${best.name}".`,
    }
  }

  // ── Alerts ──
  const alerts = []
  activeChannels.forEach(ch => {
    const last3keys = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1)
      return d.toISOString().slice(0, 7)
    })
    const cacs = last3keys.map(k => {
      const m = channelMonthly.find(x => x.channel_id === ch.id && x.month === k)
      if (!m || !m.spend || !m.conversions) return null
      return m.spend / m.conversions
    })
    if (cacs[0] !== null && cacs[1] !== null && cacs[2] !== null && cacs[2] > cacs[1] && cacs[1] > cacs[0]) {
      alerts.push({ color: '#FBBF24', icon: IC.trend, text: `"${ch.name}" CAC has risen for 2 months in a row (${fmtMoney(cacs[0])} → ${fmtMoney(cacs[1])} → ${fmtMoney(cacs[2])}).` })
    }
    const thisEntry = channelMonthly.find(m => m.channel_id === ch.id && m.month === month)
    if (thisEntry && thisEntry.spend > 0 && (thisEntry.conversions || 0) === 0) {
      alerts.push({ color: '#FF3B3B', icon: IC.alert, text: `"${ch.name}" spent ${fmtMoney(thisEntry.spend)} in ${monthName(month)} with zero conversions.` })
    }
  })
  campaigns.filter(c => c.status === 'active').forEach(c => {
    const m = campaignMonthly.find(x => x.campaign_id === c.id && x.month === month)
    if (m && m.spend > 0 && (m.conversions || 0) === 0) {
      alerts.push({ color: '#FF3B3B', icon: IC.alert, text: `Campaign "${c.name}" spent ${fmtMoney(m.spend)} in ${monthName(month)} with zero conversions.` })
    }
  })
  if (spendingChannels.length === 0 && dbReady) {
    alerts.push({ color: '#60A5FA', icon: IC.info, text: `No paid spend logged for ${monthName(month)} yet — use "Load data" to enter this month's Google Ads numbers.` })
  }

  function monthName(key) {
    const [y, m] = key.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }
  function shiftMonth(delta) {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setMonth(d.toISOString().slice(0, 7))
  }

  // ── Data entry actions ──
  const openModal = () => {
    const f = {}
    activeChannels.forEach(ch => {
      const entry = channelMonthly.find(m => m.channel_id === ch.id && m.month === month)
      f[ch.id] = { spend: entry?.spend ?? '', leads: entry?.leads ?? '', conversions: entry?.conversions ?? '', clicks: entry?.clicks ?? '', reach: entry?.reach ?? '' }
    })
    setLogForm(f)
    setModalTab('log')
    setShowModal(true)
  }

  const saveLog = async () => {
    setSavingLog(true)
    const supabase = createClient()
    const rows = activeChannels.map(ch => {
      const f = logForm[ch.id] || {}
      return {
        channel_id: ch.id, month,
        spend: parseFloat(f.spend) || 0,
        leads: parseInt(f.leads) || 0,
        conversions: parseInt(f.conversions) || 0,
        clicks: f.clicks === '' || f.clicks === undefined ? null : parseInt(f.clicks),
        reach: f.reach === '' || f.reach === undefined ? null : parseInt(f.reach),
      }
    })
    if (rows.length > 0) {
      const { data } = await supabase.from('marketing_channel_monthly').upsert(rows, { onConflict: 'channel_id,month' }).select()
      if (data) setChannelMonthly(prev => [...prev.filter(m => !(m.month === month && rows.some(r => r.channel_id === m.channel_id))), ...data])
    }
    setSavingLog(false)
    setShowModal(false)
  }

  const addChannel = async () => {
    if (!newChannelName.trim()) return
    const supabase = createClient()
    const { data } = await supabase.from('marketing_channels').insert([{ name: newChannelName.trim(), is_organic: false, is_active: true }]).select()
    if (data) setChannels(c => [...c, ...data])
    setNewChannelName('')
  }
  const archiveChannel = async (id) => {
    await createClient().from('marketing_channels').update({ is_active: false }).eq('id', id)
    setChannels(c => c.map(ch => ch.id === id ? { ...ch, is_active: false } : ch))
  }

  const addCampaign = async () => {
    if (!newCampaign.name.trim()) return
    const supabase = createClient()
    const row = { name: newCampaign.name.trim(), channel_id: newCampaign.channel_id || null, status: 'active' }
    const { data } = await supabase.from('marketing_campaigns').insert([row]).select()
    if (data) setCampaigns(c => [...c, ...data])
    setNewCampaign({ name: '', channel_id: '' })
  }
  const archiveCampaign = async (id) => {
    await createClient().from('marketing_campaigns').update({ status: 'archived' }).eq('id', id)
    setCampaigns(c => c.map(x => x.id === id ? { ...x, status: 'archived' } : x))
  }

  const exportCSV = () => {
    const header = 'channel,month,spend,leads,conversions,clicks,reach\n'
    const lines = channelMonthly.map(m => {
      const ch = channels.find(c => c.id === m.channel_id)
      return [ch?.name || m.channel_id, m.month, m.spend, m.leads, m.conversions, m.clicks ?? '', m.reach ?? ''].join(',')
    })
    const blob = new Blob([header + lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `levam-marketing-${month}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const importCSV = async (file) => {
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1)
    const supabase = createClient()
    const rows = []
    for (const line of lines) {
      const [chName, m, spend, leads, conversions, clicks, reach] = line.split(',')
      let ch = channels.find(c => c.name === chName?.trim())
      if (!ch && chName) {
        const { data } = await supabase.from('marketing_channels').insert([{ name: chName.trim(), is_organic: false, is_active: true }]).select()
        if (data) { ch = data[0]; setChannels(c => [...c, ...data]) }
      }
      if (ch && m) rows.push({ channel_id: ch.id, month: m.trim(), spend: parseFloat(spend) || 0, leads: parseInt(leads) || 0, conversions: parseInt(conversions) || 0, clicks: clicks ? parseInt(clicks) : null, reach: reach ? parseInt(reach) : null })
    }
    if (rows.length > 0) {
      const { data } = await supabase.from('marketing_channel_monthly').upsert(rows, { onConflict: 'channel_id,month' }).select()
      if (data) setChannelMonthly(prev => {
        const keys = new Set(data.map(d => `${d.channel_id}-${d.month}`))
        return [...prev.filter(m => !keys.has(`${m.channel_id}-${m.month}`)), ...data]
      })
    }
  }

  // ── Charts ──
  useEffect(() => {
    if (loading || !barCanvasRef.current || !funnelCanvasRef.current) return

    chartsRef.current.bar?.destroy()
    chartsRef.current.bar = new Chart(barCanvasRef.current, {
      data: {
        labels: monthlySeries.map(m => m.label),
        datasets: [
          { type: 'bar', label: 'Spend', data: monthlySeries.map(m => m.spend), backgroundColor: 'rgba(255,59,59,0.55)', borderRadius: 4, maxBarThickness: 22, yAxisID: 'y' },
          { type: 'line', label: 'Conversions', data: monthlySeries.map(m => m.conversions), borderColor: '#4ADE80', backgroundColor: '#4ADE80', pointRadius: 3, tension: 0.3, yAxisID: 'y1' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: 'rgba(220,200,200,0.7)', font: { size: 10 } } },
          tooltip: { backgroundColor: '#1C1212', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#fff', bodyColor: '#D8C6C6', padding: 10 },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: 'rgba(220,200,200,0.6)', font: { size: 10 } } },
          y: { position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(220,200,200,0.5)', font: { size: 9 }, callback: (v) => `$${v}` } },
          y1: { position: 'right', grid: { display: false }, ticks: { color: 'rgba(74,222,128,0.7)', font: { size: 9 }, stepSize: 1 } },
        },
      },
    })

    chartsRef.current.funnel?.destroy()
    const funnelData = [funnelApplied, funnelApproved, funnelActive]
    chartsRef.current.funnel = new Chart(funnelCanvasRef.current, {
      type: 'bar',
      data: {
        labels: ['Applications', 'Approved', 'Active (ordered)'],
        datasets: [{ data: funnelData, backgroundColor: ['#FF3B3B', '#FF6B4A', '#4ADE80'], borderRadius: 6, barThickness: 34 }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1C1212', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#fff', bodyColor: '#D8C6C6' } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(220,200,200,0.5)', font: { size: 9 } } },
          y: { grid: { display: false }, ticks: { color: 'rgba(220,200,200,0.7)', font: { size: 11 } } },
        },
      },
    })

    return () => { chartsRef.current.bar?.destroy(); chartsRef.current.funnel?.destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, month, applications, channelMonthly])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#120C0C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter",-apple-system,sans-serif' }}>
      <style>{`@keyframes pulseDot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, margin: '0 auto 16px', borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(255,59,59,0.15)', borderTopColor: '#FF3B3B', borderRadius: '50%', animation: 'pulseDot 1s linear infinite' }} />
        <div style={{ fontSize: 11, color: 'rgba(220,200,200,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Loading marketing data…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#120C0C', minHeight: '100vh', fontFamily: '"Inter",-apple-system,sans-serif', color: '#F5EDED' }}>
      <style>{`
        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.01em; }
        .lc-mono { font-family:'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace; font-variant-numeric: tabular-nums; }
        @keyframes pulseDot { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        a:hover { color: #fff !important; }
        input:focus, select:focus { outline: none; border-color: rgba(255,59,59,0.5) !important; }
      `}</style>

      <AdminNav active="Marketing" newOrders={0} unreadMessages={0} pendingApps={0} onLogout={handleLogout} now={now} />

      {!dbReady && (
        <div style={{ padding: '0.75rem 2rem', background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.2)', fontSize: 12, color: '#FBBF24' }}>
          ⚠ The marketing tables don't exist in Supabase yet, so paid-channel tracking is disabled. Organic leads below are still real. Ask Claude for the setup SQL to enable channels, spend logging and campaigns.
        </div>
      )}

      {/* HERO HEADER */}
      <div style={{ position: 'relative', padding: '2.25rem 2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-40%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(255,59,59,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '15%', width: 360, height: 360, background: 'radial-gradient(circle,rgba(255,107,74,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#FF3B3B', fontWeight: 700, marginBottom: 8 }}>Marketing performance</div>
            <h1 className="lc-display" style={{ fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 5, letterSpacing: '-0.02em' }}>Channel &amp; campaign ROI</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => shiftMonth(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#D8C6C6', width: 26, height: 26, borderRadius: 6, cursor: 'pointer' }}>‹</button>
              <p style={{ fontSize: 13, color: 'rgba(220,200,200,0.7)', minWidth: 160, textAlign: 'center' }}>{monthName(month)}</p>
              <button onClick={() => shiftMonth(1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#D8C6C6', width: 26, height: 26, borderRadius: 6, cursor: 'pointer' }}>›</button>
            </div>
          </div>
          <button onClick={openModal} disabled={!dbReady} style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: dbReady ? 'linear-gradient(135deg,#FF3B3B,#FF6B4A)' : 'rgba(255,255,255,0.06)', border: 'none', padding: '11px 18px', borderRadius: 8, cursor: dbReady ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6, boxShadow: dbReady ? '0 4px 20px rgba(255,59,59,0.35)' : 'none' }}>
            {IC.upload} Load data
          </button>
        </div>

        {/* HERO KPIs */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          <KpiTile label="Total investment" value={fmtMoney(totalInvestment)} sub={`${activeChannels.length} paid channel${activeChannels.length===1?'':'s'}`} color="#FF3B3B" />
          <KpiTile label="Leads / conversions" value={`${totalLeads} / ${totalConversions}`} sub={`${conversionRate.toFixed(1)}% conversion rate`} color="#60A5FA" ring={conversionRate} />
          <KpiTile label="Blended CAC" value={blendedCAC !== null ? fmtMoney(blendedCAC) : '—'} sub={blendedCAC !== null ? 'per conversion' : 'no paid spend yet'} color="#FBBF24" />
          <KpiTile label="ROI" value={globalROI !== null ? `${globalROI >= 0 ? '+' : ''}${globalROI.toFixed(0)}%` : '—'} sub={globalROI !== null ? `$${(globalROI/100+1).toFixed(2)} back per $1` : 'no paid spend yet'} color={globalROI === null ? '#9CA3AF' : globalROI >= 0 ? '#4ADE80' : '#FF3B3B'} ring={globalROI !== null ? Math.min(100, Math.max(0, globalROI)) : null} />
        </div>
      </div>

      {/* CHANNEL TABLE */}
      <div style={{ padding: '1.5rem 2rem 0' }}>
        <Panel title="Channels" icon={IC.grid} accent="#FF3B3B">
          <div style={{ padding: '0.5rem 1.1rem 1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr>
                  {[['name','Channel'],['spend','Investment'],['leads','Leads'],['conversions','Conversions'],['cac','CAC'],['roi','ROI']].map(([key,label]) => (
                    <th key={key} onClick={() => key !== 'name' && setSortBy(key)} style={{ textAlign: key === 'name' ? 'left' : 'right', padding: '8px 10px', fontSize: 9.5, color: sortBy === key ? '#FF3B3B' : 'rgba(220,200,200,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: key !== 'name' ? 'pointer' : 'default', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {channelRows.map(r => {
                  const semaphore = r.isOrganic ? '#4ADE80' : r.roi === null ? 'rgba(220,200,200,0.3)' : r.roi >= 50 ? '#4ADE80' : r.roi >= 0 ? '#FBBF24' : '#FF3B3B'
                  return (
                    <tr key={r.id}>
                      <td style={{ padding: '10px', fontSize: 12.5, fontWeight: 600, color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: semaphore, flexShrink: 0 }} />
                          {r.name}
                          {r.isOrganic && <span style={{ fontSize: 8.5, padding: '2px 7px', borderRadius: 8, background: 'rgba(74,222,128,0.12)', color: '#4ADE80', fontWeight: 700 }}>ORGANIC</span>}
                        </span>
                      </td>
                      <td className="lc-mono" style={{ padding: '10px', fontSize: 12, textAlign: 'right', color: '#D8C6C6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.isOrganic ? '$0' : fmtMoney(r.spend)}</td>
                      <td className="lc-mono" style={{ padding: '10px', fontSize: 12, textAlign: 'right', color: '#D8C6C6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.leads}</td>
                      <td className="lc-mono" style={{ padding: '10px', fontSize: 12, textAlign: 'right', color: '#D8C6C6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.conversions}</td>
                      <td className="lc-mono" style={{ padding: '10px', fontSize: 12, textAlign: 'right', color: '#D8C6C6', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.cac !== null ? fmtMoney(r.cac) : '—'}</td>
                      <td className="lc-mono" style={{ padding: '10px', fontSize: 12, fontWeight: 700, textAlign: 'right', color: semaphore, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{r.isOrganic ? '—' : r.roi !== null ? `${r.roi >= 0 ? '+' : ''}${r.roi.toFixed(0)}%` : '—'}</td>
                    </tr>
                  )
                })}
                {channelRows.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', fontSize: 12, color: 'rgba(220,200,200,0.4)' }}>No leads or spend logged for {monthName(month)} yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* CAMPAIGNS + EVOLUTION */}
      <div style={{ padding: '1rem 2rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Panel title="Campaign ROI" icon={IC.megaphone} accent="#FF6B4A">
          <div style={{ padding: '1.1rem' }}>
            {campaigns.filter(c => c.status === 'active').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                <div style={{ fontSize: 12, color: 'rgba(220,200,200,0.5)', marginBottom: 10 }}>No active campaigns yet.</div>
                <button onClick={() => { setModalTab('campaigns'); setShowModal(true) }} disabled={!dbReady} style={{ fontSize: 11, fontWeight: 700, color: '#FF6B4A', background: 'rgba(255,107,74,0.1)', border: '1px solid rgba(255,107,74,0.3)', padding: '8px 16px', borderRadius: 8, cursor: dbReady ? 'pointer' : 'not-allowed' }}>+ Add your first campaign</button>
              </div>
            ) : campaigns.filter(c => c.status === 'active').map(c => {
              const m = campaignMonthly.find(x => x.campaign_id === c.id && x.month === month)
              const spend = m?.spend || 0, conversions = m?.conversions || 0
              const roi = spend > 0 ? (((conversions * avgRevenuePerClient) - spend) / spend) * 100 : null
              const pct = Math.min(100, Math.max(4, roi !== null ? Math.abs(roi) : 4))
              return (
                <div key={c.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{c.name}</span>
                    <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, color: roi === null ? 'rgba(220,200,200,0.4)' : roi >= 0 ? '#4ADE80' : '#FF3B3B' }}>{roi !== null ? `${roi >= 0 ? '+' : ''}${roi.toFixed(0)}%` : 'no spend'}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: roi === null ? 'rgba(220,200,200,0.2)' : roi >= 0 ? '#4ADE80' : '#FF3B3B', borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel title="12-month evolution" icon={IC.chart} accent="#FF3B3B">
          <div style={{ padding: '1rem 1rem 0.5rem', height: 200 }}>
            <canvas ref={barCanvasRef} />
          </div>
        </Panel>
      </div>

      {/* FUNNEL + VERDICT + ALERTS */}
      <div style={{ padding: '1rem 2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <Panel title="Funnel (lifetime)" icon={IC.filter} accent="#60A5FA">
          <div style={{ padding: '1rem', height: 200 }}>
            <canvas ref={funnelCanvasRef} />
          </div>
          <div style={{ padding: '0 1.1rem 1rem', fontSize: 10, color: 'rgba(220,200,200,0.45)' }}>
            {funnelApplied > 0 && `${((funnelApproved/funnelApplied)*100).toFixed(0)}% applied → approved · ${funnelApproved > 0 ? ((funnelActive/funnelApproved)*100).toFixed(0) : 0}% approved → ordered`}
          </div>
        </Panel>

        <Panel title="Verdict of the month" icon={IC.check} accent={verdict.tone === 'warn' ? '#FBBF24' : verdict.tone === 'info' ? '#60A5FA' : '#4ADE80'}>
          <div style={{ padding: '1.1rem', fontSize: 12, color: '#D8C6C6', lineHeight: 1.7 }}>{verdict.text}</div>
        </Panel>

        <Panel title={`Alerts${alerts.length > 0 ? ` (${alerts.length})` : ''}`} icon={IC.alert} accent={alerts.length > 0 ? '#FF3B3B' : '#4ADE80'} alert={alerts.length > 0}>
          {alerts.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ color: '#4ADE80', marginBottom: 6 }}>{IC.check}</div>
              <div style={{ fontSize: 11, color: 'rgba(220,200,200,0.5)' }}>Nothing needs attention</div>
            </div>
          ) : (
            <div style={{ padding: '0.4rem 0' }}>
              {alerts.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '0.6rem 1.1rem', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ color: a.color, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
                  <span style={{ fontSize: 11, color: 'rgba(245,237,237,0.85)', lineHeight: 1.5 }}>{a.text}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* LOAD DATA MODAL */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(10,6,6,0.8)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 460, maxHeight: '85vh', overflowY: 'auto', background: '#1C1212', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem' }}>
              {[['log','Log month'],['channels','Channels'],['campaigns','Campaigns'],['csv','CSV']].map(([k,l]) => (
                <button key={k} onClick={() => setModalTab(k)} style={{ flex: 1, padding: '8px 4px', fontSize: 10.5, fontWeight: 700, color: modalTab === k ? '#fff' : 'rgba(220,200,200,0.5)', background: modalTab === k ? 'rgba(255,59,59,0.15)' : 'transparent', border: '1px solid ' + (modalTab === k ? 'rgba(255,59,59,0.3)' : 'rgba(255,255,255,0.08)'), borderRadius: 8, cursor: 'pointer' }}>{l}</button>
              ))}
            </div>

            {modalTab === 'log' && (
              <div>
                <div className="lc-display" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{monthName(month)}</div>
                <div style={{ fontSize: 11, color: 'rgba(220,200,200,0.5)', marginBottom: '1rem' }}>Enter what each paid channel spent and produced this month.</div>
                {activeChannels.length === 0 && <div style={{ fontSize: 12, color: 'rgba(220,200,200,0.5)', textAlign: 'center', padding: '1rem 0' }}>No paid channels yet — add one in the "Channels" tab.</div>}
                {activeChannels.map(ch => (
                  <div key={ch.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{ch.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <LabeledInput label="Spend ($)" value={logForm[ch.id]?.spend} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], spend: v } }))} />
                      <LabeledInput label="Leads" value={logForm[ch.id]?.leads} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], leads: v } }))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <LabeledInput label="Conversions" value={logForm[ch.id]?.conversions} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], conversions: v } }))} />
                      <LabeledInput label="Clicks (opt.)" value={logForm[ch.id]?.clicks} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], clicks: v } }))} />
                      <LabeledInput label="Reach (opt.)" value={logForm[ch.id]?.reach} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], reach: v } }))} />
                    </div>
                  </div>
                ))}
                {activeChannels.length > 0 && (
                  <button onClick={saveLog} disabled={savingLog} style={{ width: '100%', padding: 12, background: savingLog ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#FF3B3B,#FF6B4A)', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', borderRadius: 8, cursor: savingLog ? 'not-allowed' : 'pointer' }}>{savingLog ? 'Saving…' : 'Save this month'}</button>
                )}
              </div>
            )}

            {modalTab === 'channels' && (
              <div>
                <div className="lc-display" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Paid channels</div>
                {channels.map(ch => (
                  <div key={ch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 12.5, color: ch.is_active === false ? 'rgba(220,200,200,0.35)' : '#fff' }}>{ch.name}{ch.is_active === false && ' (archived)'}</span>
                    {ch.is_active !== false && <button onClick={() => archiveChannel(ch.id)} style={{ fontSize: 10, color: '#FF3B3B', background: 'none', border: 'none', cursor: 'pointer' }}>Archive</button>}
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                  <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="e.g. Meta Ads, TikTok Ads"
                    style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, padding: '9px 11px', borderRadius: 6, fontFamily: 'inherit' }} />
                  <button onClick={addChannel} style={{ padding: '0 16px', background: 'rgba(255,59,59,0.15)', color: '#FF3B3B', fontSize: 11, fontWeight: 700, border: '1px solid rgba(255,59,59,0.3)', borderRadius: 6, cursor: 'pointer' }}>Add</button>
                </div>
              </div>
            )}

            {modalTab === 'campaigns' && (
              <div>
                <div className="lc-display" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Campaigns</div>
                {campaigns.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 12.5, color: c.status === 'archived' ? 'rgba(220,200,200,0.35)' : '#fff' }}>{c.name}{c.status === 'archived' && ' (archived)'}</span>
                    {c.status !== 'archived' && <button onClick={() => archiveCampaign(c.id)} style={{ fontSize: 10, color: '#FF3B3B', background: 'none', border: 'none', cursor: 'pointer' }}>Archive</button>}
                  </div>
                ))}
                {campaigns.length === 0 && <div style={{ fontSize: 12, color: 'rgba(220,200,200,0.5)', padding: '0.5rem 0' }}>No campaigns yet.</div>}
                <input value={newCampaign.name} onChange={e => setNewCampaign(f => ({ ...f, name: e.target.value }))} placeholder="Campaign name, e.g. August Launch"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, padding: '9px 11px', borderRadius: 6, fontFamily: 'inherit', marginTop: 12, marginBottom: 8, boxSizing: 'border-box' }} />
                <select value={newCampaign.channel_id} onChange={e => setNewCampaign(f => ({ ...f, channel_id: e.target.value }))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(220,200,200,0.8)', fontSize: 12, padding: '9px 11px', borderRadius: 6, fontFamily: 'inherit', marginBottom: 10 }}>
                  <option value="" style={{ background: '#1C1212' }}>No specific channel</option>
                  {channels.map(ch => <option key={ch.id} value={ch.id} style={{ background: '#1C1212' }}>{ch.name}</option>)}
                </select>
                <button onClick={addCampaign} style={{ width: '100%', padding: 10, background: 'rgba(255,59,59,0.15)', color: '#FF3B3B', fontSize: 11, fontWeight: 700, border: '1px solid rgba(255,59,59,0.3)', borderRadius: 6, cursor: 'pointer' }}>+ Add campaign</button>
              </div>
            )}

            {modalTab === 'csv' && (
              <div>
                <div className="lc-display" style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Backup / import</div>
                <button onClick={exportCSV} style={{ width: '100%', padding: 11, background: 'rgba(255,255,255,0.05)', color: '#D8C6C6', fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', marginBottom: 10 }}>⬇ Export monthly channel data (CSV)</button>
                <label style={{ display: 'block', width: '100%', padding: 11, background: 'rgba(255,59,59,0.1)', color: '#FF3B3B', fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,59,59,0.25)', borderRadius: 8, cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box' }}>
                  ⬆ Import CSV
                  <input type="file" accept=".csv" onChange={e => e.target.files[0] && importCSV(e.target.files[0])} style={{ display: 'none' }} />
                </label>
                <div style={{ fontSize: 10, color: 'rgba(220,200,200,0.4)', marginTop: 10 }}>Columns: channel, month (YYYY-MM), spend, leads, conversions, clicks, reach.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LabeledInput({ label, value, onChange }) {
  return (
    <div>
      <label style={{ fontSize: 8.5, color: 'rgba(220,200,200,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{label}</label>
      <input type="number" value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 12, padding: '8px 9px', borderRadius: 6, fontFamily: 'inherit', boxSizing: 'border-box' }} />
    </div>
  )
}

const IC = {
  grid:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  chart:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  megaphone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>,
  filter:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  check:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  alert:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  trend:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  info:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  upload:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
}
