import React from 'react';
import type { BusRoute, Line } from '../../types/lines';
import type { DateConfigSection } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface MobileControlPanelProps {
  dateConfigSection: DateConfigSection;
  line: Line;
  busRoute: BusRoute | undefined;
  queryType?: QueryTypeOptions;
}

export const MobileControlPanel: React.FC<MobileControlPanelProps> = ({
  dateConfigSection,
  line,
  busRoute,
  queryType,
}) => {
  const getControls = () => {
    if (dateConfigSection === 'trips' && queryType) {
      return (
        <>
          <div className="p-1 pb-0">
            <DateControl dateConfigSection={dateConfigSection} queryType={queryType} />
          </div>
          <div className="flex flex-row items-center justify-center bg-tm-grey">
            <StationSelectorWidget line={line} busRoute={busRoute} />
          </div>
        </>
      );
    }
    if (dateConfigSection === 'line' || dateConfigSection === 'overview') {
      return (
        <div className="p-1">
          <DateControl dateConfigSection={dateConfigSection} queryType={'range'} />
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
