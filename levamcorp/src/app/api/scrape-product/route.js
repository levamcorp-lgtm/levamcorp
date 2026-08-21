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

Search for this product listing and extract ALL available information including UPC/EAN/barcode numbers:
${url}

IMPORTANT: The UPC (Universal Product Code) is a 12-digit number. The EAN is a 13-digit number. 
Look carefully in the product details section, specifications table, or "Additional Information" section for these numbers.
Also look for ASIN (Amazon Standard Identification Number) if it's an Amazon listing.

Return ONLY a valid JSON object (no markdown, no backticks, no explanation, just raw JSON):
{
  "name": "Full product name exactly as listed",
  "brand": "Brand name only",
  "sku": "Model number or SKU",
  "asin": "ASIN if Amazon listing (starts with B0), empty string otherwise",
  "upc": "12-digit UPC barcode number, or 13-digit EAN, empty string if not found",
  "category": "One of: tvs, electronics, small appliances, kitchen appliances, gaming, audio & speakers, computers & laptops, phones & accessories, cameras, smart home, appliances, other",
  "description": "Full product description 2-4 sentences",
  "weight": "Weight in lbs, number only, empty string if not found",
  "dimensions": "L x W x H inches, empty string if not found",
  "amazon_url": "${isAmazon ? url : ''}",
  "walmart_url": "${isWalmart ? url : ''}",
  "model_number": "Manufacturer model number, empty string if not found",
  "color": "Color or empty string",
  "features": ["key feature 1", "key feature 2", "key feature 3"],
  "source": "${isAmazon ? 'amazon' : 'walmart'}"
}`

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 2000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    })

    let rawText = ''
    for (const block of response.content) {
      if (block.type === 'text') rawText += block.text
    }

    // Clean and parse JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Could not extract product data. Make sure the URL is a direct product page.' }, { status: 422 })
    }

    const product = JSON.parse(jsonMatch[0])

    // Clean UPC — remove spaces and dashes, keep only digits
    if (product.upc) {
      product.upc = product.upc.replace(/[^0-9]/g, '')
      if (product.upc.length < 8) product.upc = '' // invalid
    }

    return Response.json({ success: true, product })

  } catch (error) {
    console.error('Scrape error:', error)
    return Response.json({ error: error.message || 'Failed to extract product data' }, { status: 500 })
  }
}
