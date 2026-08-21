import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function downloadAndUploadImage(imageUrl, productName) {
  try {
    // Try multiple user agents
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.amazon.com/',
    }

    const res = await fetch(imageUrl, { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const buffer      = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const ext         = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const safeName    = (productName || 'product').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40)
    const fileName    = `imported/${Date.now()}-${safeName}.${ext}`

    const { error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, buffer, { contentType, upsert: false })

    if (error) throw new Error(error.message)

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (e) {
    console.warn('Image upload failed:', e.message)
    return null
  }
}

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

    // Try to upload image to Supabase
    if (product.image_url) {
      const uploaded = await downloadAndUploadImage(product.image_url, product.name)
      if (uploaded) {
        product.image_url      = uploaded
        product.image_uploaded = true
      } else {
        // Keep original URL — browser can load it directly
        product.image_uploaded = false
      }
    }

    return Response.json({ success: true, product })

  } catch (error) {
    console.error('Scrape error:', error)
    return Response.json({ error: error.message || 'Failed to extract product data' }, { status: 500 })
  }
}
