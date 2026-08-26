---
name: Levam Corp Distributors
description: B2B wholesale distributor site — warehouse/shipping visual world
colors:
  bg: "#14120E"
  bg-panel: "#1D1A15"
  bg-panel-elevated: "rgba(29,26,21,0.6)"
  brand-blue: "#2F7DF6"
  safety-yellow: "#F2B705"
  kraft: "#B98A54"
  kraft-deep: "#8F6636"
  steel: "#6B7280"
  success-green: "#12B76A"
  text-primary: "#F5F1E8"
  text-muted: "#A7A090"
  border: "rgba(245,241,232,0.07)"
typography:
  display:
    fontFamily: "Space Grotesk, -apple-system, sans-serif"
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, sans-serif"
  mono:
    fontFamily: "SF Mono, JetBrains Mono, ui-monospace, Menlo, monospace"
rounded:
  sm: "4px"
  md: "6-10px"
  lg: "12px"
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, {colors.brand-blue}, #0284C7)"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "rgba(255,255,255,0.03)"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  card:
    backgroundColor: "linear-gradient(160deg, rgba(accent,0.16) 0%, rgba(accent,0.03) 45%, {colors.bg-panel} 80%)"
    rounded: "10px"
---

## Overview

Levam Corp is a B2B wholesale electronics distributor (Doral, FL) selling to resellers — chiefly Amazon/Walmart sellers. The public marketing site (`src/app/page.js` and its nav-linked pages) runs a **warehouse / shipping** visual world: the site should feel like the inside of a real distribution operation, not a generic dark-mode SaaS dashboard. This world was established in this redesign pass; **the admin panel and portal login still run an older "mission control" dark-blue tech theme** (`#080B14` bg, pure blue glow orbs) that has not been migrated — do not assume site-wide consistency until that migration happens.

## Colors

Committed-strategy palette: one saturated accent (safety-yellow) carries CTAs-adjacent emphasis and dividers, kraft-cardboard tones carry material surfaces, brand blue is reserved specifically for links, primary CTAs, and the Levam ink-stamp motif — never used as ambient background glow (that was the prior "AI-generic" tell this redesign moved away from). Ground is warm charcoal-brown (`#14120E`), never blue-black. Text/borders use warm off-white and warm gray, not cool blue-gray.

Do not reintroduce `#080B14` / cool blue-gray text (`#9AACC9`, `#F0F4FF`) on this page — that's the legacy system this world replaced.

## Typography

Space Grotesk (display/headlines) + Inter (body) are a **confirmed cross-site asset** — already shipped on 7+ pages (admin, portal, login) before this redesign — kept here for brand consistency rather than picked fresh for this surface. `.lc-mono` (SF Mono/JetBrains Mono) is reserved for manifest/tracking-number-style data (the hero badge, the stamp captions, the brand ticker) — it represents actual shipping/inventory data, not a "technical" costume.

## Shapes

Corners stay small and functional (4–12px) — this is an operational/industrial world, not a soft consumer one. The CSS `preserve-3d` shipping-box treatment (open box, flaps folding to sealed, driven by scroll) was removed from the hero — the video needed the full frame, uncompeted by a foreground object — and wasn't kept elsewhere; a future surface can reintroduce that technique deliberately, but there's no `.box3d-*` scaffolding left to resurrect verbatim.

## Components

- **HeroVideoBackground** (the hero, `src/app/page.js`): a full-bleed video background that autoplays through 8 real clips of a shipment's actual journey (label → carton → pallet → forklift → trailer → distribution centre → delivered), advancing on each clip's native `ended` event and looping the set forever. **Deliberately not scroll-linked.** An earlier version scroll-scrubbed the sequence inside a `1000vh` sticky stage; that shipped broken twice — first `crossOrigin="anonymous"` made the browser hard-fail every clip fetch (no matching CORS headers from the CDN), then even after that fix the visitor still hit a long dead scroll distance whenever a clip stalled, because the whole page's scroll was hijacked by the video's timeline. This component has no loader, no gate, and nothing can block on it: the hero's text renders immediately regardless of video state, a failed clip just advances to the next one, and the page always scrolls at normal 1:1 speed. Do not re-couple this to scroll position without a much stronger reason than "it looked cool in the mockup" — two production incidents came from that coupling.
- **Card** (shared `Card` component): accent-tinted gradient wash from the accent color to `{colors.bg-panel}`, 1px accent-tinted border, thin top hairline gradient. Accent rotates across sections between brand-blue, safety-yellow, success-green, kraft, and steel — never purple/gold (retired this pass).
- **StampSeal**: a circular ink-stamp badge that "thuds" into place on scroll (`cubic-bezier(0.22,1.61,0.36,1)` overshoot) — the one intentional bounce-easing use in the system, justified because it mimics a real stamp impact, not decorative bounce on an arbitrary UI element.
- **hazard-strip**: a diagonal yellow/charcoal repeating-gradient divider (warehouse caution-tape motif), used sparingly as a section break, not on every seam.

## Do's and Don'ts

- Do keep product/business content (headlines, stats, FAQ answers, founder bios, contact info) byte-identical when doing future visual passes here — this redesign was explicitly style-only, not a content or functionality change.
- Do reuse the warehouse motif (kraft, safety-yellow, hazard stripes, stamps, the 3D box) for new marketing-site surfaces before inventing a new one.
- Don't add a kicker/eyebrow label above a heading (small-caps tag + hairline + heading) — this page's small-caps "Label" component was removed sitewide on this page for reading as a generic AI-template tell; headings stand alone now.
- Don't reintroduce ambient blue/purple radial-glow orbs as the dominant background treatment — that reads as the generic near-black-plus-neon-accent look this redesign was explicitly built to avoid.
- Don't port this world onto the admin panel or portal without a deliberate decision — those currently run a different, still-valid dark-blue system; mixing both without intent will look like two products stitched together.
- The 8 hero video clips are hosted on a personal CloudFront URL (`d8j0ntlcm91z4.cloudfront.net/user_.../`) generated via a third-party tool, not stored in this repo or any Levam-owned bucket — if that URL ever goes away the hero silently shows a black background (text and layout are unaffected, per HeroVideoBackground above, but the footage itself won't play). Re-host to Supabase Storage or a Levam-owned CDN before this is load-bearing for real traffic.
- Don't scroll-couple the hero video again (see HeroVideoBackground above) — it is one normal `100vh` section, video behind, content in front, page scrolls at normal speed. This was tried and reverted twice.
