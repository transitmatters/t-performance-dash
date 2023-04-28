import React from 'react';
import classNames from 'classnames';
import { lineColorBorder } from '../../styles/general';
import type { BusRoute, Line } from '../../types/lines';
import type { Section } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface ControlPanelProps {
  section: Section;
  line: Line;
  busRoute?: BusRoute;
  queryType?: QueryTypeOptions;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
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
          <StationSelectorWidget line={line} busRoute={busRoute} />
        </>
      );
    }
    if (section === 'line' || section === 'overview') {
      return <DateControl section={section} queryType={'range'} />;
    }
  };

  return (
    <div
      className={classNames(
        'fixed right-2 top-2 z-30 mt-0 flex flex-col items-center rounded-lg border border-opacity-50 bg-stone-100 p-2 shadow-md md:w-[16rem] md:gap-y-2 lg:w-[26rem] lg:gap-y-1',
        lineColorBorder[line ?? 'DEFAULT']
      )}
    >
      {getControls()}
    </div>
  );
};
