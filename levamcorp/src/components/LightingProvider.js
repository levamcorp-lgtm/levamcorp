'use client'
import { useEffect } from 'react'

// Mount once at the root — initializes the dynamic CSS lighting system
// and injects global realism styles

export default function LightingProvider() {
  useEffect(() => {
    let destroy

    import('../lib/realism').then(({ initDynamicLighting }) => {
      destroy = initDynamicLighting()
    })

    // Inject global realism CSS
    const style = document.createElement('style')
    style.id    = 'lc-realism'
    style.textContent = `
      /* ── Dynamic light CSS vars (defaults) ─────────────────────────── */
      :root {
        --lc-light-x:          0;
        --lc-light-y:          0;
        --lc-shadow-x:         0px;
        --lc-shadow-y:         6px;
        --lc-intensity:        1;
        --lc-ambient:          1;
        --lc-specular-pos:     30% 30%;
        --lc-specular-alpha:   0.06;
        --lc-card-shadow:      0 8px 30px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2);
        --lc-rim-shadow:       -12px 8px 30px rgba(14,165,233,0.08);
      }

      /* ── Smooth scrolling ────────────────────────────────────────────── */
      html { scroll-behavior: smooth; }

      /* ── Global eased transitions for interactive elements ───────────── */
      button, a, [role="button"] {
        transition:
          transform   0.18s cubic-bezier(0.34,1.56,0.64,1),
          box-shadow  0.18s cubic-bezier(0.4,0,0.2,1),
          opacity     0.15s ease,
          color       0.15s ease,
          background  0.15s ease,
          border-color 0.15s ease;
      }

      /* ── Realistic card base (applies to .lc-r-card) ─────────────────── */
      .lc-r-card {
        box-shadow: var(--lc-card-shadow);
        transition:
          transform  0.15s cubic-bezier(0.4,0,0.2,1),
          box-shadow 0.15s cubic-bezier(0.4,0,0.2,1);
      }

      /* ── Section fade-in on scroll ────────────────────────────────────── */
      .lc-reveal {
        opacity: 0;
        transform: translateY(28px);
        transition:
          opacity   0.7s cubic-bezier(0.4,0,0.2,1),
          transform 0.7s cubic-bezier(0.4,0,0.2,1);
      }
      .lc-reveal.lc-visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* ── Number glow ──────────────────────────────────────────────────── */
      .lc-stat-num {
        text-shadow:
          0 0 30px rgba(14,165,233, calc(0.3 * var(--lc-intensity))),
          0 0 80px rgba(14,165,233, calc(0.15 * var(--lc-intensity)));
        transition: text-shadow 0.3s ease;
      }

      /* ── Depth separator glow ─────────────────────────────────────────── */
      .lc-depth-sep {
        position: relative;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(14,165,233,0.3), rgba(14,165,233,0.6), rgba(14,165,233,0.3), transparent);
        margin: 0;
      }
      .lc-depth-sep::after {
        content: '';
        position: absolute;
        left: calc(var(--lc-specular-pos));
        top: -2px;
        width: 50px;
        height: 5px;
        background: radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 80%);
        filter: blur(2px);
        transition: left 0.1s ease;
      }

      /* ── Ambient occlusion on nested elements ─────────────────────────── */
      .lc-r-card > * + * {
        border-top: 1px solid rgba(0,0,0,0.15);
      }
      .lc-r-card > * + *:not(.lc-no-ao) {
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
      }

      /* ── Reduced motion ──────────────────────────────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
    `

    if (!document.getElementById('lc-realism')) {
      document.head.appendChild(style)
    }

    return () => {
      if (destroy) destroy()
    }
  }, [])

  return null
}
