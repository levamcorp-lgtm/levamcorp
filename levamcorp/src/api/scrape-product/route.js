import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request) {
  try {
    const { url } = await request.json()
    if (!url) return Response.json({ error: 'No URL provided' }, { status: 400 })

    const isAmazon  = url.includes('amazon.com')
    const isWalmart = url.includes('walmart.com')

    if (!isAmazon && !isWalmart) {
      return Response.json({ error: 'Only Amazon and Walmart URLs are supported' }, { status: 400 })
    }

    const prompt = `You are a product data extractor for a wholesale distribution company.

Search for and extract all product information from this listing:
${url}

Return ONLY a valid JSON object (no markdown, no backticks, no explanation):
{
  "name": "Full product name exactly as listed",
  "brand": "Brand name only",
  "sku": "Model number or SKU or ASIN",
  "category": "One of: tvs, electronics, small appliances, kitchen appliances, gaming, audio & speakers, computers & laptops, phones & accessories, cameras, smart home, appliances, other",
  "description": "Full product description 2-4 sentences",
  "weight": "Weight in lbs, number only, or empty string",
  "dimensions": "L x W x H inches or empty string",
  "amazon_url": "${isAmazon ? url : ''}",
  "walmart_url": "${isWalmart ? url : ''}",
  "model_number": "Model number or empty string",
  "upc": "UPC or EAN or empty string",
  "color": "Color or empty string",
  "features": ["key feature 1", "key feature 2", "key feature 3"],
  "source": "${isAmazon ? 'amazon' : 'walmart'}"
}`

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    })

    let rawText = ''
    for (const block of response.content) {
      if (block.type === 'text') rawText += block.text
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Could not extract product data. Make sure the URL is a direct product page.' }, { status: 422 })
    }

    const product = JSON.parse(jsonMatch[0])
    return Response.json({ success: true, product })

  } catch (error) {
    console.error('Scrape error:', error)
    return Response.json({ error: error.message || 'Failed to extract product data' }, { status: 500 })
  }
}
