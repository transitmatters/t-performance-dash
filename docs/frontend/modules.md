# Feature Modules

Each feature area lives in a self-contained directory under `modules/`. Modules contain their own components and import shared infrastructure from `common/`.

## Module Overview

| Module | Directory | Description |
|--------|-----------|-------------|
| [Alerts](#alerts) | `modules/alerts/` | Real-time service alert widget |
| [Commute Alerts](#commute-alerts) | `modules/commute/` | Alert display components (delay, shuttle, suspension, etc.) |
| [Dashboard](#dashboard) | `modules/dashboard/` | Line overview page with multiple widgets |
| [Navigation](#navigation) | `modules/navigation/` | Side navigation and line/route selectors |
| [Landing](#landing) | `modules/landing/` | Home page with hero and system-wide charts |
| [Delays](#delays) | `modules/delays/` | Alert-based delay analysis |
| [Service](#service) | `modules/service/` | Scheduled vs. delivered service metrics |
| [Ridership](#ridership) | `modules/ridership/` | Ridership data and charts |
| [Headways](#headways) | `modules/headways/` | Headway (time between trains) charts |
| [Dwells](#dwells) | `modules/dwells/` | Dwell time charts |
| [Travel Times](#travel-times) | `modules/traveltimes/` | Travel time between stations |
| [Speed](#speed) | `modules/speed/` | Speed analysis and speed restrictions |
| [Predictions](#predictions) | `modules/predictions/` | Real-time prediction accuracy |
| [Slow Zones](#slow-zones) | `modules/slowzones/` | Slow zone map and timeline |
| [Service and Ridership](#service-and-ridership-dashboard) | `modules/serviceAndRidership/` | System-wide dashboard |
| [Trip Explorer](#trip-explorer) | `modules/tripexplorer/` | Trip data exploration utilities |

---

## Alerts

**Directory**: `modules/alerts/`

**Key Components**:

- `AlertsWidget` — Widget wrapper that fetches alert data using `useAlertsData()` and `useAccessibilityAlertsData()` hooks, then renders the `Alerts` component from `modules/commute/`

**Data Dependencies**: `useAlertsData()`, `useAccessibilityAlertsData()`

---

## Commute Alerts

**Directory**: `modules/commute/alerts/`

Alert rendering components, each handling a specific alert type:

| Component | Alert Type |
|-----------|-----------|
| `DelayAlert` | Service delays |
| `ShuttleAlert` | Bus bridge / shuttle service |
| `SuspensionAlert` | Line suspension |
| `StopClosureAlert` | Station closure |
| `AccessibilityAlert` | Escalator / elevator outages |
| `AlertModal` | Detailed alert modal |
| `Alerts` | Main renderer that dispatches to type-specific components |

Supporting components: `AlertBox`, `AlertBoxInner`, `Time`

---

## Dashboard

**Directory**: `modules/dashboard/`

The line overview page that aggregates multiple widgets into a single view.

**Key Components**:

- `Overview` — Main component rendering SpeedWidget, ServiceWidget, RidershipWidget, SlowZonesWidget, and AlertsWidget. Conditionally shows widgets based on line type and active tab.
- `DesktopHeader` / `MobileHeader` — Page headers
- `HomescreenWidgetTitle` / `LocationTitle` — Title formatting

---

## Navigation

**Directory**: `modules/navigation/`

**Key Components**:

- `SideNavigation` — Main navigation menu with sections for Home, Slow Zones, Service & Ridership, and each transit mode
- `DesktopSideNavBar` / `MobileNavHeader` — Layout-specific navigation
- `SidebarTabs` — Tab selection (Subway, Bus, Commuter Rail, etc.)
- Line/route section components: `SubwaySection`, `BusSection`, `CommuterRailSection`, `TheRideSection`, `FerrySection`

---

## Landing

**Directory**: `modules/landing/`

**Key Components**:

- `Landing` — Hero page with Lottie animation and line selector buttons
- `LandingCharts` — System-wide performance summary charts
- `LineSelectionLanding` / `LineButton` — Line navigation buttons
- Chart components: `OverallServiceChart`, `OverallSpeedChart`, `OverallRidershipChart`

---

## Delays

**Directory**: `modules/delays/`

**Key Components**:

- `DelaysDetails` — Main delay analysis page. Calculates daily vs. weekly aggregation based on date range (90-day threshold). Includes Green Line branch selector.
- `TotalDelayGraph` — Time series of total delays
- `DelayBreakdownGraph` — Delays categorized by reason
- `DelayByCategoryGraph` — Category histogram

**Data Dependencies**: `useAlertDelays()`

---

## Service

**Directory**: `modules/service/`

**Key Components**:

- `ServiceDetails` / `ServiceWidget` — Service metrics pages
- `ServiceGraphWrapper` — Renders schedule vs. delivered service
- Chart variants: `ServiceGraph`, `ServiceHoursGraph`, `ScheduledAndDeliveredGraph`, `DailyServiceHistogram`, `PercentageServiceGraph`

**Data Dependencies**: `useScheduledService()`, `useDeliveredTripMetrics()`

---

## Ridership

**Directory**: `modules/ridership/`

**Key Components**:

- `RidershipDetails` — Line-level ridership page
- `SystemRidershipDetails` — System-wide ridership
- `RidershipGraph` / `RidershipGraphWrapper` — Charts
- `RidershipWidget` — Overview widget

**Data Dependencies**: `useRidershipData()`

---

## Headways

**Directory**: `modules/headways/`

**Key Components**:

- `HeadwaysAggregateWrapper` / `HeadwaysSingleWrapper` — Container components for aggregate vs. single-day views
- `HeadwaysAggregateChart` / `HeadwaysSingleChart` — Line charts
- `HeadwaysHistogram` — Distribution histogram

---

## Dwells

**Directory**: `modules/dwells/`

**Key Components**:

- `DwellsAggregateWrapper` / `DwellsSingleWrapper` — Container components
- `DwellsAggregateChart` / `DwellsSingleChart` — Charts

---

## Travel Times

**Directory**: `modules/traveltimes/`

**Key Components**:

- `TravelTimesAggregateWrapper` / `TravelTimesSingleWrapper` — Container components
- `TravelTimesAggregateChart` / `TravelTimesSingleChart` — Charts

---

## Speed

**Directory**: `modules/speed/`

**Key Components**:

- `SpeedDetails` — Main speed analysis page
- `SpeedWidget` — Dashboard widget showing speed restrictions
- `SpeedDetailsWrapper` / `SpeedGraphWrapper` — Container components
- `SpeedGraph` — Speed over time
- `SpeedBetweenStationsSingleChart` / `SpeedBetweenStationsAggregateChart` — Station-pair speed charts

---

## Predictions

**Directory**: `modules/predictions/`

**Key Components**:

- `PredictionsDetails` — Prediction timing accuracy page
- `PredictionsGraph` — Time series of prediction accuracy
- `PredictionsBinsGraph` — Histogram of prediction accuracy bins

---

## Slow Zones

**Directory**: `modules/slowzones/`

**Key Components**:

- `SlowZonesDetails` — Line-level slow zone page
- `SystemSlowZonesDetails` — System-wide slow zones
- `SlowZonesWidget` — Dashboard widget
- `TotalSlowTimeWrapper` / `SlowZonesSegmentsWrapper` — Container components
- `TotalSlowTime` — Total slow time chart
- `LineSegments` — Segment-level chart
- `SlowZonesMap` / `SlowZonesTooltip` / `SlowSegmentLabel` / `DirectionIndicator` — Map visualization

---

## Service and Ridership Dashboard

**Directory**: `modules/serviceAndRidership/`

System-wide dashboard combining service and ridership data across all lines.

**Key Components**:

- `ServiceAndRidershipDash` — Main dashboard
- `ServiceAndRidershipProvider` — Context provider for shared data
- `LineGrid` / `LineCard` — Grid of per-line summary cards
- `CardFrame` — Card container
- `ServiceRidershipChart` / `TphChart` — Charts (TPH = trains per hour)

---

## Trip Explorer

**Directory**: `modules/tripexplorer/`

Trip data exploration utilities used by the single-day and multi-day trip pages.
