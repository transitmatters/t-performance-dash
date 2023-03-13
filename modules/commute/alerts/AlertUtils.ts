import { stations } from '../../../common/constants/stations';
import type { LineShort } from '../../../common/types/lines';

export const getStop = (stopId: number, lineShort: LineShort) => {
  // Bus can not be shuttled. May need to update this when adding more alerts.
  if (lineShort === 'Bus') {
    return null;
  }
  // Get stop
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
