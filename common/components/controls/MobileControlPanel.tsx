import React from 'react';
import type { BusRoute, Line } from '../../types/lines';
import type { Section } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface MobileControlPanelProps {
  section: Section;
  line: Line;
  busRoute: BusRoute | undefined;
  queryType?: QueryTypeOptions;
}

export const MobileControlPanel: React.FC<MobileControlPanelProps> = ({
  section,
  line,
  busRoute,
  queryType,
}) => {
  const getControls = () => {
    if (section === 'trips' && queryType) {
      return (
        <>
          <div className="p-1 pb-0">
            <DateControl section={section} queryType={queryType} />
          </div>
          <div className="flex flex-row items-center justify-center bg-tm-grey">
            <StationSelectorWidget line={line} busRoute={busRoute} />
          </div>
        </>
      );
    }
    if (section === 'line' || section === 'overview') {
      return (
        <div className="p-1">
          <DateControl section={section} queryType={'range'} />
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
