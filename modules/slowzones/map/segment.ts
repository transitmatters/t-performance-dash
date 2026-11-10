import type { Diagram, SegmentLocation } from '@transitmatters/stripmap';

import dayjs from 'dayjs';
import type {
  SlowZoneAllSlowResponse,
  SlowZoneDailyDelays,
  SlowZoneResponse,
  SpeedRestriction,
} from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import type { Station } from '../../../common/types/stations';
import { getParentStationForStopId, getStationById } from '../../../common/utils/stations';

export const DIRECTIONS = ['1', '0'] as const;

export type SlowZoneDirection = '0' | '1';

export type ByDirection<T> = Record<SlowZoneDirection, T>;

export type MapSlowZone = SlowZoneResponse & {
  /** Seconds over baseline on the map's date (see getDayDelay). */
  dayDelay: number;
};

export type SlowZonesSegment = {
  segmentLocation: SegmentLocation;
  slowZones: ByDirection<MapSlowZone[]>;
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
  /** Per-day delays for the line's zones. Without them, zones show their median delay. */
  zoneDelays?: SlowZoneDailyDelays[];
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
  const maxEndDate = dayjs(new Date(slowZones.updated_on)).startOf('day').toDate();
  if (dayjs(desiredDate).isAfter(maxEndDate)) {
    return maxEndDate;
  }
  return dayjs(desiredDate).startOf('day').toDate();
};

const zoneKey = (zone: { fr_id: string; to_id: string; start: string }) =>
  `${zone.fr_id}|${zone.to_id}|${zone.start.slice(0, 10)}`;

/**
 * A zone's delay on `date`: the latest measurement on or before that day, so days with no
 * data (e.g. shuttles) carry the last value forward and fast days count as zero, matching the
 * line's total slow time. Without daily data, falls back to the zone's last-day delay on its
 * final day and its median delay otherwise.
 */
const getDayDelay = (zone: SlowZoneResponse, date: Date, daily?: SlowZoneDailyDelays) => {
  const day = dayjs(date).format('YYYY-MM-DD');
  if (daily) {
    const dayIndex = dayjs(day).diff(dayjs(daily.start), 'day');
    for (let i = Math.min(dayIndex, daily.delays.length - 1); i >= 0; i--) {
      const delay = daily.delays[i];
      if (delay !== null) return Math.max(delay, 0);
    }
  }
  if (day === zone.end.slice(0, 10) && zone.latest_delay !== null) return zone.latest_delay;
  return zone.delay;
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
  slowZones: WithSegmentLocation<MapSlowZone>[],
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
  const {
    date: desiredDate,
    slowZones,
    zoneDelays,
    speedRestrictions,
    lineName,
    diagram,
  } = options;
  const effectiveDate = getEffectiveDate(desiredDate, slowZones);
  const dailyByZone = new Map(zoneDelays?.map((daily) => [zoneKey(daily), daily]));
  const activeSlowZones = locateIntoSegments(
    filterActiveElements(
      slowZones.data,
      lineName,
      effectiveDate,
      (sz) => [new Date(sz.start), new Date(sz.end)],
      (sz) => sz.color
    ).map(
      (sz): MapSlowZone => ({
        ...sz,
        dayDelay: getDayDelay(sz, effectiveDate, dailyByZone.get(zoneKey(sz))),
      })
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
