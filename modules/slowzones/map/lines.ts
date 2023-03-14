// import { LINE_OBJECTS } from '../../../common/constants/lines';
// import { start, line, wiggle, stationRange } from '../../../common/diagrams/commands';
// import { getStationsForRoutePattern } from '../../../common/diagrams/util';
// import type { PathShape, Line } from '../../../common/diagrams/types';

// const enum OLStations {
//   OakGrove = 'place-ogmnl',
//   ForestHills = 'place-forhl',
// }

// const PX_PER_STATION = 15;

// const orangeLine: Line = {
//   metadata: LINE_OBJECTS.OL,
//   route: {
//     routePatterns: {
//       Orange: {
//         stations: getStationsForRoutePattern('Orange'),
//         shape: [
//           start(0, 0, 90),
//           stationRange({
//             start: OLStations.OakGrove,
//             end: OLStations.ForestHills,
//             commands: [line({ perStation: PX_PER_STATION })],
//           }),
//         ],
//       },
//     },
//   },
// };

// const enum RLStations {
//   Alewife = 'place-alfcl',
//   UmassJFK = 'place-jfk',
//   SavinHill = 'place-shmnl',
//   Ashmont = 'place-asmnl',
//   NorthQuincy = 'place-nqncy',
//   Braintree = 'place-brntn',
// }

// const redShared: PathShape = [
//   start(0, 0, 90),
//   stationRange({
//     start: RLStations.Alewife,
//     end: RLStations.UmassJFK,
//     commands: [line({ perStation: PX_PER_STATION })],
//   }),
// ];

// const redA: PathShape = [
//   ...redShared,
//   line(30),
//   stationRange({
//     start: RLStations.SavinHill,
//     end: RLStations.Ashmont,
//     commands: [line({ perStation: PX_PER_STATION })],
//   }),
// ];

// const redB: PathShape = [
//   ...redShared,
//   wiggle(10, 5),
//   line(80),
//   wiggle(10, -5),
//   stationRange({
//     start: RLStations.NorthQuincy,
//     end: RLStations.Braintree,
//     commands: [line({ perStation: PX_PER_STATION })],
//   }),
// ];

// const redLine: Line = {
//   metadata: LINE_OBJECTS.RL,
//   route: {
//     routePatterns: {
//       'Red-A': {
//         stations: getStationsForRoutePattern('Red', 'A'),
//         shape: redA,
//       },
//       'Red-B': {
//         stations: getStationsForRoutePattern('Red', 'B'),
//         shape: redB,
//       },
//     },
//   },
// };

// const enum BLStations {
//   Wonderland = 'place-wondl',
//   Bowdoin = 'place-bomnl',
// }

// const blueLine: Line = {
//   metadata: LINE_OBJECTS.BL,
//   route: {
//     routePatterns: {
//       Blue: {
//         stations: getStationsForRoutePattern('Blue'),
//         shape: [
//           start(0, 0, 90),
//           stationRange({
//             start: BLStations.Wonderland,
//             end: BLStations.Bowdoin,
//             commands: [line({ perStation: PX_PER_STATION })],
//           }),
//         ],
//       },
//     },
//   },
// };

// export const slowZonesLines = {
//   Blue: blueLine,
//   Red: redLine,
//   Orange: orangeLine,
// } as const;
