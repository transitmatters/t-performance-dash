import classNames from 'classnames';
import React from 'react';
import { stations } from '../../common/constants/stations';
import type { Line, LineShort } from '../../common/types/lines';
import BetweenArrow from '../../public/Icons/BetweenArrow.svg';
import ShuttleIcon from '../../public/Icons/ShuttleIcon.svg';
import { lightLineBorder } from './styles/AlertStyles';

interface ShuttleAlertProps {
  stops: number[];
  lineShort: LineShort;
  line?: Line;
}
export const ShuttleAlert: React.FC<ShuttleAlertProps> = ({ stops, lineShort, line }) => {
  const getStop = (stopId: number) => {
    // Bus can not be shuttled
    if (lineShort === 'Bus') {
      return null;
    }
    const stop = stations[lineShort].stations.find(
      (station) =>
        station.stops[0].includes(stopId.toString()) || station.stops[1].includes(stopId.toString())
    );
    // Convert JFK/UMass (Asmont) and JFK/UMass (Braintree) to just JFK/UMass
    if (stop && stop.station === 'place-jfk') {
      return 'JFK/UMass';
    } else {
      return stop?.stop_name;
    }
  };
  const min = Math.min(...stops);
  const max = Math.max(...stops);

  return (
    <div
      className={classNames(
        'flex w-full flex-row items-center rounded-xl py-1 px-4 shadow-simple',
        lightLineBorder[line ?? 'DEFAULT']
      )}
    >
      <ShuttleIcon className="mr-2 h-6 w-6" />
      <div className="flex flex-row flex-wrap items-center">
        <p className="mr-1">Shuttling</p>
        <p className="text-center font-bold">{getStop(min)}</p>
        <BetweenArrow className="mx-2 h-4 w-4" />
        <p className="text-center font-bold">{getStop(max)}</p>
      </div>
    </div>
  );
};
