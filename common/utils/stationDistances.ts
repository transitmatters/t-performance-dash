import type { Distance } from '../types/dataPoints';
import { station_distances } from '../constants/station_distances';

const stationDistanceIndex: Record<string, Distance> = station_distances;

// Undefined for stations with no stored distance, such as bus stops.
export const getStationDistance = (
  fromStationId: string,
  toStationId: string
): number | undefined => stationDistanceIndex[fromStationId]?.[toStationId];
