import { start, line, wiggle, stationRange } from './paths';
import { getStationsForRoutePattern } from './util';
import type { PathShape, Line, LineName } from './types';

const GLStations = {
  UnionSquare: 'place-unsqu',
  Lechemere: 'place-lech',
  SciencePark: 'place-spmnl',
  NorthStation: 'place-north',
  Haymarket: 'place-haecl',
  GovernmentCenter: 'place-gover',
  ParkSt: 'place-pktrm',
  Boylston: 'place-boyls',
  Arlington: 'place-armnl',
  Copley: 'place-coecl',
  Hynes: 'place-hymnl',
  Kenmore: 'place-kencl',
  HeathSt: 'place-hsmnl',
  Riverside: 'place-river',
  ClevelandCircle: 'place-clmnl',
  BostonCollege: 'place-lake',
  BlanfordStreet: 'place-bland',
  StMarysStreet: 'place-smary',
  Fenway: 'place-fenwy',
  Prudential: 'place-prmnl',
} as const;

const glSharedStations = [
  GLStations.UnionSquare,
  GLStations.Lechemere,
  GLStations.SciencePark,
  GLStations.NorthStation,
  GLStations.Haymarket,
  GLStations.GovernmentCenter,
  GLStations.ParkSt,
  GLStations.Boylston,
  GLStations.Arlington,
  GLStations.Copley,
];

const greenShared: PathShape = [
  start(0, 0, 90),
  stationRange({
    stations: glSharedStations,
    commands: [line(100)],
  }),
];

const greenBCDTrunk: PathShape = [
  line(20),
  stationRange({
    start: GLStations.Hynes,
    end: GLStations.Kenmore,
    commands: [line(20)],
  }),
];

const greenBShape: PathShape = [
  ...greenShared,
  ...greenBCDTrunk,
  wiggle(30, -20),
  stationRange({
    start: GLStations.BlanfordStreet,
    end: GLStations.BostonCollege,
    commands: [line(100)],
  }),
];

const greenCShape: PathShape = [
  ...greenShared,
  ...greenBCDTrunk,
  line(30),
  stationRange({
    start: GLStations.StMarysStreet,
    end: GLStations.ClevelandCircle,
    commands: [line(110)],
  }),
];

const greenDShape: PathShape = [
  ...greenShared,
  ...greenBCDTrunk,
  wiggle(30, 20),
  stationRange({
    start: GLStations.Fenway,
    end: GLStations.Riverside,
    commands: [line(100)],
  }),
];

const greenEShape: PathShape = [
  ...greenShared,
  wiggle(60, 40),
  stationRange({
    start: GLStations.Prudential,
    end: GLStations.HeathSt,
    commands: [line(100)],
  }),
];

const greenLine: Line = {
  route: {
    routePatterns: {
      'Green-B': {
        shape: greenBShape,
        stations: getStationsForRoutePattern('Green', 'B'),
      },
      'Green-C': {
        shape: greenCShape,
        stations: getStationsForRoutePattern('Green', 'C'),
      },
      'Green-D': {
        shape: greenDShape,
        stations: getStationsForRoutePattern('Green', 'D'),
      },
      'Green-E': {
        shape: greenEShape,
        stations: getStationsForRoutePattern('Green', 'E'),
      },
    },
  },
};

const enum OLStations {
  OakGrove = 'place-ogmnl',
  ForestHills = 'place-forhl',
}

const orangeLine: Line = {
  route: {
    routePatterns: {
      Orange: {
        stations: getStationsForRoutePattern('Orange'),
        shape: [
          start(0, 0, 90),
          stationRange({
            start: OLStations.OakGrove,
            end: OLStations.ForestHills,
            commands: [line(250)],
          }),
        ],
      },
    },
  },
};

const enum RLStations {
  Alewife = 'place-alfcl',
  UmassJFK = 'place-jfk',
  SavinHill = 'place-shmnl',
  Ashmont = 'place-asmnl',
  NorthQuincy = 'place-nqncy',
  Braintree = 'place-brntn',
}

const redShared: PathShape = [
  start(0, 0, 90),
  stationRange({
    start: RLStations.Alewife,
    end: RLStations.UmassJFK,
    commands: [line(120)],
  }),
];

const redA: PathShape = [
  ...redShared,
  wiggle(30, -20),
  stationRange({
    start: RLStations.SavinHill,
    end: RLStations.Ashmont,
    commands: [line(50)],
  }),
];

const redB: PathShape = [
  ...redShared,
  wiggle(30, 20),
  stationRange({
    start: RLStations.NorthQuincy,
    end: RLStations.Braintree,
    commands: [line(70)],
  }),
];

const redLine: Line = {
  route: {
    routePatterns: {
      'Red-A': {
        stations: getStationsForRoutePattern('Red', 'A'),
        shape: redA,
      },
      'Red-B': {
        stations: getStationsForRoutePattern('Red', 'B'),
        shape: redB,
      },
    },
  },
};

const enum BLStations {
  Wonderland = 'place-wondl',
  Bowdoin = 'place-bomnl',
}

const blueLine: Line = {
  route: {
    routePatterns: {
      Blue: {
        stations: getStationsForRoutePattern('Blue'),
        shape: [
          start(0, 0, 90),
          stationRange({
            start: BLStations.Wonderland,
            end: BLStations.Bowdoin,
            commands: [line(250)],
          }),
        ],
      },
    },
  },
};

export const lines: Record<LineName, Line> = {
  Blue: blueLine,
  Red: redLine,
  Orange: orangeLine,
  Green: greenLine,
};
