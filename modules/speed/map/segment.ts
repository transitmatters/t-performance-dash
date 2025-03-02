import type { Diagram, SegmentLocation } from '@transitmatters/stripmap';
import type {
  ByDirection,
  SegmentationResult,
  WithSegmentLocation,
} from '../../../common/types/map';
import {
  filterActiveElements,
  indexByDirection,
  locateIntoSegments,
  matchSegmentLocations,
} from '../../../common/utils/mapSegments';
import type { LineShort } from '../../../common/types/lines';
import { getStationById } from '../../../common/utils/stations';

export type SpeedPairData = {
  service_date: string;
  travel_time: number;
  speed?: number;
  route: LineShort;
  from_id: string;
  to_id: string;
};

type SegmentStationPairsOptions = {
  speedPairs: SpeedPairData[];
  date: Date;
  diagram: Diagram;
  lineName: LineShort;
};

export type SpeedSegment = {
  segmentLocation: SegmentLocation;
  segments: ByDirection<SpeedPairData[]>;
};

const mergeByLocation = (segments: WithSegmentLocation<SpeedPairData>[], diagram: Diagram) => {
  const mergeResult: SpeedSegment[] = [];
  for (const segmentLocation of diagram.getAdjacentSegmentLocations()) {
    const matchingSegments = segments.filter((sz) =>
      matchSegmentLocations(sz.segmentLocation, segmentLocation)
    );
    mergeResult.push({
      segmentLocation,
      segments: indexByDirection(matchingSegments),
    });
  }
  return mergeResult;
};

export const segmentStationPairs = (
  options: SegmentStationPairsOptions
): SegmentationResult<SpeedSegment> => {
  const { date: desiredDate, speedPairs, lineName, diagram } = options;
  const speedSegments = locateIntoSegments(
    filterActiveElements(
      speedPairs,
      lineName,
      desiredDate,
      (segment) => [new Date(segment.service_date), new Date(desiredDate)],
      (segment) => segment.route
    ),
    (segment) => getStationById(segment.from_id),
    (segment) => getStationById(segment.to_id)
  );
  return {
    effectiveDate: desiredDate,
    segments: mergeByLocation(speedSegments, diagram),
  };
};
