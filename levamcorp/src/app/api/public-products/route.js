import { createClient } from '@supabase/supabase-js'

const CATALOG_SIZE = 10

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    // Get top picks first, then fill with regular products up to CATALOG_SIZE
    const { data: topPicks } = await supabase
      .from('products')
      .select('id, name, brand, image_url, moq, category, is_top_pick')
      .eq('active', true)
      .eq('is_top_pick', true)
      .limit(CATALOG_SIZE)

    let products = topPicks || []

    if (products.length < CATALOG_SIZE) {
      const { data: regular } = await supabase
        .from('products')
        .select('id, name, brand, image_url, moq, category, is_top_pick')
        .eq('active', true)
        .eq('is_top_pick', false)
        .limit(CATALOG_SIZE - products.length)
      products = [...products, ...(regular || [])]
    }

    return Response.json({ products })
  } catch (e) {
    return Response.json({ products: [] })
  }
}
