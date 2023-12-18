import React from 'react';
import classNames from 'classnames';
import type { BusRoute, CommuterRailRoute, Line } from '../../types/lines';
import type { DateStoreSection } from '../../constants/pages';
import { lineColorBackground } from '../../styles/general';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface MobileControlPanelProps {
  dateStoreSection: DateStoreSection;
  busRoute: BusRoute | undefined;
  crRoute: CommuterRailRoute | undefined;
  line: Line | undefined;
}

export const MobileControlPanel: React.FC<MobileControlPanelProps> = ({
  dateStoreSection,
  line,
  busRoute,
  crRoute,
}) => {
  const singleDate = dateStoreSection === 'singleTrips';
  const getControls = () => {
    if (line && (dateStoreSection === 'singleTrips' || dateStoreSection === 'multiTrips')) {
      return (
        <>
          <div className="p-1 pb-0">
            <DateControl
              dateStoreSection={dateStoreSection}
              queryType={singleDate ? 'single' : 'range'}
            />
          </div>
          <div
            className={classNames(
              'flex flex-row items-center justify-center ',
              lineColorBackground[line ?? 'DEFAULT']
            )}
          >
            <StationSelectorWidget line={line} busRoute={busRoute} crRoute={crRoute} />
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
        lineColorBackground[line ?? 'DEFAULT']
      )}
    >
      {getControls()}
    </div>
  );
};
