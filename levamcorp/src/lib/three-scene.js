// Three.js scene bootstrapper for Levam Corp
// Import dynamically from a 'use client' component

export async function createParticleField(canvas, options = {}) {
  const THREE = await import('three')

  const {
    count     = 1200,
    color     = 0x0EA5E9,
    color2    = 0x6366F1,
    size      = 1.2,
    depth     = 60,
    spread    = 30,
    speed     = 0.0003,
  } = options

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
  renderer.setClearColor(0x000000, 0)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 200)
  camera.position.z = 30

  // Particle geometry
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors    = new Float32Array(count * 3)
  const c1 = new THREE.Color(color)
  const c2 = new THREE.Color(color2)
  const cW = new THREE.Color(0xffffff)

  for (let i = 0; i < count; i++) {
    positions[i*3]   = (Math.random() - 0.5) * spread * 2
    positions[i*3+1] = (Math.random() - 0.5) * spread
    positions[i*3+2] = (Math.random() - 0.5) * depth

    const t = Math.random()
    const c = t < 0.5 ? c1.clone().lerp(c2, t*2) : c2.clone().lerp(cW, (t-0.5)*0.3)
    colors[i*3]   = c.r
    colors[i*3+1] = c.g
    colors[i*3+2] = c.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // Mouse parallax
  let mx = 0, my = 0
  const onMouse = e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2
    my = (e.clientY / window.innerHeight - 0.5) * 2
  }
  window.addEventListener('mousemove', onMouse)

  // Scroll parallax
  let scrollY = 0
  const onScroll = () => { scrollY = window.scrollY }
  window.addEventListener('scroll', onScroll, { passive: true })

  // Resize
  const onResize = () => {
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
  }
  window.addEventListener('resize', onResize)

  let animId
  const clock = new THREE.Clock()

  const animate = () => {
    animId = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()

    // Slow rotation
    points.rotation.y = t * speed * 60
    points.rotation.x = t * speed * 30

    // Mouse parallax
    camera.position.x += (mx * 2 - camera.position.x) * 0.03
    camera.position.y += (-my * 1.5 - camera.position.y) * 0.03

    // Scroll drift — camera moves forward as user scrolls
    camera.position.z = 30 - scrollY * 0.015

    renderer.render(scene, camera)
  }
  animate()

  return {
    destroy: () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }
}

export async function createHeroRings(canvas) {
  const THREE = await import('three')

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
  renderer.setClearColor(0x000000, 0)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100)
  camera.position.z = 8

  const rings = []
  const ringData = [
    { r:3.5, tube:0.004, color:0x0EA5E9, opacity:0.3, speed:0.003,  tilt:0.3 },
    { r:5.0, tube:0.003, color:0x6366F1, opacity:0.2, speed:-0.002, tilt:-0.5 },
    { r:6.5, tube:0.002, color:0x38BDF8, opacity:0.15, speed:0.0015, tilt:0.8 },
  ]

  ringData.forEach(d => {
    const geo = new THREE.TorusGeometry(d.r, d.tube, 2, 120)
    const mat = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: d.opacity })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = d.tilt
    mesh.userData = { speed: d.speed }
    scene.add(mesh)
    rings.push(mesh)

    // Dot on ring
    const dotGeo = new THREE.SphereGeometry(0.06, 8, 8)
    const dotMat = new THREE.MeshBasicMaterial({ color: d.color })
    const dot = new THREE.Mesh(dotGeo, dotMat)
    dot.position.set(d.r, 0, 0)
    mesh.add(dot)
  })

  let mx = 0, my = 0
  const onMouse = e => {
    mx = (e.clientX / window.innerWidth  - 0.5)
    my = (e.clientY / window.innerHeight - 0.5)
  }
  window.addEventListener('mousemove', onMouse)

  const onResize = () => {
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
  }
  window.addEventListener('resize', onResize)

  let animId
  const animate = () => {
    animId = requestAnimationFrame(animate)
    rings.forEach(r => { r.rotation.z += r.userData.speed })
    camera.position.x += (mx * 1.5 - camera.position.x) * 0.04
    camera.position.y += (-my * 1.5 - camera.position.y) * 0.04
    camera.lookAt(scene.position)
    renderer.render(scene, camera)
  }
  animate()

  return {
    destroy: () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
  }
}
