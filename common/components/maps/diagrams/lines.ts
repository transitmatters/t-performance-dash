import { stations } from '../../../constants/stations';

import { line, wiggle } from './commands';
import { Diagram } from './diagram';
import { execute } from './execute';
import type { Turtle } from './types';

type DiagrammableLineName = 'Red' | 'Orange' | 'Blue';

type CreateDiagramOptions = {
  /** Number of pixels between each station */
  pxPerStation?: number;
};

const DEFAULT_PX_PER_STATION = 10;

const getStationsForLine = (line: DiagrammableLineName, branch?: string) => {
  const stationsForLine = stations[line].stations;
  return stationsForLine
    .filter((station) => !branch || !station.branches || station.branches?.includes(branch))
    .sort((a, b) => a.order - b.order);
};

export const createRedLineDiagram = (options: CreateDiagramOptions = {}) => {
  const { pxPerStation = DEFAULT_PX_PER_STATION } = options;
  const start: Turtle = { x: 0, y: 0, theta: 90 };
  const stationsA = getStationsForLine('Red', 'A');
  const stationsB = getStationsForLine('Red', 'B');
  const splitIndex = stationsA.findIndex((station) => station.station === 'place-jfk');
  const stationsTrunk = stationsA.slice(0, splitIndex + 1);
  const stationsABranch = stationsA.slice(splitIndex + 1);
  const stationsBBranch = stationsB.slice(splitIndex + 1);
  const trunk = line(pxPerStation * (1 + stationsTrunk.length), ['trunk']);
  const pathA = execute({
    start,
    ranges: ['branch-a'],
    commands: [
      trunk,
      wiggle(15, -20),
      line(10),
      line(pxPerStation * stationsABranch.length, ['branch-a-stations']),
    ],
  });
  const pathB = execute({
    start,
    ranges: ['branch-b'],
    commands: [
      trunk,
      wiggle(15, 20),
      line(60),
      line(pxPerStation * stationsBBranch.length, ['branch-b-stations']),
    ],
  });
  return new Diagram([pathA, pathB], {
    trunk: stationsTrunk,
    'branch-a-stations': stationsABranch,
    'branch-b-stations': stationsBBranch,
  });
};

const createStraightLineDiagram = (
  lineName: DiagrammableLineName,
  options: CreateDiagramOptions = {}
) => {
  const { pxPerStation = DEFAULT_PX_PER_STATION } = options;
  const start: Turtle = { x: 0, y: 0, theta: 90 };
  const stations = getStationsForLine(lineName);
  const path = execute({
    start,
    ranges: ['main'],
    commands: [line(pxPerStation * stations.length)],
  });
  return new Diagram([path], { main: stations });
};

export const createDefaultDiagramForLine = (
  lineName: DiagrammableLineName,
  options: CreateDiagramOptions = {}
) => {
  switch (lineName) {
    case 'Red':
      return createRedLineDiagram(options);
    default:
      return createStraightLineDiagram(lineName, options);
  }
};
