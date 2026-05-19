'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  { key: 'all', label: 'All insights' },
  { key: 'electronics', label: '📺 Electronics' },
  { key: 'ecommerce', label: '🛒 E-commerce' },
  { key: 'amazon', label: '📦 Amazon & Walmart' },
  { key: 'trends', label: '🔥 Trending products' },
]

const STATIC_INSIGHTS = [
  {
    id: 1, category: 'electronics',
    title: 'Smart TVs continue to dominate wholesale demand in 2025',
    summary: 'The demand for smart TVs — especially QLED and OLED models — remains at an all-time high. Distributors report that 65"+ models are the fastest moving units, driven by streaming adoption and home theater upgrades. Samsung, LG, and Hisense lead in volume.',
    source: 'Levam Corp Market Team', date: 'May 2025', readTime: '2 min', tag: '📺 Electronics',
    points: ['65"+ TVs are the fastest-selling size category', 'QLED technology commands 30%+ premium over standard LED', 'Q4 demand spikes up to 3x during holiday season', 'Amazon and Walmart marketplace competition is highest in this category']
  },
  {
    id: 2, category: 'trends',
    title: 'Air purifiers and smart home devices surging in post-pandemic market',
    summary: 'Health-conscious consumers continue to drive demand for air purifiers, especially HEPA-certified models. Shark and Winix brands are seeing consistent reorder rates from resellers. Smart home integration is now a baseline expectation for new buyers.',
    source: 'Levam Corp Market Team', date: 'May 2025', readTime: '3 min', tag: '🔥 Trending',
    points: ['HEPA-certified units sell 40% faster than standard models', 'Shark BreatheClear and similar models have 90%+ resell rate', 'Smart home connectivity adds significant perceived value', 'Ideal for Amazon FBA sellers — lightweight, high margin']
  },
  {
    id: 3, category: 'ecommerce',
    title: 'Amazon FBA sellers shifting to wholesale distribution for better margins',
    summary: 'More Amazon FBA sellers are moving away from retail arbitrage and toward wholesale partnerships to improve consistency and margins. Access to verified wholesale suppliers with EIN requirements filters out competition significantly.',
    source: 'Levam Corp Market Team', date: 'April 2025', readTime: '4 min', tag: '🛒 E-commerce',
    points: ['Wholesale margins average 25-45% vs 10-15% for retail arbitrage', 'Consistent supply reduces out-of-stock penalties on Amazon', 'EIN verification creates barrier to entry — less competition', 'Prep center partnerships are growing 60% year over year']
  },
  {
    id: 4, category: 'amazon',
    title: 'Walmart marketplace growing faster than Amazon in select categories',
    summary: 'Walmart Marketplace is gaining significant ground in home goods and kitchen appliances. Sellers report lower competition and better conversion rates than Amazon in these categories. Multi-channel selling is now the standard strategy for serious resellers.',
    source: 'Levam Corp Market Team', date: 'April 2025', readTime: '3 min', tag: '📦 Amazon & Walmart',
    points: ['Walmart has 150M+ unique monthly visitors', 'Kitchen and home categories see 2x lower competition vs Amazon', 'Walmart Fulfillment Services (WFS) expanding rapidly', 'Multi-channel sellers earn 30% more revenue on average']
  },
  {
    id: 5, category: 'electronics',
    title: 'Smartwatches and wearables: the fastest growing wholesale category of 2025',
    summary: 'Garmin, Apple Watch alternatives, and fitness trackers are seeing unprecedented wholesale demand. Health tracking features and affordable price points make wearables a top choice for online resellers targeting the fitness-conscious consumer.',
    source: 'Levam Corp Market Team', date: 'March 2025', readTime: '2 min', tag: '📺 Electronics',
    points: ['Wearables market growing 15% YoY', 'Garmin running watches have 95%+ sell-through rate', 'Price points under $300 drive highest volume', 'Father\'s Day and holiday season are peak demand periods']
  },
  {
    id: 6, category: 'trends',
    title: 'Blenders and kitchen gadgets: consistent high performers for resellers',
    summary: 'Kitchen appliances remain one of the most reliable product categories for wholesale resellers. NutriBullet, Ninja, and similar brands maintain steady demand year-round with spikes during New Year resolution season and back-to-school periods.',
    source: 'Levam Corp Market Team', date: 'March 2025', readTime: '2 min', tag: '🔥 Trending',
    points: ['Kitchen category has year-round stable demand', 'NutriBullet and Ninja lead brand recognition', 'New Year (Jan) and gifting season (Nov-Dec) are peak months', 'Low return rates compared to electronics — ideal for new sellers']
  },
]

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = activeCategory === 'all' ? STATIC_INSIGHTS : STATIC_INSIGHTS.filter(i => i.category === activeCategory)

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 3rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 34, height: 34 }}>
            <div style={{ position: 'absolute', left: 7, top: 0, width: 2.5, height: 27, background: '#444' }} />
            <div style={{ position: 'absolute', left: 7, bottom: 0, width: 20, height: 2.5, background: '#444' }} />
            <div style={{ position: 'absolute', left: 12, bottom: 7, width: 12, height: 2.5, background: '#2d7dd2' }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Levam</div>
            <div style={{ fontSize: 9, letterSpacing: '0.32em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 3 }}>Corp · Distributors</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Back to home</Link>
          <Link href="/apply" style={{ fontSize: 12, fontWeight: 600, padding: '9px 22px', background: '#2d7dd2', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none' }}>Apply now</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)', padding: '4rem 3rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, background: '#2a7d4f', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px rgba(42,125,79,0.8)' }} />
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2a7d4f', fontWeight: 600 }}>Live market intelligence</div>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Market Insights<br />
            <span style={{ color: '#2d7dd2' }}>for wholesale distributors</span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 600 }}>
            Stay ahead of the market with our weekly analysis of trending products, e-commerce shifts, and wholesale opportunities — curated by the Levam Corp team.
          </p>

          {/* STATS BAR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: '2rem' }}>
            {[
              ['📺', 'Electronics', 'Trending up'],
              ['🏠', 'Home goods', 'Stable demand'],
              ['🍳', 'Kitchen', 'Peak season'],
              ['🛒', 'E-commerce', 'Growing fast'],
            ].map(([icon, label, status]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 10, color: '#2a7d4f', fontWeight: 600 }}>↑ {status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* FILTERS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              style={{ fontSize: 12, fontWeight: activeCategory === cat.key ? 700 : 500, padding: '7px 16px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${activeCategory === cat.key ? '#2d7dd2' : 'rgba(0,0,0,0.1)'}`, background: activeCategory === cat.key ? '#2d7dd2' : '#fff', color: activeCategory === cat.key ? '#fff' : '#666', transition: 'all 0.15s' }}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ARTICLES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(insight => (
            <div key={insight.id}>
              <div onClick={() => setSelected(selected === insight.id ? null : insight.id)}
                style={{ background: '#fff', border: `1.5px solid ${selected === insight.id ? '#2d7dd2' : 'rgba(0,0,0,0.08)'}`, borderRadius: 8, padding: '1.5rem 2rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.15s' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', borderRadius: 10, fontWeight: 600, border: '0.5px solid rgba(45,125,210,0.2)' }}>{insight.tag}</span>
                      <span style={{ fontSize: 10, color: '#bbb' }}>{insight.date}</span>
                      <span style={{ fontSize: 10, color: '#bbb' }}>· {insight.readTime} read</span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111', marginBottom: 10, lineHeight: 1.3 }}>{insight.title}</h3>
                    <p style={{ fontSize: 13, color: '#777', lineHeight: 1.8, margin: 0 }}>{insight.summary}</p>
                  </div>
                  <div style={{ fontSize: 20, color: '#bbb', flexShrink: 0, transition: 'transform 0.2s', transform: selected === insight.id ? 'rotate(180deg)' : 'none' }}>⌄</div>
                </div>

                {/* EXPANDED */}
                {selected === insight.id && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>Key takeaways</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
                      {insight.points.map((point, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: 6 }}>
                          <span style={{ color: '#2d7dd2', fontWeight: 700, flexShrink: 0 }}>→</span>
                          <span style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{point}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '1.25rem', background: '#111', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                        Want access to these products at wholesale prices?
                      </div>
                      <Link href="/apply" style={{ padding: '10px 24px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', flexShrink: 0, boxShadow: '0 4px 14px rgba(45,125,210,0.35)' }}>
                        Apply now →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div style={{ marginTop: '3rem', background: 'linear-gradient(135deg,#0d0d0d,#1a1a2e)', borderRadius: 8, padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 12 }}>Ready to act on these insights?</div>
          <h3 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.01em' }}>Turn market knowledge into profit</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
            Approved Levam Corp partners get first access to trending inventory every week — before the competition.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/apply" style={{ padding: '13px 32px', background: '#2d7dd2', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 4, textDecoration: 'none', boxShadow: '0 4px 20px rgba(45,125,210,0.4)' }}>
              Apply to become a partner
            </Link>
            <Link href="/contact" style={{ padding: '13px 24px', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 4, textDecoration: 'none' }}>
              Contact us
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: 11, color: '#aaa' }}>
          © 2025 Levam Corp Distributors · Market insights updated weekly by our sourcing team
        </div>
      </div>
    </div>
  )
}
