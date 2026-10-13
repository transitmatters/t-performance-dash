import type { Distance } from '../types/dataPoints';
import { station_distances } from '../constants/station_distances';

const stationDistanceIndex: Record<string, Distance> = station_distances;

export const getStationDistance = (fromStationId: string, toStationId: string) => {
  return stationDistanceIndex[fromStationId][toStationId];
};
