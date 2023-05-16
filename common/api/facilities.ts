import { stations } from '../constants/stations';
import type { FacilitiesResponse } from '../types/facilities';
import type { LineShort } from '../types/lines';
import { APP_DATA_BASE_PATH } from '../utils/constants';
import type { Station } from '../types/stations';
import { isLineMap } from '../types/stations';

export const fetchAllElevatorsAndEscalators = async (
  line: LineShort
): Promise<FacilitiesResponse> => {
  const url = new URL(`${APP_DATA_BASE_PATH}/api/facilities`, window.location.origin);

  const lineStations = stations[line].stations;
  let stationKeys = [] as string[];
  if (isLineMap(lineStations)) {
    stationKeys = lineStations.stations.map((station: Station) => station.station);
  } else {
    stationKeys = lineStations.map((station: Station) => station.station);
  }

  const options = { type: 'ESCALATOR,ELEVATOR', stop: stationKeys.join(',') };

  Object.entries(options).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch elevators and escalators');
  }
  return await response.json();
};
