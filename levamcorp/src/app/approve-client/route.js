import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { applicationId, businessName, contactName, email, phone, address } = await request.json()

    // Use service role to create user and bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Generate temp password
    const tempPassword = `Levam${Math.floor(1000 + Math.random() * 9000)}@Corp`

    // 1. Create auth user
    console.log('Creating user with email:', email, 'password:', tempPassword)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true,
    })

    console.log('Auth result:', JSON.stringify({ authData: authData?.user?.id, authError }))
    if (authError) throw new Error(`Auth error: ${authError.message} (${authError.status})`)

    // 2. Create client record
    const { error: clientError } = await supabaseAdmin.from('clients').insert([{
      user_id: authData.user.id,
      business_name: businessName,
      contact_name: contactName,
      email,
      phone,
      address,
      status: 'active',
    }])

    if (clientError) throw clientError

    // 3. Update application status
    await supabaseAdmin.from('applications').update({
      status: 'approved',
      reviewed_at: new Date().toISOString()
    }).eq('id', applicationId)

    // 4. Send welcome email with credentials
    await resend.emails.send({
      from: 'Levam Corp Distributors <onboarding@resend.dev>',
      to: [email],
      subject: '✓ You\'ve been approved — Welcome to Levam Corp Distributors',
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
            <div style="display:inline-block;background:rgba(42,125,79,0.15);border:1px solid rgba(42,125,79,0.3);border-radius:3px;padding:6px 14px;">
              <span style="font-size:11px;color:#4aad6f;font-weight:600;letter-spacing:0.08em;">✓ APPROVED</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- WELCOME -->
    <div style="padding:36px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#2d7dd2;margin-bottom:10px;">Welcome to Levam Corp</div>
      <h1 style="font-size:22px;font-weight:500;color:#111;margin:0 0 12px;">Your application has been approved!</h1>
      <p style="font-size:14px;color:#666;line-height:1.8;margin:0;">
        Hi <strong style="color:#333;">${contactName || businessName}</strong>, congratulations! Your application to become a 
        Levam Corp Distributors partner has been approved. You now have access to our private catalog, 
        wholesale pricing, and order system.
      </p>
    </div>

    <!-- CREDENTIALS -->
    <div style="padding:28px 40px;border-bottom:1px solid #ebebeb;background:#fafafa;">
      <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#aaa;margin-bottom:16px;">Your login credentials</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:10px 16px;background:#fff;border:1px solid #ebebeb;border-radius:4px 4px 0 0;border-bottom:none;">
            <div style="font-size:10px;color:#aaa;margin-bottom:4px;letter-spacing:0.1em;text-transform:uppercase;">Email</div>
            <div style="font-size:14px;font-weight:600;color:#111;">${email}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 16px;background:#fff;border:1px solid #ebebeb;border-radius:0 0 4px 4px;">
            <div style="font-size:10px;color:#aaa;margin-bottom:4px;letter-spacing:0.1em;text-transform:uppercase;">Temporary password</div>
            <div style="font-size:14px;font-weight:600;color:#111;letter-spacing:0.05em;">${tempPassword}</div>
          </td>
        </tr>
      </table>
      <div style="margin-top:12px;font-size:11px;color:#aaa;">⚠ Please change your password after your first login.</div>
    </div>

    <!-- CTA -->
    <div style="padding:28px 40px;text-align:center;border-bottom:1px solid #ebebeb;">
      <a href="https://levamcorp-dkyd.vercel.app/portal" style="display:inline-block;padding:14px 40px;background:#2d7dd2;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;border-radius:3px;">
        Access Your Portal
      </a>
      <div style="margin-top:10px;font-size:11px;color:#bbb;">levamcorp-dkyd.vercel.app/portal</div>
    </div>

    <!-- WHAT'S NEXT -->
    <div style="padding:28px 40px;border-bottom:1px solid #ebebeb;">
      <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#aaa;margin-bottom:16px;">What you can do now</div>
      ${['Browse our full product catalog with wholesale pricing', 'Create order quotes and generate invoices automatically', 'Track your orders and download invoices anytime', 'Contact us at partners@levamcorp.com for support'].map(item => `
        <div style="display:flex;align-items:center;margin-bottom:10px;">
          <span style="color:#2d7dd2;margin-right:10px;font-size:14px;">✓</span>
          <span style="font-size:13px;color:#555;">${item}</span>
        </div>
      `).join('')}
    </div>

    <!-- FOOTER -->
    <div style="background:#0d0d0d;padding:20px 40px;text-align:center;">
      <div style="font-size:10px;color:#444;line-height:1.8;">
        Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178<br>
        <a href="mailto:partners@levamcorp.com" style="color:#2d7dd2;text-decoration:none;">partners@levamcorp.com</a>
        &nbsp;·&nbsp;
        <a href="https://levamcorp-dkyd.vercel.app" style="color:#2d7dd2;text-decoration:none;">levamcorp.com</a>
      </div>
    </div>

  </div>
</body>
</html>
      `
    })

    return Response.json({ success: true, tempPassword })

  } catch (error) {
    console.error('Approve client error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
