'use client'
import React from 'react'
import Link from 'next/link'

function TopPicksGrid() {
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/top-picks')
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ background: '#f7f8fa', borderRadius: 8, height: 280, animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  )

  if (products.length === 0) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
      {products.map(product => (
        <div key={product.id} style={{ background: '#f7f8fa', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, overflow: 'hidden', transition: 'all 0.2s' }}>
          <div style={{ height: 200, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: 48 }}>📦</span>
            )}
          </div>
          <div style={{ padding: '1rem' }}>
            {product.brand && <div style={{ fontSize: 10, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{product.brand}</div>}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.4, marginBottom: 8 }}>{product.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', borderRadius: 10, fontWeight: 600, border: '0.5px solid rgba(45,125,210,0.15)', textTransform: 'capitalize' }}>{product.category}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: product.stock > 0 ? '#2a7d4f' : '#e74c3c' }}>{product.stock > 0 ? 'In stock' : 'Out of stock'}</span>
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#111', borderRadius: 4, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
              🔒 Partner price — apply to see
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div style={{ background: '#fff' }}>

      {/* NAV — negro como el portal */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 3rem', background: '#111',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 34, height: 34 }}>
            <div style={{ position: 'absolute', left: 7, top: 0, width: 2.5, height: 27, background: '#444' }} />
            <div style={{ position: 'absolute', left: 7, bottom: 0, width: 20, height: 2.5, background: '#444' }} />
            <div style={{ position: 'absolute', left: 12, bottom: 7, width: 12, height: 2.5, background: '#2d7dd2' }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Levam</div>
            <div style={{ fontSize: 8, letterSpacing: '0.32em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 3 }}>Corp · Distributors</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#catalog" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', letterSpacing: '0.02em' }}>Products</a>
          <a href="#how" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>How it works</a>
          <a href="#about" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>About us</a>
          <Link href="/contact" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Contact us</Link>
          <Link href="/insights" style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, background: '#2a7d4f', borderRadius: '50%', display: 'inline-block' }} />
            Market Insights
          </Link>
          <Link href="/portal" style={{
            fontSize: 12, fontWeight: 600, padding: '9px 22px',
            border: '0.5px solid #2d7dd2', background: 'rgba(45,125,210,0.15)',
            color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase',
            borderRadius: 2, textDecoration: 'none'
          }}>Client portal ↗</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        minHeight: 580, borderBottom: '0.5px solid rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem 3.5rem 5rem 3rem' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#2d7dd2', marginBottom: '1.5rem',
            display: 'inline-flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ width: 28, height: 2, background: '#2d7dd2', display: 'inline-block', borderRadius: 1 }} />
            B2B Wholesale Distribution — Doral, FL
          </div>
          <h1 style={{
            fontSize: 54, fontWeight: 800, lineHeight: 1.08,
            color: '#111', marginBottom: '1.5rem', letterSpacing: '-0.02em'
          }}>
            Your trusted source for{' '}
            <em style={{ color: '#2d7dd2', fontStyle: 'normal' }}>high-demand</em>{' '}
            inventory
          </h1>
          <p style={{ fontSize: 16, color: '#555', lineHeight: 1.8, marginBottom: '1.5rem', maxWidth: 420, fontWeight: 400 }}>
            We source high-demand consumer electronics, home and kitchen appliances and supply them exclusively to <strong style={{ color: '#333' }}>verified distributor partners</strong> at wholesale pricing.
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
            {[['📺', 'Electronics & TVs'], ['🏠', 'Home appliances'], ['🍳', 'Kitchen']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666', background: '#f7f8fa', padding: '6px 12px', borderRadius: 2, border: '0.5px solid rgba(0,0,0,0.08)' }}>
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/apply" style={{
              padding: '14px 32px', background: '#2d7dd2', color: '#fff',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              borderRadius: 2, textDecoration: 'none', display: 'inline-block'
            }}>Apply to partner</Link>
            <a href="#how" style={{
              padding: '14px 32px', background: 'transparent', color: '#555',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 2, textDecoration: 'none', display: 'inline-block'
            }}>How it works</a>
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: 580 }}>
          <img
            src="https://images.pexels.com/photos/29786116/pexels-photo-29786116.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Levam Corp Warehouse"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 580 }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.08), transparent)' }} />
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{
        background: '#111', padding: '1.6rem 3rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4rem',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)'
      }}>
        {[['✓','Verified inventory'],['⏱','48h average dispatch'],['🔒','Approved partners only'],['📍','Doral, FL 33178']].map(([icon,label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.03em' }}>
            <span style={{ color: '#2d7dd2', fontSize: 16, fontWeight: 700 }}>{icon}</span> {label}
          </div>
        ))}
      </div>


      {/* LEMA & VALORES */}
      <section style={{ background: '#fff', padding: '5rem 3rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* LEMA PRINCIPAL */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: '1rem' }}>Our promise</div>
            <h2 style={{ fontSize: 42, fontWeight: 800, color: '#111', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.5rem', maxWidth: 700, margin: '0 auto 1.5rem' }}>
              Your growth is our{' '}
              <em style={{ color: '#2d7dd2', fontStyle: 'normal' }}>compromiso.</em>
            </h2>
            <p style={{ fontSize: 17, color: '#555', lineHeight: 1.9, maxWidth: 640, margin: '0 auto 1.5rem', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              "Our commitment to every client is absolute — always available, never dropping the ball, and delivering a wholesale buying experience where you feel right at home."
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#2d7dd2', fontWeight: 600, background: 'rgba(45,125,210,0.06)', padding: '10px 20px', borderRadius: 30, border: '0.5px solid rgba(45,125,210,0.2)' }}>
              <span>🇺🇸</span> English & <span>🇪🇸</span> Español — We speak your language
            </div>
          </div>

          {/* VALORES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
            {[
              {
                icon: '🤝',
                title: 'Total trust',
                
                desc: 'We work exclusively with verified distributors. Every partner is personally reviewed to ensure serious, long-term business relationships. Your information and orders are in the best hands.'
              },
              {
                icon: '💰',
                title: 'Unbeatable pricing',
                
                desc: 'Access some of the best market prices on electronics, home appliances, and kitchen products. Exclusive pricing for approved distributors — no middlemen, no hidden fees.'
              },
              {
                icon: '⚡',
                title: 'Unmatched service',
                
                desc: 'From the moment you apply to when your order arrives, we are with you every step. Fast responses, clear communication, and a team that speaks your language — English and Spanish.'
              },
              {
                icon: '📦',
                title: 'Ready inventory',
                
                desc: 'Average 48-hour dispatch from our warehouse in Doral, FL. Verified inventory, authentic products from top brands like JBL, LG, Ninja, Shark, and more.'
              },
              {
                icon: '🏠',
                title: 'Feel at home',
                
                desc: 'We are a company with Latin roots in the heart of Doral, FL. We understand your business, speak your language, and care about your success as much as our own.'
              },
              {
                icon: '📈',
                title: 'Your success is ours',
                
                desc: 'We do not just sell you products — we are your strategic business partner. Our private portal gives you access to quotes, invoices, and everything you need to scale your business.'
              },
            ].map(item => (
              <div key={item.title} style={{ padding: '2rem', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 60, opacity: 0.06 }}>{item.icon}</div>
                <div style={{ fontSize: 32, marginBottom: '1rem' }}>{item.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#2d7dd2', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{item.title2}</div>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.8, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* TESTIMONIAL / CONVICTION BOX */}
          <div style={{ background: '#111', borderRadius: 8, padding: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: '1rem' }}>Why Levam Corp?</div>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
                The wholesale buying experience you always wanted.
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, marginBottom: '1.5rem' }}>
                We know what it means to put your capital on the line. That's why at Levam Corp we take every order, every client, and every product seriously. We are not just a supplier — we are your business partner.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  '✓ 100% verified and authentic products',
                  '✓ Private portal with automatic invoices',
                  '✓ Support in English and Spanish',
                  '✓ Team based in Doral, FL — close to you',
                  '✓ Response within 24 hours',
                  '✓ Exclusive pricing for approved distributors',
                ].map(item => (
                  <div key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#2d7dd2', fontWeight: 700 }}>{item.split(' ')[0]}</span>
                    {item.split(' ').slice(1).join(' ')}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '1.5rem' }}>
                <div style={{ fontSize: 32, marginBottom: '0.75rem' }}>💬</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: '0.75rem' }}>
                  "Working with a trusted wholesale partner that speaks your language and delivers on time makes all the difference."
                </p>
                <div style={{ fontSize: 11, color: '#2d7dd2', fontWeight: 600 }}>— The Levam Corp promise</div>
              </div>
              <div style={{ background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.25)', borderRadius: 6, padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 4 }}>48h</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Average dispatch time</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 4 }}>100%</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Verified authentic products</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 4 }}>🇺🇸🇪🇸</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Bilingual support team</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* TOP PICKS */}
      <section style={{ background: '#fff', padding: '5rem 3rem', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 10 }}>Exclusive wholesale access</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              What our partners are ordering <em style={{ color: '#2d7dd2', fontStyle: 'normal' }}>right now</em>
            </h2>
            <p style={{ fontSize: 16, color: '#777', maxWidth: 520, margin: '0 auto' }}>
              Approved distributors get access to these products and hundreds more — at unbeatable wholesale prices.
            </p>
          </div>

          <TopPicksGrid />

          <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2.5rem', background: '#111', borderRadius: 8 }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
              Wholesale pricing is exclusive to approved partners only.
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
              Ready to see the full catalog with prices?
            </div>
            <Link href="/apply" style={{ display: 'inline-block', padding: '14px 40px', background: '#2d7dd2', color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 4, textDecoration: 'none', boxShadow: '0 4px 20px rgba(45,125,210,0.4)' }}>
              Apply to become a partner →
            </Link>
          </div>
        </div>
      </section>


      {/* WEEKLY STOCK */}
      <section style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #111 60%, #0d1a0d 100%)', padding: '5rem 3rem', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

          {/* LEFT */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#2a7d4f', fontWeight: 700, marginBottom: '1.25rem', background: 'rgba(42,125,79,0.1)', border: '0.5px solid rgba(42,125,79,0.25)', padding: '6px 14px', borderRadius: 20 }}>
              <span style={{ width: 7, height: 7, background: '#2a7d4f', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px rgba(42,125,79,0.8)', animation: 'none' }} />
              Updated every week
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              Fresh inventory.<br />
              <em style={{ color: '#2a7d4f', fontStyle: 'normal' }}>Hottest products.</em><br />
              Best prices.
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, marginBottom: '2rem' }}>
              Every week we update our inventory with the most in-demand products on the market — the ones flying off shelves on Amazon and Walmart. Our team sources the best deals so you can maximize your margins and keep your business moving.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '2rem' }}>
              {[
                ['🔄', 'Weekly stock updates', 'New products added every week — stay ahead of the market'],
                ['🔥', 'Trending products only', 'We track what sells best on Amazon, Walmart and major platforms'],
                ['💰', 'Wholesale margins', 'Prices negotiated directly with suppliers so you profit more'],
                ['⚡', '48h dispatch', 'Ready to ship within 48 hours from our Doral, FL warehouse'],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(42,125,79,0.12)', border: '0.5px solid rgba(42,125,79,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/apply" style={{ display: 'inline-block', padding: '13px 32px', background: '#2a7d4f', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 4, textDecoration: 'none', boxShadow: '0 4px 20px rgba(42,125,79,0.4)' }}>
              Get access to our catalog →
            </Link>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Electronics', icon: '📺', items: 'Smart TVs · Smartwatches · Cameras · Speakers', color: '#2d7dd2' },
              { label: 'Home appliances', icon: '🏠', items: 'Air purifiers · Washers · Robot vacuums · Fans', color: '#534ab7' },
              { label: 'Kitchen', icon: '🍳', items: 'Blenders · Air fryers · Coffee makers · Juicers', color: '#854f0b' },
            ].map(cat => (
              <div key={cat.label} style={{ background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${cat.color}30`, borderLeft: `3px solid ${cat.color}`, borderRadius: 6, padding: '1.25rem 1.5rem', display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{cat.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{cat.items}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 10, color: cat.color, fontWeight: 700, background: `${cat.color}15`, border: `0.5px solid ${cat.color}30`, padding: '4px 10px', borderRadius: 10, flexShrink: 0 }}>Weekly drops</div>
              </div>
            ))}

            <div style={{ background: 'rgba(42,125,79,0.08)', border: '1px solid rgba(42,125,79,0.2)', borderRadius: 6, padding: '1.5rem', textAlign: 'center', marginTop: 4 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>New arrivals every Monday</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '1rem' }}>
                Approved partners get notified first when new stock arrives — giving you first pick before anyone else.
              </div>
              <div style={{ fontSize: 11, color: '#2a7d4f', fontWeight: 600 }}>✓ Early access for approved partners only</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        {[['40','+ Products in catalog'],['48','h Average dispatch'],['100','% Verified inventory']].map(([num,label],i) => (
          <div key={label} style={{ padding: '2.5rem', textAlign: 'center', borderRight: i < 2 ? '0.5px solid rgba(0,0,0,0.08)' : 'none' }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#111', marginBottom: 6 }}>
              {num}<span style={{ color: '#2d7dd2', fontSize: 26 }}>{label.split(' ')[0]}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label.split(' ').slice(1).join(' ')}</div>
          </div>
        ))}
      </div>

      {/* ABOUT */}
      <div id="about" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(0,0,0,0.08)', minHeight: 480 }}>
        <div style={{ padding: '4rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '0.75rem', fontWeight: 600 }}>Who we are</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111', marginBottom: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>A new standard in B2B wholesale distribution</h2>
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.85, marginBottom: '1.75rem', fontWeight: 400 }}>
            Based in Doral, FL, Levam Corp sources high-demand consumer products and makes them available exclusively to <strong style={{ color: '#333' }}>verified distributor partners</strong> — at pricing that makes sense for your business.
          </p>
          {['Carefully curated product selection','Transparent pricing — no hidden fees','Automatic invoicing and order quotes','Personal review of every partner application'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 500, color: '#444', marginBottom: 12 }}>
              <span style={{ color: '#2d7dd2', fontWeight: 700, fontSize: 16 }}>✓</span> {item}
            </div>
          ))}
        </div>
        <div style={{ overflow: 'hidden', minHeight: 400 }}>
          <img
            src="https://images.pexels.com/photos/34968619/pexels-photo-34968619.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Levam Corp Distribution"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 400 }}
          />
        </div>
      </div>

      {/* CATALOG */}
      <section id="catalog" style={{ padding: '4rem 3rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '0.75rem', fontWeight: 600 }}>Our catalog</div>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#111', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>Multiple categories, one trusted source.</h2>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, maxWidth: 520, marginBottom: '2.5rem' }}>
          From consumer electronics to home and kitchen appliances — competitive wholesale pricing for approved partners.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(0,0,0,0.08)', marginBottom: '3rem' }}>
          {[
            { 
              icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
              name: 'Electronics & TVs', desc: 'Smart TVs, streaming devices, and consumer electronics at distributor pricing.', brands: ['JBL','LG','Garmin','Logitech','DJI'] },
            { 
              icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
              name: 'Home appliances', desc: 'Major and small appliances for household use, sourced from reliable suppliers.', brands: ['Shark','Roomba','Ninja','Nutribullet'] },
            { 
              icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/><circle cx="19" cy="5" r="3"/></svg>,
              name: 'Kitchen essentials', desc: 'Countertop appliances, cookware, and kitchen gadgets ready to dispatch.', brands: ['Ninja','Nutribullet','Cuisinart','KitchenAid'] },
          ].map(cat => (
            <div key={cat.name} style={{ background: '#fff', padding: '2.5rem 2rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>{cat.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#111', marginBottom: 8 }}>{cat.name}</div>
              <div style={{ fontSize: 14, color: '#777', lineHeight: 1.7, marginBottom: '1.25rem' }}>{cat.desc}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {cat.brands.map(brand => (
                  <span key={brand} style={{ fontSize: 10, fontWeight: 700, color: '#555', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.1)', padding: '4px 10px', borderRadius: 2, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{brand}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BRANDS ROW */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#bbb', fontWeight: 600 }}>Brands we carry</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 1, background: 'rgba(0,0,0,0.06)', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          {[
            { name: 'JBL', color: '#ff6600', weight: 900, size: 20 },
            { name: 'LG', color: '#a50034', weight: 900, size: 22 },
            { name: 'Garmin', color: '#007cc0', weight: 800, size: 15 },
            { name: 'Logitech', color: '#00b900', weight: 800, size: 13 },
            { name: 'DJI', color: '#111', weight: 900, size: 22 },
            { name: 'Shark', color: '#003da5', weight: 900, size: 18 },
            { name: 'Ninja', color: '#e4002b', weight: 900, size: 18 },
            { name: 'iRobot', color: '#e31937', weight: 800, size: 15 },
            { name: 'Nutribullet', color: '#5a9e2f', weight: 800, size: 11 },
          ].map(brand => (
            <div key={brand.name} style={{
              background: '#fff', padding: '1.5rem 0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRight: '1px solid #f0f0f0', minHeight: 80
            }}>
              <span style={{
                fontSize: brand.size, fontWeight: brand.weight,
                color: brand.color, letterSpacing: '-0.02em',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                textTransform: 'uppercase', lineHeight: 1
              }}>{brand.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '5rem 3rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '0.75rem', fontWeight: 600 }}>How it works</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Four steps to start ordering.</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 480, margin: '0 auto' }}>Join our network of verified distributors and get access to wholesale pricing today.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', marginBottom: '3.5rem' }}>
          {[
            { num: '01', title: 'Apply', desc: 'Submit your business info. We review every application personally within 1–2 business days.',
              svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
            { num: '02', title: 'Get approved', desc: 'Receive your private portal login credentials and get instant access to our full catalog.',
              svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
            { num: '03', title: 'Browse & quote', desc: 'Access live pricing, real-time availability, dispatch times, and generate quotes instantly.',
              svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
            { num: '04', title: 'Order & invoice', desc: 'Place your order with one click. Invoice and quote generate automatically — no back and forth.',
              svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2d7dd2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
          ].map((step, i) => (
            <div key={step.num} style={{
              background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: 4, padding: '2rem 1.75rem', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', fontSize: 28, color: 'rgba(255,255,255,0.06)', fontWeight: 900 }}>{step.num}</div>
              <div style={{
                width: 44, height: 44, background: 'rgba(45,125,210,0.12)', border: '0.5px solid rgba(45,125,210,0.25)',
                borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>{step.svg}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{step.title}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>{step.desc}</div>
              {i < 3 && (
                <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', color: '#2d7dd2', fontSize: 18, fontWeight: 700, zIndex: 2 }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* CTA INSIDE HOW IT WORKS */}
        <div style={{
          background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.25)',
          borderRadius: 4, padding: '2.5rem 3rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem'
        }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Ready to join our distributor network?</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Applications reviewed within 1–2 business days. No commitment required.</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/apply" style={{
              padding: '13px 32px', background: '#2d7dd2', color: '#fff',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              borderRadius: 2, textDecoration: 'none', display: 'inline-block',
              boxShadow: '0 4px 16px rgba(45,125,210,0.4)'
            }}>Apply now →</Link>
            <Link href="/portal" style={{
              padding: '13px 24px', background: 'transparent', color: 'rgba(255,255,255,0.6)',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
              border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 2, textDecoration: 'none', display: 'inline-block'
            }}>Partner login</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div style={{ padding: '6rem 3rem', textAlign: 'center', background: '#2d7dd2' }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.01em' }}>Ready to work with us?</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: '2.5rem', fontWeight: 400 }}>Applications reviewed within 1–2 business days.</p>
        <Link href="/apply" style={{
          padding: '16px 44px', background: '#fff', color: '#2d7dd2',
          fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          borderRadius: 2, textDecoration: 'none', display: 'inline-block'
        }}>Start your application</Link>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: '1.5rem' }}>
          Already approved?{' '}
          <Link href="/portal" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600 }}>Access your portal →</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#0d0d0d', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>

        {/* MAIN FOOTER */}
        <div style={{ padding: '3.5rem 3rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '3rem' }}>

          {/* BRAND */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
              <div style={{ position: 'relative', width: 34, height: 34 }}>
                <div style={{ position: 'absolute', left: 7, top: 0, width: 2.5, height: 27, background: '#333' }} />
                <div style={{ position: 'absolute', left: 7, bottom: 0, width: 20, height: 2.5, background: '#333' }} />
                <div style={{ position: 'absolute', left: 12, bottom: 7, width: 12, height: 2.5, background: '#2d7dd2' }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Levam</div>
                <div style={{ fontSize: 8, letterSpacing: '0.32em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 3 }}>Corp · Distributors</div>
              </div>
            </div>
            <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 320, fontStyle: 'italic', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.01em', borderLeft: '3px solid #2d7dd2', paddingLeft: '1rem' }}>
              "Your business growth is not a question — it is a certainty. We make sure of it."
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['📍', '6315 NW 99th Ave, Doral, FL 33178'],
                ['📧', 'partners@levamcorp.com'],
                ['✉️', 'contact@levamcorp.com'],
                ['📞', '(786) 878-4122 / (786) 546-9476'],
              ['💬', 'WhatsApp: (786) 490-9005'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  <span style={{ fontSize: 14 }}>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Company</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['About us','/#about'],['How it works','/#how'],['Products','/#catalog'],['Contact us','/contact'],['Apply to partner','/apply']].map(([label, href]) => (
                <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', transition: 'color 0.15s' }}>{label}</a>
              ))}
            </div>
          </div>

          {/* LEGAL + CTA */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '2rem' }}>
              {[['Privacy Policy','/privacy'],['Terms & Conditions','/terms'],['RMA Policy','/rma']].map(([label, href]) => (
                <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{label}</a>
              ))}
            </div>
            <div style={{ background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.25)', borderRadius: 4, padding: '1.25rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Ready to grow?</div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: '1rem' }}>Join our exclusive distributor network today.</p>
              <Link href="/apply" style={{ display: 'block', textAlign: 'center', padding: '9px', background: '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none' }}>Apply now →</Link>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div style={{ padding: '1.25rem 3rem', borderTop: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em' }}>
            © 2025 Levam Corp Distributors · All rights reserved
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
            Doral, FL 33178 · B2B Wholesale Distribution
          </div>
        </div>
      </footer>

    </div>
  )
}
