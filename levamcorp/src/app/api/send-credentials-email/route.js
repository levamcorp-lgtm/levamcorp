import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, password, businessName, contactName } = await request.json()

    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: [email],
      subject: `Your Levam Corp Portal Access — Login Credentials`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">
    <div style="background:#0d0d0d;padding:36px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td>
          <div style="font-size:17px;font-weight:500;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;line-height:1;">LEVAM</div>
          <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
          <div style="margin-top:14px;font-size:10px;color:#444;line-height:1.9;">6315 NW 99th Ave, Doral, FL 33178<br>partners@levamcorp.com · levamcorp.com</div>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <div style="display:inline-block;background:rgba(42,125,79,0.15);border:1px solid rgba(42,125,79,0.3);border-radius:3px;padding:6px 14px;">
            <span style="font-size:11px;color:#4aad6f;font-weight:600;letter-spacing:0.08em;">PORTAL ACCESS</span>
          </div>
        </td>
      </tr></table>
    </div>
    <div style="padding:36px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#2d7dd2;margin-bottom:10px;font-weight:600;">Your account is ready</div>
      <h1 style="font-size:22px;font-weight:600;color:#111;margin:0 0 16px;">Here are your login credentials</h1>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0;">Hi <strong style="color:#333;">${contactName || businessName}</strong>, your Levam Corp partner account has been created. Use the credentials below to access your private portal.</p>
    </div>
    <div style="padding:28px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#aaa;margin-bottom:16px;font-weight:600;">Your login credentials</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;background:#fff;border:1.5px solid #e5e7eb;border-radius:4px 4px 0 0;border-bottom:none;">
          <div style="font-size:10px;color:#aaa;margin-bottom:4px;letter-spacing:0.1em;text-transform:uppercase;">Email</div>
          <div style="font-size:15px;font-weight:600;color:#111;">${email}</div>
        </td></tr>
        <tr><td style="padding:12px 16px;background:#fff;border:1.5px solid #e5e7eb;border-radius:0 0 4px 4px;">
          <div style="font-size:10px;color:#aaa;margin-bottom:4px;letter-spacing:0.1em;text-transform:uppercase;">Temporary password</div>
          <div style="font-size:15px;font-weight:600;color:#111;letter-spacing:0.08em;">${password}</div>
        </td></tr>
      </table>
      <div style="margin-top:12px;padding:10px 14px;background:rgba(231,180,60,0.08);border:1px solid rgba(231,180,60,0.2);border-radius:3px;">
        <span style="font-size:12px;color:#854f0b;font-weight:500;">Please change your password after your first login.</span>
      </div>
    </div>
    <div style="padding:28px 40px;text-align:center;border-bottom:1px solid #ebebeb;">
      <a href="https://levamcorp.com/portal" style="display:inline-block;padding:14px 40px;background:#2d7dd2;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:3px;">Access Your Portal</a>
      <div style="margin-top:10px;font-size:11px;color:#bbb;">levamcorp.com/portal</div>
    </div>
    <div style="padding:24px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#aaa;margin-bottom:14px;font-weight:600;">Once inside your portal</div>
      <div style="margin-bottom:10px;"><span style="color:#2d7dd2;margin-right:10px;font-weight:700;">✓</span><span style="font-size:13px;color:#555;">Browse our full product catalog with wholesale pricing</span></div>
      <div style="margin-bottom:10px;"><span style="color:#2d7dd2;margin-right:10px;font-weight:700;">✓</span><span style="font-size:13px;color:#555;">Generate quotes and invoices automatically</span></div>
      <div style="margin-bottom:10px;"><span style="color:#2d7dd2;margin-right:10px;font-weight:700;">✓</span><span style="font-size:13px;color:#555;">Track your orders in real time</span></div>
      <div><span style="color:#2d7dd2;margin-right:10px;font-weight:700;">✓</span><span style="font-size:13px;color:#555;">Download invoices and order history anytime</span></div>
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
    console.error('Credentials email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
