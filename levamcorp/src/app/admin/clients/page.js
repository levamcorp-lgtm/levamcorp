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

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const getClientOrders = (client) => orders.filter(o => {
    const emailMatch = o.notes?.match(/Email: ([^\s|,]+)/)?.[1]
    return emailMatch === client.email
  })

  const filtered = clients.filter(c =>
    c.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = (client) => getClientOrders(client).filter(o => ['confirmed','dispatched','completed'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0)
  const totalOrdered = (client) => getClientOrders(client).reduce((s, o) => s + (o.total || 0), 0)

  const statusColor = { new: '#2d7dd2', review: '#854f0b', confirmed: '#534ab7', dispatched: '#2a7d4f', completed: '#2a7d4f', cancelled: '#c0392b' }
  const statusLabel = { new: 'Received', review: 'In review', confirmed: 'Confirmed', dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled' }

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
      <div style={{ padding: '1.5rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Approved clients', value: clients.length, color: '#2d7dd2', icon: '🤝' },
          { label: 'Total orders', value: orders.length, color: '#854f0b', icon: '📦' },
          { label: 'Total revenue', value: `$${orders.filter(o=>o.status==='completed').reduce((s,o)=>s+(o.total||0),0).toLocaleString()}`, color: '#2a7d4f', icon: '💰' },
          { label: 'Active orders', value: orders.filter(o=>!['completed','cancelled'].includes(o.status)).length, color: '#534ab7', icon: '⏳' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{s.value}</div>
              </div>
              <span style={{ fontSize: 20, opacity: 0.3 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT — clients list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Approved Clients</h2>
              <p style={{ fontSize: 11, color: '#888' }}>{filtered.length} clients</p>
            </div>
            <div style={{ position: 'relative' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
                style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ccc', fontSize: 12, padding: '8px 12px 8px 32px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', width: 220 }} />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#555' }}>🔍</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(client => {
              const clientOrders = getClientOrders(client)
              const revenue = totalRevenue(client)
              const ordered = totalOrdered(client)
              const isSelected = selected?.id === client.id
              const lastOrder = clientOrders[0]
              return (
                <div key={client.id} onClick={() => { setSelected(isSelected ? null : client); setCredEmail(client.email); setSent(false); setTab('info') }}
                  style={{ background: '#111', border: `1px solid ${isSelected ? '#2d7dd2' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.15s', boxShadow: isSelected ? '0 4px 20px rgba(45,125,210,0.15)' : 'none' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      {/* Avatar */}
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(45,125,210,0.15)', border: '1.5px solid rgba(45,125,210,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#2d7dd2', flexShrink: 0 }}>
                        {client.business_name?.[0] || client.contact_name?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{client.business_name}</div>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>{client.contact_name} · {client.email}</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {client.business_type && <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.06)', color: '#888', borderRadius: 10, fontWeight: 600 }}>{client.business_type}</span>}
                          {client.address && <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', color: '#666', borderRadius: 10 }}>📍 {client.address.split(',')[client.address.split(',').length-1]?.trim()}</span>}
                          {client.ein && <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', color: '#666', borderRadius: 10 }}>EIN: {client.ein}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, textAlign: 'right' }}>
                      <div>
                        <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Orders</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#ccc' }}>{clientOrders.length}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Ordered</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#ccc' }}>${ordered.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>Paid</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: revenue > 0 ? '#2a7d4f' : '#555' }}>${revenue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  {lastOrder && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 9, color: '#555' }}>Last order:</span>
                      <span style={{ fontSize: 9, color: '#888' }}>#{lastOrder.order_number} · {fmtDate(lastOrder.submitted_at)}</span>
                      <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 6, background: `${statusColor[lastOrder.status]}20`, color: statusColor[lastOrder.status], fontWeight: 600 }}>{statusLabel[lastOrder.status]}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT — client detail */}
        {selected && (
          <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>

              {/* Header */}
              <div style={{ background: '#0d0d0d', padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(45,125,210,0.15)', border: '1.5px solid rgba(45,125,210,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#2d7dd2' }}>
                      {selected.business_name?.[0] || '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{selected.business_name}</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{selected.contact_name}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 9, color: '#2a7d4f', background: 'rgba(42,125,79,0.1)', border: '0.5px solid rgba(42,125,79,0.2)', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>✓ Approved partner</div>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
                </div>
              </div>

              {/* TABS */}
              <div style={{ display: 'flex', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
                {[['info','📋 Info'],['orders','📦 Orders'],['credentials','🔑 Credentials']].map(([key, label]) => (
                  <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '10px', fontSize: 11, fontWeight: 600, color: tab === key ? '#2d7dd2' : '#555', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === key ? '#2d7dd2' : 'transparent'}`, cursor: 'pointer' }}>{label}</button>
                ))}
              </div>

              {/* TAB: INFO */}
              {tab === 'info' && (
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1rem' }}>
                    {[
                      ['Business name', selected.business_name],
                      ['Contact name', selected.contact_name],
                      ['Email', selected.email],
                      ['Phone', selected.phone || '—'],
                      ['Business type', selected.business_type || '—'],
                      ['Years in business', selected.years_in_business || '—'],
                      ['Monthly volume', selected.monthly_volume || '—'],
                      ['Address', selected.address || '—'],
                      ['Member since', fmtDate(selected.created_at)],
                    ].map(([label, val]) => (
                      <div key={label} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                        <div style={{ fontSize: 8, color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 12, color: '#ccc', fontWeight: 500, wordBreak: 'break-word' }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* EIN & Resale Tax */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Tax & Compliance Documents</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

                      {/* EIN */}
                      <div style={{ padding: '12px', background: 'rgba(45,125,210,0.06)', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 4 }}>
                        <div style={{ fontSize: 8, color: '#2d7dd2', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>📋 SS4 / EIN</div>
                        <div style={{ fontSize: 12, color: '#ccc', fontWeight: 600, marginBottom: 6 }}>{selected.ein_number || selected.ein || '—'}</div>
                        {selected.ein_document_url ? (
                          <a href={`https://scmyjjnrflmqquflveca.supabase.co/storage/v1/object/public/documents/${selected.ein_document_url}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 10, color: '#2d7dd2', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(45,125,210,0.1)', borderRadius: 20, fontWeight: 600 }}>
                            📄 View document
                          </a>
                        ) : (
                          <span style={{ fontSize: 10, color: '#555' }}>No document uploaded</span>
                        )}
                      </div>

                      {/* Resale Tax */}
                      <div style={{ padding: '12px', background: 'rgba(42,125,79,0.06)', border: '0.5px solid rgba(42,125,79,0.15)', borderRadius: 4 }}>
                        <div style={{ fontSize: 8, color: '#2a7d4f', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>🏷 Resale Tax</div>
                        <div style={{ fontSize: 12, color: '#ccc', fontWeight: 600, marginBottom: 6 }}>{selected.resale_tax_number || '—'}</div>
                        {selected.resale_tax_document_url ? (
                          <a href={`https://scmyjjnrflmqquflveca.supabase.co/storage/v1/object/public/documents/${selected.resale_tax_document_url}`} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 10, color: '#2a7d4f', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(42,125,79,0.1)', borderRadius: 20, fontWeight: 600 }}>
                            📄 View document
                          </a>
                        ) : (
                          <span style={{ fontSize: 10, color: '#555' }}>No document uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Revenue summary */}
                  <div style={{ background: 'rgba(45,125,210,0.06)', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 4, padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {[
                      ['Total orders', getClientOrders(selected).length, '#ccc'],
                      ['Total ordered', `$${totalOrdered(selected).toLocaleString()}`, '#ccc'],
                      ['Total paid', `$${totalRevenue(selected).toLocaleString()}`, '#2a7d4f'],
                    ].map(([label, val, color]) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 8, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {selected.notes && (
                    <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <div style={{ fontSize: 8, color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Notes from application</div>
                      <div style={{ fontSize: 11, color: '#888', lineHeight: 1.7 }}>{selected.notes}</div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ORDERS */}
              {tab === 'orders' && (
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  {getClientOrders(selected).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#555', fontSize: 12 }}>No orders yet from this client.</div>
                  ) : getClientOrders(selected).map(order => (
                    <div key={order.id} style={{ padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>#{order.order_number}</div>
                          <div style={{ fontSize: 10, color: '#666' }}>{fmtDate(order.submitted_at)} · {order.order_items?.length || 0} items</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: order.status === 'completed' ? '#2a7d4f' : '#fff' }}>${order.total?.toLocaleString()}</div>
                          <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 8, background: `${statusColor[order.status]}20`, color: statusColor[order.status], fontWeight: 600 }}>{statusLabel[order.status]}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {order.order_items?.slice(0,3).map((item, i) => (
                          <span key={i} style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', color: '#666', borderRadius: 8 }}>{item.product_name} ×{item.quantity}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: CREDENTIALS */}
              {tab === 'credentials' && (
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7, marginBottom: '1.25rem', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                    Create the user in <strong style={{ color: '#ccc' }}>Supabase → Authentication → Users → Add user</strong>, then send their credentials here.
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Client email *</label>
                    <input type="email" value={credEmail} onChange={e => setCredEmail(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '10px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Temporary password *</label>
                    <input type="text" value={credPassword} onChange={e => setCredPassword(e.target.value)} placeholder="e.g. Levam2025!"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)', color: '#ddd', fontSize: 12, padding: '10px 12px', borderRadius: 3, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  </div>
                  {sent ? (
                    <div style={{ padding: '12px', background: 'rgba(42,125,79,0.12)', border: '0.5px solid rgba(42,125,79,0.3)', borderRadius: 3, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#2a7d4f' }}>✓ Credentials sent!</div>
                  ) : (
                    <button onClick={sendCredentials} disabled={sending} style={{ width: '100%', padding: 11, background: sending ? '#333' : '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: sending ? 'not-allowed' : 'pointer', borderRadius: 3, boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
                      {sending ? 'Sending...' : '📧 Send credentials email'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
