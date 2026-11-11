import type { BusRoute, CommuterRailRoute, Line, FerryRoute } from '../../types/lines';
import type { DateStoreSection } from '../../constants/pages';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';
import { DisplayMenu } from './DisplayMenu';
import { PageFilters } from './PageFilters';
import { RouteSelector } from './RouteSelector';
import { TripModeToggle } from './TripModeToggle';

export interface ControlPanelProps {
  dateStoreSection: DateStoreSection;
  busRoute: BusRoute | undefined;
  crRoute: CommuterRailRoute | undefined;
  line: Line | undefined;
  ferryRoute: FerryRoute | undefined;
  hasStationStore?: boolean;
  hasRouteSelector?: boolean;
}

const isTripsSection = (dateStoreSection: DateStoreSection) =>
  dateStoreSection === 'singleTrips' || dateStoreSection === 'multiTrips';

export const pageHasControls = (dateStoreSection: DateStoreSection) =>
  isTripsSection(dateStoreSection) ||
  dateStoreSection === 'line' ||
  dateStoreSection === 'overview' ||
  dateStoreSection === 'system';

/** The toggle switches between the two trips pages, so pages that merely borrow the singleTrips
 * section for date storage (like the bus speed map) don't show it. */
export const shouldShowTripControls = (
  dateStoreSection: DateStoreSection,
  line: Line | undefined,
  hasStationStore: boolean | undefined
) => isTripsSection(dateStoreSection) && Boolean(line) && Boolean(hasStationStore);

/** Line pages and System pages have a date control. */
export const shouldShowDateControl = (dateStoreSection: DateStoreSection, line: Line | undefined) =>
  Boolean(line) || dateStoreSection === 'system';

/** Events mark dates on a range; a single day has none to mark. */
export const shouldShowDisplayMenu = (dateStoreSection: DateStoreSection) =>
  dateStoreSection !== 'singleTrips';

export const queryTypeFor = (dateStoreSection: DateStoreSection) =>
  dateStoreSection === 'singleTrips' ? 'single' : 'range';

/** What the page is about, on the line-colored band: the route and the stops. */
export const BandControls = ({
  dateStoreSection,
  line,
  busRoute,
  crRoute,
  ferryRoute,
  hasStationStore,
  hasRouteSelector = true,
}: ControlPanelProps) => {
  if (!pageHasControls(dateStoreSection)) return null;
  return (
    <div className="flex min-w-0 flex-row flex-wrap items-center justify-end gap-2">
      {hasRouteSelector && <RouteSelector />}
      {shouldShowTripControls(dateStoreSection, line, hasStationStore) && line && (
        <StationSelectorWidget
          line={line}
          busRoute={busRoute}
          crRoute={crRoute}
          ferryRoute={ferryRoute}
        />
      )}
    </div>
  );
};

/** When and how, on the neutral bar: dates, page-wide filters, and display options. */
export const BarControls = ({
  dateStoreSection,
  line,
  hasStationStore,
}: Pick<ControlPanelProps, 'dateStoreSection' | 'line' | 'hasStationStore'>) => {
  if (!pageHasControls(dateStoreSection)) return null;
  return (
    <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 border-b border-stone-200 bg-white px-5 py-2 text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
      {shouldShowTripControls(dateStoreSection, line, hasStationStore) && <TripModeToggle />}
      {shouldShowDateControl(dateStoreSection, line) && (
        <DateControl
          dateStoreSection={dateStoreSection}
          queryType={queryTypeFor(dateStoreSection)}
        />
      )}
      {/* Filters and Display wrap as one, so Display is never left alone on a second row. */}
      <div className="flex min-w-fit flex-1 flex-row items-center gap-x-3">
        <div className="flex flex-row flex-wrap items-center gap-x-5 gap-y-2 empty:hidden">
          <PageFilters />
        </div>
        {shouldShowDisplayMenu(dateStoreSection) && (
          <div className="ml-auto">
            <DisplayMenu />
          </div>
        )}
      </div>
    </div>
  );
};
