'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createClient } from '../../../lib/supabase'

const ADMIN_EMAILS = ['levamcorp@gmail.com', 'leopoldo@levamcorp.com']
const ACCENT = '#2F7DF6'
const DEEP = '#1B5FD1'

const NAV_GROUPS_BASE = [
  { label: 'Day to day work', items: [
    { label: 'Dashboard', code: 'DB', href: '/admin/dashboard' },
    { label: 'Online Office', code: 'OC', href: '/admin/office' },
    { label: 'Applications', code: 'AP', href: '/admin/applications' },
    { label: 'Orders', code: 'OR', href: '/admin/orders' },
    { label: 'Payments', code: 'PY', href: '/admin/payments' },
    { label: 'Messages', code: 'MS', href: '/admin/messages' },
  ]},
  { label: 'Catalog and clients', items: [
    { label: 'Products', code: 'PR', href: '/admin/products' },
    { label: 'Clients', code: 'CL', href: '/admin/clients' },
    { label: 'Invoices', code: 'IN', href: '/admin/invoices' },
    { label: 'Offers', code: 'OF', href: '/admin/offers' },
    { label: 'Broadcast', code: 'BC', href: '/admin/broadcast' },
  ]},
  { label: 'Money and growth', items: [
    { label: 'Profit report', code: 'PF', href: '/admin/profit' },
    { label: 'Analytics', code: 'AN', href: '/admin/insights' },
    { label: 'Marketing', code: 'MK', href: '/admin/marketing' },
    { label: 'Walmart', code: 'WM', href: '/admin/walmart' },
    { label: 'Recruit', code: 'RC', href: '/admin/recruit' },
  ]},
]

