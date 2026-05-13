import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, businessName, contactName } = await request.json()
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: [email],
      subject: `Application Received — ${businessName} · Levam Corp`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">
    <div style="background:#0d0d0d;padding:36px 40px;">
      <img src="https://levamcorp.com/levamcorp-logo_1.png" alt="Levam Corp" style="height:44px;display:block;margin-bottom:16px;" />
      <div style="font-size:17px;font-weight:600;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;">LEVAM</div>
      <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
      <div style="margin-top:14px;font-size:10px;color:#444;line-height:1.9;">6315 NW 99th Ave, Doral, FL 33178<br>partners@levamcorp.com · levamcorp.com</div>
    </div>
    <div style="padding:36px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#2d7dd2;margin-bottom:10px;font-weight:600;">Thank you for applying</div>
      <h1 style="font-size:22px;font-weight:700;color:#111;margin:0 0 16px;">We received your application!</h1>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0 0 12px;">Hi <strong>${contactName || businessName}</strong>, thank you for your interest in becoming a <strong>Levam Corp Distributors</strong> partner.</p>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0;">Our team reviews every application personally and will contact you at <strong>${email}</strong> within <strong>1–2 business days</strong> with a decision.</p>
    </div>
    <div style="padding:24px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Business</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#111;text-align:right;">${businessName}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Contact</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;text-align:right;">${contactName || '—'}</td></tr>
        <tr><td style="padding:6px 0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Date submitted</td><td style="padding:6px 0;font-size:13px;color:#555;text-align:right;">${today}</td></tr>
      </table>
    </div>
    <div style="background:#0d0d0d;padding:20px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;line-height:1.8;">Questions? <a href="mailto:partners@levamcorp.com" style="color:#2d7dd2;text-decoration:none;">partners@levamcorp.com</a><br>Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178</div>
    </div>
  </div>
</body>
</html>`
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Application email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
