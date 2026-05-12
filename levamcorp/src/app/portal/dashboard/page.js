'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/portal'
      else setUser(data.user)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/portal'
  }

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>Loading...</div>

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon"><div className="logo-l-vert" /><div className="logo-l-horiz" /><div className="logo-accent" /></div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#222', textTransform: 'uppercase' }}>Levam</div>
            <div style={{ fontSize: 7, letterSpacing: '0.25em', color: '#2d7dd2', textTransform: 'uppercase' }}>Partner Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#888' }}>{user.email}</span>
          <button onClick={handleLogout} style={{ fontSize: 11, color: '#aaa', border: '0.5px solid rgba(0,0,0,0.08)', padding: '5px 12px', borderRadius: 2, background: '#fff', cursor: 'pointer' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, color: '#111', marginBottom: 4 }}>Welcome back 👋</h2>
        <p style={{ fontSize: 12, color: '#aaa', marginBottom: '1.5rem' }}>{user.email}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.5rem' }}>
          {[['Open orders','3'],['This month','$8,240'],['Pending invoices','2'],['Items available','40+']].map(([label,val]) => (
            <div key={label} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: 10, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: '#111' }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '1.25rem' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#333', marginBottom: '1rem' }}>Quick actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['📦','Browse catalog','View all products and pricing'],['📋','New quote','Start a new order quote'],['🧾','My invoices','View and download invoices'],['📜','Order history','Track all your orders']].map(([icon,title,desc]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 2, cursor: 'pointer', background: '#fff' }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{title}</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
