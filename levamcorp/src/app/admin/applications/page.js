'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'
const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [approving, setApproving] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('pending')

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
    await fetch('/api/send-approval-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientEmail: app.email, clientName: app.contact_name, businessName: app.business_name })
    })
    await loadApps(supabase)
    setApproving(null)
  }

  const rejectApp = async (id) => {
    const supabase = createClient()
    await supabase.from('applications').update({ status: 'rejected' }).eq('id', id)
    await loadApps(supabase)
  }

  const buildFirstContactMessage = (app) => {
    const firstName = (app.contact_name || '').trim().split(' ')[0] || 'there'
    return `Hi ${firstName}! 👋 This is the Levam Corp Distributors team — thank you for applying${app.business_name ? ` with *${app.business_name}*` : ''}!\n\nWe review every application personally, and we'd love to learn a bit more about your business while we finish reviewing yours:\n\n• What products are you most interested in sourcing?\n• Roughly what's your monthly order volume?\n• Are you selling online (Amazon/Walmart), retail, or both?\n\nFeel free to reply here anytime — happy to help! 🙌`
  }

  const openFirstContact = async (app) => {
    const digits = (app.phone || '').replace(/\D/g, '')
    if (!digits) { alert('No phone number on file for this application.'); return }
    const withCountry = digits.length === 10 ? '1' + digits : digits
    window.open(`https://wa.me/${withCountry}?text=${encodeURIComponent(buildFirstContactMessage(app))}`, '_blank')
    const supabase = createClient()
    const now = new Date().toISOString()
    const { error } = await supabase.from('applications').update({ first_contact_at: now }).eq('id', app.id)
    if (!error) setApplications(prev => prev.map(a => a.id === app.id ? { ...a, first_contact_at: now } : a))
  }

  const deleteApp = async (id) => {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from('applications').delete().eq('id', id)
    setApplications(prev => prev.filter(a => a.id !== id))
    if (expanded === id) setExpanded(null)
    setDeleting(null)
  }

  const getDocUrl = async (path) => {
    if (!path) { alert('No document found for this application.'); return }
    if (path.startsWith('http')) { window.open(path, '_blank'); return }
    const supabase = createClient()
    // Try capital D first (that's the bucket name)
    let result = await supabase.storage.from('Documents').createSignedUrl(path, 3600)
    if (result.data?.signedUrl) { window.open(result.data.signedUrl, '_blank'); return }
    // Try lowercase fallback
    result = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (result.data?.signedUrl) { window.open(result.data.signedUrl, '_blank'); return }
    // Try public URL
    const { data: pub } = supabase.storage.from('Documents').getPublicUrl(path)
    if (pub?.publicUrl) { window.open(pub.publicUrl, '_blank'); return }
    alert('Could not open document.\nPath: ' + path + '\nError: ' + (result.error?.message || 'Not found'))
  }

  const fmtDate = (d) => {
    if (!d) return 'N/A'
    try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }
    catch { return 'N/A' }
  }
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const statusConfig = {
    pending:  { label: 'Pending review', color: '#854f0b', bg: 'rgba(186,117,23,0.12)', icon: '⏳' },
    approved: { label: 'Approved',       color: '#2a7d4f', bg: 'rgba(42,125,79,0.12)',  icon: '✅' },
    rejected: { label: 'Rejected',       color: '#e74c3c', bg: 'rgba(231,76,60,0.12)',  icon: '✕'  },
  }

  const filtered = applications.filter(a => {
    if (filter === 'all') return true
    if (filter === 'pending') return !a.status || a.status === 'pending'
    return a.status === filter
  })

  const pending = applications.filter(a => !a.status || a.status === 'pending').length
  const approved = applications.filter(a => a.status === 'approved').length
  const rejected = applications.filter(a => a.status === 'rejected').length

  if (loading) return <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>Loading...</div>

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#111', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(0,0,0,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart'],['Offers','/admin/offers']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Applications' ? '#2d7dd2' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Applications' ? '2px solid #2d7dd2' : '2px solid transparent', position: 'relative' }}>
                {label}
                {label === 'Applications' && pending > 0 && <span style={{ position: 'absolute', top: 0, right: 4, width: 8, height: 8, background: '#e74c3c', borderRadius: '50%' }} />}
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#999', border: '0.5px solid rgba(0,0,0,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* STATS */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', padding: '1.25rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Total applications', value: applications.length, color: '#2d7dd2', icon: '📋' },
          { label: 'Pending review', value: pending, color: pending > 0 ? '#854f0b' : '#555', icon: '⏳' },
          { label: 'Approved', value: approved, color: '#2a7d4f', icon: '✅' },
          { label: 'Rejected', value: rejected, color: rejected > 0 ? '#e74c3c' : '#555', icon: '✕' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 4, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 9, color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
            <span style={{ fontSize: 20, opacity: 0.25 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div style={{ padding: '1.25rem 2rem', display: 'flex', gap: 8, alignItems: 'center' }}>
        {[['pending','⏳ Pending',pending,'#854f0b'],['approved','✅ Approved',approved,'#2a7d4f'],['rejected','✕ Rejected',rejected,'#e74c3c'],['all','All',applications.length,'#2d7dd2']].map(([val, label, count, color]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ fontSize: 11, fontWeight: filter === val ? 700 : 400, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${filter === val ? color : 'rgba(0,0,0,0.08)'}`, background: filter === val ? color + '20' : 'transparent', color: filter === val ? color : '#777', display: 'flex', alignItems: 'center', gap: 6 }}>
            {label} <span style={{ fontSize: 9, background: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: '1px 6px' }}>{count}</span>
          </button>
        ))}
      </div>

      {/* APPLICATIONS */}
      <div style={{ padding: '0 2rem 2rem' }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 6, padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, color: '#999' }}>No applications in this category</div>
          </div>
        ) : filtered.map(app => {
          const s = statusConfig[app.status || 'pending']
          const isExpanded = expanded === app.id
          return (
            <div key={app.id} style={{ background: '#fff', borderTop: `1px solid ${isExpanded ? s.color + '50' : 'rgba(0,0,0,0.06)'}`, borderRight: `1px solid ${isExpanded ? s.color + '50' : 'rgba(0,0,0,0.06)'}`, borderBottom: `1px solid ${isExpanded ? s.color + '50' : 'rgba(0,0,0,0.06)'}`, borderLeft: `4px solid ${s.color}`, borderRadius: 6, marginBottom: 10, overflow: 'hidden', transition: 'all 0.2s' }}>

              {/* HEADER ROW */}
              <div onClick={() => setExpanded(isExpanded ? null : app.id)}
                style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '1rem', alignItems: 'center', cursor: 'pointer' }}>

                {/* Avatar */}
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.bg, border: `2px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: s.color, flexShrink: 0 }}>
                  {app.business_name?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{app.business_name}</div>
                    <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 700 }}>{s.icon} {s.label}</span>
                    {app.first_contact_at
                      ? <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 10, background: 'rgba(37,211,102,0.12)', color: '#25D366', fontWeight: 700 }}>📲 Contacted</span>
                      : (!app.status || app.status === 'pending') && <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 10, background: 'rgba(186,117,23,0.12)', color: '#854f0b', fontWeight: 700 }}>📲 Not contacted yet</span>
                    }
                  </div>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#666' }}>👤 {app.contact_name}</span>
                    <span style={{ fontSize: 12, color: '#666' }}>📧 {app.email}</span>
                    <span style={{ fontSize: 12, color: '#666' }}>📞 {app.phone}</span>
                    <span style={{ fontSize: 12, color: '#999' }}>📅 {fmtDate(app.created_at)}</span>
                  </div>
                </div>

                {/* Documents status */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ textAlign: 'center', padding: '6px 10px', background: app.ein_document_url ? 'rgba(42,125,79,0.1)' : 'rgba(231,76,60,0.1)', border: `0.5px solid ${app.ein_document_url ? 'rgba(42,125,79,0.3)' : 'rgba(231,76,60,0.3)'}`, borderRadius: 4 }}>
                    <div style={{ fontSize: 14, marginBottom: 2 }}>{app.ein_document_url ? '✅' : '❌'}</div>
                    <div style={{ fontSize: 8, color: '#666', letterSpacing: '0.08em' }}>EIN DOC</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '6px 10px', background: app.resale_tax_document_url ? 'rgba(42,125,79,0.1)' : 'rgba(231,76,60,0.1)', border: `0.5px solid ${app.resale_tax_document_url ? 'rgba(42,125,79,0.3)' : 'rgba(231,76,60,0.3)'}`, borderRadius: 4 }}>
                    <div style={{ fontSize: 14, marginBottom: 2 }}>{app.resale_tax_document_url ? '✅' : '❌'}</div>
                    <div style={{ fontSize: 8, color: '#666', letterSpacing: '0.08em' }}>RESALE</div>
                  </div>
                </div>

                {/* Expand arrow */}
                <div style={{ fontSize: 18, color: '#444', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>⌄</div>
              </div>

              {/* EXPANDED DETAILS */}
              {isExpanded && (
                <div style={{ borderTop: `0.5px solid ${s.color}30` }}>

                  {/* FULL DETAILS GRID */}
                  <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>📋 Complete application details</div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1.5rem' }}>
                      {[
                        ['Business name', app.business_name, '🏢'],
                        ['Contact name', app.contact_name, '👤'],
                        ['Email address', app.email, '📧'],
                        ['Phone number', app.phone, '📞'],
                        ['Business type', app.business_type, '🏭'],
                        ['Monthly volume', app.monthly_volume, '📊'],
                        ['Years in business', app.years_in_business, '📅'],
                        ['EIN number', app.ein_number, '🔢'],
                        ['Resale tax number', app.resale_tax_number, '📄'],
                        ['Address', app.address, '📍'],
                        ['Applied on', fmtDate(app.created_at) + ' at ' + fmtTime(app.created_at), '🕐'],
                        ['Application ID', app.id?.slice(0,8).toUpperCase(), '🆔'],
                      ].map(([label, val, icon]) => (
                        <div key={label} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 5 }}>
                          <div style={{ fontSize: 9, color: '#999', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span>{icon}</span> {label}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: val ? '#e0e0e0' : '#444' }}>{val || '—'}</div>
                        </div>
                      ))}
                    </div>

                    {/* DOCUMENTS */}
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#666', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>📁 Documents submitted</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.5rem' }}>
                      {[
                        { label: 'EIN / SS4 Letter', number: app.ein_number, url: app.ein_document_url, icon: '🏛' },
                        { label: 'Resale Tax Certificate', number: app.resale_tax_number, url: app.resale_tax_document_url, icon: '📜' },
                      ].map(doc => (
                        <div key={doc.label} style={{ padding: '1.25rem', background: doc.url ? 'rgba(42,125,79,0.06)' : 'rgba(231,76,60,0.06)', border: `1px solid ${doc.url ? 'rgba(42,125,79,0.2)' : 'rgba(231,76,60,0.2)'}`, borderRadius: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <span style={{ fontSize: 24 }}>{doc.icon}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 2 }}>{doc.label}</div>
                              <div style={{ fontSize: 11, color: '#666' }}>Number: {doc.number || '—'}</div>
                            </div>
                          </div>
                          {doc.url ? (
                            <button onClick={() => getDocUrl(doc.url)} style={{ width: '100%', padding: '10px', background: '#2d7dd2', color: '#111', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 4, letterSpacing: '0.06em' }}>
                              📄 View / Download PDF
                            </button>
                          ) : (
                            <div style={{ padding: '10px', background: 'rgba(231,76,60,0.1)', borderRadius: 4, fontSize: 11, color: '#e74c3c', textAlign: 'center', fontWeight: 600 }}>
                              ❌ Document not submitted
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button onClick={() => openFirstContact(app)}
                        style={{ flexBasis: '100%', padding: '13px', background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#111', fontSize: 13, fontWeight: 800, letterSpacing: '0.06em', border: 'none', cursor: 'pointer', borderRadius: 4, boxShadow: '0 4px 14px rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#111"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        {app.first_contact_at ? `Message again on WhatsApp (first contacted ${fmtDate(app.first_contact_at)})` : 'First contact on WhatsApp'}
                      </button>
                      {(!app.status || app.status === 'pending') && (
                        <>
                          <button onClick={() => approveApp(app)} disabled={approving === app.id}
                            style={{ flex: 1, padding: '13px', background: approving === app.id ? '#333' : '#2a7d4f', color: '#111', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 4, boxShadow: '0 4px 14px rgba(42,125,79,0.3)' }}>
                            {approving === app.id ? 'Approving...' : '✅ Approve & create client'}
                          </button>
                          <button onClick={() => rejectApp(app.id)}
                            style={{ flex: 1, padding: '13px', background: 'rgba(231,76,60,0.1)', color: '#e74c3c', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid rgba(231,76,60,0.3)', cursor: 'pointer', borderRadius: 4 }}>
                            ✕ Reject application
                          </button>
                        </>
                      )}
                      {app.status === 'approved' && (
                        <Link href="/admin/clients" style={{ flex: 1, padding: '13px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid rgba(42,125,79,0.3)', cursor: 'pointer', borderRadius: 4, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                          👤 View in clients →
                        </Link>
                      )}
                      <button onClick={() => deleteApp(app.id)} disabled={deleting === app.id}
                        style={{ padding: '13px 20px', background: 'rgba(231,76,60,0.08)', color: '#e74c3c', fontSize: 13, fontWeight: 600, border: '0.5px solid rgba(231,76,60,0.25)', cursor: 'pointer', borderRadius: 4 }}>
                        {deleting === app.id ? 'Deleting...' : '🗑 Delete'}
                      </button>
                      <a href={`mailto:${app.email}?subject=Re: Your Levam Corp application`}
                        style={{ padding: '13px 20px', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', fontSize: 13, fontWeight: 600, border: '0.5px solid rgba(45,125,210,0.25)', cursor: 'pointer', borderRadius: 4, textDecoration: 'none' }}>
                        📧 Email
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
