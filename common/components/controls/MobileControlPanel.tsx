import React from 'react';
import classNames from 'classnames';
import type { BusRoute, CommuterRailRoute, Line, FerryRoute } from '../../types/lines';
import type { DateStoreSection } from '../../constants/pages';
import { LINE_COLORS } from '../../constants/colors';
import { lineColorBackground } from '../../styles/general';
import { readableOn } from '../../utils/general';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';
import { RouteSelector } from './RouteSelector';
import { TripModeToggle } from './TripModeToggle';

interface MobileControlPanelProps {
  dateStoreSection: DateStoreSection;
  busRoute: BusRoute | undefined;
  crRoute: CommuterRailRoute | undefined;
  line: Line | undefined;
  ferryRoute: FerryRoute | undefined;
  hasStationStore?: boolean;
}

export const MobileControlPanel: React.FC<MobileControlPanelProps> = ({
  dateStoreSection,
  line,
  busRoute,
  crRoute,
  ferryRoute,
  hasStationStore,
}) => {
  const singleDate = dateStoreSection === 'singleTrips';
  // Bus yellow and the other light line colors can't carry white text.
  const needsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';
  const getControls = () => {
    if (line && (dateStoreSection === 'singleTrips' || dateStoreSection === 'multiTrips')) {
      return (
        <>
          <div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-2 p-1 pb-0">
            <RouteSelector />
            {/* See ControlPanel: pages that merely borrow the singleTrips section for date
                storage (like the bus speed map) aren't part of the single/multi trips flow. */}
            {hasStationStore && <TripModeToggle />}
            <DateControl
              dateStoreSection={dateStoreSection}
              queryType={singleDate ? 'single' : 'range'}
            />
          </div>
          {/* See ControlPanel: a single-date page isn't necessarily a stop-to-stop page. */}
          {hasStationStore && (
            <div
              className={classNames(
                'flex flex-row items-center justify-center',
                lineColorBackground[line ?? 'DEFAULT']
              )}
            >
              <StationSelectorWidget
                line={line}
                busRoute={busRoute}
                crRoute={crRoute}
                ferryRoute={ferryRoute}
              />
            </div>
          )}
        </>
      );
    }
    if (
      dateStoreSection === 'line' ||
      dateStoreSection === 'overview' ||
      dateStoreSection === 'system'
    ) {
      return (
        <div className="p-1">
          <DateControl dateStoreSection={dateStoreSection} queryType={'range'} />
        </div>
      );
    }
  };

  return (
    <div
      className={classNames(
        'pb-safe fixed bottom-0 flex w-full flex-col justify-center rounded-t-sm',
        needsDarkText ? 'text-stone-900' : 'text-white',
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      {getControls()}
    </div>
  );
};
