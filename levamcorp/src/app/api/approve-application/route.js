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
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
      if (listErr) throw listErr
      const existing = list?.users?.find(u => u.email?.toLowerCase() === normalizedEmail)
      if (existing) {
        userId = existing.id
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword })
        if (updateErr) throw updateErr
      }
    } else if (createErr) {
      throw createErr
    }

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
