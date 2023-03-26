import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import type { Station } from '../../types/stations';
import { Button } from '../inputs/Button';
import { StationSelector } from '../inputs/StationSelector';
import { useBreakpoint } from '../../hooks/useBreakpoint';

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
  const isMobile = !useBreakpoint('sm');

  const swapStations = () => {
    const tempFromStation = fromStation;
    const tempToStation = toStation;

    setFromStation(tempToStation);
    setToStation(tempFromStation);
  };

  return (
    <div
      className={classNames(
        isMobile ? 'flex-col items-end' : 'flex-row',
        'flex gap-1 rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox'
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
      <Button onClick={swapStations}>
        {' '}
        {'Swap'}&nbsp;
        <FontAwesomeIcon icon={faRightLeft} />
      </Button>
    </div>
  );
};
