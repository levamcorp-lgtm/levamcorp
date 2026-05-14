'use client'
import Link from 'next/link'

export default function TermsPage() {
  const sections = [
    {
      title: '1. Parties & Agreement',
      content: `These Terms and Conditions ("Agreement") constitute a legally binding contract between Levam Corp Distributors, a Florida-based wholesale distribution company located at 6315 NW 99th Ave, Doral, FL 33178 ("Levam Corp," "we," "us," or "our"), and the approved distributor partner ("Partner," "you," or "your") who has been granted access to our private distribution portal.

By submitting a partner application, accessing the Levam Corp partner portal, or placing any order, you acknowledge that you have read, understood, and agree to be bound by this Agreement in its entirety.`
    },
    {
      title: '2. Partner Eligibility & Application',
      content: `Access to Levam Corp's wholesale pricing, catalog, and ordering system is strictly limited to approved business entities. To be eligible, partners must:

• Hold a valid Employer Identification Number (EIN) issued by the IRS
• Possess a current and valid state-issued Resale Tax Certificate
• Operate as a registered business entity (LLC, Corporation, or equivalent)
• Operate primarily in the United States

Levam Corp reserves the right to approve or reject any application at its sole discretion, without obligation to provide a reason for denial. Approval of a partner application does not guarantee continued access and may be revoked at any time.`
    },
    {
      title: '3. All Sales Are Final',
      content: `ALL SALES MADE BY LEVAM CORP DISTRIBUTORS ARE FINAL. Once an order has been confirmed and payment has been received, no returns, exchanges, refunds, or cancellations will be accepted under any circumstances, except as required by applicable law.

Partners are responsible for verifying product specifications, quantities, and pricing prior to order submission. Levam Corp shall not be liable for any errors in orders submitted by the Partner.`
    },
    {
      title: '4. Damaged or Defective Goods',
      content: `Claims for damaged, defective, or incorrect goods must be submitted in writing to partners@levamcorp.com within 48 hours of delivery. Claims submitted after this window will not be accepted.

All claims must include:
• Order number and invoice reference
• Photographic evidence of the damage or defect
• Description of the issue and affected units

Levam Corp will review all claims and, at its sole discretion, may offer a credit, replacement, or partial refund. Acceptance of a shipment constitutes acknowledgment that the goods were received in satisfactory condition unless a timely claim is filed.`
    },
    {
      title: '5. Pricing & Payment Terms',
      content: `All prices listed in the partner portal are wholesale prices exclusive of applicable taxes, shipping, and freight charges, which will be quoted separately.

Payment is due within 15 days of invoice date (Net 15) unless otherwise agreed in writing. Accepted payment methods include Credit Card, Debit Card, ACH Bank Transfer, and Wire Transfer. Levam Corp reserves the right to require payment in advance for new partners or partners with outstanding balances.

Levam Corp reserves the right to modify pricing at any time without prior notice. Prices confirmed at the time of order will be honored for that specific order.`
    },
    {
      title: '6. Order Processing & Dispatch',
      content: `Orders are subject to product availability and confirmation by Levam Corp. Submission of an order through the portal does not constitute a binding contract until Levam Corp confirms the order in writing or changes the order status to "Confirmed."

Average dispatch time is 48 hours from order confirmation, subject to inventory availability. Levam Corp is not responsible for delays caused by shipping carriers, customs, or events beyond our control.`
    },
    {
      title: '7. Shipping & Delivery',
      content: `Partners may select from the following shipping options at the time of payment:

• Pickup: Partner collects goods at 6315 NW 99th Ave, Doral, FL 33178 at no charge
• Prep Center Delivery: Shipped to Partner's designated prep center — rate quoted separately
• Standard Shipping: Domestic carrier shipping — rate quoted separately
• Freight / LTL: For large or palletized orders — rate quoted separately

Risk of loss and title for products passes to the Partner upon tender of the goods to the carrier or upon pickup. Levam Corp is not responsible for loss, theft, or damage occurring during transit.`
    },
    {
      title: '8. Product Availability & Stock',
      content: `Product availability is subject to change without notice. Levam Corp makes reasonable efforts to maintain accurate stock information in the partner portal; however, stock levels may fluctuate due to demand and supply chain conditions.

In the event that an ordered product is unavailable after order confirmation, Levam Corp will notify the Partner and offer a substitute product of equal or greater value, a credit toward a future order, or a full refund for the unavailable item(s).`
    },
    {
      title: '9. Resale & Prohibited Uses',
      content: `Products purchased through Levam Corp are intended for resale only. Partners agree not to:

• Resell products in violation of any manufacturer's authorized reseller agreements
• Misrepresent products or make false claims about their origin or condition
• Sell products to end users in jurisdictions where such products are prohibited
• Use Levam Corp's name, logo, or trademarks without prior written consent

Levam Corp does not warrant that products purchased through our portal may be sold through any particular channel, including Amazon, Walmart, or other marketplaces. Partners are solely responsible for compliance with platform policies.`
    },
    {
      title: '10. Confidentiality',
      content: `All pricing information, product catalogs, and business terms provided through the partner portal are strictly confidential and intended solely for the Partner's internal use. Partners agree not to disclose, share, or publish any such information to third parties without prior written consent from Levam Corp.

This confidentiality obligation survives termination of the Partner relationship.`
    },
    {
      title: '11. Limitation of Liability',
      content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LEVAM CORP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF BUSINESS, OR LOSS OF DATA, EVEN IF LEVAM CORP HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

Levam Corp's total liability to any Partner for any claim arising out of or relating to this Agreement shall not exceed the total amount paid by the Partner for the specific order giving rise to the claim.`
    },
    {
      title: '12. Termination',
      content: `Levam Corp reserves the right to terminate or suspend a Partner's access to the portal and order system at any time, with or without cause, and with or without notice. Grounds for termination may include, but are not limited to:

• Violation of any provision of this Agreement
• Non-payment of outstanding invoices
• Fraudulent or deceptive conduct
• Inactivity for a period exceeding 12 months

Upon termination, all outstanding invoices become immediately due and payable.`
    },
    {
      title: '13. Governing Law & Dispute Resolution',
      content: `This Agreement shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of laws provisions. Any disputes arising out of or relating to this Agreement shall be resolved exclusively in the state or federal courts located in Miami-Dade County, Florida.

The parties agree to attempt to resolve any dispute through good-faith negotiation before initiating formal legal proceedings.`
    },
    {
      title: '14. Amendments',
      content: `Levam Corp reserves the right to modify these Terms and Conditions at any time. Partners will be notified of material changes via email. Continued use of the partner portal following notification of changes constitutes acceptance of the updated terms.`
    },
    {
      title: '15. Contact Information',
      content: `For questions regarding these Terms and Conditions, please contact us:

Levam Corp Distributors
6315 NW 99th Ave
Doral, FL 33178

Email: partners@levamcorp.com
Phone: (786) 878-4122 / (786) 546-9476
Website: levamcorp.com`
    },
  ]

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
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 10 }}>Legal</div>
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Terms & Conditions</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
            Last updated: January 1, 2025 · Effective immediately upon partner approval
          </p>
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.25)', borderRadius: 4 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: '#fff' }}>Important:</strong> These Terms and Conditions govern all transactions and interactions between Levam Corp Distributors and its approved wholesale partners. By applying for or maintaining partner status, you agree to be bound by these terms.
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* TABLE OF CONTENTS */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '1.5rem 2rem', marginBottom: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Table of Contents</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {sections.map((s, i) => (
              <a key={i} href={`#section-${i}`} style={{ fontSize: 12, color: '#2d7dd2', textDecoration: 'none', padding: '3px 0' }}>{s.title}</a>
            ))}
          </div>
        </div>

        {/* SECTIONS */}
        {sections.map((section, i) => (
          <div key={i} id={`section-${i}`} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '2rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #2d7dd2', display: 'inline-block' }}>{section.title}</h2>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 2, whiteSpace: 'pre-line' }}>{section.content}</div>
          </div>
        ))}

        {/* SIGNATURE BOX */}
        <div style={{ background: '#111', borderRadius: 8, padding: '2rem', marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            By accessing our partner portal or placing an order, you acknowledge that you have read, understood, and agree to these Terms and Conditions in their entirety.
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/apply" style={{ padding: '11px 28px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', boxShadow: '0 4px 14px rgba(45,125,210,0.35)' }}>Apply to become a partner</Link>
            <Link href="/contact" style={{ padding: '11px 28px', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 3, textDecoration: 'none' }}>Contact us with questions</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: 11, color: '#aaa' }}>
          © 2025 Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com
        </div>
      </div>
    </div>
  )
}
