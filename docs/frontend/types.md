# Type Definitions

Key TypeScript types are defined in `common/types/`.

## Line Type System (`types/lines.ts`)

The codebase uses a layered type system for transit lines, with each type serving a specific purpose:

### `Line`

Internal identifier used in state and logic.

```typescript
type Line =
  | 'line-red' | 'line-orange' | 'line-green' | 'line-blue'
  | 'line-mattapan' | 'line-bus' | 'line-commuter-rail'
  | 'line-ferry' | 'line-RIDE';
```

### `LineShort`

Human-readable display name.

```typescript
type LineShort =
  | 'Red' | 'Orange' | 'Green' | 'Blue' | 'Mattapan'
  | 'Bus' | 'Commuter Rail' | 'Ferry' | 'The RIDE';
```

### `LinePath`

URL path segment used in routing.

```typescript
type LinePath =
  | 'red' | 'orange' | 'green' | 'blue' | 'mattapan'
  | 'bus' | 'commuter-rail' | 'ferry' | 'the-ride';
```

### `LineRouteId`

API route identifiers, including Green Line branches.

```typescript
type LineRouteId =
  | 'Red' | 'Orange' | 'Blue'
  | 'Green-B' | 'Green-C' | 'Green-D' | 'Green-E'
  | 'Mattapan' | BusRoute | CommuterRailRoute | FerryRoute;
```

### Route Types

```typescript
type BusRoute = '1' | '4' | '7' | '8' | '9' | '10' | /* 70+ routes */ ;
type CommuterRailRoute = 'CR-Fairmount' | 'CR-Fitchburg' | /* 12 lines */ ;
type FerryRoute = 'Boat-F1' | 'Boat-F4' | 'Boat-F6' | /* etc */ ;
```

### Line Constants

```typescript
LINE_OBJECTS: Record<Line, { name: LineShort, color: string, short: string, path: LinePath }>

HEAVY_RAIL_LINES: Line[]     // Red, Orange, Blue
LANDING_RAIL_LINES: Line[]   // Heavy rail + Green + Mattapan
RAIL_LINES: Line[]           // All rail lines

BUS_ROUTES: BusRoute[]
COMMUTER_RAIL_ROUTES: CommuterRailRoute[]
FERRY_ROUTES: FerryRoute[]

RIDERSHIP_KEYS: Record<string, string>  // API ridership identifiers
```

---

## API Types (`types/api.ts`)

### Query Types

```typescript
enum QueryNameKeys {
  traveltimes = 'traveltimes',
  headways = 'headways',
  dwells = 'dwells',
}

type RouteType = 'bus' | 'subway' | 'cr' | 'ferry';
```

### Parameter Types

```typescript
enum SingleDayAPIParams { /* date, stop params */ }
enum AggregateAPIParams { /* date range, stop params */ }
```

### Request Option Types

```typescript
interface FetchSpeedsOptions { date: string; line_id: string; }
interface FetchAlertDelaysByLineOptions { start_date: string; end_date: string; line: string; agg: string; }
interface FetchScheduledServiceOptions { start_date: string; end_date: string; route_id?: string; agg: string; }
interface FetchRidershipOptions { start_date: string; end_date: string; line_id?: string; }
```

---

## Alert Types (`types/alerts.ts`)

```typescript
interface AlertsResponse {
  id: string;
  type: AlertEffect;
  active_period: AlertTime[];
  stops: string[];
  routes?: string[];
  header: string;
}

enum AlertEffect {
  DELAY, SHUTTLE, SUSPENSION, STOP_CLOSURE,
  ESCALATOR_CLOSURE, ELEVATOR_CLOSURE,
  SCHEDULE_CHANGE, SERVICE_CHANGE,
  // 30+ effects total
}

interface AlertTime {
  start: string | null;
  end: string | null;
  upcoming: boolean;
  current: boolean;
}
```

---

## Chart Types (`types/charts.ts`)

```typescript
interface DataPoint {
  timestamp: string;
  value: number;
}

interface AggregateDataResponse {
  by_date: Record<string, any>;
  by_time: Record<string, any>;
}
```

---

## Router Types (`types/router.ts`)

```typescript
interface Route {
  line?: Line;
  linePath?: LinePath;
  lineShort?: LineShort;
  page: Page;
  tab: Tab;
  query: QueryParams;
  color: string;
}

type QueryParams = Record<string, string | string[]>;
type Tab = 'Subway' | 'Bus' | 'Commuter Rail' | 'Ferry' | 'System';
```

---

## Station Types (`types/stations.ts`)

```typescript
interface Station {
  stop_name: string;
  branches: string[] | null;
  station: string;
  order: number;
  stops: Record<string, string[]>;
}
```

---

## Data Point Types (`types/dataPoints.ts`)

Domain-specific data types:

- `ServiceHours` — Service hour metrics
- `SpeedRestriction` — Speed restriction zone details
- Ridership and trip metric types
