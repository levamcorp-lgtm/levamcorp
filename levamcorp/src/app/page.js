'use client'
import Link from 'next/link'
 
export default function Home() {
  return (
    <div style={{ background: '#fff' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.4rem 3rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        background: '#fff', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="logo-icon">
            <div className="logo-l-vert" />
            <div className="logo-l-horiz" />
            <div className="logo-accent" />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '0.18em', color: '#222', textTransform: 'uppercase' }}>Levam</div>
            <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 3 }}>Corp · Distributors</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          <a href="#catalog" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>Products</a>
          <a href="#how" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>How it works</a>
          <a href="#about" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>About us</a>
          <Link href="/portal" style={{
            fontSize: 12, padding: '10px 24px', border: '0.5px solid #2d7dd2',
            background: 'transparent', color: '#2d7dd2', letterSpacing: '0.08em',
            textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none', fontWeight: 500
          }}>Client portal ↗</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        minHeight: 560, borderBottom: '0.5px solid rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '5rem 3.5rem 5rem 3rem' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: '#2d7dd2', marginBottom: '1.5rem',
            display: 'inline-flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ width: 24, height: 1, background: '#2d7dd2', display: 'inline-block' }} />
            B2B Wholesale Distribution — Doral, FL
          </div>
          <h1 style={{
            fontSize: 56, fontWeight: 500, lineHeight: 1.08,
            color: '#111', marginBottom: '1.5rem', letterSpacing: '-0.02em'
          }}>
            Your trusted source for{' '}
            <em style={{ color: '#2d7dd2', fontStyle: 'normal' }}>high-demand</em>{' '}
            inventory
          </h1>
          <p style={{ fontSize: 15, color: '#888', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: 400 }}>
            We supply verified distributors with electronics, appliances, and more at wholesale pricing. Apply once. Order anytime.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/apply" style={{
              padding: '14px 32px', background: '#2d7dd2', color: '#fff',
              fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
              borderRadius: 2, textDecoration: 'none', display: 'inline-block'
            }}>Apply to partner</Link>
            <a href="#how" style={{
              padding: '14px 32px', background: 'transparent', color: '#555',
              fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
              border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: 2, textDecoration: 'none', display: 'inline-block'
            }}>How it works</a>
          </div>
        </div>
        <div style={{
          background: '#f7f8fa', borderLeft: '0.5px solid rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 10, minHeight: 560
        }}>
          <div style={{ fontSize: 64, color: '#ddd' }}>🏭</div>
          <span style={{ fontSize: 11, color: '#ccc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your warehouse photo here</span>
          <span style={{ fontSize: 10, color: '#ddd' }}>Replace with your image</span>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{
        background: '#f7f8fa', borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        padding: '1.5rem 3rem', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '4rem'
      }}>
        {[['✓','Verified inventory'],['⏱','48h average dispatch'],['🔒','Approved partners only'],['📍','6315 NW 99th Ave, Doral FL']].map(([icon,label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888' }}>
            <span style={{ color: '#2d7dd2' }}>{icon}</span> {label}
          </div>
        ))}
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        {[['40','+ Products in catalog'],['48','h Average dispatch'],['100','% Verified inventory']].map(([num,label],i) => (
          <div key={label} style={{ padding: '2.5rem', textAlign: 'center', borderRight: i < 2 ? '0.5px solid rgba(0,0,0,0.08)' : 'none' }}>
            <div style={{ fontSize: 42, fontWeight: 500, color: '#111', marginBottom: 6 }}>
              {num}<span style={{ color: '#2d7dd2', fontSize: 24 }}>{label.split(' ')[0]}</span>
            </div>
            <div style={{ fontSize: 11, color: '#bbb', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label.split(' ').slice(1).join(' ')}</div>
          </div>
        ))}
      </div>

      {/* ABOUT */}
      <div id="about" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(0,0,0,0.08)', minHeight: 480 }}>
        <div style={{ padding: '4rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '0.75rem' }}>Who we are</div>
          <h2 style={{ fontSize: 34, fontWeight: 500, color: '#111', marginBottom: '1.25rem', lineHeight: 1.2 }}>A new standard in B2B wholesale distribution</h2>
          <p style={{ fontSize: 14, color: '#888', lineHeight: 1.9, marginBottom: '1.75rem' }}>
            Based in Doral, FL, Levam Corp sources high-demand consumer products and makes them available exclusively to verified distributor partners at pricing that makes sense for your business.
          </p>
          {['Carefully curated product selection','Transparent pricing — no hidden fees','Automatic invoicing and order quotes','Personal review of every partner application'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#555', marginBottom: 12 }}>
              <span style={{ color: '#2d7dd2', fontWeight: 500, fontSize: 16 }}>✓</span> {item}
            </div>
          ))}
        </div>
        <div style={{
          background: '#f7f8fa', borderLeft: '0.5px solid rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 10, minHeight: 400
        }}>
          <div style={{ fontSize: 64, color: '#ddd' }}>📦</div>
          <span style={{ fontSize: 11, color: '#ccc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Team / products photo</span>
        </div>
      </div>

      {/* CATALOG */}
      <section id="catalog" style={{ padding: '4rem 3rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '0.75rem' }}>Our catalog</div>
        <h2 style={{ fontSize: 34, fontWeight: 500, color: '#111', marginBottom: '0.75rem' }}>Multiple categories, one trusted source.</h2>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.8, maxWidth: 520, marginBottom: '2.5rem' }}>
          From consumer electronics to home and kitchen appliances — competitive wholesale pricing for approved partners.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(0,0,0,0.08)' }}>
          {[
            { icon: '📺', name: 'Electronics & TVs', desc: 'Smart TVs, streaming devices, and consumer electronics at distributor pricing.' },
            { icon: '🏠', name: 'Home appliances', desc: 'Major and small appliances for household use, sourced from reliable suppliers.' },
            { icon: '🍳', name: 'Kitchen essentials', desc: 'Countertop appliances, cookware, and kitchen gadgets ready to dispatch.' },
          ].map(cat => (
            <div key={cat.name} style={{ background: '#fff', padding: '2rem' }}>
              <div style={{ fontSize: 40, marginBottom: '1.25rem' }}>{cat.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#222', marginBottom: 8 }}>{cat.name}</div>
              <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7 }}>{cat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '4rem 3rem', background: '#f7f8fa', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '0.75rem' }}>How it works</div>
        <h2 style={{ fontSize: 34, fontWeight: 500, color: '#111', marginBottom: '2.5rem' }}>Four steps to start ordering.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'rgba(0,0,0,0.08)' }}>
          {[['01','Apply','Submit your business info. We review every application personally.'],['02','Get approved','Receive your private login credentials within 1–2 business days.'],['03','Browse & quote','Access the full catalog with live pricing, availability, and dispatch times.'],['04','Order & invoice','Place your order. Invoice and quote generate automatically.']].map(([num,title,desc]) => (
            <div key={num} style={{ background: '#fff', padding: '2rem 1.5rem' }}>
              <div style={{ fontSize: 11, color: '#2d7dd2', letterSpacing: '0.25em', marginBottom: '1rem', fontWeight: 500 }}>{num}</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#222', marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ padding: '6rem 3rem', textAlign: 'center', background: '#2d7dd2' }}>
        <h2 style={{ fontSize: 36, fontWeight: 500, color: '#fff', marginBottom: '1rem' }}>Ready to work with us?</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: '2.5rem' }}>Applications reviewed within 1–2 business days.</p>
        <Link href="/apply" style={{
          padding: '15px 40px', background: '#fff', color: '#2d7dd2',
          fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
          borderRadius: 2, textDecoration: 'none', display: 'inline-block'
        }}>Start your application</Link>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: '1.5rem' }}>
          Already approved?{' '}
          <Link href="/portal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Access your portal →</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 11, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          © 2025 Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['Privacy','Terms','Contact us'].map(link => (
            <a key={link} href="#" style={{ fontSize: 11, color: '#bbb', textDecoration: 'none' }}>{link}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
