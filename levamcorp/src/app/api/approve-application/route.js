import { createClient } from '@supabase/supabase-js'
import { approveApplicationAccount } from '../../../lib/approveApplicationAccount'

// Approving an application used to only mark it approved and add a row to `clients` —
// it never actually created a real login, so the admin had to go create the Supabase
// Auth user and password by hand every time before the client could sign in anywhere.
// This does the whole thing: real auth account (or reuses one if this email already has
// one), the clients record, and the application status — all with the service role, since
// creating/resetting an auth user isn't something the browser's anon key can do.
//
// The account-provisioning logic itself lives in lib/approveApplicationAccount.js, shared
// with the applications agent's auto-approve path (api/applications-agent/tick) — both
// need to behave identically, not drift into two slightly different copies.
export async function POST(request) {
  try {
    const body = await request.json()
    const { applicationId, email } = body
    if (!applicationId || !email) return Response.json({ success: false, error: 'Missing applicationId or email' }, { status: 400 })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { tempPassword } = await approveApplicationAccount(supabaseAdmin, body)

    return Response.json({ success: true, tempPassword })
  } catch (error) {
    console.error('approve-application error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
