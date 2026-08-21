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

    // Extract ASIN or Walmart ID from URL
    let productId = ''
    if (isAmazon) {
      const m = url.match(/\/dp\/([A-Z0-9]{10})/) || url.match(/\/gp\/product\/([A-Z0-9]{10})/)
      if (m) productId = m[1]
    } else {
      const m = url.match(/\/ip\/[^/]+\/(\d+)/)
      if (m) productId = m[1]
    }

    const prompt = `Visit this EXACT product page URL and extract the product information:

URL: ${url}

IMPORTANT: 
- You MUST fetch this specific URL directly, do not search for similar products
- Extract information ONLY from this specific product page
- The product ID is: ${productId || 'check the URL'}
- Do not confuse this with other similar products

Return ONLY valid JSON (no markdown):
{
  "name": "exact product name from this page",
  "brand": "brand name",
  "sku": "model number from this specific product",
  "asin": "${isAmazon ? productId || '' : ''}",
  "upc": "12 or 13 digit barcode, empty string if not found",
  "image_url": "main product image URL from this page",
  "category": "one of: tvs, electronics, small appliances, kitchen appliances, gaming, audio & speakers, computers & laptops, phones & accessories, cameras, smart home, appliances, other",
  "description": "2-3 sentence description of THIS specific product",
  "weight": "weight in lbs, number only",
  "dimensions": "LxWxH inches",
  "amazon_url": "${isAmazon ? url : ''}",
  "walmart_url": "${isWalmart ? url : ''}",
  "model_number": "manufacturer model number",
  "color": "exact color of THIS product variant",
  "features": ["feature 1", "feature 2", "feature 3"]
}`

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search',
      }],
      messages: [{
        role:    'user',
        content: `Fetch and extract data from this EXACT URL: ${url}\n\n${prompt}`
      }],
    })

    let rawText = ''
    for (const block of response.content) {
      if (block.type === 'text') rawText += block.text
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Could not extract product data.' }, { status: 422 })
    }

    const product = JSON.parse(jsonMatch[0])

    // Clean UPC
    if (product.upc) {
      product.upc = product.upc.replace(/[^0-9]/g, '')
      if (product.upc.length < 8) product.upc = ''
    }

    if (isAmazon && productId && !product.asin) {
      product.asin = productId
    }

    return Response.json({ success: true, product })

  } catch (error) {
    console.error('Scrape error:', error)
    return Response.json({ error: error.message || 'Failed to extract product data' }, { status: 500 })
  }
}
