'use client'
import { useEffect } from 'react'

export function ScrollAnimations() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let ctx
    let loaded = false

    const init = async () => {
      try {
        const { default: gsap }  = await import('gsap')
        const { ScrollTrigger }  = await import('gsap/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)
        loaded = true

        ctx = gsap.context(() => {
          // Section headings
          gsap.utils.toArray('.gsap-heading').forEach(el => {
            gsap.from(el, {
              scrollTrigger: { trigger: el, start: 'top 85%' },
              opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
            })
          })

          // Card groups
          gsap.utils.toArray('.gsap-card-group').forEach(group => {
            const cards = group.querySelectorAll('.gsap-card')
            if (!cards.length) return
            gsap.from(cards, {
              scrollTrigger: { trigger: group, start: 'top 80%' },
              opacity: 0, y: 30, scale: 0.97,
              stagger: 0.1, duration: 0.6, ease: 'power3.out',
            })
          })
        })
      } catch (err) {
        console.warn('ScrollAnimations: GSAP init failed', err)
      }
    }

    // Small delay to let page render first
    const timer = setTimeout(init, 500)

    return () => {
      clearTimeout(timer)
      try { if (ctx) ctx.revert() } catch (_) {}
    }
  }, [])

  return null
}

export default ScrollAnimations
