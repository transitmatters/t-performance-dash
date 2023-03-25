import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import type { Station } from '../../types/stations';
import { Button } from '../inputs/Button';
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
  const swapStations = () => {
    const tempFromStation = fromStation;
    const tempToStation = toStation;

    setFromStation(tempToStation);
    setToStation(tempFromStation);
  };

  return (
    <div className={classNames('my-2 flex flex-col items-baseline gap-1 md:flex-row')}>
      <StationSelector
        type={'from'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={setFromStation}
      />
      <p className="text-xl">to</p>
      <StationSelector
        type={'to'}
        fromStation={fromStation}
        toStation={toStation}
        setStation={setToStation}
      />
      <Button
        content={
          <>
            {'Swap'}&nbsp;
            <FontAwesomeIcon icon={faRightLeft} />
          </>
        }
        onClick={swapStations}
      />
    </div>
  );
};
