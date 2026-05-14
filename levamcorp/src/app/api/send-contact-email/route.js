import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { name, email, company, phone, message } = await request.json()
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    await resend.emails.send({
      from: 'Levam Corp Website <partners@levamcorp.com>',
      to: ['partners@levamcorp.com'],
      subject: `📩 New contact message — ${name}${company ? ' · ' + company : ''}`,
      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);">
    <div style="background:#0d0d0d;padding:28px 40px;">
      <div style="font-size:17px;font-weight:500;letter-spacing:0.18em;color:#d0d0d0;text-transform:uppercase;">LEVAM</div>
      <div style="font-size:8px;letter-spacing:0.32em;color:#2d7dd2;text-transform:uppercase;margin-top:3px;">CORP · DISTRIBUTORS</div>
    </div>
    <div style="padding:28px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#2d7dd2;margin-bottom:10px;font-weight:600;">New contact message</div>
      <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 12px;">Someone reached out via levamcorp.com</h1>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0;">${message}</p>
    </div>
    <div style="padding:20px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Name</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:600;color:#111;text-align:right;">${name}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Email</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#2d7dd2;text-align:right;"><a href="mailto:${email}" style="color:#2d7dd2;text-decoration:none;">${email}</a></td></tr>
        ${company ? `<tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Company</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;text-align:right;">${company}</td></tr>` : ''}
        ${phone ? `<tr><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Phone</td><td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;text-align:right;">${phone}</td></tr>` : ''}
        <tr><td style="padding:6px 0;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.1em;">Date</td><td style="padding:6px 0;font-size:13px;color:#555;text-align:right;">${today}</td></tr>
      </table>
    </div>
    <div style="padding:20px 40px;text-align:center;border-bottom:1px solid #ebebeb;">
      <a href="mailto:${email}" style="display:inline-block;padding:12px 32px;background:#2d7dd2;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:3px;">Reply to ${name}</a>
    </div>
    <div style="background:#0d0d0d;padding:16px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;">Levam Corp Distributors · partners@levamcorp.com · levamcorp.com</div>
    </div>
  </div>
</body></html>`
    })
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