function Sidebar({ open, setOpen, pathname, badges }) {
  const navGroups = NAV_GROUPS_BASE.map(g => ({
    label: g.label,
    items: g.items.map(n => {
      const active = n.href === pathname
      const meta = badges[n.label] || {}
      const badge = active ? '' : (meta.badge || '')
      const urgent = !active && meta.urgent
      return {
        label: n.label, code: n.code, href: n.href,
        bg: active ? '#16181d' : 'transparent',
        ink: active ? '#ffffff' : '#3d4652',
        weight: active ? 700 : 500,
        iconBg: active ? ACCENT : urgent ? '#fde68a' : '#eef0f4',
        iconInk: active ? '#ffffff' : urgent ? '#7c4a03' : '#6b7280',
        badge,
        badgeBg: badge ? (urgent ? '#fde68a' : '#eef0f4') : 'transparent',
        badgeInk: badge ? (urgent ? '#7c4a03' : '#6b7280') : 'transparent',
        collapsedDot: !open && urgent,
      }
    })
  }))
  return (
    <div data-scroll style={{ height: '100vh', overflowY: 'auto', overflowX: 'hidden', background: '#ffffff', borderRight: '1px solid #e2e4e9' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', gap: 12, padding: '16px 14px 17px', borderBottom: '1px solid #e2e4e9' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 8, background: '#16181d' }}><img src="/levamcorp-mark-white.png" alt="Levam Corp" style={{ width: 20, height: 'auto' }} /></span>
          {open && (
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 700, letterSpacing: '-.015em', whiteSpace: 'nowrap' }}>Levam Corp</span>
              <span style={{ display: 'block', paddingTop: 3, fontSize: 12.5, color: '#6b7280', whiteSpace: 'nowrap' }}>Admin console</span>
            </span>
          )}
        </span>
        {open && <button type="button" onClick={() => setOpen(false)} aria-label="Collapse menu" title="Collapse menu" style={{ flex: 'none', border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', cursor: 'pointer', width: 32, height: 32, display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#47505e' }}>‹</button>}
      </div>
      {!open && (
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={() => setOpen(true)} aria-label="Expand menu" title="Expand menu" style={{ border: '1px solid #d9dce2', borderRadius: 7, background: '#ffffff', cursor: 'pointer', width: 38, height: 34, display: 'grid', placeItems: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: '#47505e' }}>›</button>
        </div>
      )}
      <div style={{ padding: '14px 10px 20px' }}>
        {navGroups.map(g => (
          <div key={g.label} style={{ paddingBottom: 18 }}>
            {open ? (
              <div style={{ padding: '0 8px 8px', fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9aa0aa', whiteSpace: 'nowrap' }}>{g.label}</div>
            ) : (
              <div style={{ margin: '0 8px 10px', height: 1, background: '#e8eaee' }} />
            )}
            {g.items.map(n => (
              <Link key={n.label} href={n.href} title={n.badge ? `${n.label} · ${n.badge}` : n.label} style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', gap: 11, padding: open ? '9px 10px' : '9px 0', marginBottom: 3, borderRadius: 8, background: n.bg, color: n.ink, fontSize: 15, fontWeight: n.weight, letterSpacing: '-.01em', position: 'relative' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                  <span style={{ flex: 'none', display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 6, background: n.iconBg, color: n.iconInk, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 11 }}>{n.code}</span>
                  {open && <span style={{ whiteSpace: 'nowrap' }}>{n.label}</span>}
                </span>
                {open && n.badge && <span style={{ flex: 'none', fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, fontWeight: 700, padding: '3px 7px 4px', borderRadius: 5, background: n.badgeBg, color: n.badgeInk }}>{n.badge}</span>}
                {n.collapsedDot && <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderRadius: '50%', background: '#dc2626', border: '2px solid #ffffff' }} />}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 3D OFFICE SCENE — a real isometric Three.js scene (not a CSS illustration): a row
// of low-wall cubicle pods on a floor, each with a desk, a monitor, and a little mini-
// figure "agent" sitting at it. Built from primitive geometry (boxes/capsules/spheres) —
// no external 3D model files — so it ships without needing an asset pipeline. Orbit
// controls let you rotate/zoom the view like the reference; clicking a trained pod
// navigates to the real admin page it stands in for, same as the department cards did.
function makeLabelSprite(text, color) {
  const canvas = document.createElement('canvas')
  canvas.width = 320; canvas.height = 80
  const ctx = canvas.getContext('2d')
  const r = 16
  ctx.fillStyle = 'rgba(22,24,29,0.94)'
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r)
  ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r)
  ctx.arcTo(0, canvas.height, 0, 0, r)
  ctx.arcTo(0, 0, canvas.width, 0, r)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = color
  ctx.fillRect(20, 56, 48, 6)
  ctx.font = '700 32px "Helvetica Neue", Arial, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 20, 30)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
  sprite.scale.set(2.2, 0.55, 1)
  sprite.renderOrder = 10
  return sprite
}

function buildRoom(agent, index, total) {
  const spacing = 3.6
  const x = (index - (total - 1) / 2) * spacing
  const color = new THREE.Color(agent.color)
  const muted = !agent.trained
  const group = new THREE.Group()
  group.position.x = x
  group.userData = { key: agent.key, trained: agent.trained, href: agent.href }

  // floor pad
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.1, 3.2),
    new THREE.MeshStandardMaterial({ color: muted ? '#e2e4e9' : color, roughness: 0.9, transparent: true, opacity: muted ? 0.5 : 0.22 })
  )
  pad.position.y = 0.05
  pad.receiveShadow = true
  group.add(pad)

  // low cubicle walls (back + two sides), tinted "glass" like the reference
  const wallMat = new THREE.MeshStandardMaterial({ color: muted ? '#eef0f4' : color, transparent: true, opacity: muted ? 0.35 : 0.22, roughness: 0.4 })
  const wallTrimMat = new THREE.MeshStandardMaterial({ color: muted ? '#d9dce2' : color, roughness: 0.5 })
  const wallH = 1.3, wallT = 0.08
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, wallH, wallT), wallMat)
  back.position.set(0, wallH / 2, -1.56)
  const left = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, 3.2), wallMat)
  left.position.set(-1.56, wallH / 2, 0)
  const right = left.clone()
  right.position.x = 1.56
  ;[back, left, right].forEach(w => { w.castShadow = true; w.receiveShadow = true; group.add(w) })
  const trim = new THREE.Mesh(new THREE.BoxGeometry(3.28, 0.06, wallT), wallTrimMat)
  trim.position.set(0, wallH, -1.56)
  group.add(trim)

  // desk
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.75), new THREE.MeshStandardMaterial({ color: '#d8c3a0', roughness: 0.7 }))
  desk.position.set(0, 0.62, 0.5)
  desk.castShadow = true; desk.receiveShadow = true
  group.add(desk)
  const deskLeg = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.56, 0.5), new THREE.MeshStandardMaterial({ color: '#b89c74', roughness: 0.8 }))
  deskLeg.position.set(0, 0.3, 0.5)
  deskLeg.castShadow = true
  group.add(deskLeg)

  if (agent.trained) {
    // monitor, glowing with the agent's color
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.05), new THREE.MeshStandardMaterial({ color: '#15171c' }))
    monitor.position.set(0, 1.0, 0.3)
    monitor.castShadow = true
    group.add(monitor)
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.32), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.55 }))
    screen.position.set(0, 1.0, 0.33)
    group.add(screen)

    // mini-figure agent, sitting at the desk
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.42, 4, 10), new THREE.MeshStandardMaterial({ color, roughness: 0.6 }))
    body.position.set(0, 0.86, 0.95)
    body.castShadow = true
    group.add(body)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshStandardMaterial({ color: '#ffd9ae', roughness: 0.7 }))
    head.position.set(0, 1.28, 0.95)
    head.castShadow = true
    group.add(head)
  } else {
    // empty chair — no figure, no monitor glow: an honestly idle desk
    const chair = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.5, 12), new THREE.MeshStandardMaterial({ color: '#c7cad1', roughness: 0.8 }))
    chair.position.set(0, 0.38, 0.95)
    chair.castShadow = true
    group.add(chair)
  }

  const label = makeLabelSprite(agent.title, agent.color)
  label.position.set(0, 2.15, 0)
  group.add(label)

  return group
}

