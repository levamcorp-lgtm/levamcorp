'use client'
import Link from 'next/link'

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Introduction',
      content: `Levam Corp Distributors ("Levam Corp," "we," "us," or "our"), located at 6315 NW 99th Ave, Doral, FL 33178, is committed to protecting the privacy and security of your personal and business information.

This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit our website at levamcorp.com, submit a partner application, or use our private partner portal. Please read this policy carefully. If you disagree with its terms, please discontinue use of our site and services.`
    },
    {
      title: '2. Information We Collect',
      content: `We collect information you provide directly to us, including:

Business Information:
• Business name, legal entity type, and EIN (Employer Identification Number)
• Resale Tax Certificate number and supporting documentation
• Business address, phone number, and email address
• Years in business and estimated monthly purchase volume
• Type of business (retailer, wholesaler, e-commerce seller, etc.)

Personal Contact Information:
• Full name of the primary contact
• Email address and phone number
• Business correspondence and communication records

Order & Transaction Information:
• Order history, quantities, and product selections
• Payment method preferences (we do not store full payment details)
• Shipping addresses and delivery instructions

Technical Information:
• IP address, browser type, and operating system
• Pages visited, time spent on site, and clickstream data
• Cookies and similar tracking technologies (see Section 8)`
    },
    {
      title: '3. How We Use Your Information',
      content: `We use the information we collect for the following purposes:

Partner Onboarding & Verification:
• To review and process your partner application
• To verify your business credentials, EIN, and resale tax status
• To communicate approval or denial of your application

Order Processing & Fulfillment:
• To process, confirm, and fulfill your orders
• To generate invoices, quotes, and shipping documentation
• To coordinate payment and delivery logistics

Account Management:
• To create and maintain your partner portal account
• To send you order confirmations, invoices, and status updates
• To provide customer support and respond to your inquiries

Legal & Compliance:
• To comply with applicable federal and state laws and regulations
• To enforce our Terms and Conditions
• To prevent fraud, unauthorized access, or misuse of our services

Communications:
• To send you operational emails regarding your orders and account
• To notify you of changes to our policies or terms
• We do not send unsolicited marketing emails`
    },
    {
      title: '4. How We Share Your Information',
      content: `We do not sell, trade, or rent your personal or business information to third parties. We may share your information only in the following limited circumstances:

Service Providers:
We work with trusted third-party service providers who assist us in operating our business, including:
• Supabase (database and authentication services)
• Resend (transactional email delivery)
• Vercel (website hosting and infrastructure)

These providers are contractually obligated to protect your information and may not use it for any purpose other than providing services to us.

Legal Requirements:
We may disclose your information if required to do so by law, court order, or governmental authority, or if we believe in good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others.

Business Transfers:
In the event of a merger, acquisition, or sale of all or substantially all of our assets, your information may be transferred as part of that transaction. We will notify you via email and/or prominent notice on our website prior to such transfer.`
    },
    {
      title: '5. Document Storage & Security',
      content: `Documents you upload as part of your partner application — including SS4/EIN letters and Resale Tax Certificates — are stored securely using Supabase Storage with the following protections:

• Documents are stored in a private, access-controlled bucket
• Access is restricted to authorized Levam Corp personnel only
• Documents are not publicly accessible via direct URL
• Data is encrypted in transit using TLS/SSL and at rest

We implement industry-standard security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.`
    },
    {
      title: '6. Data Retention',
      content: `We retain your information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.

Specifically:
• Partner application data: Retained for the duration of the partner relationship, plus 7 years for tax and compliance purposes
• Order and transaction records: Retained for 7 years in accordance with IRS record-keeping requirements
• Uploaded documents (EIN, Resale Tax): Retained for the duration of the partner relationship, plus 7 years
• Account credentials: Deleted within 30 days of account termination upon request

You may request deletion of your data subject to applicable legal retention requirements by contacting us at partners@levamcorp.com.`
    },
    {
      title: '7. Your Rights & Choices',
      content: `Depending on your location and applicable law, you may have the following rights regarding your personal information:

Right to Access: You may request a copy of the personal information we hold about you.

Right to Correction: You may request that we correct inaccurate or incomplete information.

Right to Deletion: You may request that we delete your personal information, subject to legal retention requirements.

Right to Portability: You may request that we provide your data in a structured, machine-readable format.

Right to Opt-Out of Communications: You may unsubscribe from non-essential communications at any time by contacting us at partners@levamcorp.com.

To exercise any of these rights, please contact us using the information in Section 10. We will respond to all requests within 30 days.`
    },
    {
      title: '8. Cookies & Tracking Technologies',
      content: `Our website uses cookies and similar tracking technologies to enhance your browsing experience and analyze site usage.

Types of cookies we use:
• Essential cookies: Required for the website and partner portal to function properly, including authentication and session management
• Analytics cookies: Help us understand how visitors interact with our website (we may use anonymized analytics data)

We do not use advertising cookies or share your data with advertising networks.

You can control cookie settings through your browser preferences. Disabling certain cookies may affect the functionality of our partner portal.`
    },
    {
      title: '9. Children\'s Privacy',
      content: `Our website and services are intended solely for business use by adults operating registered business entities. We do not knowingly collect personal information from individuals under the age of 18. If we become aware that we have collected information from a minor, we will take steps to delete such information promptly.`
    },
    {
      title: '10. Third-Party Links',
      content: `Our website may contain links to third-party websites, including Amazon and Walmart product listings. This Privacy Policy does not apply to those third-party sites. We encourage you to review the privacy policies of any third-party sites you visit, as we have no control over their content or data practices.`
    },
    {
      title: '11. Changes to This Privacy Policy',
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or applicable law. When we make material changes, we will:

• Update the "Last Updated" date at the top of this policy
• Notify active partners via email at the address on file
• Post a notice on our website

Your continued use of our website or partner portal following notification of changes constitutes your acceptance of the updated Privacy Policy.`
    },
    {
      title: '12. Governing Law',
      content: `This Privacy Policy is governed by the laws of the State of Florida. Any disputes arising from this policy shall be resolved in the courts of Miami-Dade County, Florida.`
    },
    {
      title: '13. Contact Us',
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

Levam Corp Distributors
6315 NW 99th Ave
Doral, FL 33178

Email: partners@levamcorp.com
Phone: (786) 878-4122 / (786) 546-9476
Website: levamcorp.com

We will respond to all privacy-related inquiries within 5 business days.`
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
          <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
            Last updated: May 14, 2025 · Effective immediately
          </p>
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', background: 'rgba(45,125,210,0.1)', border: '0.5px solid rgba(45,125,210,0.25)', borderRadius: 4 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, margin: 0 }}>
              <strong style={{ color: '#fff' }}>Your privacy matters to us.</strong> This policy explains exactly what information we collect, why we collect it, and how we protect it. We do not sell your data to third parties.
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

        {/* FOOTER BOX */}
        <div style={{ background: '#111', borderRadius: 8, padding: '2rem', marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Questions about this Privacy Policy? We're happy to help.
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact" style={{ padding: '11px 28px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 3, textDecoration: 'none', boxShadow: '0 4px 14px rgba(45,125,210,0.35)' }}>Contact us</Link>
            <Link href="/terms" style={{ padding: '11px 28px', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 3, textDecoration: 'none' }}>View Terms & Conditions</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: 11, color: '#aaa' }}>
          © 2025 Levam Corp Distributors · 6315 NW 99th Ave, Doral, FL 33178 · partners@levamcorp.com
        </div>
      </div>
    </div>
  )
}
