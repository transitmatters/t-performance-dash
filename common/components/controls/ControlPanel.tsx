import React from 'react';
import classNames from 'classnames';
import { lineColorBorder } from '../../styles/general';
import type { BusRoute, Line } from '../../types/lines';
import type { DateConfigSection } from '../../constants/pages';
import type { QueryTypeOptions } from '../../types/router';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface ControlPanelProps {
  dateConfigSection: DateConfigSection;
  line?: Line;
  busRoute?: BusRoute;
  queryType?: QueryTypeOptions;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  dateConfigSection,
  line,
  busRoute,
  queryType,
}) => {
  const getControls = () => {
    if (dateConfigSection === 'trips' && line && queryType) {
      return (
        <>
          <DateControl dateConfigSection={dateConfigSection} queryType={queryType} />
          <StationSelectorWidget line={line} busRoute={busRoute} />
        </>
      );
    }
    if (
      dateConfigSection === 'line' ||
      dateConfigSection === 'overview' ||
      dateConfigSection === 'system'
    ) {
      return <DateControl dateConfigSection={dateConfigSection} queryType={'range'} />;
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