function OfficeScene({ agents }) {
  const mountRef = useRef(null)
  const router = useRouter()
  const [hoveredKey, setHoveredKey] = useState(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#eef1f5')

    const frustum = 11
    let width = mount.clientWidth || 800, height = mount.clientHeight || 480
    let aspect = width / height
    const camera = new THREE.OrthographicCamera(-frustum * aspect / 2, frustum * aspect / 2, frustum / 2, -frustum / 2, 0.1, 100)
    camera.position.set(12, 11, 12)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minZoom = 0.6
    controls.maxZoom = 2.2
    controls.minPolarAngle = Math.PI / 5
    controls.maxPolarAngle = Math.PI / 2.4
    controls.enablePan = false

    scene.add(new THREE.AmbientLight('#ffffff', 0.75))
    const sun = new THREE.DirectionalLight('#ffffff', 0.9)
    sun.position.set(10, 16, 8)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -14; sun.shadow.camera.right = 14
    sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14
    scene.add(sun)

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 10),
      new THREE.MeshStandardMaterial({ color: '#e7dcc6', roughness: 0.95 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.01
    floor.receiveShadow = true
    scene.add(floor)

    const interactive = []
    agents.forEach((a, i) => {
      const room = buildRoom(a, i, agents.length)
      scene.add(room)
      interactive.push(room)
    })

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const roomAt = (clientX, clientY) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(interactive, true)
      if (!hits.length) return null
      let obj = hits[0].object
      while (obj && !obj.userData?.key) obj = obj.parent
      return obj
    }

    const onMove = (e) => {
      const room = roomAt(e.clientX, e.clientY)
      renderer.domElement.style.cursor = room && room.userData.trained ? 'pointer' : 'default'
      setHoveredKey(room ? room.userData.key : null)
    }
    const onClick = (e) => {
      const room = roomAt(e.clientX, e.clientY)
      if (room && room.userData.trained && room.userData.href) router.push(room.userData.href)
    }
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('click', onClick)

    let raf
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    const ro = new ResizeObserver(() => {
      width = mount.clientWidth; height = mount.clientHeight
      if (!width || !height) return
      aspect = width / height
      camera.left = -frustum * aspect / 2; camera.right = frustum * aspect / 2
      camera.top = frustum / 2; camera.bottom = -frustum / 2
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('click', onClick)
      controls.dispose()
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose() })
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [agents, router])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mountRef} style={{ width: '100%', height: 460, borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e4e9' }} />
      <div style={{ position: 'absolute', bottom: 10, left: 14, fontSize: 11.5, color: '#6b7280', background: 'rgba(255,255,255,0.85)', padding: '4px 9px', borderRadius: 6 }}>Drag to look around · scroll to zoom · click a trained desk to open it</div>
      {hoveredKey && (() => {
        const a = agents.find(x => x.key === hoveredKey)
        if (!a) return null
        return <div style={{ position: 'absolute', top: 10, left: 14, fontSize: 13, fontWeight: 700, background: '#16181d', color: '#fff', padding: '6px 11px', borderRadius: 7 }}>{a.title}{a.trained ? ' — click to open' : ' — not trained yet'}</div>
      })()}
    </div>
  )
}

