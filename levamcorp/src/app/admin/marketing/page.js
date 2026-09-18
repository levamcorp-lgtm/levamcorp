'use client'
import { useEffect, useState } from 'react'
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
    { label: 'Broadcast', code: 'BC', href: '/admin/broadcast' },
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

const fmtMoney = (n) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
const arrowBtn = { background: '#ffffff', border: '1px solid #d9dce2', color: '#47505e', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 14 }
const labelStyle = { fontSize: 8.5, color: '#6b7280', letterSpacing: '.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5, fontWeight: 700 }
const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#ffffff', border: '1px solid #d9dce2', color: '#16181d', fontSize: 13, padding: '9px 10px', borderRadius: 7, fontFamily: 'inherit' }

function KpiCard({ k, v, sub, subInk, bar, iBg, iInk, icon }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ height: 4, background: bar }} />
      <div style={{ padding: '13px 15px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6b7280' }}>{k}</span>
          <span style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: 5, background: iBg, color: iInk, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{icon}</span>
        </div>
        <div style={{ paddingTop: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 'clamp(21px,2.1vw,27px)', letterSpacing: '-.04em', color: '#16181d' }}>{v}</div>
        <div style={{ paddingTop: 6, fontSize: 12.5, color: subInk || '#6b7280' }}>{sub}</div>
      </div>
    </div>
  )
}

function LabeledInput({ label, value, onChange, mono }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type="number" value={value ?? ''} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, fontFamily: mono ? "'JetBrains Mono',monospace" : 'inherit' }} />
    </div>
  )
}

