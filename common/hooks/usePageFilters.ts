import { startCase } from '@lodash-utils';
import { rtStations } from '../constants/stations';
import type { DayKind } from '../types/dataPoints';
import type { LineShort } from '../types/lines';
import { COMMUTER_RAIL_LINE_NAMES } from '../types/lines';
import { useDelimitatedRoute } from '../utils/router';
import { useOptionParam } from './useChartToggle';

// Page-wide filters. The header renders their controls (see PageFilters) and the pages read their
// values, so each one is a hook over its URL param that both sides call.

export type HeadwayDirection = 'both' | '0' | '1';

/** stations.json keys directions the other way round from GTFS direction_id. */
const directionName = (lineShort: LineShort, directionId: '0' | '1') => {
  const names = rtStations[lineShort as keyof typeof rtStations]?.direction;
  return startCase(names?.[directionId === '0' ? '1' : '0'] ?? `Direction ${directionId}`);
};

/** Reliability: which direction's headways to count. */
export const useReliabilityDirection = () => {
  const { lineShort } = useDelimitatedRoute();
  return useOptionParam<HeadwayDirection>('relDir', 'both', [
    ['both', 'Both'],
    ['0', directionName(lineShort, '0')],
    ['1', directionName(lineShort, '1')],
  ]);
};

/** Commuter Rail service: the selected line, or every line together. */
export const useCrServiceScope = () =>
  useOptionParam<'route' | 'all'>('serviceScope', 'route', [
    ['route', 'This line'],
    ['all', 'All lines'],
  ]);

/** Commuter Rail service: which day's schedule. */
export const useServiceDay = () =>
  useOptionParam<DayKind>('day', 'weekday', [
    ['weekday', 'Weekday'],
    ['saturday', 'Saturday'],
    ['sunday', 'Sunday'],
  ]);

/** Fleet: the selected bus route or Commuter Rail line, or all of them. */
export const useFleetScope = () => {
  const {
    line,
    query: { busRoute, crRoute },
  } = useDelimitatedRoute();
  const isCommuterRail = line === 'line-commuter-rail';
  const routeLabel = isCommuterRail
    ? (COMMUTER_RAIL_LINE_NAMES[crRoute!] ?? crRoute ?? '')
    : `Route ${busRoute}`;
  // Commuter Rail calls its routes lines, as on the Reliability page.
  const allLabel = isCommuterRail ? 'All lines' : 'All routes';
  const scope = useOptionParam<'route' | 'all'>('fleetScope', 'route', [
    ['route', routeLabel],
    ['all', allLabel],
  ]);
  return { ...scope, routeLabel, allLabel };
};
