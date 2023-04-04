import type { Station } from '../types/stations';
import type { Path, RangeLookup } from './path';

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

  private getPathWithStationIds(stationIds: string[]) {
    const rangeNames = stationIds.map((stationId) => this.rangeNamesByStationId[stationId]);
    for (const path of this.paths) {
      if (rangeNames.every((rangeName) => path.hasRange(rangeName))) {
        return path;
      }
    }
    throw new Error(`No path has all stations by id: ${stationIds}`);
  }

  private lookupStationRange(stationId: string): RangeLookup {
    const rangeNameWithStationId = this.rangeNamesByStationId[stationId];
    const stationIds = this.stationsByRangeName[rangeNameWithStationId];
    const indexInPath = stationIds.findIndex((station) => station.station === stationId);
    return {
      range: rangeNameWithStationId,
      fraction: indexInPath / (stationIds.length - 1),
    };
  }

  getStations() {
    return [...new Set(Object.values(this.stationsByRangeName).flat())];
  }

  getStationPosition(stationId: string) {
    const pathWithStationId = this.getPathWithStationIds([stationId]);
    const lookup = this.lookupStationRange(stationId);
    return pathWithStationId.getWithinRange(lookup);
  }

  getPathBetweenStations(fromStationId: string, toStationId: string) {
    const path = this.getPathWithStationIds([fromStationId, toStationId]);
    const fromLookup = this.lookupStationRange(fromStationId);
    const toLookup = this.lookupStationRange(toStationId);
    const fromDisplacement = path.getDisplacementInRange(fromLookup);
    const toDisplacement = path.getDisplacementInRange(toLookup);
    return path.cut(fromDisplacement, toDisplacement);
  }

  toSVG() {
    return this.paths.map((path) => path.toSVG()).reduce((a, b) => `${a} ${b}`, '');
  }
}
