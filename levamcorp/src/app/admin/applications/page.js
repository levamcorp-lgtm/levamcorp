'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminApplications() {
  const [apps, setApps] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      loadApps(supabase)
    })
  }, [])

  const loadApps = async (supabase) => {
    const { data } = await supabase.from('applications').select('*').order('submitted_at', { ascending: false })
    setApps(data || [])
    setLoading(false)
  }

  const updateApp = async (id, status) => {
    setUpdating(true)
    try {
      const supabase = createClient()
      await supabase.from('applications').update({ status, reviewed_at: new Date().toISOString() }).eq('id', id)
      
      if (status === 'approved' && selected) {
        // Create client record
        await supabase.from('clients').insert([{
          business_name: selected.business_name,
          contact_name: selected.contact_name,
          email: selected.email,
          phone: selected.phone,
          address: selected.address,
          ein: selected.ein_number || selected.ein,
          ein_number: selected.ein_number || selected.ein,
          resale_tax_number: selected.resale_tax_number,
          ein_document_url: selected.ein_document_url,
          resale_tax_document_url: selected.resale_tax_document_url,
          business_type: selected.business_type,
          monthly_volume: selected.monthly_volume,
          years_in_business: selected.years_in_business,
          notes: selected.notes,
          status: 'active',
        }])
        // Send approval email
        await fetch('/api/send-approval-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: selected.email,
            businessName: selected.business_name,
            contactName: selected.contact_name,
          })
        })
        alert(`✓ ${selected.business_name} approved! Notification email sent. Now go to Supabase → Authentication → Add user to create their login.`)
      }
      await loadApps(supabase)
      setSelected(prev => prev ? { ...prev, status } : null)
    } catch (e) {
      alert('Error: ' + e.message)
    }
    setUpdating(false)
  }

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }
  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>Loading...</div>

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>Levam Admin</div>
          <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
            {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products'],['Payments','/admin/payments']].map(([label, href]) => (
              <Link key={label} href={href} style={{ fontSize: 12, color: label === 'Applications' ? '#2d7dd2' : '#555', textDecoration: 'none', padding: '4px 14px', borderBottom: label === 'Applications' ? '2px solid #2d7dd2' : '2px solid transparent' }}>{label}</Link>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Applications</h2>
            <p style={{ fontSize: 12, color: '#444' }}>{filtered.length} applications</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all','pending','approved','rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 10, padding: '5px 12px', border: '0.5px solid', borderColor: filter === f ? '#2d7dd2' : 'rgba(255,255,255,0.08)', background: filter === f ? 'rgba(45,125,210,0.15)' : 'transparent', color: filter === f ? '#2d7dd2' : '#555', borderRadius: 2, cursor: 'pointer', textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1rem' }}>
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            {filtered.map(app => (
              <div key={app.id} onClick={() => setSelected(selected?.id === app.id ? null : app)} style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: selected?.id === app.id ? 'rgba(45,125,210,0.05)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#ccc', marginBottom: 3 }}>{app.business_name}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{app.contact_name} · {app.email} · {app.phone}</div>
                  <div style={{ fontSize: 10, color: '#444', marginTop: 3 }}>{app.business_type} · {app.ein} · {app.monthly_volume}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 2, background: app.status === 'approved' ? 'rgba(42,125,79,0.12)' : app.status === 'rejected' ? 'rgba(231,76,60,0.1)' : 'rgba(186,117,23,0.1)', color: app.status === 'approved' ? '#2a7d4f' : app.status === 'rejected' ? '#c0392b' : '#854f0b' }}>
                    {app.status}
                  </span>
                  <div style={{ fontSize: 10, color: '#444' }}>{new Date(app.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: '#444', fontSize: 13 }}>No applications found</div>}
          </div>

          {selected && (
            <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '1.5rem', height: 'fit-content', position: 'sticky', top: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{selected.business_name}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              {[
                ['Contact', selected.contact_name],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Address', selected.address],
                ['Business type', selected.business_type],
                ['EIN', selected.ein],
                ['Years in business', selected.years_in_business],
                ['Monthly volume', selected.monthly_volume],
                ['Referral source', selected.referral_source],
                ['Categories', selected.categories?.join(', ')],
              ].filter(([,v]) => v).map(([label, val]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: '#ccc' }}>{val}</div>
                </div>
              ))}
              {selected.notes && (
                <div style={{ marginBottom: 10, padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                  <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
                  <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>{selected.notes}</div>
                </div>
              )}
              {selected.status === 'pending' && (
                <div style={{ marginTop: '1.25rem', display: 'flex', gap: 8 }}>
                  <button onClick={() => updateApp(selected.id, 'approved')} disabled={updating} style={{ flex: 1, padding: 10, background: '#2a7d4f', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: 2 }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => updateApp(selected.id, 'rejected')} disabled={updating} style={{ flex: 1, padding: 10, background: 'transparent', color: '#c0392b', fontSize: 11, border: '0.5px solid rgba(231,76,60,0.3)', cursor: 'pointer', borderRadius: 2 }}>
                    ✕ Reject
                  </button>
                </div>
              )}
              {selected.status === 'approved' && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(42,125,79,0.08)', border: '0.5px solid rgba(42,125,79,0.2)', borderRadius: 2, fontSize: 11, color: '#2a7d4f' }}>
                  ✓ Approved — Create their login in Supabase Authentication → Add user
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
