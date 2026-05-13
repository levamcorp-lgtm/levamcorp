import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const methodLabels = {
  ach: 'ACH Bank Transfer',
  wire: 'Wire Transfer',
  melio: 'Melio Pay',
  zelle: 'Zelle'
}

const methodDesc = {
  ach: 'ACH bank transfer (1–3 business days)',
  wire: 'Wire transfer (same day)',
  melio: 'Melio Pay (card or bank — we will send you a payment link)',
  zelle: 'Zelle (instant)'
}

export async function POST(request) {
  try {
    const { clientEmail, orderNumber, total, paymentMethod, items } = await request.json()
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const itemsRows = (items || []).map((item, i) => `
      <tr>
        <td style="padding:10px 12px;font-size:12px;font-weight:600;color:#222;border-bottom:1px solid #f0f0f0;">${item.product_name}</td>
        <td style="padding:10px 12px;font-size:12px;color:#666;text-align:right;border-bottom:1px solid #f0f0f0;">${item.quantity}</td>
        <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#111;text-align:right;border-bottom:1px solid #f0f0f0;">$${(item.unit_price * item.quantity)?.toLocaleString()}</td>
      </tr>
    `).join('')

    // Email to admin (you)
    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: ['partners@levamcorp.com'],
      subject: `💳 Payment Request — #${orderNumber} · ${methodLabels[paymentMethod]}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">
    <div style="background:#0d0d0d;padding:28px 40px;">
      <div style="font-size:17px;font-weight:500;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;">LEVAM</div>
      <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
    </div>
    <div style="padding:28px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#e74c3c;margin-bottom:10px;font-weight:600;">Action needed</div>
      <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 12px;">New payment request received</h1>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0;">A client has submitted a payment request for order <strong>#${orderNumber}</strong>.</p>
    </div>
    <div style="padding:20px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Client email</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#111;text-align:right;">${clientEmail}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Order #</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;text-align:right;">${orderNumber}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Amount due</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:15px;font-weight:700;color:#111;text-align:right;">$${total?.toLocaleString()}</td></tr>
        <tr><td style="padding:6px 0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Payment method</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#2d7dd2;text-align:right;">${methodLabels[paymentMethod]}</td></tr>
      </table>
    </div>
    ${itemsRows ? `
    <div style="padding:0 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <thead><tr style="background:#f7f8fa;">
          <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:8px 12px;text-align:left;font-weight:400;">Product</th>
          <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:8px 12px;text-align:right;font-weight:400;">Qty</th>
          <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:8px 12px;text-align:right;font-weight:400;">Total</th>
        </tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>
    </div>` : ''}
    <div style="padding:20px 40px;background:rgba(45,125,210,0.05);border-top:1px solid #ebebeb;">
      <div style="font-size:12px;color:#555;line-height:1.8;">
        <strong>Next step:</strong> Send payment instructions to <a href="mailto:${clientEmail}" style="color:#2d7dd2;">${clientEmail}</a>
        ${paymentMethod === 'melio' ? '<br>→ Generate a Melio payment link and send it to the client.' : ''}
        ${paymentMethod === 'ach' || paymentMethod === 'wire' ? '<br>→ Reply with your banking details (routing + account number).' : ''}
        ${paymentMethod === 'zelle' ? '<br>→ Reply with your Zelle email or phone number.' : ''}
      </div>
    </div>
    <div style="background:#0d0d0d;padding:16px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;">Levam Corp Distributors · partners@levamcorp.com</div>
    </div>
  </div>
</body>
</html>`
    })

    // Confirmation email to client
    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: [clientEmail],
      subject: `✓ Payment request received — Order #${orderNumber}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">
    <div style="background:#0d0d0d;padding:28px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <div style="font-size:17px;font-weight:500;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;">LEVAM</div>
          <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
          <div style="margin-top:12px;font-size:10px;color:#444;line-height:1.9;">6315 NW 99th Ave, Doral, FL 33178<br>partners@levamcorp.com</div>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <div style="display:inline-block;background:rgba(42,125,79,0.15);border:1px solid rgba(42,125,79,0.3);border-radius:3px;padding:6px 14px;">
            <span style="font-size:11px;color:#4aad6f;font-weight:600;">✓ RECEIVED</span>
          </div>
        </td>
      </tr></table>
    </div>
    <div style="padding:32px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#2d7dd2;margin-bottom:10px;font-weight:600;">Payment request confirmed</div>
      <h1 style="font-size:22px;font-weight:600;color:#111;margin:0 0 14px;">We received your payment request</h1>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0;">Our team will send you the payment instructions for <strong>${methodLabels[paymentMethod]}</strong> within <strong>1 business day</strong>.</p>
    </div>
    <div style="padding:20px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Order #</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#111;text-align:right;">${orderNumber}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Amount due</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:15px;font-weight:700;color:#111;text-align:right;">$${total?.toLocaleString()}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Payment method</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#2d7dd2;text-align:right;">${methodLabels[paymentMethod]}</td></tr>
        <tr><td style="padding:6px 0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Date</td><td style="padding:6px 0;font-size:13px;color:#555;text-align:right;">${today}</td></tr>
      </table>
    </div>
    <div style="padding:20px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:12px;font-weight:600;">What happens next</div>
      <div style="display:flex;gap:14px;margin-bottom:12px;"><div style="width:26px;height:26px;background:rgba(45,125,210,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;color:#2d7dd2;">1</div><div style="font-size:13px;color:#555;line-height:1.6;">Our team reviews your payment request and prepares the instructions.</div></div>
      <div style="display:flex;gap:14px;margin-bottom:12px;"><div style="width:26px;height:26px;background:rgba(45,125,210,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;color:#2d7dd2;">2</div><div style="font-size:13px;color:#555;line-height:1.6;">You receive the payment instructions at <strong>${clientEmail}</strong> within 1 business day.</div></div>
      <div style="display:flex;gap:14px;"><div style="width:26px;height:26px;background:rgba(45,125,210,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;color:#2d7dd2;">3</div><div style="font-size:13px;color:#555;line-height:1.6;">Complete the payment and your order will be confirmed and dispatched.</div></div>
    </div>
    <div style="background:#0d0d0d;padding:18px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;line-height:1.8;">Questions? <a href="mailto:partners@levamcorp.com" style="color:#2d7dd2;text-decoration:none;">partners@levamcorp.com</a><br>Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178</div>
    </div>
  </div>
</body>
</html>`
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Payment request email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
