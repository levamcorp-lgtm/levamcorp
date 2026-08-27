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

Sections do **not** carry their own ambient radial-gradient "glow blob" (a 350–500px soft circle in some accent color, positioned in a corner). An earlier pass had ~17 of these scattered one or two per section, rotating through blue/yellow/green/steel — removed on explicit feedback that it read as scattered colored dots rather than one cohesive background. The ground is flat warm charcoal plus the fixed steel-grid texture layer (behind everything, set once in the page root); color now lives in the Card tags, the video, and the hazard-strip, not in floating per-section spotlights. The two remaining full-bleed `radial-gradient(ellipse ...)` washes (hero, final CTA) are a different, much subtler device — under 0.10 opacity, spanning the whole section rather than reading as a discrete shape — and are fine to keep or reuse sparingly; the discrete circular blob is what's banned.

## Typography

Space Grotesk (display/headlines) + Inter (body) are a **confirmed cross-site asset** — already shipped on 7+ pages (admin, portal, login) before this redesign — kept here for brand consistency rather than picked fresh for this surface. `.lc-mono` (SF Mono/JetBrains Mono) is reserved for manifest/tracking-number-style data (the hero badge, the stamp captions, the brand marquee label) — it represents actual shipping/inventory data, not a "technical" costume.

## Shapes

Corners stay small and functional (4–12px) — this is an operational/industrial world, not a soft consumer one. The CSS `preserve-3d` shipping-box treatment (open box, flaps folding to sealed, driven by scroll) was removed from the hero — the video needed the full frame, uncompeted by a foreground object — and wasn't kept elsewhere; a future surface can reintroduce that technique deliberately, but there's no `.box3d-*` scaffolding left to resurrect verbatim.

## Components

