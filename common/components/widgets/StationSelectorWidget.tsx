import classNames from 'classnames';
import React from 'react';
import type { Station } from '../../types/stations';
import { StationSelector } from '../inputs/StationSelector';

interface StationSelectorWidgetProps {
  fromStation: Station;
  toStation: Station;
  setFromStation: (fromStation: Station) => void;
  setToStation: (toStation: Station) => void;
}

export const StationSelectorWidget: React.FC<StationSelectorWidgetProps> = ({
  fromStation,
  setFromStation,
  toStation,
  setToStation,
}) => {
  return (
    <div
      className={classNames(
        'w-1/2 rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox sm:w-auto sm:p-4'
      )}
    >
      <StationSelector
        type={'from'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={setFromStation}
      />
      <StationSelector
        type={'to'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={setToStation}
      />
    </div>
  );
};
