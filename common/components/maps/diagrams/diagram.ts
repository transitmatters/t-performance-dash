import type { Point } from 'bezier-js';

import type { Station } from '../../../types/stations';

import type { Path } from './path';
import type { DiagramProjection, PathProjection, SegmentLocation } from './types';

type StationDisplacementMap = Map<Path, Record<string, number>>;

const indexRangesNamesByStationId = (stationsByRangeName: Record<string, Station[]>) => {
  const index: Record<string, string> = {};
  for (const [rangeName, stations] of Object.entries(stationsByRangeName)) {
    for (const station of stations) {
      index[station.station] = rangeName;
    }
  }
  return index;
};

const getStationDisplacementMap = (
  paths: Path[],
  stationsByRangeName: Record<string, Station[]>
) => {
  const map: StationDisplacementMap = new Map();
  for (const path of paths) {
    const pathIndex: Record<string, number> = {};
    map.set(path, pathIndex);
    for (const range of path.getRanges()) {
      const stations = stationsByRangeName[range];
      if (stations) {
        for (let i = 0; i < stations.length; i++) {
          const station = stations[i];
          const fraction = i / (stations.length - 1);
          const displacement = path.getDisplacementFromRangeLookup({ fraction, range });
          pathIndex[station.station] = displacement;
        }
      }
    }
  }
  return map;
};

export class Diagram {
  private paths: Path[];
  private stationsByRangeName: Record<string, Station[]>;
  private stations: Station[];
  private readonly rangeNamesByStationId: Record<string, string>;
  private readonly stationDisplacementMap: StationDisplacementMap;

  constructor(paths: Path[], stationsByRangeName: Record<string, Station[]>) {
    this.paths = paths;
    this.stationsByRangeName = stationsByRangeName;
    this.rangeNamesByStationId = indexRangesNamesByStationId(stationsByRangeName);
    this.stationDisplacementMap = getStationDisplacementMap(paths, stationsByRangeName);
    this.stations = [...new Set(Object.values(this.stationsByRangeName).flat())];
  }

  private getPathWithStationIds(stationIds: string[]) {
    const rangeNames = stationIds.map((stationId) => this.rangeNamesByStationId[stationId]);
    for (const path of this.paths) {
      if (rangeNames.every((rangeName) => path.hasRange(rangeName))) {
        return path;
      }
    }
    throw new Error(`No path has all stations by id: ${stationIds}`);
  }

  private getAdjacentStationId(path: Path, displacement: number, after: boolean): null | string {
    const stations = this.stationDisplacementMap.get(path)!;
    let closestStationId: null | string = null;
    let closestDistance = Infinity;
    for (const [stationId, stationDisplacement] of Object.entries(stations)) {
      const isOnCorrectSide = after
        ? stationDisplacement >= displacement
        : displacement >= stationDisplacement;
      if (isOnCorrectSide) {
        const distance = Math.abs(stationDisplacement - displacement);
        if (distance < closestDistance) {
          closestStationId = stationId;
          closestDistance = distance;
        }
      }
    }
    return closestStationId;
  }

  getStations() {
    return this.stations;
  }

  getAdjacentSegmentLocations() {
    const pairs: SegmentLocation[] = [];
    const seenPairKeys: Set<string> = new Set();
    for (const stationIndex of this.stationDisplacementMap.values()) {
      const stationIds = Object.keys(stationIndex);
      for (let i = 0; i < stationIds.length - 1; i++) {
        const fromStationId = stationIds[i];
        const toStationId = stationIds[i + 1];
        const pairKey = `${fromStationId}__${toStationId}`;
        if (!seenPairKeys.has(pairKey)) {
          seenPairKeys.add(pairKey);
          pairs.push({ fromStationId: stationIds[i], toStationId: stationIds[i + 1] });
        }
      }
    }
    return pairs;
  }

  getStationPosition(stationId: string) {
    const pathWithStationId = this.getPathWithStationIds([stationId]);
    const { [stationId]: displacement } = this.stationDisplacementMap.get(pathWithStationId)!;
    return pathWithStationId.getPointFromDisplacement(displacement);
  }

  getPathBetweenStations(fromStationId: string, toStationId: string) {
    const path = this.getPathWithStationIds([fromStationId, toStationId]);
    const { [fromStationId]: fromDisplacement, [toStationId]: toDisplacement } =
      this.stationDisplacementMap.get(path)!;
    return path.cut(fromDisplacement, toDisplacement);
  }

  toSVG() {
    return this.paths.map((path) => path.toSVG()).reduce((a, b) => `${a} ${b}`, '');
  }

  project(point: Point): null | DiagramProjection {
    let closestPath: null | Path = null;
    let closestProjection: null | PathProjection = null;
    for (const path of this.paths) {
      const projection = path.project(point);
      if (projection && (!closestProjection || projection.distance < closestProjection.distance)) {
        closestProjection = projection;
        closestPath = path;
      }
    }
    if (closestPath && closestProjection) {
      const fromStationId = this.getAdjacentStationId(
        closestPath,
        closestProjection.displacement,
        false
      );
      const toStationId = this.getAdjacentStationId(
        closestPath,
        closestProjection.displacement,
        true
      );
      return {
        segmentProjection: closestProjection.segmentProjection,
        path: closestPath,
        segmentLocation: {
          fromStationId,
          toStationId: toStationId !== fromStationId ? toStationId : null,
        },
      };
    }
    return null;
  }
}
