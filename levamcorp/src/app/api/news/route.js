export async function GET() {
  try {
    const apiKey = process.env.NEWS_API_KEY
    const queries = [
      'consumer electronics wholesale',
      'Amazon FBA sellers trending products',
      'smart home appliances market 2025',
      'e-commerce wholesale distribution',
    ]
    const query = queries[Math.floor(Math.random() * queries.length)]
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    if (data.status !== 'ok') throw new Error('NewsAPI error')

    const articles = (data.articles || [])
      .filter(a => a.title && a.description && a.urlToImage && !a.title.includes('[Removed]'))
      .slice(0, 8)
      .map(a => ({
        id: a.url,
        title: a.title,
        summary: a.description,
        image: a.urlToImage,
        source: a.source?.name || 'News',
        date: new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        url: a.url,
      }))

    return Response.json({ articles })
  } catch (error) {
    return Response.json({ articles: [] })
  }
}
