import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

const PAYMENT_LABELS = { credit_card: 'Credit Card', debit_card: 'Debit Card', ach: 'ACH Transfer', wire: 'Wire Transfer' }

export async function POST(request) {
  try {
    const { token, paymentMethod, fulfillment, address, phone } = await request.json()
    if (!token || !paymentMethod || !fulfillment) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }
    if (fulfillment === 'shipping' && !address?.trim()) {
      return Response.json({ success: false, error: 'Shipping address is required' }, { status: 400 })
    }

    const { data: order } = await supabase.from('orders').select('id, order_number').eq('confirm_token', token).single()
    if (!order) return Response.json({ success: false, error: 'Order not found' }, { status: 404 })

    const { error } = await supabase.from('orders').update({
      confirmed_payment_method: paymentMethod,
      confirmed_fulfillment: fulfillment,
      confirmed_address: fulfillment === 'shipping' ? address.trim() : null,
      confirmed_phone: phone?.trim() || null,
      client_confirmed_at: new Date().toISOString(),
    }).eq('id', order.id)
    if (error) throw error

    resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: ['partners@levamcorp.com'],
      subject: `✓ Client confirmed order #${order.order_number}`,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#08090b;line-height:1.6;">
          <p>The client just confirmed order <strong>#${order.order_number}</strong>.</p>
          <p>
            Payment method: <strong>${PAYMENT_LABELS[paymentMethod] || paymentMethod}</strong><br/>
            Fulfillment: <strong>${fulfillment === 'pickup' ? 'Pickup — Doral, FL' : 'Shipping'}</strong>
            ${fulfillment === 'shipping' ? `<br/>Address: <strong>${address.trim()}</strong>` : ''}
            ${phone ? `<br/>Phone: <strong>${phone.trim()}</strong>` : ''}
          </p>
          <p>They also accepted that this order is final sale and non-refundable.</p>
          <p>Check the full record in the admin Orders page, Confirm tab.</p>
        </div>
      `,
    }).catch(() => {})

    return Response.json({ success: true, orderNumber: order.order_number })
  } catch (error) {
    console.error('confirm-order-submit error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
