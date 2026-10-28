import type { Diagram, SegmentLabel, SegmentLocation } from '@transitmatters/stripmap';

import dayjs from 'dayjs';
import type {
  SlowZoneAllSlowResponse,
  SlowZoneResponse,
  SpeedRestriction,
} from '../../../common/types/dataPoints';
import type { LineShort } from '../../../common/types/lines';
import { getParentStationForStopId, getStationById } from '../../../common/utils/stations';
import {
  filterActiveElements,
  indexByDirection,
  locateIntoSegments,
  matchSegmentLocations,
} from '../../../common/utils/mapSegments';
import type {
  ByDirection,
  SegmentationResult,
  WithSegmentLocation,
} from '../../../common/types/map';

export type SlowZonesSegment = {
  segmentLocation: SegmentLocation;
  slowZones: ByDirection<SlowZoneResponse[]>;
  speedRestrictions: ByDirection<SpeedRestriction[]>;
};

type SegmentSlowZonesOptions = {
  date: Date;
  diagram: Diagram;
  speedRestrictions: SpeedRestriction[];
  slowZones: SlowZoneAllSlowResponse;
  lineName: LineShort;
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

export const segmentSlowZones = (
  options: SegmentSlowZonesOptions
): SegmentationResult<SlowZonesSegment> => {
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

export const getSegmentLabelOverrides = (
  segmentLocation: SegmentLocation,
  isHorizontal: boolean
): null | Partial<SegmentLabel> => {
  const { toStationId } = segmentLocation;
  // JFK to Savin Hill — on a steep curve
  if (toStationId === 'place-shmnl') {
    return {
      mapSide: '1' as const,
      offset: isHorizontal ? { x: -12, y: -5 } : { x: 0, y: 0 },
    };
  }
  // Shawmut to Ashmont — obscured by "North Quincy" label
  if (!isHorizontal && toStationId === 'place-asmnl') {
    return {
      mapSide: '1' as const,
    };
  }
  return null;
};
