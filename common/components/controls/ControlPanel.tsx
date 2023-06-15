import React from 'react';
import classNames from 'classnames';
import { lineColorBorder } from '../../styles/general';
import type { BusRoute, Line } from '../../types/lines';
import type { DateStoreSection } from '../../constants/pages';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';
import { DateControl } from './DateControl';

interface ControlPanelProps {
  dateStoreSection: DateStoreSection;
  busRoute: BusRoute | undefined;
  line: Line | undefined;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ dateStoreSection, line, busRoute }) => {
  const getControls = () => {
    if ((dateStoreSection === 'singleTrips' || dateStoreSection === 'multiTrips') && line) {
      return (
        <>
          <DateControl
            dateStoreSection={dateStoreSection}
            queryType={dateStoreSection === 'singleTrips' ? 'single' : 'range'}
          />
          <StationSelectorWidget line={line} busRoute={busRoute} />
        </>
      );
    }
    if (
      dateStoreSection === 'line' ||
      dateStoreSection === 'overview' ||
      dateStoreSection === 'system'
    ) {
      return <DateControl dateStoreSection={dateStoreSection} queryType={'range'} />;
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
