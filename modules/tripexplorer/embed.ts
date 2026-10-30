import { pickBy } from '@lodash-utils';
import { LINE_OBJECTS } from '../../common/constants/lines';
import type { TripEmbedChart } from '../../common/constants/staticRoutes';
import { COMMUTER_RAIL_LINE_NAMES, FERRY_LINE_NAMES } from '../../common/types/lines';
import type { QueryParams, Route } from '../../common/types/router';
import { getEmbedSnippet } from '../../common/utils/embed';
import { stringifySearch } from '../../common/utils/searchParams';

const CHART_NAMES: Record<TripEmbedChart, string> = {
  traveltimes: 'travel times',
  headways: 'headways',
  dwells: 'dwells',
  'headway-distribution': 'headway distribution',
};

/** What an embed keeps from the trip page's query; view toggles like `ttView` stay behind. */
const TRIP_PARAMS = ['from', 'to', 'date', 'busRoute', 'crRoute', 'ferryRoute'];

const tripSearch = (query: QueryParams) =>
  stringifySearch(pickBy(query, (_, key) => TRIP_PARAMS.includes(key)));

const getRouteName = ({ line, query }: Pick<Route, 'line' | 'query'>) => {
  if (query.busRoute) return `Route ${query.busRoute}`;
  if (query.crRoute) return COMMUTER_RAIL_LINE_NAMES[query.crRoute];
  if (query.ferryRoute) return FERRY_LINE_NAMES[query.ferryRoute];
  return line ? LINE_OBJECTS[line].name : 'MBTA';
};

export const getTripEmbedTitle = (chart: TripEmbedChart, route: Pick<Route, 'line' | 'query'>) =>
  `${getRouteName(route)} ${CHART_NAMES[chart]}`;

/** The single-day trip page the embed comes from, for its "view on the dashboard" link. */
export const getTripPageUrl = ({ linePath, query }: Pick<Route, 'linePath' | 'query'>) =>
  `${window.location.origin}/${linePath}/trips/single/${tripSearch(query)}`;

export const getTripEmbedSnippet = (chart: TripEmbedChart, route: Route) =>
  getEmbedSnippet(
    `/embed/${route.linePath}/trips/single/${chart}/${tripSearch(route.query)}`,
    getTripEmbedTitle(chart, route)
  );
