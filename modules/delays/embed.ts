import { pickBy } from '@lodash-utils';
import { LINE_OBJECTS } from '../../common/constants/lines';
import type { DelaysEmbedChart } from '../../common/constants/staticRoutes';
import { COMMUTER_RAIL_LINE_NAMES } from '../../common/types/lines';
import type { QueryParams, Route } from '../../common/types/router';
import { getEmbedSnippet } from '../../common/utils/embed';
import { stringifySearch } from '../../common/utils/searchParams';

const CHART_NAMES: Record<DelaysEmbedChart, string> = {
  total: 'delay time',
  causes: 'delay causes',
  breakdown: 'delay time by cause',
};

/** What an embed keeps from the Delays page's query: the route, and its own chart's toggle. */
const CHART_PARAMS: Record<DelaysEmbedChart, string[]> = {
  total: ['focus'],
  causes: ['focus'],
  breakdown: ['dlView'],
};
const SHARED_PARAMS = ['startDate', 'endDate', 'busRoute', 'crRoute', 'branch'];

const delaysSearch = (chart: DelaysEmbedChart, query: QueryParams) => {
  const keep = [...SHARED_PARAMS, ...CHART_PARAMS[chart]];
  return stringifySearch(pickBy(query, (_, key) => keep.includes(key)));
};

const getRouteName = ({ line, query }: Pick<Route, 'line' | 'query'>) => {
  if (line === 'line-bus') return query.busRoute ? `Route ${query.busRoute}` : 'MBTA bus';
  if (line === 'line-commuter-rail' && query.crRoute)
    return COMMUTER_RAIL_LINE_NAMES[query.crRoute];
  if (line === 'line-green') return `Green Line ${query.branch ?? 'B'} Branch`;
  return line ? LINE_OBJECTS[line].name : 'MBTA';
};

export const getDelaysEmbedTitle = (
  chart: DelaysEmbedChart,
  route: Pick<Route, 'line' | 'query'>
) => `${getRouteName(route)} ${CHART_NAMES[chart]}`;

/** The Delays page the embed comes from, for its "view on the dashboard" link. */
export const getDelaysPageUrl = (
  chart: DelaysEmbedChart,
  { linePath, query }: Pick<Route, 'linePath' | 'query'>
) => `${window.location.origin}/${linePath}/delays/${delaysSearch(chart, query)}`;

export const getDelaysEmbedSnippet = (chart: DelaysEmbedChart, route: Route) =>
  getEmbedSnippet(
    `/embed/${route.linePath}/delays/${chart}/${delaysSearch(chart, route.query)}`,
    getDelaysEmbedTitle(chart, route)
  );
