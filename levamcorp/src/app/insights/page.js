'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const OWN_INSIGHTS = [
  {
    id: 'own-1', category: 'electronics',
    title: 'Smart TVs continue to dominate wholesale demand in 2025',
    summary: 'The demand for smart TVs — especially QLED and OLED models — remains at an all-time high. Distributors report that 65"+ models are the fastest moving units, driven by streaming adoption and home theater upgrades.',
    source: 'Levam Corp Market Team', date: 'May 2025', tag: '📺 Electronics', own: true,
    points: ['65"+ TVs are the fastest-selling size category', 'QLED technology commands 30%+ premium over standard LED', 'Q4 demand spikes up to 3x during holiday season', 'Amazon and Walmart marketplace competition is highest in this category']
  },
  {
    id: 'own-2', category: 'trends',
    title: 'Air purifiers and smart home devices surging in 2025',
    summary: 'Health-conscious consumers continue to drive demand for air purifiers, especially HEPA-certified models. Shark and Winix brands are seeing consistent reorder rates from resellers.',
    source: 'Levam Corp Market Team', date: 'May 2025', tag: '🔥 Trending', own: true,
    points: ['HEPA-certified units sell 40% faster than standard models', 'Smart home connectivity adds significant perceived value', 'Ideal for Amazon FBA sellers — lightweight, high margin', 'Year-round demand with holiday spikes']
  },
  {
    id: 'own-3', category: 'ecommerce',
    title: 'Amazon FBA sellers shifting to wholesale for better margins',
    summary: 'More Amazon FBA sellers are moving away from retail arbitrage and toward wholesale partnerships to improve consistency and margins. Access to verified wholesale suppliers with EIN requirements filters out competition.',
    source: 'Levam Corp Market Team', date: 'April 2025', tag: '🛒 E-commerce', own: true,
    points: ['Wholesale margins average 25-45% vs 10-15% for retail arbitrage', 'Consistent supply reduces out-of-stock penalties on Amazon', 'EIN verification creates barrier to entry — less competition', 'Prep center partnerships growing 60% year over year']
  },
  {
    id: 'own-4', category: 'amazon',
    title: 'Walmart marketplace growing faster than Amazon in home & kitchen',
    summary: 'Walmart Marketplace is gaining significant ground in home goods and kitchen appliances. Sellers report lower competition and better conversion rates than Amazon in these categories.',
    source: 'Levam Corp Market Team', date: 'April 2025', tag: '📦 Amazon & Walmart', own: true,
    points: ['Walmart has 150M+ unique monthly visitors', 'Kitchen and home categories see 2x lower competition vs Amazon', 'Multi-channel sellers earn 30% more revenue on average', 'Walmart Fulfillment Services (WFS) expanding rapidly']
  },
]