const AGENTS = [
  {
    key: 'applications', title: 'Applications', role: 'Reviews new partner applications and follows up with the ones still pending.',
    color: '#2F7DF6', trained: true, href: '/admin/applications', cta: 'Open Applications',
  },
  {
    key: 'sales', title: 'Sales', role: 'Reaches out to prospects to help bring in new wholesale partners.',
    color: '#16a34a', trained: true, href: '/admin/recruit', cta: 'Open Recruit',
  },
  {
    key: 'stock', title: 'Stock', role: 'Takes the products you send over and gets them listed and live on the site.',
    color: '#f0b429', trained: true, href: '/admin/products', cta: 'Open Products',
  },
  {
    key: 'marketing', title: 'Marketing', role: 'Will put together photos and graphics for social media posts.',
    color: '#7c3aed', trained: false, href: null, cta: null,
  },
  {
    key: 'calls', title: 'Calls', role: 'Will help handle incoming calls from partners and prospects.',
    color: '#dc2626', trained: false, href: null, cta: null,
  },
]

export default function AdminOffice() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [pendingApps, setPendingApps] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [clientCount, setClientCount] = useState(0)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(async ({ data }) => {
      if (!data.user || !ADMIN_EMAILS.includes(data.user.email)) { window.location.href = '/admin'; return }
      const [{ data: apps }, { count: products }, { count: clients }] = await Promise.all([
        sb.from('applications').select('status'),
        sb.from('products').select('*', { count: 'exact', head: true }),
        sb.from('clients').select('*', { count: 'exact', head: true }),
      ])
      setPendingApps((apps || []).filter(a => !a.status || a.status === 'pending').length)
      setProductCount(products || 0)
      setClientCount(clients || 0)
      setLoading(false)
    })
  }, [])

  const logout = async () => { await createClient().auth.signOut(); window.location.href = '/admin' }

  const statFor = (key) => {
    if (key === 'applications') return pendingApps > 0 ? { v: String(pendingApps), k: pendingApps === 1 ? 'pending' : 'pending' } : { v: '0', k: 'pending' }
    if (key === 'stock') return { v: String(productCount), k: 'products live' }
    if (key === 'sales') return { v: String(clientCount), k: 'partners so far' }
    return null
  }

  const shellCols = sidebarOpen ? 'clamp(210px, 16vw, 244px) minmax(0, 1fr)' : '76px minmax(0, 1fr)'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`@keyframes spin { to{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, margin: '0 auto 14px', border: '3px solid #e2e4e9', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 13, color: '#6b7280' }}>Opening the office…</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#f4f5f7', minHeight: '100vh', color: '#16181d', fontFamily: '"Helvetica Neue",Helvetica,Arial,sans-serif' }}>
      <style>{`
        .lc-mono { font-family:'JetBrains Mono','SF Mono',ui-monospace,Menlo,monospace; }
        .ofc-shell { min-height:100vh; display:grid; grid-template-columns:${shellCols}; align-items:start; }
        @media(max-width:860px){ .ofc-shell { grid-template-columns:1fr !important; } .ofc-shell > div:first-child { position:static !important; max-height:none !important; } }
        .ofc-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:16px; }
        .ofc-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .ofc-card.trained:hover { transform: translateY(-3px); box-shadow: 0 10px 24px -12px rgba(0,0,0,0.25); }
        [data-scroll]::-webkit-scrollbar { width:8px; height:8px; }
        [data-scroll]::-webkit-scrollbar-thumb { background: rgba(22,24,29,0.22); border-radius:4px; }
        a { text-decoration:none; color:inherit; }
      `}</style>

      <div className="ofc-shell">
        <div data-scroll style={{ position: 'sticky', top: 0, alignSelf: 'stretch', maxHeight: '100vh', overflowY: 'auto' }}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} pathname={pathname} badges={{ Applications: pendingApps > 0 ? { badge: String(pendingApps), urgent: true } : {} }} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '13px clamp(14px,2.4vw,28px)', background: '#ffffff', borderBottom: '1px solid #e2e4e9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Online Office</span>
              <span style={{ fontSize: 14, color: '#6b7280' }}>{AGENTS.filter(a => a.trained).length} of {AGENTS.length} desks trained</span>
            </div>
            <button type="button" onClick={logout} style={{ padding: '10px 14px', border: '1px solid #d9dce2', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#47505e', background: '#ffffff', cursor: 'pointer' }}>Sign out</button>
          </div>

          <div style={{ padding: 'clamp(16px,2.2vw,22px) clamp(14px,2.4vw,28px) clamp(40px,6vh,64px)' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.015em' }}>A desk for every job<span style={{ color: ACCENT }}>.</span></div>
              <div style={{ paddingTop: 6, fontSize: 14.5, color: '#6b7280', maxWidth: 560 }}>Each cubicle is an agent we're training for one part of the business. The trained ones already plug into real data — the rest are empty desks waiting for their first assignment.</div>
            </div>

            <OfficeScene agents={AGENTS} />

            <div className="ofc-grid" style={{ marginTop: 18 }}>
              {AGENTS.map(a => {
                const stat = statFor(a.key)
                const card = (
                  <div className={`ofc-card ${a.trained ? 'trained' : ''}`} style={{ background: '#ffffff', border: '1px solid #e2e4e9', borderRadius: 12, padding: '13px 15px 14px', cursor: a.trained ? 'pointer' : 'default', opacity: a.trained ? 1 : 0.88, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ flex: 'none', width: 10, height: 10, borderRadius: '50%', background: a.trained ? a.color : '#d9dce2' }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700 }}>{a.title}</span>
                        <span className="lc-mono" style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 6px 3px', borderRadius: 999, background: a.trained ? '#dcfce7' : '#f1f2f5', color: a.trained ? '#166534' : '#6b7280' }}>{a.trained ? 'Trained' : 'Not trained yet'}</span>
                      </span>
                      <span style={{ display: 'block', paddingTop: 2, fontSize: 12.5, color: '#6b7280' }}>{stat ? `${stat.v} ${stat.k}` : 'Not wired up yet'}</span>
                    </span>
                    {a.trained && <span style={{ flex: 'none', fontSize: 12.5, fontWeight: 700, color: DEEP }}>{a.cta} →</span>}
                  </div>
                )
                return a.trained ? <Link key={a.key} href={a.href}>{card}</Link> : <div key={a.key}>{card}</div>
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
