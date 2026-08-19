'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const OWN_INSIGHTS = [
  {
    id: 'own-1', category: 'electronics',
    title: 'Smart TVs continue to dominate wholesale demand in 2026',
    summary: 'The demand for smart TVs — especially QLED and Mini-LED models — remains at an all-time high. Distributors report that 65"+ models are the fastest moving units, driven by streaming adoption and home theater upgrades. Samsung and Hisense lead in volume.',
    source: 'Levam Corp Market Team', date: 'Aug 2026', tag: 'Electronics',
    points: ['65"+ TVs are the fastest-selling size category', 'QLED technology commands 30%+ premium over standard LED', 'Q4 demand spikes up to 3x during holiday season', 'Amazon and Walmart marketplace competition is highest in this category']
  },
  {
    id: 'own-2', category: 'trends',
    title: 'Air fryers and kitchen appliances: consistent high performers for resellers',
    summary: 'Kitchen appliances remain one of the most reliable product categories for wholesale resellers. Brands like Brentwood, Hamilton Beach, and Proctor Silex maintain steady demand year-round with spikes during New Year resolution season.',
    source: 'Levam Corp Market Team', date: 'Aug 2026', tag: 'Trending',
    points: ['Kitchen category has year-round stable demand', 'Low return rates compared to electronics — ideal for new sellers', 'New Year (Jan) and gifting season (Nov-Dec) are peak months', 'Multi-brand orders increase average order value significantly']
  },
  {
    id: 'own-3', category: 'ecommerce',
    title: 'Amazon FBA sellers shifting to wholesale distribution for better margins',
    summary: 'More Amazon FBA sellers are moving away from retail arbitrage and toward wholesale partnerships to improve consistency and margins. Access to verified wholesale suppliers with EIN requirements filters out competition significantly.',
    source: 'Levam Corp Market Team', date: 'Jul 2026', tag: 'E-commerce',
    points: ['Wholesale margins average 25-45% vs 10-15% for retail arbitrage', 'Consistent supply reduces out-of-stock penalties on Amazon', 'EIN verification creates barrier to entry — less competition', 'Prep center partnerships growing 60% year over year']
  },
  {
    id: 'own-4', category: 'amazon',
    title: 'Walmart marketplace growing faster than Amazon in home & kitchen',
    summary: 'Walmart Marketplace is gaining significant ground in home goods and kitchen appliances. Sellers report lower competition and better conversion rates than Amazon in these categories. Multi-channel selling is now the standard strategy for serious resellers.',
    source: 'Levam Corp Market Team', date: 'Jul 2026', tag: 'Amazon & Walmart',
    points: ['Walmart has 150M+ unique monthly visitors', 'Kitchen and home categories see 2x lower competition vs Amazon', 'Multi-channel sellers earn 30% more revenue on average', 'Walmart Fulfillment Services (WFS) expanding rapidly']
  },
]