export default function AdminMarketing() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [applications, setApplications] = useState([])
  const [clients, setClients] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [channels, setChannels] = useState([])
  const [channelMonthly, setChannelMonthly] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [campaignMonthly, setCampaignMonthly] = useState([])
  const [loading, setLoading] = useState(true)
  const [dbReady, setDbReady] = useState(true)

  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [tab, setTab] = useState('Channels')

  const [showModal, setShowModal] = useState(false)
  const [modalTab, setModalTab] = useState('log')
  const [logForm, setLogForm] = useState({})
  const [savingLog, setSavingLog] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newCampaign, setNewCampaign] = useState({ name: '', channel_id: '' })

  const now = new Date()

  const loadAll = async (supabase) => {
    const [
      { data: apps }, { data: cl }, { data: ord }, { data: prod },
      chRes, chmRes, campRes, campmRes,
    ] = await Promise.all([
      supabase.from('applications').select('id,email,heard_about,status,created_at').order('created_at', { ascending: false }),
      supabase.from('clients').select('id,email,business_name,contact_name,created_at').order('created_at', { ascending: false }),
      supabase.from('orders').select('total,status,submitted_at,notes,order_items(product_id,quantity)'),
      supabase.from('products').select('id,cost_price'),
      supabase.from('marketing_channels').select('*').order('created_at', { ascending: true }),
      supabase.from('marketing_channel_monthly').select('*'),
      supabase.from('marketing_campaigns').select('*').order('created_at', { ascending: true }),
      supabase.from('marketing_campaign_monthly').select('*'),
    ])
    setApplications(apps || [])
    setClients(cl || [])
    setOrders(ord || [])
    setProducts(prod || [])
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
  const emailFor = (o) => (o.notes || '').split('Email: ')[1]?.split(/[\s,|]/)[0]?.trim() || ''
  const getClientOrders = (email) => orders.filter(o => emailFor(o) === email)
  const clientsWithRevenue = clients.map(c => {
    const co = getClientOrders(c.email)
    return {
      ...c,
      revenue: co.filter(o => ['confirmed', 'dispatched', 'completed'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0),
      hasOrder: co.length > 0,
    }
  })
  const totalClientRevenue = clientsWithRevenue.reduce((s, c) => s + c.revenue, 0)
  const avgRevenuePerClient = clients.length > 0 ? totalClientRevenue / clients.length : 0
  const clientWithOrderEmails = new Set(clientsWithRevenue.filter(c => c.hasOrder).map(c => c.email))

  // ── Real average gross margin, from actual order_items × product cost_price (same math as /admin/profit) ──
  const confirmedOrders = orders.filter(o => ['confirmed', 'dispatched', 'completed'].includes(o.status))
  const orderCogs = (o) => (o.order_items || []).reduce((s, item) => {
    const prod = products.find(p => p.id === item.product_id)
    return s + ((prod?.cost_price || 0) * (item.quantity || 0))
  }, 0)
  const revenueAllTime = confirmedOrders.reduce((s, o) => s + (o.total || 0), 0)
  const cogsAllTime = confirmedOrders.reduce((s, o) => s + orderCogs(o), 0)
  const avgMarginRatio = revenueAllTime > 0 ? Math.max(0, (revenueAllTime - cogsAllTime) / revenueAllTime) : 0
  const avgOrdersPerPartner = clientWithOrderEmails.size > 0 ? confirmedOrders.length / clientWithOrderEmails.size : 0
  const estGrossProfitPerPartner = avgRevenuePerClient * avgMarginRatio

  // ── Organic channels — real, derived from applications.heard_about, revenue is the real lifetime total of clients who applied through it ──
  const monthApps = applications.filter(a => a.created_at?.slice(0, 7) === month)
  const organicByChannel = {}
  monthApps.forEach(a => {
    const ch = bucketChannel(a.heard_about)
    if (!organicByChannel[ch]) organicByChannel[ch] = { leads: 0, conversions: 0, revenue: 0 }
    organicByChannel[ch].leads++
    if (a.status === 'approved') {
      organicByChannel[ch].conversions++
      const cl = clientsWithRevenue.find(c => c.email === a.email)
      if (cl) organicByChannel[ch].revenue += cl.revenue
    }
  })

  // ── Paid channels — manual monthly entries; revenue is estimated from the average client value (no per-lead ad attribution exists) ──
  const activeChannels = channels.filter(c => c.is_active !== false)
  const paidRows = activeChannels.map(ch => {
    const entry = channelMonthly.find(m => m.channel_id === ch.id && m.month === month)
    const spend = entry?.spend || 0
    const leads = entry?.leads || 0
    const conversions = entry?.conversions || 0
    const cac = conversions > 0 ? spend / conversions : null
    const cpl = leads > 0 ? spend / leads : null
    const returnValue = conversions * avgRevenuePerClient
    const roi = spend > 0 ? ((returnValue - spend) / spend) * 100 : null
    return { id: ch.id, name: ch.name, isOrganic: false, spend, leads, conversions, cac, cpl, revenue: returnValue, roi, clicks: entry?.clicks, reach: entry?.reach }
  })
  const organicRows = Object.entries(organicByChannel).map(([name, d]) => ({
    id: name, name, isOrganic: true, spend: 0, leads: d.leads, conversions: d.conversions, cac: null, cpl: null, revenue: d.revenue, roi: null,
  }))
  const channelRows = [...paidRows, ...organicRows].sort((a, b) => b.revenue - a.revenue || b.leads - a.leads)

  // ── Hero KPIs for the selected month ──
  const totalInvestment = paidRows.reduce((s, r) => s + r.spend, 0)
  const totalLeads = channelRows.reduce((s, r) => s + r.leads, 0)
  const totalConversions = channelRows.reduce((s, r) => s + r.conversions, 0)
  const blendedCAC = totalInvestment > 0 && totalConversions > 0 ? totalInvestment / totalConversions : null
  const globalReturn = totalConversions * avgRevenuePerClient
  const globalROI = totalInvestment > 0 ? ((globalReturn - totalInvestment) / totalInvestment) * 100 : null
  const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0
  const totalPaidReturn = paidRows.reduce((s, r) => s + r.revenue, 0)
  const totalOrganicRevenue = organicRows.reduce((s, r) => s + r.revenue, 0)

  // ── 12-month evolution: real historical leads/conversions ──
  const monthlySeries = Array.from({ length: 12 }, (_, i) => {
    const idx = 11 - i
    const d = new Date(now.getFullYear(), now.getMonth() - idx, 1)
    const key = d.toISOString().slice(0, 7)
    const appsInMonth = applications.filter(a => a.created_at?.slice(0, 7) === key)
    return { key, label: d.toLocaleString('en-US', { month: 'short' }), leads: appsInMonth.length, conversions: appsInMonth.filter(a => a.status === 'approved').length }
  })
  const maxMonthlyLeads = Math.max(...monthlySeries.map(m => m.leads), 1)

  // ── Funnel — real, lifetime-to-date: Applications → Approved → Active client with ≥1 order ──
  const funnelApplied = applications.length
  const funnelApproved = applications.filter(a => a.status === 'approved').length
  const funnelActive = clientWithOrderEmails.size
  const funnelSteps = [
    { k: 'Applications received', v: funnelApplied, color: ACCENT },
    { k: 'Approved as partner', v: funnelApproved, color: '#16a34a' },
    { k: 'Placed an order', v: funnelActive, color: '#f0b429' },
  ]
  const funnelTop = funnelSteps[0].v || 1

  // ── Rejected applications — real counts, no fabricated reasons (the app doesn't track why) ──
  const totalRejected = applications.filter(a => a.status === 'rejected').length
  const totalApprovedAll = applications.filter(a => a.status === 'approved').length
  const totalDecided = totalRejected + totalApprovedAll
  const rejectionRate = totalDecided > 0 ? (totalRejected / totalDecided) * 100 : 0

  function monthName(key) {
    const [y, m] = key.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  }
  function shiftMonth(delta) {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    setMonth(d.toISOString().slice(0, 7))
  }

  // ── Verdict of the month ──
  const spendingChannels = paidRows.filter(r => r.spend > 0)
  const bestOrganic = [...organicRows].sort((a, b) => b.revenue - a.revenue)[0]
  let verdict
  if (spendingChannels.length === 0) {
    verdict = {
      icon: '!', tone: 'info',
      title: bestOrganic && bestOrganic.leads > 0 ? 'Every partner this month was free — and that is the opportunity' : `No leads recorded yet for ${monthName(month)}`,
      body: bestOrganic && bestOrganic.leads > 0
        ? `No paid spend logged yet for ${monthName(month)}. Your top organic source is "${bestOrganic.name}" with ${bestOrganic.leads} lead${bestOrganic.leads === 1 ? '' : 's'} and ${bestOrganic.conversions} conversion${bestOrganic.conversions === 1 ? '' : 's'}. Once you start running Google Ads, log the spend here each month to see real CAC and ROI.`
        : `No applications or paid spend logged yet for ${monthName(month)}. Once leads come in and you log ad spend, this card will tell you what's working.`,
      cta: 'Log spend', onClick: () => openModal(),
      bg: '#fffbf2', border: '#f3d9a4', bar: '#f0b429', ink: '#8a5a00',
    }
  } else {
    const best = [...spendingChannels].sort((a, b) => (a.cac ?? Infinity) - (b.cac ?? Infinity))[0]
    const worst = [...spendingChannels].sort((a, b) => (b.cac ?? -Infinity) - (a.cac ?? -Infinity))[0]
    const cacVsValue = best.cac !== null && avgRevenuePerClient > 0 ? (best.cac / avgRevenuePerClient) * 100 : null
    const good = best.roi !== null && best.roi >= 0
    verdict = {
      icon: good ? '✓' : '!', tone: good ? 'good' : 'warn',
      title: good ? `Paid marketing is working — best channel is "${best.name}"` : 'Paid marketing is barely paying for itself',
      body: best === worst
        ? `"${best.name}" is your only paid channel with spend this month: ${fmtMoney(best.spend)} → ${best.conversions} conversion${best.conversions === 1 ? '' : 's'} at ${best.cac !== null ? fmtMoney(best.cac) : '—'} CAC.${cacVsValue !== null ? ` That's ${cacVsValue.toFixed(0)}% of your average client value (${fmtMoney(avgRevenuePerClient)}) — ${cacVsValue < 40 ? 'a healthy ratio, consider scaling it up.' : cacVsValue < 80 ? 'workable, but watch it closely as you scale.' : 'tight — a client needs to reorder to be profitable here.'}` : ''}`
        : `"${best.name}" is your best-performing paid channel at ${fmtMoney(best.cac)} CAC, vs. "${worst.name}" at ${fmtMoney(worst.cac)}. Consider shifting budget from "${worst.name}" toward "${best.name}".`,
      cta: good ? 'Increase the budget' : 'Review campaigns', onClick: () => setTab('Campaigns'),
      bg: good ? '#f3faf5' : '#fffbf2', border: good ? '#cfe8d7' : '#f3d9a4', bar: good ? '#16a34a' : '#f0b429', ink: good ? '#166534' : '#8a5a00',
    }
  }

  // ── What to do with the budget — real, no fabricated dollar figures ──
  const worstDeadPaid = paidRows.find(r => r.spend > 0 && r.conversions === 0)
  const advice = [
    {
      icon: '1', iBg: '#dcfce7', iInk: '#166534', titleInk: '#166534',
      t: bestOrganic && bestOrganic.leads > 0 ? `Double down on ${bestOrganic.name}` : 'Find your best channel',
      b: bestOrganic && bestOrganic.leads > 0
        ? `${bestOrganic.name} brought ${bestOrganic.leads} lead${bestOrganic.leads === 1 ? '' : 's'} and ${fmtMoney(bestOrganic.revenue)} in real revenue this month without costing a dollar. Whatever content or activity feeds it, do more of it.`
        : `No organic leads recorded yet for ${monthName(month)}.`,
    },
    {
      icon: '2', iBg: '#e8f0ff', iInk: DEEP, titleInk: DEEP,
      t: avgRevenuePerClient > 0 ? `You can afford up to ${fmtMoney(estGrossProfitPerPartner)} per partner` : 'Set a ceiling before you spend',
      b: avgRevenuePerClient > 0
        ? `A partner is worth ${fmtMoney(avgRevenuePerClient)} in revenue with a ${(avgMarginRatio * 100).toFixed(0)}% average gross margin across your real order history — so paying up to ${fmtMoney(estGrossProfitPerPartner)} to acquire one still breaks even on the first order.`
        : 'No confirmed orders yet to estimate what a partner is worth.',
    },
    {
      icon: '3', iBg: worstDeadPaid ? '#fee2e2' : '#fef3c7', iInk: worstDeadPaid ? '#991b1b' : '#7c4a03', titleInk: worstDeadPaid ? '#991b1b' : '#8a5a00',
      t: worstDeadPaid ? `Stop ${worstDeadPaid.name}` : 'Referrals are your cheapest growth',
      b: worstDeadPaid
        ? `${worstDeadPaid.name} spent ${fmtMoney(worstDeadPaid.spend)} in ${monthName(month)} and produced zero conversions. Pause it or change the approach before next month.`
        : 'Partners who come by referral or organic search cost nothing to acquire. Ask your best clients for one introduction each.',
    },
    {
      icon: '4', iBg: '#ede9fe', iInk: '#5b21b6', titleInk: '#5b21b6',
      t: 'Log the spend every month',
      b: 'Without the numbers in here, cost per partner and return on spend cannot be calculated — you would be guessing whether paid marketing works.',
    },
  ]

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
      alerts.push({ color: '#f0b429', bg: '#fef3c7', ink: '#7c4a03', icon: '↑', text: `"${ch.name}" CAC has risen for 2 months in a row (${fmtMoney(cacs[0])} → ${fmtMoney(cacs[1])} → ${fmtMoney(cacs[2])}).` })
    }
    const thisEntry = channelMonthly.find(m => m.channel_id === ch.id && m.month === month)
    if (thisEntry && thisEntry.spend > 0 && (thisEntry.conversions || 0) === 0) {
      alerts.push({ color: '#dc2626', bg: '#fee2e2', ink: '#991b1b', icon: '!', text: `"${ch.name}" spent ${fmtMoney(thisEntry.spend)} in ${monthName(month)} with zero conversions.` })
    }
  })
  campaigns.filter(c => c.status === 'active').forEach(c => {
    const m = campaignMonthly.find(x => x.campaign_id === c.id && x.month === month)
    if (m && m.spend > 0 && (m.conversions || 0) === 0) {
      alerts.push({ color: '#dc2626', bg: '#fee2e2', ink: '#991b1b', icon: '!', text: `Campaign "${c.name}" spent ${fmtMoney(m.spend)} in ${monthName(month)} with zero conversions.` })
    }
  })
  if (spendingChannels.length === 0 && dbReady) {
    alerts.push({ color: ACCENT, bg: '#e8f0ff', ink: DEEP, icon: 'i', text: `No paid spend logged for ${monthName(month)} yet — use "Log spend" to enter this month's numbers.` })
  }

  // ── Campaigns tab data ──
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const campaignRows = activeCampaigns.map(c => {
    const m = campaignMonthly.find(x => x.campaign_id === c.id && x.month === month)
    const spend = m?.spend || 0
    const conversions = m?.conversions || 0
    const revenue = conversions * avgRevenuePerClient
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : null
    const cpa = conversions > 0 ? spend / conversions : null
    const bad = spend > 0 && conversions === 0
    const good = roi !== null && roi >= 200
    const chName = channels.find(ch => ch.id === c.channel_id)?.name
    return {
      id: c.id, name: c.name, meta: chName || 'No channel set', spend, conversions, revenue, roi, cpa, bad, good,
      verdict: bad ? 'Killed nothing' : roi === null ? 'No spend logged' : good ? `Keep it — ${roi >= 0 ? '+' : ''}${roi.toFixed(0)}%` : `Watch it — ${roi >= 0 ? '+' : ''}${roi.toFixed(0)}%`,
      vBg: bad ? '#fee2e2' : good ? '#dcfce7' : roi === null ? '#f1f2f5' : '#fef3c7',
      vInk: bad ? '#991b1b' : good ? '#166534' : roi === null ? '#6b7280' : '#7c4a03',
      edge: bad ? '#dc2626' : good ? '#16a34a' : '#f0b429',
    }
  })
  const campSpendSum = campaignRows.reduce((s, c) => s + c.spend, 0)
  const campRevenueSum = campaignRows.reduce((s, c) => s + c.revenue, 0)

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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading marketing data…</div>
      </div>
    </div>
  )

  const shellCols = sidebarOpen ? 'clamp(210px,16vw,244px) minmax(0,1fr)' : '76px minmax(0,1fr)'
  const twoCols = 'minmax(0,1.15fr) minmax(290px,.85fr)'
  const tabDefs = [
    { key: 'Channels', label: 'Channels', icon: 'C' },
    { key: 'Campaigns', label: 'Campaigns', icon: '$' },
    { key: 'Funnel', label: 'Funnel', icon: 'F' },
  ]
  const kpiDefs = [
    { k: 'Total investment', v: fmtMoney(totalInvestment), sub: `${activeChannels.length} paid channel${activeChannels.length === 1 ? '' : 's'}`, subInk: '#6b7280', icon: '$', bar: '#dc2626', iBg: '#fee2e2', iInk: '#991b1b' },
    { k: 'Leads / conversions', v: `${totalLeads} / ${totalConversions}`, sub: `${conversionRate.toFixed(1)}% conversion rate`, subInk: '#6b7280', icon: 'L', bar: ACCENT, iBg: '#e8f0ff', iInk: DEEP },
    { k: 'Blended CAC', v: blendedCAC !== null ? fmtMoney(blendedCAC) : '—', sub: blendedCAC !== null ? 'per conversion' : 'no paid spend yet', subInk: blendedCAC !== null ? '#6b7280' : '#b45309', icon: 'C', bar: '#f0b429', iBg: '#fef3c7', iInk: '#7c4a03' },
    { k: 'ROI', v: globalROI !== null ? `${globalROI >= 0 ? '+' : ''}${globalROI.toFixed(0)}%` : '—', sub: globalROI !== null ? `$${(globalROI / 100 + 1).toFixed(2)} back per $1` : 'no paid spend yet', subInk: globalROI === null ? '#6b7280' : globalROI >= 0 ? '#166534' : '#991b1b', icon: 'R', bar: '#7c3aed', iBg: '#ede9fe', iInk: '#5b21b6' },
    { k: 'Revenue attributed', v: fmtMoney(globalReturn), sub: 'from conversions this month', subInk: '#6b7280', icon: '$', bar: '#0ea5e9', iBg: '#e0f2fe', iInk: '#075985' },
  ]
  const chCols = 'minmax(230px,1.8fr) 100px 84px 104px 118px 118px 108px'
  const campCols = 'minmax(230px,1.8fr) 106px 96px 144px 118px 168px'

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        .amk-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .amk-shell { grid-template-columns:1fr !important; } .amk-shell > div:first-child { position:static !important; max-height:none !important; } }
        .amk-2col { display:grid; grid-template-columns:${twoCols}; gap:clamp(14px,1.8vw,18px); align-items:start; }
        @media(max-width:820px){ .amk-2col { grid-template-columns:1fr !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="amk-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={{}} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Marketing</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{monthName(month)} · {totalLeads} leads · {totalConversions} new partners</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button" onClick={() => shiftMonth(-1)} style={arrowBtn}>‹</button>
                <span className="lc-mono" style={{ fontSize: 12.5, color: '#47505e', minWidth: 150, textAlign: 'center' }}>{monthName(month)}</span>
                <button type="button" onClick={() => shiftMonth(1)} style={arrowBtn}>›</button>
              </span>
              <button type="button" onClick={openModal} disabled={!dbReady} style={{ border: 0, cursor: dbReady ? 'pointer' : 'not-allowed', padding: '10px 15px 11px', borderRadius: 8, background: dbReady ? ACCENT : '#c9ced6', color: '#ffffff', fontSize: 14, fontWeight: 700 }}>+ Log spend</button>
              <button type="button" onClick={handleLogout} style={{ padding: '10px 13px 11px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>

            {!dbReady && (
              <div style={{ padding: '12px 16px', background: '#fef3c7', border: '1px solid #f3d9a4', borderRadius: 10, fontSize: 13, color: '#7c4a03' }}>
                ⚠ The marketing tables don't exist in Supabase yet, so paid-channel tracking is disabled. Organic leads below are still real. Ask Claude for the setup SQL to enable channels, spend logging and campaigns.
              </div>
            )}

            {/* VERDICT HERO */}
            <div style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr) auto', gap: 12, alignItems: 'center', background: verdict.bg, border: `1px solid ${verdict.border}`, borderRadius: 12, padding: '15px 16px 16px' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: verdict.bar, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700 }}>{verdict.icon}</span>
              <span>
                <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.015em', color: verdict.ink }}>{verdict.title}</span>
                <span style={{ display: 'block', paddingTop: 5, fontSize: 13.5, lineHeight: 1.55, color: '#47505e' }}>{verdict.body}</span>
              </span>
              <button type="button" onClick={verdict.onClick} style={{ cursor: 'pointer', border: 0, borderRadius: 8, background: verdict.bar, color: '#ffffff', padding: '11px 14px 12px', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{verdict.cta}</button>
            </div>

            {/* KPI STRIP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
              {kpiDefs.map(k => <KpiCard key={k.k} {...k} />)}
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

            {/* ── CHANNELS TAB ── */}
            {tab === 'Channels' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <span>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Where your partners come from</span>
                      <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Leads, approvals and the revenue each channel actually produced</span>
                    </span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{monthName(month)}</span>
                  </div>
                  <div data-scroll style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 980 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: chCols, gap: 12, alignItems: 'center', padding: '10px 16px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                        <span>Channel</span><span style={{ textAlign: 'right' }}>Spend</span><span style={{ textAlign: 'right' }}>Leads</span><span style={{ textAlign: 'right' }}>Approved</span><span style={{ textAlign: 'right' }}>Cost/lead</span><span style={{ textAlign: 'right' }}>Revenue</span><span style={{ textAlign: 'center' }}>Return</span>
                      </div>
                      {channelRows.map(r => {
                        const dead = !r.isOrganic && r.spend > 0 && r.conversions === 0
                        const best = r.isOrganic && r.revenue > 0
                        return (
                          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: chCols, gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5', background: dead ? '#fffafa' : '#ffffff', borderLeft: `4px solid ${dead ? '#dc2626' : best ? '#16a34a' : 'transparent'}` }}>
                            <span style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 9 }}>
                              <span style={{ flex: 'none', width: 9, height: 9, borderRadius: 3, background: r.isOrganic ? '#16a34a' : '#dc2626' }} />
                              <span style={{ fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                              <span style={{ flex: 'none', fontSize: 11, fontWeight: 700, padding: '2px 7px 3px', borderRadius: 4, background: r.isOrganic ? '#dcfce7' : '#fee2e2', color: r.isOrganic ? '#166534' : '#991b1b' }}>{r.isOrganic ? 'ORGANIC' : 'PAID'}</span>
                            </span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, color: r.isOrganic ? '#c9ced6' : '#991b1b' }}>{r.isOrganic ? '—' : fmtMoney(r.spend)}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15, fontWeight: 700 }}>{r.leads}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, color: r.conversions ? '#166534' : '#c9ced6' }}>{r.conversions}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, color: r.cpl ? '#16181d' : '#166534' }}>{r.cpl ? fmtMoney(r.cpl) : 'Free'}</span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: r.revenue ? '#166534' : '#c9ced6' }}>{r.revenue ? fmtMoney(r.revenue) : '—'}</span>
                            <span style={{ textAlign: 'center' }}>
                              <span className="lc-mono" style={{ display: 'inline-block', fontSize: 13, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: r.isOrganic ? '#dcfce7' : dead ? '#fee2e2' : r.roi === null ? '#f1f2f5' : r.roi >= 50 ? '#dcfce7' : r.roi >= 0 ? '#fef3c7' : '#fee2e2', color: r.isOrganic ? '#166534' : dead ? '#991b1b' : r.roi === null ? '#6b7280' : r.roi >= 50 ? '#166534' : r.roi >= 0 ? '#7c4a03' : '#991b1b' }}>{r.isOrganic ? 'Free' : r.roi !== null ? `${r.roi >= 0 ? '+' : ''}${r.roi.toFixed(0)}%` : '—'}</span>
                            </span>
                          </div>
                        )
                      })}
                      {channelRows.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', fontSize: 12.5, color: '#8b909a' }}>No leads or spend logged for {monthName(month)} yet.</div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: chCols, gap: 12, alignItems: 'center', padding: '13px 16px 14px', background: '#fafbfc', fontWeight: 700 }}>
                        <span style={{ fontSize: 14 }}>{channelRows.length} channel{channelRows.length === 1 ? '' : 's'}</span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5 }}>{totalInvestment ? fmtMoney(totalInvestment) : '—'}</span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5 }}>{totalLeads}</span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, color: '#166534' }}>{totalConversions}</span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, color: '#47505e' }}>{totalLeads > 0 && totalInvestment > 0 ? fmtMoney(totalInvestment / totalLeads) : 'Free'}</span>
                        <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15.5, letterSpacing: '-.02em', color: '#166534' }}>{fmtMoney(totalPaidReturn + totalOrganicRevenue)}</span>
                        <span className="lc-mono" style={{ textAlign: 'center', fontSize: 13.5, color: '#166534' }}>{globalROI !== null ? `${globalROI >= 0 ? '+' : ''}${globalROI.toFixed(0)}%` : 'Free'}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '10px 16px 14px', fontSize: 11.5, color: '#8b909a' }}>Paid-channel revenue is estimated from your average client value ({fmtMoney(avgRevenuePerClient)}); organic revenue is the real lifetime total from clients who applied through that channel this month.</div>
                </div>

                <div className="amk-2col">
                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Leads per month</div>
                      <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Blue is leads, green is the ones that became partners</div>
                    </div>
                    <div style={{ padding: '16px 16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'clamp(5px,1vw,12px)', height: 180 }}>
                        {monthlySeries.map((m, i) => (
                          <div key={m.key} title={`${m.label} · ${m.leads} leads · ${m.conversions} became partners`} style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                            <span style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                              <span style={{ width: '100%', borderRadius: '3px 3px 0 0', background: i === monthlySeries.length - 1 ? ACCENT : '#93b8f5', height: Math.max(m.leads - m.conversions > 0 ? 3 : 0, Math.round(((m.leads - m.conversions) / maxMonthlyLeads) * 130)) }} />
                              <span style={{ width: '100%', background: '#16a34a', height: Math.max(m.conversions > 0 ? 3 : 0, Math.round((m.conversions / maxMonthlyLeads) * 130)) }} />
                            </span>
                            <span style={{ paddingTop: 7, fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5, textTransform: 'uppercase', color: '#8b909a' }}>{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #cfe8f6', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #cfe8f6', background: '#f2fafe', borderLeft: '5px solid #0ea5e9' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em', color: '#075985' }}>What to do with the budget</div>
                      <div style={{ paddingTop: 4, fontSize: 13.5, color: '#47505e' }}>Based on what each channel has produced so far</div>
                    </div>
                    {advice.map(a => (
                      <div key={a.icon} style={{ display: 'grid', gridTemplateColumns: '24px minmax(0,1fr)', gap: 11, alignItems: 'start', padding: '13px 16px 14px', borderBottom: '1px solid #f1f2f5' }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 6, background: a.iBg, color: a.iInk, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{a.icon}</span>
                        <span>
                          <span style={{ display: 'block', fontSize: 14, fontWeight: 700, letterSpacing: '-.01em', color: a.titleInk }}>{a.t}</span>
                          <span style={{ display: 'block', paddingTop: 4, fontSize: 13, lineHeight: 1.55, color: '#6b7280' }}>{a.b}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {alerts.length > 0 && (
                  <div style={{ background: '#ffffff', border: '1px solid #f6d5d5', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5', fontSize: 13.5, fontWeight: 700 }}>Alerts ({alerts.length})</div>
                    {alerts.map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 16px', borderTop: i > 0 ? '1px solid #f1f2f5' : 'none' }}>
                        <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: 5, background: a.bg, color: a.ink, fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, marginTop: 1 }}>{a.icon}</span>
                        <span style={{ fontSize: 12.5, color: '#3d4652', lineHeight: 1.5 }}>{a.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CAMPAIGNS TAB ── */}
            {tab === 'Campaigns' && (
              <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                  <span>
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Campaigns</span>
                    <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>{campaignRows.length > 0 ? `${campaignRows.length} campaign${campaignRows.length === 1 ? '' : 's'} · ${fmtMoney(campSpendSum)} spent · ${fmtMoney(campRevenueSum)} back` : `Nothing paid running in ${monthName(month)}`}</span>
                  </span>
                  <button type="button" onClick={() => { setModalTab('campaigns'); setShowModal(true) }} disabled={!dbReady} style={{ border: 0, cursor: dbReady ? 'pointer' : 'not-allowed', padding: '10px 15px 11px', borderRadius: 8, background: dbReady ? ACCENT : '#c9ced6', color: '#ffffff', fontSize: 14, fontWeight: 700 }}>+ New campaign</button>
                </div>

                {campaignRows.length === 0 ? (
                  <div style={{ padding: '38px 20px 40px', textAlign: 'center' }}>
                    <div style={{ display: 'grid', placeItems: 'center', width: 42, height: 42, margin: '0 auto', borderRadius: 11, background: '#f2f7ff', color: DEEP, fontFamily: "'JetBrains Mono',monospace", fontSize: 17, fontWeight: 700 }}>+</div>
                    <div style={{ paddingTop: 13, fontSize: 16, fontWeight: 700 }}>No paid campaigns in {monthName(month)}</div>
                    <div style={{ paddingTop: 7, maxWidth: '46ch', margin: '0 auto', fontSize: 13.5, lineHeight: 1.6, color: '#6b7280' }}>Every partner so far came in for free. That is good — but it also means growth depends on luck. Log a campaign and you will see exactly what a partner costs you.</div>
                    <button type="button" onClick={() => { setModalTab('campaigns'); setShowModal(true) }} disabled={!dbReady} style={{ marginTop: 16, border: 0, cursor: dbReady ? 'pointer' : 'not-allowed', padding: '12px 18px 13px', borderRadius: 9, background: dbReady ? ACCENT : '#c9ced6', color: '#ffffff', fontSize: 14.5, fontWeight: 700 }}>Add your first campaign</button>
                  </div>
                ) : (
                  <div data-scroll style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 900 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: campCols, gap: 12, alignItems: 'center', padding: '10px 16px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                        <span>Campaign</span><span style={{ textAlign: 'right' }}>Spent</span><span style={{ textAlign: 'right' }}>Partners</span><span style={{ textAlign: 'right' }}>Cost/partner</span><span style={{ textAlign: 'right' }}>Revenue</span><span style={{ textAlign: 'center' }}>Verdict</span>
                      </div>
                      {campaignRows.map(c => (
                        <div key={c.id} style={{ display: 'grid', gridTemplateColumns: campCols, gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5', borderLeft: `4px solid ${c.edge}` }}>
                          <span style={{ minWidth: 0 }}>
                            <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                            <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#8b909a' }}>{c.meta}</span>
                          </span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, color: '#991b1b' }}>{c.spend ? fmtMoney(c.spend) : '—'}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14.5, fontWeight: 700, color: c.conversions ? '#166534' : '#991b1b' }}>{c.conversions}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, color: c.cpa ? '#16181d' : '#6b7280' }}>{c.cpa ? fmtMoney(c.cpa) : '—'}</span>
                          <span className="lc-mono" style={{ textAlign: 'right', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: c.revenue ? '#166534' : '#c9ced6' }}>{c.revenue ? fmtMoney(c.revenue) : '—'}</span>
                          <span style={{ textAlign: 'center' }}>
                            <span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 700, padding: '4px 9px 5px', borderRadius: 5, background: c.vBg, color: c.vInk }}>{c.verdict}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── FUNNEL TAB ── */}
            {tab === 'Funnel' && (
              <div className="amk-2col">
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>From application to paying partner</div>
                    <div style={{ paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Lifetime — the widest gap is where you lose the most applicants</div>
                  </div>
                  {funnelSteps.map((f, i) => {
                    const prev = i === 0 ? f.v : funnelSteps[i - 1].v
                    const rate = prev ? Math.round((f.v / prev) * 100) : 0
                    const dropN = prev - f.v
                    return (
                      <div key={f.k} style={{ padding: '14px 16px 15px', borderBottom: '1px solid #f1f2f5' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingBottom: 8 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 700 }}>
                            <span style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: f.color, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                            {f.k}
                          </span>
                          <span className="lc-mono" style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.03em' }}>{f.v.toLocaleString('en-US')}</span>
                        </div>
                        <div style={{ height: 10, borderRadius: 5, background: '#f1f2f5', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 5, background: f.color, width: `${Math.max(2, Math.round((f.v / funnelTop) * 100))}%` }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 7 }}>
                          <span style={{ fontSize: 12.5, color: '#6b7280' }}>{i === 0 ? 'starting point' : `${rate}% of the previous step`}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: i === 0 ? '#8b909a' : rate < 30 ? '#991b1b' : rate < 70 ? '#b45309' : '#166534' }}>{i === 0 ? '' : `lost ${dropN.toLocaleString('en-US')}`}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '13px 16px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>What a partner is worth</div>
                      <div style={{ paddingTop: 4, fontSize: 13, color: '#6b7280' }}>So you know what you can afford to pay for one</div>
                    </div>
                    {[
                      { k: 'Average revenue per partner', v: fmtMoney(avgRevenuePerClient), size: '16px', ink: '#16181d' },
                      { k: 'Average orders per partner', v: avgOrdersPerPartner.toFixed(1), size: '15px', ink: '#16181d' },
                      { k: 'Average gross margin', v: `${(avgMarginRatio * 100).toFixed(0)}%`, size: '15px', ink: '#16181d' },
                      { k: 'Estimated gross profit per partner', v: fmtMoney(estGrossProfitPerPartner), size: '17px', ink: '#166534' },
                    ].map(w => (
                      <div key={w.k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5' }}>
                        <span style={{ fontSize: 13.5, color: '#6b7280' }}>{w.k}</span>
                        <span className="lc-mono" style={{ fontSize: w.size, fontWeight: 700, letterSpacing: '-.02em', color: w.ink }}>{w.v}</span>
                      </div>
                    ))}
                    <div style={{ padding: '13px 16px 16px', background: '#f3faf5' }}>
                      <div style={{ fontSize: 13, lineHeight: 1.6, color: '#166534' }}>Estimated using your real order history and product costs. Actual profit per partner varies by what they buy and how often they reorder.</div>
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ padding: '13px 16px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>Rejected applications</div>
                      <div style={{ paddingTop: 4, fontSize: 13, color: '#6b7280' }}>Lifetime, from the Applications page</div>
                    </div>
                    <div style={{ padding: '14px 16px 6px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingBottom: 10 }}>
                        <span style={{ fontSize: 13.5, color: '#6b7280' }}>Rejected of decided applications</span>
                        <span className="lc-mono" style={{ fontSize: 16, fontWeight: 700 }}>{totalRejected} / {totalDecided}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: '#f1f2f5', overflow: 'hidden', marginBottom: 12 }}>
                        <div style={{ height: '100%', borderRadius: 4, background: '#dc2626', width: `${Math.round(rejectionRate)}%` }} />
                      </div>
                    </div>
                    <div style={{ padding: '0 16px 16px', fontSize: 13, lineHeight: 1.6, color: '#6b7280' }}>
                      The app doesn't track why each application was rejected yet, so no breakdown is shown here. <Link href="/admin/applications" style={{ color: DEEP, fontWeight: 600 }}>Open Applications →</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOG SPEND MODAL */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(22,24,29,.5)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'clamp(12px,5vh,50px) clamp(12px,4vw,34px)', overflowY: 'auto' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 620, background: '#ffffff', border: '1px solid #d9dce2', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '16px 20px 17px', borderBottom: '1px solid #e2e4e9' }}>
              <span>
                <span style={{ display: 'block', fontSize: 19, fontWeight: 700, letterSpacing: '-.02em' }}>Marketing data</span>
                <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>{monthName(month)} — log spend, manage channels and campaigns</span>
              </span>
              <button type="button" onClick={() => setShowModal(false)} aria-label="Close" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', cursor: 'pointer', padding: '8px 12px 9px', fontSize: 14, fontWeight: 600, color: '#47505e' }}>Close ✕</button>
            </div>

            <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6 }}>
              {[['log', 'Log month'], ['channels', 'Channels'], ['campaigns', 'Campaigns'], ['csv', 'CSV']].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setModalTab(k)} style={{ flex: 1, padding: '8px 4px', fontSize: 10.5, fontWeight: 700, color: modalTab === k ? '#ffffff' : '#6b7280', background: modalTab === k ? ACCENT : 'transparent', border: `1px solid ${modalTab === k ? ACCENT : '#d9dce2'}`, borderRadius: 8, cursor: 'pointer' }}>{l}</button>
              ))}
            </div>

            <div style={{ padding: '16px 20px 20px', maxHeight: '65vh', overflowY: 'auto' }}>
              {modalTab === 'log' && (
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>Enter what each paid channel spent and produced this month.</div>
                  {activeChannels.length === 0 && <div style={{ fontSize: 12.5, color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>No paid channels yet — add one in the "Channels" tab.</div>}
                  {activeChannels.map(ch => (
                    <div key={ch.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #f1f2f5' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 8 }}>{ch.name}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <LabeledInput label="Spend ($)" mono value={logForm[ch.id]?.spend} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], spend: v } }))} />
                        <LabeledInput label="Leads" mono value={logForm[ch.id]?.leads} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], leads: v } }))} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <LabeledInput label="Conversions" mono value={logForm[ch.id]?.conversions} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], conversions: v } }))} />
                        <LabeledInput label="Clicks (opt.)" mono value={logForm[ch.id]?.clicks} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], clicks: v } }))} />
                        <LabeledInput label="Reach (opt.)" mono value={logForm[ch.id]?.reach} onChange={v => setLogForm(f => ({ ...f, [ch.id]: { ...f[ch.id], reach: v } }))} />
                      </div>
                    </div>
                  ))}
                  {activeChannels.length > 0 && (
                    <button type="button" onClick={saveLog} disabled={savingLog} style={{ width: '100%', padding: 12, background: savingLog ? '#c9ced6' : ACCENT, color: '#ffffff', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 8, cursor: savingLog ? 'not-allowed' : 'pointer' }}>{savingLog ? 'Saving…' : 'Save this month'}</button>
                  )}
                </div>
              )}

              {modalTab === 'channels' && (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Paid channels</div>
                  {channels.map(ch => (
                    <div key={ch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f2f5' }}>
                      <span style={{ fontSize: 12.5, color: ch.is_active === false ? '#c9ced6' : '#16181d' }}>{ch.name}{ch.is_active === false && ' (archived)'}</span>
                      {ch.is_active !== false && <button type="button" onClick={() => archiveChannel(ch.id)} style={{ fontSize: 10, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Archive</button>}
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)} placeholder="e.g. Meta Ads, TikTok Ads" style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={addChannel} style={{ padding: '0 16px', background: '#e8f0ff', color: DEEP, fontSize: 11, fontWeight: 700, border: `1px solid ${ACCENT}55`, borderRadius: 6, cursor: 'pointer' }}>Add</button>
                  </div>
                </div>
              )}

              {modalTab === 'campaigns' && (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Campaigns</div>
                  {campaigns.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f2f5' }}>
                      <span style={{ fontSize: 12.5, color: c.status === 'archived' ? '#c9ced6' : '#16181d' }}>{c.name}{c.status === 'archived' && ' (archived)'}</span>
                      {c.status !== 'archived' && <button type="button" onClick={() => archiveCampaign(c.id)} style={{ fontSize: 10, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Archive</button>}
                    </div>
                  ))}
                  {campaigns.length === 0 && <div style={{ fontSize: 12.5, color: '#6b7280', padding: '0.5rem 0' }}>No campaigns yet.</div>}
                  <input value={newCampaign.name} onChange={e => setNewCampaign(f => ({ ...f, name: e.target.value }))} placeholder="Campaign name, e.g. August Launch" style={{ ...inputStyle, marginTop: 12, marginBottom: 8 }} />
                  <select value={newCampaign.channel_id} onChange={e => setNewCampaign(f => ({ ...f, channel_id: e.target.value }))} style={{ ...inputStyle, marginBottom: 10, color: '#47505e' }}>
                    <option value="">No specific channel</option>
                    {channels.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
                  </select>
                  <button type="button" onClick={addCampaign} style={{ width: '100%', padding: 10, background: '#e8f0ff', color: DEEP, fontSize: 11, fontWeight: 700, border: `1px solid ${ACCENT}55`, borderRadius: 6, cursor: 'pointer' }}>+ Add campaign</button>
                </div>
              )}

              {modalTab === 'csv' && (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Backup / import</div>
                  <button type="button" onClick={exportCSV} style={{ width: '100%', padding: 11, background: '#f7f8fa', color: '#47505e', fontSize: 12.5, fontWeight: 700, border: '1px solid #d9dce2', borderRadius: 8, cursor: 'pointer', marginBottom: 10 }}>⬇ Export monthly channel data (CSV)</button>
                  <label style={{ display: 'block', width: '100%', padding: 11, background: '#e8f0ff', color: DEEP, fontSize: 12.5, fontWeight: 700, border: `1px solid ${ACCENT}55`, borderRadius: 8, cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box' }}>
                    ⬆ Import CSV
                    <input type="file" accept=".csv" onChange={e => e.target.files[0] && importCSV(e.target.files[0])} style={{ display: 'none' }} />
                  </label>
                  <div style={{ fontSize: 10.5, color: '#8b909a', marginTop: 10 }}>Columns: channel, month (YYYY-MM), spend, leads, conversions, clicks, reach.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
