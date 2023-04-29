import React from 'react';
import classNames from 'classnames';
import { lineColorBorder } from '../../styles/general';
import type { BusRoute, Line } from '../../types/lines';
import type { Section } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';
import { RangeControl } from './RangeControl';

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
          <RangeControl />
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
        'shrink-1 flex w-full flex-col items-start justify-start gap-x-8 gap-y-2 overflow-hidden lg:max-w-6xl lg:flex-row',
        lineColorBorder[line ?? 'DEFAULT']
      )}
    >
      {getControls()}
    </div>
  );
};
