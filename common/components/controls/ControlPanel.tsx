import { usePageControls } from '../../hooks/usePageControls';
import { DateSelection } from '../inputs/DateSelection/DateSelection';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DisplayMenu } from './DisplayMenu';
import { PageFilters } from './PageFilters';
import { RouteSelector } from './RouteSelector';
import { TripModeToggle } from './TripModeToggle';

/** What the page is about, on the line-colored band: the route and the stops. */
export const BandControls = () => {
  const { line, busRoute, crRoute, ferryRoute, showRouteSelector, showTripControls } =
    usePageControls();
  return (
    <div className="flex min-w-0 flex-row flex-wrap items-center justify-end gap-2">
      {showRouteSelector && <RouteSelector />}
      {showTripControls && line && (
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
export const BarControls = () => {
  const { queryType, showTripControls, showDateControl, showDisplayMenu } = usePageControls();
  return (
    <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 border-b border-stone-200 bg-white px-5 py-2 text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
      {showTripControls && <TripModeToggle />}
      {showDateControl && <DateSelection type={queryType} />}
      {/* Filters and Display wrap as one, so Display is never left alone on a second row. */}
      <div className="flex min-w-fit flex-1 flex-row items-center gap-x-3">
        <div className="flex flex-row flex-wrap items-center gap-x-5 gap-y-2 empty:hidden">
          <PageFilters />
        </div>
        {showDisplayMenu && (
          <div className="ml-auto">
            <DisplayMenu />
          </div>
        )}
      </div>
    </div>
  );
};
