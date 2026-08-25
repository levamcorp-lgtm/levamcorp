'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

// ── HELPERS ───────────────────────────────────────────────────────────────────
const inp = {
  width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:6, fontSize:13, padding:'11px 14px', outline:'none',
  fontFamily:'inherit', color:'#fff', boxSizing:'border-box',
  transition:'border-color 0.2s, background 0.2s',
}
const sel = { ...inp, appearance:'none', cursor:'pointer' }

const Lbl = ({ text, req }) => (
  <label style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.45)', display:'block', marginBottom:6, letterSpacing:'0.12em', textTransform:'uppercase' }}>
    {text}{req && <span style={{ color:'#2F7DF6', marginLeft:3 }}>*</span>}
  </label>
)

function FileUpload({ label, required, file, onChange }) {
  const [drag, setDrag] = useState(false)
  const id = `file-${label.replace(/\s/g,'')}`
  return (
    <div>
      <Lbl text={label} req={required}/>
      <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)onChange(f)}}
        onClick={()=>document.getElementById(id).click()}
        className="lc-drop"
        style={{ border:`1.5px dashed ${drag?'#2F7DF6':file?'#12B76A':'rgba(255,255,255,0.12)'}`,
          borderRadius:8, padding:'1.5rem', textAlign:'center', cursor:'pointer',
          background: drag?'rgba(47,125,246,0.07)':file?'rgba(18,183,106,0.06)':'rgba(255,255,255,0.02)',
          transform: drag?'scale(1.015)':'scale(1)',
          transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <input id={id} type="file" accept=".pdf" style={{ display:'none' }} onChange={e=>onChange(e.target.files[0])}/>
        {file ? (
          <>
            <div style={{ fontSize:22, marginBottom:6, animation:'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:'#12B76A', marginBottom:2 }}>{file.name}</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{(file.size/1024/1024).toFixed(2)} MB · Click to change</div>
          </>
        ) : (
          <>
            <div style={{ marginBottom:8, color:'rgba(255,255,255,0.25)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.5)', marginBottom:3 }}>Drop PDF here or click to upload</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>PDF only · Max 10MB</div>
          </>
        )}
      </div>
    </div>
  )
}

// ── STEP INDICATOR ────────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ['Business info', 'Documents', 'Review']
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:'2.5rem' }}>
      {steps.map((s, i) => {
        const done    = i + 1 < current
        const active  = i + 1 === current
        return (
          <div key={s} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{ width:32, height:32, borderRadius:'50%',
                background: done?'#12B76A':active?'#2F7DF6':'rgba(255,255,255,0.06)',
                border: `1.5px solid ${done?'#12B76A':active?'#2F7DF6':'rgba(255,255,255,0.12)'}`,
                boxShadow: active?'0 0 0 4px rgba(47,125,246,0.15)':'none',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:800, color:'#fff',
                transition:'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>
                {done
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation:'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}><path d="M20 6L9 17l-5-5"/></svg>
                  : i + 1}
              </div>
              <div className="lc-display" style={{ fontSize:9, fontWeight:600, color: active?'#2F7DF6':done?'#12B76A':'rgba(255,255,255,0.3)', letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{s}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width:60, height:1, background: done?'#12B76A':'rgba(255,255,255,0.08)', margin:'0 8px', marginBottom:22, transition:'background 0.4s ease' }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── PRODUCT CATEGORIES ────────────────────────────────────────────────────────
const PRODUCT_CATEGORIES = ['TVs','Electronics','Small Appliances','Kitchen Appliances','Gaming','Audio & Speakers','Computers & Laptops','Phones & Accessories']

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Apply() {
  const [form, setForm] = useState({
    business_name:'', contact_name:'', email:'', phone:'', address:'',
    business_type:'', ein_number:'', resale_tax_number:'',
    monthly_volume:'', years_in_business:'', categories:[], notes:'',
  })
  const [einFile,    setEinFile]    = useState(null)
  const [resaleFile, setResaleFile] = useState(null)
  const [agreed,     setAgreed]     = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [step,       setStep]       = useState(1)

  const upd = f => e => setForm(p => ({ ...p, [f]: e.target.value }))
  const toggleCat = c => setForm(p => ({ ...p, categories: p.categories.includes(c) ? p.categories.filter(x=>x!==c) : [...p.categories, c] }))

  const validate = () => {
    setError('')
    if (step === 1) {
      if (!form.business_name||!form.contact_name||!form.email||!form.phone) { setError('Please fill in all required fields.'); return false }
      if (!form.heard_about) { setError('Please tell us where you heard about us.'); return false }
    }
    if (step === 2) {
      if (!form.business_type||!form.monthly_volume||!form.ein_number||!form.resale_tax_number) { setError('Please fill in all required fields.'); return false }
      if (!einFile)    { setError('Please upload your EIN document.'); return false }
      if (!resaleFile) { setError('Please upload your Resale Tax Certificate.'); return false }
    }
    return true
  }

  const next = () => { if (validate()) setStep(s => s + 1) }
  const back = () => { setError(''); setStep(s => s - 1) }

  const handleSubmit = async () => {
    if (!agreed) { setError('Please agree to the terms to continue.'); return }
    setLoading(true); setError('')
    try {
      const sb = createClient()
      let einUrl = null, resaleUrl = null
      if (einFile) {
        const { data } = await sb.storage.from('Documents').upload(`ein/${Date.now()}-${einFile.name}`, einFile, { contentType:'application/pdf' })
        if (data) einUrl = data.path
      }
      if (resaleFile) {
        const { data } = await sb.storage.from('Documents').upload(`resale/${Date.now()}-${resaleFile.name}`, resaleFile, { contentType:'application/pdf' })
        if (data) resaleUrl = data.path
      }
      const { error: err } = await sb.from('applications').insert([{ ...form, ein:form.ein_number, ein_document_url:einUrl, resale_tax_document_url:resaleUrl, heard_about: form.heard_about, heard_about_detail: form.heard_about_detail }])
      if (err) throw err
      await fetch('/api/send-application-email', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:form.email, businessName:form.business_name, contactName:form.contact_name }) })
      setSubmitted(true)
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  // ── SUCCESS ─────────────────────────────────────────────────────────────────
  if (submitted) return (
    <div style={{ minHeight:'100vh', background:'#080B14', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem',
      backgroundImage:'radial-gradient(rgba(47,125,246,0.12) 1px, transparent 1px)', backgroundSize:'28px 28px', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>
      <style>{`@keyframes popIn { 0%{opacity:0;transform:scale(0.4)} 60%{opacity:1;transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes ringPulse { 0%{box-shadow:0 0 0 0 rgba(18,183,106,0.35)} 100%{box-shadow:0 0 0 22px rgba(18,183,106,0)} }`}</style>
      <div style={{ textAlign:'center', maxWidth:480, animation:'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(18,183,106,0.1)', border:'1px solid rgba(18,183,106,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', animation:'ringPulse 1.8s ease-out infinite' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <h2 className="lc-display" style={{ fontSize:32, fontWeight:700, color:'#fff', marginBottom:'1rem', letterSpacing:'-0.02em' }}>Application submitted!</h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', lineHeight:1.8, marginBottom:'2rem' }}>
          Thank you, <strong style={{ color:'#fff' }}>{form.contact_name}</strong>. Our team will review your application and contact you at <strong style={{ color:'#2F7DF6' }}>{form.email}</strong> within <strong style={{ color:'#fff' }}>1–2 business days</strong>.
        </p>
        <Link href="/" className="lc-btn">← Back to homepage</Link>
      </div>
    </div>
  )

  return (
    <div style={{ background:'#080B14', minHeight:'100vh', fontFamily:'"Inter",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif', color:'#fff' }}>
      <style>{`
        input::placeholder, textarea::placeholder, select option { color: rgba(255,255,255,0.25); }
        input:focus, textarea:focus, select:focus { border-color: rgba(47,125,246,0.5) !important; background: rgba(47,125,246,0.04) !important; }
        select option { background: #0d1420; color: #fff; }

        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { 0%{opacity:0;transform:scale(0.5)} 60%{opacity:1;transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }

        .lc-display { font-family:'Space Grotesk',-apple-system,sans-serif; letter-spacing:-0.02em; }

        /* Primary button — matches site-wide lc-btn */
        .lc-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 28px;
          background:linear-gradient(135deg,#2F7DF6,#0284C7); color:#fff; font-size:12px;
          font-weight:700; letter-spacing:0.1em; text-transform:uppercase; border:none; border-radius:4px;
          text-decoration:none; cursor:pointer; position:relative; overflow:hidden;
          box-shadow:0 4px 16px rgba(47,125,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
          transition:transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease;
          font-family:inherit; }
        .lc-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(47,125,246,0.45), inset 0 1px 0 rgba(255,255,255,0.2); }
        .lc-btn:active:not(:disabled) { transform:translateY(0px) scale(0.97); }
        .lc-btn:disabled { cursor:not-allowed; opacity:0.6; }
        .lc-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.12),transparent); opacity:0; transition:opacity 0.2s; }
        .lc-btn:hover:not(:disabled)::after { opacity:1; }

        .lc-back { font-size:12px; font-weight:600; color:rgba(255,255,255,0.4); background:none; border:none;
          cursor:pointer; font-family:inherit; padding:8px 10px; border-radius:4px; transition:all 0.18s ease; }
        .lc-back:hover { color:#fff; background:rgba(255,255,255,0.05); transform:translateX(-2px); }

        .cat-pill { transition:all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .cat-pill:hover { transform:translateY(-2px); border-color:rgba(47,125,246,0.35) !important; }
        .cat-pill:active { transform:scale(0.93); }
        .cat-pill.on { animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }

        .lc-check { transition:all 0.18s cubic-bezier(0.34,1.56,0.64,1); }
        .lc-check.on { animation:popIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .lc-terms:hover { border-color:rgba(47,125,246,0.4) !important; background:rgba(255,255,255,0.03) !important; }

        select { background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23557' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e");
          background-repeat:no-repeat; background-position:right 12px center; background-size:16px; padding-right:36px !important; }

        .lc-error { animation:shake 0.4s ease; }

        .lc-card { animation:fadeUp 0.4s ease; }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav style={{ position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px)', background:'rgba(8,11,20,0.92)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', height:60, maxWidth:1100, margin:'0 auto' }}>
          <Link href="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, border:'1.5px solid rgba(47,125,246,0.4)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(47,125,246,0.06)' }}>
              <img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width:17, height:'auto' }}/>
            </div>
            <div>
              <div className="lc-display" style={{ fontSize:13, fontWeight:700, letterSpacing:'0.18em', color:'#fff', textTransform:'uppercase', lineHeight:1 }}>LEVAM<span style={{ color:'#2F7DF6' }}>CORP</span></div>
              <div style={{ fontSize:7, letterSpacing:'0.2em', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', marginTop:2 }}>Distributors · Doral, FL</div>
            </div>
          </Link>
          <Link href="/portal" style={{ fontSize:11, fontWeight:700, padding:'8px 18px', border:'1px solid rgba(47,125,246,0.25)', color:'#2F7DF6', letterSpacing:'0.1em', textTransform:'uppercase', borderRadius:4, textDecoration:'none', background:'rgba(47,125,246,0.06)', transition:'all 0.2s ease' }}>
            Client portal →
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{ padding:'4rem 2rem 3rem', textAlign:'center', position:'relative', overflow:'hidden',
        background:'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(47,125,246,0.1) 0%, transparent 65%)' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(47,125,246,0.12) 1px, transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 14px', border:'1px solid rgba(47,125,246,0.25)', borderRadius:20, background:'rgba(47,125,246,0.07)', marginBottom:'1.25rem' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#2F7DF6' }}/>
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', color:'#2F7DF6', textTransform:'uppercase' }}>Partner application</span>
          </div>
          <h1 className="lc-display" style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:700, letterSpacing:'-0.02em', margin:'0 0 1rem', lineHeight:1.1 }}>
            Join our distributor network
          </h1>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.8, maxWidth:460, margin:'0 auto' }}>
            Complete the form below. Our team personally reviews every application within 1–2 business days.
          </p>
        </div>
      </div>

      {/* ── FORM ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'2rem 1.5rem 5rem' }}>
        <Steps current={step}/>

        <div key={step} className="lc-card" style={{
          background:'linear-gradient(160deg, rgba(47,125,246,0.08) 0%, rgba(47,125,246,0.015) 40%, #111A2E 75%)',
          border:'1px solid rgba(47,125,246,0.18)', borderRadius:12, padding:'2rem', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#2F7DF6,transparent)', pointerEvents:'none' }}/>

          {/* ── STEP 1 ─────────────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div className="lc-display" style={{ fontSize:11, fontWeight:700, color:'#2F7DF6', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1.5rem' }}>Business information</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <Lbl text="Business name" req/>
                  <input value={form.business_name} onChange={upd('business_name')} placeholder="Acme Distribution LLC" style={inp}/>
                </div>
                <div>
                  <Lbl text="Contact name" req/>
                  <input value={form.contact_name} onChange={upd('contact_name')} placeholder="John Smith" style={inp}/>
                </div>
                <div>
                  <Lbl text="Email" req/>
                  <input value={form.email} onChange={upd('email')} type="email" placeholder="john@acmedist.com" style={inp}/>
                </div>
                <div>
                  <Lbl text="Phone" req/>
                  <input value={form.phone} onChange={upd('phone')} type="tel" placeholder="(305) 555-0100" style={inp}/>
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <Lbl text="Business address"/>
                <input value={form.address} onChange={upd('address')} placeholder="123 Main St, Miami, FL 33101" style={inp}/>
              </div>
              <div style={{ marginBottom:14 }}>
                <Lbl text="Years in business"/>
                <select value={form.years_in_business} onChange={upd('years_in_business')} style={sel}>
                  <option value="">Select...</option>
                  {['Less than 1 year','1–2 years','3–5 years','5–10 years','10+ years'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <Lbl text="Product categories you resell"/>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:4 }}>
                  {PRODUCT_CATEGORIES.map(c => {
                    const on = form.categories.includes(c)
                    return (
                      <button key={c} onClick={()=>toggleCat(c)} type="button" className={`cat-pill${on?' on':''}`}
                        style={{ fontSize:11, padding:'6px 12px', borderRadius:20, cursor:'pointer', fontFamily:'inherit', fontWeight:600,
                          background: on?'rgba(47,125,246,0.16)':'rgba(255,255,255,0.04)',
                          border:`1px solid ${on?'rgba(47,125,246,0.45)':'rgba(255,255,255,0.1)'}`,
                          color: on?'#5B9BFF':'rgba(255,255,255,0.4)' }}>
                        {c}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <Lbl text="Where did you hear about us?" req/>
                <select value={form.heard_about} onChange={upd('heard_about')} style={sel}>
                  <option value="">Select an option...</option>
                  <option value="google">Found you on Google</option>
                  <option value="instagram">Found you on Instagram (@levamdistributors)</option>
                  <option value="facebook">Found you on Facebook</option>
                  <option value="friend">A friend recommended me</option>
                  <option value="broker">A broker referred me</option>
                  <option value="existing_client">An existing Levam client referred me</option>
                  <option value="trade_show">Met you at a trade show or event</option>
                  <option value="whatsapp">Found you on WhatsApp</option>
                  <option value="youtube">Found you on YouTube</option>
                  <option value="tiktok">Found you on TikTok</option>
                  <option value="amazon_seller">Amazon seller community / forum</option>
                  <option value="walmart_seller">Walmart seller community / forum</option>
                  <option value="other">Other</option>
                </select>
                {form.heard_about === 'friend' || form.heard_about === 'broker' || form.heard_about === 'existing_client' ? (
                  <input value={form.heard_about_detail} onChange={upd('heard_about_detail')}
                    placeholder={form.heard_about === 'broker' ? "Broker name or company..." : "Their name (optional)..."}
                    style={{ ...inp, marginTop:8 }}/>
                ) : form.heard_about === 'other' ? (
                  <input value={form.heard_about_detail} onChange={upd('heard_about_detail')}
                    placeholder="Please tell us how you found us..."
                    style={{ ...inp, marginTop:8 }}/>
                ) : null}
              </div>
              <div style={{ marginTop:14 }}>
                <Lbl text="Additional notes"/>
                <textarea value={form.notes} onChange={upd('notes')} rows={3} placeholder="Tell us about your business, where you sell, who your customers are..."
                  style={{ ...inp, resize:'none' }}/>
              </div>
            </>
          )}

          {/* ── STEP 2 ─────────────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <div className="lc-display" style={{ fontSize:11, fontWeight:700, color:'#2F7DF6', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1.5rem' }}>Business documents</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div>
                  <Lbl text="Business type" req/>
                  <select value={form.business_type} onChange={upd('business_type')} style={sel}>
                    <option value="">Select...</option>
                    {['LLC','Corporation','Sole Proprietorship','Partnership','Other'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <Lbl text="Monthly purchase volume" req/>
                  <select value={form.monthly_volume} onChange={upd('monthly_volume')} style={sel}>
                    <option value="">Select...</option>
                    {['Under $5,000','$5,000–$15,000','$15,000–$50,000','$50,000–$100,000','$100,000+'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <Lbl text="EIN number" req/>
                  <input value={form.ein_number} onChange={upd('ein_number')} placeholder="XX-XXXXXXX" style={inp}/>
                </div>
                <div>
                  <Lbl text="Resale tax number" req/>
                  <input value={form.resale_tax_number} onChange={upd('resale_tax_number')} placeholder="State resale certificate #" style={inp}/>
                </div>
              </div>

              {/* Notice */}
              <div style={{ padding:'12px 16px', background:'rgba(47,125,246,0.06)', border:'1px solid rgba(47,125,246,0.18)', borderRadius:8, marginBottom:'1.25rem', fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>
                Don't have an LLC yet? You can still apply — note it in the form and we'll review your application individually.
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <FileUpload label="EIN / SS4 Document" required file={einFile} onChange={setEinFile}/>
                <FileUpload label="Resale Tax Certificate" required file={resaleFile} onChange={setResaleFile}/>
              </div>
            </>
          )}

          {/* ── STEP 3 ─────────────────────────────────────────────────── */}
          {step === 3 && (
            <>
              <div className="lc-display" style={{ fontSize:11, fontWeight:700, color:'#2F7DF6', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:'1.5rem' }}>Review & submit</div>

              {/* Summary */}
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:'1.5rem' }}>
                {[
                  ['Business name', form.business_name],
                  ['Contact',       form.contact_name],
                  ['Email',         form.email],
                  ['Phone',         form.phone],
                  ['How they found us', form.heard_about ? form.heard_about.replace(/_/g,' ').replace(/\w/g,l=>l.toUpperCase()) + (form.heard_about_detail ? ` — ${form.heard_about_detail}` : '') : ''],
                  ['Business type', form.business_type],
                  ['Monthly volume',form.monthly_volume],
                  ['EIN',           form.ein_number],
                  ['Resale #',      form.resale_tax_number],
                ].filter(([,v])=>v).map(([label,val]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>{val}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>EIN doc</span>
                  <span style={{ fontSize:12, color:'#12B76A', fontWeight:600 }}>{einFile ? '✓ Uploaded' : '—'}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0' }}>
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Resale doc</span>
                  <span style={{ fontSize:12, color:'#12B76A', fontWeight:600 }}>{resaleFile ? '✓ Uploaded' : '—'}</span>
                </div>
              </div>

              {/* Terms */}
              <div onClick={()=>setAgreed(a=>!a)} className="lc-terms"
                style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'1rem', background:'rgba(255,255,255,0.02)', border:`1px solid ${agreed?'rgba(47,125,246,0.35)':'rgba(255,255,255,0.08)'}`, borderRadius:8, cursor:'pointer', marginBottom:'1.5rem', transition:'all 0.18s ease' }}>
                <div className={`lc-check${agreed?' on':''}`} style={{ width:18, height:18, borderRadius:4, border:`2px solid ${agreed?'#2F7DF6':'rgba(255,255,255,0.2)'}`, background:agreed?'#2F7DF6':'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', marginTop:1 }}>
                  {agreed && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>
                  I confirm that the information provided is accurate and that my business is legitimate. I understand Levam Corp will contact me within 1–2 business days.
                </span>
              </div>
            </>
          )}

          {/* ── ERROR ──────────────────────────────────────────────────── */}
          {error && (
            <div className="lc-error" style={{ padding:'10px 14px', background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.25)', borderRadius:6, fontSize:12, color:'#e74c3c', marginBottom:'1rem' }}>
              {error}
            </div>
          )}

          {/* ── ACTIONS ────────────────────────────────────────────────── */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            {step > 1
              ? <button onClick={back} className="lc-back">← Back</button>
              : <div/>
            }
            {step < 3
              ? <button onClick={next} className="lc-btn">Continue →</button>
              : <button onClick={handleSubmit} disabled={loading} className="lc-btn">
                  {loading ? 'Submitting...' : 'Submit application'}
                </button>
            }
          </div>
        </div>

        {/* Confidential note */}
        <div style={{ textAlign:'center', marginTop:'1.5rem', fontSize:11, color:'rgba(255,255,255,0.18)' }}>
          Your information is confidential and used only for partner vetting. Levam Corp · partners@levamcorp.com
        </div>
      </div>
    </div>
  )
}
