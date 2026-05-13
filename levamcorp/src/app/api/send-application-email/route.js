import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, businessName, contactName } = await request.json()
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    await resend.emails.send({
      from: 'Levam Corp Distributors <onboarding@resend.dev>',
      to: ['levamcorp@gmail.com'], // Change to: [email] after domain verified
      subject: `Application Received — ${businessName} · Levam Corp`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">

    <!-- DARK HEADER -->
    <div style="background:#0d0d0d;padding:36px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:17px;font-weight:500;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;">LEVAM</div>
            <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
            <div style="margin-top:14px;font-size:10px;color:#444;line-height:1.9;">
              6315 NW 99th Ave, Doral, FL 33178<br>
              partners@levamcorp.com · levamcorp.com
            </div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <div style="display:inline-block;background:rgba(45,125,210,0.15);border:1px solid rgba(45,125,210,0.3);border-radius:3px;padding:6px 14px;">
              <span style="font-size:11px;color:#2d7dd2;font-weight:600;letter-spacing:0.08em;">APPLICATION RECEIVED</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- MESSAGE -->
    <div style="padding:36px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#2d7dd2;margin-bottom:10px;">Thank you for applying</div>
      <h1 style="font-size:22px;font-weight:500;color:#111;margin:0 0 16px;">We received your application!</h1>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0 0 12px;">
        Hi <strong style="color:#333;">${contactName || businessName}</strong>, thank you for your interest in becoming a <strong style="color:#333;">Levam Corp Distributors</strong> partner.
      </p>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0;">
        Our team reviews every application personally and will contact you at <strong style="color:#333;">${email}</strong> within <strong style="color:#333;">1–2 business days</strong> with a decision.
      </p>
    </div>

    <!-- DETAILS -->
    <div style="padding:24px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:10px;color:#aaa;letter-spacing:0.1em;text-transform:uppercase;">Business</span>
            <span style="float:right;font-size:13px;font-weight:600;color:#111;">${businessName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;">
            <span style="font-size:10px;color:#aaa;letter-spacing:0.1em;text-transform:uppercase;">Contact</span>
            <span style="float:right;font-size:13px;color:#555;">${contactName || '—'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;">
            <span style="font-size:10px;color:#aaa;letter-spacing:0.1em;text-transform:uppercase;">Date submitted</span>
            <span style="float:right;font-size:13px;color:#555;">${today}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- WHAT'S NEXT -->
    <div style="padding:28px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#aaa;margin-bottom:16px;">What happens next</div>
      ${[
        ['1', 'Our team reviews your application', 'We personally review every application within 1–2 business days.'],
        ['2', 'You receive a decision', 'We will email you at ' + email + ' with our decision.'],
        ['3', 'Get portal access', 'If approved, you receive your login credentials to access our private catalog.'],
      ].map(([num, title, desc]) => `
        <div style="display:flex;gap:16px;margin-bottom:16px;">
          <div style="width:28px;height:28px;background:rgba(45,125,210,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <span style="font-size:12px;font-weight:600;color:#2d7dd2;">${num}</span>
          </div>
          <div>
            <div style="font-size:13px;font-weight:600;color:#333;margin-bottom:3px;">${title}</div>
            <div style="font-size:12px;color:#888;line-height:1.6;">${desc}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- FOOTER -->
    <div style="background:#0d0d0d;padding:20px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;line-height:1.8;">
        Questions? Contact us at <a href="mailto:partners@levamcorp.com" style="color:#2d7dd2;text-decoration:none;">partners@levamcorp.com</a><br>
        Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178
      </div>
    </div>

  </div>
</body>
</html>
      `
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Application email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
