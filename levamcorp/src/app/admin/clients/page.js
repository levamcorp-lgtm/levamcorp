'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [credEmail, setCredEmail] = useState('')
  const [credPassword, setCredPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      const { data: c } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      setClients(c || [])
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  const sendCredentials = async () => {
    if (!credEmail || !credPassword) { alert('Please enter email and password'); return }
    setSending(true)
    try {
      const res = await fetch('/api/send-credentials-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credEmail,
          password: credPassword,
          businessName: selected?.business_name || '',
          contactName: selected?.contact_name || '',
        })
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        setTimeout(() => { setSent(false); setCredEmail(''); setCredPassword('') }, 3000)
      } else {
        alert('Error sending email: ' + data.error)
      }
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setSending(false)
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Clients' ? '#2d7dd2' : '#555', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Clients' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>

        {/* LEFT — clients list */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Clients</h2>
            <p style={{ fontSize: 12, color: '#444' }}>{clients.length} approved clients</p>
          </div>

          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: '1.5rem' }}>
            {clients.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#444', fontSize: 13 }}>No clients yet. Approve applications first.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0d0d0d' }}>
                    {['Business', 'Contact', 'Email', 'Status', 'Since', ''].map(h => (
                      <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)', background: selected?.id === client.id ? 'rgba(45,125,210,0.05)' : 'transparent', cursor: 'pointer' }}
                      onClick={() => { setSelected(client); setCredEmail(client.email); setSent(false) }}>
                      <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 500, color: '#ccc' }}>{client.business_name}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{client.contact_name}</td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{client.email}</td>
                      <td style={{ padding: '12px 1.25rem' }}>
                        <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(42,125,79,0.12)', color: '#2a7d4f' }}>{client.status}</span>
                      </td>
                      <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#444' }}>{new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ padding: '12px 1.25rem' }}>
                        <button onClick={(e) => { e.stopPropagation(); setSelected(client); setCredEmail(client.email); setSent(false) }} style={{ fontSize: 10, color: '#2d7dd2', background: 'transparent', border: '0.5px solid rgba(45,125,210,0.3)', padding: '4px 10px', borderRadius: 2, cursor: 'pointer' }}>Send credentials</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* HOW TO ADD */}
          <div style={{ background: '#111', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 4, padding: '1.25rem' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#ccc', marginBottom: 8 }}>How to add a new client</div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>
              1. Go to <strong style={{ color: '#2d7dd2' }}>Applications</strong> → approve the application<br />
              2. Go to <strong style={{ color: '#2d7dd2' }}>Supabase → Authentication → Users → Add user</strong><br />
              3. Enter their email and a temporary password<br />
              4. Come back here → click <strong style={{ color: '#2d7dd2' }}>Send credentials</strong> → enter the password → send
            </div>
          </div>
        </div>

        {/* RIGHT — send credentials panel */}
        <div style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: '#0d0d0d' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#ccc', letterSpacing: '0.05em' }}>📧 Send portal credentials</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>Send login email to a client</div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {selected && (
                <div style={{ padding: '10px 14px', background: 'rgba(45,125,210,0.08)', border: '0.5px solid rgba(45,125,210,0.2)', borderRadius: 2, marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#2d7dd2', marginBottom: 2 }}>{selected.business_name}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{selected.contact_name}</div>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Client email *</label>
                <input
                  type="email"
                  value={credEmail}
                  onChange={e => setCredEmail(e.target.value)}
                  placeholder="client@business.com"
                  style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 13, padding: '10px 12px', borderRadius: 2, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: 10, color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Temporary password *</label>
                <input
                  type="text"
                  value={credPassword}
                  onChange={e => setCredPassword(e.target.value)}
                  placeholder="e.g. Levam2025!"
                  style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', color: '#ddd', fontSize: 13, padding: '10px 12px', borderRadius: 2, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: 10, color: '#444', marginTop: 5 }}>This is the password you set in Supabase for this client.</div>
              </div>

              {sent ? (
                <div style={{ padding: '12px', background: 'rgba(42,125,79,0.12)', border: '0.5px solid rgba(42,125,79,0.3)', borderRadius: 2, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#2a7d4f' }}>
                  ✓ Credentials sent successfully!
                </div>
              ) : (
                <button onClick={sendCredentials} disabled={sending} style={{ width: '100%', padding: 11, background: sending ? '#333' : '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: sending ? 'not-allowed' : 'pointer', borderRadius: 2 }}>
                  {sending ? 'Sending...' : '📧 Send credentials email'}
                </button>
              )}

              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.04)', borderRadius: 2, fontSize: 11, color: '#444', lineHeight: 1.7 }}>
                The client will receive a professional email with their email, temporary password, and a button to access the portal.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