- **HeroVideoBackground** (the hero, `src/app/page.js`): a full-bleed video background that autoplays through 8 real clips of a shipment's actual journey (label → carton → pallet → forklift → trailer → distribution centre → delivered), looping the set forever. **Deliberately not scroll-linked.** An earlier version scroll-scrubbed the sequence inside a `1000vh` sticky stage; that shipped broken twice — first `crossOrigin="anonymous"` made the browser hard-fail every clip fetch (no matching CORS headers from the CDN), then even after that fix the visitor still hit a long dead scroll distance whenever a clip stalled, because the whole page's scroll was hijacked by the video's timeline. This component has no loader, no gate, and nothing can block on it: the hero's text renders immediately regardless of video state, a failed clip just advances to the next one, and the page always scrolls at normal 1:1 speed. Do not re-couple this to scroll position without a much stronger reason than "it looked cool in the mockup" — two production incidents came from that coupling. **Two stacked `<video>` elements crossfade** (`JOURNEY_FADE_SEC = 0.7`s): the idle element is preloaded with the next clip well ahead of time and starts playing (both elements briefly in motion together) via a `timeupdate` check firing at `duration - JOURNEY_FADE_SEC`, so the cut dissolves while both clips still have real motion in them — not a hard swap on `ended`, which read as a jarring pop/freeze between clips. `ended` is kept only as a safety-net trigger in case `timeupdate` doesn't fire in time.
- **Hero overlay content** (`src/app/page.js`, inside the same `100vh` hero section as `HeroVideoBackground` — rebuilt from a second Claude Design handoff): the badge/headline/CTA/stats block that sits on top of the video. The headline no longer types itself out character-by-character (`TypewriterText` is gone); each of its three lines now reveals with a masked slide-up (`heroLine` keyframe, `overflow:hidden` wrapper + inner `translateY(105%)→0`), matching the imported design instead of a typewriter effect. A thin safety-yellow underline wipes in below it (`heroWipe`). The badge gained a live `LiveClock` (`America/New_York`, ticks every 15s) inline with "B2B WHOLESALE · DORAL FL". A new mono category-tag row ("APPLIANCES / AUDIO / TV & DISPLAY / GAMING") sits between the subcopy and the CTAs. The stats block changed from a 4-column bordered grid to a single dot-separated row (`HeroStats`) that counts up from 0 on mount via an eased `requestAnimationFrame` (cubic ease-out, 1.4s) — same real numbers as before (48h dispatch, 500+ SKUs, 100% B2B), the standalone "7+ premium brands" stat was dropped since the brand marquee now carries that signal visually. A "SCROLL" cue with an animated vertical line sits at the bottom-right of the content row (`hero-scroll-cue`, hidden under 900px). The whole content block tilts a few degrees toward the cursor (`HeroTiltGroup`, tracks `mousemove` on the hero `<section>`, imperative `rAF`-throttled transform — same pattern as `TiltCard`, just without its glow/scale).
- **BrandMarquee** (`src/app/page.js`): replaced the old text-only `BrandTicker` (generic all-caps brand names scrolling behind diamond bullets). Pinned to the very bottom edge of the hero section (`position:absolute; bottom:0`), overlapping the last strip of video behind a blurred dark scrim, not a separate section further down the page. Scrolls real logo images (`/public/brands/*.png` — SharkNinja, JBL, Logitech, Harman Kardon, DJI, Anker, Amazon, Hisense, Samsung, KitchenAid, Nintendo, nutribullet, PlayStation; already light-on-transparent, no CSS invert filter needed) at `opacity:0.72`, brightening to `1` + a slight scale on hover (`.brand-logo-item:hover`). Reuses the existing `ticker` keyframe (list tripled, `-33.333%` translate) rather than adding a new one.
- **Card** (shared `Card` component — every info block on the site: categories, "why partners choose us", company info, founders, insights, contact): reads as a **manifest tag pulled off a crate**, not a generic bordered card. Dashed (not solid) accent-tinted border, a clipped hang-tag notch on the top-right corner (`clip-path`), a grommet hole top-left, and a header row above the content with a deterministic `TAG·XXXX` code (last 4 hex digits of the accent color) plus a tiny inline barcode (`Barcode` sub-component, bar widths derived from the same code) separated from the body by a perforated rule. Accent-tinted gradient wash from the accent color to `{colors.bg-panel}` is unchanged underneath. Accent rotates across sections between brand-blue, safety-yellow, success-green, kraft, and steel — never purple/gold (retired earlier). Do not revert this to a plain solid-border rounded rectangle — that was explicitly called out as reading like every other site's generic card component.
- **StampSeal**: a circular ink-stamp badge that "thuds" into place on scroll (`cubic-bezier(0.22,1.61,0.36,1)` overshoot) — the one intentional bounce-easing use in the system, justified because it mimics a real stamp impact, not decorative bounce on an arbitrary UI element.
- **hazard-strip**: a diagonal yellow/charcoal repeating-gradient divider (warehouse caution-tape motif), used sparingly as a section break, not on every seam.
- **CategoryLabel** (categories section only, `src/app/page.js`): imported verbatim from a user-provided Claude Design mockup — a literal printed shipping label, not a themed dark card. Cream label stock (`#f4f2ec` background, `#111` ink, `#dcd8ce` border) with a deep shadow, deliberately breaking from the site's dark ground for this one section — the "real label pinned to a dark wall" contrast is intentional, not a bug to fix. Structure, top to bottom: a `#14120E` brand header bar (Levam mark + "LEVAMCORP" + "DORAL · FL"), a "CATEGORY / CLASE" row with a category-colored swatch dot and "0X OF 06", an icon + large title, a description paragraph, a 2×2 dashed metadata grid (CLASS/CODE/ORIGIN/SHIPPING), and a footer on slightly darker cream (`#efece4`) with a decorative barcode strip and a `TAG·XXXX·CODE` + `levamcorp.com` line. Six categories (`CATEGORY_LABELS`): Televisions, Electronics, Kitchen Appliances, Gaming, Audio, Computers & Accessories — this replaced the previous four-category set (Televisions/Electronics/Small Appliances/Kitchen & Cooking) entirely, per the mockup's own content, not a preserved-copy pass. Typography is JetBrains Mono (labels/codes) + Archivo (title/description) — a deliberate one-off swap from the site's Space Grotesk/Inter pairing, matching what the physical label medium would actually be printed in. Don't reuse this cream-label treatment elsewhere without the user asking — it's specific to categories, not a new sitewide alternative to `Card`.
  Each label is wrapped in `TiltCard` (`glow={item.swatch}`, per-category color) for a cursor-following 3D perspective tilt on hover, and the label's own border switches from neutral `#dcd8ce` to that category's swatch color via a `--label-accent` CSS custom property plus a `.category-label:hover { border-color: var(--label-accent) !important; }` rule — `!important` is required there because the base border is set inline (React `style`), which otherwise always beats an external class rule regardless of specificity tricks. `TiltCard`'s glow-shadow color used to be a hardcoded ternary covering only 5 pre-existing site accents; it now calls the generic `hexToRgb()` helper so it works with any accent color, including these six category swatches.
