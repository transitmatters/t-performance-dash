import { pathEntryIsStationRange } from './types';
import type {
  PathCommand,
  PathInterpolator,
  PathSegment,
  PrerenderedRoutePattern,
  StationRange,
  Turtle,
  Line,
  PathStart,
  RoutePattern,
} from './types';

const createPathBuilder = () => {
  let path = '';
  return {
    add: (nextPath: string) => {
      if (path.length === 0) {
        path = nextPath;
      }
      path = path + ' ' + nextPath;
    },
    get: () => path,
  };
};

export const createInterpolatorForSegments = (segments: PathSegment[]) => {
  return (partialLength: number) => {
    let accumulatedLength = 0;
    let ptr = 0;
    while (accumulatedLength <= partialLength) {
      accumulatedLength += segments[ptr].length;
      if (accumulatedLength < partialLength) {
        if (ptr < segments.length) {
          ++ptr;
        } else {
          throw new Error('Ran out of track while mapping position to segment!');
        }
      } else {
        break;
      }
    }
    const segment = segments[ptr];
    const overshootWithinSegment = accumulatedLength - partialLength;
    return segment.get(1 - overshootWithinSegment / segment.length);
  };
};

const getStationIdsWithinRange = (stationRange: StationRange, stationIds: string[]) => {
  const { start, end, stations } = stationRange;
  if (stations) {
    return stations;
  }
  const startIndex = stationIds.indexOf(start!);
  const endIndex = stationIds.indexOf(end!);
  if (startIndex === -1 || endIndex === -1) {
    throw new Error(
      `Improper use of {start=${start}, end=${end}} properties for stationRange. ` +
        'These stations do not exist in provided stationIds array -- ' +
        'consider using stationRange.stations property instead.'
    );
  }
  return stationIds.slice(startIndex, endIndex + 1);
};

const getStationPositions = (
  stationOffsets: Record<string, number>,
  interpolator: PathInterpolator
) => {
  const positions = {};
  Object.entries(stationOffsets).forEach(([stationId, offset]) => {
    positions[stationId] = interpolator(offset);
  });
  return positions;
};

const prerenderRoutePattern = (routePattern: RoutePattern) => {
  const { shape, stations } = routePattern;
  const stationIds = stations.map((station) => station.station);
  const [start, ...entries] = shape;
  const pathBuilder = createPathBuilder();
  const segments: PathSegment[] = [];
  const stationOffsets: Record<string, number> = {};

  let totalLength = 0;
  let { turtle } = start as PathStart;

  const consumeCommand = (command: PathCommand) => {
    const segment = command(turtle);
    const { path, length, turtle: nextTurtle } = segment;
    segments.push(segment);
    totalLength += length;
    turtle = nextTurtle;
    pathBuilder.add(path);
    return segment;
  };

  entries.forEach((entry) => {
    if (pathEntryIsStationRange(entry)) {
      const initialLength = totalLength;
      const segmentsInRange: PathSegment[] = [];
      const stationIdsWithinRange = getStationIdsWithinRange(entry, stationIds);

      entry.commands.forEach((command) => {
        const segment = consumeCommand(command);
        segmentsInRange.push(segment);
      });

      const segmentsLength = totalLength - initialLength;

      stationIdsWithinRange.forEach((stationId, index) => {
        const fraction =
          stationIdsWithinRange.length === 1 ? 0.5 : index / (stationIdsWithinRange.length - 1);
        stationOffsets[stationId] = initialLength + fraction * segmentsLength;
      });
    } else {
      consumeCommand(entry as PathCommand);
    }
  });

  const pathDirective = pathBuilder.get();
  const pathInterpolator = createInterpolatorForSegments(segments);
  const progressPathInterpolator = (progress: number) => pathInterpolator(progress * totalLength);

  return {
    stationOffsets,
    pathDirective,
    pathInterpolator,
    progressPathInterpolator,
  };
};

export const prerenderLine = (line: Line) => {
  const pathBuilder = createPathBuilder();
  const prerenderedRoutePatterns: Record<string, PrerenderedRoutePattern> = {};
  let stationPositions: Record<string, Turtle> = {};

  Object.entries(line.route.routePatterns).forEach(([routePatternId, routePattern]) => {
    const { pathInterpolator, progressPathInterpolator, stationOffsets, pathDirective } =
      prerenderRoutePattern(routePattern);

    const prerenderedRoutePattern: PrerenderedRoutePattern = {
      id: routePatternId,
      pathInterpolator,
      stationOffsets,
      progressPathInterpolator,
    };

    stationPositions = {
      ...stationPositions,
      ...getStationPositions(stationOffsets, pathInterpolator),
    };

    prerenderedRoutePatterns[routePatternId] = prerenderedRoutePattern;
    pathBuilder.add(pathDirective);
  });

  return {
    routePatterns: prerenderedRoutePatterns,
    pathDirective: pathBuilder.get(),
    stationPositions: stationPositions,
  };
};
