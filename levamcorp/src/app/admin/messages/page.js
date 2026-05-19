'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      const { data: msgs } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
      setMessages(msgs || [])
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const markRead = async (id) => {
    const supabase = createClient()
    await supabase.from('contact_messages').update({ status: 'read' }).eq('id', id)
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, status: 'read' } : m))
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const unread = messages.filter(m => m.status === 'new').length

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#fff', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments'],['Messages','/admin/messages'],['Invoices','/admin/invoices'],['Profit','/admin/profit'],['Walmart','/admin/walmart']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Messages' ? '#2d7dd2' : '#777', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Messages' ? '2px solid #2d7dd2' : '2px solid transparent', position: 'relative' }}>
                {label}
                {label === 'Messages' && unread > 0 && <span style={{ position: 'absolute', top: 0, right: 4, width: 8, height: 8, background: '#e74c3c', borderRadius: '50%' }} />}
              </Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '1.5rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {[
          { label: 'Total messages', value: messages.length, icon: '📩' },
          { label: 'Unread', value: unread, color: unread > 0 ? '#e74c3c' : '#555', icon: '🔴' },
          { label: 'Read', value: messages.filter(m => m.status === 'read').length, color: '#2a7d4f', icon: '✅' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color || '#fff' }}>{s.value}</div>
            </div>
            <span style={{ fontSize: 20, opacity: 0.3 }}>{s.icon}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: selected ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>
            Contact messages {unread > 0 && <span style={{ fontSize: 11, background: '#e74c3c', color: '#fff', padding: '2px 8px', borderRadius: 10, marginLeft: 8 }}>{unread} new</span>}
          </div>
          {messages.length === 0 ? (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '3rem', textAlign: 'center', color: '#444' }}>No messages yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map(msg => (
                <div key={msg.id} onClick={() => { setSelected(msg); if (msg.status === 'new') markRead(msg.id) }}
                  style={{ background: '#111', border: `1px solid ${selected?.id === msg.id ? '#2d7dd2' : msg.status === 'new' ? 'rgba(45,125,210,0.3)' : 'rgba(255,255,255,0.06)'}`, borderLeft: `4px solid ${msg.status === 'new' ? '#2d7dd2' : 'transparent'}`, borderRadius: 6, padding: '1.25rem 1.5rem', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(45,125,210,0.15)', border: '1.5px solid rgba(45,125,210,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#2d7dd2' }}>
                        {msg.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{msg.name}</div>
                          {msg.status === 'new' && <span style={{ fontSize: 9, background: 'rgba(45,125,210,0.2)', color: '#2d7dd2', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>NEW</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#888' }}>{msg.email}{msg.company ? ` · ${msg.company}` : ''}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: '#555', textAlign: 'right' }}>
                      <div>{fmtDate(msg.created_at)}</div>
                      <div>{fmtTime(msg.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{msg.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ background: '#0d0d0d', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(45,125,210,0.15)', border: '1.5px solid rgba(45,125,210,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#2d7dd2' }}>
                    {selected.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{selected.name}</div>
                    <div style={{ fontSize: 10, color: '#888' }}>{fmtDate(selected.created_at)} at {fmtTime(selected.created_at)}</div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#888', cursor: 'pointer', width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>×</button>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Contact information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[['Name', selected.name], ['Email', selected.email], ['Company', selected.company || '—'], ['Phone', selected.phone || '—']].map(([label, val]) => (
                    <div key={label} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <div style={{ fontSize: 8, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 11, color: '#ccc', fontWeight: 500, wordBreak: 'break-word' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10 }}>Message</div>
                <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.8, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '12px 14px' }}>{selected.message}</div>
              </div>

              <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: 8 }}>
                <a href={`mailto:${selected.email}?subject=Re: Your message to Levam Corp`} style={{ flex: 1, padding: 11, background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', textAlign: 'center', display: 'block' }}>📧 Reply via email</a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} style={{ padding: '11px 16px', background: 'rgba(42,125,79,0.1)', color: '#2a7d4f', fontSize: 11, fontWeight: 600, border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 3, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>📞</a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
