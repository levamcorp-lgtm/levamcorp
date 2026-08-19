'use client'
import { useEffect, useRef, useState } from 'react'

function useSmoothMouse(stiffness = 0.07) {
  const raw = useRef({ x: 0, y: 0 })
  const [sm, setSm] = useState({ x: 0, y: 0 })
  const cur = useRef({ x: 0, y: 0 })
  const raf = useRef(null)

  useEffect(() => {
    const onMove = e => {
      raw.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMove)

    const tick = () => {
      cur.current.x += (raw.current.x - cur.current.x) * stiffness
      cur.current.y += (raw.current.y - cur.current.y) * stiffness
      setSm({ x: cur.current.x, y: cur.current.y })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [stiffness])

  return sm
}

export default function ParallaxLayers({ scrollY = 0 }) {
  const m = useSmoothMouse(0.06)

  const layer = (depth, scrollF, children, z = 1) => ({
    position: 'absolute', inset: '-8%', zIndex: z,
    transform: `translate3d(${m.x * depth * 60}px, ${m.y * depth * 40 - scrollY * scrollF}px, 0)`,
    willChange: 'transform',
    transition: 'transform 0.05s linear',
    children,
  })

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>

      {/* Layer 1 — dot grid */}
      <div style={{ position:'absolute', inset:'-8%', zIndex:1,
        transform:`translate3d(${m.x*4}px,${m.y*3 - scrollY*0.05}px,0)`,
        backgroundImage:'radial-gradient(rgba(14,165,233,0.14) 1px, transparent 1px)',
        backgroundSize:'28px 28px', willChange:'transform' }}/>

      {/* Layer 2 — left glow */}
      <div style={{ position:'absolute', inset:'-8%', zIndex:2,
        transform:`translate3d(${m.x*8}px,${m.y*5 - scrollY*0.08}px,0)`, willChange:'transform' }}>
        <div style={{ position:'absolute', left:'0%', top:'10%', width:'50%', height:'70%',
          background:'radial-gradient(ellipse,rgba(99,102,241,0.06) 0%,transparent 70%)', filter:'blur(40px)' }}/>
      </div>

      {/* Layer 3 — right glow */}
      <div style={{ position:'absolute', inset:'-8%', zIndex:2,
        transform:`translate3d(${m.x*10}px,${m.y*7 - scrollY*0.1}px,0)`, willChange:'transform' }}>
        <div style={{ position:'absolute', right:'0%', top:'5%', width:'50%', height:'80%',
          background:'radial-gradient(ellipse,rgba(14,165,233,0.06) 0%,transparent 65%)', filter:'blur(50px)' }}/>
      </div>

      {/* Layer 4 — SVG node network */}
      <div style={{ position:'absolute', inset:'-8%', zIndex:3, opacity:0.25,
        transform:`translate3d(${m.x*15}px,${m.y*10 - scrollY*0.15}px,0)`, willChange:'transform' }}>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {[[120,180,380,420],[380,420,650,200],[650,200,920,450],[920,450,1200,280],[1200,280,1380,500],
            [120,180,300,600],[300,600,580,700],[820,580,1100,720]].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(14,165,233,0.3)" strokeWidth="0.5"/>
          ))}
          {[[120,180],[380,420],[650,200],[920,450],[1200,280],[300,600],[580,700],[1100,720]].map(([cx,cy],i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="3" fill="rgba(14,165,233,0.5)"/>
              <circle cx={cx} cy={cy} r="8" fill="none" stroke="rgba(14,165,233,0.12)" strokeWidth="0.5"/>
            </g>
          ))}
        </svg>
      </div>

      {/* Layer 5 — hex fragments */}
      <div style={{ position:'absolute', inset:'-8%', zIndex:4, opacity:0.15,
        transform:`translate3d(${m.x*22}px,${m.y*15 - scrollY*0.2}px,0)`, willChange:'transform' }}>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {[[200,150,60],[1100,200,80],[800,600,50],[350,700,70],[1250,650,55],[600,100,45],[950,350,65]].map(([cx,cy,r],i) => {
            const pts = Array.from({length:6},(_,k)=>{const a=Math.PI/180*(60*k-30);return`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`}).join(' ')
            return <polygon key={i} points={pts} fill="none" stroke={i%2===0?'rgba(14,165,233,0.4)':'rgba(99,102,241,0.3)'} strokeWidth="0.5"/>
          })}
        </svg>
      </div>

      {/* Layer 6 — floating metric cards */}
      <div style={{ position:'absolute', inset:'-8%', zIndex:6,
        transform:`translate3d(${m.x*35}px,${m.y*25 - scrollY*0.4}px,0)`, willChange:'transform' }}>
        <div style={{ position:'absolute', left:'4%', top:'18%',
          background:'rgba(14,165,233,0.05)', border:'1px solid rgba(14,165,233,0.14)',
          borderRadius:8, padding:'10px 16px', backdropFilter:'blur(8px)' }}>
          <div style={{ fontSize:9, color:'rgba(14,165,233,0.7)', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:3 }}>Dispatch</div>
          <div style={{ fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>48h</div>
          <div style={{ fontSize:8, color:'rgba(255,255,255,0.22)', marginTop:2 }}>avg. turnaround</div>
        </div>
        <div style={{ position:'absolute', right:'5%', bottom:'22%',
          background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.14)',
          borderRadius:8, padding:'10px 16px', backdropFilter:'blur(8px)' }}>
          <div style={{ fontSize:9, color:'rgba(99,102,241,0.8)', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:3 }}>Active SKUs</div>
          <div style={{ fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>500+</div>
          <div style={{ fontSize:8, color:'rgba(255,255,255,0.22)', marginTop:2 }}>across all brands</div>
        </div>
        <div style={{ position:'absolute', right:'8%', top:'35%',
          display:'flex', alignItems:'center', gap:6,
          background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.18)',
          borderRadius:20, padding:'6px 12px', backdropFilter:'blur(8px)' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 6px #22c55e' }}/>
          <span style={{ fontSize:9, fontWeight:700, color:'rgba(34,197,94,0.9)', letterSpacing:'0.1em', textTransform:'uppercase' }}>B2B only · verified</span>
        </div>
      </div>

      {/* Layer 7 — light flares */}
      <div style={{ position:'absolute', inset:'-8%', zIndex:7,
        transform:`translate3d(${m.x*50}px,${m.y*36 - scrollY*0.5}px,0)`, willChange:'transform' }}>
        {[{x:'15%',y:'25%',s:3,c:'#0EA5E9',g:12,a:0},{x:'78%',y:'15%',s:2,c:'#38BDF8',g:8,a:1},
          {x:'88%',y:'60%',s:4,c:'#6366F1',g:14,a:2},{x:'8%',y:'70%',s:2,c:'#0EA5E9',g:8,a:3},
          {x:'55%',y:'85%',s:3,c:'#38BDF8',g:10,a:0},{x:'42%',y:'12%',s:2,c:'#6366F1',g:7,a:1}
        ].map((f,i) => (
          <div key={i} style={{ position:'absolute', left:f.x, top:f.y, width:f.s, height:f.s,
            borderRadius:'50%', background:f.c, boxShadow:`0 0 ${f.g}px ${f.c}`,
            animation:`float${f.a} ${5+i}s ease-in-out infinite`, animationDelay:`${i*0.7}s` }}/>
        ))}
      </div>

    </div>
  )
}
