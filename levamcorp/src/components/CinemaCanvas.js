'use client'
import { useEffect, useRef } from 'react'

export default function CinemaCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer, scene, camera, particles, rings = [], animId
    let mx = 0, my = 0, scrollY = 0

    const init = async () => {
      const THREE = await import('three')

      // ── RENDERER ──────────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1

      // ── SCENE ─────────────────────────────────────────────────────
      scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x060810, 0.016)

      camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300)
      camera.position.set(0, 0, 38)

      // ── LIGHTS ────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0x0EA5E9, 0.12))
      const pA = new THREE.PointLight(0x0EA5E9, 50, 80)
      pA.position.set(-20, 10, 10)
      scene.add(pA)
      const pB = new THREE.PointLight(0x6366F1, 30, 80)
      pB.position.set(20, -10, 5)
      scene.add(pB)

      // ── PARTICLES ─────────────────────────────────────────────────
      const COUNT = 1600
      const pGeo  = new THREE.BufferGeometry()
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
        col[i*3]   = c.r * (0.4 + Math.random()*0.6)
        col[i*3+1] = c.g * (0.4 + Math.random()*0.6)
        col[i*3+2] = c.b * (0.4 + Math.random()*0.6)
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      pGeo.setAttribute('color',    new THREE.BufferAttribute(col, 3))

      const pMat = new THREE.PointsMaterial({
        size: 0.9, vertexColors: true, transparent: true,
        opacity: 0.6, sizeAttenuation: true, depthWrite: false,
      })
      particles = new THREE.Points(pGeo, pMat)
      scene.add(particles)

      // ── ORBITAL RINGS ─────────────────────────────────────────────
      ;[
        { r:5.5,  tube:0.010, color:0x0EA5E9, opacity:0.30, tilt:0.4,  speed:0.004  },
        { r:8.5,  tube:0.007, color:0x6366F1, opacity:0.18, tilt:-0.7, speed:-0.003 },
        { r:11.5, tube:0.004, color:0x38BDF8, opacity:0.12, tilt:1.1,  speed:0.002  },
      ].forEach(d => {
        const geo  = new THREE.TorusGeometry(d.r, d.tube, 2, 140)
        const mat  = new THREE.MeshBasicMaterial({ color:d.color, transparent:true, opacity:d.opacity })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.rotation.x = d.tilt
        mesh.userData.speed = d.speed
        // Glowing dot
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.10, 8, 8),
          new THREE.MeshBasicMaterial({ color:d.color })
        )
        dot.position.set(d.r, 0, 0)
        mesh.add(dot)
        scene.add(mesh)
        rings.push(mesh)
      })

      // ── GRID PLANE ────────────────────────────────────────────────
      const grid = new THREE.GridHelper(200, 40, 0x0EA5E9, 0x0EA5E9)
      grid.material.opacity = 0.035
      grid.material.transparent = true
      grid.position.y = -14
      scene.add(grid)

      // ── EVENTS ────────────────────────────────────────────────────
      const onMouse  = e => { mx = (e.clientX/window.innerWidth-0.5)*2; my = (e.clientY/window.innerHeight-0.5)*2 }
      const onScroll = () => { scrollY = window.scrollY }
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('mousemove', onMouse)
      window.addEventListener('scroll',    onScroll, { passive:true })
      window.addEventListener('resize',    onResize)

      // ── SCROLL-DRIVEN CAMERA STATES ───────────────────────────────
      const getTargetZ = () => {
        const h = document.documentElement.scrollHeight - window.innerHeight
        const p = h > 0 ? scrollY / h : 0
        // Zoom from 38 → 14 over the full page scroll
        return 38 - p * 24
      }

      // ── RENDER LOOP ───────────────────────────────────────────────
      const clock = new THREE.Clock()
      const tick = () => {
        animId = requestAnimationFrame(tick)
        const t = clock.getElapsedTime()

        particles.rotation.y = t * 0.012
        particles.rotation.x = t * 0.006
        rings.forEach(r => { r.rotation.z += r.userData.speed })

        // Smooth camera follow
        const targetZ = getTargetZ()
        camera.position.x += (mx * 3 - camera.position.x) * 0.04
        camera.position.y += (-my * 2 - camera.position.y) * 0.04
        camera.position.z += (targetZ - camera.position.z) * 0.05
        camera.lookAt(0, 0, 0)

        renderer.render(scene, camera)
      }
      tick()

      return () => {
        window.removeEventListener('mousemove', onMouse)
        window.removeEventListener('scroll',    onScroll)
        window.removeEventListener('resize',    onResize)
      }
    }

    let cleanup
    init().then(fn => { cleanup = fn })

    return () => {
      cancelAnimationFrame(animId)
      if (cleanup) cleanup()
      renderer?.dispose()
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
        opacity:       0.85,
      }}
    />
  )
}
