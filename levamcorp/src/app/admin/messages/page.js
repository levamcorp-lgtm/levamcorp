'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'

// keyword-derived, not fabricated — matches real cold-outreach patterns (SEO/broker pitches) vs real wholesale enquiries
const SPAM_PATTERN = /\b(seo|gmb|gbp|google (my )?business|backlinks?|business broker|selling your business|valuation of your business|free (business )?audit|dm now|local seo|google reviews?|trustpilot|link building|guest post)\b/i

const REPLY_TEMPLATES = (first) => [
  {
    key: 'Apply', label: 'Invite them to apply',
    text: `Hi ${first},\n\nThank you for reaching out to Levam Corp Distributors. We work with approved B2B partners only, so the first step is a short application — we ask for your EIN and resale certificate and review every one personally, with a response within 48 hours.\n\nApply here: levamcorp.com/apply\n\nOnce approved you get portal access with live wholesale pricing on 500+ SKUs, real-time stock levels and 48-hour dispatch from our Doral, FL warehouse.\n\nBest regards,\nLevam Corp Distributors\n6315 NW 99th Ave, Doral, FL 33178\n(786) 490-9005`,
  },
  {
    key: 'Docs', label: 'Amazon / LOA answer',
    text: `Hi ${first},\n\nYes — every purchase comes with a commercial invoice issued by Levam Corp Distributors showing our business details, the products, quantities and prices, which is what Amazon asks for during seller verification.\n\nFor approved partners we can also provide documentation confirming authorized sourcing on request. Let us know which brands you plan to list and we will confirm exactly what we can issue for each one.\n\nThe next step is the wholesale application: levamcorp.com/apply\n\nBest regards,\nLevam Corp Distributors`,
  },
  {
    key: 'Export', label: 'International / export',
    text: `Hi ${first},\n\nThank you for your interest. We ship from Doral, FL and can work with export orders, but pricing and stock are only shared with approved partners.\n\nPlease start with the application at levamcorp.com/apply and include your company details. Once approved you will see live pricing and availability in your portal, and we can quote freight for your destination.\n\nBest regards,\nLevam Corp Distributors`,
  },
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

// collapse the body and drop a bare salutation so the row shows the real ask
function gist(body) {
  const flat = (body || '').replace(/\s+/g, ' ').trim()
  const cut = flat.replace(/^(hi|hello|hey|dear)\b[^,.!]{0,60}[,.!]\s*/i, '')
  return cut.length > 12 ? cut : flat
}

function classify(msg) {
  const text = `${msg.name || ''} ${msg.company || ''} ${msg.message || ''}`
  return SPAM_PATTERN.test(text) ? 'spam' : 'lead'
}

export default function AdminMessages() {
  const pathname = usePathname()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('Leads')
  const [selId, setSelId] = useState(null)
  const [tplKey, setTplKey] = useState('Apply')
  const [draft, setDraft] = useState('')
  const [replied, setReplied] = useState({})
  const [spamOverride, setSpamOverride] = useState({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      await loadMessages(supabase)
    })
  }, [])

  const loadMessages = async (supabase) => {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const kindOf = (msg) => {
    if (msg.status === 'spam') return 'spam'
    if (spamOverride[msg.id] === 'not-spam') return 'lead'
    return classify(msg)
  }

  const markRead = async (id) => {
    const supabase = createClient()
    await supabase.from('contact_messages').update({ status: 'read' }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m))
  }

  const markSpam = async (msg) => {
    const supabase = createClient()
    await supabase.from('contact_messages').update({ status: 'spam' }).eq('id', msg.id)
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'spam' } : m))
    setSpamOverride(prev => { const n = { ...prev }; delete n[msg.id]; return n })
    setSelId(null)
  }

  const markNotSpam = async (msg) => {
    const supabase = createClient()
    await supabase.from('contact_messages').update({ status: 'read' }).eq('id', msg.id)
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m))
    setSpamOverride(prev => ({ ...prev, [msg.id]: 'not-spam' }))
    setSelId(null)
  }

  const selectMessage = (msg) => {
    setSelId(msg.id)
    setTplKey('Apply')
    setDraft('')
    if (msg.status === 'new') markRead(msg.id)
  }

  const fmtStamp = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'
  const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Loading messages…</div>
      </div>
    </div>
  )

  const all = messages
  const leads = all.filter(m => kindOf(m) === 'lead')
  const spam = all.filter(m => kindOf(m) === 'spam')
  const repliedLeads = leads.filter(m => replied[m.id])
  const toAnswer = leads.filter(m => !replied[m.id])

  const badges = { Messages: { badge: String(toAnswer.length), urgent: toAnswer.length > 0 } }
  const shellCols = sidebarOpen ? 'clamp(212px, 16vw, 246px) clamp(300px, 24vw, 370px) minmax(0, 1fr)' : '76px clamp(300px, 26vw, 386px) minmax(0, 1fr)'

  const chipDefs = [
    { key: 'Leads', label: 'Real leads', dot: '#16a34a', n: toAnswer.length },
    { key: 'Replied', label: 'Replied', dot: ACCENT, n: repliedLeads.length },
    { key: 'Spam', label: 'Spam', dot: '#dc2626', n: spam.length },
    { key: 'All', label: 'Everything', dot: '#c9ced6', n: all.length },
  ]

  let list = all.slice()
  if (view === 'Leads') list = list.filter(m => kindOf(m) === 'lead' && !replied[m.id])
  else if (view === 'Replied') list = list.filter(m => kindOf(m) === 'lead' && replied[m.id])
  else if (view === 'Spam') list = list.filter(m => kindOf(m) === 'spam')

  const q = search.trim().toLowerCase()
  if (q) list = list.filter(m => (m.name + ' ' + (m.company || '') + ' ' + m.email + ' ' + m.message).toLowerCase().includes(q))

  const sel = selId ? all.find(m => m.id === selId) : (list[0] || null)

  return (
    <div style={{ background: '#f4f5f7', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .ams-shell { height:100vh; overflow:hidden; display:grid; grid-template-columns:${shellCols}; align-items:stretch; }
        @media(max-width:860px){ .ams-shell { height:auto; overflow:visible; grid-template-columns:1fr !important; } .ams-shell > div { height:auto !important; } }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; }
      `}</style>

      <div className="ams-shell">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={badges} />

        {/* LIST */}
        <div data-scroll style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#ffffff', borderRight: '1px solid #e2e4e9', minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#ffffff', borderBottom: `2px solid ${ACCENT}`, padding: '15px 15px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.02em' }}>Inbox</span>
              <span style={{ fontSize: 13.5, color: '#6b7280' }}>{all.length} total</span>
            </div>
            <div style={{ paddingTop: 6, fontSize: 14, color: '#6b7280' }}>{toAnswer.length} real leads waiting · {spam.length} spam filtered out</div>

            <div style={{ position: 'relative', paddingTop: 12 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', marginTop: -2, fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#8b909a' }}>⌕</span>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, company, email or text" style={{ width: '100%', boxSizing: 'border-box', padding: '11px 12px 12px 33px', border: '1px solid #d9dce2', borderRadius: 9, fontSize: 14.5, color: '#16181d', background: '#ffffff' }} />
            </div>

            <div data-scroll style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 12 }}>
              {chipDefs.map(c => {
                const on = c.key === view
                return (
                  <button key={c.key} type="button" onClick={() => { setView(c.key); setSelId(null) }} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 999, cursor: 'pointer', background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#47505e', padding: '7px 12px 8px', fontSize: 13, fontWeight: on ? 700 : 500, whiteSpace: 'nowrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot }} />{c.label}
                    <span className="lc-mono" style={{ fontSize: 11.5, fontWeight: 700, padding: '1px 6px 2px', borderRadius: 4, background: on ? 'rgba(255,255,255,.2)' : '#eef0f4', color: on ? '#ffffff' : '#6b7280' }}>{c.n}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {list.length === 0 ? (
            <div style={{ padding: '34px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Nothing here</div>
              <div style={{ paddingTop: 6, fontSize: 13.5, color: '#6b7280' }}>Try another filter or clear the search.</div>
            </div>
          ) : list.map(m => {
            const on = sel?.id === m.id
            const isSpam = kindOf(m) === 'spam'
            const rep = !!replied[m.id]
            return (
              <button key={m.id} type="button" onClick={() => selectMessage(m)} style={{ display: 'block', width: '100%', textAlign: 'left', border: 0, borderBottom: '1px solid #f1f2f5', borderLeft: `4px solid ${on ? ACCENT : isSpam ? '#dc2626' : '#16a34a'}`, cursor: 'pointer', background: on ? '#e8f1ff' : isSpam ? '#fcfcfd' : '#ffffff', padding: '13px 15px 14px' }}>
                <span style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 8, background: isSpam ? '#f1f2f5' : '#dcfce7', color: isSpam ? '#8b909a' : '#166534', fontSize: 14, fontWeight: 700 }}>{m.name?.[0]?.toUpperCase() || '?'}</span>
                  <span style={{ minWidth: 0, flex: '1 1 auto' }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                      <span style={{ fontSize: 14.5, fontWeight: isSpam ? 600 : 700, letterSpacing: '-.01em', color: isSpam ? '#6b7280' : '#16181d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                      <span style={{ flex: 'none', fontSize: 12, color: '#8b909a' }}>{fmtShort(m.created_at)}</span>
                    </span>
                    <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#8b909a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.company ? `${m.company} · ${m.email}` : m.email}</span>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingTop: 7, fontSize: 13.5, lineHeight: 1.45, color: isSpam ? '#8b909a' : '#47505e' }}>{gist(m.message)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', paddingTop: 9 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: isSpam ? '#fee2e2' : '#dcfce7', color: isSpam ? '#991b1b' : '#166534' }}>{isSpam ? 'Spam' : 'Real lead'}</span>
                      {rep && <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: '#dcfce7', color: '#166534' }}>Replied</span>}
                      {m.status === 'new' && <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 8px 4px', borderRadius: 5, background: '#e8f1ff', color: DEEP }}>New</span>}
                    </span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* DETAIL */}
        <div data-scroll style={{ height: '100vh', overflowY: 'auto', background: '#f4f5f7' }}>
          {!sel ? (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', padding: 30 }}>
              <div style={{ textAlign: 'center', maxWidth: '34ch' }}>
                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>Pick a message on the left</div>
                <div style={{ paddingTop: 7, fontSize: 14, lineHeight: 1.6, color: '#6b7280' }}>Real leads are marked in green. The rest is spam you can clear in one click.</div>
              </div>
            </div>
          ) : (() => {
            const isSpam = kindOf(sel) === 'spam'
            const first = (sel.name || 'there').split(' ')[0]
            const rep = !!replied[sel.id]
            const templates = REPLY_TEMPLATES(first)
            const activeTpl = templates.find(t => t.key === tplKey) || templates[0]
            const text = draft || activeTpl.text
            const ready = text.trim().length > 20
            const phoneDigits = (sel.phone || '').replace(/\D/g, '')
            const waHref = phoneDigits ? `https://wa.me/${phoneDigits}` : null
            const mailHref = `mailto:${sel.email}?subject=${encodeURIComponent('Levam Corp Distributors — wholesale enquiry')}`
            const replyMailHref = `mailto:${sel.email}?subject=${encodeURIComponent('Levam Corp Distributors — wholesale enquiry')}&body=${encodeURIComponent(text)}`
            const replyWaHref = phoneDigits ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}` : null
            const bar = isSpam ? '#dc2626' : '#16a34a'

            const onSent = () => setReplied(prev => ({ ...prev, [sel.id]: true }))

            return (
              <div>
                <div style={{ position: 'sticky', top: 0, zIndex: 6, background: '#ffffff', borderBottom: `2px solid ${bar}`, padding: '16px clamp(14px,2vw,24px) 15px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'flex-start', gap: 13, minWidth: 0 }}>
                      <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: 11, background: isSpam ? '#f1f2f5' : '#dcfce7', color: isSpam ? '#8b909a' : '#166534', fontSize: 19, fontWeight: 700 }}>{sel.name?.[0]?.toUpperCase() || '?'}</span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.025em' }}>{sel.name}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 700, padding: '4px 10px 5px', borderRadius: 6, background: isSpam ? '#fee2e2' : '#dcfce7', color: isSpam ? '#991b1b' : '#166534' }}>{isSpam ? 'Spam' : 'Real lead'}</span>
                        </span>
                        <span style={{ display: 'block', paddingTop: 6, fontSize: 14.5, color: '#47505e' }}>{sel.company || sel.email}</span>
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                      {waHref && !isSpam && <a href={waHref} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 15px 11px', borderRadius: 8, background: '#16a34a', color: '#ffffff', fontSize: 14, fontWeight: 700 }}>WhatsApp <span style={{ fontWeight: 400, opacity: .85 }}>↗</span></a>}
                      <a href={mailHref} style={{ padding: '10px 14px 11px', borderRadius: 8, background: ACCENT, color: '#ffffff', fontSize: 14, fontWeight: 700 }}>Reply by email</a>
                      {isSpam ? (
                        <button type="button" onClick={() => markNotSpam(sel)} style={{ cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', color: '#47505e', padding: '10px 13px 11px', fontSize: 14, fontWeight: 700 }}>Not spam</button>
                      ) : (
                        <button type="button" onClick={() => markSpam(sel)} title="Move this out of your leads" style={{ cursor: 'pointer', border: '1px solid #f3c9c9', borderRadius: 8, background: '#ffffff', color: '#991b1b', padding: '10px 13px 11px', fontSize: 14, fontWeight: 700 }}>Mark as spam</button>
                      )}
                    </span>
                  </div>
                </div>

                <div style={{ padding: 'clamp(14px,1.8vw,20px) clamp(14px,2vw,24px) clamp(40px,6vh,60px)', display: 'flex', flexDirection: 'column', gap: 'clamp(12px,1.5vw,16px)' }}>

                  {!isSpam && (
                    <div style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr)', gap: 12, alignItems: 'center', background: rep ? '#f3faf5' : '#fffbf2', border: `1px solid ${rep ? '#cfe8d7' : '#f3d9a4'}`, borderRadius: 11, padding: '14px 16px 15px' }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, background: rep ? '#16a34a' : '#f0b429', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700 }}>{rep ? '✓' : '!'}</span>
                      <span>
                        <span style={{ display: 'block', fontSize: 15, fontWeight: 700, letterSpacing: '-.01em', color: rep ? '#166534' : '#8a5a00' }}>{rep ? 'You already replied to this one' : 'This is a real wholesale enquiry — answer it'}</span>
                        <span style={{ display: 'block', paddingTop: 4, fontSize: 13.5, color: '#47505e' }}>{rep ? 'Tracked for this session — reopen the reply box below to send again.' : 'Every answered lead is a possible partner.'}</span>
                      </span>
                    </div>
                  )}

                  <div style={{ background: '#ffffff', border: '1px solid #cfe8f6', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px 14px', borderBottom: '1px solid #cfe8f6', background: '#f2fafe', borderLeft: '5px solid #0ea5e9' }}>
                      <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#0ea5e9', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>@</span>
                      <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#075985' }}>How to reach them</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 1, background: '#eceef2' }}>
                      {[
                        { icon: 'P', k: 'Name', v: sel.name },
                        { icon: 'B', k: 'Company', v: sel.company || '—' },
                        { icon: '@', k: 'Email', v: sel.email },
                        { icon: 'T', k: 'Phone', v: sel.phone || 'Not given' },
                      ].map(c => (
                        <div key={c.k} style={{ background: '#ffffff', padding: '12px 15px 13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <span style={{ display: 'grid', placeItems: 'center', width: 21, height: 21, borderRadius: 5, background: '#eef0f4', color: '#6b7280', fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700 }}>{c.icon}</span>
                            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#6b7280' }}>{c.k}</span>
                          </div>
                          <div style={{ paddingTop: 7, fontSize: 14.5, fontWeight: 600, color: '#16181d', wordBreak: 'break-word' }}>{c.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '13px 16px 14px', borderBottom: '1px solid #e2e4e9' }}>
                      <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em' }}>What they wrote</span>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>{fmtStamp(sel.created_at)}</span>
                    </div>
                    <div style={{ padding: '16px 18px 18px', fontSize: 15, lineHeight: 1.68, color: '#16181d', whiteSpace: 'pre-line' }}>{sel.message}</div>
                  </div>

                  {!isSpam && (
                    <div style={{ background: '#ffffff', border: '1px solid #cfe8d7', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px 14px', borderBottom: '1px solid #cfe8d7', background: '#f3faf5', borderLeft: '5px solid #16a34a' }}>
                        <span style={{ display: 'grid', placeItems: 'center', width: 23, height: 23, borderRadius: 6, background: '#16a34a', color: '#ffffff', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700 }}>R</span>
                        <span>
                          <span style={{ display: 'block', fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#166534' }}>Reply to {first}</span>
                          <span style={{ display: 'block', paddingTop: 3, fontSize: 13.5, color: '#6b7280' }}>Pick a ready answer, edit it, then send</span>
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '13px 16px 0' }}>
                        {templates.map(t => {
                          const on = t.key === tplKey
                          return <button key={t.key} type="button" onClick={() => { setTplKey(t.key); setDraft('') }} style={{ cursor: 'pointer', border: `1px solid ${on ? '#16181d' : '#d9dce2'}`, borderRadius: 8, background: on ? '#16181d' : '#ffffff', color: on ? '#ffffff' : '#47505e', padding: '9px 13px 10px', fontSize: 13.5, fontWeight: on ? 700 : 500 }}>{t.label}</button>
                        })}
                      </div>

                      <div style={{ padding: '13px 16px 16px' }}>
                        <textarea value={text} onChange={e => setDraft(e.target.value)} rows={8} placeholder="Write your reply…" style={{ width: '100%', boxSizing: 'border-box', padding: '13px 14px 14px', border: '1px solid #d9dce2', borderRadius: 9, fontSize: 14.5, lineHeight: 1.6, color: '#16181d', background: '#ffffff', resize: 'vertical' }} />
                        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', paddingTop: 12 }}>
                          <a href={ready ? replyMailHref : undefined} onClick={() => ready && onSent()} style={{ flex: '1 1 180px', textAlign: 'center', padding: '13px 15px 14px', borderRadius: 9, background: ready ? '#16a34a' : '#c9ced6', color: '#ffffff', fontSize: 14.5, fontWeight: 700, pointerEvents: ready ? 'auto' : 'none' }}>Send by email</a>
                          {replyWaHref && <a href={ready ? replyWaHref : undefined} target="_blank" rel="noreferrer" onClick={() => ready && onSent()} style={{ flex: '1 1 160px', textAlign: 'center', padding: '13px 15px 14px', border: '1px solid #d9dce2', borderRadius: 9, color: '#47505e', fontSize: 14.5, fontWeight: 700, pointerEvents: ready ? 'auto' : 'none' }}>Send on WhatsApp</a>}
                        </div>
                        <div style={{ paddingTop: 10, fontSize: 12.5, color: ready ? '#6b7280' : '#b45309' }}>{ready ? 'Opens your email app or WhatsApp with this exact text.' : 'Write a bit more before sending.'}</div>
                      </div>
                    </div>
                  )}

                  {isSpam && (
                    <div style={{ background: '#ffffff', border: '1px solid #f6d5d5', borderRadius: 12, padding: '16px 18px 18px' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-.02em', color: '#991b1b' }}>This one is not a real lead</div>
                      <div style={{ paddingTop: 7, fontSize: 14, lineHeight: 1.6, color: '#47505e' }}>Matched our cold-outreach filter (SEO/marketing/business-broker pitches) — not someone who wants to buy from us.</div>
                      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', paddingTop: 14 }}>
                        <button type="button" onClick={() => markNotSpam(sel)} style={{ cursor: 'pointer', border: '1px solid #d9dce2', borderRadius: 8, background: '#ffffff', color: '#47505e', padding: '12px 16px 13px', fontSize: 14, fontWeight: 700 }}>Actually a real lead</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
