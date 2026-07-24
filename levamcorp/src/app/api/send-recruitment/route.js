import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { emails, subject, customNote } = await req.json()
    if (!emails?.length) return Response.json({ error: 'No emails provided' }, { status: 400 })

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:32px 16px">

  <!-- HEADER -->
  <div style="background:#111;border-radius:10px 10px 0 0;padding:28px 32px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-size:10px;letter-spacing:0.25em;color:#555;text-transform:uppercase;margin-bottom:4px">Corp · Distributors</div>
      <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:0.12em">LEVAM<span style="color:#2d7dd2">CORP</span></div>
    </div>
    <div style="text-align:right;font-size:10px;color:#555;line-height:2">
      Doral, FL 33178<br>partners@levamcorp.com
    </div>
  </div>
  <div style="height:3px;background:#2d7dd2"></div>

  <!-- INTRO BADGE -->
  <div style="background:#fff;padding:36px 32px 28px;border-left:1px solid #eee;border-right:1px solid #eee;text-align:center">
    <div style="display:inline-block;background:rgba(45,125,210,0.07);border:0.5px solid rgba(45,125,210,0.2);color:#2d7dd2;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:5px 16px;border-radius:20px;margin-bottom:20px">Wholesale Partnership Opportunity</div>
    <h1 style="font-size:26px;font-weight:900;color:#111;margin:0 0 14px;letter-spacing:-0.02em;line-height:1.25">Grow your business with<br>wholesale electronics</h1>
    <p style="font-size:14px;color:#777;line-height:1.8;margin:0;max-width:440px;margin-left:auto;margin-right:auto">
      We partner with serious distributors, resellers, and retailers across the U.S. to provide premium wholesale pricing on electronics, home appliances, and kitchen products.
    </p>
  </div>

  <!-- WHO WE ARE -->
  <div style="background:#fff;border-left:1px solid #eee;border-right:1px solid #eee;padding:0 32px 28px">
    <div style="border-top:1px solid #f0f0f0;padding-top:24px">
      <div style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px">Who we are</div>
      <p style="font-size:13px;color:#555;line-height:1.85;margin:0">
        <strong style="color:#111">Levam Corp Distributors</strong> is a B2B wholesale distribution company based in <strong style="color:#111">Doral, FL</strong>. We source electronics and home goods directly from top brands — JBL, LG, Ninja, Shark, and more — and distribute them to approved business partners at competitive wholesale prices.
      </p>
      <p style="font-size:13px;color:#555;line-height:1.85;margin:16px 0 0">
        We are not a marketplace. Every partner is reviewed and approved personally. We work with a select group of serious businesses who value reliability, clear pricing, and long-term relationships.
      </p>
    </div>
  </div>

  <!-- HOW IT WORKS -->
  <div style="background:#fafafa;border:1px solid #eee;padding:24px 32px">
    <div style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:16px">How it works</div>
    <table style="width:100%;border-collapse:collapse">
      ${[
        ['01', 'Apply online', 'Submit your business information through our partner portal. We review every application within 1–2 business days.'],
        ['02', 'Get approved', 'Once approved, you receive exclusive access to our full wholesale catalog with live pricing and stock levels.'],
        ['03', 'Browse & order', 'Place orders directly through your private portal. Invoices and quotes are generated automatically.'],
        ['04', 'Fast dispatch', 'Orders ship from our Doral, FL warehouse with an average 48-hour dispatch time.'],
      ].map(([num, title, desc]) => `
        <tr>
          <td style="padding:10px 16px 10px 0;vertical-align:top;width:32px">
            <div style="width:28px;height:28px;background:#111;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;text-align:center;line-height:28px">${num}</div>
          </td>
          <td style="padding:10px 0;vertical-align:top;border-bottom:1px solid #f0f0f0">
            <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:3px">${title}</div>
            <div style="font-size:12px;color:#888;line-height:1.6">${desc}</div>
          </td>
        </tr>
      `).join('')}
    </table>
  </div>

  <!-- WHAT WE OFFER -->
  <div style="background:#fff;border-left:1px solid #eee;border-right:1px solid #eee;padding:24px 32px">
    <div style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:14px">What you get as a partner</div>
    <table style="width:100%;border-collapse:collapse">
      ${[
        ['Wholesale pricing', 'Direct access to market-competitive wholesale prices negotiated with suppliers.'],
        ['Private partner portal', 'Your own dashboard with live catalog, order tracking, invoices, and payment history.'],
        ['Dedicated support', 'A real team available Monday–Friday, 9AM–5PM ET. We speak English and Spanish.'],
        ['48h dispatch', 'Fast, reliable shipping from our warehouse in Doral, FL 33178.'],
        ['Flexible minimums', 'MOQ varies by product — no pressure to buy more than you need.'],
      ].map(([title, desc]) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f8f8f8;vertical-align:top">
            <div style="display:flex;gap:10px;align-items:flex-start">
              <div style="width:6px;height:6px;border-radius:50%;background:#2d7dd2;margin-top:5px;flex-shrink:0"></div>
              <div>
                <span style="font-size:12px;font-weight:700;color:#111">${title} — </span>
                <span style="font-size:12px;color:#777">${desc}</span>
              </div>
            </div>
          </td>
        </tr>
      `).join('')}
    </table>
  </div>

  ${customNote ? `
  <!-- CUSTOM NOTE -->
  <div style="background:#fff;border-left:1px solid #eee;border-right:1px solid #eee;padding:0 32px 24px">
    <div style="background:#f0f6ff;border-left:3px solid #2d7dd2;padding:14px 16px;border-radius:0 6px 6px 0">
      <div style="font-size:9px;font-weight:700;color:#2d7dd2;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">A note from our team</div>
      <div style="font-size:12px;color:#555;line-height:1.7">${customNote}</div>
    </div>
  </div>` : ''}

  <!-- CTA -->
  <div style="background:#fff;border-left:1px solid #eee;border-right:1px solid #eee;padding:24px 32px 32px;text-align:center">
    <p style="font-size:13px;color:#777;margin:0 0 20px;line-height:1.7">Ready to apply? It takes less than 5 minutes.<br>We review every application personally and respond within 1–2 business days.</p>
    <a href="https://www.levamcorp.com/apply" style="display:inline-block;background:#111;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:15px 40px;border-radius:4px">Apply for a partner account</a>
    <p style="font-size:11px;color:#bbb;margin:16px 0 0">www.levamcorp.com/apply</p>
  </div>

  <!-- CONTACT -->
  <div style="background:#f8f9fa;border:1px solid #eee;padding:20px 32px;text-align:center">
    <p style="font-size:12px;color:#888;margin:0 0 6px">Questions? Contact us directly:</p>
    <p style="font-size:12px;color:#555;margin:0;font-weight:600">partners@levamcorp.com &nbsp;·&nbsp; (786) 878-4122 &nbsp;·&nbsp; (786) 546-9476</p>
  </div>

  <!-- FOOTER -->
  <div style="background:#111;border-radius:0 0 10px 10px;padding:18px 32px;text-align:center">
    <p style="font-size:10px;color:#555;margin:0;line-height:1.8">
      Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178<br>
      This email was sent as a business outreach. Reply to unsubscribe.
    </p>
  </div>

</div>
</body>
</html>`

    const results = await Promise.allSettled(
      emails.map(email =>
        resend.emails.send({
          from: 'Levam Corp <partners@levamcorp.com>',
          to: email,
          subject: subject || 'Wholesale partnership opportunity — Levam Corp Distributors',
          html,
        })
      )
    )

    const sent   = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    return Response.json({ success: true, sent, failed })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
