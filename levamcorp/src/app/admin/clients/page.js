'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminClients() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      // Get all auth users via clients table
      const { data: clients } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      setUsers(clients || [])
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Clients' ? '#2d7dd2' : '#555', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Clients' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Clients</h2>
          <p style={{ fontSize: 12, color: '#444' }}>{users.length} approved clients</p>
        </div>

        <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: '1.5rem' }}>
          {users.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#444', fontSize: 13 }}>
              No clients yet. Approve applications and create their logins in Supabase.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d0d0d' }}>
                  {['Business', 'Contact', 'Email', 'Phone', 'Status', 'Since'].map(h => (
                    <th key={h} style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', padding: '10px 1.25rem', textAlign: 'left', fontWeight: 400, borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(client => (
                  <tr key={client.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 1.25rem', fontSize: 12, fontWeight: 500, color: '#ccc' }}>{client.business_name}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{client.contact_name}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{client.email}</td>
                    <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#555' }}>{client.phone || '—'}</td>
                    <td style={{ padding: '12px 1.25rem' }}>
                      <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 2, background: 'rgba(42,125,79,0.12)', color: '#2a7d4f' }}>{client.status}</span>
                    </td>
                    <td style={{ padding: '12px 1.25rem', fontSize: 11, color: '#444' }}>{new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ background: '#111', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 4, padding: '1.25rem' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#ccc', marginBottom: 8 }}>How to add a new client</div>
          <div style={{ fontSize: 12, color: '#555', lineHeight: 1.8 }}>
            1. Go to <strong style={{ color: '#2d7dd2' }}>Applications</strong> → approve the application<br />
            2. Go to <strong style={{ color: '#2d7dd2' }}>Supabase → Authentication → Users → Add user</strong><br />
            3. Enter their email and a temporary password<br />
            4. Send them their login credentials<br />
            5. They can now access the client portal
          </div>
        </div>
      </div>
    </div>
  )
}
