<!-- impeccable:product-schema 1 -->

# Levam Corp Distributors — Product

## Platform
web

## Stack
Next.js 15 (App Router) + React 18, server-rendered marketing site plus authenticated client portal and admin panel, deployed as a standard responsive website (desktop and mobile browsers).

## Users
Primary user: **resellers who buy wholesale to resell on marketplaces** — chiefly Amazon and Walmart sellers (also general registered retailers/distributors), sourcing consumer electronics and home appliances at wholesale prices to resell online. They need a supplier they can trust for authentic stock, competitive margins, and reliable fulfillment — not a marketplace, a vetted long-term supply relationship.

Secondary users:
- **Levam Corp staff (admin)** — review applications, manage approved clients, track orders/payments/invoices, run the business (executive, marketing, and operational dashboards).
- **Approved clients (portal)** — logged-in wholesale partners browsing the catalog with live pricing/stock and placing orders.

## Product Purpose
Levam Corp connects vetted U.S. resellers and distributors to top consumer electronics and appliance brands at wholesale prices. The public site qualifies and converts prospects into applicants; the portal serves approved partners with catalog, pricing, and ordering; the admin panel runs the operation (client relationships, orders, marketing spend/ROI, and financial performance).

## Positioning
"A different kind of distributor." The core differentiator is **price/margin** — direct wholesale rates, not inflated reseller pricing — backed by a personally-vetted partner network (not an open marketplace), U.S.-based operations, and responsive service (48h average dispatch, English & Spanish support). Tone: professional, credible B2B — not consumer e-commerce.

## Operating Context
- Legal name: Levam Corp Distributors (DBA), a registered Florida business.
- Warehouse/HQ: 6315 NW 99th Ave, Doral, FL 33178.
- Support: English & Spanish speaking team, Mon–Fri 9AM–5PM ET.
- Fulfillment: ships from the Doral, FL warehouse, ~48-hour average dispatch turnaround.
- Access model: gated — prospects must apply (EIN + resale certificate required); applications are reviewed individually by staff, not auto-approved. Approved applicants get portal access with live pricing/stock.
- MOQ (minimum order quantity) varies by product and is only shown inside the portal after approval.

## Capabilities and Constraints
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`) is the backend/auth/data layer for applications, clients, orders, payments, expenses, and marketing tracking.
- Client↔order association currently relies on a client-side email match parsed out of `orders.notes` (no direct foreign key) — a pre-existing convention, not something to break when extending order/client features.
- Organic marketing-channel and conversion data is real, sourced from `applications.heard_about` and `applications.status`, not fabricated — preserve this when touching the marketing dashboard.
- No image-format conversion tooling is available in this environment (no cwebp/sips/magick/ffmpeg) — ship images as delivered (PNG) rather than assuming a conversion step.
- Contact form (`/contact`, home footer "ask us anything") sends via Resend to `contact@levamcorp.com` and also logs to a `contact_messages` Supabase table.

## Brand Commitments
- Never overstate or invent certifications, client counts, or years-in-business figures — the site's current factual claims (Florida-registered DBA, Doral FL address, EIN/resale-certificate requirement, 48h average dispatch) are the full extent of verified evidence; nothing beyond what's already stated is confirmed.
- "We review every application personally" / "not a marketplace" is a real operating fact (staff-reviewed approvals), not marketing copy — don't imply automated/instant approval anywhere.

## Evidence on Hand
- Hero/positioning copy in production: "Premium brands. Wholesale pricing. Built for resellers." / "Levam Corp connects approved U.S. distributors and resellers to top consumer electronics and appliance brands — at competitive wholesale prices, from our Doral, FL warehouse."
- Founder quote (About section): "We started Levam Corp because we saw how hard it was for serious resellers to find a distributor they could actually trust. We wanted to be that company."
- FAQ confirms target applicant profile: "registered retailers, resellers, and distributors — a valid EIN and resale certificate are required."
- `applications.heard_about` values already in production data model include `amazon_seller` and `walmart_seller` as explicit lead-source options, corroborating resellers-on-marketplaces as the dominant user segment.

## Product Principles
- Preserve gated, personally-reviewed access — never design toward self-serve/instant approval, it contradicts the trust-based positioning.
- Keep wholesale pricing/margin as the lead value proposition in any new surface; service and authenticity are supporting points, not the headline.
- Real data over fabricated data: when a dashboard or metric can be sourced from existing tables (applications, orders, expenses), do that instead of inventing example numbers.
