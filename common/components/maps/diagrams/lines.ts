import { stations } from '../../../constants/stations';

import { line, wiggle } from './commands';
import { Diagram } from './diagram';
import { execute } from './execute';
import type { Turtle } from './types';

type DiagrammableLineName = 'Red' | 'Orange' | 'Blue' | 'Green';

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

export const createGreenLineDiagram = (options: CreateDiagramOptions = {}) => {
  const { pxPerStation = DEFAULT_PX_PER_STATION } = options;
  // const start: Turtle = { x: 0, y: 0, theta: 90 };
  const dStart: Turtle = { x: -20, y: -50, theta: 90 };
  // const eStart: Turtle = { x: 0, y: -75, theta: 90 };
  // const stationsB = getStationsForLine('Green', 'B');
  // const stationsC = getStationsForLine('Green', 'C');
  const stationsD = getStationsForLine('Green', 'D');
  // const stationsE = getStationsForLine('Green', 'E');

  let trunkFirstIndex = stationsD.findIndex((station) => station.station === 'place-lech');
  let trunkLastIndex = stationsD.findIndex((station) => station.station === 'place-coecl');
  const stationsTrunk = stationsD.slice(trunkFirstIndex, trunkLastIndex + 1);

  // const bcdTrunkFirstIndex = stationsB.findIndex((station) => station.station === 'place-hymnl');
  // const bcdTrunkLastIndex = stationsB.findIndex((station) => station.station === 'place-kencl');
  // const stationsBCDTrunk = stationsB.slice(bcdTrunkFirstIndex, bcdTrunkLastIndex + 1);

  // trunkLastIndex = stationsB.findIndex((station) => station.station === 'place-kencl');
  // const stationsBBranch = stationsB.slice(trunkLastIndex + 1);

  // trunkLastIndex = stationsC.findIndex((station) => station.station === 'place-kencl');
  // const stationsCBranch = stationsC.slice(trunkLastIndex + 1);

  trunkFirstIndex = stationsD.findIndex((station) => station.station === 'place-lech');
  trunkLastIndex = stationsD.findIndex((station) => station.station === 'place-kencl');
  const stationsDBranch1 = stationsD.slice(0, trunkFirstIndex + 1);
  const stationsDBranch2 = stationsD.slice(trunkLastIndex + 1);

  // trunkFirstIndex = stationsE.findIndex((station) => station.station === 'place-lech');
  // trunkLastIndex = stationsE.findIndex((station) => station.station === 'place-coecl');
  // const stationsEBranch1 = stationsE.slice(0, trunkFirstIndex + 1);
  // const stationsEBranch2 = stationsE.slice(trunkLastIndex + 1);

  const trunk = line(pxPerStation * (1 + stationsTrunk.length), ['trunk']);
  const bcdTrunk = line(pxPerStation + 2, ['bcd-trunk']);

  // const pathB = execute({
  //   start,
  //   ranges: ['branch-b'],
  //   commands: [
  //     trunk,
  //     line(20),
  //     bcdTrunk,
  //     wiggle(30, -20),
  //     line(10),
  //     line(pxPerStation * stationsBBranch.length, ['branch-b-stations']),
  //   ],
  // });
  // const pathC = execute({
  //   start,
  //   ranges: ['branch-c'],
  //   commands: [
  //     trunk,
  //     line(20),
  //     bcdTrunk,
  //     line(30),
  //     line(pxPerStation * stationsCBranch.length, ['branch-c-stations']),
  //   ],
  // });
  const pathD = execute({
    start: dStart,
    ranges: ['branch-d'],
    commands: [
      line(pxPerStation + 2, ['branch-d-stations-1']),
      trunk,
      bcdTrunk,
      line(pxPerStation * stationsDBranch2.length, ['branch-d-stations-2']),
    ],
  });
  // const pathE = execute({
  //   start: eStart,
  //   ranges: ['branch-e'],
  //   commands: [
  //     line(pxPerStation * stationsEBranch1.length, ['branch-e-stations-1']),
  //     line(15),
  //     trunk,
  //     wiggle(60, 40),
  //     line(pxPerStation * stationsEBranch2.length, ['branch-e-stations-2']),
  //   ],
  // });

  return new Diagram([pathD], {
    trunk: stationsTrunk,
    // 'bcd-trunk': stationsBCDTrunk,
    // 'branch-b-stations': stationsBBranch,
    // 'branch-c-stations': stationsCBranch,
    'branch-d-stations-1': stationsDBranch1,
    'branch-d-stations-2': stationsDBranch2,
    // 'branch-e-stations-1': stationsEBranch1,
    // 'branch-e-stations-2': stationsEBranch2,
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
    case 'Green':
      return createGreenLineDiagram(options);
    default:
      return createStraightLineDiagram(lineName, options);
  }
};
