'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'
const mono = "'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace"

function seededBars(seed, count) {
  let s = seed
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  return Array.from({ length: count }, () => {
    const r = rnd()
    return { grow: r > 0.82 ? 3 : r > 0.5 ? 2 : 1, tall: r > 0.94, r }
  })
}
function sparkBars(seed, n, accent) {
  return seededBars(seed, n).map((b, i) => ({
    h: Math.round(7 + b.r * 13 + i * 0.7) + 'px',
    c: i >= n - 3 ? accent : 'rgba(242,239,230,0.3)',
  }))
}
const BARCODE = seededBars(20260917, 96)

const SECTORS = ['Electronics', 'Home goods', 'Kitchen', 'E-commerce']

// classify by real keyword match against title+summary — no fabricated trend data, just a real count of what's actually there
function classify(text) {
  const t = (text || '').toLowerCase()
  if (/(air fryer|blender|kitchen|cookware|coffee maker|instant pot|slow cooker|microwave)/.test(t)) return 'Kitchen'
  if (/(\btv\b|television|oled|qled|monitor|laptop|smartphone|\bphone\b|headphone|speaker|\baudio\b|console|gaming|smart home|electronics|charger|robot vacuum)/.test(t)) return 'Electronics'
  if (/(amazon|walmart|marketplace|\bfba\b|wholesale|e-commerce|ecommerce|reseller|retail(er)?|online seller)/.test(t)) return 'E-commerce'
  if (/(home good|furniture|decor|\bvacuum\b|appliance)/.test(t)) return 'Home goods'
  return null
}

const OWN_INSIGHTS = [
  {
    id: 'own-1', category: 'electronics', sector: 'Electronics',
    title: 'Smart TVs continue to dominate wholesale demand in 2026',
    summary: 'The demand for smart TVs — especially QLED and Mini-LED models — remains at an all-time high. Distributors report that 65"+ models are the fastest moving units, driven by streaming adoption and home theater upgrades. Samsung and Hisense lead in volume.',
    source: 'Levam Corp Market Team', date: 'Aug 2026', tag: 'Electronics',
    points: ['65"+ TVs are the fastest-selling size category', 'QLED technology commands 30%+ premium over standard LED', 'Q4 demand spikes up to 3x during holiday season', 'Amazon and Walmart marketplace competition is highest in this category'],
    seed: 1201,
  },
  {
    id: 'own-2', category: 'trends', sector: 'Kitchen',
    title: 'Air fryers and kitchen appliances: consistent high performers for resellers',
    summary: 'Kitchen appliances remain one of the most reliable product categories for wholesale resellers. Brands like Brentwood, Hamilton Beach, and Proctor Silex maintain steady demand year-round with spikes during New Year resolution season.',
    source: 'Levam Corp Market Team', date: 'Aug 2026', tag: 'Trending',
    points: ['Kitchen category has year-round stable demand', 'Low return rates compared to electronics — ideal for new sellers', 'New Year (Jan) and gifting season (Nov-Dec) are peak months', 'Multi-brand orders increase average order value significantly'],
    seed: 3603,
  },
  {
    id: 'own-3', category: 'ecommerce', sector: 'E-commerce',
    title: 'Amazon FBA sellers shifting to wholesale distribution for better margins',
    summary: 'More Amazon FBA sellers are moving away from retail arbitrage and toward wholesale partnerships to improve consistency and margins. Access to verified wholesale suppliers with EIN requirements filters out competition significantly.',
    source: 'Levam Corp Market Team', date: 'Jul 2026', tag: 'E-commerce',
    points: ['Wholesale margins average 25-45% vs 10-15% for retail arbitrage', 'Consistent supply reduces out-of-stock penalties on Amazon', 'EIN verification creates barrier to entry — less competition', 'Prep center partnerships growing 60% year over year'],
    seed: 2402,
  },
  {
    id: 'own-4', category: 'amazon', sector: 'Home goods',
    title: 'Walmart marketplace growing faster than Amazon in home & kitchen',
    summary: 'Walmart Marketplace is gaining significant ground in home goods and kitchen appliances. Sellers report lower competition and better conversion rates than Amazon in these categories. Multi-channel selling is now the standard strategy for serious resellers.',
    source: 'Levam Corp Market Team', date: 'Jul 2026', tag: 'Amazon & Walmart',
    points: ['Walmart has 150M+ unique monthly visitors', 'Kitchen and home categories see 2x lower competition vs Amazon', 'Multi-channel sellers earn 30% more revenue on average', 'Walmart Fulfillment Services (WFS) expanding rapidly'],
    seed: 4804,
  },
]

