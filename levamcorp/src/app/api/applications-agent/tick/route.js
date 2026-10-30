import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { approveApplicationAccount } from '../../../../lib/approveApplicationAccount'

// Same admin list as every other admin page's ADMIN_EMAILS — duplicated on purpose,
// matching this codebase's per-file convention, since this route has no page to import from.
const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const resend = new Resend(process.env.RESEND_API_KEY)

// Mirrors admin/applications/page.js's EXTERNAL_DOC_MARKER — a document confirmed outside
// the portal (WhatsApp, email, in person) instead of uploaded, written into the same
// ein_document_url/resale_tax_document_url columns rather than a fake storage path.
const isDocPresent = (path) => typeof path === 'string' && path.length > 0

const REQUIRED_FIELDS = [
  ['business_name', 'Business name'],
  ['contact_name', 'Contact name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['business_type', 'Legal structure'],
  ['ein_number', 'EIN number'],
  ['resale_tax_number', 'Resale tax number'],
]

function findMissing(app) {
  const missing = REQUIRED_FIELDS.filter(([field]) => !app[field] || !String(app[field]).trim()).map(([, label]) => label)
  if (!isDocPresent(app.ein_document_url)) missing.push('EIN / SS-4 letter')
  if (!isDocPresent(app.resale_tax_document_url)) missing.push('Florida resale certificate')
  return missing
}

// Asks Claude to sanity-check a *complete* application for anything that looks wrong —
// test/placeholder data, nonsensical answers, mismatched info — before letting it through
// without a human ever looking at it. Deliberately conservative: any parsing failure or
// uncertainty falls back to "flag", never "approve". This never sees the actual uploaded
// documents, only the form fields — it's a plausibility check, not a document verification.
async function assessApplication(app) {
  const summary = {
    business_name: app.business_name,
    contact_name: app.contact_name,
    email: app.email,
    phone: app.phone,
    address: app.address,
    business_type: app.business_type,
    years_in_business: app.years_in_business,
    monthly_volume: app.monthly_volume,
    categories: app.categories,
    ein_number: app.ein_number,
    resale_tax_number: app.resale_tax_number,
    heard_about: app.heard_about,
    heard_about_detail: app.heard_about_detail,
    notes: app.notes,
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      temperature: 0,
      system: `You review new wholesale-partner applications for Levam Corp Distributors, a B2B distributor in Doral, FL. You decide whether an application can be auto-approved without a human looking at it, or needs to be flagged for manual review.

Flag it if anything looks off: placeholder/test data (e.g. "asdf", "test test", "N/A" used everywhere), an EIN or resale tax number that isn't a plausible real-looking number, a business name/contact that looks fake or nonsensical, answers that don't make sense together, or anything else that gives you real doubt. If you are not confident, flag it — approving is the one-way door, flagging just means a person looks at it.

Respond with ONLY a JSON object, no other text: {"decision":"approve","reason":"..."} or {"decision":"flag","reason":"..."}. The reason should be one short sentence a busy admin can read in two seconds.`,
      messages: [{ role: 'user', content: JSON.stringify(summary) }],
    })
    const text = response.content[0]?.text || ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in model response')
    const parsed = JSON.parse(match[0])
    if (parsed.decision !== 'approve' && parsed.decision !== 'flag') throw new Error('Unexpected decision value')
    return { decision: parsed.decision, reason: String(parsed.reason || '').slice(0, 300) }
  } catch (err) {
    return { decision: 'flag', reason: `Agent review failed, flagged for safety: ${err.message}` }
  }
}

