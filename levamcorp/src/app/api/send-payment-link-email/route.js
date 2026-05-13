import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { clientEmail, orderNumber, total, paymentMethod, paymentLink, bankDetails, notes } = await request.json()
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const methodLabels = {
      ach: 'ACH Bank Transfer', wire: 'Wire Transfer',
      melio: 'Melio Pay', zelle: 'Zelle'
    }

    const paymentSection = paymentMethod === 'melio' && paymentLink ? `
      <div style="padding:24px 40px;border-bottom:1px solid #ebebeb;text-align:center;">
        <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:14px;font-weight:600;">Pay now</div>
        <a href="${paymentLink}" style="display:inline-block;padding:14px 44px;background:#2d7dd2;color:#fff;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:3px;box-shadow:0 4px 14px rgba(45,125,210,0.35);">Pay $${total?.toLocaleString()} via Melio →</a>
        <div style="margin-top:10px;font-size:11px;color:#bbb;">Click above to complete your payment securely</div>
      </div>
    ` : bankDetails ? `
      <div style="padding:24px 40px;border-bottom:1px solid #ebebeb;">
        <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:14px;font-weight:600;">Payment instructions — ${methodLabels[paymentMethod]}</div>
        <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:4px;padding:16px 20px;font-size:13px;color:#333;line-height:2;white-space:pre-wrap;">${bankDetails}</div>
        <div style="margin-top:12px;padding:10px 14px;background:rgba(231,180,60,0.08);border:1px solid rgba(231,180,60,0.2);border-radius:3px;font-size:12px;color:#854f0b;">
          ⚠ Please use order #${orderNumber} as your payment reference.
        </div>
      </div>
    ` : ''

    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: [clientEmail],
      subject: `💳 Payment Instructions — Order #${orderNumber} · $${total?.toLocaleString()}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">

    <!-- HEADER -->
    <div style="background:#0d0d0d;padding:36px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <div style="font-size:17px;font-weight:500;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;line-height:1;">LEVAM</div>
          <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
          <div style="margin-top:14px;font-size:10px;color:#444;line-height:1.9;">6315 NW 99th Ave, Doral, FL 33178<br>partners@levamcorp.com · levamcorp.com</div>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <div style="display:inline-block;background:rgba(45,125,210,0.15);border:1px solid rgba(45,125,210,0.3);border-radius:3px;padding:6px 14px;">
            <span style="font-size:11px;color:#2d7dd2;font-weight:600;letter-spacing:0.08em;">💳 PAYMENT DUE</span>
          </div>
        </td>
      </tr></table>
    </div>

    <!-- MESSAGE -->
    <div style="padding:32px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#2d7dd2;margin-bottom:10px;font-weight:600;">Payment instructions ready</div>
      <h1 style="font-size:22px;font-weight:700;color:#111;margin:0 0 14px;">Here are your payment details</h1>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0;">Your order <strong style="color:#333;">#${orderNumber}</strong> is confirmed. Please complete the payment using the instructions below.</p>
    </div>

    <!-- ORDER SUMMARY -->
    <div style="padding:20px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Order #</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#111;text-align:right;">${orderNumber}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Payment method</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#2d7dd2;text-align:right;">${methodLabels[paymentMethod]}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Date</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;text-align:right;">${today}</td></tr>
        <tr><td style="padding:8px 0 0;font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Total due</td><td style="padding:8px 0 0;font-size:20px;font-weight:800;color:#111;text-align:right;">$${total?.toLocaleString()}</td></tr>
      </table>
    </div>

    <!-- PAYMENT SECTION -->
    ${paymentSection}

    <!-- NOTES -->
    ${notes ? `
    <div style="padding:20px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:10px;font-weight:600;">Notes from our team</div>
      <p style="font-size:13px;color:#555;line-height:1.7;margin:0;">${notes}</p>
    </div>` : ''}

    <!-- TERMS -->
    <div style="padding:20px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:8px;font-weight:600;">Payment terms</div>
      <p style="font-size:10px;color:#aaa;line-height:1.8;margin:0;"><strong style="color:#888;">All Sales Are Final —</strong> Payment confirms your order. No returns, exchanges, or cancellations. Governed by the laws of the State of Florida.</p>
    </div>

    <!-- FOOTER -->
    <div style="background:#0d0d0d;padding:20px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;line-height:1.8;">Questions? <a href="mailto:partners@levamcorp.com" style="color:#2d7dd2;text-decoration:none;">partners@levamcorp.com</a><br>Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178</div>
    </div>

  </div>
</body>
</html>`
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Payment link email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
