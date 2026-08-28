import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, businessName, contactName } = await request.json()
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    const refCode = Date.now().toString(16).slice(-4).toUpperCase()
    const displayName = contactName || businessName

    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: [email],
      subject: `Application Received — ${businessName} · Levam Corp`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>Application Received — Levam Corp Distributors</title>
<style>
  @media only screen and (max-width: 620px) {
    .lvm-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .lvm-h1 { font-size: 28px !important; line-height: 32px !important; }
    .lvm-num { font-size: 40px !important; line-height: 38px !important; }
    .lvm-stack { display: block !important; width: 100% !important; }
    .lvm-right { text-align: left !important; padding-top: 4px !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0b0d;">

<span style="display: none !important; visibility: hidden; opacity: 0; height: 0; width: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #0a0b0d;">Application received — we review every application personally and reply within 1–2 business days.</span>

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
        <td width="60%" style="width: 60%; mso-line-height-rule: exactly; line-height: 16px;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 19px; font-weight: 700; letter-spacing: 2px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 21px;">LEVAM<span style="color: #2F7DF6;">CORP</span></div>
          <div style="padding-top: 4px; font-family: 'Courier New', Courier, monospace; font-size: 9px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 14px;">Distributors &middot; Doral, FL</div>
        </td>
        <td width="40%" class="lvm-right" style="width: 40%; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #5c5a55; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 16px;">
          DORAL &middot; FL 33178
        </td>
      </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 11px 28px 12px 28px; border-bottom: 1px solid rgba(8,9,11,0.18);">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="60%" style="width: 60%; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #5c5a55; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">
          RECEIPT &middot; FORM 01
        </td>
        <td width="40%" class="lvm-right" style="width: 40%; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #5c5a55; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">
          <span style="color: #2F7DF6;">&#9632;</span>&nbsp; STATUS &middot; RECEIVED
        </td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- HEADLINE -->
  <tr>
    <td class="lvm-pad" style="padding: 32px 28px 8px 28px;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 14px; padding-bottom: 14px;">Thank you for applying</div>
      <h1 class="lvm-h1" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 34px; font-weight: normal; letter-spacing: -1.2px; color: #08090b; mso-line-height-rule: exactly; line-height: 37px;">We received your application<span style="color: #2F7DF6;">.</span></h1>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 18px 28px 6px 28px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #3f3d39; mso-line-height-rule: exactly; line-height: 25px;">
      Hi <strong style="color: #08090b;">${displayName}</strong> — thanks for your interest in becoming a Levam Corp Distributors partner.
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 14px 28px 30px 28px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #3f3d39; mso-line-height-rule: exactly; line-height: 25px;">
      We review every application personally — no automated filter. You'll hear back from us at <a href="mailto:${email}" style="color: #08090b; text-decoration: none; border-bottom: 1px solid #2F7DF6;">${email}</a> with a decision.
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- BLUE STUB: THE NUMBERS -->
<tr>
<td style="background-color: #2F7DF6; padding: 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td class="lvm-pad" style="padding: 20px 28px 10px 28px; border-bottom: 1px solid rgba(8,9,11,0.4); font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">
      Estimated turnaround
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 22px 28px 22px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="50%" class="lvm-stack" style="width: 50%; vertical-align: bottom;">
          <span class="lvm-num" style="font-family: Helvetica, Arial, sans-serif; font-size: 54px; letter-spacing: -3px; color: #08090b; mso-line-height-rule: exactly; line-height: 50px;">48</span>
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 2px; color: #08090b; text-transform: uppercase;">&nbsp;HRS</span>
          <div style="padding-top: 8px; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 14px;">To a decision</div>
        </td>
        <td width="50%" class="lvm-stack" style="width: 50%; vertical-align: bottom; padding-top: 0;">
          <span class="lvm-num" style="font-family: Helvetica, Arial, sans-serif; font-size: 54px; letter-spacing: -3px; color: #08090b; mso-line-height-rule: exactly; line-height: 50px;">500</span>
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 2px; color: #08090b; text-transform: uppercase;">&nbsp;+ SKUS</span>
          <div style="padding-top: 8px; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 14px;">Waiting in the portal</div>
        </td>
      </tr>
      </table>
    </td>
  </tr>
  <!-- BARCODE -->
  <tr>
    <td class="lvm-pad" style="padding: 0 28px 18px 28px; font-size: 0; line-height: 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" height="22" style="height: 22px;">
      <tr>
        <td width="4" height="22" bgcolor="#08090b" style="width:4px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="3" height="22" style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="2" height="22" bgcolor="#08090b" style="width:2px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="4" height="22" style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="6" height="22" bgcolor="#08090b" style="width:6px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="3" height="22" style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="2" height="22" bgcolor="#08090b" style="width:2px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="5" height="22" style="width:5px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="3" height="22" bgcolor="#08090b" style="width:3px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="3" height="22" style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="7" height="22" bgcolor="#08090b" style="width:7px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="4" height="22" style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="2" height="22" bgcolor="#08090b" style="width:2px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="3" height="22" style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="4" height="22" bgcolor="#08090b" style="width:4px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="6" height="22" style="width:6px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="3" height="22" bgcolor="#08090b" style="width:3px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="3" height="22" style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="5" height="22" bgcolor="#08090b" style="width:5px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="4" height="22" style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="2" height="22" bgcolor="#08090b" style="width:2px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="5" height="22" style="width:5px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="6" height="22" bgcolor="#08090b" style="width:6px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="3" height="22" style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="2" height="22" bgcolor="#08090b" style="width:2px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="4" height="22" style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="4" height="22" bgcolor="#08090b" style="width:4px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="3" height="22" style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="3" height="22" bgcolor="#08090b" style="width:3px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="6" height="22" style="width:6px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="5" height="22" bgcolor="#08090b" style="width:5px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="3" height="22" style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="2" height="22" bgcolor="#08090b" style="width:2px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="4" height="22" style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="6" height="22" bgcolor="#08090b" style="width:6px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="5" height="22" style="width:5px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="3" height="22" bgcolor="#08090b" style="width:3px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="3" height="22" style="width:3px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="4" height="22" bgcolor="#08090b" style="width:4px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="6" height="22" style="width:6px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="2" height="22" bgcolor="#08090b" style="width:2px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td width="4" height="22" style="width:4px;font-size:0;line-height:0;">&nbsp;</td>
        <td width="7" height="22" bgcolor="#08090b" style="width:7px;height:22px;font-size:0;line-height:0;">&nbsp;</td><td height="22" style="font-size:0;line-height:0;">&nbsp;</td>
      </tr>
      </table>
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- RECORD -->
<tr>
<td style="background-color: #f2efe6; padding: 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td class="lvm-pad" style="padding: 24px 28px 12px 28px; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; border-bottom: 1px solid rgba(8,9,11,0.2); mso-line-height-rule: exactly; line-height: 15px;">
      Application on record
    </td>
  </tr>

  <tr>
    <td class="lvm-pad" style="padding: 0 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="40%" style="width: 40%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">Business</td>
        <td width="60%" style="width: 60%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #08090b; mso-line-height-rule: exactly; line-height: 20px;">${businessName}</td>
      </tr>
      <tr>
        <td width="40%" style="width: 40%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">Contact</td>
        <td width="60%" style="width: 60%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); text-align: right; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #08090b; mso-line-height-rule: exactly; line-height: 20px;">${contactName || '—'}</td>
      </tr>
      <tr>
        <td width="40%" style="width: 40%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">Submitted</td>
        <td width="60%" style="width: 60%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 12px; letter-spacing: 1px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 18px;">${today}</td>
      </tr>
      <tr>
        <td width="40%" style="width: 40%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">Reference</td>
        <td width="60%" style="width: 60%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold; letter-spacing: 2px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 18px;">APP &middot; ${refCode}</td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- WHAT HAPPENS NEXT -->
  <tr>
    <td class="lvm-pad" style="padding: 28px 28px 12px 28px; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">
      What happens next
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 0 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="46" style="width: 46px; padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.2); vertical-align: top; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 1px; color: #1f5dc7; mso-line-height-rule: exactly; line-height: 18px;">01</td>
        <td style="padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.2); vertical-align: top;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #08090b; mso-line-height-rule: exactly; line-height: 21px;">We review your application</div>
          <div style="padding-top: 5px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #6d6a64; mso-line-height-rule: exactly; line-height: 21px;">A person reads it — usually within 1–2 business days.</div>
        </td>
      </tr>
      <tr>
        <td width="46" style="width: 46px; padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.12); vertical-align: top; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 1px; color: #1f5dc7; mso-line-height-rule: exactly; line-height: 18px;">02</td>
        <td style="padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.12); vertical-align: top;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #08090b; mso-line-height-rule: exactly; line-height: 21px;">You receive a decision</div>
          <div style="padding-top: 5px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #6d6a64; mso-line-height-rule: exactly; line-height: 21px;">Straight to your inbox at ${email}, approved or not. No silence.</div>
        </td>
      </tr>
      <tr>
        <td width="46" style="width: 46px; padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.12); border-bottom: 1px solid rgba(8,9,11,0.2); vertical-align: top; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 1px; color: #1f5dc7; mso-line-height-rule: exactly; line-height: 18px;">03</td>
        <td style="padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.12); border-bottom: 1px solid rgba(8,9,11,0.2); vertical-align: top;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #08090b; mso-line-height-rule: exactly; line-height: 21px;">You get portal access</div>
          <div style="padding-top: 5px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #6d6a64; mso-line-height-rule: exactly; line-height: 21px;">Live wholesale pricing, stock levels and ordering.</div>
        </td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- BUTTONS -->
  <tr>
    <td class="lvm-pad" style="padding: 26px 28px 8px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td bgcolor="#08090b" style="background-color: #08090b; padding: 15px 20px; text-align: center;">
          <a href="https://levamcorp.com/#brands" style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #f2efe6; text-transform: uppercase; text-decoration: none; mso-line-height-rule: exactly; line-height: 16px;">Browse the catalog &nbsp;&rarr;</a>
        </td>
      </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 10px 28px 26px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="border: 1px solid #08090b; padding: 14px 20px; text-align: center;">
          <a href="https://wa.me/17864909005" style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 2px; color: #08090b; text-transform: uppercase; text-decoration: none; mso-line-height-rule: exactly; line-height: 16px;">Question? WhatsApp us</a>
        </td>
      </tr>
      </table>
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
    <td class="lvm-pad" style="padding: 24px 28px 16px 28px; border-bottom: 1px solid rgba(242,239,230,0.14);">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="55%" class="lvm-stack" style="width: 55%; mso-line-height-rule: exactly; line-height: 18px;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 2px; color: #f2efe6; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 19px;">LEVAM<span style="color: #2F7DF6;">CORP</span></div>
        </td>
        <td width="45%" class="lvm-right" style="width: 45%; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #7c7a73; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 18px;">
          B2B wholesale only
        </td>
      </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 18px 28px 6px 28px; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 1px; color: #9a968e; mso-line-height-rule: exactly; line-height: 20px;">
      6315 NW 99th Ave, Doral, FL 33178<br />
      <a href="mailto:partners@levamcorp.com" style="color: #f2efe6; text-decoration: none; border-bottom: 1px solid rgba(242,239,230,0.35);">partners@levamcorp.com</a>
      &nbsp;&middot;&nbsp;
      <a href="tel:+17868784122" style="color: #f2efe6; text-decoration: none; border-bottom: 1px solid rgba(242,239,230,0.35);">(786) 878-4122</a><br />
      Mon–Fri 9AM–5PM ET &middot; English &amp; Espa&ntilde;ol
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 20px 28px 24px 28px; font-family: 'Courier New', Courier, monospace; font-size: 9px; letter-spacing: 2px; color: #5f5d58; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 16px;">
      You received this because you applied at levamcorp.com<br />
      &copy; ${new Date().getFullYear()} Levam Corp Distributors &middot; Doc 01 &middot; Rev. 08
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
    console.error('Application email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