async function sendAdminAlert(app, reason) {
  try {
    await resend.emails.send({
      from: 'Levam Corp Distributors <partners@levamcorp.com>',
      to: ADMIN_EMAILS,
      subject: `⚠ Application needs a manual look — ${app.business_name || app.email}`,
      html: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#16181d;max-width:560px">
        <p>The applications agent reviewed <strong>${app.business_name || '(no business name)'}</strong> (${app.email}) and didn't auto-approve it.</p>
        <p style="padding:12px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;color:#9a3412"><strong>Reason:</strong> ${reason}</p>
        <p><a href="https://www.levamcorp.com/admin/applications" style="color:#2F7DF6">Open Applications →</a></p>
      </div>`,
    })
  } catch (err) {
    console.error('applications-agent: failed to send admin alert email', err)
  }
}

// Fires on a schedule (see DESIGN.md for the Supabase pg_cron setup) roughly every 15
// minutes. Each run picks up applications whose random 4–5h review window has come due
// (set by a DB trigger on insert — see migration in DESIGN.md) and haven't been reviewed
// by the agent yet, and either auto-approves them (reusing the exact same account
// provisioning as the admin's manual Approve button) or flags them and emails the admins.
// A human can still approve/reject manually at any time regardless of what the agent did —
// this never removes that option, it only skips the wait when things are clearly in order.
export async function POST(request) {
  const secret = request.headers.get('x-cron-secret')
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const origin = new URL(request.url).origin
  const nowIso = new Date().toISOString()

  const { data: dueApps, error: fetchErr } = await supabaseAdmin
    .from('applications')
    .select('*')
    .or('status.is.null,status.eq.pending')
    .is('agent_reviewed_at', null)
    .lte('agent_review_due_at', nowIso)
    .order('agent_review_due_at', { ascending: true })
    .limit(20)

  if (fetchErr) {
    console.error('applications-agent: failed to fetch due applications', fetchErr)
    return Response.json({ success: false, error: fetchErr.message }, { status: 500 })
  }

  let approved = 0
  let flagged = 0

  for (const app of dueApps || []) {
    const missing = findMissing(app)
    let decision, reason

    if (missing.length) {
      decision = 'flag'
      reason = `Incomplete application — missing: ${missing.join(', ')}.`
    } else {
      const assessment = await assessApplication(app)
      decision = assessment.decision
      reason = assessment.reason
    }

    if (decision === 'approve') {
      try {
        const { tempPassword } = await approveApplicationAccount(supabaseAdmin, {
          applicationId: app.id, email: app.email, businessName: app.business_name, contactName: app.contact_name,
          phone: app.phone, address: app.address, businessType: app.business_type, monthlyVolume: app.monthly_volume,
          yearsInBusiness: app.years_in_business, einNumber: app.ein_number, resaleTaxNumber: app.resale_tax_number,
          einDocumentUrl: app.ein_document_url, resaleTaxDocumentUrl: app.resale_tax_document_url,
        })

        const [welcomeRes, credsRes] = await Promise.all([
          fetch(`${origin}/api/send-approval-email`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: app.email, contactName: app.contact_name, businessName: app.business_name }),
          }),
          fetch(`${origin}/api/send-credentials-email`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: app.email, password: tempPassword, businessName: app.business_name, contactName: app.contact_name }),
          }),
        ])
        if (!welcomeRes.ok || !credsRes.ok) console.error('applications-agent: approval emails failed for', app.email)

        await supabaseAdmin.from('applications').update({
          agent_reviewed_at: new Date().toISOString(), agent_decision: 'approved', agent_flag_reason: null,
        }).eq('id', app.id)
        approved++
      } catch (err) {
        // Provisioning failed — never leave this silently unresolved. Fall back to a
        // flag so a human sees it, instead of looping on the same failure every 15 minutes.
        console.error('applications-agent: auto-approve failed for', app.email, err)
        await supabaseAdmin.from('applications').update({
          agent_reviewed_at: new Date().toISOString(), agent_decision: 'flagged',
          agent_flag_reason: `Auto-approve failed: ${err.message}`,
        }).eq('id', app.id)
        await sendAdminAlert(app, `Auto-approve failed: ${err.message}`)
        flagged++
      }
    } else {
      await supabaseAdmin.from('applications').update({
        agent_reviewed_at: new Date().toISOString(), agent_decision: 'flagged', agent_flag_reason: reason,
      }).eq('id', app.id)
      await sendAdminAlert(app, reason)
      flagged++
    }
  }

  return Response.json({ success: true, processed: (dueApps || []).length, approved, flagged })
}
