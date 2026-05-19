import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { data } = await supabase
      .from('products')
      .select('id, name, brand, category, image_url, stock')
      .eq('active', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false })
      .limit(8)

    return Response.json({ products: data || [] })
  } catch (error) {
    return Response.json({ products: [] })
  }
}
