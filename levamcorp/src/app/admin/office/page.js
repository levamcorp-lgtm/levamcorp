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
    { label: 'Online Office', code: 'OC', href: '/admin/office' },
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

// ── ISOMETRIC DESK — a little pure-CSS 3D desk for each cubicle, built from three
// skewed/rotated panels (seat wall, desk front, desk top) so it reads as a real corner
// of an office instead of a flat icon. Color is the only thing that changes per agent.
function IsoDesk({ color, dim, muted }) {
  const panel = muted ? '#eef0f4' : color
  const top = muted ? '#f6f7f9' : `color-mix(in srgb, ${color} 55%, #ffffff)`
  const side = muted ? '#e2e4e9' : `color-mix(in srgb, ${color} 75%, #000000)`
  return (
    <div style={{ position: 'relative', width: 96, height: 72, margin: '0 auto', opacity: dim ? 0.55 : 1 }}>
      {/* floor diamond */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, width: 96, height: 48, background: '#f4f5f7', borderRadius: 6, transform: 'perspective(240px) rotateX(55deg)', transformOrigin: 'bottom' }} />
      {/* desk front panel */}
      <div style={{ position: 'absolute', left: 14, bottom: 10, width: 46, height: 26, background: side, borderRadius: '3px 3px 0 0' }} />
      {/* desk top panel */}
      <div style={{ position: 'absolute', left: 10, bottom: 32, width: 54, height: 16, background: top, borderRadius: 3, transform: 'perspective(160px) rotateX(45deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }} />
      {/* monitor */}
      <div style={{ position: 'absolute', left: 30, bottom: 40, width: 16, height: 12, background: panel, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.18)' }} />
      <div style={{ position: 'absolute', left: 36, bottom: 36, width: 4, height: 5, background: side }} />
      {/* agent chair blip */}
      <div style={{ position: 'absolute', left: 66, bottom: 6, width: 14, height: 14, borderRadius: '50%', background: muted ? '#d9dce2' : panel, boxShadow: muted ? 'none' : `0 0 0 3px color-mix(in srgb, ${color} 18%, transparent)` }} />
    </div>
  )
}

const AGENTS = [
  {
    key: 'applications', title: 'Applications', role: 'Reviews new partner applications and follows up with the ones still pending.',
    color: '#2F7DF6', trained: true, href: '/admin/applications', cta: 'Open Applications',
  },
  {
    key: 'sales', title: 'Sales', role: 'Reaches out to prospects to help bring in new wholesale partners.',
    color: '#16a34a', trained: true, href: '/admin/recruit', cta: 'Open Recruit',
  },
  {
    key: 'stock', title: 'Stock', role: 'Takes the products you send over and gets them listed and live on the site.',
    color: '#f0b429', trained: true, href: '/admin/products', cta: 'Open Products',
  },
  {
    key: 'marketing', title: 'Marketing', role: 'Will put together photos and graphics for social media posts.',
    color: '#7c3aed', trained: false, href: null, cta: null,
  },
  {
    key: 'calls', title: 'Calls', role: 'Will help handle incoming calls from partners and prospects.',
    color: '#dc2626', trained: false, href: null, cta: null,
  },
]

export default function AdminOffice() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [pendingApps, setPendingApps] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [clientCount, setClientCount] = useState(0)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      const [{ data: apps }, { count: products }, { count: clients }] = await Promise.all([
        sb.from('applications').select('status'),
        sb.from('products').select('*', { count: 'exact', head: true }),
        sb.from('clients').select('*', { count: 'exact', head: true }),
      ])
      setPendingApps((apps || []).filter(a => !a.status || a.status === 'pending').length)
      setProductCount(products || 0)
      setClientCount(clients || 0)
      setLoading(false)
    })
  }, [])

  const logout = async () => { await createClient().auth.signOut(); window.location.href = '/admin' }

  const statFor = (key) => {
    if (key === 'applications') return pendingApps > 0 ? { v: String(pendingApps), k: pendingApps === 1 ? 'pending' : 'pending' } : { v: '0', k: 'pending' }
    if (key === 'stock') return { v: String(productCount), k: 'products live' }
    if (key === 'sales') return { v: String(clientCount), k: 'partners so far' }
    return null
  }

  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Opening the office…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        .ofc-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .ofc-shell { grid-template-columns:1fr !important; } .ofc-shell > div:first-child { position:static !important; max-height:none !important; } }
        .ofc-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:16px; }
        .ofc-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .ofc-card.trained:hover { transform: translateY(-3px); box-shadow: 0 10px 24px -12px rgba(0,0,0,0.25); }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; color:inherit; }
      `}</style>

      <div className="ofc-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={{ Applications: pendingApps > 0 ? { badge: String(pendingApps), urgent: true } : {} }} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Online Office</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{AGENTS.filter(a => a.trained).length} of {AGENTS.length} desks trained</span>
            </div>
            <button type="button" onClick={logout} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.015em' }}>A desk for every job<span style={{ color: ACCENT }}>.</span></div>
              <div style={{ paddingTop: 6, fontSize: 14.5, color: '#6b7280', maxWidth: 560 }}>Each cubicle is an agent we're training for one part of the business. The trained ones already plug into real data below — the rest are empty desks waiting for their first assignment.</div>
            </div>

            <div className="ofc-grid">
              {AGENTS.map(a => {
                const stat = statFor(a.key)
                const card = (
                  <div className={`ofc-card ${a.trained ? 'trained' : ''}`} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 14, overflow: 'hidden', cursor: a.trained ? 'pointer' : 'default', opacity: a.trained ? 1 : 0.92 }}>
                    <div style={{ padding: '22px 16px 10px', background: a.trained ? `color-mix(in srgb, ${a.color} 6%, #ffffff)` : '#fafbfc' }}>
                      <IsoDesk color={a.color} muted={!a.trained} />
                    </div>
                    <div style={{ padding: '14px 16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <span style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-.01em' }}>{a.title}</span>
                        <span className="lc-mono" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 8px 4px', borderRadius: 999, background: a.trained ? '#dcfce7' : '#f1f2f5', color: a.trained ? '#166534' : '#6b7280' }}>{a.trained ? 'Trained' : 'Not trained yet'}</span>
                      </div>
                      <div style={{ paddingTop: 7, fontSize: 13.5, lineHeight: 1.5, color: '#47505e', minHeight: 56 }}>{a.role}</div>
                      <div style={{ marginTop: 10, paddingTop: 12, borderTop: '1px solid #eef0f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        {stat ? (
                          <span>
                            <span className="lc-mono" style={{ fontSize: 17, fontWeight: 700 }}>{stat.v}</span>
                            <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 6 }}>{stat.k}</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: 12.5, color: '#9aa0aa' }}>Not wired up yet</span>
                        )}
                        {a.trained && <span style={{ fontSize: 13, fontWeight: 700, color: DEEP }}>{a.cta} →</span>}
                      </div>
                    </div>
                  </div>
                )
                return a.trained ? <Link key={a.key} href={a.href}>{card}</Link> : <div key={a.key}>{card}</div>
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
