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

interface MobileControlPanelProps {
  dateStoreSection: DateStoreSection;
  busRoute: BusRoute | undefined;
  crRoute: CommuterRailRoute | undefined;
  line: Line | undefined;
  ferryRoute: FerryRoute | undefined;
}

export const MobileControlPanel: React.FC<MobileControlPanelProps> = ({
  dateStoreSection,
  line,
  busRoute,
  crRoute,
  ferryRoute,
}) => {
  const singleDate = dateStoreSection === 'singleTrips';
  // Bus yellow and the other light line colors can't carry white text.
  const needsDarkText = readableOn(LINE_COLORS[line ?? 'default']) === 'dark';
  const getControls = () => {
    if (line && (dateStoreSection === 'singleTrips' || dateStoreSection === 'multiTrips')) {
      return (
        <>
          <div className="flex flex-row items-center gap-x-2 p-1 pb-0">
            <RouteSelector />
            <DateControl
              dateStoreSection={dateStoreSection}
              queryType={singleDate ? 'single' : 'range'}
            />
          </div>
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
