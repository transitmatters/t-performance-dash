import { usePageControls } from '../../hooks/usePageControls';
import { PeriodDateControl } from '../../../modules/busspeedmap/controls/PeriodDateControl';
import { guideAnchor } from '../../../modules/guide/anchors';
import { DateSelection } from '../inputs/DateSelection/DateSelection';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DisplayMenu } from './DisplayMenu';
import { PageFilters } from './PageFilters';
import { TripModeToggle } from './TripModeToggle';

/** The stops, on the line-colored band beside the heading. Only trip pages have them. */
export const BandControls = () => {
  const { line, busRoute, crRoute, ferryRoute } = usePageControls();
  if (!line) return null;
  return (
    <div
      className="flex min-w-0 flex-row flex-wrap items-center justify-end gap-2"
      {...guideAnchor('stations')}
    >
      <StationSelectorWidget
        line={line}
        busRoute={busRoute}
        crRoute={crRoute}
        ferryRoute={ferryRoute}
      />
    </div>
  );
};

/** When and how, on the neutral bar: dates, page-wide filters, and display options. */
export const BarControls = () => {
  const {
    queryType,
    showTripControls,
    showDateControl,
    showPeriodDate,
    showEventsOption,
    showOtherShutdownsOption,
    showSlowZonesOption,
  } = usePageControls();
  return (
    <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 border-b border-stone-200 bg-white px-5 py-2 text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100">
      {showTripControls && (
        <div {...guideAnchor('tripMode')}>
          <TripModeToggle />
        </div>
      )}
      {showDateControl && (
        <div {...guideAnchor('dates')}>
          {showPeriodDate ? <PeriodDateControl /> : <DateSelection type={queryType} />}
        </div>
      )}
      {/* Filters and Display wrap as one, so Display is never left alone on a second row. */}
      <div className="flex min-w-fit flex-1 flex-row items-center gap-x-3">
        <div className="flex flex-row flex-wrap items-center gap-x-5 gap-y-2 empty:hidden">
          <PageFilters />
        </div>
        <div className="ml-auto">
          <DisplayMenu
            withEvents={showEventsOption}
            withOtherShutdowns={showOtherShutdownsOption}
            withSlowZones={showSlowZonesOption}
          />
        </div>
      </div>
    </div>
  );
};
