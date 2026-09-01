import React from 'react';
import type { BusRoute, CommuterRailRoute, Line, FerryRoute } from '../../types/lines';
import type { DateStoreSection } from '../../constants/pages';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';
import { RouteSelector } from './RouteSelector';

interface ControlPanelProps {
  dateStoreSection: DateStoreSection;
  busRoute: BusRoute | undefined;
  crRoute: CommuterRailRoute | undefined;
  line: Line | undefined;
  ferryRoute: FerryRoute | undefined;
}

const isTripsSection = (dateStoreSection: DateStoreSection) =>
  dateStoreSection === 'singleTrips' || dateStoreSection === 'multiTrips';

const hasDateControl = (dateStoreSection: DateStoreSection) =>
  isTripsSection(dateStoreSection) ||
  dateStoreSection === 'line' ||
  dateStoreSection === 'overview' ||
  dateStoreSection === 'system';

/** Route and date: the controls that sit on the title row. */
export const PrimaryControls: React.FC<ControlPanelProps> = ({ dateStoreSection, line }) => {
  if (!hasDateControl(dateStoreSection)) return null;
  const queryType = dateStoreSection === 'singleTrips' ? 'single' : 'range';
  return (
    <div className="flex shrink-0 flex-row items-center gap-x-2 overflow-visible">
      <RouteSelector />
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
}) => {
  if (!isTripsSection(dateStoreSection) || !line) return null;
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