export default function InsightsPage() {
  const [news, setNews]               = useState([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [selected, setSelected]       = useState(null)
  const [tab, setTab]                 = useState('news')

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => { setNews(d.articles || []); setLoadingNews(false) })
      .catch(() => setLoadingNews(false))
  }, [])

  const refresh = () => {
    setLoadingNews(true)
    fetch('/api/news').then(r=>r.json()).then(d=>{setNews(d.articles||[]);setLoadingNews(false)}).catch(()=>setLoadingNews(false))
  }

  return (
    <div style={{ background: '#060810', minHeight: '100vh', fontFamily: '-apple-system,BlinkMacSystemFont,sans-serif', color: '#fff' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .ins-card { background:rgba(255,255,255,0.03); border:0.5px solid rgba(255,255,255,0.07); border-radius:8px; overflow:hidden; transition:all 0.2s; }
        .ins-card:hover { background:rgba(14,165,233,0.05); border-color:rgba(14,165,233,0.2); transform:translateY(-2px); }
        .news-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:768px) { .news-grid { grid-template-columns:1fr; } }
      `}</style>

      {/* NAV */}
      <nav style={{ background: 'rgba(6,8,16,0.92)', borderBottom: '0.5px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>LEVAM<span style={{ color: '#0EA5E9' }}>CORP</span></div>
          </Link>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Link href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>← Back to home</Link>
            <Link href="/apply" style={{ fontSize: 11, fontWeight: 700, padding: '8px 18px', background: '#0EA5E9', color: '#fff', borderRadius: 3, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Apply now</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ padding: '4rem 2rem 3rem', borderBottom: '0.5px solid rgba(255,255,255,0.06)', background: 'radial-gradient(ellipse at 50% 0%, rgba(14,165,233,0.08) 0%, transparent 60%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px rgba(34,197,94,0.8)', animation: 'pulse 2s infinite' }}/>
            <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#22c55e', fontWeight: 700 }}>Live market intelligence</div>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.02em', margin: '0 0 1rem', lineHeight: 1.1 }}>
            Market Insights<br/>
            <span style={{ color: '#0EA5E9' }}>for wholesale distributors</span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 560, margin: '0 0 2rem' }}>
            Real-time industry news and weekly analysis — everything you need to stay ahead of the market and make better buying decisions.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, maxWidth: 560 }}>
            {[['📺','Electronics','Trending up'],['🏠','Home goods','Stable'],['☕','Kitchen','Peak season'],['🛒','E-commerce','Growing']].map(([icon,label,status]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 600 }}>↑ {status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', padding: '0 2rem' }}>
          {[['news','🌐 Industry news — auto updated'],['insights','📊 Our market analysis']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: tab===key ? '#0EA5E9' : 'rgba(255,255,255,0.35)', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab===key ? '#0EA5E9' : 'transparent'}`, cursor: 'pointer', letterSpacing: '0.03em', fontFamily: 'inherit' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* NEWS TAB */}
        {tab === 'news' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Updated automatically every hour</div>
              <button onClick={refresh} style={{ fontSize: 11, color: '#0EA5E9', background: 'rgba(14,165,233,0.08)', border: '0.5px solid rgba(14,165,233,0.2)', padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>
                ↻ Refresh
              </button>
            </div>
            {loadingNews ? (
              <div className="news-grid">
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, height: 260, border: '0.5px solid rgba(255,255,255,0.07)' }}/>
                ))}
              </div>
            ) : news.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.2)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📰</div>
                <div style={{ fontSize: 14 }}>Could not load news right now. Check our market analysis below.</div>
              </div>
            ) : (
              <div className="news-grid">
                {news.map(article => (
                  <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div className="ins-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {article.image && (
                        <div style={{ height: 160, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', flexShrink: 0 }}>
                          <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                            onError={e => { e.target.parentElement.style.display = 'none' }}/>
                        </div>
                      )}
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{article.source}</span>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{article.date}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.5, marginBottom: 8, flex: 1 }}>{article.title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{article.summary}</div>
                        <div style={{ marginTop: 10, fontSize: 11, color: '#0EA5E9', fontWeight: 600 }}>Read full article →</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INSIGHTS TAB */}
        {tab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OWN_INSIGHTS.map(insight => (
              <div key={insight.id} onClick={() => setSelected(selected===insight.id ? null : insight.id)}
                style={{ background: selected===insight.id ? 'rgba(14,165,233,0.06)' : 'rgba(255,255,255,0.03)', border: `0.5px solid ${selected===insight.id ? 'rgba(14,165,233,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, padding: '1.5rem 2rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9, padding: '3px 10px', background: 'rgba(14,165,233,0.1)', color: '#0EA5E9', borderRadius: 10, fontWeight: 700, border: '0.5px solid rgba(14,165,233,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{insight.tag}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{insight.date} · Levam Corp</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8, lineHeight: 1.3 }}>{insight.title}</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, margin: 0 }}>{insight.summary}</p>
                  </div>
                  <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', flexShrink: 0, transition: 'transform 0.2s', transform: selected===insight.id ? 'rotate(180deg)' : 'none' }}>⌄</div>
                </div>
                {selected === insight.id && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Key takeaways</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
                      {insight.points.map((point, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 6 }}>
                          <span style={{ color: '#0EA5E9', fontWeight: 700, flexShrink: 0 }}>→</span>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{point}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(14,165,233,0.08)', border: '0.5px solid rgba(14,165,233,0.2)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Want access to these products at wholesale prices?</div>
                      <Link href="/apply" onClick={e => e.stopPropagation()} style={{ padding: '10px 24px', background: '#0EA5E9', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', flexShrink: 0 }}>Apply now →</Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={{ marginTop: '3rem', background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.06))', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 10, padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', color: '#0EA5E9', textTransform: 'uppercase', marginBottom: 12 }}>Ready to act on these insights?</div>
          <h3 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, color: '#fff', margin: '0 0 1rem', letterSpacing: '-0.02em' }}>Turn market knowledge into profit</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Approved Levam Corp partners get first access to trending inventory every week — before the competition.
          </p>
          <Link href="/apply" style={{ display: 'inline-block', padding: '14px 36px', background: '#0EA5E9', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 4, textDecoration: 'none' }}>
            Apply to become a partner →
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          © 2026 Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com
        </div>
      </div>
    </div>
  )
}
