import { stations } from '../constants/stations';
import type { LineShort } from '../types/lines';
import { APP_DATA_BASE_PATH } from '../utils/constants';

export const fetchAllElevatorsAndEscalators = async (line: LineShort): Promise<unknown> => {
  const url = new URL(`${APP_DATA_BASE_PATH}/api/facilities`, window.location.origin);

  const lineStations = stations[line].stations.map((station) => station.station);

  const options = { type: 'ESCALATOR,ELEVATOR', stop: lineStations.join(',') };

  Object.entries(options).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch elevators and escalators');
  }
  return await response.json();
};
