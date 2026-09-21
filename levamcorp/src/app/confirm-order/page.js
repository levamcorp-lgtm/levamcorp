'use client'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const ACCENT = '#2F7DF6'
const mono = "'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace"

const PAYMENT_METHODS = [
  { value: 'wire', label: 'Wire Transfer', desc: 'Same day · Bank fees may apply' },
]

const globalStyle = `
  .lc-mono { font-family:${mono}; }
  input, textarea, button { font-family: inherit; }
  input:focus, textarea:focus { outline: 2px solid ${ACCENT}; outline-offset: -2px; }
  input::placeholder, textarea::placeholder { color: rgba(8,9,11,0.35); }
  /* 16px minimum on real inputs — under that, iOS Safari auto-zooms the page on focus */
  input[type="tel"], input[type="text"], textarea { font-size: 16px !important; }
  @media (max-width: 420px) {
    .tb-sub { display: none; }
    .tb-wa-long { display: none; }
    .tb-wa-short { display: inline !important; }
  }
`

const money = (n) => '$' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const clientNameFor = (notes) => (notes || '').split('Business: ')[1]?.split(/[|\n]/)[0]?.trim() || null

function TopBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px clamp(16px,4vw,48px)', borderBottom: '1px solid rgba(242,239,230,0.14)' }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0, textDecoration: 'none', color: '#F2EFE6' }}>
        <span style={{ flexShrink: 0, display: 'inline-block', width: 15, height: 15, border: '1px solid rgba(242,239,230,0.6)', borderLeft: `3px solid ${ACCENT}` }} />
        <span className="lc-mono" style={{ flexShrink: 0, fontWeight: 700, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Levamcorp</span>
        <span className="tb-sub lc-mono" style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6F6D67', whiteSpace: 'nowrap' }}>Doral · FL</span>
      </Link>
      <a href="https://wa.me/17864909005" className="lc-mono" style={{ flexShrink: 0, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F2EFE6', border: '1px solid rgba(242,239,230,0.3)', padding: '11px 14px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
        <span className="tb-wa-long">Question? WhatsApp →</span>
        <span className="tb-wa-short" style={{ display: 'none' }}>WhatsApp →</span>
      </a>
    </div>
  )
}

function Chip({ label, desc, on, onClick }) {
  return (
    <div role="radio" aria-checked={on} tabIndex={0} onClick={onClick} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 44, padding: '13px 14px', marginBottom: 8, border: `1.5px solid ${on ? ACCENT : 'rgba(8,9,11,0.14)'}`, background: on ? '#E8F0FF' : '#FFFFFF', cursor: 'pointer' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#08090B' }}>{label}</div>
        {desc && <div style={{ fontSize: 12.5, marginTop: 2, color: '#8A8780' }}>{desc}</div>}
      </div>
      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${on ? ACCENT : '#D8D4C8'}`, background: on ? ACCENT : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {on && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }} />}
      </div>
    </div>
  )
}

function Lbl({ text }) {
  return <div className="lc-mono" style={{ fontSize: 11, fontWeight: 700, color: '#5C5A55', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{text}</div>
}

function ConfirmOrderInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('loading') // loading | notfound | ready | submitted
  const [order, setOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [fulfillment, setFulfillment] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!token) { setStatus('notfound'); return }
    fetch('/api/confirm-order-lookup', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
    }).then(r => r.json()).then(data => {
      if (!data.found) { setStatus('notfound'); return }
      setOrder(data.order)
      setStatus(data.order.client_confirmed_at ? 'submitted' : 'ready')
    }).catch(() => setStatus('notfound'))
  }, [token])

  const submit = async () => {
    setErr('')
    if (!paymentMethod) { setErr('Pick a payment method.'); return }
    if (!fulfillment) { setErr('Pick pickup or shipping.'); return }
    if (fulfillment === 'shipping' && !address.trim()) { setErr('Enter your shipping address.'); return }
    if (!agreed) { setErr('You need to accept the final sale terms to confirm.'); return }
    setSubmitting(true)
    const res = await fetch('/api/confirm-order-submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, paymentMethod, fulfillment, address, phone }),
    }).then(r => r.json()).catch(() => ({ success: false }))
    setSubmitting(false)
    if (!res.success) { setErr(res.error || "Something went wrong. Please try again or WhatsApp us."); return }
    setOrder(prev => ({ ...prev, client_confirmed_at: new Date().toISOString(), confirmed_payment_method: paymentMethod, confirmed_fulfillment: fulfillment, confirmed_address: fulfillment === 'shipping' ? address.trim() : null, confirmed_phone: phone.trim() || null }))
    setStatus('submitted')
  }

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', background: '#08090B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A8780', fontFamily: mono, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading…</div>
  )

  if (status === 'notfound') return (
    <div style={{ minHeight: '100vh', background: '#08090B', color: '#F2EFE6' }}>
      <style>{globalStyle}</style>
      <TopBar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(60px,10vh,100px) clamp(16px,4vw,48px)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(26px,3.4vw,36px)', fontWeight: 400, letterSpacing: '-.03em', margin: 0 }}>This link isn't valid<span style={{ color: ACCENT }}>.</span></h1>
        <p style={{ marginTop: 14, fontSize: 15, color: '#9A968E', lineHeight: 1.6 }}>It may have expired or been mistyped. Message your rep and they'll send you a fresh one.</p>
        <a href="https://wa.me/17864909005" className="lc-mono" style={{ display: 'inline-block', marginTop: 24, padding: '13px 22px', background: '#F2EFE6', color: '#08090B', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none' }}>WhatsApp us →</a>
      </div>
    </div>
  )

  const items = order?.order_items || []
  const itemCount = items.length
  const businessName = clientNameFor(order?.notes)
  const fulfillLabel = { pickup: 'Pickup — Doral, FL', shipping: 'Shipping' }
  const paymentLabel = (v) => PAYMENT_METHODS.find(m => m.value === v)?.label || v

  if (status === 'submitted') return (
    <div style={{ minHeight: '100vh', background: '#08090B', color: '#F2EFE6', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{globalStyle}</style>
      <TopBar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(30px,6vh,64px) clamp(16px,4vw,48px)' }}>
        <div style={{ background: '#F2EFE6', color: '#08090B', padding: 'clamp(20px,3vh,28px) clamp(22px,3.4vw,34px)' }}>
          <div className="lc-mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', paddingBottom: 11, borderBottom: '1px solid rgba(8,9,11,0.9)', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            <span>Order #{order.order_number}</span>
            <span style={{ color: ACCENT }}>Status · Confirmed</span>
          </div>
          <div style={{ marginTop: 22, display: 'inline-block', border: `2px solid ${ACCENT}`, padding: '8px 14px 9px', textAlign: 'center' }}>
            <div className="lc-mono" style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: ACCENT }}>Confirmed</div>
            <div className="lc-mono" style={{ paddingTop: 3, fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT }}>Levam Corp · Doral FL</div>
          </div>
          <h1 style={{ margin: '22px 0 0', fontSize: 'clamp(28px,3.4vw,38px)', fontWeight: 400, letterSpacing: '-0.03em', lineHeight: 1.05 }}>You're all set<span style={{ color: ACCENT }}>.</span></h1>
          <p style={{ margin: '14px 0 0', maxWidth: '48ch', fontSize: 15, lineHeight: 1.65, color: '#3F3D39' }}>
            Thanks{businessName ? `, ${businessName}` : ''}. Your order is locked in — we'll get it moving.
          </p>
          <div style={{ marginTop: 24, borderTop: '1px solid rgba(8,9,11,0.9)' }}>
            {[
              ['Payment method', paymentLabel(order.confirmed_payment_method)],
              ...(order.confirm_bank_name ? [['Pay to', `${order.confirm_bank_name} · ${order.confirm_bank_account_number}`]] : []),
              ['Fulfillment', fulfillLabel[order.confirmed_fulfillment] || order.confirmed_fulfillment],
              ...(order.confirmed_address ? [['Ship to', order.confirmed_address]] : []),
              ...(order.confirmed_phone ? [['Phone on file', order.confirmed_phone]] : []),
              ['Confirmed', fmt(order.client_confirmed_at)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: 'clamp(112px,32%,168px) 1fr', gap: '10px 14px', alignItems: 'baseline', padding: '11px 0 12px', borderBottom: '1px solid rgba(8,9,11,0.12)' }}>
                <span className="lc-mono" style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5C5A55' }}>{k}</span>
                <span style={{ fontSize: 13.5, color: '#08090B', wordBreak: 'break-word' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '12px 14px', background: 'rgba(47,125,246,0.06)', border: `1px solid ${ACCENT}30` }}>
            <div style={{ fontSize: 12.5, color: '#3F3D39', lineHeight: 1.6 }}>This order is final sale and non-refundable, as confirmed above.</div>
          </div>
          <div style={{ marginTop: 24 }}>
            <a href="https://wa.me/17864909005" className="lc-mono" style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#08090B', borderBottom: `1px solid ${ACCENT}`, paddingBottom: 3, textDecoration: 'none' }}>Need to change something? WhatsApp us →</a>
          </div>
        </div>
      </div>
    </div>
  )

  // status === 'ready' — the form
  return (
    <div style={{ minHeight: '100vh', background: '#08090B', color: '#F2EFE6', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{globalStyle}</style>
      <TopBar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'clamp(30px,5vh,56px) clamp(16px,4vw,48px) 140px' }}>
        <div className="lc-mono" style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6F6D67', paddingBottom: 10 }}>Order confirmation · Form 05</div>
        <h1 style={{ margin: 0, fontSize: 'clamp(28px,3.6vw,42px)', fontWeight: 400, letterSpacing: '-0.04em', lineHeight: 1.05, color: '#F5F2E9' }}>
          Let's lock this in<span style={{ color: ACCENT }}>.</span>
        </h1>
        <p style={{ margin: '12px 0 0', maxWidth: '52ch', fontSize: 14.5, lineHeight: 1.6, color: '#9A968E' }}>
          Order <strong style={{ color: '#F2EFE6' }}>#{order.order_number}</strong>{businessName ? <> for <strong style={{ color: '#F2EFE6' }}>{businessName}</strong></> : null} — confirm how you'll pay and how you want it delivered, and we'll get it moving.
        </p>

        {/* ORDER SUMMARY */}
        <div style={{ marginTop: 26, background: '#F2EFE6', color: '#08090B' }}>
          <div className="lc-mono" style={{ padding: '11px 16px', borderBottom: '1px solid rgba(8,9,11,0.14)', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5C5A55' }}>What you ordered</div>
          {items.length > 0 ? items.map((it, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 16px', borderBottom: '1px solid rgba(8,9,11,0.08)' }}>
              <span style={{ fontSize: 13.5 }}>{it.product_name} <span style={{ color: '#8A8780' }}>&times; {it.quantity}</span></span>
              <span className="lc-mono" style={{ fontSize: 13, fontWeight: 700 }}>{money(it.unit_price * it.quantity)}</span>
            </div>
          )) : (
            <div style={{ padding: '11px 16px', fontSize: 13, color: '#8A8780' }}>Items on file with your rep</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', fontWeight: 700 }}>
            <span style={{ fontSize: 14 }}>Order total</span>
            <span className="lc-mono" style={{ fontSize: 17, color: ACCENT }}>{money(order.total)}</span>
          </div>
        </div>

        {/* PAYMENT */}
        <div style={{ marginTop: 26 }}>
          <Lbl text="Payment method *" />
          {PAYMENT_METHODS.map(m => <Chip key={m.value} label={m.label} desc={m.desc} on={paymentMethod === m.value} onClick={() => setPaymentMethod(m.value)} />)}
          {paymentMethod === 'wire' && (
            order.confirm_bank_name ? (
              <div style={{ marginTop: 6, background: '#F2EFE6', color: '#08090B' }}>
                <div className="lc-mono" style={{ padding: '10px 14px', borderBottom: '1px solid rgba(8,9,11,0.14)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5C5A55' }}>Wire the payment here</div>
                {[
                  ['Bank', order.confirm_bank_name],
                  ['Account name', order.confirm_bank_account_name],
                  ['Account #', order.confirm_bank_account_number],
                  ...(order.confirm_bank_routing ? [['Wire routing', order.confirm_bank_routing]] : []),
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 14px', borderBottom: '1px solid rgba(8,9,11,0.08)' }}>
                    <span style={{ fontSize: 12.5, color: '#5C5A55' }}>{k}</span>
                    <span className="lc-mono" style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div style={{ padding: '10px 14px', fontSize: 12.5, color: '#8A8780', lineHeight: 1.5 }}>Include your order number, #{order.order_number}, in the wire memo so we can match your payment.</div>
              </div>
            ) : (
              <div style={{ marginTop: 6, padding: '10px 14px', background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.3)', fontSize: 12.5, color: '#F5F1E8' }}>Your rep will send the account to wire into — WhatsApp them if you don't have it yet.</div>
            )
          )}
        </div>

        {/* FULFILLMENT */}
        <div style={{ marginTop: 22 }}>
          <Lbl text="How should we get it to you? *" />
          <Chip label="Pickup — Doral, FL" desc="6315 NW 99th Ave, Doral, FL 33178 · Free" on={fulfillment === 'pickup'} onClick={() => setFulfillment('pickup')} />
          <Chip label="Shipping" desc="We'll ship to your address · Additional cost applies" on={fulfillment === 'shipping'} onClick={() => setFulfillment('shipping')} />
          {fulfillment === 'pickup' && (
            <div style={{ padding: '10px 14px', background: 'rgba(18,183,106,0.06)', border: '1px solid rgba(18,183,106,0.25)', marginTop: 4 }}>
              <div style={{ fontSize: 13, color: '#5C5A55', lineHeight: 1.7 }}>Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178<br />Mon–Fri · 9:00 AM – 6:00 PM ET</div>
            </div>
          )}
          {fulfillment === 'shipping' && (
            <div style={{ marginTop: 6 }}>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} placeholder="Full shipping address…" autoComplete="street-address"
                style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid rgba(242,239,230,0.16)', background: '#F2EFE6', padding: '12px 12px', resize: 'vertical', color: '#08090B' }} />
              <div style={{ fontSize: 12.5, color: '#9A968E', marginTop: 6, lineHeight: 1.5 }}>An additional shipping cost applies and will be confirmed by your rep before dispatch.</div>
            </div>
          )}
        </div>

        {/* PHONE */}
        <div style={{ marginTop: 22 }}>
          <Lbl text="Best phone for delivery/pickup coordination (optional)" />
          <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(305) 000-0000"
            style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid rgba(242,239,230,0.16)', background: '#F2EFE6', padding: '13px 12px', color: '#08090B' }} />
        </div>

        {/* TERMS */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 26, padding: '4px 2px', fontSize: 14, color: '#C9C6BC', cursor: 'pointer', lineHeight: 1.6 }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, width: 20, height: 20, accentColor: ACCENT, flexShrink: 0 }} />
          <span>I understand this order is <strong style={{ color: '#F2EFE6' }}>final sale and non-refundable</strong> once confirmed.</span>
        </label>
      </div>

      {/* STICKY CTA — always one thumb-tap away, since most clients open this from a WhatsApp link on their phone */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, paddingTop: 24, paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))', background: 'linear-gradient(to top, #08090B 65%, rgba(8,9,11,0))' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 clamp(16px,4vw,48px)' }}>
          {err && <div style={{ marginBottom: 10, padding: '10px 14px', background: 'rgba(220,38,38,0.14)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5', fontSize: 13.5 }}>{err}</div>}
          <button onClick={submit} disabled={submitting} className="lc-mono" style={{ width: '100%', minHeight: 52, padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: submitting ? '#5C5A55' : '#F2EFE6', color: submitting ? '#F2EFE6' : '#08090B', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', boxShadow: '0 -4px 20px rgba(0,0,0,0.35)', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            <span>{submitting ? 'Confirming…' : 'Confirm my order'}</span>
            {!submitting && <span>→</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmOrderPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmOrderInner />
    </Suspense>
  )
}
