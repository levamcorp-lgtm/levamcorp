import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { order, items, clientEmail, invoiceNum, total } = await request.json()

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const validDate = new Date(); validDate.setDate(validDate.getDate() + 15)
    const dueDate = validDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    const itemsRows = items.map((item, i) => `
      <tr>
        <td style="padding:10px 12px;font-size:12px;color:#666;border-bottom:1px solid #f0f0f0;">${i+1}</td>
        <td style="padding:10px 12px;font-size:12px;font-weight:600;color:#222;border-bottom:1px solid #f0f0f0;">${item.product_name}</td>
        <td style="padding:10px 12px;font-size:11px;color:#999;border-bottom:1px solid #f0f0f0;">${item.product_sku}</td>
        <td style="padding:10px 12px;font-size:12px;color:#555;text-align:right;border-bottom:1px solid #f0f0f0;">${item.quantity}</td>
        <td style="padding:10px 12px;font-size:12px;color:#555;text-align:right;border-bottom:1px solid #f0f0f0;">$${item.unit_price?.toLocaleString()}</td>
        <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#111;text-align:right;border-bottom:1px solid #f0f0f0;">$${(item.unit_price * item.quantity)?.toLocaleString()}</td>
      </tr>
    `).join('')

    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: [clientEmail],
      subject: `✓ Order Received #${invoiceNum} — Levam Corp Distributors`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">
    <div style="background:#0d0d0d;padding:36px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:17px;font-weight:500;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;line-height:1;">LEVAM</div>
            <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
            <div style="margin-top:14px;font-size:10px;color:#444;line-height:1.9;">6315 NW 99th Ave, Doral, FL 33178<br>partners@levamcorp.com · levamcorp.com</div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <div style="font-size:20px;font-weight:600;letter-spacing:0.12em;color:#ffffff;text-transform:uppercase;">INVOICE</div>
            <div style="font-size:14px;font-weight:600;color:#2d7dd2;margin-top:6px;">#${invoiceNum}</div>
            <div style="font-size:10px;color:#444;line-height:2.2;margin-top:10px;">
              <span style="color:#666;">Date:</span> ${today}<br>
              <span style="color:#666;">Due:</span> ${dueDate}<br>
              <span style="color:#666;">Terms:</span> Net 15
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div style="background:#2d7dd2;padding:18px 40px;">
      <span style="font-size:18px;color:#fff;margin-right:10px;">✓</span>
      <span style="font-size:14px;font-weight:600;color:#fff;letter-spacing:0.03em;">Order received — we'll confirm within 1–2 business days</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #ebebeb;">
      <tr>
        <td width="50%" style="padding:24px 40px;vertical-align:top;border-right:1px solid #ebebeb;">
          <div style="font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#bbb;margin-bottom:10px;">From</div>
          <div style="font-size:13px;font-weight:600;color:#111;margin-bottom:4px;">Levam Corp Distributors</div>
          <div style="font-size:12px;color:#666;line-height:1.8;">6315 NW 99th Ave<br>Doral, FL 33178<br>partners@levamcorp.com</div>
        </td>
        <td width="50%" style="padding:24px 40px;vertical-align:top;">
          <div style="font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#bbb;margin-bottom:10px;">Bill to</div>
          <div style="font-size:13px;font-weight:600;color:#111;margin-bottom:4px;">Approved Partner</div>
          <div style="font-size:12px;color:#666;line-height:1.8;">${clientEmail}</div>
        </td>
      </tr>
    </table>
    <div style="padding:0 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <thead>
          <tr style="background:#f7f8fa;">
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:left;font-weight:400;">#</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:left;font-weight:400;">Product</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:left;font-weight:400;">SKU</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:right;font-weight:400;">Qty</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:right;font-weight:400;">Price</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:right;font-weight:400;">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
    </div>
    <div style="padding:0 40px 24px;border-bottom:1px solid #ebebeb;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="text-align:right;padding:4px 0;"><span style="font-size:12px;color:#aaa;margin-right:32px;">Subtotal</span><span style="font-size:12px;color:#666;">$${total?.toLocaleString()}</span></td></tr>
        <tr><td style="text-align:right;padding:4px 0;"><span style="font-size:12px;color:#aaa;margin-right:32px;">Shipping</span><span style="font-size:12px;color:#666;">TBD</span></td></tr>
        <tr><td style="text-align:right;padding:14px 0 4px;border-top:1px solid #ebebeb;"><span style="font-size:15px;font-weight:600;color:#111;margin-right:32px;">Estimated Total</span><span style="font-size:16px;font-weight:700;color:#111;">$${total?.toLocaleString()}</span></td></tr>
      </table>
    </div>
    <div style="padding:28px 40px;text-align:center;border-bottom:1px solid #ebebeb;">
      <a href="https://levamcorp.com/portal/invoices" style="display:inline-block;padding:13px 36px;background:#2d7dd2;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:3px;">View &amp; Download Invoice</a>
      <div style="margin-top:10px;font-size:11px;color:#bbb;">Log in to your portal to print or save as PDF</div>
    </div>
    <div style="padding:20px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:10px;">Terms &amp; Conditions</div>
      <p style="font-size:10px;color:#aaa;line-height:1.8;margin:0;"><strong style="color:#888;text-transform:uppercase;font-size:9px;">All Sales Are Final —</strong> All sales made by Levam Corp Distributors are final. Once an order has been confirmed, no returns, exchanges, refunds, or cancellations will be accepted. Governed by the laws of the State of Florida, Miami-Dade County courts.</p>
    </div>
    <div style="background:#0d0d0d;padding:20px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;line-height:1.8;">Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178<br><a href="mailto:partners@levamcorp.com" style="color:#2d7dd2;text-decoration:none;">partners@levamcorp.com</a> · <a href="https://levamcorp.com" style="color:#2d7dd2;text-decoration:none;">levamcorp.com</a></div>
    </div>
  </div>
</body>
</html>`
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
