'use client'
import { useEffect, useRef } from 'react'

// ── SCENE STATES ──────────────────────────────────────────────────────────────
// Each section has its own camera position, FOV, fog, and ring scale.
// Scroll scrubs between them smoothly.
const STATES = {
  hero:     { z:38, y:0,  x:0,  fov:55, fog:0.016, ringScale:1.0, ringOpacity:1.0,   particleOpacity:0.55 },
  brands:   { z:30, y:-2, x:-3, fov:50, fog:0.020, ringScale:1.2, ringOpacity:0.7,   particleOpacity:0.45 },
  stats:    { z:20, y:0,  x:0,  fov:42, fog:0.012, ringScale:0.7, ringOpacity:0.4,   particleOpacity:0.75 },
  process:  { z:34, y:3,  x:5,  fov:52, fog:0.022, ringScale:1.4, ringOpacity:0.5,   particleOpacity:0.40 },
  features: { z:24, y:-3, x:-4, fov:46, fog:0.018, ringScale:0.9, ringOpacity:0.65,  particleOpacity:0.60 },
  about:    { z:28, y:1,  x:2,  fov:48, fog:0.019, ringScale:1.1, ringOpacity:0.55,  particleOpacity:0.50 },
  cta:      { z:14, y:0,  x:0,  fov:36, fog:0.009, ringScale:0.4, ringOpacity:0.2,   particleOpacity:0.90 },
}

function lerp(a, b, t) { return a + (b - a) * t }
function smoothstep(t)  { return t * t * (3 - 2 * t) }

function getSectionProgress() {
  const sections = [
    { id: 'brands',   state: 'brands'   },
    { id: 'stats',    state: 'stats'    },
    { id: 'process',  state: 'process'  },
    { id: 'features', state: 'features' },
    { id: 'about',    state: 'about'    },
    { id: 'cta',      state: 'cta'      },
  ]

  let fromState = STATES.hero
  let toState   = STATES.hero
  let progress  = 0

  for (let i = 0; i < sections.length; i++) {
    const el = document.getElementById(sections[i].id)
    if (!el) continue

    const rect  = el.getBoundingClientRect()
    const vh    = window.innerHeight
    const start = vh * 0.8
    const end   = vh * 0.2

    if (rect.top <= start) {
      const prev = i > 0 ? STATES[sections[i-1].state] : STATES.hero
      fromState  = prev
      toState    = STATES[sections[i].state]
      progress   = smoothstep(Math.max(0, Math.min(1, (start - rect.top) / (start - end))))
    }
  }

  return { fromState, toState, progress }
}

