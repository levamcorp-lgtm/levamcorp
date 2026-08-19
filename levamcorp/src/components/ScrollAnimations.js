'use client'
import { useEffect } from 'react'

export function ScrollAnimations() {
  useEffect(() => {
    let ctx

    import('../lib/gsap').then(({ loadGSAP }) => {
      loadGSAP().then(({ gsap, ScrollTrigger }) => {
        ctx = gsap.context(() => {

          // ── Hero text split animation ─────────────────────────
          gsap.from('.hero-word', {
            opacity: 0,
            y: 60,
            rotateX: -40,
            stagger: 0.08,
            duration: 1,
            ease: 'power4.out',
            delay: 0.3,
          })

          // ── Section headings slide in ──────────────────────────
          gsap.utils.toArray('.gsap-heading').forEach(el => {
            gsap.from(el, {
              scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
              opacity: 0,
              y: 50,
              duration: 0.9,
              ease: 'power3.out',
            })
          })

          // ── Cards stagger in ──────────────────────────────────
          gsap.utils.toArray('.gsap-card-group').forEach(group => {
            const cards = group.querySelectorAll('.gsap-card')
            gsap.from(cards, {
              scrollTrigger: { trigger: group, start: 'top 80%', toggleActions: 'play none none none' },
              opacity: 0,
              y: 40,
              scale: 0.96,
              stagger: 0.1,
              duration: 0.7,
              ease: 'power3.out',
            })
          })

          // ── Process line draw ──────────────────────────────────
          const processLine = document.querySelector('.gsap-process-line')
          if (processLine) {
            gsap.from(processLine, {
              scrollTrigger: { trigger: processLine, start: 'top 70%', end: 'bottom 30%', scrub: 1 },
              scaleY: 0,
              transformOrigin: 'top center',
              ease: 'none',
            })
          }

          // ── Stats count with slot-machine flash ───────────────
          const statEls = document.querySelectorAll('.gsap-stat')
          statEls.forEach(el => {
            ScrollTrigger.create({
              trigger: el,
              start: 'top 80%',
              onEnter: () => {
                gsap.fromTo(el,
                  { opacity: 0, scale: 0.8 },
                  { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }
                )
              }
            })
          })

          // ── Parallax sections ─────────────────────────────────
          gsap.utils.toArray('.gsap-parallax').forEach(el => {
            const speed = el.dataset.speed || 0.15
            gsap.to(el, {
              scrollTrigger: { trigger: el, scrub: true },
              y: () => -parseFloat(speed) * el.offsetHeight,
              ease: 'none',
            })
          })

          // ── Horizontal brand badge reveal ─────────────────────
          const badges = document.querySelectorAll('.gsap-badge')
          if (badges.length) {
            gsap.from(badges, {
              scrollTrigger: { trigger: badges[0], start: 'top 85%' },
              opacity: 0,
              x: -20,
              stagger: 0.06,
              duration: 0.5,
              ease: 'power2.out',
            })
          }

          // ── CTA section entrance flash ────────────────────────
          const cta = document.querySelector('.gsap-cta')
          if (cta) {
            gsap.fromTo(cta,
              { opacity: 0, y: 30 },
              {
                scrollTrigger: { trigger: cta, start: 'top 75%' },
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
              }
            )
            // Subtle pulse on the CTA button
            gsap.to('.gsap-cta-btn', {
              scrollTrigger: { trigger: cta, start: 'top 75%' },
              boxShadow: '0 0 40px rgba(14,165,233,0.5)',
              repeat: 2,
              yoyo: true,
              duration: 0.8,
              delay: 0.8,
            })
          }

          // ── Footer links hover stagger ────────────────────────
          const footerLinks = document.querySelectorAll('.gsap-footer-link')
          gsap.from(footerLinks, {
            scrollTrigger: { trigger: document.querySelector('footer'), start: 'top 95%' },
            opacity: 0,
            y: 10,
            stagger: 0.07,
            duration: 0.4,
            ease: 'power2.out',
          })

        })
      })
    })

    return () => { if (ctx) ctx.revert() }
  }, [])

  return null
}
