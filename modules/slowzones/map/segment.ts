import type { SegmentLocation } from '../../../common/maps/LineMap';
import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import { getParentStationForStopId } from '../../../common/utils/stations';

export type SlowZoneDirection = '0' | '1';

type SlowZoneDirections = SlowZoneDirection[];

export type SlowZonesByDirection = Partial<Record<SlowZoneDirection, SlowZoneResponse>>;

type SegmentSlowZones = {
  segmentLocation: SegmentLocation;
  slowZonesByDirection: SlowZonesByDirection;
};

type SegmentedSlowZones = {
  segmentedSlowZones: SegmentSlowZones[];
  effectiveDate: Date;
};

type SegmentSlowZonesOptions = {
  date: Date;
  directions: SlowZoneDirections;
  slowZones: SlowZoneResponse[];
  lineName: LineShort;
};

// TODO(ian): our slow zones calculations currently set the end_date of all active slow zones
// to the moment when the calculation occurs. We can't distinguish these from a slow zone that
// ended in the past, so we clamp addressable dates at the max date in the slow zones json.
// To remove this hack we should set `end` on all active slow zones to null.
const getEffectiveDate = (desiredDate: Date, slowZones: SlowZoneResponse[]) => {
  const allEndDates = slowZones.map((zone) => new Date(zone.end));
  const maxEndDate = allEndDates.sort((a, b) => a.valueOf() - b.valueOf()).pop()!;
  if (desiredDate.valueOf() > maxEndDate.valueOf()) {
    return maxEndDate;
  }
  return desiredDate;
};

const indexSlowZonesByDirection = (
  zones: SlowZoneResponse[],
  requestedDirections: SlowZoneDirections
): SlowZonesByDirection => {
  const index: SlowZonesByDirection = {};
  for (const zone of zones) {
    const fromStation = getParentStationForStopId(zone.fr_id);
    const toStation = getParentStationForStopId(zone.to_id);
    const fromComesFirst = fromStation.order < toStation.order;
    const direction: SlowZoneDirection = fromComesFirst ? '0' : '1';
    if (requestedDirections.includes(direction)) {
      index[direction] = zone;
    }
  }
  return index;
};

const findOtherZonesBetweenSameStations = (
  zone: SlowZoneResponse,
  otherZones: SlowZoneResponse[]
) => {
  const fromStation = getParentStationForStopId(zone.fr_id);
  const toStation = getParentStationForStopId(zone.to_id);
  return otherZones.filter((otherZone) => {
    if (otherZone === zone) {
      return false;
    }
    const otherFromStation = getParentStationForStopId(otherZone.fr_id);
    const otherToStation = getParentStationForStopId(otherZone.to_id);
    if (
      otherFromStation.station === fromStation.station &&
      otherToStation.station === toStation.station
    ) {
      return true;
    }
    if (
      otherFromStation.station === toStation.station &&
      otherToStation.station === fromStation.station
    ) {
      return true;
    }
    return false;
  });
};

const getSegmentLocation = (index: SlowZonesByDirection): SegmentLocation => {
  const { ['0']: forward, ['1']: backward } = index;
  if (forward) {
    const fromStation = getParentStationForStopId(forward.fr_id);
    const toStation = getParentStationForStopId(forward.to_id);
    return {
      fromStationId: fromStation.station,
      toStationId: toStation.station,
    };
  }
  if (backward) {
    const toStation = getParentStationForStopId(backward.fr_id);
    const fromStation = getParentStationForStopId(backward.to_id);
    return {
      fromStationId: fromStation.station,
      toStationId: toStation.station,
    };
  }
  throw new Error('Index must have at least one zone');
};

export const segmentSlowZones = (options: SegmentSlowZonesOptions): SegmentedSlowZones => {
  const { date: desiredDate, slowZones, lineName, directions } = options;
  const segmentedSlowZones: SegmentSlowZones[] = [];
  const handledSlowZones = new Set<SlowZoneResponse>([]);
  const effectiveDate = getEffectiveDate(desiredDate, slowZones);
  const activeZones = slowZones.filter(
    (zone) => new Date(zone.end).valueOf() >= effectiveDate.valueOf() && zone.color === lineName
  );
  activeZones.forEach((zone) => {
    if (handledSlowZones.has(zone)) {
      return;
    }
    handledSlowZones.add(zone);
    const otherMatchingZones = findOtherZonesBetweenSameStations(zone, activeZones);
    const allZonesForSegment = [zone, ...otherMatchingZones];
    const slowZonesByDirection = indexSlowZonesByDirection(allZonesForSegment, directions);
    if (Object.keys(slowZonesByDirection).length > 0) {
      segmentedSlowZones.push({
        segmentLocation: getSegmentLocation(slowZonesByDirection),
        slowZonesByDirection,
      });
    }
    otherMatchingZones.forEach((zone) => handledSlowZones.add(zone));
  });
  return { segmentedSlowZones, effectiveDate };
};
