import { createClient } from '@supabase/supabase-js'

const genPassword = () => {
  const words = ['Levam', 'Doral', 'Wholesale', 'Partner', 'Miami']
  const w = words[Math.floor(Math.random() * words.length)]
  const n = String(Math.floor(1000 + Math.random() * 9000))
  const sym = '!#$@'[Math.floor(Math.random() * 4)]
  return w + n + sym
}

// One-click repair for clients who were approved before a gap in approve-application's
// error handling was fixed: they got a real `clients` row and the congratulatory emails,
// but no real Supabase Auth account ever got created, so their emailed credentials never
// actually worked and "forgot password" went nowhere (Supabase won't email a reset for an
// email with no matching account). Same create-or-find-and-reset-password logic as
// approve-application, just scoped to an existing client row instead of an application —
// updates that client's `user_id` once a real auth account exists.
export async function POST(request) {
  try {
    const { clientId, email } = await request.json()
    if (!clientId || !email) return Response.json({ success: false, error: 'Missing clientId or email' }, { status: 400 })

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
      // perPage:1000 — listUsers() defaults to a 50-row first page, which is exactly what
      // let this bug slip through in the first place on an account with 50+ auth users.
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
      if (listErr) throw listErr
      const existing = list?.users?.find(u => u.email?.toLowerCase() === normalizedEmail)
      if (existing) {
        userId = existing.id
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword })
        if (updateErr) throw updateErr
      } else {
        throw new Error(`Supabase reports ${normalizedEmail} is already registered, but no matching auth user was found in the first 1000 users. Check the Supabase Auth dashboard manually.`)
      }
    } else if (createErr) {
      throw createErr
    }

    // Never silently report success without a real account behind it — that's the exact
    // bug this route exists to clean up after.
    if (!userId) throw new Error('Could not create or find a Supabase Auth user for this email.')

    const { error: updateClientErr } = await supabaseAdmin.from('clients').update({ user_id: userId }).eq('id', clientId)
    if (updateClientErr) throw updateClientErr

    return Response.json({ success: true, tempPassword })
  } catch (error) {
    console.error('fix-client-login error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
