import type { Diagram, SegmentLocation } from '@transitmatters/stripmap';

import type {
  SlowZoneAllSlowResponse,
  SlowZoneResponse,
  SpeedRestriction,
} from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import type { Station } from '../../../common/types/stations';
import { getParentStationForStopId, getStationById } from '../../../common/utils/stations';

export const DIRECTIONS = ['1', '0'] as const;

export type SlowZoneDirection = '0' | '1';

export type ByDirection<T> = Record<SlowZoneDirection, T>;

export type SlowZonesSegment = {
  segmentLocation: SegmentLocation;
  slowZones: ByDirection<SlowZoneResponse[]>;
  speedRestrictions: ByDirection<SpeedRestriction[]>;
};

type SegmentationResult = {
  segments: SlowZonesSegment[];
  effectiveDate: Date;
};

type SegmentSlowZonesOptions = {
  date: Date;
  diagram: Diagram;
  speedRestrictions: SpeedRestriction[];
  slowZones: SlowZoneAllSlowResponse;
  lineName: LineShort;
};

type WithSegmentLocation<T> = {
  segmentLocation: SegmentLocation;
  direction: SlowZoneDirection;
  value: T;
};

/**
 * Get the latest date that we have data on slow zones for
 */
const getEffectiveDate = (desiredDate: Date, slowZones: SlowZoneAllSlowResponse) => {
  const maxEndDate = new Date(slowZones.updated_on);
  if (desiredDate.valueOf() > maxEndDate.valueOf()) {
    return maxEndDate;
  }
  return desiredDate;
};

const filterActiveElements = <T extends Record<string, unknown>>(
  records: T[],
  targetLine: LineShort,
  targetDate: Date,
  getRecordDateRange: (t: T) => [Date, Date],
  getRecordLine: (t: T) => LineShort
) => {
  return records.filter((record) => {
    const [startDate, endDate] = getRecordDateRange(record);
    return (
      startDate.valueOf() <= targetDate.valueOf() &&
      endDate.valueOf() >= targetDate.valueOf() &&
      getRecordLine(record) === targetLine
    );
  });
};

const locateIntoSegments = <T extends Record<string, unknown>>(
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
      const direction: SlowZoneDirection = fromComesFirst ? '0' : '1';
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

const matchSegmentLocations = (first: SegmentLocation, second: SegmentLocation) => {
  return (
    (first.fromStationId === second.fromStationId && first.toStationId === second.toStationId) ||
    (first.toStationId === second.fromStationId && first.fromStationId === second.toStationId)
  );
};

const indexByDirection = <T>(records: WithSegmentLocation<T>[]): ByDirection<T[]> => {
  return {
    '0': records.filter((r) => r.direction === '0').map((r) => r.value),
    '1': records.filter((r) => r.direction === '1').map((r) => r.value),
  };
};

const mergeByLocation = (
  slowZones: WithSegmentLocation<SlowZoneResponse>[],
  speedRestrictions: WithSegmentLocation<SpeedRestriction>[],
  diagram: Diagram
) => {
  const mergeResult: SlowZonesSegment[] = [];
  for (const segmentLocation of diagram.getAdjacentSegmentLocations()) {
    const matchingSlowZones = slowZones.filter((sz) =>
      matchSegmentLocations(sz.segmentLocation, segmentLocation)
    );
    const matchingSpeedRestrictions = speedRestrictions.filter((sr) =>
      matchSegmentLocations(sr.segmentLocation, segmentLocation)
    );
    mergeResult.push({
      segmentLocation,
      slowZones: indexByDirection(matchingSlowZones),
      speedRestrictions: indexByDirection(matchingSpeedRestrictions),
    });
  }
  return mergeResult;
};

export const segmentSlowZones = (options: SegmentSlowZonesOptions): SegmentationResult => {
  const { date: desiredDate, slowZones, speedRestrictions, lineName, diagram } = options;
  const effectiveDate = getEffectiveDate(desiredDate, slowZones);
  const activeSlowZones = locateIntoSegments(
    filterActiveElements(
      slowZones.data,
      lineName,
      effectiveDate,
      (sz) => [new Date(sz.start), new Date(sz.end)],
      (sz) => sz.color
    ),
    (sz) => getParentStationForStopId(sz.fr_id),
    (sz) => getParentStationForStopId(sz.to_id)
  );
  const activeSpeedRestrictions = locateIntoSegments(
    filterActiveElements(
      speedRestrictions,
      lineName,
      effectiveDate,
      (rs) => [new Date(rs.reported), rs.validAsOf],
      (rs) => rs.lineId.replace('line-', '') as LineShort
    ),
    (rs) => getStationById(rs.fromStopId!),
    (rs) => getStationById(rs.toStopId!)
  );
  return {
    effectiveDate,
    segments: mergeByLocation(activeSlowZones, activeSpeedRestrictions, diagram),
  };
};
