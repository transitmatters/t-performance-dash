import { stations } from '../../../common/constants/stations';
import type { BusRoute, LineShort } from '../../../common/types/lines';

export const getStop = (stopId: number, routeOrLine: LineShort | BusRoute) => {
  // TODO: Bus stops in alerts don't match values in stations.json.
  const station = stations[routeOrLine] ?? stations['Bus'][routeOrLine];

  const stop = station.stations.find(
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
