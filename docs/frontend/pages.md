# Pages & Routing

All pages are in the `pages/` directory following Next.js file-system routing.

## Page Map

### Static Pages

| Path | File | Component | Layout | Description |
|------|------|-----------|--------|-------------|
| `/` | `index.tsx` | `Landing` | Landing | Home page with hero animation and line selector |
| `/opensource` | `opensource.tsx` | — | Dashboard | Open source license accordion |
| `/404` | `404.tsx` | — | Dashboard | Not found page |

### Line Dashboard Pages (`/[line]/`)

Dynamic pages using the `[line]` parameter (e.g., `/red`, `/orange`, `/green`).

| Path | File | Component | Description |
|------|------|-----------|-------------|
| `/[line]` | `[line]/index.tsx` | `Overview` | Line overview with speed, service, ridership, slowzone, and alert widgets |
| `/[line]/delays` | `[line]/delays.tsx` | `DelaysDetails` | Alert-based delay analysis with breakdown charts |
| `/[line]/speed` | `[line]/speed.tsx` | `SpeedDetails` | Speed between stations analysis |
| `/[line]/predictions` | `[line]/predictions.tsx` | `PredictionsDetails` | Real-time prediction accuracy |
| `/[line]/service` | `[line]/service.tsx` | `ServiceDetails` | Scheduled vs. delivered service |
| `/[line]/ridership` | `[line]/ridership.tsx` | `RidershipDetails` | Line ridership over time |
| `/[line]/slowzones` | `[line]/slowzones.tsx` | `SlowZonesDetails` | Slow zone map and timeline |

### Trip Explorer Pages (`/[line]/trips/`)

| Path | File | Component | Description |
|------|------|-----------|-------------|
| `/[line]/trips/single` | `trips/single/index.tsx` | — | Single-day headways, dwells, travel times |
| `/[line]/trips/multi` | `trips/multi/index.tsx` | — | Multi-day aggregated trip metrics |

### System Pages (`/system/`)

| Path | File | Component | Description |
|------|------|-----------|-------------|
| `/system` | `system/index.tsx` | — | System landing |
| `/system/slowzones` | `system/slowzones.tsx` | `SystemSlowZonesDetails` | System-wide slow zones |
| `/system/ridership` | `system/ridership.tsx` | `SystemRidershipDetails` | System-wide ridership |

### V3 Redirect Pages

| Path | File | Purpose |
|------|------|---------|
| `/rapidtransit` | `rapidtransit.tsx` | Redirects old v3 URLs to v4 format |
| `/slowzones` | `slowzones.tsx` | Redirects old v3 URLs to v4 format |

These use the `useRewriteV3Route()` hook from `common/utils/middleware.ts`.

## Dynamic Routing

The `[line]` parameter maps to `LinePath` values:

| URL Segment | Line |
|------------|------|
| `red` | Red Line |
| `orange` | Orange Line |
| `blue` | Blue Line |
| `green` | Green Line |
| `mattapan` | Mattapan Trolley |
| `bus` | Bus routes |
| `commuter-rail` | Commuter Rail |
| `ferry` | Ferry |
| `the-ride` | The RIDE |

The current route is parsed by `useDelimitatedRoute()` from `common/utils/router.tsx`, which returns:

```typescript
{
  line: Line,           // e.g., 'line-red'
  linePath: LinePath,   // e.g., 'red'
  lineShort: LineShort, // e.g., 'Red'
  page: Page,           // e.g., 'overview'
  tab: Tab,             // e.g., 'Subway'
  query: QueryParams,   // URL query parameters
  color: string         // Line's hex color
}
```

## App Initialization (`_app.tsx`)

The root `_app.tsx` component:

1. Registers Chart.js plugins
2. Determines the layout from the page component's `Layout` property
3. Wraps the page in the layout composition chain
4. Initializes GoatCounter analytics in production
