import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { token } = await request.json()
    if (!token) return Response.json({ found: false }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: order, error } = await supabase
      .from('orders')
      .select('order_number, total, submitted_at, notes, client_confirmed_at, confirmed_payment_method, confirmed_fulfillment, confirmed_address, confirmed_phone, confirm_bank_name, confirm_bank_account_name, confirm_bank_account_number, confirm_bank_routing, order_items(product_name, quantity, unit_price)')
      .eq('confirm_token', token)
      .single()

    if (error || !order) return Response.json({ found: false })
    return Response.json({ found: true, order })
  } catch (error) {
    console.error('confirm-order-lookup error:', error)
    return Response.json({ found: false }, { status: 500 })
  }
}