- **ManifestMetrics + ProcessStepper** (the SKU/dispatch/brands strip and the "how to apply" section, `src/app/page.js`, both under `id="stats"`): imported from a third Claude Design handoff, replacing a plain 3-stat grid and a static numbered-step list with two connected "scan ticket" panels — same header-bar / tag-code-and-barcode-footer language as `Card`, just monochrome (cream `#F5F1E8`-on-charcoal, no accent-tinted wash) since this is data, not a category. A dashed connector line with a filled dot (`ManifestConnector`) links the two panels, matching the mockup instead of the old wave-SVG dividers (`Wave` was removed — it had no other callers). `ManifestMetrics` shows 500+ SKUs / 48h dispatch / **10+** premium brands (raised from the old "7+" — the brand marquee now carries 13 real logos, so 10+ is the accurate floor) as odometer-style rolling digits (`OdometerNumber`) that count up once, triggered by `IntersectionObserver`, plus a decorative "barcode ruler" strip with a looping scan-light sweep (`manifestScan` keyframe). `ProcessStepper` auto-advances through the 4 steps every 5s, pauses and jumps to whichever step is hovered/focused/clicked, supports arrow-key navigation (`role="tablist"`), and drives its own progress ruler by writing `width` directly to a ref every `requestAnimationFrame` tick instead of storing per-frame progress in React state — the mockup's own version re-rendered a 120-bar list every frame, which this avoids. The active step's metadata fields expand via `grid-template-rows: 0fr → 1fr` (the same technique used by the FAQ accordion), not `max-height` — a first draft used `max-height` and the anti-pattern detector correctly flagged it as the same layout-thrashing pattern already fixed once in this codebase. Both panels' muted-text grays (`#7C7A73`, `#8F8C85`, `#6F6D67`, etc.) are a deliberate one-off tonal ramp lifted from the mockup for this ticket's own multi-tier hierarchy (label / active / inactive / hover) — don't fold them into `text-muted` or reuse them outside these two components.

## Do's and Don'ts

- Do keep product/business content (headlines, stats, FAQ answers, founder bios, contact info) byte-identical when doing future visual passes here — this redesign was explicitly style-only, not a content or functionality change.
- Do reuse the warehouse motif (kraft, safety-yellow, hazard stripes, stamps, the 3D box) for new marketing-site surfaces before inventing a new one.
- Don't add a kicker/eyebrow label above a heading (small-caps tag + hairline + heading) — this page's small-caps "Label" component was removed sitewide on this page for reading as a generic AI-template tell; headings stand alone now.
- Don't reintroduce ambient blue/purple radial-glow orbs as the dominant background treatment — that reads as the generic near-black-plus-neon-accent look this redesign was explicitly built to avoid.
- Don't port this world onto the admin panel or portal without a deliberate decision — those currently run a different, still-valid dark-blue system; mixing both without intent will look like two products stitched together.
- The 8 hero video clips are hosted on a personal CloudFront URL (`d8j0ntlcm91z4.cloudfront.net/user_.../`) generated via a third-party tool, not stored in this repo or any Levam-owned bucket — if that URL ever goes away the hero silently shows a black background (text and layout are unaffected, per HeroVideoBackground above, but the footage itself won't play). Re-host to Supabase Storage or a Levam-owned CDN before this is load-bearing for real traffic.
- Don't scroll-couple the hero video again (see HeroVideoBackground above) — it is one normal `100vh` section, video behind, content in front, page scrolls at normal speed. This was tried and reverted twice.
