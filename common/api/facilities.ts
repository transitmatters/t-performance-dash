import type { FacilitiesResponse } from '../types/facilities';
import type { LineShort } from '../types/lines';
import { getStationKeysFromStations } from '../utils/stations';
import { apiFetch } from './utils/fetch';

export const fetchAllElevatorsAndEscalators = async (
  line: LineShort
): Promise<FacilitiesResponse> => {
  const stationKeys = getStationKeysFromStations(line);
  const options = { type: 'ESCALATOR,ELEVATOR', stop: stationKeys.join(',') };

  return await apiFetch({
    path: '/api/facilities',
    options,
    errorMessage: 'Failed to fetch elevators and escalators',
  });
};
