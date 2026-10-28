import { createClient } from '@supabase/supabase-js'

// Finds clients with genuinely no real Supabase Auth account — NOT clients whose
// `clients.user_id` just happens to be unset. Those are different things: most of this
// business's clients were provisioned by hand (Supabase dashboard → Authentication →
// Users → Add user, then the manual "send credentials" tool in admin/clients, which only
// sends an email and never writes `user_id`) long before approve-application started
// auto-creating logins and linking `user_id`. So `user_id IS NULL` is the normal,
// expected state for most existing clients with perfectly working logins — it is not
// evidence anything is broken. The only reliable signal is checking each client's email
// against the real list of Supabase Auth users.
//
// While we're here with the real list in hand: any client whose email DOES match a real
// account, but whose `user_id` doesn't point to it, gets silently linked — free, safe,
// no password touched — so the next run (and the rest of the app) has accurate data.
export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Walk every page of real auth users — not just the first one. Trusting a single
    // page here is exactly the bug class that caused the original silent-approval issue.
    const authIdByEmail = new Map()
    let page = 1
    const perPage = 1000
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
      if (error) throw error
      for (const u of data.users) if (u.email) authIdByEmail.set(u.email.toLowerCase(), u.id)
      if (data.users.length < perPage) break
      page += 1
    }

    const { data: clients, error: clientsErr } = await supabaseAdmin.from('clients').select('id, email, user_id')
    if (clientsErr) throw clientsErr

    const noLoginIds = []
    const linkedIds = []
    for (const c of clients || []) {
      const realUserId = c.email ? authIdByEmail.get(c.email.toLowerCase()) : null
      if (!realUserId) {
        noLoginIds.push(c.id)
      } else if (c.user_id !== realUserId) {
        const { error: linkErr } = await supabaseAdmin.from('clients').update({ user_id: realUserId }).eq('id', c.id)
        if (!linkErr) linkedIds.push(c.id)
      }
    }

    return Response.json({ success: true, noLoginIds, linkedIds })
  } catch (error) {
    console.error('clients-login-status error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
