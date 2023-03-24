import { stations } from '../../../common/constants/stations';
import type { BusRoute, LineShort } from '../../../common/types/lines';
import type { Station } from '../../../common/types/stations';

export const getEndStations = (stations: Station[]) => {
  let min = stations[0];
  let max = stations[0];

  stations.forEach((station) => {
    if (station.order < min.order) {
      min = station;
    }
    if (station.order > max.order) {
      max = station;
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
