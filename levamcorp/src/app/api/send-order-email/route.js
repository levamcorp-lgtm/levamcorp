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

    const { data, error } = await resend.emails.send({
      from: 'Levam Corp Distributors <onboarding@resend.dev>',
      to: ['levamcorp@gmail.com'],
      subject: `✓ Order Received #${invoiceNum} — Levam Corp Distributors`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation — Levam Corp</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">

    <!-- ===== DARK HEADER ===== -->
    <div style="background:#0d0d0d;padding:36px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <!-- Logo text recreation -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;vertical-align:middle;">
                  <div style="width:32px;height:32px;position:relative;display:inline-block;">
                    <div style="width:2px;height:26px;background:#3a3a3a;position:absolute;left:8px;top:0;"></div>
                    <div style="width:18px;height:2px;background:#3a3a3a;position:absolute;left:8px;bottom:0;"></div>
                    <div style="width:11px;height:2.5px;background:#2d7dd2;position:absolute;left:12px;bottom:7px;"></div>
                  </div>
                </td>
                <td style="vertical-align:middle;">
                  <div style="font-size:17px;font-weight:500;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;line-height:1;">LEVAM</div>
                  <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
                </td>
              </tr>
            </table>
            <div style="margin-top:16px;font-size:10px;color:#444;line-height:1.9;">
              6315 NW 99th Ave, Doral, FL 33178<br>
              partners@levamcorp.com &nbsp;·&nbsp; levamcorp.com<br>
              EIN: 88-0000000
            </div>
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

    <!-- ===== ORDER CONFIRMED BANNER ===== -->
    <div style="background:#2d7dd2;padding:18px 40px;display:flex;align-items:center;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="font-size:18px;color:#fff;margin-right:10px;">✓</span>
            <span style="font-size:14px;font-weight:600;color:#fff;letter-spacing:0.03em;">Order received — we'll confirm within 1–2 business days</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- ===== BILL TO / FROM ===== -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #ebebeb;">
      <tr>
        <td width="50%" style="padding:24px 40px;vertical-align:top;border-right:1px solid #ebebeb;">
          <div style="font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#bbb;margin-bottom:10px;">From</div>
          <div style="font-size:13px;font-weight:600;color:#111;margin-bottom:4px;">Levam Corp Distributors</div>
          <div style="font-size:12px;color:#666;line-height:1.8;">
            6315 NW 99th Ave<br>
            Doral, FL 33178<br>
            partners@levamcorp.com
          </div>
        </td>
        <td width="50%" style="padding:24px 40px;vertical-align:top;">
          <div style="font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#bbb;margin-bottom:10px;">Bill to</div>
          <div style="font-size:13px;font-weight:600;color:#111;margin-bottom:4px;">Approved Partner</div>
          <div style="font-size:12px;color:#666;line-height:1.8;">${clientEmail}</div>
        </td>
      </tr>
    </table>

    <!-- ===== ITEMS TABLE ===== -->
    <div style="padding:0 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <thead>
          <tr style="background:#f7f8fa;">
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:left;font-weight:400;">#</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:left;font-weight:400;">Product</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:left;font-weight:400;">SKU</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:right;font-weight:400;">Qty</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:right;font-weight:400;">Unit price</th>
            <th style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;padding:10px 12px;text-align:right;font-weight:400;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <!-- ===== TOTALS ===== -->
    <div style="padding:0 40px 24px;border-bottom:1px solid #ebebeb;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="text-align:right;padding:4px 0;">
            <span style="font-size:12px;color:#aaa;margin-right:32px;">Subtotal</span>
            <span style="font-size:12px;color:#666;">$${total?.toLocaleString()}</span>
          </td>
        </tr>
        <tr>
          <td style="text-align:right;padding:4px 0;">
            <span style="font-size:12px;color:#aaa;margin-right:32px;">Shipping</span>
            <span style="font-size:12px;color:#666;">TBD</span>
          </td>
        </tr>
        <tr>
          <td style="text-align:right;padding:14px 0 4px;border-top:1px solid #ebebeb;margin-top:10px;">
            <span style="font-size:15px;font-weight:600;color:#111;margin-right:32px;">Estimated Total</span>
            <span style="font-size:16px;font-weight:700;color:#111;">$${total?.toLocaleString()}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- ===== VIEW INVOICE BUTTON ===== -->
    <div style="padding:28px 40px;text-align:center;border-bottom:1px solid #ebebeb;">
      <a href="https://levamcorp-dkyd.vercel.app/portal/invoices" style="display:inline-block;padding:13px 36px;background:#2d7dd2;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:3px;">
        View &amp; Download Invoice
      </a>
      <div style="margin-top:10px;font-size:11px;color:#bbb;">Log in to your portal to print or save as PDF</div>
    </div>

    <!-- ===== LEGAL ===== -->
    <div style="background:#f7f8fa;padding:24px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#aaa;margin-bottom:10px;">Terms &amp; Conditions · Legal Notice</div>
      <p style="font-size:10px;color:#aaa;line-height:1.8;margin:0;">
        <strong style="color:#888;text-transform:uppercase;font-size:9px;">All Sales Are Final —</strong>
        All sales made by Levam Corp Distributors are final. Once an order has been confirmed, no returns, exchanges, refunds, or cancellations will be accepted under any circumstances. By submitting this order, the buyer acknowledges and agrees to this policy in full.
      </p>
      <p style="font-size:10px;color:#aaa;line-height:1.8;margin:10px 0 0;">
        <strong style="color:#888;text-transform:uppercase;font-size:9px;">No Return Policy —</strong>
        Levam Corp Distributors does not accept returns for any reason. Claims regarding damaged goods must be reported in writing to partners@levamcorp.com within 48 hours of delivery.
      </p>
      <p style="font-size:10px;color:#aaa;line-height:1.8;margin:10px 0 0;">
        <strong style="color:#888;text-transform:uppercase;font-size:9px;">Governing Law —</strong>
        This agreement is governed by the laws of the State of Florida. Any disputes shall be resolved exclusively in the courts of Miami-Dade County, Florida.
      </p>
    </div>

    <!-- ===== SIGNATURE BLOCK ===== -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #ebebeb;">
      <tr>
        <td width="50%" style="padding:20px 40px;border-right:1px solid #ebebeb;">
          <div style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#bbb;margin-bottom:24px;">Authorized by · Levam Corp</div>
          <div style="border-top:1px solid #ddd;padding-top:6px;font-size:10px;color:#ccc;">Signature &amp; date</div>
        </td>
        <td width="50%" style="padding:20px 40px;">
          <div style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#bbb;margin-bottom:24px;">Accepted by · Client</div>
          <div style="border-top:1px solid #ddd;padding-top:6px;font-size:10px;color:#ccc;">Signature &amp; date</div>
        </td>
      </tr>
    </table>

    <!-- ===== FOOTER ===== -->
    <div style="background:#0d0d0d;padding:20px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;line-height:1.8;">
        Levam Corp Distributors &nbsp;·&nbsp; 6315 NW 99th Ave, Doral, FL 33178<br>
        <a href="mailto:partners@levamcorp.com" style="color:#2d7dd2;text-decoration:none;">partners@levamcorp.com</a>
        &nbsp;·&nbsp;
        <a href="https://levamcorp-dkyd.vercel.app" style="color:#2d7dd2;text-decoration:none;">levamcorp.com</a>
      </div>
    </div>

  </div>

</body>
</html>
      `
    })

    if (error) throw error
    return Response.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