export default function InsightsPage() {
  const [news, setNews] = useState([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('news')

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(data => { setNews(data.articles || []); setLoadingNews(false) })
      .catch(() => setLoadingNews(false))
  }, [])

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
            Real-time industry news and weekly analysis — everything you need to stay ahead of the market and make better buying decisions.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: '2rem' }}>
            {[['📺','Electronics','Trending up'],['🏠','Home goods','Stable demand'],['🍳','Kitchen','Peak season'],['🛒','E-commerce','Growing fast']].map(([icon,label,status]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 10, color: '#2a7d4f', fontWeight: 600 }}>↑ {status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', padding: '0 2rem' }}>
          {[['news','🌐 Latest news — auto updated'],['insights','📊 Our market analysis']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '14px 20px', fontSize: 12, fontWeight: 600, color: tab === key ? '#2d7dd2' : '#555', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === key ? '#2d7dd2' : 'transparent'}`, cursor: 'pointer', letterSpacing: '0.03em' }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* NEWS TAB */}
        {tab === 'news' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Industry news <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>· Updated automatically every hour</span></div>
              <button onClick={() => { setLoadingNews(true); fetch('/api/news').then(r=>r.json()).then(d=>{setNews(d.articles||[]);setLoadingNews(false)}).catch(()=>setLoadingNews(false)) }}
                style={{ fontSize: 11, color: '#2d7dd2', background: 'rgba(45,125,210,0.08)', border: '0.5px solid rgba(45,125,210,0.2)', padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontWeight: 600 }}>
                🔄 Refresh
              </button>
            </div>

            {loadingNews ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background: '#fff', borderRadius: 8, height: 220, border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: 120, background: '#f0f2f5' }} />
                    <div style={{ padding: '1rem' }}>
                      <div style={{ height: 10, background: '#f0f2f5', borderRadius: 4, marginBottom: 8, width: '40%' }} />
                      <div style={{ height: 14, background: '#f0f2f5', borderRadius: 4, marginBottom: 6 }} />
                      <div style={{ height: 14, background: '#f0f2f5', borderRadius: 4, width: '70%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : news.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 8, padding: '3rem', textAlign: 'center', border: '0.5px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📰</div>
                <div style={{ fontSize: 14, color: '#555', marginBottom: 6 }}>Could not load news right now</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>Check our market analysis below or try again later</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {news.map(article => (
                  <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, overflow: 'hidden', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.15s', display: 'flex', flexDirection: 'column' }}>
                      {article.image && (
                        <div style={{ height: 160, overflow: 'hidden', background: '#f7f8fa', flexShrink: 0 }}>
                          <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.parentElement.style.display = 'none' }} />
                        </div>
                      )}
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#2d7dd2', background: 'rgba(45,125,210,0.08)', padding: '2px 8px', borderRadius: 8, border: '0.5px solid rgba(45,125,210,0.15)' }}>{article.source}</span>
                          <span style={{ fontSize: 10, color: '#bbb' }}>{article.date}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.4, marginBottom: 8, flex: 1 }}>{article.title}</div>
                        <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{article.summary}</div>
                        <div style={{ marginTop: 12, fontSize: 11, color: '#2d7dd2', fontWeight: 600 }}>Read full article →</div>
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
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: '1.5rem' }}>Our market analysis <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>· Updated by our team</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {OWN_INSIGHTS.map(insight => (
                <div key={insight.id} onClick={() => setSelected(selected === insight.id ? null : insight.id)}
                  style={{ background: '#fff', border: `1.5px solid ${selected === insight.id ? '#2d7dd2' : 'rgba(0,0,0,0.08)'}`, borderRadius: 8, padding: '1.5rem 2rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, padding: '3px 10px', background: 'rgba(45,125,210,0.08)', color: '#2d7dd2', borderRadius: 10, fontWeight: 600, border: '0.5px solid rgba(45,125,210,0.2)' }}>{insight.tag}</span>
                        <span style={{ fontSize: 10, color: '#bbb' }}>{insight.date} · Levam Corp</span>
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111', marginBottom: 8, lineHeight: 1.3 }}>{insight.title}</h3>
                      <p style={{ fontSize: 13, color: '#777', lineHeight: 1.8, margin: 0 }}>{insight.summary}</p>
                    </div>
                    <div style={{ fontSize: 20, color: '#bbb', flexShrink: 0, transition: 'transform 0.2s', transform: selected === insight.id ? 'rotate(180deg)' : 'none' }}>⌄</div>
                  </div>
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
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Want access to these products at wholesale prices?</div>
                        <Link href="/apply" onClick={e => e.stopPropagation()} style={{ padding: '10px 24px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', flexShrink: 0 }}>Apply now →</Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM CTA */}
        <div style={{ marginTop: '3rem', background: 'linear-gradient(135deg,#0d0d0d,#1a1a2e)', borderRadius: 8, padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Turn market knowledge into profit</h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Approved Levam Corp partners get first access to trending inventory every week.
          </p>
          <Link href="/apply" style={{ padding: '13px 32px', background: '#2d7dd2', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 4, textDecoration: 'none', boxShadow: '0 4px 20px rgba(45,125,210,0.4)', display: 'inline-block' }}>
            Apply to become a partner →
          </Link>
        </div>
      </div>
    </div>
  )
}
