import { createClient } from '@supabase/supabase-js'

const genPassword = () => {
  const words = ['Levam', 'Doral', 'Wholesale', 'Partner', 'Miami']
  const w = words[Math.floor(Math.random() * words.length)]
  const n = String(Math.floor(1000 + Math.random() * 9000))
  const sym = '!#$@'[Math.floor(Math.random() * 4)]
  return w + n + sym
}

// Clients often apply with a shared company inbox (orders@theirco.com), but then need
// individual reps to have their own logins into the portal. This creates a second (or
// third, etc.) real Supabase Auth login tied to the SAME client account via `client_users`,
// rather than creating a whole separate `clients` row — the portal pages fall back to that
// table when the logged-in email doesn't match `clients.email` directly, so an authorized
// user sees the exact same orders/invoices/catalog as the main contact. Same service-role
// create-or-reset-password pattern as /api/approve-application.
export async function POST(request) {
  try {
    const body = await request.json()
    const { clientId, email, name } = body
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

    const { data: existingRow } = await supabaseAdmin.from('client_users').select('id').eq('email', normalizedEmail).maybeSingle()
    if (existingRow) {
      await supabaseAdmin.from('client_users').update({ client_id: clientId, user_id: userId, name }).eq('id', existingRow.id)
    } else {
      await supabaseAdmin.from('client_users').insert([{ client_id: clientId, user_id: userId, email: normalizedEmail, name }])
    }

    return Response.json({ success: true, tempPassword })
  } catch (error) {
    console.error('create-authorized-user error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
