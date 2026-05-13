import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, businessName, contactName } = await request.json()

    await resend.emails.send({
      from: 'Levam Corp Distributors <onboarding@resend.dev>',
      to: ['levamcorp@gmail.com'], // Change to: [email] after domain verified
      subject: `✓ Your application has been approved — Levam Corp Distributors`,
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
            <div style="font-size:17px;font-weight:500;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;"><img src="https://levamcorp.com/levamcorp-logo_1.png" alt="Levam Corp" style="height:44px;display:block;margin-bottom:14px;" />LEVAM</div>
            <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
            <div style="margin-top:14px;font-size:10px;color:#444;line-height:1.9;">
              6315 NW 99th Ave, Doral, FL 33178<br>
              partners@levamcorp.com · levamcorp.com
            </div>
          </td>
          <td style="text-align:right;vertical-align:top;">
            <div style="display:inline-block;background:rgba(42,125,79,0.15);border:1px solid rgba(42,125,79,0.3);border-radius:3px;padding:6px 14px;">
              <span style="font-size:11px;color:#4aad6f;font-weight:600;letter-spacing:0.08em;">✓ APPROVED</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- MESSAGE -->
    <div style="padding:36px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#2a7d4f;margin-bottom:10px;">Congratulations!</div>
      <h1 style="font-size:22px;font-weight:500;color:#111;margin:0 0 16px;">Your application has been approved!</h1>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0 0 12px;">
        Hi <strong style="color:#333;">${contactName || businessName}</strong>, great news! Your application to become a <strong style="color:#333;">Levam Corp Distributors</strong> partner has been approved.
      </p>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0;">
        Our team will be in touch shortly at <strong style="color:#333;">${email}</strong> with your login credentials so you can access our private catalog and start placing orders.
      </p>
    </div>

    <!-- WHAT YOU GET -->
    <div style="padding:28px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#aaa;margin-bottom:16px;">As an approved partner you get</div>
      ${[
        'Access to our full product catalog with wholesale pricing',
        'Automatic quote & invoice generation',
        'Real-time availability and dispatch times',
        'Dedicated support at partners@levamcorp.com',
      ].map(item => `
        <div style="display:flex;align-items:center;margin-bottom:10px;">
          <span style="color:#2d7dd2;margin-right:10px;font-size:16px;">✓</span>
          <span style="font-size:13px;color:#555;">${item}</span>
        </div>
      `).join('')}
    </div>

    <!-- NEXT STEPS -->
    <div style="padding:28px 40px;background:#fafafa;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#aaa;margin-bottom:12px;">Next steps</div>
      <p style="font-size:13px;color:#666;line-height:1.7;margin:0;">
        You will receive a separate email with your <strong style="color:#333;">login credentials</strong> shortly. Once you have them, visit your portal at:
      </p>
      <div style="margin-top:12px;padding:10px 16px;background:#fff;border:1px solid #ebebeb;border-radius:3px;font-size:13px;color:#2d7dd2;font-weight:600;">
        levamcorp-dkyd.vercel.app/portal
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#0d0d0d;padding:20px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;line-height:1.8;">
        Questions? <a href="mailto:partners@levamcorp.com" style="color:#2d7dd2;text-decoration:none;">partners@levamcorp.com</a><br>
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
    console.error('Approval email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
