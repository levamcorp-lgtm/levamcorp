const genPassword = () => {
  const words = ['Levam', 'Doral', 'Wholesale', 'Partner', 'Miami']
  const w = words[Math.floor(Math.random() * words.length)]
  const n = String(Math.floor(1000 + Math.random() * 9000))
  const sym = '!#$@'[Math.floor(Math.random() * 4)]
  return w + n + sym
}

// Shared by the admin's manual "Approve" button (api/approve-application) and the
// applications agent's auto-approve path (api/applications-agent/tick) — both need the
// exact same real-account provisioning. This used to live only in approve-application's
// route handler; keeping one copy means a future fix to the account-resolution logic
// (see its own history: a 50-row listUsers() page once left userId null with no error
// thrown) can't accidentally apply to only one of the two call sites.
export async function approveApplicationAccount(supabaseAdmin, {
  applicationId, email, businessName, contactName, phone, address,
  businessType, monthlyVolume, yearsInBusiness, einNumber, resaleTaxNumber,
  einDocumentUrl, resaleTaxDocumentUrl,
}) {
  const normalizedEmail = email.trim().toLowerCase()
  const tempPassword = genPassword()
  let userId = null

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail, password: tempPassword, email_confirm: true,
  })

  if (created?.user) {
    userId = created.user.id
  } else if (createErr && /already.*registered|already.*exists/i.test(createErr.message || '')) {
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    if (listErr) throw listErr
    const existing = list?.users?.find(u => u.email?.toLowerCase() === normalizedEmail)
    if (existing) {
      userId = existing.id
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword, email_confirm: true })
      if (updateErr) throw updateErr
    } else {
      throw new Error(`Supabase reports ${normalizedEmail} is already registered, but no matching auth user was found in the first 1000 users. Check the Supabase Auth dashboard manually.`)
    }
  } else if (createErr) {
    throw createErr
  }

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

  return { tempPassword }
}
