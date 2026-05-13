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
    if (!form.business_name || !form.contact_name || !form.email || !form.phone || !form.ein || !form.business_type || !form.monthly_volume) {
      setError('Please fill in all required fields marked with *'); return
    }
    if (!agreed) { setError('Please agree to the terms to continue.'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('applications').insert([form])
      if (err) throw err
      await fetch('/api/send-application-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, businessName: form.business_name, contactName: form.contact_name })
      })
      setSubmitted(true)
    } catch (e) { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const Field = ({ label, required, children }) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#222', display: 'block', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label} {required && <span style={{ color: '#2d7dd2' }}>*</span>}
      </label>
      {children}
    </div>
  )

  const inputStyle = {
    width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 3,
    fontSize: 14, padding: '11px 14px', outline: 'none',
    fontFamily: 'inherit', color: '#111', background: '#fafafa'
  }

  const selectStyle = { ...inputStyle, appearance: 'none', cursor: 'pointer' }

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fa' }}>
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '3.5rem 3rem', maxWidth: 480, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: 'rgba(45,125,210,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 28 }}>✓</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#111', marginBottom: '0.75rem' }}>Application received!</h2>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: '2rem' }}>
          Thank you, <strong style={{ color: '#333' }}>{form.contact_name}</strong>. We'll review your application and contact you at <strong style={{ color: '#333' }}>{form.email}</strong> within 1–2 business days.
        </p>
        <Link href="/" style={{ fontSize: 13, color: '#2d7dd2', textDecoration: 'none', fontWeight: 600 }}>← Back to homepage</Link>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f7f8fa', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 3rem', background: '#111', borderBottom: '0.5px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: 34, height: 34 }}>
            <div style={{ position: 'absolute', left: 7, top: 0, width: 2.5, height: 27, background: '#444' }} />
            <div style={{ position: 'absolute', left: 7, bottom: 0, width: 20, height: 2.5, background: '#444' }} />
            <div style={{ position: 'absolute', left: 12, bottom: 7, width: 12, height: 2.5, background: '#2d7dd2' }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', lineHeight: 1 }}>Levam</div>
            <div style={{ fontSize: 8, letterSpacing: '0.32em', color: '#2d7dd2', textTransform: 'uppercase', marginTop: 3 }}>Corp · Distributors</div>
          </div>
        </Link>
        <Link href="/portal" style={{ fontSize: 12, fontWeight: 600, padding: '9px 22px', border: '0.5px solid #2d7dd2', background: 'rgba(45,125,210,0.15)', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none' }}>Client portal ↗</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 700, marginBottom: '0.75rem' }}>Partner application</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Apply to become a distributor</h1>
          <p style={{ fontSize: 15, color: '#666', lineHeight: 1.8, maxWidth: 520 }}>
            Fill out the form below and our team will review your application within <strong style={{ color: '#333' }}>1–2 business days</strong>. Fields marked with <span style={{ color: '#2d7dd2', fontWeight: 700 }}>*</span> are required.
          </p>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, overflow: 'hidden' }}>

          {/* SECTION 1 */}
          <div style={{ padding: '2rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>01 · Business information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
              <Field label="Business name" required>
                <input style={inputStyle} value={form.business_name} onChange={e => setForm(f => ({...f, business_name: e.target.value}))} placeholder="Your company LLC" />
              </Field>
              <Field label="Contact name" required>
                <input style={inputStyle} value={form.contact_name} onChange={e => setForm(f => ({...f, contact_name: e.target.value}))} placeholder="Full name" />
              </Field>
              <Field label="Email address" required>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@yourbusiness.com" />
              </Field>
              <Field label="Phone number" required>
                <input style={inputStyle} type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+1 (305) 000-0000" />
              </Field>
              <Field label="Business address" required={false}>
                <input style={inputStyle} value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="Street, City, State, ZIP" />
              </Field>
              <Field label="EIN (Tax ID)" required>
                <input style={inputStyle} value={form.ein} onChange={e => setForm(f => ({...f, ein: e.target.value}))} placeholder="XX-XXXXXXX" />
              </Field>
            </div>
          </div>

          {/* SECTION 2 */}
          <div style={{ padding: '2rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>02 · Business details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
              <Field label="Business type" required>
                <select style={selectStyle} value={form.business_type} onChange={e => setForm(f => ({...f, business_type: e.target.value}))}>
                  <option value="">Select type</option>
                  {['Retailer','Wholesaler','E-commerce','Distributor','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Years in business" required={false}>
                <select style={selectStyle} value={form.years_in_business} onChange={e => setForm(f => ({...f, years_in_business: e.target.value}))}>
                  <option value="">Select</option>
                  {['Less than 1 year','1–3 years','3–5 years','5–10 years','10+ years'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Expected monthly volume" required>
                <select style={selectStyle} value={form.monthly_volume} onChange={e => setForm(f => ({...f, monthly_volume: e.target.value}))}>
                  <option value="">Select range</option>
                  {['$1,000 – $5,000','$5,000 – $15,000','$15,000 – $50,000','$50,000 – $100,000','$100,000+'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="How did you hear about us?" required={false}>
                <select style={selectStyle} value={form.referral_source} onChange={e => setForm(f => ({...f, referral_source: e.target.value}))}>
                  <option value="">Select</option>
                  {['Google','Referral','LinkedIn','Trade show','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* SECTION 3 */}
          <div style={{ padding: '2rem 2.5rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>03 · Product interest</div>
            <Field label="Categories of interest" required={false}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => toggleCat(cat)} style={{
                    fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 2, cursor: 'pointer', border: '1.5px solid',
                    borderColor: form.categories.includes(cat) ? '#2d7dd2' : '#e5e7eb',
                    background: form.categories.includes(cat) ? 'rgba(45,125,210,0.08)' : '#fff',
                    color: form.categories.includes(cat) ? '#2d7dd2' : '#666'
                  }}>{cat}</button>
                ))}
              </div>
            </Field>
            <Field label="Additional notes" required={false}>
              <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Tell us about your business, what you're looking for, or any questions..." />
            </Field>
          </div>

          {/* TERMS & SUBMIT */}
          <div style={{ padding: '2rem 2.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: '1.5rem' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: '#2d7dd2', marginTop: 2, width: 16, height: 16 }} />
              <span style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
                I confirm that the information provided is accurate and I agree to Levam Corp's <a href="#" style={{ color: '#2d7dd2', textDecoration: 'none', fontWeight: 600 }}>Terms & Conditions</a> and <a href="#" style={{ color: '#2d7dd2', textDecoration: 'none', fontWeight: 600 }}>Partner Policy</a>.
              </span>
            </label>

            {error && <div style={{ fontSize: 13, color: '#c0392b', marginBottom: '1rem', padding: '10px 14px', background: '#fff5f5', border: '0.5px solid rgba(192,57,43,0.2)', borderRadius: 3 }}>{error}</div>}

            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 15, background: loading ? '#aaa' : '#2d7dd2', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 3, boxShadow: '0 4px 16px rgba(45,125,210,0.3)' }}>
              {loading ? 'Submitting...' : 'Submit application →'}
            </button>
            <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: '1rem' }}>We review every application personally and respond within 1–2 business days.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
