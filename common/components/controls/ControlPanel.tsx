import React from 'react';
import type { BusRoute, CommuterRailRoute, Line, FerryRoute } from '../../types/lines';
import type { DateStoreSection } from '../../constants/pages';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';
import { RouteSelector } from './RouteSelector';
import { TripModeToggle } from './TripModeToggle';

interface ControlPanelProps {
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

const hasDateControl = (dateStoreSection: DateStoreSection) =>
  isTripsSection(dateStoreSection) ||
  dateStoreSection === 'line' ||
  dateStoreSection === 'overview' ||
  dateStoreSection === 'system';

/** Route and date: the controls that sit on the title row. */
export const PrimaryControls: React.FC<ControlPanelProps> = ({
  dateStoreSection,
  line,
  hasStationStore,
  hasRouteSelector = true,
}) => {
  if (!hasDateControl(dateStoreSection)) return null;
  const queryType = dateStoreSection === 'singleTrips' ? 'single' : 'range';
  return (
    <div className="flex shrink-0 flex-row flex-wrap items-center gap-x-2 gap-y-2 overflow-visible">
      {hasRouteSelector && <RouteSelector />}
      {/* The toggle switches between the two trips pages, so pages that merely borrow the
          singleTrips section for date storage (like the bus speed map) shouldn't show it. */}
      {isTripsSection(dateStoreSection) && hasStationStore && <TripModeToggle />}
      {line || dateStoreSection === 'system' ? (
        <DateControl dateStoreSection={dateStoreSection} queryType={queryType} />
      ) : null}
    </div>
  );
};

/** Origin and destination: their own row, since station names run long. */
export const StationControls: React.FC<ControlPanelProps> = ({
  dateStoreSection,
  line,
  busRoute,
  crRoute,
  ferryRoute,
  hasStationStore,
}) => {
  // Pages can share the single-date section without being about a pair of stops — the bus
  // speed map covers the whole network — so the picker follows the page's own hasStationStore
  // rather than the section it stores dates under.
  if (!isTripsSection(dateStoreSection) || !line || !hasStationStore) return null;
  return (
    <div className="flex w-full flex-row items-center overflow-visible">
      <StationSelectorWidget
        line={line}
        busRoute={busRoute}
        crRoute={crRoute}
        ferryRoute={ferryRoute}
      />
    </div>
  );
};

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  return (
    <div className="flex w-full shrink flex-col items-end justify-end gap-y-2 overflow-visible p-3 pl-0 text-stone-900 lg:max-w-2xl">
      <PrimaryControls {...props} />
      <StationControls {...props} />
    </div>
  );
};
