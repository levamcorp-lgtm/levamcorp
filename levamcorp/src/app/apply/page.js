'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

const ACCENT = '#2F7DF6'
const DRAFT_KEY = 'lvm-apply-draft-v1'

function seededBars(seed, count) {
  let s = seed
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  return Array.from({ length: count }, () => {
    const r = rnd()
    return { grow: r > 0.82 ? 3 : r > 0.5 ? 2 : 1, tall: r > 0.94 }
  })
}
const BARCODE_SEED = seededBars(20260901, 96)
const BARCODE_DONE = seededBars(775511, 96)

const PRODUCT_CATEGORIES = ['TVs','Electronics','Small Appliances','Kitchen Appliances','Gaming','Audio & Speakers','Computers & Laptops','Phones & Accessories']
const YEARS_OPTIONS = ['Less than 1 year','1–2 years','3–5 years','5–10 years','10+ years']
const BUSINESS_TYPES = ['LLC','Corporation','Sole Proprietorship','Partnership','Not yet registered']
const VOLUME_OPTIONS = ['Under $5,000','$5,000–$15,000','$15,000–$50,000','$50,000–$100,000','$100,000+']
const HEARD_ABOUT_OPTIONS = [
  ['google','Found you on Google'],
  ['instagram','Found you on Instagram (@levamdistributors)'],
  ['facebook','Found you on Facebook'],
  ['friend','A friend recommended me'],
  ['broker','A broker referred me'],
  ['existing_client','An existing Levam client referred me'],
  ['trade_show','Met you at a trade show or event'],
  ['whatsapp','Found you on WhatsApp'],
  ['youtube','Found you on YouTube'],
  ['tiktok','Found you on TikTok'],
  ['amazon_seller','Amazon seller community / forum'],
  ['walmart_seller','Walmart seller community / forum'],
  ['other','Other'],
]

const mono = "'SF Mono','JetBrains Mono',ui-monospace,Menlo,monospace"

// Short chip labels for the mobile layout's narrower volume chips — same stored
// values as VOLUME_OPTIONS above, just abbreviated for display.
const VOLUME_SHORT = { 'Under $5,000':'Under $5k', '$5,000–$15,000':'$5k–$15k', '$15,000–$50,000':'$15k–$50k', '$50,000–$100,000':'$50k–$100k', '$100,000+':'$100k+' }

function fmtPhoneDisplay(v) {
  const d = v.replace(/\D/g,'').replace(/^1(?=\d{10})/,'').slice(0,10)
  if (d.length < 4) return d
  if (d.length < 7) return '(' + d.slice(0,3) + ') ' + d.slice(3)
  return '(' + d.slice(0,3) + ') ' + d.slice(3,6) + '-' + d.slice(6)
}
function fmtEinDisplay(v) {
  const d = v.replace(/\D/g,'').slice(0,9)
  return d.length > 2 ? d.slice(0,2) + '-' + d.slice(2) : d
}

function Lbl({ text, req, error, note }) {
  return (
    <span style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:8, fontFamily:mono, fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55', paddingBottom:7 }}>
      <span>{text}{req && <span style={{ color:ACCENT, marginLeft:3 }}>*</span>}</span>
      {error ? <span style={{ color:'#C2410C' }}>{error}</span> : note ? <span>{note}</span> : null}
    </span>
  )
}

function Chip({ label, on, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      style={{ border:0, cursor:'pointer', padding:'10px 13px 11px', background: on?'#08090B':'#F2EFE6', color: on?'#F2EFE6':'#08090B', fontFamily:mono, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
      {label}
    </button>
  )
}

function ChipGroup({ options, value, onChange }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:1, background:'rgba(8,9,11,0.85)' }}>
      {options.map(o => <Chip key={o} label={o} on={value===o} onClick={()=>onChange(value===o?'':o)}/>)}
    </div>
  )
}

function FileUpload({ label, file, error, onChange, req = true }) {
  const [drag, setDrag] = useState(false)
  const id = `file-${label.replace(/\s/g,'')}`
  const good = file && !file._err
  return (
    <div>
      <Lbl text={label} req={req} error={error} note={!req ? 'Optional — not registered yet' : null}/>
      <label htmlFor={id}
        onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)onChange(f)}}
        style={{ display:'block', cursor:'pointer', border:`1px dashed ${error?'#C2410C':good?ACCENT:drag?ACCENT:'rgba(8,9,11,0.4)'}`, background: good?'rgba(47,125,246,0.07)':drag?'rgba(47,125,246,0.05)':'transparent', padding:'clamp(16px,2.6vh,22px) 14px', textAlign:'center' }}>
        <input id={id} type="file" accept="application/pdf" style={{ position:'absolute', width:1, height:1, opacity:0, pointerEvents:'none' }} onChange={e=>onChange(e.target.files[0])}/>
        <div style={{ fontFamily:mono, fontSize:10.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#08090B' }}>
          {good ? file.name : 'Drop PDF here or click to upload'}
        </div>
        <div style={{ paddingTop:6, fontFamily:mono, fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color: good?ACCENT:'#5C5A55' }}>
          {good ? 'Uploaded · click to replace' : 'PDF only · max 10 MB'}
        </div>
      </label>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MOBILE APPLY — phone-only step-by-step "boarding pass" application flow ────
// Ported from the Claude Design prototype (Levamcorp_Mobile_Apply.dc.html), used
// only below 768px (same isMobile check pattern as the mobile home page). All
// state, validation (`problems`/`shown`), file handling, and the Supabase submit
// call live in Apply() and are reused as-is via props — nothing here duplicates
// that logic, it only renders it differently. Desktop's own JSX further down is
// untouched. Real option lists (PRODUCT_CATEGORIES, YEARS_OPTIONS, BUSINESS_TYPES,
// VOLUME_OPTIONS, HEARD_ABOUT_OPTIONS) are reused rather than the prototype's own
// narrower placeholder lists, so stored values stay identical to desktop's no
// matter which layout submitted the application. The agreement checkbox keeps
// desktop's exact consent sentence rather than the prototype's shorter "I agree
// to the terms of service" — they are different legal statements, and only one
// of them is the one this site has actually been asking applicants to agree to.
// ═══════════════════════════════════════════════════════════════════════════════

function MChip({ label, on, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      style={{ minHeight:44, padding:'0 13px', border:'1px solid #08090B', background: on?'#08090B':'#fff', color: on?'#F2EFE6':'#08090B', fontSize:14, cursor:'pointer' }}>
      {label}
    </button>
  )
}

function MChipGroup({ options, value, onChange, shortMap }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
      {options.map(o => <MChip key={o} label={(shortMap && shortMap[o]) || o} on={value===o} onClick={()=>onChange(value===o?'':o)}/>)}
    </div>
  )
}

function MCatChips({ options, values, onToggle }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
      {options.map(c => {
        const on = values.includes(c)
        return <MChip key={c} label={(on?'✓ ':'')+c} on={on} onClick={()=>onToggle(c)}/>
      })}
    </div>
  )
}

