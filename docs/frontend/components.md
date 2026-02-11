# Shared Components

All shared components live in `common/components/` and are organized by category.

## Charts

### `TimeSeriesChart/`

The primary charting component, wrapping Chart.js with a standardized API.

**Location**: `common/components/charts/TimeSeriesChart/`

| File | Purpose |
|------|---------|
| `TimeSeriesChart.tsx` | Main component — configurable datasets, benchmarks, blocks, annotations |
| `types.ts` | Type definitions: `DataPoint`, `Dataset`, `Benchmark`, `Block` |
| `helpers.ts` | Label generation, style merging, granularity calculation |
| `defaults.ts` | Default chart configurations |

**Key props**:

- `data` — Array of `Dataset` objects
- `benchmarks` — Optional reference lines
- `blocks` — Optional highlighted regions
- `annotations` — Optional text annotations

### Other Chart Components

| Component | Location | Description |
|-----------|----------|-------------|
| `SingleDayLineChart` | `charts/` | Single-day line chart variant |
| `AggregateLineChart` | `charts/` | Multi-day aggregate chart |
| `ByHourHistogram/` | `charts/ByHourHistogram/` | Hourly distribution histogram |
| `AggregateChartWrapper` | `charts/` | Wrapper for aggregate views |
| `SingleChartWrapper` | `charts/` | Wrapper for single-day views |
| `CarouselGraphDiv` | `charts/` | Carousel for multiple charts |
| `ChartPageDiv` | `charts/` | Page-level chart layout |
| `ChartDiv` | `charts/` | Individual chart frame |
| `ChartBorder` | `charts/` | Chart border styling |
| `Title` | `charts/` | Chart title |
| `Legend` | `charts/` | Chart legend |

---

## Widgets

### `Widget`

The core widget wrapper component with built-in loading/error state management.

**Location**: `common/components/widgets/Widget.tsx`

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| `title` | `ReactNode` | Widget title |
| `subtitle` | `ReactNode` (optional) | Widget subtitle |
| `ready` | `ReadyDependency \| ReadyDependency[]` (optional) | Data dependencies to track |
| `children` | `ReactNode` | Widget content |

**Behavior**:

- Accepts React Query results or truthy values as `ready` dependencies
- Shows `ChartPlaceHolder` in loading/error states
- Wraps children in `ErrorBoundary` for runtime error recovery

### Widget Subcomponents

| Component | Description |
|-----------|-------------|
| `WidgetDiv` | Styled container with padding and border |
| `WidgetTitle` | Title bar with optional subtitle |
| `WidgetPage` | Page-level widget collection |
| `BasicDataWidgetItem` | Single metric display |
| `BasicDataWidgetPair` | Two metrics side-by-side |
| `MiniWidgetCreator` | Factory for compact widgets |
| `StationSelectorWidget` | Station selection input widget |

### Delta Components (`widgets/internal/`)

| Component | Description |
|-----------|-------------|
| `Delta` | Change indicator (up/down arrow with value) |
| `SmallDelta` | Compact delta display |
| `BigDelta` | Large delta display |
| `SmallData` | Compact data display |
| `CompWidget` | Comparison widget |
| `BasicWidgetDataLayout` | Layout utility |
| `WidgetText` / `UnitText` | Text formatting |

---

## Inputs

### Date Selection

**Location**: `common/components/inputs/DateSelection/`

| Component | Description |
|-----------|-------------|
| `DateSelection` | Main date picker with range support |
| `DatePickers` | Individual start/end date inputs |
| `DatePickerPresets` | Quick preset buttons (7 days, 30 days, etc.) |
| `RangeButton` | Preset range button |
| `RangeSelectionTab` | Tab-based range selection |
| `OverviewDateSelection` | Date selection for overview pages |

### Other Inputs

| Component | Location | Description |
|-----------|----------|-------------|
| `Button` | `inputs/Button.tsx` | Standard button component |
| `ToggleSwitch` | `inputs/ToggleSwitch.tsx` | Toggle switch |
| `BranchSelector` | `inputs/BranchSelector.tsx` | Green Line branch selector |
| `StationSelector` | `inputs/StationSelector.tsx` | Station dropdown selector |

---

## Controls

| Component | Description |
|-----------|-------------|
| `ControlPanel` | Desktop control panel (dates, stations) |
| `MobileControlPanel` | Mobile control panel |
| `DateControl` | Date selection control wrapper |

---

## Navigation

**Location**: `common/components/nav/`

| Component | Description |
|-----------|-------------|
| `SubwaySection` / `SubwayDropdown` | Subway line navigation |
| `BusSection` / `BusDropdown` / `BusRouteSelection` | Bus route navigation |
| `CommuterRailSection` / `CommuterRailDropdown` / `CommuterRailRouteSelection` | Commuter rail navigation |
| `TheRideSection` / `TheRideDropdown` | The RIDE navigation |
| `FerrySection` / `FerryDropdown` / `FerryRouteSelection` | Ferry navigation |
| `MenuDropdown` | Generic dropdown menu |

---

## Notices

Contextual information and warning banners.

| Component | Description |
|-----------|-------------|
| `BetaDataNotice` | Beta data warning banner |
| `BetaSlowZoneDataNotice` | Slow zone beta warning |
| `BusDataNotice` | Bus-specific data notice |
| `CommuterRailDataNotice` | Commuter rail notice |
| `ErrorNotice` | Error message display |
| `NoDataNotice` | No data available message |
| `GobbleDataNotice` | Data aggregation notice |
| `SameDayNotice` | Same-day data limitation notice |
| `TerminusNotice` | Terminus station notice |
| `BnrdBanner` | General notice banner |
| `PokeySchleppieAwardBanner` | Special recognition banner |

---

## Graphics

| Component | Description |
|-----------|-------------|
| `LoadingSpinner` | Animated loading indicator |
| `NoDataPlaceholder` | Empty state placeholder |
| `ChartPlaceHolder` | Chart loading/error skeleton |

---

## Buttons

| Component | Description |
|-----------|-------------|
| `DonateButton` | TransitMatters donation link |
| `DownloadButton` | CSV/data export button |

---

## Other

| Component | Description |
|-----------|-------------|
| `Accordion` | Collapsible content sections |
| `StarBorder` | Decorative animated border |
| `AlertNotice` | Alert display notice |
| `PastAlertModal` | Modal for historical alert details |
| `DataPair` | Two-column data display |
| `Divider` | Visual divider |
| `InfoTooltip` | Tooltip with info icon |
| `ButtonGroup` | Group of related buttons |
| `WidgetCarousel` | Carousel widget container |