export default function CinemaCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = canvasRef.current
    if (!canvas) return

    let animId
    let renderer, scene, camera, particlePoints, particleMat, rings = [], gridHelper
    let mx = 0, my = 0

    // Live interpolated values
    const live = { ...STATES.hero }

    const init = async () => {
      try {
        const THREE = (await import('three')).default || await import('three')

        // ── RENDERER ────────────────────────────────────────────────
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.1

        // ── SCENE ───────────────────────────────────────────────────
        scene  = new THREE.Scene()
        scene.fog = new THREE.FogExp2(0x060810, live.fog)
        camera = new THREE.PerspectiveCamera(live.fov, window.innerWidth / window.innerHeight, 0.1, 300)
        camera.position.set(0, 0, live.z)

        // ── LIGHTS ──────────────────────────────────────────────────
        scene.add(new THREE.AmbientLight(0x0EA5E9, 0.12))
        const pA = new THREE.PointLight(0x0EA5E9, 50, 80)
        pA.position.set(-20, 10, 10)
        scene.add(pA)
        const pB = new THREE.PointLight(0x6366F1, 30, 80)
        pB.position.set(20, -10, 5)
        scene.add(pB)

        // ── PARTICLES ───────────────────────────────────────────────
        const COUNT = 1400
        const geo   = new THREE.BufferGeometry()
        const pos   = new Float32Array(COUNT * 3)
        const col   = new Float32Array(COUNT * 3)
        const c1 = new THREE.Color(0x0EA5E9)
        const c2 = new THREE.Color(0x6366F1)
        const c3 = new THREE.Color(0x38BDF8)

        for (let i = 0; i < COUNT; i++) {
          pos[i*3]   = (Math.random() - 0.5) * 110
          pos[i*3+1] = (Math.random() - 0.5) * 65
          pos[i*3+2] = (Math.random() - 0.5) * 90
          const t = Math.random()
          const c = t < 0.5 ? c1.clone().lerp(c2, t*2) : c2.clone().lerp(c3, (t-0.5)*2)
          col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))

        particleMat = new THREE.PointsMaterial({
          size: 0.9, vertexColors: true, transparent: true,
          opacity: live.particleOpacity, sizeAttenuation: true, depthWrite: false,
        })
        particlePoints = new THREE.Points(geo, particleMat)
        scene.add(particlePoints)

        // ── RINGS ───────────────────────────────────────────────────
        ;[
          { r:5.5,  tube:0.010, color:0x0EA5E9, opacity:0.28, tilt:0.4,  speed:0.004  },
          { r:8.5,  tube:0.006, color:0x6366F1, opacity:0.16, tilt:-0.7, speed:-0.003 },
          { r:11.5, tube:0.004, color:0x38BDF8, opacity:0.12, tilt:1.1,  speed:0.002  },
        ].forEach(d => {
          const rGeo = new THREE.TorusGeometry(d.r, d.tube, 2, 120)
          const rMat = new THREE.MeshBasicMaterial({ color:d.color, transparent:true, opacity:d.opacity })
          const mesh = new THREE.Mesh(rGeo, rMat)
          mesh.rotation.x = d.tilt
          mesh.userData = { speed:d.speed, baseOpacity:d.opacity, baseR:d.r }
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 6, 6),
            new THREE.MeshBasicMaterial({ color:d.color })
          )
          dot.position.set(d.r, 0, 0)
          mesh.add(dot)
          scene.add(mesh)
          rings.push(mesh)
        })

        // ── GRID ────────────────────────────────────────────────────
        gridHelper = new THREE.GridHelper(200, 40, 0x0EA5E9, 0x0EA5E9)
        gridHelper.material.opacity = 0.03
        gridHelper.material.transparent = true
        gridHelper.position.y = -14
        scene.add(gridHelper)

        // ── EVENTS ──────────────────────────────────────────────────
        const onMouse  = e => {
          mx = (e.clientX / window.innerWidth  - 0.5) * 2
          my = (e.clientY / window.innerHeight - 0.5) * 2
        }
        const onResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('mousemove', onMouse)
        window.addEventListener('resize',    onResize)

        // ── RENDER LOOP ─────────────────────────────────────────────
        const clock = new THREE.Clock()
        const LERP  = 0.05  // transition smoothness

        const tick = () => {
          animId = requestAnimationFrame(tick)
          const t = clock.getElapsedTime()

          // ── Get target state from scroll position ──────────────
          const { fromState, toState, progress } = getSectionProgress()

          const target = {
            z:              lerp(fromState.z,              toState.z,              progress),
            y:              lerp(fromState.y,              toState.y,              progress),
            x:              lerp(fromState.x,              toState.x,              progress),
            fov:            lerp(fromState.fov,            toState.fov,            progress),
            fog:            lerp(fromState.fog,            toState.fog,            progress),
            ringScale:      lerp(fromState.ringScale,      toState.ringScale,      progress),
            ringOpacity:    lerp(fromState.ringOpacity,    toState.ringOpacity,    progress),
            particleOpacity:lerp(fromState.particleOpacity,toState.particleOpacity,progress),
          }

          // ── Smooth live values toward target ───────────────────
          live.z               += (target.z               - live.z)               * LERP
          live.y               += (target.y               - live.y)               * LERP
          live.x               += (target.x               - live.x)               * LERP
          live.fov             += (target.fov             - live.fov)             * LERP
          live.fog             += (target.fog             - live.fog)             * LERP
          live.ringScale       += (target.ringScale       - live.ringScale)       * LERP
          live.ringOpacity     += (target.ringOpacity     - live.ringOpacity)     * LERP
          live.particleOpacity += (target.particleOpacity - live.particleOpacity) * LERP

          // ── Apply to scene ─────────────────────────────────────
          // Camera
          camera.position.x += (live.x + mx * 3 - camera.position.x) * 0.04
          camera.position.y += (live.y - my * 2 - camera.position.y)  * 0.04
          camera.position.z += (live.z           - camera.position.z)  * 0.05
          camera.fov         = live.fov
          camera.updateProjectionMatrix()
          camera.lookAt(0, 0, 0)

          // Fog
          if (scene.fog) scene.fog.density = live.fog

          // Particles
          if (particlePoints) {
            particlePoints.rotation.y = t * 0.01
            particlePoints.rotation.x = t * 0.005
          }
          if (particleMat) particleMat.opacity = live.particleOpacity

          // Rings — scale + opacity + rotation
          rings.forEach(r => {
            r.rotation.z += r.userData.speed
            const s = live.ringScale
            r.scale.setScalar(s)
            r.material.opacity = live.ringOpacity * r.userData.baseOpacity
          })

          // Stats section: FOV pulse for impact
          const statsEl = document.getElementById('stats')
          if (statsEl) {
            const sr = statsEl.getBoundingClientRect()
            if (sr.top < window.innerHeight * 0.5 && sr.bottom > 0) {
              const pulse = Math.sin(t * 1.5) * 0.8
              camera.fov = live.fov + pulse
              camera.updateProjectionMatrix()
            }
          }

          renderer.render(scene, camera)
        }
        tick()

        return () => {
          window.removeEventListener('mousemove', onMouse)
          window.removeEventListener('resize',    onResize)
        }
      } catch (err) {
        console.warn('CinemaCanvas: init failed', err)
      }
    }

    let cleanup
    init().then(fn => { if (fn) cleanup = fn })

    return () => {
      cancelAnimationFrame(animId)
      try { if (cleanup) cleanup() } catch (_) {}
      try { renderer?.dispose() }   catch (_) {}
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        top: 0, left: 0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        0,
        opacity:       0.82,
      }}
    />
  )
}
