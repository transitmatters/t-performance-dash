import React from 'react';
import classNames from 'classnames';
import { lineColorBorder } from '../../styles/general';
import type { BusRoute, Line } from '../../types/lines';
import type { DateConfigOptions } from '../../constants/pages';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface ControlPanelProps {
  section: DateConfigOptions;
  line?: Line;
  busRoute?: BusRoute;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ section, line, busRoute }) => {
  const getControls = () => {
    if ((section === 'singleTrips' || section === 'multiTrips') && line) {
      return (
        <>
          <DateControl
            section={section}
            queryType={section === 'singleTrips' ? 'single' : 'range'}
          />
          <StationSelectorWidget line={line} busRoute={busRoute} />
        </>
      );
    }
    if (section === 'line' || section === 'overview' || section === 'system') {
      return <DateControl section={section} queryType={'range'} />;
    }
  };

  return (
    <div
      className={classNames(
        'shrink-1 flex w-full flex-col items-end justify-end gap-x-8 gap-y-2 overflow-hidden p-3 pl-0 text-stone-900 lg:max-w-2xl',
        lineColorBorder[line ?? 'DEFAULT']
      )}
    >
      {getControls()}
    </div>
  );
};
