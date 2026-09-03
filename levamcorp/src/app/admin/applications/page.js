'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'
const CHIP = '#E8F0FF'

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

const CHECK_DEFS = [
  { id: 'ein', t: 'EIN matches the SS-4 letter', b: (a) => `Form says ${a.ein_number || 'no EIN on file'} — confirm it matches the uploaded document.` },
  { id: 'resale', t: 'Resale certificate is valid', b: (a) => `Number ${a.resale_tax_number || 'not provided'} must be active and in the business name.` },
  { id: 'name', t: 'Business name is identical', b: (a) => `"${a.business_name}" must match both documents exactly.` },
  { id: 'real', t: 'It looks like a real reselling business', b: (a) => a.categories?.length ? `Interested in: ${a.categories.join(', ')}.` : 'No product categories were selected on the application.' },
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

export default function AdminApplications() {
  const pathname = usePathname()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [tab, setTab] = useState('Pending')
  const [selId, setSelId] = useState(null)
  const [checked, setChecked] = useState({})
  const [docTab, setDocTab] = useState('EIN letter')
  const [docUrl, setDocUrl] = useState(null)
  const [docLoading, setDocLoading] = useState(false)
  const [approving, setApproving] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      await loadApps(supabase)
    })
  }, [])

  const loadApps = async (supabase) => {
    const { data } = await supabase.from('applications').select('*').order('id', { ascending: false })
    setApplications(data || [])
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const approveApp = async (app) => {
    setApproving(app.id)
    const supabase = createClient()
    await supabase.from('applications').update({ status: 'approved' }).eq('id', app.id)
    await supabase.from('clients').upsert([{
      email: app.email,
      business_name: app.business_name,
      contact_name: app.contact_name,
      phone: app.phone,
      address: app.address,
      business_type: app.business_type,
      monthly_volume: app.monthly_volume,
      years_in_business: app.years_in_business,
      ein_number: app.ein_number,
      resale_tax_number: app.resale_tax_number,
      ein_document_url: app.ein_document_url,
      resale_tax_document_url: app.resale_tax_document_url,
    }])
    const emailRes = await fetch('/api/send-approval-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: app.email, contactName: app.contact_name, businessName: app.business_name })
    })
    if (!emailRes.ok) alert('Client approved, but the approval email failed to send. Please notify them manually.')
    await loadApps(supabase)
    setApproving(null)
  }

  const rejectApp = async (id) => {
    const supabase = createClient()
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', id)
    await loadApps(supabase)
  }

  const missingDocs = (app) => {
    const m = []
    if (!app.ein_document_url) m.push('EIN / SS-4 letter')
    if (!app.resale_tax_document_url) m.push('Florida resale certificate')
    return m
  }

  const buildFirstContactMessage = (app) => {
    const firstName = (app.contact_name || '').trim().split(' ')[0] || 'there'
    return `Hi ${firstName}! 👋 This is the Levam Corp Distributors team — thank you for applying${app.business_name ? ` with *${app.business_name}*` : ''}!\n\nWe review every application personally, and we'd love to learn a bit more about your business while we finish reviewing yours:\n\n• What products are you most interested in sourcing?\n• Roughly what's your monthly order volume?\n• Are you selling online (Amazon/Walmart), retail, or both?\n\nFeel free to reply here anytime — happy to help! 🙌`
  }

  const buildDocRequestMessage = (app) => {
    const firstName = (app.contact_name || '').trim().split(' ')[0] || 'there'
    const missing = missingDocs(app)
    return `Hi ${firstName}! 👋 This is the Levam Corp Distributors team. We're finishing up the review of your wholesale application${app.business_name ? ` for *${app.business_name}*` : ''} — we just need ${missing.length > 1 ? 'these' : 'one more thing'}: ${missing.join(' and ')} (PDF${missing.length > 1 ? 's' : ''}). Could you send ${missing.length > 1 ? 'them' : 'it'} over here whenever you get a chance? 🙌`
  }

  const openFirstContact = async (app) => {
    const digits = (app.phone || '').replace(/\D/g, '')
    if (!digits) { alert('No phone number on file for this application.'); return }
    const withCountry = digits.length === 10 ? '1' + digits : digits
    const message = missingDocs(app).length ? buildDocRequestMessage(app) : buildFirstContactMessage(app)
    window.open(`https://wa.me/${withCountry}?text=${encodeURIComponent(message)}`, '_blank')
    const supabase = createClient()
    const now = new Date().toISOString()
    const { error } = await supabase.from('applications').update({ first_contact_at: now }).eq('id', app.id)
    if (!error) setApplications(prev => prev.map(a => a.id === app.id ? { ...a, first_contact_at: now } : a))
  }

  const buildEmailBody = (app) => {
    const firstName = (app.contact_name || '').trim().split(' ')[0] || 'there'
    const missing = missingDocs(app)
    const body = missing.length
      ? `To finish reviewing your application we still need ${missing.length > 1 ? 'these documents' : 'one more document'}: ${missing.join(' and ')}. Please reply to this email with the PDF${missing.length > 1 ? 's' : ''} attached.\n\n`
      : `Your documents are in order. I would like to set up a short call to go over wholesale pricing and minimum quantities.\n\n`
    return `Hi ${firstName},\n\nThank you for applying to become a Levam Corp Distributors partner with ${app.business_name} (reference ${app.id?.slice(0,8).toUpperCase()}).\n\n${body}Best regards,\nLevam Corp Distributors\n6315 NW 99th Ave, Doral, FL 33178\n(786) 490-9005`
  }

  const deleteApp = async (id) => {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('applications').delete().eq('id', id)
    setApplications(prev => prev.filter(a => a.id !== id))
    if (selId === id) setSelId(null)
    setDeleting(null)
  }

  const resolveDocUrl = async (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    const supabase = createClient()
    let result = await supabase.storage.from('Documents').createSignedUrl(path, 3600)
    if (result.data?.signedUrl) return result.data.signedUrl
    result = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (result.data?.signedUrl) return result.data.signedUrl
    const { data: pub } = supabase.storage.from('Documents').getPublicUrl(path)
    return pub?.publicUrl || null
  }

  const fmtDate = (d) => {
    if (!d) return 'N/A'
    try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
    catch { return 'N/A' }
  }
  const fmtDateTime = (d) => d ? `${fmtDate(d)} at ${new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'N/A'
  const daysSince = (d) => d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : 0

  const pending = applications.filter(a => !a.status || a.status === 'pending')
  const approved = applications.filter(a => a.status === 'approved')
  const rejected = applications.filter(a => a.status === 'rejected')

  const list = tab === 'All' ? applications : tab === 'Pending' ? pending : tab === 'Approved' ? approved : rejected
  const sel = list.find(a => a.id === selId) || list[0] || null

  useEffect(() => {
    if (!sel) { setDocUrl(null); return }
    const path = docTab === 'EIN letter' ? sel.ein_document_url : sel.resale_tax_document_url
    if (!path) { setDocUrl(null); return }
    let cancelled = false
    setDocLoading(true)
    resolveDocUrl(path).then(url => { if (!cancelled) { setDocUrl(url); setDocLoading(false) } })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel?.id, docTab])

  const selectApp = (id) => { setSelId(id); setChecked({}); setDocTab('EIN letter') }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading applications…</div>
      </div>
    </div>
  )

  const badges = { Applications: { badge: String(pending.length), urgent: pending.length > 0 } }
  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) clamp(268px, 22vw, 330px) minmax(0, 1fr)' : '76px clamp(268px, 24vw, 344px) minmax(0, 1fr)'

  const tabDefs = [
    { key: 'Pending', label: `Waiting ${pending.length}` },
    { key: 'Approved', label: `Approved ${approved.length}` },
    { key: 'Rejected', label: `Rejected ${rejected.length}` },
    { key: 'All', label: `All ${applications.length}` },
  ]
  const queueHint = tab === 'Pending' ? `${pending.length} business${pending.length !== 1 ? 'es' : ''} waiting for your answer`
    : tab === 'Approved' ? `${approved.length} approved partner${approved.length !== 1 ? 's' : ''}`
    : tab === 'Rejected' ? `${rejected.length} rejected application${rejected.length !== 1 ? 's' : ''}`
    : `${applications.length} applications total`

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .apa-shell { height:100vh; overflow:hidden; display:grid; grid-template-columns:${shellCols}; align-items:stretch; }
        .apa-body-cols { display:grid; grid-template-columns: minmax(0,1.05fr) minmax(300px,.95fr); gap:clamp(12px,1.5vw,16px); align-items:start; }
        @media(max-width:1100px){ .apa-body-cols { grid-template-columns:1fr !important; } }
        @media(max-width:860px){ .apa-shell { height:auto; overflow:visible; grid-template-columns:1fr !important; } .apa-shell > div { height:auto !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="apa-shell">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={badges} />

        {/* QUEUE */}
        <div data-scroll style={{ height: '100vh', overflowY: 'auto', background: '#ffffff', borderRight: '1px solid #e2e4e9', minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#fffdf8', borderBottom: '2px solid #f0b429', padding: '15px 16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 9 }}>
              <span className="lc-mono" style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: '#f0b429', color: '#fff', fontSize: 11, fontWeight: 700 }}>1</span>
              <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#8a5a00' }}>Pick one to review</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.02em' }}>Applications</span>
              <span style={{ fontSize: 13.5, color: '#6b7280' }}>{applications.length} all time</span>
            </div>
            <div style={{ paddingTop: 6, fontSize: 14, color: '#6b7280' }}>{queueHint}</div>
            <div data-scroll style={{ display: 'flex', gap: 1, marginTop: 13, border: '1px solid #d9dce2', borderRadius: 8, overflowX: 'auto', background: '#f7f8fa' }}>
              {tabDefs.map(t => {
                const on = t.key === tab
                return <button key={t.key} type="button" onClick={() => { setTab(t.key); setSelId(null); setChecked({}) }} style={{ flex: '1 1 auto', minWidth: 0, border: 0, cursor: 'pointer', padding: '9px 10px 10px', background: on ? '#ffffff' : 'transparent', color: on ? '#16181d' : '#6b7280', fontSize: 13.5, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>{t.label}</button>
              })}
            </div>
          </div>

          {list.length === 0 ? (
            <div style={{ padding: '2.5rem 16px', textAlign: 'center', fontSize: 13.5, color: '#8b909a' }}>No applications in this view</div>
          ) : list.map(app => {
            const on = sel?.id === app.id
            const days = daysSince(app.created_at)
            const late = days > 2
            const docsCount = [app.ein_document_url, app.resale_tax_document_url].filter(Boolean).length
            const partial = docsCount < 2
            return (
              <button key={app.id} type="button" onClick={() => selectApp(app.id)} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, borderBottom: '1px solid #f1f2f5', borderLeft: `4px solid ${on ? ACCENT : late ? '#f59e0b' : 'transparent'}`, cursor: 'pointer', background: on ? '#f0f4ff' : '#ffffff', padding: '14px 16px 15px' }}>
                <span style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.015em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.business_name}</span>
                    <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.contact_name}{app.business_type ? ` · ${app.business_type}` : ''}</span>
                  </span>
                  <span className="lc-mono" style={{ flex: 'none', fontSize: 12.5, fontWeight: 700, color: late ? '#991b1b' : '#8b909a' }}>{days <= 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', paddingTop: 9 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: app.first_contact_at ? '#dcfce7' : '#fde68a', color: app.first_contact_at ? '#166534' : '#7c4a03' }}>{app.first_contact_at ? 'Contacted' : 'Not contacted'}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: partial ? '#fee2e2' : '#eef0f4', color: partial ? '#991b1b' : '#47505e' }}>{docsCount} of 2 uploaded</span>
                  {app.monthly_volume && <span style={{ fontSize: 12, color: '#8b909a' }}>{app.monthly_volume}</span>}
                </span>
              </button>
            )
          })}
        </div>

        {/* DETAIL */}
        <div data-scroll style={{ height: '100vh', overflowY: 'auto', background: '#f2f5fa', minWidth: 0 }}>
          {!sel ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#8b909a', fontSize: 14 }}>Select an application from the list</div>
          ) : (() => {
            const days = daysSince(sel.created_at)
            const docsCount = [sel.ein_document_url, sel.resale_tax_document_url].filter(Boolean).length
            const partial = docsCount < 2
            const missing = missingDocs(sel)
            const waLabel = missing.length ? 'WhatsApp · ask for document' : `WhatsApp ${(sel.contact_name||'').split(' ')[0] || ''}`
            const done = CHECK_DEFS.filter(c => checked[c.id]).length
            const ready = done === CHECK_DEFS.length && !partial
            const isPending = !sel.status || sel.status === 'pending'

            const groups = [
              {
                label: 'Who is applying', hint: 'The person you will be dealing with', bar: '#0ea5e9', headBg: '#f2fafe', border: '#cfe8f6',
                rows: [
                  { k: 'Business name', v: sel.business_name, size: 16, weight: 700 },
                  { k: 'Contact person', v: sel.contact_name },
                  { k: 'Email', v: sel.email },
                  { k: 'Phone', v: sel.phone, mono: true },
                  { k: 'Address', v: sel.address },
                ],
              },
              {
                label: 'What kind of business', hint: 'Use this to judge if they fit our wholesale program', bar: '#f0b429', headBg: '#fffdf5', border: '#f3e4bd',
                rows: [
                  { k: 'Legal structure', v: sel.business_type },
                  { k: 'Years operating', v: sel.years_in_business, flag: sel.years_in_business === 'Less than 1 year' ? 'New business' : null, flagBg: '#fde68a', flagInk: '#7c4a03' },
                  { k: 'Monthly volume', v: sel.monthly_volume, size: 16, weight: 700, flag: sel.monthly_volume === '$100,000+' ? 'High value' : null, flagBg: '#dcfce7', flagInk: '#166534' },
                  { k: 'Interested in', v: sel.categories?.length ? sel.categories.join(', ') : '—' },
                ],
              },
              {
                label: 'Tax numbers to verify', hint: 'These must match the documents on the right', bar: '#dc2626', headBg: '#fff7f7', border: '#f6d5d5',
                rows: [
                  { k: 'EIN number', v: sel.ein_number || '—', mono: true, size: 17, weight: 700 },
                  { k: 'Resale tax number', v: sel.resale_tax_number || '—', mono: true, size: 17, weight: 700 },
                  { k: 'Applied on', v: fmtDateTime(sel.created_at) },
                  { k: 'Application ID', v: sel.id?.slice(0,8).toUpperCase(), mono: true },
                ],
              },
            ]

            const docPath = docTab === 'EIN letter' ? sel.ein_document_url : sel.resale_tax_document_url
            const docLabel = docTab === 'EIN letter' ? 'ein-ss4-letter' : 'fl-resale-certificate'

            return (
              <>
                <div style={{ position: 'sticky', top: 0, zIndex: 6, background: '#ffffff', borderBottom: `2px solid ${ACCENT}`, padding: '16px clamp(14px,2vw,24px) 15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 10 }}>
                    <span className="lc-mono" style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: ACCENT, color: '#fff', fontSize: 11, fontWeight: 700 }}>2</span>
                    <span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: DEEP }}>The application</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.025em' }}>{sel.business_name}</span>
                        {isPending && <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 10px 5px', borderRadius: 6, background: days > 2 ? '#fee2e2' : '#fde68a', color: days > 2 ? '#991b1b' : '#7c4a03' }}>{days > 2 ? `Waiting ${days} days` : `Waiting ${days || 1} day${days===1?'':'s'}`}</span>}
                        {!isPending && <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 10px 5px', borderRadius: 6, background: sel.status === 'approved' ? '#dcfce7' : '#f1f2f5', color: sel.status === 'approved' ? '#166534' : '#6b7280' }}>{sel.status === 'approved' ? 'Approved' : 'Rejected'}</span>}
                      </span>
                      <span style={{ display: 'block', paddingTop: 7, fontSize: 15, color: '#47505e' }}>{sel.contact_name} · {sel.business_type || 'business type not set'} · wants to buy {sel.monthly_volume || 'an unspecified amount'} per month</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => openFirstContact(sel)} title="Opens WhatsApp with a message already written" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '10px 15px 11px', borderRadius: 8, background: '#16a34a', color: '#ffffff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{waLabel} <span style={{ fontWeight: 400, opacity: .85 }}>↗</span></button>
                      <a href={`mailto:${sel.email}?subject=${encodeURIComponent('Levam Corp — wholesale application ' + (sel.id?.slice(0,8).toUpperCase()||''))}&body=${encodeURIComponent(buildEmailBody(sel))}`} title="Opens your email app with the message already written" style={{ padding: '10px 14px 11px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e' }}>Email</a>
                    </span>
                  </div>
                </div>

                <div style={{ padding: 'clamp(14px,1.8vw,20px) clamp(14px,2vw,24px) 130px', display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>

                  <div style={{ background: '#ffffff', border: '1px solid #cfe8d7', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '15px 17px 16px', borderBottom: '1px solid #cfe8d7', background: '#f3faf5' }}>
                      <span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 7 }}><span className="lc-mono" style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: '#16a34a', color: '#fff', fontSize: 11, fontWeight: 700 }}>3</span><span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#166534' }}>Verify</span></span>
                        <span style={{ display: 'block', fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>Check these {CHECK_DEFS.length} things before approving</span>
                        <span style={{ display: 'block', paddingTop: 5, fontSize: 14, color: '#6b7280' }}>Tick each one as you confirm it against the documents on the right</span>
                      </span>
                      <span className="lc-mono" style={{ fontSize: 14, fontWeight: 700, padding: '6px 11px 7px', borderRadius: 7, background: done === CHECK_DEFS.length ? '#dcfce7' : '#eef0f4', color: done === CHECK_DEFS.length ? '#166534' : '#47505e' }}>{done} of {CHECK_DEFS.length} checked</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(258px, 1fr))' }}>
                      {CHECK_DEFS.map(c => {
                        const on = !!checked[c.id]
                        return (
                          <button key={c.id} type="button" onClick={() => setChecked(prev => ({ ...prev, [c.id]: !prev[c.id] }))} style={{ display: 'grid', gridTemplateColumns: '24px minmax(0,1fr)', gap: 11, alignItems: 'start', textAlign: 'left', border: 0, borderRight: '1px solid #f1f2f5', borderBottom: '1px solid #f1f2f5', cursor: 'pointer', background: on ? '#f4fbf6' : '#ffffff', padding: '13px 15px 14px' }}>
                            <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 6, border: `1px solid ${on ? '#16a34a' : '#c9ced6'}`, background: on ? '#16a34a' : '#ffffff', color: on ? '#ffffff' : 'transparent', fontSize: 13, fontWeight: 700 }}>{on ? '✓' : ''}</span>
                            <span>
                              <span style={{ display: 'block', fontSize: 14.5, fontWeight: 600, letterSpacing: '-.01em', color: on ? '#166534' : '#16181d' }}>{c.t}</span>
                              <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, lineHeight: 1.45, color: '#6b7280' }}>{c.b(sel)}</span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="apa-body-cols">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>
                      {groups.map(g => (
                        <div key={g.label} style={{ background: '#ffffff', border: `1px solid ${g.border}`, borderRadius: 12, overflow: 'hidden' }}>
                          <div style={{ padding: '14px 17px 15px', borderBottom: `1px solid ${g.border}`, background: g.headBg, borderLeft: `5px solid ${g.bar}` }}>
                            <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em' }}>{g.label}</span>
                            <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>{g.hint}</span>
                          </div>
                          {g.rows.map(r => (
                            <div key={r.k} style={{ display: 'grid', gridTemplateColumns: 'clamp(120px,32%,178px) minmax(0,1fr)', gap: 14, alignItems: 'baseline', padding: '12px 17px 13px', borderBottom: '1px solid #f1f2f5', background: g.label === 'Tax numbers to verify' ? '#fffafa' : '#ffffff' }}>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#6b7280' }}>{r.k}</span>
                              <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, minWidth: 0 }}>
                                <span className={r.mono ? 'lc-mono' : ''} style={{ fontSize: r.size || 15, fontWeight: r.weight || 500, lineHeight: 1.45, color: '#16181d', wordBreak: 'break-word' }}>{r.v || '—'}</span>
                                {r.flag && <span style={{ flex: 'none', fontSize: 12, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: r.flagBg, color: r.flagInk }}>{r.flag}</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div style={{ background: '#ffffff', border: '1px solid #ddd6f3', borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 8 }}>
                      <div style={{ padding: '14px 17px 15px', borderBottom: '1px solid #ddd6f3', background: '#f7f5fe' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 7 }}><span className="lc-mono" style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700 }}>4</span><span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#5b21b6' }}>Their documents</span></span>
                        <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.02em', color: '#4c1d95' }}>Documents they uploaded</span>
                        <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#6b7280' }}>Shown right here — no download needed</span>
                      </div>

                      <div style={{ display: 'flex', gap: 7, padding: '12px 17px 0' }}>
                        {['EIN letter', 'Resale'].map(k => {
                          const on = docTab === k
                          const isMissing = k === 'Resale' ? !sel.resale_tax_document_url : !sel.ein_document_url
                          const label = k === 'Resale' ? (isMissing ? 'Resale · missing' : 'Resale certificate') : 'EIN / SS-4 letter'
                          return <button key={k} type="button" onClick={() => setDocTab(k)} style={{ flex: '1 1 0', border: `1px solid ${on ? '#16181d' : isMissing ? '#f3c9c9' : '#d9dce2'}`, borderRadius: 8, cursor: 'pointer', background: on ? '#16181d' : isMissing ? '#fff6f6' : '#ffffff', color: on ? '#ffffff' : isMissing ? '#991b1b' : '#47505e', padding: '9px 10px 10px', fontSize: 13.5, fontWeight: on ? 700 : 600 }}>{label}</button>
                        })}
                      </div>

                      <div style={{ padding: '13px 17px 0' }}>
                        <div style={{ border: '1px solid #d9dce2', borderRadius: 10, background: '#eceef2', padding: 12, minHeight: 340, display: 'flex', alignItems: 'stretch' }}>
                          {!docPath ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '2rem', background: '#fff6f6', border: '1px dashed #f3c9c9', borderRadius: 6 }}>
                              <div style={{ fontSize: 14.5, fontWeight: 700, color: '#991b1b' }}>Document not submitted</div>
                              <div style={{ fontSize: 13, color: '#6b7280', textAlign: 'center' }}>The applicant hasn't uploaded this file yet. Ask for it on WhatsApp above.</div>
                            </div>
                          ) : docLoading ? (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b909a', fontSize: 13.5 }}>Loading document…</div>
                          ) : docUrl ? (
                            <iframe src={docUrl} title={docLabel} style={{ flex: 1, width: '100%', minHeight: 340, border: 'none', borderRadius: 4, background: '#fff' }} />
                          ) : (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991b1b', fontSize: 13.5 }}>Couldn't load this document</div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 17px 16px' }}>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{docPath ? `${docLabel}.pdf` : 'No file · ask the client for it'}</span>
                        {docUrl && (
                          <span style={{ display: 'flex', gap: 8 }}>
                            <button type="button" onClick={() => window.open(docUrl, '_blank')} style={{ padding: '8px 12px 9px', border: '1px solid #d9dce2', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Full size</button>
                            <button type="button" onClick={() => window.open(docUrl, '_blank')} style={{ padding: '8px 12px 9px', border: '1px solid #d9dce2', borderRadius: 7, fontSize: 13, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>↓ PDF</button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {isPending && (
                  <div style={{ position: 'sticky', bottom: 0, zIndex: 8, background: partial ? '#fff6f6' : ready ? '#f3faf5' : '#ffffff', borderTop: `3px solid ${partial ? '#dc2626' : ready ? '#16a34a' : '#c9ced6'}`, padding: '14px clamp(14px,2vw,24px) 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 9, paddingBottom: 7 }}><span className="lc-mono" style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: partial ? '#dc2626' : ready ? '#16a34a' : '#c9ced6', color: '#fff', fontSize: 11, fontWeight: 700 }}>5</span><span className="lc-mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: partial ? '#991b1b' : ready ? '#166534' : '#6b7280' }}>Decide</span></span>
                        <span style={{ display: 'block', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em' }}>{partial ? 'You cannot approve yet — a document is missing' : ready ? 'All checks done — safe to approve' : 'Finish the checklist above before you decide'}</span>
                        <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: partial ? '#991b1b' : ready ? '#166534' : '#6b7280' }}>{partial ? `Ask ${sel.contact_name} for the PDF on WhatsApp, then come back.` : ready ? 'Approving creates their partner account and emails the login.' : `${done} of ${CHECK_DEFS.length} checks confirmed.`}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => deleteApp(sel.id)} disabled={deleting === sel.id} style={{ padding: '12px 14px 13px', border: '1px solid #d9dce2', borderRadius: 9, fontSize: 13.5, fontWeight: 600, color: '#6b7280', background: '#ffffff', cursor: 'pointer' }}>{deleting === sel.id ? 'Deleting…' : 'Delete'}</button>
                        <button type="button" onClick={() => rejectApp(sel.id)} style={{ padding: '12px 16px 13px', border: '1px solid #f3c9c9', borderRadius: 9, fontSize: 14.5, fontWeight: 700, color: '#991b1b', background: '#ffffff', cursor: 'pointer' }}>Reject</button>
                        <button type="button" onClick={() => approveApp(sel)} disabled={partial || approving === sel.id} style={{ padding: '12px 20px 13px', borderRadius: 9, background: partial ? '#c9ced6' : '#16a34a', color: '#ffffff', fontSize: 14.5, fontWeight: 700, border: 'none', cursor: partial ? 'not-allowed' : 'pointer' }}>{approving === sel.id ? 'Approving…' : 'Approve & create partner account →'}</button>
                      </span>
                    </div>
                  </div>
                )}
                {sel.status === 'approved' && (
                  <div style={{ position: 'sticky', bottom: 0, zIndex: 8, background: '#f3faf5', borderTop: '3px solid #16a34a', padding: '14px clamp(14px,2vw,24px) 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#166534' }}>This application was approved — {sel.business_name} is now a partner.</span>
                    <Link href="/admin/clients" style={{ padding: '11px 16px 12px', borderRadius: 9, background: '#16a34a', color: '#ffffff', fontSize: 14, fontWeight: 700 }}>View in clients →</Link>
                  </div>
                )}
                {sel.status === 'rejected' && (
                  <div style={{ position: 'sticky', bottom: 0, zIndex: 8, background: '#ffffff', borderTop: '3px solid #c9ced6', padding: '14px clamp(14px,2vw,24px) 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#6b7280' }}>This application was rejected.</span>
                    <button type="button" onClick={() => deleteApp(sel.id)} disabled={deleting === sel.id} style={{ padding: '11px 16px 12px', border: '1px solid #d9dce2', borderRadius: 9, fontSize: 14, fontWeight: 600, color: '#6b7280', background: '#ffffff', cursor: 'pointer' }}>{deleting === sel.id ? 'Deleting…' : 'Delete'}</button>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
