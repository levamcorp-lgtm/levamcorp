import { createClient } from '@supabase/supabase-js'

const genPassword = () => {
  const words = ['Levam', 'Doral', 'Wholesale', 'Partner', 'Miami']
  const w = words[Math.floor(Math.random() * words.length)]
  const n = String(Math.floor(1000 + Math.random() * 9000))
  const sym = '!#$@'[Math.floor(Math.random() * 4)]
  return w + n + sym
}

// Approving an application used to only mark it approved and add a row to `clients` —
// it never actually created a real login, so the admin had to go create the Supabase
// Auth user and password by hand every time before the client could sign in anywhere.
// This does the whole thing: real auth account (or reuses one if this email already has
// one), the clients record, and the application status — all with the service role, since
// creating/resetting an auth user isn't something the browser's anon key can do.
export async function POST(request) {
  try {
    const body = await request.json()
    const { applicationId, email, businessName, contactName, phone, address, businessType, monthlyVolume, yearsInBusiness, einNumber, resaleTaxNumber, einDocumentUrl, resaleTaxDocumentUrl } = body
    if (!applicationId || !email) return Response.json({ success: false, error: 'Missing applicationId or email' }, { status: 400 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const normalizedEmail = email.trim().toLowerCase()
    const tempPassword = genPassword()
    let userId = null

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail, password: tempPassword, email_confirm: true,
    })

    if (created?.user) {
      userId = created.user.id
    } else if (createErr && /already.*registered|already.*exists/i.test(createErr.message || '')) {
      // They already have an account — e.g. re-approving after a mistake, or a second
      // application with the same email. Reset the password so the credentials we're
      // about to send actually work, instead of failing the whole approval.
      // perPage:1000 — listUsers() defaults to a 50-row first page. On an account with
      // more than 50 auth users, the real match could easily be outside that page, which
      // used to leave `existing` undefined and `userId` null with NO error thrown: the
      // approval looked successful and the congratulatory/credentials emails still went
      // out, but for a password that was never set on any real account.
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      if (listErr) throw listErr
      const existing = list?.users?.find(u => u.email?.toLowerCase() === normalizedEmail)
      if (existing) {
        userId = existing.id
        // email_confirm:true here too — an account created by hand in the Supabase
        // dashboard without "Auto Confirm User" checked signs in with "Email not
        // confirmed" no matter how correct the password is. Since we're already
        // touching this account to make its login work, there's no reason to leave
        // that half-broken.
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword, email_confirm: true })
        if (updateErr) throw updateErr
      } else {
        throw new Error(`Supabase reports ${normalizedEmail} is already registered, but no matching auth user was found in the first 1000 users. Check the Supabase Auth dashboard manually.`)
      }
    } else if (createErr) {
      throw createErr
    }

    // Defensive backstop: never let the approval report success — and emails go out —
    // without a real linked auth account. This is the exact gap that let an application
    // get marked approved, with credentials emailed, while no one could actually log in.
    if (!userId) throw new Error('Could not create or find a Supabase Auth user for this email — approval aborted before sending credentials.')

    const clientPayload = {
      user_id: userId, email: normalizedEmail, business_name: businessName, contact_name: contactName,
      phone, address, business_type: businessType, monthly_volume: monthlyVolume, years_in_business: yearsInBusiness,
      ein_number: einNumber, resale_tax_number: resaleTaxNumber,
      ein_document_url: einDocumentUrl, resale_tax_document_url: resaleTaxDocumentUrl,
    }
    const { data: existingClient } = await supabaseAdmin.from('clients').select('id').eq('email', normalizedEmail).maybeSingle()
    if (existingClient) {
      await supabaseAdmin.from('clients').update(clientPayload).eq('id', existingClient.id)
    } else {
      await supabaseAdmin.from('clients').insert([clientPayload])
    }

    await supabaseAdmin.from('applications').update({ status: 'approved' }).eq('id', applicationId)

    return Response.json({ success: true, tempPassword })
  } catch (error) {
    console.error('approve-application error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
