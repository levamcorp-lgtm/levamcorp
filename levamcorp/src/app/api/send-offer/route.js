import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function POST(req) {
  try {
    const { products, subject, headline, message, ctaText, footer, targetClients } = await req.json()

    // Use targetClients if provided, otherwise get all approved clients
    let clients
    if (targetClients?.length) {
      clients = targetClients
    } else {
      const { data } = await supabase.from('clients').select('email, contact_name, business_name')
      clients = data
    }
    if (!clients?.length) return Response.json({ error: 'No clients found' }, { status: 400 })

    const productRows = products.map(p => `
      <tr>
        <td style="padding:16px;border-bottom:1px solid #f0f0f0;vertical-align:top;width:80px">
          ${p.image_url
            ? `<img src="${p.image_url}" width="72" height="72" style="object-fit:contain;border-radius:6px;background:#f8f8f8;display:block"/>`
            : `<div style="width:72px;height:72px;background:#f0f2f4;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:24px">📦</div>`
          }
        </td>
        <td style="padding:16px;border-bottom:1px solid #f0f0f0;vertical-align:top">
          ${p.brand ? `<div style="font-size:10px;font-weight:700;color:#2d7dd2;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">${p.brand}</div>` : ''}
          <div style="font-size:15px;font-weight:700;color:#111;margin-bottom:4px">${p.name}</div>
          ${p.description ? `<div style="font-size:12px;color:#888;line-height:1.5;margin-bottom:8px">${p.description.slice(0,120)}${p.description.length > 120 ? '...' : ''}</div>` : ''}
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            <span style="font-size:20px;font-weight:900;color:#111">$${p.price?.toLocaleString()}<span style="font-size:11px;font-weight:400;color:#aaa">/unit</span></span>
            ${p.moq ? `<span style="font-size:11px;color:#2d7dd2;background:rgba(45,125,210,0.08);border:0.5px solid rgba(45,125,210,0.2);padding:3px 10px;border-radius:20px;font-weight:600;align-self:center">Min. ${p.moq} units</span>` : ''}
            ${p.stock ? `<span style="font-size:11px;color:#2a7d4f;background:rgba(42,125,79,0.08);border:0.5px solid rgba(42,125,79,0.2);padding:3px 10px;border-radius:20px;font-weight:600;align-self:center">${p.stock} in stock</span>` : ''}
          </div>
        </td>
      </tr>
    `).join('')

    const buildHtml = (clientName) => `<!DOCTYPE html>
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
      <div style="font-size:10px;color:#555;text-align:right;line-height:1.8">
        Doral, FL 33178<br>partners@levamcorp.com
      </div>
    </div>
    <div style="height:3px;background:#2d7dd2"></div>

    <!-- HERO -->
    <div style="background:#fff;padding:36px 32px 28px;text-align:center;border-left:1px solid #eee;border-right:1px solid #eee">
      <div style="display:inline-block;background:rgba(45,125,210,0.08);border:0.5px solid rgba(45,125,210,0.2);color:#2d7dd2;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:5px 16px;border-radius:20px;margin-bottom:16px">Exclusive Partner Offer</div>
      <h1 style="font-size:28px;font-weight:900;color:#111;margin:0 0 12px;letter-spacing:-0.02em;line-height:1.2">${headline}</h1>
      <p style="font-size:14px;color:#888;line-height:1.7;margin:0 0 24px;max-width:440px;margin-left:auto;margin-right:auto">Hi ${clientName}, ${message}</p>
    </div>

    <!-- PRODUCTS -->
    <div style="background:#fff;border-left:1px solid #eee;border-right:1px solid #eee;padding:0 32px">
      <div style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;padding:16px 0 8px;border-top:1px solid #f0f0f0">Featured products</div>
      <table style="width:100%;border-collapse:collapse">
        ${productRows}
      </table>
    </div>

    <!-- CTA -->
    <div style="background:#fff;border-left:1px solid #eee;border-right:1px solid #eee;padding:28px 32px;text-align:center">
      <a href="https://www.levamcorp.com/portal/catalog" style="display:inline-block;background:#111;color:#fff;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 36px;border-radius:4px">${ctaText || 'Browse catalog & place order'}</a>
      <p style="font-size:11px;color:#bbb;margin:16px 0 0">Login to your partner portal to order at wholesale prices</p>
    </div>

    <!-- FOOTER -->
    <div style="background:#f8f9fa;border:1px solid #eee;border-radius:0 0 10px 10px;padding:20px 32px;text-align:center">
      <p style="font-size:11px;color:#aaa;margin:0 0 8px;line-height:1.7">${footer || 'Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178'}</p>
      <p style="font-size:10px;color:#ccc;margin:0">You received this because you are an approved Levam Corp partner.<br>Reply to this email to unsubscribe.</p>
    </div>

  </div>
</body>
</html>`

    // Send to all clients
    const results = await Promise.allSettled(
      clients.map(client =>
        resend.emails.send({
          from: 'Levam Corp <partners@levamcorp.com>',
          to: client.email,
          subject,
          html: buildHtml(client.contact_name || client.business_name || 'Partner'),
        })
      )
    )

    const sent     = results.filter(r => r.status === 'fulfilled').length
    const failed   = results.filter(r => r.status === 'rejected').length

    return Response.json({ success: true, sent, failed, total: clients.length })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
