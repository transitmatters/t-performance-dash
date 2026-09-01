# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Advocates, researchers, journalists, and transit policy people building the case that the MBTA is under- or over-performing — doing trend analysis, constructing arguments, and gathering shareable evidence. Secondary: Commuters who ride the T and want to understand how their line is doing.

## Product Purpose

The TransitMatters Data Dashboard makes MBTA transit performance legible and persuasive. It takes raw operational data — headways, travel times, dwells, speed restrictions, ridership, delays, slow zones — and surfaces it as a public accountability tool. Success means a user leaves with a clear, accurate picture they can act on: share publicly, bring to an official, or use to justify donating to TransitMatters.

## Positioning

The only independent, publicly accessible, multi-metric visualization of MBTA performance produced by a nonprofit advocacy organization. The MBTA does not produce this; no other independent source matches its depth or breadth across all lines and modes.

## Operating Context

- Used when advocates build reports, when journalists cover MBTA news, and when policy people need data for hearings or advocacy campaigns
- Often consumed in bursts triggered by a news event, service outage, or advocacy push
- Charts and views are regularly screenshot and shared on social media, in press coverage, and in policy presentations — shareability is a functional requirement, not an aesthetic one
- Accessed primarily on desktop by researchers; also on mobile by commuters and social-media users following a link
- Backend infrastructure is serverless (AWS Chalice + DynamoDB + S3) — hosting cost is a real constraint; architectural changes must account for it

## Capabilities and Constraints

- **Metrics covered:** headways, travel times, dwells, speed/slow zones, service frequency, predictions accuracy, delays, ridership
- **Lines covered:** Red, Orange, Blue, Green, Mattapan (subway); Bus; Commuter Rail; Ferry; The Ride
- **Date scoping:** per-line date ranges and system-wide views; single-trip and multi-trip explorer
- **Tech stack:** Next.js 15 + React 18 + TypeScript; Tailwind CSS; Chart.js via react-chartjs-2; Zustand + TanStack React Query; Python 3.12 + Chalice backend
- **Cost constraint:** nonprofit — no changes that materially increase AWS hosting costs without explicit sign-off

## Brand Commitments

- **Name:** TransitMatters (single word, capital T and M)
- **Wordmark:** `/public/Logo_wordmark_white.png` — white version for use on dark or colored backgrounds
- **MBTA line colors (canonical):** Red `#da291c`, Orange `#ed8b00`, Blue `#003da5`, Green `#00843d`, Bus `#ffc72c`, Commuter Rail `#80276c`, Ferry `#008eaa`; these are brand tokens and never flip with theme
- **Donation CTA:** required in the UI — the dashboard exists to support TransitMatters' mission and funding
- **Voice:** direct, data-forward, transit-enthusiast energy without being exclusionary to newcomers

## Evidence on Hand

- Live site: https://dashboard.transitmatters.org
- Hero Lottie animation: `public/Animations/hero.lottie.json`
- Logo: `public/Logo_wordmark_white.png`
- MBTA brand color definitions: `common/constants/theme.ts` (`MBTA_BRAND`) — canonical source
- Full-color chart palette and line-color ramps: `common/constants/colors.ts`

## Product Principles

1. **Shareable precision.** Charts must tell a clear story without annotation. If a user can't screenshot a chart and post it with one sentence of context, the design has failed.
2. **Data clarity over decoration.** Every visual element earns its place by helping the user understand transit performance. Decoration that doesn't carry information is noise.
3. **Advocacy-forward.** The product exists to create change. Design should carry urgency and make the MBTA's failures (or improvements) undeniable — not merely interesting.
4. **Authoritative credibility.** Journalists, officials, and researchers are primary users. The product must read as rigorous and trustworthy, not as a hobbyist project.
5. **Cost-conscious infrastructure.** As a nonprofit, architectural decisions must weigh hosting cost explicitly. Simpler is almost always better here.

## Accessibility & Inclusion

No specific WCAG target was established, but the public-facing nature and advocacy mission require broad accessibility — the dashboard is evidence used in civic contexts and must be usable by people regardless of ability.
