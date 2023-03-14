import { stations } from '../constants/stations';

import { line, wiggle } from './commands';
import { Diagram } from './diagram';
import { execute } from './execute';
import type { Turtle } from './types';

type DiagrammableLineName = 'Red' | 'Orange' | 'Blue';

const getStationsForLine = (line: DiagrammableLineName, branch?: string) => {
  const stationsForLine = stations[line].stations;
  return stationsForLine
    .filter((station) => !branch || !station.branches || station.branches?.includes(branch))
    .sort((a, b) => a.order - b.order);
};

export const createRedLineDiagram = () => {
  const PX_PER_STATION = 10;
  const start: Turtle = { x: 0, y: 0, theta: 90 };
  const stationsA = getStationsForLine('Red', 'A');
  const stationsB = getStationsForLine('Red', 'B');
  const splitIndex = stationsA.findIndex((station) => station.station === 'place-jfk');
  const stationsTrunk = stationsA.slice(0, splitIndex + 1);
  const stationsABranch = stationsA.slice(splitIndex + 1);
  const stationsBBranch = stationsB.slice(splitIndex + 1);
  const trunk = line(PX_PER_STATION * (1 + stationsTrunk.length), 'trunk');
  const pathA = execute({
    start,
    commands: [trunk, line(30), line(PX_PER_STATION * stationsABranch.length, 'branch-a')],
  });
  const pathB = execute({
    start,
    commands: [
      trunk,
      wiggle(10, 5),
      line(80),
      wiggle(10, -5),
      line(PX_PER_STATION * stationsBBranch.length, 'branch-b'),
    ],
  });
  return new Diagram([pathA, pathB], {
    trunk: stationsTrunk,
    'branch-a': stationsABranch,
    'branch-b': stationsBBranch,
  });
};
