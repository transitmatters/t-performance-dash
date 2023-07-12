import dayjs from 'dayjs';
import { stations } from '../../../common/constants/stations';
import type { BusRoute, LineShort } from '../../../common/types/lines';
import type { Station } from '../../../common/types/stations';

export const getEndStations = (stations: (Station | undefined)[]) => {
  let min = stations[0];
  let max = stations[0];

  stations.forEach((station) => {
    if (station) {
      if (station?.station === 'place-jfk') station.stop_name = 'JFK/UMass'; // Sub out branch names of JFK
      if (min && station?.order < min.order) {
        min = station;
      }
      if (max && station?.order > max.order) {
        max = station;
      }
    }
  });
  return { min, max };
};

export const getStations = (stops: string[], routeOrLine: LineShort | BusRoute) => {
  const station = stations[routeOrLine] ?? stations['Bus'][routeOrLine];

  const stop_objects = stops.map((stop) => {
    return station.stations.find((station: { station: string }) => station.station === stop);
  });

  return getEndStations(stop_objects);
};

export const getDateString = (validFrom: string, validTo: string) => {
  const validFromDay = dayjs(validFrom);
  const validToDay = dayjs(validTo);
  if (validToDay.diff(validFromDay, 'hour') > 24) {
    return 'All day ';
  }
  return `${validFromDay.format('h:mm a')} - ${validToDay.format('h:mm a')} `;
};
