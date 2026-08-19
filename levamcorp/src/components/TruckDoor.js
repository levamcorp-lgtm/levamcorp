'use client'
import { useEffect, useRef } from 'react'

export default function TruckDoor() {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const canvas = canvasRef.current
    if (!canvas) return

    let animId, renderer, scene, camera
    let doorLeft, doorRight, doorFrame, lockBar
    let particles = []
    let lightBeam

    const init = async () => {
      try {
        const THREE = (await import('three')).default || await import('three')

        // ── RENDERER ──────────────────────────────────────────────
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 0.9

        scene  = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200)
        camera.position.set(0, 0, 8)

        // ── LIGHTS ────────────────────────────────────────────────
        const ambient = new THREE.AmbientLight(0x060810, 2)
        scene.add(ambient)

        // Key light — blue from above
        const keyLight = new THREE.SpotLight(0x0EA5E9, 80, 40, Math.PI/6, 0.3)
        keyLight.position.set(0, 12, 6)
        keyLight.castShadow = true
        scene.add(keyLight)

        // Rim light — indigo from behind
        const rimLight = new THREE.PointLight(0x6366F1, 30, 30)
        rimLight.position.set(0, -4, -8)
        scene.add(rimLight)

        // Interior glow — warm white when doors open
        const interiorLight = new THREE.PointLight(0x38BDF8, 0, 20)
        interiorLight.position.set(0, 0, -2)
        scene.add(interiorLight)
        scene.userData.interiorLight = interiorLight

        // ── MATERIALS ─────────────────────────────────────────────
        const metalMat = new THREE.MeshStandardMaterial({
          color:      0x1a1a2e,
          metalness:  0.9,
          roughness:  0.3,
          envMapIntensity: 1,
        })
        const darkMetal = new THREE.MeshStandardMaterial({
          color:     0x0d0d1a,
          metalness: 0.95,
          roughness: 0.2,
        })
        const accentMat = new THREE.MeshStandardMaterial({
          color:      0x0EA5E9,
          metalness:  0.8,
          roughness:  0.2,
          emissive:   0x0EA5E9,
          emissiveIntensity: 0.3,
        })
        const ridgeMat = new THREE.MeshStandardMaterial({
          color:     0x2a2a3e,
          metalness: 0.85,
          roughness: 0.4,
        })

        // ── TRUCK FRAME ───────────────────────────────────────────
        // Outer frame
        const frameGeo  = new THREE.BoxGeometry(7.2, 5.2, 0.2)
        doorFrame = new THREE.Mesh(frameGeo, darkMetal)
        doorFrame.position.z = -0.5
        doorFrame.receiveShadow = true
        scene.add(doorFrame)

        // Frame border accent strips
        ;[
          [7.2, 0.12, 0.25,  0,  2.6, 0],   // top
          [7.2, 0.12, 0.25,  0, -2.6, 0],   // bottom
          [0.12, 5.2, 0.25, -3.6, 0,  0],   // left
          [0.12, 5.2, 0.25,  3.6, 0,  0],   // right
        ].forEach(([w,h,d,x,y,z]) => {
          const strip = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), accentMat)
          strip.position.set(x, y, z)
          scene.add(strip)
        })

        // ── LEFT DOOR ─────────────────────────────────────────────
        doorLeft = new THREE.Group()
        doorLeft.position.set(-1.78, 0, 0)  // hinge at left edge

        const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(3.5, 4.8, 0.18), metalMat)
        leftPanel.position.x = -1.75
        leftPanel.castShadow = true
        leftPanel.receiveShadow = true
        doorLeft.add(leftPanel)

        // Horizontal ridges on left door
        for (let i = -2; i <= 2; i++) {
          const ridge = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 0.06), ridgeMat)
          ridge.position.set(-1.75, i * 0.9, 0.1)
          doorLeft.add(ridge)
        }

        // Handle left
        const handleL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.12), accentMat)
        handleL.position.set(-0.1, 0, 0.15)
        doorLeft.add(handleL)

        // Lock bar left
        const lockL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.6, 8), accentMat)
        lockL.position.set(-0.2, 0, 0.12)
        doorLeft.add(lockL)

        scene.add(doorLeft)

        // ── RIGHT DOOR ────────────────────────────────────────────
        doorRight = new THREE.Group()
        doorRight.position.set(1.78, 0, 0)  // hinge at right edge

        const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(3.5, 4.8, 0.18), metalMat)
        rightPanel.position.x = 1.75
        rightPanel.castShadow = true
        rightPanel.receiveShadow = true
        doorRight.add(rightPanel)

        // Ridges right
        for (let i = -2; i <= 2; i++) {
          const ridge = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 0.06), ridgeMat)
          ridge.position.set(1.75, i * 0.9, 0.1)
          doorRight.add(ridge)
        }

        // Handle right
        const handleR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.12), accentMat)
        handleR.position.set(0.1, 0, 0.15)
        doorRight.add(handleR)

        // Lock bar right
        const lockR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.6, 8), accentMat)
        lockR.position.set(0.2, 0, 0.12)
        doorRight.add(lockR)

        scene.add(doorRight)

        // ── INTERIOR (visible when doors open) ────────────────────
        const interior = new THREE.Mesh(
          new THREE.BoxGeometry(7, 4.8, 8),
          new THREE.MeshStandardMaterial({ color:0x080812, metalness:0.6, roughness:0.8, side: THREE.BackSide })
        )
        interior.position.z = -4.5
        scene.add(interior)

        // Interior cargo boxes (barely visible in darkness)
        ;[[-2,  -1, -5], [1.5, -1, -6], [-1, -1, -7], [2, -1, -4]].forEach(([x,y,z]) => {
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(1.2 + Math.random()*0.5, 1.0 + Math.random()*0.5, 1.0),
            new THREE.MeshStandardMaterial({ color:0x1a1a2e, metalness:0.3, roughness:0.9 })
          )
          box.position.set(x, y, z)
          scene.add(box)
        })

        // ── LIGHT BEAM (god ray when doors open) ──────────────────
        const beamGeo = new THREE.ConeGeometry(2.5, 8, 16, 1, true)
        const beamMat = new THREE.MeshBasicMaterial({
          color: 0x0EA5E9, transparent: true, opacity: 0,
          side: THREE.DoubleSide, depthWrite: false,
        })
        lightBeam = new THREE.Mesh(beamGeo, beamMat)
        lightBeam.rotation.x = -Math.PI / 2
        lightBeam.position.z = 2
        scene.add(lightBeam)

        // ── FLOOR PARTICLES (dust when doors open) ────────────────
        const dustGeo = new THREE.BufferGeometry()
        const dustPos = new Float32Array(200 * 3)
        for (let i = 0; i < 200; i++) {
          dustPos[i*3]   = (Math.random() - 0.5) * 6
          dustPos[i*3+1] = (Math.random() - 0.5) * 4 - 1
          dustPos[i*3+2] = Math.random() * -8
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
        const dustMat = new THREE.PointsMaterial({ color:0x0EA5E9, size:0.04, transparent:true, opacity:0 })
        const dust = new THREE.Points(dustGeo, dustMat)
        scene.add(dust)
        scene.userData.dust = dust
        scene.userData.dustMat = dustMat

        // ── SCROLL HANDLER ────────────────────────────────────────
        const onResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix()
          renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onResize)

        // ── RENDER LOOP ───────────────────────────────────────────
        const clock = new THREE.Clock()

        const tick = () => {
          animId = requestAnimationFrame(tick)
          const t = clock.getElapsedTime()

          // ── Scroll progress (0 = top, 1 = one full viewport scrolled) ──
          const scrollProgress = Math.min(window.scrollY / window.innerHeight, 1)

          // Phase 1 (0→0.3): Doors swing open
          const doorPhase = Math.min(scrollProgress / 0.3, 1)
          const doorEase  = 1 - Math.pow(1 - doorPhase, 3)  // easeOutCubic
          const doorAngle = doorEase * Math.PI * 0.78        // 0 → ~140deg

          doorLeft.rotation.y  =  doorAngle
          doorRight.rotation.y = -doorAngle

          // Phase 2 (0.2→0.6): Camera pushes forward into truck
          const camPhase = Math.max(0, Math.min((scrollProgress - 0.2) / 0.4, 1))
          const camEase  = 1 - Math.pow(1 - camPhase, 2)
          camera.position.z = 8 - camEase * 5   // 8 → 3
          camera.position.y = camEase * -0.5

          // Phase 3 (0.3→0.7): Interior light fades in + beam appears
          const lightPhase = Math.max(0, Math.min((scrollProgress - 0.3) / 0.4, 1))
          interiorLight.intensity = lightPhase * 25
          lightBeam.material.opacity = lightPhase * 0.08
          dustMat.opacity = lightPhase * 0.6

          // Phase 4 (0.6→1.0): Camera tilts up, scene transitions out
          const exitPhase = Math.max(0, Math.min((scrollProgress - 0.6) / 0.4, 1))
          camera.position.y -= exitPhase * 2
          camera.fov = 60 + exitPhase * 15
          camera.updateProjectionMatrix()

          // Subtle idle sway
          camera.position.x = Math.sin(t * 0.3) * 0.05

          // Dust floating
          if (dustMat.opacity > 0) {
            const pos = scene.userData.dust.geometry.attributes.position
            for (let i = 0; i < 200; i++) {
              pos.array[i*3+1] += Math.sin(t + i) * 0.001
            }
            pos.needsUpdate = true
          }

          camera.lookAt(0, 0, -2)
          renderer.render(scene, camera)
        }
        tick()

        return () => {
          window.removeEventListener('resize', onResize)
        }

      } catch (err) {
        console.warn('TruckDoor: init failed', err)
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
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',
        zIndex:        2,
      }}
    />
  )
}
