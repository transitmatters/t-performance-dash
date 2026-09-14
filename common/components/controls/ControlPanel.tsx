import React from 'react';
import classNames from 'classnames';
import { lineColorBorder } from '../../styles/general';
import type { BusRoute, CommuterRailRoute, Line, FerryRoute } from '../../types/lines';
import type { DateStoreSection } from '../../constants/pages';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface ControlPanelProps {
  dateStoreSection: DateStoreSection;
  busRoute: BusRoute | undefined;
  crRoute: CommuterRailRoute | undefined;
  line: Line | undefined;
  ferryRoute: FerryRoute | undefined;
  hasStationStore?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  dateStoreSection,
  line,
  busRoute,
  crRoute,
  ferryRoute,
  hasStationStore,
}) => {
  const getControls = () => {
    if ((dateStoreSection === 'singleTrips' || dateStoreSection === 'multiTrips') && line) {
      return (
        <>
          <DateControl
            dateStoreSection={dateStoreSection}
            queryType={dateStoreSection === 'singleTrips' ? 'single' : 'range'}
          />
          {/* Pages can share the single-date section without being about a pair of stops —
              the bus speed map covers the whole network — so the picker follows the page's
              own hasStationStore rather than the section it stores dates under. */}
          {hasStationStore && (
            <StationSelectorWidget
              line={line}
              busRoute={busRoute}
              crRoute={crRoute}
              ferryRoute={ferryRoute}
            />
          )}
        </>
      );
    }
    if (
      dateStoreSection === 'line' ||
      dateStoreSection === 'overview' ||
      dateStoreSection === 'system'
    ) {
      return <DateControl dateStoreSection={dateStoreSection} queryType={'range'} />;
    }
  };

  return (
    <div
      className={classNames(
        'shrink-1 flex w-full flex-col items-end justify-end gap-x-8 gap-y-2 overflow-visible p-3 pl-0 text-stone-900 lg:max-w-2xl',
        lineColorBorder[line ?? 'DEFAULT']
      )}
    >
      {getControls()}
    </div>
  );
};
