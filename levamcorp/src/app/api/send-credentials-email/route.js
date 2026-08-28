import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, password, businessName, contactName } = await request.json()
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    const refCode = Date.now().toString(16).slice(-4).toUpperCase()
    const displayName = contactName || businessName

    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: [email],
      subject: `Your Levam Corp Portal Access — Login Credentials`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<title>Your Access Credentials — Levam Corp Distributors</title>
<style>
  @media only screen and (max-width: 620px) {
    .lvm-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .lvm-h1 { font-size: 28px !important; line-height: 32px !important; }
    .lvm-num { font-size: 40px !important; line-height: 38px !important; }
    .lvm-pw { font-size: 22px !important; letter-spacing: 2px !important; line-height: 26px !important; }
    .lvm-stack { display: block !important; width: 100% !important; }
    .lvm-right { text-align: left !important; padding-top: 4px !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0b0d;">

<span style="display: none !important; visibility: hidden; opacity: 0; height: 0; width: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #0a0b0d;">Your portal credentials are inside. Change the temporary password on first sign-in.</span>

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
          <img src="https://www.levamcorp.com/levamcorp-logo_1.png" width="132" height="86" alt="LEVAM CORP — Distributors" style="display: block; width: 132px; height: 86px; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
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
          Credentials &middot; Form 03
        </td>
        <td width="40%" class="lvm-right" style="width: 40%; text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #5c5a55; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">
          <span style="color: #2F7DF6;">&#9632;</span>&nbsp; STATUS &middot; ISSUED
        </td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- ISSUED STAMP -->
  <tr>
    <td class="lvm-pad" style="padding: 26px 28px 0 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border: 2px solid #2F7DF6; padding: 8px 14px 9px 14px; text-align: center;">
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; letter-spacing: 4px; color: #2F7DF6; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 16px;">Access issued</div>
          <div style="padding-top: 3px; font-family: 'Courier New', Courier, monospace; font-size: 8px; letter-spacing: 2px; color: #2F7DF6; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 11px;">Levam Corp &middot; Doral FL</div>
        </td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- HEADLINE -->
  <tr>
    <td class="lvm-pad" style="padding: 22px 28px 8px 28px;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 14px; padding-bottom: 14px;">Your account is ready</div>
      <h1 class="lvm-h1" style="margin: 0; font-family: Helvetica, Arial, sans-serif; font-size: 34px; font-weight: normal; letter-spacing: -1.2px; color: #08090b; mso-line-height-rule: exactly; line-height: 37px;">Here are your credentials<span style="color: #2F7DF6;">.</span></h1>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 18px 28px 6px 28px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #3f3d39; mso-line-height-rule: exactly; line-height: 25px;">
      Hi <strong style="color: #08090b;">${displayName}</strong> — your Levam Corp partner account for <strong style="color: #08090b;">${businessName}</strong> has been created. Use the credentials below to sign in.
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 14px 28px 30px 28px; font-family: Helvetica, Arial, sans-serif; font-size: 15px; color: #3f3d39; mso-line-height-rule: exactly; line-height: 25px;">
      This password is temporary and single-issue. Please change it right after your first sign-in — we never ask for it by email or phone.
    </td>
  </tr>
  </table>
</td>
</tr>

<!-- BLUE STUB: THE CREDENTIALS -->
<tr>
<td style="background-color: #2F7DF6; padding: 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td class="lvm-pad" style="padding: 20px 28px 10px 28px; border-bottom: 1px solid rgba(8,9,11,0.4); font-family: 'Courier New', Courier, monospace; font-size: 10px; font-weight: bold; letter-spacing: 2px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">
      Access credential &middot; do not share
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 20px 28px 6px 28px;">
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 9px; letter-spacing: 2px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 13px; padding-bottom: 7px;">Sign-in email</div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 17px; font-weight: bold; letter-spacing: 0.5px; color: #08090b; mso-line-height-rule: exactly; line-height: 24px; word-break: break-all;">${email}</div>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 16px 28px 4px 28px;">
      <div style="border-top: 1px solid rgba(8,9,11,0.4); padding-top: 16px;">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 9px; letter-spacing: 2px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 13px; padding-bottom: 8px;">Temporary password</div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td bgcolor="#08090b" style="background-color: #08090b; padding: 13px 18px 14px 18px;">
            <span class="lvm-pw" style="font-family: 'Courier New', Courier, monospace; font-size: 30px; font-weight: bold; letter-spacing: 4px; color: #f2efe6; mso-line-height-rule: exactly; line-height: 32px;">${password}</span>
          </td>
        </tr>
        </table>
      </div>
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 14px 28px 20px 28px; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 1.5px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 16px;">
      &#9632;&nbsp; Change this password after your first sign-in
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
      Account on record
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
        <td width="40%" style="width: 40%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">Issued</td>
        <td width="60%" style="width: 60%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 12px; letter-spacing: 1px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 18px;">${today}</td>
      </tr>
      <tr>
        <td width="40%" style="width: 40%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">Account ref</td>
        <td width="60%" style="width: 60%; padding: 13px 0 14px 0; border-bottom: 1px solid rgba(8,9,11,0.14); text-align: right; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold; letter-spacing: 2px; color: #08090b; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 18px;">PRT &middot; ${refCode}</td>
      </tr>
      </table>
    </td>
  </tr>

  <!-- ONCE INSIDE -->
  <tr>
    <td class="lvm-pad" style="padding: 28px 28px 12px 28px; font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2px; color: #6d6a64; text-transform: uppercase; mso-line-height-rule: exactly; line-height: 15px;">
      Once inside your portal
    </td>
  </tr>
  <tr>
    <td class="lvm-pad" style="padding: 0 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="46" style="width: 46px; padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.2); vertical-align: top; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 1px; color: #1f5dc7; mso-line-height-rule: exactly; line-height: 18px;">01</td>
        <td style="padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.2); vertical-align: top;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #08090b; mso-line-height-rule: exactly; line-height: 21px;">Full catalog with wholesale pricing</div>
          <div style="padding-top: 5px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #6d6a64; mso-line-height-rule: exactly; line-height: 21px;">500+ SKUs, real prices — no more redacted figures.</div>
        </td>
      </tr>
      <tr>
        <td width="46" style="width: 46px; padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.12); vertical-align: top; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 1px; color: #1f5dc7; mso-line-height-rule: exactly; line-height: 18px;">02</td>
        <td style="padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.12); vertical-align: top;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #08090b; mso-line-height-rule: exactly; line-height: 21px;">Live stock levels and MOQ</div>
          <div style="padding-top: 5px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #6d6a64; mso-line-height-rule: exactly; line-height: 21px;">Shown next to every SKU, updated in real time.</div>
        </td>
      </tr>
      <tr>
        <td width="46" style="width: 46px; padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.12); border-bottom: 1px solid rgba(8,9,11,0.2); vertical-align: top; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 1px; color: #1f5dc7; mso-line-height-rule: exactly; line-height: 18px;">03</td>
        <td style="padding: 14px 0 16px 0; border-top: 1px solid rgba(8,9,11,0.12); border-bottom: 1px solid rgba(8,9,11,0.2); vertical-align: top;">
          <div style="font-family: Helvetica, Arial, sans-serif; font-size: 16px; color: #08090b; mso-line-height-rule: exactly; line-height: 21px;">Order tracking and your rep</div>
          <div style="padding-top: 5px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #6d6a64; mso-line-height-rule: exactly; line-height: 21px;">The same named contact every time — English or Spanish.</div>
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
          <a href="https://www.levamcorp.com/portal" style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; letter-spacing: 2px; color: #f2efe6; text-transform: uppercase; text-decoration: none; mso-line-height-rule: exactly; line-height: 16px;">Access your portal &nbsp;&rarr;</a>
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
          <a href="https://wa.me/17864909005" style="display: block; font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 2px; color: #08090b; text-transform: uppercase; text-decoration: none; mso-line-height-rule: exactly; line-height: 16px;">Trouble signing in? WhatsApp us</a>
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
          <img src="https://www.levamcorp.com/levamcorp-logo-white.png" width="112" height="73" alt="LEVAM CORP — Distributors" style="display: block; width: 112px; height: 73px; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
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
      You received this because your partner account was created<br />
      &copy; ${new Date().getFullYear()} Levam Corp Distributors &middot; Doc 03 &middot; Rev. 08
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
    console.error('Credentials email error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
