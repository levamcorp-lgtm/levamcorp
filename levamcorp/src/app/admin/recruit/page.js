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

// Kept in sync with the four real angles in src/app/api/send-recruitment/route.js — only the
// preview copy lives here; the actual email HTML is always rendered server-side from that file.
const TEMPLATES = [
  { key: 'cold_intro', t: 'First contact', b: 'For a business that has never heard of you', icon: '1',
    subject: 'Wholesale partnership opportunity — Levam Corp Distributors',
    intro: 'We partner with serious distributors, resellers, and retailers across the U.S. to provide premium wholesale pricing on electronics, home appliances, and kitchen products.' },
  { key: 'marketplace', t: 'Amazon / Walmart seller', b: 'For marketplace sellers buying at retail', icon: '2',
    subject: 'Stop buying at retail — wholesale pricing for your Amazon listings',
    intro: 'Most sellers we work with came to us doing retail arbitrage, and the math stopped working once fees and returns were counted. We supply commercial invoices that meet marketplace seller-verification requirements, with live pricing and stock in your own portal.' },
  { key: 'retail', t: 'Retail chain / store', b: 'For physical stores buying by pallet', icon: '3',
    subject: 'Direct wholesale supply for your store — Levam Corp Distributors',
    intro: 'We supply retailers across Florida and the southeast — buy by the pallet with MOQs that match your shelf space, freight quoted to your door or pickup at our Doral warehouse.' },
  { key: 'follow_up', t: 'Follow-up', b: 'For someone who never replied', icon: '4',
    subject: 'Following up — wholesale access with Levam Corp',
    intro: 'We wrote a little while ago about wholesale supply from Levam Corp Distributors and did not hear back — no problem, inboxes get full. The application is still open and takes about five minutes.' },
]

const DRAFT_KEY = 'lvm-recruit-draft-v1'
const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null
const labelStyle = { fontSize: 12.5, fontWeight: 700, color: '#6b7280', display: 'block', marginBottom: 7 }
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14.5, color: '#16181d', background: '#ffffff', fontFamily: 'inherit' }

function StageChip({ stage }) {
  const styles = {
    Sent: { bg: '#f1f2f5', ink: '#47505e' },
    Replied: { bg: '#dcfce7', ink: '#166534' },
    Applied: { bg: '#ede9fe', ink: '#5b21b6' },
    Approved: { bg: '#dcfce7', ink: '#166534' },
    'No reply': { bg: '#fee2e2', ink: '#991b1b' },
  }
  const s = styles[stage] || styles.Sent
  return <span style={{ display: 'inline-block', fontSize: 12.5, fontWeight: 700, padding: '4px 10px 5px', borderRadius: 5, background: s.bg, color: s.ink }}>{stage}</span>
}

