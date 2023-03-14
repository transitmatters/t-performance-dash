import getSvgBounds from 'svg-path-bounds';

import type { PrerenderedLine } from '../../../common/diagrams';
import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import { getParentStationForStopId } from '../../../common/utils/stations';

type SlowZoneDirection = '0' | '1';

type SlowZoneDirections = SlowZoneDirection[];

type PrerenderedSlowZone = {
  id: string;
  pathDirective: string;
  pathDirectiveBounds: { top: number; bottom: number; left: number; right: number };
  betweenStationIds: [string, string];
  matches: Partial<Record<SlowZoneDirection, SlowZoneResponse>>;
  slownessFactor: number;
};

type PrerenderedSlowZonesResult = {
  slowZones: PrerenderedSlowZone[];
  effectiveDate: Date;
};

type PrerenderSlowZonesOptions = {
  date: Date;
  directions: SlowZoneDirections;
  prerenderedLine: PrerenderedLine;
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

const getMatchingSlowZoneDirection = (
  zones: SlowZoneResponse[],
  firstStationId: string,
  secondStationId: string,
  requestedDirections: SlowZoneDirections
) => {
  const matchForward = zones.find((zone) => {
    const fromStation = getParentStationForStopId(zone.fr_id);
    const toStation = getParentStationForStopId(zone.to_id);
    return fromStation.station === firstStationId && toStation.station === secondStationId;
  });
  const matchBackward = zones.find((zone) => {
    const fromStation = getParentStationForStopId(zone.fr_id);
    const toStation = getParentStationForStopId(zone.to_id);
    return fromStation.station === secondStationId && toStation.station === firstStationId;
  });
  const matches: Partial<Record<SlowZoneDirection, SlowZoneResponse>> = {};
  if (matchForward && requestedDirections.includes('0')) {
    matches['0'] = matchForward;
  }
  if (matchBackward && requestedDirections.includes('1')) {
    matches['1'] = matchBackward;
  }
  return matches;
};

const prerenderSlowZone = (
  zones: SlowZoneResponse[],
  requestedDirections: SlowZoneDirections,
  prerenderedLine: PrerenderedLine
): PrerenderedSlowZone => {
  const { routePatterns } = prerenderedLine;
  for (const prerenderedRoutePattern of Object.values(routePatterns)) {
    const { stationOffsets, getSubpathDirective } = prerenderedRoutePattern;
    const stationEntries = Object.entries(stationOffsets);
    for (let i = 0; i < stationEntries.length - 1; i++) {
      const [firstStationId, firstOffset] = stationEntries[i];
      const [secondStationId, secondOffset] = stationEntries[i + 1];
      const matches = getMatchingSlowZoneDirection(
        zones,
        firstStationId,
        secondStationId,
        requestedDirections
      );
      const pathDirective = getSubpathDirective(firstOffset, secondOffset);
      const [left, top, right, bottom] = getSvgBounds(pathDirective);
      if (Object.keys(matches).length > 0) {
        return {
          id: `${firstStationId}__${secondStationId}`,
          pathDirective: getSubpathDirective(firstOffset, secondOffset),
          pathDirectiveBounds: { left, top, right, bottom },
          matches,
          betweenStationIds: [firstStationId, secondStationId],
        };
      }
    }
  }
  throw new Error(`Failed to find stations for slow zone`);
};

const findMatchingZones = (zone: SlowZoneResponse, otherZones: SlowZoneResponse[]) => {
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

export const prerenderSlowZones = (
  options: PrerenderSlowZonesOptions
): PrerenderedSlowZonesResult => {
  const { date: desiredDate, slowZones, prerenderedLine, lineName, directions } = options;
  const prerenderedSlowZones: PrerenderedSlowZone[] = [];
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
    const otherMatchingZones = findMatchingZones(zone, activeZones);
    const prerenderedSlowZone = prerenderSlowZone(
      [zone, ...otherMatchingZones],
      directions,
      prerenderedLine
    );
    prerenderedSlowZones.push(prerenderedSlowZone);
    otherMatchingZones.forEach((zone) => handledSlowZones.add(zone));
  });
  return { slowZones: prerenderedSlowZones, effectiveDate };
};
