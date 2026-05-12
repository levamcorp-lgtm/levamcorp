'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAIL = 'levamcorp@gmail.com'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, newOrders: 0, applications: 0, clients: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentApps, setRecentApps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) { window.location.href = '/admin'; return }
      const [ordersRes, appsRes, clientsRes] = await Promise.all([
        supabase.from('orders').select('*, order_items(*)').order('submitted_at', { ascending: false }),
        supabase.from('applications').select('*').order('submitted_at', { ascending: false }),
        supabase.from('clients').select('*'),
      ])
      const orders = ordersRes.data || []
      const apps = appsRes.data || []
      const clients = clientsRes.data || []
      const revenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0)
      setStats({ orders: orders.length, newOrders: orders.filter(o => o.status === 'new').length, applications: apps.filter(a => a.status === 'pending').length, clients: clients.length, revenue })
      setRecentOrders(orders.slice(0, 5))
      setRecentApps(apps.filter(a => a.status === 'pending').slice(0, 4))
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = '/admin' }
  const statusColor = { new: '#2d7dd2', review: '#854f0b', confirmed: '#2a7d4f', dispatched: '#2a7d4f', completed: '#2a7d4f', cancelled: '#c0392b' }
  const statusLabel = { new: 'New', review: 'In review', confirmed: 'Confirmed', dispatched: 'Dispatched', completed: 'Completed', cancelled: 'Cancelled' }

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13 }}>Loading...</div>

  const NavBar = ({ active }) => (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 24, height: 24 }}>
            <div style={{ position: 'absolute', left: 5, top: 0, width: 2, height: 18, background: '#444' }} />
            <div style={{ position: 'absolute', left: 5, bottom: 0, width: 14, height: 2, background: '#444' }} />
            <div style={{ position: 'absolute', left: 9, bottom: 5, width: 8, height: 2, background: '#2d7dd2' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.15em', color: '#ccc', textTransform: 'uppercase' }}>Levam Admin</div>
            <div style={{ fontSize: 7, letterSpacing: '0.2em', color: '#e74c3c', textTransform: 'uppercase' }}>Staff only</div>
          </div>
        </div>
        <div style={{ display: 'flex', borderLeft: '0.5px solid rgba(255,255,255,0.06)', paddingLeft: 16 }}>
          {[['Dashboard','/admin/dashboard'],['Orders','/admin/orders'],['Applications','/admin/applications'],['Clients','/admin/clients'],['Products','/admin/products']].map(([label, href]) => (
            <Link key={label} href={href} style={{ fontSize: 12, color: label === active ? '#2d7dd2' : '#555', textDecoration: 'none', padding: '4px 14px', borderBottom: label === active ? '2px solid #2d7dd2' : '2px solid transparent', display: 'flex', alignItems: 'center', gap: 5 }}>
              {label}
              {label === 'Orders' && stats.newOrders > 0 && <span style={{ background: '#e74c3c', color: '#fff', fontSize: 9, fontWeight: 500, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.newOrders}</span>}
              {label === 'Applications' && stats.applications > 0 && <span style={{ background: '#e74c3c', color: '#fff', fontSize: 9, fontWeight: 500, width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stats.applications}</span>}
            </Link>
          ))}
        </div>
      </div>
      <button onClick={handleLogout} style={{ fontSize: 11, color: '#555', border: '0.5px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 2, background: 'transparent', cursor: 'pointer' }}>Sign out</button>
    </nav>
  )

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <NavBar active="Dashboard" />
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: '1.5rem' }}>
          {[
            { label: 'New orders', val: stats.newOrders, color: '#e74c3c', note: 'action needed' },
            { label: 'Total orders', val: stats.orders, color: '#2d7dd2', note: 'all time' },
            { label: 'Pending apps', val: stats.applications, color: '#854f0b', note: 'to review' },
            { label: 'Active clients', val: stats.clients, color: '#2a7d4f', note: 'approved' },
            { label: 'Revenue', val: `$${stats.revenue.toLocaleString()}`, color: '#2d7dd2', note: 'completed orders' },
          ].map(s => (
            <div key={s.label} style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, padding: '1.25rem' }}>
              <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 500, color: '#fff', marginBottom: 3 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: s.color }}>{s.note}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 12, fontWeight: 500, color: '#ccc' }}>Recent orders</h3>
              <Link href="/admin/orders" style={{ fontSize: 10, color: '#2d7dd2', textDecoration: 'none' }}>View all →</Link>
            </div>
            {recentOrders.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', color: '#444', fontSize: 12 }}>No orders yet</div>
              : recentOrders.map(order => (
              <div key={order.id} style={{ padding: '0.85rem 1.25rem', borderBottom: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#ccc', marginBottom: 2 }}>#{order.order_number}</div>
                  <div style={{ fontSize: 10, color: '#444' }}>{new Date(order.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>${order.total?.toLocaleString()}</div>
                  <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 2, background: `${statusColor[order.status]}18`, color: statusColor[order.status] }}>{statusLabel[order.status]}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 12, fontWeight: 500, color: '#ccc' }}>Pending applications</h3>
              <Link href="/admin/applications" style={{ fontSize: 10, color: '#2d7dd2', textDecoration: 'none' }}>View all →</Link>
            </div>
            {recentApps.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', color: '#444', fontSize: 12 }}>No pending applications</div>
              : recentApps.map(app => (
              <div key={app.id} style={{ padding: '0.85rem 1.25rem', borderBottom: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#ccc', marginBottom: 2 }}>{app.business_name}</div>
                  <div style={{ fontSize: 10, color: '#444' }}>{app.email}</div>
                </div>
                <Link href="/admin/applications" style={{ fontSize: 10, color: '#2d7dd2', textDecoration: 'none', border: '0.5px solid rgba(45,125,210,0.3)', padding: '3px 10px', borderRadius: 2 }}>Review →</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
