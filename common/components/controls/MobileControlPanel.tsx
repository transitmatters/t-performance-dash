import React from 'react';
import type { BusRoute, Line } from '../../types/lines';
import type { DateStoreSection } from '../../constants/pages';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface MobileControlPanelProps {
  dateStoreSection: DateStoreSection;
  line: Line;
  busRoute: BusRoute | undefined;
}

export const MobileControlPanel: React.FC<MobileControlPanelProps> = ({
  dateStoreSection,
  line,
  busRoute,
}) => {
  const singleDate = dateStoreSection === 'singleTrips';
  const getControls = () => {
    if (dateStoreSection === 'singleTrips' || dateStoreSection === 'multiTrips') {
      return (
        <>
          <div className="p-1 pb-0">
            <DateControl
              dateStoreSection={dateStoreSection}
              queryType={singleDate ? 'single' : 'range'}
            />
          </div>
          <div className="flex flex-row items-center justify-center bg-tm-grey">
            <StationSelectorWidget line={line} busRoute={busRoute} />
          </div>
        </>
      );
    }
    if (dateStoreSection === 'line' || dateStoreSection === 'overview') {
      return (
        <div className="p-1">
          <DateControl dateStoreSection={dateStoreSection} queryType={'range'} />
        </div>
      );
    }
  };

  return (
    <div className={'pb-safe fixed bottom-0 z-20 flex w-full flex-col justify-center bg-tm-grey'}>
      {getControls()}
    </div>
  );
};
