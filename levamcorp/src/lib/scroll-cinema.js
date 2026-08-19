// ── LEVAM CORP · CINEMATIC SCROLL ENGINE ─────────────────────────────────────
// Controls Three.js camera zoom, scene scale, and section transitions
// driven entirely by scroll position via GSAP ScrollTrigger scrub.
//
// Usage:
//   import { initCinematicScroll } from '@/lib/scroll-cinema'
//   const destroy = await initCinematicScroll()
//   // on unmount: destroy()

export async function initCinematicScroll() {
  const THREE                    = await import('three')
  const { default: gsap }        = await import('gsap')
  const { ScrollTrigger }        = await import('gsap/ScrollTrigger')
  const { ScrollToPlugin }       = await import('gsap/ScrollToPlugin')

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

  // ── RENDERER ───────────────────────────────────────────────────────────────
  const canvas   = document.getElementById('lc-cinema-canvas')
  if (!canvas) return () => {}

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.toneMapping       = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2

  const W = () => window.innerWidth
  const H = () => window.innerHeight
  renderer.setSize(W(), H())

  // ── SCENE ──────────────────────────────────────────────────────────────────
  const scene  = new THREE.Scene()
  scene.fog    = new THREE.FogExp2(0x060810, 0.018)

  const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 300)
  camera.position.set(0, 0, 40)

  // ── LIGHTS ─────────────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x0EA5E9, 0.15)
  scene.add(ambient)

  const pointA = new THREE.PointLight(0x0EA5E9, 60, 80)
  pointA.position.set(-20, 10, 10)
  scene.add(pointA)

  const pointB = new THREE.PointLight(0x6366F1, 40, 80)
  pointB.position.set(20, -10, 5)
  scene.add(pointB)

  // ── PARTICLE FIELD (always present) ────────────────────────────────────────
  const PARTICLE_COUNT = 1800
  const pGeo  = new THREE.BufferGeometry()
  const pPos  = new Float32Array(PARTICLE_COUNT * 3)
  const pCol  = new Float32Array(PARTICLE_COUNT * 3)
  const pSize = new Float32Array(PARTICLE_COUNT)

  const c1 = new THREE.Color(0x0EA5E9)
  const c2 = new THREE.Color(0x6366F1)
  const c3 = new THREE.Color(0x38BDF8)

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pPos[i*3]   = (Math.random() - 0.5) * 120
    pPos[i*3+1] = (Math.random() - 0.5) * 70
    pPos[i*3+2] = (Math.random() - 0.5) * 100
    const t = Math.random()
    const c = t < 0.5 ? c1.clone().lerp(c2, t*2) : c2.clone().lerp(c3, (t-0.5)*2)
    pCol[i*3]   = c.r * (0.4 + Math.random() * 0.6)
    pCol[i*3+1] = c.g * (0.4 + Math.random() * 0.6)
    pCol[i*3+2] = c.b * (0.4 + Math.random() * 0.6)
    pSize[i]    = 0.3 + Math.random() * 1.2
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3))

  const pMat = new THREE.PointsMaterial({
    size: 1.0, vertexColors: true, transparent: true,
    opacity: 0.65, sizeAttenuation: true, depthWrite: false,
  })
  const particles = new THREE.Points(pGeo, pMat)
  scene.add(particles)

  // ── ORBITAL RINGS ──────────────────────────────────────────────────────────
  const rings = []
  ;[
    { r: 6,  tube: 0.012, color: 0x0EA5E9, opacity: 0.35, tilt: 0.4,  speed: 0.004  },
    { r: 9,  tube: 0.008, color: 0x6366F1, opacity: 0.2,  tilt: -0.7, speed: -0.003 },
    { r: 12, tube: 0.005, color: 0x38BDF8, opacity: 0.15, tilt: 1.1,  speed: 0.002  },
  ].forEach(d => {
    const geo  = new THREE.TorusGeometry(d.r, d.tube, 2, 140)
    const mat  = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: d.opacity })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = d.tilt
    mesh.userData.speed = d.speed
    scene.add(mesh)
    rings.push(mesh)

    // Glowing dot on each ring
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: d.color })
    )
    dot.position.set(d.r, 0, 0)
    mesh.add(dot)
  })

  // ── GRID PLANE (depth cue) ─────────────────────────────────────────────────
  const gridHelper = new THREE.GridHelper(200, 40, 0x0EA5E9, 0x0EA5E9)
  gridHelper.material.opacity    = 0.04
  gridHelper.material.transparent = true
  gridHelper.position.y = -14
  scene.add(gridHelper)

  // ── SCENE STATES ───────────────────────────────────────────────────────────
  // We define camera positions + scene configs for each "act"
  // ScrollTrigger scrubs between them
  const states = {
    hero: {
      camZ: 40, camY: 0, camX: 0,
      fov: 55,
      ringScale: 1, ringOpacity: 1,
      particleOpacity: 0.65,
      fogDensity: 0.018,
      gridY: -14, gridOpacity: 0.04,
    },
    brands: {
      camZ: 28, camY: -2, camX: -3,
      fov: 48,
      ringScale: 1.2, ringOpacity: 0.6,
      particleOpacity: 0.5,
      fogDensity: 0.022,
      gridY: -12, gridOpacity: 0.06,
    },
    stats: {
      camZ: 18, camY: 0, camX: 0,
      fov: 40,
      ringScale: 0.6, ringOpacity: 0.3,
      particleOpacity: 0.8,
      fogDensity: 0.012,
      gridY: -10, gridOpacity: 0.1,
    },
    process: {
      camZ: 32, camY: 4, camX: 6,
      fov: 52,
      ringScale: 1.4, ringOpacity: 0.5,
      particleOpacity: 0.45,
      fogDensity: 0.025,
      gridY: -16, gridOpacity: 0.03,
    },
    features: {
      camZ: 22, camY: -4, camX: -4,
      fov: 44,
      ringScale: 0.8, ringOpacity: 0.7,
      particleOpacity: 0.7,
      fogDensity: 0.016,
      gridY: -11, gridOpacity: 0.08,
    },
    cta: {
      camZ: 12, camY: 0, camX: 0,
      fov: 35,
      ringScale: 0.4, ringOpacity: 0.15,
      particleOpacity: 0.9,
      fogDensity: 0.008,
      gridY: -8, gridOpacity: 0.15,
    },
  }

  // Live tweened values (GSAP will write into this object)
  const live = {
    camZ: states.hero.camZ,
    camY: states.hero.camY,
    camX: states.hero.camX,
    fov:  states.hero.fov,
    ringScale:      states.hero.ringScale,
    ringOpacity:    states.hero.ringOpacity,
    particleOpacity: states.hero.particleOpacity,
    fogDensity:     states.hero.fogDensity,
    gridY:          states.hero.gridY,
    gridOpacity:    states.hero.gridOpacity,
  }

  function applyLive() {
    camera.position.z = live.camZ
    camera.position.y = live.camY + mouseY * 2
    camera.position.x = live.camX + mouseX * 2
    camera.fov        = live.fov
    camera.updateProjectionMatrix()

    rings.forEach(r => {
      r.scale.setScalar(live.ringScale)
      r.material.opacity = live.ringOpacity * r.userData.baseOpacity
    })

    pMat.opacity = live.particleOpacity
    scene.fog.density = live.fogDensity
    gridHelper.position.y = live.gridY
    gridHelper.material.opacity = live.gridOpacity
  }

  // Store base opacities
  rings.forEach((r, i) => {
    r.userData.baseOpacity = [0.35, 0.2, 0.15][i]
  })

  // ── SCROLL TRIGGERS ────────────────────────────────────────────────────────
  const sections = [
    { id: '#brands',   to: 'brands'   },
    { id: '#stats',    to: 'stats'    },
    { id: '#process',  to: 'process'  },
    { id: '#features', to: 'features' },
    { id: '#cta',      to: 'cta'      },
  ]

  const triggers = []

  sections.forEach(({ id, to }) => {
    const el = document.querySelector(id)
    if (!el) return

    const fromState = id === '#brands' ? states.hero : 
                      id === '#stats'  ? states.brands :
                      id === '#process'? states.stats  :
                      id === '#features'? states.process :
                                          states.features

    const toState = states[to]

    const tween = gsap.fromTo(live, fromState, {
      ...toState,
      ease:    'none',
      scrollTrigger: {
        trigger:  el,
        start:    'top 80%',
        end:      'top 20%',
        scrub:    1.2,
        onUpdate: applyLive,
      }
    })
    triggers.push(tween)
  })

  // ── ZOOM PULSE on stats section ────────────────────────────────────────────
  const statsEl = document.querySelector('#stats')
  if (statsEl) {
    ScrollTrigger.create({
      trigger: statsEl,
      start: 'top 60%',
      onEnter: () => {
        gsap.to(live, {
          fov: live.fov - 6,
          duration: 0.6,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 1,
          onUpdate: () => { camera.fov = live.fov; camera.updateProjectionMatrix() }
        })
      }
    })
  }

  // ── SECTION WIPE FLASH ─────────────────────────────────────────────────────
  // Flash the point light color when entering each section
  const sectionColors = {
    '#brands':   0x0EA5E9,
    '#stats':    0x38BDF8,
    '#process':  0x6366F1,
    '#features': 0x0EA5E9,
    '#cta':      0x0EA5E9,
  }

  Object.entries(sectionColors).forEach(([id, color]) => {
    const el = document.querySelector(id)
    if (!el) return
    ScrollTrigger.create({
      trigger: el,
      start: 'top 70%',
      onEnter: () => {
        const from = pointA.color.getHex()
        gsap.to(pointA.color, {
          r: new THREE.Color(color).r,
          g: new THREE.Color(color).g,
          b: new THREE.Color(color).b,
          duration: 1.2,
          ease: 'power2.inOut',
        })
        gsap.to(pointA, { intensity: 120, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' })
      }
    })
  })

  // ── MOUSE PARALLAX ─────────────────────────────────────────────────────────
  let mouseX = 0, mouseY = 0
  const onMouse = e => {
    mouseX = (e.clientX / W() - 0.5) * 2
    mouseY = (e.clientY / H() - 0.5) * 2
  }
  window.addEventListener('mousemove', onMouse)

  // ── RESIZE ─────────────────────────────────────────────────────────────────
  const onResize = () => {
    camera.aspect = W() / H()
    camera.updateProjectionMatrix()
    renderer.setSize(W(), H())
  }
  window.addEventListener('resize', onResize)

  // ── RENDER LOOP ────────────────────────────────────────────────────────────
  let animId
  const clock = new THREE.Clock()

  const tick = () => {
    animId = requestAnimationFrame(tick)
    const t = clock.getElapsedTime()

    // Idle rotation
    particles.rotation.y = t * 0.015
    particles.rotation.x = t * 0.008
    rings.forEach(r => { r.rotation.z += r.userData.speed })

    // Mouse drift (smooth)
    camera.position.x += (live.camX + mouseX * 3 - camera.position.x) * 0.04
    camera.position.y += (live.camY + mouseY * 2 - camera.position.y) * 0.04
    camera.position.z += (live.camZ - camera.position.z) * 0.06
    camera.fov         = live.fov
    camera.updateProjectionMatrix()

    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
  }
  tick()

  // ── DESTROY ────────────────────────────────────────────────────────────────
  return () => {
    cancelAnimationFrame(animId)
    window.removeEventListener('mousemove', onMouse)
    window.removeEventListener('resize', onResize)
    triggers.forEach(t => t.scrollTrigger?.kill())
    ScrollTrigger.getAll().forEach(t => t.kill())
    renderer.dispose()
    pGeo.dispose()
    pMat.dispose()
  }
}
