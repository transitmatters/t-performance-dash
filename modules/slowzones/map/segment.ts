import type { Diagram, SegmentLocation } from '@transitmatters/stripmap';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { DATE_FORMAT } from '../../../common/constants/dates';
import type {
  SlowZoneAllSlowResponse,
  SlowZoneResponse,
  SpeedRestriction,
} from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import type { Station } from '../../../common/types/stations';
import { getParentStationForStopId, getStationById } from '../../../common/utils/stations';

dayjs.extend(utc);

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
  /** The calendar date to show, as YYYY-MM-DD. */
  date: string;
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
 * The day to show zones for, as local midnight: the requested date, or the last day of slow zone
 * data if that's earlier. Zone dates have no offset, so `new Date()` reads them as local midnight
 * too. Don't parse the requested date with `new Date('YYYY-MM-DD')`, which is UTC midnight and so
 * the day before west of UTC.
 */
const getEffectiveDate = (desiredDate: string, slowZones: SlowZoneAllSlowResponse) => {
  // The pipeline covers service through the day before its run, which `updated_on` timestamps.
  const runDate = dayjs.utc(slowZones.updated_on).format(DATE_FORMAT);
  const lastDataDate = dayjs(runDate).subtract(1, 'day');
  const desired = dayjs(desiredDate);
  return (desired.isAfter(lastDataDate) ? lastDataDate : desired).toDate();
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
    // Pass the line: Red and Mattapan share Ashmont's stop ids, but not its station order.
    (sz) => getParentStationForStopId(sz.fr_id, sz.color),
    (sz) => getParentStationForStopId(sz.to_id, sz.color)
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
