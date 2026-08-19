'use client'
import { useEffect, useRef } from 'react'

export default function CinemaCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = canvasRef.current
    if (!canvas) return

    let animId
    let renderer, scene, camera, particles, rings = []

    const initThree = async () => {
      try {
        const THREE = (await import('three')).default || await import('three')

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(window.innerWidth, window.innerHeight)

        scene  = new THREE.Scene()
        scene.fog = new THREE.FogExp2(0x060810, 0.016)

        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 300)
        camera.position.set(0, 0, 38)

        scene.add(new THREE.AmbientLight(0x0EA5E9, 0.12))
        const pA = new THREE.PointLight(0x0EA5E9, 50, 80)
        pA.position.set(-20, 10, 10)
        scene.add(pA)

        // Particles
        const COUNT = 1200
        const geo   = new THREE.BufferGeometry()
        const pos   = new Float32Array(COUNT * 3)
        const col   = new Float32Array(COUNT * 3)
        const c1 = new THREE.Color(0x0EA5E9)
        const c2 = new THREE.Color(0x6366F1)

        for (let i = 0; i < COUNT; i++) {
          pos[i*3]   = (Math.random() - 0.5) * 110
          pos[i*3+1] = (Math.random() - 0.5) * 65
          pos[i*3+2] = (Math.random() - 0.5) * 90
          const c = c1.clone().lerp(c2, Math.random())
          col[i*3]   = c.r
          col[i*3+1] = c.g
          col[i*3+2] = c.b
        }

        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))

        const mat = new THREE.PointsMaterial({
          size: 0.9, vertexColors: true, transparent: true,
          opacity: 0.55, sizeAttenuation: true, depthWrite: false,
        })
        particles = new THREE.Points(geo, mat)
        scene.add(particles)

        // Rings
        ;[
          { r:5.5,  tube:0.010, color:0x0EA5E9, opacity:0.28, tilt:0.4,  speed:0.004  },
          { r:8.5,  tube:0.006, color:0x6366F1, opacity:0.16, tilt:-0.7, speed:-0.003 },
          { r:11.5, tube:0.004, color:0x38BDF8, opacity:0.12, tilt:1.1,  speed:0.002  },
        ].forEach(d => {
          const rGeo  = new THREE.TorusGeometry(d.r, d.tube, 2, 120)
          const rMat  = new THREE.MeshBasicMaterial({ color:d.color, transparent:true, opacity:d.opacity })
          const mesh  = new THREE.Mesh(rGeo, rMat)
          mesh.rotation.x = d.tilt
          mesh.userData.speed = d.speed
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.09, 6, 6),
            new THREE.MeshBasicMaterial({ color:d.color })
          )
          dot.position.set(d.r, 0, 0)
          mesh.add(dot)
          scene.add(mesh)
          rings.push(mesh)
        })

        // Grid
        const grid = new THREE.GridHelper(200, 40, 0x0EA5E9, 0x0EA5E9)
        grid.material.opacity = 0.03
        grid.material.transparent = true
        grid.position.y = -14
        scene.add(grid)

        let mx = 0, my = 0
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

        const clock = new THREE.Clock()
        const tick  = () => {
          animId = requestAnimationFrame(tick)
          const t = clock.getElapsedTime()
          if (particles) {
            particles.rotation.y = t * 0.01
            particles.rotation.x = t * 0.005
          }
          rings.forEach(r => { r.rotation.z += r.userData.speed })
          camera.position.x += (mx * 3 - camera.position.x) * 0.04
          camera.position.y += (-my * 2 - camera.position.y) * 0.04
          camera.lookAt(0, 0, 0)
          renderer.render(scene, camera)
        }
        tick()

        return () => {
          window.removeEventListener('mousemove', onMouse)
          window.removeEventListener('resize',    onResize)
        }
      } catch (err) {
        // Three.js failed to load — canvas stays invisible, no crash
        console.warn('CinemaCanvas: Three.js init failed', err)
      }
    }

    let cleanup
    initThree().then(fn => { if (fn) cleanup = fn })

    return () => {
      cancelAnimationFrame(animId)
      if (cleanup) cleanup()
      try { renderer?.dispose() } catch (_) {}
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
        opacity:       0.8,
      }}
    />
  )
}
