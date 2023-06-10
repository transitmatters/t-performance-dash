import React from 'react';
import type { BusRoute, Line } from '../../types/lines';
import type { DateStoreSection } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface MobileControlPanelProps {
  dateStoreSection: DateStoreSection;
  line?: Line;
  busRoute?: BusRoute;
  queryType?: QueryTypeOptions;
}

export const MobileControlPanel: React.FC<MobileControlPanelProps> = ({
  dateStoreSection,
  line,
  busRoute,
  queryType,
}) => {
  const getControls = () => {
    if (dateStoreSection === 'trips' && queryType && line) {
      return (
        <>
          <div className="p-1 pb-0">
            <DateControl dateStoreSection={dateStoreSection} queryType={queryType} />
          </div>
          <div className="flex flex-row items-center justify-center bg-tm-grey">
            <StationSelectorWidget line={line} busRoute={busRoute} />
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
    <div className={'pb-safe fixed bottom-0 z-20 flex w-full flex-col justify-center bg-tm-grey'}>
      {getControls()}
    </div>
  );
};