export default function AdminRecruit() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [me, setMe] = useState('')
  const [loading, setLoading] = useState(true)
  const [dbReady, setDbReady] = useState(true)
  const [applications, setApplications] = useState([])
  const [leads, setLeads] = useState([])

  const [tab, setTab] = useState('New')
  const [emails, setEmails] = useState('')
  const [template, setTemplate] = useState('cold_intro')
  const [subject, setSubject] = useState('')
  const [note, setNote] = useState('')
  const [leadMeta, setLeadMeta] = useState({}) // { email: { business_name, kind } } from an optional CSV import
  const [sending, setSending] = useState(false)
  const [testSending, setTestSending] = useState(false)
  const [result, setResult] = useState(null)
  const [draftBanner, setDraftBanner] = useState(false)
  const [filter, setFilter] = useState('All')

  const loadAll = async (supabase) => {
    const [{ data: apps }, leadsRes] = await Promise.all([
      supabase.from('applications').select('id,email,status,created_at'),
      supabase.from('recruit_leads').select('*').order('last_contacted_at', { ascending: true }),
    ])
    setApplications(apps || [])
    if (leadsRes.error) { setDbReady(false) } else { setLeads(leadsRes.data || []) }
    setLoading(false)
  }

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      setMe(data.user.email)
      await loadAll(sb)
    })
    try { if (localStorage.getItem(DRAFT_KEY)) setDraftBanner(true) } catch {}
  }, [])

  const logout = async () => { await createClient().auth.signOut(); window.location.href = '/admin' }

  const tpl = TEMPLATES.find(t => t.key === template) || TEMPLATES[0]

  // ── Real parsing + real duplicate detection against the actual recruit_leads log (if the table exists) ──
  const knownEmails = {}
  leads.forEach(l => { knownEmails[l.email.toLowerCase()] = l })
  const tokens = emails.split(/[,;\s\n]+/).map(t => t.trim()).filter(Boolean)
  const bad = [], dupes = [], valid = []
  const seen = new Set()
  tokens.forEach(t => {
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(t)
    if (!ok) { bad.push(t); return }
    const low = t.toLowerCase()
    if (dbReady && knownEmails[low]) { dupes.push(t); return }
    if (!seen.has(low)) { seen.add(low); valid.push(t) }
  })

  // ── Real stage, derived from the real applications table — never fabricated open/reply tracking ──
  const appByEmail = {}
  applications.forEach(a => { if (a.email) appByEmail[a.email.toLowerCase()] = a })
  const stageFor = (lead) => {
    const app = appByEmail[lead.email.toLowerCase()]
    if (app?.status === 'approved') return 'Approved'
    if (app) return 'Applied'
    if (lead.replied) return 'Replied'
    if (lead.closed) return 'No reply'
    return 'Sent'
  }
  const needsFollow = (lead) => stageFor(lead) === 'Sent' && (daysSince(lead.last_contacted_at) ?? 0) >= 5

  const dueLeads = leads.filter(l => needsFollow(l))

  const sendHint = !tokens.length
    ? 'Add at least one email address.'
    : !valid.length
    ? 'None of those are new, valid addresses.'
    : !note
    ? 'Ready — but with no personal line this reads like a mass email. One specific sentence doubles replies.'
    : `Ready. Each one is sent individually from partners@levamcorp.com, not as a visible group.`

  const logSend = async (sentEmails) => {
    if (!dbReady || sentEmails.length === 0) return
    const supabase = createClient()
    const nowIso = new Date().toISOString()
    const existing = new Map(leads.map(l => [l.email.toLowerCase(), l]))
    const rows = sentEmails.map(email => {
      const low = email.toLowerCase()
      const prior = existing.get(low)
      const meta = leadMeta[low] || {}
      return {
        email: low,
        business_name: meta.business_name || prior?.business_name || null,
        kind: meta.kind || prior?.kind || null,
        last_template: template,
        times_contacted: (prior?.times_contacted || 0) + 1,
        first_contacted_at: prior?.first_contacted_at || nowIso,
        last_contacted_at: nowIso,
        replied: prior?.replied || false,
        closed: false,
      }
    })
    const { data } = await supabase.from('recruit_leads').upsert(rows, { onConflict: 'email' }).select()
    if (data) setLeads(prev => {
      const keys = new Set(data.map(d => d.email))
      return [...prev.filter(l => !keys.has(l.email)), ...data]
    })
  }

  const send = async () => {
    if (!valid.length) return
    if (!window.confirm(`Send "${tpl.t}" to ${valid.length} recipient${valid.length !== 1 ? '' : ''}?`)) return
    setSending(true); setResult(null)
    try {
      const res = await fetch('/api/send-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: valid, subject: subject || tpl.subject, customNote: note, template }),
      })
      const data = await res.json()
      setResult(data)
      if (!data.error) await logSend(valid)
    } catch (e) { setResult({ error: e.message }) }
    setSending(false)
  }

  const sendTest = async () => {
    if (!me) return
    setTestSending(true)
    try {
      await fetch('/api/send-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: [me], subject: subject || tpl.subject, customNote: note, template }),
      })
      alert(`Test sent to ${me}`)
    } catch (e) { alert('Failed: ' + e.message) }
    setTestSending(false)
  }

  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ emails, template, subject, note })) } catch {}
    alert('Draft saved on this device.')
  }
  const restoreDraft = () => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY))
      if (d) { setEmails(d.emails || ''); setTemplate(d.template || 'cold_intro'); setSubject(d.subject || ''); setNote(d.note || '') }
    } catch {}
    setDraftBanner(false)
  }
  const discardDraft = () => { try { localStorage.removeItem(DRAFT_KEY) } catch {}; setDraftBanner(false) }

  const cleanList = () => setEmails(valid.join('\n'))
  const loadDue = () => { setEmails(dueLeads.map(l => l.email).join('\n')); setTemplate('follow_up'); setTab('New') }

  const markReplied = async (lead) => {
    if (!dbReady) return
    await createClient().from('recruit_leads').update({ replied: true, closed: false }).eq('id', lead.id)
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, replied: true, closed: false } : l))
  }
  const closeFile = async (lead) => {
    if (!dbReady) return
    await createClient().from('recruit_leads').update({ closed: true }).eq('id', lead.id)
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, closed: true } : l))
  }
  const sendFollowUp = (lead) => { setEmails(lead.email); setTemplate('follow_up'); setTab('New') }

  const importCSV = async (file) => {
    const text = await file.text()
    const lines = text.trim().split('\n').slice(1)
    const meta = {}
    const emailList = []
    for (const line of lines) {
      const [email, business_name, kind] = line.split(',').map(s => (s || '').trim())
      if (!email) continue
      meta[email.toLowerCase()] = { business_name: business_name || null, kind: kind || null }
      emailList.push(email)
    }
    setLeadMeta(m => ({ ...m, ...meta }))
    setEmails(prev => [prev, emailList.join('\n')].filter(Boolean).join('\n'))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading recruit data…</div>
      </div>
    </div>
  )

  const shellCols = sidebarOpen ? 'clamp(210px,16vw,244px) minmax(0,1fr)' : '76px minmax(0,1fr)'
  const mainCols = 'minmax(0,1.2fr) minmax(330px,.85fr)'
  const tabDefs = [{ key: 'New', label: 'New outreach' }, { key: 'Pipeline', label: 'Pipeline' }]

  const replied = leads.filter(l => ['Replied', 'Applied', 'Approved'].includes(stageFor(l))).length
  const appliedCount = leads.filter(l => stageFor(l) === 'Applied').length
  const approvedCount = leads.filter(l => stageFor(l) === 'Approved').length
  const stages = [
    { k: 'Contacted', v: leads.length, sub: 'businesses in the pipeline', bar: '#8b909a', ink: '#16181d' },
    { k: 'Replied', v: replied, sub: leads.length ? `${Math.round((replied / leads.length) * 100)}% reply rate` : 'no leads yet', bar: '#16a34a', ink: '#166534' },
    { k: 'Applied', v: appliedCount, sub: 'submitted an application', bar: '#7c3aed', ink: '#5b21b6' },
    { k: 'Became partners', v: approvedCount, sub: 'approved and buying', bar: ACCENT, ink: DEEP },
    { k: 'Need a follow-up', v: dueLeads.length, sub: '5+ days with no answer', bar: '#f0b429', ink: '#8a5a00' },
  ]

  let shownLeads = leads.slice()
  if (filter === 'Needs follow-up') shownLeads = shownLeads.filter(l => needsFollow(l))
  else if (filter === 'Replied') shownLeads = shownLeads.filter(l => ['Replied', 'Applied', 'Approved'].includes(stageFor(l)))
  else if (filter === 'No reply') shownLeads = shownLeads.filter(l => stageFor(l) === 'No reply')
  shownLeads.sort((a, b) => (daysSince(a.last_contacted_at) ?? 0) - (daysSince(b.last_contacted_at) ?? 0))

  const leadCols = 'minmax(190px,1.4fr) minmax(190px,1.3fr) 118px 108px 124px 170px'

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        .rc-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .rc-shell { grid-template-columns:1fr !important; } .rc-shell > div:first-child { position:static !important; max-height:none !important; } }
        .rc-main { display:grid; grid-template-columns:${mainCols}; gap:clamp(14px,1.8vw,18px); align-items:start; }
        @media(max-width:900px){ .rc-main { grid-template-columns:1fr !important; } .rc-main > div:last-child { position:static !important; max-height:none !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="rc-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={{}} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Recruit partners</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{tab === 'New' ? `${valid.length} ready to send · ${tpl.t}` : `${leads.length} contacted · ${replied} replied · ${approvedCount} became partners`}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflow: 'hidden', background: '#f7f8fa' }}>
                {tabDefs.map(t => { const on = t.key === tab
                  return <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{ border: 0, cursor: 'pointer', padding: '9px 14px 10px', background: on ? ACCENT : 'transparent', color: on ? '#ffffff' : '#6b7280', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{t.label}</button>
                })}
              </span>
              <button type="button" onClick={logout} style={{ padding: '10px 13px 11px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
            </div>
          </div>

          {!dbReady && (
            <div style={{ margin: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) 0', padding: '12px 16px', background: '#fef3c7', border: '1px solid #f3d9a4', borderRadius: 10, fontSize: 13, color: '#7c4a03' }}>
              ⚠ The recruit_leads table doesn't exist in Supabase yet, so pipeline tracking (duplicate detection, stages, follow-up reminders) is disabled. Sending still works normally. Ask Claude for the setup SQL to enable it.
            </div>
          )}

          {tab === 'New' && (
            <div className="rc-main" style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)', minWidth: 0 }}>

                {draftBanner && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', background: '#f2f7ff', border: '1px solid #cfe0fb', borderRadius: 10, fontSize: 13, color: DEEP }}>
                    <span>You have a saved draft on this device.</span>
                    <span style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={restoreDraft} style={{ border: 0, background: ACCENT, color: '#fff', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Restore</button>
                      <button type="button" onClick={discardDraft} style={{ border: '1px solid #d9dce2', background: '#fff', color: '#47505e', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Discard</button>
                    </span>
                  </div>
                )}

                {dbReady && dueLeads.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr) auto', gap: 12, alignItems: 'center', background: '#fffbf2', border: '1px solid #f3d9a4', borderRadius: 11, padding: '14px 16px 15px' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: '#f0b429', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700 }}>!</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em', color: '#8a5a00' }}>{dueLeads.length} business{dueLeads.length === 1 ? '' : 'es'} {dueLeads.length === 1 ? 'is' : 'are'} waiting for a follow-up</span>
                      <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#47505e' }}>Most partners reply to the second email, not the first.</span>
                    </span>
                    <button type="button" onClick={loadDue} style={{ cursor: 'pointer', border: 0, borderRadius: 8, background: '#f0b429', color: '#ffffff', padding: '10px 13px 11px', fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap' }}>Load them</button>
                  </div>
                )}

                <div style={{ background: '#ffffff', border: '1px solid #cfe0fb', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #cfe0fb', background: '#f2f7ff', borderLeft: `5px solid ${ACCENT}` }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: ACCENT, color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>1</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: DEEP }}>Who you are writing to</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>
                        {tokens.length ? `${valid.length} new${dupes.length ? ` · ${dupes.length} already in your pipeline` : ''}${bad.length ? ` · ${bad.length} invalid` : ''}` : 'Paste emails separated by commas, spaces or new lines'}
                      </span>
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px 16px' }}>
                    <textarea value={emails} onChange={e => setEmails(e.target.value)} rows={5}
                      placeholder={'john@retailstore.com, maria@distributor.com\nsales@company.com\ninfo@reseller.net'}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 13px 13px', border: '1px solid #d9dce2', borderRadius: 9, fontFamily: "'JetBrains Mono',monospace", fontSize: 13.5, lineHeight: 1.7, color: '#16181d', background: '#ffffff', resize: 'vertical' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 11 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, padding: '5px 10px 6px', borderRadius: 6, background: '#dcfce7', color: '#166534' }}>{valid.length} valid</span>
                      {bad.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, padding: '5px 10px 6px', borderRadius: 6, background: '#fee2e2', color: '#991b1b' }}>{bad.length} not an email</span>}
                      {dupes.length > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, padding: '5px 10px 6px', borderRadius: 6, background: '#fef3c7', color: '#7c4a03' }}>{dupes.length} already contacted</span>}
                      <button type="button" onClick={cleanList} style={{ cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', color: '#47505e', padding: '7px 11px 8px', fontSize: 13, fontWeight: 700 }}>Clean the list</button>
                      <label style={{ cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', color: '#47505e', padding: '7px 11px 8px', fontSize: 13, fontWeight: 700 }}>
                        Import CSV
                        <input type="file" accept=".csv" onChange={e => e.target.files[0] && importCSV(e.target.files[0])} style={{ display: 'none' }} />
                      </label>
                    </div>
                    {dupes.length > 0 && (
                      <div style={{ paddingTop: 9, fontSize: 12.5, color: '#8a5a00' }}>
                        Already contacted: {dupes.slice(0, 3).map(d => knownEmails[d.toLowerCase()]?.business_name || d).join(', ')}{dupes.length > 3 ? ` and ${dupes.length - 3} more` : ''}. Use the follow-up template instead of writing again from scratch.
                      </div>
                    )}
                    <div style={{ paddingTop: 6, fontSize: 11.5, color: '#8b909a' }}>CSV import columns: email, business_name (opt.), kind (opt.) — used to label leads in the Pipeline tab.</div>
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #cfe8d7', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #cfe8d7', background: '#f3faf5', borderLeft: '5px solid #16a34a' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#16a34a', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>2</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#166534' }}>What kind of email</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>Each one is written for a different kind of business</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 16px 16px' }}>
                    {TEMPLATES.map(t => { const on = t.key === template
                      return (
                        <button key={t.key} type="button" onClick={() => setTemplate(t.key)} style={{ flex: '1 1 178px', cursor: 'pointer', border: `1px solid ${on ? ACCENT : '#d9dce2'}`, borderRadius: 9, background: on ? '#f2f7ff' : '#ffffff', color: on ? DEEP : '#16181d', padding: '12px 13px 13px', textAlign: 'left' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: on ? ACCENT : '#eef0f4', color: on ? '#ffffff' : '#6b7280', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{t.icon}</span>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>{t.t}</span>
                          </span>
                          <span style={{ display: 'block', paddingTop: 6, fontSize: 12.5, lineHeight: 1.45, color: '#6b7280' }}>{t.b}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #f3e4bd', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 15px', borderBottom: '1px solid #f3e4bd', background: '#fffdf5', borderLeft: '5px solid #f0b429' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#f0b429', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>3</span>
                    <span>
                      <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#8a5a00' }}>Make it sound like a person</span>
                      <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>A specific first line is what separates a reply from the trash</span>
                    </span>
                  </div>
                  <div style={{ padding: '13px 16px 14px' }}>
                    <label style={labelStyle}>Subject line</label>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder={tpl.subject} style={{ ...inputStyle, marginBottom: 6 }} />
                    <div style={{ fontSize: 12, color: (subject || tpl.subject).length > 60 ? '#b45309' : '#6b7280' }}>{(subject || tpl.subject).length > 60 ? 'Long subjects get cut off on phones — aim for under 60 characters' : `${(subject || tpl.subject).length} characters`}</div>
                  </div>
                  <div style={{ padding: '0 16px 16px' }}>
                    <label style={labelStyle}>Personal first line (optional)</label>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="e.g. I saw you carry Hisense in your Doral store and thought there could be a fit"
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
                    <div style={{ paddingTop: 6, fontSize: 12, color: note ? '#166534' : '#b45309' }}>{note ? 'Shows as a highlighted note inside the email' : 'Outreach without one gets ignored — name their business, city or what they sell'}</div>
                  </div>
                </div>
              </div>

              <div data-scroll style={{ position: 'sticky', top: 74, display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)', minWidth: 0, maxHeight: 'calc(100vh - 92px)', overflowY: 'auto' }}>
                <div style={{ flex: 'none', background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))' }}>
                    <div style={{ padding: '13px 14px 14px', background: '#f3faf5' }}>
                      <div className="lc-mono" style={{ fontWeight: 700, fontSize: 21, letterSpacing: '-.035em', color: '#166534' }}>{valid.length}</div>
                      <div style={{ paddingTop: 5, fontSize: 12.5, color: '#6b7280' }}>ready to send</div>
                    </div>
                    <div style={{ borderLeft: '1px solid #f1f2f5', padding: '13px 14px 14px', background: dupes.length ? '#fffdf5' : '#ffffff' }}>
                      <div className="lc-mono" style={{ fontWeight: 700, fontSize: 21, letterSpacing: '-.035em', color: dupes.length ? '#8a5a00' : '#8b909a' }}>{dbReady ? dupes.length : '—'}</div>
                      <div style={{ paddingTop: 5, fontSize: 12.5, color: '#6b7280' }}>already contacted</div>
                    </div>
                  </div>
                  <div style={{ padding: '14px 15px 16px', borderTop: '1px solid #e2e4e9' }}>
                    <button type="button" onClick={send} disabled={sending || !valid.length} style={{ width: '100%', border: 0, borderRadius: 9, cursor: sending || !valid.length ? 'not-allowed' : 'pointer', padding: '14px 16px 15px', background: sending || !valid.length ? '#c9ced6' : '#16a34a', color: '#ffffff', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>
                      {sending ? 'Sending…' : valid.length ? `Send to ${valid.length} business${valid.length === 1 ? '' : 'es'}` : 'Send outreach'}
                    </button>
                    <div style={{ paddingTop: 9, fontSize: 12.5, lineHeight: 1.5, color: valid.length && note ? '#6b7280' : '#b45309' }}>{sendHint}</div>
                    {result && (
                      <div style={{ marginTop: 10, padding: '10px 12px', background: result.error ? '#fee2e2' : '#dcfce7', border: `1px solid ${result.error ? '#f6b4b4' : '#bde5c8'}`, borderRadius: 6, fontSize: 12, color: result.error ? '#991b1b' : '#166534', fontWeight: 600, textAlign: 'center' }}>
                        {result.error ? `Error: ${result.error}` : `✓ Sent to ${result.sent} recipient${result.sent !== 1 ? 's' : ''}${result.failed > 0 ? ` · ${result.failed} failed` : ''}`}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 11 }}>
                      <button type="button" onClick={sendTest} disabled={testSending} style={{ flex: '1 1 120px', cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', color: '#47505e', padding: '10px 12px 11px', fontSize: 13.5, fontWeight: 700 }}>{testSending ? 'Sending…' : 'Send test to me'}</button>
                      <button type="button" onClick={saveDraft} style={{ flex: '1 1 120px', cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', color: '#47505e', padding: '10px 12px 11px', fontSize: 13.5, fontWeight: 700 }}>Save draft</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f2f5', fontSize: 12.5, color: '#6b7280' }}>
                      <span>Template</span>
                      <span style={{ fontWeight: 700, padding: '3px 9px 4px', borderRadius: 5, background: '#f2f7ff', color: DEEP }}>{tpl.t}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 8, fontSize: 12.5, color: '#6b7280' }}>
                      <span>Sent from</span>
                      <span className="lc-mono" style={{ fontWeight: 700, color: '#16181d' }}>partners@levamcorp.com</span>
                    </div>
                  </div>
                </div>

                <div style={{ flex: 'none', background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 15px 13px', borderBottom: '1px solid #e2e4e9' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>The actual email</span>
                  </div>
                  <div style={{ padding: '13px 15px 16px', background: '#eceef2' }}>
                    <div style={{ padding: '0 2px 10px', fontSize: 12.5, color: '#47505e' }}><span style={{ fontWeight: 700 }}>Subject:</span> {subject || tpl.subject}</div>
                    <div style={{ background: '#ffffff', border: '1px solid #d9dce2', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 15px 14px', borderBottom: '2px solid #16181d' }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 900, color: '#16181d', letterSpacing: '.02em' }}>LEVAM<span style={{ color: DEEP }}>CORP</span></div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6b7280', lineHeight: 1.7 }}>Wholesale partnership<br />Doral · FL</span>
                      </div>
                      <div style={{ padding: '15px 16px 4px', fontSize: 13.5, lineHeight: 1.65, color: '#16181d' }}>{tpl.intro}</div>
                      {note && (
                        <div style={{ margin: '13px 16px 0', padding: '11px 13px 12px', borderLeft: `3px solid ${ACCENT}`, background: '#f2f7ff', fontSize: 13, lineHeight: 1.6, color: '#16181d' }}>{note}</div>
                      )}
                      <div style={{ padding: '15px 16px 6px' }}>
                        <div style={{ padding: '12px 14px 13px', background: ACCENT, color: '#ffffff', textAlign: 'center', fontSize: 13.5, fontWeight: 700 }}>Apply for wholesale access</div>
                        <div style={{ paddingTop: 8, textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#8b909a' }}>levamcorp.com/apply</div>
                      </div>
                      <div style={{ padding: '12px 16px 14px', marginTop: 10, borderTop: '1px solid #f1f2f5', fontSize: 11, lineHeight: 1.6, color: '#8b909a' }}>Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com · (786) 878-4122</div>
                    </div>
                    <div style={{ paddingTop: 10, fontSize: 11.5, color: '#8b909a' }}>Full email also includes the "How it works" and "What you get" sections — unchanged from the real template.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'Pipeline' && (
            <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)', display: 'flex', flexDirection: 'column', gap: 'clamp(14px,1.8vw,18px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 'clamp(10px,1.2vw,14px)' }}>
                {stages.map(s => (
                  <div key={s.k} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ height: 4, background: s.bar }} />
                    <div style={{ padding: '13px 15px 15px' }}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6b7280' }}>{s.k}</div>
                      <div style={{ paddingTop: 9, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 'clamp(21px,2.1vw,27px)', letterSpacing: '-.04em', color: s.ink }}>{s.v}</div>
                      <div style={{ paddingTop: 6, fontSize: 12.5, color: '#6b7280' }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {!dbReady ? (
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Pipeline tracking isn't set up yet</div>
                  <div style={{ fontSize: 13, color: '#6b7280', maxWidth: '48ch', margin: '0 auto', lineHeight: 1.6 }}>This needs a small `recruit_leads` table in Supabase to log who you've contacted, when, and whether they replied or applied. Ask Claude for the setup SQL — sending outreach from the New tab works fine either way.</div>
                </div>
              ) : (
                <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 16px 15px', borderBottom: '1px solid #e2e4e9' }}>
                    <span>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>Everyone you have contacted</span>
                      <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Follow up on the amber rows — that is where the replies come from</span>
                    </span>
                    <span data-scroll style={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #d9dce2', borderRadius: 8, overflowX: 'auto', background: '#f7f8fa' }}>
                      {['All', 'Needs follow-up', 'Replied', 'No reply'].map(label => { const on = label === filter
                        return <button key={label} type="button" onClick={() => setFilter(label)} style={{ flex: '0 0 auto', border: 0, cursor: 'pointer', padding: '8px 12px 9px', background: on ? '#16181d' : 'transparent', color: on ? '#ffffff' : '#6b7280', fontSize: 13, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{label}</button>
                      })}
                    </span>
                  </div>
                  <div data-scroll style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 940 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: leadCols, gap: 12, alignItems: 'center', padding: '10px 16px 11px', borderBottom: '1px solid #e2e4e9', background: '#fafbfc', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                        <span>Business</span><span>Email</span><span style={{ textAlign: 'center' }}>Stage</span><span style={{ textAlign: 'right' }}>Emails sent</span><span style={{ textAlign: 'right' }}>Last contact</span><span style={{ textAlign: 'center' }}>Next step</span>
                      </div>
                      {shownLeads.map(l => {
                        const stage = stageFor(l)
                        const days = daysSince(l.last_contacted_at)
                        const follow = needsFollow(l)
                        const hot = ['Replied', 'Applied'].includes(stage)
                        const dead = stage === 'No reply'
                        return (
                          <div key={l.id} style={{ display: 'grid', gridTemplateColumns: leadCols, gap: 12, alignItems: 'center', padding: '12px 16px 13px', borderBottom: '1px solid #f1f2f5', background: hot ? '#f7fbf8' : follow ? '#fffdf5' : '#ffffff', borderLeft: `4px solid ${hot ? '#16a34a' : follow ? '#f0b429' : dead ? '#dc2626' : 'transparent'}` }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                              <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: 8, background: hot ? '#dcfce7' : follow ? '#fef3c7' : '#f1f2f5', color: hot ? '#166534' : follow ? '#7c4a03' : '#8b909a', fontSize: 13.5, fontWeight: 700 }}>{(l.business_name || l.email).charAt(0).toUpperCase()}</span>
                              <span style={{ minWidth: 0 }}>
                                <span style={{ display: 'block', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.business_name || '—'}</span>
                                <span style={{ display: 'block', paddingTop: 3, fontSize: 12, color: '#8b909a' }}>{l.kind || 'No details on file'}</span>
                              </span>
                            </span>
                            <span className="lc-mono" style={{ fontSize: 12.5, color: '#47505e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.email}</span>
                            <span style={{ textAlign: 'center' }}><StageChip stage={stage} /></span>
                            <span className="lc-mono" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700 }}>{l.times_contacted || 1}</span>
                            <span style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: days <= 2 ? '#166534' : days >= 14 ? '#991b1b' : '#8a5a00' }}>{days === 1 ? 'Yesterday' : days === 0 ? 'Today' : `${days}d ago`}</span>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                              {stage === 'Applied' && <Link href="/admin/applications" style={{ fontSize: 12, fontWeight: 700, color: DEEP }}>Review →</Link>}
                              {stage === 'Approved' && <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>✓ Partner</span>}
                              {stage === 'Sent' && follow && <button type="button" onClick={() => sendFollowUp(l)} style={{ fontSize: 12, fontWeight: 700, padding: '6px 10px', borderRadius: 6, background: '#f0b429', color: '#fff', border: 0, cursor: 'pointer' }}>Follow up</button>}
                              {stage === 'Sent' && !follow && <span style={{ fontSize: 12, color: '#8b909a' }}>Waiting</span>}
                              {stage === 'Sent' && !l.replied && <button type="button" onClick={() => markReplied(l)} style={{ fontSize: 11, fontWeight: 600, padding: '5px 8px', borderRadius: 6, background: '#fff', color: '#6b7280', border: '1px solid #d9dce2', cursor: 'pointer' }}>Replied?</button>}
                              {(stage === 'Sent' || stage === 'Replied') && !l.closed && (
                                <button type="button" onClick={() => closeFile(l)} style={{ fontSize: 11, fontWeight: 600, padding: '5px 8px', borderRadius: 6, background: '#fff', color: '#991b1b', border: '1px solid #f6b4b4', cursor: 'pointer' }}>Close</button>
                              )}
                            </span>
                          </div>
                        )
                      })}
                      {shownLeads.length === 0 && (
                        <div style={{ padding: '2.5rem', textAlign: 'center', fontSize: 12.5, color: '#8b909a' }}>No leads match this filter yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
