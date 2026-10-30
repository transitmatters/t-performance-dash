import { rtStations } from '../../../common/constants/stations';
import type { RidershipCount, StationRidershipWeek } from '../../../common/types/dataPoints';

export const STATION_RIDERSHIP_LINES = ['Red', 'Orange', 'Blue', 'Green'] as const;

export type StationRidershipLineName = (typeof STATION_RIDERSHIP_LINES)[number];

export const isStationRidershipLine = (
  lineShort: string | undefined
): lineShort is StationRidershipLineName =>
  (STATION_RIDERSHIP_LINES as readonly (string | undefined)[]).includes(lineShort);

const linesByStationId = STATION_RIDERSHIP_LINES.reduce<Record<string, StationRidershipLineName[]>>(
  (index, lineName) => {
    rtStations[lineName].stations.forEach(({ station }) => {
      const lines = (index[station] ??= []);
      if (!lines.includes(lineName)) lines.push(lineName);
    });
    return index;
  },
  {}
);

/** Fare gates count every rider entering a station, so a transfer station's count covers these lines too */
export const getOtherLinesAtStation = (stationId: string, lineName: StationRidershipLineName) =>
  (linesByStationId[stationId] ?? []).filter((other) => other !== lineName);

export const getStationAverages = (weeks: StationRidershipWeek[]) => {
  const totals: Record<string, { sum: number; weeks: number }> = {};
  weeks.forEach(({ stations }) => {
    Object.entries(stations).forEach(([stationId, count]) => {
      const total = (totals[stationId] ??= { sum: 0, weeks: 0 });
      total.sum += count;
      total.weeks += 1;
    });
  });
  return Object.fromEntries(
    Object.entries(totals).map(([stationId, { sum, weeks }]) => [stationId, sum / weeks])
  );
};

export const getStationSeries = (
  weeks: StationRidershipWeek[],
  stationId: string
): RidershipCount[] =>
  weeks
    .filter(({ stations }) => stationId in stations)
    .map(({ date, stations }) => ({ date, count: stations[stationId] }));

export const formatStationRidership = (count: number) =>
  count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${Math.round(count)}`;
