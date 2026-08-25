import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    // Get top picks first, then fill with regular products up to 8
    const { data: topPicks } = await supabase
      .from('products')
      .select('id, name, brand, image_url, moq, category, is_top_pick')
      .eq('active', true)
      .eq('is_top_pick', true)
      .limit(8)

    let products = topPicks || []

    if (products.length < 8) {
      const { data: regular } = await supabase
        .from('products')
        .select('id, name, brand, image_url, moq, category, is_top_pick')
        .eq('active', true)
        .eq('is_top_pick', false)
        .limit(8 - products.length)
      products = [...products, ...(regular || [])]
    }

    return Response.json({ products })
  } catch (e) {
    return Response.json({ products: [] })
  }
}
