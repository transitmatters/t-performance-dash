import type { LineData } from '../types';

const colorLines = ['red', 'green', 'blue', 'orange', 'silver'];
const keyBusRoutes = new Set(
  [1, 15, 22, 23, 28, 32, 39, 57, 66, 71, 73, 77, 111, 116, 117].map(String)
);

const kind = (line: LineData) => {
  if (colorLines.includes(line.lineKind)) {
    return line.lineKind === 'silver' ? 1 : 0;
  } else if (line.routeIds.some((rid) => keyBusRoutes.has(rid))) {
    return 100 + parseInt(line.routeIds[0]);
  } else if (line.lineKind === 'regional-rail') {
    return 200;
  }
  const res = 300 + Math.min(...line.routeIds.map((x) => parseInt(x)));
  if (Number.isNaN(res)) {
    return Infinity;
  }
  return res;
};

const isCancelled = (r: LineData) => r.serviceRegimes.current.weekday.cancelled;

const lowestServiceFraction = (r: LineData) => r.serviceFraction;
const highestServiceFraction = (r: LineData) => -r.serviceFraction;

const lowestTotalTrips = (r: LineData) => r.totalTrips;
const highestTotalTrips = (r: LineData) => -r.totalTrips;

const highestRidershipFraction = (r: LineData) => {
  const { ridershipHistory } = r;
  if (ridershipHistory && !isCancelled(r)) {
    return ridershipHistory[0] / ridershipHistory[ridershipHistory.length - 1];
  }
  return Infinity;
};

const lowestRidershipFraction = (r: LineData) => {
  const { ridershipHistory } = r;
  if (ridershipHistory && !isCancelled(r)) {
    return -highestRidershipFraction(r);
  }
  return Infinity;
};

const lowestTotalRidership = (r: LineData) => {
  const { ridershipHistory } = r;
  if (ridershipHistory && !isCancelled(r)) {
    return ridershipHistory[ridershipHistory.length - 1];
  }
  return Infinity;
};

const highestTotalRidership = (r: LineData) => {
  const { ridershipHistory } = r;
  if (ridershipHistory && !isCancelled(r)) {
    return -lowestTotalRidership(r);
  }
  return Infinity;
};

export const sortFunctions = {
  kind,
  lowestServiceFraction,
  highestServiceFraction,
  lowestTotalTrips,
  highestTotalTrips,
  lowestRidershipFraction,
  highestRidershipFraction,
  lowestTotalRidership,
  highestTotalRidership,
};

export type SortFn = (r: LineData) => number;
export type Sort = keyof typeof sortFunctions;
