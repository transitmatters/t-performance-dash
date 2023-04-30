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
          <DateControl section={section} queryType={queryType} />
          <div className="flex flex-row items-center justify-center border border-t-0 bg-white">
            <StationSelectorWidget line={line} busRoute={busRoute} />
          </div>
        </>
      );
    }
    if (section === 'line' || section === 'overview') {
      return <DateControl section={section} queryType={'range'} />;
    }
  };

  return (
    <div className={'pb-safe fixed bottom-0 z-20 flex w-full flex-col justify-center bg-tm-grey'}>
      {getControls()}
    </div>
  );
};
