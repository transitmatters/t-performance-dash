import type { SegmentLocation } from '@transitmatters/stripmap';
import type { LineShort } from '../types/lines';
import type { ByDirection, SegmentDirection, WithSegmentLocation } from '../types/map';
import type { Station } from '../types/stations';

export const DIRECTIONS = ['1', '0'] as const;

export const locateIntoSegments = <T extends Record<string, unknown>>(
  records: T[],
  getFromStation: (t: T) => null | Station,
  getToStation: (t: T) => null | Station
) => {
  const located: WithSegmentLocation<T>[] = [];
  for (const record of records) {
    const fromStation = getFromStation(record);
    const toStation = getToStation(record);
    if (fromStation && toStation) {
      const fromComesFirst = fromStation.order < toStation.order;
      const direction: SegmentDirection = fromComesFirst ? '0' : '1';
      located.push({
        direction,
        segmentLocation: {
          fromStationId: fromStation.station,
          toStationId: toStation.station,
        },
        value: record,
      });
    }
  }
  return located;
};

export const filterActiveElements = <T extends Record<string, unknown>>(
  records: T[],
  targetLine: LineShort,
  targetDate: Date,
  getRecordDateRange: (t: T) => [Date, Date],
  getRecordLine: (t: T) => LineShort
) => {
  return records.filter((record) => {
    const [serviceDate, targetDate] = getRecordDateRange(record);
    return serviceDate.valueOf() === targetDate.valueOf() && getRecordLine(record) === targetLine;
  });
};

export const indexByDirection = <T>(records: WithSegmentLocation<T>[]): ByDirection<T[]> => {
  return {
    '0': records.filter((r) => r.direction === '0').map((r) => r.value),
    '1': records.filter((r) => r.direction === '1').map((r) => r.value),
  };
};

export const matchSegmentLocations = (first: SegmentLocation, second: SegmentLocation) => {
  return (
    (first.fromStationId === second.fromStationId && first.toStationId === second.toStationId) ||
    (first.toStationId === second.fromStationId && first.fromStationId === second.toStationId)
  );
};
