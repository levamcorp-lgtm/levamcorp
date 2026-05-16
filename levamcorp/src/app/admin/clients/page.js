'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [credEmail, setCredEmail] = useState('')
  const [credPassword, setCredPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      await loadAll(supabase)
    })
  }, [])

  const loadAll = async (supabase) => {
    const [{ data: clientsData }, { data: ordersData }] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*, order_items(*)').order('submitted_at', { ascending: false }),
    ])
    setClients(clientsData || [])
    setOrders(ordersData || [])
    setLoading(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const openDoc = async (path) => {
    if (!path) return
    const supabase = createClient()
    const { data } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
    else alert('Could not open document. Please check storage permissions.')
  }

  const sendCredentials = async () => {
    if (!credEmail || !credPassword) { alert('Please enter email and password'); return }
    setSending(true)
    try {
      const res = await fetch('/api/send-credentials-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credEmail, password: credPassword, businessName: selected?.business_name || '', contactName: selected?.contact_name || '' })
      })
      const data = await res.json()
      if (data.success) { setSent(true); setTimeout(() => setSent(false), 3000) }
      else alert('Error: ' + data.error)
    } catch (e) { alert('Error: ' + e.message) }
    setSending(false)
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const fmtDateShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const getClientOrders = (client) => orders.filter(o => o.notes?.match(/Email: ([^\s|,]+)/)?.[1] === client.email)
  const totalRevenue = (client) => getClientOrders(client).filter(o => ['confirmed','dispatched','completed'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0)
  const totalOrdered = (client) => getClientOrders(client).reduce((s, o) => s + (o.total || 0), 0)

  const statusConfig = {
    new: { color: '#2d7dd2', label: 'New' },
    review: { color: '#854f0b', label: 'In review' },
    confirmed: { color: '#534ab7', label: 'Confirmed' },
    dispatched: { color: '#2a7d4f', label: 'Dispatched' },
    completed: { color: '#2a7d4f', label: 'Completed' },
    cancelled: { color: '#c0392b', label: 'Cancelled' }
  }

  const filtered = clients.filter(c =>
    c.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Clients' ? '#2d7dd2' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Clients' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      {/* STATS */}
      <div style={{ padding: '1.25rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Approved clients', value: clients.length, color: '#2d7dd2', icon: '🤝' },
          { label: 'Total orders', value: orders.length, color: '#854f0b', icon: '📦' },
          { label: 'Total revenue', value: `$${orders.filter(o=>['confirmed','dispatched','completed'].includes(o.status)).reduce((s,o)=>s+(o.total||0),0).toLocaleString()}`, color: '#2a7d4f', icon: '💰' },
          { label: 'Active orders', value: orders.filter(o=>!['completed','cancelled'].includes(o.status)).length, color: '#534ab7', icon: '⏳' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '0.875rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
            <span style={{ fontSize: 18, opacity: 0.25 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: selected ? '1fr 460px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Approved Partners <span style={{ fontSize: 11, color: '#555', fontWeight: 400 }}>· {filtered.length} clients</span></div>
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: 11, padding: '7px 12px 7px 30px', borderRadius: 20, outline: 'none', fontFamily: 'inherit', width: 200 }} />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#555' }}>🔍</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(client => {
              const clientOrders = getClientOrders(client)
              const revenue = totalRevenue(client)
              const isSelected = selected?.id === client.id
              const lastOrder = clientOrders[0]
              return (
                <div key={client.id} onClick={() => { setSelected(isSelected ? null : client); setCredEmail(client.email); setSent(false); setTab('info') }}
                  style={{ background: '#111', border: `1px solid ${isSelected ? '#2d7dd2' : 'rgba(255,255,255,0.06)'}`, borderLeft: `4px solid ${isSelected ? '#2d7dd2' : 'rgba(45,125,210,0.3)'}`, borderRadius: 6, padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(45,125,210,0.15)', border: '1.5px solid rgba(45,125,210,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#2d7dd2', flexShrink: 0 }}>
                        {client.business_name?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{client.business_name}</div>
                        <div style={{ fontSize: 11, color: '#777', marginBottom: 6 }}>{client.contact_name} · {client.email}</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {client.business_type && <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.06)', color: '#888', borderRadius: 10 }}>{client.business_type}</span>}
                          {client.phone && <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', color: '#666', borderRadius: 10 }}>📞 {client.phone}</span>}
                          <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', borderRadius: 10, fontWeight: 600 }}>✓ Active</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, textAlign: 'right', flexShrink: 0 }}>
                      <div>
                        <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Orders</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#ccc' }}>{clientOrders.length}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Revenue</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: revenue > 0 ? '#2a7d4f' : '#555' }}>${revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  {lastOrder && (
                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 9, color: '#444' }}>Last order:</span>
                      <span style={{ fontSize: 9, color: '#666' }}>#{lastOrder.order_number} · {fmtDateShort(lastOrder.submitted_at)}</span>
                      <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, background: `${statusConfig[lastOrder.status]?.color}20`, color: statusConfig[lastOrder.status]?.color, fontWeight: 600 }}>{statusConfig[lastOrder.status]?.label}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — detail panel */}
        {selected && (
          <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>

              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg,#0d0d0d,#1a1a2e)', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(45,125,210,0.15)', border: '2px solid rgba(45,125,210,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#2d7dd2' }}>
                      {selected.business_name?.[0] || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{selected.business_name}</div>
                      <div style={{ fontSize: 11, color: '#777', marginBottom: 6 }}>{selected.contact_name}</div>
                      <span style={{ fontSize: 9, color: '#2a7d4f', background: 'rgba(42,125,79,0.12)', border: '0.5px solid rgba(42,125,79,0.25)', padding: '3px 10px', borderRadius: 10, fontWeight: 700 }}>✓ Approved partner</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                </div>

                {/* Quick stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: '1rem' }}>
                  {[
                    ['Orders', getClientOrders(selected).length, '#ccc'],
                    ['Total ordered', `$${totalOrdered(selected).toLocaleString()}`, '#2d7dd2'],
                    ['Revenue', `$${totalRevenue(selected).toLocaleString()}`, '#2a7d4f'],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 4, padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: 8, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TABS */}
              <div style={{ display: 'flex', background: '#0d0d0d', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                {[['info','📋 Full info'],['documents','📄 Documents'],['orders','📦 Orders'],['credentials','🔑 Credentials']].map(([key, label]) => (
                  <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '10px 4px', fontSize: 10, fontWeight: 600, color: tab === key ? '#2d7dd2' : '#555', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === key ? '#2d7dd2' : 'transparent'}`, cursor: 'pointer', letterSpacing: '0.04em' }}>{label}</button>
                ))}
              </div>

              <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>

                {/* TAB: FULL INFO */}
                {tab === 'info' && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: 9, color: '#2d7dd2', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Application information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        ['Business name', selected.business_name, '🏢'],
                        ['Contact name', selected.contact_name, '👤'],
                        ['Email', selected.email, '📧'],
                        ['Phone', selected.phone || '—', '📞'],
                        ['Business type', selected.business_type || '—', '🏭'],
                        ['Monthly volume', selected.monthly_volume || '—', '📊'],
                        ['Years in business', selected.years_in_business || '—', '📅'],
                        ['Address', selected.address || '—', '📍'],
                        ['EIN number', selected.ein_number || selected.ein || '—', '🔢'],
                        ['Resale tax #', selected.resale_tax_number || '—', '📄'],
                        ['Member since', fmtDate(selected.created_at), '🗓'],
                        ['Client ID', selected.id?.slice(0,8).toUpperCase(), '🆔'],
                      ].map(([label, val, icon]) => (
                        <div key={label} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4 }}>
                          <div style={{ fontSize: 8, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>{icon}</span>{label}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: val === '—' ? '#444' : '#ccc', wordBreak: 'break-all' }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    {selected.notes && (
                      <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4 }}>
                        <div style={{ fontSize: 8, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
                        <div style={{ fontSize: 11, color: '#777', lineHeight: 1.7 }}>{selected.notes}</div>
                      </div>
                    )}
                    <div style={{ marginTop: '1rem' }}>
                      <a href={`mailto:${selected.email}`} style={{ display: 'block', textAlign: 'center', padding: '10px', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.25)', borderRadius: 4, fontSize: 12, fontWeight: 600, color: '#2d7dd2', textDecoration: 'none' }}>
                        📧 Email client
                      </a>
                    </div>
                  </div>
                )}

                {/* TAB: DOCUMENTS */}
                {tab === 'documents' && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: 9, color: '#2d7dd2', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Legal documents</div>

                    {/* EIN */}
                    <div style={{ background: selected.ein_document_url ? 'rgba(45,125,210,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected.ein_document_url ? 'rgba(45,125,210,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, padding: '1.25rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                        <span style={{ fontSize: 28 }}>🏛</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>SS4 / EIN Letter</div>
                          <div style={{ fontSize: 11, color: '#666' }}>Employer Identification Number</div>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                          {selected.ein_document_url ? (
                            <span style={{ fontSize: 9, padding: '3px 10px', background: 'rgba(42,125,79,0.15)', color: '#2a7d4f', borderRadius: 10, fontWeight: 700 }}>✅ Uploaded</span>
                          ) : (
                            <span style={{ fontSize: 9, padding: '3px 10px', background: 'rgba(231,76,60,0.1)', color: '#e74c3c', borderRadius: 10, fontWeight: 700 }}>❌ Missing</span>
                          )}
                        </div>
                      </div>
                      <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>EIN Number</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: selected.ein_number || selected.ein ? '#fff' : '#444' }}>{selected.ein_number || selected.ein || 'Not provided'}</div>
                      </div>
                      {selected.ein_document_url ? (
                        <button onClick={() => openDoc(selected.ein_document_url)} style={{ width: '100%', padding: '11px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 4, letterSpacing: '0.06em', boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
                          📄 Open / Download PDF
                        </button>
                      ) : (
                        <div style={{ padding: '10px', background: 'rgba(231,76,60,0.06)', border: '0.5px solid rgba(231,76,60,0.15)', borderRadius: 4, fontSize: 11, color: '#e74c3c', textAlign: 'center' }}>
                          Document not submitted by client
                        </div>
                      )}
                    </div>

                    {/* RESALE TAX */}
                    <div style={{ background: selected.resale_tax_document_url ? 'rgba(42,125,79,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${selected.resale_tax_document_url ? 'rgba(42,125,79,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                        <span style={{ fontSize: 28 }}>📜</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Resale Tax Certificate</div>
                          <div style={{ fontSize: 11, color: '#666' }}>State resale / sales tax exemption</div>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                          {selected.resale_tax_document_url ? (
                            <span style={{ fontSize: 9, padding: '3px 10px', background: 'rgba(42,125,79,0.15)', color: '#2a7d4f', borderRadius: 10, fontWeight: 700 }}>✅ Uploaded</span>
                          ) : (
                            <span style={{ fontSize: 9, padding: '3px 10px', background: 'rgba(231,76,60,0.1)', color: '#e74c3c', borderRadius: 10, fontWeight: 700 }}>❌ Missing</span>
                          )}
                        </div>
                      </div>
                      <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Resale Tax Number</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: selected.resale_tax_number ? '#fff' : '#444' }}>{selected.resale_tax_number || 'Not provided'}</div>
                      </div>
                      {selected.resale_tax_document_url ? (
                        <button onClick={() => openDoc(selected.resale_tax_document_url)} style={{ width: '100%', padding: '11px', background: '#2a7d4f', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', borderRadius: 4, letterSpacing: '0.06em', boxShadow: '0 4px 14px rgba(42,125,79,0.3)' }}>
                          📄 Open / Download PDF
                        </button>
                      ) : (
                        <div style={{ padding: '10px', background: 'rgba(231,76,60,0.06)', border: '0.5px solid rgba(231,76,60,0.15)', borderRadius: 4, fontSize: 11, color: '#e74c3c', textAlign: 'center' }}>
                          Document not submitted by client
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: ORDERS */}
                {tab === 'orders' && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    {getClientOrders(selected).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#555', fontSize: 12 }}>No orders from this client yet.</div>
                    ) : getClientOrders(selected).map(order => (
                      <div key={order.id} style={{ padding: '12px', marginBottom: 8, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderLeft: `3px solid ${statusConfig[order.status]?.color || '#555'}`, borderRadius: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#ccc', marginBottom: 2 }}>#{order.order_number}</div>
                            <div style={{ fontSize: 10, color: '#555' }}>{fmtDateShort(order.submitted_at)} · {order.order_items?.length || 0} items</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: ['confirmed','dispatched','completed'].includes(order.status) ? '#2a7d4f' : '#fff' }}>${order.total?.toLocaleString()}</div>
                            <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 8, background: `${statusConfig[order.status]?.color}20`, color: statusConfig[order.status]?.color, fontWeight: 600 }}>{statusConfig[order.status]?.label}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {order.order_items?.slice(0,3).map((item, i) => (
                            <span key={i} style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', color: '#666', borderRadius: 8 }}>{item.product_name} ×{item.quantity}</span>
                          ))}
                          {order.order_items?.length > 3 && <span style={{ fontSize: 9, color: '#444' }}>+{order.order_items.length - 3} more</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB: CREDENTIALS */}
                {tab === 'credentials' && (
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7, marginBottom: '1.25rem', padding: '10px 14px', background: 'rgba(255,200,0,0.04)', border: '0.5px solid rgba(255,200,0,0.1)', borderRadius: 4 }}>
                      ⚠️ First create the user in <strong style={{ color: '#ccc' }}>Supabase → Authentication → Users → Add user</strong>, then send their credentials here.
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Client email *</label>
                      <input type="email" value={credEmail} onChange={e => setCredEmail(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '10px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: 9, color: '#777', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Temporary password *</label>
                      <input type="text" value={credPassword} onChange={e => setCredPassword(e.target.value)} placeholder="e.g. Levam2025!"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '10px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    {sent ? (
                      <div style={{ padding: '12px', background: 'rgba(42,125,79,0.12)', border: '0.5px solid rgba(42,125,79,0.3)', borderRadius: 3, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#2a7d4f' }}>✓ Credentials sent!</div>
                    ) : (
                      <button onClick={sendCredentials} disabled={sending} style={{ width: '100%', padding: 12, background: sending ? '#333' : '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: sending ? 'not-allowed' : 'pointer', borderRadius: 3, boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
                        {sending ? 'Sending...' : '📧 Send credentials email'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
