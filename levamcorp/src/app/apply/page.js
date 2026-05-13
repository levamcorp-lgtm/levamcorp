'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

export default function ApplyPage() {
  const [form, setForm] = useState({
    business_name: '', contact_name: '', email: '', phone: '',
    address: '', business_type: '', ein: '', years_in_business: '',
    categories: [], monthly_volume: '', referral_source: '', notes: ''
  })
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['Electronics','Smart TVs','Home appliances','Kitchen essentials','Small appliances','All categories']

  const toggleCat = (cat) => {
    setForm(f => ({ ...f, categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat] }))
  }

  const handleSubmit = async () => {
    if (!form.business_name || !form.email) { setError('Please fill in required fields.'); return }
    if (!agreed) { setError('Please agree to the terms and conditions.'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('applications').insert([form])
      if (err) throw err
      // Send confirmation email
      await fetch('/api/send-application-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, businessName: form.business_name, contactName: form.contact_name })
      })
      setSubmitted(true)
    } catch (e) { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 4, padding: '3rem', textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: 32, marginBottom: '1rem', color: '#2a7d4f' }}>✓</div>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#111', marginBottom: '0.75rem' }}>Application received</h2>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Thank you for applying. Our team will contact you at <strong style={{ color: '#333' }}>{form.email}</strong> within 1–2 business days.
        </p>
        <Link href="/" style={{ fontSize: 11, color: '#2d7dd2', textDecoration: 'none' }}>← Back to home</Link>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon"><div className="logo-l-vert" /><div className="logo-l-horiz" /><div className="logo-accent" /></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.18em', color: '#222', textTransform: 'uppercase' }}>Levam</div>
            <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 2 }}>Corp · Distributors</div>
          </div>
        </div>
        <Link href="/" style={{ fontSize: 11, color: '#aaa', textDecoration: 'none' }}>← Back to home</Link>
      </nav>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '3rem 2rem 4rem' }}>
        <div style={{ marginBottom: '2.5rem', paddingBottom: '2rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
          <div className="section-tag">Distributor application</div>
          <h1 style={{ fontSize: 26, fontWeight: 500, color: '#111', marginBottom: '0.5rem' }}>Apply to become a Levam Corp partner</h1>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>Our team reviews every application manually and will contact you within 1–2 business days.</p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>Business information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field"><label>Business name *</label><input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} placeholder="Your company LLC" /></div>
            <div className="field"><label>Business type</label>
              <select value={form.business_type} onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}>
                <option value="">Select type</option>
                {['Retailer','Wholesaler','Online seller','Reseller','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>EIN / Tax ID</label><input value={form.ein} onChange={e => setForm(f => ({ ...f, ein: e.target.value }))} placeholder="XX-XXXXXXX" /></div>
            <div className="field"><label>Years in business</label>
              <select value={form.years_in_business} onChange={e => setForm(f => ({ ...f, years_in_business: e.target.value }))}>
                <option value="">Select range</option>
                {['Less than 1 year','1–3 years','3–5 years','5+ years'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Business address</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street address, City, State, ZIP" /></div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>Contact information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field"><label>Contact name *</label><input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} placeholder="John Smith" /></div>
            <div className="field"><label>Email address *</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@yourbusiness.com" /></div>
            <div className="field"><label>Phone number</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (305) 000-0000" /></div>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>Product interest</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {categories.map(cat => (
              <div key={cat} onClick={() => toggleCat(cat)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                border: `0.5px solid ${form.categories.includes(cat) ? 'rgba(45,125,210,0.5)' : 'rgba(0,0,0,0.08)'}`,
                background: form.categories.includes(cat) ? 'rgba(45,125,210,0.08)' : '#fff',
                borderRadius: 2, cursor: 'pointer'
              }}>
                <div style={{ width: 14, height: 14, border: `0.5px solid ${form.categories.includes(cat) ? '#2d7dd2' : '#ccc'}`, background: form.categories.includes(cat) ? '#2d7dd2' : 'transparent', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {form.categories.includes(cat) && <span style={{ color: '#fff', fontSize: 9 }}>✓</span>}
                </div>
                <span style={{ fontSize: 12, color: form.categories.includes(cat) ? '#2d7dd2' : '#666' }}>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#bbb', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>Volume & expectations</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="field"><label>Estimated monthly order volume</label>
              <select value={form.monthly_volume} onChange={e => setForm(f => ({ ...f, monthly_volume: e.target.value }))}>
                <option value="">Select range</option>
                {['$1,000 – $5,000','$5,000 – $15,000','$15,000 – $50,000','$50,000+'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>How did you hear about us?</label>
              <select value={form.referral_source} onChange={e => setForm(f => ({ ...f, referral_source: e.target.value }))}>
                <option value="">Select source</option>
                {['Referral','Social media','Google search','Trade show','Other'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>Anything else?</label><textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Tell us about your business..." style={{ resize: 'vertical' }} /></div>
        </div>

        <div onClick={() => setAgreed(!agreed)} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '1.25rem', background: '#f7f8fa', border: `0.5px solid ${agreed ? 'rgba(45,125,210,0.3)' : 'rgba(0,0,0,0.08)'}`, borderRadius: 2, marginBottom: '1.5rem', cursor: 'pointer' }}>
          <div style={{ width: 16, height: 16, border: `0.5px solid ${agreed ? '#2d7dd2' : '#ccc'}`, background: agreed ? '#2d7dd2' : 'transparent', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            {agreed && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
          </div>
          <p style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>I confirm that the information provided is accurate and I agree to Levam Corp's Terms & Conditions and Privacy Policy.</p>
        </div>

        {error && <div style={{ fontSize: 12, color: '#c0392b', marginBottom: '1rem', padding: '8px 12px', background: '#fff5f5', border: '0.5px solid rgba(192,57,43,0.2)', borderRadius: 2 }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading} style={{ padding: '13px 32px', background: loading ? '#aaa' : '#2d7dd2', color: '#fff', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 2 }}>
          {loading ? 'Submitting...' : 'Submit application'}
        </button>
      </div>
    </div>
  )
}
