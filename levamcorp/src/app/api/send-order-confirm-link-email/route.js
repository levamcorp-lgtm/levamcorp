import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, businessName, contactName, orderNumber, confirmUrl, total, itemCount } = await request.json()
    const displayName = contactName || businessName

    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: [email],
      subject: `Confirm your order #${orderNumber} — Levam Corp Distributors`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Confirm Order — Levam Corp Distributors</title>
<style>
  @media only screen and (max-width: 620px) {
    .lvm-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .lvm-h1 { font-size: 28px !important; line-height: 32px !important; }
    .lvm-right { text-align: left !important; padding-top: 4px !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0b0d;">

<span style="display: none !important; visibility: hidden; opacity: 0; height: 0; width: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #0a0b0d;">A couple quick things to lock in before we ship order #${orderNumber}.</span>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0a0b0d;">
<tr>
<td align="center" style="padding: 28px 12px 40px 12px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width: 600px; max-width: 600px;">

<!-- TAG HEADER -->
<tr>
<td style="background-color: #f2efe6; padding: 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td class="lvm-pad" style="padding: 22px 28px 16px 28px; border-bottom: 2px solid #08090b;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="60%" style="width: 60%; font-family: Helvetica, Arial, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: -.01em; color: #08090b;">LEVAM CORP</td>
        <td width="40%" class="lvm-right" style="width: 40%; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #5c5a55; text-transform: uppercase;">DORAL &middot; FL 33178</td>
      </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 11px 28px 12px 28px; border-bottom: 1px solid rgba(8,9,11,0.18);">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="60%" style="width: 60%; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #5c5a55; text-transform: uppercase;">ORDER &middot; FORM 05</td>
        <td width="40%" class="lvm-right" style="width: 40%; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #5c5a55; text-transform: uppercase;"><span style="color: #2F7DF6;">&#9632;</span>&nbsp; STATUS &middot; NEEDS YOUR OK</td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- HEADLINE -->
  <tr>
    <td class="lvm-pad" style="padding: 26px 28px 8px 28px;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; padding-bottom: 14px;">Order #${orderNumber}</div>
      <h1 class="lvm-h1" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 32px; font-weight: normal; letter-spacing: -1.2px; color: #08090b; line-height: 36px;">Let's lock this in<span style="color: #2F7DF6;">.</span></h1>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 18px 28px 6px 28px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #3f3d39; line-height: 25px;">
      Hi <strong style="color: #08090b;">${displayName}</strong> — before we send order <strong style="color: #08090b;">#${orderNumber}</strong>${itemCount ? ` (${itemCount} product${itemCount === 1 ? '' : 's'}, ${'$' + (total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })})` : ''} out, we need you to confirm a few final details — how you'll pay, and how you want it delivered.
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 14px 28px 30px 28px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #3f3d39; line-height: 25px;">
      It takes under a minute and locks your spot in the shipping queue.
    </td>
  </tr>

  <!-- BUTTON -->
  <tr>
    <td class="lvm-pad" style="padding: 0 28px 8px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td bgcolor="#08090b" style="background-color: #08090b; padding: 15px 20px; text-align: center;">
          <a href="${confirmUrl}" style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #f2efe6; text-transform: uppercase; text-decoration: none;">Confirm my order &nbsp;&rarr;</a>
        </td>
      </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 10px 28px 30px 28px; font-family: 'Courier New', Courier, monospace; font-size: 10.5px; letter-spacing: 1px; color: #6d6a64; word-break: break-all;">
      Or paste this link: <a href="${confirmUrl}" style="color: #1f5dc7;">${confirmUrl}</a>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- DARK FOOTER -->
<tr>
<td style="background-color: #101114; padding: 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td class="lvm-pad" style="padding: 22px 28px 6px 28px; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 1px; color: #9a968e; line-height: 20px;">
      6315 NW 99th Ave, Doral, FL 33178<br />
      <a href="mailto:partners@levamcorp.com" style="color: #f2efe6; text-decoration: none; border-bottom: 1px solid rgba(242,239,230,0.35);">partners@levamcorp.com</a>
      &nbsp;&middot;&nbsp;
      <a href="tel:+17868784122" style="color: #f2efe6; text-decoration: none; border-bottom: 1px solid rgba(242,239,230,0.35);">(786) 878-4122</a>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 16px 28px 22px 28px; font-family: 'Courier New', Courier, monospace; font-size: 9px; letter-spacing: 2px; color: #5f5d58; text-transform: uppercase;">
      You received this to confirm order #${orderNumber} &middot; &copy; ${new Date().getFullYear()} Levam Corp Distributors &middot; Doc 05 &middot; Rev. 01
    </td>
  </tr>
  </table>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error('send-order-confirm-link-email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
