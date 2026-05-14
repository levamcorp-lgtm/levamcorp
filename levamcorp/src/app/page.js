'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

const inputStyle = {
  width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 4,
  fontSize: 14, padding: '11px 14px', outline: 'none',
  fontFamily: 'inherit', color: '#111', background: '#fafafa',
  boxSizing: 'border-box', transition: 'border-color 0.15s'
}

const selectStyle = { ...inputStyle, appearance: 'none', cursor: 'pointer' }

const Label = ({ label, required }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: '#222', display: 'block', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
    {label} {required && <span style={{ color: '#2d7dd2' }}>*</span>}
  </label>
)

function FileUpload({ label, required, file, onChange, accept = '.pdf', hint }) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onChange(f)
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <Label label={label} required={required} />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? '#2d7dd2' : file ? '#2a7d4f' : '#e5e7eb'}`,
          borderRadius: 4, padding: '1.25rem', textAlign: 'center', cursor: 'pointer',
          background: dragging ? 'rgba(45,125,210,0.04)' : file ? 'rgba(42,125,79,0.04)' : '#fafafa',
          transition: 'all 0.2s'
        }}
        onClick={() => document.getElementById(`file-${label}`).click()}
      >
        <input id={`file-${label}`} type="file" accept={accept} style={{ display: 'none' }} onChange={e => onChange(e.target.files[0])} />
        {file ? (
          <div>
            <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2a7d4f', marginBottom: 2 }}>{file.name}</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4 }}>Drop PDF here or click to upload</div>
            <div style={{ fontSize: 11, color: '#bbb' }}>{hint || 'PDF only · Max 10MB'}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApplyPage() {
  const [form, setForm] = useState({
    business_name: '', contact_name: '', email: '', phone: '',
    address: '', business_type: '', ein: '', ein_number: '',
    resale_tax_number: '', years_in_business: '',
    categories: [], monthly_volume: '', referral_source: '', notes: ''
  })
  const [einFile, setEinFile] = useState(null)
  const [resaleFile, setResaleFile] = useState(null)
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  const categories = ['Electronics','Smart TVs','Home appliances','Kitchen essentials','Small appliances','All categories']
  const toggleCat = (cat) => setForm(f => ({ ...f, categories: f.categories.includes(cat) ? f.categories.filter(c => c !== cat) : [...f.categories, cat] }))
  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const validateStep1 = () => {
    if (!form.business_name || !form.contact_name || !form.email || !form.phone) { setError('Please fill in all required fields.'); return false }
    setError(''); return true
  }

  const validateStep2 = () => {
    if (!form.business_type || !form.monthly_volume || !form.ein_number || !form.resale_tax_number) { setError('Please fill in all required fields.'); return false }
    if (!einFile) { setError('Please upload your SS4/EIN document.'); return false }
    if (!resaleFile) { setError('Please upload your Resale Tax Certificate.'); return false }
    setError(''); return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const handleSubmit = async () => {
    if (!agreed) { setError('Please agree to the terms to continue.'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()

      // Upload EIN document
      let einUrl = null
      if (einFile) {
        const { data: einData } = await supabase.storage.from('documents').upload(
          `ein/${Date.now()}-${einFile.name}`, einFile, { contentType: 'application/pdf' }
        )
        if (einData) einUrl = einData.path
      }

      // Upload Resale Tax document
      let resaleUrl = null
      if (resaleFile) {
        const { data: resaleData } = await supabase.storage.from('documents').upload(
          `resale/${Date.now()}-${resaleFile.name}`, resaleFile, { contentType: 'application/pdf' }
        )
        if (resaleData) resaleUrl = resaleData.path
      }

      const { error: err } = await supabase.from('applications').insert([{
        ...form,
        ein: form.ein_number,
        ein_document_url: einUrl,
        resale_tax_document_url: resaleUrl,
      }])
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

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', width: 480, borderRadius: 8, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ background: '#0d0d0d', padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ position: 'relative', width: 32, height: 32 }}>
              <div style={{ position: 'absolute', left: 7, top: 0, width: 2.5, height: 25, background: '#333' }} />
              <div style={{ position: 'absolute', left: 7, bottom: 0, width: 18, height: 2.5, background: '#333' }} />
              <div style={{ position: 'absolute', left: 12, bottom: 7, width: 11, height: 2.5, background: '#2d7dd2' }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>Levam</div>
              <div style={{ fontSize: 8, letterSpacing: '0.35em', color: '#2d7dd2', textTransform: 'uppercase' }}>Corp · Distributors</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: 'rgba(42,125,79,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: 32 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: '0.75rem' }}>Application submitted!</h2>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.8, marginBottom: '2rem' }}>
            Thank you, <strong style={{ color: '#333' }}>{form.contact_name}</strong>. Our team will personally review your application and contact you at <strong style={{ color: '#333' }}>{form.email}</strong> within <strong style={{ color: '#333' }}>1–2 business days</strong>.
          </p>
          <Link href="/" style={{ display: 'inline-block', padding: '12px 28px', background: '#2d7dd2', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 4, textDecoration: 'none' }}>← Back to homepage</Link>
        </div>
      </div>
    </div>
  )

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
        <Link href="/portal" style={{ fontSize: 12, fontWeight: 600, padding: '9px 22px', border: '0.5px solid #2d7dd2', background: 'rgba(45,125,210,0.15)', color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, textDecoration: 'none' }}>Client portal ↗</Link>
      </nav>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 100%)', padding: '3rem 2rem 2.5rem' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#2d7dd2', fontWeight: 600, marginBottom: 10 }}>Partner application</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Join our distributor network</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 2rem' }}>
            Complete the form below to apply. Our team personally reviews every application within 1–2 business days.
          </p>

          {/* STEP PROGRESS */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
            {[['01','Business info'],['02','Documents'],['03','Review']].map(([num, label], i) => {
              const idx = i + 1
              const done = step > idx
              const active = step === idx
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#2d7dd2' : active ? '#fff' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: done ? '#fff' : active ? '#111' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }}>
                      {done ? '✓' : num}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? '#fff' : done ? '#2d7dd2' : 'rgba(255,255,255,0.3)' }}>{label}</span>
                  </div>
                  {i < 2 && <div style={{ width: 40, height: 1, background: done ? '#2d7dd2' : 'rgba(255,255,255,0.1)', margin: '0 12px', transition: 'background 0.3s' }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

          {/* STEP 1 — Business Info */}
          {step === 1 && (
            <>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Step 1 of 3 · Business information</div>
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <Label label="Business name" required />
                    <input style={inputStyle} value={form.business_name} onChange={update('business_name')} placeholder="Your company LLC" />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <Label label="Contact name" required />
                    <input style={inputStyle} value={form.contact_name} onChange={update('contact_name')} placeholder="Full name" />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <Label label="Email address" required />
                    <input style={inputStyle} type="email" value={form.email} onChange={update('email')} placeholder="you@business.com" />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <Label label="Phone number" required />
                    <input style={inputStyle} type="tel" value={form.phone} onChange={update('phone')} placeholder="+1 (305) 000-0000" />
                  </div>
                  <div style={{ marginBottom: '1.25rem', gridColumn: '1 / -1' }}>
                    <Label label="Business address" />
                    <input style={inputStyle} value={form.address} onChange={update('address')} placeholder="Street, City, State, ZIP" />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <Label label="How did you hear about us?" />
                    <select style={selectStyle} value={form.referral_source} onChange={update('referral_source')}>
                      <option value="">Select</option>
                      {['Google','Referral','LinkedIn','Trade show','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <Label label="Years in business" />
                    <select style={selectStyle} value={form.years_in_business} onChange={update('years_in_business')}>
                      <option value="">Select</option>
                      {['Less than 1 year','1–3 years','3–5 years','5–10 years','10+ years'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2 — Documents */}
          {step === 2 && (
            <>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Step 2 of 3 · Business documents & details</div>
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <Label label="Business type" required />
                    <select style={selectStyle} value={form.business_type} onChange={update('business_type')}>
                      <option value="">Select type</option>
                      {['Retailer','Wholesaler','E-commerce','Distributor','Amazon Seller','Walmart Seller','Other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <Label label="Expected monthly volume" required />
                    <select style={selectStyle} value={form.monthly_volume} onChange={update('monthly_volume')}>
                      <option value="">Select range</option>
                      {['$1,000 – $5,000','$5,000 – $15,000','$15,000 – $50,000','$50,000 – $100,000','$100,000+'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* EIN Section */}
                <div style={{ background: 'rgba(45,125,210,0.04)', border: '0.5px solid rgba(45,125,210,0.15)', borderRadius: 6, padding: '1.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#2d7dd2', marginBottom: 4 }}>📋 SS4 / EIN Document</div>
                  <p style={{ fontSize: 12, color: '#888', lineHeight: 1.7, marginBottom: '1rem' }}>Your Employer Identification Number issued by the IRS. Upload your SS4 letter or IRS EIN confirmation document.</p>
                  <div style={{ marginBottom: '1rem' }}>
                    <Label label="EIN number" required />
                    <input style={inputStyle} value={form.ein_number} onChange={update('ein_number')} placeholder="XX-XXXXXXX" />
                  </div>
                  <FileUpload label="SS4 / EIN Document" required file={einFile} onChange={setEinFile} hint="IRS SS4 letter or EIN confirmation · PDF only · Max 10MB" />
                </div>

                {/* Resale Tax Section */}
                <div style={{ background: 'rgba(42,125,79,0.04)', border: '0.5px solid rgba(42,125,79,0.15)', borderRadius: 6, padding: '1.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#2a7d4f', marginBottom: 4 }}>🏷 Resale Tax Certificate</div>
                  <p style={{ fontSize: 12, color: '#888', lineHeight: 1.7, marginBottom: '1rem' }}>Your state-issued resale tax certificate allows you to purchase goods tax-free for resale purposes.</p>
                  <div style={{ marginBottom: '1rem' }}>
                    <Label label="Resale tax number" required />
                    <input style={inputStyle} value={form.resale_tax_number} onChange={update('resale_tax_number')} placeholder="State resale tax number" />
                  </div>
                  <FileUpload label="Resale Tax Certificate" required file={resaleFile} onChange={setResaleFile} hint="State resale tax certificate · PDF only · Max 10MB" />
                </div>

                {/* Categories */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <Label label="Categories of interest" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {categories.map(cat => (
                      <button key={cat} type="button" onClick={() => toggleCat(cat)} style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20, cursor: 'pointer', border: '1.5px solid', borderColor: form.categories.includes(cat) ? '#2d7dd2' : '#e5e7eb', background: form.categories.includes(cat) ? 'rgba(45,125,210,0.08)' : '#fff', color: form.categories.includes(cat) ? '#2d7dd2' : '#666' }}>{cat}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '0.5rem' }}>
                  <Label label="Additional notes" />
                  <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={form.notes} onChange={update('notes')} placeholder="Tell us about your business..." />
                </div>
              </div>
            </>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '0.5px solid rgba(0,0,0,0.08)', background: '#fafafa' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2d7dd2', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Step 3 of 3 · Review & submit</div>
              </div>
              <div style={{ padding: '2rem' }}>
                {/* Summary */}
                <div style={{ background: '#f7f8fa', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 6, padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#333', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>Application summary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      ['Business', form.business_name],
                      ['Contact', form.contact_name],
                      ['Email', form.email],
                      ['Phone', form.phone],
                      ['Business type', form.business_type],
                      ['Monthly volume', form.monthly_volume],
                      ['EIN', form.ein_number],
                      ['Resale tax #', form.resale_tax_number],
                    ].map(([label, val]) => val && (
                      <div key={label}>
                        <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: '#333' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: einFile ? '#2a7d4f' : '#c0392b', fontWeight: 600 }}>
                      {einFile ? '✅' : '❌'} SS4/EIN: {einFile ? einFile.name : 'Missing'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: resaleFile ? '#2a7d4f' : '#c0392b', fontWeight: 600 }}>
                      {resaleFile ? '✅' : '❌'} Resale Tax: {resaleFile ? resaleFile.name : 'Missing'}
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(45,125,210,0.04)', border: '0.5px solid rgba(45,125,210,0.12)', borderRadius: 4 }}>
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: '#2d7dd2', marginTop: 2, width: 16, height: 16, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>
                    I confirm that all information provided is accurate and that the documents uploaded are authentic. I agree to Levam Corp's <a href="#" style={{ color: '#2d7dd2', textDecoration: 'none', fontWeight: 600 }}>Terms & Conditions</a> and <a href="#" style={{ color: '#2d7dd2', textDecoration: 'none', fontWeight: 600 }}>Partner Policy</a>.
                  </span>
                </label>

                {error && <div style={{ fontSize: 13, color: '#c0392b', marginBottom: '1rem', padding: '10px 14px', background: '#fff5f5', border: '0.5px solid rgba(192,57,43,0.2)', borderRadius: 4 }}>{error}</div>}

                <button onClick={handleSubmit} disabled={loading} type="button" style={{ width: '100%', padding: 15, background: loading ? '#aaa' : '#2d7dd2', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 4, boxShadow: '0 4px 16px rgba(45,125,210,0.35)' }}>
                  {loading ? 'Uploading documents & submitting...' : 'Submit application →'}
                </button>
                <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: '0.75rem' }}>Your documents are stored securely and only accessible to our team.</p>
              </div>
            </>
          )}

          {/* NAVIGATION */}
          <div style={{ padding: '1rem 2rem', borderTop: '0.5px solid rgba(0,0,0,0.08)', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {step > 1 ? (
              <button type="button" onClick={() => { setStep(s => s - 1); setError('') }} style={{ fontSize: 12, color: '#666', background: '#fff', border: '1px solid #e5e7eb', padding: '9px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>← Back</button>
            ) : <div />}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[1,2,3].map(n => (
                <div key={n} style={{ width: n === step ? 24 : 8, height: 8, borderRadius: 4, background: n <= step ? '#2d7dd2' : '#e5e7eb', transition: 'all 0.3s' }} />
              ))}
            </div>
            {step < 3 && (
              <button type="button" onClick={handleNext} style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: '#2d7dd2', border: 'none', padding: '9px 24px', borderRadius: 4, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 4px 14px rgba(45,125,210,0.3)' }}>
                Continue →
              </button>
            )}
            {step === 3 && <div />}
          </div>

          {error && step < 3 && (
            <div style={{ padding: '0.75rem 2rem', background: '#fff5f5', borderTop: '0.5px solid rgba(192,57,43,0.1)', fontSize: 12, color: '#c0392b' }}>{error}</div>
          )}
        </div>
      </div>
    </div>
  )
}
