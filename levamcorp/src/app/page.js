import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ background: '#fff' }}>

      {/* NAV */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)',
        background: '#fff', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon">
            <div className="logo-l-vert" />
            <div className="logo-l-horiz" />
            <div className="logo-accent" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.18em', color: '#222', textTransform: 'uppercase' }}>Levam</div>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Corp · Distributors</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#catalog" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>Products</a>
          <a href="#how" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>How it works</a>
          <a href="#about" style={{ fontSize: 12, color: '#888', textDecoration: 'none' }}>About us</a>
          <Link href="/portal" style={{
            fontSize: 11, padding: '8px 20px', border: '0.5px solid #2d7dd2',
            background: 'transparent', color: '#2d7dd2', letterSpacing: '0.08em',
            textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none'
          }}>Client portal ↗</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        minHeight: 460, borderBottom: '0.5px solid rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem 4rem 2.5rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', marginBottom: '1.25rem' }}>
            B2B Wholesale Distribution — Doral, FL
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.12, color: '#111', marginBottom: '1.1rem' }}>
            Your trusted source for{' '}
            <em style={{ color: '#2d7dd2', fontStyle: 'normal' }}>high-demand</em>{' '}
            inventory
          </h1>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 360 }}>
            We supply verified distributors with electronics, appliances, and more at wholesale pricing. Apply once. Order anytime.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link href="/apply" className="btn-primary">Apply to partner</Link>
            <a href="#how" className="btn-ghost">How it works</a>
          </div>
        </div>
        <div style={{
          background: '#f7f8fa', borderLeft: '0.5px solid rgba(0,0,0,0.08)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10
        }}>
          <div style={{ fontSize: 64, color: '#ddd' }}>🏭</div>
          <span style={{ fontSize: 11, color: '#ccc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your warehouse photo here</span>
          <span style={{ fontSize: 10, color: '#ddd' }}>Replace with your image</span>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ background: '#f7f8fa', borderBottom: '0.5px solid rgba(0,0,0,0.08)', padding: '1.25rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem' }}>
        {[['✓','Verified inventory'],['⏱','48h average dispatch'],['🔒','Approved partners only'],['📍','6315 NW 99th Ave, Doral FL']].map(([icon,label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#aaa' }}>
            <span style={{ color: '#2d7dd2' }}>{icon}</span> {label}
          </div>
        ))}
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        {[['40','+ Products in catalog'],['48','h Average dispatch'],['100','% Verified inventory']].map(([num,label],i) => (
          <div key={label} style={{ padding: '2.25rem', textAlign: 'center', borderRight: i < 2 ? '0.5px solid rgba(0,0,0,0.08)' : 'none' }}>
            <div style={{ fontSize: 34, fontWeight: 500, color: '#111', marginBottom: 4 }}>
              {num}<span style={{ color: '#2d7dd2', fontSize: 20 }}>{label.split(' ')[0]}</span>
            </div>
            <div style={{ fontSize: 10, color: '#bbb', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label.split(' ').slice(1).join(' ')}</div>
          </div>
        ))}
      </div>

      {/* ABOUT */}
      <div id="about" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="section-tag">Who we are</div>
          <h2 style={{ fontSize: 24, fontWeight: 500, color: '#111', marginBottom: '1rem', lineHeight: 1.3 }}>A new standard in B2B wholesale distribution</h2>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Based in Doral, FL, Levam Corp sources high-demand consumer products and makes them available exclusively to verified distributor partners at pricing that makes sense for your business.
          </p>
          {['Carefully curated product selection','Transparent pricing — no hidden fees','Automatic invoicing and order quotes','Personal review of every partner application'].map(item => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#666', marginBottom: 10 }}>
              <span style={{ color: '#2d7dd2', fontWeight: 500 }}>✓</span> {item}
            </div>
          ))}
        </div>
        <div style={{ background: '#f7f8fa', borderLeft: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 320 }}>
          <div style={{ fontSize: 64, color: '#ddd' }}>📦</div>
          <span style={{ fontSize: 11, color: '#ccc', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Team / products photo</span>
        </div>
      </div>

      {/* CATALOG */}
      <section id="catalog" style={{ padding: '3.5rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div className="section-tag">Our catalog</div>
        <h2 style={{ fontSize: 24, fontWeight: 500, color: '#111', marginBottom: '0.5rem' }}>Multiple categories, one trusted source.</h2>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.8, maxWidth: 480, marginBottom: '2rem' }}>
          From consumer electronics to home and kitchen appliances — competitive wholesale pricing for approved partners.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(0,0,0,0.08)' }}>
          {[
            { icon: '📺', name: 'Electronics & TVs', desc: 'Smart TVs, streaming devices, and consumer electronics at distributor pricing.' },
            { icon: '🏠', name: 'Home appliances', desc: 'Major and small appliances for household use, sourced from reliable suppliers.' },
            { icon: '🍳', name: 'Kitchen essentials', desc: 'Countertop appliances, cookware, and kitchen gadgets ready to dispatch.' },
          ].map(cat => (
            <div key={cat.name} style={{ background: '#fff', padding: '1.75rem 1.5rem' }}>
              <div style={{ fontSize: 32, marginBottom: '1rem' }}>{cat.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 5 }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6 }}>{cat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '3.5rem 2.5rem', background: '#f7f8fa', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div className="section-tag">How it works</div>
        <h2 style={{ fontSize: 24, fontWeight: 500, color: '#111', marginBottom: '2rem' }}>Four steps to start ordering.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'rgba(0,0,0,0.08)' }}>
          {[['01','Apply','Submit your business info. We review every application personally.'],['02','Get approved','Receive your private login credentials within 1–2 business days.'],['03','Browse & quote','Access the full catalog with live pricing, availability, and dispatch times.'],['04','Order & invoice','Place your order. Invoice and quote generate automatically.']].map(([num,title,desc]) => (
            <div key={num} style={{ background: '#fff', padding: '1.75rem 1.25rem' }}>
              <div style={{ fontSize: 10, color: '#2d7dd2', letterSpacing: '0.25em', marginBottom: '0.75rem', fontWeight: 500 }}>{num}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#222', marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div style={{ padding: '5rem 2.5rem', textAlign: 'center', background: '#2d7dd2' }}>
        <h2 style={{ fontSize: 28, fontWeight: 500, color: '#fff', marginBottom: '0.75rem' }}>Ready to work with us?</h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: '2rem' }}>Applications reviewed within 1–2 business days.</p>
        <Link href="/apply" style={{
          padding: '13px 32px', background: '#fff', color: '#2d7dd2',
          fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
          border: 'none', cursor: 'pointer', borderRadius: 2, textDecoration: 'none', display: 'inline-block'
        }}>Start your application</Link>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: '1rem' }}>
          Already approved?{' '}
          <Link href="/portal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Access your portal →</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding: '1.75rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 10, color: '#bbb', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          © 2025 Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy','Terms','Contact us'].map(link => (
            <a key={link} href="#" style={{ fontSize: 10, color: '#bbb', textDecoration: 'none' }}>{link}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}
