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
    // Download image
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    if (!res.ok) return null

    const buffer      = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const ext         = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const fileName    = `imported/${Date.now()}-${productName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40)}.${ext}`

    const { data, error } = await supabaseAdmin.storage
      .from('product-images')
      .upload(fileName, buffer, { contentType, upsert: false })

    if (error) return null

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch {
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

Search for this product listing and extract ALL available information:
${url}

CRITICAL: You MUST find the main product image URL. It should be a direct link to a JPG, PNG, or WEBP image.
- For Amazon: look for the main image in the image gallery, usually from images-na.ssl-images-amazon.com or m.media-amazon.com
- For Walmart: look for the main product image URL from i5.walmartimages.com

Also find the UPC (12-digit barcode), EAN (13-digit), and ASIN if available.

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "name": "Full product name exactly as listed",
  "brand": "Brand name only",
  "sku": "Model number or SKU",
  "asin": "ASIN if Amazon (starts with B0), empty string otherwise",
  "upc": "12 or 13 digit barcode number, empty string if not found",
  "image_url": "Direct URL to the main product image (must end in .jpg, .jpeg, .png, or .webp or contain these extensions), empty string if not found",
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

    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Could not extract product data. Make sure the URL is a direct product page.' }, { status: 422 })
    }

    const product = JSON.parse(jsonMatch[0])

    // Clean UPC
    if (product.upc) {
      product.upc = product.upc.replace(/[^0-9]/g, '')
      if (product.upc.length < 8) product.upc = ''
    }

    // Download and upload image to Supabase Storage
    if (product.image_url) {
      const uploadedUrl = await downloadAndUploadImage(product.image_url, product.name || 'product')
      if (uploadedUrl) {
        product.image_url = uploadedUrl
        product.image_uploaded = true
      } else {
        // Keep original URL as fallback
        product.image_uploaded = false
      }
    }

    return Response.json({ success: true, product })

  } catch (error) {
    console.error('Scrape error:', error)
    return Response.json({ error: error.message || 'Failed to extract product data' }, { status: 500 })
  }
}
