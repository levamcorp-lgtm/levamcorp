'use client'
import Link from 'next/link'

export default function RMAPage() {
  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 3rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 34, height: 34 }}>
            <div style={{ position: 'absolute', left: 7, top: 0, width: 2.5, height: 27, background: '#444' }} />
            <div style={{ position: 'absolute', left: 7, bottom: 0, width: 20, height: 2.5, background: '#444' }} />
            <div style={{ position: 'absolute', left: 12, bottom: 7, width: 12, height: 2.5, background: '#2d7dd2' }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Levam</div>
            <div style={{ fontSize: 9, letterSpacing: '0.32em', color: '#fff', opacity: 0.7, textTransform: 'uppercase', marginTop: 3 }}>Corp · Distributors</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Back to home</Link>
          <Link href="/portal" style={{ fontSize: 12, fontWeight: 600, padding: '9px 22px', border: '0.5px solid #2d7dd2', background: 'rgba(45,125,210,0.15)', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none' }}>Client portal ↗</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)', padding: '4rem 3rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 10 }}>Legal · Returns</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Return Merchandise Authorization (RMA) Policy</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
            Last updated: May 15, 2025 · Effective immediately
          </p>
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'rgba(231,76,60,0.1)', border: '0.5px solid rgba(231,76,60,0.3)', borderRadius: 4 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: '#e74c3c' }}>⚠ Important:</strong> All sales made by Levam Corp Distributors are final. Returns, exchanges, and refunds are only considered in strictly limited circumstances as outlined below. No exceptions will be made outside of this policy.
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* SECTION 1 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>1. All Sales Are Final</h2>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2 }}>
            Levam Corp Distributors operates under a strict <strong>All Sales Final</strong> policy. Once an order has been confirmed and payment has been received, the sale is considered complete and binding. Under no circumstances will Levam Corp accept returns, issue refunds, or process exchanges for the following reasons:
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Change of mind or order placed in error',
              'Product not selling as expected in the market',
              'Overstock or excess inventory on the partner\'s end',
              'Pricing disputes after order confirmation',
              'Delays in shipping or fulfillment timelines',
              'Products purchased for the wrong market or channel',
              'Failure to verify product specifications before ordering',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: 12, padding: '8px 12px', background: 'rgba(231,76,60,0.04)', border: '0.5px solid rgba(231,76,60,0.12)', borderRadius: 3 }}>
                <span style={{ color: '#e74c3c', fontWeight: 700, flexShrink: 0 }}>✕</span>
                <span style={{ fontSize: 13, color: '#555' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>2. Eligible RMA Circumstances</h2>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2, marginBottom: '1rem' }}>
            An RMA request will <strong>only</strong> be considered under the following strictly limited circumstances:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { title: 'Arrived damaged', desc: 'Product was physically damaged during transit and shows clear evidence of damage upon delivery.' },
              { title: 'Defective unit', desc: 'Product is non-functional upon arrival due to a manufacturing defect, with no signs of mishandling by the partner.' },
              { title: 'Wrong item shipped', desc: 'Levam Corp shipped a product that does not match the confirmed order (different SKU, model, or specification).' },
              { title: 'Significant quantity discrepancy', desc: 'The quantity received is materially less than the quantity invoiced and confirmed.' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'rgba(42,125,79,0.04)', border: '0.5px solid rgba(42,125,79,0.15)', borderRadius: 3 }}>
                <span style={{ color: '#2a7d4f', fontWeight: 700, flexShrink: 0, fontSize: 16 }}>✓</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#777', lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>3. 48-Hour Reporting Window</h2>
          <div style={{ padding: '1rem 1.5rem', background: 'rgba(231,76,60,0.06)', border: '0.5px solid rgba(231,76,60,0.2)', borderRadius: 4, marginBottom: '1rem' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#c0392b', margin: 0 }}>
              ⚠ All RMA claims must be submitted within 48 hours of delivery. No exceptions.
            </p>
          </div>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2 }}>
            The 48-hour window begins at the time of confirmed delivery as recorded by the shipping carrier's tracking system. Claims submitted after this window will be automatically denied, regardless of the circumstances. It is the Partner's responsibility to inspect all deliveries immediately upon receipt.
          </p>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2, marginTop: '0.75rem' }}>
            Acceptance of a shipment without filing a timely claim constitutes acknowledgment that the goods were received in satisfactory condition and in the correct quantity.
          </p>
        </div>

        {/* SECTION 4 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>4. How to Submit an RMA Request</h2>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2, marginBottom: '1.25rem' }}>To initiate an RMA claim, the Partner must send an email to <strong>partners@levamcorp.com</strong> within the 48-hour window with the subject line: <strong>"RMA Request — Order #[Order Number]"</strong>. The email must include all of the following:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['01', 'Order number and invoice reference number'],
              ['02', 'Date and time of delivery'],
              ['03', 'Detailed written description of the issue'],
              ['04', 'Clear photographs showing the damage or defect from multiple angles'],
              ['05', 'Photographs of the original packaging and shipping label'],
              ['06', 'The quantity of affected units'],
              ['07', 'Partner business name and contact information'],
            ].map(([num, text]) => (
              <div key={num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 14px', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2d7dd2', background: 'rgba(45,125,210,0.1)', padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>{num}</span>
                <span style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#999', lineHeight: 1.8, marginTop: '1rem', fontStyle: 'italic' }}>
            Incomplete claims — missing photos, missing order information, or submitted after the 48-hour window — will be automatically denied without further review.
          </p>
        </div>

        {/* SECTION 5 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>5. RMA Review Process</h2>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2, marginBottom: '1rem' }}>Upon receipt of a complete RMA request, Levam Corp will:</p>
          {[
            ['Review', 'Our team will review the claim and all supporting documentation within 3–5 business days.'],
            ['Decision', 'Levam Corp will notify the Partner via email with our decision — approval or denial.'],
            ['Resolution', 'If approved, Levam Corp will, at its sole discretion, offer one of the following resolutions.'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(45,125,210,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#2d7dd2' }}>→</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#777', lineHeight: 1.7 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 6 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>6. Approved RMA Resolutions</h2>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2, marginBottom: '1rem' }}>
            If an RMA claim is approved, Levam Corp will determine the appropriate resolution at its sole discretion. <strong>No cash refunds will be issued under any circumstances.</strong> Approved resolutions are limited to:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🔄', title: 'Replacement', desc: 'Levam Corp will ship a replacement unit of the same product, subject to availability.' },
              { icon: '💳', title: 'Store credit', desc: 'A credit equal to the value of the affected units will be applied toward a future order. Store credits are non-transferable and expire after 90 days.' },
              { icon: '📦', title: 'Partial credit', desc: 'For partial quantity discrepancies, a proportional credit will be issued for the missing units only.' },
            ].map(item => (
              <div key={item.title} style={{ display: 'flex', gap: 14, padding: '14px', background: 'rgba(45,125,210,0.04)', border: '0.5px solid rgba(45,125,210,0.12)', borderRadius: 4 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: 'rgba(231,76,60,0.06)', border: '0.5px solid rgba(231,76,60,0.2)', borderRadius: 4 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#c0392b', margin: 0 }}>No cash refunds, wire transfers, ACH reversals, or chargebacks will be accepted as a form of resolution under any circumstances.</p>
          </div>
        </div>

        {/* SECTION 7 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>7. Return Shipping</h2>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2 }}>
            If Levam Corp determines that the defective or incorrect item must be returned, a Return Merchandise Authorization number (RMA#) will be issued. Products returned without a valid RMA# will be refused and returned to sender at the Partner's expense.
          </p>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2, marginTop: '0.75rem' }}>
            Return shipping costs will be covered by Levam Corp only in cases where the wrong item was shipped. In all other approved cases, return shipping is the Partner's responsibility unless otherwise agreed in writing.
          </p>
        </div>

        {/* SECTION 8 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>8. Chargebacks & Disputes</h2>
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(231,76,60,0.06)', border: '0.5px solid rgba(231,76,60,0.2)', borderRadius: 4, marginBottom: '1rem' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#c0392b', margin: 0 }}>⚠ Initiating a chargeback or payment dispute without first following this RMA process is a violation of our Partner Agreement.</p>
          </div>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2 }}>
            Partners who initiate chargebacks or payment disputes outside of this RMA process will have their account immediately suspended and all outstanding credits forfeited. Levam Corp reserves the right to pursue legal action and recover all associated costs, fees, and damages resulting from fraudulent or unjustified chargebacks.
          </p>
        </div>

        {/* SECTION 9 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>9. Contact for RMA Requests</h2>
          <p style={{ fontSize: 13, color: '#555', lineHeight: 2, marginBottom: '1rem' }}>All RMA requests must be submitted via email only:</p>
          <div style={{ padding: '1.25rem 1.5rem', background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4 }}>
            <div style={{ fontSize: 13, color: '#333', lineHeight: 2 }}>
              <strong>Email:</strong> partners@levamcorp.com<br />
              <strong>Subject line:</strong> RMA Request — Order #[Your Order Number]<br />
              <strong>Response time:</strong> 3–5 business days<br />
              <strong>Address:</strong> 6315 NW 99th Ave, Doral, FL 33178<br />
              <strong>Phone:</strong> (786) 878-4122 / (786) 546-9476
            </div>
          </div>
        </div>

        {/* FOOTER BOX */}
        <div style={{ background: '#111', borderRadius: 8, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            By placing an order with Levam Corp Distributors, you acknowledge that you have read and agree to this RMA Policy in its entirety.
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/terms" style={{ padding: '11px 24px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none' }}>View Terms & Conditions</Link>
            <Link href="/contact" style={{ padding: '11px 24px', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 3, textDecoration: 'none' }}>Contact us</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: 11, color: '#aaa' }}>
          © 2025 Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com
        </div>
      </div>
    </div>
  )
}
