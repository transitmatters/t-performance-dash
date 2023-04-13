import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import type { Station } from '../../types/stations';
import { Button } from '../inputs/Button';
import { StationSelector } from '../inputs/StationSelector';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useUpdateQuery } from '../../utils/router';
import { stopIdsForStations } from '../../utils/stations';

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
  const updateQueryParams = useUpdateQuery();

  const swapStations = () => {
    const tempFromStation = fromStation;
    const tempToStation = toStation;

    setFromStation(tempToStation);
    setToStation(tempFromStation);
  };

  const { fromStopIds, toStopIds } = stopIdsForStations(fromStation, toStation);
  React.useEffect(() => {
    // Update from
    updateQueryParams({ from: fromStopIds?.[0], to: toStopIds?.[0] });
  }, [fromStation, fromStopIds, toStation, toStopIds, updateQueryParams]);

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