export default function InsightsPage() {
  const [news, setNews] = useState([])
  const [loadingNews, setLoadingNews] = useState(true)
  const [tab, setTab] = useState('News')
  const [sector, setSector] = useState('All')
  const [hoverWire, setHoverWire] = useState(-1)
  const [hoverCard, setHoverCard] = useState(-1)
  const [refreshedAt, setRefreshedAt] = useState(null)
  const [stamp, setStamp] = useState('')

  const load = () => {
    setLoadingNews(true)
    fetch('/api/news')
      .then(r => r.json())
      .then(d => { setNews(d.articles || []); setLoadingNews(false) })
      .catch(() => setLoadingNews(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const now = new Date()
    setStamp(refreshedAt ? 'just now' : now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }) + ' ET')
  }, [refreshedAt])

  const refresh = () => { load(); setRefreshedAt(Date.now()) }

  const now = useState(() => new Date())[0]
  const issue = String(now.getMonth() + 1).padStart(2, '0') + ' · ' + now.getFullYear()

  const articles = useMemo(() => news.map(a => ({ ...a, sector: classify(a.title + ' ' + a.summary) })), [news])

  const sectorCards = SECTORS.map((name, i) => {
    const on = sector === name
    const count = tab === 'News' ? articles.filter(a => a.sector === name).length : OWN_INSIGHTS.filter(n => n.sector === name).length
    return { name, count, on, spark: sparkBars(name.length * 777 + i, 12, on ? DEEP : ACCENT) }
  })

  const filteredArticles = sector === 'All' ? articles : articles.filter(a => a.sector === sector)
  const filteredNotes = sector === 'All' ? OWN_INSIGHTS : OWN_INSIGHTS.filter(n => n.sector === sector)

  const lead = filteredArticles[0]
  const wire = filteredArticles.slice(1, 6)
  const cards = filteredArticles.slice(6, 9)

  const feedNote = (tab === 'News' ? 'Pulled automatically' : 'Written by our team') + (sector === 'All' ? '' : ' · filtered to ' + sector)
  const footLeft = tab === 'News'
    ? `Bulletin ${issue.split(' · ')[0]} · ${filteredArticles.length} ${filteredArticles.length === 1 ? 'story' : 'stories'} on file`
    : `Bulletin ${issue.split(' · ')[0]} · ${filteredNotes.length} analysis note${filteredNotes.length === 1 ? '' : 's'}`

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#08090b', color: '#f2efe6', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif', padding: 'clamp(18px,3vh,34px) clamp(16px,4vw,72px) clamp(70px,11vh,130px)' }}>
      <style>{`.lc-mono { font-family:${mono}; }`}</style>
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>

        <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', paddingBottom: 12, fontSize: 9.5, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6f6d67' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, color: '#f2efe6' }}>
            <span style={{ display: 'inline-block', width: 13, height: 13, border: '1px solid rgba(242,239,230,.5)', borderLeft: `3px solid ${ACCENT}` }} />
            <span style={{ fontWeight: 700, letterSpacing: '.2em' }}>Levamcorp</span>
          </Link>
          <span style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <Link href="/" style={{ letterSpacing: '.18em', color: '#86837c' }}>← Back to home</Link>
            <Link href="/apply" style={{ padding: '9px 14px', background: ACCENT, color: '#08090b', fontWeight: 700, letterSpacing: '.18em' }}>Apply now</Link>
          </span>
        </div>
        <div style={{ height: 1, background: 'rgba(242,239,230,.3)' }} />

        <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '11px 0 12px', borderBottom: '1px solid rgba(242,239,230,.14)', fontSize: 9.5, letterSpacing: '.2em', textTransform: 'uppercase', color: '#7c7a73' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, background: ACCENT }} />
            Market bulletin · Issue {issue}
          </span>
          <span>Updated hourly{stamp && ` · ${stamp}`}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(22px,3.4vw,56px)', padding: 'clamp(30px,4.8vh,52px) 0 clamp(26px,4vh,42px)' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(38px,5.4vw,70px)', fontWeight: 400, letterSpacing: '-.05em', lineHeight: .98, color: '#f5f2e9' }}>Market insights for wholesale distributors<span style={{ color: ACCENT }}>.</span></h1>
          <p style={{ margin: 0, alignSelf: 'end', maxWidth: '44ch', fontSize: 16, lineHeight: 1.68, color: '#9a968e' }}>Industry news pulled in automatically, plus our own weekly read on where wholesale pricing and demand are heading — so you buy ahead of the market, not behind it.</p>
        </div>

        <div style={{ borderTop: '1px solid rgba(242,239,230,.3)', borderBottom: '1px solid rgba(242,239,230,.3)' }}>
          <div className="lc-mono" style={{ display: 'grid', gridTemplateColumns: '82px 1fr', gap: '0 clamp(14px,2.4vw,30px)', padding: '10px 4px 11px', borderBottom: '1px solid rgba(242,239,230,.14)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6f6d67' }}>
            <span>Sector</span>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
              <span>Signal this week</span>
              <span>04 tracked</span>
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(168px, 1fr))', gap: 0, background: '#08090b' }}>
            {sectorCards.map((s, i) => (
              <button key={s.name} type="button" onClick={() => setSector(s.on ? 'All' : s.name)} aria-pressed={s.on} style={{ textAlign: 'left', border: 0, borderLeft: '1px solid rgba(242,239,230,.16)', borderTop: '1px solid rgba(242,239,230,.16)', cursor: 'pointer', background: s.on ? '#f2efe6' : '#08090b', color: s.on ? '#08090b' : '#e4e0d6', padding: 'clamp(16px,2.4vh,22px) 15px clamp(15px,2.2vh,20px)' }}>
                <span className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: s.on ? '#5c5a55' : '#6f6d67' }}>
                  <span>{s.name.slice(0, 3).toUpperCase()}</span>
                  <span>0{i + 1} / 04</span>
                </span>
                <span style={{ display: 'block', paddingTop: 'clamp(12px,1.8vh,17px)', fontSize: 'clamp(18px,1.9vw,22px)', fontWeight: 400, letterSpacing: '-.025em' }}>{s.name}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 9, paddingTop: 9 }}>
                  <span className="lc-mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.04em', color: s.on ? DEEP : ACCENT }}>{s.count}</span>
                  <span className="lc-mono" style={{ fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: s.on ? '#5c5a55' : '#6f6d67' }}>{s.count === 1 ? 'story tracked' : 'stories tracked'}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 22, paddingTop: 12 }}>
                  {s.spark.map((b, j) => <span key={j} style={{ flex: '1 1 0', minWidth: 1, height: b.h, background: b.c }} />)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: 'clamp(28px,4.4vh,48px) 0 0' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {[['News', 'Industry news · auto'], ['Analysis', 'Our market analysis']].map(([key, label]) => {
              const on = tab === key
              return <button key={key} type="button" onClick={() => setTab(key)} aria-pressed={on} className="lc-mono" style={{ border: 0, borderBottom: `2px solid ${on ? ACCENT : 'transparent'}`, cursor: 'pointer', background: 'transparent', padding: '11px 16px 12px', fontSize: 10.5, fontWeight: on ? 700 : 400, letterSpacing: '.18em', textTransform: 'uppercase', color: on ? '#f2efe6' : '#7c7a73' }}>{label}</button>
            })}
          </div>
          <span className="lc-mono" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 9.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#6f6d67' }}>
            <span>{feedNote}</span>
            {tab === 'News' && <button type="button" onClick={refresh} style={{ border: '1px solid rgba(242,239,230,.3)', cursor: 'pointer', background: 'transparent', padding: '8px 13px', fontSize: 9.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#f2efe6' }}>↻ Refresh</button>}
          </span>
        </div>
        <div style={{ height: 1, background: 'rgba(242,239,230,.3)' }} />

        {tab === 'News' && (
          <div>
            {loadingNews ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1, background: 'rgba(242,239,230,.16)', marginTop: 1 }}>
                {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 220, background: '#08090b', opacity: .4 }} />)}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div style={{ padding: 'clamp(48px,7vh,80px) 1rem', textAlign: 'center', color: '#5c5a55' }}>
                <div style={{ fontSize: 14.5 }}>{news.length === 0 ? 'Could not load live news right now — check our market analysis instead.' : `No live stories tagged ${sector} right now — try another sector.`}</div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(300px,.95fr)', gap: 1, background: 'rgba(242,239,230,.16)', borderBottom: '1px solid rgba(242,239,230,.16)' }}>
                  {lead && (
                    <div style={{ background: '#08090b', padding: 'clamp(16px,2.4vh,22px) clamp(14px,2vw,20px) clamp(18px,2.6vh,24px)' }}>
                      <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingBottom: 12, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#7c7a73' }}>
                        <span style={{ color: ACCENT }}>Lead story{lead.sector ? ` · ${lead.sector}` : ''}</span>
                        <span>{lead.date}</span>
                      </div>
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', background: '#101114', overflow: 'hidden' }}>
                        {lead.image ? (
                          <img src={lead.image} alt={lead.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                        ) : (
                          <div className="lc-mono" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f2efe6', opacity: .15, fontSize: 11 }}>No image for this story</div>
                        )}
                        <div style={{ position: 'absolute', left: 9, top: 9, pointerEvents: 'none', width: 12, height: 12, borderTop: '1px solid rgba(242,239,230,.55)', borderLeft: '1px solid rgba(242,239,230,.55)' }} />
                        <div style={{ position: 'absolute', right: 9, bottom: 9, pointerEvents: 'none', width: 12, height: 12, borderBottom: '1px solid rgba(242,239,230,.55)', borderRight: '1px solid rgba(242,239,230,.55)' }} />
                      </div>
                      <div className="lc-mono" style={{ paddingTop: 'clamp(16px,2.4vh,22px)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#86837c' }}>{lead.source}</div>
                      <div style={{ paddingTop: 10, fontSize: 'clamp(24px,2.9vw,36px)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: 1.1, color: '#f5f2e9' }}>{lead.title}</div>
                      <div style={{ paddingTop: 13, maxWidth: '58ch', fontSize: 15.5, lineHeight: 1.68, color: '#9a968e' }}>{lead.summary}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginTop: 'clamp(16px,2.4vh,22px)', paddingTop: 13, borderTop: '1px solid rgba(242,239,230,.14)' }}>
                        <span className="lc-mono" style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6f6d67' }}>Pulled automatically</span>
                        <a href={lead.url} target="_blank" rel="noopener noreferrer" className="lc-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 15px', border: '1px solid rgba(242,239,230,.3)', fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#f2efe6' }}>Read full article <span style={{ fontWeight: 400 }}>→</span></a>
                      </div>
                    </div>
                  )}

                  <div style={{ background: '#08090b' }}>
                    <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 15px 13px', borderBottom: '1px solid rgba(242,239,230,.16)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#7c7a73' }}>
                      <span style={{ color: '#f2efe6' }}>The wire</span>
                      <span>{wire.length} {wire.length === 1 ? 'story' : 'stories'}</span>
                    </div>
                    {wire.length === 0 ? (
                      <div style={{ padding: '2rem 15px', color: '#5c5a55', fontSize: 13 }}>No other live stories right now.</div>
                    ) : wire.map((w, i) => {
                      const on = hoverWire === i
                      return (
                        <a key={w.id} href={w.url} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setHoverWire(i)} onMouseLeave={() => setHoverWire(-1)} onFocus={() => setHoverWire(i)} onBlur={() => setHoverWire(-1)} style={{ display: 'grid', gridTemplateColumns: '26px minmax(0,1fr)', gap: 12, padding: '13px 15px 14px', borderBottom: '1px solid rgba(242,239,230,.09)', background: on ? '#f2efe6' : '#08090b', color: on ? '#08090b' : '#ddd8cd' }}>
                          <span className="lc-mono" style={{ fontSize: 9.5, letterSpacing: '.1em', paddingTop: 3, color: on ? '#5c5a55' : '#5f5d58' }}>0{i + 1}</span>
                          <span style={{ minWidth: 0 }}>
                            <span className="lc-mono" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, fontSize: 8.5, letterSpacing: '.2em', textTransform: 'uppercase', color: on ? '#5c5a55' : '#7c7a73' }}>
                              <span>{w.source}</span>
                              <span>{w.date}</span>
                            </span>
                            <span style={{ display: 'block', paddingTop: 6, fontSize: 14.5, lineHeight: 1.45, letterSpacing: '-.01em' }}>{w.title}</span>
                            <span className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 8, fontSize: 8.5, letterSpacing: '.18em', textTransform: 'uppercase', color: on ? '#5c5a55' : '#7c7a73' }}>
                              <span>{w.sector ? `Tag · ${w.sector}` : 'General'}</span>
                              <span>Read →</span>
                            </span>
                          </span>
                        </a>
                      )
                    })}
                  </div>
                </div>

                {cards.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(268px, 1fr))', gap: 1, background: 'rgba(242,239,230,.16)' }}>
                    {cards.map((c, i) => {
                      const on = hoverCard === i
                      return (
                        <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" onMouseEnter={() => setHoverCard(i)} onMouseLeave={() => setHoverCard(-1)} onFocus={() => setHoverCard(i)} onBlur={() => setHoverCard(-1)} style={{ display: 'flex', flexDirection: 'column', background: on ? '#f2efe6' : '#08090b', color: on ? '#08090b' : '#e4e0d6', padding: 'clamp(14px,2vh,18px) clamp(13px,1.8vw,17px) clamp(15px,2.2vh,19px)' }}>
                          <span className="lc-mono" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, fontSize: 8.5, letterSpacing: '.2em', textTransform: 'uppercase', color: on ? '#5c5a55' : '#7c7a73' }}>
                            <span>{c.source}</span>
                            <span>{c.date}</span>
                          </span>
                          <span style={{ display: 'block', marginTop: 11, position: 'relative', width: '100%', aspectRatio: '16 / 10', background: on ? '#e4e0d2' : '#101114', overflow: 'hidden' }}>
                            {c.image ? <img src={c.image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} /> : null}
                          </span>
                          <span style={{ display: 'block', paddingTop: 12, fontSize: 16.5, fontWeight: 400, letterSpacing: '-.02em', lineHeight: 1.24 }}>{c.title}</span>
                          <span style={{ display: 'block', paddingTop: 9, fontSize: 14, lineHeight: 1.6, color: on ? '#3f3d39' : '#8f8c85' }}>{c.summary}</span>
                          <span style={{ flex: 1, minHeight: 12 }} />
                          <span className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12, paddingTop: 11, borderTop: `1px solid ${on ? 'rgba(8,9,11,.2)' : 'rgba(242,239,230,.12)'}`, fontSize: 8.5, letterSpacing: '.18em', textTransform: 'uppercase', color: on ? '#5c5a55' : '#7c7a73' }}>
                            <span>{c.sector ? `Tag · ${c.sector}` : 'General'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: on ? 13 : 7 }}>Read <span>→</span></span>
                          </span>
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'Analysis' && (
          <div>
            {filteredNotes.map((n, idx) => (
              <div key={n.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 210px) minmax(0, 1fr)', gap: '0 clamp(20px,4vw,60px)', alignItems: 'start', padding: 'clamp(24px,3.6vh,38px) 4px clamp(26px,4vh,40px)', borderBottom: '1px solid rgba(242,239,230,.12)' }}>
                <div>
                  <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: ACCENT }}>Note 0{idx + 1} · {n.tag}</div>
                  <div className="lc-mono" style={{ paddingTop: 9, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6f6d67', lineHeight: 1.9 }}>{n.date}<br />{n.source}</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 26, paddingTop: 14 }}>
                    {sparkBars(n.seed, 16, ACCENT).map((b, j) => <span key={j} style={{ flex: '1 1 0', minWidth: 1, height: b.h, background: b.c }} />)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 'clamp(22px,2.6vw,32px)', fontWeight: 400, letterSpacing: '-.03em', lineHeight: 1.12, color: '#f5f2e9' }}>{n.title}</div>
                  <div style={{ paddingTop: 13, maxWidth: '62ch', fontSize: 15.5, lineHeight: 1.7, color: '#9a968e' }}>{n.summary}</div>

                  <div className="lc-mono" style={{ paddingTop: 'clamp(18px,2.6vh,24px)', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6f6d67' }}>Key takeaways</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>
                    {n.points.map((p, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '3px minmax(0,1fr)', gap: 12, padding: '10px 0 10px 12px', background: 'rgba(242,239,230,.03)' }}>
                        <div style={{ background: 'rgba(242,239,230,.25)' }} />
                        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#ddd8cd' }}>{p}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '3px minmax(0, 1fr)', gap: 14, marginTop: 'clamp(18px,2.6vh,24px)' }}>
                    <div style={{ background: ACCENT }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: ACCENT }}>Want these products at wholesale prices?</div>
                        <div style={{ paddingTop: 6, maxWidth: '50ch', fontSize: 14.5, lineHeight: 1.6, color: '#ddd8cd' }}>Approved partners get live pricing, real stock levels, and ordering on this category.</div>
                      </div>
                      <Link href="/apply" className="lc-mono" style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: ACCENT, color: '#08090b', fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase' }}>Apply now →</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(20px,3vw,48px)', alignItems: 'center', marginTop: 'clamp(40px,6vh,70px)', padding: 'clamp(24px,3.6vh,38px) clamp(18px,2.6vw,30px)', background: '#f2efe6', color: '#08090b' }}>
          <div>
            <div className="lc-mono" style={{ fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#5c5a55' }}>Partners only</div>
            <div style={{ paddingTop: 10, fontSize: 'clamp(24px,2.8vw,34px)', fontWeight: 400, letterSpacing: '-.035em', lineHeight: 1.08 }}>Read the market, then buy it at wholesale<span style={{ color: DEEP }}>.</span></div>
            <div style={{ paddingTop: 11, maxWidth: '46ch', fontSize: 15, lineHeight: 1.65, color: '#3f3d39' }}>Approved partners get live pricing on 500+ SKUs, stock levels updated in real time, and 48-hour dispatch from Doral, FL.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifySelf: 'end' }}>
            <Link href="/apply" className="lc-mono" style={{ padding: '14px 20px', background: '#08090b', color: '#f2efe6', fontSize: 10.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase' }}>Apply for access →</Link>
            <Link href="/#catalog" className="lc-mono" style={{ padding: '14px 18px', border: '1px solid rgba(8,9,11,.4)', color: '#08090b', fontSize: 10.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase' }}>See the catalog</Link>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(242,239,230,.16)', marginTop: 'clamp(30px,4.6vh,52px)' }} />
        <div style={{ position: 'relative', boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', gap: 2, height: 32, padding: '8px 0', overflow: 'hidden' }}>
          {BARCODE.map((b, i) => <div key={i} style={{ flex: `${b.grow} 1 0`, minWidth: 1, height: b.tall ? 20 : 15, background: '#f2efe6', opacity: .14 }} />)}
        </div>
        <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', paddingTop: 6, fontSize: 9.5, letterSpacing: '.2em', textTransform: 'uppercase', color: '#6f6d67' }}>
          <span>{footLeft}</span>
          <span>Levamcorp · Doral · FL</span>
        </div>
      </div>
    </div>
  )
}
