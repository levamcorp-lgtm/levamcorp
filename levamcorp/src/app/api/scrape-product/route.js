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

    // Clean URL to just the product ID
    let cleanUrl = url
    let productId = ''
    if (isAmazon) {
      const m = url.match(/\/dp\/([A-Z0-9]{10})/) || url.match(/\/gp\/product\/([A-Z0-9]{10})/)
      if (m) { productId = m[1]; cleanUrl = `https://www.amazon.com/dp/${productId}` }
    } else {
      const m = url.match(/\/ip\/[^/]+\/(\d+)/)
      if (m) { productId = m[1]; cleanUrl = `https://www.walmart.com/ip/${productId}` }
    }

    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role:    'user',
        content: `Go to ${cleanUrl} and return this JSON only, no markdown:
{"name":"","brand":"","sku":"","asin":"${productId || ''}","upc":"","image_url":"","category":"electronics","description":"","weight":"","dimensions":"","model_number":"","color":"","amazon_url":"${isAmazon ? cleanUrl : ''}","walmart_url":"${isWalmart ? cleanUrl : ''}","features":[]}`
      }],
    })

    let rawText = ''
    for (const block of response.content) {
      if (block.type === 'text') rawText += block.text
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ error: 'Could not extract product data.' }, { status: 422 })

    const product = JSON.parse(jsonMatch[0])

    if (product.upc) {
      product.upc = product.upc.replace(/[^0-9]/g, '')
      if (product.upc.length < 8) product.upc = ''
    }

    return Response.json({ success: true, product })

  } catch (error) {
    console.error('Scrape error:', error)
    return Response.json({ error: error.message || 'Failed to extract product data' }, { status: 500 })
  }
}
