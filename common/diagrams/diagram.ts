import type { Station } from '../types/stations';
import type { Path } from './path';

const indexRangesNamesByStationId = (stationIdsByRangeName: Record<string, Station[]>) => {
  const index: Record<string, string> = {};
  for (const [rangeName, stations] of Object.entries(stationIdsByRangeName)) {
    for (const station of stations) {
      index[station.station] = rangeName;
    }
  }
  return index;
};

export class Diagram {
  private paths: Path[];
  private stationsByRangeName: Record<string, Station[]>;
  private readonly rangeNamesByStationId: Record<string, string>;

  constructor(paths: Path[], stationIdsByRangeName: Record<string, Station[]>) {
    this.paths = paths;
    this.stationsByRangeName = stationIdsByRangeName;
    this.rangeNamesByStationId = indexRangesNamesByStationId(stationIdsByRangeName);
  }

  private getRangeNameWithStationIds(stationIds: string[]) {
    for (const [rangeName, stationsInRange] of Object.entries(this.stationsByRangeName)) {
      const stationIdsInRange = stationsInRange.map((station) => station.station);
      if (stationIds.every((id) => stationIdsInRange.includes(id))) {
        return rangeName;
      }
    }
    throw new Error(`No range with station IDs: ${stationIds}`);
  }

  private getPathWithStationIds(stationIds: string[]) {
    const range = this.getRangeNameWithStationIds(stationIds);
    for (const path of this.paths) {
      if (path.namedRanges.includes(range)) {
        return path;
      }
    }
    throw new Error(`No path for station IDs: ${stationIds} (inferred range: ${range})`);
  }

  private getStationFractionInRange(stationId: string) {
    const rangeNameWithStationId = this.rangeNamesByStationId[stationId];
    const stationIds = this.stationsByRangeName[rangeNameWithStationId];
    const indexInPath = stationIds.findIndex((station) => station.station === stationId);
    return indexInPath / (stationIds.length - 1);
  }

  getStations() {
    return [...new Set(Object.values(this.stationsByRangeName).flat())];
  }

  getStationPosition(stationId: string) {
    const rangeNameWithStationId = this.rangeNamesByStationId[stationId];
    const pathWithStationId = this.getPathWithStationIds([stationId]);
    const fractionOfPath = this.getStationFractionInRange(stationId);
    return pathWithStationId.sliceRange(rangeNameWithStationId).get(fractionOfPath);
  }

  getPathBetweenStations(fromStationId: string, toStationId: string) {
    const path = this.getPathWithStationIds([fromStationId, toStationId]);
    const fromStationRangeName = this.getRangeNameWithStationIds([fromStationId]);
    const toStationRangeName = this.getRangeNameWithStationIds([toStationId]);
    const fromStationRange = path.getRange(fromStationRangeName);
    const toStationRange = path.getRange(toStationRangeName);
    const fromStationFraction = this.getStationFractionInRange(fromStationId);
    const toStationFraction = this.getStationFractionInRange(toStationId);
    const fromStationTotalProgress =
      fromStationRange[0] + (fromStationRange[1] - fromStationRange[0]) * fromStationFraction;
    const toStationTotalProgress =
      toStationRange[0] + (toStationRange[1] - toStationRange[0]) * toStationFraction;
    return path.cut(fromStationTotalProgress, toStationTotalProgress);
  }

  toSVG() {
    return this.paths.map((path) => path.toSVG()).reduce((a, b) => `${a} ${b}`);
  }
}
