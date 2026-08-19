// GSAP + ScrollTrigger loader — lazy imported to avoid SSR issues
// Usage: const { gsap, ScrollTrigger } = await loadGSAP()

export async function loadGSAP() {
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ])
  gsap.registerPlugin(ScrollTrigger)
  return { gsap, ScrollTrigger }
}
