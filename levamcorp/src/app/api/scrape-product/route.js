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

Search for this product listing and extract ALL information including the image URL:
${url}

For the image URL:
- Amazon images are usually from: https://m.media-amazon.com/images/ or https://images-na.ssl-images-amazon.com/images/
- Walmart images are usually from: https://i5.walmartimages.com/
- Get the LARGEST version of the main product image (look for _AC_SL1500_ or similar for Amazon)
- The URL must be a direct link to an image file

Return ONLY valid JSON (no markdown, no backticks):
{
  "name": "Full product name",
  "brand": "Brand name",
  "sku": "Model number or SKU",
  "asin": "ASIN if Amazon, empty string otherwise",
  "upc": "12 or 13 digit barcode, empty string if not found",
  "image_url": "Direct URL to main product image",
  "category": "One of: tvs, electronics, small appliances, kitchen appliances, gaming, audio & speakers, computers & laptops, phones & accessories, cameras, smart home, appliances, other",
  "description": "Product description 2-4 sentences",
  "weight": "Weight in lbs, number only, empty string if not found",
  "dimensions": "L x W x H inches, empty string if not found",
  "amazon_url": "${isAmazon ? url : ''}",
  "walmart_url": "${isWalmart ? url : ''}",
  "model_number": "Model number, empty string if not found",
  "color": "Color, empty string if not applicable",
  "features": ["feature 1", "feature 2", "feature 3"],
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

    // Use image URL directly — Amazon/Walmart CDN URLs work fine in the browser
    product.image_uploaded = false
    product.image_source   = product.image_url ? 'external' : 'none'

    return Response.json({ success: true, product })

  } catch (error) {
    console.error('Scrape error:', error)
    return Response.json({ error: error.message || 'Failed to extract product data' }, { status: 500 })
  }
}