function MDocRow({ label, file, error, req, onFile }) {
  const good = file && !file._err
  const sub = good ? file.name : error ? error : (req ? 'Tap to take a photo or choose a file' : 'Optional — not registered yet')
  const subColor = good ? '#166534' : error ? '#C2410C' : '#6D6A64'
  const id = `mdoc-${label.replace(/\s/g,'')}`
  return (
    <label htmlFor={id} style={{ position:'relative', display:'grid', gridTemplateColumns:'44px minmax(0,1fr) auto', gap:12, alignItems:'center', minHeight:72, marginTop:8, padding:12, border:`1px ${good?'solid':'dashed'} ${error?'#C2410C':good?'#16A34A':'rgba(8,9,11,0.5)'}`, background: good?'#F3FAF5':'#fff', cursor:'pointer' }}>
      <input id={id} type="file" accept="application/pdf,image/*" onChange={e=>onFile(e.target.files[0])} style={{ position:'absolute', width:1, height:1, opacity:0 }}/>
      <span style={{ display:'grid', placeItems:'center', width:44, height:44, background: good?'#16A34A':'#08090B', color:'#fff', fontFamily:mono, fontSize:15, fontWeight:700 }}>{good?'✓':'+'}</span>
      <span style={{ minWidth:0 }}>
        <span style={{ display:'block', fontSize:15, color:'#08090B' }}>{label}</span>
        <span style={{ display:'block', paddingTop:3, fontSize:12.5, color:subColor, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</span>
      </span>
      <span style={{ fontFamily:mono, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color: good?'#6D6A64':ACCENT }}>{good?'Replace':'Add'}</span>
    </label>
  )
}

function MobileApplyForm(p) {
  const { form, upd, toggleCat, einFile, resaleFile, agreed, setAgreed, setTouched,
          step, setStep, persist, next, back, handleSubmit, loading, error, saved, shown, heardLabel,
          onEinFile, onResaleFile } = p

  const segBg = [0,1,2].map(i => i<step ? '#F2EFE6' : i===step ? ACCENT : 'rgba(242,239,230,0.18)')
  const titles = ['Tell us about your business', 'Tax documents', 'Review and submit']
  const subs = [
    'Takes about two minutes. Your progress saves on this phone.',
    'We need these to sell to you tax-exempt. Photos are fine.',
    'Check everything once. You can edit any section.',
  ]
  const sheetHead = ['01 · Business information','02 · Documents','03 · Confirm'][step]
  const sheetFoot = ['Step 01 of 03 · business','Step 02 of 03 · documents','Step 03 of 03 · submit'][step]

  const onTopBack = () => { if (step > 0) back(); else window.location.href = '/' }
  const setStepAndScroll = i => { setStep(i); persist(form, i); window.scrollTo(0, 0) }

  const review = [
    { title:'Business', go:0, rows:[['Business',form.business_name||'—'],['Contact',form.contact_name||'—'],['Email',form.email||'—'],['Phone',form.phone||'—'],['Address',form.address||'—']] },
    { title:'What you sell', go:0, rows:[['Categories',form.categories.join(', ')||'—'],['Years',form.years_in_business||'—'],['Found us',(heardLabel||'—') + (form.heard_about_detail ? ` — ${form.heard_about_detail}` : '')]] },
    { title:'Documents', go:1, rows:[['Type',form.business_type||'—'],['Volume',form.monthly_volume||'—'],['EIN',form.ein_number||'—'],['Resale cert',form.resale_tax_number||'—'],['EIN letter', einFile && !einFile._err ? 'Attached':'Missing'],['Resale doc', resaleFile && !resaleFile._err ? 'Attached':'Missing']] },
  ]

  const mField = { width:'100%', boxSizing:'border-box', height:52, padding:'0 13px', border:'1px solid rgba(8,9,11,0.4)', background:'#fff', color:'#08090B', fontSize:16, WebkitAppearance:'none' }
  const mFieldMono = { ...mField, fontFamily:mono, letterSpacing:'0.04em' }
  const mLbl = (text, err) => (
    <span style={{ display:'flex', justifyContent:'space-between', gap:10, paddingBottom:7, fontFamily:mono, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'#5C5A55' }}>
      <span>{text}</span>{err && <span style={{ color:'#C2410C' }}>{err}</span>}
    </span>
  )
  const groupHead = (text, err) => (
    <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:8, fontFamily:mono, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'#5C5A55' }}>
      <span>{text}</span>{err && <span style={{ color:'#C2410C' }}>{err}</span>}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#08090B', color:'#F2EFE6', fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif', display:'flex', flexDirection:'column' }}>
      <header style={{ position:'sticky', top:0, zIndex:30, background:'rgba(8,9,11,0.97)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'44px minmax(0,1fr) 44px', gap:10, alignItems:'center', height:56, padding:'0 12px' }}>
          <button type="button" onClick={onTopBack} aria-label={step>0?'Back':'Close'} style={{ width:44, height:44, border:'1px solid rgba(242,239,230,0.25)', background:'transparent', color:'#F2EFE6', fontFamily:mono, fontSize:15, cursor:'pointer' }}>{step>0?'←':'✕'}</button>
          <span style={{ textAlign:'center' }}>
            <span style={{ display:'block', fontFamily:mono, fontWeight:700, fontSize:11.5, letterSpacing:'0.2em' }}>LEVAM<span style={{ color:ACCENT }}>CORP</span></span>
            <span style={{ display:'block', paddingTop:3, fontFamily:mono, fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(242,239,230,0.55)' }}>Partner application</span>
          </span>
          <a href="https://wa.me/17864909005?text=Hi!%20I%20have%20a%20question%20about%20my%20wholesale%20application." aria-label="Help on WhatsApp" style={{ display:'grid', placeItems:'center', width:44, height:44, border:'1px solid rgba(242,239,230,0.25)', fontFamily:mono, fontSize:13, color:'#F2EFE6', textDecoration:'none' }}>?</a>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:3, padding:'0 12px 10px' }}>
          {segBg.map((bg,i) => <span key={i} style={{ display:'block', height:3, background:bg }}/>)}
        </div>
      </header>

      <main style={{ flex:1, padding:'6px 0 120px' }}>
        <div style={{ padding:'14px 16px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:mono, fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(242,239,230,0.55)' }}>
            <span>Step 0{step+1} / 03</span><span style={{ color: saved?'#4ADE80':'rgba(242,239,230,0.45)' }}>{saved?'● Saved on this phone':'Draft'}</span>
          </div>
          <h1 style={{ margin:'12px 0 0', fontSize:29, fontWeight:400, letterSpacing:'-0.04em', lineHeight:1.05, color:'#F5F2E9' }}>{titles[step]}</h1>
          <p style={{ margin:'8px 0 0', fontSize:15, lineHeight:1.5, color:'rgba(242,239,230,0.65)' }}>{subs[step]}</p>
        </div>

        {error && (
          <div style={{ margin:'0 16px 14px', padding:'12px 13px', borderLeft:'3px solid #f87171', background:'rgba(248,113,113,0.1)', fontSize:14, lineHeight:1.45, color:'#fecaca' }}>{error}</div>
        )}

        <div style={{ background:'#F2EFE6', color:'#08090B', margin:'0 12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', borderBottom:'1px solid #08090B', fontFamily:mono, fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase' }}>
            <span style={{ fontWeight:700 }}>{sheetHead}</span><span style={{ color:'#5C5A55' }}>Form 01 · Rev. 08</span>
          </div>

          {step === 0 && (
            <div style={{ padding:'4px 12px 16px' }}>
              <label style={{ display:'block', paddingTop:14 }}>
                {mLbl('Business name *', shown('business_name'))}
                <input value={form.business_name} onChange={e=>upd('business_name',e.target.value)} onBlur={()=>setTouched(t=>({...t,business_name:true}))} placeholder="Acme Distribution LLC" style={{ ...mField, borderColor: shown('business_name')?'#C2410C':'rgba(8,9,11,0.4)' }}/>
              </label>
              <label style={{ display:'block', paddingTop:14 }}>
                {mLbl('Your name *', shown('contact_name'))}
                <input value={form.contact_name} onChange={e=>upd('contact_name',e.target.value)} onBlur={()=>setTouched(t=>({...t,contact_name:true}))} placeholder="First and last name" style={{ ...mField, borderColor: shown('contact_name')?'#C2410C':'rgba(8,9,11,0.4)' }}/>
              </label>
              <label style={{ display:'block', paddingTop:14 }}>
                {mLbl('Email *', shown('email'))}
                <input type="email" inputMode="email" value={form.email} onChange={e=>upd('email',e.target.value)} onBlur={()=>setTouched(t=>({...t,email:true}))} placeholder="name@company.com" style={{ ...mField, borderColor: shown('email')?'#C2410C':'rgba(8,9,11,0.4)' }}/>
              </label>
              <label style={{ display:'block', paddingTop:14 }}>
                {mLbl('Phone *', shown('phone'))}
                <input type="tel" inputMode="tel" value={form.phone} onChange={e=>upd('phone',fmtPhoneDisplay(e.target.value))} onBlur={()=>setTouched(t=>({...t,phone:true}))} placeholder="(305) 555-0100" style={{ ...mFieldMono, borderColor: shown('phone')?'#C2410C':'rgba(8,9,11,0.4)' }}/>
              </label>
              <label style={{ display:'block', paddingTop:14 }}>
                {mLbl('Business address · optional')}
                <input value={form.address} onChange={e=>upd('address',e.target.value)} placeholder="Street, city, state" style={mField}/>
              </label>

              <div style={{ paddingTop:18 }}>
                {groupHead('What you resell *', shown('categories'))}
                <MCatChips options={PRODUCT_CATEGORIES} values={form.categories} onToggle={toggleCat}/>
              </div>

              <div style={{ paddingTop:18 }}>
                {groupHead('Years in business')}
                <MChipGroup options={YEARS_OPTIONS} value={form.years_in_business} onChange={v=>upd('years_in_business',v)}/>
              </div>

              <div style={{ paddingTop:18 }}>
                {groupHead('How did you find us? *', shown('heard_about'))}
                <MChipGroup options={HEARD_ABOUT_OPTIONS.map(([v])=>v)} value={form.heard_about} onChange={v=>upd('heard_about',v)}
                  shortMap={Object.fromEntries(HEARD_ABOUT_OPTIONS.map(([v,l]) => [v, l.replace(/^Found you on /,'').replace(/^Met you at /,'').replace(/^An? /,'')]))}/>
                {['friend','broker','existing_client'].includes(form.heard_about) && (
                  <input value={form.heard_about_detail} onChange={e=>upd('heard_about_detail',e.target.value)}
                    placeholder={form.heard_about==='broker' ? 'Broker name or company...' : 'Their name (optional)...'} style={{ ...mField, marginTop:8 }}/>
                )}
                {form.heard_about==='other' && (
                  <input value={form.heard_about_detail} onChange={e=>upd('heard_about_detail',e.target.value)}
                    placeholder="Please tell us how you found us..." style={{ ...mField, marginTop:8 }}/>
                )}
              </div>

              <label style={{ display:'block', paddingTop:18 }}>
                <span style={{ display:'block', paddingBottom:7, fontFamily:mono, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'#5C5A55' }}>Anything we should know? · optional</span>
                <textarea rows={3} value={form.notes} onChange={e=>upd('notes',e.target.value)} placeholder="Where you sell, what volumes, brands you want…"
                  style={{ width:'100%', boxSizing:'border-box', padding:'12px 13px', border:'1px solid rgba(8,9,11,0.4)', background:'#fff', color:'#08090B', fontSize:16, lineHeight:1.5, resize:'vertical' }}/>
              </label>
            </div>
          )}

          {step === 1 && (
            <div style={{ padding:'4px 12px 16px' }}>
              <div style={{ paddingTop:14 }}>
                {groupHead('Business type *', shown('business_type'))}
                <MChipGroup options={BUSINESS_TYPES} value={form.business_type} onChange={v=>upd('business_type',v)}/>
              </div>
              <div style={{ paddingTop:18 }}>
                {groupHead('Monthly purchase volume *', shown('monthly_volume'))}
                <MChipGroup options={VOLUME_OPTIONS} value={form.monthly_volume} onChange={v=>upd('monthly_volume',v)} shortMap={VOLUME_SHORT}/>
              </div>

              <label style={{ display:'block', paddingTop:16 }}>
                {mLbl('EIN *', shown('ein_number'))}
                <input value={form.ein_number} onChange={e=>upd('ein_number',fmtEinDisplay(e.target.value))} onBlur={()=>setTouched(t=>({...t,ein_number:true}))} placeholder="00-0000000" style={{ ...mFieldMono, borderColor: shown('ein_number')?'#C2410C':'rgba(8,9,11,0.4)' }}/>
                <span style={{ display:'block', paddingTop:6, fontSize:12.5, color:'#6D6A64' }}>9 digits — on your IRS SS-4 letter</span>
              </label>
              <label style={{ display:'block', paddingTop:16 }}>
                {mLbl('Resale certificate number *', shown('resale_tax_number'))}
                <input value={form.resale_tax_number} onChange={e=>upd('resale_tax_number',e.target.value)} onBlur={()=>setTouched(t=>({...t,resale_tax_number:true}))} placeholder="e.g. 23-8020156685-2" style={{ ...mFieldMono, borderColor: shown('resale_tax_number')?'#C2410C':'rgba(8,9,11,0.4)' }}/>
                <span style={{ display:'block', paddingTop:6, fontSize:12.5, color:'#6D6A64' }}>As printed on your state certificate</span>
              </label>

              <div style={{ paddingTop:18, fontFamily:mono, fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'#5C5A55' }}>Documents · photo or PDF</div>
              <MDocRow label="IRS EIN letter (SS-4)" file={einFile} error={shown('einFile')} req={form.business_type !== 'Not yet registered'} onFile={onEinFile}/>
              <MDocRow label="Resale certificate" file={resaleFile} error={shown('resaleFile')} req={form.business_type !== 'Not yet registered'} onFile={onResaleFile}/>
              <div style={{ paddingTop:10, fontSize:12.5, lineHeight:1.5, color:'#6D6A64' }}>Take a clear photo of each document or upload the PDF. Max 10 MB. Only our team sees these.</div>

              <div style={{ borderLeft:`3px solid ${ACCENT}`, padding:'10px 0 3px 13px', marginTop:14 }}>
                <div style={{ fontFamily:mono, fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:ACCENT, paddingBottom:6 }}>No LLC yet?</div>
                <div style={{ fontSize:14.5, lineHeight:1.6, color:'#3F3D39' }}>
                  You can still apply. Select <strong style={{ color:'#08090B' }}>Not yet registered</strong>, write <strong style={{ color:'#08090B' }}>pending</strong> in the number fields and tell us in the notes — we review those applications individually.
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ padding:'2px 12px 16px' }}>
              {review.map(r => (
                <div key={r.title} style={{ paddingTop:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:6, borderBottom:'1px solid #08090B' }}>
                    <span style={{ fontFamily:mono, fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', fontWeight:700 }}>{r.title}</span>
                    <button type="button" onClick={()=>setStepAndScroll(r.go)} style={{ minHeight:36, padding:'0 4px', border:0, background:'transparent', color:ACCENT, fontFamily:mono, fontSize:10.5, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer' }}>Edit</button>
                  </div>
                  {r.rows.map(([k,v]) => (
                    <div key={k} style={{ display:'grid', gridTemplateColumns:'104px minmax(0,1fr)', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(8,9,11,0.12)' }}>
                      <span style={{ fontFamily:mono, fontSize:9.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6D6A64', paddingTop:2 }}>{k}</span>
                      <span style={{ fontSize:14.5, lineHeight:1.4, color:'#22211F', overflowWrap:'anywhere' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
              <label style={{ display:'grid', gridTemplateColumns:'26px minmax(0,1fr)', gap:11, alignItems:'start', marginTop:18, padding:'13px 12px', border:`1px solid ${shown('agree')?'#C2410C':'rgba(8,9,11,0.4)'}`, background:'#fff', cursor:'pointer' }}>
                <input type="checkbox" checked={agreed} onChange={e=>{ setAgreed(e.target.checked); setTouched(t=>({...t,agree:true})) }} style={{ width:22, height:22, marginTop:1, accentColor:'#08090B' }}/>
                <span style={{ fontSize:14, lineHeight:1.5, color:'#22211F' }}>I confirm the information above is accurate and my business is legitimate. I understand Levam Corp will contact me within 1–2 business days.</span>
              </label>
              {shown('agree') && <div style={{ paddingTop:8, fontFamily:mono, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'#C2410C' }}>{shown('agree')}</div>}
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'space-between', padding:'9px 12px 10px', borderTop:'1px solid #08090B', fontFamily:mono, fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'#5C5A55' }}>
            <span>{sheetFoot}</span><span>levamcorp.com</span>
          </div>
        </div>

        <div style={{ padding:'18px 16px 0', display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))' }}>
          {[['5 min','To apply'],['1–2 days','To answer'],['$0','Fee']].map(([v,k],i) => (
            <div key={k} style={{ paddingLeft: i?14:0, borderLeft: i?'1px solid rgba(242,239,230,0.18)':'none' }}>
              <div style={{ fontFamily:mono, fontWeight:700, fontSize:15 }}>{v}</div>
              <div style={{ paddingTop:3, fontFamily:mono, fontSize:9.5, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(242,239,230,0.5)' }}>{k}</div>
            </div>
          ))}
        </div>
      </main>

      <div style={{ position:'sticky', bottom:0, zIndex:30, display:'grid', gridTemplateColumns: step>0 ? '104px minmax(0,1fr)' : 'minmax(0,1fr)', background:'#08090B', borderTop:'1px solid rgba(242,239,230,0.2)', paddingBottom:'env(safe-area-inset-bottom)' }}>
        {step>0 && <button type="button" onClick={back} style={{ height:58, border:0, borderRight:'1px solid rgba(242,239,230,0.2)', background:'transparent', color:'#F2EFE6', fontFamily:mono, fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', cursor:'pointer' }}>← Back</button>}
        <button type="button" onClick={step===2 ? handleSubmit : next} disabled={step===2 && loading}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:58, padding:'0 18px', border:0, background:ACCENT, color:'#fff', fontFamily:mono, fontWeight:700, fontSize:12, letterSpacing:'0.16em', textTransform:'uppercase', cursor: (step===2 && loading) ? 'not-allowed' : 'pointer' }}>
          <span>{step===2 ? (loading?'Submitting…':'Submit application') : 'Continue'}</span>
          <span>{step===2 ? '✓' : `0${step+2} / 03 →`}</span>
        </button>
      </div>
    </div>
  )
}

function MobileApplySuccess({ form, appRef }) {
  const firstName = (form.contact_name || 'there').trim().split(' ')[0]
  return (
    <div style={{ minHeight:'100vh', background:'#08090B', color:'#F2EFE6', fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <header style={{ position:'sticky', top:0, zIndex:30, background:'rgba(8,9,11,0.97)', display:'flex', alignItems:'center', justifyContent:'center', height:56, borderBottom:'1px solid rgba(242,239,230,0.14)' }}>
        <span style={{ textAlign:'center' }}>
          <span style={{ display:'block', fontFamily:mono, fontWeight:700, fontSize:11.5, letterSpacing:'0.2em' }}>LEVAM<span style={{ color:ACCENT }}>CORP</span></span>
          <span style={{ display:'block', paddingTop:3, fontFamily:mono, fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(242,239,230,0.55)' }}>Application received</span>
        </span>
      </header>
      <main style={{ padding:'22px 12px 40px' }}>
        <div style={{ background:'#F2EFE6', color:'#08090B' }}>
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 12px', fontFamily:mono, fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#5C5A55' }}>
            <span>Receipt · Form 01</span><span>Ref · APP-{appRef}</span>
          </div>
          <div style={{ padding:'18px 12px 16px', borderTop:'1px solid #08090B' }}>
            <div style={{ display:'inline-block', transform:'rotate(-6deg)', border:`2px solid ${ACCENT}`, padding:'5px 10px 6px', fontFamily:mono, fontWeight:700, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase', color:ACCENT }}>Received</div>
            <div style={{ paddingTop:16, fontSize:29, letterSpacing:'-0.04em', lineHeight:1.05 }}>Thank you, {firstName}.</div>
            <div style={{ paddingTop:8, fontSize:15, lineHeight:1.55, color:'#3F3D39' }}>We received the application for <strong>{form.business_name || 'your business'}</strong>. A person on our team reviews it and answers within 1–2 business days at {form.email || 'your email'}.</div>
          </div>
          <div style={{ position:'relative', height:18 }}>
            <span style={{ position:'absolute', left:-9, top:0, width:18, height:18, borderRadius:'50%', background:'#08090B' }}/>
            <span style={{ position:'absolute', right:-9, top:0, width:18, height:18, borderRadius:'50%', background:'#08090B' }}/>
            <span style={{ position:'absolute', left:14, right:14, top:9, borderTop:'1px dashed rgba(8,9,11,0.45)' }}/>
          </div>
          <div style={{ padding:'4px 12px 14px' }}>
            <div style={{ fontFamily:mono, fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'#5C5A55' }}>What happens next</div>
            {[
              ['01','A person reviews your documents — no automated filter.'],
              ['02','You get a decision by email, approved or not. No silence.'],
              ['03','If approved, your portal credentials arrive in the same thread.'],
            ].map(([n,v]) => (
              <div key={n} style={{ display:'grid', gridTemplateColumns:'24px minmax(0,1fr)', gap:8, padding:'11px 0', borderBottom:'1px solid rgba(8,9,11,0.14)' }}>
                <span style={{ fontFamily:mono, fontSize:10, color:ACCENT, paddingTop:2 }}>{n}</span>
                <span style={{ fontSize:15, lineHeight:1.5, color:'#3F3D39' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <a href="https://wa.me/17864909005" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:54, marginTop:12, padding:'0 16px', border:'1px solid rgba(242,239,230,0.3)', fontFamily:mono, fontSize:11.5, letterSpacing:'0.14em', textTransform:'uppercase', color:'#F2EFE6', textDecoration:'none' }}>
          <span>Questions? WhatsApp us</span><span>↗</span>
        </a>
        <Link href="/" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:50, fontFamily:mono, fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(242,239,230,0.65)', textDecoration:'none' }}>Back to levamcorp.com</Link>
      </main>
    </div>
  )
}


export default function Apply() {
  const [form, setForm] = useState({
    business_name:'', contact_name:'', email:'', phone:'', address:'',
    years_in_business:'', heard_about:'', heard_about_detail:'', categories:[], notes:'',
    business_type:'', monthly_volume:'', ein_number:'', resale_tax_number:'',
  })
  const [einFile,    setEinFile]    = useState(null)
  const [resaleFile, setResaleFile] = useState(null)
  const [agreed,     setAgreed]     = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [touched,    setTouched]    = useState({})
  const [step,       setStep]       = useState(0)
  const [saved,      setSaved]      = useState(false)
  const [ref,        setRef]        = useState('')
  const [isMobile,   setIsMobile]   = useState(false)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Restore an in-progress draft (fields only — files can't be persisted) so a
  // closed tab or accidental refresh doesn't lose someone's half-filled application.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (d && d.form) { setForm(prev => ({ ...prev, ...d.form })); setStep(d.step || 0); setSaved(true) }
      }
    } catch {}
  }, [])

  const persist = (f, s) => { try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ form:f, step:s })) } catch {} }

  const upd = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      persist(next, step)
      return next
    })
    setTouched(prev => ({ ...prev, [field]: true }))
    setSaved(true)
  }
  const toggleCat = c => upd('categories', form.categories.includes(c) ? form.categories.filter(x=>x!==c) : [...form.categories, c])

  // allowImage: mobile applicants often only have a phone photo of these documents
  // (no scanner handy), so the mobile layout accepts images too; desktop stays
  // PDF-only, unchanged, since this defaults to false.
  const pickFile = (setFile, file, allowImage = false) => {
    if (!file) return
    const okType = file.type === 'application/pdf' || (allowImage && file.type.startsWith('image/'))
    if (!okType) { setFile({ name:file.name, _err: allowImage ? 'Photo or PDF only' : 'PDF only' }); return }
    if (file.size > 10 * 1024 * 1024) { setFile({ name:file.name, _err:'Max 10MB' }); return }
    setFile(file)
  }

  const problems = (s) => {
    const p = {}
    if (s === 0) {
      if (!form.business_name.trim()) p.business_name = 'Required'
      if (!form.contact_name.trim())  p.contact_name  = 'Required'
      if (!form.email.trim()) p.email = 'Required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) p.email = 'Check format'
      const digits = form.phone.replace(/\D/g,'')
      if (!digits) p.phone = 'Required'
      else if (digits.length < 10) p.phone = '10 digits'
      if (!form.heard_about) p.heard_about = 'Required'
      if (!form.categories.length) p.categories = 'Pick at least one'
    }
    if (s === 1) {
      if (!form.business_type) p.business_type = 'Required'
      if (!form.monthly_volume) p.monthly_volume = 'Required'
      if (!form.ein_number.trim()) p.ein_number = 'Required'
      if (!form.resale_tax_number.trim()) p.resale_tax_number = 'Required'
      // Not yet registered — there's no EIN/SS-4 letter or resale certificate to upload yet.
      // The "No LLC yet?" note below tells applicants to write "pending" in the number fields
      // instead; we still review these individually rather than blocking them at this step.
      if (form.business_type !== 'Not yet registered') {
        if (!einFile || einFile._err) p.einFile = einFile?._err || 'Required'
        if (!resaleFile || resaleFile._err) p.resaleFile = resaleFile?._err || 'Required'
      } else {
        if (einFile?._err) p.einFile = einFile._err
        if (resaleFile?._err) p.resaleFile = resaleFile._err
      }
    }
    if (s === 2 && !agreed) p.agree = 'Please confirm before submitting'
    return p
  }

  const shown = (k) => touched[k] ? problems(step)[k] : ''

  const next = () => {
    const p = problems(step)
    if (Object.keys(p).length) {
      setTouched(prev => { const t = { ...prev }; Object.keys(p).forEach(k => t[k]=true); return t })
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    if (step < 2) { const s = step+1; setStep(s); persist(form, s) }
  }
  const back = () => { setError(''); const s = step-1; setStep(s); persist(form, s) }

  const handleSubmit = async () => {
    const p = problems(2)
    if (Object.keys(p).length) { setTouched(prev => ({ ...prev, agree:true })); setError('Please agree to the terms to continue.'); return }
    setLoading(true); setError('')
    try {
      const sb = createClient()
      let einUrl = null, resaleUrl = null
      if (einFile && !einFile._err) {
        const { data } = await sb.storage.from('Documents').upload(`ein/${Date.now()}-${einFile.name}`, einFile, { contentType: einFile.type || 'application/pdf' })
        if (data) einUrl = data.path
      }
      if (resaleFile && !resaleFile._err) {
        const { data } = await sb.storage.from('Documents').upload(`resale/${Date.now()}-${resaleFile.name}`, resaleFile, { contentType: resaleFile.type || 'application/pdf' })
        if (data) resaleUrl = data.path
      }
      const { error: err } = await sb.from('applications').insert([{ ...form, ein:form.ein_number, ein_document_url:einUrl, resale_tax_document_url:resaleUrl, heard_about:form.heard_about, heard_about_detail:form.heard_about_detail }])
      if (err) throw err
      await fetch('/api/send-application-email', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:form.email, businessName:form.business_name, contactName:form.contact_name }) })
      let r = ''
      const pool = '0123456789ABCDEF'
      for (let i=0;i<4;i++) r += pool[Math.floor(Math.random()*pool.length)]
      setRef(r)
      setSubmitted(true)
      try { window.localStorage.removeItem(DRAFT_KEY) } catch {}
    } catch { setError('Something went wrong. Please try again.') }
    finally { setLoading(false) }
  }

  const firstName = (form.contact_name || 'there').trim().split(' ')[0]
  const punches = [0,1,2,3,4].map(i => i===2 ? { c:ACCENT, o:0.9 } : { c:'#08090B', o:0.16 })
  const cut = Math.round(((step+1)/3) * BARCODE_SEED.length)
  const barcode = BARCODE_SEED.map((b,i) => ({ grow:b.grow, h:b.tall?'18px':'13px', c: i<cut?ACCENT:'#08090B', o: i<cut?0.95:0.16 }))
  const heardLabel = HEARD_ABOUT_OPTIONS.find(([v])=>v===form.heard_about)?.[1] || ''

  const globalStyle = `
    .lc-mono { font-family:${mono}; }
    input, select, textarea, button { font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: 2px solid ${ACCENT}; outline-offset: -2px; }
    input::placeholder, textarea::placeholder { color: rgba(8,9,11,0.35); }
  `

  const stepInput = { width:'100%', boxSizing:'border-box', border:0, borderBottom:'1px solid rgba(8,9,11,0.3)', background:'transparent', padding:'8px 2px 9px', fontSize:16, letterSpacing:'-0.01em', color:'#08090B' }
  const stepInputMono = { ...stepInput, fontFamily:mono, fontSize:16, letterSpacing:'0.04em' }
  const errBorder = { borderBottom:'1px solid #C2410C' }

  // allowImage=true here — mobile applicants often only have a phone photo of
  // these documents, unlike desktop's drag-and-drop which stays PDF-only.
  const onEinFile    = f => { pickFile(setEinFile, f, true);    setTouched(p => ({ ...p, einFile:true })) }
  const onResaleFile = f => { pickFile(setResaleFile, f, true); setTouched(p => ({ ...p, resaleFile:true })) }

  // ── SUCCESS ─────────────────────────────────────────────────────────────
  if (submitted) return isMobile ? <MobileApplySuccess form={form} appRef={ref}/> : (
    <div style={{ minHeight:'100vh', background:'#08090B', color:'#F2EFE6', fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{globalStyle}</style>
      <div style={{ maxWidth:720, margin:'0 auto', padding:'clamp(40px,8vh,90px) clamp(16px,4vw,48px)' }}>
        <div style={{ background:'#F2EFE6', color:'#08090B', padding:'clamp(18px,2.6vh,26px) clamp(20px,3vw,38px) clamp(20px,3vh,28px)' }}>
          <div style={{ display:'flex', gap:'clamp(24px,5vw,52px)', justifyContent:'center', paddingBottom:16 }}>
            {punches.map((p,i) => <div key={i} style={{ width:12, height:12, borderRadius:'50%', background:p.c, opacity:p.o }}/>)}
          </div>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', paddingBottom:11, borderBottom:'1px solid rgba(8,9,11,0.9)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase' }}>
            <span style={{ display:'flex', alignItems:'center', gap:9 }}><span style={{ width:11, height:11, border:'1px solid #08090B', borderLeft:`3px solid ${ACCENT}`, display:'inline-block' }}/>Receipt · Form 01</span>
            <span style={{ color:'#5C5A55' }}>Status · Received</span>
          </div>
          <div style={{ marginTop:'clamp(22px,3.4vh,32px)', display:'inline-block', border:`2px solid ${ACCENT}`, padding:'8px 14px 9px', textAlign:'center' }}>
            <div className="lc-mono" style={{ fontWeight:700, fontSize:12, letterSpacing:'0.3em', textTransform:'uppercase', color:ACCENT }}>Received</div>
            <div className="lc-mono" style={{ paddingTop:3, fontSize:8, letterSpacing:'0.2em', textTransform:'uppercase', color:ACCENT }}>Levam Corp · Doral FL</div>
          </div>
          <h1 style={{ margin:'clamp(18px,2.6vh,24px) 0 0', fontSize:'clamp(30px,3.8vw,44px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1.02, color:'#08090B' }}>
            Application submitted<span style={{ color:ACCENT }}>.</span>
          </h1>
          <p style={{ margin:'14px 0 0', maxWidth:'52ch', fontSize:15.5, lineHeight:1.66, color:'#3F3D39' }}>
            Thank you, {firstName}. A person on our team reads every application — you&rsquo;ll get a decision at the email below within 1–2 business days.
          </p>
          <div style={{ marginTop:'clamp(20px,3vh,26px)', display:'inline-block', background:'#08090B' }}>
            <span className="lc-mono" style={{ display:'block', padding:'10px 14px 11px', fontSize:14, fontWeight:700, letterSpacing:'0.04em', color:'#F2EFE6', wordBreak:'break-all' }}>{form.email || 'your email'}</span>
          </div>
          <div style={{ marginTop:'clamp(22px,3.4vh,30px)', borderTop:'1px solid rgba(8,9,11,0.9)' }}>
            {[
              ['Reference', `APP · ${ref}`],
              ['Business', form.business_name || '—'],
              ['Submitted', new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})],
              ['Decision by', '1–2 business days'],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'grid', gridTemplateColumns:'clamp(112px,15vw,168px) minmax(0,1fr)', gap:'10px 14px', alignItems:'baseline', padding:'11px 0 12px', borderBottom:'1px solid rgba(8,9,11,0.12)' }}>
                <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>{k}</span>
                <span className="lc-mono" style={{ fontSize:12.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'#08090B', overflowWrap:'anywhere' }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="lc-mono" style={{ marginTop:'clamp(22px,3.4vh,30px)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55', paddingBottom:12 }}>What happens next</div>
          {[
            ['01','A person reviews your documents — no automated filter.'],
            ['02','You get a decision by email, approved or not. No silence.'],
            ['03','If approved, your portal credentials arrive in the same thread.'],
          ].map(([n,v]) => (
            <div key={n} style={{ display:'grid', gridTemplateColumns:'26px minmax(0,1fr)', gap:14, alignItems:'baseline', padding:'9px 0 10px', borderBottom:'1px solid rgba(8,9,11,0.12)' }}>
              <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.1em', color:ACCENT }}>{n}</span>
              <span style={{ fontSize:14.5, lineHeight:1.55, color:'#3F3D39' }}>{v}</span>
            </div>
          ))}
          <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', marginTop:'clamp(22px,3.4vh,30px)' }}>
            <Link href="/" className="lc-mono" style={{ display:'inline-flex', alignItems:'center', gap:12, padding:'14px 20px', background:'#08090B', color:'#F2EFE6', fontWeight:700, fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', textDecoration:'none' }}>Back to homepage →</Link>
            <a href="https://wa.me/17864909005" className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'#08090B', borderBottom:`1px solid ${ACCENT}`, paddingBottom:3, textDecoration:'none' }}>Question? WhatsApp us</a>
          </div>
          <div style={{ boxSizing:'border-box', display:'flex', alignItems:'flex-end', gap:2, height:30, padding:'8px 0 0', marginTop:'clamp(20px,3vh,26px)', overflow:'hidden', borderTop:'1px solid rgba(8,9,11,0.16)' }}>
            {BARCODE_DONE.map((b,i) => <div key={i} style={{ flex:`${b.grow} 1 0`, minWidth:1, height:b.tall?'18px':'13px', background:'#08090B', opacity:0.8 }}/>)}
          </div>
          <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, paddingTop:5, fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
            <span>Keep this reference for your records</span><span>levamcorp.com</span>
          </div>
        </div>
      </div>
    </div>
  )

  // ── FORM ────────────────────────────────────────────────────────────────
  const steps = ['Business info','Documents','Review & submit']

  if (isMobile) return (
    <MobileApplyForm
      form={form} upd={upd} toggleCat={toggleCat} einFile={einFile} resaleFile={resaleFile}
      agreed={agreed} setAgreed={setAgreed} setTouched={setTouched}
      step={step} setStep={setStep} persist={persist} next={next} back={back} handleSubmit={handleSubmit}
      loading={loading} error={error} saved={saved} shown={shown} heardLabel={heardLabel}
      onEinFile={onEinFile} onResaleFile={onResaleFile}
    />
  )

  return (
    <div style={{ minHeight:'100vh', background:'#08090B', color:'#F2EFE6', fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{globalStyle}</style>
      <style>{`@media(max-width:860px){ .apply-shell{ grid-template-columns:minmax(0,1fr) !important; } }`}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'16px clamp(16px,4vw,48px)', borderBottom:'1px solid rgba(242,239,230,0.14)' }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:11, textDecoration:'none', color:'#F2EFE6' }}>
          <span style={{ display:'inline-block', width:15, height:15, border:'1px solid rgba(242,239,230,0.6)', borderLeft:`3px solid ${ACCENT}` }}/>
          <span className="lc-mono" style={{ fontWeight:700, fontSize:11, letterSpacing:'0.22em', textTransform:'uppercase' }}>Levamcorp</span>
          <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67' }}>Doral · FL</span>
        </Link>
        <Link href="/portal" className="lc-mono" style={{ fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#F2EFE6', border:'1px solid rgba(242,239,230,0.3)', padding:'9px 14px', textDecoration:'none' }}>Client portal →</Link>
      </div>

      <div style={{ maxWidth:1180, margin:'0 auto', padding:'clamp(30px,5vh,56px) clamp(16px,4vw,48px) clamp(60px,9vh,110px)' }}>
        <div className="apply-shell" style={{ display:'grid', gridTemplateColumns:'minmax(230px,300px) minmax(0,1fr)', gap:'clamp(20px,3vw,44px)', alignItems:'start' }}>

          {/* SIDEBAR */}
          <div style={{ position:'sticky', top:24 }}>
            <div className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase', color:'#6F6D67', paddingBottom:12 }}>Partner application · Form 01</div>
            <div style={{ height:1, background:'rgba(242,239,230,0.3)' }}/>
            <h1 style={{ margin:'18px 0 0', fontSize:'clamp(28px,3.4vw,42px)', fontWeight:400, letterSpacing:'-0.04em', lineHeight:1.02, color:'#F5F2E9' }}>
              Join our distributor network<span style={{ color:ACCENT }}>.</span>
            </h1>
            <p style={{ margin:'14px 0 0', maxWidth:'34ch', fontSize:14.5, lineHeight:1.62, color:'#9A968E' }}>
              A person reads every application. No automated filter, no silence — you get a decision within 1–2 business days.
            </p>

            <div style={{ marginTop:'clamp(22px,3.4vh,32px)', borderTop:'1px solid rgba(242,239,230,0.16)' }}>
              {steps.map((s,i) => {
                const on = i===step, passed = i<step
                return (
                  <button key={s} type="button" onClick={()=>{ if (i<=step) { setStep(i); persist(form,i) } }}
                    style={{ width:'100%', textAlign:'left', border:0, borderBottom:'1px solid rgba(242,239,230,0.09)', background: on?'rgba(242,239,230,0.05)':'transparent', cursor: i<=step?'pointer':'default', display:'grid', gridTemplateColumns:'26px 1fr auto', gap:12, alignItems:'center', padding:'13px 10px 14px 8px' }}>
                    <span className="lc-mono" style={{ fontSize:9.5, letterSpacing:'0.1em', color: on?ACCENT:passed?'#9A968E':'#5F5D58' }}>0{i+1}</span>
                    <span className="lc-mono" style={{ fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color: on?'#ffffff':passed?'#C9C5BA':'#6F6D67' }}>{s}</span>
                    <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color: passed?ACCENT:'#6F6D67' }}>{passed?'Done':on?'Now':''}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, height:2, background:'rgba(242,239,230,0.12)' }}>
                <div style={{ height:2, background:ACCENT, width:`${Math.round(((step+1)/3)*100)}%` }}/>
              </div>
              <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67' }}>{Math.round(((step+1)/3)*100)}%</span>
            </div>

            <div className="lc-mono" style={{ marginTop:'clamp(22px,3.4vh,32px)', paddingTop:14, borderTop:'1px solid rgba(242,239,230,0.16)', fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'#6F6D67', lineHeight:2.1 }}>
              {saved ? 'Draft saved on this device' : 'Your draft saves as you type'}<br/>Confidential · partner vetting only<br/>No LLC yet? Apply anyway — note it below.
            </div>
          </div>

          {/* SHEET */}
          <div style={{ background:'#F2EFE6', color:'#08090B' }}>
            <div style={{ display:'flex', gap:'clamp(24px,5vw,52px)', justifyContent:'center', padding:'16px 0 0' }}>
              {punches.map((p,i) => <div key={i} style={{ width:12, height:12, borderRadius:'50%', background:p.c, opacity:p.o }}/>)}
            </div>

            <div className="lc-mono" style={{ margin:'14px clamp(18px,3vw,34px) 0', display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', paddingBottom:11, borderBottom:'1px solid rgba(8,9,11,0.9)', fontSize:9.5, letterSpacing:'0.2em', textTransform:'uppercase' }}>
              <span style={{ display:'flex', alignItems:'center', gap:9 }}>
                <span style={{ width:11, height:11, border:'1px solid #08090B', borderLeft:`3px solid ${ACCENT}`, display:'inline-block' }}/>
                {['Section 01 · Business','Section 02 · Documents','Section 03 · Review'][step]}
              </span>
              <span style={{ color:'#5C5A55' }}>Form 01 · Rev. 08</span>
            </div>

            {/* STEP 1 */}
            {step === 0 && (
              <div style={{ padding:'clamp(20px,3vh,28px) clamp(18px,3vw,34px) 0' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:'0 clamp(16px,2.6vw,30px)' }}>
                  <label style={{ display:'block', paddingBottom:16 }}>
                    <Lbl text="Business name" req error={shown('business_name')}/>
                    <input value={form.business_name} onChange={e=>upd('business_name',e.target.value)} placeholder="Acme Distribution LLC" style={{ ...stepInput, ...(shown('business_name')?errBorder:{}) }}/>
                  </label>
                  <label style={{ display:'block', paddingBottom:16 }}>
                    <Lbl text="Contact name" req error={shown('contact_name')}/>
                    <input value={form.contact_name} onChange={e=>upd('contact_name',e.target.value)} placeholder="John Smith" style={{ ...stepInput, ...(shown('contact_name')?errBorder:{}) }}/>
                  </label>
                  <label style={{ display:'block', paddingBottom:16 }}>
                    <Lbl text="Work email" req error={shown('email')}/>
                    <input type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="john@acmedist.com" style={{ ...stepInputMono, ...(shown('email')?errBorder:{}) }}/>
                  </label>
                  <label style={{ display:'block', paddingBottom:16 }}>
                    <Lbl text="Phone" req error={shown('phone')}/>
                    <input type="tel" value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="(305) 555-0100" style={{ ...stepInputMono, letterSpacing:'0.04em', ...(shown('phone')?errBorder:{}) }}/>
                  </label>
                </div>

                <label style={{ display:'block', paddingBottom:16 }}>
                  <Lbl text="Business address"/>
                  <input value={form.address} onChange={e=>upd('address',e.target.value)} placeholder="123 Main St, Miami, FL 33101" style={stepInput}/>
                </label>

                <div style={{ paddingBottom:18 }}>
                  <Lbl text="Years in business"/>
                  <ChipGroup options={YEARS_OPTIONS} value={form.years_in_business} onChange={v=>upd('years_in_business',v)}/>
                </div>

                <div style={{ paddingBottom:18 }}>
                  <Lbl text="Where did you hear about us?" req error={shown('heard_about')}/>
                  <select value={form.heard_about} onChange={e=>upd('heard_about',e.target.value)}
                    style={{ width:'100%', boxSizing:'border-box', border:`0 0 1px 0`, borderBottom:`1px solid ${shown('heard_about')?'#C2410C':'rgba(8,9,11,0.3)'}`, background:'transparent', padding:'8px 2px 9px', fontSize:16, color:'#08090B', appearance:'none', cursor:'pointer' }}>
                    <option value="">Select an option...</option>
                    {HEARD_ABOUT_OPTIONS.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  {['friend','broker','existing_client'].includes(form.heard_about) ? (
                    <input value={form.heard_about_detail} onChange={e=>upd('heard_about_detail',e.target.value)}
                      placeholder={form.heard_about==='broker' ? 'Broker name or company...' : 'Their name (optional)...'} style={{ ...stepInput, marginTop:8 }}/>
                  ) : form.heard_about==='other' ? (
                    <input value={form.heard_about_detail} onChange={e=>upd('heard_about_detail',e.target.value)}
                      placeholder="Please tell us how you found us..." style={{ ...stepInput, marginTop:8 }}/>
                  ) : null}
                </div>

                <div style={{ paddingBottom:18 }}>
                  <Lbl text="Product categories you resell" req error={shown('categories')} note={form.categories.length ? `${form.categories.length} selected` : ''}/>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:1, background:'rgba(8,9,11,0.85)' }}>
                    {PRODUCT_CATEGORIES.map(c => <Chip key={c} label={c} on={form.categories.includes(c)} onClick={()=>toggleCat(c)}/>)}
                  </div>
                </div>

                <label style={{ display:'block', paddingBottom:6 }}>
                  <Lbl text="Additional notes"/>
                  <textarea rows={4} value={form.notes} onChange={e=>upd('notes',e.target.value)} placeholder="Where you sell, who your customers are, volume you expect…"
                    style={{ width:'100%', boxSizing:'border-box', border:'1px solid rgba(8,9,11,0.3)', background:'transparent', padding:'11px 12px', fontSize:16, lineHeight:1.6, color:'#08090B', resize:'vertical' }}/>
                </label>
              </div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <div style={{ padding:'clamp(20px,3vh,28px) clamp(18px,3vw,34px) 0' }}>
                <div style={{ paddingBottom:18 }}>
                  <Lbl text="Business type" req error={shown('business_type')}/>
                  <ChipGroup options={BUSINESS_TYPES} value={form.business_type} onChange={v=>upd('business_type',v)}/>
                </div>
                <div style={{ paddingBottom:18 }}>
                  <Lbl text="Monthly purchase volume" req error={shown('monthly_volume')}/>
                  <ChipGroup options={VOLUME_OPTIONS} value={form.monthly_volume} onChange={v=>upd('monthly_volume',v)}/>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:'0 clamp(16px,2.6vw,30px)' }}>
                  <label style={{ display:'block', paddingBottom:18 }}>
                    <Lbl text="EIN number" req error={shown('ein_number')}/>
                    <input value={form.ein_number} onChange={e=>upd('ein_number',e.target.value)} placeholder="XX-XXXXXXX" style={{ ...stepInputMono, letterSpacing:'0.1em', ...(shown('ein_number')?errBorder:{}) }}/>
                  </label>
                  <label style={{ display:'block', paddingBottom:18 }}>
                    <Lbl text="Resale tax number" req error={shown('resale_tax_number')}/>
                    <input value={form.resale_tax_number} onChange={e=>upd('resale_tax_number',e.target.value)} placeholder="State resale certificate #" style={{ ...stepInputMono, letterSpacing:'0.1em', ...(shown('resale_tax_number')?errBorder:{}) }}/>
                  </label>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'clamp(14px,2.2vw,24px)', paddingBottom:16 }}>
                  <FileUpload label="EIN / SS-4 document" file={einFile} error={shown('einFile')} req={form.business_type !== 'Not yet registered'} onChange={f=>{ pickFile(setEinFile,f); setTouched(p=>({...p,einFile:true})) }}/>
                  <FileUpload label="Resale tax certificate" file={resaleFile} error={shown('resaleFile')} req={form.business_type !== 'Not yet registered'} onChange={f=>{ pickFile(setResaleFile,f); setTouched(p=>({...p,resaleFile:true})) }}/>
                </div>

                <div style={{ borderLeft:`3px solid ${ACCENT}`, padding:'2px 0 3px 13px', marginBottom:6 }}>
                  <div className="lc-mono" style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:ACCENT, paddingBottom:6 }}>No LLC yet?</div>
                  <div style={{ fontSize:14.5, lineHeight:1.6, color:'#3F3D39', maxWidth:'62ch' }}>
                    You can still apply. Select <strong style={{ color:'#08090B' }}>Not yet registered</strong>, write <strong style={{ color:'#08090B' }}>pending</strong> in the number fields and tell us in the notes — we review those applications individually.
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <div style={{ padding:'clamp(20px,3vh,28px) clamp(18px,3vw,34px) 0' }}>
                {[
                  ['Business name', form.business_name],
                  ['Contact', form.contact_name],
                  ['Email', form.email],
                  ['Phone', form.phone],
                  ['Address', form.address],
                  ['Years in business', form.years_in_business],
                  ['Categories', form.categories.join(' · ')],
                  ['Heard about us', heardLabel + (form.heard_about_detail ? ` — ${form.heard_about_detail}` : '')],
                  ['Business type', form.business_type],
                  ['Monthly volume', form.monthly_volume],
                  ['EIN', form.ein_number],
                  ['Resale #', form.resale_tax_number],
                  ['EIN document', einFile && !einFile._err ? einFile.name : ''],
                  ['Resale document', resaleFile && !resaleFile._err ? resaleFile.name : ''],
                  ['Notes', form.notes],
                ].map(([k,v],i) => (
                  <div key={k} style={{ display:'grid', gridTemplateColumns:'26px clamp(112px,15vw,176px) minmax(0,1fr)', gap:'8px 14px', alignItems:'baseline', padding:'10px 0 11px', borderBottom:'1px solid rgba(8,9,11,0.12)' }}>
                    <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.1em', color:'#8D8981' }}>{i+1<10?'0':''}{i+1}</span>
                    <span className="lc-mono" style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', borderRight:'1px solid rgba(8,9,11,0.14)', paddingRight:14, color:'#5C5A55' }}>{k}</span>
                    <span style={{ fontSize:15, lineHeight:1.5, color: v ? '#08090B' : '#9A968E', overflowWrap:'anywhere' }}>{v || '—'}</span>
                  </div>
                ))}

                <div style={{ marginTop:'clamp(18px,2.6vh,24px)' }}>
                  <label style={{ display:'grid', gridTemplateColumns:'22px 1fr', gap:12, alignItems:'start', cursor:'pointer', border:`1px solid ${shown('agree')?'#C2410C':'rgba(8,9,11,0.3)'}`, padding:'14px 15px' }}>
                    <input type="checkbox" checked={agreed} onChange={e=>{ setAgreed(e.target.checked); setTouched(p=>({...p,agree:true})) }} style={{ width:17, height:17, margin:'1px 0 0', accentColor:ACCENT }}/>
                    <span style={{ fontSize:14.5, lineHeight:1.58, color:'#3F3D39' }}>I confirm the information above is accurate and my business is legitimate. I understand Levam Corp will contact me within 1–2 business days.</span>
                  </label>
                  {shown('agree') && <div className="lc-mono" style={{ paddingTop:8, fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'#C2410C' }}>{shown('agree')}</div>}
                </div>
              </div>
            )}

            {error && (
              <div style={{ margin:'16px clamp(18px,3vw,34px) 0', padding:'10px 14px', background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.3)', fontSize:12, color:'#C0392B' }}>
                {error}
              </div>
            )}

            <div style={{ padding:'clamp(18px,2.6vh,24px) clamp(18px,3vw,34px) 0' }}>
              <div style={{ height:1, background:'rgba(8,9,11,0.9)' }}/>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, flexWrap:'wrap', padding:'14px 0 clamp(16px,2.4vh,22px)' }}>
                <button type="button" onClick={back} className="lc-mono" style={{ border:0, background:'transparent', cursor:'pointer', padding:'12px 0', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55', visibility: step===0?'hidden':'visible' }}>← Back</button>
                {step < 2 ? (
                  <button type="button" onClick={next} className="lc-mono" style={{ border:0, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:12, padding:'15px 22px', background:ACCENT, color:'#08090B', fontWeight:700, fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase' }}>Continue <span style={{ fontSize:12, fontWeight:400 }}>→</span></button>
                ) : (
                  <button type="button" onClick={handleSubmit} disabled={loading} className="lc-mono" style={{ border:0, cursor: loading?'not-allowed':'pointer', display:'inline-flex', alignItems:'center', gap:12, padding:'15px 22px', background: loading?'rgba(8,9,11,0.4)':ACCENT, color:'#08090B', fontWeight:700, fontSize:10.5, letterSpacing:'0.2em', textTransform:'uppercase' }}>{loading?'Submitting…':'Submit application'} <span style={{ fontSize:12, fontWeight:400 }}>→</span></button>
                )}
              </div>
            </div>

            <div style={{ boxSizing:'border-box', display:'flex', alignItems:'flex-end', gap:2, height:30, padding:'8px clamp(18px,3vw,34px)', overflow:'hidden', borderTop:'1px solid rgba(8,9,11,0.16)' }}>
              {barcode.map((b,i) => <div key={i} style={{ flex:`${b.grow} 1 0`, minWidth:1, height:b.h, background:b.c, opacity:b.o }}/>)}
            </div>
            <div className="lc-mono" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, padding:'0 clamp(18px,3vw,34px) 14px', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#5C5A55' }}>
              <span>{['Step 01 of 03 · business info','Step 02 of 03 · documents','Step 03 of 03 · confirm & submit'][step]}</span>
              <span>levamcorp.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
